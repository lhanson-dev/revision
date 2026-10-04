import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { OpenAIStructuredWorkerClient } from '../../src/content-factory/openai-live-adapter'
import {
  checklistInstructions,
  renderRunSummary,
  reviewOutputSchema,
  runReviewUnits,
  summarise,
  type ClassifiedFinding,
  type Ledger,
  type ReviewUnit,
  type UnitOutcome,
} from '../../src/content-factory/fast-path-review'
import { loadBusinessSubjectFoundationCandidate } from '../content-factory/load-business-subject-foundation-candidate-v08.mjs'
import {
  BLIND_UNIT_INSTRUCTIONS,
  MOCK_GENERATION_STAGE,
  MOCK_GENERATION_VERSION,
  MOCK_PAPER_CHECKLIST,
  MOCK_PAPER_REVIEW_INSTRUCTIONS,
  MOCK_QUESTION_CHECKLIST,
  MOCK_QUESTION_GENERATION_INSTRUCTIONS,
  MOCK_UNIT_REVIEW_INSTRUCTIONS,
  SHARED_CONTEXT_GENERATION_INSTRUCTIONS,
  blindUnitPayload,
  blindUnitSchema,
  buildMockGenerationUnits,
  contextGenerationPayload,
  detectNearDuplicates,
  expectedCommand,
  expectedFamily,
  fingerprint,
  mockQuestionSchema,
  numericComparison,
  questionGenerationPayload,
  sharedContextSchema,
  unitEvidence,
  validateMockQuestion,
  type BlindUnit,
  type CourseTruthRequirement,
  type MockEvidence,
  type MockGenerationUnit,
  type MockPlan,
  type MockPlanPaper,
  type MockPlanSlot,
  type MockQuestion,
  type SharedContext,
} from './aqa-business-7132-mock-generation'

const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }
const env = runtime.process?.env ?? {}
const liveEnabled = env.CONTENT_FACTORY_AQA_7132_MOCK_GENERATION === '1'
const PLAN_VALIDATOR = 'scripts/assurance/validate-aqa-business-7132-mock-plan.mjs'
const PLAN_PATH = '.artifacts/content-factory-aqa-business-7132-mock-plan/mock-set-plan.json'
const COURSE_TRUTH_PATH = '.artifacts/content-factory-aqa-business-7132-course-exam-truth/course-truth.json'
const OUTPUT = '.artifacts/content-factory-aqa-business-7132-mock-generation'
const STATE_PATH = `${OUTPUT}/generation-state.json`
const UNIT_LEDGER_PATH = `${OUTPUT}/unit-review-ledger.json`
const PAPER_LEDGER_PATH = `${OUTPUT}/paper-review-ledger.json`
const SUMMARY_PATH = `${OUTPUT}/summary.json`
const SUMMARY_MD_PATH = `${OUTPUT}/summary.md`

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

async function materialisedPlan() {
  execFileSync(process.execPath, [PLAN_VALIDATOR], { stdio: 'pipe' })
  return JSON.parse(await readFile(PLAN_PATH, 'utf8')) as MockPlan
}

function paperFor(plan: MockPlan, componentId: MockPlanPaper['component_id']) {
  const paper = plan.papers.find((candidate) => candidate.component_id === componentId)
  if (!paper) throw new Error(`mock_generation_paper_missing:${componentId}`)
  return paper
}

function emptyLedger(stage: string, version: string): Ledger {
  return { schema_version: 1, stage, checklist_version: version, units: {} }
}

async function readLedger(path: string, stage: string, version: string) {
  try {
    const parsed = JSON.parse(await readFile(path, 'utf8')) as Ledger
    return parsed.stage === stage && parsed.checklist_version === version ? parsed : emptyLedger(stage, version)
  } catch {
    return emptyLedger(stage, version)
  }
}

type ProviderProvenance = { id?: string; contextId?: string; contractVersion?: string; provider?: string; model?: string; retryCount?: number; usageCost?: number }
type StoredContext = { input_fingerprint: string; output: SharedContext; provenance: ProviderProvenance }
type StoredQuestion = { input_fingerprint: string; output: MockQuestion; provenance: ProviderProvenance }
type StoredBlind = { input_fingerprint: string; output: BlindUnit; provenance: ProviderProvenance }
type GenerationState = {
  schema_version: 1
  plan_fingerprint: string
  reviewed_commit: string
  cumulative_spend_usd: number
  new_provider_calls: number
  contexts: Record<string, StoredContext>
  questions: Record<string, StoredQuestion>
  blind_units: Record<string, StoredBlind>
  generation_failures: Record<string, string>
}

