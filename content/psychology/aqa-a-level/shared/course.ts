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
import { psychologyObjectivePracticeConcept, stablePsychologyPracticeHash } from './objective-practice'

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

function completeRevisionSummary(requirement: TruthRequirement) {
  return [...new Set([
    ...strings(requirement.subjectTruth.definitionsAndCoreConcepts),
    ...strings(requirement.subjectTruth.modelsResearchAndRelationships),
    ...strings(requirement.subjectTruth.evaluationAndLimits),
  ])].join(' ')
}

function objectivePracticeOptions(topic: TruthTopic, requirement: TruthRequirement) {
  const correct = psychologyObjectivePracticeConcept(requirement)
  const distractors = topic.requirements
    .filter((candidate) => candidate.requirementId !== requirement.requirementId)
    .map((candidate) => ({
      id: candidate.requirementId,
      label: psychologyObjectivePracticeConcept(candidate).label,
      order: stablePsychologyPracticeHash(`${requirement.requirementId}:${candidate.requirementId}`),
    }))
    .filter((candidate, index, candidates) =>
      candidate.label !== correct.label && candidates.findIndex((other) => other.label === candidate.label) === index,
    )
    .sort((a, b) => a.order - b.order)
    .slice(0, 3)
    .map((candidate) => candidate.label)

  if (distractors.length < 3) throw new Error(`Psychology objective Practice needs three distinct same-topic concept distractors for ${requirement.requirementId}`)
  const correctOption = stablePsychologyPracticeHash(requirement.requirementId) % 4
  const options = [...distractors]
  options.splice(correctOption, 0, correct.label)
  return { correct, correctOption, options }
}

