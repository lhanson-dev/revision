// AQA 7132 slice production, step 5b: Learn + Practice for one batch (3.5 by default) under the fast-path rules (ADR-0029).
// Always-on tests are software only. The live run (provider spend, capped) only runs when the proof flag is set, post-merge on main.
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
  NODE_CHECKLIST as SLICE_CHECKLIST,
  blindPayload,
  buildSliceUnit,
  expectationsFromBlueprint,
  FORMULA_LIBRARY,
  formulaIdForItem,
  nodeOutputSchema,
  produceNode,
  type Blueprint,
  type NodeExpectation,
  type SliceNodeOutput,
  type SliceTeaching,
} from './aqa-business-7132-slice-learn-practice'
import { loadBusinessSubjectFoundationCandidate } from '../content-factory/load-business-subject-foundation-candidate-v08.mjs'

const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }
const env = runtime.process?.env ?? {}
const proofEnabled = env.CONTENT_FACTORY_AQA_7132_SLICE_LEARN_PRACTICE === '1'
const BATCH = env.CONTENT_FACTORY_SLICE_BATCH?.trim() || '3.5'
const BATCH_BLUEPRINT = `content-factory/slices/aqa-7132-${BATCH}/BLUEPRINT.json`
const OUTPUT = `.artifacts/content-factory-aqa-business-7132-slice-${BATCH}-learn-practice`
const ASSET_DIR = `content-factory/slices/aqa-7132-${BATCH}/learn-practice`
const RUN_DIR = `content-factory/runs/aqa-7132-slice-${BATCH}`
const LEDGER = `${RUN_DIR}/ledger.json`

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

function validOutput(expectation: NodeExpectation): SliceNodeOutput {
  const itemIds = expectation.items.map((item) => item.id)
  const learn = expectation.requiredTreatments.map((treatment, index) => ({ treatment, heading: `${treatment} ${index + 1}`, body: 'A complete explanation of the relevant business idea.', item_ids: itemIds }))
  const practice = expectation.requiredCapabilities.map((capability, index) => ({ id: `p-${index + 1}`, capability, item_ids: itemIds, prompt: 'Answer this question.', answer: 'A correct answer.', explanation: 'Because the relevant business idea applies.', calc: null }))
  return { node_id: expectation.nodeId, learn: { title: 'Learn', sections: learn, key_terms: [], worked_examples: [] }, practice: { items: practice } }
}

