import { describe, expect, it } from 'vitest'
import { acceptedSessionWindows, combineAcceptedSessions } from './plan-session-windows'
import { monthGridKeys, weekKeys } from './plan-dates'

describe('FI-001 R2-09 disjoint accepted-session windows', () => {
  const today = '2026-10-14'
  it.each([120, 365, 730])('%i-day distant navigation never reads the unviewed gap', (days) => {
    const future = new Date(Date.parse(today + 'T00:00:00Z') + days * 86400000).toISOString().slice(0, 10)
    const windows = acceptedSessionWindows(today, monthGridKeys(Number(future.slice(0, 4)), Number(future.slice(5, 7)) - 1))
    expect(windows.near).toEqual({ from: today, to: '2026-10-27' })
    expect(windows.visible).not.toBeNull()
    expect(windows.visible!.from).toBeGreaterThan(windows.near.to)
    const spanDays = (Date.parse(windows.visible!.to) - Date.parse(windows.visible!.from)) / 86400000
    expect(spanDays).toBeLessThanOrEqual(41)
  })

  it('does not make redundant reads for current week', () => {
    expect(acceptedSessionWindows(today, weekKeys(today)).visible).toBeNull()
  })

  it('a future week is read separately even if it overlaps the next two weeks', () => {
    const result = acceptedSessionWindows(today, weekKeys('2026-10-26'))
    expect(result.near.to).toBe('2026-10-27')
    expect(result.visible).toEqual({ from: '2026-10-26', to: '2026-11-01' })
  })

  it('rejects unbounded detailed horizons', () => {
    expect(() => acceptedSessionWindows(today, weekKeys(today), 365)).toThrow()
  })

  it('merges overlapping accepted sessions by persistent identity once', () => {
    expect(combineAcceptedSessions([{ sessionId: 'a', status: 'planned' }], [
      { sessionId: 'a', status: 'done' }, { sessionId: 'b', status: 'planned' },
    ])).toEqual([{ sessionId: 'a', status: 'done' }, { sessionId: 'b', status: 'planned' }])
  })
})
