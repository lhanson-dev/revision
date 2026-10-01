// Resume-safe AQA 7132 Learn + Practice live runner.
// Committed accepted assets are reconstructed against the current Blueprint + Foundation teaching first.
// Exact-fingerprint matches are passed to runReviewUnits for provider-free reuse; only stale/missing nodes are regenerated.
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { createOpenAIFoundationLiveProvider } from '../../src/content-factory/foundation-live-adapter'
import {
  checklistInstructions,
  escalationEntries,
  renderRunSummary,
  reviewOutputSchema,
  runReviewUnits,
  type ClassifiedFinding,
  type Ledger,
} from '../../src/content-factory/fast-path-review'
import {
  SLICE_CHECKLIST,
  SLICE_GENERATION_INSTRUCTIONS,
  SLICE_REVIEW_INSTRUCTIONS,
  buildSliceUnit,
  expectationsFromBlueprint,
  nodeOutputSchema,
  produceNode,
  type Blueprint,
  type NodeExpectation,
  type NodeOutput,
  type SliceTeaching,
  type SliceUnit,
} from './aqa-business-7132-slice-learn-practice'
import { loadBusinessSubjectFoundationCandidate } from '../content-factory/load-business-subject-foundation-candidate-v08.mjs'

const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }
const env = runtime.process?.env ?? {}
const proofEnabled = env.CONTENT_FACTORY_AQA_7132_SLICE_LEARN_PRACTICE_RESUME === '1'
const BATCH = env.CONTENT_FACTORY_SLICE_BATCH?.trim() || '3.5'
const BATCH_BLUEPRINT = `content-factory/slices/aqa-7132-${BATCH}/BLUEPRINT.json`
const OUTPUT = `.artifacts/content-factory-aqa-business-7132-slice-${BATCH}-learn-practice`
const LEDGER = `content-factory/runs/aqa-7132-slice-${BATCH}/ledger.json`
const COMMITTED_ASSET_BATCH = BATCH === '3.5-topup' ? '3.5' : BATCH
const COMMITTED_ASSET_DIR = `content-factory/slices/aqa-7132-${COMMITTED_ASSET_BATCH}/learn-practice`

function requiredEnv(name: string) {
  const value = env[name]?.trim()
  if (!value) throw new Error(`provider_secret_missing_or_runtime_config_missing:${name}`)
  return value
}

function positiveNumberEnv(name: string, fallback: number) {
  const raw = env[name]?.trim()
  if (!raw) return fallback
  const value = Number(raw)
  if (!Number.isFinite(value) || value <= 0) throw new Error(`invalid_positive_number_runtime_config:${name}`)
  return value
}

function model(maxOutputTokens: number, reasoningEffort: 'medium' | 'high') {
  return {
    model: env.CONTENT_FACTORY_GENERATION_MODEL?.trim() || 'gpt-5.6-terra',
    inputUsdPerMillion: 2,
    cachedInputUsdPerMillion: 0.2,
    outputUsdPerMillion: 12,
    cacheWriteMultiplier: 1.25,
    longContextThresholdTokens: 272_000,
    longContextInputMultiplier: 2,
    longContextOutputMultiplier: 1.5,
    reasoningEffort,
    maxOutputTokens,
  }
}

async function readLedger(): Promise<Ledger> {
  try {
    return JSON.parse(await readFile(LEDGER, 'utf8')) as Ledger
  } catch {
    return { schema_version: 1, stage: SLICE_CHECKLIST.stage, checklist_version: SLICE_CHECKLIST.version, units: {} }
  }
}

async function readCommittedOutput(nodeId: string): Promise<NodeOutput | null> {
  const path = `${COMMITTED_ASSET_DIR}/${nodeId}.json`
  if (!existsSync(path)) return null
  try {
    return nodeOutputSchema.parse(JSON.parse(await readFile(path, 'utf8')))
  } catch {
    // Corrupt or schema-stale committed content is a cache miss, never trusted reuse.
    return null
  }
}

