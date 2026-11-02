import { multipleChoiceQuestionSchema } from '../../../schema'

/**
 * LF-03 original, deliberately authored AQA 7182 v1.4 §4.1.1 Social Influence
 * application checks. These replace four generic definition-recognition items.
 *
 * New IDs are intentional: option indexes and the assessed response demand
 * changed. Prior evidence remains attached to the old IDs and retains the
 * selected and keyed indexes recorded at the time; it must never be regraded
 * against the V2 answer keys.
 *
 * This content requires separate independent A3 educational assurance.
 */
export const socialInfluenceMcqV2 = {
  'PSY-01-01': multipleChoiceQuestionSchema.parse({
    id: 'psy-psy0101-check-v2',
    topic: 'social-influence',
    prompt: 'In a line-judgement exercise, Freya privately thinks line B is correct. She says line C only to avoid standing out when the other students all choose C. Afterwards she still thinks B is correct. Which type of conformity is illustrated?',
    options: [
      'Internalisation: her private view has changed to match the group.',
      'Compliance: she agrees publicly without changing her private view.',
      'Informational social influence: she trusts the group because she is uncertain.',
      'Minority influence: Freya persuades the rest of the group to change.',
    ],
    correctOption: 1,
    explanation: 'Freya changes her public answer to avoid standing out but still privately disagrees. That is compliance. Internalisation would mean privately accepting the group\'s position; informational influence would involve treating the group as evidence when uncertain.',
  }),
  'PSY-01-02': multipleChoiceQuestionSchema.parse({
    id: 'psy-psy0102-check-v2',
    topic: 'social-influence',
    prompt: 'Two obedience studies use the same authority figure, instruction and task. One takes place at a respected university, the other in an ordinary rented office. Which interpretation best explains why the setting could affect obedience?',
    options: [
      'The setting directly measures each participant\'s authoritarian personality.',
      'Instructions in an office count as conformity rather than obedience.',
      'The study has changed the physical distance between the participant and the person affected.',
      'The setting may affect the perceived legitimacy of the authority giving the instruction.',
    ],
    correctOption: 3,
    explanation: 'Changing the location can alter the status and perceived legitimacy of the authority. This is a situational influence on obedience, not a measure of authoritarian personality or necessarily a change in proximity. A setting change may influence obedience; it does not guarantee an outcome.',
  }),
  'PSY-01-03': multipleChoiceQuestionSchema.parse({
    id: 'psy-psy0103-check-v2',
    topic: 'social-influence',
    prompt: 'During a group judgement task, almost everyone gives the same wrong answer. One other person openly disagrees with the majority, but their own answer is also wrong. A student now feels more able to give an independent answer. What best explains this?',
    options: [
      'Social support can reduce conformity by breaking the majority\'s unanimity.',
      'Social support works only when the dissenter gives the objectively correct answer.',
      'The student must have internalised the majority\'s view.',
      'The student is obeying an instruction from a legitimate authority.',
    ],
    correctOption: 0,
    explanation: 'A dissenter can weaken majority pressure simply by showing that the group is not unanimous. Their answer need not be correct. This illustrates social support as resistance to conformity, not obedience or adoption of the majority view.',
  }),
  'PSY-01-04': multipleChoiceQuestionSchema.parse({
    id: 'psy-psy0104-check-v2',
    topic: 'social-influence',
    prompt: 'A small campaign group has defended the same central goal for months. After listening to objections, it changes parts of its proposed method without giving up that goal. Which feature of minority influence is best shown by its response to objections?',
    options: [
      'Commitment: the group has invested substantial time in its position.',
      'Rigidity: the group refuses to consider any change in its proposal.',
      'Flexibility: the group adjusts its approach while keeping a coherent position.',
      'Internalisation: the majority has already privately adopted the group\'s beliefs.',
    ],
    correctOption: 2,
    explanation: 'The response to objections shows flexibility without abandoning a consistent central goal. Long-term effort also suggests commitment, but the question asks specifically about how the group responds to objections; rigid refusal would be the opposite.',
  }),
} as const
