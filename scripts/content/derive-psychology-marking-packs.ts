import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { derivePsychologyCourseLearningBlueprint, type RequirementLearningUnit } from './derive-psychology-course-learning-blueprint'
import { derivePsychologyLearnerAssets, type ExamPrepQuestion, type FullPaperSimulation, type PracticeActivity } from './derive-psychology-learner-assets'

type AO = 'AO1' | 'AO2' | 'AO3'
type AOAllocation = Partial<Record<AO, number>>
type EvidenceClaim =
  | 'knowledge_recall' | 'discrimination_or_structure' | 'selected_knowledge_and_explanation'
  | 'contextual_application' | 'analysis_reasoning' | 'comparison_or_evaluation_judgement'
  | 'quantitative_execution' | 'data_interpretation' | 'misconception_discrimination'
  | 'synoptic_selection' | 'exam_response_execution'

type SubjectTruth = {
  definitionsAndCoreConcepts?: string[]
  modelsResearchAndRelationships?: string[]
  evaluationAndLimits?: string[]
  misconceptionsAndBoundaries?: string[]
}
type Requirement = {
  requirementId: string
  subjectTruth: SubjectTruth
  readiness: { courseTruthStatus: string; materialSubjectTruthGap: boolean; materialRightsBlocker: boolean }
}
type Topic = { requirements: Requirement[] }

export type MarkingPack = {
  schemaVersion: 1
  id: string
  itemId: string
  itemType: 'practice' | 'topic_exam_prep' | 'full_paper_question'
  scoredItem: { prompt: string; context?: string; alternatives?: string[]; fixedData?: number[] | Array<[number, number]>; maxMark: number }
  requirementIds: string[]
  blueprintUnitIds: string[]
  questionFamily?: string
  practiceMode?: string
  aoAllocation: AOAllocation
  criteria: Array<{ id: string; description: string; marks: number; assessmentObjective?: AO; evidenceClaim: EvidenceClaim }>
  levelDescriptors: Array<{ min: number; max: number; description: string }>
  validReasoningRoutes: string[]
  indicativeContent: string[]
  misconceptionsOrInvalidReasoning: string[]
  diagnosticFeedback: string[]
  ambiguityAndConfidence: { preciseMarkRule: string; borderlineRule: string; abstentionRule: string }
  calibration: { status: 'uncalibrated_step_5_candidate'; anchors: []; independentCalibrationRequired: true }
  rights: { revisionOwnedQuestionAndRubric: true; officialAqaMaterialUsedAsReusableText: false; courseTruthUse: 'rights_safe_subject_truth_only' }
  provenance: { courseTruthRequirementIds: string[]; blueprintUnitIds: string[]; baseLearnerAssetId: string; examTruthUse?: 'structured_assessment_facts_only' }
}

type EvidenceMapping = {
  itemId: string
  sourceSurface: 'practice' | 'topic_exam_prep'
  requirementIds: string[]
  blueprintUnitIds: string[]
  permittedEvidenceClaims: EvidenceClaim[]
  sourceDeclaredEvidenceScope: string[]
  scoreability: 'marking_pack_candidate_complete' | 'requires_concrete_variant'
  markingPackId?: string
  limitation?: string
  runtimeEvidenceEligible: false
  readinessEvidenceEligible: false
  evidencePromotionBoundary: 'step_6_independent_assurance_and_step_7_runtime_integration_required'
}

type ScoredQuestion = {
  baseQuestionId: string
  markingPackId: string
  maxMark: number
  aoAllocation: AOAllocation
  requirementIds: string[]
  researchMethodsMarks: number
  mathematicalSkillsMarks: number
}
type ScoredSection = {
  id: string
  marks: number
  topicNumber?: number
  questions?: ScoredQuestion[]
  choose?: number
  options?: Array<{ topicNumber: number; topic: string; marks: number; questions: ScoredQuestion[] }>
}
type ScoredPaper = {
  baseSimulationId: string
  paperId: string
  paperName: string
  durationMinutes: number
  attemptedMarks: number
  sections: ScoredSection[]
  aoTotalsForAnyValidAttempt: Record<AO, number>
  researchMethodsMarksForAnyValidAttempt: number
  mathematicalSkillsMarksForAnyValidAttempt: number
  calibrationStatus: 'deterministic_step_5_candidate'
  runtimeEvidenceEligible: false
}

