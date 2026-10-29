import { describe, expect, it } from 'vitest'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import type { LearningEvidence } from '../engine/evidence/evidence'
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
  it('still produces near-term work when the learner has accumulated scored or recall evidence', () => {
    // Only synthetic event metadata from the published packs; do not read live
    // learner answers to reproduce the previously observed evidence volume.
    const evidence: LearningEvidence[] = courses.flatMap((course, courseIndex) => {
      const cards = course.learningAdapter.listFlashcards()
      if (cards.length === 0) throw new Error('Missing published retrieval assets')
      return Array.from({ length: 42 }, (_, i) => {
        const card = cards[i % cards.length]!
        return {
          id: `synthetic-${courseIndex}-${i}`, schemaVersion: 1 as const,
          moduleId: course.learningAdapter.manifest.id,
          topicId: card.topic, contentId: card.id,
          occurredAt: '2026-10-20T09:00:00.000Z',
          source: 'flashcard' as const, rating: (i % 3) as 0 | 1 | 2,
        }
      })
    })
    const evidencedStates = courses.map((course) => createCourseLearningState(course, evidence))
    const snapshot = buildPlannerSnapshot(evidencedStates, exams, availability, [], [], now, [], 14)
    expect(snapshot?.schedule.some((day) => day.items.length > 0)).toBe(true)
  })

  it('resolves whole-course assessment scopes and produces supported near-term work', () => {
    expect(states).toHaveLength(2)
    expect(exams.every((exam) => stateForAssessment(states, exam) !== undefined)).toBe(true)
    const prepared = buildLearnerPreparationProgramme(states, exams, availability, [], [], now, [])
    expect(prepared.candidates.length).toBeGreaterThan(0)
    expect(prepared.programme.weeks.some((week) => week.objectives.length > 0)).toBe(true)
    const snapshot = buildPlannerSnapshot(states, exams, availability, [], [], now, [], 14)
    const november = prepared.programme.weeks.filter((week) =>
      week.visibleUntil >= '2026-11-01' && week.visibleFrom <= '2026-11-30')
    const stats = {
      supportedCandidates: prepared.candidates.length,
      requiredMinutes: prepared.programme.requiredMinutes,
      programmeWeeks: prepared.programme.weeks.length,
      overallObjectives: prepared.programme.weeks.reduce((n, week) => n + week.objectives.length, 0),
      octoberCurrentWeek: prepared.programme.weeks.find((week) =>
        week.visibleFrom <= '2026-10-29' && week.visibleUntil >= '2026-10-29')?.objectives.length ?? 0,
      novemberWeeks: november.map((week) => ({ start: week.weekStart, objectives: week.objectives.length,
        minutes: week.allocatedMinutes, capacity: week.availableMinutes })),
      nearTermTasks: snapshot?.schedule.reduce((n, day) => n + day.items.length, 0) ?? 0,
      nearTermSubjects: [...new Set(snapshot?.schedule.flatMap((day) =>
        day.items.map((item) => item.subjectId)) ?? [])],
    }
    // Dated synthetic diagnosis (not acceptance of this thin schedule).
    console.info('PLANNER_SCREENSHOT_DIAGNOSTIC ' + JSON.stringify(stats))
    expect(snapshot).not.toBeNull()
    expect(snapshot!.schedule.some((day) => day.items.length > 0)).toBe(true)
    // The prior production view had exactly one 15m item despite available
    // weekday capacity and published material in *both* active courses.
    // This is a regression threshold for this fixture, not a universal quota.
    const nearTerm = snapshot!.schedule.flatMap((day) => day.items)
    expect(nearTerm.length).toBeGreaterThan(1)
    expect(nearTerm.reduce((minutes, item) => minutes + item.estimatedMinutes, 0)).toBeGreaterThan(15)
    expect(new Set(nearTerm.map((item) => item.courseId))).toEqual(new Set(ids))
    expect(snapshot!.schedule.flatMap((day) => day.items).every((item) =>
      item.courseId === ids[0] || item.courseId === ids[1])).toBe(true)
  })
})
