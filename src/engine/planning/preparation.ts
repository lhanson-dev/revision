import { rankPlannerCandidate, type PlannerCandidate } from './planning'
import type { PlannerProgramme, ProgrammeWeek, ProgrammeMilestone } from './programme'

/**
 * FI-001 programme-first decision. Weeks own preparation objectives; the
 * near-term scheduler is a projection of these objectives, not another
 * independent recommendation ranker. All curriculum and asset eligibility
 * comes from the existing validated candidate/assessment adapter.
 */
export type PreparationTreatment = 'learn' | 'check' | 'repair' | 'retrieve' | 'exam-practice'
export interface PreparationObjective {
  candidateId: string
  courseId: string
  topicId: string
  activityType: string
  treatment: PreparationTreatment
  purpose: string
  reason: string
  evidenceStatus: 'unknown' | 'needs-work' | 'provisional' | 'supported'
  assessmentId: string
  assessmentDate: string
  estimatedMinutes: number
}
export interface PreparationWeek extends ProgrammeWeek {
  availableMinutes: number | null
  allocatedMinutes: number
  objectives: PreparationObjective[]
  /** An objective is a forecast, never a student-accepted appointment. */
  confidence: 'capacity-known' | 'capacity-unknown'
}
export interface PreparationProgramme extends Omit<PlannerProgramme, 'weeks'> {
  policy: 'exam-backwards-v1'
  weeks: PreparationWeek[]
  unserved: PreparationObjective[]
  requiredMinutes: number
  allocatedMinutes: number
  constraints: string[]
}

interface Demand {
  candidate: PlannerCandidate
  target: ProgrammeMilestone
  targets: ProgrammeMilestone[]
  objective: PreparationObjective
  urgency: number
}
const DAY = 86_400_000
function dayDistance(a: string, b: string) {
  return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / DAY)
}
function evidenceState(candidate: PlannerCandidate): PreparationObjective['evidenceStatus'] {
  if (candidate.understanding === null) return 'unknown'
  if (candidate.understanding < 0.55) return 'needs-work'
  if (candidate.evidenceStrength < 0.6) return 'provisional'
  return 'supported'
}
function treatmentFor(candidate: PlannerCandidate): PreparationTreatment {
  if (candidate.activityType === 'learn') return 'learn'
  if (candidate.activityType === 'exam-question') return 'exam-practice'
  if (candidate.understanding !== null && candidate.understanding < 0.55) return 'repair'
  if (candidate.activityType === 'flashcards') return 'retrieve'
  return 'check'
}
function describe(candidate: PlannerCandidate, target: ProgrammeMilestone): PreparationObjective {
  const evidenceStatus = evidenceState(candidate)
  const treatment = treatmentFor(candidate)
  const purpose = treatment === 'learn' ? 'Build the foundations before independent practice'
    : treatment === 'exam-practice' ? 'Practise the demands of this paper with an assured question'
      : treatment === 'repair' ? 'Work on a gap indicated by the available scored evidence'
        : treatment === 'retrieve' ? 'Retrieve course knowledge independently'
          : evidenceStatus === 'unknown' ? 'Check what you know before choosing further study'
            : 'Apply and check understanding using an approved activity'
  const why = evidenceStatus === 'unknown' ? 'Understanding has not been established by sufficient evidence'
    : evidenceStatus === 'needs-work' ? 'Existing evidence indicates that this area needs attention'
      : evidenceStatus === 'provisional' ? 'Existing evidence is not broad enough for a confident judgement'
        : 'This is a supported opportunity to consolidate demonstrated knowledge'
  return {
    candidateId: candidate.id, courseId: candidate.courseId!, topicId: candidate.topicId,
    activityType: candidate.activityType, treatment, purpose,
    reason: `${why}; preparation remains relevant to ${target.title} on ${target.date}.`,
    evidenceStatus, assessmentId: target.assessmentId, assessmentDate: target.date,
    estimatedMinutes: candidate.estimatedMinutes,
  }
}
/** 
 * Allocate supported education opportunities against known week-level capacity
 * before each real paper. Does not claim all unsupported syllabus requirements
 * have been met or schedule an unvalidated future re-test.
 */
