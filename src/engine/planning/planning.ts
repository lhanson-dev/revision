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

export interface PlannerCandidate {
  id: string
  subjectId: string
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
  assessmentId: string
  topicId: string
  activityType: string
  estimatedMinutes: number
  reasons: PlannerReasonCode[]
}

export interface PlannerResult {
  version: 1
  capacityState: PlannerCapacityState
  ranked: RankedPlannerCandidate[]
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
  if (candidate.understanding !== null && candidate.understanding < 0.55) reasons.push('WEAK_EVIDENCE')
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

  const score =
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
  return `planner-v1:${candidate.assessmentId}:${candidate.topicId}:${candidate.activityType}`
}

export function buildAdaptivePlan(
  candidates: readonly PlannerCandidate[],
  days: readonly PlannerDay[],
): PlannerResult {
  const ranked = candidates.map(rankPlannerCandidate).sort((left, right) => {
    if (right.priority !== left.priority) return right.priority - left.priority
    if (left.daysUntilAssessment !== right.daysUntilAssessment) return left.daysUntilAssessment - right.daysUntilAssessment
    return left.id.localeCompare(right.id)
  })

  const useful = ranked.filter(usefulCandidate)
  const requiredUsefulMinutes = useful.reduce((sum, item) => sum + item.estimatedMinutes, 0)
  const remainingCapacityMinutes = days.reduce((sum, day) => sum + Math.max(0, day.availableMinutes), 0)
  const capacityState: PlannerCapacityState = requiredUsefulMinutes > remainingCapacityMinutes ? 'prioritising' : 'normal'
  const todayCapacity = Math.max(0, days[0]?.availableMinutes ?? 0)
  let remainingToday = todayCapacity
  const today: PlannerItem[] = []

  for (const candidate of useful) {
    if (remainingToday <= 0) break
    if (candidate.estimatedMinutes > remainingToday && today.length > 0) continue

    const allocatedMinutes = Math.min(candidate.estimatedMinutes, remainingToday)
    const reasons = capacityState === 'prioritising' && !candidate.reasons.includes('CAPACITY_CONSTRAINED')
      ? [...candidate.reasons, 'CAPACITY_CONSTRAINED' as const]
      : candidate.reasons

    today.push({
      recommendationId: recommendationId(candidate),
      candidateId: candidate.id,
      subjectId: candidate.subjectId,
      assessmentId: candidate.assessmentId,
      topicId: candidate.topicId,
      activityType: candidate.activityType,
      estimatedMinutes: allocatedMinutes,
      reasons,
    })
    remainingToday -= allocatedMinutes
  }

  return {
    version: 1,
    capacityState,
    ranked,
    today,
    unallocatedTodayMinutes: remainingToday,
    requiredUsefulMinutes,
    remainingCapacityMinutes,
  }
}
