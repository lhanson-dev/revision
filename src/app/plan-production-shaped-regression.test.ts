import { describe, expect, it } from 'vitest'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import type { RevisionAssessment, RevisionAvailabilityProfile } from '../services/planning/planner-service'
import { buildCatalogue, createCourseLearningState } from './catalogue-model'
import { allCatalogueCourses } from './learner-programme'
import { buildLearnerPreparationProgramme, buildPlannerSnapshot, stateForAssessment } from './planner-model'

/**
 * #694 regression: production-shaped learner configuration, NOT an individual's
 * credentials or learning results. Live read-only aggregate review on 29 Oct 2026
 * confirmed active future course assessments, zero module IDs, empty scopes and
 * positive weekday availability, yet the user reported no planned activities.
 */
const catalogue = allCatalogueCourses(buildCatalogue(listAvailableContentAdapters()))
const ids = ['aqa:aqa-a-level:7132', 'aqa:aqa-a-level:7182']
const courses = ids.map((id) => {
  const course = catalogue.find((item) => item.course.id === id)?.course
  if (!course) throw new Error('Missing published course ' + id)
  return course
})
const states = courses.map((course) => createCourseLearningState(course, []))
const now = new Date(2026, 9, 29, 9)
const exams: RevisionAssessment[] = [
  { assessmentId: 'psychology-exam', userId: 'synthetic', courseId: ids[1]!,
    subjectId: 'psychology', moduleId: null, assessmentType: 'public_exam',
    title: 'Psychology assessment', assessmentDate: '2027-04-08',
    relativeImportance: 'normal', scope: {}, isActive: true },
  ...['2027-05-20', '2027-06-03', '2027-06-10'].map((assessmentDate, i) => ({
    assessmentId: 'business-' + i, userId: 'synthetic', courseId: ids[0]!,
    subjectId: 'business', moduleId: null, assessmentType: 'public_exam' as const,
    title: 'Business assessment ' + i, assessmentDate,
    relativeImportance: 'normal' as const, scope: {}, isActive: true,
  })),
]
const availability: RevisionAvailabilityProfile = {
  userId: 'synthetic', timezone: 'Europe/London', weekdayMinutes: 45,
  weekendMinutes: 0, weeklyMinutes: {
    monday: 45, tuesday: 45, wednesday: 45, thursday: 45, friday: 45,
    saturday: 0, sunday: 0,
  },
}

describe('Plan: configured production-shaped Business/Psychology learner', () => {
  it('resolves whole-course assessment scopes and produces supported near-term work', () => {
    expect(states).toHaveLength(2)
    expect(exams.every((exam) => stateForAssessment(states, exam) !== undefined)).toBe(true)
    const prepared = buildLearnerPreparationProgramme(states, exams, availability, [], [], now, [])
    expect(prepared.candidates.length).toBeGreaterThan(0)
    expect(prepared.programme.weeks.some((week) => week.objectives.length > 0)).toBe(true)
    const snapshot = buildPlannerSnapshot(states, exams, availability, [], [], now, [], 14)
    expect(snapshot).not.toBeNull()
    expect(snapshot!.schedule.some((day) => day.items.length > 0)).toBe(true)
    expect(snapshot!.schedule.flatMap((day) => day.items).every((item) =>
      item.courseId === ids[0] || item.courseId === ids[1])).toBe(true)
  })
})
