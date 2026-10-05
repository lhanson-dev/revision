import { describe, expect, it } from 'vitest'
import type { PlannerItem } from '../engine/planning/planning'
import type { PlannedSession } from '../services/planning/planned-session-service'
import type { RevisionAssessment } from '../services/planning/planner-service'
import { capacityOn, createPlanDayBuilder, overdueSessionCount, summarisePeriod, type PlanContext, type PlanSubject } from './plan-model'
import { weekKeys } from './plan-dates'

const business: PlanSubject = { subjectId: 'business', name: 'Business', hue: 'blue', mark: 'B' }
const today = '2026-10-05'

function session(id: string, plannedDate: string, extra: Partial<PlannedSession> = {}): PlannedSession {
  return { sessionId: id, userId: 'u', plannedDate, courseId: 'c', topicId: 'finance', activityType: 'practice', minutes: 30, addedBy: 'student', recommendationId: null, status: 'planned', createdAt: '', updatedAt: '', ...extra }
}

function assessment(id: string, assessmentDate: string, extra: Partial<RevisionAssessment> = {}): RevisionAssessment {
  return { assessmentId: id, userId: 'u', subjectId: 'business', courseId: 'c', moduleId: null, assessmentType: 'public_exam', title: 'Paper 1', assessmentDate, relativeImportance: 'high', scope: {}, isActive: true, ...extra } as RevisionAssessment
}

function suggestion(id: string, minutes = 20): PlannerItem {
  return { recommendationId: id, candidateId: id, subjectId: 'business', courseId: 'c', assessmentId: 'a', topicId: 'marketing', activityType: 'quick-check', estimatedMinutes: minutes, reasons: [] }
}

function context(extra: Partial<PlanContext> = {}): PlanContext {
  return {
    todayKey: today,
    sessions: [],
    schedule: [],
    assessments: [],
    weeklyMinutes: { monday: 60, tuesday: 60, wednesday: 0, thursday: 60, friday: 60, saturday: 60, sunday: 0 },
    exceptions: [],
    subjectForCourse: () => business,
    subjectForItem: () => business,
    subjectForAssessment: () => business,
    topicLabel: (_course, topic) => topic,
    suggestedActivityLabel: () => 'Quick check',
    ...extra,
  }
}

describe('plan day model', () => {
  it('puts the exam first, then accepted sessions, then what the planner suggests', () => {
    const build = createPlanDayBuilder(context({
      sessions: [session('s1', today)],
      schedule: [{ date: today, availableMinutes: 30, items: [suggestion('r1')], unallocatedMinutes: 0 }],
      assessments: [assessment('a1', today)],
    }))
    expect(build(today).items.map((item) => item.kind)).toEqual(['exam', 'session', 'suggested'])
  })

  it('never invents sessions: a future day the planner did not fill is empty', () => {
    const build = createPlanDayBuilder(context())
    const day = build('2026-12-14')
    expect(day.items).toEqual([])
    expect(day.studyCount).toBe(0)
  })

  it('ignores skipped sessions and, for days that have gone, anything the planner would suggest', () => {
    const build = createPlanDayBuilder(context({
      sessions: [session('s1', '2026-10-02', { status: 'skipped' }), session('s2', '2026-10-02', { status: 'done' })],
      schedule: [{ date: '2026-10-02', availableMinutes: 30, items: [suggestion('r1')], unallocatedMinutes: 0 }],
    }))
    const day = build('2026-10-02')
    expect(day.past).toBe(true)
    expect(day.items).toHaveLength(1)
    expect(day.allDone).toBe(true)
  })

  it('marks a rest day only when study time is set and the day has none', () => {
    expect(createPlanDayBuilder(context())('2026-10-07').rest).toBe(true)
    expect(createPlanDayBuilder(context({ weeklyMinutes: null }))('2026-10-07').rest).toBe(false)
    expect(capacityOn('2026-10-07', context().weeklyMinutes, [{ localDate: '2026-10-07', availableMinutes: 45 } as never])).toBe(45)
  })

  it('gives exams their own wording by type', () => {
    const build = createPlanDayBuilder(context({ assessments: [assessment('a1', today, { assessmentType: 'topic_test' })] }))
    expect(build(today).exams[0]).toMatchObject({ dayLabel: 'Test day', noun: 'test' })
  })
})

describe('plan summary', () => {
  const week = weekKeys(today)

  it('measures time done against time planned, never mastery', () => {
    const build = createPlanDayBuilder(context({
      sessions: [session('s1', today, { status: 'done', minutes: 20 }), session('s2', today, { minutes: 30 })],
    }))
    const days = week.map(build)
    const summary = summarisePeriod(days, today, week[0], week[6], overdueSessionCount(days))
    expect(summary).toMatchObject({ plannedMinutes: 50, doneMinutes: 20, percent: 40, phase: 'now' })
    expect(summary.status).toMatchObject({ label: 'On track', icon: 'check' })
    expect(summary.status.text).toBe('1 of 2 sessions done. 30m to go.')
  })

  it('says catching up, not on track, when an earlier session is still waiting', () => {
    const build = createPlanDayBuilder(context({ sessions: [session('s1', '2026-10-05', { minutes: 30 })], todayKey: '2026-10-07' }))
    const days = week.map(build)
    const summary = summarisePeriod(days, '2026-10-07', week[0], week[6], overdueSessionCount(days))
    expect(summary.status.label).toBe('Catching up')
  })

  it('calls a finished week finished and a later week coming up', () => {
    const build = createPlanDayBuilder(context({ sessions: [session('s1', '2026-09-30', { status: 'done' })] }))
    const last = weekKeys('2026-09-30')
    expect(summarisePeriod(last.map(build), today, last[0], last[6], 0).status).toMatchObject({ label: 'Finished', text: 'All 1 session done. Nice work.' })
    const next = weekKeys('2026-10-12')
    expect(summarisePeriod(next.map(build), today, next[0], next[6], 0).status).toMatchObject({ label: 'Coming up', text: 'Nothing planned yet.' })
  })

  it('has no percentage to show when nothing is planned', () => {
    const days = week.map(createPlanDayBuilder(context()))
    expect(summarisePeriod(days, today, week[0], week[6], 0)).toMatchObject({ percent: 0, plannedMinutes: 0 })
  })
})
