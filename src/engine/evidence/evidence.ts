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

/**
 * Written Practice answers can also be marked by REV (Practice v2.2). That is a guide, not an exam board mark, so
 * it is capped like self_assessed: it never counts as externally marked evidence.
 */
const examQuestionMarkingMethodSchema = z.enum(['self_assessed', 'externally_marked', 'rev_assessed'])

export const REV_CHALLENGE_MAX_LENGTH = 1000

/** What REV's marking left behind: which mark points were given, and the model that did it. The answer text itself is not kept. */
export const revMarkingSchema = z.object({
  modelVersion: z.string().min(1),
  pointsGiven: z.array(z.boolean()).min(1),
  challenge: z.object({
    text: z.string().trim().min(1).max(REV_CHALLENGE_MAX_LENGTH),
    outcome: z.enum(['changed', 'unchanged']),
    modelVersion: z.string().min(1),
  }).optional(),
})
export type RevMarking = z.infer<typeof revMarkingSchema>

export const recallEvidenceSchema = z.object({
  ...baseEvidenceShape,
  source: z.literal('flashcard'),
  rating: z.union([z.literal(0), z.literal(1), z.literal(2)]),
})

/** Metadata on a software-scored, published structured-bank question.
 * A single tagged target is an attributable raw observation, not mastery.
 * Multi-target items retain traceability but cannot be split into marks.
 * This is deliberately narrower than the course's general topic evidence.
 */
export const objectiveItemMappingSchema = z.object({
  mappingVersion: z.literal(1),
  source: z.literal('structured-practice-bank'),
  targetSpecItemIds: z.array(z.string().min(1)).min(1),
  targetNodeIds: z.array(z.string().min(1)),
  singleTargetSpecItemId: z.string().min(1).optional(),
}).superRefine((mapping, context) => {
  if (new Set(mapping.targetSpecItemIds).size !== mapping.targetSpecItemIds.length
    || new Set(mapping.targetNodeIds).size !== mapping.targetNodeIds.length) {
    context.addIssue({ code: 'custom', message: 'mapping targets must be unique' })
  }
  if (mapping.singleTargetSpecItemId !== undefined &&
    (mapping.targetSpecItemIds.length !== 1 || mapping.targetSpecItemIds[0] !== mapping.singleTargetSpecItemId)) {
    context.addIssue({ code: 'custom', path: ['singleTargetSpecItemId'],
      message: 'individual skill observation requires one and only one matching target' })
  }
})
export type ObjectiveItemMapping = z.infer<typeof objectiveItemMappingSchema>

export const multipleChoiceEvidenceSchema = z.object({
  ...baseEvidenceShape,
  schemaVersion: z.union([z.literal(1), z.literal(2)]),
  source: z.literal('multiple_choice'),
  correct: z.boolean(),
  selectedOption: nonNegativeInteger,
  correctOption: nonNegativeInteger,
  confidence: answerConfidenceSchema.optional(),
  /** An existing-authority, separately assured bank mapping. Never inferred from a broad topic. */
  itemMapping: objectiveItemMappingSchema.optional(),
}).superRefine((evidence, context) => {
  if (evidence.confidence !== undefined && evidence.schemaVersion === 1) {
    context.addIssue({ code: 'custom', path: ['schemaVersion'], message: 'confidence needs evidence schema version 2' })
  }
  if (evidence.itemMapping !== undefined && evidence.schemaVersion !== 2) {
    context.addIssue({ code: 'custom', path: ['schemaVersion'], message: 'versioned item mapping requires evidence schema version 2' })
  }
})

/**
 * A calculation question: the student types one number, and software checks it against the mark scheme's answer.
 * Nothing is marked by REV, so there is no partial credit: it is right or it is not (same weight as a quick check).
 */
export const calculationEvidenceSchema = z.object({
  ...baseEvidenceShape,
  schemaVersion: z.literal(2),
  source: z.literal('calculation'),
  correct: z.boolean(),
  /** The number the student gave, after the checker read it (so "£24.2m" is 24.2). */
  enteredValue: z.number().finite(),
  expectedValue: z.number().finite(),
  unit: z.string().min(1).optional(),
  confidence: answerConfidenceSchema.optional(),
  /** Single final-number result only: never claim the student showed method or a diagram. */
  itemMapping: objectiveItemMappingSchema.optional(),
})

