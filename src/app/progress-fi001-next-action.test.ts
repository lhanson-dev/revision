import { describe, expect, it } from 'vitest'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import { buildCatalogue, createCourseLearningState } from './catalogue-model'
import { allCatalogueCourses } from './learner-programme'
import type { RevisionAssessment, RevisionAvailabilityProfile } from '../services/planning/planner-service'
import { buildPlannerSnapshot } from './planner-model'
import { homeToday } from './home-v3-model'
import { todayRecommendations } from './today-recommendations'
import { progressActionFromPlannerTask } from './progress-summary'
import type { HomeTask } from './home-task'

const programme = allCatalogueCourses(buildCatalogue(listAvailableContentAdapters()))
  .filter((entry) => ['aqa:aqa-a-level:7132', 'aqa:aqa-a-level:7182'].includes(entry.course.id))
const states = programme.map((entry) => createCourseLearningState(entry.course, []))
const now = new Date(2026, 10, 2, 12)
const todayKey = '2026-11-02'
const assessments: RevisionAssessment[] = programme.map((entry, i) => ({
  assessmentId: 'source-paper-' + i, userId: 'synthetic', courseId: entry.course.id,
  subjectId: entry.subject.id, moduleId: null, assessmentType: 'public_exam',
  assessmentDate: '2027-06-10', title: entry.label + ' paper',
  relativeImportance: 'normal', scope: {}, isActive: true,
}))
const availability: RevisionAvailabilityProfile = {
  userId: 'synthetic', timezone: 'Europe/London', weekdayMinutes: 45, weekendMinutes: 0,
  weeklyMinutes: { monday: 45, tuesday: 45, wednesday: 45, thursday: 45, friday: 45, saturday: 0, sunday: 0 },
}
function choices() {
  const snapshot = buildPlannerSnapshot(states, assessments, availability, [], [], now, [], 14)!
  const day = homeToday(todayKey, [], snapshot.schedule, assessments,
    availability.weeklyMinutes, [], programme, states)
  return { snapshot, day, tasks: todayRecommendations(day, states, programme, false, true, now, null, assessments, []) }
}
describe('#703: Progress shows existing FI-001 next action, never independently re-ranks', () => {
  it('preserves the exact Home/Plan/REV recommendation identity for real published courses', () => {
    const { snapshot, tasks } = choices()
    expect(snapshot.today.length).toBeGreaterThan(0)
    expect(tasks.length).toBeGreaterThan(0)
    const action = progressActionFromPlannerTask(tasks[0])
    expect(action?.recommendationId).toBe(tasks[0].id)
    expect(action?.courseId).toBe(tasks[0].courseId)
    expect(action?.topicName).toBe(tasks[0].topicLabel)
    expect(action?.reason).toContain(tasks[0].reason)
    expect(action?.label).toContain('Home')
  })
  it('uses the same accepted-session and Not-now choices as Home and REV', () => {
    const { day, tasks } = choices()
    expect(tasks.length).toBeGreaterThan(1)
    const hidden = { day: todayKey, keys: [tasks[0].id] }
    const alternative = todayRecommendations(day, states, programme, false, true, now, hidden, assessments, [])
    expect(progressActionFromPlannerTask(alternative[0])?.recommendationId).toBe(tasks[1].id)
    expect(progressActionFromPlannerTask(null)).toBeNull()
    expect(todayRecommendations(day, states, programme, false, false, now)).toEqual([])
  })
  it('explains an existing precise skill without inventing one for broad work', () => {
    const { tasks } = choices()
    const base = tasks[0]
    const exact = { ...base, skillFocus: {
      specItemId: 'aqa-7132-3.2.2:expected-value',
      treatment: 'recheck' as const, need: 'missed' as const,
    }} as HomeTask
    const action = progressActionFromPlannerTask(exact)!
    expect(action.recommendationId).toBe(exact.id)
    expect(action.reason).toContain('Independent recheck: Expected value')
    expect(progressActionFromPlannerTask({ ...base, skillFocus: undefined })?.reason).not.toContain('Independent recheck:')
  })
})
