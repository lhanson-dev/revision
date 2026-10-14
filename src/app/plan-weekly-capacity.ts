import type { ProgrammeWeek } from '../engine/planning/programme'
import type { RevisionAvailabilityException, RevisionWeeklyAvailability } from '../services/planning/planner-service'
import { capacityOn } from './plan-model'
import { weekKeys } from './plan-dates'

/**
 * A capacity observation for the remaining relevant calendar days in a week,
 * not a prediction of booked study or proof that the work will fit.
 */
export function knownProgrammeWeekMinutes(
  week: ProgrammeWeek,
  weekly: RevisionWeeklyAvailability | null,
  exceptions: readonly RevisionAvailabilityException[],
): number | null {
  if (!weekly) return null
  const keys = weekKeys(week.weekStart).filter((key) => key >= week.visibleFrom && key <= week.visibleUntil)
  const minutes = keys.map((key) => capacityOn(key, weekly, exceptions))
  if (minutes.some((value) => value === null || !Number.isFinite(value) || value < 0)) return null
  return minutes.reduce<number>((sum, value) => sum + (value ?? 0), 0)
}


/**
 * The study-topic preview respects real saved commitments while the full
 * accepted-session window is known. Distant weeks deliberately remain
 * capacity-before-commitments: loading a year of accepted rows is forbidden.
 */
export function focusMinutesAfterKnownCommitments(
  week: ProgrammeWeek,
  weekly: RevisionWeeklyAvailability | null,
  exceptions: readonly RevisionAvailabilityException[],
  nearAccepted: readonly { plannedDate: string; minutes: number; status: string }[] | null,
  nearLoadedThrough: string,
): number | null {
  const configured = knownProgrammeWeekMinutes(week, weekly, exceptions)
  if (configured === null) return null
  // Outside the bounded accepted-query range we must not imply every future
  // commitment is known. This remains labelled as provisional availability.
  if (week.visibleUntil > nearLoadedThrough) return configured
  // Unknown near commitments cannot safely be read as spare study time.
  if (nearAccepted === null) return null
  const taken = nearAccepted
    .filter((session) => session.status !== 'skipped'
      && session.plannedDate >= week.visibleFrom && session.plannedDate <= week.visibleUntil)
    .reduce((sum, session) => sum + (Number.isFinite(session.minutes) ? Math.max(0, session.minutes) : 0), 0)
  return Math.max(0, configured - taken)
}
