import { describe, expect, it } from 'vitest'
import {
  estimatedMinutes,
  lastPractisedLabel,
  sessionQuestionCount,
  toggleQuestionType,
  usableQuestionTypes,
} from './practice-start'

describe('practice start rules', () => {
  it('gives the promised time for each session length and the same pace for shorter sessions', () => {
    expect([5, 10, 15].map(estimatedMinutes)).toEqual([8, 15, 25])
    expect(estimatedMinutes(3)).toBe(5)
    expect(estimatedMinutes(1)).toBe(2)
  })

  it('never promises more questions than the topic has', () => {
    expect(sessionQuestionCount(10, 5)).toBe(5)
    expect(sessionQuestionCount(5, 12)).toBe(5)
    expect(sessionQuestionCount(15, 0)).toBe(0)
  })

  it('keeps at least one question type on', () => {
    expect(toggleQuestionType(['multiple-choice'], 'multiple-choice')).toEqual(['multiple-choice'])
    expect(toggleQuestionType(['multiple-choice'], 'calculation')).toEqual(['multiple-choice', 'calculation'])
    expect(toggleQuestionType(['multiple-choice', 'calculation'], 'multiple-choice')).toEqual(['calculation'])
  })

  it('uses only the types the topic has questions for', () => {
    expect(usableQuestionTypes(['calculation', 'written'], ['multiple-choice'])).toEqual(['multiple-choice'])
    expect(usableQuestionTypes(['multiple-choice', 'written'], ['multiple-choice', 'written'])).toEqual(['multiple-choice', 'written'])
  })

  it('says when the topic was last practised, in plain words', () => {
    const now = new Date(2026, 9, 6, 15, 0)
    expect(lastPractisedLabel(null, now)).toBeNull()
    expect(lastPractisedLabel(new Date(2026, 9, 6, 8, 0).toISOString(), now)).toBe('Last practised today')
    expect(lastPractisedLabel(new Date(2026, 9, 5, 23, 0).toISOString(), now)).toBe('Last practised yesterday')
    expect(lastPractisedLabel(new Date(2026, 9, 3, 10, 0).toISOString(), now)).toBe('Last practised 3 days ago')
    expect(lastPractisedLabel(new Date(2026, 8, 15, 10, 0).toISOString(), now)).toBe('Last practised 3 weeks ago')
  })
})
