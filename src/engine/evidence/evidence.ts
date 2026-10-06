import { z } from 'zod'

const topicIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const nonNegativeInteger = z.number().int().nonnegative()

const baseEvidenceShape = {
  id: z.string().min(1),
  moduleId: z.string().min(1),
  topicId: topicIdSchema,
  occurredAt: z.iso.datetime(),
  contentId: z.string().min(1),
  schemaVersion: z.literal(1),
}

const aoScoreSchema = z.object({
  awarded: nonNegativeInteger,
  available: nonNegativeInteger,
}).superRefine((score, context) => {
  if (score.awarded > score.available) {
    context.addIssue({ code: 'custom', message: 'awarded marks cannot exceed available marks' })
  }
})

const marksShape = {
  marksAwarded: nonNegativeInteger,
  marksAvailable: nonNegativeInteger,
}

/**
 * How sure the student said they were before an answer was checked (Practice v2.2).
 * Evidence that carries it is schema version 2; version 1 evidence has no confidence and stays valid.
 */
export const answerConfidenceSchema = z.enum(['guess', 'fairly', 'certain'])
export type AnswerConfidence = z.infer<typeof answerConfidenceSchema>

/** A right answer that was only a guess counts as half: weaker evidence than a right answer the student was sure of. */
export const GUESSED_RIGHT_PERCENTAGE = 50

const markingMethodSchema = z.enum(['self_assessed', 'externally_marked'])

export const recallEvidenceSchema = z.object({
  ...baseEvidenceShape,
  source: z.literal('flashcard'),
  rating: z.union([z.literal(0), z.literal(1), z.literal(2)]),
})

export const multipleChoiceEvidenceSchema = z.object({
  ...baseEvidenceShape,
  schemaVersion: z.union([z.literal(1), z.literal(2)]),
  source: z.literal('multiple_choice'),
  correct: z.boolean(),
  selectedOption: nonNegativeInteger,
  correctOption: nonNegativeInteger,
  confidence: answerConfidenceSchema.optional(),
}).superRefine((evidence, context) => {
  if (evidence.confidence !== undefined && evidence.schemaVersion !== 2) {
    context.addIssue({ code: 'custom', path: ['schemaVersion'], message: 'evidence that records confidence must be schema version 2' })
  }
})

export const examQuestionEvidenceSchema = z.object({
  ...baseEvidenceShape,
  source: z.literal('exam_question'),
  ...marksShape,
  markingMethod: markingMethodSchema.optional(),
  assessmentObjectives: z.object({
    ao1: aoScoreSchema.optional(),
    ao2: aoScoreSchema.optional(),
    ao3: aoScoreSchema.optional(),
    ao4: aoScoreSchema.optional(),
  }),
}).superRefine((evidence, context) => {
  if (evidence.marksAwarded > evidence.marksAvailable) {
    context.addIssue({ code: 'custom', path: ['marksAwarded'], message: 'awarded marks cannot exceed available marks' })
  }
})

export const examAttemptEvidenceSchema = z.object({
  ...baseEvidenceShape,
  source: z.literal('exam_attempt'),
  ...marksShape,
  durationMinutes: z.number().nonnegative(),
  timed: z.boolean(),
  markingMethod: markingMethodSchema.optional(),
}).superRefine((evidence, context) => {
  if (evidence.marksAwarded > evidence.marksAvailable) {
    context.addIssue({ code: 'custom', path: ['marksAwarded'], message: 'awarded marks cannot exceed available marks' })
  }
})

export const learningEvidenceSchema = z.union([
  recallEvidenceSchema,
  multipleChoiceEvidenceSchema,
  examQuestionEvidenceSchema,
  examAttemptEvidenceSchema,
])

export type RecallEvidence = z.infer<typeof recallEvidenceSchema>
export type MultipleChoiceEvidence = z.infer<typeof multipleChoiceEvidenceSchema>
export type ExamQuestionEvidence = z.infer<typeof examQuestionEvidenceSchema>
export type ExamAttemptEvidence = z.infer<typeof examAttemptEvidenceSchema>
export type LearningEvidence = z.infer<typeof learningEvidenceSchema>

export function evidencePercentage(evidence: LearningEvidence): number | null {
  switch (evidence.source) {
    case 'flashcard':
      return (evidence.rating / 2) * 100
    case 'multiple_choice':
      if (!evidence.correct) return 0
      return evidence.confidence === 'guess' ? GUESSED_RIGHT_PERCENTAGE : 100
    case 'exam_question':
    case 'exam_attempt':
      return evidence.marksAvailable > 0
        ? (evidence.marksAwarded / evidence.marksAvailable) * 100
        : null
  }
}
