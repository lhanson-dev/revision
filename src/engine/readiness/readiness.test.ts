import { describe, expect, it } from 'vitest'
import type { LearningEvidence } from '../evidence/evidence'
import { assessPaperReadiness, assessReadiness } from './readiness'

const now = new Date('2026-08-17T16:00:00.000Z')
const common = { moduleId: 'business-aqa-as-paper-2', schemaVersion: 1 as const }

function question(id: string, correct = true, occurredAt = '2026-08-16T12:00:00.000Z'): LearningEvidence {
  return { ...common, id, topicId: 'finance', source: 'multiple_choice', occurredAt, contentId: id, correct, selectedOption: correct ? 1 : 0, correctOption: 1 }
}

function card(id: string): LearningEvidence {
  return { ...common, id, topicId: 'finance', source: 'flashcard', occurredAt: '2026-08-15T12:00:00.000Z', contentId: id, rating: 2 }
}

describe('readiness', () => {
  it('withholds a score for sparse evidence', () => {
    const result = assessReadiness([card('c1'), card('c2'), question('q1')], now)
    expect(result.score).toBeNull()
    expect(result.confidence).toBe('insufficient')
  })

  it('does not treat recall repetition as readiness', () => {
    const result = assessReadiness(Array.from({ length: 8 }, (_, i) => card(`c${i}`)), now)
    expect(result.score).toBeNull()
  })

  it('balances evidence families instead of raw item count', () => {
    const evidence = [...Array.from({ length: 5 }, (_, i) => card(`c${i}`)), question('q1', false)]
    expect(assessReadiness(evidence, now).score).toBe(50)
  })

  it('caps confidence when all evidence is stale', () => {
    const old = '2026-04-01T12:00:00.000Z'
    const evidence = [
      ...Array.from({ length: 6 }, (_, i) => ({ ...question(`q${i}`, true, old) })),
      ...Array.from({ length: 6 }, (_, i) => ({ ...card(`c${i}`), occurredAt: old })),
    ] as LearningEvidence[]
    expect(assessReadiness(evidence, now).confidence).toBe('low')
  })

  it('withholds paper readiness until every topic is evidenced', () => {
    const evidence = [...Array.from({ length: 3 }, (_, i) => card(`c${i}`)), ...Array.from({ length: 3 }, (_, i) => question(`q${i}`))]
    expect(assessPaperReadiness(common.moduleId, ['finance', 'marketing'], evidence, now).score).toBeNull()
  })
})
