import { describe, expect, it } from 'vitest'
import type { AnswerConfidence } from '../engine/evidence/evidence'
import {
  advanceQuestionSession,
  type AdaptiveState,
  applyAnswerToLevel,
  initialAdaptiveState,
  isSessionFinished,
  needsAnotherGo,
  levelFromAoTags,
  levelNote,
  pickQuestion,
  recordSessionAnswer,
  reviseLastAnswer,
  startQuestionSession,
  statusDirection,
  type PracticeLevel,
  type QuestionSession,
  type SessionQuestion,
} from './practice-session'

const q = (id: string, level: PracticeLevel): SessionQuestion => ({ id, level, type: 'multiple-choice' })
const answer = (session: QuestionSession, correct: boolean, confidence: AnswerConfidence = 'fairly') =>
  recordSessionAnswer(session, { questionId: session.currentId!, correct, confidence, selectedOption: 0, level: 'Recall' })

describe('levels from AO tags', () => {
  it('maps AO1 to Recall, AO2 to Apply and AO3 or AO4 to Analyse, using the highest tag', () => {
    expect(levelFromAoTags(['AO1'])).toBe('Recall')
    expect(levelFromAoTags(['AO2'])).toBe('Apply')
    expect(levelFromAoTags(['AO3'])).toBe('Analyse')
    expect(levelFromAoTags(['AO4'])).toBe('Analyse')
    expect(levelFromAoTags(['AO1', 'AO2', 'AO3'])).toBe('Analyse')
  })

  it('treats a question with no usable AO tag as Apply', () => {
    expect(levelFromAoTags([])).toBe('Apply')
    expect(levelFromAoTags(undefined)).toBe('Apply')
  })
})

describe('step-up rule', () => {
  it('starts at Recall, steps up after 2 right in a row, and stays put after a miss', () => {
    let state = initialAdaptiveState
    expect(state.level).toBe('Recall')
    state = applyAnswerToLevel(state, true)
    expect(state).toMatchObject({ level: 'Recall', streak: 1 })
    state = applyAnswerToLevel(state, true)
    expect(state).toMatchObject({ level: 'Apply', streak: 0, lastChange: 'stepped-up' })
    state = applyAnswerToLevel(state, false)
    expect(state).toMatchObject({ level: 'Apply', streak: 0, lastChange: 'missed' })
  })

  it('a miss breaks the run: right, wrong, right does not step up', () => {
    let state = applyAnswerToLevel(initialAdaptiveState, true)
    state = applyAnswerToLevel(state, false)
    state = applyAnswerToLevel(state, true)
    expect(state.level).toBe('Recall')
  })

  it('never goes past Analyse and never steps down', () => {
    let state: AdaptiveState = { ...initialAdaptiveState, level: 'Analyse' }
    state = applyAnswerToLevel(applyAnswerToLevel(applyAnswerToLevel(state, true), true), true)
    expect(state.level).toBe('Analyse')
    expect(applyAnswerToLevel(state, false).level).toBe('Analyse')
  })

  it('words the note on the next question', () => {
    expect(levelNote({ level: 'Apply', streak: 0, lastChange: 'stepped-up' })).toBe('Stepping up: you got the last 2 right.')
    expect(levelNote({ level: 'Apply', streak: 0, lastChange: 'missed' })).toBe('Same level, so you can steady it.')
    expect(levelNote(initialAdaptiveState)).toBeNull()
  })
})

describe('picking the next question', () => {
  const pool = [q('a', 'Recall'), q('b', 'Recall'), q('c', 'Apply'), q('d', 'Analyse')]

  it('takes the first unasked question at the level', () => {
    expect(pickQuestion(pool, [], 'Recall')?.id).toBe('a')
    expect(pickQuestion(pool, ['a'], 'Recall')?.id).toBe('b')
    expect(pickQuestion(pool, [], 'Analyse')?.id).toBe('d')
  })

  it('falls back to the nearest level, preferring the lower one on a tie', () => {
    expect(pickQuestion(pool, ['a', 'b'], 'Recall')?.id).toBe('c')
    expect(pickQuestion([q('x', 'Recall'), q('z', 'Analyse')], [], 'Apply')?.id).toBe('x')
    expect(pickQuestion(pool, ['a', 'b', 'c', 'd'], 'Recall')).toBeNull()
  })
})

