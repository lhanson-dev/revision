import type { PlannerItem, PlannerScheduledDay } from '../engine/planning/planning'
import type { PlannedSession } from '../services/planning/planned-session-service'
import type { RevisionAssessment, RevisionAvailabilityException, RevisionDayOfWeek, RevisionWeeklyAvailability } from '../services/planning/planner-service'
import { activityWord } from './accepted-sessions'
import { daysBetween, formatMinutes, fromKey } from './plan-dates'
import type { SubjectHue } from './subject-palette'

/**
 * What the Plan screen shows for each day, worked out from real data only: sessions the student accepted, what
 * the planner returns for the days ahead, and the student's own exam dates. Nothing is invented: a day with none
 * of these is an empty day.
 */

export interface PlanSubject {
  subjectId: string
  name: string
  hue: SubjectHue
  mark: string
}

interface PlanItemBase {
  key: string
  subject: PlanSubject
}

/** A session the student accepted (or REV added at their say-so). It can be done, moved, skipped or removed. */
export interface PlanSessionItem extends PlanItemBase {
  kind: 'session'
  session: PlannedSession
  topic: string
  activityLabel: string
  minutes: number
  done: boolean
  revPick: boolean
}

/** What the planner puts on a day ahead. It is not stored: it changes as the student's evidence and time change. */
export interface PlanSuggestedItem extends PlanItemBase {
  kind: 'suggested'
  item: PlannerItem
  topic: string
  activityLabel: string
  minutes: number
}

export interface PlanExamItem extends PlanItemBase {
  kind: 'exam'
  assessment: RevisionAssessment
  /** "Exam day", "Test day" or "Assessment day". */
  dayLabel: string
  /** "exam", "test" or "assessment", for the month cell. */
  noun: string
}

export type PlanItem = PlanSessionItem | PlanSuggestedItem | PlanExamItem

export interface PlanDay {
  key: string
  items: PlanItem[]
  exams: PlanExamItem[]
  /** Study time is set and this day has none: a rest day on purpose. */
  rest: boolean
  today: boolean
  past: boolean
  /** Minutes of sessions and planner suggestions on this day (exams take no study time). */
  plannedMinutes: number
  doneMinutes: number
  /** Study items on the day, not counting exams. */
  studyCount: number
  doneCount: number
  /** There is study on this day and every piece of it is done. */
  allDone: boolean
}

export interface PlanContext {
  todayKey: string
  sessions: readonly PlannedSession[]
  schedule: readonly PlannerScheduledDay[]
  assessments: readonly RevisionAssessment[]
  weeklyMinutes: RevisionWeeklyAvailability | null
  exceptions: readonly RevisionAvailabilityException[]
  subjectForCourse: (courseId: string) => PlanSubject
  subjectForItem: (item: PlannerItem) => PlanSubject
  subjectForAssessment: (assessment: RevisionAssessment) => PlanSubject
  topicLabel: (courseId: string | undefined, topicId: string) => string
  suggestedActivityLabel: (activityType: string) => string
}

const weekdayByMondayIndex: readonly RevisionDayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export function examLabels(assessment: RevisionAssessment) {
  if (assessment.assessmentType === 'topic_test') return { dayLabel: 'Test day', noun: 'test' }
  if (assessment.assessmentType === 'other') return { dayLabel: 'Assessment day', noun: 'assessment' }
  return { dayLabel: 'Exam day', noun: 'exam' }
}

/** Study time available on a day: a one-off change for that date if there is one, otherwise the usual time for that weekday. */
export function capacityOn(key: string, weekly: RevisionWeeklyAvailability | null, exceptions: readonly RevisionAvailabilityException[]) {
  if (!weekly) return null
  const override = exceptions.find((item) => item.localDate === key)
  if (override) return override.availableMinutes
  const date = fromKey(key)
  return weekly[weekdayByMondayIndex[(date.getDay() + 6) % 7]]
}

function groupBy<T>(items: readonly T[], keyOf: (item: T) => string) {
  const groups = new Map<string, T[]>()
  items.forEach((item) => {
    const key = keyOf(item)
    groups.set(key, [...(groups.get(key) ?? []), item])
  })
  return groups
}

