import { buildAdaptivePlan, type PlannerCandidate } from '../engine/planning/planning'
import type { RevisionAssessment, RevisionPlanningPreference } from '../services/planning/planner-service'
import type { ModuleLearningState } from './catalogue-model'
import type { LearnerProgrammeCourse } from './learner-programme'
import type { PlanDay, PlanItem } from './plan-model'
import { activityForTopic, courseIdForLearningState, exactExamTarget, scopeTopicIds, plannerCandidatesFromLearningState } from './planner-model'
import { learnerCourseRoute, learnerModuleRoute, routeHash } from './navigation'
import { stateForAssessment } from './planner-model'
import { subjectAccentKey } from './subject-accents'
import { homeActivityLabel, tasksFromPlanner, type HomeTask } from './home-task'
import { focusedActivityMinutes } from './focused-activity-dose'
import type { NotNowRecord } from './rev-suggestions'
import { activeNotNow, dayKey } from './rev-suggestions'

/** Accepted commitments have no clock slot: order by creation then stable ID, before the derived engine order. */
export function taskForTodayRow(row: PlanItem, states: readonly ModuleLearningState[], programme: readonly LearnerProgrammeCourse[], assessments: readonly RevisionAssessment[] = [], dateKey?: string): HomeTask | null {
  if (row.kind === 'exam' || row.kind === 'session' && row.done) return null
  if (row.kind === 'suggested') return tasksFromPlanner([row.item], states, programme)[0] ?? null
  const session = row.session
  const matches = states.filter((s) => courseIdForLearningState(s) === session.courseId && s.adapter.getTopic(session.topicId))
  const state = matches.length === 1 ? matches[0] : null
  const entry = programme.find((p) => p.course.id === session.courseId)
  if (!state || !entry) return null
  // Legacy accepted sessions store a broad activity, not a question/card. Resolve a supported
  // immediate activity honestly; never pretend an absent exact identity was persisted.
  // A broad Exam Prep booking cannot prove a selected paper/question. Never substitute one.
  let examTarget: HomeTask['examTarget']
  if (session.activityType === 'exam_prep' && session.recommendationId?.includes(':exam-question:')) {
    const targets: NonNullable<HomeTask['examTarget']>[] = []
    for (const adapter of state.course?.modules ?? [state.adapter]) for (const exam of adapter.listExams()) {
      if (exam.restrictedPilot || adapter.manifest.status !== 'available') continue
      const question = exam.questions.find((q) => q.topic === session.topicId && session.recommendationId?.endsWith(`:${adapter.manifest.id}:${q.id}`))
      const eligible = dateKey && assessments.some((assessment) => assessment.isActive && assessment.assessmentDate > dateKey &&
        assessment.moduleId === adapter.manifest.id && stateForAssessment(states, assessment) === state && scopeTopicIds(assessment, state).includes(session.topicId))
      if (question && eligible) targets.push({ moduleId: adapter.manifest.id, examId: exam.id, questionId: question.id })
    }
    if (targets.length === 1) examTarget = targets[0]
  }
  const learnPage = session.activityType === 'learn' ? state.adapter.listLearnChapters()
    .flatMap((chapter) => chapter.groups.flatMap((group) => group.pages))
    .find((page) => page.topicId === session.topicId && state.adapter.getLearnPage(page.id)) : undefined
  const learnTarget = learnPage ? { learnPageId: learnPage.id, moduleId: state.course?.sharedLearning ? undefined : state.adapter.manifest.id } : undefined
  const activity = session.activityType === 'learn' ? learnTarget ? 'learn' : null : session.activityType === 'exam_prep' ? examTarget ? 'exam-question' : null :
    session.recommendationId?.endsWith(':flashcards') && state.adapter.listFlashcards(session.topicId).length ? 'flashcards' :
      state.adapter.listQuestions(session.topicId).length ? 'quick-check' : state.adapter.listFlashcards(session.topicId).length ? 'flashcards' : null
  if (!activity) return null
  return {
    id: row.key, sessionId: session.sessionId, source: 'planner', courseId: session.courseId,
    courseLabel: entry.label, subjectId: entry.subject.id, subjectName: entry.subject.name,
    subjectAccent: subjectAccentKey(entry.subject.id),
    topicId: session.topicId, topicLabel: row.topic, activityType: activity,
    estimatedMinutes: session.minutes, reason: 'You chose this session for today.', adapter: state.adapter, examTarget, learnTarget,
  }
}

