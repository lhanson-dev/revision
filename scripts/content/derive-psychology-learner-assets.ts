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

function lowerFirst(value: string): string {
  return value.length === 0 ? value : `${value[0].toLowerCase()}${value.slice(1)}`
}

function conceptLabel(requirement: CourseTruthRequirement): string {
  const sentence = text(requirement.subjectTruth.definitionsAndCoreConcepts)[0]
  if (!sentence) return requirement.requirementId

  const match = sentence.match(/^(.{2,80}?)\s+(?:is|are|refers to|means|involves|concerns|describes|occurs when|reflects)\b/i)
  if (match?.[1]) return match[1].replace(/^(a|an|the)\s+/i, '').trim()

  const firstClause = sentence.split(/[,:;]/)[0].replace(/[.]$/, '').trim()
  return firstClause.length <= 80 ? firstClause : requirement.requirementId
}

function quantitativeExample(requirement: CourseTruthRequirement, label: string): QuantitativeWorkedExample {
  const joined = [
    ...text(requirement.subjectTruth.definitionsAndCoreConcepts),
    ...text(requirement.subjectTruth.modelsResearchAndRelationships),
    ...text(requirement.subjectTruth.dependencies),
  ].join(' ').toLowerCase()

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
  return {
    title: `Worked reasoning example: ${label}`,
    setup: core[0] ?? `Use the course truth for ${label} as the starting point.`,
    steps: [
      relationships[0] ?? core[1] ?? 'Identify the relevant psychological mechanism or relationship.',
      relationships[1] ?? 'Explain how the mechanism changes the expected outcome or interpretation.',
      evaluation[0] ?? 'Qualify the conclusion so that the explanation does not claim more than the evidence supports.',
    ],
    conclusion: evaluation[1] ?? evaluation[0] ?? `A strong answer about ${label} should connect accurate knowledge to a justified, bounded conclusion.`,
  }
}

