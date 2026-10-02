import type { RevisionAssessment } from '../services/planning/planner-service'
import type { ModuleLearningState } from './catalogue-model'
import { fallbackMinutes, type HomeActivityType, type HomeTask } from './home-task'
import type { LearnerProgrammeCourse } from './learner-programme'
import { activityForTopic, courseIdForLearningState, scopeTopicIds, stateForAssessment } from './planner-model'
import { subjectAccentKey } from './subject-accents'
import { topicLearningStatus } from './topic-status'
import { learningStatusMeta, type LearningStatus } from './ui'

/**
 * REV's suggestion rules (decisions file section 2). The topic is chosen by these rules, never by a model.
 * 1. An exam within 14 days covers a topic marked Needs work.
 * 2. A topic marked Needs work, then Nearly there.
 * 3. A topic with an exam coming that has not been studied for 7+ days.
 * 4. The next unstarted topic in course order.
 * The 14-day and 7-day windows are starting values, to be tuned after testing (open item 3).
 */
export const EXAM_SOON_DAYS = 14
export const NOT_STUDIED_DAYS = 7

export type SuggestionRule = 1 | 2 | 3 | 4

export type RevSuggestion = {
  /** Stable key for "Not now" and "Suggest something else": course + topic. */
  key: string
  rule: SuggestionRule
  reason: string
  task: HomeTask
}

const DAY = 86_400_000

function dayStart(date: Date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
}

