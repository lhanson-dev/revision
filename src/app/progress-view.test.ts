import { describe, expect, it } from 'vitest'
import type { LearningEvidence } from '../engine/evidence/evidence'
import { recentActivity } from './progress-view'

const common = { moduleId: 'business-aqa-as-paper-2', topicId: 'finance', schemaVersion: 1 as const }

describe('recentActivity', () => {
  it('shows newest evidence first and respects the limit', () => {
    const evidence: LearningEvidence[] = [
      { ...common, id: 'old', source: 'flashcard', occurredAt: '2026-08-10T12:00:00.000Z', contentId: 'c1', rating: 2 },
      { ...common, id: 'new', source: 'multiple_choice', occurredAt: '2026-08-17T12:00:00.000Z', contentId: 'q1', correct: true, selectedOption: 1, correctOption: 1 },
    ]
    expect(recentActivity(evidence, 1)).toEqual([
      { id: 'new', label: 'Quick check', detail: 'Correct answer', occurredAt: '2026-08-17T12:00:00.000Z' },
    ])
  })

  it('describes exam simulation evidence without inventing readiness', () => {
    const evidence: LearningEvidence[] = [
      { ...common, id: 'exam', source: 'exam_attempt', occurredAt: '2026-08-17T12:00:00.000Z', contentId: 'exam-1', marksAwarded: 54, marksAvailable: 80, durationMinutes: 90, timed: true },
    ]
    expect(recentActivity(evidence)[0].detail).toBe('54/80 marks · timed')
  })

  it('labels learner-marked exam questions as self-assessed', () => {
    const evidence: LearningEvidence[] = [
      { ...common, id: 'exam-q', source: 'exam_question', occurredAt: '2026-08-17T12:00:00.000Z', contentId: 'hh-q7', markingMethod: 'self_assessed', marksAwarded: 10, marksAvailable: 16, assessmentObjectives: {} },
    ]
    expect(recentActivity(evidence)[0].detail).toBe('10/16 marks · self-assessed')
  })
})