/** Builds the days the screen asks for. Group once, then look each day up. */
export function createPlanDayBuilder(context: PlanContext) {
  const sessionsByDate = groupBy(context.sessions.filter((session) => session.status !== 'skipped'), (session) => session.plannedDate)
  const scheduleByDate = new Map(context.schedule.map((day) => [day.date, day]))
  const assessmentsByDate = groupBy(context.assessments.filter((assessment) => assessment.isActive), (assessment) => assessment.assessmentDate)

  return function buildDay(key: string): PlanDay {
    const today = key === context.todayKey
    const past = key < context.todayKey

    const exams: PlanExamItem[] = (assessmentsByDate.get(key) ?? []).map((assessment) => ({
      kind: 'exam',
      key: `exam:${assessment.assessmentId}`,
      subject: context.subjectForAssessment(assessment),
      assessment,
      ...examLabels(assessment),
    }))

    const sessions: PlanSessionItem[] = (sessionsByDate.get(key) ?? []).map((session) => ({
      kind: 'session',
      key: `session:${session.sessionId}`,
      subject: context.subjectForCourse(session.courseId),
      session,
      topic: context.topicLabel(session.courseId, session.topicId),
      activityLabel: activityWord(session.activityType),
      minutes: session.minutes,
      done: session.status === 'done',
      revPick: session.addedBy === 'rev',
    }))

    // The planner only looks forward, so a day that has gone has accepted sessions and nothing else.
    const suggested: PlanSuggestedItem[] = past ? [] : (scheduleByDate.get(key)?.items ?? []).map((item) => ({
      kind: 'suggested',
      key: `suggested:${item.recommendationId}`,
      subject: context.subjectForItem(item),
      item,
      topic: context.topicLabel(item.courseId, item.topicId),
      activityLabel: context.suggestedActivityLabel(item.activityType),
      minutes: item.estimatedMinutes,
    }))

    const study = [...sessions, ...suggested]
    const doneItems = sessions.filter((item) => item.done)
    const capacity = capacityOn(key, context.weeklyMinutes, context.exceptions)

    return {
      key,
      items: [...exams, ...study],
      exams,
      rest: capacity === 0,
      today,
      past,
      plannedMinutes: study.reduce((sum, item) => sum + item.minutes, 0),
      doneMinutes: doneItems.reduce((sum, item) => sum + item.minutes, 0),
      studyCount: study.length,
      doneCount: doneItems.length,
      allDone: study.length > 0 && doneItems.length === study.length,
    }
  }
}

export type PlanPhase = 'now' | 'past' | 'future'

export interface PlanSummary {
  phase: PlanPhase
  plannedMinutes: number
  doneMinutes: number
  /** Time done against time planned. It is not a mastery measure. */
  percent: number
  studyCount: number
  doneCount: number
  status: { icon: 'check' | 'clock'; label: 'On track' | 'Catching up' | 'Finished' | 'Coming up' | 'Nothing planned'; text: string }
}

const sessionWords = (count: number) => `${count} ${count === 1 ? 'session' : 'sessions'}`

/** Time against plan for a week or a month. `periodStart` and `periodEnd` are inclusive day keys. */
export function summarisePeriod(days: readonly PlanDay[], todayKey: string, periodStart: string, periodEnd: string, overdueSessions: number): PlanSummary {
  const phase: PlanPhase = periodEnd < todayKey ? 'past' : periodStart > todayKey ? 'future' : 'now'
  const plannedMinutes = days.reduce((sum, day) => sum + day.plannedMinutes, 0)
  const doneMinutes = days.reduce((sum, day) => sum + day.doneMinutes, 0)
  const studyCount = days.reduce((sum, day) => sum + day.studyCount, 0)
  const doneCount = days.reduce((sum, day) => sum + day.doneCount, 0)
  const percent = plannedMinutes > 0 ? Math.min(100, Math.round((doneMinutes / plannedMinutes) * 100)) : 0
  const base = { phase, plannedMinutes, doneMinutes, percent, studyCount, doneCount }

  if (studyCount === 0) {
    if (phase === 'past') return { ...base, status: { icon: 'check', label: 'Finished', text: 'Nothing was planned.' } }
    if (phase === 'future') return { ...base, status: { icon: 'clock', label: 'Coming up', text: 'Nothing planned yet.' } }
    return { ...base, status: { icon: 'clock', label: 'Nothing planned', text: 'Add a session, or set your exam dates and study time so REV can plan.' } }
  }
  if (phase === 'past') {
    return { ...base, status: { icon: 'check', label: 'Finished', text: doneCount === studyCount ? `All ${sessionWords(studyCount)} done. Nice work.` : `${doneCount} of ${sessionWords(studyCount)} done.` } }
  }
  if (phase === 'future') {
    return { ...base, status: { icon: 'clock', label: 'Coming up', text: `${sessionWords(studyCount)} planned. REV will adjust these as you go.` } }
  }
  if (doneCount === studyCount) return { ...base, status: { icon: 'check', label: 'Finished', text: `All ${sessionWords(studyCount)} done. Nice work.` } }
  if (overdueSessions > 0) {
    return { ...base, status: { icon: 'clock', label: 'Catching up', text: `${overdueSessions === 1 ? '1 earlier session is' : `${overdueSessions} earlier sessions are`} still to do. ${formatMinutes(plannedMinutes - doneMinutes)} to go.` } }
  }
  return { ...base, status: { icon: 'check', label: 'On track', text: `${doneCount} of ${sessionWords(studyCount)} done. ${formatMinutes(plannedMinutes - doneMinutes)} to go.` } }
}

/** Accepted sessions still waiting on a day before today, inside the period. */
export function overdueSessionCount(days: readonly PlanDay[]) {
  return days.reduce((sum, day) => sum + (day.past ? day.items.filter((item) => item.kind === 'session' && !item.done).length : 0), 0)
}

/** Whole days from today to a date, never below 0. */
export function daysFromToday(todayKey: string, key: string) {
  return Math.max(0, daysBetween(todayKey, key))
}
