/**
 * The Practice question session (v2.2): which question comes next. Everything here is a plain rule, not a
 * model's choice, and it is pure so it can be tested without a screen.
 *
 * Level: from the question's AO tags (AO1 Recall, AO2 Apply, AO3 or AO4 Analyse). A session starts at Recall.
 * Two right answers in a row step the level up; a wrong answer keeps the level the same (it never steps down).
 * A missed question comes back after 3 others (practice-retry.ts), and so does a right answer that was only a guess
 * ("I'll check this one again soon so it sticks"). If one is still waiting when the session's own
 * questions have run out, it is asked before the session ends, so a session never ends with a miss unasked.
 */
import type { AnswerConfidence } from '../engine/evidence/evidence'
import { clearRetried, dueRetry, queueMissed, type RetryEntry } from './practice-retry'
import type { PracticeQuestionType } from './practice-start'

export type PracticeLevel = 'Recall' | 'Apply' | 'Analyse'
export const PRACTICE_LEVELS: readonly PracticeLevel[] = ['Recall', 'Apply', 'Analyse']

export const RIGHT_IN_A_ROW_TO_STEP_UP = 2

/** The highest AO tag wins. A question with no AO tags counts as Apply: the middle level, claiming nothing more. */
export function levelFromAoTags(aoTags: readonly string[] | undefined): PracticeLevel {
  const numbers = (aoTags ?? []).map((tag) => Number(/^AO([1-4])$/i.exec(tag.trim())?.[1])).filter((value) => value >= 1)
  if (numbers.length === 0) return 'Apply'
  const highest = Math.max(...numbers)
  return highest >= 3 ? 'Analyse' : highest === 2 ? 'Apply' : 'Recall'
}

/** What the session needs to know about a question. Content from any source is turned into this shape first. */
export type SessionQuestion = {
  /** Stable evidence content id, unique across sources. */
  id: string
  type: PracticeQuestionType
  level: PracticeLevel
}

export type AdaptiveState = {
  level: PracticeLevel
  /** Right answers in a row at this level. */
  streak: number
  /** What the last fresh answer did, for the one-line note on the next question. */
  lastChange: 'none' | 'stepped-up' | 'missed'
}

export const initialAdaptiveState: AdaptiveState = { level: 'Recall', streak: 0, lastChange: 'none' }

export function applyAnswerToLevel(state: AdaptiveState, correct: boolean): AdaptiveState {
  if (!correct) return { level: state.level, streak: 0, lastChange: 'missed' }
  const streak = state.streak + 1
  const index = PRACTICE_LEVELS.indexOf(state.level)
  if (streak >= RIGHT_IN_A_ROW_TO_STEP_UP && index < PRACTICE_LEVELS.length - 1) {
    return { level: PRACTICE_LEVELS[index + 1], streak: 0, lastChange: 'stepped-up' }
  }
  return { level: state.level, streak, lastChange: 'none' }
}

/**
 * The next fresh question: the first unasked one at the current level (in the pool's order), otherwise the nearest
 * level that still has one, with the lower level winning a tie.
 */
export function pickQuestion<Q extends SessionQuestion>(pool: readonly Q[], askedIds: readonly string[], level: PracticeLevel): Q | null {
  const asked = new Set(askedIds)
  const left = pool.filter((question) => !asked.has(question.id))
  if (left.length === 0) return null
  const here = PRACTICE_LEVELS.indexOf(level)
  const distance = (question: Q) => Math.abs(PRACTICE_LEVELS.indexOf(question.level) - here)
  const nearest = Math.min(...left.map(distance))
  const candidates = left.filter((question) => distance(question) === nearest)
  return candidates.find((question) => PRACTICE_LEVELS.indexOf(question.level) <= here) ?? candidates[0]
}

export type SessionAnswer = {
  questionId: string
  correct: boolean
  confidence: AnswerConfidence
  selectedOption: number
  level: PracticeLevel
  /** A second go at a question that was missed earlier in the session. */
  retry: boolean
}

export type QuestionSession = {
  total: number
  /** The questions this session may draw from, fixed when it starts (so Carry on is the same session). */
  poolIds: string[]
  /** Fresh questions shown so far, including the one on screen. Retries are not counted here. */
  askedIds: string[]
  currentId: string | null
  currentIsRetry: boolean
  adaptive: AdaptiveState
  retryQueue: RetryEntry[]
  answers: SessionAnswer[]
}

