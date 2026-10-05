import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { OpenAIStructuredWorkerClient } from '../../src/content-factory/openai-live-adapter'

const route = {
  model: 'test-model',
  inputUsdPerMillion: 2,
  cachedInputUsdPerMillion: 0.2,
  outputUsdPerMillion: 12,
  maxOutputTokens: 1_000,
}

function responseBody(output: unknown) {
  return {
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(output) }] }],
    usage: { input_tokens: 50, output_tokens: 20 },
  }
}

const reviewSchema = z.object({
  unit_id: z.string().min(1),
  answers: z.array(z.object({ check_id: z.string().min(1), answer: z.enum(['yes', 'no']), note: z.string() })),
  findings: z.array(z.object({
    check_id: z.string().min(1),
    category: z.string().min(1),
    affected_ids: z.array(z.string().min(1)).min(1),
    finding: z.string().min(1),
    evidence: z.string().min(1),
    contradicting_source_id: z.string().nullable(),
    proposed_fix: z.string().min(1),
  })),
})

const paperPayload = {
  unit_id: '7132/1',
  paper: {
    component_id: '7132/1',
    questions: [
      { question: { slot_id: 'P1-B-04' } },
      { question: { slot_id: 'P1-B-05' } },
      { question: { slot_id: 'P1-B-06' } },
    ],
  },
}

const exactOutput = {
  unit_id: '7132/1',
  answers: [{ check_id: 'question_and_mark_scheme_validity', answer: 'no' as const, note: 'AO4 is not required.' }],
  findings: [{
    check_id: 'question_and_mark_scheme_validity',
    category: 'broken_question',
    affected_ids: ['P1-B-04', 'P1-B-05', 'P1-B-06'],
    finding: 'AO4 is allocated without an evaluative requirement.',
    evidence: 'The three short-answer mark schemes permit full credit without evaluation.',
    contradicting_source_id: null,
    proposed_fix: 'Repair only the three affected questions.',
  }],
}

describe('AQA 7132 mock semantic review identifier contract', () => {
  it('binds affected_ids to exact identifiers already supplied in the review payload', async () => {
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as {
        instructions: string
        text: { format: { schema: { properties?: Record<string, unknown> } } }
      }
      const findings = body.text.format.schema.properties?.findings as {
        items?: { properties?: Record<string, unknown> }
      }
      const affectedIds = findings.items?.properties?.affected_ids as { items?: { enum?: string[] } }
      expect(affectedIds.items?.enum).toEqual(expect.arrayContaining(['7132/1', 'P1-B-04', 'P1-B-05', 'P1-B-06']))
      expect(body.instructions).toContain('Preserve every affected_ids value exactly')
      return new Response(JSON.stringify(responseBody(exactOutput)), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }) as typeof fetch

    const client = new OpenAIStructuredWorkerClient({ apiKey: 'test-secret', generation: route, independentReview: route, fetchImpl, maxRetries: 0 })
    const result = await client.run({
      workerId: 'content-factory.aqa-7132.mock-paper-review.7132-1',
      contractVersion: 'mock-review-contract-v1',
      routeKind: 'independent_review',
      outputSchema: reviewSchema,
      instructions: 'Review the supplied paper.',
      payload: paperPayload,
      strictOutput: true,
    })

    expect(result.status).toBe('success')
  })

  it('rejects completed output that lowercases an affected question id', async () => {
    const lowercased = {
      ...exactOutput,
      findings: [{ ...exactOutput.findings[0], affected_ids: ['p1-b-04'] }],
    }
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(responseBody(lowercased)), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch
    const client = new OpenAIStructuredWorkerClient({ apiKey: 'test-secret', generation: route, independentReview: route, fetchImpl, maxRetries: 0 })

    const result = await client.run({
      workerId: 'content-factory.aqa-7132.mock-paper-review.7132-1',
      contractVersion: 'mock-review-contract-v1',
      routeKind: 'independent_review',
      outputSchema: reviewSchema,
      instructions: 'Review the supplied paper.',
      payload: paperPayload,
      strictOutput: true,
    })

    expect(result.status).toBe('failure')
    if (result.status === 'success') throw new Error('Expected exact affected_ids contract failure')
    expect(result.error).toContain('provider_contract_failure')
  })

  it('canonicalises only unique case-only retained paper/set ids before remediation', async () => {
    const root = await mkdtemp(join(tmpdir(), 'revision-mock-review-ids-'))
    try {
      const planDir = join(root, '.artifacts/content-factory-aqa-business-7132-mock-plan')
      const outputDir = join(root, '.artifacts/content-factory-aqa-business-7132-mock-generation')
      await mkdir(planDir, { recursive: true })
      await mkdir(outputDir, { recursive: true })
      await writeFile(join(planDir, 'mock-set-plan.json'), JSON.stringify({
        papers: [
          { component_id: '7132/1', slots: [{ slot_id: 'P1-B-04' }, { slot_id: 'P1-B-05' }, { slot_id: 'P1-B-06' }] },
          { component_id: '7132/3', slots: [{ slot_id: 'P3-03' }, { slot_id: 'P3-04' }] },
        ],
      }))
      await writeFile(join(outputDir, 'paper-review-ledger.json'), JSON.stringify({
        units: {
          '7132/1': { findings: [{ affected_ids: ['p1-b-04', 'p1-b-05', 'unknown-id'] }] },
          '7132/3': { findings: [{ affected_ids: ['p3-03', 'p3-04'] }] },
        },
      }))
      await writeFile(join(outputDir, 'set-review-ledger.json'), JSON.stringify({
        units: { 'complete-set': { findings: [{ affected_ids: ['p3-04', 'mystery'] }] } },
      }))

      execFileSync(process.execPath, [resolve('scripts/assurance/canonicalise-aqa-business-7132-mock-review-ids.mjs')], { cwd: root, stdio: 'pipe' })

      const paperLedger = JSON.parse(await readFile(join(outputDir, 'paper-review-ledger.json'), 'utf8'))
      const setLedger = JSON.parse(await readFile(join(outputDir, 'set-review-ledger.json'), 'utf8'))
      expect(paperLedger.units['7132/1'].findings[0].affected_ids).toEqual(['P1-B-04', 'P1-B-05', 'unknown-id'])
      expect(paperLedger.units['7132/3'].findings[0].affected_ids).toEqual(['P3-03', 'P3-04'])
      expect(setLedger.units['complete-set'].findings[0].affected_ids).toEqual(['P3-04', 'mystery'])
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
