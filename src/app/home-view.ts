import type { RevisionAssessment } from '../services/planning/planner-service'
import type { ModuleLearningState } from './catalogue-model'
import { homeActivityLabel, type HomeTask } from './home-task'
import type { LearnerProgrammeCourse } from './learner-programme'
import { courseIdForLearningState } from './planner-model'
import type { RevSuggestionStep } from './ui'

export type SubjectColour = { name: string; fill: string; text: string }

/** Fixed subject colours from the v2 handoff. Named subjects keep theirs; new subjects take the next free one in turn. */
const subjectPalette: readonly SubjectColour[] = [
  { name: 'business', fill: '#2bb6a3', text: '#0f2f36' },
  { name: 'biology', fill: '#ff7a59', text: '#3a130a' },
  { name: 'psychology', fill: '#7b6cf6', text: '#ffffff' },
  { name: 'maths', fill: '#ffc53d', text: '#3d2b00' },
]

export function assignSubjectColours(subjectIds: readonly string[]): Map<string, SubjectColour> {
  const result = new Map<string, SubjectColour>()
  const used = new Set<string>()
  const unique = [...new Set(subjectIds)]
  unique.forEach((id) => {
    const named = subjectPalette.find((colour) => colour.name === id.trim().toLocaleLowerCase())
    if (named) { result.set(id, named); used.add(named.name) }
  })
  let next = 0
  unique.forEach((id) => {
    if (result.has(id)) return
    const free = subjectPalette.filter((colour) => !used.has(colour.name))
    const pool = free.length > 0 ? free : subjectPalette
    const colour = pool[next % pool.length]
    next += 1
    result.set(id, colour)
    used.add(colour.name)
  })
  return result
}

export type HomeCourseTile = {
  courseId: string
  subjectName: string
  initials: string
  colour: SubjectColour
  /** 0–100, or null when there is not yet enough evidence for a score. */
  mastery: number | null
}

/** One letter per subject, or two when another subject shares the first letter (B / Bi, like the v2 design). */
export function subjectInitials(names: readonly string[]): string[] {
  const firstLetters = names.map((name) => name.trim().charAt(0).toLocaleUpperCase())
  return names.map((raw, index) => {
    const name = raw.trim()
    const shared = firstLetters.filter((letter) => letter === firstLetters[index]).length > 1
    return `${name.charAt(0).toLocaleUpperCase()}${shared ? name.charAt(1).toLocaleLowerCase() : ''}`
  })
}

export function buildCourseTiles(programme: readonly LearnerProgrammeCourse[], states: readonly ModuleLearningState[]): HomeCourseTile[] {
  const colours = assignSubjectColours(programme.map((item) => item.subject.id))
  const initialsList = subjectInitials(programme.map(({ subject }) => subject.name))
  return programme.map(({ course, subject }, index) => {
    const initials = initialsList[index]
    const scored = states.filter((state) => courseIdForLearningState(state) === course.id && state.readiness.score !== null)
    const mastery = scored.length === 0
      ? null
      : Math.round(scored.reduce((sum, state) => sum + (state.readiness.score ?? 0), 0) / scored.length)
    return {
      courseId: course.id,
      subjectName: subject.name,
      initials,
      colour: colours.get(subject.id) ?? subjectPalette[0],
      mastery,
    }
  })
}

export type NextExam = { title: string; daysAway: number; dateLabel: string }

function startOfDay(date: Date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
}

export function nextExam(assessments: readonly RevisionAssessment[], now: Date): NextExam | null {
  const today = startOfDay(now)
  const upcoming = assessments
    .filter((item) => item.isActive)
    .map((item) => ({ item, date: new Date(`${item.assessmentDate}T12:00:00`) }))
    .filter(({ date }) => !Number.isNaN(date.getTime()) && startOfDay(date) >= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0]
  if (!upcoming) return null
  return {
    title: upcoming.item.title,
    daysAway: Math.round((startOfDay(upcoming.date) - today) / 86_400_000),
    dateLabel: upcoming.date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
  }
}

/** Today's planned tasks shown as the REV session list: the first is up next, the rest follow. */
export function sessionSteps(tasks: readonly HomeTask[]): RevSuggestionStep[] {
  return tasks.slice(0, 3).map((task, index) => ({
    id: task.id,
    label: `${homeActivityLabel(task.activityType)} · ${task.topicLabel}`,
    meta: `${task.estimatedMinutes} min`,
    state: index === 0 ? 'current' : 'upcoming',
  }))
}
