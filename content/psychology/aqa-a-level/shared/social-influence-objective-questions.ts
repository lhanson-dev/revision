/**
 * LF-03: four original AQA 7182 Social Influence objective items.
 *
 * The former generated items reused the same four section labels as answers to
 * all four prompts. These cases instead assess a specific distinction within
 * each section; distractors belong to the question, not a shared concept pool.
 *
 * Their published IDs receive a v2 suffix in course.ts so previous scored
 * answers remain attributable to their original questions and answer keys.
 */
export const socialInfluenceObjectiveQuestions: Record<string, {
  prompt: string
  options: [string, string, string, string]
  correctOption: number
  explanation: string
}> = {
  'PSY-01-01': {
    prompt: 'Nadia agrees with a group answer aloud but still privately thinks it is wrong. Which type of conformity is she showing?',
    options: [
      'Internalisation: Nadia has privately adopted the group view.',
      'Compliance: Nadia publicly agrees without privately accepting the view.',
      'Informational influence: Nadia relies on others to decide what is correct.',
      'Obedience: Nadia follows a direct command from an authority figure.',
    ],
    correctOption: 1,
    explanation: 'Compliance changes outward behaviour or expressed judgement without requiring private agreement. Internalisation involves adopting the view privately.',
  },
  'PSY-01-02': {
    prompt: 'In a Milgram-style obedience study, participants are more willing to follow instructions in a prestigious institution than in an ordinary office. Which explanation best fits this difference?',
    options: [
      'The participant has formed an internal working model.',
      'A dissenting ally has broken majority unanimity.',
      'The judgement task has become harder and more ambiguous.',
      'The setting can make the authority appear more legitimate.',
    ],
    correctOption: 3,
    explanation: 'A setting associated with status can strengthen perceived legitimacy of authority and influence obedience. Location is a situational factor, not a guarantee that someone will obey.',
  },
  'PSY-01-03': {
    prompt: 'During a group judgement, one member disagrees with an otherwise unanimous majority. Why might this help another person resist pressure to conform?',
    options: [
      'The dissenter breaks unanimity and provides social support.',
      'The dissenter has issued an instruction that must be obeyed.',
      'The disagreement increases the number in the majority.',
      'An external locus of control makes everyone independent.',
    ],
    correctOption: 0,
    explanation: 'A dissenter can reduce conformity by breaking unanimity and providing social support. The dissenter need not give the objectively correct answer.',
  },
  'PSY-01-04': {
    prompt: 'A small campaign group keeps its central message consistent but listens to objections and makes reasonable adjustments. What could make its influence more effective?',
    options: [
      'A large majority guarantees that the campaign will be accepted.',
      'Wearing a uniform ensures that observers will obey.',
      'Consistency combined with flexibility can make the minority more persuasive.',
      'Abandoning the original position whenever anyone disagrees.',
    ],
    correctOption: 2,
    explanation: 'Minority influence can be strengthened by a consistent position combined with flexibility. Rigid repetition or abandoning the position altogether is not the same as persuasive flexibility.',
  },
}
