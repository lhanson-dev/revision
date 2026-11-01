import { describe, expect, it } from 'vitest'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import type { RevisionAssessment, RevisionAvailabilityProfile } from '../services/planning/planner-service'
import { buildCatalogue, createCourseLearningState } from './catalogue-model'
import { allCatalogueCourses } from './learner-programme'
import { buildLearnerPreparationProgramme, buildPlannerSnapshot } from './planner-model'

// #694: approved published content, not synthetic candidate IDs. This test
// describes the CURRENT finite-opportunity behaviour; it is not a claim that
// the learner's preparation programme is educationally complete.
const catalogue = allCatalogueCourses(buildCatalogue(listAvailableContentAdapters()))
const ids = ['aqa:aqa-a-level:7132', 'aqa:aqa-a-level:7182']
const courses = ids.map((id) => {
  const course = catalogue.find((item) => item.course.id === id)?.course
  if (!course) throw new Error('Missing published course fixture ' + id)
  return course
})
const now = new Date(2026, 9, 26, 9)
const states = courses.map((course) => createCourseLearningState(course, []))
const dates = ['2027-05-18', '2027-05-21', '2027-06-10', '2027-06-14']
const exams: RevisionAssessment[] = courses.flatMap((course, ci) =>
  course.modules.slice(0, 2).map((module, pi) => ({
    assessmentId: `fixture-${ci}-${pi}`, userId: 'fixture',
    subjectId: course.subjectId, courseId: course.id,
    moduleId: module.manifest.id, assessmentType: 'public_exam',
    title: `${course.id} paper ${pi + 1}`,
    assessmentDate: dates[ci * 2 + pi], relativeImportance: 'normal',
    scope: {}, isActive: true,
  })))
const availability: RevisionAvailabilityProfile = {
  userId: 'fixture', timezone: 'Europe/London', weekdayMinutes: 45, weekendMinutes: 60,
  weeklyMinutes: {
    monday: 45, tuesday: 45, wednesday: 45, thursday: 45,
    friday: 45, saturday: 60, sunday: 60,
  },
}

describe('REC-06 / Issue #694: published-content preparation diagnostic', () => {
  it('tracks source-backed learning supply and unserved weeks without manufacturing appointments', () => {
    const { programme, candidates } = buildLearnerPreparationProgramme(
      states, exams, availability, [], [], now, [])
    const objectives = programme.weeks.flatMap((week) => week.objectives)
    const candidateIds = objectives.map((item) => item.candidateId)
    const publishedCandidateById = new Map(candidates.map((item) => [item.id, item]))
    const learning = objectives.filter((item) => item.activityType === 'learn')
    expect(programme.finalKnownAssessment).toBe('2027-06-14')
    expect(programme.weeks.length).toBeGreaterThan(25)
    expect(candidates.length).toBeGreaterThan(0)
    expect(objectives.length).toBeGreaterThan(0)
    expect(new Set(candidateIds).size).toBe(candidateIds.length)
    expect(objectives.every((objective) => objective.assessmentDate > (objective.forecastDate ?? programme.today))).toBe(true)
    // Formerly sparse weeks can now contain distinct, genuinely published
    // pages. Do not require empty weeks merely to preserve the old screenshot:
    // ensure each allocated Learn objective resolves to its actual source page.
    expect(learning.length).toBeGreaterThan(0)
    expect(learning.every((objective) => {
      const candidate = publishedCandidateById.get(objective.candidateId)
      const pageId = candidate?.learnTarget?.learnPageId
      const source = courses.find((course) => course.id === objective.courseId)
      return !!pageId && source?.learningAdapter.getLearnPage(pageId)?.topicId === objective.topicId
    })).toBe(true)
    expect(programme.allocatedMinutes + programme.unserved.reduce(
      (total, item) => total + item.estimatedMinutes, 0)).toBe(programme.requiredMinutes)
  })

  it('keeps the near-term executable schedule bounded and date-safe', () => {
    const result = buildPlannerSnapshot(states, exams, availability, [], [], now, [], 14)
    expect(result).not.toBeNull()
    expect(result!.schedule.length).toBeLessThanOrEqual(14)
    expect(result!.schedule.every((day) =>
      day.items.reduce((sum, item) => sum + item.estimatedMinutes, 0) <= day.availableMinutes)).toBe(true)
  })

  it.todo('acceptance: verify educationally justified follow-up opportunities across sparse weeks after learning evidence changes')
  it.todo('acceptance: authenticated learner browser comparison of Week, Home, REV and persisted activity changes')
})
