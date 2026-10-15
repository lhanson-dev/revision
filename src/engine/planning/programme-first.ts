import { buildAdaptivePlan, rankPlannerCandidate, type PlannerCandidate, type PlannerDay, type PlannerResult } from './planning'
import type { PlannerProgramme, ProgrammeWeek } from './programme'

/**
 * Programme-first FI-001: one inspectable decision over actual selected paper
 * obligations. Far-away objectives are proposals, NEVER bookings/evidence.
 * Existing candidate identities and exam/paper safety remain authoritative.
 */
export type EvidenceNeed = 'unknown' | 'needs-attention' | 'developing' | 'demonstrated'
export type PreparationTreatment = 'establish-understanding' | 'repair-and-check' | 'retrieve-and-check' | 'authentic-exam-practice'
export type PreparationPhase = 'build' | 'consolidate' | 'exam-preparation'

export interface PreparationObjective {
  obligationId: string
  courseId: string
  topicId: string
  paperId: string
  examDate: string
  evidenceNeed: EvidenceNeed
  treatment: PreparationTreatment
  phase: PreparationPhase
  /** This is the underlying currently supported activity, not an invented asset. */
  activityType: string
  candidateId: string
  minutes: number
  reason: string
}

export interface UnservedPreparation {
  obligationId: string
  courseId: string
  topicId: string
  examDate: string
  reason: 'no-known-capacity' | 'insufficient-capacity' | 'unsupported-asset'
}

export interface ProgrammeDecisionWeek extends ProgrammeWeek {
  objectives: PreparationObjective[]
  capacityMinutes: number | null
  proposedMinutes: number
  /** The remaining time is not the same as completed learning. */
  remainingMinutes: number | null
  phase: PreparationPhase
}

export interface ProgrammeFirstDecision extends Omit<PlannerProgramme, 'weeks'> {
  policyVersion: 'programme-first-v1'
  weeks: ProgrammeDecisionWeek[]
  unserved: UnservedPreparation[]
  totalSuggestedMinutes: number
}

function weekPhase(index: number, length: number): PreparationPhase {
  if (length <= 1) return 'exam-preparation'
  const progress = index / (length - 1)
  return progress >= 0.8 ? 'exam-preparation' : progress >= 0.45 ? 'consolidate' : 'build'
}

function evidenceNeed(candidate: PlannerCandidate): EvidenceNeed {
  if (candidate.understanding === null || candidate.evidenceStrength < 0.35) return 'unknown'
  if (candidate.understanding < 0.55) return 'needs-attention'
  if (candidate.understanding >= 0.8 && candidate.evidenceStrength >= 0.5) return 'demonstrated'
  return 'developing'
}

function treatmentFor(candidate: PlannerCandidate, need: EvidenceNeed): PreparationTreatment {
  if (candidate.activityType === 'exam-question') return 'authentic-exam-practice'
  if (need === 'unknown') return 'establish-understanding'
  if (need === 'needs-attention') return 'repair-and-check'
  return 'retrieve-and-check'
}

function reasonFor(need: EvidenceNeed, treatment: PreparationTreatment, examDate: string) {
  const evidence = need === 'unknown'
    ? 'We do not yet have enough valid evidence about this topic'
    : need === 'needs-attention'
      ? 'Your available scored evidence indicates this topic needs more attention'
      : need === 'developing'
        ? 'Evidence suggests more independent practice may be useful'
        : 'There is stronger evidence here, so focus on applying and checking it'
  const next = treatment === 'authentic-exam-practice'
    ? 'practise a supported exam question'
    : treatment === 'establish-understanding'
      ? 'use the supported activity to find out what is understood'
      : treatment === 'repair-and-check'
        ? 'work on the gap and check it with supported practice'
        : 'retrieve and check independently using available practice'
  return `${evidence}; ${next} before the paper on ${examDate}.`
}

interface Work {
  candidate: PlannerCandidate
  courseId: string
  topicId: string
  paperId: string
  examDate: string
  need: EvidenceNeed
  weight: number
}

