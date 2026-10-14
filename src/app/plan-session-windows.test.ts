import { describe, expect, it } from 'vitest'
import { acceptedSessionWindows, combineAcceptedSessions, nearTermAcceptedSessions, ACCEPTED_COMMITMENT_HORIZON_DAYS, DETAILED_PLANNER_HORIZON_DAYS } from './plan-session-windows'
import { monthGridKeys, weekKeys } from './plan-dates'

describe('FI-001 R2-09 disjoint accepted-session windows', () => {
  const today = '2026-10-14'
  it.each([120, 365, 730])('%i-day distant navigation never reads the unviewed gap', (days) => {
    const future = new Date(Date.parse(today + 'T00:00:00Z') + days * 86400000).toISOString().slice(0, 10)
    const windows = acceptedSessionWindows(today, monthGridKeys(Number(future.slice(0, 4)), Number(future.slice(5, 7)) - 1))
    expect(windows.near).toEqual({ from: today, to: '2026-12-12' })
    expect(windows.visible).not.toBeNull()
    expect(windows.visible!.from > windows.near.to).toBe(true)
    const spanDays = (Date.parse(windows.visible!.to) - Date.parse(windows.visible!.from)) / 86400000
    expect(spanDays).toBeLessThanOrEqual(41)
  })

  it('retains an independent current-week read for saved commitments before today', () => {
    // The near-term window starts today; the current displayed week also includes Monday/Tuesday.
    expect(acceptedSessionWindows(today, weekKeys(today)).visible)
      .toEqual({ from: '2026-10-12', to: '2026-10-18' })
  })

  it('an exam week beyond the existing commitment window is read separately', () => {
    const result = acceptedSessionWindows(today, weekKeys('2026-12-14'))
    expect(result.near.to).toBe('2026-12-12')
    expect(result.visible).toEqual({ from: '2026-12-14', to: '2026-12-20' })
  })

  it('rejects extending accepted reads across an unbounded horizon', () => {
    expect(() => acceptedSessionWindows(today, weekKeys(today), 365)).toThrow()
  })

  it('merges overlapping accepted sessions by persistent identity once', () => {
    expect(combineAcceptedSessions([{ sessionId: 'a', status: 'planned' }], [
      { sessionId: 'a', status: 'done' }, { sessionId: 'b', status: 'planned' },
    ])).toEqual([{ sessionId: 'a', status: 'done' }, { sessionId: 'b', status: 'planned' }])
  })

  it('R2-07 keeps distant visible-month commitments out of the shared Today calculation', () => {
    const future = '2028-10-04'
    const windows = acceptedSessionWindows(today, monthGridKeys(2028, 9))
    const accepted = [
      { sessionId: 'today', plannedDate: today },
      { sessionId: 'near', plannedDate: windows.near.to },
      { sessionId: 'distant', plannedDate: future },
    ]
    const displayed = combineAcceptedSessions(accepted.slice(0, 2), accepted.slice(2))
    expect(displayed).toHaveLength(3)
    expect(nearTermAcceptedSessions(displayed, windows.near).map((session) => session.sessionId)).toEqual(['today', 'near'])
    expect(DETAILED_PLANNER_HORIZON_DAYS).toBe(14)
    expect(ACCEPTED_COMMITMENT_HORIZON_DAYS).toBe(60)
  })
})