const MODE_CLAIM: Record<string, EvidenceClaim> = {
  retrieval_prompt_flashcard: 'knowledge_recall',
  recognition_discrimination_check: 'discrimination_or_structure',
  classification_matching_ordering: 'discrimination_or_structure',
  short_constructed_response: 'selected_knowledge_and_explanation',
  contextual_application_scenario: 'contextual_application',
  reasoning_chain_construction: 'analysis_reasoning',
  compare_justify_task: 'comparison_or_evaluation_judgement',
  calculation_quantitative_drill: 'quantitative_execution',
  interpretation_data_graph_source: 'data_interpretation',
  misconception_diagnostic: 'misconception_discrimination',
  mixed_topic_retrieval: 'synoptic_selection',
}
const DEFERRED = new Set(['classification_matching_ordering', 'calculation_quantitative_drill', 'interpretation_data_graph_source', 'mixed_topic_retrieval'])
const unique = <T>(values: T[]): T[] => [...new Set(values)]
const strings = (values?: string[]): string[] => values ?? []
const aoSum = (ao: AOAllocation): number => (ao.AO1 ?? 0) + (ao.AO2 ?? 0) + (ao.AO3 ?? 0)

function addAo(total: Record<AO, number>, ao: AOAllocation): void {
  total.AO1 += ao.AO1 ?? 0
  total.AO2 += ao.AO2 ?? 0
  total.AO3 += ao.AO3 ?? 0
}

function levels(maxMark: number): MarkingPack['levelDescriptors'] {
  if (maxMark <= 4) return [
    { min: 0, max: 0, description: 'No creditworthy response.' },
    { min: 1, max: Math.max(1, maxMark - 2), description: 'Some relevant material, but incomplete, imprecise or weakly linked to the task.' },
    { min: Math.max(2, maxMark - 1), max: maxMark, description: 'Accurate, relevant and sufficiently developed for the available marks.' },
  ]
  const low = Math.floor(maxMark / 3)
  const mid = Math.floor((maxMark * 2) / 3)
  return [
    { min: 0, max: 0, description: 'No creditworthy response.' },
    { min: 1, max: low, description: 'Limited relevant knowledge or reasoning; links to the exact task are partial.' },
    { min: low + 1, max: mid, description: 'Generally accurate and relevant with some developed reasoning, application or evaluation.' },
    { min: mid + 1, max: maxMark, description: 'Accurate, well-selected and developed response that directly meets the item demand and keeps conclusions proportionate to the evidence.' },
  ]
}

function aoCriteria(ao: AOAllocation, evidenceClaim?: EvidenceClaim): MarkingPack['criteria'] {
  const out: MarkingPack['criteria'] = []
  if (ao.AO1) out.push({ id: 'AO1', description: 'Accurate and relevant psychological knowledge selected for this exact item.', marks: ao.AO1, assessmentObjective: 'AO1', evidenceClaim: evidenceClaim ?? 'knowledge_recall' })
  if (ao.AO2) out.push({ id: 'AO2', description: 'Application of relevant psychological knowledge or method to the supplied Revision-owned context, cues or data.', marks: ao.AO2, assessmentObjective: 'AO2', evidenceClaim: evidenceClaim ?? 'contextual_application' })
  if (ao.AO3) out.push({ id: 'AO3', description: 'Analysis, interpretation or evaluation that develops reasoning and keeps conclusions within the evidence.', marks: ao.AO3, assessmentObjective: 'AO3', evidenceClaim: evidenceClaim ?? 'analysis_reasoning' })
  return out
}

