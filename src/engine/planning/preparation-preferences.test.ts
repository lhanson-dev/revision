import { describe, expect, it } from 'vitest'
import type { PlannerCandidate } from './planning'
import { buildPlannerProgramme, type ProgrammeAssessment } from './programme'
import { buildPreparationProgramme } from './preparation'

const today = '2026-10-15'
const examDate = '2026-10-20'
const business = 'aqa:aqa-a-level:7132'
const psychology = 'aqa:aqa-a-level:7182'

const papers: ProgrammeAssessment[] = [
  { assessmentId: 'business-paper', subjectId: 'business', courseId: business,
    title: 'Business paper', assessmentDate: examDate, isActive: true },
  { assessmentId: 'psychology-paper', subjectId: 'psychology', courseId: psychology,
    title: 'Psychology paper', assessmentDate: examDate, isActive: true },
]

function candidate(id: string, courseId: string, assessmentId: string, learnerPreference: -1 | 0 | 1 | 2 | 3 = 0): PlannerCandidate {
  return {
    id, courseId, subjectId: courseId === business ? 'business' : 'psychology',
    topicId: id, assessmentId, daysUntilAssessment: 5, activityType: 'quick-check',
    estimatedMinutes: 20, assessmentImportance: 'high', coverage: 0,
    evidenceStrength: 0, understanding: null, readiness: null, examWeight: null,
    learnerPreference, recentlyCompleted: false,
    assessmentTargets: [{ assessmentId, assessmentDate: examDate, topicIds: [id],
      daysUntilAssessment: 5, assessmentImportance: 'high' }],
  }
}

function firstWeek(candidates: PlannerCandidate[]) {
  const horizon = buildPlannerProgramme(today, papers, new Set([business, psychology]), candidates)
  const programme = buildPreparationProgramme(horizon, candidates,
    (week) => week.weekStart === '2026-10-12' ? 20 : 0)
  return { proposed: programme.weeks[0]?.objectives.map((item) => item.candidateId) ?? [],
    omitted: programme.unserved.map((item) => item.candidateId).sort(),
    minutes: programme.weeks[0]?.allocatedMinutes }
}

describe('FI-001 whole-programme learner choice within hard education constraints', () => {
  it('honours a learner preference when same-deadline/evidence requirements compete for one feasible slot', () => {
    const a = candidate('a-business', business, 'business-paper')
    const b = candidate('z-psychology', psychology, 'psychology-paper')
    expect(firstWeek([a, b]).proposed).toEqual(['a-business'])
    const chosen = firstWeek([a, { ...b, learnerPreference: 3 }])
    expect(chosen.proposed).toEqual(['z-psychology'])
    expect(chosen.omitted).toEqual(['a-business'])
    expect(chosen.minutes).toBe(20)
    expect(firstWeek([{ ...b, learnerPreference: 3 }, a])).toEqual(chosen)
    expect(firstWeek([{ ...a, learnerPreference: -1 }, b]).proposed).toEqual(['z-psychology'])
  })

  it('does not permit a preference to postpone an earlier exam obligation behind a later one', () => {
    const early: ProgrammeAssessment = { ...papers[0], assessmentDate: '2026-10-17' }
    const late = papers[1]
    const a = { ...candidate('a-business', business, early.assessmentId),
      assessmentTargets: [{ assessmentId: early.assessmentId, assessmentDate: early.assessmentDate,
        topicIds: ['a-business'], daysUntilAssessment: 2, assessmentImportance: 'high' as const }] }
    const b = candidate('z-psychology', psychology, late.assessmentId, 3)
    const horizon = buildPlannerProgramme(today, [early, late], new Set([business, psychology]), [a, b])
    const programme = buildPreparationProgramme(horizon, [a, b],
      (week) => week.weekStart === '2026-10-12' ? 20 : 0)
    expect(programme.weeks[0]?.objectives.map((item) => item.candidateId)).toEqual(['a-business'])
    expect(programme.weeks[0]?.objectives[0]?.assessmentDate).toBe('2026-10-17')
  })
})
