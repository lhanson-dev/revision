import { describe, expect, it, vi } from 'vitest'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import { buildAdaptivePlan } from '../engine/planning/planning'
import type { RevisionAssessment, RevisionAvailabilityProfile } from '../services/planning/planner-service'
import { buildCatalogue, createCourseLearningState } from './catalogue-model'
import { allCatalogueCourses } from './learner-programme'
import { plannerCandidatesFromLearningState, plannerDaysFromAvailability } from './planner-model'
import { activeNotNow, dayKey } from './rev-suggestions'

const course = allCatalogueCourses(buildCatalogue(listAvailableContentAdapters()))
  .find(({ course }) => course.id === 'aqa:aqa-a-level:7132')!.course
const topicId = course.learningAdapter.listTopics()[0]!.id
const courseState = createCourseLearningState(course, [])
const availability: RevisionAvailabilityProfile = {
  userId: 'r1-12-student', timezone: 'Europe/London', weekdayMinutes: 80, weekendMinutes: 40,
  weeklyMinutes: {
    monday: 80, tuesday: 80, wednesday: 80, thursday: 80,
    friday: 80, saturday: 40, sunday: 40,
  },
}

const londonTransitions = [
  {
    transition: 'spring-forward (a 23-hour local day)',
    beforeUtc: '2026-03-29T00:30:00Z',
    afterUtc: '2026-03-29T01:30:00Z',
    examDayUtc: '2026-03-29T23:15:00Z',
    today: '2026-03-29', tomorrow: '2026-03-30',
    offsetBefore: 0, offsetAfter: -60,
  },
  {
    transition: 'autumn fall-back (a 25-hour local day)',
    beforeUtc: '2026-10-25T00:30:00Z',
    afterUtc: '2026-10-25T01:30:00Z',
    examDayUtc: '2026-10-26T00:15:00Z',
    today: '2026-10-25', tomorrow: '2026-10-26',
    offsetBefore: -60, offsetAfter: 0,
  },
] as const

describe('FI-001 R1-12: real Europe/London UTC-offset changes, local exam cutoff and REV dismissal', () => {
  it.each(londonTransitions)('$transition preserves the same local day and deterministic plan', ({
    beforeUtc, afterUtc, examDayUtc, today, tomorrow, offsetBefore, offsetAfter,
  }) => {
    // The runner commonly uses UTC. Exercise the production local-date functions under
    // an actual Europe/London timezone rather than merely naming a DST calendar date.
    vi.stubEnv('TZ', 'Europe/London')
    try {
      expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('Europe/London')
      const before = new Date(beforeUtc)
      const after = new Date(afterUtc)
      const onExamDay = new Date(examDayUtc)
      expect(after.getTime() - before.getTime()).toBe(60 * 60 * 1000)
      expect(before.getTimezoneOffset()).toBe(offsetBefore)
      expect(after.getTimezoneOffset()).toBe(offsetAfter)
      expect(dayKey(before)).toBe(today)
      expect(dayKey(after)).toBe(today)
      expect(dayKey(onExamDay)).toBe(tomorrow)

      const assessment: RevisionAssessment = {
        assessmentId: 'r1-12-paper-1', userId: 'r1-12-student',
        subjectId: 'business', courseId: course.id, moduleId: course.modules[0]!.manifest.id,
        assessmentType: 'public_exam', title: 'Paper 1', assessmentDate: tomorrow,
        relativeImportance: 'normal', scope: { topicIds: [topicId] }, isActive: true,
      }
      const beforeCandidates = plannerCandidatesFromLearningState([courseState], [assessment], [], before)
      const afterCandidates = plannerCandidatesFromLearningState([courseState], [assessment], [], after)
      expect(beforeCandidates).toHaveLength(1)
      expect(beforeCandidates[0]!.daysUntilAssessment).toBe(1)
      expect(afterCandidates).toEqual(beforeCandidates)

      const beforeDays = plannerDaysFromAvailability(availability, [], [assessment], before)
      const afterDays = plannerDaysFromAvailability(availability, [], [assessment], after)
      expect(afterDays).toEqual(beforeDays)
      expect(beforeDays.slice(0, 2)).toEqual([
        { date: today, availableMinutes: 40 }, // Real Sunday, despite UTC offset change.
        { date: tomorrow, availableMinutes: 80 }, // Local Monday exam date.
      ])
      const plan = buildAdaptivePlan(beforeCandidates, beforeDays)
      expect(plan.today).toHaveLength(1)
      expect(plan.today[0]!.assessmentId).toBe(assessment.assessmentId)
      expect(plan.schedule.slice(1).every((day) => day.items.length === 0)).toBe(true)
      expect(buildAdaptivePlan(afterCandidates, afterDays)).toEqual(plan)

      // A REV 'Not now' selection survives the repeated/missing clock hour,
      // but expires when the actual local day changes.
      const dismissed = { day: today, keys: ['r1-12-recommendation'] }
      expect(activeNotNow(dismissed, before)).toEqual(dismissed.keys)
      expect(activeNotNow(dismissed, after)).toEqual(dismissed.keys)
      expect(activeNotNow(dismissed, onExamDay)).toEqual([])
      expect(plannerCandidatesFromLearningState([courseState], [assessment], [], onExamDay))
        .toEqual([]) // No paper-only work on the actual local exam date.
    } finally {
      vi.unstubAllEnvs()
    }
  })
})
