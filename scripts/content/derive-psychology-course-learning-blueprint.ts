import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

type SubjectTruth = {
  definitionsAndCoreConcepts?: string[]
  modelsResearchAndRelationships?: string[]
  evaluationAndLimits?: string[]
  misconceptionsAndBoundaries?: string[]
  dependencies?: string[]
}

type CourseTruthRequirement = {
  requirementId: string
  boardAlignment: { summary: string; classification: string }
  subjectTruth: SubjectTruth
  readiness: {
    courseTruthStatus: string
    materialSubjectTruthGap: boolean
    materialRightsBlocker: boolean
  }
}

type CourseTruthTopic = {
  topicNumber: number
  topic: string
  requirements: CourseTruthRequirement[]
}

type TopicScope = { type: 'topic'; topicNumber: number; topic: string }
type OptionScope = { type: 'option_group'; choose: number; topicNumbers: number[]; topics: string[] }
type Section = { id: string; marks: number; scope: TopicScope | OptionScope }
type Paper = { id: string; name: string; primaryTopicNumbers: number[]; sections: Section[] }

type ExamTruth = {
  status: string
  assessmentModel: { papers: Paper[] }
  assessmentObjectives: Record<'AO1' | 'AO2' | 'AO3', { overallPercentRange: [number, number] }>
  crossPaperConstraints: {
    researchMethodsOverallPercentRange: [number, number]
    researchMethodsAssessment: { alsoAssessableIn: string[] }
    mathematicalSkillsOverallPercentMinimum: number
    mathematicalSkillsAlsoAssessableIn: string[]
    synopticExpectation: string
  }
  questionFamilies: Array<{ id: string }>
  commandDemandModel: { commands: Record<string, string[]> }
  extendedResponse: { requiredAcrossAlevelAssessment: boolean; fixedMaximumEssayCountPerPaper: boolean; maximumTariffMarks: number }
  completion: { courseTruthComplete: boolean; examTruthComplete: boolean }
}

export type LearningClassification =
  | 'fact_term'
  | 'concept'
  | 'comparison_discrimination'
  | 'relationship_causal'
  | 'process_sequence'
  | 'formula_quantitative'
  | 'model_framework'
  | 'procedure_skill'
  | 'application_context'
  | 'analysis_reasoning'
  | 'evaluation_judgement'
  | 'misconception_risk'
  | 'synoptic_connection'

export type RequirementLearningUnit = {
  id: string
  courseId: string
  foundationFingerprint: 'not_applicable_source_first_experiment'
  knowledgeNodeIds: string[]
  prerequisiteNodeIds: string[]
  topicNumber: number
  topic: string
  learningClassifications: LearningClassification[]
  requiredDepthDifficulty: {
    qualification: 'A-level'
    knowledgeDepth: 'complete_course_truth'
    highestDemand: 'apply' | 'analyse_explain' | 'evaluate_judge'
  }
  learnTreatments: string[]
  practiceEvidenceModes: string[]
  examDemandLinks: Array<{
    paperId: string
    paperName: string
    sectionId: string
    sectionMarks: number
    scopeType: 'topic' | 'option_group'
    optionChoose?: number
    optionTopicNumbers?: number[]
    questionFamilies: string[]
    commandDemandClasses: string[]
  }>
  misconceptionIds: string[]
  applicationContextRequirements: {
    required: true
    requiresVariationWhereBreadthNeeded: true
    mayReuseOnlyLearnScenario: false
  }
  quantitativeVisualWorkedExampleRequirements: {
    workedExampleRequired: boolean
    fadedGuidedExampleRequired: boolean
    purposefulVisualRequired: boolean
    independentlyCheckableQuantitativeWork: boolean
  }
  synopticMixedPracticeLinks: string[]
  scaffoldingFadingRequirements: {
    required: boolean
    progression: string[]
    independentPerformanceRequiredForEvidence: boolean
  }
  permittedEvidenceClaims: {
    learn: ['reviewed_only']
    practice: string[]
    examPrep: ['assessment_relevant_only_when_activity_and_marking_contract_support_it']
  }
  accessibilityMediaRequirements: {
    meaningfulTextAlternativeForPurposefulVisual: boolean
    colourNotSoleMeaningCarrier: true
    captionsTranscriptsControlsWhenMediaUsed: true
    mobileMustPreserveLearningSequence: true
  }
  provenance: {
    courseTruthRequirementId: string
    courseTruthTopicFile: string
    boardAlignmentUseClass: 'REFERENCE_ONLY'
    subjectTruthUse: 'rights_safe_course_truth_only'
  }
}