async function readState(plan: MockPlan, reviewedCommit: string): Promise<GenerationState> {
  try {
    const parsed = JSON.parse(await readFile(STATE_PATH, 'utf8')) as GenerationState
    if (parsed.schema_version === 1 && parsed.plan_fingerprint === plan.plan_fingerprint) return { ...parsed, reviewed_commit: reviewedCommit, new_provider_calls: 0, generation_failures: {} }
  } catch {
    // Fresh run.
  }
  return { schema_version: 1, plan_fingerprint: plan.plan_fingerprint, reviewed_commit: reviewedCommit, cumulative_spend_usd: 0, new_provider_calls: 0, contexts: {}, questions: {}, blind_units: {}, generation_failures: {} }
}

function exactIds(actual: string[], expected: string[]) {
  return JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort())
}

function reviewUnit(input: { plan: MockPlan; unit: MockGenerationUnit; questions: MockQuestion[]; blind: BlindUnit; context?: SharedContext; evidence: MockEvidence }) {
  const evidence = unitEvidence(input.unit, input.evidence)
  const payload = {
    unit_id: input.unit.unit_id,
    plan_fingerprint: input.plan.plan_fingerprint,
    component_id: input.unit.component_id,
    sources: evidence.nodes.map((node) => ({ id: node.id, text: { teaching_content: node.teaching_content, quantitative_content: node.quantitative_content } })),
    requirement_targets: evidence.requirements,
    shared_context: input.context ?? null,
    questions: input.questions,
    blind_answers: input.blind,
    numeric_comparison: numericComparison(input.questions, input.blind),
  }
  return {
    unit_id: input.unit.unit_id,
    fingerprint: fingerprint({ payload, checklist: MOCK_QUESTION_CHECKLIST.version }),
    payload,
    sourceIds: new Set(evidence.nodes.flatMap((node) => [node.id, ...node.source_ids])),
  }
}

function paperReviewUnit(input: { plan: MockPlan; paper: MockPlanPaper; paperArtifact: unknown; evidence: MockEvidence }) {
  const unit: MockGenerationUnit = { unit_id: input.paper.component_id, component_id: input.paper.component_id, context_policy: 'question_local', slots: input.paper.slots }
  const evidence = unitEvidence(unit, input.evidence)
  const payload = {
    unit_id: input.paper.component_id,
    plan_fingerprint: input.plan.plan_fingerprint,
    paper: input.paperArtifact,
    sources: evidence.nodes.map((node) => ({ id: node.id, text: { teaching_content: node.teaching_content, quantitative_content: node.quantitative_content } })),
  }
  return {
    unit_id: input.paper.component_id,
    fingerprint: fingerprint({ payload, checklist: MOCK_PAPER_CHECKLIST.version }),
    payload,
    sourceIds: new Set(evidence.nodes.flatMap((node) => [node.id, ...node.source_ids])),
  }
}

function escalateRoundTwo(outcomes: UnitOutcome[], ledger: Ledger) {
  const next = structuredClone(ledger)
  const changed = outcomes.map((outcome) => {
    if (outcome.status !== 'blocking' || outcome.round < 2) return outcome
    const entry = next.units[outcome.unit_id]
    if (entry) next.units[outcome.unit_id] = { ...entry, outcome: 'escalated' }
    return { unit_id: outcome.unit_id, status: 'escalated' as const, findings: outcome.findings }
  })
  return { outcomes: changed, ledger: next }
}

function sharedUnitForSlot(units: MockGenerationUnit[], slotId: string) {
  return units.find((unit) => unit.slots.some((slot) => slot.slot_id === slotId))
}

function feedbackForSlot(findings: ClassifiedFinding[], slotId: string) {
  return findings.filter((finding) => finding.affected_ids.includes(slotId) || finding.affected_ids.includes('paper') || finding.affected_ids.includes('question'))
}

function feedbackTargetsForPaper(paper: MockPlanPaper, entry: Ledger['units'][string] | undefined) {
  if (!entry || entry.outcome !== 'blocking' || entry.consecutive_blocking_rounds >= 2) return { slots: new Map<string, ClassifiedFinding[]>(), broad: [] as ClassifiedFinding[] }
  const slotIds = new Set(paper.slots.map((slot) => slot.slot_id))
  const slots = new Map<string, ClassifiedFinding[]>()
  const broad: ClassifiedFinding[] = []
  for (const finding of entry.findings.filter((candidate) => candidate.disposition === 'blocking')) {
    const affected = finding.affected_ids.filter((id) => slotIds.has(id))
    if (!affected.length) broad.push(finding)
    for (const id of affected) slots.set(id, [...(slots.get(id) ?? []), finding])
  }
  return { slots, broad }
}

