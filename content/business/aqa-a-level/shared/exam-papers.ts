import { examPapersContentSchema } from '../../../exam-papers-schema'

/**
 * AQA A-level Business 7132: the three papers, how the 2 hours run, and what examiners mark for.
 *
 * Structure, marks, duration and weighting are AQA's (specification at a glance, checked 2026-10-06).
 * Suggested minutes are Revision guidance: about 1 minute a mark, leaving 5 minutes to check. AQA does not
 * publish a reading time or a per-section timing, so none is claimed as AQA's.
 * Assessment objectives are described in Revision's own words (reference only, not AQA copy).
 */
export const aqaBusiness7132ExamPapers = examPapersContentSchema.parse({
  schemaVersion: 1,
  examBoard: 'AQA',
  specificationCode: '7132',
  checkedAgainst: { source: 'https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/specification-at-a-glance', checkedOn: '2026-10-06' },
  papers: [
    {
      number: 1, name: 'Paper 1', title: 'Business 1',
      what: 'Multiple choice, short answers and two essays',
      durationMinutes: 120, totalMarks: 100, weighting: 'a third of your A-level', checkMinutes: 5,
      sections: [
        { name: 'Section A', type: '15 multiple choice', marks: 15, minutes: 15 },
        { name: 'Section B', type: 'Short answers', marks: 35, minutes: 40 },
        { name: 'Section C', type: 'One essay from two', marks: 25, minutes: 30 },
        { name: 'Section D', type: 'One essay from two', marks: 25, minutes: 30 },
      ],
      topics: 'all',
    },
    {
      number: 2, name: 'Paper 2', title: 'Business 2',
      what: 'Three data response questions, each in 3 or 4 parts',
      durationMinutes: 120, totalMarks: 100, weighting: 'a third of your A-level', checkMinutes: 5,
      sections: [
        { name: 'Question 1', type: 'Data response', marks: 33, minutes: 38 },
        { name: 'Question 2', type: 'Data response', marks: 33, minutes: 38 },
        { name: 'Question 3', type: 'Data response', marks: 34, minutes: 39 },
      ],
      topics: 'all',
    },
    {
      number: 3, name: 'Paper 3', title: 'Business 3',
      what: 'One case study with about 6 questions',
      durationMinutes: 120, totalMarks: 100, weighting: 'a third of your A-level', checkMinutes: 5,
      sections: [
        { name: 'The case study', type: 'Read it before you start writing', marks: 0, minutes: 15 },
        { name: 'The questions', type: 'About 6, getting longer', marks: 100, minutes: 100 },
      ],
      topics: 'all',
    },
  ],
  dayRules: [
    'Answer every question',
    'The marks are printed next to each question. Use them to pace yourself: about 1 minute a mark.',
  ],
  assessmentObjectives: [
    { id: 'AO1', name: 'Knowledge', does: 'Knowing the terms, formulas and theory.', show: 'Define it accurately, or use the right formula.' },
    { id: 'AO2', name: 'Application', does: 'Using the business in the question.', show: 'Use its figures, its product and its situation, not a generic business.' },
    { id: 'AO3', name: 'Analysis', does: 'Explaining causes and effects.', show: 'Build a chain: this happens, which leads to this, so the business…' },
    { id: 'AO4', name: 'Evaluation', does: 'Weighing things up and judging.', show: 'Reach a conclusion and say what it depends on.' },
  ],
  commandWords: [
    { word: 'State / Define', asks: 'Give the fact or meaning. No explanation needed.', marks: '1–2 marks', aos: 'AO1' },
    { word: 'Calculate', asks: 'Work it out and show your working. Working earns marks even if the answer is wrong.', marks: '2–6 marks', aos: 'AO1 · AO2' },
    { word: 'Explain', asks: 'Say why or how, using the business in the question.', marks: '4–6 marks', aos: 'AO1 · AO2 · AO3' },
    { word: 'Analyse', asks: 'Explain the chain of causes and effects, in this business.', marks: '6–9 marks', aos: 'AO1 · AO2 · AO3' },
    { word: 'Evaluate / To what extent', asks: 'Argue both sides, then make a judgement and say what it depends on.', marks: '9–25 marks', aos: 'All four, AO4 most' },
  ],
  levelsNote: 'Longer answers are marked in levels. The examiner reads the whole answer, decides which level it fits, then picks a mark within that level.',
})
