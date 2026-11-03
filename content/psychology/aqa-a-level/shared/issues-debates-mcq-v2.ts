import { multipleChoiceQuestionSchema } from '../../../schema'

/**
 * #698/#787 original Psychology 7182 v1.4 §4.3.1 Issues and Debates
 * (printed pp21–22; Founder PDF SHA-256
 * db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d).
 * REFERENCE_ONLY source: these scenarios, options and explanations are original.
 * Two previously same-options prototype MCQs are replaced with different V2
 * identities. These are single-best-answer choices, not independently scored
 * essay evaluation, cross-topic transfer mastery or qualified examiner review.
 * First A3 on pre-improvement candidate passed with minor distractor risks.
 * Reworded candidate requires a fresh exact-head independent blind-answer and
 * separate feedback review, CI, and governed Founder merge approval.
 */
export const issuesDebatesMcqV2 = {
  'PSY-08-01': multipleChoiceQuestionSchema.parse({
    id: 'psy-psy0801-check-v2',
    topic: 'issues-and-debates-in-psychology',
    prompt: 'A researcher develops a test of memory using only university students from one country. The researcher then claims the findings reveal how memory works for every culture, age group and gender. Which evaluation is best justified?',
    options: [
      'Using the same test with every participant gives enough evidence to claim universality.',
      'The restricted sample limits that claim; wider sampling and checks of the test are needed.',
      'The sample reveals cultural differences in memory that the researcher should report.',
      'Having more university participants would remove the need to study other groups.',
    ],
    correctOption: 1,
    explanation: 'Using the same procedure consistently supports comparability, not universality. Even a larger sample drawn only from one university population cannot establish results for all ages, cultures or genders. The study did not compare those groups, so it cannot establish a cultural difference either. Broader sampling, appropriate measures and replication would test the wider claim; the original study can still be informative within its limits.',
  }),
  'PSY-08-04': multipleChoiceQuestionSchema.parse({
    id: 'psy-psy0804-check-v2',
    topic: 'issues-and-debates-in-psychology',
    prompt: 'One psychologist explains a person’s stress entirely in terms of a single neurotransmitter. Another studies how physiological changes, workplace demands and social support interact. What is the strongest evaluation of the first explanation?',
    options: [
      'It is holistic because a biological pathway can be combined with broader social explanations.',
      'It is biologically reductionist; identifying one process removes the need for context.',
      'It is environmental reductionism because work conditions can affect biology.',
      'It is biologically reductionist; testing one process helps but may miss interactions.',
    ],
    correctOption: 3,
    explanation: 'An explanation of stress entirely in terms of a neurotransmitter is biological reductionism, not holism. A biological process could form part of a broader account, but the first psychologist has not examined wider interactions. Isolating one mechanism can make hypotheses precise and testable; it does not make workplace or social evidence unnecessary. Conditions at work may influence neurotransmitters without turning a neurotransmitter-only explanation into environmental reductionism. A holistic approach considers levels together, but is not automatically causally correct.',
  }),
} as const
