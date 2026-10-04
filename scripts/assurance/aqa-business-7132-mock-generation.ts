import { createHash } from 'node:crypto'
import { z } from 'zod'
import type { Checklist, ClassifiedFinding } from '../../src/content-factory/fast-path-review'
import { numbersIn } from './aqa-business-7132-slice-questions'

export const MOCK_GENERATION_STAGE = 'aqa-7132-mock-generation'
export const MOCK_GENERATION_VERSION = 'mock-generation-v1'

export const MOCK_QUESTION_CHECKLIST: Checklist = {
  stage: MOCK_GENERATION_STAGE,
  version: MOCK_GENERATION_VERSION,
  checks: [
    { id: 'question_validity', question: 'Does every question directly test the planned Course Truth target at the stated command level, without giving the answer away?' },
    { id: 'answer_reconstruction', question: 'Compare the blind answers with the mark schemes. Where a blind answer is reasonable, would it receive the marks implied by the scheme without contradiction or hidden requirements?' },
    { id: 'mark_scheme_validity', question: 'Do the mark schemes credit only what the questions demand, accept legitimate alternatives, and use point or level treatment appropriately?' },
    { id: 'factual_accuracy', question: 'Are the business facts, formula choices, causal claims and interpretations correct against the supplied Foundation evidence?', requiresContradictingSource: true },
    { id: 'context_coherence', question: 'Is the supplied context internally coherent and sufficient for every linked question, without disclosing the answers?' },
    { id: 'exam_authenticity', question: 'Would these Revision-authored questions sit naturally in an AQA A-level Business paper for their marks, command words and response forms without copying protected assessment content?' },
  ],
}

export const MOCK_PAPER_CHECKLIST: Checklist = {
  stage: 'aqa-7132-mock-whole-paper',
  version: 'mock-whole-paper-v1',
  checks: [
    { id: 'question_and_mark_scheme_validity', question: 'Taken together, are the paper questions and mark schemes valid, answerable and mutually consistent?' },
    { id: 'factual_accuracy', question: 'Are the paper facts, calculations, business relationships and interpretations correct against the supplied Foundation evidence?', requiresContradictingSource: true },
    { id: 'case_stimulus_coherence', question: 'Are shared stimuli, datasets and business facts coherent across all linked questions without conflicts or accidental answer disclosure?' },
    { id: 'progression_and_difficulty', question: 'Does difficulty and response demand vary realistically across the paper rather than following an artificial single progression?' },
    { id: 'timing_realism', question: 'Could a prepared A-level Business student reasonably complete the required response path within 120 minutes?' },
    { id: 'command_tariff_realism', question: 'Are command words, tariffs and response forms realistic for this assessment model?' },
    { id: 'quantitative_balance', question: 'Is the quantitative demand appropriately integrated rather than tokenistic or concentrated in an implausible way?' },
    { id: 'synoptic_validity', question: 'Where questions are synoptic, are all named targets genuinely required for a full-mark response rather than merely mentioned?' },
    { id: 'breadth', question: 'Does the paper have credible breadth across the course without being driven by easiest-to-generate topics?' },
    { id: 'cross_question_duplication', question: 'Are questions meaningfully distinct, with no semantic repeats that make the paper feel duplicated?' },
    { id: 'assessment_model_resemblance', question: 'Does the paper resemble the approved AQA assessment model while remaining clearly original Revision-authored work?' },
    { id: 'rights_originality', question: 'Is there no sign of quoted or closely paraphrased AQA question, case, dataset or mark-scheme wording?' },
  ],
}

const aoMarksSchema = z.object({
  AO1: z.number().int().min(0),
  AO2: z.number().int().min(0),
  AO3: z.number().int().min(0),
  AO4: z.number().int().min(0),
})

const tableSchema = z.object({
  title: z.string(),
  columns: z.array(z.string()),
  rows: z.array(z.object({ cells: z.array(z.string()) })),
})

