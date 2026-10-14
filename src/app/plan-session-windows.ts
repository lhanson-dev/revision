import { addDaysToKey } from './plan-dates'

/** R2 detailed task and accepted-choice windows shared by Home, Plan and REV. */
export const DETAILED_PLANNER_HORIZON_DAYS = 14
export const ACCEPTED_COMMITMENT_HORIZON_DAYS = 60

export interface AcceptedSessionWindow {
  from: string
  to: string
}

/**
 * R2b: at most the existing bounded accepted-commitment lookahead and visible calendar
 * range. Never bridge the unviewed gap between them into a year-long DB query.
 */
export function acceptedSessionWindows(
  today: string,
  visibleKeys: readonly string[],
  commitmentDays = ACCEPTED_COMMITMENT_HORIZON_DAYS,
): { near: AcceptedSessionWindow; visible: AcceptedSessionWindow | null } {
  if (visibleKeys.length === 0) throw new Error('Visible calendar dates are required')
  if (!Number.isInteger(commitmentDays) || commitmentDays < 1 || commitmentDays > ACCEPTED_COMMITMENT_HORIZON_DAYS) throw new Error('Invalid accepted commitment horizon')
  const near = { from: today, to: addDaysToKey(today, commitmentDays - 1) }
  const visible = { from: visibleKeys[0], to: visibleKeys[visibleKeys.length - 1] }
  // A view already inside the bounded commitment window needs no redundant second read.
  return { near, visible: visible.from >= near.from && visible.to <= near.to ? null : visible }
}

/** Identity-based dedupe; never use a selected session twice to consume capacity. */
export function combineAcceptedSessions<T extends { sessionId: string }>(
  near: readonly T[],
  visible: readonly T[],
): T[] {
  return [...new Map([...near, ...visible].map((session) => [session.sessionId, session])).values()]
}
