import { describe, expect, it } from 'vitest'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import { buildAdaptivePlan, type PlannerCandidate } from '../engine/planning/planning'
import type { LearningEvidence } from '../engine/evidence/evidence'
import type { RevisionAssessment, RevisionAvailabilityProfile } from '../services/planning/planner-service'
import type { PlannedSession } from '../services/planning/planned-session-service'
import { buildCatalogue, createCourseLearningState } from './catalogue-model'
import { allCatalogueCourses } from './learner-programme'
import { activityForTopic, buildPlannerSnapshot, plannerCandidatesFromLearningState, plannerDaysFromAvailability, scopeTopicIds } from './planner-model'

const courses = allCatalogueCourses(buildCatalogue(listAvailableContentAdapters()))
const business = courses.find(({ course }) => course.id === 'aqa:aqa-a-level:7132')!.course
const psychology = courses.find(({ course }) => course.id === 'aqa:aqa-a-level:7182')!.course
const asBusiness = courses.find(({ course }) => course.id === 'aqa:aqa-as:7131')!.course
const now = new Date(2026, 9, 13, 9)
const businessState = createCourseLearningState(business, [])
const psychologyState = createCourseLearningState(psychology, [])
const topic = business.learningAdapter.listTopics()[0].id
function exam(course = business, paper = 1, overrides: Partial<RevisionAssessment> = {}): RevisionAssessment {
  return {
    assessmentId: `${course.id}-paper-${paper}`, userId: 'fixture', subjectId: course.subjectId,
    courseId: course.id, moduleId: course.modules.find((module) => module.manifest.paper.number === paper)!.manifest.id,
    assessmentType: 'public_exam', title: `Paper ${paper}`, assessmentDate: '2026-10-15',
    relativeImportance: 'normal', scope: {}, isActive: true, ...overrides,
  }
}
const candidates = (assessments: RevisionAssessment[], states = [businessState]) => plannerCandidatesFromLearningState(states, assessments, [], now)
const days = [
  { date: '2026-10-13', availableMinutes: 0 },
  { date: '2026-10-14', availableMinutes: 0 },
  { date: '2026-10-15', availableMinutes: 30 },
  { date: '2026-10-16', availableMinutes: 30 },
]
const weekly = (minutes: number): RevisionAvailabilityProfile => ({
  userId: 'fixture', timezone: 'Europe/London', weekdayMinutes: minutes, weekendMinutes: minutes,
  weeklyMinutes: { monday: minutes, tuesday: minutes, wednesday: minutes, thursday: minutes, friday: minutes, saturday: minutes, sunday: minutes },
})
const session = (overrides: Partial<PlannedSession> = {}): PlannedSession => ({
  sessionId: 'accepted', userId: 'fixture', plannedDate: '2026-10-13', courseId: business.id,
  topicId: topic, activityType: 'practice', minutes: 20, addedBy: 'student', recommendationId: 'planner-v1:legacy-assessment-key',
  status: 'planned', createdAt: '', updatedAt: '', ...overrides,
})

