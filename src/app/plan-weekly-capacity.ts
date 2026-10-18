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
  const visible = weekKeys(week.weekStart).filter((day) =>
    day >= week.visibleFrom && day <= week.visibleUntil)
  const queried = visible.filter((day) => day <= nearLoadedThrough)
  // A week can straddle the last queried date. Its known early bookings must
  // still be deducted; only the later dates are provisional.
  if (!queried.length) return configured
  // A failed near read cannot be treated as free time even when this week
  // also contains distant, unqueried dates.
  if (nearAccepted === null) return null
  return visible.reduce((total, date) => {
    const budget = capacityOn(date, weekly!, exceptions)!
    const taken = date > nearLoadedThrough ? 0 : nearAccepted
      .filter((session) => session.status !== 'skipped' && session.plannedDate === date)
      .reduce((sum, session) =>
        sum + (Number.isFinite(session.minutes) ? Math.max(0, session.minutes) : 0), 0)
    // Overbooking one accepted day must not consume unrelated future days.
    return total + Math.max(0, budget - taken)
  }, 0)
}