/** Missing setup only. The same engine ranks real supported intents, without a fabricated assessment or calendar. */
function immediateTasks(states: readonly ModuleLearningState[], programme: readonly LearnerProgrammeCourse[], now: Date, assessments: readonly RevisionAssessment[], preferences: readonly RevisionPlanningPreference[]): HomeTask[] {
  const candidates: PlannerCandidate[] = assessments.length ? plannerCandidatesFromLearningState(states, assessments, preferences, now) : states.flatMap((state) => state.adapter.listTopics().filter((topic) => scopeTopicIds({ scope: {}, moduleId: null }, state).includes(topic.id)).flatMap((topic) => {
    const evidence = state.topicKnowledge.topics.find((t) => t.topicId === topic.id)
    const activityType = activityForTopic(state, topic.id, Infinity, evidence?.score == null ? null : evidence.score / 100)
    if (!activityType) return []
    const courseId = courseIdForLearningState(state)
    return [{ id: `${courseId}:${topic.id}:${activityType}`, subjectId: state.adapter.manifest.subject.id, courseId,
      assessmentId: '', topicId: topic.id, activityType, estimatedMinutes: activityType === 'exam-question' ? 30 : activityType === 'quick-check'
        ? focusedActivityMinutes('quick-check', state.adapter.listQuestions(topic.id).length)
        : focusedActivityMinutes('flashcards', state.adapter.listFlashcards(topic.id).length),
      daysUntilAssessment: Infinity, assessmentImportance: 'normal' as const,
      coverage: state.evidence.some((e) => e.topicId === topic.id) ? 1 : 0,
      evidenceStrength: Math.min(1, state.evidence.filter((e) => e.topicId === topic.id).length / 4),
      understanding: evidence?.score == null ? null : evidence.score / 100, readiness: null, examWeight: null,
      learnerPreference: 0 as const, recentlyCompleted: false,
      examTarget: activityType === 'exam-question' ? exactExamTarget(state, topic.id) : undefined }]
  }))
  // This is an adapter to the existing ranking, not a second priority policy. The transient
  // allocation is never exposed as a learner calendar or capacity.
  return tasksFromPlanner(buildAdaptivePlan(candidates, [{ date: dayKey(now), availableMinutes: Number.MAX_SAFE_INTEGER }]).today, states, programme)
    .map((task) => ({ ...task, source: 'fallback', plannerItem: undefined,
      reason: 'This is supported practice from your current course evidence. It is not scheduled.' }))
}

export function todayRecommendations(day: PlanDay | null, states: readonly ModuleLearningState[], programme: readonly LearnerProgrammeCourse[], missingSetup: boolean, trustworthy: boolean, now: Date, notNow: NotNowRecord | null = null, assessments: readonly RevisionAssessment[] = [], preferences: readonly RevisionPlanningPreference[] = []) {
  if (!trustworthy || day && day.key !== dayKey(now)) return []
  const sessions = day?.items.filter((row) => row.kind === 'session').sort((a, b) => {
    if (a.kind !== 'session' || b.kind !== 'session') return 0
    return a.session.createdAt.localeCompare(b.session.createdAt) || a.key.localeCompare(b.key)
  }) ?? []
  const rows = [...sessions, ...day?.items.filter((row) => row.kind === 'suggested') ?? []]
  const tasks = rows.flatMap((row) => taskForTodayRow(row, states, programme, assessments, day?.key) ?? [])
  const choices = tasks.length || !missingSetup || day && (day.studyCount > 0 || day.rest) ? tasks : immediateTasks(states, programme, now, assessments, preferences)
  const hidden = activeNotNow(notNow, now)
  return choices.filter((task) => !hidden.includes(task.id) && !hidden.includes(`${task.courseId}:${task.topicId}`))
}

export function recommendationExplanation(task: HomeTask | null) {
  return task ? `I’d start with ${task.topicLabel} — ${homeActivityLabel(task.activityType)} in ${task.courseLabel}. ${task.reason}` : 'There’s no recommended activity to start just now. You can open Plan or choose your own work in Courses.'
}

export function readTodayChoice(userId: string): NotNowRecord | null {
  try {
    const value = JSON.parse(window.sessionStorage.getItem('revision.home.not-now.' + userId) ?? 'null') as NotNowRecord | null
    return value && typeof value.day === 'string' && Array.isArray(value.keys) && value.keys.every((key) => typeof key === 'string') ? value : null
  } catch { return null }
}

/** All three Today surfaces use the canonical Learn page contract, including component context. */
export function learnRouteForTask(task: HomeTask): string | null {
  const target = task.learnTarget
  if (task.activityType !== 'learn' || !target || !task.adapter.getLearnPage(target.learnPageId)) return null
  return routeHash(target.moduleId ? learnerModuleRoute(task.courseId, target.moduleId, 'learn', target)
    : learnerCourseRoute(task.courseId, 'learn', target))
}

export const ACCEPTED_ACTIVITY_UNAVAILABLE = 'Your session has been kept, but its exact learning page or exam paper/question cannot be verified. Open the course to choose the activity you intended.'
