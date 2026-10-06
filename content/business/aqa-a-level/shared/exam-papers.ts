import { examPapersContentSchema } from '../../../exam-papers-schema'

/**
 * AQA A-level Business 7132: the three papers and the four assessment objectives.
 *
 * Source: the Content Factory's AQA 7132 Exam Truth (`scripts/assurance/materialise-aqa-business-7132-course-exam-truth.mjs`),
 * which records AQA's published assessment contract: 3 papers of 2 hours and 100 marks (33.3% each), every paper can
 * assess the whole course, the question structure of each paper, and the four assessment objectives with their weightings.
 * Checked against AQA's "specification at a glance" page on 2026-10-06.
 *
 * Everything below the factory-backed structure is FLAGGED `needs_check` and shown on the page with a "Being checked"
 * chip until the factory approves it or it is checked against AQA: command words and their usual marks, the levels
 * explanation, "how you show it" coaching on each objective, "on the day" advice and a Paper 3 reading time. They came
 * from the design package's sample copy (and, for the mark ranges, from the factory's question bank and retained mocks).
 * Suggested time per section is worked out in code from the marks, not written here.
 */
const fromDesign = { status: 'needs_check', why: 'Wording from the Exam Prep design sample copy, not yet approved through the Content Factory or checked against AQA.' } as const

export const aqaBusiness7132ExamPapers = examPapersContentSchema.parse({
  schemaVersion: 1,
  examBoard: 'AQA',
  specificationCode: '7132',
  checkedAgainst: {
    source: 'https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/specification-at-a-glance',
    checkedOn: '2026-10-06',
    approvedBy: 'Content Factory AQA 7132 Exam Truth',
  },
  papers: [
    {
      number: 1, name: 'Paper 1', title: 'Business 1',
      what: 'Multiple choice, short answers and two essays',
      durationMinutes: 120, totalMarks: 100, weighting: 'a third of your A-level',
      sections: [
        { name: 'Section A', type: '15 multiple choice', marks: 15 },
        { name: 'Section B', type: 'Short answers', marks: 35 },
        { name: 'Section C', type: 'One essay from two', marks: 25 },
        { name: 'Section D', type: 'One essay from two', marks: 25 },
      ],
      topics: 'all',
    },
    {
      number: 2, name: 'Paper 2', title: 'Business 2',
      what: 'Three data response questions, each in 3 or 4 parts',
      durationMinutes: 120, totalMarks: 100, weighting: 'a third of your A-level',
      sections: [
        { name: 'Question 1', type: 'Data response', marks: 33 },
        { name: 'Question 2', type: 'Data response', marks: 33 },
        { name: 'Question 3', type: 'Data response', marks: 34 },
      ],
      topics: 'all',
    },
    {
      number: 3, name: 'Paper 3', title: 'Business 3',
      what: 'One case study with about 6 questions',
      durationMinutes: 120, totalMarks: 100, weighting: 'a third of your A-level',
      sections: [
        { name: 'Case study questions', type: 'About 6 questions on one case study', marks: 100 },
      ],
      topics: 'all',
      notes: [{ text: 'Read the case study and appendices first: about 15 minutes before you start writing.', check: { status: 'needs_check', why: 'Reading time is from the design sample copy. AQA’s published page does not state one.' } }],
    },
  ],
  assessmentObjectives: [
    { id: 'AO1', capability: 'Knowledge and understanding', overallPercentRange: [22, 25], coaching: { does: 'Knowing the terms, formulas and theory.', show: 'Define it accurately, or use the right formula.', check: fromDesign } },
    { id: 'AO2', capability: 'Application to business contexts', overallPercentRange: [24, 27], coaching: { does: 'Using the business in the question.', show: 'Use its figures, its product and its situation, not a generic business.', check: fromDesign } },
    { id: 'AO3', capability: 'Analysis of business issues and influences', overallPercentRange: [25, 28], coaching: { does: 'Explaining causes and effects.', show: 'Build a chain: this happens, which leads to this, so the business…', check: fromDesign } },
    { id: 'AO4', capability: 'Evaluation and evidence-based judgement', overallPercentRange: [23, 26], coaching: { does: 'Weighing things up and judging.', show: 'Reach a conclusion and say what it depends on.', check: fromDesign } },
  ],
  commandWords: [
    { word: 'State / Define', asks: 'Give the fact or meaning. No explanation needed.', marks: '1–2 marks', aos: 'AO1', check: fromDesign },
    { word: 'Calculate', asks: 'Work it out and show your working. Working earns marks even if the answer is wrong.', marks: '2–6 marks', aos: 'AO1 · AO2', check: { status: 'needs_check', why: 'Wording from the design sample copy; the mark range is read from the factory question bank, not an AQA rule.' } },
    { word: 'Explain', asks: 'Say why or how, using the business in the question.', marks: '4–6 marks', aos: 'AO1 · AO2 · AO3', check: { status: 'needs_check', why: 'Wording from the design sample copy; the mark range is read from the factory question bank, not an AQA rule.' } },
    { word: 'Analyse', asks: 'Explain the chain of causes and effects, in this business.', marks: '6–9 marks', aos: 'AO1 · AO2 · AO3', check: { status: 'needs_check', why: 'Wording from the design sample copy; the mark range is read from the factory question bank and retained mocks, not an AQA rule.' } },
    { word: 'Evaluate / To what extent', asks: 'Argue both sides, then make a judgement and say what it depends on.', marks: '9–25 marks', aos: 'All four, AO4 most', check: { status: 'needs_check', why: 'Wording from the design sample copy; the mark range is read from the factory question bank, not an AQA rule.' } },
  ],
  levelsNote: { text: 'Longer answers are marked in levels. The examiner reads the whole answer, decides which level it fits, then picks a mark within that level.', check: { status: 'needs_check', why: 'Explains how answers are marked. Check against the factory’s level descriptors and AQA’s mark scheme approach.' } },
  dayRules: [
    { text: 'Calculator allowed', check: { status: 'needs_check', why: 'AQA’s published pages do not state a calculator rule. Check the paper’s front cover or AQA’s exam rules.' } },
    { text: 'Answer every question', check: { status: 'needs_check', why: 'Likely wrong as written: Paper 1 Sections C and D are one essay from two. Needs correcting before it is approved.' } },
    { text: 'The marks are printed next to each question. Use them to pace yourself: about 1 minute a mark.', check: { status: 'needs_check', why: 'Pacing advice from the design sample copy. The “1 minute a mark” figure is 120 minutes over 100 marks; the “printed next to each question” claim needs checking.' } },
  ],
})
