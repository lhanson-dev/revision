import { multipleChoiceQuestionSchema } from '../../../schema'

/**
 * #698/#787 original Psychology 7182 v1.4 §4.3.1 Issues and Debates
 * (printed pp21–22; Founder PDF SHA-256
 * db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d).
 * REFERENCE_ONLY source: these scenarios, options and explanations are original.
 * Two previously same-options prototype MCQs are replaced with different V2
 * identities. These are single-best-answer choices, not independently scored
 * essay evaluation, cross-topic transfer mastery or qualified examiner review.
 * Publication remains on educational A3 HOLD until exact-head independent
 * blind-answer and separate feedback review, CI, and governed merge approval.
 */
export const issuesDebatesMcqV2 = {
  'PSY-08-01': multipleChoiceQuestionSchema.parse({
    id: 'psy-psy0801-check-v2',
    topic: 'issues-and-debates-in-psychology',
    prompt: 'A researcher develops a test of memory using only university students from one country. The researcher then claims the findings reveal how memory works for every culture, age group and gender. Which evaluation is best justified?',
    options: [
      'Because the students all completed the same test, the findings must be universal.',
      'The narrow sample and test context limit the universality claim; broader sampling and culturally appropriate validation are needed.',
      'Any group difference would automatically prove alpha bias, whether the comparison was valid or not.',
      'A study conducted in one country is always worthless and must never be used to develop a hypothesis.',
    ],
    correctOption: 1,
    explanation: 'Universality cannot be established merely by applying one procedure consistently to a restricted group. A culturally narrow sample and culturally specific materials may limit generalisation. Researchers should examine who was studied, whether measures are appropriate elsewhere and whether results replicate. This does not prove that the underlying psychological process differs by culture, or that one study has no evidential value.',
  }),
  'PSY-08-04': multipleChoiceQuestionSchema.parse({
    id: 'psy-psy0804-check-v2',
    topic: 'issues-and-debates-in-psychology',
    prompt: 'One psychologist explains a person’s stress entirely in terms of a single neurotransmitter. Another studies how physiological changes, workplace demands and social support interact. What is the strongest evaluation of the first explanation?',
    options: [
      'It is holistic because it separates the behaviour into a specific biological mechanism.',
      'It must be false because biological mechanisms can never help explain stressful experiences.',
      'It is environmental reductionism because neurotransmitters are learned through rewards.',
      'It is biologically reductionist: isolating a mechanism may aid testing but can miss context and interactions.',
    ],
    correctOption: 3,
    explanation: 'Biological reductionism aims to explain a complex experience in terms of lower-level biological processes. Isolating a mechanism can support precise, testable predictions, but a single-neurotransmitter account may overlook environmental demands, interpretation and social relationships. A more holistic account examines interactions, though that alone does not prove its causal claims.',
  }),
} as const
