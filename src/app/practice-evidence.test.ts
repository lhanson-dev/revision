import { describe, expect, it } from 'vitest'
import { learningEvidenceSchema } from '../engine/evidence/evidence'
import { createFlashcardEvidence, createMultipleChoiceEvidence, createSelfAssessedExamQuestionEvidence } from './practice-evidence'

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

  it('records transparent self-assessed exam marks by AO', () => {
    const evidence = createSelfAssessedExamQuestionEvidence({
      id: 'exam-attempt-1',
      moduleId: 'business-aqa-as-paper-2',
      topicId: 'finance',
      contentId: 'hh-q7',
      available: { ao1: 4, ao2: 4, ao3: 4, ao4: 4 },
      awarded: { ao1: 3, ao2: 3, ao3: 2, ao4: 2 },
      occurredAt: '2026-08-17T16:03:00.000Z',
    })

    expect(learningEvidenceSchema.parse(evidence)).toMatchObject({
      source: 'exam_question',
      markingMethod: 'self_assessed',
      marksAwarded: 10,
      marksAvailable: 16,
      assessmentObjectives: {
        ao1: { awarded: 3, available: 4 },
        ao4: { awarded: 2, available: 4 },
      },
    })
  })

  it('rejects impossible self-assessed AO marks', () => {
    expect(() => createSelfAssessedExamQuestionEvidence({
      id: 'exam-attempt-2',
      moduleId: 'business-aqa-as-paper-2',
      topicId: 'operations',
      contentId: 'hh-q3',
      available: { ao1: 2, ao2: 2, ao3: 0, ao4: 0 },
      awarded: { ao1: 3, ao2: 1, ao3: 0, ao4: 0 },
    })).toThrow('AO1 awarded marks')
  })
})