function assembledPaper(plan: MockPlan, paper: MockPlanPaper, questions: Map<string, MockQuestion>, contexts: Map<string, SharedContext>) {
  return {
    schema_version: 1,
    plan_id: plan.plan_id,
    plan_fingerprint: plan.plan_fingerprint,
    component_id: paper.component_id,
    name: paper.name,
    duration_minutes: paper.duration_minutes,
    attempted_raw_marks: paper.attempted_raw_marks,
    printed_raw_marks: paper.printed_raw_marks,
    learner_claim: "A realistic practice paper built to AQA's structure. Revision-authored; not an official AQA paper.",
    shared_contexts: [...contexts.values()].filter((context) => paper.slots.some((slot) => slot.context_id === context.unit_id)),
    questions: paper.slots.map((slot) => {
      const question = questions.get(slot.slot_id)
      if (!question) throw new Error(`mock_generation_question_missing:${slot.slot_id}`)
      return {
        target_requirement_ids: slot.required_course_truth_requirement_ids,
        target_subject_node_ids: slot.required_subject_node_ids,
        quantitative_marks: slot.quantitative_marks,
        choice_group: slot.choice_group,
        required_in_response_path: slot.required_in_response_path,
        question,
      }
    }),
  }
}

function validateAssembledSet(plan: MockPlan, questions: Map<string, MockQuestion>, contexts: Map<string, SharedContext>) {
  const findings: string[] = []
  const expectedIds = plan.papers.flatMap((paper) => paper.slots.map((slot) => slot.slot_id))
  if (!exactIds([...questions.keys()], expectedIds)) findings.push('generated slot set does not exactly match the deterministic plan')
  for (const paper of plan.papers) {
    for (const slot of paper.slots) {
      const question = questions.get(slot.slot_id)
      if (!question) continue
      const context = slot.context_owner === 'set' || slot.context_owner === 'paper' ? contexts.get(slot.context_id ?? '') : undefined
      if (validateMockQuestion(question, paper, slot, context).length) findings.push(`${slot.slot_id} no longer passes deterministic question validation`)
    }
  }
  const all = [...questions.values()]
  const duplicates = detectNearDuplicates(all)
  if (duplicates.length) findings.push(`near-duplicate stems detected: ${duplicates.map((pair) => `${pair.left}/${pair.right}:${pair.score}`).join(', ')}`)
  const quantitative = all.reduce((sum, question) => sum + question.calculations.reduce((inner, calc) => inner + calc.marks_supported, 0), 0)
  if (quantitative !== plan.quantitative.planned_marks_before_choice_path_validation) findings.push(`generated quantitative marks ${quantitative} do not match planned ${plan.quantitative.planned_marks_before_choice_path_validation}`)
  for (const paper of plan.papers) {
    const printed = paper.slots.reduce((sum, slot) => sum + (questions.get(slot.slot_id)?.marks ?? 0), 0)
    if (printed !== paper.printed_raw_marks) findings.push(`${paper.component_id} printed marks ${printed} do not equal ${paper.printed_raw_marks}`)
  }
  const p1 = paperFor(plan, '7132/1')
  const compulsory = p1.slots.filter((slot) => slot.required_in_response_path).reduce((sum, slot) => sum + slot.marks, 0)
  const c = p1.slots.filter((slot) => slot.choice_group === 'P1-C')
  const d = p1.slots.filter((slot) => slot.choice_group === 'P1-D')
  for (const cSlot of c) for (const dSlot of d) if (compulsory + cSlot.marks + dSlot.marks !== 100) findings.push(`Paper 1 path ${cSlot.slot_id}+${dSlot.slot_id} does not total 100`)
  return { findings, duplicates, quantitative_marks: quantitative }
}

