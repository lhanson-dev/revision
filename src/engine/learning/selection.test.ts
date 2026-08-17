import { describe, expect, it } from 'vitest'
import { businessAqaAsPaper2 } from '../../../content/business/aqa-as/paper-2'
import { createLearningContentAdapter } from '../content/content-adapter'
import { selectBalancedQuestions, selectFlashcards, selectQuestions } from './selection'

const adapter = createLearningContentAdapter(businessAqaAsPaper2)

describe('deterministic learning selection', () => {
  it('returns the same flashcard order for the same seed', () => {
    const first = selectFlashcards(adapter, { seed: 'learner-1-session-1', limit: 10 })
    const second = selectFlashcards(adapter, { seed: 'learner-1-session-1', limit: 10 })

    expect(second.map((item) => item.id)).toEqual(first.map((item) => item.id))
  })

  it('can select within a topic without leaking other topics', () => {
    const selected = selectQuestions(adapter, { seed: 'finance-check', topicId: 'finance', limit: 6 })

    expect(selected).toHaveLength(6)
    expect(selected.every((item) => item.topic === 'finance')).toBe(true)
  })

  it('creates a balanced diagnostic across installed topics', () => {
    const selected = selectBalancedQuestions(adapter, { seed: 'diagnostic-1', perTopic: 2 })

    expect(selected).toHaveLength(adapter.listTopics().length * 2)
    for (const topic of adapter.listTopics()) {
      expect(selected.filter((item) => item.topic === topic.id)).toHaveLength(2)
    }
  })

  it('rejects invalid limits', () => {
    expect(() => selectFlashcards(adapter, { seed: 'bad', limit: -1 })).toThrow(
      'limit must be a non-negative integer',
    )
  })
})