function truth(ids: string[], byId: Map<string, Requirement>) {
  const requirements = ids.map((id) => byId.get(id)).filter((value): value is Requirement => Boolean(value))
  return {
    indicative: unique(requirements.flatMap((r) => [...strings(r.subjectTruth.definitionsAndCoreConcepts), ...strings(r.subjectTruth.modelsResearchAndRelationships), ...strings(r.subjectTruth.evaluationAndLimits)])).slice(0, 12),
    reasoning: unique(requirements.flatMap((r) => [...strings(r.subjectTruth.modelsResearchAndRelationships), ...strings(r.subjectTruth.evaluationAndLimits)])).slice(0, 8),
    misconceptions: unique(requirements.flatMap((r) => strings(r.subjectTruth.misconceptionsAndBoundaries))).slice(0, 8),
  }
}

function makePack(args: {
  itemId: string
  itemType: MarkingPack['itemType']
  prompt: string
  maxMark: number
  requirementIds: string[]
  blueprintUnitIds: string[]
  requirementsById: Map<string, Requirement>
  ao: AOAllocation
  practiceMode?: string
  questionFamily?: string
  context?: string
  alternatives?: string[]
  fixedData?: number[] | Array<[number, number]>
  evidenceClaim?: EvidenceClaim
  invalidReasoning?: string[]
  examTruthUse?: boolean
}): MarkingPack {
  if (aoSum(args.ao) !== args.maxMark) throw new Error(`${args.itemId} AO allocation does not reconcile to ${args.maxMark}`)
  const criteria = aoCriteria(args.ao, args.evidenceClaim)
  if (criteria.reduce((sum, criterion) => sum + criterion.marks, 0) !== args.maxMark) throw new Error(`${args.itemId} criterion marks do not reconcile`)
  const material = truth(args.requirementIds, args.requirementsById)
  return {
    schemaVersion: 1,
    id: `MP-${args.itemId}`,
    itemId: args.itemId,
    itemType: args.itemType,
    scoredItem: { prompt: args.prompt, ...(args.context ? { context: args.context } : {}), ...(args.alternatives ? { alternatives: args.alternatives } : {}), ...(args.fixedData ? { fixedData: args.fixedData } : {}), maxMark: args.maxMark },
    requirementIds: args.requirementIds,
    blueprintUnitIds: args.blueprintUnitIds,
    ...(args.questionFamily ? { questionFamily: args.questionFamily } : {}),
    ...(args.practiceMode ? { practiceMode: args.practiceMode } : {}),
    aoAllocation: args.ao,
    criteria,
    levelDescriptors: levels(args.maxMark),
    validReasoningRoutes: material.reasoning.length > 0 ? material.reasoning : ['Use accurate Course Truth, connect it directly to the task and avoid conclusions stronger than the evidence permits.'],
    indicativeContent: material.indicative,
    misconceptionsOrInvalidReasoning: args.invalidReasoning ?? (material.misconceptions.length > 0 ? ['Treating a bounded psychological claim as universal, deterministic, or free of its stated conditions and limitations.'] : []),
    diagnosticFeedback: [
      'Check whether the response selected the knowledge actually required by the item rather than reproducing unrelated learned material.',
      'Where application or analysis is required, identify the exact cue, data feature or reasoning step that earns the mark.',
      'Where a conclusion is too strong, rewrite it so it matches what the evidence can legitimately support.',
    ],
    ambiguityAndConfidence: {
      preciseMarkRule: 'Return a precise mark only when the response maps unambiguously to the criteria and the item supplies enough information for the judgement.',
      borderlineRule: 'If a response genuinely sits between adjacent outcomes, retain the narrower justified range rather than inventing false precision.',
      abstentionRule: 'Do not return a precise mark when the response, item context or evidence needed for a criterion is missing or materially ambiguous.',
    },
    calibration: { status: 'uncalibrated_step_5_candidate', anchors: [], independentCalibrationRequired: true },
    rights: { revisionOwnedQuestionAndRubric: true, officialAqaMaterialUsedAsReusableText: false, courseTruthUse: 'rights_safe_subject_truth_only' },
    provenance: { courseTruthRequirementIds: args.requirementIds, blueprintUnitIds: args.blueprintUnitIds, baseLearnerAssetId: args.itemId, ...(args.examTruthUse ? { examTruthUse: 'structured_assessment_facts_only' as const } : {}) },
  }
}