export const psychologyObjectivePracticeContracts = truthTopics.flatMap((topic) =>
  topic.requirements.map((requirement) => ({
    requirementId: requirement.requirementId,
    topic: topicId(topic),
    ...psychologyObjectivePracticeConcept(requirement),
  })),
)

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
    const { correct, correctOption, options } = objectivePracticeOptions(topic, requirement)
    return multipleChoiceQuestionSchema.parse({
      id: `psy-${requirementSectionId(requirement)}-check`,
      topic: topicId(topic),
      prompt: correct.prompt,
      options,
      correctOption,
      explanation: `${correct.definition} The keyed answer names the concept defined by the stem; the alternatives are different concepts from the same topic.`,
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

type GuidanceMode = 'outline' | 'application' | 'application-evaluation' | 'evaluation' | 'discussion' | 'embedded-rm'

type IndicativeGuidanceOverride = {
  knowledge: string[]
  application: string[]
  evaluation?: string[]
}

type ApplicationQuestionContract = IndicativeGuidanceOverride & {
  focus: string
  stimulus: string
  prompt?: string
  extraGuidance?: string[]
}

function aoSelfMarkRule(allocation: Ao, mode: GuidanceMode): string[] {
  const rules: string[] = []
  if (allocation.ao1 === 4) rules.push('AO1 (4): award up to 2 marks for each of two accurate relevant points — 1 mark for accurate identification/description and 1 further mark for relevant development or detail.')
  else if (allocation.ao1 === 2) rules.push('AO1 (2): award 1 mark for each of up to two accurate relevant knowledge points.')
  else if (allocation.ao1 === 1) rules.push('AO1 (1): award 1 mark for one accurate relevant knowledge point.')

  if (allocation.ao2 === 6 && mode === 'embedded-rm') rules.push('AO2 (6): award up to 4 marks for application to the case (up to two developed cue-to-concept links, 2 marks each) and up to 2 marks for a precise operationalisation plus a justified reason it supports reproducibility or reliable measurement.')
  else if (allocation.ao2 === 6) rules.push('AO2 (6): award up to 2 marks for each of three developed applications — 1 mark for selecting a relevant case cue and 1 mark for explaining how that cue supports the psychological point.')
  else if (allocation.ao2 === 4) rules.push('AO2 (4): award up to 2 marks for each of two developed applications — 1 mark for a relevant case cue and 1 mark for explaining the psychological link.')
  else if (allocation.ao2 === 5) rules.push('AO2 (5): 1–2 marks for limited or partly accurate application; 3–4 for clear developed application to multiple relevant details; 5 for sustained, accurate application covering the main contextual demands.')
  else if (allocation.ao2 > 0) rules.push(`AO2 (${allocation.ao2}): award only for accurate application, calculation or method use tied to the supplied context; do not credit generic description as AO2.`)

  if (allocation.ao3 === 5) rules.push('AO3 (5): 1–2 marks for a limited evaluative point; 3–4 for a developed evaluative chain explaining why the issue matters; 5 for a developed judgement that weighs the issue and reaches a proportionate conclusion.')
  else if (allocation.ao3 === 4) rules.push('AO3 (4): 1–2 marks for a relevant but limited evaluation; 3–4 for a developed limitation or boundary that explains its consequence for the claim, evidence or method.')
  else if (allocation.ao3 === 2) rules.push('AO3 (2): 1 mark for a relevant limitation or alternative interpretation and 1 further mark for explaining why it changes the strength or certainty of the application.')
  else if (allocation.ao3 === 1) rules.push('AO3 (1): award 1 mark for one valid evaluative or interpretive conclusion that is justified by the supplied evidence.')

  return rules
}

function guidance(requirements: TruthRequirement | TruthRequirement[], marks: number, allocation: Ao, mode: GuidanceMode, extra: string[] = [], override?: IndicativeGuidanceOverride) {
  const list = Array.isArray(requirements) ? requirements : [requirements]
  const knowledge = override?.knowledge ?? [...new Set(list.flatMap((requirement) => strings(requirement.subjectTruth.definitionsAndCoreConcepts)))]
  const evidence = override?.application ?? [...new Set(list.flatMap((requirement) => strings(requirement.subjectTruth.modelsResearchAndRelationships)))]
  const evaluation = override?.evaluation ?? [...new Set(list.flatMap((requirement) => strings(requirement.subjectTruth.evaluationAndLimits)))]
  const indicative = [
    ...knowledge.slice(0, mode === 'outline' ? 4 : 2).map((point) => `Indicative knowledge: ${point}`),
    ...(mode === 'application' || mode === 'application-evaluation' || mode === 'embedded-rm'
      ? evidence.slice(0, 2).map((point) => `Indicative application route: ${point}`) : []),
    ...(mode === 'evaluation' || mode === 'discussion' || mode === 'application-evaluation'
      ? evaluation.slice(0, 2).map((point) => `Indicative evaluation route: ${point}`) : []),
  ]
  return [
    `Maximum ${marks} marks. Self-mark against the exact prompt; equivalent accurate routes may earn credit even when they are not listed below.`,
    `Mark allocation: AO1 ${allocation.ao1} · AO2 ${allocation.ao2} · AO3 ${allocation.ao3}.`,
    ...aoSelfMarkRule(allocation, mode),
    ...indicative,
    ...extra,
    'The indicative points are examples, not a checklist. Do not require every listed point and do not award credit for material outside the command or declared assessment objectives.',
  ]
}

function requirementById(id: string) {
  const requirement = truthTopics.flatMap((topic) => topic.requirements).find((candidate) => candidate.requirementId === id)
  if (!requirement) throw new Error(`Missing Psychology Course Truth requirement ${id}`)
  return requirement
}

const applicationQuestionContracts: Record<string, ApplicationQuestionContract> = {
  'PSY-03-02': {
    focus: 'Bowlby’s biologically grounded theory of attachment',
    stimulus: 'A toddler seeks a familiar caregiver when distressed, explores more confidently when that caregiver is nearby, and actively seeks that caregiver again after a brief separation in an unfamiliar nursery room.',
    knowledge: [
      'Bowlby’s attachment theory treats humans as biologically prepared to form selective protective bonds with familiar caregivers.',
      'An internal working model is a developing representation of the self, attachment figures and expected relationship support, built from repeated relationship experience.',
    ],
    application: [
      'Seeking the familiar caregiver when distressed and after separation is consistent with organised proximity-seeking toward a specific attachment figure.',
      'Exploring more confidently while the caregiver is nearby is consistent with the caregiver providing a secure base.',
    ],
  },
  'PSY-04-02': {
    focus: 'behavioural, emotional and cognitive characteristics of OCD',
    stimulus: 'A student experiences repeated intrusive thoughts about contamination and feels intense anxiety when those thoughts occur. They respond by washing their hands many times, recognise that the ritual is excessive, and find that it disrupts daily life.',
    prompt: 'Using the stimulus, choose any two behavioural, emotional or cognitive characteristics shown and explain how they are consistent with OCD. Then identify one variable or procedure that would need to be operationalised if a psychologist investigated the case, and explain why precise operationalisation matters.',
    knowledge: [
      'Obsessive-compulsive disorder involves recurrent intrusive obsessions and/or compulsions performed to reduce distress or prevent feared outcomes, often at significant cost to time and functioning.',
      'OCD can be organised into behavioural compulsions, emotional distress/anxiety and cognitive obsessions or threat-related interpretations.',
    ],
    application: [
      'Repeated hand-washing is a behavioural compulsion that is performed in response to the contamination concern.',
      'Intense anxiety is an emotional characteristic, while the intrusive contamination thoughts and recognition that the ritual is excessive provide cognitive characteristics.',
    ],
    extraGuidance: [
      'Application credit in this item is for OCD characteristics shown by the scenario; phobia or depression material is not relevant unless used explicitly to distinguish the case.',
    ],
  },
  'PSY-06-02': {
    focus: 'sensory, relay and motor neurons in the reflex pathway',
    stimulus: 'After touching a very hot surface, receptors in the skin generate a signal that travels toward the central nervous system. Within the central nervous system the signal is passed between connecting neurons, and a command then travels to the arm muscles so the hand is withdrawn quickly.',
    knowledge: [
      'Sensory neurons transmit information from sensory receptors toward the central nervous system; motor neurons transmit commands from the central nervous system to effectors such as muscles.',
      'Interneurons connect neurons within the central nervous system. The AQA term relay neuron is retained as qualification framing for this connecting function.',
    ],
    application: [
      'The signal travelling from the skin receptors toward the central nervous system is carried by sensory neurons.',
      'Connecting neurons within the central nervous system act as relay/interneurons, while the outgoing command to the arm muscles is carried by motor neurons.',
    ],
  },
  'PSY-09-02': {
    focus: 'Rusbult’s investment model',
    stimulus: 'Jamie and Rowan have been together for several years. Jamie has become less satisfied and increasingly thinks that being single or dating someone else could be preferable. Rowan still values the relationship and has invested heavily in shared routines, possessions, friendships and future plans.',
    knowledge: [
      'Rusbult’s investment model explains commitment using satisfaction, quality of alternatives and investment size. Higher satisfaction and investment and poorer alternatives generally predict greater commitment.',
      'Investments include resources tied to the relationship that would be lost or disrupted if it ended, such as time, shared identity, routines, possessions or social networks.',
    ],
    application: [
      'Jamie’s lower satisfaction and more attractive perceived alternatives are consistent with lower commitment in the investment model.',
      'Rowan’s substantial shared investments and continued satisfaction are consistent with stronger commitment because ending the relationship would carry greater losses.',
    ],
    evaluation: [
      'Investment model variables predict commitment probabilistically rather than determining what any individual will do.',
      'Investment should never be used to imply that someone ought to remain in an unsafe or abusive relationship.',
    ],
  },
  'PSY-12-02': {
    focus: 'genetic explanations of schizophrenia',
    stimulus: 'One member of an identical-twin pair develops schizophrenia while the other does not. Several close biological relatives have also experienced psychotic disorders, while the twins have had different long-term environmental experiences and stress exposure.',
    knowledge: [
      'Genetic explanations propose that inherited variation contributes to vulnerability to schizophrenia; risk is polygenic rather than attributable to one single schizophrenia gene.',
      'Biological vulnerability is probabilistic: genetic risk does not make schizophrenia inevitable.',
    ],
    application: [
      'The family pattern and genetic similarity of the identical twins are consistent with an inherited contribution to vulnerability.',
      'The fact that only one identical twin develops the disorder shows that genetic similarity is not sufficient and is consistent with environmental or developmental factors also contributing.',
    ],
    evaluation: [
      'Heritability estimates describe variation in populations under particular conditions; they do not mean a fixed percentage of an individual’s disorder is genetic.',
      'Incomplete concordance means genetic vulnerability should not be treated as deterministic.',
    ],
  },
  'PSY-13-02': {
    focus: 'neural and hormonal control of eating behaviour',
    stimulus: 'A participant reports stronger hunger before meals and less hunger after eating. Blood samples show one appetite-related signal tends to rise before meals while another reflects longer-term energy stores, and activity changes are observed in brain regions involved in feeding regulation across the same period.',
    knowledge: [
      'The hypothalamus integrates signals about energy availability and contributes to hunger, satiety and energy-balance regulation through interacting neural pathways.',
      'Ghrelin commonly rises before meals and can promote hunger and food intake, while leptin provides information about longer-term energy stores and can reduce food intake.',
    ],
    application: [
      'The signal rising before meals is consistent with ghrelin contributing to hunger, while the signal reflecting longer-term energy stores is consistent with leptin signalling.',
      'Changes in activity in feeding-related brain regions are consistent with neural regulation, including hypothalamic integration of hormonal and nutrient-related information.',
    ],
    evaluation: [
      'Hormone concentration is not a deterministic predictor of eating because reward, stress, habits, environment and cognition also matter.',
      'Distributed interacting circuits are more accurate than a single on/off hunger-centre explanation.',
    ],
  },
  'PSY-16-02': {
    focus: 'genetic explanations of offending behaviour',
    stimulus: 'In one dataset, offending histories are more similar within identical-twin pairs than within non-identical-twin pairs, but the similarity is not perfect. The pairs also differ in important developmental and environmental experiences.',
    knowledge: [
      'Genetic explanations examine whether inherited variation contributes to differences in antisocial or offending risk.',
      'Biological effects are probabilistic rather than deterministic.',
    ],
    application: [
      'Greater similarity within identical-twin pairs than non-identical pairs is consistent with an inherited contribution to offending risk.',
      'Imperfect similarity and differing environments are consistent with genetic vulnerability operating alongside environmental exposure and developmental context.',
    ],
    evaluation: [
      'Association is not sufficient evidence of biological determinism or simple one-way causation.',
      'Group-level biological risk findings should not be treated as individual predictions of criminality.',
    ],
  },
}

function applicationQuestionContract(requirement: TruthRequirement) {
  return applicationQuestionContracts[requirement.requirementId]
}

const applicationStimulusByTopic: Record<number, string> = {
  1: 'At a training centre, a senior supervisor in a formal role tells a new employee to continue an unpleasant task after another person objects. The employee is visibly uncomfortable but continues while the supervisor remains present.',
  2: 'A student tries to repeat a spoken phone number while mentally following a route on a map. The verbal task becomes much harder when another spoken message is added, while the route task is affected more by a second visual-spatial task.',
  3: 'A toddler seeks a familiar caregiver when distressed, explores more confidently when that caregiver is nearby, and reacts differently when the caregiver leaves and returns in an unfamiliar nursery room.',
  4: 'A student experiences repeated intrusive thoughts about contamination and responds by washing their hands many times, even though they recognise that the ritual is excessive and it disrupts daily life.',
  5: 'A teenager watches an admired older student receive praise and attention for a particular behaviour. The teenager later copies the behaviour, especially when the admired student is present.',
  6: 'After touching a very hot surface, a person quickly withdraws their hand. Information travels from receptors towards the central nervous system and a response is sent to the muscles; transmission between nerve cells occurs at junctions between them.',
  8: 'A student repeatedly misses revision sessions. One researcher points to patterns in the student’s past reinforcement and measured physiological responses, while another notes occasions when the student deliberately changes behaviour despite those pressures.',
  9: 'Jamie and Rowan have been together for several years. Jamie has become less satisfied and spends more time apart, while Rowan still values the relationship and the commitments they share. After repeated disagreements Jamie raises concerns directly and both partners begin reconsidering what they want.',
  10: 'Morgan says that neither “man” nor “woman” fully describes their sense of gender and that the description they use can change over time. In a separate study, Morgan rates how strongly traits such as assertiveness, tenderness and independence describe them.',
  11: 'A child cannot solve a puzzle alone. With an adult asking guiding questions and demonstrating one step, the child completes it; on later attempts the adult gives less help and the child completes more independently.',
  12: 'One member of an identical-twin pair develops hallucination-like experiences while the other does not. A separate scan shows group-average differences in activity in several brain regions, and a neurotransmitter-related measure also differs on average; none of these findings predicts an individual outcome with certainty.',
  13: 'A participant reports stronger hunger before meals and less hunger after eating. Blood samples show one signal tends to rise before meals while another tracks longer-term energy stores, and brain activity changes in regions involved in feeding across the same period.',
  14: 'An employee experiences months of intense deadlines with little recovery time. During the same period, repeated measurements show higher blood pressure, a weaker response on one immune-function measure and more frequent minor infections.',
  15: 'Male birds attack a model only when a particular coloured patch is visible. The attack sequence is similar across many birds, appears rapidly without training and is much less likely when the patch is covered.',
  16: 'In one dataset, offending histories are more similar within identical-twin pairs than within non-identical pairs. A separate imaging study reports average differences in regions linked with impulse control, although many people with similar biological features never offend.',
  17: 'Two people use the same addictive substance for a similar period. One has several close relatives with dependence, scores highly on impulsivity and spends most evenings with friends who normalise heavy use; only that person develops persistent loss of control.',
}

function applicationStimulus(topic: TruthTopic) {
  return applicationStimulusByTopic[topic.topicNumber]
    ?? `A Revision-owned unfamiliar case presents behaviour relevant to ${topic.topic}. Use the exact cues in the case and keep conclusions proportionate to the evidence.`
}

function genericSectionQuestions(
  topic: TruthTopic,
  sectionId: string,
  paperId: string,
  sectionMarks: number,
  choiceGroup?: string,
  choiceOption?: string,
): ProductionExamQuestion[] {
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

    const area = requirement.boardAlignment.summary.replace(/[.]+$/, '')
    const applicationContract = index === 1 ? applicationQuestionContract(requirement) : undefined
    const focus = applicationContract?.focus ?? psychologyObjectivePracticeConcept(requirement).label.replace(/[.]+$/, '')
    const embeddedRm = paperId === '7182/1' && index === 1

    const prompt = index === 0
      ? `Outline two accurate points from this area. You may choose any two relevant aspects: ${area}.`
      : index === 1
        ? applicationContract?.prompt ?? (embeddedRm
          ? `Using the stimulus, explain how ${focus} applies to the case. Then identify one variable or procedure that would need to be operationalised if a psychologist investigated the case, and explain why precise operationalisation matters.`
          : paperId === '7182/2'
            ? `Using the stimulus, explain how ${focus} applies to the case. Use specific cues from the stimulus.`
            : `Using the stimulus, explain how ${focus} applies to the case. Use specific cues from the stimulus and explain one limitation or alternative interpretation of that application.`)
        : index === 2
          ? `Evaluate one limitation or boundary relevant to this area. Focus on one issue only: ${area}.`
          : `Discuss one evaluative issue relevant to this area and reach a proportionate conclusion. You do not need to cover every named element: ${area}.`

    const mode: GuidanceMode = index === 0
      ? 'outline'
      : index === 1
        ? embeddedRm ? 'embedded-rm' : paperId === '7182/3' ? 'application-evaluation' : 'application'
        : index === 2 ? 'evaluation' : 'discussion'

    const extraGuidance = [
      ...(embeddedRm ? [
        'For the AO2 operationalisation portion, award 1 mark for defining a case-linked variable or procedure in observable/measurable/repeatable terms and 1 mark for explaining how that precision supports reproducibility or reliable measurement.',
        'Construct validity is separate: a precise operation can be repeated consistently without necessarily representing the intended construct well.',
      ] : []),
      ...(applicationContract?.extraGuidance ?? []),
    ]

    return examQuestionSchema.parse({
      id: `psy-${paperId.replace('/', '-')}-${sectionId.toLowerCase()}-${topic.topicNumber}-q${index + 1}`,
      marks: tariff,
      topic: topicId(topic),
      assessmentObjectives: allocation,
      sectionLabel: `Section ${sectionId}`,
      sectionTitle: topic.topic,
      sectionMarks,
      prompt,
      responseType: 'written' as const,
      ...(index === 1 ? {
        stimulus: {
          title: embeddedRm ? 'Revision-owned application and mini-study context' : 'Revision-owned application context',
          narrative: embeddedRm
            ? `${applicationContract?.stimulus ?? applicationStimulus(topic)} A psychologist plans to investigate this pattern with volunteers and must define what will be measured or manipulated clearly enough for another researcher to repeat the procedure.`
            : applicationContract?.stimulus ?? applicationStimulus(topic),
          table: null,
        },
      } : {}),
      markingGuidance: guidance(requirement, tariff, allocation, mode, extraGuidance, applicationContract),
      ...(choiceGroup ? { choiceGroup } : {}),
      ...(choiceOption ? { choiceOption } : {}),
    })
  })
}