const calculationSchema = z.object({
  label: z.string().min(1),
  method: z.enum(['sum', 'difference', 'product', 'quotient', 'percent_of', 'percent_change']),
  operands: z.array(z.number()).min(1),
  stated_answer: z.number(),
  unit: z.string().min(1),
  marks_supported: z.number().int().min(0),
})

export const mockQuestionSchema = z.object({
  slot_id: z.string().min(1),
  family: z.enum(['MCQ', 'SHORT_ANSWER', 'DATA_RESPONSE', 'CASE_STUDY', 'ESSAY']),
  command_word: z.string().min(1),
  marks: z.number().int().min(1),
  ao_marks: aoMarksSchema,
  context: z.string(),
  stem: z.string().min(1),
  table: tableSchema.nullable(),
  options: z.array(z.object({ label: z.string().min(1), text: z.string().min(1) })),
  mark_scheme: z.object({
    type: z.enum(['single_option', 'points', 'levels']),
    correct_option: z.string(),
    option_rationale: z.array(z.string()),
    points: z.array(z.object({ marks: z.number().int().min(1), descriptor: z.string().min(1), accept: z.array(z.string()) })),
    levels: z.array(z.object({ level: z.number().int().min(1), min_marks: z.number().int().min(1), max_marks: z.number().int().min(1), descriptor: z.string().min(1) })),
    indicative_content: z.array(z.string()),
    model_answer: z.string().min(1),
  }),
  calculations: z.array(calculationSchema),
})
export type MockQuestion = z.infer<typeof mockQuestionSchema>

export const sharedContextSchema = z.object({
  unit_id: z.string().min(1),
  title: z.string().min(1),
  business_name: z.string().min(1),
  narrative: z.string().min(1),
  table: tableSchema.nullable(),
})
export type SharedContext = z.infer<typeof sharedContextSchema>

export const blindUnitSchema = z.object({
  unit_id: z.string().min(1),
  answers: z.array(z.object({
    slot_id: z.string().min(1),
    answer_text: z.string().min(1),
    numbers: z.array(z.object({ label: z.string().min(1), value: z.number() })),
  })).min(1),
})
export type BlindUnit = z.infer<typeof blindUnitSchema>

export type MockPlanSlot = {
  slot_id: string
  marks: number
  command_category: string
  ao_marks: { AO1: number; AO2: number; AO3: number; AO4: number }
  quantitative_marks: number
  context_id: string | null
  context_owner: 'slot' | 'set' | 'paper' | null
  section_id: string | null
  choice_group: string | null
  required_in_response_path: boolean
  required_course_truth_requirement_ids: string[]
  required_subject_node_ids: string[]
  coverage_evidence_rule: string
}

export type MockPlanPaper = {
  component_id: '7132/1' | '7132/2' | '7132/3'
  name: string
  duration_minutes: number
  attempted_raw_marks: number
  printed_raw_marks: number
  slots: MockPlanSlot[]
}

export type MockPlan = {
  schema_version: 1
  plan_id: string
  status: string
  plan_fingerprint: string
  course_id: string
  exam_year: number
  papers: MockPlanPaper[]
  generation_gate: { provider_spend_allowed: boolean; unlock_condition: string; pilot_new_provider_spend_cap_usd: number }
  quantitative: { minimum_required_marks: number; planned_marks_before_choice_path_validation: number; path_validation_required: boolean }
  rights_boundary: Record<string, unknown>
}

export type CourseTruthRequirement = {
  requirement_id: string
  section_id?: string
  title?: string
  rights_safe_requirement_summary?: string
  course_specific_named_items?: string[]
  calculation_obligations?: string[]
  mapped_subject_node_ids: string[]
  [key: string]: unknown
}

export type MockGenerationUnit = {
  unit_id: string
  component_id: MockPlanPaper['component_id']
  context_policy: 'question_local' | 'shared'
  slots: MockPlanSlot[]
}

