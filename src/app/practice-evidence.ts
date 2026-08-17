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
