import { describe, expect, it } from 'vitest'
import { topicLearningStatus, understandingCounts } from './topic-status'
import type { ModuleLearningState } from './catalogue-model'

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

describe('understandingCounts', () => {
  const state = {
    topicKnowledge: { topics: [
      { topicId: 'a', band: 'good' }, { topicId: 'b', band: 'low' }, { topicId: 'c', band: 'not-enough-evidence' }, { topicId: 'd', band: 'not-enough-evidence' },
    ] },
    evidence: [{ topicId: 'c' }],
  } as unknown as ModuleLearningState

  it('counts every topic once under its status, splitting "not enough evidence" by whether anything was answered', () => {
    expect(understandingCounts([state])).toEqual({ gotit: 1, needswork: 1, started: 1, notstarted: 1 })
  })

  it('is empty when there are no topics, so the page shows an honest empty bar', () => {
    expect(understandingCounts([])).toEqual({})
  })
})
