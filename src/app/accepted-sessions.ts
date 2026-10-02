import type { PlannerCandidate, PlannerDay } from '../engine/planning/planning'
import type { PlannedSession, PlannedSessionActivity } from '../services/planning/planned-session-service'
import type { HomeActivityType } from './home-task'

/**
 * Rules for sessions the student accepted onto their plan. The plan itself stays derived; an accepted session is
 * a fixed choice the planner works around. Decisions: docs/design/learner-redesign-v2/data-model-proposal.md, section 5.
 */

export function plannedKey(courseId: string, topicId: string) {
  return `${courseId}:${topicId}`
}

/** What a Home task becomes when the student adds it to their plan. */
export function sessionActivityForTask(activity: HomeActivityType): PlannedSessionActivity {
  return activity === 'exam-question' ? 'exam_prep' : 'practice'
}

/** Sessions the student still intends to do. Done and skipped sessions no longer hold the topic. */
function stillPlanned(sessions: readonly PlannedSession[]) {
  return sessions.filter((session) => session.status === 'planned')
}

/** Topics that are already on the plan, so REV does not suggest them again. */
export function plannedTopicKeys(sessions: readonly PlannedSession[]): Set<string> {
  return new Set(stillPlanned(sessions).map((session) => plannedKey(session.courseId, session.topicId)))
}

/** Minutes already taken on each day by planned and done sessions (skipped ones took no time). */
export function bookedMinutesByDate(sessions: readonly PlannedSession[]): Map<string, number> {
  const booked = new Map<string, number>()
  sessions.forEach((session) => {
    if (session.status === 'skipped') return
    booked.set(session.plannedDate, (booked.get(session.plannedDate) ?? 0) + session.minutes)
  })
  return booked
}

/** The study time left on each day once accepted sessions are placed. The derived plan is built from what is left. */
export function applyAcceptedSessionsToDays(days: readonly PlannerDay[], sessions: readonly PlannedSession[]): PlannerDay[] {
  const booked = bookedMinutesByDate(sessions)
  return days.map((day) => ({ ...day, availableMinutes: Math.max(0, day.availableMinutes - (booked.get(day.date) ?? 0)) }))
}

/** The derived plan never re-suggests a topic the student already put on their plan. */
export function withoutPlannedTopics(candidates: readonly PlannerCandidate[], sessions: readonly PlannedSession[]): PlannerCandidate[] {
  const planned = plannedTopicKeys(sessions)
  if (planned.size === 0) return [...candidates]
  return candidates.filter((candidate) => !candidate.courseId || !planned.has(plannedKey(candidate.courseId, candidate.topicId)))
}

/**
 * The first day, starting today, with room for `minutes` after accepted sessions. With no study time set there is
 * no room to measure, so it returns tomorrow and the student can move it.
 */
export function nextFreeDay(
  days: readonly PlannerDay[],
  sessions: readonly PlannedSession[],
  minutes: number,
  todayKey: string,
): string {
  const free = applyAcceptedSessionsToDays(days, sessions).find((day) => day.date >= todayKey && day.availableMinutes >= minutes)
  if (free) return free.date
  return addDays(todayKey, 1)
}

export function addDays(dateKey: string, count: number): string {
  const date = new Date(`${dateKey}T12:00:00`)
  date.setDate(date.getDate() + count)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** "today", "tomorrow", or the weekday ("Thursday") for a day within the next week; otherwise the date. */
export function dayWord(dateKey: string, todayKey: string): string {
  if (dateKey === todayKey) return 'today'
  if (dateKey === addDays(todayKey, 1)) return 'tomorrow'
  const date = new Date(`${dateKey}T12:00:00`)
  const daysAway = Math.round((date.getTime() - new Date(`${todayKey}T12:00:00`).getTime()) / 86_400_000)
  if (daysAway > 1 && daysAway < 7) return date.toLocaleDateString('en-GB', { weekday: 'long' })
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function activityWord(activity: PlannedSessionActivity) {
  if (activity === 'learn') return 'Learn'
  if (activity === 'exam_prep') return 'Exam practice'
  return 'Practice'
}