function eligibleTarget(candidate: PlannerCandidate, known: ReadonlyMap<string, { courseId: string; date: string }>) {
  return [...candidate.assessmentTargets ?? []]
    .filter((target) => {
      const actual = known.get(target.assessmentId)
      return actual && actual.courseId === candidate.courseId && actual.date === target.assessmentDate
    })
    .sort((a, b) => a.assessmentDate.localeCompare(b.assessmentDate) || a.assessmentId.localeCompare(b.assessmentId))
}

/** Pure domain planner. No mutation, persistence, grade prediction or hidden mastery score. */
export function buildProgrammeFirstDecision(
  baseline: PlannerProgramme,
  candidates: readonly PlannerCandidate[],
  weeklyCapacity: (week: ProgrammeWeek) => number | null,
): ProgrammeFirstDecision {
  const weeks: ProgrammeDecisionWeek[] = baseline.weeks.map((week, i) => {
    const raw = weeklyCapacity(week)
    const capacityMinutes = raw !== null && Number.isFinite(raw) && raw >= 0 ? raw : null
    return { ...week, objectives: [], capacityMinutes, proposedMinutes: 0, remainingMinutes: capacityMinutes,
      phase: weekPhase(i, baseline.weeks.length) }
  })
  const known = new Map(baseline.weeks.flatMap((week) => week.milestones)
    .map((paper) => [paper.assessmentId, { courseId: paper.courseId, date: paper.date }]))
  const unique = new Map<string, Work>()
  for (const candidate of candidates) {
    if (!candidate.courseId || !candidate.topicId || !Number.isFinite(candidate.estimatedMinutes)
      || candidate.estimatedMinutes <= 0) continue
    const targets = eligibleTarget(candidate, known)
    const target = targets[0]
    if (!target) continue
    const key = `${candidate.courseId}:${candidate.topicId}` // shared paper knowledge once
    const need = evidenceNeed(candidate)
    const weight = rankPlannerCandidate(candidate).priority
    const work: Work = { candidate, courseId: candidate.courseId, topicId: candidate.topicId,
      paperId: target.assessmentId, examDate: target.assessmentDate, need, weight }
    const old = unique.get(key)
    if (!old || work.examDate < old.examDate || (work.examDate === old.examDate && work.weight > old.weight)) unique.set(key, work)
  }
  const workItems = [...unique.values()].sort((a, b) =>
    a.examDate.localeCompare(b.examDate)
    || ({'needs-attention': 0, unknown: 1, developing: 2, demonstrated: 3}[a.need]
        - {'needs-attention': 0, unknown: 1, developing: 2, demonstrated: 3}[b.need])
    || b.weight - a.weight || a.courseId.localeCompare(b.courseId) || a.topicId.localeCompare(b.topicId))

  const unserved: UnservedPreparation[] = []
  for (const work of workItems) {
    const fitting = weeks.map((week, i) => ({ week, i })).filter(({ week }) =>
      week.visibleFrom < work.examDate && week.capacityMinutes !== 0
      && (week.remainingMinutes === null || week.remainingMinutes >= work.candidate.estimatedMinutes))
    if (!fitting.length) {
      unserved.push({ obligationId: `${work.courseId}:${work.topicId}`,
        courseId: work.courseId, topicId: work.topicId, examDate: work.examDate,
        reason: weeks.some((week) => week.capacityMinutes === null && week.visibleFrom < work.examDate)
          ? 'no-known-capacity' : 'insufficient-capacity' })
      continue
    }
    // A preparation sequence is not a display rotation: reserve earliest
    // available opportunities for learning gaps and later genuine exam-demand
    // practice, balancing the actual capacity consumed across competing courses.
    const treatment = treatmentFor(work.candidate, work.need)
    const scored = fitting.map(({ week, i }) => {
      const courseMinutes = week.objectives.filter((obj) => obj.courseId === work.courseId)
        .reduce((sum, obj) => sum + obj.minutes, 0)
      const total = week.proposedMinutes
      const space = week.capacityMinutes === null ? 0 : week.capacityMinutes
      const daysToExam = Math.round((Date.parse(work.examDate + 'T00:00:00Z')
        - Date.parse(baseline.today + 'T00:00:00Z')) / 86_400_000)
      // When the real paper is imminent, reserve the earliest feasible
      // opportunity instead of delaying the only supported practice to next week.
      const latePenalty = (treatment === 'authentic-exam-practice' && daysToExam > 14 ? -1 : 1)
        * (i / Math.max(1, weeks.length - 1))
      // Whole-exam capacity pressure: prefer underused weeks, protect other
      // subjects within that week, and keep earlier gaps ahead of later skills.
      return { week, i, score: (space > 0 ? total / space : total / 90) + courseMinutes / 90 + latePenalty }
    }).sort((a, b) => a.score - b.score || a.i - b.i)
    const selected = scored[0]?.week
    if (!selected) continue
    const obligationId = `${work.courseId}:${work.topicId}`
    selected.objectives.push({ obligationId, courseId: work.courseId, topicId: work.topicId,
      paperId: work.paperId, examDate: work.examDate, evidenceNeed: work.need,
      treatment, phase: selected.phase, activityType: work.candidate.activityType,
      candidateId: work.candidate.id, minutes: work.candidate.estimatedMinutes,
      reason: reasonFor(work.need, treatment, work.examDate) })
    selected.proposedMinutes += work.candidate.estimatedMinutes
    if (selected.remainingMinutes !== null) selected.remainingMinutes -= work.candidate.estimatedMinutes
  }
  return { ...baseline, policyVersion: 'programme-first-v1', weeks, unserved,
    totalSuggestedMinutes: weeks.reduce((sum, week) => sum + week.proposedMinutes, 0) }
}

