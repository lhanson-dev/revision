import { describe, expect, it } from 'vitest'
import type { PlannerCandidate } from '../engine/planning/planning'
import type { PlannedSession } from '../services/planning/planned-session-service'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import { applyAcceptedSessionsToDays, bookedMinutesByDate, dayWord, nextFreeDay, plannedKey, plannedTopicKeys, sessionActivityForTask, withoutPlannedTopics } from './accepted-sessions'
import { buildCatalogue, createCourseLearningState } from './catalogue-model'
import { allCatalogueCourses } from './learner-programme'
import { buildPlannerSnapshot } from './planner-model'
import { rankSuggestions } from './rev-suggestions'

const course = 'aqa:aqa-a-level:7132'
const session = (over: Partial<PlannedSession>): PlannedSession => ({
  sessionId: 's', userId: 'u', plannedDate: '2026-10-08', courseId: course, topicId: 'finance', activityType: 'practice', minutes: 20,
  addedBy: 'rev', recommendationId: null, status: 'planned', createdAt: '', updatedAt: '', ...over,
})
const days = [{ date: '2026-10-07', availableMinutes: 30 }, { date: '2026-10-08', availableMinutes: 60 }, { date: '2026-10-09', availableMinutes: 60 }]

describe('accepted sessions', () => {
  it('maps a Home task to a session activity', () => {
    expect(sessionActivityForTask('flashcards')).toBe('practice')
    expect(sessionActivityForTask('quick-check')).toBe('practice')
    expect(sessionActivityForTask('exam-question')).toBe('exam_prep')
  })

  it('takes planned and done sessions off a day\'s study time, but not skipped ones', () => {
    const sessions = [session({ minutes: 20 }), session({ sessionId: 'd', status: 'done', minutes: 15, topicId: 'hr' }), session({ sessionId: 'k', status: 'skipped', minutes: 40, topicId: 'marketing' })]
    expect(bookedMinutesByDate(sessions).get('2026-10-08')).toBe(35)
    expect(applyAcceptedSessionsToDays(days, sessions).map((day) => day.availableMinutes)).toEqual([30, 25, 60])
    expect(applyAcceptedSessionsToDays(days, [session({ minutes: 200 })])[1].availableMinutes).toBe(0)
  })

  it('stops a topic that is already planned being suggested again, until it is done or skipped', () => {
    expect([...plannedTopicKeys([session({})])]).toEqual([plannedKey(course, 'finance')])
    expect(plannedTopicKeys([session({ status: 'done' }), session({ status: 'skipped', topicId: 'hr' })]).size).toBe(0)
    const candidates = [{ id: 'a', courseId: course, topicId: 'finance' }, { id: 'b', courseId: course, topicId: 'hr' }, { id: 'c', topicId: 'finance' }] as PlannerCandidate[]
    expect(withoutPlannedTopics(candidates, [session({})]).map((item) => item.id)).toEqual(['b', 'c'])
  })

  it('finds the next day with room, starting today', () => {
    expect(nextFreeDay(days, [], 20, '2026-10-07')).toBe('2026-10-07')
    expect(nextFreeDay(days, [], 45, '2026-10-07')).toBe('2026-10-08')
    expect(nextFreeDay(days, [session({ minutes: 50 })], 20, '2026-10-07')).toBe('2026-10-07')
    expect(nextFreeDay(days, [session({ minutes: 50 })], 45, '2026-10-07')).toBe('2026-10-09')
  })

  it('falls back to tomorrow when there is no study time to measure or no day has room', () => {
    expect(nextFreeDay([], [], 20, '2026-10-07')).toBe('2026-10-08')
    expect(nextFreeDay(days, [], 500, '2026-10-07')).toBe('2026-10-08')
  })

  it('says days in plain words', () => {
    expect(dayWord('2026-10-07', '2026-10-07')).toBe('today')
    expect(dayWord('2026-10-08', '2026-10-07')).toBe('tomorrow')
    expect(dayWord('2026-10-09', '2026-10-07')).toBe('Friday')
    expect(dayWord('2026-10-20', '2026-10-07')).toMatch(/^Tue,? 20 Oct$/)
  })
})

describe('the planner works around accepted sessions', () => {
  const catalogue = buildCatalogue(listAvailableContentAdapters())
  const business = allCatalogueCourses(catalogue).find((item) => item.subject.id === 'business')
  if (!business) throw new Error('Business missing')
  const state = createCourseLearningState(business.course, [])
  const topicIds = business.course.learningAdapter.listTopics().map((topic) => topic.id)
  const now = new Date(2026, 9, 7, 9, 0)
  const assessment = [{ assessmentId: 'a', userId: 'u', subjectId: 'business', courseId: business.course.id, moduleId: null, assessmentType: 'public_exam', title: 'Paper 1', assessmentDate: '2026-10-30', relativeImportance: 'high', scope: {}, isActive: true }] as never
  const availability = { userId: 'u', weeklyMinutes: { monday: 60, tuesday: 60, wednesday: 60, thursday: 60, friday: 60, saturday: 60, sunday: 60 }, weekdayMinutes: 60, weekendMinutes: 60, timezone: 'Europe/London' }

  it('takes the accepted session\'s time off its day and does not re-suggest its topic', () => {
    const plain = buildPlannerSnapshot([state], assessment, availability, [], [], now)
    expect(plain).not.toBeNull()
    const planned = plain?.schedule[1]?.items[0]
    expect(planned).toBeDefined()
    const accepted = session({ plannedDate: plain?.schedule[1]?.date, courseId: business.course.id, topicId: planned?.topicId ?? topicIds[0], minutes: 30 })
    const after = buildPlannerSnapshot([state], assessment, availability, [], [], now, [accepted])
    expect(after?.schedule[1].availableMinutes).toBe((plain?.schedule[1].availableMinutes ?? 0) - 30)
    expect(after?.schedule.flatMap((day) => day.items).some((item) => item.topicId === accepted.topicId)).toBe(false)
  })

  it('does not suggest a topic that is already on the plan', () => {
    const programme = [business]
    const before = rankSuggestions([state], [], programme, now)
    const first = before[0]
    const after = rankSuggestions([state], [], programme, now, new Set([first.key]))
    expect(after.some((item) => item.key === first.key)).toBe(false)
    expect(after.length).toBe(before.length - 1)
  })
})
