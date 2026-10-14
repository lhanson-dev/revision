import { describe, expect, it } from 'vitest'
import type { PlannerCandidate } from './planning'
import { buildPlannerProgramme, type ProgrammeAssessment } from './programme'
import { withProgrammeWeeklyFocus } from './weekly-focus'

const today = '2026-10-14'
const business = 'aqa:aqa-a-level:7132'
const psychology = 'aqa:aqa-a-level:7182'
const active = new Set([business, psychology])
const examDate = '2027-06-11'

function paper(overrides: Partial<ProgrammeAssessment> = {}): ProgrammeAssessment {
  return { assessmentId: 'paper-business', courseId: business, subjectId: 'business',
    title: 'Business Paper 1', assessmentDate: examDate, isActive: true, ...overrides }
}

function candidate(index: number, overrides: Partial<PlannerCandidate> = {}): PlannerCandidate {
  return {
    id: `business:topic-${index}:quick-check`, subjectId: 'business', courseId: business,
    assessmentId: 'paper-business', topicId: `topic-${index}`, activityType: 'quick-check',
    estimatedMinutes: 20, daysUntilAssessment: 240, assessmentImportance: 'normal',
    coverage: 0, evidenceStrength: 0.1, understanding: null, readiness: null,
    examWeight: null, learnerPreference: 0, recentlyCompleted: false,
    assessmentTargets: [{
      assessmentId: 'paper-business', assessmentDate: examDate, topicIds: [`topic-${index}`],
      daysUntilAssessment: 240, assessmentImportance: 'normal',
    }],
    ...overrides,
  }
}

function projection(candidates: PlannerCandidate[], papers: ProgrammeAssessment[] = [paper()], minutes: number | null = 120) {
  const programme = buildPlannerProgramme(today, papers, active, candidates)
  return withProgrammeWeeklyFocus(programme, candidates, () => minutes)
}

describe('FI-001 R2 meaningful weekly study focus', () => {
  it('replaces 35 identical course labels with distinct supported topics that change each week', () => {
    const candidates = Array.from({ length: 40 }, (_, i) => candidate(i))
    const result = projection(candidates)
    expect(result.weeks.length).toBeGreaterThan(30)
    expect(result.weeks.slice(0, 8).every((week) => week.topicFocus.length === 3)).toBe(true)
    const topics = result.weeks.slice(0, 8).flatMap((week) => week.topicFocus.map((focus) => focus.topicId))
    expect(new Set(topics).size).toBe(24)
    expect(result.weeks[0].topicFocus.map((focus) => focus.topicId))
      .not.toEqual(result.weeks[1].topicFocus.map((focus) => focus.topicId))
    expect(result.weeks.every((week) => !('items' in week) && !('acceptedSessions' in week))).toBe(true)
    expect(projection([...candidates].reverse())).toEqual(result)
  })

  it.each([[0, 0], [15, 0], [30, 1], [45, 2], [120, 3]] as const)(
    'R2-04 %d saved weekly minutes yields at most %d realistic whole candidate topics',
    (minutes, expected) => {
      const week = projection([candidate(1), candidate(2), candidate(3)], [paper()], minutes).weeks[0]
      expect(week.topicFocus).toHaveLength(expected)
      expect(week.topicFocus.length * 20).toBeLessThanOrEqual(minutes)
    },
  )

  it('unknown capacity shows only possibilities, not an invented number of fitted sessions', () => {
    const result = projection([candidate(1), candidate(2), candidate(3)], [paper()], null)
    expect(result.weeks[0].availableMinutes).toBeNull()
    expect(result.weeks[0].topicFocus).toHaveLength(2)
  })

  it('respects exact paper cutoff and shares later-paper topics without duplicating course/topic work', () => {
    const early = paper({ assessmentId: 'business-one', assessmentDate: '2026-10-20' })
    const later = paper({ assessmentId: 'business-two', assessmentDate: '2026-11-10' })
    const shared = candidate(1, { assessmentTargets: [
      { assessmentId: 'business-one', assessmentDate: '2026-10-20', topicIds: ['topic-1'],
        daysUntilAssessment: 6, assessmentImportance: 'normal' },
      { assessmentId: 'business-two', assessmentDate: '2026-11-10', topicIds: ['topic-1'],
        daysUntilAssessment: 27, assessmentImportance: 'normal' },
    ] })
    const result = projection([shared, { ...shared, id: 'duplicate-intent' }], [early, later])
    const afterFirst = result.weeks.find((week) => week.weekStart === '2026-10-26')
    expect(afterFirst?.topicFocus).toEqual([{
      courseId: business, topicId: 'topic-1', activityType: 'quick-check', revisit: true,
    }])
    expect(result.weeks.at(-1)?.topicFocus).toHaveLength(1) // Mon before Tuesday exam.
    const examOnMonday = projection([candidate(1, { assessmentTargets: [{
      assessmentId: 'paper-business', assessmentDate: '2026-10-19', topicIds: ['topic-1'],
      daysUntilAssessment: 5, assessmentImportance: 'normal',
    }] })], [paper({ assessmentDate: '2026-10-19' })])
    expect(examOnMonday.weeks.at(-1)?.topicFocus).toEqual([])
  })

  it('avoids course starvation when two real courses have supported eligible work', () => {
    const psychologyPaper = paper({ assessmentId: 'paper-psychology', courseId: psychology,
      subjectId: 'psychology', title: 'Psychology Paper 3', assessmentDate: '2027-06-01' })
    const psych = candidate(1, { id: 'psychology:topic-1', courseId: psychology,
      subjectId: 'psychology', assessmentTargets: [{
        assessmentId: 'paper-psychology', assessmentDate: '2027-06-01', topicIds: ['topic-1'],
        daysUntilAssessment: 230, assessmentImportance: 'normal',
      }],
    })
    const result = projection([candidate(1), candidate(2), psych], [paper(), psychologyPaper], 45)
    expect(result.weeks[0].topicFocus.map((focus) => focus.courseId)).toEqual([psychology, business])
    expect(result.weeks[0].topicFocus.map((focus) => focus.topicId)).toEqual(['topic-1', 'topic-1'])
  })

  it('R2 multi-course non-starvation alternates eligible subjects in narrow weekly capacity', () => {
    const psychologyPaper = paper({ assessmentId: 'paper-psychology', courseId: psychology,
      subjectId: 'psychology', assessmentDate: '2027-06-01' })
    const psych = candidate(2, { id: 'psychology:topic-2', courseId: psychology, subjectId: 'psychology',
      assessmentTargets: [{
        assessmentId: 'paper-psychology', assessmentDate: '2027-06-01', topicIds: ['topic-2'],
        daysUntilAssessment: 230, assessmentImportance: 'normal',
      }],
    })
    const result = projection([candidate(1), psych], [paper(), psychologyPaper], 30)
    expect(result.weeks.slice(0, 4).map((week) => week.topicFocus[0]?.courseId)).toEqual([
      psychology, business, psychology, business,
    ])
  })

  it('never suggests a topic from unsupported course, unselected paper or unverified assessment target', () => {
    const bad = candidate(1, { courseId: psychology, assessmentTargets: [{
      assessmentId: 'unknown-paper-3', assessmentDate: examDate, topicIds: ['unknown'],
      daysUntilAssessment: 240, assessmentImportance: 'normal',
    }] })
    const result = projection([bad], [paper()])
    expect(result.weeks.every((week) => week.topicFocus.length === 0)).toBe(true)
  })
})
