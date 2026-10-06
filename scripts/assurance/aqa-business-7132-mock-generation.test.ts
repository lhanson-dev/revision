import { execFileSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { z, type ZodType } from 'zod'
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
  type UnitOutcome,
} from '../../src/content-factory/fast-path-review'
import { loadBusinessSubjectFoundationCandidate } from '../content-factory/load-business-subject-foundation-candidate-v08.mjs'
import {
  BLIND_UNIT_INSTRUCTIONS,
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
import { MOCK_SET_CHECKLIST, MOCK_SET_REVIEW_INSTRUCTIONS } from './aqa-business-7132-mock-set-review'
import {
  applyFounderFixDecision,
  founderFixFeedbackTargets,
  loadFounderMockResolutions,
} from './aqa-business-7132-mock-founder-resolution'

const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }
const env = runtime.process?.env ?? {}
const liveEnabled = env.CONTENT_FACTORY_AQA_7132_MOCK_GENERATION === '1'
const PLAN_VALIDATOR = 'scripts/assurance/validate-aqa-business-7132-mock-plan.mjs'
const PLAN_PATH = '.artifacts/content-factory-aqa-business-7132-mock-plan/mock-set-plan.json'
const COURSE_TRUTH_PATH = '.artifacts/content-factory-aqa-business-7132-course-exam-truth/course-truth.json'
const FOUNDER_RESOLUTIONS_PATH = 'content-factory/mock-exams/aqa-7132/FOUNDER_ESCALATION_RESOLUTIONS.json'
const OUTPUT = '.artifacts/content-factory-aqa-business-7132-mock-generation'
const STATE_PATH = `${OUTPUT}/generation-state.json`
const UNIT_LEDGER_PATH = `${OUTPUT}/unit-review-ledger.json`
const PAPER_LEDGER_PATH = `${OUTPUT}/paper-review-ledger.json`
const SET_LEDGER_PATH = `${OUTPUT}/set-review-ledger.json`
const SUMMARY_PATH = `${OUTPUT}/summary.json`
const SUMMARY_MD_PATH = `${OUTPUT}/summary.md`
const MOCK_INDEPENDENT_REVIEW_MAX_OUTPUT_TOKENS = 12_000

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

type Stored<T> = { input_fingerprint: string; output: T; provenance: unknown }
type GenerationState = {
  schema_version: 1
  plan_fingerprint: string
  reviewed_commit: string
  cumulative_spend_usd: number
  provider_calls_this_run: number
  contexts: Record<string, Stored<SharedContext>>
  questions: Record<string, Stored<MockQuestion>>
  blind_units: Record<string, Stored<BlindUnit>>
  generation_failures: Record<string, string>
  blind_failures: Record<string, string>
}

async function readState(plan: MockPlan, reviewedCommit: string): Promise<GenerationState> {
  try {
    const parsed = JSON.parse(await readFile(STATE_PATH, 'utf8')) as GenerationState
    if (parsed.schema_version === 1 && parsed.plan_fingerprint === plan.plan_fingerprint) {
      return { ...parsed, reviewed_commit: reviewedCommit, provider_calls_this_run: 0, generation_failures: {}, blind_failures: parsed.blind_failures ?? {} }
    }
  } catch {
    // Fresh run.
  }
  return {
    schema_version: 1,
    plan_fingerprint: plan.plan_fingerprint,
    reviewed_commit: reviewedCommit,
    cumulative_spend_usd: 0,
    provider_calls_this_run: 0,
    contexts: {},
    questions: {},
    blind_units: {},
    generation_failures: {},
    blind_failures: {},
  }
}

function exactIds(actual: string[], expected: string[]) {
  return JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort())
}

const blindProviderAnswerSchema = z.strictObject({
  answer_text: z.string().min(1),
  numbers: z.array(z.strictObject({ label: z.string().min(1), value: z.number() })),
})

type BlindProviderAnswer = z.infer<typeof blindProviderAnswerSchema>

function blindUnitProviderSchemaFor(unit: MockGenerationUnit) {
  if (!unit.slots.length) throw new Error(`mock_blind_unit_has_no_slots:${unit.unit_id}`)
  const answers = Object.fromEntries(unit.slots.map((slot) => [slot.slot_id, blindProviderAnswerSchema])) as Record<string, typeof blindProviderAnswerSchema>
  return z.strictObject({
    unit_id: z.literal(unit.unit_id),
    answers: z.strictObject(answers),
  })
}

