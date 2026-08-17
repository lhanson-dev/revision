import { describe, expect, it } from 'vitest'
import type { LearningEvidence } from '../evidence/evidence'
import { assessPaperReadiness, assessReadiness, recentActivity, recommendNextActivity } from './readiness'

const now = new Date('2026-08-17T16:00:00.000Z')
const common = { moduleId: 'business-aqa-as-paper-2', schemaVersion: 1 as const }

function question(id: string, correct = true, occurredAt = '2026-08-16T12:00:00.000Z', topicId = 'finance'): LearningEvidence {
  return { ...common, id, topicId, source: 'multiple_choice', occurredAt, contentId: id, correct, selectedOption: correct ? 1 : 0, correctOption: 1 }
}

function card(id: string, occurredAt = '2026-08-15T12:00:00.000Z', topicId = 'finance', rating: 0 | 1 | 2 = 2): LearningEvidence {
  return { ...common, id, topicId, source: 'flashcard', occurredAt, contentId: id, rating }
}

function selfMarkedExam(id: string, occurredAt = '2026-08-17T12:00:00.000Z', topicId = 'finance'): LearningEvidence {
  return {
    ...common,
    id,
    topicId,
    source: 'exam_question',
    occurredAt,
    contentId: id,
    markingMethod: 'self_assessed',
    marksAwarded: 8,
    marksAvailable: 10,
    assessmentObjectives: { ao1: { awarded: 2, available: 2 }, ao2: { awarded: 2, available: 2 }, ao3: { awarded: 2, available: 3 }, ao4: { awarded: 2, available: 3 } },
  }
}

describe('readiness', () => {
  it('withholds a score for sparse evidence but confirms activity counted', () => {
    const result = assessReadiness([card('c1'), card('c2'), question('q1')], now)
    expect(result.score).toBeNull()
    expect(result.confidence).toBe('insufficient')
    expect(result.progress.scoredAttempts).toBe(3)
    expect(result.progress.message).toContain('Your work is being recorded')
    expect(result.progress.nextStep).toContain('3 more scored attempts')
  })

  it('shows why repeated flashcards have not unlocked readiness', () => {
    const result = assessReadiness(Array.from({ length: 8 }, (_, i) => card(`c${i}`)), now)
    expect(result.score).toBeNull()
    expect(result.progress.scoredAttempts).toBe(8)
    expect(result.progress.evidenceTypes).toBe(1)
    expect(result.progress.nextStep).toContain('activity beyond flashcards')
  })

  it('balances evidence families instead of raw item count', () => {
    const evidence = [...Array.from({ length: 5 }, (_, i) => card(`c${i}`)), question('q1', false)]
    const result = assessReadiness(evidence, now)
    expect(result.score).toBe(50)
    expect(result.progress.scoreAvailable).toBe(true)
  })

  it('caps confidence when all evidence is stale', () => {
    const old = '2026-04-01T12:00:00.000Z'
    const evidence = [
      ...Array.from({ length: 6 }, (_, i) => ({ ...question(`q${i}`, true, old) })),
      ...Array.from({ length: 6 }, (_, i) => ({ ...card(`c${i}`, old) })),
    ] as LearningEvidence[]
    expect(assessReadiness(evidence, now).confidence).toBe('low')
  })

  it('does not claim high confidence from self-assessed exam evidence alone', () => {
    const evidence = [
      ...Array.from({ length: 4 }, (_, i) => card(`c${i}`)),
      ...Array.from({ length: 4 }, (_, i) => question(`q${i}`)),
      ...Array.from({ length: 4 }, (_, i) => selfMarkedExam(`e${i}`)),
    ]
    const result = assessReadiness(evidence, now)
    expect(result.confidence).toBe('medium')
    expect(result.explanation).toContain('self-assessed')
    expect(result.explanation).toContain('cannot be high')
  })

  it('returns recent activity independently of readiness thresholds', () => {
    const activity = recentActivity([
      card('c1', '2026-08-14T12:00:00.000Z'),
      question('q1', true, '2026-08-17T10:00:00.000Z'),
      card('c2', '2026-08-16T09:00:00.000Z'),
    ], 2)
    expect(activity.map((item) => item.evidenceId)).toEqual(['q1', 'c2'])
    expect(activity[0].family).toBe('application')
  })

  it('withholds paper readiness until every topic is evidenced while confirming recorded work', () => {
    const evidence = [...Array.from({ length: 3 }, (_, i) => card(`c${i}`)), ...Array.from({ length: 3 }, (_, i) => question(`q${i}`))]
    const result = assessPaperReadiness(common.moduleId, ['finance', 'marketing'], evidence, now)
    expect(result.score).toBeNull()
    expect(result.progress.message).toContain('activity is being recorded')
    expect(result.progress.message).toContain('1 topic')
  })

  it('recommends an uncovered topic without pretending it is weak', () => {
    const recommendation = recommendNextActivity(common.moduleId, ['marketing', 'finance'], [], now)
    expect(recommendation).toMatchObject({ topicId: 'marketing', activity: 'quick-check', evidenceCount: 0, readinessScore: null })
    expect(recommendation?.reason).toContain('cannot tell whether it is strong or weak')
    expect(recommendation?.limitation).toContain('coverage recommendation')
  })

  it('prioritises the least-evidenced topic and adds evidence beyond recall', () => {
    const evidence = [
      ...Array.from({ length: 3 }, (_, i) => card(`fc${i}`)),
      ...Array.from({ length: 3 }, (_, i) => question(`fq${i}`)),
      card('marketing-card', '2026-08-17T10:00:00.000Z', 'marketing'),
    ]
    const recommendation = recommendNextActivity(common.moduleId, ['finance', 'marketing'], evidence, now)
    expect(recommendation).toMatchObject({ topicId: 'marketing', activity: 'quick-check', evidenceCount: 1 })
    expect(recommendation?.reason).toContain('nothing beyond flashcards')
    expect(recommendation?.evidenceSummary).toContain('1 scored activity')
  })

  it('moves a sufficiently evidenced topic into written exam practice', () => {
    const evidence = [
      ...Array.from({ length: 3 }, (_, i) => card(`c${i}`)),
      ...Array.from({ length: 3 }, (_, i) => question(`q${i}`)),
    ]
    const recommendation = recommendNextActivity(common.moduleId, ['finance'], evidence, now)
    expect(recommendation).toMatchObject({ topicId: 'finance', activity: 'exam-question', readinessScore: 100 })
    expect(recommendation?.reason).toContain('no written exam-question evidence')
  })

  it('keeps the recommendation confidence limitation visible for self-assessed exam evidence', () => {
    const evidence = [
      ...Array.from({ length: 3 }, (_, i) => card(`c${i}`)),
      ...Array.from({ length: 3 }, (_, i) => question(`q${i}`)),
      selfMarkedExam('exam-1'),
    ]
    const recommendation = recommendNextActivity(common.moduleId, ['finance'], evidence, now)
    expect(recommendation?.limitation).toContain('self-assessed')
    expect(recommendation?.limitation).toContain('confidence remains capped')
  })
})
