import type { RevisionAssessment } from '../services/planning/planner-service'
import type { ModuleLearningState } from './catalogue-model'
import type { LearnerProgrammeCourse } from './learner-programme'
import type { HomeTask } from './home-task'
import { todayRecommendations } from './today-recommendations'

export type RevSuggestion = { key: string; reason: string; task: HomeTask }
/** Compatibility adapter for Progress's unscheduled practice link; no independent priority rules. */
export function rankSuggestions(states: readonly ModuleLearningState[], assessments: readonly RevisionAssessment[], programme: readonly LearnerProgrammeCourse[], now: Date, alreadyPlanned: ReadonlySet<string> = new Set()): RevSuggestion[] {
  void assessments
  return todayRecommendations(null, states, programme, true, true, now)
    .filter((task) => !alreadyPlanned.has(`${task.courseId}:${task.topicId}`))
    .map((task) => ({ key: `${task.courseId}:${task.topicId}`, reason: task.reason, task }))
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
