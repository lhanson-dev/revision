import { z } from 'zod'

/**
 * The "Exam Prep" paper guide for one board and specification: what each paper contains and what examiners give
 * marks for. It is content, not code: each board/spec has its own file, and the Exam Prep page only reads it.
 *
 * Content rule (Founder, 6 Oct 2026): anything official about the course, questions, exams or marks must come from
 * content approved through the Content Factory (its Exam Truth) or be checked against the exam board. Wording that
 * only explains a feature to the student can live in the page.
 *
 * Founder refinement, same day: do not drop useful items that are not yet approved; keep them and FLAG them. Every
 * item below that is not from the factory's Exam Truth carries a `check` (status "needs_check" and why). The page shows
 * a "Being checked" chip on it, and `examPapersReviewItems` lists them all for whoever does the checking. An item with
 * no `check` is claiming to be approved.
 */
const aoIdSchema = z.enum(['AO1', 'AO2', 'AO3', 'AO4'])

/** Marks an item as not yet approved through the factory or checked against the board. */
export const examContentCheckSchema = z.object({
  status: z.literal('needs_check'),
  /** Where the wording came from and what to check, in plain words. */
  why: z.string().min(1),
})
export type ExamContentCheck = z.infer<typeof examContentCheckSchema>

/** A line of text that is not from the factory's Exam Truth, so it must carry a check flag. */
export const examFlaggedTextSchema = z.object({ text: z.string().min(1), check: examContentCheckSchema })

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
  /** Extra notes about the paper that are not from the factory (for example a reading time). Flagged. */
  notes: z.array(examFlaggedTextSchema).optional(),
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
  /** What the objective means and how a student shows it. Not from the factory, so flagged. */
  coaching: z.object({ does: z.string().min(1), show: z.string().min(1), check: examContentCheckSchema }).optional(),
})

export const examCommandWordSchema = z.object({
  word: z.string().min(1),
  asks: z.string().min(1),
  marks: z.string().min(1),
  aos: z.string().min(1),
  check: examContentCheckSchema,
})

export const examPapersContentSchema = z.object({
  schemaVersion: z.literal(1),
  examBoard: z.string().min(1),
  specificationCode: z.string().min(1),
  /** Where the structure comes from: the factory's Exam Truth, and the board page it was checked against. */
  checkedAgainst: z.object({ source: z.string().url(), checkedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), approvedBy: z.string().min(1) }),
  papers: z.array(examPaperSchema).min(1),
  dayRules: z.array(examFlaggedTextSchema).optional(),
  assessmentObjectives: z.array(examAssessmentObjectiveSchema).length(4),
  commandWords: z.array(examCommandWordSchema).optional(),
  levelsNote: examFlaggedTextSchema.optional(),
})

export type ExamPaperSection = z.infer<typeof examPaperSectionSchema>
export type ExamPaperGuide = z.infer<typeof examPaperSchema>
export type ExamAssessmentObjective = z.infer<typeof examAssessmentObjectiveSchema>
export type ExamCommandWord = z.infer<typeof examCommandWordSchema>
export type ExamPapersContent = z.infer<typeof examPapersContentSchema>

export type ExamReviewItem = { id: string; where: string; text: string; why: string }

/** Every item in a paper guide that still needs a check, for whoever does the checking. */
export function examPapersReviewItems(content: ExamPapersContent): ExamReviewItem[] {
  const items: ExamReviewItem[] = []
  for (const paper of content.papers) paper.notes?.forEach((note, index) => items.push({ id: `paper-${paper.number}-note-${index + 1}`, where: `${paper.name}, note`, text: note.text, why: note.check.why }))
  for (const ao of content.assessmentObjectives) if (ao.coaching) items.push({ id: `${ao.id}-coaching`, where: `${ao.id}, what it is and how you show it`, text: `${ao.coaching.does} ${ao.coaching.show}`, why: ao.coaching.check.why })
  content.commandWords?.forEach((command) => items.push({ id: `command-${command.word.toLowerCase().replace(/[^a-z]+/g, '-')}`, where: `Command word: ${command.word}`, text: `${command.asks} (${command.marks}; ${command.aos})`, why: command.check.why }))
  if (content.levelsNote) items.push({ id: 'levels-note', where: 'Levels note', text: content.levelsNote.text, why: content.levelsNote.check.why })
  content.dayRules?.forEach((rule, index) => items.push({ id: `day-rule-${index + 1}`, where: 'On the day', text: rule.text, why: rule.check.why }))
  return items
}
