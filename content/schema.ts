import { z } from 'zod'

const slugSchema = z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

export const topicIdSchema = slugSchema

export const learnerExplanationSchema = z.object({
  title: z.string().min(1),
  what_is_this: z.string().min(1),
  why_it_matters: z.string().min(1),
  what_you_are_trying_to_do: z.string().min(1),
  how_results_are_worked_out: z.string().min(1),
  what_to_do_next: z.string().min(1),
})

export const topicSectionSchema = z.object({
  id: slugSchema,
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
  id: slugSchema,
  name: z.string().min(1),
  expression: z.string().min(1),
})

export const flashcardSchema = z.object({
  id: slugSchema,
  topic: topicIdSchema,
  prompt: z.string().min(1),
  answer: z.string().min(1),
})

export const topicLinkSchema = z.object({
  id: slugSchema,
  topic: topicIdSchema,
  label: z.string().min(1),
  explanation: z.string().min(1),
})

export const multipleChoiceQuestionSchema = z.object({
  id: slugSchema,
  topic: topicIdSchema,
  prompt: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  correctOption: z.number().int().nonnegative(),
  explanation: z.string().min(1),
}).superRefine((question, context) => {
  if (question.correctOption >= question.options.length) {
    context.addIssue({ code: 'custom', path: ['correctOption'], message: 'correctOption must point to an existing option' })
  }
})

export const guidedQuestionSchema = z.object({
  id: slugSchema,
  prompt: z.string().min(1),
  guidance: z.string().min(1),
})

export const caseStudySchema = z.object({
  id: slugSchema,
  title: z.string().min(1),
  bodyHtml: z.string().min(1),
  facts: z.array(z.string().min(1)).min(1),
  questions: z.array(guidedQuestionSchema).min(1),
})

export const dataDrillSchema = z.object({
  id: slugSchema,
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
  id: slugSchema,
  marks: z.number().int().positive(),
  topic: topicIdSchema,
  assessmentObjectives: assessmentObjectiveSchema,
  prompt: z.string().min(1),
  markingGuidance: z.array(z.string().min(1)).min(1),
}).superRefine((question, context) => {
  const aoTotal = Object.values(question.assessmentObjectives).reduce((sum, marks) => sum + marks, 0)
  if (aoTotal !== question.marks) {
    context.addIssue({ code: 'custom', path: ['assessmentObjectives'], message: `AO marks (${aoTotal}) must equal question marks (${question.marks})` })
  }
})

export const examSchema = z.object({
  id: slugSchema,
  title: z.string().min(1),
  subtitle: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  totalMarks: z.number().int().positive(),
  caseHtml: z.string().min(1),
  questions: z.array(examQuestionSchema).min(1),
}).superRefine((exam, context) => {
  const questionTotal = exam.questions.reduce((sum, question) => sum + question.marks, 0)
  if (questionTotal !== exam.totalMarks) {
    context.addIssue({ code: 'custom', path: ['questions'], message: `Question marks (${questionTotal}) must equal exam total (${exam.totalMarks})` })
  }
})

export const contentManifestSchema = z.object({
  id: slugSchema,
  schemaVersion: z.literal(1),
  status: z.enum(['available', 'preview', 'planned']),
  subject: z.object({ id: slugSchema, name: z.string().min(1) }),
  qualification: z.object({ id: slugSchema, name: z.string().min(1) }),
  examBoard: z.object({ id: slugSchema, name: z.string().min(1) }),
  specificationCode: z.string().min(1),
  paper: z.object({
    id: slugSchema,
    name: z.string().min(1),
    number: z.number().int().positive(),
    durationMinutes: z.number().int().positive(),
    totalMarks: z.number().int().positive(),
  }),
  learnerExperience: learnerExplanationSchema,
  topicIds: z.array(topicIdSchema).min(1),
})

function assertUniqueIds(items: ReadonlyArray<{ id: string }>, label: string, context: z.RefinementCtx) {
  const seen = new Set<string>()
  items.forEach((item, index) => {
    if (seen.has(item.id)) context.addIssue({ code: 'custom', path: [label, index, 'id'], message: `Duplicate ${label} id: ${item.id}` })
    seen.add(item.id)
  })
}

export const contentPackSchema = z.object({
  manifest: contentManifestSchema,
  topics: z.array(topicSchema).min(1),
  formulas: z.array(formulaSchema),
  topicLinks: z.array(topicLinkSchema),
  flashcards: z.array(flashcardSchema),
  questions: z.array(multipleChoiceQuestionSchema),
  caseStudies: z.array(caseStudySchema),
  dataDrills: z.array(dataDrillSchema),
  exams: z.array(examSchema),
}).superRefine((pack, context) => {
  const manifestTopics = new Set(pack.manifest.topicIds)
  const actualTopics = new Set(pack.topics.map((topic) => topic.id))

  pack.manifest.topicIds.forEach((topicId, index) => {
    if (!actualTopics.has(topicId)) context.addIssue({ code: 'custom', path: ['manifest', 'topicIds', index], message: `Manifest topic ${topicId} has no topic definition` })
  })
  pack.topics.forEach((topic, index) => {
    if (!manifestTopics.has(topic.id)) context.addIssue({ code: 'custom', path: ['topics', index, 'id'], message: `Topic ${topic.id} is not declared by the manifest` })
  })

  const topicReferences = [
    ...pack.flashcards.map((item) => ({ id: item.id, topic: item.topic, collection: 'flashcards' })),
    ...pack.topicLinks.map((item) => ({ id: item.id, topic: item.topic, collection: 'topicLinks' })),
    ...pack.questions.map((item) => ({ id: item.id, topic: item.topic, collection: 'questions' })),
    ...pack.exams.flatMap((exam) => exam.questions.map((item) => ({ id: item.id, topic: item.topic, collection: `exam ${exam.id}` }))),
  ]
  topicReferences.forEach((item) => {
    if (!manifestTopics.has(item.topic)) context.addIssue({ code: 'custom', message: `${item.collection} item ${item.id} references unknown topic ${item.topic}` })
  })

  assertUniqueIds(pack.topics, 'topics', context)
  assertUniqueIds(pack.formulas, 'formulas', context)
  assertUniqueIds(pack.topicLinks, 'topicLinks', context)
  assertUniqueIds(pack.flashcards, 'flashcards', context)
  assertUniqueIds(pack.questions, 'questions', context)
  assertUniqueIds(pack.caseStudies, 'caseStudies', context)
  assertUniqueIds(pack.dataDrills, 'dataDrills', context)
  assertUniqueIds(pack.exams, 'exams', context)

  const primaryExam = pack.exams[0]
  if (primaryExam && (primaryExam.totalMarks !== pack.manifest.paper.totalMarks || primaryExam.durationMinutes !== pack.manifest.paper.durationMinutes)) {
    context.addIssue({ code: 'custom', path: ['exams', 0], message: 'Primary exam duration and total marks must match the manifest paper metadata' })
  }
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
export type ContentPack = z.infer<typeof contentPackSchema>
