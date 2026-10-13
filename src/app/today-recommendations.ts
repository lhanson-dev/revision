import { buildAdaptivePlan, type PlannerCandidate } from '../engine/planning/planning'
import type { RevisionAssessment, RevisionPlanningPreference } from '../services/planning/planner-service'
import type { ModuleLearningState } from './catalogue-model'
import type { LearnerProgrammeCourse } from './learner-programme'
import type { PlanDay, PlanItem } from './plan-model'
import { activityForTopic, courseIdForLearningState, exactExamTarget, scopeTopicIds, plannerCandidatesFromLearningState } from './planner-model'
import { subjectAccentKey } from './subject-accents'
import { homeActivityLabel, tasksFromPlanner, type HomeTask } from './home-task'
import type { NotNowRecord } from './rev-suggestions'
import { activeNotNow, dayKey } from './rev-suggestions'

/** Accepted commitments have no clock slot: order by creation then stable ID, before the derived engine order. */
export function taskForTodayRow(row: PlanItem, states: readonly ModuleLearningState[], programme: readonly LearnerProgrammeCourse[]): HomeTask | null {
  if (row.kind === 'exam' || row.kind === 'session' && row.done) return null
  if (row.kind === 'suggested') return tasksFromPlanner([row.item], states, programme)[0] ?? null
  const session = row.session
  const state = states.find((s) => courseIdForLearningState(s) === session.courseId && s.adapter.getTopic(session.topicId))
  const entry = programme.find((p) => p.course.id === session.courseId)
  if (!state || !entry) return null
  // Legacy accepted sessions store a broad activity, not a question/card. Resolve a supported
  // immediate activity honestly; never pretend an absent exact identity was persisted.
  let examTarget = session.activityType === 'exam_prep' ? exactExamTarget(state, session.topicId) : undefined
  if (session.activityType === 'exam_prep' && session.recommendationId?.includes(':exam-question:')) {
    examTarget = undefined
    for (const adapter of state.course?.modules ?? [state.adapter]) for (const exam of adapter.listExams()) {
      if (exam.restrictedPilot || adapter.manifest.status !== 'available') continue
      const question = exam.questions.find((q) => q.topic === session.topicId && session.recommendationId?.endsWith(`:${adapter.manifest.id}:${q.id}`))
      if (question) examTarget = { moduleId: adapter.manifest.id, examId: exam.id, questionId: question.id }
    }
  }
  const activity = session.activityType === 'learn' ? 'learn' : session.activityType === 'exam_prep' ? examTarget ? 'exam-question' : null :
    session.recommendationId?.endsWith(':flashcards') && state.adapter.listFlashcards(session.topicId).length ? 'flashcards' :
      state.adapter.listQuestions(session.topicId).length ? 'quick-check' : state.adapter.listFlashcards(session.topicId).length ? 'flashcards' : null
  if (!activity) return null
  return {
    id: row.key, sessionId: session.sessionId, source: 'planner', courseId: session.courseId,
    courseLabel: entry.label, subjectId: entry.subject.id, subjectName: entry.subject.name,
    subjectAccent: subjectAccentKey(entry.subject.id),
    topicId: session.topicId, topicLabel: row.topic, activityType: activity,
    estimatedMinutes: session.minutes, reason: 'You chose this session for today.', adapter: state.adapter, examTarget,
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
      assessmentId: '', topicId: topic.id, activityType, estimatedMinutes: activityType === 'exam-question' ? 30 : activityType === 'quick-check' ? 20 : 15,
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
  const tasks = rows.flatMap((row) => taskForTodayRow(row, states, programme) ?? [])
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