describe('FI-001 R1a approved registry fixtures', () => {
  it('R1-01 merges shared Business 7132 intents and retains both paper scopes', () => {
    const result = candidates([exam(), exam(business, 2, { assessmentDate: '2026-10-20' })])
    expect(result).toHaveLength(business.learningAdapter.listTopics().length)
    expect(new Set(result.map((item) => item.id)).size).toBe(result.length)
    for (const item of result) {
      expect(item.assessmentTargets?.map((target) => target.paperId)).toEqual(['paper-1', 'paper-2'])
      expect(item.assessmentTargets?.every((target) => target.topicIds.includes(item.topicId))).toBe(true)
    }
    expect(candidates([exam(business, 2), exam()])).toEqual(candidates([exam(), exam(business, 2)]))
  })

  it('R1-02 cuts off paper-only work on the exam day while shared later-paper work survives', () => {
    const first = exam(business, 1, { scope: { topicIds: [topic] } })
    expect(buildAdaptivePlan(candidates([first]), days).schedule.flatMap((day) => day.items)).toEqual([])
    const plan = buildAdaptivePlan(candidates([first, exam(business, 2, { assessmentDate: '2026-10-20', scope: { topicIds: [topic] } })]), days)
    const item = plan.schedule[2].items[0]
    expect(item.assessmentId).toBe(`${business.id}-paper-2`)
    expect(item.assessmentTargets).toHaveLength(1)
    expect(plan.schedule.flatMap((day) => day.items)).toHaveLength(1)
    expect(candidates([exam(business, 1, { assessmentDate: '2026-10-13' })])).toEqual([])
  })

  it('R1-03 replans earlier/later/archived dates without changing stable intent IDs or accepted sessions', () => {
    const original = exam(business, 1, { scope: { topicIds: [topic] } })
    const accepted = [session()]
    const before = structuredClone(accepted)
    const originalId = candidates([original])[0].id
    const later = candidates([{ ...original, assessmentDate: '2026-10-20' }])
    expect(later[0].id).toBe(originalId)
    expect(buildAdaptivePlan(later, days).schedule[2].items).toHaveLength(1)
    expect(candidates([{ ...original, assessmentDate: '2026-10-12' }])).toEqual([])
    expect(candidates([{ ...original, isActive: false }])).toEqual([])
    buildPlannerSnapshot([businessState], [{ ...original, assessmentDate: '2026-10-12' }], weekly(30), [], [], now, accepted)
    expect(accepted).toEqual(before)
  })

  it('R1-04 only resolves exact active courses and unambiguous legacy scopes', () => {
    const states = [businessState, psychologyState, createCourseLearningState(asBusiness, [])]
    expect(candidates([exam(business, 1, { courseId: null, moduleId: null })], states)).toEqual([])
    expect(candidates([exam()], [psychologyState])).toEqual([])
    expect(candidates([exam(business, 1, { moduleId: psychology.modules[0].manifest.id })], states)).toEqual([])
    expect(candidates([exam(business, 1, { subjectId: 'psychology' })], states)).toEqual([])
    expect(candidates([exam(business, 1, { courseId: null, moduleId: null })]).length).toBeGreaterThan(0)
    expect(candidates([exam(business, 1, { courseId: null })], states).every((item) => item.courseId === business.id)).toBe(true)
  })

  it('R1-04 rejects invalid explicit scopes instead of widening to the whole course', () => {
    for (const scope of [{ topicIds: ['missing'] }, { topicIds: [topic, 'missing'] }, { topicIds: [] }, { topicIds: 'all' }, { paperId: 'unknown' }]) {
      expect(candidates([exam(business, 1, { scope })])).toEqual([])
    }
  })

  it('R1-05 preserves planned/done/skipped commitments and legacy keys', () => {
    const assessments = [exam(business, 1), exam(business, 2)]
    const sessions = [session(), session({ sessionId: 'done', status: 'done', topicId: 'other', minutes: 5 }), session({ sessionId: 'skip', status: 'skipped', minutes: 100 })]
    const before = structuredClone(sessions)
    const plan = buildPlannerSnapshot([businessState], assessments, weekly(30), [], [], now, sessions)!
    expect(plan.schedule[0].availableMinutes).toBe(5)
    expect(plan.today).toEqual([])
    expect(plan.ranked.some((item) => item.topicId === topic)).toBe(false)
    expect(buildPlannerSnapshot([businessState], assessments, weekly(30), [], [], now, [session({ status: 'skipped' })])?.ranked.some((item) => item.topicId === topic)).toBe(true)
    expect(sessions).toEqual(before)
  })

  it('R1-09 limits Psychology 7182 to the mapped paper and explicit option choice', () => {
    const assessment = exam(psychology, 3, { scope: { topicIds: ['issues-and-debates-in-psychology', 'relationships', 'schizophrenia', 'aggression'] } })
    expect(scopeTopicIds(assessment, psychologyState)).toEqual(assessment.scope.topicIds)
    expect(scopeTopicIds(exam(psychology, 3), psychologyState)).toEqual(['issues-and-debates-in-psychology'])
    expect(scopeTopicIds(exam(psychology, 3, { scope: { topicIds: ['relationships', 'gender'] } }), psychologyState)).toEqual([])
    expect(candidates([exam(psychology, 3, { moduleId: 'unknown-paper' })], [psychologyState])).toEqual([])
    expect(candidates([exam(psychology, 3, { isActive: false })], [psychologyState])).toEqual([])
    expect(scopeTopicIds(exam(psychology, 1), psychologyState)).not.toContain('relationships')
    expect(scopeTopicIds(exam(psychology, 1, { scope: { topicIds: ['relationships'] } }), psychologyState)).toEqual([])
    expect(candidates([assessment], [psychologyState]).every((item) => (assessment.scope.topicIds as string[]).includes(item.topicId))).toBe(true)
  })

  it('R1-10 never truncates work into invented durations at 0/15/30 minutes', () => {
    const one = candidates([exam(business, 1, { scope: { topicIds: [topic] } })])[0]
    for (const minutes of [0, 15, 30]) {
      const plan = buildAdaptivePlan([{ ...one, estimatedMinutes: 30 }], [{ date: '2026-10-13', availableMinutes: minutes }])
      expect(plan.today).toHaveLength(minutes === 30 ? 1 : 0)
      expect(plan.today.reduce((sum, item) => sum + item.estimatedMinutes, 0)).toBeLessThanOrEqual(minutes)
    }
  })

  it('R1-06/R1-13 leaves absent/unknown dates and unsupported assets honest', () => {
    expect(candidates([exam(business, 1, { assessmentDate: '' })])).toEqual([])
    expect(candidates([exam(business, 1, { assessmentDate: '2026-02-30' })])).toEqual([])
    expect(buildPlannerSnapshot([businessState], [], null, [], [], now)).toBeNull()
    const noAssets = { ...businessState, adapter: { ...businessState.adapter, listQuestions: () => [], listFlashcards: () => [] } }
    expect(activityForTopic(noAssets, topic, 1, 0.9)).toBeNull()
    expect(candidates([exam()], [noAssets])).toEqual([])
    const flashOnly = { ...noAssets, adapter: { ...noAssets.adapter, listFlashcards: businessState.adapter.listFlashcards } }
    expect(activityForTopic(flashOnly, topic, 1, 0.9)).toBe('flashcards')
    expect(candidates([exam()]).every((item) => item.activityType !== 'exam-question')).toBe(true)
  })

  it('R1-11/R1-14 reads existing evidence without changing understanding/readiness when deadlines shift', () => {
    const evidence: LearningEvidence[] = [{ id: 'correct', moduleId: business.modules[0].manifest.id, topicId: topic, contentId: 'fixture-question', source: 'multiple_choice', schemaVersion: 1, correct: true, selectedOption: 0, correctOption: 0, occurredAt: '2026-10-12T12:00:00Z' }]
    const state = createCourseLearningState(business, evidence)
    const before = structuredClone({ evidence: state.evidence, readiness: state.readiness, knowledge: state.topicKnowledge })
    const states = [state, psychologyState]
    const earlier = candidates([exam(), exam(psychology, 1)], states)
    const later = candidates([exam(business, 1, { assessmentDate: '2026-10-20' }), exam(psychology, 1)], states)
    expect(later.find((item) => item.topicId === topic)?.understanding).toBe(earlier.find((item) => item.topicId === topic)?.understanding)
    expect({ evidence: state.evidence, readiness: state.readiness, knowledge: state.topicKnowledge }).toEqual(before)
    const plan = buildAdaptivePlan(later, days)
    expect(plan.schedule.every((day) => day.items.every((item) => item.assessmentTargets?.every((target) => target.assessmentDate > day.date)))).toBe(true)
  })

  it.each(['2026-03-29', '2026-10-25', '2026-12-31'])('R1-12 uses local calendar days across %s deterministically', (date) => {
    const today = new Date(`${date}T23:30:00`)
    const next = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    const key = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`
    const assessment = exam(business, 1, { assessmentDate: key, scope: { topicIds: [topic] } })
    const input = plannerCandidatesFromLearningState([businessState], [assessment], [], today)
    expect(input[0].daysUntilAssessment).toBe(1)
    const dayInputs = plannerDaysFromAvailability(weekly(30), [], [assessment], today)
    const plan = buildAdaptivePlan(input, dayInputs)
    expect(plan.today).toHaveLength(1)
    expect(plan.schedule.slice(1).every((day) => day.items.length === 0)).toBe(true)
    expect(buildAdaptivePlan(input, dayInputs)).toEqual(plan)
  })

  it('R1-01/R1-02 keeps distinct paper intents separate in the scheduler', () => {
    // Engine contract fixture only: no claim that these paper skills have exact shipped routes.
    const generic = candidates([exam(business, 1, { scope: { topicIds: [topic] } })])[0]
    const paperIntent = (paper: number, deadline: string): PlannerCandidate => ({ ...generic,
      id: `paper-${paper}-format-fixture`, moduleId: business.modules[paper - 1].manifest.id,
      assessmentTargets: [{ ...generic.assessmentTargets![0], moduleId: business.modules[paper - 1].manifest.id, assessmentId: `paper-${paper}`, assessmentDate: deadline }],
    })
    const input = [paperIntent(1, '2026-10-15'), paperIntent(2, '2026-10-20')]
    const plan = buildAdaptivePlan(input, [{ date: '2026-10-13', availableMinutes: 60 }])
    expect(plan.today).toHaveLength(2)
    expect(buildAdaptivePlan(input, days).schedule[2].items.map((item) => item.assessmentId)).toEqual(['paper-2'])
  })
})
