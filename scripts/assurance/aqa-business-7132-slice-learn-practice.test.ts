// AQA 7132 slice production, step 5b: Learn + Practice for section 3.5 under the fast-path rules (ADR-0029).
// Always-on tests are software only. The live run (provider spend, capped) only runs when the proof flag is set, post-merge on main.
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { createOpenAIFoundationLiveProvider } from '../../src/content-factory/foundation-live-adapter'
import { withSharedProviderBudget } from '../../src/content-factory/openai-shared-provider-budget'
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
  FORMULA_LIBRARY,
  SLICE_CHECKLIST,
  SLICE_GENERATION_INSTRUCTIONS,
  SLICE_REVIEW_INSTRUCTIONS,
  assignItemsToNodes,
  buildSliceUnit,
  checkCalculation,
  expectationsFromBlueprint,
  formulaIdForItem,
  nodeOutputSchema,
  produceNode,
  validateNodeOutput,
  type Blueprint,
  type NodeExpectation,
  type NodeOutput,
  type SliceTeaching,
  type SliceUnit,
} from './aqa-business-7132-slice-learn-practice'
import { loadBusinessSubjectFoundationCandidate } from '../content-factory/load-business-subject-foundation-candidate-v08.mjs'

const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }
const env = runtime.process?.env ?? {}
const proofEnabled = env.CONTENT_FACTORY_AQA_7132_SLICE_LEARN_PRACTICE === '1'
// The batch to run live (default: the first slice, 3.5). Batches are listed in content-factory/slices/aqa-7132-batches.json.
const BATCH = env.CONTENT_FACTORY_SLICE_BATCH?.trim() || '3.5'
const BLUEPRINT = 'content-factory/slices/aqa-7132-3.5/BLUEPRINT.json'
const BATCH_BLUEPRINT = `content-factory/slices/aqa-7132-${BATCH}/BLUEPRINT.json`
const OUTPUT = `.artifacts/content-factory-aqa-business-7132-slice-${BATCH}-learn-practice`
// The top-up batch replaces files in the original 3.5 asset directory; every other batch owns its own directory.
const RETAINED_ASSETS_DIR = BATCH === '3.5-topup'
  ? 'content-factory/slices/aqa-7132-3.5/learn-practice'
  : `content-factory/slices/aqa-7132-${BATCH}/learn-practice`
// Committed between runs so unchanged nodes are reused and review rounds are counted.
const LEDGER = `content-factory/runs/aqa-7132-slice-${BATCH}/ledger.json`

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

function retainedSliceUnit(input: {
  expectation: NodeExpectation
  teaching: SliceTeaching
  output: NodeOutput
  previous: Ledger['units'][string] | undefined
}) {
  if (!input.previous || !['passed', 'logged'].includes(input.previous.outcome)) return null
  if (validateNodeOutput(input.output, input.expectation).length > 0) return null
  const unit = buildSliceUnit({ nodeId: input.expectation.nodeId, expectation: input.expectation, teaching: input.teaching, output: input.output })
  return unit?.fingerprint === input.previous.fingerprint ? unit : null
}

async function readRetainedSliceUnit(input: { expectation: NodeExpectation; teaching: SliceTeaching; ledger: Ledger }): Promise<{ output: NodeOutput; unit: SliceUnit } | null> {
  const previous = input.ledger.units[input.expectation.nodeId]
  if (!previous || !['passed', 'logged'].includes(previous.outcome)) return null
  try {
    const output = nodeOutputSchema.parse(JSON.parse(await readFile(`${RETAINED_ASSETS_DIR}/${input.expectation.nodeId}.json`, 'utf8')))
    const unit = retainedSliceUnit({ expectation: input.expectation, teaching: input.teaching, output, previous })
    return unit ? { output, unit } : null
  } catch {
    return null
  }
}

const item = (id: string, label = id, kind = 'formula') => ({ id: `aqa-7132-3.5.2:${id}`, section: '3.5.2', label, kind, taughtBy: ['bus-fin-003'] })