export type ExamSkillUnit = {
  id: string
  learningClassifications: Array<LearningClassification | 'exam_response_skill'>
  paperIds: string[]
  examPrepTreatments: string[]
  evidenceScope: string
  provenance: 'psychology-exam-truth/assessment-blueprint.json'
}

export type PsychologyCourseLearningBlueprint = {
  schemaVersion: 1
  status: 'experimental_course_learning_blueprint_complete'
  courseId: 'aqa:aqa-a-level:7182'
  foundationFingerprint: 'not_applicable_source_first_experiment'
  inputBinding: {
    courseTruth: 'psychology-course-truth/manifest.json + topic shards'
    examTruth: 'psychology-exam-truth/assessment-blueprint.json'
  }
  requirementUnits: RequirementLearningUnit[]
  examSkillUnits: ExamSkillUnit[]
  summary: {
    requirementUnitCount: number
    examSkillUnitCount: number
    courseTruthRequirementCount: number
    assetQuotaPolicy: 'none'
    paidProviderSpendGbp: 0
    paidSourceLicenceSpendGbp: 0
    freshIndependentEducationalAssurancePassed: false
    freshIndependentAssessmentAssurancePassed: false
    learnerAssetReady: false
    restrictedPilotPublicationApproved: false
  }
}

const COMPARISON = /\b(compare|comparison|contrast|distinguish|distinction|difference|differences|different|types|categories|classification|versus|vs\.?|similarities)\b/i
const RELATIONSHIP = /\b(cause|causal|causes|effect|effects|affect|affects|influence|influences|relationship|relationships|associated|association|predict|predicts|mechanism|mechanisms|leads? to|results? in)\b/i
const PROCESS = /\b(process|processes|sequence|sequences|stage|stages|step|steps|cycle|cycles)\b/i
const QUANTITATIVE = /\b(calculate|calculation|calculations|mean|median|mode|range|standard deviation|correlation coefficient|scattergram|probability|significance|significant|p-value|critical value|sign test|percentage|percentages|ratio|ratios)\b/i
const MODEL = /\b(model|models|theory|theories|approach|approaches|framework|frameworks|account|accounts|explanation|explanations)\b/i
const PROCEDURE = /\b(method|methods|design|designs|procedure|procedures|operationalis\w*|sampling|sample|observation|questionnaire|interview|hypothesis|variables?|reliability|validity|ethic\w*|peer review|replication)\b/i
const SYNOPTIC = /\b(synoptic|cross-topic|cross topic|across topics|across the course)\b/i

function unique<T>(values: T[]): T[] {
  return [...new Set(values)]
}

function strings(value?: string[]): string[] {
  return value ?? []
}

function requirementText(requirement: CourseTruthRequirement): string {
  const truth = requirement.subjectTruth
  return [
    requirement.boardAlignment.summary,
    ...strings(truth.definitionsAndCoreConcepts),
    ...strings(truth.modelsResearchAndRelationships),
    ...strings(truth.evaluationAndLimits),
    ...strings(truth.misconceptionsAndBoundaries),
    ...strings(truth.dependencies),
  ].join(' ')
}