describe('AQA 7132 bounded mock generation (software)', () => {
  it('consumes the validated deterministic plan and divides it into bounded coherent generation units', async () => {
    const plan = await materialisedPlan()
    expect(plan.status).toBe('deterministic_pre_generation_plan')
    expect(plan.generation_gate.provider_spend_allowed).toBe(false)
    const units = buildMockGenerationUnits(plan)
    expect(units).toHaveLength(13)
    expect(units.filter((unit) => unit.component_id === '7132/1')).toHaveLength(9)
    expect(units.filter((unit) => unit.component_id === '7132/2')).toHaveLength(3)
    expect(units.filter((unit) => unit.component_id === '7132/3')).toHaveLength(1)
    expect(units.flatMap((unit) => unit.slots).map((slot) => slot.slot_id).sort()).toEqual(plan.papers.flatMap((paper) => paper.slots).map((slot) => slot.slot_id).sort())
  })

  it('fails closed on mark, AO, quantitative and arithmetic drift', async () => {
    const plan = await materialisedPlan()
    const paper = paperFor(plan, '7132/1')
    const slot = paper.slots.find((candidate) => candidate.slot_id === 'P1-B-01')!
    const good = mockQuestionSchema.parse({
      slot_id: slot.slot_id,
      family: 'SHORT_ANSWER',
      command_word: 'Calculate',
      marks: 4,
      ao_marks: slot.ao_marks,
      context: 'A manufacturer sells two batches of components.',
      stem: 'Using the figures shown, calculate the requested business measure. Show your working.',
      table: { title: 'Figures', columns: ['Item', 'Value'], rows: [{ cells: ['A', '2'] }, { cells: ['B', '2'] }] },
      options: [],
      mark_scheme: { type: 'points', correct_option: '', option_rationale: [], points: [{ marks: 2, descriptor: 'Valid method using 2 × 2.', accept: [] }, { marks: 2, descriptor: 'Correct answer = 4.', accept: [] }], levels: [], indicative_content: [], model_answer: '2 × 2 = 4.' },
      calculations: [{ label: 'Requested measure', method: 'product', operands: [2, 2], stated_answer: 4, unit: 'units', marks_supported: 4 }],
    })
    expect(validateMockQuestion(good, paper, slot)).toEqual([])
    expect(validateMockQuestion({ ...good, marks: 5 }, paper, slot).some((finding) => finding.check_id === 'plan_marks')).toBe(true)
    expect(validateMockQuestion({ ...good, calculations: [{ ...good.calculations[0], stated_answer: 5 }] }, paper, slot).some((finding) => finding.check_id === 'calculation_recomputes')).toBe(true)
    expect(validateMockQuestion({ ...good, calculations: [{ ...good.calculations[0], marks_supported: 3 }] }, paper, slot).some((finding) => finding.check_id === 'quantitative_marks')).toBe(true)
  })

  it('detects close stem duplication deterministically', () => {
    const base = mockQuestionSchema.parse({ slot_id: 'a', family: 'MCQ', command_word: 'Select', marks: 1, ao_marks: { AO1: 1, AO2: 0, AO3: 0, AO4: 0 }, context: '', stem: 'Which of the following statements best explains why a business might choose retained profit to finance expansion?', table: null, options: [{ label: 'A', text: 'One' }, { label: 'B', text: 'Two' }, { label: 'C', text: 'Three' }, { label: 'D', text: 'Four' }], mark_scheme: { type: 'single_option', correct_option: 'A', option_rationale: ['a', 'b', 'c', 'd'], points: [], levels: [], indicative_content: [], model_answer: 'A.' }, calculations: [] })
    const copy = { ...base, slot_id: 'b', stem: 'Which of the following statements best explains why a business might choose retained profit to finance its expansion?' }
    expect(detectNearDuplicates([base, copy]).length).toBe(1)
  })

  const liveIt = liveEnabled ? it : it.skip

  liveIt('generates, blind-answers, reviews and whole-paper assures the exact planned mock set under the cumulative pilot spend cap', async () => {
    const reviewedCommit = requiredEnv('CONTENT_FACTORY_MOCK_REVIEWED_COMMIT')
    if (!/^[0-9a-f]{40}$/.test(reviewedCommit)) throw new Error('mock_generation_reviewed_commit_invalid')
    if (env.GITHUB_REF && env.GITHUB_REF !== 'refs/heads/main') throw new Error(`mock_generation_live_run_requires_main:${env.GITHUB_REF}`)

    const plan = await materialisedPlan()
    const expectedPlanFingerprint = requiredEnv('CONTENT_FACTORY_MOCK_PLAN_FINGERPRINT')
    if (plan.plan_fingerprint !== expectedPlanFingerprint) throw new Error(`mock_generation_plan_fingerprint_mismatch:${plan.plan_fingerprint}:${expectedPlanFingerprint}`)
    const maxSpendUsd = positiveNumberEnv('CONTENT_FACTORY_MAX_SPEND_USD', plan.generation_gate.pilot_new_provider_spend_cap_usd)
    if (maxSpendUsd !== plan.generation_gate.pilot_new_provider_spend_cap_usd) throw new Error(`mock_generation_cap_must_equal_profile:${maxSpendUsd}`)

    const courseTruth = JSON.parse(await readFile(COURSE_TRUTH_PATH, 'utf8')) as { requirements: CourseTruthRequirement[] }
    const candidate = await loadBusinessSubjectFoundationCandidate()
    const rows = new Map<string, { subject_truth_sources?: string[] }>(candidate.matrix.nodes.map((row: { subject_id: string }) => [row.subject_id, row]))
    const evidence: MockEvidence = {
      requirements: new Map(courseTruth.requirements.map((requirement) => [requirement.requirement_id, requirement])),
      nodes: new Map([...candidate.nodes.entries()].map(([id, node]: [string, Record<string, unknown>]) => [id, { subject_id: id, title: typeof node.title === 'string' ? node.title : id, teaching_content: node.teaching_content, quantitative_content: node.quantitative_content, source_ids: rows.get(id)?.subject_truth_sources ?? [] }])),
    }

    await mkdir(`${OUTPUT}/contexts`, { recursive: true })
    await mkdir(`${OUTPUT}/questions`, { recursive: true })
    await mkdir(`${OUTPUT}/blind-units`, { recursive: true })
    await mkdir(`${OUTPUT}/papers`, { recursive: true })

    const state = await readState(plan, reviewedCommit)
    if (state.cumulative_spend_usd >= maxSpendUsd) throw new Error(`mock_generation_cumulative_spend_cap_already_reached:${state.cumulative_spend_usd}`)
    const openingSpend = state.cumulative_spend_usd
    const remainingSpend = Number((maxSpendUsd - openingSpend).toFixed(8))
    const client = new OpenAIStructuredWorkerClient({
      apiKey: requiredEnv('OPENAI_API_KEY'),
      maxSpendUsd: remainingSpend,
      generation: model(7_000, 'medium'),
      independentReview: model(4_000, 'high'),
      maxRetries: 0,
    })

    const persistState = async () => {
      state.cumulative_spend_usd = Number((openingSpend + client.budgetSnapshot().conservativeConsumedUsd).toFixed(8))
      await writeFile(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`)
    }

    const providerCall = async (input: { workerId: string; routeKind: 'generation' | 'independent_review'; outputSchema: Parameters<OpenAIStructuredWorkerClient['run']>[0]['outputSchema']; instructions: string; payload: unknown }) => {
      let last = 'no attempt made'
      for (let attempt = 1; attempt <= 3; attempt++) {
        const execution = await client.run({ ...input, contractVersion: MOCK_GENERATION_VERSION, strictOutput: true })
        state.new_provider_calls += 1
        await persistState()
        if (execution.status === 'success') return execution
        last = `${execution.status}: ${'error' in execution ? execution.error : ''}`
        if (last.includes('content_factory_spend_ceiling_reached')) throw new Error(last)
      }
      throw new Error(`${input.workerId} failed after 3 attempts: ${last}`)
    }

    const units = buildMockGenerationUnits(plan)
    let paperLedger = await readLedger(PAPER_LEDGER_PATH, MOCK_PAPER_CHECKLIST.stage, MOCK_PAPER_CHECKLIST.version)
    const paperFeedback = new Map(plan.papers.map((paper) => [paper.component_id, feedbackTargetsForPaper(paper, paperLedger.units[paper.component_id])]))
    const contexts = new Map<string, SharedContext>()
    const questions = new Map<string, MockQuestion>()

    const generateContext = async (unit: MockGenerationUnit, feedback: ClassifiedFinding[]) => {
      const payload = contextGenerationPayload(plan, unit, evidence, feedback)
      const inputFingerprint = fingerprint({ payload, instructions: SHARED_CONTEXT_GENERATION_INSTRUCTIONS, version: MOCK_GENERATION_VERSION })
      const retained = state.contexts[unit.unit_id]
      if (!feedback.length && retained?.input_fingerprint === inputFingerprint) {
        const parsed = sharedContextSchema.safeParse(retained.output)
        if (parsed.success && parsed.data.unit_id === unit.unit_id) return parsed.data
      }
      const execution = await providerCall({ workerId: `content-factory.aqa-7132.mock-context.${unit.unit_id.toLowerCase()}`, routeKind: 'generation', outputSchema: sharedContextSchema, instructions: SHARED_CONTEXT_GENERATION_INSTRUCTIONS, payload })
      const output = sharedContextSchema.parse(execution.output)
      if (output.unit_id !== unit.unit_id) throw new Error(`mock_context_unit_mismatch:${unit.unit_id}:${output.unit_id}`)
      state.contexts[unit.unit_id] = { input_fingerprint: inputFingerprint, output, provenance: execution.provenance }
      await writeFile(`${OUTPUT}/contexts/${unit.unit_id}.json`, `${JSON.stringify(output, null, 2)}\n`)
      await persistState()
      return output
    }

    for (const unit of units.filter((candidateUnit) => candidateUnit.context_policy === 'shared')) {
      const broad = paperFeedback.get(unit.component_id)?.broad ?? []
      const feedback = broad.length ? broad : []
      contexts.set(unit.unit_id, await generateContext(unit, feedback))
    }

    const generateQuestion = async (paper: MockPlanPaper, slot: MockPlanSlot, sharedContext: SharedContext | undefined, feedback: ClassifiedFinding[]) => {
      const basePayload = questionGenerationPayload(plan, paper, slot, evidence, sharedContext, feedback)
      const inputFingerprint = fingerprint({ payload: basePayload, instructions: MOCK_QUESTION_GENERATION_INSTRUCTIONS, version: MOCK_GENERATION_VERSION })
      const retained = state.questions[slot.slot_id]
      if (!feedback.length && retained?.input_fingerprint === inputFingerprint) {
        const parsed = mockQuestionSchema.safeParse(retained.output)
        if (parsed.success && validateMockQuestion(parsed.data, paper, slot, sharedContext).length === 0) return parsed.data
      }

      let softwareFeedback: ClassifiedFinding[] = []
      let lastError = 'no valid candidate'
      for (let attempt = 1; attempt <= 3; attempt++) {
        const payload = questionGenerationPayload(plan, paper, slot, evidence, sharedContext, [...feedback, ...softwareFeedback])
        const execution = await providerCall({ workerId: `content-factory.aqa-7132.mock-question.${slot.slot_id.toLowerCase()}`, routeKind: 'generation', outputSchema: mockQuestionSchema, instructions: MOCK_QUESTION_GENERATION_INSTRUCTIONS, payload })
        const parsed = mockQuestionSchema.safeParse(execution.output)
        if (!parsed.success) { lastError = 'mock question schema parse failed'; continue }
        softwareFeedback = validateMockQuestion(parsed.data, paper, slot, sharedContext)
        if (!softwareFeedback.length) {
          state.questions[slot.slot_id] = { input_fingerprint: inputFingerprint, output: parsed.data, provenance: execution.provenance }
          delete state.generation_failures[slot.slot_id]
          await writeFile(`${OUTPUT}/questions/${slot.slot_id}.json`, `${JSON.stringify(parsed.data, null, 2)}\n`)
          await persistState()
          return parsed.data
        }
        lastError = softwareFeedback.map((finding) => finding.finding).join('; ')
      }
      state.generation_failures[slot.slot_id] = lastError
      await persistState()
      return null
    }

    const generateAllQuestions = async (extraFeedback = new Map<string, ClassifiedFinding[]>()) => {
      for (const paper of plan.papers) {
        const feedback = paperFeedback.get(paper.component_id)!
        for (const slot of paper.slots) {
          const slotFeedback = [...(feedback.slots.get(slot.slot_id) ?? []), ...(feedback.broad.length ? feedback.broad : []), ...(extraFeedback.get(slot.slot_id) ?? [])]
          const unit = sharedUnitForSlot(units, slot.slot_id)
          const shared = unit?.context_policy === 'shared' ? contexts.get(unit.unit_id) : undefined
          const question = await generateQuestion(paper, slot, shared, slotFeedback)
          if (question) questions.set(slot.slot_id, question)
        }
      }
    }
    await generateAllQuestions()

    const missingAfterGeneration = plan.papers.flatMap((paper) => paper.slots.map((slot) => slot.slot_id)).filter((id) => !questions.has(id))
    if (missingAfterGeneration.length) {
      await writeFile(SUMMARY_PATH, `${JSON.stringify({ status: 'generation_incomplete', plan_fingerprint: plan.plan_fingerprint, missing_slots: missingAfterGeneration, failures: state.generation_failures, cumulative_spend_usd: state.cumulative_spend_usd, provider_calls_this_run: state.new_provider_calls }, null, 2)}\n`)
      throw new Error(`mock_generation_incomplete:${missingAfterGeneration.join(',')}`)
    }

    const answerUnitBlind = async (unit: MockGenerationUnit) => {
      const unitQuestions = unit.slots.map((slot) => questions.get(slot.slot_id)!)
      const context = unit.context_policy === 'shared' ? contexts.get(unit.unit_id) : undefined
      const payload = blindUnitPayload(unit, unitQuestions, context)
      const inputFingerprint = fingerprint({ payload, instructions: BLIND_UNIT_INSTRUCTIONS, version: MOCK_GENERATION_VERSION })
      const retained = state.blind_units[unit.unit_id]
      if (retained?.input_fingerprint === inputFingerprint) {
        const parsed = blindUnitSchema.safeParse(retained.output)
        if (parsed.success && parsed.data.unit_id === unit.unit_id && exactIds(parsed.data.answers.map((answer) => answer.slot_id), unit.slots.map((slot) => slot.slot_id))) return parsed.data
      }
      const execution = await providerCall({ workerId: `content-factory.aqa-7132.mock-blind.${unit.unit_id.toLowerCase()}`, routeKind: 'independent_review', outputSchema: blindUnitSchema, instructions: BLIND_UNIT_INSTRUCTIONS, payload })
      const output = blindUnitSchema.parse(execution.output)
      if (output.unit_id !== unit.unit_id || !exactIds(output.answers.map((answer) => answer.slot_id), unit.slots.map((slot) => slot.slot_id))) throw new Error(`mock_blind_answer_set_mismatch:${unit.unit_id}`)
      state.blind_units[unit.unit_id] = { input_fingerprint: inputFingerprint, output, provenance: execution.provenance }
      await writeFile(`${OUTPUT}/blind-units/${unit.unit_id}.json`, `${JSON.stringify(output, null, 2)}\n`)
      await persistState()
      return output
    }

    const blindByUnit = new Map<string, BlindUnit>()
    for (const unit of units) blindByUnit.set(unit.unit_id, await answerUnitBlind(unit))

    let unitLedger = await readLedger(UNIT_LEDGER_PATH, MOCK_QUESTION_CHECKLIST.stage, MOCK_QUESTION_CHECKLIST.version)
    const buildReviewUnits = () => units.map((unit) => reviewUnit({ plan, unit, questions: unit.slots.map((slot) => questions.get(slot.slot_id)!), blind: blindByUnit.get(unit.unit_id)!, context: contexts.get(unit.unit_id), evidence }))
    const unitReviewSchema = reviewOutputSchema(MOCK_QUESTION_CHECKLIST)
    const unitReviewInstructions = `${MOCK_UNIT_REVIEW_INSTRUCTIONS}\n${checklistInstructions(MOCK_QUESTION_CHECKLIST)}`
    const reviewOneUnit = async (unit: ReturnType<typeof reviewUnit>) => {
      try {
        const execution = await providerCall({ workerId: `content-factory.aqa-7132.mock-unit-review.${unit.unit_id.toLowerCase()}`, routeKind: 'independent_review', outputSchema: unitReviewSchema, instructions: unitReviewInstructions, payload: unit.payload })
        return { ok: true as const, output: execution.output }
      } catch (error) {
        return { ok: false as const, error: error instanceof Error ? error.message : String(error) }
      }
    }

    let unitRun = await runReviewUnits({ units: buildReviewUnits(), ledger: unitLedger, checklist: MOCK_QUESTION_CHECKLIST, knownSourceIds: (unit) => unit.sourceIds, concurrency: 1, review: reviewOneUnit })
    unitLedger = unitRun.ledger

    const blockedUnits = unitRun.outcomes.filter((outcome) => outcome.status === 'blocking')
    if (blockedUnits.length) {
      const remediationFeedback = new Map<string, ClassifiedFinding[]>()
      for (const outcome of blockedUnits) {
        const unit = units.find((candidateUnit) => candidateUnit.unit_id === outcome.unit_id)!
        for (const slot of unit.slots) {
          const targeted = feedbackForSlot(outcome.findings, slot.slot_id)
          if (targeted.length) remediationFeedback.set(slot.slot_id, targeted)
        }
        if (!unit.slots.some((slot) => remediationFeedback.has(slot.slot_id))) for (const slot of unit.slots) remediationFeedback.set(slot.slot_id, outcome.findings)
      }
      await generateAllQuestions(remediationFeedback)
      for (const outcome of blockedUnits) {
        const unit = units.find((candidateUnit) => candidateUnit.unit_id === outcome.unit_id)!
        const fresh = await answerUnitBlind(unit)
        blindByUnit.set(unit.unit_id, fresh)
      }
      const retryIds = new Set(blockedUnits.map((outcome) => outcome.unit_id))
      const retryUnits = buildReviewUnits().filter((unit) => retryIds.has(unit.unit_id))
      const second = await runReviewUnits({ units: retryUnits, ledger: unitLedger, checklist: MOCK_QUESTION_CHECKLIST, knownSourceIds: (unit) => unit.sourceIds, concurrency: 1, review: reviewOneUnit })
      unitLedger = second.ledger
      const combined = [...unitRun.outcomes.filter((outcome) => !retryIds.has(outcome.unit_id)), ...second.outcomes].sort((a, b) => a.unit_id.localeCompare(b.unit_id))
      unitRun = { ...second, outcomes: combined }
    }
    const unitEscalated = escalateRoundTwo(unitRun.outcomes, unitLedger)
    unitLedger = unitEscalated.ledger
    unitRun = { ...unitRun, outcomes: unitEscalated.outcomes }
    await writeFile(UNIT_LEDGER_PATH, `${JSON.stringify(unitLedger, null, 2)}\n`)

    const unitSummary = summarise(unitRun.outcomes, unitLedger)
    if (!unitSummary.can_progress) {
      await persistState()
      await writeFile(SUMMARY_PATH, `${JSON.stringify({ status: 'unit_assurance_blocked', plan_fingerprint: plan.plan_fingerprint, unit_summary: unitSummary, cumulative_spend_usd: state.cumulative_spend_usd, provider_calls_this_run: state.new_provider_calls }, null, 2)}\n`)
      await writeFile(SUMMARY_MD_PATH, renderRunSummary('AQA 7132 mock unit assurance', unitRun.outcomes, unitLedger))
      throw new Error('mock_generation_unit_assurance_cannot_progress')
    }

    const deterministic = validateAssembledSet(plan, questions, contexts)
    if (deterministic.findings.length) {
      await writeFile(SUMMARY_PATH, `${JSON.stringify({ status: 'whole_set_software_blocked', plan_fingerprint: plan.plan_fingerprint, deterministic, cumulative_spend_usd: state.cumulative_spend_usd, provider_calls_this_run: state.new_provider_calls }, null, 2)}\n`)
      throw new Error(`mock_generation_whole_set_software_blocked:${deterministic.findings.join(';')}`)
    }

    const paperArtifacts = new Map<string, unknown>()
    for (const paper of plan.papers) {
      const artifact = assembledPaper(plan, paper, questions, contexts)
      paperArtifacts.set(paper.component_id, artifact)
      await writeFile(`${OUTPUT}/papers/${paper.component_id.replace('/', '-')}.json`, `${JSON.stringify(artifact, null, 2)}\n`)
    }

    const paperReviewSchema = reviewOutputSchema(MOCK_PAPER_CHECKLIST)
    const paperReviewInstructions = `${MOCK_PAPER_REVIEW_INSTRUCTIONS}\n${checklistInstructions(MOCK_PAPER_CHECKLIST)}`
    const paperUnits = plan.papers.map((paper) => paperReviewUnit({ plan, paper, paperArtifact: paperArtifacts.get(paper.component_id), evidence }))
    const reviewPaper = async (unit: ReviewUnit & { payload: Record<string, unknown>; sourceIds: Set<string> }) => {
      try {
        const execution = await providerCall({ workerId: `content-factory.aqa-7132.mock-paper-review.${unit.unit_id.replace('/', '-').toLowerCase()}`, routeKind: 'independent_review', outputSchema: paperReviewSchema, instructions: paperReviewInstructions, payload: unit.payload })
        return { ok: true as const, output: execution.output }
      } catch (error) {
        return { ok: false as const, error: error instanceof Error ? error.message : String(error) }
      }
    }
    const paperRun = await runReviewUnits({ units: paperUnits, ledger: paperLedger, checklist: MOCK_PAPER_CHECKLIST, knownSourceIds: (unit) => unit.sourceIds, concurrency: 1, review: reviewPaper })
    paperLedger = paperRun.ledger
    const paperEscalated = escalateRoundTwo(paperRun.outcomes, paperLedger)
    paperLedger = paperEscalated.ledger
    await writeFile(PAPER_LEDGER_PATH, `${JSON.stringify(paperLedger, null, 2)}\n`)
    await persistState()

    const paperSummary = summarise(paperEscalated.outcomes, paperLedger)
    const final = {
      status: paperSummary.can_progress ? 'assured_not_published' : 'whole_paper_assurance_blocked',
      plan_fingerprint: plan.plan_fingerprint,
      reviewed_commit: reviewedCommit,
      paper_fingerprints: Object.fromEntries([...paperArtifacts.entries()].map(([id, artifact]) => [id, fingerprint(artifact)])),
      deterministic,
      unit_summary: unitSummary,
      paper_summary: paperSummary,
      cumulative_spend_usd: state.cumulative_spend_usd,
      pilot_spend_cap_usd: maxSpendUsd,
      provider_calls_this_run: state.new_provider_calls,
      publication_authority: false,
      learner_surface_changed: false,
    }
    await writeFile(SUMMARY_PATH, `${JSON.stringify(final, null, 2)}\n`)
    await writeFile(SUMMARY_MD_PATH, [renderRunSummary('AQA 7132 mock unit assurance', unitRun.outcomes, unitLedger), '', renderRunSummary('AQA 7132 whole-paper assurance', paperEscalated.outcomes, paperLedger), '', `Cumulative mock-stage provider spend: $${state.cumulative_spend_usd.toFixed(4)} / $${maxSpendUsd.toFixed(2)}`, 'Publication remains locked.'].join('\n'))
    expect(final.status).toBe('assured_not_published')
    expect(final.cumulative_spend_usd).toBeLessThanOrEqual(maxSpendUsd)
  }, 5_400_000)
})
