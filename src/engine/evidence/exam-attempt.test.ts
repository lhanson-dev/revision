import { describe, expect, it } from 'vitest'
import { learningEvidenceSchema } from './evidence'

const base = {
  id: 'attempt-1',
  moduleId: 'business-aqa-as-paper-2',
  topicId: 'business',
  occurredAt: '2026-08-17T17:30:00.000Z',
  contentId: 'harbour-home-1',
  schemaVersion: 1 as const,
  source: 'exam_attempt' as const,
  durationMinutes: 89.5,
  timed: true,
  markingMethod: 'self_assessed' as const,
}

describe('exam attempt evidence', () => {
  it('accepts a transparent self-assessed timed result', () => {
    expect(learningEvidenceSchema.parse({ ...base, marksAwarded: 52, marksAvailable: 80 })).toMatchObject({
      source: 'exam_attempt',
      markingMethod: 'self_assessed',
      marksAwarded: 52,
      marksAvailable: 80,
    })
  })

  it('rejects impossible whole-paper marks', () => {
    expect(() => learningEvidenceSchema.parse({ ...base, marksAwarded: 81, marksAvailable: 80 })).toThrow()
  })
})
