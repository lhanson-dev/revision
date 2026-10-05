import { describe, expect, it } from 'vitest'
import { addDaysToKey, countdownWords, formatMinutes, longDate, monthGridKeys, shiftMonth, weekKeys, weekRangeLabel, weekStart } from './plan-dates'

describe('plan dates', () => {
  it('starts weeks on Monday', () => {
    expect(weekStart('2026-10-05')).toBe('2026-10-05')
    expect(weekStart('2026-10-11')).toBe('2026-10-05')
    expect(weekKeys('2026-10-08')).toEqual(['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11'])
  })

  it('steps days across month, year and clock-change boundaries', () => {
    expect(addDaysToKey('2026-10-31', 1)).toBe('2026-11-01')
    expect(addDaysToKey('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDaysToKey('2026-10-24', 2)).toBe('2026-10-26')
  })

  it('builds a Monday-first month grid with the days around it', () => {
    const october = monthGridKeys(2026, 9)
    expect(october[0]).toBe('2026-09-28')
    expect(october.at(-1)).toBe('2026-11-01')
    expect(october).toHaveLength(35)
    expect(monthGridKeys(2027, 1)).toHaveLength(28)
    expect(monthGridKeys(2026, 7)).toHaveLength(42)
  })

  it('steps months to today when it is the current month and to the 1st otherwise', () => {
    expect(shiftMonth('2026-11-01', -1, '2026-10-05')).toBe('2026-10-05')
    expect(shiftMonth('2026-10-05', 1, '2026-10-05')).toBe('2026-11-01')
    expect(shiftMonth('2026-12-01', 1, '2026-10-05')).toBe('2027-01-01')
  })

  it('words dates and durations the way the screen shows them', () => {
    expect(weekRangeLabel('2026-10-07')).toBe('5 Oct – 11 Oct')
    expect(longDate('2026-10-22')).toBe('Thursday 22 October')
    expect(formatMinutes(0)).toBe('0m')
    expect(formatMinutes(45)).toBe('45m')
    expect(formatMinutes(60)).toBe('1h')
    expect(formatMinutes(95)).toBe('1h 35m')
    expect(countdownWords(0)).toBe('today')
    expect(countdownWords(1)).toBe('tomorrow')
    expect(countdownWords(17)).toBe('in 17 days')
  })
})