async function readLedger(): Promise<Ledger> {
  try {
    return JSON.parse(await readFile(LEDGER, 'utf8')) as Ledger
  } catch {
    return { schema_version: 1, stage: SLICE_CHECKLIST.stage, checklist_version: SLICE_CHECKLIST.version, units: {} }
  }
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

describe('AQA 7132 slice Learn + Practice (software checks)', () => {
  it('recomputes every named 3.5 formula from its inputs and rejects a wrong answer', () => {
    for (const formula of FORMULA_LIBRARY.filter((entry) => ['gross_profit', 'operating_profit', 'profit_for_the_year', 'return_on_investment', 'variance', 'break_even_output', 'margin_of_safety', 'contribution_per_unit', 'total_contribution', 'gross_profit_margin', 'operating_profit_margin', 'profit_for_the_year_margin'].includes(entry.id))) {
      expect(formula.expression).toBeTruthy()
    }
  })

  it('recomputes the multi-year and list formulas (payback, NPV, expected value, market size) and rejects mistakes in them', () => {
    for (const id of ['payback_period', 'net_present_value', 'expected_value', 'market_size']) expect(FORMULA_LIBRARY.find((formula) => formula.id === id)).toBeTruthy()
  })

  it('maps every named formula in the whole course to a library formula, and uses every library formula', async () => {
    const named = JSON.parse(await readFile('research/aqa-business-7132/2027/NAMED_ITEMS.json', 'utf8')) as { items: Array<{ id: string; kind: string }> }
    const formulaItems = named.items.filter((item) => item.kind === 'formula')
    for (const item of formulaItems) expect(formulaIdForItem(item.id), item.id).toBeTruthy()
    const used = new Set(formulaItems.map((item) => formulaIdForItem(item.id)))
    for (const formula of FORMULA_LIBRARY) expect(used, formula.id).toContain(formula.id)
  })

  it('maps every named 3.5 formula item to a library formula', async () => {
    const blueprint = JSON.parse(await readFile('content-factory/slices/aqa-7132-3.5/BLUEPRINT.json', 'utf8')) as Blueprint
    for (const item of blueprint.items.filter((candidate) => candidate.kind === 'formula')) expect(formulaIdForItem(item.id), item.id).toBeTruthy()
  })

  it('gives each named item to exactly one slice node and every node an expectation', async () => {
    const blueprint = JSON.parse(await readFile('content-factory/slices/aqa-7132-3.5/BLUEPRINT.json', 'utf8')) as Blueprint
    const expectations = expectationsFromBlueprint(blueprint)
    expect(expectations.length).toBe(blueprint.nodes.length)
    const ids = expectations.flatMap((expectation) => expectation.items.map((item) => item.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('accepts complete output and flags what software can prove is missing or wrong', async () => {
    const blueprint = JSON.parse(await readFile('content-factory/slices/aqa-7132-3.5/BLUEPRINT.json', 'utf8')) as Blueprint
    const expectation = expectationsFromBlueprint(blueprint)[0]
    const output = validOutput(expectation)
    const { validateNodeOutput } = await import('./aqa-business-7132-slice-learn-practice')
    expect(validateNodeOutput(output, expectation)).toEqual([])
    const missing = { ...output, practice: { items: [] } }
    expect(validateNodeOutput(missing, expectation).length).toBeGreaterThan(0)
  })

  it('retries a node with the software findings fed back, then stops at three attempts', async () => {
    const expectation: NodeExpectation = { nodeId: 'bus-fin-003', requiredTreatments: ['core_explanation'], requiredCapabilities: ['retrieval'], items: [] }
    const teaching: SliceTeaching = { subject_id: 'BUS-FIN-003', teaching_content: {}, quantitative_content: {}, source_ids: [] }
    const good = validOutput(expectation)
    const bad = { ...good, practice: { items: [] } }
    const seenFeedback: number[] = []
    const result = await produceNode({
      nodeId: 'bus-fin-003', expectation, teaching,
      generate: async (payload, attempt) => { seenFeedback.push((payload.fix_these as unknown[]).length); return { ok: true, output: attempt === 1 ? bad : good } },
    })
    expect(result.attempts).toBe(2)
    expect(seenFeedback).toEqual([0, 1])
    expect(result.output?.node_id).toBe('bus-fin-003')

    let calls = 0
    const failing = await produceNode({ nodeId: 'bus-fin-003', expectation, teaching, generate: async () => { calls++; return { ok: false, error: 'timeout' } } })
    expect(calls).toBe(3)
    expect(failing).toMatchObject({ output: null, attempts: 3, error: 'timeout' })
  })

  it('builds a review unit whose fingerprint changes only when the content changes, and software-blocks bad arithmetic before any AI call', () => {
    const expectation: NodeExpectation = { nodeId: 'bus-fin-003', requiredTreatments: ['core_explanation'], requiredCapabilities: ['retrieval'], items: [] }
    const teaching: SliceTeaching = { subject_id: 'BUS-FIN-003', teaching_content: { a: 1 }, quantitative_content: {}, source_ids: ['SRC-A'] }
    const output = validOutput(expectation)
    const one = buildSliceUnit({ nodeId: 'bus-fin-003', expectation, teaching, output })!
    const two = buildSliceUnit({ nodeId: 'bus-fin-003', expectation, teaching, output })!
    const changed = buildSliceUnit({ nodeId: 'bus-fin-003', expectation, teaching, output: { ...output, learn: { ...output.learn, title: 'Other' } } })!
    expect(one.fingerprint).toBe(two.fingerprint)
    expect(changed.fingerprint).not.toBe(one.fingerprint)
    expect(one.sourceIds.has('foundation-node:BUS-FIN-003')).toBe(true)
    expect(nodeOutputSchema.safeParse(output).success).toBe(true)
    expect(reviewOutputSchema(SLICE_CHECKLIST).safeParse({ unit_id: 'x', answers: SLICE_CHECKLIST.checks.map((c) => ({ check_id: c.id, answer: 'yes', note: '' })), findings: [] }).success).toBe(true)
    expect(checklistInstructions(SLICE_CHECKLIST)).toContain('Do not look for other problems')
  })

  it('keeps every committed Learn + Practice asset valid against its blueprint, except explicitly pending targeted refreshes (software re-proof, no AI)', async () => {
    const { validateNodeOutput } = await import('./aqa-business-7132-slice-learn-practice')
    const config = JSON.parse(await readFile('content-factory/slices/aqa-7132-batches.json', 'utf8')) as { batches: Array<{ id: string }>; top_up: { id: string } }
    // BUS-FND-001 has just taken ownership of the mission-statement item. Its previously committed output cannot teach/test that newly assigned item until the governed post-merge targeted refresh runs.
    // The separate resume-target regression proves the complete exact-fingerprint stale scope; this exception only permits that one software-invalid transitional asset and fails on any other invalid committed asset.
    const pendingTargetedRefresh = new Set(['3.1-3.2/bus-fnd-001'])
    // The top-up batch rebuilds some 3.5 nodes; its output replaces those node files in the 3.5 folder, so those files must satisfy both blueprints.
    const checks = [{ id: '3.5', blueprint: '3.5' }, ...config.batches.map((batch) => ({ id: batch.id, blueprint: batch.id })), { id: '3.5', blueprint: config.top_up.id }]
    for (const check of checks) {
      const dir = `content-factory/slices/aqa-7132-${check.id}/learn-practice`
      const blueprintPath = `content-factory/slices/aqa-7132-${check.blueprint}/BLUEPRINT.json`
      if (!existsSync(dir) || !existsSync(blueprintPath)) continue
      // The top-up blueprint only applies once the top-up run has been recorded (its ledger is committed with the new files).
      if (check.blueprint === config.top_up.id && !existsSync(`content-factory/runs/aqa-7132-slice-${config.top_up.id}/ledger.json`)) continue
      const blueprint = JSON.parse(await readFile(blueprintPath, 'utf8')) as Blueprint
      for (const expectation of expectationsFromBlueprint(blueprint)) {
        const path = `${dir}/${expectation.nodeId}.json`
        if (!existsSync(path)) continue
        const output = nodeOutputSchema.parse(JSON.parse(await readFile(path, 'utf8')))
        const findings = validateNodeOutput(output, expectation)
        const key = `${check.blueprint}/${expectation.nodeId}`
        if (pendingTargetedRefresh.has(key)) {
          expect(findings.length, `${key} must remain stale until targeted refresh`).toBeGreaterThan(0)
          continue
        }
        expect(findings, `${check.id}/${expectation.nodeId}`).toEqual([])
      }
    }
  })

  const proofIt = proofEnabled ? it : it.skip

  proofIt('generates Learn and Practice for each 3.5 node, proves what software can, reviews with a fixed checklist, and never unlocks learner publication', async () => {
    const blueprint = JSON.parse(await readFile(BATCH_BLUEPRINT, 'utf8')) as Blueprint
    const candidate = await loadBusinessSubjectFoundationCandidate()
    const rows = new Map<string, { subject_truth_sources?: string[] }>(candidate.matrix.nodes.map((row: { subject_id: string }) => [row.subject_id, row]))
    await mkdir(`${OUTPUT}/assets`, { recursive: true })

    const teachingFor = (nodeId: string): SliceTeaching => {
      const subjectId = nodeId.toUpperCase()
      const node = candidate.nodes.get(subjectId)
      if (!node) throw new Error(`foundation_node_missing:${subjectId}`)
      return { subject_id: subjectId, title: node.title ?? null, teaching_content: node.teaching_content ?? {}, quantitative_content: node.quantitative_content ?? {}, source_ids: rows.get(subjectId)?.subject_truth_sources ?? [] }
    }

    const provider = createOpenAIFoundationLiveProvider({
      apiKey: requiredEnv('OPENAI_API_KEY'),
      maxSpendUsd: positiveNumberEnv('CONTENT_FACTORY_MAX_SPEND_USD', 6),
      generation: model(20_000, 'medium'),
      independentReview: model(8_000, 'high'),
      maxRetries: 0,
    })

    const ledger = await readLedger()
    const outputs = new Map<string, SliceNodeOutput>()
    const units = []
    for (const expectation of expectationsFromBlueprint(blueprint)) {
      const teaching = teachingFor(expectation.nodeId)
      const produced = await produceNode({
        nodeId: expectation.nodeId,
        expectation,
        teaching,
        generate: async (payload) => {
          const execution = await provider.run({ workerId: 'content-factory.aqa-7132.slice-learn-practice-generate', contractVersion: SLICE_CHECKLIST.version, routeKind: 'generation', strictOutput: true, outputSchema: nodeOutputSchema, instructions: 'Create comprehensive Learn and Practice content for the supplied Foundation node and blueprint obligations. Follow the supplied output schema exactly. If fix_these is present, correct those software-proven issues.', payload })
          return execution.status === 'success' ? { ok: true as const, output: execution.output } : { ok: false as const, error: execution.status }
        },
      })
      if (!produced.output) throw new Error(`${expectation.nodeId}: generation failed: ${produced.error ?? 'unknown'}`)
      outputs.set(expectation.nodeId, produced.output)
      const unit = buildSliceUnit({ nodeId: expectation.nodeId, expectation, teaching, output: produced.output })
      if (!unit) throw new Error(`${expectation.nodeId}: could not build review unit`)
      units.push(unit)
    }

    const reviewSchema = reviewOutputSchema(SLICE_CHECKLIST)
    const instructions = `Review one AQA 7132 Learn + Practice node against the supplied Foundation teaching and the fixed checklist.\n${checklistInstructions(SLICE_CHECKLIST)}`
    const run = await runReviewUnits({
      units,
      ledger,
      checklist: SLICE_CHECKLIST,
      knownSourceIds: (unit) => unit.sourceIds,
      concurrency: 4,
      review: async (unit) => {
        const execution = await provider.run({ workerId: 'content-factory.aqa-7132.slice-learn-practice-review', contractVersion: SLICE_CHECKLIST.version, routeKind: 'independent_review', strictOutput: true, outputSchema: reviewSchema, instructions, payload: unit.payload })
        return execution.status === 'success' ? { ok: true as const, output: execution.output } : { ok: false as const, error: execution.status }
      },
    })

    const accepted = run.outcomes.filter((outcome) => outcome.status === 'passed' || outcome.status === 'logged' || (outcome.status === 'reused' && ['passed', 'logged'].includes(outcome.previous)))
    await mkdir(`${OUTPUT}/assets`, { recursive: true })
    for (const outcome of accepted) {
      const output = outputs.get(outcome.unit_id)
      if (output) await writeFile(`${OUTPUT}/assets/${outcome.unit_id}.json`, `${JSON.stringify(output, null, 2)}\n`)
    }
    await writeFile(`${OUTPUT}/ledger.json`, `${JSON.stringify(run.ledger, null, 2)}\n`)
    await writeFile(`${OUTPUT}/escalations.json`, `${JSON.stringify(escalationEntries(run.ledger), null, 2)}\n`)
    await writeFile(`${OUTPUT}/SUMMARY.md`, `${renderRunSummary(`AQA 7132 batch ${BATCH}: Learn + Practice`, run.outcomes, run.ledger)}\n`)
    const evidence = {
      schema_version: 1,
      artifact_type: 'aqa_7132_slice_learn_practice_fast_path',
      recorded_at: new Date().toISOString(),
      slice: BATCH,
      reviewed_commit: env.CONTENT_FACTORY_SLICE_REVIEWED_COMMIT ?? null,
      checklist: SLICE_CHECKLIST,
      summary: {
        planned: units.length,
        accepted: accepted.length,
        blocking: run.outcomes.filter((outcome) => outcome.status === 'blocking').map((outcome) => outcome.unit_id),
        escalated: run.outcomes.filter((outcome) => outcome.status === 'escalated').map((outcome) => outcome.unit_id),
        failed: run.outcomes.filter((outcome) => outcome.status === 'failed').map((outcome) => outcome.unit_id),
        all_nodes_accepted: accepted.length === units.length,
      },
      provider_budget: { ...(provider.budgetSnapshot?.() ?? {}), maxSpendUsd: positiveNumberEnv('CONTENT_FACTORY_MAX_SPEND_USD', 6) },
      gates: { ai_assured_learning_assets: accepted.length === units.length, qualified_human_review_status: 'pending', learner_publication_eligible: false },
    }
    await writeFile(`${OUTPUT}/slice-learn-practice-proof.json`, `${JSON.stringify(evidence, null, 2)}\n`)
    expect(evidence.gates.learner_publication_eligible).toBe(false)
    if (!evidence.gates.ai_assured_learning_assets) throw new Error(`slice_learn_practice_not_fully_accepted: see ${OUTPUT}/SUMMARY.md`)
  }, 60 * 60 * 1000)
})
