import type { PlannerScheduledDay } from '../engine/planning/planning'
import type { RevisionAssessment, RevisionAvailabilityException, RevisionWeeklyAvailability } from '../services/planning/planner-service'
import type { PlannedSession } from '../services/planning/planned-session-service'
import { createPlanDayBuilder, type PlanDay, type PlanSubject } from './plan-model'
import { resolveSubjectIdentity } from './subject-palette'
import { courseIdForLearningState } from './planner-model'
import type { ModuleLearningState } from './catalogue-model'
import type { LearnerProgrammeCourse } from './learner-programme'
import type { HomeTask } from './home-task'
import { sessionActivityForTask } from './accepted-sessions'

/** Same PlanDay builder used by Plan, never a second Home completion algorithm. */
export function homeToday(
  todayKey: string,
  sessions: readonly PlannedSession[],
  schedule: readonly PlannerScheduledDay[],
  assessments: readonly RevisionAssessment[],
  weeklyMinutes: RevisionWeeklyAvailability | null,
  exceptions: readonly RevisionAvailabilityException[],
  programme: readonly LearnerProgrammeCourse[],
  states: readonly ModuleLearningState[],
): PlanDay {
  function subjectFor(courseId: string | null | undefined, subjectId?: string): PlanSubject {
    const course = programme.find((item) => item.course.id === courseId)
      ?? programme.find((item) => item.subject.id === subjectId)
    const name = course?.subject.name ?? subjectId ?? 'Course'
    const id = course?.subject.id ?? subjectId ?? ''
    const { hue, mark } = resolveSubjectIdentity(id, name)
    return { subjectId: id, name, hue, mark }
  }
  return createPlanDayBuilder({
    todayKey,
    sessions,
    schedule,
    assessments,
    weeklyMinutes,
    exceptions,
    subjectForCourse: (courseId) => subjectFor(courseId),
    subjectForItem: (item) => subjectFor(item.courseId, item.subjectId),
    subjectForAssessment: (assessment) => subjectFor(assessment.courseId, assessment.subjectId),
    topicLabel: (courseId, topicId) => states.find((state) =>
      (!courseId || courseIdForLearningState(state) === courseId) && state.adapter.getTopic(topicId)
    )?.adapter.getTopic(topicId)?.shortTitle ?? topicId,
    suggestedActivityLabel: (activity) => activity === 'flashcards' ? 'Flashcards' : activity === 'quick-check' ? 'Quick check' : 'Exam practice',
  })(todayKey)
}

/** Match course, topic AND activity. A matching topic with a different activity is not the hero task. */
export function homeTaskOnToday(task: HomeTask, day: PlanDay): boolean {
  return day.items.some((row) => {
    if (row.kind === 'session') return !row.done &&
      row.session.courseId === task.courseId &&
      row.session.topicId === task.topicId &&
      row.session.activityType === sessionActivityForTask(task.activityType)
    if (row.kind === 'suggested') return row.item.courseId === task.courseId &&
      row.item.topicId === task.topicId && row.item.activityType === task.activityType
    return false
  })
}

export type HomeExam = {
  assessment: RevisionAssessment
  courseId: string
  daysAway: number
  kind: 'mock' | 'public_exam'
}

function utcLocalDate(key: string): number {
  const [year, month, day] = key.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

export function upcomingHomeExams(
  assessments: readonly RevisionAssessment[],
  programme: readonly LearnerProgrammeCourse[],
  now: Date,
): { next: HomeExam | null; mocks: HomeExam[]; officials: HomeExam[] } {
  const current = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const dated: HomeExam[] = assessments.flatMap((assessment) => {
    if (!assessment.isActive || (assessment.assessmentType !== 'mock' && assessment.assessmentType !== 'public_exam')) return []
    const candidates = assessment.courseId
      ? programme.filter((entry) => entry.course.id === assessment.courseId)
      : programme.filter((entry) => entry.subject.id === assessment.subjectId)
    if (candidates.length !== 1) return []
    const when = utcLocalDate(assessment.assessmentDate)
    if (!Number.isFinite(when) || when < current) return []
    return [{ assessment, courseId: candidates[0].course.id,
      daysAway: Math.round((when - current) / 86_400_000),
      kind: assessment.assessmentType }]
  }).sort((a,b) => a.daysAway - b.daysAway || a.assessment.assessmentId.localeCompare(b.assessment.assessmentId))
  const next = dated[0] ?? null
  return {
    next,
    mocks: dated.filter((entry) => entry.kind === 'mock' && entry !== next).slice(0, 3),
    officials: dated.filter((entry) => entry.kind === 'public_exam' && entry !== next),
  }
}