export type MockEvidence = {
  requirements: Map<string, CourseTruthRequirement>
  nodes: Map<string, { subject_id: string; title?: string | null; teaching_content?: unknown; quantitative_content?: unknown; source_ids?: string[] }>
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.keys(value as Record<string, unknown>).sort().map((key) => [key, canonical((value as Record<string, unknown>)[key])]))
}

export function fingerprint(value: unknown) {
  return createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex')
}

function chunks<T>(values: T[], size: number) {
  const result: T[][] = []
  for (let index = 0; index < values.length; index += size) result.push(values.slice(index, index + size))
  return result
}

export function buildMockGenerationUnits(plan: MockPlan): MockGenerationUnit[] {
  const paper1 = plan.papers.find((paper) => paper.component_id === '7132/1')
  const paper2 = plan.papers.find((paper) => paper.component_id === '7132/2')
  const paper3 = plan.papers.find((paper) => paper.component_id === '7132/3')
  if (!paper1 || !paper2 || !paper3) throw new Error('mock_generation_plan_missing_required_paper')

  const units: MockGenerationUnit[] = []
  chunks(paper1.slots.filter((slot) => slot.section_id === 'A'), 5).forEach((slots, index) => units.push({ unit_id: `P1-A-CHUNK-${index + 1}`, component_id: '7132/1', context_policy: 'question_local', slots }))
  chunks(paper1.slots.filter((slot) => slot.section_id === 'B'), 3).forEach((slots, index) => units.push({ unit_id: `P1-B-CHUNK-${index + 1}`, component_id: '7132/1', context_policy: 'question_local', slots }))
  paper1.slots.filter((slot) => ['C', 'D'].includes(slot.section_id ?? '')).forEach((slot) => units.push({ unit_id: slot.slot_id, component_id: '7132/1', context_policy: 'question_local', slots: [slot] }))

  for (const contextId of [...new Set(paper2.slots.map((slot) => slot.context_id).filter((value): value is string => Boolean(value)))]) {
    units.push({ unit_id: contextId, component_id: '7132/2', context_policy: 'shared', slots: paper2.slots.filter((slot) => slot.context_id === contextId) })
  }
  units.push({ unit_id: 'P3-CASE-1', component_id: '7132/3', context_policy: 'shared', slots: [...paper3.slots] })
  return units
}

export function expectedFamily(componentId: MockPlanPaper['component_id'], slot: MockPlanSlot): MockQuestion['family'] {
  if (componentId === '7132/1') {
    if (slot.section_id === 'A') return 'MCQ'
    if (slot.section_id === 'B') return 'SHORT_ANSWER'
    return 'ESSAY'
  }
  return componentId === '7132/2' ? 'DATA_RESPONSE' : 'CASE_STUDY'
}

export function expectedCommand(slot: MockPlanSlot) {
  const map: Record<string, string> = {
    selected_response: 'Select',
    calculate: 'Calculate',
    describe: 'Describe',
    explain: 'Explain',
    analyse: 'Analyse',
    evaluate: 'Evaluate',
    extended_evaluation: 'Evaluate',
  }
  const command = map[slot.command_category]
  if (!command) throw new Error(`mock_generation_unknown_command_category:${slot.command_category}`)
  return command
}

function softwareFinding(checkId: string, affected: string[], finding: string, fix: string): ClassifiedFinding {
  return { check_id: checkId, category: 'broken_question', affected_ids: affected, finding, evidence: 'software check', contradicting_source_id: null, proposed_fix: fix, disposition: 'blocking', reason: `software-proven: ${finding}` }
}

function near(left: number, right: number) {
  return Math.abs(left - right) <= Math.max(0.051, Math.abs(right) * 0.001)
}