function practiceMapping(activity: PracticeActivity): EvidenceMapping {
  const claim = MODE_CLAIM[activity.mode]
  if (!claim) throw new Error(`Unknown Psychology Practice mode ${activity.mode}`)
  const deferred = DEFERRED.has(activity.mode)
  return {
    itemId: activity.id,
    sourceSurface: 'practice',
    requirementIds: activity.requirementIds,
    blueprintUnitIds: activity.blueprintUnitIds,
    permittedEvidenceClaims: [claim],
    sourceDeclaredEvidenceScope: activity.intendedEvidenceScope,
    scoreability: deferred ? 'requires_concrete_variant' : 'marking_pack_candidate_complete',
    ...(!deferred ? { markingPackId: `MP-${activity.id}` } : {}),
    ...(deferred ? { limitation: 'The learner practice is now concrete enough to attempt, but it is intentionally not promoted to scored evidence until an exact reproducible scoring key/variant is materialised and independently assured.' } : {}),
    runtimeEvidenceEligible: false,
    readinessEvidenceEligible: false,
    evidencePromotionBoundary: 'step_6_independent_assurance_and_step_7_runtime_integration_required',
  }
}

function practiceAo(mode: string): AOAllocation {
  if (mode === 'contextual_application_scenario') return { AO2: 4 }
  if (['reasoning_chain_construction', 'compare_justify_task', 'misconception_diagnostic'].includes(mode)) return { AO3: 4 }
  return { AO1: 4 }
}

function topicAo(question: ExamPrepQuestion): AOAllocation {
  if (question.questionFamily === 'scenario_application') return { AO1: 2, AO2: question.marks - 2 }
  if (question.questionFamily === 'extended_writing') return { AO1: Math.min(6, question.marks), AO3: question.marks - Math.min(6, question.marks) }
  if (question.questionFamily === 'research_methods_practical') return { AO1: 2, AO2: question.marks - 4, AO3: 2 }
  if (question.questionFamily === 'data_math') return { AO2: question.marks - 2, AO3: 2 }
  return { AO1: question.marks }
}

function materialiseTopic(question: ExamPrepQuestion, byId: Map<string, Requirement>) {
  const material = truth(question.requirementIds, byId)
  if (question.questionFamily === 'mcq') return {
    prompt: `${question.prompt} Select the accurate statement, then justify the selection using one precise psychological distinction.`,
    alternatives: [
      material.indicative[0] ?? 'The response must use the linked Course Truth accurately.',
      'This concept guarantees the same outcome in every person and every context.',
      'The concept is valid only when no alternative explanation can ever be imagined.',
      'The concept describes correlation and therefore proves a single causal mechanism.',
    ],
  }
  if (question.questionFamily === 'scenario_application') return { prompt: question.prompt, context: 'Revision-owned application context: a student shows a pattern that could fit the linked psychological concept, but one nearby alternative explanation is also plausible. Identify what additional cue would discriminate between the accounts before applying the concept.' }
  if (question.questionFamily === 'research_methods_practical') return { prompt: question.prompt, context: 'Revision-owned study context: a researcher has 40 volunteer sixth-form participants and needs an operationalised, replicable way to investigate the linked psychological issue. Specify a workable procedure, justify decisions against this context, and identify a limitation or improvement.' }
  if (question.questionFamily === 'data_math') return { prompt: `${question.prompt} Use the supplied constructed data and show independently checkable working.`, context: 'Revision-owned constructed data: five participant scores are 4, 6, 6, 8 and 11. Calculate an appropriate descriptive summary and separate justified interpretation from causal inference.', fixedData: [4, 6, 6, 8, 11] }
  return { prompt: question.prompt }
}

