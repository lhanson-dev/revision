import type { PlannedSession } from '../services/planning/planned-session-service'
import { applyAcceptedSessionsToDays, withoutPlannedTopics } from './accepted-sessions'
import { evidencePercentage } from '../engine/evidence/evidence'
import type { ModuleLearningState } from './catalogue-model'
import type {
  RevisionAssessment,
  RevisionAvailabilityException,
  RevisionAvailabilityProfile,
  RevisionDayOfWeek,
  RevisionPlanningPreference,
} from '../services/planning/planner-service'
import { buildAdaptivePlan, type PlannerCandidate, type PlannerDay, type PlannerResult } from '../engine/planning/planning'
import { examPapersFor } from './exam-prep'
import { validDateKey } from './navigation'

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
  if (!validDateKey(toDate)) return NaN
  const start = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  return Math.round((Date.parse(`${toDate}T00:00:00Z`) - start) / 86_400_000)
}

const weekDayByJsDay: readonly RevisionDayOfWeek[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

export function courseIdForLearningState(state: ModuleLearningState) {
  if (state.course) return state.course.id
  const manifest = state.adapter.manifest
  return `${manifest.examBoard.id}:${manifest.qualification.id}:${manifest.specificationCode}`
}

export function stateForAssessment(states: readonly ModuleLearningState[], assessment: RevisionAssessment) {
  const matches = states.filter((state) => {
    if (state.adapter.manifest.subject.id !== assessment.subjectId) return false
    if (assessment.courseId && courseIdForLearningState(state) !== assessment.courseId) return false
    if (!assessment.moduleId) return true
    return (state.course?.modules ?? [state.adapter]).some((adapter) => adapter.manifest.id === assessment.moduleId)
  })
  // Never select the first component of an ambiguous course or ignore a conflicting module ID.
  return matches.length === 1 ? matches[0] : undefined
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

export function activityForTopic(state: ModuleLearningState, topicId: string, daysUntilAssessment: number, understanding: number | null, moduleId?: string, allowOption = false) {
  if ((state.recommendation?.topicId === topicId && state.recommendation.activity === 'exam-question'
    || daysUntilAssessment <= 21 && understanding !== null && understanding >= 0.55)
    && exactExamTarget(state, topicId, moduleId, allowOption)) return 'exam-question'
  const hasQuickCheck = state.adapter.listQuestions(topicId).length > 0
  const hasFlashcards = state.adapter.listFlashcards(topicId).length > 0
  if (state.recommendation?.topicId === topicId && state.recommendation.activity === 'flashcards' && hasFlashcards) return 'flashcards'
  if (hasQuickCheck) return 'quick-check'
  if (hasFlashcards) return 'flashcards'
  return null
}

/** Published single-question assets only; optional content requires an explicit scoped selection. */
export function exactExamTarget(state: ModuleLearningState, topicId: string, moduleId?: string, allowOption = false) {
  for (const adapter of state.course?.modules ?? [state.adapter]) {
    if (moduleId && adapter.manifest.id !== moduleId || adapter.manifest.status !== 'available') continue
    for (const exam of adapter.listExams()) {
      if (exam.restrictedPilot) continue
      const matches = exam.questions.filter((q) => q.topic === topicId && (allowOption || !q.choiceGroup))
      const question = matches.find((q) => q.marks >= 4) ?? matches[0]
      if (question) return { moduleId: adapter.manifest.id, examId: exam.id, questionId: question.id }
    }
  }
  return undefined
}

export function scopeTopicIds(assessment: Pick<RevisionAssessment, 'scope' | 'moduleId'>, state: ModuleLearningState) {
  if (Object.keys(assessment.scope).some((key) => key !== 'topicIds')) return []
  const explicit = assessment.scope.topicIds
  if (explicit !== undefined && (!Array.isArray(explicit) || explicit.length === 0 || explicit.some((id) => typeof id !== 'string'))) return []
  const modules = state.course?.modules ?? [state.adapter]
  const module = assessment.moduleId ? modules.find((adapter) => adapter.manifest.id === assessment.moduleId) : undefined
  if (assessment.moduleId && !module) return []
  const available = new Set(state.adapter.listTopics().map((topic) => topic.id))
  if (module) {
    const guide = examPapersFor(module.manifest.examBoard.name, module.manifest.specificationCode)
    const paper = guide?.papers.find((item) => item.number === module.manifest.paper.number)
    if (guide && !paper) return []
    // Multi-paper shared packs need an assured mapping; a component's manifest
    // is sufficient only for a standalone/component-specific learning state.
    if (!paper && state.course?.sharedLearning && modules.length > 1) return []
    const mapped = paper?.topics === 'all' ? available : new Set(paper?.topics ?? module.manifest.topicIds)
    for (const id of available) if (!mapped.has(id)) available.delete(id)
  }
  if (explicit && (explicit as string[]).some((id) => !available.has(id))) return []

  // Option metadata belongs to the published exam assets. An explicit topic scope
  // is the only existing selection input; missing or conflicting choices fail closed.
  const optionGroups = new Map<string, Set<string>>()
  for (const adapter of modules) for (const exam of adapter.listExams?.() ?? []) {
    for (const question of exam.questions) {
      if (!question.choiceGroup || !question.choiceOption) continue
      const key = `${adapter.manifest.id}:${question.choiceGroup}`
      const group = optionGroups.get(key) ?? new Set<string>()
      group.add(question.topic)
      optionGroups.set(key, group)
    }
  }
  const selected = new Set(explicit as string[] | undefined)
  for (const group of optionGroups.values()) {
    const choices = [...group].filter((id) => selected.has(id))
    if (choices.length > 1) return []
    for (const id of group) if (!selected.has(id)) available.delete(id)
  }
  return explicit ? [...new Set(explicit as string[])] : [...available]
}

export function plannerCandidatesFromLearningState(
  states: readonly ModuleLearningState[],
  assessments: readonly RevisionAssessment[],
  preferences: readonly RevisionPlanningPreference[] = [],
  now = new Date(),
): PlannerCandidate[] {
  const candidates = assessments.flatMap((assessment) => {
    const daysUntilAssessment = dayDifference(now, assessment.assessmentDate)
    if (!Number.isFinite(daysUntilAssessment) || daysUntilAssessment <= 0 || !assessment.isActive) return []

    const state = stateForAssessment(states, assessment)
    if (!state) return []
    const courseId = courseIdForLearningState(state)
    const topicIds = scopeTopicIds(assessment, state)
    const courseCoverage = state.topicCount === 0 ? 1 : state.evidencedTopics / state.topicCount

    return topicIds.flatMap((topicId) => {
      const summary = topicEvidenceSummary(state, topicId)
      let activityType = activityForTopic(state, topicId, daysUntilAssessment, summary.understanding, assessment.moduleId ?? undefined, Array.isArray(assessment.scope.topicIds))
      const examTarget = activityType === 'exam-question' ? exactExamTarget(state, topicId, assessment.moduleId ?? undefined, Array.isArray(assessment.scope.topicIds)) : undefined
      if (activityType === 'exam-question' && !examTarget) activityType = state.adapter.listQuestions(topicId).length ? 'quick-check' : state.adapter.listFlashcards(topicId).length ? 'flashcards' : null
      if (!activityType) return []
      const topicCoverage = summary.evidence.length > 0 ? 1 : 0
      const evidenceStrength = summary.evidence.length === 0
        ? Math.min(0.2, confidenceStrength(state.readiness.confidence))
        : Math.max(summary.evidenceStrength, confidenceStrength(state.readiness.confidence) * 0.5)

      const shared = state.course?.sharedLearning === true
      const moduleId = shared ? undefined : state.adapter.manifest.id
      const targetModule = assessment.moduleId ? (state.course?.modules ?? [state.adapter]).find((adapter) => adapter.manifest.id === assessment.moduleId) : undefined
      return [{
        id: `${courseId}:${shared ? 'shared' : moduleId}:${topicId}:${activityType}${examTarget ? ':' + examTarget.moduleId + ':' + examTarget.questionId : ''}`,
        examTarget,
        subjectId: assessment.subjectId,
        courseId,
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
        moduleId,
        assessmentTargets: [{
          assessmentId: assessment.assessmentId,
          moduleId: targetModule?.manifest.id,
          paperId: targetModule?.manifest.paper.id,
          assessmentDate: assessment.assessmentDate,
          topicIds,
          daysUntilAssessment,
          assessmentImportance: assessment.relativeImportance,
        }],
      } satisfies PlannerCandidate]
    })
  })
  const obligations = new Map<string, PlannerCandidate>()
  for (const candidate of candidates) {
    const existing = obligations.get(candidate.id)
    if (!existing) obligations.set(candidate.id, candidate)
    else existing.assessmentTargets = [...existing.assessmentTargets ?? [], ...candidate.assessmentTargets ?? []]
  }
  return [...obligations.values()].map((candidate) => {
    const targets = [...candidate.assessmentTargets ?? []].sort((left, right) => left.assessmentDate.localeCompare(right.assessmentDate) || left.assessmentId.localeCompare(right.assessmentId))
    const nearest = targets[0]
    return { ...candidate, assessmentTargets: targets, assessmentId: nearest.assessmentId, daysUntilAssessment: nearest.daysUntilAssessment, assessmentImportance: nearest.assessmentImportance }
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
    if (!assessment.isActive || !validDateKey(assessment.assessmentDate)) return max
    return Math.max(max, Math.max(0, dayDifference(now, assessment.assessmentDate)))
  }, 0)
  const horizon = Math.min(60, Math.max(1, furthestRelevant + 1, 28))
  const overrideByDate = new Map(exceptions.map((item) => [item.localDate, item.availableMinutes]))

  return Array.from({ length: horizon }, (_, offset) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset)
    const dateKey = localDate(date)
    const overridden = overrideByDate.get(dateKey)
    const dayKey = weekDayByJsDay[date.getDay()] ?? 'monday'
    return {
      date: dateKey,
      availableMinutes: overridden ?? availability.weeklyMinutes[dayKey],
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
  acceptedSessions: readonly PlannedSession[] = [],
  detailedHorizonDays = 60,
): PlannerResult | null {
  // Sessions the student accepted are already placed: the derived plan works around them.
  const candidates = withoutPlannedTopics(plannerCandidatesFromLearningState(states, assessments, preferences, now), acceptedSessions)
  // A bounded caller may project fewer concrete days while R1's default stays unchanged.
  // The caller must load accepted sessions for every date in that concrete window.
  const boundedDays = plannerDaysFromAvailability(availability, exceptions, assessments, now)
    .slice(0, Math.max(1, Math.min(60, detailedHorizonDays)))
  const days = applyAcceptedSessionsToDays(boundedDays, acceptedSessions)
  if (candidates.length === 0 || days.length === 0) return null
  return buildAdaptivePlan(candidates, days)
}
