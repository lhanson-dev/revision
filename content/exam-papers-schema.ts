import { z } from 'zod'

/**
 * The "Exam Prep" paper guide for one board and specification: what each paper contains and what examiners give
 * marks for. It is content, not code: each board/spec has its own file, and the Exam Prep page only reads it.
 *
 * Content rule (Founder, 6 Oct 2026): anything official about the course, questions, exams or marks must come from
 * content approved through the Content Factory (its Exam Truth) or be checked against the exam board. Wording that
 * only explains a feature to the student can live in the page. So the optional parts below (command words, the levels
 * note, "on the day" advice) stay out of a file until their wording has been approved.
 */
const aoIdSchema = z.enum(['AO1', 'AO2', 'AO3', 'AO4'])

export const examPaperSectionSchema = z.object({
  name: z.string().min(1),
  /** What the student does in it, e.g. "15 multiple choice". */
  type: z.string().min(1),
  marks: z.number().int().positive(),
})

export const examPaperSchema = z.object({
  /** Matches the course's paper number (1, 2, 3). */
  number: z.number().int().positive(),
  name: z.string().min(1),
  title: z.string().min(1),
  /** The question types, e.g. "Multiple choice, short answers and two essays". */
  what: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  totalMarks: z.number().int().positive(),
  /** "a third of your A-level" */
  weighting: z.string().min(1),
  sections: z.array(examPaperSectionSchema).min(1),
  /** Which topic ids the paper can assess. `all` means every topic in the course. */
  topics: z.union([z.literal('all'), z.array(z.string().min(1)).min(1)]),
}).superRefine((paper, context) => {
  const marks = paper.sections.reduce((sum, section) => sum + section.marks, 0)
  if (marks !== paper.totalMarks) context.addIssue({ code: 'custom', path: ['sections'], message: `section marks add up to ${marks}, not ${paper.totalMarks}` })
})

export const examAssessmentObjectiveSchema = z.object({
  id: aoIdSchema,
  /** The factory's Exam Truth capability for this objective, in plain words: "Knowledge and understanding". */
  capability: z.string().min(1),
  /** Share of the whole A-level that the objective carries, in percent (Exam Truth `overall_percent_range`). */
  overallPercentRange: z.tuple([z.number().nonnegative(), z.number().nonnegative()]),
})

export const examCommandWordSchema = z.object({
  word: z.string().min(1),
  asks: z.string().min(1),
  marks: z.string().min(1),
  aos: z.string().min(1),
})

export const examPapersContentSchema = z.object({
  schemaVersion: z.literal(1),
  examBoard: z.string().min(1),
  specificationCode: z.string().min(1),
  /** Where the structure comes from: the factory's Exam Truth, and the board page it was checked against. */
  checkedAgainst: z.object({ source: z.string().url(), checkedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), approvedBy: z.string().min(1) }),
  papers: z.array(examPaperSchema).min(1),
  dayRules: z.array(z.string().min(1)).optional(),
  assessmentObjectives: z.array(examAssessmentObjectiveSchema).length(4),
  commandWords: z.array(examCommandWordSchema).optional(),
  levelsNote: z.string().min(1).optional(),
})

export type ExamPaperSection = z.infer<typeof examPaperSectionSchema>
export type ExamPaperGuide = z.infer<typeof examPaperSchema>
export type ExamAssessmentObjective = z.infer<typeof examAssessmentObjectiveSchema>
export type ExamCommandWord = z.infer<typeof examCommandWordSchema>
export type ExamPapersContent = z.infer<typeof examPapersContentSchema>