function calculationResult(calc: MockQuestion['calculations'][number]) {
  const values = calc.operands
  switch (calc.method) {
    case 'sum': return values.reduce((sum, value) => sum + value, 0)
    case 'difference': return values.length === 2 ? values[0] - values[1] : Number.NaN
    case 'product': return values.reduce((product, value) => product * value, 1)
    case 'quotient': return values.length === 2 && values[1] !== 0 ? values[0] / values[1] : Number.NaN
    case 'percent_of': return values.length === 2 && values[1] !== 0 ? (values[0] / values[1]) * 100 : Number.NaN
    case 'percent_change': return values.length === 2 && values[0] !== 0 ? ((values[1] - values[0]) / values[0]) * 100 : Number.NaN
  }
}

function markSchemeText(question: MockQuestion) {
  const scheme = question.mark_scheme
  return [scheme.model_answer, ...scheme.points.flatMap((point) => [point.descriptor, ...point.accept]), ...scheme.levels.map((level) => level.descriptor), ...scheme.indicative_content, ...scheme.option_rationale].join(' ')
}

export function validateMockQuestion(question: MockQuestion, paper: MockPlanPaper, slot: MockPlanSlot, sharedContext?: SharedContext): ClassifiedFinding[] {
  const findings: ClassifiedFinding[] = []
  const id = slot.slot_id
  if (question.slot_id !== id) findings.push(softwareFinding('plan_identity', [id], `question id is ${question.slot_id}, expected ${id}`, 'Use the planned slot id.'))
  const family = expectedFamily(paper.component_id, slot)
  if (question.family !== family) findings.push(softwareFinding('plan_family', [id], `family is ${question.family}, expected ${family}`, 'Use the planned question family.'))
  const command = expectedCommand(slot)
  if (question.command_word.toLowerCase() !== command.toLowerCase()) findings.push(softwareFinding('plan_command', [id], `command word is ${question.command_word}, expected ${command}`, 'Use the planned command word.'))
  if (question.marks !== slot.marks) findings.push(softwareFinding('plan_marks', [id], `marks are ${question.marks}, expected ${slot.marks}`, 'Use the planned tariff.'))
  if (JSON.stringify(question.ao_marks) !== JSON.stringify(slot.ao_marks)) findings.push(softwareFinding('plan_ao_marks', [id], 'AO marks do not match the deterministic plan', 'Copy the planned AO mark allocation exactly.'))
  if (Object.values(question.ao_marks).reduce((sum, value) => sum + value, 0) !== question.marks) findings.push(softwareFinding('ao_sum', [id], 'AO marks do not add to the question tariff', 'Make AO marks add exactly to the tariff.'))

  if (sharedContext && question.context.trim()) findings.push(softwareFinding('shared_context_ownership', [id], 'linked question invented its own context instead of using the fixed shared stimulus', 'Leave question.context empty and use only the supplied shared context.'))
  if (!sharedContext && family === 'ESSAY' && !question.context.trim()) findings.push(softwareFinding('essay_context', [id], 'essay option has no usable business context', 'Give this option its own synthetic business context.'))

  const scheme = question.mark_scheme
  if (family === 'MCQ') {
    const labels = question.options.map((option) => option.label)
    if (JSON.stringify(labels) !== JSON.stringify(['A', 'B', 'C', 'D'])) findings.push(softwareFinding('mcq_options', [id], 'MCQ must have exactly options A, B, C and D', 'Return four options labelled A-D.'))
    if (scheme.type !== 'single_option' || !labels.includes(scheme.correct_option)) findings.push(softwareFinding('mcq_key', [id], 'MCQ does not have one valid keyed option', 'Use a single_option mark scheme with one valid key.'))
    if (scheme.option_rationale.length !== 4) findings.push(softwareFinding('mcq_rationale', [id], 'MCQ requires one rationale for each option', 'Give four option rationales.'))
  } else {
    if (question.options.length) findings.push(softwareFinding('non_mcq_options', [id], 'non-MCQ question contains answer options', 'Remove answer options.'))
    if (question.marks >= 9) {
      if (scheme.type !== 'levels') findings.push(softwareFinding('levels_required', [id], `${question.marks}-mark response requires a levels mark scheme`, 'Use levels.'))
      else {
        const levels = [...scheme.levels].sort((a, b) => a.min_marks - b.min_marks)
        let expected = 1
        for (const level of levels) { if (level.min_marks !== expected || level.max_marks < level.min_marks) expected = Number.NaN; else expected = level.max_marks + 1 }
        if (levels.length < 3 || expected !== question.marks + 1) findings.push(softwareFinding('levels_cover_marks', [id], `levels must cover marks 1-${question.marks} without gaps or overlaps`, 'Cover the full mark range with at least three contiguous levels.'))
        if (scheme.indicative_content.length < 3) findings.push(softwareFinding('indicative_content', [id], 'levels mark scheme has too little indicative content', 'Give at least three valid indicative-content examples.'))
      }
    } else if (scheme.type !== 'points' || scheme.points.reduce((sum, point) => sum + point.marks, 0) !== question.marks) {
      findings.push(softwareFinding('points_sum', [id], `point mark scheme must add exactly to ${question.marks}`, 'Use point marks that reconcile exactly to the tariff.'))
    }
  }

  const supported = question.calculations.reduce((sum, calc) => sum + calc.marks_supported, 0)
  if (supported !== slot.quantitative_marks) findings.push(softwareFinding('quantitative_marks', [id], `calculation evidence supports ${supported} marks, expected ${slot.quantitative_marks}`, 'Match the planned quantitative mark allocation exactly.'))
  const schemeNumbers = numbersIn(markSchemeText(question))
  for (const calc of question.calculations) {
    const recomputed = calculationResult(calc)
    if (!Number.isFinite(recomputed) || !near(recomputed, calc.stated_answer)) findings.push(softwareFinding('calculation_recomputes', [id], `${calc.label} does not recompute to ${calc.stated_answer}`, 'Correct the operands, method or stated answer.'))
    if (!schemeNumbers.some((value) => near(value, calc.stated_answer))) findings.push(softwareFinding('calculation_in_mark_scheme', [id], `${calc.label} answer ${calc.stated_answer} is absent from the mark scheme`, 'State the calculated answer in the mark scheme.'))
  }
  if (slot.quantitative_marks > 0 && question.calculations.length === 0) findings.push(softwareFinding('quantitative_calculation_missing', [id], 'planned quantitative slot contains no recomputable calculation', 'Add recomputable calculation evidence.'))
  return findings
}