describe('a session', () => {
  const pool = ['a', 'b', 'c', 'd', 'e', 'f'].map((id, index) => q(id, index < 3 ? 'Recall' : 'Apply'))

  it('never asks for more questions than the pool holds', () => {
    expect(startQuestionSession(pool, 15).total).toBe(6)
    expect(startQuestionSession([], 5).currentId).toBeNull()
  })

  it('steps up after two right answers and shows it in the next question', () => {
    let session = startQuestionSession(pool, 5)
    expect(session.currentId).toBe('a')
    session = advanceQuestionSession(answer(session, true), pool)
    expect(session.currentId).toBe('b')
    session = advanceQuestionSession(answer(session, true), pool)
    expect(session.adaptive.level).toBe('Apply')
    expect(session.currentId).toBe('d')
  })

  it('brings a miss back after 3 other questions, and clears it when it is answered right', () => {
    let session = startQuestionSession(pool, 5)
    session = advanceQuestionSession(answer(session, false), pool) // a missed
    const order: string[] = []
    for (let step = 0; step < 3; step += 1) {
      order.push(session.currentId!)
      session = advanceQuestionSession(answer(session, true), pool)
    }
    expect(order).not.toContain('a')
    expect(session.currentId).toBe('a')
    expect(session.currentIsRetry).toBe(true)
    session = advanceQuestionSession(answer(session, true), pool)
    expect(session.retryQueue).toEqual([])
  })

  it('a retry does not move the level', () => {
    let session = startQuestionSession(pool, 5)
    session = advanceQuestionSession(answer(session, false), pool)
    for (let step = 0; step < 3; step += 1) session = advanceQuestionSession(answer(session, false), pool)
    const before = session.adaptive
    expect(session.currentIsRetry).toBe(true)
    session = answer(session, true)
    expect(session.adaptive).toEqual(before)
    expect(session.answers.at(-1)?.retry).toBe(true)
  })

  it('asks a miss that is still waiting at the end, so the session never ends with it unasked', () => {
    let session = startQuestionSession(pool, 2)
    session = advanceQuestionSession(answer(session, true), pool)
    session = advanceQuestionSession(answer(session, false), pool) // second (last) fresh question missed
    expect(isSessionFinished(session)).toBe(false)
    expect(session.currentIsRetry).toBe(true)
    session = advanceQuestionSession(answer(session, true), pool)
    expect(isSessionFinished(session)).toBe(true)
  })

  it('finishes when every question is asked and nothing is waiting', () => {
    let session = startQuestionSession(pool, 2)
    session = advanceQuestionSession(answer(session, true), pool)
    session = advanceQuestionSession(answer(session, true), pool)
    expect(isSessionFinished(session)).toBe(true)
  })

  it('brings a right answer that was only a guess back too, once, and a guessed retry is then done', () => {
    let session = startQuestionSession(pool, 5)
    session = advanceQuestionSession(answer(session, true, 'guess'), pool) // a guessed right
    expect(session.retryQueue.map((entry) => entry.questionId)).toEqual(['a'])
    for (let step = 0; step < 3; step += 1) session = advanceQuestionSession(answer(session, true), pool)
    expect(session.currentId).toBe('a')
    session = advanceQuestionSession(answer(session, true, 'guess'), pool)
    expect(session.retryQueue).toEqual([])
  })

  it('says which answers need another go', () => {
    expect(needsAnotherGo({ correct: false, confidence: 'certain' }, false)).toBe(true)
    expect(needsAnotherGo({ correct: false, confidence: 'fairly' }, true)).toBe(true)
    expect(needsAnotherGo({ correct: true, confidence: 'guess' }, false)).toBe(true)
    expect(needsAnotherGo({ correct: true, confidence: 'guess' }, true)).toBe(false)
    expect(needsAnotherGo({ correct: true, confidence: 'fairly' }, false)).toBe(false)
  })
})

describe('status moves', () => {
  it('shows a direction only between the three real bands', () => {
    expect(statusDirection('needswork', 'nearly')).toBe('up')
    expect(statusDirection('gotit', 'nearly')).toBe('down')
    expect(statusDirection('nearly', 'nearly')).toBeNull()
    expect(statusDirection('started', 'needswork')).toBeNull()
    expect(statusDirection('notstarted', 'started')).toBeNull()
    expect(statusDirection(undefined, 'gotit')).toBeNull()
  })
})

describe('written answers in a session', () => {
  const pool = ['a', 'b', 'c', 'd'].map((id) => ({ ...q(id, 'Recall'), type: 'written' as const }))
  const written = (session: QuestionSession, got: number, available = 4) =>
    recordSessionAnswer(session, { questionId: session.currentId!, correct: got === available, level: 'Recall', marks: { got, available }, pointsGiven: [] })

  it('full marks count as right for the level; missing marks keep the level and are not asked again', () => {
    let session = startQuestionSession(pool, 4)
    session = advanceQuestionSession(written(session, 3), pool)
    expect(session.adaptive.lastChange).toBe('missed')
    expect(session.retryQueue).toEqual([])
    session = advanceQuestionSession(written(session, 4), pool)
    session = advanceQuestionSession(written(session, 4), pool)
    expect(session.adaptive.level).toBe('Apply')
  })

  it('a challenge can change the marks on the last answer without moving the level', () => {
    let session = startQuestionSession(pool, 4)
    session = written(session, 3)
    const level = session.adaptive
    session = reviseLastAnswer(session, { correct: true, marks: { got: 4, available: 4 }, pointsGiven: [true, true, true, true] })
    expect(session.answers[0]).toMatchObject({ correct: true, marks: { got: 4, available: 4 } })
    expect(session.adaptive).toEqual(level)
  })

  it('does not count a written answer as an unfinished retry at the end of the session', () => {
    let session = startQuestionSession(pool, 1)
    session = advanceQuestionSession(written(session, 1), pool)
    expect(isSessionFinished(session)).toBe(true)
  })
})
