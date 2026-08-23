import { describe, expect, it } from 'vitest'
import type { ModuleLearningState } from './catalogue-model'
import { buildPlannerSnapshot, plannerCandidatesFromLearningState, plannerDaysFromAvailability } from './planner-model'
import type { RevisionAssessment, RevisionAvailabilityProfile, RevisionPlanningPreference } from '../services/planning/planner-service'

const activeCourseId = 'aqa:aqa-as:7131'

const assessment: RevisionAssessment = {
  assessmentId: 'assessment-1',
  userId: 'user-1',
  subjectId: 'business',
  courseId: activeCourseId,
  moduleId: null,
  assessmentType: 'mock',
  title: 'Business mock',
  assessmentDate: '2026-08-26',
  relativeImportance: 'high',
  scope: {},
  isActive: true,
}

const topics = [
  { id: 'operations', shortTitle: 'Operations' },
  { id: 'finance', shortTitle: 'Finance' },
  { id: 'marketing', shortTitle: 'Marketing' },
]

function stateFor(courseId = activeCourseId) {
  const [, qualificationId, specificationCode] = courseId.split(':')
  return {
    adapter: {
      manifest: {
        id: `module-${specificationCode}`,
        subject: { id: 'business', name: 'Business' },
        examBoard: { id: 'aqa', name: 'AQA' },
        qualification: { id: qualificationId, name: qualificationId },
        specificationCode,
      },
      listTopics: () => topics,
      listQuestions: () => [{ id: 'q1' }],
      listFlashcards: () => [{ id: 'f1' }],
      getTopic: (topicId: string) => topics.find((topic) => topic.id === topicId),
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
    topicCount: topics.length,
  } as unknown as ModuleLearningState
}

const state = stateFor()

const availability: RevisionAvailabilityProfile = {
  userId: 'user-1',
  weekdayMinutes: 45,
  weekendMinutes: 90,
  timezone: 'Europe/London',
}

describe('planner model bridge', () => {
  it('turns the assessment scope into topic-level course work candidates rather than one synthetic task', () => {
    const now = new Date('2026-08-19T09:00:00')
    const candidates = plannerCandidatesFromLearningState([state], [assessment], [], now)

    expect(candidates).toHaveLength(3)
    expect(candidates.map((candidate) => candidate.topicId)).toEqual(['operations', 'finance', 'marketing'])
    expect(candidates[0]).toMatchObject({
      subjectId: 'business',
      courseId: activeCourseId,
      assessmentId: 'assessment-1',
      topicId: 'operations',
      activityType: 'quick-check',
      assessmentImportance: 'high',
      evidenceStrength: 0.2,
      understanding: null,
      readiness: null,
    })
  })

  it('does not create candidates for an assessment outside the active course state', () => {
    const now = new Date('2026-08-19T09:00:00')
    const outsideCourse = { ...assessment, courseId: 'aqa:aqa-a-level:7132' }
    expect(plannerCandidatesFromLearningState([state], [outsideCourse], [], now)).toEqual([])
  })

  it('fails safely for an ambiguous legacy subject-only assessment', () => {
    const now = new Date('2026-08-19T09:00:00')
    const legacy = { ...assessment, courseId: null }
    const secondCourseState = stateFor('aqa:aqa-a-level:7132')
    expect(plannerCandidatesFromLearningState([state, secondCourseState], [legacy], [], now)).toEqual([])
  })

  it('still accepts an unambiguous legacy subject-only assessment', () => {
    const now = new Date('2026-08-19T09:00:00')
    const legacy = { ...assessment, courseId: null }
    const candidates = plannerCandidatesFromLearningState([state], [legacy], [], now)
    expect(candidates.length).toBeGreaterThan(0)
    expect(candidates.every((candidate) => candidate.courseId === activeCourseId)).toBe(true)
  })

  it('respects explicit topic scope without forcing the learner through a giant topic list', () => {
    const now = new Date('2026-08-19T09:00:00')
    const scoped = { ...assessment, scope: { topicIds: ['finance'] } }
    const candidates = plannerCandidatesFromLearningState([state], [scoped], [], now)
    expect(candidates).toHaveLength(1)
    expect(candidates[0]?.topicId).toBe('finance')
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

    const candidates = plannerCandidatesFromLearningState([state], [assessment], [preference], now)
    expect(candidates.every((candidate) => candidate.learnerPreference === 2)).toBe(true)
    expect(candidates.every((candidate) => candidate.evidenceStrength === 0.2)).toBe(true)
    expect(candidates.every((candidate) => candidate.readiness === null)).toBe(true)
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

  it('produces no plan until both useful planning candidates and realistic availability exist', () => {
    const now = new Date('2026-08-19T09:00:00')
    expect(buildPlannerSnapshot([state], [assessment], null, [], [], now)).toBeNull()
    expect(buildPlannerSnapshot([], [assessment], availability, [], [], now)).toBeNull()
  })

  it('builds today from the highest-priority work without treating the rest as task debt', () => {
    const now = new Date('2026-08-19T09:00:00')
    const snapshot = buildPlannerSnapshot([state], [assessment], availability, [], [], now)

    expect(snapshot?.today.length).toBeGreaterThan(0)
    expect(snapshot?.today[0]).toMatchObject({
      subjectId: 'business',
      courseId: activeCourseId,
      topicId: 'finance',
      activityType: 'quick-check',
    })
    expect(snapshot?.ranked).toHaveLength(3)
  })

  it('enters priority mode when broad remaining useful workload exceeds realistic capacity', () => {
    const now = new Date('2026-08-19T09:00:00')
    const tinyCapacity = { ...availability, weekdayMinutes: 5, weekendMinutes: 5 }
    const snapshot = buildPlannerSnapshot([state], [assessment], tinyCapacity, [], [], now)
    expect(snapshot?.capacityState).toBe('prioritising')
    expect(snapshot?.requiredUsefulMinutes).toBeGreaterThan(snapshot?.remainingCapacityMinutes ?? 0)
  })
})
