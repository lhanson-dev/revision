import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import {
  derivePsychologyCourseLearningBlueprint,
  type RequirementLearningUnit,
} from './derive-psychology-course-learning-blueprint'

type SourceEvidence = {
  url: string
  classification: string
  licence?: string
}

type SubjectTruth = {
  definitionsAndCoreConcepts?: string[]
  modelsResearchAndRelationships?: string[]
  evaluationAndLimits?: string[]
  misconceptionsAndBoundaries?: string[]
  dependencies?: string[]
}

type CourseTruthRequirement = {
  requirementId: string
  boardAlignment: { summary: string; officialSource: string; classification: string }
  subjectTruth: SubjectTruth
  sourceEvidence?: SourceEvidence[]
  revisionSynthesis?: string[]
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
type ExamSection = { id: string; marks: number; scope: TopicScope | OptionScope }
type ExamPaper = {
  id: string
  name: string
  durationMinutes: number
  rawMarks: number
  sections: ExamSection[]
  attemptRule?: string
}

type ExamTruth = {
  status: string
  assessmentModel: { papers: ExamPaper[] }
  assessmentObjectives: Record<string, { overallPercentRange: [number, number] }>
  crossPaperConstraints: {
    researchMethodsOverallPercentRange: [number, number]
    researchMethodsAssessment: {
      dedicatedPaper2Section: { paper: string; section: string; marks: number }
      alsoAssessableIn: string[]
    }
    mathematicalSkillsOverallPercentMinimum: number
    mathematicalSkillsAlsoAssessableIn: string[]
    synopticExpectation: string
  }
  questionFamilies: Array<{ id: string; name: string; maximumMarks?: number }>
  commandDemandModel: { commands: Record<string, string[]> }
  extendedResponse: { maximumTariffMarks: number; fixedMaximumEssayCountPerPaper: boolean }
}

export type LearnerVisualSpec = {
  purpose: string
  format: 'process_diagram' | 'relationship_diagram' | 'data_display'
  textAlternative: string
}

export type WorkedExample = {
  title: string
  setup: string
  task: string
  steps: string[]
  conclusion: string
}

export type QuantitativeWorkedExample = {
  title: string
  data: number[] | Array<[number, number]>
  task: string
  workedSteps: string[]
  result: string
}

export type LearnSection = {
  id: string
  title: string
  requirementIds: string[]
  blueprintUnitIds: string[]
  learningGoal: string
  explanationParagraphs: string[]
  researchAndRelationshipParagraphs: string[]
  evaluationParagraphs: string[]
  misconceptionRepairs: Array<{ misconception: string; repair: string }>
  memoryRecap: string[]
  treatmentCoverage: string[]
  workedExample?: WorkedExample
  quantitativeWorkedExample?: QuantitativeWorkedExample
  visual?: LearnerVisualSpec
  provenance: {
    courseTruthTopicFile: string
    courseTruthRequirementIds: string[]
    blueprintUnitIds: string[]
    sourceEvidence: SourceEvidence[]
    boardAlignmentUse: 'placement_only_reference_not_learner_text'
  }
}

export type LearnChapter = {
  id: string
  topicNumber: number
  topic: string
  title: string
  introduction: string
  sections: LearnSection[]
}

export type PracticeActivity = {
  id: string
  topicNumber: number
  topic: string
  requirementIds: string[]
  blueprintUnitIds: string[]
  mode: string
  title: string
  prompt: string
  support?: string[]
  options?: string[]
  context?: string
  fixedData?: number[] | Array<[number, number]>
  feedbackAnchor: string[]
  intendedEvidenceScope: string[]
  evidenceEligible: false
  scoringStatus: 'marking_pack_pending_step_5'
  repairExtension?: string
  provenance: { courseTruthRequirementId: string; blueprintUnitId: string }
}

export type TopicExamPrepSet = {
  id: string
  topicNumber: number
  topic: string
  paperId: string
  sectionId: string
  requirementIds: string[]
  questionFamiliesRepresented: string[]
  commandDemandClassesRepresented: string[]
  questions: ExamPrepQuestion[]
  scoringStatus: 'marking_pack_pending_step_5'
}

export type ExamPrepQuestion = {
  id: string
  command: string
  marks: number
  questionFamily: string
  prompt: string
  requirementIds: string[]
  blueprintUnitIds: string[]
  timingGuidanceMinutes: number
  revisionOwned: true
  officialAqaMaterial: false
  markingPackStatus: 'pending_step_5'
}

export type FullPaperSimulation = {
  id: string
  paperId: string
  paperName: string
  durationMinutes: number
  attemptedMarks: number
  sections: Array<{
    id: string
    marks: number
    topicNumber?: number
    topic?: string
    choose?: number
    options?: Array<{
      topicNumber: number
      topic: string
      questions: ExamPrepQuestion[]
      marks: number
    }>
    questions?: ExamPrepQuestion[]
  }>
  revisionOwned: true
  officialAqaMaterial: false
  calibrationRule: string
  markingPackStatus: 'pending_step_5'
}

export type ExamSkillModule = {
  id: string
  title: string
  paperIds: string[]
  guidance: string[]
  treatments: string[]
  evidenceScope: string
  markingBoundary: string
}

export type PsychologyLearnerAssets = {
  schemaVersion: 1
  status: 'experimental_learner_asset_candidate_complete'
  courseId: 'aqa:aqa-a-level:7182'
  inputBinding: {
    courseTruth: 'psychology-course-truth/manifest.json + topic shards'
    examTruth: 'psychology-exam-truth/assessment-blueprint.json'
    blueprint: 'psychology-course-learning-blueprint deterministic projection'
  }
  learn: { chapters: LearnChapter[] }
  practice: { activities: PracticeActivity[] }
  examPrep: {
    skillModules: ExamSkillModule[]
    topicSets: TopicExamPrepSet[]
    fullPaperSimulations: FullPaperSimulation[]
  }
  summary: {
    topicCount: number
    requirementCount: number
    learnChapterCount: number
    learnSectionCount: number
    practiceActivityCount: number
    examSkillModuleCount: number
    topicExamPrepSetCount: number
    fullPaperSimulationCount: number
    paidProviderSpendGbp: 0
    paidSourceLicenceSpendGbp: 0
    learnerAssetCorpusComplete: true
    markingPacksComplete: false
    freshIndependentEducationalAssurancePassed: false
    freshIndependentAssessmentAssurancePassed: false
    canonicalRuntimeIntegrated: false
    restrictedPilotPublicationApproved: false
  }
}

const text = (values?: string[]): string[] => values ?? []

function unique<T>(values: T[]): T[] {
  return [...new Set(values)]
}

const REUSABLE_SOURCE_CLASSES = new Set(['OPEN', 'LICENSED', 'REVISION_OWNED'])

function tidyLabel(value: string): string {
  return value
    .replace(/^(a|an|the)\s+/i, '')
    .replace(/[.:;]+$/, '')
    .trim()
}

function sentenceLabel(sentence: string): string | undefined {
  const inMatch = sentence.match(/^In\s+([^,]{2,80}),/i)
  if (inMatch?.[1]) return tidyLabel(inMatch[1])

  const verbMatch = sentence.match(/^(.{2,100}?)\s+(?:is|are|refers to|means|involves|concerns|describes|occurs when|reflects|treats|proposes|examine|examines|argues|focuses on|uses|specifies|classifies|summarises|summarizes|measures|expresses|influences|links|predicts|can)\b/i)
  if (verbMatch?.[1]) return tidyLabel(verbMatch[1])

  const clause = tidyLabel(sentence.split(/[,:;]/)[0])
  if (clause.length >= 3 && clause.length <= 70 && !/^PSY-\d/i.test(clause)) return clause
  return undefined
}

function conceptCandidates(requirement: CourseTruthRequirement): string[] {
  const fromCore = text(requirement.subjectTruth.definitionsAndCoreConcepts)
    .map(sentenceLabel)
    .filter((value): value is string => Boolean(value))
  const fromDependencies = text(requirement.subjectTruth.dependencies)
    .map(tidyLabel)
    .filter((value) => value.length >= 3 && !/^PSY-\d/i.test(value))
  const seen = new Set<string>()
  return [...fromCore, ...fromDependencies].filter((value) => {
    const key = value.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function conceptLabel(requirement: CourseTruthRequirement): string {
  return conceptCandidates(requirement)[0] ?? 'this psychological concept'
}

function practiceFocus(requirement: CourseTruthRequirement, index: number): string {
  const candidates = conceptCandidates(requirement)
  return candidates.length > 0 ? candidates[index % candidates.length] : conceptLabel(requirement)
}

function comparisonTarget(requirement: CourseTruthRequirement, focus: string): string {
  const focusKey = focus.toLowerCase()
  return conceptCandidates(requirement).find((candidate) => candidate.toLowerCase() !== focusKey)
    ?? 'a contrasting explanation from the same topic'
}

export function psychologyMisconceptionFromBoundary(boundary: string | undefined, label: string): string {
  if (boundary) {
    const transforms: Array<[RegExp, string]> = [
      [/\bdoes not\b/i, 'does'],
      [/\bis not\b/i, 'is'],
      [/\bare not\b/i, 'are'],
      [/\bdo not\b/i, 'do'],
      [/\bshould not\b/i, 'should'],
      [/\bcannot\b/i, 'can always'],
    ]
    for (const [pattern, replacement] of transforms) {
      if (pattern.test(boundary)) return boundary.replace(pattern, replacement)
    }
    if (/^There is no single\s+/i.test(boundary)) return boundary.replace(/^There is no single\s+/i, 'There is a single ')
  }
  return `${label} has one fixed cause, meaning or outcome and applies the same way in every person and context.`
}

function quantitativeExample(requirement: CourseTruthRequirement, label: string): QuantitativeWorkedExample {
  const joined = [
    ...text(requirement.subjectTruth.definitionsAndCoreConcepts),
    ...text(requirement.subjectTruth.modelsResearchAndRelationships),
    ...text(requirement.subjectTruth.dependencies),
  ].join(' ').toLowerCase()

  if (/sign test/.test(joined)) {
    return {
      title: `Worked sign-test example: ${label}`,
      data: [[5, 7], [6, 6], [9, 4], [3, 8], [7, 9]],
      task: 'Assign a sign to each non-tied before/after pair, remove the tie, state the effective n and identify the smaller sign count.',
      workedSteps: [
        'The five differences are +, tie, −, + and +.',
        'Remove the tied pair, so the effective n is 4.',
        'There are three plus signs and one minus sign, so the smaller sign count is 1.',
      ],
      result: 'Effective n = 4; smaller sign count = 1. A significance decision would then use the table convention supplied for that n and alpha.',
    }
  }

  if (/significance|p-value|critical value|type i|type ii/.test(joined)) {
    return {
      title: `Worked significance example: ${label}`,
      data: [0.03, 0.05],
      task: 'Compare the constructed p-value 0.03 with alpha = 0.05 and state the decision without turning p into the probability that a hypothesis is true.',
      workedSteps: [
        'The pre-specified significance threshold is 0.05.',
        'The p-value 0.03 is below 0.05.',
        'Reject the null hypothesis at the 5% level, while keeping the conclusion limited to the statistical decision.',
      ],
      result: 'p = 0.03 < 0.05, so the null hypothesis is rejected at the stated threshold; this does not mean the research hypothesis has a 97% probability of being true.',
    }
  }

  if (/correlation|scattergram|co-variable/.test(joined)) {
    return {
      title: `Worked data example: ${label}`,
      data: [[1, 2], [2, 4], [3, 6], [4, 8]],
      task: 'Inspect the paired values and determine the direction and strength pattern before deciding what can and cannot be concluded.',
      workedSteps: [
        'As the first value increases, the second value also increases on every pair.',
        'The pairs lie on an exact increasing linear pattern, so the association is perfectly positive in this constructed dataset.',
        'Association alone does not establish that one variable caused the other.',
      ],
      result: 'A perfect positive association is present in the constructed data; causal inference is not justified by correlation alone.',
    }
  }

  if (/percentage|ratio|proportion|frequency/.test(joined)) {
    return {
      title: `Worked quantitative example: ${label}`,
      data: [18, 30],
      task: 'Convert the first value out of the second value into a percentage.',
      workedSteps: ['Divide 18 by 30.', 'Multiply the result by 100.', '0.6 × 100 = 60.'],
      result: '60%',
    }
  }

  return {
    title: `Worked descriptive-data example: ${label}`,
    data: [4, 6, 6, 8, 11],
    task: 'Use the constructed dataset to calculate and interpret simple descriptive summaries relevant to this quantitative learning focus.',
    workedSteps: [
      'The values are already ordered: 4, 6, 6, 8, 11.',
      'The mean is (4 + 6 + 6 + 8 + 11) ÷ 5 = 7.',
      'The median is the middle value, 6; the mode is 6; the range is 11 − 4 = 7.',
    ],
    result: 'Mean 7; median 6; mode 6; range 7. Each statistic describes a different feature of the same constructed dataset.',
  }
}

function workedReasoningExample(requirement: CourseTruthRequirement, label: string): WorkedExample {
  const core = text(requirement.subjectTruth.definitionsAndCoreConcepts)
  const relationships = text(requirement.subjectTruth.modelsResearchAndRelationships)
  const evaluation = text(requirement.subjectTruth.evaluationAndLimits)
  const candidates = unique([...relationships, ...core.slice(1), ...evaluation])
  const steps = candidates.slice(0, 3)
  return {
    title: `Worked reasoning example: ${label}`,
    setup: core[0] ?? `Use the rights-safe subject truth for ${label} as the starting point.`,
    task: `Use the supplied setup to build a three-step explanation of ${label}, then state a conclusion that does not exceed the evidence.`,
    steps: steps.length > 0 ? steps : [`Apply the stated definition of ${label} to the exact evidence in the example and keep the conclusion within that evidence.`],
    conclusion: evaluation[0] ?? candidates[candidates.length - 1] ?? `The conclusion about ${label} must stay proportionate to the evidence.`,
  }
}

function visualFor(unit: RequirementLearningUnit, label: string, requirement: CourseTruthRequirement): LearnerVisualSpec | undefined {
  if (!unit.quantitativeVisualWorkedExampleRequirements.purposefulVisualRequired) return undefined
  const format: LearnerVisualSpec['format'] = unit.learningClassifications.includes('formula_quantitative')
    ? 'data_display'
    : unit.learningClassifications.includes('process_sequence')
      ? 'process_diagram'
      : 'relationship_diagram'
  const core = text(requirement.subjectTruth.definitionsAndCoreConcepts)
  const relationships = text(requirement.subjectTruth.modelsResearchAndRelationships)
  const evidence = unique([...core.slice(0, 2), ...relationships.slice(0, 2)])
  const textAlternative = unit.learningClassifications.includes('formula_quantitative')
    ? (() => {
        const worked = quantitativeExample(requirement, label)
        return `Information-equivalent data description: ${worked.task} Constructed data: ${JSON.stringify(worked.data)}. Worked conclusion: ${worked.result}`
      })()
    : `Information-equivalent ${format === 'process_diagram' ? 'sequence' : 'relationship'}: ${evidence.join(' → ')}`
  return {
    purpose: `Make the structure of ${label} easier to inspect without replacing the written explanation.`,
    format,
    textAlternative,
  }
}

function makeLearnSection(
  topicFile: string,
  requirement: CourseTruthRequirement,
  unit: RequirementLearningUnit,
): LearnSection {
  const label = conceptLabel(requirement)
  const misconceptions = text(requirement.subjectTruth.misconceptionsAndBoundaries)
  const quantitative = unit.learningClassifications.includes('formula_quantitative')
  const workedRequired = unit.quantitativeVisualWorkedExampleRequirements.workedExampleRequired
  const sourceEvidence = (requirement.sourceEvidence ?? []).filter((source) => REUSABLE_SOURCE_CLASSES.has(source.classification))

  return {
    id: `LEARN-${requirement.requirementId}`,
    title: label,
    requirementIds: [requirement.requirementId],
    blueprintUnitIds: [unit.id],
    learningGoal: `Understand ${label}, use it accurately in unfamiliar contexts, and recognise the limits of what it can explain or demonstrate.`,
    explanationParagraphs: text(requirement.subjectTruth.definitionsAndCoreConcepts),
    researchAndRelationshipParagraphs: text(requirement.subjectTruth.modelsResearchAndRelationships),
    evaluationParagraphs: text(requirement.subjectTruth.evaluationAndLimits),
    misconceptionRepairs: misconceptions.map((boundary) => ({
      misconception: psychologyMisconceptionFromBoundary(boundary, label),
      repair: boundary,
    })),
    memoryRecap: unique([
      ...text(requirement.subjectTruth.definitionsAndCoreConcepts).slice(0, 2),
      ...text(requirement.subjectTruth.modelsResearchAndRelationships).slice(0, 1),
    ]),
    treatmentCoverage: unit.learnTreatments,
    ...(workedRequired && !quantitative ? { workedExample: workedReasoningExample(requirement, label) } : {}),
    ...(quantitative ? { quantitativeWorkedExample: quantitativeExample(requirement, label) } : {}),
    ...(visualFor(unit, label, requirement) ? { visual: visualFor(unit, label, requirement) } : {}),
    provenance: {
      courseTruthTopicFile: topicFile,
      courseTruthRequirementIds: [requirement.requirementId],
      blueprintUnitIds: [unit.id],
      sourceEvidence,
      boardAlignmentUse: 'placement_only_reference_not_learner_text',
    },
  }
}

function feedbackAnchor(requirement: CourseTruthRequirement): string[] {
  return unique([
    ...text(requirement.subjectTruth.definitionsAndCoreConcepts).slice(0, 2),
    ...text(requirement.subjectTruth.modelsResearchAndRelationships).slice(0, 1),
    ...text(requirement.subjectTruth.evaluationAndLimits).slice(0, 1),
  ])
}

function practicePrompt(
  mode: string,
  requirement: CourseTruthRequirement,
  index: number,
): { prompt: string; support?: string[]; repairExtension?: string; options?: string[]; context?: string; fixedData?: number[] | Array<[number, number]> } {
  const focus = practiceFocus(requirement, index)
  const core = text(requirement.subjectTruth.definitionsAndCoreConcepts)
  const relationships = text(requirement.subjectTruth.modelsResearchAndRelationships)
  const evaluation = text(requirement.subjectTruth.evaluationAndLimits)
  const boundaries = text(requirement.subjectTruth.misconceptionsAndBoundaries)
  const boundary = boundaries[index % Math.max(1, boundaries.length)]
  const misconception = psychologyMisconceptionFromBoundary(boundary, focus)
  const accurate = core[index % Math.max(1, core.length)] ?? relationships[0] ?? `${focus} should be explained using the bounded account in this section.`

  switch (mode) {
    case 'retrieval_prompt_flashcard':
      return { prompt: `Without looking back, define ${focus} accurately and state one condition or boundary that prevents an over-generalised answer.` }
    case 'recognition_discrimination_check': {
      const options = [accurate, misconception]
      return {
        prompt: `Which account of ${focus} is defensible, and why? Option A: ${options[0]} Option B: ${options[1]}`,
        options,
        repairExtension: `Rewrite the inaccurate option so that it becomes accurate: ${misconception}`,
      }
    }
    case 'classification_matching_ordering': {
      const items = unique([...core.slice(0, 2), ...relationships.slice(0, 1), ...evaluation.slice(0, 1)]).slice(0, 4)
      return {
        prompt: `Classify the supplied statements about ${focus} as a core definition, relationship/evidence point, or limitation/evaluation point, then justify one classification. Statements: ${items.map((item, itemIndex) => `${itemIndex + 1}) ${item}`).join(' ')}`,
        support: items,
      }
    }
    case 'contextual_application_scenario': {
      const cue = relationships[0] ?? core[0] ?? `${focus} is relevant to the case.`
      const context = `Revision-owned scenario: a psychology student is analysing a new case in which this cue is present: ${cue}`
      return {
        prompt: `Apply ${focus} to the supplied scenario. Identify the exact cue that makes the concept relevant, explain the application, and state one alternative interpretation or limitation.`,
        context,
      }
    }
    case 'reasoning_chain_construction':
      return {
        prompt: `Build a reasoning chain for ${focus}: start with the psychological claim, explain the mechanism or relationship, and finish with a conclusion that does not exceed the evidence.`,
        support: unique([relationships[0], evaluation[0]].filter((value): value is string => Boolean(value))),
      }
    case 'compare_justify_task': {
      const target = comparisonTarget(requirement, focus)
      return { prompt: `Compare ${focus} with ${target}. Give one meaningful similarity or connection, one difference or limitation, and justify which distinction matters most for interpreting evidence.` }
    }
    case 'calculation_quantitative_drill': {
      const worked = quantitativeExample(requirement, focus)
      const fresh = /sign test/i.test(worked.title)
        ? { data: [[8, 10], [7, 7], [6, 3], [4, 9], [5, 8]] as Array<[number, number]>, task: 'For the constructed before/after pairs, assign signs, omit ties, state the effective n and identify the smaller sign count.' }
        : /significance/i.test(worked.title)
          ? { data: [0.08, 0.05], task: 'For the constructed p-value 0.08 and alpha = 0.05, state the statistical decision and one conclusion that would be too strong.' }
          : /correlation/i.test(worked.title) || /data example/i.test(worked.title)
            ? { data: [[1, 5], [2, 4], [3, 3], [4, 2]] as Array<[number, number]>, task: 'Inspect the constructed paired values, state the direction of association and explain why this does not establish causation.' }
            : { data: [5, 7, 7, 9, 12], task: 'Using the constructed values 5, 7, 7, 9 and 12, calculate an appropriate descriptive summary and show the working.' }
      return {
        prompt: `${fresh.task} Constructed data: ${JSON.stringify(fresh.data)}`,
        fixedData: fresh.data,
      }
    }
    case 'interpretation_data_graph_source': {
      const fixedData = [4, 6, 6, 8, 11]
      return { prompt: `Interpret this constructed data display for ${focus}: scores = 4, 6, 6, 8, 11. State the pattern or summary first, then explain what conclusion is justified and one conclusion the data alone would not justify.`, fixedData }
    }
    case 'misconception_diagnostic':
      return {
        prompt: `A student writes: “${misconception}” Diagnose the error and replace it with a more accurate explanation.`,
        repairExtension: `After correcting the error, write a one-sentence rule that would help you avoid the same mistake in a new context. Accurate boundary: ${boundary ?? accurate}`,
      }
    case 'mixed_topic_retrieval':
      return { prompt: `Connect ${focus} to Research methods. Name one design, measurement or evidence-quality issue that would matter when testing this claim, then explain how that issue changes the strength of the conclusion.` }
    case 'short_constructed_response':
    default:
      return { prompt: `Explain ${focus} in your own words using at least one accurate psychological detail and a conclusion that stays within the evidence.` }
  }
}

function makePracticeActivities(requirement: CourseTruthRequirement, unit: RequirementLearningUnit): PracticeActivity[] {
  return unique(unit.practiceEvidenceModes).map((mode, index) => {
    const built = practicePrompt(mode, requirement, index)
    const focus = practiceFocus(requirement, index)
    return {
      id: `PRACTICE-${requirement.requirementId}-${String(index + 1).padStart(2, '0')}`,
      topicNumber: unit.topicNumber,
      topic: unit.topic,
      requirementIds: [requirement.requirementId],
      blueprintUnitIds: [unit.id],
      mode,
      title: `${focus} · ${mode.replaceAll('_', ' ')}`,
      prompt: built.prompt,
      ...(built.support && built.support.length > 0 ? { support: built.support } : {}),
      ...(built.options && built.options.length > 0 ? { options: built.options } : {}),
      ...(built.context ? { context: built.context } : {}),
      ...(built.fixedData && built.fixedData.length > 0 ? { fixedData: built.fixedData } : {}),
      feedbackAnchor: feedbackAnchor(requirement),
      intendedEvidenceScope: unit.permittedEvidenceClaims.practice,
      evidenceEligible: false,
      scoringStatus: 'marking_pack_pending_step_5',
      ...(built.repairExtension ? { repairExtension: built.repairExtension } : {}),
      provenance: { courseTruthRequirementId: requirement.requirementId, blueprintUnitId: unit.id },
    }
  })
}

function examQuestionForUnit(unit: RequirementLearningUnit, requirement: CourseTruthRequirement, family: string, index: number): ExamPrepQuestion {
  const label = conceptLabel(requirement)
  const highDemand = unit.requiredDepthDifficulty.highestDemand === 'evaluate_judge'
  const command = family === 'mcq'
    ? 'choose'
    : family === 'data_math'
      ? 'calculate'
      : family === 'research_methods_practical'
        ? 'design'
        : family === 'extended_writing' || highDemand
          ? 'discuss'
          : family === 'scenario_application'
            ? 'explain'
            : 'outline'
  const marks = family === 'extended_writing' ? 16 : family === 'research_methods_practical' || family === 'data_math' ? 8 : family === 'scenario_application' ? 6 : 4
  const prompt = family === 'mcq'
    ? `Choose the most defensible account of ${label} from independently authored alternatives, then be prepared to explain why the distractors are wrong.`
    : family === 'data_math'
      ? `${command[0].toUpperCase()}${command.slice(1)} or interpret the relevant quantitative evidence for ${label}, showing enough working for the result to be independently checked.`
      : family === 'research_methods_practical'
        ? `Design or refine a Psychology study relevant to ${label}. Justify the methodological choices that matter for the supplied context and identify one limitation.`
        : family === 'scenario_application'
          ? `Explain how ${label} could account for behaviour or evidence in an unfamiliar Revision-owned scenario. Select the relevant cues rather than merely repeating the scenario.`
          : family === 'extended_writing'
            ? `Discuss ${label}. Develop accurate knowledge into analysis and evaluation, and keep each conclusion proportional to the evidence.`
            : `Outline ${label} accurately and include one detail that distinguishes it from a nearby concept.`

  return {
    id: `EXAM-${unit.knowledgeNodeIds[0]}-${family}-${index}`,
    command,
    marks,
    questionFamily: family,
    prompt,
    requirementIds: unit.knowledgeNodeIds,
    blueprintUnitIds: [unit.id],
    timingGuidanceMinutes: Math.ceil(marks * 1.25),
    revisionOwned: true,
    officialAqaMaterial: false,
    markingPackStatus: 'pending_step_5',
  }
}

function topicExamPrepSet(
  topic: CourseTruthTopic,
  units: RequirementLearningUnit[],
  requirementById: Map<string, CourseTruthRequirement>,
): TopicExamPrepSet {
  const familyToUnit = new Map<string, RequirementLearningUnit>()
  const demandClasses: string[] = []
  for (const unit of units) {
    const link = unit.examDemandLinks[0]
    for (const family of link.questionFamilies) if (!familyToUnit.has(family)) familyToUnit.set(family, unit)
    demandClasses.push(...link.commandDemandClasses)
  }

  const questions = [...familyToUnit.entries()].map(([family, unit], index) => {
    const requirement = requirementById.get(unit.knowledgeNodeIds[0])
    if (!requirement) throw new Error(`Missing Course Truth requirement ${unit.knowledgeNodeIds[0]}`)
    return examQuestionForUnit(unit, requirement, family, index + 1)
  })
  const link = units[0]?.examDemandLinks[0]
  if (!link) throw new Error(`Missing Exam Truth link for topic ${topic.topicNumber}`)

  return {
    id: `EXAM-TOPIC-${String(topic.topicNumber).padStart(2, '0')}`,
    topicNumber: topic.topicNumber,
    topic: topic.topic,
    paperId: link.paperId,
    sectionId: link.sectionId,
    requirementIds: units.flatMap((unit) => unit.knowledgeNodeIds),
    questionFamiliesRepresented: [...familyToUnit.keys()],
    commandDemandClassesRepresented: unique(demandClasses),
    questions,
    scoringStatus: 'marking_pack_pending_step_5',
  }
}

function simulationQuestion(
  topicNumber: number,
  topic: string,
  unit: RequirementLearningUnit,
  requirement: CourseTruthRequirement,
  marks: number,
  index: number,
): ExamPrepQuestion {
  const label = conceptLabel(requirement)
  const isResearchMethods = topicNumber === 7
  const command = marks <= 4 ? 'outline' : marks <= 8 ? 'explain' : 'discuss'
  const family = isResearchMethods ? 'research_methods_practical' : marks >= 12 ? 'extended_writing' : marks >= 6 ? 'scenario_application' : 'short_answer'
  const prompt = isResearchMethods
    ? `${command[0].toUpperCase()}${command.slice(1)} a defensible research-method response involving ${label} in the supplied Revision-owned study context. Justify methodological choices where the command requires it.`
    : marks >= 12
      ? `Discuss ${label} in relation to ${topic}. Use accurate knowledge, develop reasoning and evaluate the limits of the explanation or evidence.`
      : marks >= 6
        ? `Explain how ${label} could apply in an unfamiliar Revision-owned ${topic.toLowerCase()} scenario, using the relevant cues rather than restating them.`
        : `Outline ${label} accurately.`
  return {
    id: `MOCK-T${String(topicNumber).padStart(2, '0')}-Q${String(index).padStart(2, '0')}-${marks}`,
    command,
    marks,
    questionFamily: family,
    prompt,
    requirementIds: unit.knowledgeNodeIds,
    blueprintUnitIds: [unit.id],
    timingGuidanceMinutes: Math.ceil(marks * 1.25),
    revisionOwned: true,
    officialAqaMaterial: false,
    markingPackStatus: 'pending_step_5',
  }
}

function questionsForSection(
  topicNumber: number,
  topic: string,
  marks: number,
  unitsByTopic: Map<number, RequirementLearningUnit[]>,
  requirementById: Map<string, CourseTruthRequirement>,
): ExamPrepQuestion[] {
  const units = unitsByTopic.get(topicNumber) ?? []
  if (units.length === 0) throw new Error(`No Blueprint units for topic ${topicNumber}`)
  const tariffs = marks === 48 ? [4, 8, 12, 12, 12] : [4, 8, 12]
  return tariffs.map((tariff, index) => {
    const unit = units[index % units.length]
    const requirement = requirementById.get(unit.knowledgeNodeIds[0])
    if (!requirement) throw new Error(`Missing requirement ${unit.knowledgeNodeIds[0]}`)
    return simulationQuestion(topicNumber, topic, unit, requirement, tariff, index + 1)
  })
}

function fullPaperSimulations(
  examTruth: ExamTruth,
  topicsByNumber: Map<number, CourseTruthTopic>,
  unitsByTopic: Map<number, RequirementLearningUnit[]>,
  requirementById: Map<string, CourseTruthRequirement>,
): FullPaperSimulation[] {
  return examTruth.assessmentModel.papers.map((paper) => {
    const sections: FullPaperSimulation['sections'] = paper.sections.map((section) => {
      if (section.scope.type === 'topic') {
        const topic = topicsByNumber.get(section.scope.topicNumber)
        if (!topic) throw new Error(`Missing topic ${section.scope.topicNumber}`)
        const questions = questionsForSection(topic.topicNumber, topic.topic, section.marks, unitsByTopic, requirementById)
        return { id: section.id, marks: section.marks, topicNumber: topic.topicNumber, topic: topic.topic, questions }
      }
      const options = section.scope.topicNumbers.map((topicNumber) => {
        const topic = topicsByNumber.get(topicNumber)
        if (!topic) throw new Error(`Missing option topic ${topicNumber}`)
        const questions = questionsForSection(topicNumber, topic.topic, section.marks, unitsByTopic, requirementById)
        return { topicNumber, topic: topic.topic, questions, marks: section.marks }
      })
      return { id: section.id, marks: section.marks, choose: section.scope.choose, options }
    })

    return {
      id: `PSY-MOCK-${paper.id.replace('/', '-')}-A`,
      paperId: paper.id,
      paperName: paper.name,
      durationMinutes: paper.durationMinutes,
      attemptedMarks: paper.rawMarks,
      sections,
      revisionOwned: true,
      officialAqaMaterial: false,
      calibrationRule: 'Representative Revision-owned simulation. Tariffs are an independently authored valid practice mix, not a claim about a fixed future AQA paper pattern.',
      markingPackStatus: 'pending_step_5',
    }
  })
}

function examSkillModules(examTruth: ExamTruth, blueprint: ReturnType<typeof derivePsychologyCourseLearningBlueprint>): ExamSkillModule[] {
  const papers = examTruth.assessmentModel.papers
  const byId = new Map(blueprint.examSkillUnits.map((unit) => [unit.id, unit]))
  const module = (id: string, title: string, guidance: string[]): ExamSkillModule => {
    const unit = byId.get(id)
    if (!unit) throw new Error(`Missing exam skill unit ${id}`)
    return {
      id,
      title,
      paperIds: unit.paperIds,
      guidance,
      treatments: unit.examPrepTreatments,
      evidenceScope: unit.evidenceScope,
      markingBoundary: 'Guidance and candidate questions are present; scored evidence remains ineligible until Step 5 Marking Packs are built and linked.',
    }
  }

  return [
    module('PSY-EXAM-PAPER-ORIENTATION', 'Know the three-paper route', papers.map((paper) => `${paper.id} · ${paper.name}: ${paper.rawMarks} marks in ${paper.durationMinutes} minutes. Work through the exact section/option structure shown in the simulation before attempting timed work.`)),
    module('PSY-EXAM-COMMAND-DEMAND', 'Read the command as an instruction', Object.entries(examTruth.commandDemandModel.commands).map(([demand, commands]) => `${demand.replaceAll('_', ' ')}: ${commands.join(', ')}. Select content and response structure that actually demonstrates this demand rather than treating command words as decoration.`)),
    module('PSY-EXAM-EXTENDED-RESPONSE', 'Build extended responses from knowledge into judgement', [`The current maximum calibration tariff is ${examTruth.extendedResponse.maximumTariffMarks} marks. Do not assume a fixed number of maximum-tariff questions on a future paper.`, 'Plan the psychological claim first, develop analysis/application where the stem requires it, then qualify evaluation so the conclusion remains supported.']),
    module('PSY-EXAM-RESEARCH-METHOD-TRANSFER', 'Transfer research methods into unfamiliar studies', [`Research methods account for ${examTruth.crossPaperConstraints.researchMethodsOverallPercentRange[0]}–${examTruth.crossPaperConstraints.researchMethodsOverallPercentRange[1]}% overall.`, `Paper ${examTruth.crossPaperConstraints.researchMethodsAssessment.dedicatedPaper2Section.paper} has a dedicated ${examTruth.crossPaperConstraints.researchMethodsAssessment.dedicatedPaper2Section.marks}-mark Research Methods section, but research-method demand can also appear across all three papers.`]),
    module('PSY-EXAM-DATA-MATH', 'Make data and maths independently checkable', [`Mathematical skills contribute at least ${examTruth.crossPaperConstraints.mathematicalSkillsOverallPercentMinimum}% overall and may appear across all three papers.`, 'Show sufficient working, state the pattern before interpreting it, and separate what the data demonstrate from stronger causal or population claims they do not justify.']),
    module('PSY-EXAM-SYNOPTIC-P3', 'Select and connect ideas under Paper 3 demand', [examTruth.crossPaperConstraints.synopticExpectation, 'Practise selecting relevant ideas across topics and making the connection do explanatory or evaluative work; a shared keyword is not a synoptic argument.']),
  ]
}

export function derivePsychologyLearnerAssets(courseTruthDir: string, examTruthPath: string): PsychologyLearnerAssets {
  const examTruth = JSON.parse(readFileSync(examTruthPath, 'utf8')) as ExamTruth
  if (examTruth.status !== 'experimental_exam_truth_complete') throw new Error('Completed Psychology Exam Truth is required')

  const blueprint = derivePsychologyCourseLearningBlueprint(courseTruthDir, examTruthPath)
  const topicFiles = readdirSync(courseTruthDir).filter((name) => /^topic-\d+.*\.json$/.test(name)).sort()
  const topics = topicFiles.map((topicFile) => ({ topicFile, topic: JSON.parse(readFileSync(join(courseTruthDir, topicFile), 'utf8')) as CourseTruthTopic }))
  const requirementById = new Map<string, CourseTruthRequirement>()
  const topicFileByRequirementId = new Map<string, string>()
  for (const { topicFile, topic } of topics) {
    for (const requirement of topic.requirements) {
      if (requirement.readiness.courseTruthStatus !== 'course_truth_ready' || requirement.readiness.materialSubjectTruthGap || requirement.readiness.materialRightsBlocker) {
        throw new Error(`${requirement.requirementId} is not eligible for learner-asset derivation`)
      }
      requirementById.set(requirement.requirementId, requirement)
      topicFileByRequirementId.set(requirement.requirementId, topicFile)
    }
  }

  const unitByRequirementId = new Map(blueprint.requirementUnits.map((unit) => [unit.knowledgeNodeIds[0], unit]))
  const unitsByTopic = new Map<number, RequirementLearningUnit[]>()
  for (const unit of blueprint.requirementUnits) {
    const current = unitsByTopic.get(unit.topicNumber) ?? []
    current.push(unit)
    unitsByTopic.set(unit.topicNumber, current)
  }

  const chapters: LearnChapter[] = topics.map(({ topicFile, topic }) => ({
    id: `LEARN-TOPIC-${String(topic.topicNumber).padStart(2, '0')}`,
    topicNumber: topic.topicNumber,
    topic: topic.topic,
    title: topic.topic,
    introduction: `This chapter builds the reusable psychological knowledge for ${topic.topic}. Read the explanation first, use the worked reasoning where provided, then test transfer in Practice rather than treating recognition as mastery.`,
    sections: topic.requirements.map((requirement) => {
      const unit = unitByRequirementId.get(requirement.requirementId)
      if (!unit) throw new Error(`Missing Blueprint unit for ${requirement.requirementId}`)
      return makeLearnSection(topicFile, requirement, unit)
    }),
  }))

  const practiceActivities = blueprint.requirementUnits.flatMap((unit) => {
    const requirement = requirementById.get(unit.knowledgeNodeIds[0])
    if (!requirement) throw new Error(`Missing Course Truth for ${unit.knowledgeNodeIds[0]}`)
    return makePracticeActivities(requirement, unit)
  })

  const topicSets = topics.map(({ topic }) => topicExamPrepSet(topic, unitsByTopic.get(topic.topicNumber) ?? [], requirementById))
  const topicsByNumber = new Map(topics.map(({ topic }) => [topic.topicNumber, topic]))
  const simulations = fullPaperSimulations(examTruth, topicsByNumber, unitsByTopic, requirementById)

  const requirementCount = requirementById.size
  const learnSectionCount = chapters.reduce((sum, chapter) => sum + chapter.sections.length, 0)
  if (topicFileByRequirementId.size !== requirementCount) throw new Error('Course Truth topic provenance is incomplete')

  return {
    schemaVersion: 1,
    status: 'experimental_learner_asset_candidate_complete',
    courseId: 'aqa:aqa-a-level:7182',
    inputBinding: {
      courseTruth: 'psychology-course-truth/manifest.json + topic shards',
      examTruth: 'psychology-exam-truth/assessment-blueprint.json',
      blueprint: 'psychology-course-learning-blueprint deterministic projection',
    },
    learn: { chapters },
    practice: { activities: practiceActivities },
    examPrep: {
      skillModules: examSkillModules(examTruth, blueprint),
      topicSets,
      fullPaperSimulations: simulations,
    },
    summary: {
      topicCount: topics.length,
      requirementCount,
      learnChapterCount: chapters.length,
      learnSectionCount,
      practiceActivityCount: practiceActivities.length,
      examSkillModuleCount: blueprint.examSkillUnits.length,
      topicExamPrepSetCount: topicSets.length,
      fullPaperSimulationCount: simulations.length,
      paidProviderSpendGbp: 0,
      paidSourceLicenceSpendGbp: 0,
      learnerAssetCorpusComplete: true,
      markingPacksComplete: false,
      freshIndependentEducationalAssurancePassed: false,
      freshIndependentAssessmentAssurancePassed: false,
      canonicalRuntimeIntegrated: false,
      restrictedPilotPublicationApproved: false,
    },
  }
}
