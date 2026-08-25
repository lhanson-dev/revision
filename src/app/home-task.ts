import type { LearningContentAdapter } from '../engine/content/content-adapter'
import type { PlannerItem, PlannerReasonCode } from '../engine/planning/planning'
import {
  chooseRecommendedModule,
  globalRecommendationReason,
  type ModuleLearningState,
} from './catalogue-model'
import { courseIdForLearningState } from './planner-model'
import type { LearnerProgrammeCourse } from './learner-programme'
import { subjectAccentKey, type SubjectAccentKey } from './subject-accents'

export type HomeActivityType = 'flashcards' | 'quick-check' | 'exam-question'

export type HomeTask = {
  id: string
  source: 'planner' | 'fallback'
  courseId: string
  courseLabel: string
  subjectId: string
  subjectName: string
  subjectAccent: SubjectAccentKey
  topicId: string
  topicLabel: string
  activityType: HomeActivityType
  estimatedMinutes: number
  reason: string
  adapter: LearningContentAdapter
  plannerItem?: PlannerItem
}

export function homeActivityLabel(activity: HomeActivityType) {
  if (activity === 'flashcards') return 'Flashcards'
  if (activity === 'quick-check') return 'Quick check'
  return 'Exam practice'
}

export function plannerReasonLabel(reason: PlannerReasonCode) {
  switch (reason) {
    case 'ASSESSMENT_SOON': return 'the assessment is getting closer'
    case 'HIGH_IMPORTANCE_ASSESSMENT': return 'this is one of your higher-priority assessments'
    case 'LOW_EVIDENCE': return 'Revision does not have much evidence in this area yet'
    case 'WEAK_EVIDENCE': return 'recent evidence suggests this needs more work'
    case 'UNDER_COVERED': return 'this area has less evidence coverage'
    case 'EXAM_PRACTICE_DUE': return 'exam-style practice is becoming more useful now'
    case 'HIGH_MARK_OPPORTUNITY': return 'this has a larger known mark opportunity'
    case 'ALREADY_STRONG': return 'you already have stronger evidence here'
    case 'LEARNER_PRIORITY': return 'you asked Revision to give this more attention'
    case 'COMPETING_PRIORITY': return 'Revision is balancing this with another important priority'
    case 'CAPACITY_CONSTRAINED': return 'available time is tight, so Revision is focusing on the highest-value work'
  }
}

function supportedActivity(activity: string): activity is HomeActivityType {
  return activity === 'flashcards' || activity === 'quick-check' || activity === 'exam-question'
}

function programmeCourse(programme: readonly LearnerProgrammeCourse[], courseId: string) {
  return programme.find((item) => item.course.id === courseId) ?? null
}

function stateForPlannerItem(states: readonly ModuleLearningState[], item: PlannerItem) {
  return states.find((state) => {
    if (item.courseId && courseIdForLearningState(state) !== item.courseId) return false
    return Boolean(state.adapter.getTopic(item.topicId))
  }) ?? null
}

export function tasksFromPlanner(
  items: readonly PlannerItem[],
  states: readonly ModuleLearningState[],
  programme: readonly LearnerProgrammeCourse[],
): HomeTask[] {
  return items.flatMap((item) => {
    if (!item.courseId || !supportedActivity(item.activityType)) return []
    const state = stateForPlannerItem(states, item)
    const course = programmeCourse(programme, item.courseId)
    const topic = state?.adapter.getTopic(item.topicId)
    if (!state || !course || !topic) return []
    const reason = item.reasons.find((value) => value !== 'CAPACITY_CONSTRAINED' && value !== 'ALREADY_STRONG')
      ?? item.reasons[0]
    return [{
      id: item.recommendationId,
      source: 'planner' as const,
      courseId: course.course.id,
      courseLabel: course.label,
      subjectId: course.subject.id,
      subjectName: course.subject.name,
      subjectAccent: subjectAccentKey(course.subject.id),
      topicId: item.topicId,
      topicLabel: topic.shortTitle,
      activityType: item.activityType,
      estimatedMinutes: item.estimatedMinutes,
      reason: reason ? `This comes first because ${plannerReasonLabel(reason)}.` : 'This is the strongest next step from your current plan and evidence.',
      adapter: state.adapter,
      plannerItem: item,
    }]
  })
}

function fallbackMinutes(activity: HomeActivityType) {
  if (activity === 'exam-question') return 30
  if (activity === 'quick-check') return 20
  return 15
}

export function fallbackHomeTasks(
  states: readonly ModuleLearningState[],
  programme: readonly LearnerProgrammeCourse[],
  limit = 3,
): HomeTask[] {
  const remaining = [...states]
  const result: HomeTask[] = []

  while (remaining.length > 0 && result.length < limit) {
    const state = chooseRecommendedModule(remaining)
    if (!state) break
    const index = remaining.indexOf(state)
    if (index >= 0) remaining.splice(index, 1)

    const recommendation = state.recommendation
    if (!recommendation || !supportedActivity(recommendation.activity)) continue
    const courseId = courseIdForLearningState(state)
    const course = programmeCourse(programme, courseId)
    const topic = state.adapter.getTopic(recommendation.topicId)
    if (!course || !topic) continue

    result.push({
      id: `home-fallback:${courseId}:${recommendation.topicId}:${recommendation.activity}`,
      source: 'fallback',
      courseId,
      courseLabel: course.label,
      subjectId: course.subject.id,
      subjectName: course.subject.name,
      subjectAccent: subjectAccentKey(course.subject.id),
      topicId: recommendation.topicId,
      topicLabel: topic.shortTitle,
      activityType: recommendation.activity,
      estimatedMinutes: fallbackMinutes(recommendation.activity),
      reason: recommendation.reason || globalRecommendationReason(state, states),
      adapter: state.adapter,
    })
  }

  return result
}
