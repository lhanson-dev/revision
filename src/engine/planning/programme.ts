import type { PlannerCandidate } from './planning'

/**
 * FI-001 R2a: factual weekly programme projection. This is NOT a schedule or
 * allocation algorithm. R1 alone decides date-specific, supported next work.
 */
export interface ProgrammeAssessment {
  assessmentId: string
  subjectId: string
  courseId: string | null
  title: string
  assessmentDate: string
  isActive: boolean
}

export interface ProgrammeMilestone {
  assessmentId: string
  subjectId: string
  courseId: string
  title: string
  date: string
}

export interface ProgrammeWeek {
  /** Monday-based local calendar week; may begin before today. */
  weekStart: string
  /** The actual future portion of this week in the known programme. */
  visibleFrom: string
  visibleUntil: string
  milestones: ProgrammeMilestone[]
  /**
   * Active courses with a real R1 supported candidate applicable before a
   * known paper. Presence means opportunity exists, NOT a booked task, fair
   * allocation, promised duration, or proven understanding.
   */
  supportedCourseIds: string[]
}

export interface PlannerProgramme {
  version: 1
  today: string
  finalKnownAssessment: string | null
  weeks: ProgrammeWeek[]
}

/** Only date-only valid local calendar keys; never let Date silently roll 31 February. */
function dateMillis(key: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null
  const ms = Date.parse(`${key}T00:00:00Z`)
  return Number.isFinite(ms) && new Date(ms).toISOString().slice(0, 10) === key ? ms : null
}

const DAY_MS = 86_400_000

function dateKey(ms: number) {
  return new Date(ms).toISOString().slice(0, 10)
}

function mondayOf(ms: number) {
  const weekday = new Date(ms).getUTCDay()
  return ms - ((weekday + 6) % 7) * DAY_MS
}

/**
 * Build a deterministic, read-only set of actual exam milestones and coarse
 * supported weekly opportunities through the LAST valid known assessment.
 *
 * Input activeCourseIds must come from the authorised learner programme.
 * Candidate provenance must come from the R1 supported-asset bridge.
 * Without these the projection makes NO claim about eligible study work.
 *
 * The caller handles learner timezone when deriving the local 'today' date
 * key. Calendar arithmetic below uses UTC midnight on DATE KEYS to avoid
 * introducing 23/25-hour weeks across DST.
 */
export function buildPlannerProgramme(
  today: string,
  assessments: readonly ProgrammeAssessment[],
  activeCourseIds: ReadonlySet<string>,
  supportedCandidates: readonly PlannerCandidate[] = [],
): PlannerProgramme {
  const todayMs = dateMillis(today)
  if (todayMs === null) throw new Error('Planner programme requires a valid local today date')

  const verified = assessments.flatMap((assessment): ProgrammeMilestone[] => {
    const examMs = dateMillis(assessment.assessmentDate)
    if (!assessment.isActive || !assessment.courseId || !activeCourseIds.has(assessment.courseId)
      || examMs === null || examMs < todayMs) return []
    return [{
      assessmentId: assessment.assessmentId,
      subjectId: assessment.subjectId,
      courseId: assessment.courseId,
      title: assessment.title,
      date: assessment.assessmentDate,
    }]
  }).sort((a, b) => a.date.localeCompare(b.date)
    || a.courseId.localeCompare(b.courseId)
    || a.assessmentId.localeCompare(b.assessmentId))

  // Id collision cannot confer duplicate paper milestones.
  const seenAssessmentIds = new Set<string>()
  const milestones = verified.filter((m) => {
    if (seenAssessmentIds.has(m.assessmentId)) return false
    seenAssessmentIds.add(m.assessmentId)
    return true
  })
  const last = milestones.at(-1)
  if (!last) return { version: 1, today, finalKnownAssessment: null, weeks: [] }

  const knownTargets = new Map(milestones.map((m) => [m.assessmentId, m]))
  const finalMs = dateMillis(last.date)!
  const weeks: ProgrammeWeek[] = []

  for (let monday = mondayOf(todayMs); monday <= finalMs; monday += 7 * DAY_MS) {
    const from = Math.max(todayMs, monday)
    const until = Math.min(finalMs, monday + 6 * DAY_MS)
    const firstKey = dateKey(from)
    const lastKey = dateKey(until)
    const thisWeekMilestones = milestones.filter((m) => m.date >= firstKey && m.date <= lastKey)
    const coursesWithAssets = new Set<string>()

    for (const candidate of supportedCandidates) {
      if (!candidate.courseId || !activeCourseIds.has(candidate.courseId)
        || candidate.estimatedMinutes <= 0) continue
      // Do not promote old compatibility candidates lacking real R1 paper
      // provenance into a distant commitment or entitlement.
      if (candidate.assessmentTargets?.some((target) => {
        const known = knownTargets.get(target.assessmentId)
        return known?.courseId === candidate.courseId
          && known.date === target.assessmentDate
          && known.date > firstKey
      })) coursesWithAssets.add(candidate.courseId)
    }

    weeks.push({
      weekStart: dateKey(monday),
      visibleFrom: firstKey,
      visibleUntil: lastKey,
      milestones: thisWeekMilestones,
      supportedCourseIds: [...coursesWithAssets].sort(),
    })
  }

  return { version: 1, today, finalKnownAssessment: last.date, weeks }
}