function classifyRequirement(topic: CourseTruthTopic, requirement: CourseTruthRequirement): LearningClassification[] {
  const truth = requirement.subjectTruth
  const text = requirementText(requirement)
  const classifications: LearningClassification[] = ['application_context']

  if (strings(truth.definitionsAndCoreConcepts).length > 0) classifications.push('fact_term', 'concept')
  if (COMPARISON.test(text)) classifications.push('comparison_discrimination')
  if (RELATIONSHIP.test(text)) classifications.push('relationship_causal')
  if (PROCESS.test(text)) classifications.push('process_sequence')
  const quantitativeTruth = strings(truth.definitionsAndCoreConcepts).join(' ')
  if (topic.topicNumber === 7 && QUANTITATIVE.test(quantitativeTruth)) classifications.push('formula_quantitative')
  if (MODEL.test(text)) classifications.push('model_framework')
  if (topic.topicNumber === 7 || PROCEDURE.test(text)) classifications.push('procedure_skill')
  if (strings(truth.modelsResearchAndRelationships).length > 0 || strings(truth.evaluationAndLimits).length > 0) classifications.push('analysis_reasoning')
  if (strings(truth.evaluationAndLimits).length > 0) classifications.push('evaluation_judgement')
  if (strings(truth.misconceptionsAndBoundaries).length > 0) classifications.push('misconception_risk')
  if (topic.topicNumber === 8 || SYNOPTIC.test(text)) classifications.push('synoptic_connection')

  return unique(classifications)
}

function paperPlacement(examTruth: ExamTruth, topicNumber: number) {
  for (const paper of examTruth.assessmentModel.papers) {
    for (const section of paper.sections) {
      if (section.scope.type === 'topic' && section.scope.topicNumber === topicNumber) return { paper, section, scope: section.scope }
      if (section.scope.type === 'option_group' && section.scope.topicNumbers.includes(topicNumber)) return { paper, section, scope: section.scope }
    }
  }
  throw new Error(`No Exam Truth placement for topic ${topicNumber}`)
}

function practiceEvidenceClaims(modes: string[]): string[] {
  const claims: string[] = []
  if (modes.includes('retrieval_prompt_flashcard')) claims.push('knowledge_recall')
  if (modes.includes('recognition_discrimination_check') || modes.includes('classification_matching_ordering')) claims.push('discrimination_or_structure')
  if (modes.includes('short_constructed_response')) claims.push('selected_knowledge_and_explanation')
  if (modes.includes('contextual_application_scenario')) claims.push('contextual_application')
  if (modes.includes('reasoning_chain_construction')) claims.push('analysis_reasoning')
  if (modes.includes('compare_justify_task')) claims.push('comparison_or_evaluation_judgement')
  if (modes.includes('calculation_quantitative_drill')) claims.push('quantitative_execution')
  if (modes.includes('interpretation_data_graph_source')) claims.push('data_interpretation')
  if (modes.includes('misconception_diagnostic')) claims.push('misconception_discrimination')
  if (modes.includes('mixed_topic_retrieval')) claims.push('synoptic_selection')
  return unique(claims)
}

function deriveTreatments(classifications: LearningClassification[], topicNumber: number) {
  const has = (classification: LearningClassification) => classifications.includes(classification)
  const learn = ['core_explanation']
  const practice = ['short_constructed_response', 'contextual_application_scenario']

  if (has('fact_term')) learn.push('definition_in_context', 'memory_anchor_recap')
  if (has('fact_term')) practice.push('retrieval_prompt_flashcard')
  if (has('concept')) learn.push('example_non_example')
  if (has('comparison_discrimination')) {
    learn.push('comparison')
    practice.push('recognition_discrimination_check', 'compare_justify_task')
  }
  if (has('relationship_causal')) {
    learn.push('relationship_causal_chain')
    practice.push('reasoning_chain_construction')
  }
  if (has('process_sequence')) {
    learn.push('process_sequence', 'purposeful_visual')
    practice.push('classification_matching_ordering')
  }
  if (has('formula_quantitative')) {
    learn.push('worked_example', 'faded_guided_example', 'purposeful_visual')
    practice.push('calculation_quantitative_drill', 'interpretation_data_graph_source')
  }
  if (has('model_framework')) learn.push('example_non_example')
  if (has('procedure_skill')) learn.push('worked_example', 'faded_guided_example')
  if (has('analysis_reasoning')) {
    learn.push('worked_example', 'self_explanation_prompt')
    practice.push('reasoning_chain_construction')
  }
  if (has('evaluation_judgement')) practice.push('compare_justify_task')
  if (has('misconception_risk')) {
    learn.push('misconception_repair')
    practice.push('misconception_diagnostic')
  }
  if (has('synoptic_connection')) {
    learn.push('connection_synoptic_link')
    practice.push('mixed_topic_retrieval', 'reasoning_chain_construction')
  }
  if (topicNumber === 6) learn.push('purposeful_visual')

  return { learn: unique(learn), practice: unique(practice) }
}

