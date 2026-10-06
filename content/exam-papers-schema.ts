import { z } from 'zod'

/**
 * The "Exam Prep" paper guide for one board and specification: what each paper contains, how the time runs,
 * what examiners give marks for. It is content, not code: each board/spec has its own file, and the Exam Prep
 * page only reads it. Checked against the board's published assessment pages (see `checkedAgainst`).
 */
const aoIdSchema = z.enum(['AO1', 'AO2', 'AO3', 'AO4'])

export const examPaperSectionSchema = z.object({
  name: z.string().min(1),
  /** What the student does in it, e.g. "15 multiple choice". */
  type: z.string().min(1),
  marks: z.number().int().nonnegative(),
  /** Suggested minutes. Revision guidance (about 1 minute a mark), not a board rule. */
  minutes: z.number().int().positive(),
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
  /** Minutes at the end that the sections leave free for checking. */
  checkMinutes: z.number().int().nonnegative(),
  sections: z.array(examPaperSectionSchema).min(1),
  /** Which topic ids the paper can assess. `all` means every topic in the course. */
  topics: z.union([z.literal('all'), z.array(z.string().min(1)).min(1)]),
}).superRefine((paper, context) => {
  const marks = paper.sections.reduce((sum, section) => sum + section.marks, 0)
  if (marks !== paper.totalMarks) context.addIssue({ code: 'custom', path: ['sections'], message: `section marks add up to ${marks}, not ${paper.totalMarks}` })
  const minutes = paper.sections.reduce((sum, section) => sum + section.minutes, 0) + paper.checkMinutes
  if (minutes !== paper.durationMinutes) context.addIssue({ code: 'custom', path: ['sections'], message: `section minutes and checking time add up to ${minutes}, not ${paper.durationMinutes}` })
})

export const examAssessmentObjectiveSchema = z.object({
  id: aoIdSchema,
  name: z.string().min(1),
  does: z.string().min(1),
  show: z.string().min(1),
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
  /** What the structure was checked against, and when. */
  checkedAgainst: z.object({ source: z.string().url(), checkedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }),
  papers: z.array(examPaperSchema).min(1),
  dayRules: z.array(z.string().min(1)).min(1),
  assessmentObjectives: z.array(examAssessmentObjectiveSchema).length(4),
  commandWords: z.array(examCommandWordSchema).min(1),
  levelsNote: z.string().min(1),
})

export type ExamPaperSection = z.infer<typeof examPaperSectionSchema>
export type ExamPaperGuide = z.infer<typeof examPaperSchema>
export type ExamAssessmentObjective = z.infer<typeof examAssessmentObjectiveSchema>
export type ExamCommandWord = z.infer<typeof examCommandWordSchema>
export type ExamPapersContent = z.infer<typeof examPapersContentSchema>