function visualFor(unit: RequirementLearningUnit, label: string): LearnerVisualSpec | undefined {
  if (!unit.quantitativeVisualWorkedExampleRequirements.purposefulVisualRequired) return undefined
  const format: LearnerVisualSpec['format'] = unit.learningClassifications.includes('formula_quantitative')
    ? 'data_display'
    : unit.learningClassifications.includes('process_sequence')
      ? 'process_diagram'
      : 'relationship_diagram'
  return {
    purpose: `Make the structure of ${label} easier to inspect without replacing the written explanation.`,
    format,
    textAlternative: `Text alternative: follow the same ${label} sequence, relationship or data pattern described in the adjacent written explanation and worked example.`,
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
  const sourceEvidence = (requirement.sourceEvidence ?? []).filter((source) => source.classification !== 'REFERENCE_ONLY')

  return {
    id: `LEARN-${requirement.requirementId}`,
    title: label,
    requirementIds: [requirement.requirementId],
    blueprintUnitIds: [unit.id],
    learningGoal: `Understand ${label}, use it accurately in unfamiliar contexts, and recognise the limits of what it can explain or demonstrate.`,
    explanationParagraphs: text(requirement.subjectTruth.definitionsAndCoreConcepts),
    researchAndRelationshipParagraphs: text(requirement.subjectTruth.modelsResearchAndRelationships),
    evaluationParagraphs: text(requirement.subjectTruth.evaluationAndLimits),
    misconceptionRepairs: misconceptions.map((misconception) => ({
      misconception,
      repair: `Replace the over-simplified claim with the bounded account in this section, then explain which word or assumption made the original claim unsafe.`,
    })),
    memoryRecap: unique([
      ...text(requirement.subjectTruth.definitionsAndCoreConcepts).slice(0, 2),
      ...text(requirement.subjectTruth.modelsResearchAndRelationships).slice(0, 1),
    ]),
    treatmentCoverage: unit.learnTreatments,
    ...(workedRequired && !quantitative ? { workedExample: workedReasoningExample(requirement, label) } : {}),
    ...(quantitative ? { quantitativeWorkedExample: quantitativeExample(requirement, label) } : {}),
    ...(visualFor(unit, label) ? { visual: visualFor(unit, label) } : {}),
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

function practicePrompt(mode: string, requirement: CourseTruthRequirement): { prompt: string; support?: string[]; repairExtension?: string } {
  const label = conceptLabel(requirement)
  const core = text(requirement.subjectTruth.definitionsAndCoreConcepts)
  const relationships = text(requirement.subjectTruth.modelsResearchAndRelationships)
  const evaluation = text(requirement.subjectTruth.evaluationAndLimits)
  const misconceptions = text(requirement.subjectTruth.misconceptionsAndBoundaries)
  const secondLabel = core[1] ? conceptLabel({ ...requirement, subjectTruth: { ...requirement.subjectTruth, definitionsAndCoreConcepts: [core[1]] } }) : undefined

  switch (mode) {
    case 'retrieval_prompt_flashcard':
      return { prompt: `Without looking back, define ${label} accurately and state one feature that prevents it being confused with a nearby concept.` }
    case 'recognition_discrimination_check':
      return {
        prompt: `Which account is defensible for ${label}, and why? One option is an accurate course statement; the other is a common over-simplification.`,
        support: unique([core[0], misconceptions[0]].filter((value): value is string => Boolean(value))),
        repairExtension: misconceptions[0] ? `Rewrite this claim so it becomes accurate: ${misconceptions[0]}` : undefined,
      }
    case 'classification_matching_ordering':
      return { prompt: `Put the important stages, categories or decision points for ${label} into a defensible order or structure, then justify one placement.` }
    case 'contextual_application_scenario':
      return {
        prompt: `Create a brief novel scenario that correctly demonstrates ${label}. Identify the exact detail that makes the concept applicable, then add one nearby non-example and explain the difference.`,
        support: relationships.slice(0, 1),
      }
    case 'reasoning_chain_construction':
      return {
        prompt: `Build a reasoning chain for ${label}: start with the psychological claim, explain the mechanism or relationship, and finish with a conclusion that does not exceed the evidence.`,
        support: unique([relationships[0], evaluation[0]].filter((value): value is string => Boolean(value))),
      }
    case 'compare_justify_task':
      return { prompt: `Compare ${label}${secondLabel && secondLabel !== label ? ` with ${secondLabel}` : ' with the closest alternative account in this section'}. Give one meaningful similarity or connection, one difference or limitation, and justify which distinction matters most in context.` }
    case 'calculation_quantitative_drill': {
      const worked = quantitativeExample(requirement, label)
      return { prompt: `${worked.task} Use a fresh set of values rather than copying the worked answer.`, support: [`Worked reference result: ${worked.result}`] }
    }
    case 'interpretation_data_graph_source':
      return { prompt: `Interpret a small data display relevant to ${label}. State the pattern first, then explain what conclusion is justified and one conclusion that the data alone would not justify.` }
    case 'misconception_diagnostic':
      return {
        prompt: misconceptions[0]
          ? `A student writes: “${misconceptions[0]}” Diagnose the error and replace it with a more accurate explanation.`
          : `Identify one plausible misconception about ${label}, explain why it is unsafe, and replace it with a bounded account.`,
        repairExtension: `After correcting the error, write a one-sentence rule that would help you avoid the same mistake in a new context.`,
      }
    case 'mixed_topic_retrieval':
      return { prompt: `Link ${label} to one relevant idea from a different Psychology topic. Retrieve both ideas without notes, then explain why the connection is psychologically meaningful rather than just a shared word.` }
    case 'short_constructed_response':
    default:
      return { prompt: `Explain ${label} in your own words using at least one accurate psychological detail and a conclusion that stays within the evidence.` }
  }
}

function makePracticeActivities(requirement: CourseTruthRequirement, unit: RequirementLearningUnit): PracticeActivity[] {
  return unique(unit.practiceEvidenceModes).map((mode, index) => {
    const built = practicePrompt(mode, requirement)
    return {
      id: `PRACTICE-${requirement.requirementId}-${String(index + 1).padStart(2, '0')}`,
      topicNumber: unit.topicNumber,
      topic: unit.topic,
      requirementIds: [requirement.requirementId],
      blueprintUnitIds: [unit.id],
      mode,
      title: `${conceptLabel(requirement)} · ${mode.replaceAll('_', ' ')}`,
      prompt: built.prompt,
      ...(built.support && built.support.length > 0 ? { support: built.support } : {}),
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
