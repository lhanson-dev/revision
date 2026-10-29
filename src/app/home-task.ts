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
import { focusedActivityMinutes } from './focused-activity-dose'
import { authoredSkillQuestions } from './skill-recheck'
import { objectiveItemMappingForPractice } from './practice-questions'
import type { ObjectiveItemMapping } from '../engine/evidence/evidence'

export type HomeActivityType = 'flashcards' | 'quick-check' | 'exam-question' | 'learn'

export type HomeTask = {
  id: string
  source: 'planner' | 'fallback' | 'rules'
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
  learnTarget?: { learnPageId: string; moduleId?: string }
  retrievalContentIds?: readonly string[]
  targetedQuestionIds?: readonly string[]
  skillFocus?: PlannerItem['skillFocus']
  sessionId?: string
  examTarget?: PlannerItem['examTarget']
  plannerItem?: PlannerItem
}

/** Resolve exactly the authored retrieval selected by the one programme decision.
 * A missing card is not replaced by an unrelated card: the focused activity
 * correctly reports unavailable content rather than corrupting the evidence.
 */
export function authoredFlashcardsForTask(task: HomeTask) {
  const available = task.adapter.listFlashcards(task.topicId)
  if (!task.retrievalContentIds) return available
  const byId = new Map(available.map((card) => [card.id, card]))
  return task.retrievalContentIds.flatMap((id) => byId.get(id) ?? [])
}

/** Exact skill-specific checks never silently fall back to unrelated questions.
 * A plain course-pack question is still valid *topic* practice, not proof of
 * the specifically tagged specification item.
 */
export function authoredQuestionsForTask(task: HomeTask): Array<{
  id: string; topic: string; prompt: string; options: string[]; correctOption: number;
  explanation: string; itemMapping?: ObjectiveItemMapping
}> {
  if (!task.targetedQuestionIds) return [...task.adapter.listQuestions(task.topicId)]
  if (!task.skillFocus || task.targetedQuestionIds.length !== 1) return []
  const questions = new Map(authoredSkillQuestions(task.adapter, task.topicId).map((question) => [question.id, question]))
  return task.targetedQuestionIds.flatMap((id) => {
    const question = questions.get(id)
    const mapping = question && objectiveItemMappingForPractice(question)
    if (!question || !mapping || mapping.singleTargetSpecItemId !== task.skillFocus?.specItemId) return []
    return [{
      id: question.id, topic: question.topicId, prompt: question.prompt,
      options: question.options.map((option) => option.text), correctOption: question.correctOption,
      explanation: question.explanation, itemMapping: mapping,
    }]
  })
}

/** Supported Practice can differ from the learner's accepted booking. */
export function supportedActivityMinutes(task: HomeTask): number {
  if (task.activityType === 'quick-check') return focusedActivityMinutes('quick-check', authoredQuestionsForTask(task).length)
  if (task.activityType === 'flashcards') return focusedActivityMinutes('flashcards', task.retrievalContentIds?.length ?? task.adapter.listFlashcards(task.topicId).length)
  return task.estimatedMinutes
}

export function homeActivityLabel(activity: HomeActivityType) {
  if (activity === 'learn') return 'Learn'
  if (activity === 'flashcards') return 'Flashcards'
  if (activity === 'quick-check') return 'Practice question'
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
  return activity === 'flashcards' || activity === 'quick-check' || activity === 'exam-question' || activity === 'learn'
}

function programmeCourse(programme: readonly LearnerProgrammeCourse[], courseId: string) {
  return programme.find((item) => item.course.id === courseId) ?? null
}

function stateForPlannerItem(states: readonly ModuleLearningState[], item: PlannerItem) {
  return states.find((state) => {
    if (item.courseId && courseIdForLearningState(state) !== item.courseId) return false
    if (item.moduleId && state.adapter.manifest.id !== item.moduleId) return false
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
      reason: item.preparationPurpose && item.preparationReason
        ? `${item.preparationPurpose}. ${item.preparationReason}`
        : reason ? `This comes first because ${plannerReasonLabel(reason)}.`
          : 'This is the strongest next step from your current plan and evidence.',
      adapter: state.adapter,
      plannerItem: item,
      examTarget: item.examTarget,
      learnTarget: item.learnTarget,
      retrievalContentIds: item.retrievalContentIds,
      targetedQuestionIds: item.targetedQuestionIds,
      skillFocus: item.skillFocus,
    }]
  })
}

export function fallbackMinutes(activity: HomeActivityType, available = 0) {
  if (activity === 'exam-question') return 30
  if (activity === 'learn') return 15
  if (activity === 'quick-check' || activity === 'flashcards') return focusedActivityMinutes(activity, available)
  return 0
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
      estimatedMinutes: fallbackMinutes(recommendation.activity, recommendation.activity === 'quick-check'
        ? state.adapter.listQuestions(recommendation.topicId).length
        : recommendation.activity === 'flashcards' ? state.adapter.listFlashcards(recommendation.topicId).length : 0),
      reason: recommendation.reason || globalRecommendationReason(state, states),
      adapter: state.adapter,
    })
  }

  return result
}
