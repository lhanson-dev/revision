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
})