function daysBetween(from: Date, to: Date) {
  return Math.round((dayStart(to) - dayStart(from)) / DAY)
}

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`
}

type Candidate = {
  state: ModuleLearningState
  courseId: string
  topicId: string
  order: number
  status: LearningStatus
  score: number | null
  lastStudied: Date | null
  /** The nearest upcoming exam that covers this topic. */
  exam: { title: string; daysAway: number } | null
}

function buildCandidates(states: readonly ModuleLearningState[], assessments: readonly RevisionAssessment[], now: Date): Candidate[] {
  const upcoming = assessments
    .filter((item) => item.isActive)
    .map((item) => ({ item, daysAway: daysBetween(now, new Date(`${item.assessmentDate}T12:00:00`)) }))
    .filter(({ daysAway }) => Number.isFinite(daysAway) && daysAway >= 0)
    .sort((a, b) => a.daysAway - b.daysAway)

  return states.flatMap((state) => {
    const courseId = courseIdForLearningState(state)
    const examTopics = new Map<string, { title: string; daysAway: number }>()
    upcoming.forEach(({ item, daysAway }) => {
      if (stateForAssessment(states, item) !== state) return
      scopeTopicIds(item, state).forEach((topicId) => {
        if (!examTopics.has(topicId)) examTopics.set(topicId, { title: item.title, daysAway })
      })
    })

    return state.topicKnowledge.topics.map((topic, order) => {
      const answered = state.evidence.filter((item) => item.topicId === topic.topicId)
      const latest = answered.reduce<string | null>((max, item) => (max === null || item.occurredAt > max ? item.occurredAt : max), null)
      return {
        state,
        courseId,
        topicId: topic.topicId,
        order,
        status: topicLearningStatus(topic.band, answered.length > 0),
        score: topic.score,
        lastStudied: latest ? new Date(latest) : null,
        exam: examTopics.get(topic.topicId) ?? null,
      }
    })
  })
}

function toSuggestion(candidate: Candidate, rule: SuggestionRule, reason: string, programme: readonly LearnerProgrammeCourse[]): RevSuggestion | null {
  const course = programme.find((item) => item.course.id === candidate.courseId)
  const topic = candidate.state.adapter.getTopic(candidate.topicId)
  if (!course || !topic) return null
  const activity: HomeActivityType = activityForTopic(candidate.state, candidate.topicId, candidate.exam?.daysAway ?? 999, candidate.score === null ? null : candidate.score / 100)
  return {
    key: `${candidate.courseId}:${candidate.topicId}`,
    rule,
    reason,
    task: {
      id: `rev-rules:${candidate.courseId}:${candidate.topicId}:${activity}`,
      source: 'rules',
      courseId: course.course.id,
      courseLabel: course.label,
      subjectId: course.subject.id,
      subjectName: course.subject.name,
      subjectAccent: subjectAccentKey(course.subject.id),
      topicId: candidate.topicId,
      topicLabel: topic.shortTitle,
      activityType: activity,
      estimatedMinutes: fallbackMinutes(activity),
      reason,
      adapter: candidate.state.adapter,
    },
  }
}

/**
 * Every suggestion REV could make, best first. A topic appears once, under the highest-priority rule that fits it.
 * Each suggestion carries a reason built from the student's real data; with no data there are no suggestions.
 */
export function rankSuggestions(
  states: readonly ModuleLearningState[],
  assessments: readonly RevisionAssessment[],
  programme: readonly LearnerProgrammeCourse[],
  now: Date,
  /** Topics already on the student's plan (course:topic). REV does not suggest what is already planned. */
  alreadyPlanned: ReadonlySet<string> = new Set(),
): RevSuggestion[] {
  const candidates = buildCandidates(states, assessments, now).filter((candidate) => !alreadyPlanned.has(`${candidate.courseId}:${candidate.topicId}`))
  const topicName = (candidate: Candidate) => candidate.state.adapter.getTopic(candidate.topicId)?.shortTitle ?? 'this topic'
  const statusWord = (candidate: Candidate) => learningStatusMeta[candidate.status].label
  const out: RevSuggestion[] = []
  const seen = new Set<string>()
  const push = (candidate: Candidate, rule: SuggestionRule, reason: string) => {
    const key = `${candidate.courseId}:${candidate.topicId}`
    if (seen.has(key)) return
    const suggestion = toSuggestion(candidate, rule, reason, programme)
    if (!suggestion) return
    seen.add(key)
    out.push(suggestion)
  }
  const byExamThenOrder = (a: Candidate, b: Candidate) => (a.exam?.daysAway ?? Infinity) - (b.exam?.daysAway ?? Infinity) || a.order - b.order
  const byScoreThenOrder = (a: Candidate, b: Candidate) => (a.score ?? 101) - (b.score ?? 101) || a.order - b.order

  candidates
    .filter((c) => c.status === 'needswork' && c.exam && c.exam.daysAway <= EXAM_SOON_DAYS)
    .sort(byExamThenOrder)
    .forEach((c) => push(c, 1, `${c.exam?.title} is ${c.exam?.daysAway === 0 ? 'today' : `in ${plural(c.exam?.daysAway ?? 0, 'day', 'days')}`} and ${topicName(c)} is marked ${statusWord(c)} from your answers so far.`))

  ;(['needswork', 'nearly'] as const).forEach((status) => {
    candidates
      .filter((c) => c.status === status)
      .sort(byScoreThenOrder)
      .forEach((c) => push(c, 2, `${topicName(c)} is marked ${statusWord(c)} from your answers so far.`))
  })

  candidates
    .filter((c) => c.exam && (c.lastStudied === null || daysBetween(c.lastStudied, now) >= NOT_STUDIED_DAYS))
    .sort(byExamThenOrder)
    .forEach((c) => {
      const since = c.lastStudied ? `you haven’t studied it for ${plural(daysBetween(c.lastStudied, now), 'day', 'days')}` : 'you haven’t studied it yet'
      push(c, 3, `${c.exam?.title} is ${c.exam?.daysAway === 0 ? 'today' : `in ${plural(c.exam?.daysAway ?? 0, 'day', 'days')}`} and ${since}.`)
    })

  candidates
    .filter((c) => c.status === 'notstarted')
    .sort((a, b) => a.order - b.order)
    .forEach((c) => {
      const course = programme.find((item) => item.course.id === c.courseId)
      push(c, 4, `${topicName(c)} is the next topic in ${course?.label ?? 'your course'} you haven’t started.`)
    })

  return out
}

/** "Not now" hides a suggestion until tomorrow. Stored as the day it was dismissed plus the suggestion keys. */
export type NotNowRecord = { day: string; keys: string[] }

export function dayKey(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function activeNotNow(record: NotNowRecord | null, now: Date): string[] {
  return record && record.day === dayKey(now) ? record.keys : []
}

/**
 * The suggestion to show now: the best one that is not hidden by "Not now" today and not already skipped
 * with "Suggest something else". When the student has skipped everything left, it starts the list again
 * (the same topic is only shown twice in a day because they asked).
 */
export function pickSuggestion(ranked: readonly RevSuggestion[], hiddenToday: readonly string[], skipped: readonly string[]) {
  const available = ranked.filter((item) => !hiddenToday.includes(item.key))
  if (available.length === 0) return { suggestion: null, allHidden: ranked.length > 0, skipped: [] as string[] }
  const fresh = available.find((item) => !skipped.includes(item.key))
  if (fresh) return { suggestion: fresh, allHidden: false, skipped: [...skipped] }
  return { suggestion: available[0], allHidden: false, skipped: [] as string[] }
}