function topicMapping(question: ExamPrepQuestion): EvidenceMapping {
  return {
    itemId: question.id,
    sourceSurface: 'topic_exam_prep',
    requirementIds: question.requirementIds,
    blueprintUnitIds: question.blueprintUnitIds,
    permittedEvidenceClaims: ['exam_response_execution'],
    sourceDeclaredEvidenceScope: ['assessment_relevant_only_when_activity_and_marking_contract_support_it'],
    scoreability: 'marking_pack_complete',
    markingPackId: `MP-${question.id}`,
    runtimeEvidenceEligible: false,
    readinessEvidenceEligible: false,
    evidencePromotionBoundary: 'step_6_independent_assurance_and_step_7_runtime_integration_required',
  }
}

function paperProfile(paperId: string, sectionId: string, index: number, marks: number) {
  if (paperId === '7182/1' || (paperId === '7182/2' && sectionId !== 'C')) {
    const profiles = [
      { ao: { AO1: 4 }, researchMethodsMarks: 0, mathematicalSkillsMarks: 0 },
      { ao: { AO1: 2, AO2: 6 }, researchMethodsMarks: paperId === '7182/1' ? 6 : 0, mathematicalSkillsMarks: 0 },
      { ao: { AO1: 3, AO3: 9 }, researchMethodsMarks: 0, mathematicalSkillsMarks: 0 },
    ]
    const profile = profiles[index]
    if (!profile || aoSum(profile.ao) !== marks) throw new Error(`No ${paperId} ${sectionId} profile for question ${index + 1}`)
    return profile
  }
  if (paperId === '7182/2' && sectionId === 'C') {
    const profiles = [
      { ao: { AO1: 1, AO2: 3 }, researchMethodsMarks: 4, mathematicalSkillsMarks: 0 },
      { ao: { AO2: 8 }, researchMethodsMarks: 8, mathematicalSkillsMarks: 8 },
      { ao: { AO1: 2, AO2: 9, AO3: 1 }, researchMethodsMarks: 12, mathematicalSkillsMarks: 0 },
      { ao: { AO2: 11, AO3: 1 }, researchMethodsMarks: 12, mathematicalSkillsMarks: 12 },
      { ao: { AO2: 11, AO3: 1 }, researchMethodsMarks: 12, mathematicalSkillsMarks: 12 },
    ]
    const profile = profiles[index]
    if (!profile || aoSum(profile.ao) !== marks) throw new Error(`No Paper 2 Section C profile for question ${index + 1}`)
    return profile
  }
  if (paperId === '7182/3') {
    const profiles = [
      { ao: { AO1: 4 }, researchMethodsMarks: 0, mathematicalSkillsMarks: 0 },
      { ao: { AO1: 2, AO2: 4, AO3: 2 }, researchMethodsMarks: 0, mathematicalSkillsMarks: 0 },
      { ao: { AO1: 2, AO3: 10 }, researchMethodsMarks: 0, mathematicalSkillsMarks: 0 },
    ]
    const profile = profiles[index]
    if (!profile || aoSum(profile.ao) !== marks) throw new Error(`No Paper 3 ${sectionId} profile for question ${index + 1}`)
    return profile
  }
  throw new Error(`Unknown Psychology paper ${paperId}`)
}

function paperMaterial(paperId: string, sectionId: string, question: ExamPrepQuestion, index: number, rmMarks: number, mathMarks: number) {
  if (paperId === '7182/1' && index === 1) return { prompt: `${question.prompt} Also use the supplied study context to make one justified research-method decision and explain why it matters.`, context: 'Revision-owned embedded-method context: a researcher wants to investigate the topic with a volunteer sample and must define one measurable variable and one procedure clearly enough for another researcher to repeat it.' }
  if (paperId === '7182/2' && sectionId === 'C' && mathMarks > 0) return { prompt: `${question.prompt} Use the supplied constructed dataset; show independently checkable working and separate calculation from interpretation.`, context: 'Revision-owned Research Methods dataset: participant scores are 4, 6, 6, 8 and 11. State what the result does and does not justify.', fixedData: [4, 6, 6, 8, 11] }
  if (paperId === '7182/2' && sectionId === 'C' && rmMarks > 0) return { prompt: `${question.prompt} Apply the answer to the supplied Revision-owned study context rather than giving generic method notes.`, context: 'Revision-owned Research Methods context: a researcher has 40 volunteer sixth-form participants and needs an operationalised, replicable and ethically defensible procedure. Justify choices against this context and identify a limitation or improvement where required.' }
  return { prompt: question.prompt }
}

