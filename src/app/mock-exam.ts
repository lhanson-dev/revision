import type { MockExamLike } from './exam-prep'

/**
 * Plain rules for sitting a mock exam (Exam Prep v2.2, PR 2). Nothing here is exam content: it only works with
 * the questions, marks and time the course's own exam already has. Wording that explains how the screen works
 * is ours; the questions, marks and mark schemes are shown exactly as the Content Factory produced them.
 */

export type MockMode = 'timed' | 'untimed'

/** Seconds left at which the timer turns yellow and a polite notice is read out (5 minutes, then 1 minute). */
export const LOW_TIME_SECONDS = 300
export const LAST_MINUTE_SECONDS = 60

/** Suggested time for a question: about 1.2 minutes a mark, which is the paper's 2 hours over its 100 marks. */
export function suggestedMinutes(marks: number): number {
  return Math.max(1, Math.round(marks * 1.2))
}

/** "mm:ss" (or "h:mm:ss" from an hour up) for the countdown. */
export function clockLabel(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60
  const mm = hours > 0 ? String(minutes).padStart(2, '0') : String(minutes)
  return `${hours > 0 ? `${hours}:` : ''}${mm}:${String(seconds).padStart(2, '0')}`
}

export type TimerView = { label: string; tone: 'normal' | 'low' }

/** The timed pill: ink until 5 minutes are left, then the yellow tint. It always says the time in words and digits. */
export function timerView(secondsRemaining: number): TimerView {
  return { label: clockLabel(secondsRemaining), tone: secondsRemaining <= LOW_TIME_SECONDS ? 'low' : 'normal' }
}

/** The untimed pill: "Untimed · 12 min in". Whole minutes, so it only changes once a minute. */
export function untimedLabel(secondsElapsed: number): string {
  return `Untimed · ${Math.floor(Math.max(0, secondsElapsed) / 60)} min in`
}

export type TimerMilestone = 'five-minutes' | 'one-minute' | null

/**
 * Which milestone (if any) the clock crossed between two readings. Each is announced once, politely:
 * 5 minutes left and 1 minute left. The clock itself is never read out every second.
 */
export function timerMilestone(previousSeconds: number, currentSeconds: number): TimerMilestone {
  if (previousSeconds > LAST_MINUTE_SECONDS && currentSeconds <= LAST_MINUTE_SECONDS) return 'one-minute'
  if (previousSeconds > LOW_TIME_SECONDS && currentSeconds <= LOW_TIME_SECONDS) return 'five-minutes'
  return null
}

export function milestoneNotice(milestone: TimerMilestone): string {
  if (milestone === 'five-minutes') return '5 minutes left.'
  if (milestone === 'one-minute') return '1 minute left.'
  return ''
}

/** The accessible name of a question square: "Question 3, answered, flagged". */
export function stripLabel(input: { number: number; answered: boolean; flagged: boolean; current: boolean }): string {
  const parts = [`Question ${input.number}`, input.answered ? 'answered' : 'not answered']
  if (input.flagged) parts.push('flagged')
  if (input.current) parts.push('current question')
  return parts.join(', ')
}

export function stripSummary(answered: number, total: number, flagged: number): string {
  return `${answered} of ${total} answered · ${flagged} flagged`
}

export function wordCount(text: string): number {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

export type BriefRule = { id: string; title: string; line: string; icon: 'clock' | 'check' | 'info' | 'flag' | 'play' }

export type BriefModel = {
  heading: string
  rules: BriefRule[]
  counts: string
  beginLabel: string
}

/**
 * The "Before you start" rules. Numbers come from the exam itself (its time, questions and marks). The student chooses
 * timed or untimed on the page before this screen, and it cannot change after it.
 */
export function briefFor(exam: MockExamLike & { printedMarks?: number }, name: string, mode: MockMode, questionCount: number): BriefModel {
  if (mode === 'timed') {
    return {
      heading: `${name}, timed`,
      rules: [
        { id: 'clock', title: `${exam.durationMinutes} minutes, and the timer doesn’t stop`, line: 'Once you start the clock it runs until the time is up, as it would in the exam.', icon: 'clock' },
        { id: 'marks', title: `${questionCount} ${questionCount === 1 ? 'question' : 'questions'}, ${exam.totalMarks} marks`, line: 'The marks tell you how long to spend: about 1 minute a mark.', icon: 'check' },
        { id: 'help', title: 'No help while the clock runs', line: 'No examiner guide, no REV and no notes, just you and the paper.', icon: 'info' },
        { id: 'flag', title: 'Flag a question and come back', line: 'Your answers save as you type, so nothing is lost if you leave a question.', icon: 'flag' },
        { id: 'marked', title: 'Marked straight after', line: 'When you hand in, you mark your answers against the mark scheme.', icon: 'play' },
      ],
      counts: 'Counts towards Exam readiness',
      beginLabel: 'Start the clock',
    }
  }
  return {
    heading: `${name}, untimed`,
    rules: [
      { id: 'clock', title: 'No timer', line: 'Take the time you need. A small counter shows how long you have been working.', icon: 'clock' },
      { id: 'marks', title: `${questionCount} ${questionCount === 1 ? 'question' : 'questions'}, ${exam.totalMarks} marks`, line: 'The marks tell you how much to write: about 1 minute a mark.', icon: 'check' },
      { id: 'flag', title: 'Flag a question and come back', line: 'Your answers save as you type, so nothing is lost if you leave.', icon: 'flag' },
      { id: 'marked', title: 'Marked at the end', line: 'When you hand in, you mark your answers against the mark scheme.', icon: 'play' },
    ],
    counts: 'Doesn’t count towards Exam readiness: untimed practice',
    beginLabel: 'Start',
  }
}

/** Seconds spent on each question, in the order asked. Adds a second to the question on screen. */
export function addSecond(perQuestion: Readonly<Record<string, number>>, questionId: string): Record<string, number> {
  return { ...perQuestion, [questionId]: (perQuestion[questionId] ?? 0) + 1 }
}

/** What leaving does to the attempt: a timed mock that is left is saved as untimed, so it no longer counts as timed. */
export function modeAfterLeaving(mode: MockMode): MockMode {
  return mode === 'timed' ? 'untimed' : mode
}

export function leaveText(mode: MockMode): string {
  return mode === 'timed'
    ? 'Your answers are saved and you can finish it later. The timer stops, so it won’t count as a timed mock.'
    : 'Your answers are saved and you can finish it later.'
}

/** Question squares with a choice between two (an essay section): only the chosen one is answered. */
export function isAttempted(question: { id: string; choiceGroup?: string | null }, selectedChoices: Readonly<Record<string, string>>): boolean {
  return !question.choiceGroup || selectedChoices[question.choiceGroup] === question.id
}
