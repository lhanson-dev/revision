import { evidencePercentage } from '../engine/evidence/evidence'
import type { ModuleLearningState } from './catalogue-model'
import type {
  RevisionAssessment,
  RevisionAvailabilityException,
  RevisionAvailabilityProfile,
  RevisionPlanningPreference,
} from '../services/planning/planner-service'
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

function learnerPreferenceForCandidate(
  preferences: readonly RevisionPlanningPreference[],
  subjectId: string,
  activityType: string,
  now: Date,
): -1 | 0 | 1 | 2 | 3 {
  const today = localDate(now)
  let subjectPreference = 0
  let activityPreference = 0

  for (const preference of preferences) {
    if (!preference.isActive || preference.startsOn > today || preference.endsOn < today) continue
    if (preference.preferenceType === 'prefer_subject' && preference.subjectId === subjectId) {
      subjectPreference = Math.max(subjectPreference, preference.strength)
    }
    if (preference.preferenceType === 'reduce_subject' && preference.subjectId === subjectId) {
      subjectPreference = -1
    }
    if (preference.preferenceType === 'prefer_activity' && preference.activityType === activityType) {
      activityPreference = Math.max(activityPreference, preference.strength)
    }
  }

  if (subjectPreference === -1) return -1
  return Math.max(subjectPreference, activityPreference) as 0 | 1 | 2 | 3
}

function topicEvidenceSummary(state: ModuleLearningState, topicId: string) {
  const evidence = state.evidence.filter((item) => item.topicId === topicId)
  const percentages = evidence.map(evidencePercentage).filter((value): value is number => value !== null)
  const understanding = percentages.length === 0
    ? null
    : percentages.reduce((sum, value) => sum + value, 0) / percentages.length / 100
  const evidenceStrength = Math.min(1, evidence.length / 4)
  return { evidence, understanding, evidenceStrength }
}

function activityForTopic(state: ModuleLearningState, topicId: string, daysUntilAssessment: number, understanding: number | null) {
  if (state.recommendation?.topicId === topicId) return state.recommendation.activity
  const hasQuickCheck = state.adapter.listQuestions(topicId).length > 0
  const hasFlashcards = state.adapter.listFlashcards(topicId).length > 0

  if (daysUntilAssessment <= 21 && understanding !== null && understanding >= 0.55) return 'exam-question'
  if (hasQuickCheck) return 'quick-check'
  if (hasFlashcards) return 'flashcards'
  return 'quick-check'
}

function scopeTopicIds(assessment: RevisionAssessment, state: ModuleLearningState) {
  const explicitTopicIds = Array.isArray(assessment.scope.topicIds)
    ? assessment.scope.topicIds.filter((value): value is string => typeof value === 'string')
    : []
  const available = new Set(state.adapter.listTopics().map((topic) => topic.id))
  const validExplicit = explicitTopicIds.filter((topicId) => available.has(topicId))
  return validExplicit.length > 0 ? validExplicit : [...available]
}

export function plannerCandidatesFromLearningState(
  states: readonly ModuleLearningState[],
  assessments: readonly RevisionAssessment[],
  preferences: readonly RevisionPlanningPreference[] = [],
  now = new Date(),
): PlannerCandidate[] {
  return assessments.flatMap((assessment) => {
    const daysUntilAssessment = dayDifference(now, assessment.assessmentDate)
    if (daysUntilAssessment < 0 || !assessment.isActive) return []

    const state = stateForAssessment(states, assessment)
    if (!state) return []
    const topicIds = scopeTopicIds(assessment, state)
    const courseCoverage = state.topicCount === 0 ? 1 : state.evidencedTopics / state.topicCount

    return topicIds.map((topicId) => {
      const summary = topicEvidenceSummary(state, topicId)
      const activityType = activityForTopic(state, topicId, daysUntilAssessment, summary.understanding)
      const topicCoverage = summary.evidence.length > 0 ? 1 : 0
      const evidenceStrength = summary.evidence.length === 0
        ? Math.min(0.2, confidenceStrength(state.readiness.confidence))
        : Math.max(summary.evidenceStrength, confidenceStrength(state.readiness.confidence) * 0.5)

      return {
        id: `${assessment.assessmentId}:${topicId}:${activityType}`,
        subjectId: assessment.subjectId,
        assessmentId: assessment.assessmentId,
        topicId,
        activityType,
        estimatedMinutes: estimatedMinutes(activityType),
        daysUntilAssessment,
        assessmentImportance: assessment.relativeImportance,
        coverage: Math.min(topicCoverage, courseCoverage + 0.4),
        evidenceStrength,
        understanding: summary.understanding,
        readiness: state.readiness.score === null ? null : state.readiness.score / 100,
        examWeight: null,
        learnerPreference: learnerPreferenceForCandidate(preferences, assessment.subjectId, activityType, now),
        recentlyCompleted: recentlyCompletedTopic(state, topicId, now),
      } satisfies PlannerCandidate
    })
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
  preferences: readonly RevisionPlanningPreference[] = [],
  now = new Date(),
): PlannerResult | null {
  const candidates = plannerCandidatesFromLearningState(states, assessments, preferences, now)
  const days = plannerDaysFromAvailability(availability, exceptions, assessments, now)
  if (candidates.length === 0 || days.length === 0) return null
  return buildAdaptivePlan(candidates, days)
}