function scoreQuestions(args: {
  paper: FullPaperSimulation
  sectionId: string
  questions: ExamPrepQuestion[]
  byId: Map<string, Requirement>
  unitByRequirement: Map<string, RequirementLearningUnit>
  rmUnits: RequirementLearningUnit[]
  quantitativeUnits: RequirementLearningUnit[]
  sink: MarkingPack[]
}): ScoredQuestion[] {
  return args.questions.map((question, index) => {
    const profile = paperProfile(args.paper.paperId, args.sectionId, index, question.marks)
    const extraUnits: RequirementLearningUnit[] = []
    if (args.paper.paperId === '7182/1' && index === 1) {
      const offset = Math.max(0, args.sectionId.charCodeAt(0) - 'A'.charCodeAt(0))
      extraUnits.push(args.rmUnits[offset % args.rmUnits.length])
    }
    if (args.paper.paperId === '7182/2' && args.sectionId === 'C' && [1, 3, 4].includes(index)) extraUnits.push(args.quantitativeUnits[index % args.quantitativeUnits.length])
    const requirementIds = unique([...question.requirementIds, ...extraUnits.flatMap((unit) => unit.knowledgeNodeIds)])
    const blueprintUnitIds = unique([...question.blueprintUnitIds, ...requirementIds.map((id) => args.unitByRequirement.get(id)?.id).filter((value): value is string => Boolean(value))])
    const material = paperMaterial(args.paper.paperId, args.sectionId, question, index, profile.researchMethodsMarks, profile.mathematicalSkillsMarks)
    const itemId = `${args.paper.id}-${args.sectionId}-${question.id}`
    const markingPack = makePack({ itemId, itemType: 'full_paper_question', prompt: material.prompt, maxMark: question.marks, requirementIds, blueprintUnitIds, requirementsById: args.byId, ao: profile.ao, questionFamily: profile.mathematicalSkillsMarks > 0 ? 'data_math' : question.questionFamily, context: material.context, fixedData: material.fixedData, examTruthUse: true })
    args.sink.push(markingPack)
    return { baseQuestionId: question.id, markingPackId: markingPack.id, maxMark: question.marks, aoAllocation: profile.ao, requirementIds, researchMethodsMarks: profile.researchMethodsMarks, mathematicalSkillsMarks: profile.mathematicalSkillsMarks }
  })
}

function totals(questions: ScoredQuestion[]) {
  const ao: Record<AO, number> = { AO1: 0, AO2: 0, AO3: 0 }
  let marks = 0
  let researchMethodsMarks = 0
  let mathematicalSkillsMarks = 0
  for (const question of questions) {
    marks += question.maxMark
    addAo(ao, question.aoAllocation)
    researchMethodsMarks += question.researchMethodsMarks
    mathematicalSkillsMarks += question.mathematicalSkillsMarks
  }
  return { marks, ao, researchMethodsMarks, mathematicalSkillsMarks }
}

