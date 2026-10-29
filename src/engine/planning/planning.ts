import { MEDIUM_SCORE_MIN } from '../knowledge/topic-knowledge'

export type PlannerReasonCode =
  | 'ASSESSMENT_SOON'
  | 'HIGH_IMPORTANCE_ASSESSMENT'
  | 'LOW_EVIDENCE'
  | 'WEAK_EVIDENCE'
  | 'UNDER_COVERED'
  | 'EXAM_PRACTICE_DUE'
  | 'HIGH_MARK_OPPORTUNITY'
  | 'ALREADY_STRONG'
  | 'LEARNER_PRIORITY'
  | 'COMPETING_PRIORITY'
  | 'CAPACITY_CONSTRAINED'

export type PlannerCapacityState = 'normal' | 'prioritising'

/** Verified assessment opportunities for one content/intent unit. Dates are local date keys. */
export interface PlannerAssessmentTarget {
  assessmentId: string
  moduleId?: string
  paperId?: string
  assessmentDate: string
  topicIds: readonly string[]
  daysUntilAssessment: number
  assessmentImportance: 'normal' | 'high'
}

export interface PlannerCandidate {
  id: string
  subjectId: string
  courseId?: string
  assessmentId: string
  topicId: string
  activityType: string
  estimatedMinutes: number
  daysUntilAssessment: number
  assessmentImportance: 'normal' | 'high'
  coverage: number
  evidenceStrength: number
  understanding: number | null
  readiness: number | null
  examWeight: number | null
  learnerPreference: -1 | 0 | 1 | 2 | 3
  recentlyCompleted: boolean
  assessmentTargets?: readonly PlannerAssessmentTarget[]
  moduleId?: string
  examTarget?: { moduleId: string; examId: string; questionId: string }
  learnTarget?: { learnPageId: string; moduleId?: string }
  /** Exact authored flashcards not yet attempted; never a fabricated repeat. */
  retrievalContentIds?: readonly string[]
  /** Only one independently authored, never-attempted single-target objective question. */
  targetedQuestionIds?: readonly string[]
  skillFocus?: { specItemId: string; need: 'missed' | 'uncertain'; treatment: 'repair' | 'recheck' }
  earliestEligibleDate?: string
  latestEligibleDate?: string
  preparationStage?: 'acquire' | 'check' | 'exam-practice'
  preparationPrerequisiteId?: string
  /** Exact published paper-section mapping, not a guessed response-skill proxy. */
  paperResponseSectionId?: string
  paperResponseFormat?: string
  /** Programme-first learner explanation, not an independent priority score. */
  preparationPurpose?: string
  preparationReason?: string
}

export interface RankedPlannerCandidate extends PlannerCandidate {
  priority: number
  reasons: PlannerReasonCode[]
}

export interface PlannerDay {
  date: string
  availableMinutes: number
}

export interface PlannerItem {
  recommendationId: string
  candidateId: string
  subjectId: string
  courseId?: string
  assessmentId: string
  topicId: string
  activityType: string
  estimatedMinutes: number
  reasons: PlannerReasonCode[]
  preparationPurpose?: string
  preparationReason?: string
  moduleId?: string
  assessmentTargets?: readonly PlannerAssessmentTarget[]
  examTarget?: { moduleId: string; examId: string; questionId: string }
  learnTarget?: { learnPageId: string; moduleId?: string }
  /** Exact authored flashcards not yet attempted; never a fabricated repeat. */
  retrievalContentIds?: readonly string[]
  targetedQuestionIds?: readonly string[]
  skillFocus?: PlannerCandidate['skillFocus']
}

export interface PlannerScheduledDay {
  date: string
  availableMinutes: number
  items: PlannerItem[]
  unallocatedMinutes: number
}

export interface PlannerResult {
  version: 1
  capacityState: PlannerCapacityState
  ranked: RankedPlannerCandidate[]
  schedule: PlannerScheduledDay[]
  today: PlannerItem[]
  unallocatedTodayMinutes: number
  requiredUsefulMinutes: number
  remainingCapacityMinutes: number
}

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

function assessmentUrgency(days: number) {
  if (days <= 0) return 1
  if (days <= 3) return 1
  if (days <= 7) return 0.85
  if (days <= 14) return 0.65
  if (days <= 30) return 0.4
  return 0.2
}

