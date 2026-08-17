import { z } from 'zod'

export const topicIdSchema = z.enum([
  'business',
  'leadership',
  'marketing',
  'operations',
  'finance',
  'hr',
])

export const learnerExplanationSchema = z.object({
  title: z.string().min(1),
  what_is_this: z.string().min(1),
  why_it_matters: z.string().min(1),
  what_you_are_trying_to_do: z.string().min(1),
  how_results_are_worked_out: z.string().min(1),
  what_to_do_next: z.string().min(1),
})

export const topicSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  points: z.array(z.string().min(1)).min(1),
})

export const topicSchema = z.object({
  id: topicIdSchema,
  order: z.number().int().positive(),
  title: z.string().min(1),
  shortTitle: z.string().min(1),
  sections: z.array(topicSectionSchema).min(1),
})

export const formulaSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  expression: z.string().min(1),
})

export const flashcardSchema = z.object({
  id: z.string().min(1),
  topic: topicIdSchema,
  prompt: z.string().min(1),
  answer: z.string().min(1),
})

export const topicLinkSchema = z.object({
  id: z.string().min(1),
  topic: topicIdSchema,
  label: z.string().min(1),
  explanation: z.string().min(1),
})

export const multipleChoiceQuestionSchema = z.object({
  id: z.string().min(1),
  topic: topicIdSchema,
  prompt: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  correctOption: z.number().int().nonnegative(),
  explanation: z.string().min(1),
}).superRefine((question, context) => {
  if (question.correctOption >= question.options.length) {
    context.addIssue({
      code: 'custom',
      path: ['correctOption'],
      message: 'correctOption must point to an existing option',
    })
  }
})

export const guidedQuestionSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  guidance: z.string().min(1),
})

export const caseStudySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  bodyHtml: z.string().min(1),
  facts: z.array(z.string().min(1)).min(1),
  questions: z.array(guidedQuestionSchema).min(1),
})

export const dataDrillSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  prompt: z.string().min(1),
  answer: z.string().min(1),
})

export const assessmentObjectiveSchema = z.object({
  ao1: z.number().int().nonnegative().default(0),
  ao2: z.number().int().nonnegative().default(0),
  ao3: z.number().int().nonnegative().default(0),
  ao4: z.number().int().nonnegative().default(0),
})

export const examQuestionSchema = z.object({
  id: z.string().min(1),
  marks: z.number().int().positive(),
  topic: topicIdSchema,
  assessmentObjectives: assessmentObjectiveSchema,
  prompt: z.string().min(1),
  markingGuidance: z.array(z.string().min(1)).min(1),
}).superRefine((question, context) => {
  const aoTotal = Object.values(question.assessmentObjectives).reduce((sum, marks) => sum + marks, 0)
  if (aoTotal !== question.marks) {
    context.addIssue({
      code: 'custom',
      path: ['assessmentObjectives'],
      message: `AO marks (${aoTotal}) must equal question marks (${question.marks})`,
    })
  }
})

export const examSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  totalMarks: z.number().int().positive(),
  caseHtml: z.string().min(1),
  questions: z.array(examQuestionSchema).min(1),
}).superRefine((exam, context) => {
  const questionTotal = exam.questions.reduce((sum, question) => sum + question.marks, 0)
  if (questionTotal !== exam.totalMarks) {
    context.addIssue({
      code: 'custom',
      path: ['questions'],
      message: `Question marks (${questionTotal}) must equal exam total (${exam.totalMarks})`,
    })
  }
})

export const contentManifestSchema = z.object({
  id: z.string().min(1),
  schemaVersion: z.literal(1),
  status: z.enum(['available', 'preview', 'planned']),
  subject: z.object({ id: z.string().min(1), name: z.string().min(1) }),
  qualification: z.object({ id: z.string().min(1), name: z.string().min(1) }),
  examBoard: z.object({ id: z.string().min(1), name: z.string().min(1) }),
  specificationCode: z.string().min(1),
  paper: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    number: z.number().int().positive(),
    durationMinutes: z.number().int().positive(),
    totalMarks: z.number().int().positive(),
  }),
  learnerExperience: learnerExplanationSchema,
  topicIds: z.array(topicIdSchema).min(1),
})

export type TopicId = z.infer<typeof topicIdSchema>
export type ContentManifest = z.infer<typeof contentManifestSchema>
export type Topic = z.infer<typeof topicSchema>
export type Formula = z.infer<typeof formulaSchema>
export type Flashcard = z.infer<typeof flashcardSchema>
export type TopicLink = z.infer<typeof topicLinkSchema>
export type MultipleChoiceQuestion = z.infer<typeof multipleChoiceQuestionSchema>
export type CaseStudy = z.infer<typeof caseStudySchema>
export type DataDrill = z.infer<typeof dataDrillSchema>
export type Exam = z.infer<typeof examSchema>
