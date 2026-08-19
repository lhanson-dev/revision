import type { ModuleLearningState } from './catalogue-model'
import type { RevisionAssessment, RevisionAvailabilityException, RevisionAvailabilityProfile } from '../services/planning/planner-service'
import { buildAdaptivePlan, type PlannerCandidate, type PlannerDay, type PlannerResult } from '../engine/planning/planning'

function confidenceStrength(confidence: ModuleLearningState['readiness']['confidence']) {
  if (confidence === 'high') return 1
  if (confidence === 'medium') return 0.75
  if (confidence === 'low') return 0.5
  return 0.2
}

function estimatedMinutes(activity: string) {
  if (activity === 'exam-question') return 30
  if (activity === 'quick-check') return 20
  return 15
}

function localDate(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function dayDifference(from: Date, toDate: string) {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime()
  const target = new Date(`${toDate}T00:00:00`).getTime()
  return Math.ceil((target - start) / 86_400_000)
}

function stateForAssessment(states: readonly ModuleLearningState[], assessment: RevisionAssessment) {
  return states.find((state) => {
    if (state.adapter.manifest.subject.id !== assessment.subjectId) return false
    if (assessment.courseId && state.course?.id === assessment.courseId) return true
    if (assessment.moduleId && state.adapter.manifest.id === assessment.moduleId) return true
    return !assessment.courseId && !assessment.moduleId
  }) ?? states.find((state) => state.adapter.manifest.subject.id === assessment.subjectId)
}

function recentlyCompletedTopic(state: ModuleLearningState, topicId: string, now: Date) {
  const cutoff = now.getTime() - (2 * 86_400_000)
  return state.evidence.some((item) => item.topicId === topicId && new Date(item.occurredAt).getTime() >= cutoff)
}

export function plannerCandidatesFromLearningState(
  states: readonly ModuleLearningState[],
  assessments: readonly RevisionAssessment[],
  now = new Date(),
): PlannerCandidate[] {
  return assessments.flatMap((assessment) => {
    const daysUntilAssessment = dayDifference(now, assessment.assessmentDate)
    if (daysUntilAssessment < 0 || !assessment.isActive) return []

    const state = stateForAssessment(states, assessment)
    if (!state?.recommendation || !state.recommendationTopic) return []

    const recommendation = state.recommendation
    const coverage = state.topicCount === 0 ? 1 : state.evidencedTopics / state.topicCount

    return [{
      id: `${assessment.assessmentId}:${recommendation.topicId}:${recommendation.activity}`,
      subjectId: assessment.subjectId,
      assessmentId: assessment.assessmentId,
      topicId: recommendation.topicId,
      activityType: recommendation.activity,
      estimatedMinutes: estimatedMinutes(recommendation.activity),
      daysUntilAssessment,
      assessmentImportance: assessment.relativeImportance,
      coverage,
      evidenceStrength: confidenceStrength(state.readiness.confidence),
      understanding: null,
      readiness: state.readiness.score === null ? null : state.readiness.score / 100,
      examWeight: null,
      learnerPreference: 0,
      recentlyCompleted: recentlyCompletedTopic(state, recommendation.topicId, now),
    } satisfies PlannerCandidate]
  })
}

export function plannerDaysFromAvailability(
  availability: RevisionAvailabilityProfile | null,
  exceptions: readonly RevisionAvailabilityException[],
  assessments: readonly RevisionAssessment[],
  now = new Date(),
): PlannerDay[] {
  if (!availability) return []
  const furthestRelevant = assessments.reduce((max, assessment) => {
    if (!assessment.isActive) return max
    return Math.max(max, Math.max(0, dayDifference(now, assessment.assessmentDate)))
  }, 0)
  const horizon = Math.min(60, Math.max(1, furthestRelevant + 1))
  const overrideByDate = new Map(exceptions.map((item) => [item.localDate, item.availableMinutes]))

  return Array.from({ length: horizon }, (_, offset) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset)
    const dateKey = localDate(date)
    const overridden = overrideByDate.get(dateKey)
    const weekend = date.getDay() === 0 || date.getDay() === 6
    return {
      date: dateKey,
      availableMinutes: overridden ?? (weekend ? availability.weekendMinutes : availability.weekdayMinutes),
    }
  })
}

export function buildPlannerSnapshot(
  states: readonly ModuleLearningState[],
  assessments: readonly RevisionAssessment[],
  availability: RevisionAvailabilityProfile | null,
  exceptions: readonly RevisionAvailabilityException[],
  now = new Date(),
): PlannerResult | null {
  const candidates = plannerCandidatesFromLearningState(states, assessments, now)
  const days = plannerDaysFromAvailability(availability, exceptions, assessments, now)
  if (candidates.length === 0 || days.length === 0) return null
  return buildAdaptivePlan(candidates, days)
}