function scorePaper(paper: FullPaperSimulation, byId: Map<string, Requirement>, unitByRequirement: Map<string, RequirementLearningUnit>, rmUnits: RequirementLearningUnit[], quantitativeUnits: RequirementLearningUnit[], sink: MarkingPack[]): ScoredPaper {
  const sections: ScoredSection[] = paper.sections.map((section) => {
    if (section.questions) return { id: section.id, marks: section.marks, topicNumber: section.topicNumber, questions: scoreQuestions({ paper, sectionId: section.id, questions: section.questions, byId, unitByRequirement, rmUnits, quantitativeUnits, sink }) }
    return { id: section.id, marks: section.marks, choose: section.choose, options: (section.options ?? []).map((option) => ({ topicNumber: option.topicNumber, topic: option.topic, marks: option.marks, questions: scoreQuestions({ paper, sectionId: section.id, questions: option.questions, byId, unitByRequirement, rmUnits, quantitativeUnits, sink }) })) }
  })
  const required = sections.flatMap((section) => section.questions ?? [])
  const chosen = sections.filter((section) => section.options).flatMap((section) => section.options?.slice(0, section.choose ?? 0).flatMap((option) => option.questions) ?? [])
  const total = totals([...required, ...chosen])
  if (total.marks !== paper.attemptedMarks) throw new Error(`${paper.paperId} scored attempt does not reconcile to ${paper.attemptedMarks}`)
  return { baseSimulationId: paper.id, paperId: paper.paperId, paperName: paper.paperName, durationMinutes: paper.durationMinutes, attemptedMarks: paper.attemptedMarks, sections, aoTotalsForAnyValidAttempt: total.ao, researchMethodsMarksForAnyValidAttempt: total.researchMethodsMarks, mathematicalSkillsMarksForAnyValidAttempt: total.mathematicalSkillsMarks, calibrationStatus: 'deterministic_step_5_candidate', runtimeEvidenceEligible: false }
}

