/**
 * LF-03: authored distractors for the four ORIGINAL topic-level Social Influence
 * concept checks. These are recognition questions, not a substitute for the
 * separately source-targeted scenario Practice questions in PR #773.
 *
 * Keep original IDs, the Course Truth definition-stem and the correct concept
 * label. Only distractor options and their presentation order change. The
 * standard versioned Practice checkpoint fingerprints changed content and
 * refuses stale-answer replay; prior recorded topic-level evidence is retained.
 */
export const socialInfluenceOriginalMcqOverrides: Record<
  string,
  { correctOption: number; distractors: readonly [string, string, string] }
> = {
  'PSY-01-01': {
    correctOption: 1,
    distractors: [
      'Informational social influence',
      'Agentic state',
      'Resistance through social support',
    ],
  },
  'PSY-01-02': {
    correctOption: 3,
    distractors: [
      'Internalisation',
      'Normative social influence',
      'Legitimacy of authority',
    ],
  },
  'PSY-01-03': {
    correctOption: 0,
    distractors: [
      'Social support',
      'Majority unanimity',
      'Authoritarian Personality',
    ],
  },
  'PSY-01-04': {
    correctOption: 2,
    distractors: [
      'Compliance',
      'Uniform as an authority cue',
      'Task difficulty in conformity',
    ],
  },
}
