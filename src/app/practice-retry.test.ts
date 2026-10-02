import { describe, expect, it } from 'vitest'
import { clearRetried, dueRetry, queueMissed, RETRY_AFTER_OTHER_QUESTIONS } from './practice-retry'

describe('Practice retry queue', () => {
  it('brings a missed question back only after at least 3 other answers', () => {
    expect(RETRY_AFTER_OTHER_QUESTIONS).toBe(3)
    const queue = queueMissed([], 'q1', 1)
    expect(dueRetry(queue, 1)).toBeNull()
    expect(dueRetry(queue, 2)).toBeNull()
    expect(dueRetry(queue, 3)).toBeNull()
    expect(dueRetry(queue, 4)?.questionId).toBe('q1')
  })

  it('asks the question that has waited longest first', () => {
    const queue = queueMissed(queueMissed([], 'q1', 1), 'q2', 2)
    expect(dueRetry(queue, 6)?.questionId).toBe('q1')
    expect(dueRetry(clearRetried(queue, 'q1'), 6)?.questionId).toBe('q2')
  })

  it('removes a question once it is answered correctly', () => {
    const queue = queueMissed([], 'q1', 0)
    expect(clearRetried(queue, 'q1')).toEqual([])
    expect(clearRetried(queue, 'other')).toEqual(queue)
  })

  it('puts a question that is missed again back at the end of a fresh gap, once', () => {
    const once = queueMissed([], 'q1', 1)
    const twice = queueMissed(once, 'q1', 5)
    expect(twice).toEqual([{ questionId: 'q1', dueAfterAnswers: 8 }])
  })
})
