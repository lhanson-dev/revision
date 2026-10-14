import { addDaysToKey } from './plan-dates'

export interface AcceptedSessionWindow {
  from: string
  to: string
}

/**
 * R2b: at most a short rolling detail window and the currently visible calendar
 * range. Never bridge the unviewed gap between them into a year-long DB query.
 */
export function acceptedSessionWindows(
  today: string,
  visibleKeys: readonly string[],
  detailedDays = 14,
): { near: AcceptedSessionWindow; visible: AcceptedSessionWindow | null } {
  if (visibleKeys.length === 0) throw new Error('Visible calendar dates are required')
  if (!Number.isInteger(detailedDays) || detailedDays < 1 || detailedDays > 30) throw new Error('Invalid detailed horizon')
  const near = { from: today, to: addDaysToKey(today, detailedDays - 1) }
  const visible = { from: visibleKeys[0], to: visibleKeys[visibleKeys.length - 1] }
  // A view already inside the detailed window needs no redundant second read.
  return { near, visible: visible.from >= near.from && visible.to <= near.to ? null : visible }
}

/** Identity-based dedupe; never use a selected session twice to consume capacity. */
export function combineAcceptedSessions<T extends { sessionId: string }>(
  near: readonly T[],
  visible: readonly T[],
): T[] {
  return [...new Map([...near, ...visible].map((session) => [session.sessionId, session])).values()]
}
