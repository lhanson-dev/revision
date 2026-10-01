import { describe, expect, it } from 'vitest'
import { topicLearningStatus } from './topic-status'

describe('Topic status labels (Founder decision, 1 Oct 2026)', () => {
  it('maps the engine bands to the fixed labels', () => {
    expect(topicLearningStatus('good', true)).toBe('gotit')
    expect(topicLearningStatus('medium', true)).toBe('nearly')
    expect(topicLearningStatus('low', true)).toBe('needswork')
  })

  it('splits "not enough evidence" by whether the student has answered anything in the topic', () => {
    expect(topicLearningStatus('not-enough-evidence', true)).toBe('started')
    expect(topicLearningStatus('not-enough-evidence', false)).toBe('notstarted')
  })
})
