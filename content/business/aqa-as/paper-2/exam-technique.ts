import type { ExamTechniqueGuide } from '../../../schema'

export const examTechnique: ExamTechniqueGuide[] = [
  {
    id: 'blt-analysis',
    title: 'BLT — build analysis',
    summary: 'Use case evidence and push each point beyond the obvious.',
    steps: ['Case fact', 'Because', 'Leading to', 'Therefore'],
    tip: 'If the chain ends at “profit increases”, ask why that matters to this business now.',
  },
  {
    id: 'mops-evaluation',
    title: 'MOPS — earn evaluation',
    summary: 'Use these filters to make a judgement specific rather than generic.',
    steps: ['Magnitude', 'Objective', 'Probability', 'Short vs long term'],
    tip: 'Finish with a decision: which factor matters most, why, and what does it depend on?',
  },
  {
    id: 'calculation-questions',
    title: 'Calculation questions',
    summary: 'Make the method visible so the examiner can follow your reasoning.',
    steps: ['Formula', 'Substitute', 'Workings', 'Answer + unit'],
    tip: 'Never hide workings. If the final number is wrong, correct method can still matter.',
  },
  {
    id: 'case-study-application',
    title: 'Case-study application',
    summary: 'Application means using the case to change the argument, not simply mentioning it.',
    steps: ['Use a number, name or fact from the case', 'Explain why it changes the argument'],
    tip: 'Weak: “Training improves productivity.” Stronger: connect training to a case fact, then to cost, output, quality or the business objective.',
  },
  {
    id: 'analyse',
    title: 'Analyse',
    summary: 'Build a relevant, applied chain rather than listing disconnected effects.',
    steps: [
      'Make one relevant point.',
      'Apply it to the case.',
      'BLT the consequence twice.',
      'If useful, show the counter-effect.',
    ],
    tip: 'Aim for more marks per sentence, not simply a longer answer.',
  },
  {
    id: 'evaluate-assess',
    title: 'Evaluate / assess',
    summary: 'Compare competing arguments and finish with a supported, case-specific judgement.',
    steps: [
      'Analyse the strongest argument for.',
      'Analyse the strongest argument against or the strongest alternative.',
      'Compare using MOPS.',
      'Make a supported judgement rooted in the case.',
    ],
    tip: 'A strong judgement says which factor matters most, why, and what the conclusion depends on.',
  },
]