function questionFamiliesFor(classifications: LearningClassification[], topicNumber: number): string[] {
  const families = ['short_answer', 'scenario_application']
  if (classifications.includes('fact_term')) families.push('mcq')
  if (classifications.includes('analysis_reasoning') || classifications.includes('evaluation_judgement')) families.push('extended_writing')
  if (topicNumber === 7) families.push('research_methods_practical')
  if (classifications.includes('formula_quantitative')) families.push('data_math')
  return unique(families)
}

function commandDemandClassesFor(classifications: LearningClassification[]): string[] {
  const classes = ['description_outline', 'explanation_application']
  if (classifications.includes('fact_term')) classes.push('selection_recall')
  if (classifications.includes('comparison_discrimination')) classes.push('comparison')
  if (classifications.includes('analysis_reasoning') || classifications.includes('evaluation_judgement')) classes.push('analysis_judgement')
  if (classifications.includes('formula_quantitative') || classifications.includes('procedure_skill')) classes.push('practical_quantitative')
  return unique(classes)
}

function deriveRequirementUnit(topic: CourseTruthTopic, topicFile: string, requirement: CourseTruthRequirement, examTruth: ExamTruth): RequirementLearningUnit {
  if (requirement.boardAlignment.classification !== 'REFERENCE_ONLY') throw new Error(`${requirement.requirementId} board alignment must remain REFERENCE_ONLY`)
  if (requirement.readiness.courseTruthStatus !== 'course_truth_ready') throw new Error(`${requirement.requirementId} is not course_truth_ready`)
  if (requirement.readiness.materialSubjectTruthGap || requirement.readiness.materialRightsBlocker) throw new Error(`${requirement.requirementId} has an unresolved Course Truth blocker`)

  const classifications = classifyRequirement(topic, requirement)
  const treatments = deriveTreatments(classifications, topic.topicNumber)
  const placement = paperPlacement(examTruth, topic.topicNumber)
  const analysis = classifications.includes('analysis_reasoning')
  const evaluation = classifications.includes('evaluation_judgement')
  const quantitative = classifications.includes('formula_quantitative')
  const procedure = classifications.includes('procedure_skill')
  const purposefulVisual = treatments.learn.includes('purposeful_visual')
  const faded = quantitative || procedure

  return {
    id: `BLP-${requirement.requirementId}`,
    courseId: 'aqa:aqa-a-level:7182',
    foundationFingerprint: 'not_applicable_source_first_experiment',
    knowledgeNodeIds: [requirement.requirementId],
    prerequisiteNodeIds: [],
    topicNumber: topic.topicNumber,
    topic: topic.topic,
    learningClassifications: classifications,
    requiredDepthDifficulty: {
      qualification: 'A-level',
      knowledgeDepth: 'complete_course_truth',
      highestDemand: evaluation ? 'evaluate_judge' : analysis ? 'analyse_explain' : 'apply',
    },
    learnTreatments: treatments.learn,
    practiceEvidenceModes: treatments.practice,
    examDemandLinks: [{
      paperId: placement.paper.id,
      paperName: placement.paper.name,
      sectionId: placement.section.id,
      sectionMarks: placement.section.marks,
      scopeType: placement.scope.type,
      ...(placement.scope.type === 'option_group' ? { optionChoose: placement.scope.choose, optionTopicNumbers: placement.scope.topicNumbers } : {}),
      questionFamilies: questionFamiliesFor(classifications, topic.topicNumber),
      commandDemandClasses: commandDemandClassesFor(classifications),
    }],
    misconceptionIds: strings(requirement.subjectTruth.misconceptionsAndBoundaries).map((_, index) => `${requirement.requirementId}-M${index + 1}`),
    applicationContextRequirements: {
      required: true,
      requiresVariationWhereBreadthNeeded: true,
      mayReuseOnlyLearnScenario: false,
    },
    quantitativeVisualWorkedExampleRequirements: {
      workedExampleRequired: quantitative || procedure || analysis,
      fadedGuidedExampleRequired: faded,
      purposefulVisualRequired: purposefulVisual,
      independentlyCheckableQuantitativeWork: quantitative,
    },
    synopticMixedPracticeLinks: classifications.includes('synoptic_connection') ? ['cross_topic_selection', 'later_mixed_practice'] : [],
    scaffoldingFadingRequirements: {
      required: faded,
      progression: faded ? ['model_or_worked_example', 'guided_or_faded_attempt', 'independent_attempt'] : ['independent_attempt_after_teaching'],
      independentPerformanceRequiredForEvidence: quantitative || procedure,
    },
    permittedEvidenceClaims: {
      learn: ['reviewed_only'],
      practice: practiceEvidenceClaims(treatments.practice),
      examPrep: ['assessment_relevant_only_when_activity_and_marking_contract_support_it'],
    },
    accessibilityMediaRequirements: {
      meaningfulTextAlternativeForPurposefulVisual: purposefulVisual,
      colourNotSoleMeaningCarrier: true,
      captionsTranscriptsControlsWhenMediaUsed: true,
      mobileMustPreserveLearningSequence: true,
    },
    provenance: {
      courseTruthRequirementId: requirement.requirementId,
      courseTruthTopicFile: topicFile,
      boardAlignmentUseClass: 'REFERENCE_ONLY',
      subjectTruthUse: 'rights_safe_course_truth_only',
    },
  }
}

