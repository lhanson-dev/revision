import { describe, it, expect } from 'vitest'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import { buildCatalogue, createCourseLearningState } from './catalogue-model'
import { allCatalogueCourses } from './learner-programme'
import { buildPlannerSnapshot } from './planner-model'
import { homeToday, homeTaskOnToday } from './home-v3-model'
import { todayRecommendations, recommendationExplanation } from './today-recommendations'
import { resolveHomeExamQuestion } from './home-exam-question'
import type { RevisionAssessment, RevisionAvailabilityProfile } from '../services/planning/planner-service'
import type { PlannedSession } from '../services/planning/planned-session-service'

const programme = allCatalogueCourses(buildCatalogue(listAvailableContentAdapters())).filter((p) => p.course.id === 'aqa:aqa-a-level:7132')
const course = programme[0].course
const state = createCourseLearningState(course, [])
const now = new Date(2026, 9, 13, 12)
const assessment: RevisionAssessment = { assessmentId: 'paper1', userId: 'u', courseId: course.id, subjectId: 'business', moduleId: course.modules[0].manifest.id,
  assessmentType: 'public_exam', title: 'Paper 1', assessmentDate: '2026-10-20', relativeImportance: 'normal', scope: {}, isActive: true }
const availability: RevisionAvailabilityProfile = { userId: 'u', timezone: 'Europe/London', weekdayMinutes: 90, weekendMinutes: 90,
  weeklyMinutes: { monday: 90, tuesday: 90, wednesday: 90, thursday: 90, friday: 90, saturday: 90, sunday: 90 } }
const session = (id: string, topicId: string, status: PlannedSession['status'] = 'planned'): PlannedSession => ({ sessionId: id, userId: 'u', courseId: course.id,
  topicId, plannedDate: '2026-10-13', status, activityType: 'practice', minutes: 20, addedBy: 'student', recommendationId: null, createdAt: '2026-10-01', updatedAt: '' })
function context(sessions: PlannedSession[] = [], current = state, capacity = availability) {
  const snapshot = buildPlannerSnapshot([current], [assessment], capacity, [], [], now, sessions)
  return homeToday('2026-10-13', sessions, snapshot?.schedule ?? [], [assessment], capacity.weeklyMinutes, [], programme, [current])
}
const choices = (day: ReturnType<typeof context> | null, current = state, missing = false, trusted = true, hidden: string[] = []) =>
  todayRecommendations(day, [current], programme, missing, trusted, now, { day: '2026-10-13', keys: hidden })

describe('FI-001 R1b same-input Home/Plan/REV contract', () => {
  it('R1-07 accepted before derived, exact row identity and shared REV rationale', () => {
    const sessions = [session('z', 'finance'), session('a', 'marketing'), session('done', 'operations', 'done'), session('skip', 'hr', 'skipped')]
    const day = context(sessions)
    const tasks = choices(day)
    expect(tasks[0].sessionId).toBe('a')
    expect(homeTaskOnToday(tasks[0], day)).toBe(true)
    expect(recommendationExplanation(tasks[0])).toContain(tasks[0].topicLabel)
    expect(recommendationExplanation(tasks[0])).toContain('You chose this session')
    expect(tasks.some((t) => t.sessionId === 'done' || t.sessionId === 'skip')).toBe(false)
    expect(tasks).toEqual(choices(context(sessions.reverse())))
  })
  it('R1-07 exact exam intent remains the identical real paper/question through Start', () => {
    const evidence = Array.from({ length: 4 }, (_, i) => ({ id: `e${i}`, schemaVersion: 1 as const, moduleId: state.adapter.manifest.id,
      topicId: 'finance', contentId: `q${i}`, occurredAt: '2026-10-10T12:00:00Z', source: 'multiple_choice' as const, correct: true, selectedOption: 0, correctOption: 0 }))
    const current = createCourseLearningState(course, evidence)
    const scoped = { ...assessment, scope: { topicIds: ['finance'] } }
    const snapshot = buildPlannerSnapshot([current], [scoped], availability, [], [], now, [])!
    const day = homeToday('2026-10-13', [], snapshot.schedule, [scoped], availability.weeklyMinutes, [], programme, [current])
    const task = choices(day, current)[0]
    expect(task.activityType).toBe('exam-question')
    expect(task.examTarget).toEqual(snapshot.today[0].examTarget)
    const target = resolveHomeExamQuestion(task, programme)!
    expect(target.moduleId).toBe(assessment.moduleId)
    expect(target.questionId).toBe(task.examTarget?.questionId)
    expect(homeTaskOnToday(task, day)).toBe(true)
    expect(resolveHomeExamQuestion({ ...task, examTarget: { ...task.examTarget!, questionId: 'missing' } }, programme)).toBeNull()
  })
  it('R1-06 missing inputs permit an explicitly unscheduled supported first action', () => {
    const tasks = choices(null, state, true)
    expect(tasks.length).toBeGreaterThan(1)
    expect(tasks.every((t) => t.source === 'fallback' && !t.plannerItem)).toBe(true)
    expect(tasks[0].reason).toContain('not scheduled')
  })
  it('R1-08 dismissal advances only today, exhausts honestly and expires at midnight/DST', () => {
    const day = context([session('first', 'finance')])
    const tasks = choices(day)
    expect(choices(day, state, false, true, [tasks[0].id])[0].id).toBe(tasks[1].id)
    expect(choices(day, state, false, true, tasks.map((t) => t.id))).toEqual([])
    expect(todayRecommendations({ ...day, key: '2026-10-25' }, [state], programme, false, true, new Date(2026, 9, 25), { day: '2026-10-24', keys: tasks.map((t) => t.id) })).toEqual(tasks)
    expect(todayRecommendations(day, [state], programme, false, true, new Date(2026, 9, 14))).toEqual([])
    expect(day.items.find((r) => r.kind === 'session' && r.session.sessionId === 'first')?.kind).toBe('session')
  })
  it('R1-10/13 no fallback for rest/completed days or partial data; removed course fails closed', () => {
    const zero = { ...availability, weeklyMinutes: { ...availability.weeklyMinutes, tuesday: 0 } }
    expect(choices(context([], state, zero))).toEqual([])
    expect(choices(context([session('done', 'finance', 'done')], state, zero), state, true)).toEqual([])
    expect(choices(context(), state, false, false)).toEqual([])
    expect(todayRecommendations(context(), [state], [], false, true, now)).toEqual([])
  })
})
