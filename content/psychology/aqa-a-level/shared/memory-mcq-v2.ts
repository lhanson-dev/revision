import { multipleChoiceQuestionSchema } from '../../../schema'

/**
 * LF-03 / #787: original contextual AQA 7182 v1.4 §4.1.2 Memory questions.
 * Four independent parent requirements, four distinct sets of distractors.
 *
 * New V2 IDs are deliberate: an applied skill is not interchangeable with the
 * former concept-label recognition question. Existing V1 raw evidence must
 * retain its historic original answer keys, never be regraded against V2.
 *
 * Educational A3 review must occur independently before this reaches main.
 */
export const memoryMcqV2 = {
  'PSY-02-01': multipleChoiceQuestionSchema.parse({
    id: 'psy-psy0201-check-v2',
    topic: 'memory',
    prompt: 'A student briefly sees a grid of letters. They can report some letters immediately, but most are unavailable after a short delay unless they attended to them. Which explanation best fits the multi-store model?',
    options: [
      'All unattended letters automatically become durable long-term memories.',
      'Short-term memory retains every visual detail indefinitely without rehearsal.',
      'The sensory register briefly holds input; attention can select some for short-term memory.',
      'The sensory register only processes spoken sounds, so visual input bypasses it.',
    ],
    correctOption: 2,
    explanation: 'In the multi-store model, the sensory register holds incoming sensory information very briefly. Attended information can enter short-term memory, which has limited capacity and duration without maintenance. Attention does not guarantee later long-term storage. The sensory register is not restricted to sounds.',
  }),
  'PSY-02-02': multipleChoiceQuestionSchema.parse({
    id: 'psy-psy0202-check-v2',
    topic: 'memory',
    prompt: 'While listening to spoken directions, a learner also pictures a route across a map. They find this easier than trying to repeat two different spoken messages at once. Which working-memory account best explains the difference?',
    options: [
      'The phonological loop handles verbal material while the visuo-spatial sketchpad handles imagined routes; central control can coordinate both.',
      'The phonological loop handles imagined maps, whereas the visuo-spatial sketchpad handles only speech sounds.',
      'The episodic buffer is a permanent store that removes all limits on simultaneous processing.',
      'Working memory has one undifferentiated temporary store, so the two task combinations must interfere equally.',
    ],
    correctOption: 0,
    explanation: 'The working-memory model distinguishes temporary verbal processing in the phonological loop from visual and spatial processing in the visuo-spatial sketchpad. Their partially separate resources can make mixed tasks easier than two competing verbal tasks, although central executive resources remain limited. The episodic buffer is not a permanent unlimited store.',
  }),
  'PSY-02-03': multipleChoiceQuestionSchema.parse({
    id: 'psy-psy0203-check-v2',
    topic: 'memory',
    prompt: 'After studying French verbs for months, Maya begins learning similar Italian verbs. When tested on Italian, she repeatedly gives the older French words instead. Which explanation best accounts for this difficulty?',
    options: [
      'Retroactive interference: the new Italian words disrupt recall of the older French words.',
      'Retrieval-cue failure: the correct Italian answer was never encoded or stored.',
      'Anxiety: Maya must have been too stressed to form any Italian memories.',
      'Proactive interference: older French learning disrupts retrieval of the newer Italian words.',
    ],
    correctOption: 3,
    explanation: 'This is proactive interference: previously learned French words compete with retrieval of the newer Italian words. Retroactive interference reverses that direction, with new learning interfering with older material. Incorrect responses alone do not establish that the newer learning was never encoded or that anxiety was the cause.',
  }),
  'PSY-02-04': multipleChoiceQuestionSchema.parse({
    id: 'psy-psy0204-check-v2',
    topic: 'memory',
    prompt: 'Two witnesses discuss an accident before giving separate statements. One mentions a red jacket; the other later reports a red jacket despite not independently remembering its colour. Which factor is most directly illustrated?',
    options: [
      'A leading question that introduced the colour during a police interview.',
      'Post-event discussion, which can influence a witness through memory conformity.',
      'Anxiety during the original event, which necessarily improves colour recall.',
      'The cognitive interview, which requires witnesses to adopt another person\'s account.',
    ],
    correctOption: 1,
    explanation: 'Information from another witness after the event can influence a later account: this is post-event discussion and may involve memory conformity. No suggestive police question is described, anxiety effects are not uniformly beneficial, and a cognitive interview does not instruct a witness to copy another person\'s account.',
  }),
} as const
