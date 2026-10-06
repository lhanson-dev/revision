import { describe, expect, it } from 'vitest'
import { addSecond, briefFor, clockLabel, LOW_TIME_SECONDS, modeAfterLeaving, leaveText, stripLabel, stripSummary, suggestedMinutes, timerMilestone, timerView, untimedLabel, wordCount, isAttempted } from './mock-exam'
import { createBrowserDraftStore, draftAnsweredCount, type MockDraft } from './mock-exam-drafts'

const exam = { id: 'e', title: 'Paper 1', durationMinutes: 120, totalMarks: 100, questions: [{ id: 'q1', topic: 'finance' }] }

describe('timer', () => {
  it('shows mm:ss, and h:mm:ss from an hour', () => {
    expect(clockLabel(36 * 60)).toBe('36:00')
    expect(clockLabel(5)).toBe('0:05')
    expect(clockLabel(7200)).toBe('2:00:00')
    expect(clockLabel(3725)).toBe('1:02:05')
    expect(clockLabel(-4)).toBe('0:00')
  })
  it('is ink until 5 minutes are left, then yellow', () => {
    expect(timerView(LOW_TIME_SECONDS + 1).tone).toBe('normal')
    expect(timerView(LOW_TIME_SECONDS).tone).toBe('low')
    expect(timerView(60).label).toBe('1:00')
  })
  it('announces 5 minutes and 1 minute once each, never every second', () => {
    expect(timerMilestone(301, 300)).toBe('five-minutes')
    expect(timerMilestone(300, 299)).toBeNull()
    expect(timerMilestone(61, 60)).toBe('one-minute')
    expect(timerMilestone(60, 59)).toBeNull()
    expect(timerMilestone(500, 499)).toBeNull()
    // A jump straight past both (a tab asleep) announces the nearer one.
    expect(timerMilestone(400, 50)).toBe('one-minute')
  })
  it('counts untimed time in whole minutes', () => {
    expect(untimedLabel(0)).toBe('Untimed · 0 min in')
    expect(untimedLabel(125)).toBe('Untimed · 2 min in')
  })
})

describe('questions', () => {
  it('suggests about 1.2 minutes a mark, at least 1', () => {
    expect([1, 4, 9, 25].map(suggestedMinutes)).toEqual([1, 5, 11, 30])
  })
  it('names each square in words', () => {
    expect(stripLabel({ number: 3, answered: true, flagged: true, current: false })).toBe('Question 3, answered, flagged')
    expect(stripLabel({ number: 1, answered: false, flagged: false, current: true })).toBe('Question 1, not answered, current question')
    expect(stripSummary(3, 4, 1)).toBe('3 of 4 answered · 1 flagged')
  })
  it('counts words and seconds per question', () => {
    expect(wordCount('  ')).toBe(0)
    expect(wordCount('one two  three')).toBe(3)
    expect(addSecond(addSecond({}, 'q1'), 'q1')).toEqual({ q1: 2 })
  })
  it('treats a choice between essays as one question', () => {
    expect(isAttempted({ id: 'a', choiceGroup: 'C' }, { C: 'a' })).toBe(true)
    expect(isAttempted({ id: 'b', choiceGroup: 'C' }, { C: 'a' })).toBe(false)
    expect(isAttempted({ id: 'x' }, {})).toBe(true)
  })
})

describe('before you start and leaving', () => {
  it('timed: the exam’s own numbers, no help, counts towards readiness', () => {
    const brief = briefFor(exam, 'Paper 1', 'timed', 3)
    expect(brief.heading).toBe('Paper 1, timed')
    expect(brief.rules.map((rule) => rule.title)).toEqual(['120 minutes, and the timer doesn’t stop', '3 questions, 100 marks', 'No help while the clock runs', 'Flag a question and come back', 'Marked straight after'])
    expect(brief.counts).toBe('Counts towards Exam readiness')
    expect(brief.beginLabel).toBe('Start the clock')
  })
  it('untimed: no timer, and it does not count', () => {
    const brief = briefFor(exam, 'Paper 1', 'untimed', 1)
    expect(brief.rules[0].title).toBe('No timer')
    expect(brief.rules[1].title).toBe('1 question, 100 marks')
    expect(brief.counts).toMatch(/^Doesn’t count towards Exam readiness/)
    expect(brief.beginLabel).toBe('Start')
  })
  it('a timed mock that is left becomes untimed; untimed stays', () => {
    expect(modeAfterLeaving('timed')).toBe('untimed')
    expect(modeAfterLeaving('untimed')).toBe('untimed')
    expect(leaveText('timed')).toContain('won’t count as a timed mock')
    expect(leaveText('untimed')).not.toContain('timer')
  })
})

describe('saved attempt', () => {
  const draft: MockDraft = { version: 1, examId: 'e', mode: 'untimed', leftWhileTimed: true, answers: { q1: 'x', q2: '  ' }, flagged: {}, selectedChoices: {}, questionIndex: 1, secondsPerQuestion: { q1: 40 }, elapsedSeconds: 90, savedAt: '2026-10-06T10:00:00.000Z' }
  const memory = () => { const data = new Map<string, string>(); return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => { data.set(k, v) }, removeItem: (k: string) => { data.delete(k) } } }
  it('saves, loads and clears per student and exam', () => {
    const storage = memory()
    const mine = createBrowserDraftStore('student-1', storage)
    mine.save(draft)
    expect(mine.load('e')).toEqual(draft)
    expect(createBrowserDraftStore('student-2', storage).load('e')).toBeNull()
    mine.clear('e')
    expect(mine.load('e')).toBeNull()
    expect(draftAnsweredCount(draft)).toBe(1)
  })
  it('never throws when storage is missing, full or holds rubbish', () => {
    const rubbish = { getItem: () => '{not json', setItem: () => { throw new Error('full') }, removeItem: () => { throw new Error('no') } }
    const store = createBrowserDraftStore('s', rubbish)
    expect(store.load('e')).toBeNull()
    expect(() => store.save(draft)).not.toThrow()
    expect(() => store.clear('e')).not.toThrow()
    expect(createBrowserDraftStore('s', null).load('e')).toBeNull()
  })
})