function examSkillUnits(examTruth: ExamTruth): ExamSkillUnit[] {
  const paperIds = examTruth.assessmentModel.papers.map((paper) => paper.id)
  return [
    {
      id: 'PSY-EXAM-PAPER-ORIENTATION',
      learningClassifications: ['exam_response_skill'],
      paperIds,
      examPrepTreatments: ['paper_component_orientation', 'question_family_walkthrough', 'full_paper_component_simulation'],
      evidenceScope: 'paper structure, timing, section/option navigation and authentic whole-paper completion only',
      provenance: 'psychology-exam-truth/assessment-blueprint.json',
    },
    {
      id: 'PSY-EXAM-COMMAND-DEMAND',
      learningClassifications: ['exam_response_skill', 'application_context'],
      paperIds,
      examPrepTreatments: ['command_demand_guidance', 'question_family_walkthrough', 'independent_exam_style_question', 'marking_feedback_repair_interaction'],
      evidenceScope: 'selecting and executing the response demanded by the command/stem',
      provenance: 'psychology-exam-truth/assessment-blueprint.json',
    },
    {
      id: 'PSY-EXAM-EXTENDED-RESPONSE',
      learningClassifications: ['exam_response_skill', 'analysis_reasoning', 'evaluation_judgement'],
      paperIds,
      examPrepTreatments: ['annotated_model_anchor_response', 'worked_exam_response', 'faded_scaffolded_exam_response', 'independent_exam_style_question', 'targeted_timed_question', 'marking_feedback_repair_interaction'],
      evidenceScope: 'independent constructed-response reasoning at the tariff and AO demand of the Revision-owned item',
      provenance: 'psychology-exam-truth/assessment-blueprint.json',
    },
    {
      id: 'PSY-EXAM-RESEARCH-METHOD-TRANSFER',
      learningClassifications: ['exam_response_skill', 'procedure_skill', 'application_context', 'analysis_reasoning'],
      paperIds: examTruth.crossPaperConstraints.researchMethodsAssessment.alsoAssessableIn,
      examPrepTreatments: ['source_case_data_handling_guidance', 'question_family_walkthrough', 'worked_exam_response', 'faded_scaffolded_exam_response', 'independent_exam_style_question', 'targeted_timed_question'],
      evidenceScope: 'research-method selection, design, refinement and evaluation in supplied contexts',
      provenance: 'psychology-exam-truth/assessment-blueprint.json',
    },
    {
      id: 'PSY-EXAM-DATA-MATH',
      learningClassifications: ['exam_response_skill', 'formula_quantitative', 'procedure_skill', 'analysis_reasoning'],
      paperIds: examTruth.crossPaperConstraints.mathematicalSkillsAlsoAssessableIn,
      examPrepTreatments: ['source_case_data_handling_guidance', 'worked_exam_response', 'faded_scaffolded_exam_response', 'independent_exam_style_question', 'targeted_timed_question', 'marking_feedback_repair_interaction'],
      evidenceScope: 'independently recomputable quantitative execution and valid data interpretation',
      provenance: 'psychology-exam-truth/assessment-blueprint.json',
    },
    {
      id: 'PSY-EXAM-SYNOPTIC-P3',
      learningClassifications: ['exam_response_skill', 'synoptic_connection', 'analysis_reasoning', 'evaluation_judgement'],
      paperIds: ['7182/3'],
      examPrepTreatments: ['question_family_walkthrough', 'annotated_model_anchor_response', 'independent_exam_style_question', 'mixed_synoptic_exam_set', 'timed_section', 'marking_feedback_repair_interaction'],
      evidenceScope: 'cross-topic selection, synthesis, analysis and justified judgement under Paper 3 demand',
      provenance: 'psychology-exam-truth/assessment-blueprint.json',
    },
  ]
}