function words(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((word) => word.length > 2)
}

function shingles(text: string) {
  const tokens = words(text)
  const result = new Set<string>()
  for (let index = 0; index <= tokens.length - 3; index++) result.add(tokens.slice(index, index + 3).join(' '))
  return result
}

export function nearDuplicateScore(left: string, right: string) {
  const a = shingles(left)
  const b = shingles(right)
  if (!a.size || !b.size) return 0
  let intersection = 0
  for (const value of a) if (b.has(value)) intersection += 1
  return (2 * intersection) / (a.size + b.size)
}

export function detectNearDuplicates(questions: MockQuestion[], threshold = 0.88) {
  const duplicates: Array<{ left: string; right: string; score: number }> = []
  for (let left = 0; left < questions.length; left++) {
    for (let right = left + 1; right < questions.length; right++) {
      const score = nearDuplicateScore(questions[left].stem, questions[right].stem)
      if (score >= threshold) duplicates.push({ left: questions[left].slot_id, right: questions[right].slot_id, score: Number(score.toFixed(4)) })
    }
  }
  return duplicates
}

export function unitEvidence(unit: MockGenerationUnit, evidence: MockEvidence) {
  const requirementIds = [...new Set(unit.slots.flatMap((slot) => slot.required_course_truth_requirement_ids))]
  const nodeIds = [...new Set(unit.slots.flatMap((slot) => slot.required_subject_node_ids))]
  return {
    requirements: requirementIds.map((id) => {
      const requirement = evidence.requirements.get(id)
      if (!requirement) throw new Error(`mock_generation_requirement_missing:${id}`)
      return {
        requirement_id: requirement.requirement_id,
        title: requirement.title ?? requirement.section_id ?? requirement.requirement_id,
        rights_safe_requirement_summary: requirement.rights_safe_requirement_summary ?? '',
        course_specific_named_items: requirement.course_specific_named_items ?? [],
        calculation_obligations: requirement.calculation_obligations ?? [],
      }
    }),
    nodes: nodeIds.map((id) => {
      const node = evidence.nodes.get(id)
      if (!node) throw new Error(`mock_generation_foundation_node_missing:${id}`)
      return { id: `foundation-node:${id}`, title: node.title ?? id, teaching_content: node.teaching_content ?? {}, quantitative_content: node.quantitative_content ?? {}, source_ids: node.source_ids ?? [] }
    }),
  }
}

