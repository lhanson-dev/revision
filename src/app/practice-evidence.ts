import type { AnswerConfidence, LearningEvidence } from '../engine/evidence/evidence'

export function createFlashcardEvidence(input: {
  id: string
  moduleId: string
  topicId: string
  contentId: string
  rating: 0 | 1 | 2
  occurredAt?: string
}): LearningEvidence {
  return {
    id: input.id,
    moduleId: input.moduleId,
    topicId: input.topicId,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    contentId: input.contentId,
    schemaVersion: 1,
    source: 'flashcard',
    rating: input.rating,
  }
}

export function createMultipleChoiceEvidence(input: {
  id: string
  moduleId: string
  topicId: string
  contentId: string
  selectedOption: number
  correctOption: number
  /** How sure the student said they were. When given, the evidence is schema version 2. */
  confidence?: AnswerConfidence
  occurredAt?: string
}): LearningEvidence {
  return {
    id: input.id,
    moduleId: input.moduleId,
    topicId: input.topicId,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    contentId: input.contentId,
    schemaVersion: input.confidence ? 2 : 1,
    source: 'multiple_choice',
    correct: input.selectedOption === input.correctOption,
    selectedOption: input.selectedOption,
    correctOption: input.correctOption,
    ...(input.confidence ? { confidence: input.confidence } : {}),
  }
}

export function createCalculationEvidence(input: {
  id: string
  moduleId: string
  topicId: string
  contentId: string
  correct: boolean
  enteredValue: number
  expectedValue: number
  unit?: string | null
  confidence?: AnswerConfidence
  occurredAt?: string
}): LearningEvidence {
  return {
    id: input.id,
    moduleId: input.moduleId,
    topicId: input.topicId,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    contentId: input.contentId,
    schemaVersion: 2,
    source: 'calculation',
    correct: input.correct,
    enteredValue: input.enteredValue,
    expectedValue: input.expectedValue,
    ...(input.unit ? { unit: input.unit } : {}),
    ...(input.confidence ? { confidence: input.confidence } : {}),
  }
}

type AoKey = 'ao1' | 'ao2' | 'ao3' | 'ao4'
type AoMarks = Record<AoKey, number>

export function createSelfAssessedExamQuestionEvidence(input: {
  id: string
  moduleId: string
  topicId: string
  contentId: string
  available: AoMarks
  awarded: AoMarks
  occurredAt?: string
}): LearningEvidence {
  const assessmentObjectives = (Object.keys(input.available) as AoKey[]).reduce<Record<string, { awarded: number; available: number }>>((result, key) => {
    const available = input.available[key]
    const awarded = input.awarded[key]
    if (!Number.isInteger(awarded) || awarded < 0 || awarded > available) {
      throw new Error(`${key.toUpperCase()} awarded marks must be a whole number between 0 and ${available}.`)
    }
    if (available > 0) result[key] = { awarded, available }
    return result
  }, {})

  const marksAvailable = Object.values(input.available).reduce((sum, value) => sum + value, 0)
  const marksAwarded = Object.values(input.awarded).reduce((sum, value) => sum + value, 0)

  return {
    id: input.id,
    moduleId: input.moduleId,
    topicId: input.topicId,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    contentId: input.contentId,
    schemaVersion: 1,
    source: 'exam_question',
    markingMethod: 'self_assessed',
    marksAwarded,
    marksAvailable,
    assessmentObjectives,
  }
}

/**
 * Evidence for a written answer marked by REV (schema version 2). It keeps the marks, which mark points were given, the
 * model that marked it and, if the student challenged a mark, what they said and what came of it. It does not keep the
 * answer text. A challenge is saved as a new row that replaces the earlier one (`supersedes`).
 */
export function createRevMarkedExamQuestionEvidence(input: {
  id: string
  moduleId: string
  topicId: string
  contentId: string
  marksAwarded: number
  marksAvailable: number
  /** The question's AO tags. One tag puts the marks under that AO; several leave the split unknown. */
  aoTags: readonly string[]
  pointsGiven: readonly boolean[]
  modelVersion: string
  challenge?: { text: string; outcome: 'changed' | 'unchanged'; modelVersion: string }
  supersedes?: string
  occurredAt?: string
}): LearningEvidence {
  const aoKeys = [...new Set(input.aoTags.map((tag) => /^AO([1-4])$/i.exec(tag.trim())?.[1]).filter((key): key is string => Boolean(key)))]
  const assessmentObjectives = aoKeys.length === 1
    ? { [`ao${aoKeys[0]}`]: { awarded: input.marksAwarded, available: input.marksAvailable } }
    : {}
  return {
    id: input.id,
    moduleId: input.moduleId,
    topicId: input.topicId,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    contentId: input.contentId,
    schemaVersion: 2,
    source: 'exam_question',
    markingMethod: 'rev_assessed',
    marksAwarded: input.marksAwarded,
    marksAvailable: input.marksAvailable,
    assessmentObjectives,
    revMarking: {
      modelVersion: input.modelVersion,
      pointsGiven: [...input.pointsGiven],
      ...(input.challenge ? { challenge: input.challenge } : {}),
    },
    ...(input.supersedes ? { supersedesEvidenceId: input.supersedes } : {}),
  }
}