function candidateReasons(candidate: PlannerCandidate): PlannerReasonCode[] {
  const reasons: PlannerReasonCode[] = []
  if (candidate.daysUntilAssessment <= 14) reasons.push('ASSESSMENT_SOON')
  if (candidate.assessmentImportance === 'high') reasons.push('HIGH_IMPORTANCE_ASSESSMENT')
  if (candidate.evidenceStrength < 0.35) reasons.push('LOW_EVIDENCE')
  if (candidate.understanding !== null && candidate.understanding < MEDIUM_SCORE_MIN / 100) reasons.push('WEAK_EVIDENCE')
  if (candidate.coverage < 0.6) reasons.push('UNDER_COVERED')
  if (candidate.daysUntilAssessment <= 21 && candidate.readiness !== null && candidate.readiness < 0.65) reasons.push('EXAM_PRACTICE_DUE')
  if (candidate.examWeight !== null && candidate.examWeight >= 0.2) reasons.push('HIGH_MARK_OPPORTUNITY')
  if (candidate.understanding !== null && candidate.understanding >= 0.8 && candidate.coverage >= 0.8) reasons.push('ALREADY_STRONG')
  if (candidate.learnerPreference > 0) reasons.push('LEARNER_PRIORITY')
  return reasons
}

export function rankPlannerCandidate(candidate: PlannerCandidate): RankedPlannerCandidate {
  const urgency = assessmentUrgency(candidate.daysUntilAssessment)
  const importance = candidate.assessmentImportance === 'high' ? 1 : 0.55
  const coverageNeed = 1 - clamp01(candidate.coverage)
  const evidenceNeed = 1 - clamp01(candidate.evidenceStrength)
  const understandingNeed = candidate.understanding === null ? 0.45 : 1 - clamp01(candidate.understanding)
  const readinessNeed = candidate.readiness === null ? 0.35 : 1 - clamp01(candidate.readiness)
  const examOpportunity = candidate.examWeight === null ? 0.25 : clamp01(candidate.examWeight)
  const preference = candidate.learnerPreference > 0 ? candidate.learnerPreference / 3 : candidate.learnerPreference
  const repetitionPenalty = candidate.recentlyCompleted ? 0.18 : 0
  const strongPenalty = candidate.understanding !== null && candidate.understanding >= 0.8 && candidate.coverage >= 0.8 ? 0.25 : 0

  // A raw, independently scored specific-skill error deserves attention,
  // without replacing the separate topic/readiness evidence authority.
  const specificNeed = candidate.skillFocus?.need === 'missed' ? 0.08
    : candidate.skillFocus?.need === 'uncertain' ? 0.04 : 0
  const score =
    specificNeed +
    urgency * 0.22 +
    importance * 0.1 +
    coverageNeed * 0.14 +
    evidenceNeed * 0.12 +
    understandingNeed * 0.16 +
    readinessNeed * (candidate.daysUntilAssessment <= 21 ? 0.14 : 0.06) +
    examOpportunity * 0.08 +
    preference * 0.12 -
    repetitionPenalty -
    strongPenalty

  return {
    ...candidate,
    priority: Math.round(score * 1000) / 1000,
    reasons: candidateReasons(candidate),
  }
}

function usefulCandidate(candidate: RankedPlannerCandidate) {
  return candidate.priority > 0.15 && candidate.estimatedMinutes > 0
}

function recommendationId(candidate: PlannerCandidate) {
  if (candidate.assessmentTargets) return `planner-v1:${candidate.id}`
  return `planner-v1:${candidate.assessmentId}:${candidate.courseId ?? candidate.subjectId}:${candidate.topicId}:${candidate.activityType}`
}

function plannerItem(candidate: RankedPlannerCandidate, estimatedMinutes: number, capacityState: PlannerCapacityState): PlannerItem {
  const reasons = capacityState === 'prioritising' && !candidate.reasons.includes('CAPACITY_CONSTRAINED')
    ? [...candidate.reasons, 'CAPACITY_CONSTRAINED' as const]
    : candidate.reasons

  return {
    recommendationId: recommendationId(candidate),
    candidateId: candidate.id,
    subjectId: candidate.subjectId,
    courseId: candidate.courseId,
    assessmentId: candidate.assessmentId,
    topicId: candidate.topicId,
    activityType: candidate.activityType,
    estimatedMinutes,
    reasons,
    preparationPurpose: candidate.preparationPurpose,
    preparationReason: candidate.preparationReason,
    moduleId: candidate.moduleId,
    examTarget: candidate.examTarget,
    learnTarget: candidate.learnTarget,
    retrievalContentIds: candidate.retrievalContentIds,
    targetedQuestionIds: candidate.targetedQuestionIds,
    skillFocus: candidate.skillFocus,
    assessmentTargets: candidate.assessmentTargets,
  }
}