function validOutput(expectation: NodeExpectation): NodeOutput {
  const sections = expectation.requiredTreatments.map((treatment) => ({ treatment, heading: treatment, body: 'Body text.', item_ids: expectation.items.map((i) => i.id) })) as NodeOutput['learn']['sections']
  const examples = expectation.items.flatMap((i) => {
    const formulaId = formulaIdForItem(i.id)
    return formulaId ? [{ id: `we-${i.id}`, item_id: i.id, scenario: 'A shop.', steps: ['Substitute.'], calc: { formula_id: formulaId, inputs: [{ name: 'revenue', value: 100 }, { name: 'cost_of_sales', value: 60 }], stated_answer: 40, unit: '£' } }] : []
  })
  return {
    node_id: expectation.nodeId,
    learn: { title: 'Title', sections, key_terms: [], worked_examples: examples },
    practice: { items: expectation.requiredCapabilities.map((capability, index) => ({ id: `p${index}`, capability, item_ids: expectation.items.map((i) => i.id), prompt: 'Q?', answer: 'A.', explanation: 'Because.', calc: null })) as NodeOutput['practice']['items'] },
  }
}

describe('AQA 7132 slice Learn + Practice (software checks)', () => {
  it('recomputes every named 3.5 formula from its inputs and rejects a wrong answer', () => {
    const good = { formula_id: 'gross_profit', inputs: [{ name: 'revenue', value: 250000 }, { name: 'cost_of_sales', value: 150000 }], stated_answer: 100000 }
    expect(checkCalculation(good)).toBeNull()
    expect(checkCalculation({ ...good, stated_answer: 110000 })).toContain('computes to 100000')
    expect(checkCalculation({ ...good, inputs: [{ name: 'revenue', value: 1 }] })).toContain('needs these inputs')
    expect(checkCalculation({ formula_id: 'break_even_output', inputs: [{ name: 'fixed_costs', value: 10 }, { name: 'contribution_per_unit', value: 0 }], stated_answer: 1 })).toContain('division by zero')
    expect(checkCalculation({ formula_id: 'profit_for_the_year', inputs: [{ name: 'operating_profit', value: 90000 }, { name: 'net_finance_costs', value: 10000 }, { name: 'taxation', value: 15200 }], stated_answer: 64800 })).toBeNull()
    expect(checkCalculation({ formula_id: 'gross_profit_margin', inputs: [{ name: 'gross_profit', value: 100000 }, { name: 'revenue', value: 250000 }], stated_answer: 40 })).toBeNull()
    expect(new Set(FORMULA_LIBRARY.map((f) => f.id)).size).toBe(FORMULA_LIBRARY.length)
  })

  it('recomputes the multi-year and list formulas (payback, NPV, expected value, market size) and rejects mistakes in them', () => {
    const inputs = (pairs: Array<[string, number]>) => pairs.map(([name, value]) => ({ name, value }))
    const payback = { formula_id: 'payback', inputs: inputs([['initial_investment', 100000], ['net_cash_flow_1', 40000], ['net_cash_flow_2', 40000], ['net_cash_flow_3', 40000]]), stated_answer: 2.5 }
    expect(checkCalculation(payback)).toBeNull()
    expect(checkCalculation({ ...payback, stated_answer: 3 })).toContain('computes to 2.5')
    expect(checkCalculation({ ...payback, inputs: inputs([['initial_investment', 500000], ['net_cash_flow_1', 40000], ['net_cash_flow_2', 40000]]) })).toContain('cannot be computed')
    expect(checkCalculation({ ...payback, inputs: inputs([['initial_investment', 100000], ['net_cash_flow_1', 40000], ['net_cash_flow_3', 40000]]) })).toContain('no gaps')
    const npv = { formula_id: 'net_present_value', inputs: inputs([['initial_investment', 100000], ['net_cash_flow_1', 50000], ['discount_factor_1', 0.9], ['net_cash_flow_2', 60000], ['discount_factor_2', 0.8]]), stated_answer: -7000 }
    expect(checkCalculation(npv)).toBeNull()
    expect(checkCalculation({ ...npv, stated_answer: 7000 })).toContain('computes to -7000')
    expect(checkCalculation({ ...npv, inputs: inputs([['initial_investment', 100000], ['net_cash_flow_1', 50000], ['discount_factor_1', 0.9], ['net_cash_flow_2', 60000]]) })).toContain('no gaps')
    const ev = { formula_id: 'expected_value', inputs: inputs([['probability_1', 0.6], ['outcome_1', 50000], ['probability_2', 0.4], ['outcome_2', -10000]]), stated_answer: 26000 }
    expect(checkCalculation(ev)).toBeNull()
    expect(checkCalculation({ ...ev, inputs: inputs([['probability_1', 0.6], ['outcome_1', 50000], ['probability_2', 0.5], ['outcome_2', -10000]]) })).toContain('cannot be computed')
    expect(checkCalculation({ formula_id: 'market_size', inputs: inputs([['firm_sales_1', 4000000], ['firm_sales_2', 2500000], ['firm_sales_3', 1500000]]), stated_answer: 8000000 })).toBeNull()
    expect(checkCalculation({ formula_id: 'gross_profit', inputs: inputs([['revenue', 10], ['cost_of_sales', 4], ['other', 1]]), stated_answer: 6 })).toContain('does not take')
    expect(checkCalculation({ formula_id: 'average_rate_of_return', inputs: inputs([['total_net_cash_inflows', 175000], ['initial_investment', 100000], ['number_of_years', 5]]), stated_answer: 15 })).toBeNull()
    expect(checkCalculation({ formula_id: 'gearing', inputs: inputs([['non_current_liabilities', 300000], ['total_equity', 700000]]), stated_answer: 30 })).toBeNull()
    expect(checkCalculation({ formula_id: 'return_on_capital_employed', inputs: inputs([['operating_profit', 120000], ['total_equity', 700000], ['non_current_liabilities', 300000]]), stated_answer: 12 })).toBeNull()
  })

  it('maps every named formula in the whole course to a library formula, and uses every library formula', async () => {
    const named = JSON.parse(await readFile('research/aqa-business-7132/2027/NAMED_ITEMS.json', 'utf8')) as { items: Array<{ id: string; kind: string }> }
    const formulaItems = named.items.filter((i) => i.kind === 'formula')
    expect(formulaItems.length).toBe(39)
    const used = new Set<string>()
    for (const i of formulaItems) {
      const id = formulaIdForItem(i.id)
      expect(id, i.id).not.toBeNull()
      used.add(id!)
    }
    expect([...used].sort()).toEqual(FORMULA_LIBRARY.map((f) => f.id).sort())
  })

  it('maps every named 3.5 formula item to a library formula', async () => {
    const blueprint = JSON.parse(await readFile(BLUEPRINT, 'utf8')) as Blueprint
    const formulaItems = blueprint.items.filter((i) => i.kind === 'formula')
    expect(formulaItems.length).toBe(12)
    for (const i of formulaItems) expect(formulaIdForItem(i.id), i.id).not.toBeNull()
  })

  it('gives each named item to exactly one slice node and every node an expectation', async () => {
    const blueprint = JSON.parse(await readFile(BLUEPRINT, 'utf8')) as Blueprint
    const assigned = assignItemsToNodes(blueprint)
    const all = [...assigned.values()].flat().map((i) => i.id)
    expect(new Set(all).size).toBe(all.length)
    expect(all.length).toBe(blueprint.items.length)
    expect(expectationsFromBlueprint(blueprint).length).toBe(blueprint.nodes.length)
  })

  it('accepts complete output and flags what software can prove is missing or wrong', () => {
    const expectation: NodeExpectation = { nodeId: 'bus-fin-003', requiredTreatments: ['core_explanation', 'worked_example'], requiredCapabilities: ['retrieval', 'calculation'], items: [item('gross-profit', 'Gross profit')] }
    const output = validOutput(expectation)
    expect(validateNodeOutput(output, expectation).map((f) => f.check_id)).toEqual(['item_calculation_task'])
    const fixed: NodeOutput = { ...output, practice: { items: output.practice.items.map((p, index) => (index === 1 ? { ...p, calc: { formula_id: 'gross_profit', inputs: [{ name: 'revenue', value: 80 }, { name: 'cost_of_sales', value: 50 }], stated_answer: 30, unit: '£' } } : p)) } }
    expect(validateNodeOutput(fixed, expectation)).toEqual([])
    const wrong: NodeOutput = { ...fixed, learn: { ...fixed.learn, worked_examples: fixed.learn.worked_examples.map((w) => ({ ...w, calc: { ...w.calc, stated_answer: 41 } })) } }
    expect(validateNodeOutput(wrong, expectation).map((f) => f.check_id)).toEqual(['calculation_recomputes'])
    expect(validateNodeOutput({ ...fixed, learn: { ...fixed.learn, sections: fixed.learn.sections.filter((s) => s.treatment !== 'worked_example') } }, expectation).map((f) => f.check_id)).toContain('blueprint_treatments')
    expect(validateNodeOutput({ ...fixed, node_id: 'other' }, expectation).map((f) => f.check_id)).toContain('identity')
  })

  it('retries a node with the software findings fed back, then stops at three attempts', async () => {
    const expectation: NodeExpectation = { nodeId: 'bus-fin-003', requiredTreatments: ['core_explanation'], requiredCapabilities: ['retrieval'], items: [] }
    const teaching: SliceTeaching = { subject_id: 'BUS-FIN-003', teaching_content: {}, quantitative_content: {}, source_ids: [] }
    const good = validOutput(expectation)
    const bad = { ...good, node_id: 'wrong' }
    const seenFeedback: number[] = []
    const result = await produceNode({ nodeId: 'bus-fin-003', expectation, teaching, generate: async (payload, attempt) => { seenFeedback.push((payload.fix_these as unknown[]).length); return { ok: true, output: attempt === 1 ? bad : good } })
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

  it('reuses a retained accepted Learn + Practice asset only when its exact review fingerprint still matches current inputs', () => {
    const expectation: NodeExpectation = { nodeId: 'bus-fin-003', requiredTreatments: ['core_explanation'], requiredCapabilities: ['retrieval'], items: [] }
    const output = validOutput(expectation)
    const teaching: SliceTeaching = { subject_id: 'BUS-FIN-003', teaching_content: { fact: 'same' }, quantitative_content: {}, source_ids: ['SRC-A'] }
    const unit = buildSliceUnit({ nodeId: expectation.nodeId, expectation, teaching, output })!
    const previous: Ledger['units'][string] = { fingerprint: unit.fingerprint, outcome: 'passed', consecutive_blocking_rounds: 0, findings: [], updated_at: '2026-10-01T00:00:00Z' }
    expect(retainedSliceUnit({ expectation, teaching, output, previous })?.fingerprint).toBe(unit.fingerprint)
    expect(retainedSliceUnit({ expectation, teaching: { ...teaching, teaching_content: { fact: 'changed' } }, output, previous })).toBeNull()
    expect(retainedSliceUnit({ expectation, teaching, output, previous: { ...previous, outcome: 'failed' } })).toBeNull()
  })

  it('keeps every committed Learn + Practice asset valid against its blueprint (software re-proof, no AI)', async () => {
    const config = JSON.parse(await readFile('content-factory/slices/aqa-7132-batches.json', 'utf8')) as { batches: Array<{ id: string }>; top_up: { id: string } }
    const checks = [{ id: '3.5', blueprint: '3.5' }, ...config.batches.map((batch) => ({ id: batch.id, blueprint: batch.id })), { id: '3.5', blueprint: config.top_up.id }]
    for (const check of checks) {
      const dir = `content-factory/slices/aqa-7132-${check.id}/learn-practice`
      const blueprintPath = `content-factory/slices/aqa-7132-${check.blueprint}/BLUEPRINT.json`
      if (!existsSync(dir) || !existsSync(blueprintPath)) continue
      if (check.blueprint === config.top_up.id && !existsSync(`content-factory/runs/aqa-7132-slice-${config.top_up.id}/ledger.json`)) continue
      const blueprint = JSON.parse(await readFile(blueprintPath, 'utf8')) as Blueprint
      for (const expectation of expectationsFromBlueprint(blueprint)) {
        const path = `${dir}/${expectation.nodeId}.json`
        if (!existsSync(path)) continue
        const output = nodeOutputSchema.parse(JSON.parse(await readFile(path, 'utf8')))
        expect(validateNodeOutput(output, expectation), `${check.id}/${expectation.nodeId}`).toEqual([])
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

    const maxSpendUsd = positiveNumberEnv('CONTENT_FACTORY_MAX_SPEND_USD', 6)
    const provider = createOpenAIFoundationLiveProvider(withSharedProviderBudget({
      apiKey: requiredEnv('OPENAI_API_KEY'),
      maxSpendUsd,
      generation: model(24_000, 'medium'),
      independentReview: model(8_000, 'high'),
      maxRetries: 0,
    }))
    const expectations = expectationsFromBlueprint(blueprint)
    const generate = (nodeId: string) => async (payload: Record<string, unknown>) => {
      const execution = await provider.run({ workerId: 'content-factory.aqa-7132.slice-learn-practice-generate', contractVersion: SLICE_CHECKLIST.version, routeKind: 'generation', strictOutput: true, outputSchema: nodeOutputSchema, instructions: SLICE_GENERATION_INSTRUCTIONS, payload })
      return execution.status === 'success' ? { ok: true as const, output: execution.output } : { ok: false as const, error: `${nodeId} ${execution.status}: ${'error' in execution ? execution.error : ''}` }
    }

    const outputs = new Map<string, NodeOutput>()
    const generationFailures: Array<{ node_id: string; error: string }> = []
    const buildUnits = async (targets: NodeExpectation[], feedback: Map<string, ClassifiedFinding[]>, ledgerForReuse: Ledger, allowRetained: boolean) => {
      const units: SliceUnit[] = []
      let next = 0
      const worker = async () => {
        while (next < targets.length) {
          const expectation = targets[next++]
          const teaching = teachingFor(expectation.nodeId)
          if (allowRetained) {
            const retained = await readRetainedSliceUnit({ expectation, teaching, ledger: ledgerForReuse })
            if (retained) {
              outputs.set(expectation.nodeId, retained.output)
              units.push(retained.unit)
              continue
            }
          }
          const produced = await produceNode({ nodeId: expectation.nodeId, expectation, teaching, generate: generate(expectation.nodeId), feedback: feedback.get(expectation.nodeId) })
          if (!produced.output) { generationFailures.push({ node_id: expectation.nodeId, error: produced.error ?? 'generation failed' }); continue }
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
      const execution = await provider.run({ workerId: 'content-factory.aqa-7132.slice-learn-practice-review', contractVersion: SLICE_CHECKLIST.version, routeKind: 'independent_review', strictOutput: true, outputSchema: reviewSchema, instructions, payload: unit.payload })
      return execution.status === 'success' ? { ok: true as const, output: execution.output } : { ok: false as const, error: `${execution.status}: ${'error' in execution ? execution.error : ''}` }
    }

    // Round 1: exact-fingerprint accepted assets are reused before any generation or provider review. Changed teaching or asset content invalidates only that node.
    let ledger = await readLedger()
    const units1 = await buildUnits(expectations, new Map(), ledger, true)
    let run = await runReviewUnits({ units: units1, ledger, checklist: SLICE_CHECKLIST, knownSourceIds: (unit) => unit.sourceIds, concurrency: 4, review })
    ledger = run.ledger

    const blocked = run.outcomes.filter((o) => o.status === 'blocking')
    if (blocked.length) {
      const feedback = new Map<string, ClassifiedFinding[]>(blocked.map((o) => [o.unit_id, o.findings]))
      const units2 = await buildUnits(expectations.filter((e) => feedback.has(e.nodeId)), feedback, ledger, false)
      const second = await runReviewUnits({ units: units2, ledger, checklist: SLICE_CHECKLIST, knownSourceIds: (unit) => unit.sourceIds, concurrency: 4, review })
      ledger = second.ledger
      run = { ...second, outcomes: [...run.outcomes.filter((o) => !feedback.has(o.unit_id)), ...second.outcomes] }
    }

    const finalOutcomes = run.outcomes
    const passedIds = finalOutcomes.filter((o) => o.status === 'passed' || o.status === 'logged' || o.status === 'reused').map((o) => o.unit_id)
    for (const id of passedIds) {
      const output = outputs.get(id)
      if (output) await writeFile(`${OUTPUT}/assets/${id}.json`, `${JSON.stringify(output, null, 2)}\n`)
    }
    for (const [id, output] of outputs) await writeFile(`${OUTPUT}/assets/${id}.latest.json`, `${JSON.stringify(output, null, 2)}\n`)

    const accepted = finalOutcomes.filter((o) => ['passed', 'logged', 'reused'].includes(o.status)).length
    const summary = {
      nodes: expectations.length,
      accepted,
      blocking: finalOutcomes.filter((o) => o.status === 'blocking').map((o) => o.unit_id),
      escalated: finalOutcomes.filter((o) => o.status === 'escalated').map((o) => o.unit_id),
      failed: [...finalOutcomes.filter((o) => o.status === 'failed').map((o) => o.unit_id), ...generationFailures.map((f) => f.node_id)],
      all_nodes_accepted: accepted === expectations.length,
    }
    await writeFile(`${OUTPUT}/ledger.json`, `${JSON.stringify(ledger, null, 2)}\n`)
    await writeFile(`${OUTPUT}/escalations.json`, `${JSON.stringify(escalationEntries(ledger), null, 2)}\n`)
    await writeFile(`${OUTPUT}/SUMMARY.md`, `${renderRunSummary(`AQA 7132 batch ${BATCH}: Learn + Practice`, finalOutcomes, ledger)}\n${generationFailures.length ? `## Generation failed after 3 attempts\n${generationFailures.map((f) => `- ${f.node_id}: ${f.error}`).join('\n')}\n` : ''}`)
    const evidence = {
      schema_version: 1,
      artifact_type: 'aqa_7132_slice_learn_practice_fast_path',
      recorded_at: new Date().toISOString(),
      slice: BATCH,
      reviewed_commit: env.CONTENT_FACTORY_SLICE_REVIEWED_COMMIT ?? null,
      checklist: SLICE_CHECKLIST,
      summary,
      provider_budget: { ...(provider.budgetSnapshot?.() ?? {}), maxSpendUsd },
      gates: { ai_assured_nodes: summary.all_nodes_accepted, qualified_human_review_status: 'pending', learner_publication_eligible: false },
    }
    await writeFile(`${OUTPUT}/slice-learn-practice-proof.json`, `${JSON.stringify(evidence, null, 2)}\n`)
    await writeFile(`${OUTPUT}/summary.json`, `${JSON.stringify({ ...summary, provider_budget: evidence.provider_budget }, null, 2)}\n`)

    expect(evidence.gates.learner_publication_eligible).toBe(false)
    if (!summary.all_nodes_accepted) throw new Error(`slice_learn_practice_not_fully_accepted: see ${OUTPUT}/SUMMARY.md`)
  }, 60 * 60 * 1000)
})
