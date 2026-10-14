import { describe, expect, it } from 'vitest'
import type { ProgrammeWeek } from '../engine/planning/programme'
import type { RevisionWeeklyAvailability, RevisionAvailabilityException } from '../services/planning/planner-service'
import { knownProgrammeWeekMinutes, focusMinutesAfterKnownCommitments } from './plan-weekly-capacity'

const weekly: RevisionWeeklyAvailability = {
  monday: 30, tuesday: 30, wednesday: 30, thursday: 30,
  friday: 30, saturday: 30, sunday: 30,
}
const week: ProgrammeWeek = {
  weekStart: '2026-10-12', visibleFrom: '2026-10-14', visibleUntil: '2026-10-18',
  milestones: [], supportedCourseIds: [],
}
const exception: RevisionAvailabilityException = {
  exceptionId: 'reduced', userId: 'learner', localDate: '2026-10-16',
  availableMinutes: 0, note: null,
}

describe('FI-001 R2b truthful coarse weekly availability', () => {
  it('counts only remaining visible days and honours a real date exception', () => {
    expect(knownProgrammeWeekMinutes(week, weekly, [])).toBe(150)
    expect(knownProgrammeWeekMinutes(week, weekly, [exception])).toBe(120)
  })
  it('does not misrepresent absent capacity as zero', () => {
    expect(knownProgrammeWeekMinutes(week, null, [])).toBeNull()
    expect(knownProgrammeWeekMinutes(week, { ...weekly, wednesday: Number.NaN }, [])).toBeNull()
  })
  it('shows real zero and small weekly windows without inventing appointments', () => {
    expect(knownProgrammeWeekMinutes(week, { ...weekly, monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0 }, [])).toBe(0)
    expect(knownProgrammeWeekMinutes(week, { ...weekly, wednesday: 15, thursday: 15 }, [])).toBe(120)
  })
  it('counts the proper calendar days across a UK spring clock change', () => {
    const march: ProgrammeWeek = { ...week, weekStart: '2027-03-22', visibleFrom: '2027-03-22', visibleUntil: '2027-03-28' }
    expect(knownProgrammeWeekMinutes(march, weekly, [])).toBe(210)
  })
})

describe('FI-001 R2 weekly focus availability after saved choices', () => {
  it('subtracts accepted and completed minutes without counting skipped bookings', () => {
    const accepted = [
      { plannedDate: '2026-10-14', minutes: 30, status: 'planned' },
      { plannedDate: '2026-10-15', minutes: 40, status: 'done' },
      { plannedDate: '2026-10-16', minutes: 90, status: 'skipped' },
    ]
    expect(focusMinutesAfterKnownCommitments(week, weekly, [], accepted, '2026-12-12')).toBe(80)
  })
  it('never claims spare near time when the accepted-session read failed', () => {
    expect(focusMinutesAfterKnownCommitments(week, weekly, [], null, '2026-12-12')).toBeNull()
  })
  it('keeps unqueried distant weeks provisional instead of loading months of bookings', () => {
    const future = { ...week, weekStart: '2027-05-10', visibleFrom: '2027-05-10', visibleUntil: '2027-05-16' }
    expect(focusMinutesAfterKnownCommitments(future, weekly, [], null, '2026-12-12')).toBe(210)
  })
  it('never yields negative remaining time after an overbooked chosen week', () => {
    expect(focusMinutesAfterKnownCommitments(week, weekly, [], [
      { plannedDate: '2026-10-14', minutes: 250, status: 'planned' },
    ], '2026-12-12')).toBe(0)
  })
})