function normaliseBlindProviderOutput(unit: MockGenerationUnit, output: unknown): BlindUnit | null {
  const parsed = blindUnitProviderSchemaFor(unit).safeParse(output)
  if (!parsed.success) return null
  const answers = parsed.data.answers as Record<string, BlindProviderAnswer>
  return {
    unit_id: unit.unit_id,
    answers: unit.slots.map((slot) => ({ slot_id: slot.slot_id, ...answers[slot.slot_id] })),
  }
}

function sourceFingerprint(payload: Record<string, unknown>, instructions: string) {
  const stable = structuredClone(payload)
  if ('fix_these' in stable) stable.fix_these = []
  return fingerprint({ payload: stable, instructions, version: MOCK_GENERATION_VERSION })
}

type FeedbackTargets = { slots: Map<string, ClassifiedFinding[]>; broad: ClassifiedFinding[] }
function emptyFeedback(): FeedbackTargets {
  return { slots: new Map(), broad: [] }
}

function mergeFeedback(left: FeedbackTargets, right: FeedbackTargets): FeedbackTargets {
  const slots = new Map<string, ClassifiedFinding[]>()
  for (const source of [left.slots, right.slots]) {
    for (const [id, findings] of source) slots.set(id, [...(slots.get(id) ?? []), ...findings])
  }
  return { slots, broad: [...left.broad, ...right.broad] }
}

function feedbackTargetsForPaper(paper: MockPlanPaper, entry: Ledger['units'][string] | undefined): FeedbackTargets {
  if (!entry || entry.outcome !== 'blocking' || entry.consecutive_blocking_rounds >= 2) return emptyFeedback()
  const slotIds = new Set(paper.slots.map((slot) => slot.slot_id))
  const result = emptyFeedback()
  for (const finding of entry.findings.filter((candidate) => candidate.disposition === 'blocking')) {
    const affected = finding.affected_ids.filter((id) => slotIds.has(id))
    if (!affected.length) result.broad.push(finding)
    for (const id of affected) result.slots.set(id, [...(result.slots.get(id) ?? []), finding])
  }
  return result
}

function feedbackTargetsForSet(plan: MockPlan, entry: Ledger['units'][string] | undefined) {
  const result = new Map(plan.papers.map((paper) => [paper.component_id, emptyFeedback()]))
  if (!entry || entry.outcome !== 'blocking' || entry.consecutive_blocking_rounds >= 2) return result
  const paperIds = new Set(plan.papers.map((paper) => paper.component_id))
  const slotToPaper = new Map(plan.papers.flatMap((paper) => paper.slots.map((slot) => [slot.slot_id, paper.component_id] as const)))
  for (const finding of entry.findings.filter((candidate) => candidate.disposition === 'blocking')) {
    let applied = false
    for (const affected of finding.affected_ids) {
      const slotPaper = slotToPaper.get(affected)
      if (slotPaper) {
        const target = result.get(slotPaper)!
        target.slots.set(affected, [...(target.slots.get(affected) ?? []), finding])
        applied = true
      } else if (paperIds.has(affected as MockPlanPaper['component_id'])) {
        result.get(affected as MockPlanPaper['component_id'])!.broad.push(finding)
        applied = true
      }
    }
    if (!applied) for (const target of result.values()) target.broad.push(finding)
  }
  return result
}