function researchMethodsSectionQuestions(topic: TruthTopic, sectionId: string, sectionMarks: number): ProductionExamQuestion[] {
  const sectionMetadata = {
    sectionLabel: `Section ${sectionId}`,
    sectionTitle: topic.topic,
    sectionMarks,
  }
  const questions = [
    {
      id: 'psy-7182-2-c-rm-q1',
      marks: 4,
      topic: topicId(topic),
      assessmentObjectives: ao(1, 3, 0),
      ...sectionMetadata,
      responseType: 'written' as const,
      stimulus: {
        title: 'Revision-owned study context',
        narrative: 'A psychologist recruits 40 volunteer sixth-form students. After all students learn the same 20-word list, 20 complete a ten-minute digit-cancellation distraction task while 20 spend the same ten minutes sitting quietly. Immediately afterwards, each student writes down as many target words as they can remember.',
        table: null,
      },
      prompt: 'Identify the independent and dependent variables and explain how each should be operationalised in this study.',
      markingGuidance: [
        'Maximum 4 marks.',
        'Mark allocation: AO1 1 · AO2 3 · AO3 0.',
        'AO1 (1): award 1 mark only if the response correctly identifies the distraction condition as the independent variable and recall performance as the dependent variable.',
        'AO2 (3): award the three application marks using the operationalisation criteria below; each sub-mark is worth 1 mark.',
        'AO2 (1): operationalise the independent variable as ten minutes of digit-cancellation versus ten minutes sitting quietly after learning the same word list.',
        'AO2 (1): operationalise the dependent variable as the number of target words correctly written immediately after the ten-minute interval.',
        'AO2 (1): award for making the proposed measurement/manipulation sufficiently observable and repeatable in this exact study.',
      ],
    },
    {
      id: 'psy-7182-2-c-rm-q2',
      marks: 8,
      topic: topicId(topic),
      assessmentObjectives: ao(0, 8, 0),
      ...sectionMetadata,
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
      markingGuidance: [
        'Maximum 8 marks.',
        'Mark allocation: AO1 0 · AO2 8 · AO3 0.',
        'AO2 (8): award the eight application/calculation marks across mean, median, mode and range using the criteria below.',
        'Mean (2): 1 mark for a correct method using all five scores, and 1 mark for the correct mean of 7.',
        'Median (2): 1 mark for correctly locating the middle score in the ordered data, and 1 mark for the correct median of 6.',
        'Mode (2): 1 mark for correctly identifying the repeated score, and 1 mark for the correct mode of 6.',
        'Range (2): 1 mark for the correct maximum-minus-minimum method (11 − 4), and 1 mark for the correct range of 7.',
      ],
    },
    {
      id: 'psy-7182-2-c-rm-q3',
      marks: 12,
      topic: topicId(topic),
      assessmentObjectives: ao(2, 5, 5),
      ...sectionMetadata,
      responseType: 'written' as const,
      stimulus: {
        title: 'Revision-owned validity context',
        narrative: 'A researcher measures “exam stress” using one self-report question asked immediately after a difficult mock examination. The sample contains only volunteers from one sixth-form college.',
        table: null,
      },
      prompt: 'Discuss the validity of this study. Apply relevant types of validity to the context and explain at least one defensible improvement.',
      markingGuidance: [
        'Maximum 12 marks.',
        'Mark allocation: AO1 2 · AO2 5 · AO3 5.',
        'AO1 (2): award 1 mark for each of two accurate validity concepts relevant to the answer, such as construct validity and population/external validity.',
        'AO2 (5): 1–2 marks for limited reference to the study; 3–4 for clear application to more than one concrete feature (for example the single self-report item, immediate post-mock timing, volunteer sample or one-college sampling); 5 for sustained accurate application across the main validity issues used.',
        'AO3 (5): 1–2 marks for a limited judgement or generic improvement; 3–4 for a developed explanation of why the identified validity weakness matters and how a specific improvement addresses it; 5 for a balanced, justified judgement that recognises both what the change improves and any remaining limitation.',
        'A defensible route could improve construct validity by using a validated multi-item measure or converging measures, and could improve generalisability by sampling beyond one volunteer sixth-form group.',
      ],
    },
    {
      id: 'psy-7182-2-c-rm-q4',
      marks: 12,
      topic: topicId(topic),
      assessmentObjectives: ao(0, 11, 1),
      ...sectionMetadata,
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
      markingGuidance: [
        'Maximum 12 marks.',
        'Mark allocation: AO1 0 · AO2 11 · AO3 1.',
        'AO2 (11): award the eleven application/calculation marks across sign assignment, tie handling, effective n, smaller sign count and critical-value reasoning using the criteria below.',
        'AO2 (5): award 1 mark for each correct row classification: A +, B tie, C −, D +, E +.',
        'AO2 (1): remove the tied pair from the sign-test calculation.',
        'AO2 (1): state the effective n as 4.',
        'AO2 (1): state the smaller sign count as 1.',
        'AO2 (3): identify that the appropriate critical value depends on the chosen significance level and whether the hypothesis is one- or two-tailed, and that the observed smaller sign count must be compared with that critical value.',
        'AO3 (1): state that statistical significance cannot be concluded from the supplied data alone until the appropriate critical value convention is specified.',
      ],
    },
    {
      id: 'psy-7182-2-c-rm-q5',
      marks: 12,
      topic: topicId(topic),
      assessmentObjectives: ao(0, 11, 1),
      ...sectionMetadata,
      responseType: 'written' as const,
      stimulus: {
        title: 'Revision-owned inferential-test context',
        narrative: 'Twelve participants are ranked on weekly revision time and ranked on exam-anxiety score. The research hypothesis predicts an association but does not predict its direction. A Spearman calculation gives rho = -0.62. For this practice question, the supplied two-tailed critical magnitude at alpha = 0.05 is 0.587.',
        table: null,
      },
      prompt: 'Select and justify the appropriate inferential test. Use the observed coefficient and supplied critical magnitude to make the statistical decision, then state what the result does and does not justify about the relationship.',
      markingGuidance: [
        'Maximum 12 marks.',
        'Mark allocation: AO1 0 · AO2 11 · AO3 1.',
        'AO2 (11): award the eleven application/calculation marks across test selection, justification, tail choice, comparison, decision and interpretation using the criteria below.',
        'AO2 (1): select Spearman’s rho.',
        'AO2 (3): justify the choice using the ranked/ordinal form of the two variables, the paired scores from the same participants and the hypothesis about association.',
        'AO2 (1): identify that a two-tailed decision is required because the hypothesis does not predict direction.',
        'AO2 (2): use the absolute observed coefficient, 0.62, and compare it with the supplied critical magnitude, 0.587.',
        'AO2 (2): conclude that the result is statistically significant at the supplied 0.05 threshold and reject the no-association/null model for this practice question.',
        'AO2 (2): state that the negative coefficient indicates that higher values on one ranked variable are associated with lower values on the other.',
        'AO3 (1): state one justified limit on the conclusion, such as that statistical association does not establish causation or practical importance.',
      ],
    },
  ]
  return questions.map((question) => examQuestionSchema.parse(question))
}

