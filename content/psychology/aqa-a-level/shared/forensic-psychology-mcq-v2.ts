import { multipleChoiceQuestionSchema } from '../../../schema'

/**
 * #698 / #787: original, one-mark applied Forensic Psychology decisions for
 * AQA 7182 v1.4 §4.3.9, printed pp23–24 (Founder source SHA256
 * db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d).
 * Official AQA specification: REFERENCE_ONLY. No protected prompt or scheme reused.
 *
 * Four different subskill choices, not full coverage of four multi-part source
 * bullets. Independent A3 key/distractor/feedback review remains a publication
 * gate; this code on a draft PR is not a claim of educational sufficiency.
 */
export const forensicPsychologyMcqV2 = {
  'PSY-16-01': multipleChoiceQuestionSchema.parse({
    id: 'psy-psy1601-check-v2',
    topic: 'forensic-psychology',
    prompt: 'An investigator plots the locations of a series of similar offences and uses their spatial distribution to estimate where the offender may travel from. Which profiling approach is being used?',
    options: [
      'An organised/disorganised typology, because the offence locations establish an offender personality category.',
      'Geographical profiling, using the pattern of offence locations as a probabilistic investigative lead.',
      'Eysenck’s personality theory, using the map to identify the offender’s stable temperament dimensions.',
      'Differential association theory, using the mapped locations to identify which peers taught the offences.',
    ],
    correctOption: 1,
    explanation: 'Geographical profiling analyses spatial patterns in crime locations to generate possible offender activity-base or movement hypotheses. It is a probabilistic investigative aid, not a reliable identification from coordinates alone. An organised/disorganised typology starts from behavioural categories; Eysenck concerns personality; differential association concerns learning through social relationships. None is established merely by a map.',
  }),
  'PSY-16-02': multipleChoiceQuestionSchema.parse({
    id: 'psy-psy1602-check-v2',
    topic: 'forensic-psychology',
    prompt: 'Researchers report a statistical association between some inherited characteristics, brain-function measures and later offending in a sample. Which interpretation is most defensible?',
    options: [
      'The results show offending is fixed at conception, so changes in upbringing cannot alter anyone’s behaviour.',
      'The brain findings identify a single neural cause of each offence, independent of social context or history.',
      'The genetic correlation alone shows that those characteristics are sufficient to explain why each person offended.',
      'The findings may indicate biological vulnerability, but causal pathways and environmental influences still need testing.',
    ],
    correctOption: 3,
    explanation: 'Genetic and neural explanations can contribute to understanding group-level risk, but associations are not proof of an inevitable or sufficient cause of an individual offence. Environmental exposure, development and gene–environment interplay may matter. Neither a single crime gene nor a definitive neural diagnosis follows from these data. Researchers would need suitable designs to distinguish causation from confounding and reverse interpretations.',
  }),
  'PSY-16-03': multipleChoiceQuestionSchema.parse({
    id: 'psy-psy1603-check-v2',
    topic: 'forensic-psychology',
    prompt: 'After someone accidentally bumps into him in a queue, Rowan assumes the stranger intended to threaten him and reacts aggressively. Which psychological explanation most directly fits that interpretation?',
    options: [
      'Hostile attribution bias: an ambiguous social event is interpreted as deliberately threatening.',
      'Minimisation: Rowan downplays the harm of his own actions after considering their consequences.',
      'Differential association: Rowan has demonstrably learned the response from close peers who offend.',
      'Eysenck’s account: one queue incident establishes a lasting high score on personality dimensions.',
    ],
    correctOption: 0,
    explanation: 'A hostile attribution bias is the tendency to interpret ambiguous actions as hostile; Rowan interprets an accidental bump as an intended threat. Minimisation instead concerns understating wrongdoing or harm, and the vignette supplies no such explanation. Nor does it identify the peer-learning history required to apply differential association or establish stable traits under Eysenck’s theory. One incident alone cannot establish a general offending explanation.',
  }),
  'PSY-16-04': multipleChoiceQuestionSchema.parse({
    id: 'psy-psy1604-check-v2',
    topic: 'forensic-psychology',
    prompt: 'A person who offended and the person harmed both freely agree to a facilitated meeting. They discuss the harm and possible steps to repair it. Which intervention is most directly illustrated?',
    options: [
      'Token-economy behaviour modification in custody, using specified rewards for rule-following.',
      'Anger management, using structured recognition and control of emotional and physiological arousal.',
      'Restorative justice, giving those affected a voluntary part in discussing harm and possible reparation.',
      'Custodial sentencing, whose primary feature is restricting liberty under a sentence imposed by a court.',
    ],
    correctOption: 2,
    explanation: 'Restorative justice can involve a voluntary, carefully facilitated process in which the person harmed and the person responsible discuss impact and possible repair. It is not identical to sentencing, token-based behaviour modification or anger-management training. The vignette states mutual agreement; a process should not assume that every victim wants contact, that meeting is appropriate in every case, or that participation alone prevents reoffending.',
  }),
} as const