/** Starts a session of `total` questions (never more than the pool holds) and picks its first question. */
export function startQuestionSession<Q extends SessionQuestion>(pool: readonly Q[], total: number): QuestionSession {
  const size = Math.max(0, Math.min(total, pool.length))
  const first = size > 0 ? pickQuestion(pool, [], initialAdaptiveState.level) : null
  return {
    total: size,
    poolIds: pool.map((question) => question.id),
    askedIds: first ? [first.id] : [],
    currentId: first?.id ?? null,
    currentIsRetry: false,
    adaptive: initialAdaptiveState,
    retryQueue: [],
    answers: [],
  }
}

/**
 * A miss comes back, and so does a right answer that was a guess. A second go never asks for a third on a guess:
 * once a question has been answered right in a retry, it is done.
 */
export function needsAnotherGo(answer: Pick<SessionAnswer, 'correct' | 'confidence'>, wasRetry: boolean): boolean {
  if (!answer.correct) return true
  return !wasRetry && answer.confidence === 'guess'
}

/** Records the answer to the question on screen: updates the level (fresh questions only) and the retry queue. */
export function recordSessionAnswer(session: QuestionSession, answer: Omit<SessionAnswer, 'retry'>): QuestionSession {
  const retry = session.currentIsRetry
  const answersGiven = session.answers.length + 1
  return {
    ...session,
    answers: [...session.answers, { ...answer, retry }],
    adaptive: retry ? session.adaptive : applyAnswerToLevel(session.adaptive, answer.correct),
    retryQueue: needsAnotherGo(answer, retry)
      ? queueMissed(session.retryQueue, answer.questionId, answersGiven)
      : clearRetried(session.retryQueue, answer.questionId),
  }
}

/** Moves on: a due retry first, then the next fresh question, then (pool or count exhausted) any retry still waiting. */
export function advanceQuestionSession<Q extends SessionQuestion>(session: QuestionSession, pool: readonly Q[]): QuestionSession {
  // The session's own order, fixed when it started.
  const byId = new Map(pool.map((question) => [question.id, question]))
  const sessionPool = session.poolIds.map((id) => byId.get(id)).filter((question): question is Q => question !== undefined)
  const freshLeft = session.askedIds.length < session.total
  const answersGiven = session.answers.length

  const retryDue = dueRetry(session.retryQueue, freshLeft ? answersGiven : Number.MAX_SAFE_INTEGER)
  if (retryDue && sessionPool.some((question) => question.id === retryDue.questionId)) {
    return { ...session, currentId: retryDue.questionId, currentIsRetry: true }
  }
  if (freshLeft) {
    const next = pickQuestion(sessionPool, session.askedIds, session.adaptive.level)
    if (next) return { ...session, askedIds: [...session.askedIds, next.id], currentId: next.id, currentIsRetry: false }
  }
  // The fresh questions are used up. A miss that has not been asked again yet is asked now.
  const leftover = dueRetry(session.retryQueue, Number.MAX_SAFE_INTEGER)
  if (leftover && sessionPool.some((question) => question.id === leftover.questionId)) {
    return { ...session, currentId: leftover.questionId, currentIsRetry: true }
  }
  return { ...session, currentId: null, currentIsRetry: false }
}

export function isSessionFinished(session: QuestionSession): boolean {
  return session.currentId === null
}

export function sessionRightCount(session: QuestionSession): { right: number; fresh: number } {
  const fresh = session.answers.filter((answer) => !answer.retry)
  return { right: fresh.filter((answer) => answer.correct).length, fresh: fresh.length }
}

/** The one-line note on a question, from what the last fresh answer did. */
export function levelNote(state: AdaptiveState): string | null {
  if (state.lastChange === 'stepped-up') return 'Stepping up: you got the last 2 right.'
  if (state.lastChange === 'missed') return 'Same level, so you can steady it.'
  return null
}

const statusRank: Partial<Record<string, number>> = { needswork: 0, nearly: 1, gotit: 2 }

/**
 * "▲ up" or "▼ down" for a topic's status, only when it moves between the three real bands (Needs work, Nearly there,
 * Got it). Going from "Just started" to a band is the topic gaining evidence, not a move, so it shows no arrow.
 */
export function statusDirection(from: string | undefined, to: string | undefined): 'up' | 'down' | null {
  const before = from === undefined ? undefined : statusRank[from]
  const after = to === undefined ? undefined : statusRank[to]
  if (before === undefined || after === undefined || before === after) return null
  return after > before ? 'up' : 'down'
}