export function contextGenerationPayload(plan: MockPlan, unit: MockGenerationUnit, evidence: MockEvidence, feedback: ClassifiedFinding[] = []) {
  if (unit.context_policy !== 'shared') throw new Error(`mock_context_not_shared:${unit.unit_id}`)
  return {
    plan_fingerprint: plan.plan_fingerprint,
    unit_id: unit.unit_id,
    component_id: unit.component_id,
    slot_plans: unit.slots.map((slot) => ({ slot_id: slot.slot_id, marks: slot.marks, command_category: slot.command_category, quantitative_marks: slot.quantitative_marks, target_requirement_ids: slot.required_course_truth_requirement_ids })),
    subject_truth: unitEvidence(unit, evidence),
    fix_these: feedback.map((finding) => ({ check_id: finding.check_id, affected_ids: finding.affected_ids, finding: finding.finding, proposed_fix: finding.proposed_fix })),
  }
}

export function questionGenerationPayload(plan: MockPlan, paper: MockPlanPaper, slot: MockPlanSlot, evidence: MockEvidence, sharedContext: SharedContext | undefined, feedback: ClassifiedFinding[] = []) {
  const unit: MockGenerationUnit = { unit_id: slot.slot_id, component_id: paper.component_id, context_policy: sharedContext ? 'shared' : 'question_local', slots: [slot] }
  return {
    plan_fingerprint: plan.plan_fingerprint,
    component_id: paper.component_id,
    slot_plan: {
      slot_id: slot.slot_id,
      family: expectedFamily(paper.component_id, slot),
      command_word: expectedCommand(slot),
      marks: slot.marks,
      ao_marks: slot.ao_marks,
      quantitative_marks: slot.quantitative_marks,
      target_requirement_ids: slot.required_course_truth_requirement_ids,
      target_node_ids: slot.required_subject_node_ids,
      coverage_rule: slot.coverage_evidence_rule,
    },
    shared_context: sharedContext ?? null,
    subject_truth: unitEvidence(unit, evidence),
    fix_these: feedback.map((finding) => ({ check_id: finding.check_id, affected_ids: finding.affected_ids, finding: finding.finding, proposed_fix: finding.proposed_fix })),
  }
}

export function blindUnitPayload(unit: MockGenerationUnit, questions: MockQuestion[], sharedContext?: SharedContext) {
  return {
    unit_id: unit.unit_id,
    component_id: unit.component_id,
    shared_context: sharedContext ?? null,
    questions: questions.map((question) => ({ slot_id: question.slot_id, family: question.family, command_word: question.command_word, marks: question.marks, context: question.context, stem: question.stem, table: question.table, options: question.options })),
  }
}

