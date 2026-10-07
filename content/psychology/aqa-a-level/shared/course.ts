import { learnCourseSchema } from '../../../learn-schema'
import {
  dataDrillSchema,
  examSchema,
  examTechniqueGuideSchema,
  flashcardSchema,
  multipleChoiceQuestionSchema,
  topicLinkSchema,
  topicSchema,
} from '../../../schema'

import topic01 from '../../../../research/source-first-course-prototype/psychology-course-truth/topic-01-social-influence.json'
import topic02 from '../../../../research/source-first-course-prototype/psychology-course-truth/topic-02-memory.json'
import topic03 from '../../../../research/source-first-course-prototype/psychology-course-truth/topic-03-attachment.json'
import topic04 from '../../../../research/source-first-course-prototype/psychology-course-truth/topic-04-clinical-psychology-and-mental-health.json'
import topic05 from '../../../../research/source-first-course-prototype/psychology-course-truth/topic-05-approaches-in-psychology.json'
import topic06 from '../../../../research/source-first-course-prototype/psychology-course-truth/topic-06-biopsychology.json'
import topic07 from '../../../../research/source-first-course-prototype/psychology-course-truth/topic-07-research-methods.json'
import topic08 from '../../../../research/source-first-course-prototype/psychology-course-truth/topic-08-issues-and-debates-in-psychology.json'
import topic09 from '../../../../research/source-first-course-prototype/psychology-course-truth/topic-09-relationships.json'
import topic10 from '../../../../research/source-first-course-prototype/psychology-course-truth/topic-10-gender.json'
import topic11 from '../../../../research/source-first-course-prototype/psychology-course-truth/topic-11-cognition-and-development.json'
import topic12 from '../../../../research/source-first-course-prototype/psychology-course-truth/topic-12-schizophrenia.json'
import topic13 from '../../../../research/source-first-course-prototype/psychology-course-truth/topic-13-eating-behaviour.json'
import topic14 from '../../../../research/source-first-course-prototype/psychology-course-truth/topic-14-stress.json'
import topic15 from '../../../../research/source-first-course-prototype/psychology-course-truth/topic-15-aggression.json'
import topic16 from '../../../../research/source-first-course-prototype/psychology-course-truth/topic-16-forensic-psychology.json'
import topic17 from '../../../../research/source-first-course-prototype/psychology-course-truth/topic-17-addiction.json'
import examTruth from '../../../../research/source-first-course-prototype/psychology-exam-truth/assessment-blueprint.json'

type TruthRequirement = {
  requirementId: string
  boardAlignment: { summary: string }
  subjectTruth: {
    definitionsAndCoreConcepts?: string[]
    modelsResearchAndRelationships?: string[]
    evaluationAndLimits?: string[]
    misconceptionsAndBoundaries?: string[]
    dependencies?: string[]
  }
  readiness: {
    courseTruthStatus: string
    materialSubjectTruthGap: boolean
    materialRightsBlocker: boolean
  }
}

type TruthTopic = {
  topicNumber: number
  topic: string
  group: string
  requirements: TruthRequirement[]
}

const truthTopics = [
  topic01, topic02, topic03, topic04, topic05, topic06, topic07, topic08, topic09,
  topic10, topic11, topic12, topic13, topic14, topic15, topic16, topic17,
] as unknown as TruthTopic[]