export const examQuestionEvidenceSchema = z.object({
  ...baseEvidenceShape,
  schemaVersion: z.union([z.literal(1), z.literal(2)]),
  source: z.literal('exam_question'),
  ...marksShape,
  markingMethod: examQuestionMarkingMethodSchema.optional(),
  /** Present when REV marked the answer (schema version 2). */
  revMarking: revMarkingSchema.optional(),
  /**
   * A challenge re-checks an answer and is saved as a new row that replaces the earlier one (evidence is append-only).
   * The earlier row stays in the record; readiness and status count only the latest.
   */
  supersedesEvidenceId: z.string().min(1).optional(),
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
  const revAssessed = evidence.markingMethod === 'rev_assessed'
  if (revAssessed !== (evidence.revMarking !== undefined)) {
    context.addIssue({ code: 'custom', path: ['revMarking'], message: 'rev_assessed evidence must carry revMarking, and only rev_assessed evidence may' })
  }
  if ((revAssessed || evidence.supersedesEvidenceId !== undefined) && evidence.schemaVersion !== 2) {
    context.addIssue({ code: 'custom', path: ['schemaVersion'], message: 'REV-marked evidence must be schema version 2' })
  }
  if (evidence.supersedesEvidenceId !== undefined && !revAssessed) {
    context.addIssue({ code: 'custom', path: ['supersedesEvidenceId'], message: 'only REV-marked evidence can supersede earlier evidence' })
  }
  if (evidence.revMarking?.challenge && evidence.supersedesEvidenceId === undefined) {
    context.addIssue({ code: 'custom', path: ['supersedesEvidenceId'], message: 'a challenge replaces the answer it challenges' })
  }
  if (evidence.revMarking && evidence.revMarking.pointsGiven.length === 0) {
    context.addIssue({ code: 'custom', path: ['revMarking', 'pointsGiven'], message: 'mark points are required' })
  }
})

export const examAttemptEvidenceSchema = z.object({
  ...baseEvidenceShape,
  source: z.literal('exam_attempt'),
  ...marksShape,
  durationMinutes: z.number().nonnegative(),
  timed: z.boolean(),
  interrupted: z.boolean().optional(),
  markingMethod: markingMethodSchema.optional(),
}).superRefine((evidence, context) => {
  if (evidence.marksAwarded > evidence.marksAvailable) {
    context.addIssue({ code: 'custom', path: ['marksAwarded'], message: 'awarded marks cannot exceed available marks' })
  }
})

export const learningEvidenceSchema = z.union([
  recallEvidenceSchema,
  multipleChoiceEvidenceSchema,
  calculationEvidenceSchema,
  examQuestionEvidenceSchema,
  examAttemptEvidenceSchema,
])

export type RecallEvidence = z.infer<typeof recallEvidenceSchema>
export type MultipleChoiceEvidence = z.infer<typeof multipleChoiceEvidenceSchema>
export type CalculationEvidence = z.infer<typeof calculationEvidenceSchema>
export type ExamQuestionEvidence = z.infer<typeof examQuestionEvidenceSchema>
export type ExamAttemptEvidence = z.infer<typeof examAttemptEvidenceSchema>
export type LearningEvidence = z.infer<typeof learningEvidenceSchema>

/** A *raw* specific-item answer, not a skill-status or readiness verdict.
 * Several questions tagged to one item still require educational corroboration.
 * Multi-target questions and legacy data cannot silently prove a specific skill.
 */
export function individualSpecItemObservation(evidence: LearningEvidence) {
  if ((evidence.source !== 'multiple_choice' && evidence.source !== 'calculation') || evidence.schemaVersion !== 2) return null
  const specItemId = evidence.itemMapping?.singleTargetSpecItemId
  if (!specItemId) return null
  return {
    evidenceId: evidence.id, moduleId: evidence.moduleId, topicId: evidence.topicId,
    contentId: evidence.contentId, specItemId, occurredAt: evidence.occurredAt,
    correct: evidence.correct, confidence: evidence.confidence ?? null,
    scoring: evidence.source === 'calculation' ? 'software-scored-final-number' as const : 'software-scored-choice' as const,
  }
}

/**
 * Whole-paper exam_attempt rows belong to a paper attempt, not to the
 * arbitrary legacy topicId required by evidence schema v1.
 * Keep the original event for exam-history/provenance but do not treat it
 * as valid evidence about a single topic. An exam_question event is
 * independently topic-attributed and remains eligible.
 */
export function isTopicScopedEvidence(evidence: LearningEvidence): boolean {
  return evidence.source !== 'exam_attempt'
}

export function evidencePercentage(evidence: LearningEvidence): number | null {
  switch (evidence.source) {
    case 'flashcard':
      return (evidence.rating / 2) * 100
    case 'multiple_choice':
    case 'calculation':
      if (!evidence.correct) return 0
      return evidence.confidence === 'guess' ? GUESSED_RIGHT_PERCENTAGE : 100
    case 'exam_question':
    case 'exam_attempt':
      return evidence.marksAvailable > 0
        ? (evidence.marksAwarded / evidence.marksAvailable) * 100
        : null
  }
}

/** Drops evidence that a later row replaced (a challenged written answer), so it is counted once. */
export function withoutSuperseded<T extends LearningEvidence>(evidence: readonly T[]): T[] {
  const replaced = new Set<string>()
  evidence.forEach((item) => {
    if (item.source === 'exam_question' && item.supersedesEvidenceId) replaced.add(item.supersedesEvidenceId)
  })
  return replaced.size === 0 ? [...evidence] : evidence.filter((item) => !replaced.has(item.id))
}
