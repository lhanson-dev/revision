import type { PlannerCandidate } from './planning'
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
  unsupportedRequirements: Array<{ courseId: string; topicId: string; reason: string }>
  verifiedPaperDemands: Array<{ courseId: string; assessmentId: string; title: string; date: string;
    questionCount: number; assessmentObjectives: string[] }>
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
  const initialDemandByCourse = new Map<string, number>()
  for (const item of demand) initialDemandByCourse.set(item.candidate.courseId!,
    (initialDemandByCourse.get(item.candidate.courseId!) ?? 0) + item.candidate.estimatedMinutes)
  const allocatedByCourse = new Map<string, number>()
  const allocatedByPaper = new Map<string, number>()
  // Real demand and pre-paper usable capacity define a feasible preparation
  // pace. This is a policy hypothesis, not an optimal spaced-repetition
  // interval, fixed subject ratio, arbitrary topic rotation or guaranteed
  // exam gain. Constrained timelines are prioritised, not artificially spaced.
  const totalDemandByPaper = new Map<string, number>()
  for (const item of demand) totalDemandByPaper.set(item.target.assessmentId,
    (totalDemandByPaper.get(item.target.assessmentId) ?? 0) + item.candidate.estimatedMinutes)
  const pacingByPaper = new Map<string, { weekCapacity: number[]; totalCapacity: number }>()
  for (const item of demand) {
    if (pacingByPaper.has(item.target.assessmentId)) continue
    const values = horizon.weeks.map((week) => {
      if (week.visibleFrom >= item.target.date) return 0
      const known = capacityBefore?.(week, item.target.date) ?? weekCapacity(week)
      return known === null || !Number.isFinite(known) || known < 0 ? 0 : known
    })
    pacingByPaper.set(item.target.assessmentId, {
      weekCapacity: values, totalCapacity: values.reduce((sum, value) => sum + value, 0),
    })
  }
  const weeks: PreparationWeek[] = []
  let allocatedMinutes = 0
  for (const week of horizon.weeks) {
    // A later paper must not be silently sacrificed to an earlier, already
    // infeasible workload. Count only supported opportunities, never infer
    // complete specification or exam-skill demand from candidate minutes.
    const futureCapacityByAssessment = new Map<string, number | null>()
    const knownCapacityAfterThisWeek = (target: ProgrammeMilestone): number | null => {
      if (futureCapacityByAssessment.has(target.assessmentId)) {
        return futureCapacityByAssessment.get(target.assessmentId)!
      }
      let total = 0
      for (const future of horizon.weeks.slice(weeks.length + 1)) {
        if (future.visibleFrom >= target.date) break
        const minutes = capacityBefore?.(future, target.date) ?? weekCapacity(future)
        if (minutes === null || !Number.isFinite(minutes) || minutes < 0) {
          futureCapacityByAssessment.set(target.assessmentId, null)
          return null
        }
        total += minutes
      }
      futureCapacityByAssessment.set(target.assessmentId, total)
      return total
    }
    const rawCapacity = weekCapacity(week)
    const availableMinutes = rawCapacity === null || !Number.isFinite(rawCapacity) || rawCapacity < 0
      ? null : rawCapacity
    const objectives: PreparationObjective[] = []
    let remaining = availableMinutes ?? 0
    // Select obligations before their paper, favouring earlier dates and
    // comparatively under-served course demand instead of a global activity
    // score, arbitrary subject rotation or fixed quotas.
    while (remaining > 0) {
      const remainingByCoursePaper = new Map<string, number>()
      for (const item of outstanding.values()) {
        const next = item.targets.find((entry) => entry.date > week.visibleFrom)
        if (!next) continue
        const key = `${item.candidate.courseId}:${next.assessmentId}`
        remainingByCoursePaper.set(key,
          (remainingByCoursePaper.get(key) ?? 0) + item.candidate.estimatedMinutes)
      }
      const options = [...outstanding.values()].flatMap((item) => {
        // An initial independent check cannot be placed ahead of its real
        // supported acquisition opportunity. This is *sequencing*, not a
        // claim that exposure produced scored evidence or proven retention.
        if (item.candidate.preparationPrerequisiteId
          && outstanding.has(item.candidate.preparationPrerequisiteId)) return []
        const target = item.targets.find((entry) => entry.date > week.visibleFrom)
        if (!target || item.candidate.estimatedMinutes > remaining) return []
        const usableBefore = capacityBefore?.(week, target.date) ?? availableMinutes
        const alreadyUsed = objectives.reduce((total, objective) => total + objective.estimatedMinutes, 0)
        if (usableBefore !== null && alreadyUsed + item.candidate.estimatedMinutes > usableBefore) return []
        const pacing = pacingByPaper.get(item.target.assessmentId)
        const paperDemand = totalDemandByPaper.get(item.target.assessmentId) ?? 0
        // A feasible known horizon permits distributed preparation rather
        // than front-loading every topic in week one. No fixed intervals;
        // cumulative opportunity follows the real proportion of pre-paper
        // study time elapsed and is recalculated on each material change.
        if (pacing && pacing.totalCapacity >= paperDemand && paperDemand > 0) {
          const elapsed = pacing.weekCapacity.slice(0, weeks.length + 1)
            .reduce((sum, minutes) => sum + minutes, 0)
          const intendedCumulative = paperDemand * elapsed / Math.max(1, pacing.totalCapacity)
          // allocatedByPaper is updated as each objective is chosen, including
          // the current week; never count current selections a second time.
          const alreadyForPaper = allocatedByPaper.get(item.target.assessmentId) ?? 0
          const firstUsefulAction = weeks.length === 0 && objectives.length === 0
          if (!firstUsefulAction
            && alreadyForPaper + item.candidate.estimatedMinutes / 2 >= intendedCumulative) return []
        }
        const laterMinutes = knownCapacityAfterThisWeek(target)
        const remainingDemand = remainingByCoursePaper.get(`${item.candidate.courseId}:${target.assessmentId}`) ?? 0
        const usableNow = Math.min(remaining, usableBefore === null ? remaining
          : Math.max(0, usableBefore - alreadyUsed))
        // Protect the last feasible chance to start *supported* work for a
        // later paper. An already-impossible course does not automatically
        // consume every week merely because its earlier exam is closer.
        // Unknown future capacity cannot justify this preference.
        const preserveFeasibleOpportunity = laterMinutes !== null
          && remainingDemand > laterMinutes
          && remainingDemand <= laterMinutes + usableNow
          && usableNow >= item.candidate.estimatedMinutes
        return [{ ...item, target, objective: describe(item.candidate, target),
          preserveFeasibleOpportunity }]
      })
      if (!options.length) break
      const demandsByCourse = new Map<string, number>()
      for (const item of outstanding.values()) demandsByCourse.set(item.candidate.courseId!,
        (demandsByCourse.get(item.candidate.courseId!) ?? 0) + item.candidate.estimatedMinutes)
      options.sort((a, b) => {
        if (a.preserveFeasibleOpportunity !== b.preserveFeasibleOpportunity) {
          return a.preserveFeasibleOpportunity ? -1 : 1
        }
        const daysA = Math.max(1, dayDistance(week.visibleFrom, a.target.date))
        const daysB = Math.max(1, dayDistance(week.visibleFrom, b.target.date))
        const pressureA = (demandsByCourse.get(a.candidate.courseId!) ?? 0) / daysA
        const pressureB = (demandsByCourse.get(b.candidate.courseId!) ?? 0) / daysB
        const servedA = allocatedByCourse.get(a.candidate.courseId!) ?? 0
        const servedB = allocatedByCourse.get(b.candidate.courseId!) ?? 0
        // Compare unmet course need as a fraction of its actual known demand,
        // not a fixed subject-time quota or an invented universal 120-min block.
        const unmetShareA = 1 - servedA / Math.max(1, initialDemandByCourse.get(a.candidate.courseId!) ?? 1)
        const unmetShareB = 1 - servedB / Math.max(1, initialDemandByCourse.get(b.candidate.courseId!) ?? 1)
        return (pressureB * unmetShareB - pressureA * unmetShareA)
          || a.target.date.localeCompare(b.target.date)
          || b.urgency - a.urgency || a.candidate.id.localeCompare(b.candidate.id)
      })
      const choice = options[0]
      objectives.push(choice.preserveFeasibleOpportunity
        ? { ...choice.objective, reason: choice.objective.reason
          + ' Delaying this supported work could leave too little available time for the remaining opportunities before this paper.' }
        : choice.objective)
      outstanding.delete(choice.candidate.id)
      remaining -= choice.candidate.estimatedMinutes
      allocatedMinutes += choice.candidate.estimatedMinutes
      allocatedByCourse.set(choice.candidate.courseId!, (allocatedByCourse.get(choice.candidate.courseId!) ?? 0) + choice.candidate.estimatedMinutes)
      allocatedByPaper.set(choice.target.assessmentId,
        (allocatedByPaper.get(choice.target.assessmentId) ?? 0) + choice.candidate.estimatedMinutes)
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
    allocatedMinutes, constraints, unsupportedRequirements: [], verifiedPaperDemands: [] }
}