function slug(value: string) {
  return value.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function strings(values?: string[]) {
  return values ?? []
}

function titleFor(requirement: TruthRequirement) {
  const first = strings(requirement.subjectTruth.definitionsAndCoreConcepts)[0]
  if (!first) return requirement.boardAlignment.summary
  const match = first.match(/^(.{2,90}?)\s+(?:is|are|refers to|means|involves|concerns|describes|occurs when|reflects|treats|proposes|examines|focuses on|uses|measures)\b/i)
  return match?.[1]?.replace(/^(a|an|the)\s+/i, '').trim() || requirement.boardAlignment.summary
}

function topicId(topic: TruthTopic) {
  return slug(topic.topic)
}

function requirementSectionId(requirement: TruthRequirement) {
  return requirement.requirementId.toLowerCase().replaceAll('-', '')
}

function assertion(requirement: TruthRequirement) {
  return strings(requirement.subjectTruth.definitionsAndCoreConcepts)[0]
    ?? strings(requirement.subjectTruth.modelsResearchAndRelationships)[0]
    ?? requirement.boardAlignment.summary
}

for (const topic of truthTopics) {
  for (const requirement of topic.requirements) {
    if (
      requirement.readiness.courseTruthStatus !== 'course_truth_ready'
      || requirement.readiness.materialSubjectTruthGap
      || requirement.readiness.materialRightsBlocker
    ) throw new Error(`Psychology production input is not ready: ${requirement.requirementId}`)
  }
}

export const psychologyTopics = truthTopics.map((topic, index) => topicSchema.parse({
  id: topicId(topic),
  order: index + 1,
  title: `${topic.topicNumber}. ${topic.topic}${topic.group === 'option' ? ' · Option topic' : ''}`,
  shortTitle: topic.topic,
  sections: topic.requirements.map((requirement) => ({
    id: requirementSectionId(requirement),
    title: titleFor(requirement),
    points: [
      ...strings(requirement.subjectTruth.definitionsAndCoreConcepts),
      ...strings(requirement.subjectTruth.modelsResearchAndRelationships),
      ...strings(requirement.subjectTruth.evaluationAndLimits),
    ],
  })),
}))

export const psychologyTopicIds = psychologyTopics.map((topic) => topic.id)

export const psychologyLearn = learnCourseSchema.parse({
  chapters: truthTopics.map((topic) => ({
    id: topicId(topic),
    topicId: topicId(topic),
    title: `${topic.topicNumber}. ${topic.topic}`,
    groups: topic.requirements.map((requirement) => {
      const definitions = strings(requirement.subjectTruth.definitionsAndCoreConcepts)
      const research = strings(requirement.subjectTruth.modelsResearchAndRelationships)
      const evaluation = strings(requirement.subjectTruth.evaluationAndLimits)
      const misconceptions = strings(requirement.subjectTruth.misconceptionsAndBoundaries)
      const dependencies = strings(requirement.subjectTruth.dependencies)
      const id = requirementSectionId(requirement)
      return {
        id,
        title: titleFor(requirement),
        pages: [{
          id: `${topicId(topic)}-${id}`,
          topicId: topicId(topic),
          sourceSectionIds: [id],
          title: titleFor(requirement),
          orientation: `Learn the knowledge AQA 7182 requires for: ${requirement.boardAlignment.summary}`,
          blocks: [
            {
              type: 'explanation' as const,
              heading: 'Core knowledge',
              paragraphs: definitions.length > 0 ? definitions : [requirement.boardAlignment.summary],
            },
            ...(research.length > 0 ? [{
              type: 'relationship' as const,
              title: 'Research, evidence and relationships',
              items: research,
            }] : []),
            ...(evaluation.length > 0 ? [{
              type: 'explanation' as const,
              heading: 'Evaluation and limits',
              paragraphs: evaluation,
            }] : []),
            ...(dependencies.length >= 2 ? [{
              type: 'relationship' as const,
              title: 'Connect this to',
              items: dependencies.slice(0, 6),
              explanation: 'These ideas are useful connections when you apply or evaluate this content.',
            }] : []),
            ...(misconceptions.length > 0 ? [{
              type: 'misconception' as const,
              title: 'Avoid these exam mistakes',
              paragraphs: misconceptions,
            }] : []),
            {
              type: 'recap' as const,
              items: [...definitions.slice(0, 2), ...research.slice(0, 1), ...evaluation.slice(0, 1)].filter(Boolean),
            },
          ],
        }],
      }
    }),
  })),
})

export const psychologyFlashcards = truthTopics.flatMap((topic) =>
  topic.requirements.map((requirement) => flashcardSchema.parse({
    id: `psy-${requirementSectionId(requirement)}-card`,
    topic: topicId(topic),
    prompt: `What do you need to know about ${titleFor(requirement)}?`,
    answer: [
      ...strings(requirement.subjectTruth.definitionsAndCoreConcepts).slice(0, 2),
      ...strings(requirement.subjectTruth.modelsResearchAndRelationships).slice(0, 1),
      ...strings(requirement.subjectTruth.evaluationAndLimits).slice(0, 1),
    ].join(' '),
  })),
)

export const psychologyQuestions = truthTopics.flatMap((topic) =>
  topic.requirements.map((requirement) => {
    const correct = assertion(requirement)
    const label = titleFor(requirement)
    return multipleChoiceQuestionSchema.parse({
      id: `psy-${requirementSectionId(requirement)}-check`,
      topic: topicId(topic),
      prompt: `Which statement about ${label} is supported by the course content?`,
      options: [
        correct,
        `${label} always produces the same outcome in every person and context.`,
        `Evidence about ${label} proves that no alternative psychological explanation can apply.`,
        `${label} can be treated as a fixed rule without considering the limits of the evidence.`,
      ],
      correctOption: 0,
      explanation: `${correct} Check the Learn page for the relevant limits and evaluation before generalising this claim.`,
    })
  }),
)

const researchMethodsTopic = truthTopics.find((topic) => topic.topicNumber === 7)
export const psychologyDataDrills = (researchMethodsTopic?.requirements ?? []).slice(0, 12).map((requirement, index) => dataDrillSchema.parse({
  id: `psy-rm-drill-${index + 1}`,
  title: titleFor(requirement),
  prompt: `Use the Research Methods course content to explain or apply this requirement: ${requirement.boardAlignment.summary}`,
  answer: [
    ...strings(requirement.subjectTruth.definitionsAndCoreConcepts).slice(0, 2),
    ...strings(requirement.subjectTruth.modelsResearchAndRelationships).slice(0, 1),
    ...strings(requirement.subjectTruth.evaluationAndLimits).slice(0, 1),
  ].join(' '),
}))

export const psychologyTopicLinks = truthTopics.flatMap((topic) => {
  const next = truthTopics.find((candidate) => candidate.topicNumber === topic.topicNumber + 1)
  if (!next) return []
  return [topicLinkSchema.parse({
    id: `psy-link-${topic.topicNumber}-${next.topicNumber}`,
    topic: topicId(topic),
    label: `Connect to ${next.topic}`,
    explanation: `Look for shared methods, evidence standards and explanatory assumptions when moving from ${topic.topic} to ${next.topic}.`,
  })]
})

export const psychologyExamTechnique = [
  examTechniqueGuideSchema.parse({
    id: 'psy-paper-route',
    title: 'Know the three-paper route',
    summary: 'AQA 7182 has three 120-minute, 96-mark papers. Paper 3 includes topic options.',
    steps: [
      'Paper 1: Social influence, Memory, Attachment, and Clinical Psychology and Mental Health.',
      'Paper 2: Approaches, Biopsychology, and a 48-mark Research Methods section.',
      'Paper 3: Issues and Debates plus one topic from each of three option groups.',
    ],
    tip: 'Use Exam Prep to rehearse the exact paper and option structure rather than treating all topics as one undifferentiated exam.',
  }),
  examTechniqueGuideSchema.parse({
    id: 'psy-command-demand',
    title: 'Read the command as an instruction',
    summary: 'Select, outline, explain, compare, discuss, evaluate and design require different evidence from your answer.',
    steps: [
      'Identify the command before choosing content.',
      'Match the response to the relevant knowledge, application or analysis/evaluation demand.',
      'Use the marks and context to decide how much development is needed.',
    ],
    tip: 'Do not write everything you know. Write the material that earns credit for this exact demand.',
  }),
  examTechniqueGuideSchema.parse({
    id: 'psy-extended-response',
    title: 'Build extended responses',
    summary: 'Extended writing needs accurate knowledge, developed reasoning and evaluation that stays proportional to the evidence.',
    steps: [
      'Select the psychological knowledge that directly answers the question.',
      'Develop explanation, application or analysis rather than listing disconnected points.',
      'Evaluate with explicit limitations, alternatives or conditions and finish with a supported judgement where required.',
    ],
    tip: 'A strong conclusion follows from the reasoning you developed; it is not a new unsupported claim.',
  }),
  examTechniqueGuideSchema.parse({
    id: 'psy-research-methods',
    title: 'Make Research Methods concrete',
    summary: 'Research Methods is 25–30% of the qualification and has a dedicated 48-mark Paper 2 section.',
    steps: [
      'Apply methods to the supplied study rather than writing generic definitions.',
      'Operationalise variables and procedures precisely enough to repeat.',
      'Show working for quantitative tasks and keep interpretation separate from causal claims.',
    ],
    tip: 'Research Methods can also appear outside the dedicated Paper 2 section.',
  }),
]

type Ao = { ao1: number; ao2: number; ao3: number; ao4: number }
function ao(ao1: number, ao2: number, ao3: number): Ao { return { ao1, ao2, ao3, ao4: 0 } }

function guidance(requirement: TruthRequirement, marks: number) {
  const material = [
    ...strings(requirement.subjectTruth.definitionsAndCoreConcepts),
    ...strings(requirement.subjectTruth.modelsResearchAndRelationships),
    ...strings(requirement.subjectTruth.evaluationAndLimits),
  ].slice(0, 6)
  return [
    `Maximum ${marks} marks. Self-assess only against relevant creditworthy material for the exact prompt.`,
    ...material,
    'Do not award credit for conclusions that go beyond the evidence or ignore a material boundary in the course content.',
  ]
}

function sectionQuestions(topic: TruthTopic, sectionId: string, paperId: string, marks: number, choiceGroup?: string, choiceOption?: string) {
  const requirements = topic.requirements
  const tariffs = marks === 48 ? [4, 8, 12, 12, 12] : [4, 8, 12]
  return tariffs.map((tariff, index) => {
    const requirement = requirements[index % requirements.length]
    let allocation: Ao
    if (paperId === '7182/1' || (paperId === '7182/2' && sectionId !== 'C')) {
      allocation = index === 0 ? ao(4, 0, 0) : index === 1 ? ao(2, 6, 0) : ao(3, 0, 9)
    } else if (paperId === '7182/2' && sectionId === 'C') {
      const profiles = [ao(1, 3, 0), ao(0, 8, 0), ao(2, 9, 1), ao(0, 11, 1), ao(0, 11, 1)]
      allocation = profiles[index]
    } else {
      allocation = index === 0 ? ao(4, 0, 0) : index === 1 ? ao(2, 4, 2) : ao(2, 0, 10)
    }
    const label = titleFor(requirement)
    const prompt = topic.topicNumber === 7
      ? tariff <= 4
        ? `Outline the relevant Research Methods knowledge for ${label}.`
        : tariff <= 8
          ? `Explain how ${label} should be applied in a Revision-owned psychological study. Justify the choices that matter for the study context.`
          : `Discuss how ${label} affects the quality and interpretation of a Revision-owned psychological investigation.`
      : tariff >= 12
        ? `Discuss ${label} in relation to ${topic.topic}. Develop accurate knowledge and evaluate the limits of the explanation or evidence.`
        : tariff >= 8
          ? `Explain how ${label} could apply in an unfamiliar ${topic.topic.toLowerCase()} context. Use relevant psychological knowledge rather than restating the scenario.`
          : `Outline ${label} accurately.`
    return {
      id: `psy-${paperId.replace('/', '-')}-${sectionId.toLowerCase()}-${topic.topicNumber}-q${index + 1}`,
      marks: tariff,
      topic: topicId(topic),
      assessmentObjectives: allocation,
      prompt,
      markingGuidance: guidance(requirement, tariff),
      ...(choiceGroup ? { choiceGroup } : {}),
      ...(choiceOption ? { choiceOption } : {}),
    }
  })
}

function paperExam(paperId: '7182/1' | '7182/2' | '7182/3') {
  const paper = examTruth.assessmentModel.papers.find((candidate) => candidate.id === paperId)
  if (!paper) throw new Error(`Missing Psychology Exam Truth for ${paperId}`)
  const questions = paper.sections.flatMap((section) => {
    if (section.scope.type === 'topic') {
      const topic = truthTopics.find((candidate) => candidate.topicNumber === section.scope.topicNumber)
      if (!topic) throw new Error(`Missing Psychology topic ${section.scope.topicNumber}`)
      return sectionQuestions(topic, section.id, paperId, section.marks)
    }
    return section.scope.topicNumbers.flatMap((number) => {
      const topic = truthTopics.find((candidate) => candidate.topicNumber === number)
      if (!topic) throw new Error(`Missing Psychology option topic ${number}`)
      return sectionQuestions(topic, section.id, paperId, section.marks, `section-${section.id.toLowerCase()}`, `topic-${number}`)
    })
  })
  return examSchema.parse({
    id: `psychology-aqa-7182-paper-${paperId.slice(-1)}-mock`,
    title: `AQA A-level Psychology 7182 · Paper ${paperId.slice(-1)}`,
    subtitle: paper.name,
    durationMinutes: paper.durationMinutes,
    totalMarks: paper.rawMarks,
    printedMarks: questions.reduce((sum, question) => sum + question.marks, 0),
    caseHtml: '<p>Revision-authored AQA-aligned practice paper. This is not an official AQA paper.</p>',
    learnerClaim: 'Revision-authored AQA-aligned practice; not an official AQA paper. Self-marked until Revision assisted marking is separately validated.',
    restrictedPilot: false,
    questions,
  })
}

export const psychologyPaper1Exams = [paperExam('7182/1')]
export const psychologyPaper2Exams = [paperExam('7182/2')]
export const psychologyPaper3Exams = [paperExam('7182/3')]

export const psychologyCourseSummary = {
  topicCount: truthTopics.length,
  requirementCount: truthTopics.reduce((sum, topic) => sum + topic.requirements.length, 0),
}
