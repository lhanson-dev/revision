import { describe, expect, it } from 'vitest'
import type { ModuleLearningState } from './catalogue-model'
import { buildPlannerSnapshot, plannerCandidatesFromLearningState, plannerDaysFromAvailability } from './planner-model'
import type { RevisionAssessment, RevisionAvailabilityProfile, RevisionPlanningPreference } from '../services/planning/planner-service'

const assessment: RevisionAssessment = {
  assessmentId: 'assessment-1',
  userId: 'user-1',
  subjectId: 'business',
  courseId: null,
  moduleId: null,
  assessmentType: 'mock',
  title: 'Business mock',
  assessmentDate: '2026-08-26',
  relativeImportance: 'high',
  scope: {},
  isActive: true,
}

const state = {
  adapter: {
    manifest: { subject: { id: 'business', name: 'Business' } },
  },
  evidence: [],
  readiness: {
    score: null,
    confidence: 'insufficient',
    evidenceCount: 0,
  },
  recommendation: {
    topicId: 'operations',
    activity: 'quick-check',
  },
  recommendationTopic: { id: 'operations', shortTitle: 'Operations' },
  evidencedTopics: 0,
  topicCount: 6,
} as unknown as ModuleLearningState

const availability: RevisionAvailabilityProfile = {
  userId: 'user-1',
  weekdayMinutes: 45,
  weekendMinutes: 90,
  timezone: 'Europe/London',
}

describe('planner model bridge', () => {
  it('turns the existing learning recommendation into a deterministic planner candidate', () => {
    const now = new Date('2026-08-19T09:00:00')
    const candidates = plannerCandidatesFromLearningState([state], [assessment], [], now)

    expect(candidates).toHaveLength(1)
    expect(candidates[0]).toMatchObject({
      subjectId: 'business',
      assessmentId: 'assessment-1',
      topicId: 'operations',
      activityType: 'quick-check',
      assessmentImportance: 'high',
      evidenceStrength: 0.2,
      understanding: null,
      readiness: null,
    })
  })

  it('applies a bounded learner preference as planning context rather than learning evidence', () => {
    const now = new Date('2026-08-19T09:00:00')
    const preference: RevisionPlanningPreference = {
      preferenceId: 'preference-1',
      userId: 'user-1',
      preferenceType: 'prefer_subject',
      subjectId: 'business',
      activityType: null,
      startsOn: '2026-08-19',
      endsOn: '2026-08-23',
      strength: 2,
      source: 'rev_negotiated',
      rationale: 'Focus on Business this week',
      isActive: true,
    }

    const [candidate] = plannerCandidatesFromLearningState([state], [assessment], [preference], now)
    expect(candidate?.learnerPreference).toBe(2)
    expect(candidate?.evidenceStrength).toBe(0.2)
    expect(candidate?.readiness).toBeNull()
  })

  it('uses normal weekday/weekend capacity and date exceptions without converting it into a clock timetable', () => {
    const now = new Date('2026-08-19T09:00:00')
    const days = plannerDaysFromAvailability(availability, [{
      exceptionId: 'exception-1',
      userId: 'user-1',
      localDate: '2026-08-22',
      availableMinutes: 0,
      note: 'Unavailable',
    }], [assessment], now)

    expect(days[0]).toEqual({ date: '2026-08-19', availableMinutes: 45 })
    expect(days.find((day) => day.date === '2026-08-22')?.availableMinutes).toBe(0)
    expect(days.find((day) => day.date === '2026-08-23')?.availableMinutes).toBe(90)
  })

  it('produces no plan until both useful evidence guidance and realistic availability exist', () => {
    const now = new Date('2026-08-19T09:00:00')
    expect(buildPlannerSnapshot([state], [assessment], null, [], [], now)).toBeNull()
    expect(buildPlannerSnapshot([], [assessment], availability, [], [], now)).toBeNull()
  })

  it('builds a current-day plan when both planning context and evidence guidance are available', () => {
    const now = new Date('2026-08-19T09:00:00')
    const snapshot = buildPlannerSnapshot([state], [assessment], availability, [], [], now)

    expect(snapshot?.today).toHaveLength(1)
    expect(snapshot?.today[0]).toMatchObject({
      subjectId: 'business',
      topicId: 'operations',
      activityType: 'quick-check',
    })
  })
})
