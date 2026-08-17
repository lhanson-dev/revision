import { describe, expect, it } from 'vitest'
import { learningEvidenceSchema } from '../engine/evidence/evidence'
import { createFlashcardEvidence, createMultipleChoiceEvidence } from './practice-evidence'

describe('practice evidence', () => {
  it('records flashcard self-rating as recall evidence', () => {
    const evidence = createFlashcardEvidence({
      id: 'flashcard-attempt-1',
      moduleId: 'business-aqa-as-paper-2',
      topicId: 'finance',
      contentId: 'flashcard-045',
      rating: 1,
      occurredAt: '2026-08-17T16:00:00.000Z',
    })

    expect(learningEvidenceSchema.parse(evidence)).toMatchObject({
      source: 'flashcard',
      rating: 1,
      topicId: 'finance',
      contentId: 'flashcard-045',
    })
  })

  it('derives multiple-choice correctness from selected and correct options', () => {
    const correct = createMultipleChoiceEvidence({
      id: 'mcq-attempt-1',
      moduleId: 'business-aqa-as-paper-2',
      topicId: 'operations',
      contentId: 'mcq-010',
      selectedOption: 1,
      correctOption: 1,
      occurredAt: '2026-08-17T16:01:00.000Z',
    })
    const incorrect = createMultipleChoiceEvidence({
      id: 'mcq-attempt-2',
      moduleId: 'business-aqa-as-paper-2',
      topicId: 'operations',
      contentId: 'mcq-010',
      selectedOption: 0,
      correctOption: 1,
      occurredAt: '2026-08-17T16:02:00.000Z',
    })

    expect(correct.source === 'multiple_choice' && correct.correct).toBe(true)
    expect(incorrect.source === 'multiple_choice' && incorrect.correct).toBe(false)
  })
})
