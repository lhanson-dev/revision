import type { z } from 'zod'
import { learnCourseSchema } from '../../../learn-schema'
import {
  dataDrillSchema,
  examQuestionSchema,
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

export const psychologyCourseTruthTopics = truthTopics

function slug(value: string) {
  return value.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function strings(values?: string[]) {
  return values ?? []
}

const learnerTitleOverrides: Record<string, string> = {
  'PSY-04-02': 'Characteristics of phobias, depression and OCD',
}

function titleFor(requirement: TruthRequirement) {
  const override = learnerTitleOverrides[requirement.requirementId]
  if (override) return override
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

function completeRevisionSummary(requirement: TruthRequirement) {
  return [...new Set([
    ...strings(requirement.subjectTruth.definitionsAndCoreConcepts),
    ...strings(requirement.subjectTruth.modelsResearchAndRelationships),
    ...strings(requirement.subjectTruth.evaluationAndLimits),
  ])].join(' ')
}

const practiceStopWords = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'because', 'by', 'can', 'for', 'from', 'has', 'in', 'into',
  'is', 'it', 'may', 'of', 'on', 'or', 'that', 'the', 'their', 'this', 'to', 'which', 'with',
])

function conceptTokens(value: string) {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 3 && !practiceStopWords.has(token)),
  )
}

function stablePracticeHash(value: string) {
  let hash = 2166136261
  for (const character of value) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  hash ^= hash >>> 16
  hash = Math.imul(hash, 0x7feb352d)
  hash ^= hash >>> 15
  hash = Math.imul(hash, 0x846ca68b)
  hash ^= hash >>> 16
  return hash >>> 0
}

function objectivePracticeCue(requirement: TruthRequirement) {
  const relationship = strings(requirement.subjectTruth.modelsResearchAndRelationships)[0]
  if (relationship) {
    return {
      text: relationship,
      prompt: `Which core idea is most directly supported or illustrated by this evidence or relationship? ${relationship}`,
    }
  }
  const evaluation = strings(requirement.subjectTruth.evaluationAndLimits)[0]
  if (evaluation) {
    return {
      text: evaluation,
      prompt: `Which core idea is being evaluated by this limitation or qualification? ${evaluation}`,
    }
  }
  const definitions = strings(requirement.subjectTruth.definitionsAndCoreConcepts)
  const detail = definitions[1] ?? definitions[0] ?? requirement.boardAlignment.summary
  return {
    text: detail,
    prompt: `Which core idea best explains this psychological detail? ${detail}`,
  }
}

function objectivePracticeOptions(topic: TruthTopic, requirement: TruthRequirement) {
  const correct = assertion(requirement)
  const cue = objectivePracticeCue(requirement)
  const referenceTokens = conceptTokens(`${cue.text} ${correct}`)
  const rankedDistractors = topic.requirements
    .filter((candidate) => candidate.requirementId !== requirement.requirementId)
    .map((candidate) => {
      const option = assertion(candidate)
      const candidateTokens = conceptTokens(option)
      const overlap = [...candidateTokens].filter((token) => referenceTokens.has(token)).length
      return {
        id: candidate.requirementId,
        option,
        overlap,
        tieBreak: stablePracticeHash(`${requirement.requirementId}:${candidate.requirementId}`),
      }
    })
    .filter((candidate, index, candidates) =>
      candidate.option !== correct && candidates.findIndex((other) => other.option === candidate.option) === index,
    )
    .sort((a, b) => b.overlap - a.overlap || a.tieBreak - b.tieBreak)

  const distractors = rankedDistractors.slice(0, 3).map((candidate) => candidate.option)
  if (distractors.length < 3) throw new Error(`Psychology objective Practice needs three distinct topic-specific distractors for ${requirement.requirementId}`)

  const correctOption = stablePracticeHash(requirement.requirementId) % 4
  const options = [...distractors]
  options.splice(correctOption, 0, correct)
  return { correct, correctOption, options, prompt: cue.prompt }
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
            ...(research.length >= 2 ? [{
              type: 'relationship' as const,
              title: 'Research, evidence and relationships',
              items: research,
            }] : research.length === 1 ? [{
              type: 'explanation' as const,
              heading: 'Research, evidence and relationships',
              paragraphs: research,
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
    prompt: `Revise the key definitions, evidence/relationships and limits for: ${requirement.boardAlignment.summary}`,
    answer: completeRevisionSummary(requirement),
  })),
)

