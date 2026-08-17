import type { LearningEvidence } from '../engine/evidence/evidence'

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
  occurredAt?: string
}): LearningEvidence {
  return {
    id: input.id,
    moduleId: input.moduleId,
    topicId: input.topicId,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    contentId: input.contentId,
    schemaVersion: 1,
    source: 'multiple_choice',
    correct: input.selectedOption === input.correctOption,
    selectedOption: input.selectedOption,
    correctOption: input.correctOption,
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
