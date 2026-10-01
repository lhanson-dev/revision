import type { RevisionAssessment } from '../services/planning/planner-service'
import type { ModuleLearningState } from './catalogue-model'
import type { LearnerProgrammeCourse } from './learner-programme'
import { courseIdForLearningState } from './planner-model'
import { resolveSubjectIdentity, type SubjectHue } from './subject-palette'
import { topicLearningStatus } from './topic-status'
import type { LearningStatus } from './ui'

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

/** One letter per subject, or two when another subject shares the first letter (B / Bi, like the v2 design). */
export function subjectInitials(names: readonly string[]): string[] {
  const firstLetters = names.map((name) => name.trim().charAt(0).toLocaleUpperCase())
  return names.map((raw, index) => {
    const name = raw.trim()
    const shared = firstLetters.filter((letter) => letter === firstLetters[index]).length > 1
    return `${name.charAt(0).toLocaleUpperCase()}${shared ? name.charAt(1).toLocaleLowerCase() : ''}`
  })
}

export type HomeCourseTile = {
  courseId: string
  subjectName: string
  hue: SubjectHue
  mark: string
  /** How many of the course's topics are in each status (Understanding). */
  counts: Partial<Record<LearningStatus, number>>
  /** Topics covered: topics the student has answered something in, out of all topics. */
  covered: number
  total: number
}

export function buildCourseTiles(programme: readonly LearnerProgrammeCourse[], states: readonly ModuleLearningState[]): HomeCourseTile[] {
  return programme.map(({ course, subject }) => {
    const identity = resolveSubjectIdentity(subject.id, subject.name)
    const courseStates = states.filter((state) => courseIdForLearningState(state) === course.id)
    const counts: Partial<Record<LearningStatus, number>> = {}
    courseStates.forEach((state) => {
      state.topicKnowledge.topics.forEach((topic) => {
        const answered = state.evidence.some((item) => item.topicId === topic.topicId)
        const status = topicLearningStatus(topic.band, answered)
        counts[status] = (counts[status] ?? 0) + 1
      })
    })
    return {
      courseId: course.id,
      subjectName: subject.name,
      hue: identity.hue,
      mark: identity.mark,
      counts,
      covered: courseStates.reduce((sum, state) => sum + state.evidencedTopics, 0),
      total: courseStates.reduce((sum, state) => sum + state.topicCount, 0),
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