export const psychologyQuestions = truthTopics.flatMap((topic) =>
  topic.requirements.map((requirement) => {
    const { correct, correctOption, options, prompt } = objectivePracticeOptions(topic, requirement)
    return multipleChoiceQuestionSchema.parse({
      id: `psy-${requirementSectionId(requirement)}-check`,
      topic: topicId(topic),
      prompt,
      options,
      correctOption,
      explanation: `${correct} The alternatives are deliberately close statements from the same topic, so use the evidence or relationship in the stem to discriminate between the concepts.`,
    })
  }),
)

const researchMethodsTopic = truthTopics.find((topic) => topic.topicNumber === 7)
export const psychologyDataDrills = (researchMethodsTopic?.requirements ?? []).slice(0, 12).map((requirement, index) => dataDrillSchema.parse({
  id: `psy-rm-drill-${index + 1}`,
  title: titleFor(requirement),
  prompt: `Use the Research Methods course content to explain or apply this requirement: ${requirement.boardAlignment.summary}`,
  answer: completeRevisionSummary(requirement),
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
type ProductionExamQuestion = z.infer<typeof examQuestionSchema>
function ao(ao1: number, ao2: number, ao3: number): Ao { return { ao1, ao2, ao3, ao4: 0 } }

function guidance(requirements: TruthRequirement | TruthRequirement[], marks: number, allocation: Ao, extra: string[] = []) {
  const list = Array.isArray(requirements) ? requirements : [requirements]
  const knowledge = [...new Set(list.flatMap((requirement) => strings(requirement.subjectTruth.definitionsAndCoreConcepts)))]
  const evidence = [...new Set(list.flatMap((requirement) => strings(requirement.subjectTruth.modelsResearchAndRelationships)))]
  const evaluation = [...new Set(list.flatMap((requirement) => strings(requirement.subjectTruth.evaluationAndLimits)))]
  return [
    `Maximum ${marks} marks. Self-assess only against relevant creditworthy material for the exact prompt and declared assessment objectives.`,
    ...(allocation.ao1 > 0 ? knowledge.map((point) => `Knowledge: ${point}`) : []),
    ...(allocation.ao2 > 0 ? evidence.map((point) => `Evidence/relationship for application: ${point}`) : []),
    ...(allocation.ao3 > 0 ? evaluation.map((point) => `Evaluation/limit: ${point}`) : []),
    ...extra,
    'Do not award credit for material outside the command or declared assessment objectives, or for conclusions that go beyond the evidence.',
  ]
}

function requirementById(id: string) {
  const requirement = truthTopics.flatMap((topic) => topic.requirements).find((candidate) => candidate.requirementId === id)
  if (!requirement) throw new Error(`Missing Psychology Course Truth requirement ${id}`)
  return requirement
}

const applicationStimulusByTopic: Record<number, string> = {
  1: 'At a training centre, a senior supervisor in a formal role tells a new employee to continue an unpleasant task after another person objects. The employee is visibly uncomfortable but continues while the supervisor remains present.',
  2: 'A student tries to repeat a spoken phone number while mentally following a route on a map. The verbal task becomes much harder when another spoken message is added, while the route task is affected more by a second visual-spatial task.',
  3: 'A toddler seeks a familiar caregiver when distressed, uses that caregiver as a secure base for exploration, and shows expectations about comfort when entering a new nursery setting.',
  4: 'A student experiences repeated intrusive thoughts about contamination and responds by washing their hands many times, even though they recognise that the ritual is excessive and it disrupts daily life.',
  5: 'A teenager watches an admired older student receive praise and attention for a particular behaviour. The teenager later copies the behaviour, especially when the admired student is present.',
  6: 'After touching a very hot surface, a person quickly withdraws their hand. Sensory information travels towards the central nervous system, is relayed, and a motor response is sent to the muscles; chemical transmission occurs at synapses.',
  8: 'Two psychologists explain the same behaviour differently. One emphasises biological and environmental causes, while the other argues that people can still make meaningful choices within constraints.',
  9: 'Jamie and Rowan have been together for several years. Recently Jamie has felt less satisfied and has started spending more time apart, while Rowan thinks the relationship still has important benefits and shared commitments. After repeated disagreements, Jamie raises concerns directly and both partners begin reconsidering what they want from the relationship.',
  10: 'A young adult describes their gender as non-binary. In a separate research task they complete a trait questionnaire that measures culturally gendered characteristics rather than assigning biological sex.',
  11: 'A child cannot solve a puzzle alone, but succeeds when an adult gives prompts, models the first step and gradually removes support. On a later attempt the child completes more of the task independently.',
  12: 'A person develops hallucination-like experiences and reduced motivation. There is a family history of similar difficulties, and researchers are considering genetic vulnerability and neural explanations without assuming that biology guarantees the outcome.',
  13: 'A participant reports stronger hunger before a meal and reduced hunger after eating. Researchers are considering hypothalamic regulation and hormonal signals such as ghrelin and leptin rather than treating eating as a purely conscious choice.',
  14: 'An employee experiences sustained high workload and low control for several months. They show prolonged physiological stress responses and report more frequent illness symptoms during the same period.',
  15: 'An animal shows a rapid, stereotyped aggressive response when a territorial cue appears. Researchers are considering whether the behaviour reflects evolved mechanisms while also allowing for environmental influence.',
  16: 'Researchers find that offending risk is associated with both family/genetic factors and differences in neural functioning. They are careful not to treat either association as proof that an individual is destined to offend.',
  17: 'Two people are exposed to the same addictive substance, but one has a stronger family history of addiction and also spends more time with peers who regularly use the substance. Researchers are considering biological and social vulnerability together.',
}

function applicationStimulus(topic: TruthTopic) {
  return applicationStimulusByTopic[topic.topicNumber]
    ?? `A Revision-owned unfamiliar case presents behaviour relevant to ${topic.topic}. Use the exact cues in the case and keep conclusions proportionate to the evidence.`
}

function genericSectionQuestions(topic: TruthTopic, sectionId: string, paperId: string, choiceGroup?: string, choiceOption?: string): ProductionExamQuestion[] {
  const requirements = topic.requirements
  const tariffs = [4, 8, 6, 6]
  return tariffs.map((tariff, index) => {
    const requirement = requirements[index % requirements.length]
    let allocation: Ao
    if (paperId === '7182/1' || paperId === '7182/2') {
      allocation = index === 0
        ? ao(4, 0, 0)
        : index === 1
          ? ao(2, 6, 0)
          : index === 2
            ? ao(2, 0, 4)
            : ao(1, 0, 5)
    } else {
      allocation = index === 0
        ? ao(4, 0, 0)
        : index === 1
          ? ao(2, 4, 2)
          : index === 2
            ? ao(1, 0, 5)
            : ao(1, 0, 5)
    }

    const label = requirement.boardAlignment.summary
    const embeddedRm = paperId === '7182/1' && index === 1
    const rmRequirement = embeddedRm ? requirementById('PSY-07-14') : undefined
    const isClinicalCharacteristics = embeddedRm && requirement.requirementId === 'PSY-04-02'
    const prompt = index === 0
      ? paperId === '7182/3'
        ? `Outline two key points about ${titleFor(requirement)}.`
        : `Outline ${label} accurately.`
      : index === 1
        ? embeddedRm
          ? isClinicalCharacteristics
            ? 'Using the stimulus, explain how the behavioural, emotional and cognitive characteristics shown are consistent with OCD. Then identify one variable or procedure that would need to be operationalised if a psychologist investigated the case, and explain why precise operationalisation matters.'
            : `Using the stimulus, explain how ${label} applies to the case. Then identify one variable or procedure that would need to be operationalised if a psychologist investigated the case, and explain why precise operationalisation matters.`
          : paperId === '7182/2'
            ? `Using the stimulus, explain how ${label} applies to the case. Use specific cues from the stimulus.`
            : `Using the stimulus, explain how ${label} applies to the case. Use specific cues from the stimulus and include one limitation or alternative interpretation where the evidence does not justify certainty.`
        : index === 2
          ? `Evaluate one important strength, limitation or boundary of ${label}. Support the judgement with accurate psychological knowledge.`
          : `Discuss ${label}, focusing on one reasoned evaluative judgement and a proportionate conclusion.`

    const extraGuidance = embeddedRm
      ? [
          'Credit allocation: 2 marks reward accurate underlying psychological knowledge; within the 6 AO2 marks, up to 4 reward application to the stimulus and up to 2 reward identifying and justifying a precise operationalisation.',
          'Operationalisation credit: define one variable or procedure in observable, measurable or repeatable terms tied directly to the supplied case.',
          'Justification credit: precise operationalisation supports reproducibility and can support reliable measurement. Construct validity requires separate evidence that the chosen operation represents the intended construct; a vague claim that it is simply “more accurate” is insufficient.',
          ...(isClinicalCharacteristics ? ['Application credit in this item is for OCD characteristics shown by the scenario; phobia or depression material is not relevant unless used explicitly to distinguish the case.'] : []),
        ]
      : index >= 2
        ? ['AO3 credit must address the exact requirement through a defensible limitation, alternative, evidence-based qualification or boundary; descriptive material alone is insufficient.']
        : []

    return examQuestionSchema.parse({
      id: `psy-${paperId.replace('/', '-')}-${sectionId.toLowerCase()}-${topic.topicNumber}-q${index + 1}`,
      marks: tariff,
      topic: topicId(topic),
      assessmentObjectives: allocation,
      prompt,
      responseType: 'written' as const,
      ...(index === 1 ? {
        stimulus: {
          title: embeddedRm ? 'Revision-owned application and mini-study context' : 'Revision-owned application context',
          narrative: embeddedRm
            ? `${applicationStimulus(topic)} A psychologist plans to investigate this pattern with volunteers and must define what will be measured or manipulated clearly enough for another researcher to repeat the procedure.`
            : applicationStimulus(topic),
          table: null,
        },
      } : {}),
      markingGuidance: guidance(rmRequirement ? [requirement, rmRequirement] : requirement, tariff, allocation, extraGuidance),
      ...(choiceGroup ? { choiceGroup } : {}),
      ...(choiceOption ? { choiceOption } : {}),
    })
  })
}

function researchMethodsSectionQuestions(topic: TruthTopic): ProductionExamQuestion[] {
  const variables = requirementById('PSY-07-14')
  const descriptive = requirementById('PSY-07-26')
  const validity = requirementById('PSY-07-21')
  const signTest = requirementById('PSY-07-32')
  const significance = requirementById('PSY-07-33')
  const testChoice = requirementById('PSY-07-34')
  const correlation = requirementById('PSY-07-29')

  const questions = [
    {
      id: 'psy-7182-2-c-rm-q1',
      marks: 4,
      topic: topicId(topic),
      assessmentObjectives: ao(1, 3, 0),
      responseType: 'written' as const,
      stimulus: {
        title: 'Revision-owned study context',
        narrative: 'A psychologist recruits 40 volunteer sixth-form students. After all students learn the same 20-word list, 20 complete a ten-minute digit-cancellation distraction task while 20 spend the same ten minutes sitting quietly. Immediately afterwards, each student writes down as many target words as they can remember. The researcher must define the two conditions and the recall score clearly enough for the procedure to be repeated.',
        table: null,
      },
      prompt: 'Identify the independent and dependent variables and explain how each should be operationalised in this study.',
      markingGuidance: guidance(variables, 4, ao(1, 3, 0), [
        'Independent variable: distraction condition, operationalised as ten minutes of digit-cancellation versus ten minutes sitting quietly after learning the same word list.',
        'Dependent variable: immediate recall score, operationalised as the number of target words correctly written after the ten-minute interval.',
      ]),
    },
    {
      id: 'psy-7182-2-c-rm-q2',
      marks: 8,
      topic: topicId(topic),
      assessmentObjectives: ao(0, 8, 0),
      responseType: 'written' as const,
      stimulus: {
        title: 'Revision-owned quantitative dataset',
        narrative: 'Five participants produced the following scores after the task.',
        table: {
          title: 'Participant scores',
          columns: ['Participant', 'Score'],
          rows: [
            { cells: ['A', '4'] },
            { cells: ['B', '6'] },
            { cells: ['C', '6'] },
            { cells: ['D', '8'] },
            { cells: ['E', '11'] },
          ],
        },
      },
      prompt: 'Calculate the mean, median, mode and range for the scores. Show enough working for each answer to be checked.',
      markingGuidance: guidance(descriptive, 8, ao(0, 8, 0), ['For this constructed dataset: mean = 7, median = 6, mode = 6, range = 7.']),
    },
    {
      id: 'psy-7182-2-c-rm-q3',
      marks: 12,
      topic: topicId(topic),
      assessmentObjectives: ao(2, 5, 5),
      responseType: 'written' as const,
      stimulus: {
        title: 'Revision-owned validity context',
        narrative: 'A researcher measures “exam stress” using one self-report question asked immediately after a difficult mock examination. The sample contains only volunteers from one sixth-form college.',
        table: null,
      },
      prompt: 'Discuss the validity of this study. Apply relevant types of validity to the context and explain at least one defensible improvement.',
      markingGuidance: guidance(validity, 12, ao(2, 5, 5), ['AO3 credit should evaluate validity evidence and trade-offs in this exact study and justify why the proposed improvement would address the identified weakness.']),
    },
    {
      id: 'psy-7182-2-c-rm-q4',
      marks: 12,
      topic: topicId(topic),
      assessmentObjectives: ao(0, 11, 1),
      responseType: 'written' as const,
      stimulus: {
        title: 'Revision-owned sign-test data',
        narrative: 'The same five participants give a score before and after a brief intervention. One pair is tied.',
        table: {
          title: 'Before and after scores',
          columns: ['Participant', 'Before', 'After'],
          rows: [
            { cells: ['A', '5', '7'] },
            { cells: ['B', '6', '6'] },
            { cells: ['C', '9', '4'] },
            { cells: ['D', '3', '8'] },
            { cells: ['E', '7', '9'] },
          ],
        },
      },
      prompt: 'Use the sign-test procedure on the data: assign signs, remove the tie, state the effective n and calculate the smaller sign count. Then explain what further information is needed before deciding statistical significance.',
      markingGuidance: guidance(signTest, 12, ao(0, 11, 1), ['For this constructed dataset the signs are +, tie, −, +, +; effective n = 4; the smaller sign count is 1. A significance decision then requires the appropriate critical value convention for the stated alpha and test direction.']),
    },
    {
      id: 'psy-7182-2-c-rm-q5',
      marks: 12,
      topic: topicId(topic),
      assessmentObjectives: ao(0, 11, 1),
      responseType: 'written' as const,
      stimulus: {
        title: 'Revision-owned inferential-test context',
        narrative: 'Twelve participants are ranked on weekly revision time and ranked on exam-anxiety score. The research hypothesis predicts an association but does not predict its direction. A Spearman calculation gives rho = -0.62. For this practice question, the supplied two-tailed critical magnitude at alpha = 0.05 is 0.587.',
        table: null,
      },
      prompt: 'Select and justify the appropriate inferential test. Use the observed coefficient and supplied critical magnitude to make the statistical decision, then state what the result does and does not justify about the relationship.',
      markingGuidance: guidance([testChoice, significance, correlation], 12, ao(0, 11, 1), ['The defensible test is Spearman’s rho because the data are paired ranks and the hypothesis concerns association. Compare absolute rho: 0.62 > 0.587, so the result is significant at the supplied threshold. The negative sign describes direction; significance does not establish causation or practical importance.']),
    },
  ]
  return questions.map((question) => examQuestionSchema.parse(question))
}

function sectionQuestions(topic: TruthTopic, sectionId: string, paperId: string, marks: number, choiceGroup?: string, choiceOption?: string): ProductionExamQuestion[] {
  if (paperId === '7182/2' && sectionId === 'C' && marks === 48) {
    return researchMethodsSectionQuestions(topic)
  }
  return genericSectionQuestions(topic, sectionId, paperId, choiceGroup, choiceOption)
}

function paperExam(paperId: '7182/1' | '7182/2' | '7182/3') {
  const paper = examTruth.assessmentModel.papers.find((candidate) => candidate.id === paperId)
  if (!paper) throw new Error(`Missing Psychology Exam Truth for ${paperId}`)
  const questions = paper.sections.flatMap((section) => {
    if ('topicNumber' in section.scope && typeof section.scope.topicNumber === 'number') {
      const topicNumber = section.scope.topicNumber
      const topic = truthTopics.find((candidate) => candidate.topicNumber === topicNumber)
      if (!topic) throw new Error(`Missing Psychology topic ${topicNumber}`)
      return sectionQuestions(topic, section.id, paperId, section.marks)
    }
    if (!('topicNumbers' in section.scope) || !Array.isArray(section.scope.topicNumbers)) {
      throw new Error(`Invalid Psychology Exam Truth scope for ${paperId} section ${section.id}`)
    }
    return section.scope.topicNumbers.flatMap((number: number) => {
      const topic = truthTopics.find((candidate) => candidate.topicNumber === number)
      if (!topic) throw new Error(`Missing Psychology option topic ${number}`)
      return sectionQuestions(topic, section.id, paperId, section.marks, `section-${section.id.toLowerCase()}`, `topic-${number}`)
    })
  })
  const isPaper3 = paperId === '7182/3'
  return examSchema.parse({
    id: `psychology-aqa-7182-paper-${paperId.slice(-1)}-mock`,
    title: `AQA A-level Psychology 7182 · Paper ${paperId.slice(-1)}`,
    subtitle: paper.name,
    durationMinutes: paper.durationMinutes,
    totalMarks: paper.rawMarks,
    ...(isPaper3 ? {} : { printedMarks: questions.reduce((sum, question) => sum + question.marks, 0) }),
    caseHtml: isPaper3
      ? '<p><strong>Paper route:</strong> Answer all questions in Section A (Issues and Debates), then choose exactly one 24-mark topic from Section B (Relationships, Gender, or Cognition and Development), one from Section C (Schizophrenia, Eating Behaviour, or Stress), and one from Section D (Aggression, Forensic Psychology, or Addiction). Your attempted paper totals 96 marks.</p><p>Revision-authored AQA-aligned practice paper. This is not an official AQA paper.</p>'
      : '<p>Revision-authored AQA-aligned practice paper. This is not an official AQA paper.</p>',
    learnerClaim: isPaper3
      ? 'Revision-authored AQA-aligned practice; not an official AQA paper. Attempt Section A plus exactly one topic from each of Sections B, C and D. Self-marked until Revision assisted marking is separately validated.'
      : 'Revision-authored AQA-aligned practice; not an official AQA paper. Self-marked until Revision assisted marking is separately validated.',
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
