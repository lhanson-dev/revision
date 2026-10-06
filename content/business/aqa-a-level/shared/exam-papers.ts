import { examPapersContentSchema } from '../../../exam-papers-schema'

/**
 * AQA A-level Business 7132: the three papers and the four assessment objectives.
 *
 * Source: the Content Factory's AQA 7132 Exam Truth (`scripts/assurance/materialise-aqa-business-7132-course-exam-truth.mjs`),
 * which records AQA's published assessment contract: 3 papers of 2 hours and 100 marks (33.3% each), every paper can
 * assess the whole course, the question structure of each paper, and the four assessment objectives with their weightings.
 * Checked against AQA's "specification at a glance" page on 2026-10-06.
 *
 * Deliberately NOT here, because the factory has not approved wording for it: command words and their usual marks, a
 * levels explanation, "on the day" advice and "how you show it" coaching for each objective. The Exam Prep page shows a
 * section only when the file has it. Suggested time per section is worked out in code from these marks, not written here.
 */
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
    },
  ],
  assessmentObjectives: [
    { id: 'AO1', capability: 'Knowledge and understanding', overallPercentRange: [22, 25] },
    { id: 'AO2', capability: 'Application to business contexts', overallPercentRange: [24, 27] },
    { id: 'AO3', capability: 'Analysis of business issues and influences', overallPercentRange: [25, 28] },
    { id: 'AO4', capability: 'Evaluation and evidence-based judgement', overallPercentRange: [23, 26] },
  ],
})