export function derivePsychologyMarkingPacks(courseTruthDir: string, examTruthPath: string) {
  const examTruth = JSON.parse(readFileSync(examTruthPath, 'utf8')) as { status: string }
  if (examTruth.status !== 'experimental_exam_truth_complete') throw new Error('Completed Psychology Exam Truth is required')
  const blueprint = derivePsychologyCourseLearningBlueprint(courseTruthDir, examTruthPath)
  const assets = derivePsychologyLearnerAssets(courseTruthDir, examTruthPath)
  const byId = new Map<string, Requirement>()
  for (const file of readdirSync(courseTruthDir).filter((name) => /^topic-\d+.*\.json$/.test(name)).sort()) {
    const topic = JSON.parse(readFileSync(join(courseTruthDir, file), 'utf8')) as Topic
    for (const requirement of topic.requirements) {
      if (requirement.readiness.courseTruthStatus !== 'course_truth_ready' || requirement.readiness.materialSubjectTruthGap || requirement.readiness.materialRightsBlocker) throw new Error(`${requirement.requirementId} is not eligible for Step 5`)
      byId.set(requirement.requirementId, requirement)
    }
  }
  const unitByRequirement = new Map(blueprint.requirementUnits.map((unit) => [unit.knowledgeNodeIds[0], unit]))
  const rmUnits = blueprint.requirementUnits.filter((unit) => unit.topicNumber === 7 && unit.learningClassifications.includes('procedure_skill'))
  const quantitativeUnits = blueprint.requirementUnits.filter((unit) => unit.topicNumber === 7 && unit.learningClassifications.includes('formula_quantitative'))
  if (rmUnits.length === 0 || quantitativeUnits.length === 0) throw new Error('Research Methods and quantitative units are required for paper calibration')

  const practiceMappings = assets.practice.activities.map(practiceMapping)
  const practicePacks = assets.practice.activities.filter((activity) => !DEFERRED.has(activity.mode)).map((activity) => {
    const quotedMisconception = activity.mode === 'misconception_diagnostic'
      ? activity.prompt.match(/“([^”]+)”/)?.[1]
      : undefined
    const invalidReasoning = activity.options?.slice(1)
      ?? (quotedMisconception ? [quotedMisconception] : undefined)
    return makePack({
      itemId: activity.id,
      itemType: 'practice',
      prompt: activity.prompt,
      maxMark: 4,
      requirementIds: activity.requirementIds,
      blueprintUnitIds: activity.blueprintUnitIds,
      requirementsById: byId,
      ao: practiceAo(activity.mode),
      practiceMode: activity.mode,
      evidenceClaim: MODE_CLAIM[activity.mode],
      context: activity.context,
      alternatives: activity.options,
      fixedData: activity.fixedData,
      invalidReasoning,
    })
  })

  const topicQuestions = assets.examPrep.topicSets.flatMap((set) => set.questions)
  const topicMappings = topicQuestions.map(topicMapping)
  const topicPacks = topicQuestions.map((question) => {
    const material = materialiseTopic(question, byId)
    return makePack({ itemId: question.id, itemType: 'topic_exam_prep', prompt: material.prompt, maxMark: question.marks, requirementIds: question.requirementIds, blueprintUnitIds: question.blueprintUnitIds, requirementsById: byId, ao: topicAo(question), questionFamily: question.questionFamily, context: material.context, alternatives: material.alternatives, fixedData: material.fixedData, examTruthUse: true })
  })

  const fullPaperQuestionMarkingPacks: MarkingPack[] = []
  const scoredPaperSimulations = assets.examPrep.fullPaperSimulations.map((paper) => scorePaper(paper, byId, unitByRequirement, rmUnits, quantitativeUnits, fullPaperQuestionMarkingPacks))
  const aoTotals: Record<AO, number> = { AO1: 0, AO2: 0, AO3: 0 }
  scoredPaperSimulations.forEach((paper) => addAo(aoTotals, paper.aoTotalsForAnyValidAttempt))
  const totalRawMarks = scoredPaperSimulations.reduce((sum, paper) => sum + paper.attemptedMarks, 0)
  if (totalRawMarks !== 288) throw new Error(`Qualification total is ${totalRawMarks}, expected 288`)
  const rmMarks = scoredPaperSimulations.reduce((sum, paper) => sum + paper.researchMethodsMarksForAnyValidAttempt, 0)
  const mathMarks = scoredPaperSimulations.reduce((sum, paper) => sum + paper.mathematicalSkillsMarksForAnyValidAttempt, 0)
  const pct = (marks: number) => Number(((marks / totalRawMarks) * 100).toFixed(2))

  return {
    schemaVersion: 1,
    status: 'experimental_step_5_marking_evidence_complete',
    courseId: 'aqa:aqa-a-level:7182',
    inputBinding: { courseTruth: 'psychology-course-truth/manifest.json + topic shards', examTruth: 'psychology-exam-truth/assessment-blueprint.json', blueprint: 'psychology-course-learning-blueprint deterministic projection', learnerAssets: 'psychology-learner-assets deterministic projection' },
    practice: { evidenceMappings: practiceMappings, markingPacks: practicePacks },
    examPrep: { topicEvidenceMappings: topicMappings, topicMarkingPacks: topicPacks, scoredPaperSimulations, fullPaperQuestionMarkingPacks },
    qualificationCalibration: { totalRawMarks: 288, aoTotals, aoPercentages: { AO1: pct(aoTotals.AO1), AO2: pct(aoTotals.AO2), AO3: pct(aoTotals.AO3) }, researchMethodsMarks: rmMarks, researchMethodsPercentage: pct(rmMarks), mathematicalSkillsMarks: mathMarks, mathematicalSkillsPercentage: pct(mathMarks) },
    summary: { allItemsClassifiedForScoreability: true, allItemsRepresentedAsScoredHaveMarkingPacks: true, practiceEvidenceScopeNarrowingApplied: true, learnerAssetsMutated: false, runtimeEvidenceEnabled: false, markingPacksCompleteForStep5: false, markingPackCandidatesCompleteForStep5: true, independentCalibrationComplete: false, freshIndependentEducationalAssurancePassed: false, freshIndependentAssessmentAssurancePassed: false, canonicalRuntimeIntegrated: false, restrictedPilotPublicationApproved: false, paidProviderSpendGbp: 0, paidSourceLicenceSpendGbp: 0 },
  }
}