function exactReusableUnit(input: {
  expectation: NodeExpectation
  teaching: SliceTeaching
  output: NodeOutput
  ledger: Ledger
}): SliceUnit | null {
  const entry = input.ledger.units[input.expectation.nodeId]
  if (!entry || !['passed', 'logged'].includes(entry.outcome)) return null
  const unit = buildSliceUnit({ nodeId: input.expectation.nodeId, expectation: input.expectation, teaching: input.teaching, output: input.output })
  if (!unit || unit.softwareFindings.some((finding) => finding.disposition === 'blocking')) return null
  return entry.fingerprint === unit.fingerprint ? unit : null
}

function minimalOutput(nodeId: string): NodeOutput {
  return {
    node_id: nodeId,
    learn: { title: 'Title', sections: [{ treatment: 'core_explanation', heading: 'Core', body: 'Body.', item_ids: [] }], key_terms: [], worked_examples: [] },
    practice: { items: [{ id: 'p1', capability: 'retrieval', item_ids: [], prompt: 'Q?', answer: 'A.', explanation: 'Because.', calc: null }] },
  }
}

describe('AQA 7132 Learn + Practice exact-fingerprint resume', () => {
  it('reuses a committed accepted node only when current teaching reconstructs the exact ledger fingerprint', () => {
    const expectation: NodeExpectation = { nodeId: 'bus-test-001', requiredTreatments: ['core_explanation'], requiredCapabilities: ['retrieval'], items: [] }
    const teaching: SliceTeaching = { subject_id: 'BUS-TEST-001', teaching_content: { definition: 'same' }, quantitative_content: {}, source_ids: [] }
    const output = minimalOutput(expectation.nodeId)
    const unit = buildSliceUnit({ nodeId: expectation.nodeId, expectation, teaching, output })!
    const ledger: Ledger = {
      schema_version: 1,
      stage: SLICE_CHECKLIST.stage,
      checklist_version: SLICE_CHECKLIST.version,
      units: {
        [expectation.nodeId]: { fingerprint: unit.fingerprint, outcome: 'passed', consecutive_blocking_rounds: 0, findings: [], updated_at: '2026-10-01T00:00:00Z' },
      },
    }
    expect(exactReusableUnit({ expectation, teaching, output, ledger })?.fingerprint).toBe(unit.fingerprint)
    expect(exactReusableUnit({ expectation, teaching: { ...teaching, teaching_content: { definition: 'changed' } }, output, ledger })).toBeNull()
    expect(exactReusableUnit({ expectation, teaching, output: { ...output, learn: { ...output.learn, title: 'changed' } }, ledger })).toBeNull()
    const blockingLedger: Ledger = { ...ledger, units: { [expectation.nodeId]: { ...ledger.units[expectation.nodeId], outcome: 'blocking' } } }
    expect(exactReusableUnit({ expectation, teaching, output, ledger: blockingLedger })).toBeNull()
  })

  const proofIt = proofEnabled ? it : it.skip

  proofIt('reuses unchanged committed nodes before any provider generation and refreshes only stale dependants', async () => {
    const blueprint = JSON.parse(await readFile(BATCH_BLUEPRINT, 'utf8')) as Blueprint
    const candidate = await loadBusinessSubjectFoundationCandidate()
    const rows = new Map<string, { subject_truth_sources?: string[] }>(candidate.matrix.nodes.map((row: { subject_id: string }) => [row.subject_id, row]))
    await mkdir(`${OUTPUT}/assets`, { recursive: true })

    const teachingFor = (nodeId: string): SliceTeaching => {
      const subjectId = nodeId.toUpperCase()
      const node = candidate.nodes.get(subjectId)
      if (!node) throw new Error(`foundation_node_missing:${subjectId}`)
      return {
        subject_id: subjectId,
        title: node.title ?? null,
        teaching_content: node.teaching_content ?? {},
        quantitative_content: node.quantitative_content ?? {},
        source_ids: rows.get(subjectId)?.subject_truth_sources ?? [],
      }
    }

    const provider = createOpenAIFoundationLiveProvider({
      apiKey: requiredEnv('OPENAI_API_KEY'),
      maxSpendUsd: positiveNumberEnv('CONTENT_FACTORY_MAX_SPEND_USD', 6),
      generation: model(24_000, 'medium'),
      independentReview: model(8_000, 'high'),
      maxRetries: 0,
    })
    const expectations = expectationsFromBlueprint(blueprint)
    const generate = (nodeId: string) => async (payload: Record<string, unknown>) => {
      const execution = await provider.run({
        workerId: 'content-factory.aqa-7132.slice-learn-practice-generate',
        contractVersion: SLICE_CHECKLIST.version,
        routeKind: 'generation',
        strictOutput: true,
        outputSchema: nodeOutputSchema,
        instructions: SLICE_GENERATION_INSTRUCTIONS,
        payload,
      })
      return execution.status === 'success'
        ? { ok: true as const, output: execution.output }
        : { ok: false as const, error: `${nodeId} ${execution.status}: ${'error' in execution ? execution.error : ''}` }
    }

    let ledger = await readLedger()
    const outputs = new Map<string, NodeOutput>()
    const generationFailures: Array<{ node_id: string; error: string }> = []
    const buildUnits = async (targets: NodeExpectation[], feedback: Map<string, ClassifiedFinding[]>, allowCommittedReuse: boolean) => {
      const units: SliceUnit[] = []
      let next = 0
      const worker = async () => {
        while (next < targets.length) {
          const expectation = targets[next++]
          const teaching = teachingFor(expectation.nodeId)
          if (allowCommittedReuse && !feedback.has(expectation.nodeId)) {
            const committed = await readCommittedOutput(expectation.nodeId)
            if (committed) {
              const reusable = exactReusableUnit({ expectation, teaching, output: committed, ledger })
              if (reusable) {
                outputs.set(expectation.nodeId, committed)
                units.push(reusable)
                continue
              }
            }
          }

          const produced = await produceNode({
            nodeId: expectation.nodeId,
            expectation,
            teaching,
            generate: generate(expectation.nodeId),
            feedback: feedback.get(expectation.nodeId),
          })
          if (!produced.output) {
            generationFailures.push({ node_id: expectation.nodeId, error: produced.error ?? 'generation failed' })
            continue
          }
          outputs.set(expectation.nodeId, produced.output)
          units.push(buildSliceUnit({ nodeId: expectation.nodeId, expectation, teaching, output: produced.output })!)
        }
      }
      await Promise.all(Array.from({ length: Math.min(4, targets.length) }, worker))
      return units.sort((a, b) => a.unit_id.localeCompare(b.unit_id))
    }

    const reviewSchema = reviewOutputSchema(SLICE_CHECKLIST)
    const instructions = `${SLICE_REVIEW_INSTRUCTIONS}\n${checklistInstructions(SLICE_CHECKLIST)}`
    const review = async (unit: SliceUnit) => {
      const execution = await provider.run({
        workerId: 'content-factory.aqa-7132.slice-learn-practice-review',
        contractVersion: SLICE_CHECKLIST.version,
        routeKind: 'independent_review',
        strictOutput: true,
        outputSchema: reviewSchema,
        instructions,
        payload: unit.payload,
      })
      return execution.status === 'success'
        ? { ok: true as const, output: execution.output }
        : { ok: false as const, error: `${execution.status}: ${'error' in execution ? execution.error : ''}` }
    }

    // Round 1: reuse compatible committed nodes first; generate/review only cache misses or changed inputs.
    const units1 = await buildUnits(expectations, new Map(), true)
    let run = await runReviewUnits({ units: units1, ledger, checklist: SLICE_CHECKLIST, knownSourceIds: (unit) => unit.sourceIds, concurrency: 4, review })
    ledger = run.ledger

    // Round 2 is still the last review round and always regenerates the genuinely blocked node.
    const blocked = run.outcomes.filter((outcome) => outcome.status === 'blocking')
    if (blocked.length) {
      const feedback = new Map<string, ClassifiedFinding[]>(blocked.map((outcome) => [outcome.unit_id, outcome.findings]))
      const units2 = await buildUnits(expectations.filter((expectation) => feedback.has(expectation.nodeId)), feedback, false)
      const second = await runReviewUnits({ units: units2, ledger, checklist: SLICE_CHECKLIST, knownSourceIds: (unit) => unit.sourceIds, concurrency: 4, review })
      ledger = second.ledger
      run = { ...second, outcomes: [...run.outcomes.filter((outcome) => !feedback.has(outcome.unit_id)), ...second.outcomes] }
    }

    const finalOutcomes = run.outcomes
    const passedIds = finalOutcomes.filter((outcome) => ['passed', 'logged', 'reused'].includes(outcome.status)).map((outcome) => outcome.unit_id)
    for (const id of passedIds) {
      const output = outputs.get(id)
      if (output) await writeFile(`${OUTPUT}/assets/${id}.json`, `${JSON.stringify(output, null, 2)}\n`)
    }
    for (const [id, output] of outputs) await writeFile(`${OUTPUT}/assets/${id}.latest.json`, `${JSON.stringify(output, null, 2)}\n`)

    const accepted = finalOutcomes.filter((outcome) => ['passed', 'logged', 'reused'].includes(outcome.status)).length
    const reused = finalOutcomes.filter((outcome) => outcome.status === 'reused').map((outcome) => outcome.unit_id)
    const summary = {
      nodes: expectations.length,
      accepted,
      reused_unchanged: reused,
      regenerated_or_reviewed: finalOutcomes.filter((outcome) => outcome.status !== 'reused').map((outcome) => outcome.unit_id),
      blocking: finalOutcomes.filter((outcome) => outcome.status === 'blocking').map((outcome) => outcome.unit_id),
      escalated: finalOutcomes.filter((outcome) => outcome.status === 'escalated').map((outcome) => outcome.unit_id),
      failed: [...finalOutcomes.filter((outcome) => outcome.status === 'failed').map((outcome) => outcome.unit_id), ...generationFailures.map((failure) => failure.node_id)],
      all_nodes_accepted: accepted === expectations.length,
    }
    await writeFile(`${OUTPUT}/ledger.json`, `${JSON.stringify(ledger, null, 2)}\n`)
    await writeFile(`${OUTPUT}/escalations.json`, `${JSON.stringify(escalationEntries(ledger), null, 2)}\n`)
    await writeFile(`${OUTPUT}/SUMMARY.md`, `${renderRunSummary(`AQA 7132 batch ${BATCH}: Learn + Practice`, finalOutcomes, ledger)}\n${generationFailures.length ? `## Generation failed after 3 attempts\n${generationFailures.map((failure) => `- ${failure.node_id}: ${failure.error}`).join('\n')}\n` : ''}`)
    const evidence = {
      schema_version: 2,
      artifact_type: 'aqa_7132_slice_learn_practice_fast_path_resume',
      recorded_at: new Date().toISOString(),
      slice: BATCH,
      reviewed_commit: env.CONTENT_FACTORY_SLICE_REVIEWED_COMMIT ?? null,
      checklist: SLICE_CHECKLIST,
      summary,
      provider_budget: provider.budgetSnapshot?.() ?? null,
      gates: { ai_assured_nodes: summary.all_nodes_accepted, qualified_human_review_status: 'pending', learner_publication_eligible: false },
    }
    await writeFile(`${OUTPUT}/slice-learn-practice-proof.json`, `${JSON.stringify(evidence, null, 2)}\n`)
    await writeFile(`${OUTPUT}/summary.json`, `${JSON.stringify({ ...summary, provider_budget: evidence.provider_budget }, null, 2)}\n`)

    expect(evidence.gates.learner_publication_eligible).toBe(false)
    if (!summary.all_nodes_accepted) throw new Error(`slice_learn_practice_not_fully_accepted: see ${OUTPUT}/SUMMARY.md`)
  }, 60 * 60 * 1000)
})