export function numericComparison(questions: MockQuestion[], blind: BlindUnit) {
  return questions.map((question) => {
    const answer = blind.answers.find((entry) => entry.slot_id === question.slot_id)
    return {
      slot_id: question.slot_id,
      calculations: question.calculations.map((calc) => ({ label: calc.label, stated_answer: calc.stated_answer, blind_answer_matches: Boolean(answer?.numbers.some((entry) => near(entry.value, calc.stated_answer))), blind_numbers: answer?.numbers ?? [] })),
    }
  })
}

export const SHARED_CONTEXT_GENERATION_INSTRUCTIONS = [
  'Create one original synthetic business stimulus for the linked A-level Business questions described in the payload.',
  'Use only the supplied subject truth. The stimulus must be Revision-authored and must not quote, imitate or reconstruct any AQA case, dataset, question or mark-scheme prose.',
  'Make every fact and number internally consistent. Include only information useful for the planned linked questions; do not disclose answers.',
  'Use British English, UK-style business settings and £ where money is needed. The same fixed stimulus will be used unchanged by every question in this unit.',
  'Return unit_id exactly as supplied.',
].join('\n')

export const MOCK_QUESTION_GENERATION_INSTRUCTIONS = [
  'Write one original Revision-authored UK A-level Business mock question and mark scheme to the exact deterministic slot plan.',
  'Use only the supplied subject truth. Never quote or closely paraphrase AQA specifications, past papers, cases, datasets, examiner reports or mark schemes.',
  'Copy slot_id, family, command_word, marks and ao_marks exactly from slot_plan. The planned Course Truth target must be directly demanded by the stem and necessary for full marks; a context-only mention does not count.',
  'If shared_context is supplied, use it exactly: leave question.context empty, do not invent a conflicting business fact, and refer to the shared stimulus from the stem. Otherwise invent only the small synthetic context required for this question.',
  'MCQ: exactly four options labelled A-D, one correct option, single_option mark scheme and one rationale per option. Non-MCQ questions have no options.',
  'Questions below 9 marks use a points mark scheme whose points add exactly to the tariff. Questions of 9 marks or more use at least three contiguous levels covering 1 to the full tariff, plus indicative content and a model answer.',
  'For quantitative_marks greater than zero, include recomputable calculation records whose marks_supported add exactly to quantitative_marks. Use only the calculation methods in the schema. Put all necessary numerical inputs in the question, shared context or table, and state each calculated answer in the mark scheme.',
  'For quantitative_marks zero, do not claim calculation marks. Marking guidance must never reward knowledge, analysis, evaluation or interpretation the question did not ask for.',
  'If fix_these is non-empty, repair those named failures while preserving the deterministic plan.',
].join('\n')

export const BLIND_UNIT_INSTRUCTIONS = [
  'Act as a capable A-level Business student answering every question in this unit under exam conditions.',
  'You can see only the learner-facing stimulus and questions, not the mark schemes or plan. Answer each slot_id exactly once.',
  'Show working for calculations and record every calculated number in numbers with a short label.',
].join('\n')

export const MOCK_UNIT_REVIEW_INSTRUCTIONS = [
  'Review this bounded mock unit using only the supplied Foundation evidence, learner-facing content and blind answers.',
  'Software has already checked identities, tariffs, AO arithmetic, mark totals, calculation arithmetic and planned quantitative marks. Do not invent additional checklist criteria.',
  'Findings must identify the affected slot_id where possible so remediation stays small.',
].join('\n')

export const MOCK_PAPER_REVIEW_INSTRUCTIONS = [
  'Review the assembled Revision-authored mock paper as a whole against the fixed checklist only.',
  'Software has already proved structure, marks, AO arithmetic, quantitative accounting, target links and deterministic near-duplicate checks. Judge the semantic whole-paper qualities software cannot prove.',
  'Do not compare wording against remembered AQA questions. Judge whether it resembles the approved assessment model without signs of copying protected content.',
].join('\n')
