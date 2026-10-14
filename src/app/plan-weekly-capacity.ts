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
