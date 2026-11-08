import { multipleChoiceQuestionSchema } from '../../../schema'

/**
 * #698 / LF-03: original one-mark context decisions for AQA Psychology 7182
 * v1.4 §4.3.4 (printed p22), source SHA256
 * db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d.
 * Official source is REFERENCE_ONLY. No AQA question or wording is reproduced.
 *
 * Each V2 question replaces a repeated-options V1 definition check.
 * Prior scored responses and in-progress V1 checkpoint keys must remain
 * reconstructable; no old mark can be regraded with a different key.
 * These decisions are not independent essay AO3, complete atom assurance,
 * or a claim of examiner-standard marking. Independent A3 remains required.
 */
export const cognitionDevelopmentMcqV2 = {
  'PSY-11-01': multipleChoiceQuestionSchema.parse({
    id: 'psy-psy1101-check-v2',
    topic: 'cognition-and-development',
    prompt: 'A child sees the same water poured from a wide cup into a tall, narrow cup and says that the tall cup now contains more. Which Piagetian explanation is most appropriate?',
    options: [
      'The child has accommodated the quantity schema and so recognises that volume has remained constant.',
      'The child lacks object permanence because the water cannot be seen after the transfer between cups.',
      'The child focuses on the new height and does not yet reliably conserve the unchanged quantity.',
      'The child shows formal operational thought by forming a hypothetical explanation about container shape.',
    ],
    correctOption: 2,
    explanation: 'The child judges the quantity by the salient height change, which is consistent with difficulty conserving volume in a classic Piagetian task. The water remains visible, so object permanence is not the issue; the response neither demonstrates accommodation to conservation nor formal operational reasoning. Task language and context may affect performance, so one answer does not prove an inflexible global stage.',
  }),
  'PSY-11-02': multipleChoiceQuestionSchema.parse({
    id: 'psy-psy1102-check-v2',
    topic: 'cognition-and-development',
    prompt: 'A learner cannot solve a new sorting problem alone. A more experienced peer gives a sequence of hints; over several attempts the hints are reduced until the learner solves it unaided. Which account best fits?',
    options: [
      'The task was within the zone of proximal development, and responsive support was gradually withdrawn.',
      'The task was outside the zone of proximal development because the learner initially needed guidance.',
      'The task demonstrates classical conditioning because hints necessarily trigger an automatic learned response.',
      'The task proves fixed ability because solving the problem alone later does not change learning potential.',
    ],
    correctOption: 0,
    explanation: 'The zone of proximal development concerns what a learner can achieve with suitable support compared with their present independent performance. Temporary, adjusted hints are scaffolding; withdrawing them as competence grows matters. Needing help initially does not place a task outside the ZPD, and this example neither establishes classical conditioning nor fixed ability. Scaffolding is an educational term developed from Vygotskian principles, not necessarily his own label.',
  }),
  'PSY-11-03': multipleChoiceQuestionSchema.parse({
    id: 'psy-psy1103-check-v2',
    topic: 'cognition-and-development',
    prompt: 'In a looking-time study, infants look longer when a screen seems to pass through a solid object than when it stops where the object should be. Which conclusion is best justified?',
    options: [
      'The longer look demonstrates that the infants can verbally describe all hidden object events accurately.',
      'The infants have necessarily reached every stage of Piagetian reasoning sooner than originally predicted.',
      'The longer look establishes that the experiment has ruled out all novelty and attention explanations.',
      'The longer look is consistent with violated physical expectations, while alternative explanations remain.',
    ],
    correctOption: 3,
    explanation: 'Baillargeon used violation-of-expectation looking-time methods to investigate early physical-world knowledge. A longer look at an apparently impossible event is consistent with a prediction being violated, but it is an indirect measure: perceptual novelty, attention, familiarisation and method choices need consideration. It does not show the infant can explain the event in words or has attained every later Piagetian skill.',
  }),
  'PSY-11-04': multipleChoiceQuestionSchema.parse({
    id: 'psy-psy1104-check-v2',
    topic: 'cognition-and-development',
    prompt: 'Sally puts a marble in a basket and leaves. Anne moves it into a box while Sally is away. A child predicts that Sally will first look in the basket. What does that prediction most directly suggest?',
    options: [
      'The child cannot distinguish the child’s own knowledge from Sally’s, since both know the new location.',
      'The child can attribute a false belief to Sally, separating her perspective from the actual location.',
      'The child has shown that mirror-neuron activity must be the sole cause of understanding another person.',
      'The child has demonstrated all of Selman’s perspective-taking levels through a single location choice.',
    ],
    correctOption: 1,
    explanation: 'Predicting the basket indicates the child can represent Sally’s mistaken belief, the central demand in a first-order false-belief task such as Sally–Anne. The marble really is in the box, but Sally did not observe the move. This specific response does not establish all levels of Selman’s perspective-taking framework, and the behaviour alone cannot establish a particular neural mechanism.',
  }),
} as const