export function buildPreparationProgramme(
  horizon: PlannerProgramme,
  candidates: readonly PlannerCandidate[],
  weekCapacity: (week: ProgrammeWeek) => number | null,
  capacityBefore?: (week: ProgrammeWeek, assessmentDate: string) => number | null,
): PreparationProgramme {
  const milestones = new Map(horizon.weeks.flatMap((week) => week.milestones)
    .map((milestone) => [milestone.assessmentId, milestone]))
  const demand: Demand[] = []
  const seen = new Set<string>()
  for (const candidate of candidates) {
    if (!candidate.courseId || !candidate.topicId || !(candidate.estimatedMinutes > 0)
      || !Number.isFinite(candidate.estimatedMinutes) || !candidate.assessmentTargets?.length) continue
    const eligible = candidate.assessmentTargets.flatMap((target) => {
      const milestone = milestones.get(target.assessmentId)
      return milestone && milestone.courseId === candidate.courseId
        && milestone.date === target.assessmentDate && milestone.date > horizon.today ? [milestone] : []
    }).sort((a, b) => a.date.localeCompare(b.date) || a.assessmentId.localeCompare(b.assessmentId))
    const target = eligible[0]
    if (!target || seen.has(candidate.id)) continue
    seen.add(candidate.id)
    const evidenceNeed = candidate.understanding === null ? 0.6
      : candidate.understanding < 0.55 ? 1 : Math.max(0, 0.8 - candidate.understanding)
    const urgency = (target.date <= horizon.today ? 100 : 1 / Math.max(1, dayDistance(horizon.today, target.date)))
      + evidenceNeed / 10 + (candidate.activityType === 'exam-question' ? 0.02 : 0)
    demand.push({ candidate, target, targets: eligible, objective: describe(candidate, target), urgency })
  }
  // Stable inputs give stable results irrespective of network response ordering.
  demand.sort((a, b) => a.target.date.localeCompare(b.target.date)
    || b.urgency - a.urgency
    || a.candidate.courseId!.localeCompare(b.candidate.courseId!)
    || a.candidate.id.localeCompare(b.candidate.id))

  const outstanding = new Map(demand.map((item) => [item.candidate.id, item]))
  const allocatedByCourse = new Map<string, number>()
  const weeks: PreparationWeek[] = []
  let allocatedMinutes = 0
  for (const week of horizon.weeks) {
    const rawCapacity = weekCapacity(week)
    const availableMinutes = rawCapacity === null || !Number.isFinite(rawCapacity) || rawCapacity < 0
      ? null : rawCapacity
    const objectives: PreparationObjective[] = []
    let remaining = availableMinutes ?? 0
    // Select obligations before their paper, favouring earlier dates and
    // comparatively under-served course demand instead of a global activity
    // score, arbitrary subject rotation or fixed quotas.
    while (remaining > 0) {
      const options = [...outstanding.values()].flatMap((item) => {
        const target = item.targets.find((entry) => entry.date > week.visibleFrom)
        if (!target || item.candidate.estimatedMinutes > remaining) return []
        const usableBefore = capacityBefore?.(week, target.date) ?? availableMinutes
        const alreadyUsed = objectives.reduce((total, objective) => total + objective.estimatedMinutes, 0)
        if (usableBefore !== null && alreadyUsed + item.candidate.estimatedMinutes > usableBefore) return []
        return [{ ...item, target, objective: describe(item.candidate, target) }]
      })
      if (!options.length) break
      const demandsByCourse = new Map<string, number>()
      for (const item of outstanding.values()) demandsByCourse.set(item.candidate.courseId!,
        (demandsByCourse.get(item.candidate.courseId!) ?? 0) + item.candidate.estimatedMinutes)
      options.sort((a, b) => {
        const daysA = Math.max(1, dayDistance(week.visibleFrom, a.target.date))
        const daysB = Math.max(1, dayDistance(week.visibleFrom, b.target.date))
        const pressureA = (demandsByCourse.get(a.candidate.courseId!) ?? 0) / daysA
        const pressureB = (demandsByCourse.get(b.candidate.courseId!) ?? 0) / daysB
        const servedA = allocatedByCourse.get(a.candidate.courseId!) ?? 0
        const servedB = allocatedByCourse.get(b.candidate.courseId!) ?? 0
        return (pressureB / (1 + servedB / 120) - pressureA / (1 + servedA / 120))
          || a.target.date.localeCompare(b.target.date)
          || b.urgency - a.urgency || a.candidate.id.localeCompare(b.candidate.id)
      })
      const choice = options[0]
      objectives.push(choice.objective)
      outstanding.delete(choice.candidate.id)
      remaining -= choice.candidate.estimatedMinutes
      allocatedMinutes += choice.candidate.estimatedMinutes
      allocatedByCourse.set(choice.candidate.courseId!, (allocatedByCourse.get(choice.candidate.courseId!) ?? 0) + choice.candidate.estimatedMinutes)
    }
    weeks.push({ ...week, availableMinutes, objectives, allocatedMinutes: objectives.reduce((sum, o) => sum + o.estimatedMinutes, 0),
      confidence: availableMinutes === null ? 'capacity-unknown' : 'capacity-known' })
  }
  const unserved = [...outstanding.values()].map((item) => describe(item.candidate, item.targets.at(-1) ?? item.target))
  const constraints: string[] = []
  if (horizon.finalKnownAssessment === null) constraints.push('No confirmed future examination date; no final-exam timeline can be inferred.')
  if (weeks.some((w) => w.availableMinutes === null)) constraints.push('Study-time availability is unknown for some weeks; feasibility cannot be confirmed.')
  if (unserved.length) constraints.push(`${unserved.length} supported preparation opportunities are not allocated before their relevant examinations with the time currently known.`)
  if (!demand.length && horizon.finalKnownAssessment) constraints.push('No verified actionable study opportunities are available for the supplied paper scopes. This does not mean preparation is complete.')
  return { ...horizon, policy: 'exam-backwards-v1', weeks, unserved,
    requiredMinutes: demand.reduce((sum, item) => sum + item.candidate.estimatedMinutes, 0),
    allocatedMinutes, constraints }
}
