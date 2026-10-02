import { describe, expect, it } from 'vitest'
import { questionState, timeNoticeFor } from './ExamSimulator'

describe('timed exam helpers', () => {
  it('only changes the announced notice at 10, 5 and 1 minutes, so the clock is not read every second', () => {
    expect(timeNoticeFor(5400)).toBe('')
    expect(timeNoticeFor(601)).toBe('')
    expect(timeNoticeFor(600)).toBe('Under 10 minutes left.')
    expect(timeNoticeFor(301)).toBe('Under 10 minutes left.')
    expect(timeNoticeFor(300)).toBe('Under 5 minutes left.')
    expect(timeNoticeFor(61)).toBe('Under 5 minutes left.')
    expect(timeNoticeFor(60)).toBe('Under 1 minute left.')
    expect(timeNoticeFor(1)).toBe('Under 1 minute left.')
    expect(timeNoticeFor(0)).toBe('')
    const distinct = new Set(Array.from({ length: 5400 }, (_, index) => timeNoticeFor(index)))
    expect(distinct.size).toBe(4)
  })

  it('describes a question in plain words', () => {
    expect(questionState({ answered: false, flagged: false, current: false })).toBe('not answered')
    expect(questionState({ answered: true, flagged: false, current: true })).toBe('answered, current question')
    expect(questionState({ answered: true, flagged: true, current: true })).toBe('answered, flagged for review, current question')
    expect(questionState({ answered: false, flagged: true, current: false })).toBe('not answered, flagged for review')
  })
})
