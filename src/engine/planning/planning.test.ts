import { describe, expect, it } from 'vitest'
import { buildAdaptivePlan, rankPlannerCandidate, type PlannerCandidate } from './planning'

function candidate(overrides: Partial<PlannerCandidate> = {}): PlannerCandidate {
  return {
    id: 'business-finance',
    subjectId: 'business',
    assessmentId: 'business-mock',
    topicId: 'finance',
    activityType: 'exam-question',
    estimatedMinutes: 30,
    daysUntilAssessment: 10,
    assessmentImportance: 'normal',
    coverage: 0.5,
    evidenceStrength: 0.5,
    understanding: 0.55,
    readiness: 0.5,
    examWeight: 0.2,
    learnerPreference: 0,
    recentlyCompleted: false,
    ...overrides,
  }
}

describe('adaptive planner', () => {
  it('ranks an urgent weak under-covered area above an already-strong area', () => {
    const urgentWeak = rankPlannerCandidate(candidate())
    const strong = rankPlannerCandidate(candidate({
      id: 'business-marketing',
      topicId: 'marketing',
      coverage: 0.95,
      evidenceStrength: 0.9,
      understanding: 0.9,
      readiness: 0.85,
      recentlyCompleted: true,
    }))

    expect(urgentWeak.priority).toBeGreaterThan(strong.priority)
    expect(urgentWeak.reasons).toContain('ASSESSMENT_SOON')
    expect(urgentWeak.reasons).toContain('UNDER_COVERED')
    expect(strong.reasons).toContain('ALREADY_STRONG')
  })

  it('allows a learner preference to influence sequencing without changing evidence values', () => {
    const neutral = rankPlannerCandidate(candidate({ daysUntilAssessment: 20 }))
    const preferred = rankPlannerCandidate(candidate({
      id: 'spanish-essay',
      subjectId: 'spanish',
      assessmentId: 'spanish-test',
      topicId: 'essay',
      daysUntilAssessment: 20,
      learnerPreference: 3,
    }))

    expect(preferred.priority).toBeGreaterThan(neutral.priority)
    expect(preferred.reasons).toContain('LEARNER_PRIORITY')
    expect(preferred.understanding).toBe(neutral.understanding)
    expect(preferred.readiness).toBe(neutral.readiness)
  })

  it('enters prioritising mode when useful workload exceeds realistic remaining capacity', () => {
    const plan = buildAdaptivePlan(
      [
        candidate({ id: 'a', estimatedMinutes: 60 }),
        candidate({ id: 'b', topicId: 'operations', estimatedMinutes: 60, daysUntilAssessment: 12 }),
        candidate({ id: 'c', topicId: 'marketing', estimatedMinutes: 60, daysUntilAssessment: 14 }),
      ],
      [
        { date: '2026-08-19', availableMinutes: 45 },
        { date: '2026-08-20', availableMinutes: 45 },
      ],
    )

    expect(plan.capacityState).toBe('prioritising')
    expect(plan.requiredUsefulMinutes).toBe(180)
    expect(plan.remainingCapacityMinutes).toBe(90)
    expect(plan.today.length).toBeGreaterThan(0)
    expect(plan.today[0].reasons).toContain('CAPACITY_CONSTRAINED')
  })

  it('does not create task debt: today is rebuilt from current ranked candidates and capacity', () => {
    const plan = buildAdaptivePlan(
      [
        candidate({ id: 'new-priority', topicId: 'operations', daysUntilAssessment: 2, estimatedMinutes: 30 }),
        candidate({ id: 'old-strong-work', topicId: 'marketing', daysUntilAssessment: 20, estimatedMinutes: 30, understanding: 0.95, coverage: 0.95, recentlyCompleted: true }),
      ],
      [{ date: '2026-08-19', availableMinutes: 30 }],
    )

    expect(plan.today).toHaveLength(1)
    expect(plan.today[0].candidateId).toBe('new-priority')
  })

  it('uses deterministic tie-breaking when priorities are equal', () => {
    const plan = buildAdaptivePlan(
      [candidate({ id: 'b' }), candidate({ id: 'a' })],
      [{ date: '2026-08-19', availableMinutes: 60 }],
    )

    expect(plan.ranked.map((item) => item.id)).toEqual(['a', 'b'])
  })
})