function sectionQuestions(topic: TruthTopic, sectionId: string, paperId: string, marks: number, choiceGroup?: string, choiceOption?: string): ProductionExamQuestion[] {
  if (paperId === '7182/2' && sectionId === 'C' && marks === 48) {
    return researchMethodsSectionQuestions(topic, sectionId, marks)
  }
  return genericSectionQuestions(topic, sectionId, paperId, marks, choiceGroup, choiceOption)
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
    caseHtml: paperId === '7182/1'
      ? '<p><strong>Paper route:</strong> Answer all questions. Section A — Social influence — 24 marks. Section B — Memory — 24 marks. Section C — Attachment — 24 marks. Section D — Clinical Psychology and Mental Health — 24 marks. Total 96 marks.</p><p>Revision-authored AQA-aligned practice paper. This is not an official AQA paper.</p>'
      : paperId === '7182/2'
        ? '<p><strong>Paper route:</strong> Answer all questions. Section A — Approaches in Psychology — 24 marks. Section B — Biopsychology — 24 marks. Section C — Research methods — 48 marks. Total 96 marks.</p><p>Revision-authored AQA-aligned practice paper. This is not an official AQA paper.</p>'
        : '<p><strong>Paper route:</strong> Answer all questions in Section A (Issues and Debates), then choose exactly one 24-mark topic from Section B (Relationships, Gender, or Cognition and Development), one from Section C (Schizophrenia, Eating Behaviour, or Stress), and one from Section D (Aggression, Forensic Psychology, or Addiction). Your attempted paper totals 96 marks.</p><p>Revision-authored AQA-aligned practice paper. This is not an official AQA paper.</p>',
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