function contextFeedback(unit: MockGenerationUnit, target: FeedbackTargets) {
  return [
    ...target.broad,
    ...unit.slots.flatMap((slot) => (target.slots.get(slot.slot_id) ?? []).filter((finding) => finding.check_id === 'case_stimulus_coherence' || finding.check_id === 'context_coherence')),
  ]
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

function setReviewUnit(input: { plan: MockPlan; paperArtifacts: Map<string, unknown>; evidence: MockEvidence }) {
  const allSlots = input.plan.papers.flatMap((paper) => paper.slots)
  const syntheticUnit: MockGenerationUnit = { unit_id: 'complete-set', component_id: '7132/1', context_policy: 'question_local', slots: allSlots }
  const evidence = unitEvidence(syntheticUnit, input.evidence)
  const payload = {
    unit_id: 'complete-set',
    plan_fingerprint: input.plan.plan_fingerprint,
    papers: input.plan.papers.map((paper) => input.paperArtifacts.get(paper.component_id)),
    sources: evidence.nodes.map((node) => ({ id: node.id, text: { teaching_content: node.teaching_content, quantitative_content: node.quantitative_content } })),
  }
  return {
    unit_id: 'complete-set',
    fingerprint: fingerprint({ payload, checklist: MOCK_SET_CHECKLIST.version }),
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
  const direct = findings.filter((finding) => finding.affected_ids.includes(slotId))
  return direct.length ? direct : findings
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

  it('reserves enough output capacity for the complete Paper 3 blind-answer unit', async () => {
    const plan = await materialisedPlan()
    const unit = buildMockGenerationUnits(plan).find((candidate) => candidate.unit_id === 'P3-CASE-1')!
    expect(unit.slots).toHaveLength(6)
    expect(unit.slots.reduce((sum, slot) => sum + slot.marks, 0)).toBe(100)
    expect(MOCK_INDEPENDENT_REVIEW_MAX_OUTPUT_TOKENS).toBe(12_000)
  })

  it('binds blind-answer structured output to the exact unit identity and planned slot set', async () => {
    const plan = await materialisedPlan()
    const unit = buildMockGenerationUnits(plan).find((candidate) => candidate.unit_id === 'P1-A-CHUNK-2')!
    const schema = blindUnitProviderSchemaFor(unit)
    const answers = Object.fromEntries(unit.slots.map((slot) => [slot.slot_id, { answer_text: `Answer for ${slot.slot_id}`, numbers: [] }]))
    const exact = { unit_id: unit.unit_id, answers }
    expect(schema.safeParse(exact).success).toBe(true)
    expect(schema.safeParse({ ...exact, unit_id: 'wrong-unit' }).success).toBe(false)
    const missing = { ...answers }
    delete missing[unit.slots[0].slot_id]
    expect(schema.safeParse({ unit_id: unit.unit_id, answers: missing }).success).toBe(false)
    expect(schema.safeParse({ unit_id: unit.unit_id, answers: { ...answers, invented_slot: { answer_text: 'No', numbers: [] } } }).success).toBe(false)
    expect(normaliseBlindProviderOutput(unit, exact)?.answers.map((answer) => answer.slot_id)).toEqual(unit.slots.map((slot) => slot.slot_id))
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
      context: 'A manufacturer is comparing output data.',
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
    expect(detectNearDuplicates([base, copy])).toHaveLength(1)
  })

  it('keeps remediation notes out of durable source fingerprints', async () => {
    const plan = await materialisedPlan()
    const paper = paperFor(plan, '7132/1')
    const slot = paper.slots.find((candidate) => candidate.slot_id === 'P1-A-01')!
    const evidence: MockEvidence = { requirements: new Map(), nodes: new Map() }
    for (const id of slot.required_course_truth_requirement_ids) evidence.requirements.set(id, { requirement_id: id, mapped_subject_node_ids: slot.required_subject_node_ids })
    for (const id of slot.required_subject_node_ids) evidence.nodes.set(id, { subject_id: id })
    const clean = questionGenerationPayload(plan, paper, slot, evidence, undefined, [])
    const feedback: ClassifiedFinding = { check_id: 'question_validity', category: 'broken_question', affected_ids: [slot.slot_id], finding: 'fix it', evidence: 'review', contradicting_source_id: null, proposed_fix: 'repair', disposition: 'blocking', reason: 'failed question_validity' }
    const remediate = questionGenerationPayload(plan, paper, slot, evidence, undefined, [feedback])
    expect(sourceFingerprint(clean, MOCK_QUESTION_GENERATION_INSTRUCTIONS)).toBe(sourceFingerprint(remediate, MOCK_QUESTION_GENERATION_INSTRUCTIONS))
  })

  const liveIt = liveEnabled ? it : it.skip

  liveIt('generates, blind-answers, reviews and whole-set assures the exact planned mock under the cumulative pilot cap', async () => {
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
    const sourceRows = new Map<string, string[]>()
    for (const row of candidate.matrix.nodes as Array<{ subject_id: string; subject_truth_sources?: string[] }>) sourceRows.set(row.subject_id, row.subject_truth_sources ?? [])
    const nodes = new Map<string, { subject_id: string; title?: string | null; teaching_content?: unknown; quantitative_content?: unknown; source_ids?: string[] }>()
    for (const [id, value] of candidate.nodes as Map<string, Record<string, unknown>>) {
      nodes.set(id, { subject_id: id, title: typeof value.title === 'string' ? value.title : id, teaching_content: value.teaching_content, quantitative_content: value.quantitative_content, source_ids: sourceRows.get(id) ?? [] })
    }
    const evidence: MockEvidence = { requirements: new Map(courseTruth.requirements.map((requirement) => [requirement.requirement_id, requirement])), nodes }

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
      independentReview: model(MOCK_INDEPENDENT_REVIEW_MAX_OUTPUT_TOKENS, 'high'),
      maxRetries: 0,
    })

    const persistState = async () => {
      state.cumulative_spend_usd = Number((openingSpend + client.budgetSnapshot().conservativeConsumedUsd).toFixed(8))
      await writeFile(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`)
    }

    const providerOnce = async (input: { workerId: string; routeKind: 'generation' | 'independent_review'; outputSchema: ZodType; instructions: string; payload: unknown }) => {
      const execution = await client.run({ ...input, contractVersion: MOCK_GENERATION_VERSION, strictOutput: true })
      state.provider_calls_this_run += 1
      await persistState()
      if (execution.status !== 'success' && 'error' in execution && execution.error.includes('content_factory_spend_ceiling_reached')) throw new Error(execution.error)
      return execution
    }

    const units = buildMockGenerationUnits(plan)
    let unitLedger = await readLedger(UNIT_LEDGER_PATH, MOCK_QUESTION_CHECKLIST.stage, MOCK_QUESTION_CHECKLIST.version)
    let paperLedger = await readLedger(PAPER_LEDGER_PATH, MOCK_PAPER_CHECKLIST.stage, MOCK_PAPER_CHECKLIST.version)
    let setLedger = await readLedger(SET_LEDGER_PATH, MOCK_SET_CHECKLIST.stage, MOCK_SET_CHECKLIST.version)
    const setFeedback = feedbackTargetsForSet(plan, setLedger.units['complete-set'])
    const founderResolutions = await loadFounderMockResolutions(FOUNDER_RESOLUTIONS_PATH)
    const retainedQuestions = new Map<string, MockQuestion>()
    for (const [slotId, retained] of Object.entries(state.questions)) {
      const parsed = mockQuestionSchema.safeParse(retained.output)
      if (parsed.success) retainedQuestions.set(slotId, parsed.data)
    }
    const founderFeedback = new Map(plan.papers.map((paper) => {
      const target = emptyFeedback()
      for (const [slotId, findings] of founderFixFeedbackTargets(plan, paper, paperLedger.units[paper.component_id], founderResolutions, retainedQuestions)) target.slots.set(slotId, findings)
      return [paper.component_id, target] as const
    }))
    const priorFeedback = new Map(plan.papers.map((paper) => [
      paper.component_id,
      mergeFeedback(
        mergeFeedback(feedbackTargetsForPaper(paper, paperLedger.units[paper.component_id]), setFeedback.get(paper.component_id)!),
        founderFeedback.get(paper.component_id)!,
      ),
    ]))

    const contexts = new Map<string, SharedContext>()
    const questions = new Map<string, MockQuestion>()

    const generateContext = async (unit: MockGenerationUnit, feedback: ClassifiedFinding[]) => {
      const cleanPayload = contextGenerationPayload(plan, unit, evidence, [])
      const stableFingerprint = sourceFingerprint(cleanPayload, SHARED_CONTEXT_GENERATION_INSTRUCTIONS)
      const retained = state.contexts[unit.unit_id]
      if (!feedback.length && retained?.input_fingerprint === stableFingerprint) {
        const parsed = sharedContextSchema.safeParse(retained.output)
        if (parsed.success && parsed.data.unit_id === unit.unit_id) return parsed.data
      }
      let lastError = 'no valid context candidate'
      for (let attempt = 1; attempt <= 3; attempt++) {
        const payload = contextGenerationPayload(plan, unit, evidence, feedback)
        const execution = await providerOnce({ workerId: `content-factory.aqa-7132.mock-context.${unit.unit_id.toLowerCase()}`, routeKind: 'generation', outputSchema: sharedContextSchema, instructions: SHARED_CONTEXT_GENERATION_INSTRUCTIONS, payload })
        if (execution.status !== 'success') { lastError = 'error' in execution ? execution.error : execution.status; continue }
        const parsed = sharedContextSchema.safeParse(execution.output)
        if (!parsed.success || parsed.data.unit_id !== unit.unit_id) { lastError = 'invalid context output'; continue }
        if (feedback.length && retained && fingerprint(parsed.data) === fingerprint(retained.output)) { lastError = 'remediation returned unchanged context'; continue }
        state.contexts[unit.unit_id] = { input_fingerprint: stableFingerprint, output: parsed.data, provenance: execution.provenance }
        await writeFile(`${OUTPUT}/contexts/${unit.unit_id}.json`, `${JSON.stringify(parsed.data, null, 2)}\n`)
        await persistState()
        return parsed.data
      }
      throw new Error(`mock_context_generation_failed:${unit.unit_id}:${lastError}`)
    }

    for (const unit of units.filter((candidateUnit) => candidateUnit.context_policy === 'shared')) {
      const feedback = contextFeedback(unit, priorFeedback.get(unit.component_id)!)
      contexts.set(unit.unit_id, await generateContext(unit, feedback))
    }

    const generateQuestion = async (paper: MockPlanPaper, slot: MockPlanSlot, sharedContext: SharedContext | undefined, feedback: ClassifiedFinding[]) => {
      const cleanPayload = questionGenerationPayload(plan, paper, slot, evidence, sharedContext, [])
      const stableFingerprint = sourceFingerprint(cleanPayload, MOCK_QUESTION_GENERATION_INSTRUCTIONS)
      const retained = state.questions[slot.slot_id]
      if (!feedback.length && retained?.input_fingerprint === stableFingerprint) {
        const parsed = mockQuestionSchema.safeParse(retained.output)
        if (parsed.success && validateMockQuestion(parsed.data, paper, slot, sharedContext).length === 0) return parsed.data
      }
      let feedbackNow = [...feedback]
      let lastError = 'no valid question candidate'
      for (let attempt = 1; attempt <= 3; attempt++) {
        const payload = questionGenerationPayload(plan, paper, slot, evidence, sharedContext, feedbackNow)
        const execution = await providerOnce({ workerId: `content-factory.aqa-7132.mock-question.${slot.slot_id.toLowerCase()}`, routeKind: 'generation', outputSchema: mockQuestionSchema, instructions: MOCK_QUESTION_GENERATION_INSTRUCTIONS, payload })
        if (execution.status !== 'success') { lastError = 'error' in execution ? execution.error : execution.status; continue }
        const parsed = mockQuestionSchema.safeParse(execution.output)
        if (!parsed.success) { lastError = 'mock question schema parse failed'; continue }
        const software = validateMockQuestion(parsed.data, paper, slot, sharedContext)
        if (software.length) { lastError = software.map((finding) => finding.finding).join('; '); feedbackNow = [...feedback, ...software]; continue }
        if (feedback.length && retained && fingerprint(parsed.data) === fingerprint(retained.output)) { lastError = 'remediation returned unchanged question'; continue }
        state.questions[slot.slot_id] = { input_fingerprint: stableFingerprint, output: parsed.data, provenance: execution.provenance }
        delete state.generation_failures[slot.slot_id]
        await writeFile(`${OUTPUT}/questions/${slot.slot_id}.json`, `${JSON.stringify(parsed.data, null, 2)}\n`)
        await persistState()
        return parsed.data
      }
      state.generation_failures[slot.slot_id] = lastError
      await persistState()
      return null
    }

    const generateQuestions = async (slotFeedback: Map<string, ClassifiedFinding[]>) => {
      for (const paper of plan.papers) {
        for (const slot of paper.slots) {
          const unit = sharedUnitForSlot(units, slot.slot_id)
          const shared = unit?.context_policy === 'shared' ? contexts.get(unit.unit_id) : undefined
          const generated = await generateQuestion(paper, slot, shared, slotFeedback.get(slot.slot_id) ?? [])
          if (generated) questions.set(slot.slot_id, generated)
        }
      }
    }

    const initialSlotFeedback = new Map<string, ClassifiedFinding[]>()
    for (const paper of plan.papers) {
      const feedback = priorFeedback.get(paper.component_id)!
      for (const slot of paper.slots) initialSlotFeedback.set(slot.slot_id, [...feedback.broad, ...(feedback.slots.get(slot.slot_id) ?? [])])
    }
    await generateQuestions(initialSlotFeedback)

    const allSlotIds = plan.papers.flatMap((paper) => paper.slots.map((slot) => slot.slot_id))
    const missingAfterGeneration = allSlotIds.filter((id) => !questions.has(id))
    if (missingAfterGeneration.length) {
      await writeFile(SUMMARY_PATH, `${JSON.stringify({ status: 'generation_incomplete', plan_fingerprint: plan.plan_fingerprint, missing_slots: missingAfterGeneration, failures: state.generation_failures, cumulative_spend_usd: state.cumulative_spend_usd, provider_calls_this_run: state.provider_calls_this_run }, null, 2)}\n`)
      throw new Error(`mock_generation_incomplete:${missingAfterGeneration.join(',')}`)
    }

    const answerUnitBlind = async (unit: MockGenerationUnit) => {
      const unitQuestions = unit.slots.map((slot) => questions.get(slot.slot_id)!)
      const context = unit.context_policy === 'shared' ? contexts.get(unit.unit_id) : undefined
      const payload = blindUnitPayload(unit, unitQuestions, context)
      const stableFingerprint = fingerprint({ payload, instructions: BLIND_UNIT_INSTRUCTIONS, version: MOCK_GENERATION_VERSION })
      const retained = state.blind_units[unit.unit_id]
      if (retained?.input_fingerprint === stableFingerprint) {
        const parsed = blindUnitSchema.safeParse(retained.output)
        if (parsed.success && parsed.data.unit_id === unit.unit_id && exactIds(parsed.data.answers.map((answer) => answer.slot_id), unit.slots.map((slot) => slot.slot_id))) {
          delete state.blind_failures[unit.unit_id]
          return parsed.data
        }
      }
      const providerSchema = blindUnitProviderSchemaFor(unit)
      let lastError = 'no valid blind answer'
      for (let attempt = 1; attempt <= 3; attempt++) {
        const execution = await providerOnce({ workerId: `content-factory.aqa-7132.mock-blind.${unit.unit_id.toLowerCase()}`, routeKind: 'independent_review', outputSchema: providerSchema, instructions: BLIND_UNIT_INSTRUCTIONS, payload })
        if (execution.status !== 'success') { lastError = 'error' in execution ? execution.error : execution.status; continue }
        const output = normaliseBlindProviderOutput(unit, execution.output)
        if (!output) { lastError = 'blind answer exact-slot schema mismatch'; continue }
        state.blind_units[unit.unit_id] = { input_fingerprint: stableFingerprint, output, provenance: execution.provenance }
        delete state.blind_failures[unit.unit_id]
        await writeFile(`${OUTPUT}/blind-units/${unit.unit_id}.json`, `${JSON.stringify(output, null, 2)}\n`)
        await persistState()
        return output
      }
      state.blind_failures[unit.unit_id] = lastError
      await persistState()
      return null
    }

    const blindByUnit = new Map<string, BlindUnit>()
    for (const unit of units) {
      const blind = await answerUnitBlind(unit)
      if (blind) blindByUnit.set(unit.unit_id, blind)
    }
    const missingBlindUnits = units.map((unit) => unit.unit_id).filter((id) => !blindByUnit.has(id))
    if (missingBlindUnits.length) {
      await writeFile(SUMMARY_PATH, `${JSON.stringify({ status: 'blind_answer_incomplete', plan_fingerprint: plan.plan_fingerprint, completed_blind_units: [...blindByUnit.keys()], missing_blind_units: missingBlindUnits, failures: state.blind_failures, cumulative_spend_usd: state.cumulative_spend_usd, provider_calls_this_run: state.provider_calls_this_run, publication_authority: false }, null, 2)}\n`)
      throw new Error(`mock_blind_answer_incomplete:${missingBlindUnits.join(',')}`)
    }

    const buildReviewUnits = () => units.map((unit) => reviewUnit({ plan, unit, questions: unit.slots.map((slot) => questions.get(slot.slot_id)!), blind: blindByUnit.get(unit.unit_id)!, context: contexts.get(unit.unit_id), evidence }))
    const unitReviewSchema = reviewOutputSchema(MOCK_QUESTION_CHECKLIST)
    const unitReviewInstructions = `${MOCK_UNIT_REVIEW_INSTRUCTIONS}\n${checklistInstructions(MOCK_QUESTION_CHECKLIST)}`
    const reviewOneUnit = async (unit: ReturnType<typeof reviewUnit>) => {
      const execution = await providerOnce({ workerId: `content-factory.aqa-7132.mock-unit-review.${unit.unit_id.toLowerCase()}`, routeKind: 'independent_review', outputSchema: unitReviewSchema, instructions: unitReviewInstructions, payload: unit.payload })
      return execution.status === 'success' ? { ok: true as const, output: execution.output } : { ok: false as const, error: 'error' in execution ? execution.error : execution.status }
    }

    let unitRun = await runReviewUnits({ units: buildReviewUnits(), ledger: unitLedger, checklist: MOCK_QUESTION_CHECKLIST, knownSourceIds: (unit) => unit.sourceIds, concurrency: 1, review: reviewOneUnit })
    unitLedger = unitRun.ledger
    const blockedUnits = unitRun.outcomes.filter((outcome) => outcome.status === 'blocking')
    if (blockedUnits.length) {
      const remediationSlots = new Map<string, ClassifiedFinding[]>()
      const contextRepairs = new Map<string, ClassifiedFinding[]>()
      for (const outcome of blockedUnits) {
        const unit = units.find((candidateUnit) => candidateUnit.unit_id === outcome.unit_id)!
        const contextIssues = outcome.findings.filter((finding) => finding.check_id === 'context_coherence')
        if (unit.context_policy === 'shared' && contextIssues.length) contextRepairs.set(unit.unit_id, contextIssues)
        for (const slot of unit.slots) remediationSlots.set(slot.slot_id, feedbackForSlot(outcome.findings, slot.slot_id))
      }
      for (const [unitId, feedback] of contextRepairs) {
        const unit = units.find((candidateUnit) => candidateUnit.unit_id === unitId)!
        contexts.set(unitId, await generateContext(unit, feedback))
      }
      await generateQuestions(remediationSlots)
      for (const outcome of blockedUnits) {
        const unit = units.find((candidateUnit) => candidateUnit.unit_id === outcome.unit_id)!
        const blind = await answerUnitBlind(unit)
        if (blind) blindByUnit.set(unit.unit_id, blind)
        else blindByUnit.delete(unit.unit_id)
      }
      const missingRemediatedBlindUnits = blockedUnits.map((outcome) => outcome.unit_id).filter((id) => !blindByUnit.has(id))
      if (missingRemediatedBlindUnits.length) {
        await writeFile(SUMMARY_PATH, `${JSON.stringify({ status: 'blind_answer_incomplete', plan_fingerprint: plan.plan_fingerprint, completed_blind_units: [...blindByUnit.keys()], missing_blind_units: missingRemediatedBlindUnits, failures: state.blind_failures, cumulative_spend_usd: state.cumulative_spend_usd, provider_calls_this_run: state.provider_calls_this_run, publication_authority: false }, null, 2)}\n`)
        throw new Error(`mock_blind_answer_incomplete:${missingRemediatedBlindUnits.join(',')}`)
      }

      const retryIds = new Set(blockedUnits.map((outcome) => outcome.unit_id))
      const rebuilt = buildReviewUnits().filter((unit) => retryIds.has(unit.unit_id))
      const unchanged: UnitOutcome[] = []
      const changed = [] as ReturnType<typeof reviewUnit>[]
      for (const unit of rebuilt) {
        const previous = unitLedger.units[unit.unit_id]
        if (previous?.outcome === 'blocking' && previous.fingerprint === unit.fingerprint) {
          unitLedger.units[unit.unit_id] = { ...previous, outcome: 'escalated' }
          unchanged.push({ unit_id: unit.unit_id, status: 'escalated', findings: previous.findings })
        } else changed.push(unit)
      }
      const second = changed.length
        ? await runReviewUnits({ units: changed, ledger: unitLedger, checklist: MOCK_QUESTION_CHECKLIST, knownSourceIds: (unit) => unit.sourceIds, concurrency: 1, review: reviewOneUnit })
        : { outcomes: [] as UnitOutcome[], ledger: unitLedger }
      unitLedger = second.ledger
      const combined = [...unitRun.outcomes.filter((outcome) => !retryIds.has(outcome.unit_id)), ...unchanged, ...second.outcomes].sort((a, b) => a.unit_id.localeCompare(b.unit_id))
      const escalated = escalateRoundTwo(combined, unitLedger)
      unitLedger = escalated.ledger
      unitRun = { ...unitRun, outcomes: escalated.outcomes, ledger: unitLedger }
    }
    await writeFile(UNIT_LEDGER_PATH, `${JSON.stringify(unitLedger, null, 2)}\n`)

    const unitSummary = summarise(unitRun.outcomes, unitLedger)
    if (!unitSummary.can_progress) {
      await persistState()
      await writeFile(SUMMARY_PATH, `${JSON.stringify({ status: 'unit_assurance_blocked', plan_fingerprint: plan.plan_fingerprint, unit_summary: unitSummary, cumulative_spend_usd: state.cumulative_spend_usd, provider_calls_this_run: state.provider_calls_this_run, publication_authority: false }, null, 2)}\n`)
      await writeFile(SUMMARY_MD_PATH, renderRunSummary('AQA 7132 mock unit assurance', unitRun.outcomes, unitLedger))
      throw new Error('mock_generation_unit_assurance_cannot_progress')
    }

    const deterministic = validateAssembledSet(plan, questions, contexts)
    if (deterministic.findings.length) {
      await writeFile(SUMMARY_PATH, `${JSON.stringify({ status: 'whole_set_software_blocked', plan_fingerprint: plan.plan_fingerprint, deterministic, cumulative_spend_usd: state.cumulative_spend_usd, provider_calls_this_run: state.provider_calls_this_run, publication_authority: false }, null, 2)}\n`)
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
    for (const paperUnit of paperUnits) {
      const paper = paperFor(plan, paperUnit.unit_id as MockPlanPaper['component_id'])
      const applied = applyFounderFixDecision({
        plan,
        paper,
        paperFingerprint: paperUnit.fingerprint,
        questions,
        ledger: paperLedger,
        resolutions: founderResolutions,
      })
      paperLedger = applied.ledger
    }
    const reviewPaper = async (unit: ReturnType<typeof paperReviewUnit>) => {
      const execution = await providerOnce({ workerId: `content-factory.aqa-7132.mock-paper-review.${unit.unit_id.replace('/', '-').toLowerCase()}`, routeKind: 'independent_review', outputSchema: paperReviewSchema, instructions: paperReviewInstructions, payload: unit.payload })
      return execution.status === 'success' ? { ok: true as const, output: execution.output } : { ok: false as const, error: 'error' in execution ? execution.error : execution.status }
    }
    let paperRun = await runReviewUnits({ units: paperUnits, ledger: paperLedger, checklist: MOCK_PAPER_CHECKLIST, knownSourceIds: (unit) => unit.sourceIds, concurrency: 1, review: reviewPaper })
    paperLedger = paperRun.ledger
    const paperEscalated = escalateRoundTwo(paperRun.outcomes, paperLedger)
    paperLedger = paperEscalated.ledger
    paperRun = { ...paperRun, outcomes: paperEscalated.outcomes, ledger: paperLedger }
    await writeFile(PAPER_LEDGER_PATH, `${JSON.stringify(paperLedger, null, 2)}\n`)

    const paperSummary = summarise(paperRun.outcomes, paperLedger)
    if (!paperSummary.can_progress) {
      await persistState()
      await writeFile(SUMMARY_PATH, `${JSON.stringify({ status: 'whole_paper_assurance_blocked', plan_fingerprint: plan.plan_fingerprint, deterministic, unit_summary: unitSummary, paper_summary: paperSummary, cumulative_spend_usd: state.cumulative_spend_usd, provider_calls_this_run: state.provider_calls_this_run, publication_authority: false }, null, 2)}\n`)
      await writeFile(SUMMARY_MD_PATH, [renderRunSummary('AQA 7132 mock unit assurance', unitRun.outcomes, unitLedger), '', renderRunSummary('AQA 7132 whole-paper assurance', paperRun.outcomes, paperLedger)].join('\n'))
      throw new Error('mock_generation_whole_paper_assurance_cannot_progress')
    }

    const setUnit = setReviewUnit({ plan, paperArtifacts, evidence })
    const setReviewSchema = reviewOutputSchema(MOCK_SET_CHECKLIST)
    const setReviewInstructions = `${MOCK_SET_REVIEW_INSTRUCTIONS}\n${checklistInstructions(MOCK_SET_CHECKLIST)}`
    const reviewSet = async (unit: typeof setUnit) => {
      const execution = await providerOnce({ workerId: 'content-factory.aqa-7132.mock-set-review', routeKind: 'independent_review', outputSchema: setReviewSchema, instructions: setReviewInstructions, payload: unit.payload })
      return execution.status === 'success' ? { ok: true as const, output: execution.output } : { ok: false as const, error: 'error' in execution ? execution.error : execution.status }
    }
    let setRun = await runReviewUnits({ units: [setUnit], ledger: setLedger, checklist: MOCK_SET_CHECKLIST, knownSourceIds: (unit) => unit.sourceIds, concurrency: 1, review: reviewSet })
    setLedger = setRun.ledger
    const setEscalated = escalateRoundTwo(setRun.outcomes, setLedger)
    setLedger = setEscalated.ledger
    setRun = { ...setRun, outcomes: setEscalated.outcomes, ledger: setLedger }
    await writeFile(SET_LEDGER_PATH, `${JSON.stringify(setLedger, null, 2)}\n`)
    await persistState()

    const setSummary = summarise(setRun.outcomes, setLedger)
    const final = {
      status: setSummary.can_progress ? 'assured_not_published' : 'whole_set_assurance_blocked',
      plan_fingerprint: plan.plan_fingerprint,
      reviewed_commit: reviewedCommit,
      paper_fingerprints: Object.fromEntries([...paperArtifacts.entries()].map(([id, artifact]) => [id, fingerprint(artifact)])),
      deterministic,
      unit_summary: unitSummary,
      paper_summary: paperSummary,
      set_summary: setSummary,
      cumulative_spend_usd: state.cumulative_spend_usd,
      pilot_spend_cap_usd: maxSpendUsd,
      provider_calls_this_run: state.provider_calls_this_run,
      publication_authority: false,
      learner_surface_changed: false,
    }
    await writeFile(SUMMARY_PATH, `${JSON.stringify(final, null, 2)}\n`)
    await writeFile(SUMMARY_MD_PATH, [
      renderRunSummary('AQA 7132 mock unit assurance', unitRun.outcomes, unitLedger),
      '',
      renderRunSummary('AQA 7132 whole-paper assurance', paperRun.outcomes, paperLedger),
      '',
      renderRunSummary('AQA 7132 whole-set assurance', setRun.outcomes, setLedger),
      '',
      `Cumulative mock-stage provider spend: $${state.cumulative_spend_usd.toFixed(4)} / $${maxSpendUsd.toFixed(2)}`,
      'Publication remains locked.',
    ].join('\n'))
    expect(final.status).toBe('assured_not_published')
    expect(final.cumulative_spend_usd).toBeLessThanOrEqual(maxSpendUsd)
  }, 5_400_000)
})