/**
 * Near-term actions are restricted to the objectives chosen by the programme.
 * Still uses the established R1 per-day cutoff and exact supported Start data.
 * Fallback for missing exam/capacity stays with existing standalone R1 pathway.
 */
export function programmeNearTermCandidates(decision: ProgrammeFirstDecision, candidates: readonly PlannerCandidate[], dayKeys: readonly string[]) {
  const selected = new Set(decision.weeks.filter((week) => dayKeys.some((key) => key >= week.visibleFrom && key <= week.visibleUntil))
    .flatMap((week) => week.objectives.map((objective) => objective.candidateId)))
  return candidates.filter((candidate) => selected.has(candidate.id))
}

/**
 * Build actual dated work within the associated programme week. Merely
 * filtering by "any week in the next 14 days" would incorrectly pull a
 * following week's objective into today. Exact day/paper safety stays with R1.
 */
export function buildProgrammeNearTermSchedule(
  decision: ProgrammeFirstDecision,
  candidates: readonly PlannerCandidate[],
  days: readonly PlannerDay[],
): PlannerResult | null {
  if (!days.length) return null
  const selected = programmeNearTermCandidates(decision, candidates, days.map((day) => day.date))
  if (!selected.length) {
    // Preserve truthful `prioritising` / total remaining work state even
    // when no genuine activity fits the week; never invent a task to fill it.
    const diagnostic = buildAdaptivePlan(candidates, days)
    const schedule = days.map((day) => ({ date: day.date, availableMinutes: day.availableMinutes,
      items: [], unallocatedMinutes: day.availableMinutes }))
    return { ...diagnostic, schedule, today: [],
      unallocatedTodayMinutes: days[0]?.availableMinutes ?? 0 }
  }
  const base = buildAdaptivePlan(selected, days)
  const allocated = new Set<string>()
  const schedule = days.map((day) => {
    const programmeWeek = decision.weeks.find((week) =>
      day.date >= week.visibleFrom && day.date <= week.visibleUntil)
    const eligibleIds = new Set(programmeWeek?.objectives.map((objective) => objective.candidateId) ?? [])
    const here = selected.filter((candidate) => eligibleIds.has(candidate.id) && !allocated.has(candidate.id))
    const actual = buildAdaptivePlan(here, [day])
    for (const item of actual.today) allocated.add(item.candidateId)
    return actual.schedule[0] ?? { date: day.date, availableMinutes: day.availableMinutes,
      items: [], unallocatedMinutes: day.availableMinutes }
  })
  return { ...base, schedule, today: schedule[0]?.items ?? [],
    unallocatedTodayMinutes: schedule[0]?.unallocatedMinutes ?? 0 }
}