export function derivePsychologyCourseLearningBlueprint(courseTruthDir: string, examTruthPath: string): PsychologyCourseLearningBlueprint {
  const examTruth = JSON.parse(readFileSync(examTruthPath, 'utf8')) as ExamTruth
  if (examTruth.status !== 'experimental_exam_truth_complete' || !examTruth.completion.courseTruthComplete || !examTruth.completion.examTruthComplete) {
    throw new Error('Psychology Course Truth + Exam Truth must be complete before Blueprint derivation')
  }

  const topicFiles = readdirSync(courseTruthDir)
    .filter((name) => /^topic-\d+.*\.json$/.test(name))
    .sort()

  const requirementUnits = topicFiles.flatMap((topicFile) => {
    const topic = JSON.parse(readFileSync(join(courseTruthDir, topicFile), 'utf8')) as CourseTruthTopic
    return topic.requirements.map((requirement) => deriveRequirementUnit(topic, topicFile, requirement, examTruth))
  })

  return {
    schemaVersion: 1,
    status: 'experimental_course_learning_blueprint_complete',
    courseId: 'aqa:aqa-a-level:7182',
    foundationFingerprint: 'not_applicable_source_first_experiment',
    inputBinding: {
      courseTruth: 'psychology-course-truth/manifest.json + topic shards',
      examTruth: 'psychology-exam-truth/assessment-blueprint.json',
    },
    requirementUnits,
    examSkillUnits: examSkillUnits(examTruth),
    summary: {
      requirementUnitCount: requirementUnits.length,
      examSkillUnitCount: 6,
      courseTruthRequirementCount: requirementUnits.length,
      assetQuotaPolicy: 'none',
      paidProviderSpendGbp: 0,
      paidSourceLicenceSpendGbp: 0,
      freshIndependentEducationalAssurancePassed: false,
      freshIndependentAssessmentAssurancePassed: false,
      learnerAssetReady: false,
      restrictedPilotPublicationApproved: false,
    },
  }
}
