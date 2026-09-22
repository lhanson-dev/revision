import { describe, expect, it } from 'vitest'
import type { LearningEvidence } from '../evidence/evidence'
import { assessTopicKnowledge, summariseTopicKnowledge } from './topic-knowledge'

const common = { moduleId: 'business-aqa-a-level-paper-1', schemaVersion: 1 as const }
const topicId = 'finance'

function card(id: string, rating: 0 | 1 | 2 = 2, occurredAt = '2026-09-20T10:00:00.000Z', topic = topicId): LearningEvidence {
  return { ...common, id, topicId: topic, source: 'flashcard', occurredAt, contentId: id, rating }
}

function question(id: string, correct = true, occurredAt = '2026-09-20T11:00:00.000Z', topic = topicId): LearningEvidence {
  return { ...common, id, topicId: topic, source: 'multiple_choice', occurredAt, contentId: id, correct, selectedOption: correct ? 1 : 0, correctOption: 1 }
}

function examQuestion(id: string, marksAwarded: number, marksAvailable = 100, occurredAt = '2026-09-20T12:00:00.000Z', topic = topicId): LearningEvidence {
  return {
    ...common,
    id,
    topicId: topic,
    source: 'exam_question',
    occurredAt,
    contentId: id,
    marksAwarded,
    marksAvailable,
    assessmentObjectives: {},
  }
}

describe('Topic Knowledge', () => {
  it('withholds a band until there are six distinct scored items across varied evidence', () => {
    const result = assessTopicKnowledge(common.moduleId, topicId, [
      card('c1'), card('c2'), card('c3'),
      question('q1'), question('q2'),
    ])

    expect(result.band).toBe('not-enough-evidence')
    expect(result.score).toBeNull()
    expect(result.distinctContentItems).toBe(5)
    expect(result.familyCount).toBe(2)
  })

  it('does not produce a band from flashcards alone', () => {
    const result = assessTopicKnowledge(common.moduleId, topicId, Array.from({ length: 8 }, (_, index) => card(`c${index}`)))
    expect(result.band).toBe('not-enough-evidence')
    expect(result.familyCount).toBe(1)
  })

  it('deduplicates repeated content and keeps only the latest usable result', () => {
    const evidence = [
      card('c1'), card('c2'), card('c3'),
      question('q1', true, '2026-09-18T10:00:00.000Z'),
      question('q1-later', false, '2026-09-21T10:00:00.000Z'),
      question('q2'), question('q3'),
    ]
    evidence[3] = { ...evidence[3], contentId: 'shared-question' }
    evidence[4] = { ...evidence[4], contentId: 'shared-question' }

    const result = assessTopicKnowledge(common.moduleId, topicId, evidence)
    expect(result.distinctContentItems).toBe(6)
    expect(result.band).toBe('medium')
    expect(result.score).toBe(75)
  })

  it('uses the agreed Low / Medium / Good calibration boundaries', () => {
    const low = assessTopicKnowledge(common.moduleId, topicId, [
      card('l-c1', 0), card('l-c2', 0), card('l-c3', 0),
      examQuestion('l-e1', 98), examQuestion('l-e2', 98), examQuestion('l-e3', 98),
    ])
    const mediumFloor = assessTopicKnowledge(common.moduleId, topicId, [
      card('mf-c1', 0), card('mf-c2', 0), card('mf-c3', 0),
      examQuestion('mf-e1', 100), examQuestion('mf-e2', 100), examQuestion('mf-e3', 100),
    ])
    const mediumTop = assessTopicKnowledge(common.moduleId, topicId, [
      card('mt-c1', 1), card('mt-c2', 1), card('mt-c3', 1),
      examQuestion('mt-e1', 98), examQuestion('mt-e2', 98), examQuestion('mt-e3', 98),
    ])
    const good = assessTopicKnowledge(common.moduleId, topicId, [
      card('g-c1', 1), card('g-c2', 1), card('g-c3', 1),
      examQuestion('g-e1', 100), examQuestion('g-e2', 100), examQuestion('g-e3', 100),
    ])

    expect(low).toMatchObject({ score: 49, band: 'low' })
    expect(mediumFloor).toMatchObject({ score: 50, band: 'medium' })
    expect(mediumTop).toMatchObject({ score: 74, band: 'medium' })
    expect(good).toMatchObject({ score: 75, band: 'good' })
  })

  it('ignores evidence that cannot produce a valid score', () => {
    const evidence: LearningEvidence[] = [
      card('c1'), card('c2'), card('c3'),
      question('q1'), question('q2'),
      examQuestion('unscored', 0, 0),
    ]
    const result = assessTopicKnowledge(common.moduleId, topicId, evidence)
    expect(result.band).toBe('not-enough-evidence')
    expect(result.distinctContentItems).toBe(5)
  })

  it('allows newer contradictory evidence to move a supported band down', () => {
    const initial: LearningEvidence[] = [
      card('c1'), card('c2'), card('c3'),
      question('q1'), question('q2'), question('q3'),
    ]
    const good = assessTopicKnowledge(common.moduleId, topicId, initial)

    const newerWeak = initial.map((item) => item.source === 'multiple_choice'
      ? { ...item, id: `${item.id}-new`, occurredAt: '2026-09-22T10:00:00.000Z', correct: false, selectedOption: 0 }
      : item)
    const revised = assessTopicKnowledge(common.moduleId, topicId, [...initial, ...newerWeak])

    expect(good.band).toBe('good')
    expect(revised.band).toBe('medium')
    expect(revised.score).toBe(50)
  })

  it('rolls topic states up without inventing an aggregate subject percentage', () => {
    const evidence: LearningEvidence[] = [
      ...[card('f-c1'), card('f-c2'), card('f-c3'), question('f-q1'), question('f-q2'), question('f-q3')],
      ...[card('m-c1', 0, undefined, 'marketing'), card('m-c2', 0, undefined, 'marketing'), card('m-c3', 0, undefined, 'marketing'), question('m-q1', true, undefined, 'marketing'), question('m-q2', true, undefined, 'marketing'), question('m-q3', true, undefined, 'marketing')],
      ...[card('o-c1', 0, undefined, 'operations'), card('o-c2', 0, undefined, 'operations'), card('o-c3', 0, undefined, 'operations'), examQuestion('o-e1', 20, 100, undefined, 'operations'), examQuestion('o-e2', 20, 100, undefined, 'operations'), examQuestion('o-e3', 20, 100, undefined, 'operations')],
    ]

    const summary = summariseTopicKnowledge(common.moduleId, ['finance', 'marketing', 'operations', 'people'], evidence)
    expect(summary.distribution).toEqual({ good: 1, medium: 1, low: 1, notEnoughEvidence: 1 })
  })
})
