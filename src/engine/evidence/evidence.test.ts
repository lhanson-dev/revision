import { describe, expect, it } from 'vitest'
import type { LearningEvidence } from './evidence'
import { evidencePercentage } from './evidence'

describe('learning evidence', () => {
  it('keeps raw evidence separate from readiness policy', () => {
    const evidence: LearningEvidence = {
      id: 'e1',
      moduleId: 'business-aqa-as-paper-2',
      topicId: 'finance',
      source: 'multiple_choice',
      occurredAt: '2026-08-17T15:30:00.000Z',
      contentId: 'finance-q-1',
      schemaVersion: 1,
      correct: true,
      selectedOption: 2,
      correctOption: 2,
    }

    expect(evidencePercentage(evidence)).toBe(100)
    expect('readiness' in evidence).toBe(false)
    expect('mastery' in evidence).toBe(false)
  })

  it('converts a flashcard rating into a comparable raw percentage', () => {
    const evidence: LearningEvidence = {
      id: 'e2',
      moduleId: 'business-aqa-as-paper-2',
      topicId: 'marketing',
      source: 'flashcard',
      occurredAt: '2026-08-17T15:31:00.000Z',
      contentId: 'marketing-card-1',
      schemaVersion: 1,
      rating: 1,
    }

    expect(evidencePercentage(evidence)).toBe(50)
  })

  it('returns null rather than inventing a percentage for zero available marks', () => {
    const evidence: LearningEvidence = {
      id: 'e3',
      moduleId: 'business-aqa-as-paper-2',
      topicId: 'operations',
      source: 'exam_question',
      occurredAt: '2026-08-17T15:32:00.000Z',
      contentId: 'exam-q-1',
      schemaVersion: 1,
      marksAwarded: 0,
      marksAvailable: 0,
      assessmentObjectives: {},
    }

    expect(evidencePercentage(evidence)).toBeNull()
  })
})
