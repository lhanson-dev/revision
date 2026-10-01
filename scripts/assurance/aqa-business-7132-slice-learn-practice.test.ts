// AQA 7132 slice production, step 5b: Learn + Practice for section 3.5 under the fast-path rules (ADR-0029).
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
const BLUEPRINT = 'content-factory/slices/aqa-7132-3.5/BLUEPRINT.json'
const OUTPUT = '.artifacts/content-factory-aqa-business-7132-slice-3.5-learn-practice'
// Committed between runs so unchanged nodes are reused and review rounds are counted.
const LEDGER = 'content-factory/runs/aqa-7132-slice-3.5/ledger.json'

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
    expect(checkCalculation({ ...good, inputs: [{ name: 'revenue', value: 1 }] })).toContain('needs exactly these inputs')
    expect(checkCalculation({ formula_id: 'break_even_output', inputs: [{ name: 'fixed_costs', value: 10 }, { name: 'contribution_per_unit', value: 0 }], stated_answer: 1 })).toContain('division by zero')
    expect(checkCalculation({ formula_id: 'profit_for_the_year', inputs: [{ name: 'operating_profit', value: 90000 }, { name: 'net_finance_costs', value: 10000 }, { name: 'taxation', value: 15200 }], stated_answer: 64800 })).toBeNull()
    expect(checkCalculation({ formula_id: 'gross_profit_margin', inputs: [{ name: 'gross_profit', value: 100000 }, { name: 'revenue', value: 250000 }], stated_answer: 40 })).toBeNull()
    expect(new Set(FORMULA_LIBRARY.map((f) => f.id)).size).toBe(FORMULA_LIBRARY.length)
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

  it('keeps every committed Learn + Practice asset valid against the blueprint (software re-proof, no AI)', async () => {
    const dir = 'content-factory/slices/aqa-7132-3.5/learn-practice'
    if (!existsSync(dir)) return
    const blueprint = JSON.parse(await readFile(BLUEPRINT, 'utf8')) as Blueprint
    for (const expectation of expectationsFromBlueprint(blueprint)) {
      const path = `${dir}/${expectation.nodeId}.json`
      if (!existsSync(path)) continue
      const output = nodeOutputSchema.parse(JSON.parse(await readFile(path, 'utf8')))
      expect(validateNodeOutput(output, expectation), expectation.nodeId).toEqual([])
    }
  })

  const proofIt = proofEnabled ? it : it.skip

  proofIt('generates Learn and Practice for each 3.5 node, proves what software can, reviews with a fixed checklist, and never unlocks learner publication', async () => {
    const blueprint = JSON.parse(await readFile(BLUEPRINT, 'utf8')) as Blueprint
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
      // Reasoning tokens count towards the output limit, so generation gets medium effort and a large budget.
      generation: model(24_000, 'medium'),
      independentReview: model(8_000, 'high'),
      // Retries are counted by produceNode and runReviewUnits (3 attempts each), not inside the provider.
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
      return execution.status === 'success' ? { ok: true as const, output: execution.output } : { ok: false as const, error: `${nodeId} ${execution.status}: ${'error' in execution ? execution.error : ''}` }
    }

    const outputs = new Map<string, NodeOutput>()
    const generationFailures: Array<{ node_id: string; error: string }> = []
    const buildUnits = async (targets: NodeExpectation[], feedback: Map<string, ClassifiedFinding[]>) => {
      const units: SliceUnit[] = []
      let next = 0
      const worker = async () => {
        while (next < targets.length) {
          const expectation = targets[next++]
          const produced = await produceNode({ nodeId: expectation.nodeId, expectation, teaching: teachingFor(expectation.nodeId), generate: generate(expectation.nodeId), feedback: feedback.get(expectation.nodeId) })
          if (!produced.output) { generationFailures.push({ node_id: expectation.nodeId, error: produced.error ?? 'generation failed' }); continue }
          outputs.set(expectation.nodeId, produced.output)
          units.push(buildSliceUnit({ nodeId: expectation.nodeId, expectation, teaching: teachingFor(expectation.nodeId), output: produced.output })!)
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

    // Round 1: generate, prove, review.
    let ledger = await readLedger()
    const units1 = await buildUnits(expectations, new Map())
    let run = await runReviewUnits({ units: units1, ledger, checklist: SLICE_CHECKLIST, knownSourceIds: (unit) => unit.sourceIds, concurrency: 4, review })
    ledger = run.ledger

    // Round 2 (the last): regenerate only nodes that blocked, with the findings fed back, and review again.
    const blocked = run.outcomes.filter((o) => o.status === 'blocking')
    if (blocked.length) {
      const feedback = new Map<string, ClassifiedFinding[]>(blocked.map((o) => [o.unit_id, o.findings]))
      const units2 = await buildUnits(expectations.filter((e) => feedback.has(e.nodeId)), feedback)
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
    await writeFile(`${OUTPUT}/SUMMARY.md`, `${renderRunSummary('AQA 7132 slice 3.5: Learn + Practice', finalOutcomes, ledger)}\n${generationFailures.length ? `## Generation failed after 3 attempts\n${generationFailures.map((f) => `- ${f.node_id}: ${f.error}`).join('\n')}\n` : ''}`)
    const evidence = {
      schema_version: 1,
      artifact_type: 'aqa_7132_slice_learn_practice_fast_path',
      recorded_at: new Date().toISOString(),
      slice: '3.5',
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
