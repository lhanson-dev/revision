import { rankPlannerCandidate, type PlannerCandidate } from './planning'
import type { PlannerProgramme, ProgrammeWeek } from './programme'

/**
 * FI-001 R2: changing, non-booked weekly topic outlook. The long-range plan
 * MUST say what could be studied, not repeat the name of a course for months.
 * R1 retains exclusive authority for dated/Start recommendations. This uses
 * the same supported R1 candidates and their immutable assessment provenance.
 */
export interface ProgrammeTopicFocus {
  courseId: string
  topicId: string
  activityType: string
  /** A second look is an opportunity, never proof that knowledge has decayed. */
  revisit: boolean
}

export interface ProgrammeFocusWeek extends ProgrammeWeek {
  topicFocus: ProgrammeTopicFocus[]
  /** Configured weekly time before unqueried future saved commitments. */
  availableMinutes: number | null
}

export interface FocusedPlannerProgramme extends Omit<PlannerProgramme, 'weeks'> {
  weeks: ProgrammeFocusWeek[]
}

/** This is a conservative preview-size bound, NOT a fixed future task count. */
function maximumVisibleFocuses(minutes: number | null) {
  if (minutes === 0) return 0
  if (minutes === null) return 2
  if (minutes < 45) return 1
  if (minutes < 120) return 2
  return 3
}

/** UTC date-key arithmetic: never let UK DST alter a paper countdown. */
function dateDistance(from: string, until: string) {
  return Math.round((Date.parse(until + 'T00:00:00Z') - Date.parse(from + 'T00:00:00Z')) / 86_400_000)
}

export function withProgrammeWeeklyFocus(
  programme: PlannerProgramme,
  candidates: readonly PlannerCandidate[],
  capacityForWeek: (week: ProgrammeWeek) => number | null,
): FocusedPlannerProgramme {
  const milestones = new Map(programme.weeks.flatMap((week) => week.milestones)
    .map((milestone) => [milestone.assessmentId, milestone]))
  const ranked = candidates.filter((candidate) =>
    candidate.courseId && candidate.estimatedMinutes > 0 && Number.isFinite(candidate.estimatedMinutes)
      && candidate.assessmentTargets?.length,
  ).map(rankPlannerCandidate).sort((a, b) =>
    b.priority - a.priority || a.courseId!.localeCompare(b.courseId!)
      || a.topicId.localeCompare(b.topicId) || a.id.localeCompare(b.id),
  )
  const seen = new Set<string>()
  const weeks = programme.weeks.map((week, weekIndex): ProgrammeFocusWeek => {
    const capacity = capacityForWeek(week)
    // Null means unknown. Invalid data is treated as unknown, not unlimited.
    const availableMinutes = capacity !== null && (!Number.isFinite(capacity) || capacity < 0) ? null : capacity
    const focusLimit = maximumVisibleFocuses(availableMinutes)
    let remaining = availableMinutes ?? Number.POSITIVE_INFINITY
    const eligibleCourseIds = new Set(week.priorities?.map((course) => course.courseId) ?? week.supportedCourseIds)
    const byCourse = new Map<string, typeof ranked>()
    for (const candidate of ranked) {
      if (!candidate.courseId || !eligibleCourseIds.has(candidate.courseId)) continue
      const eligible = candidate.assessmentTargets?.some((target) => {
        const milestone = milestones.get(target.assessmentId)
        return milestone !== undefined && milestone.courseId === candidate.courseId
          && milestone.date === target.assessmentDate
          && milestone.date > week.visibleFrom
      })
      if (!eligible) continue
      const choices = byCourse.get(candidate.courseId) ?? []
      // Shared-paper candidates and alternative activities do not create
      // duplicate topic obligations within a course/week.
      if (!choices.some((choice) => choice.topicId === candidate.topicId)) choices.push(candidate)
      byCourse.set(candidate.courseId, choices)
    }

    const order = week.priorities?.map((course) => course.courseId) ?? [...byCourse.keys()].sort()
    // With room for only one suggested topic, alternate eligible courses
    // between weeks unless a genuine paper is immediately due. Otherwise
    // a farther-away subject could be silently starved all term.
    const nextPaper = week.priorities?.[0]?.nextAssessmentDate
    const imminentlyDue = nextPaper !== undefined
      && dateDistance(week.visibleFrom, nextPaper) <= 7
    if (order.length > 1 && focusLimit === 1 && !imminentlyDue) {
      const offset = weekIndex % order.length
      order.push(...order.splice(0, offset))
    }
    const topicFocus: ProgrammeTopicFocus[] = []
    const selectedHere = new Set<string>()
    // One choice per eligible course per pass prevents the nearest paper from
    // obscuring all other subjects. No cross-subject ratio/weight optimisation.
    while (topicFocus.length < focusLimit) {
      let picked = false
      for (const courseId of order) {
        const choices = (byCourse.get(courseId) ?? []).filter((candidate) =>
          candidate.estimatedMinutes <= remaining && !selectedHere.has(`${courseId}:${candidate.topicId}`))
        if (choices.length === 0) continue
        // Prefer a topic not yet surfaced in the programme; only suggest a
        // revisit when the currently supported distinct options are exhausted.
        const chosen = choices.find((item) => !seen.has(`${courseId}:${item.topicId}`)) ?? choices[0]
        if (!chosen) continue
        const key = `${courseId}:${chosen.topicId}`
        const revisit = seen.has(key)
        topicFocus.push({ courseId, topicId: chosen.topicId, activityType: chosen.activityType, revisit })
        seen.add(key)
        selectedHere.add(key)
        remaining -= chosen.estimatedMinutes
        picked = true
        if (topicFocus.length >= focusLimit) break
      }
      if (!picked) break
    }
    return { ...week, availableMinutes, topicFocus }
  })
  return { ...programme, weeks }
}