function buildSchedule(
  useful: readonly RankedPlannerCandidate[],
  days: readonly PlannerDay[],
  capacityState: PlannerCapacityState,
): PlannerScheduledDay[] {
  const allocated = new Set<string>()
  const scheduledCandidateIds = new Set(useful.map((item) => item.id))

  return days.map((day) => {
    let remaining = Math.max(0, day.availableMinutes)
    const items: PlannerItem[] = []

    for (const candidate of useful) {
      if (allocated.has(candidate.id) || remaining <= 0) continue
      if (candidate.preparationPrerequisiteId && scheduledCandidateIds.has(candidate.preparationPrerequisiteId)
        && !allocated.has(candidate.preparationPrerequisiteId)) continue
      const eligible = candidateForDay(candidate, day.date)
      if (!eligible || candidate.estimatedMinutes > remaining) continue

      const allocatedMinutes = candidate.estimatedMinutes
      if (allocatedMinutes <= 0) continue

      items.push(plannerItem(rankPlannerCandidate(eligible), allocatedMinutes, capacityState))
      allocated.add(candidate.id)
      remaining -= allocatedMinutes
    }

    return {
      date: day.date,
      availableMinutes: Math.max(0, day.availableMinutes),
      items,
      unallocatedMinutes: remaining,
    }
  })
}

function candidateForDay(candidate: PlannerCandidate, date: string): PlannerCandidate | null {
  if (candidate.earliestEligibleDate && date < candidate.earliestEligibleDate) return null
  if (candidate.latestEligibleDate && date > candidate.latestEligibleDate) return null
  // Compatibility callers without assessment provenance retain their existing ranking contract.
  if (!candidate.assessmentTargets) return candidate
  const targets = candidate.assessmentTargets.filter((target) => date < target.assessmentDate)
    .sort((left, right) => left.assessmentDate.localeCompare(right.assessmentDate) || left.assessmentId.localeCompare(right.assessmentId))
  const nearest = targets[0]
  if (!nearest) return null
  return {
    ...candidate,
    assessmentTargets: targets,
    assessmentId: nearest.assessmentId,
    daysUntilAssessment: nearest.daysUntilAssessment,
    assessmentImportance: nearest.assessmentImportance,
  }
}

export function buildAdaptivePlan(
  candidates: readonly PlannerCandidate[],
  days: readonly PlannerDay[],
  capacityOverride?: PlannerCapacityState,
): PlannerResult {
  const eligible = days[0] ? candidates.flatMap((candidate) => {
    // An objective selected for the second near-term week is not eligible
    // today, but must remain schedulable when its appointed week arrives.
    const firstEligible = candidate.earliestEligibleDate && candidate.earliestEligibleDate > days[0].date
      ? candidate.earliestEligibleDate : days[0].date
    const current = candidateForDay(candidate, firstEligible)
    return current ? [current] : []
  }) : candidates
  const ranked = eligible.map(rankPlannerCandidate).sort((left, right) => {
    if (left.earliestEligibleDate && right.earliestEligibleDate && left.earliestEligibleDate !== right.earliestEligibleDate)
      return left.earliestEligibleDate.localeCompare(right.earliestEligibleDate)
    // When both appear on one day, offer the supported explanation before its
    // dependent check; do not imply a score from the Learn task itself.
    if (left.id === right.preparationPrerequisiteId) return -1
    if (right.id === left.preparationPrerequisiteId) return 1
    if (right.priority !== left.priority) return right.priority - left.priority
    if (left.daysUntilAssessment !== right.daysUntilAssessment) return left.daysUntilAssessment - right.daysUntilAssessment
    return left.id.localeCompare(right.id)
  })

  const useful = ranked.filter(usefulCandidate)
  const requiredUsefulMinutes = useful.reduce((sum, item) => sum + item.estimatedMinutes, 0)
  const remainingCapacityMinutes = days.reduce((sum, day) => sum + Math.max(0, day.availableMinutes), 0)
  const capacityState: PlannerCapacityState = capacityOverride ??
    (requiredUsefulMinutes > remainingCapacityMinutes ? 'prioritising' : 'normal')
  const schedule = buildSchedule(useful, days, capacityState)
  const today = schedule[0]?.items ?? []
  const unallocatedTodayMinutes = schedule[0]?.unallocatedMinutes ?? 0

  return {
    version: 1,
    capacityState,
    ranked,
    schedule,
    today,
    unallocatedTodayMinutes,
    requiredUsefulMinutes,
    remainingCapacityMinutes,
  }
}
