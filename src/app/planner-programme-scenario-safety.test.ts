import { describe, expect, it } from 'vitest'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import { buildCatalogue, createCourseLearningState } from './catalogue-model'
import { allCatalogueCourses } from './learner-programme'
import { buildLearnerPreparationProgramme, scopeTopicIds } from './planner-model'
import type { RevisionAssessment, RevisionAvailabilityProfile } from '../services/planning/planner-service'
import type { PlannedSession } from '../services/planning/planned-session-service'

/**
 * FI-001 SV oracle — real published-course DOMAIN safety checks.
 * These are deliberately not the five-view, baseline-comparison or human
 * educational acceptance of SV-01..13. Failed or missing educational outcome
 * proof must remain visible in the assurance register.
 */
const courses = allCatalogueCourses(buildCatalogue(listAvailableContentAdapters()))
const business = courses.find((entry) => entry.course.id === 'aqa:aqa-a-level:7132')!.course
const psychology = courses.find((entry) => entry.course.id === 'aqa:aqa-a-level:7182')!.course
const now = new Date(2026, 9, 15, 12)
const fullCapacity: RevisionAvailabilityProfile = {
  userId: 'scenario-user', timezone: 'Europe/London',
  weekdayMinutes: 60, weekendMinutes: 60,
  weeklyMinutes: {
    monday: 60, tuesday: 60, wednesday: 60, thursday: 60,
    friday: 60, saturday: 60, sunday: 0,
  },
}
function exam(course: typeof business, number: number, date: string): RevisionAssessment {
  const module = course.modules.find((part) => part.manifest.paper.number === number)!
  return {
    assessmentId: course.id + ':paper-' + number,
    userId: 'scenario-user', subjectId: course.subjectId,
    courseId: course.id, moduleId: module.manifest.id,
    title: 'Paper ' + number, assessmentDate: date, assessmentType: 'public_exam',
    relativeImportance: 'high', scope: {}, isActive: true,
  }
}
function session(topicId: string, date: string, status: PlannedSession['status']): PlannedSession {
  return {
    sessionId: 'chosen', userId: 'scenario-user', courseId: business.id,
    topicId, plannedDate: date, activityType: 'practice', minutes: 20,
    addedBy: 'student', recommendationId: null, status,
    createdAt: '2026-10-15T08:00:00Z', updatedAt: '2026-10-15T08:00:00Z',
  }
}
const businessPapers = () => [
  exam(business, 1, '2027-05-18'),
  exam(business, 2, '2027-06-02'),
  exam(business, 3, '2027-06-11'),
]
function sourceState(course = business) {
  return createCourseLearningState(course, [])
}
function safety(programme: ReturnType<typeof buildLearnerPreparationProgramme>['programme']) {
  for (const week of programme.weeks) {
    if (week.availableMinutes !== null) {
      expect(week.allocatedMinutes).toBeLessThanOrEqual(week.availableMinutes)
      expect(week.allocatedMinutes).toBeGreaterThanOrEqual(0)
    }
    for (const objective of week.objectives) {
      expect(objective.assessmentDate > week.visibleFrom).toBe(true)
      expect(objective.estimatedMinutes).toBeGreaterThan(0)
      expect(objective.purpose.length).toBeGreaterThan(10)
      expect(objective.reason).toContain(objective.assessmentDate)
    }
  }
  const ids = programme.weeks.flatMap((week) => week.objectives.map((goal) => goal.candidateId))
  expect(new Set(ids).size).toBe(ids.length)
}

describe('FI-001 real-content scenario boundary probes (NOT five-view educational acceptance)', () => {
  it('SV-01: a new Business learner has unknown evidence, three actual papers and a whole exam horizon', () => {
    const { programme } = buildLearnerPreparationProgramme(
      [sourceState()], businessPapers(), fullCapacity, [], [], now)
    expect(programme.finalKnownAssessment).toBe('2027-06-11')
    expect(programme.weeks.length).toBeGreaterThan(25)
    expect(programme.requirements).toHaveLength(10)
    expect(programme.requirements.every((entry) => entry.evidenceStatus === 'unknown')).toBe(true)
    expect(programme.paperResponseRequirements).toHaveLength(8)
    expect(programme.weeks.flatMap((week) => week.objectives).length).toBeGreaterThan(0)
    safety(programme)
  })

  it('SV-03: two actual enrolled subjects retain separate obligation identities under shared capacity', () => {
    const papers = [exam(business, 1, '2027-05-18'), exam(psychology, 1, '2027-06-10')]
    const { programme } = buildLearnerPreparationProgramme(
      [sourceState(), sourceState(psychology)], papers, fullCapacity, [], [], now)
    const sourceCourses = new Set(programme.requirements.map((item) => item.courseId))
    expect(sourceCourses.has(business.id)).toBe(true)
    expect(sourceCourses.has(psychology.id)).toBe(true)
    expect(programme.finalKnownAssessment).toBe('2027-06-10')
    safety(programme)
  })

  it('SV-04: three Business paper scopes reuse actual topics without duplicating knowledge demand', () => {
    const state = sourceState()
    const papers = businessPapers()
    const { programme } = buildLearnerPreparationProgramme([state], papers, fullCapacity, [], [], now)
    const scoped = new Set(papers.flatMap((item) => scopeTopicIds(item, state)))
    expect(programme.requirements).toHaveLength(scoped.size)
    expect(new Set(programme.requirements.map((item) => item.topicId)).size).toBe(scoped.size)
    expect(programme.requirements.some((item) => item.papers.length > 1)).toBe(true)
    expect(new Set(programme.paperResponseRequirements.map((item) => item.sectionId)).size).toBe(8)
    safety(programme)
  })

  it('SV-05: one 30-minute opportunity per week cannot allocate larger whole-activity workload', () => {
    const profile: RevisionAvailabilityProfile = {
      ...fullCapacity, weekdayMinutes: 6, weekendMinutes: 0,
      weeklyMinutes: { monday: 30, tuesday: 0, wednesday: 0, thursday: 0,
        friday: 0, saturday: 0, sunday: 0 },
    }
    const papers = [exam(business, 1, '2027-05-18'), exam(psychology, 1, '2027-06-10')]
    const { programme } = buildLearnerPreparationProgramme(
      [sourceState(), sourceState(psychology)], papers, profile, [], [], now)
    expect(programme.weeks.every((week) => week.allocatedMinutes <= 30)).toBe(true)
    safety(programme)
  })

  it('SV-06: near-paper late starter is never given post-paper supported work', () => {
    const papers = [exam(business, 1, '2026-11-03'), exam(business, 2, '2026-11-17')]
    const { programme } = buildLearnerPreparationProgramme(
      [sourceState()], papers, fullCapacity, [], [], now)
    expect(programme.finalKnownAssessment).toBe('2026-11-17')
    expect(programme.weeks.length).toBeLessThan(10)
    safety(programme)
  })

  it('SV-07: missed time recomputes without interpreting an unscored absence as weaker knowledge', () => {
    const state = sourceState()
    const papers = businessPapers()
    const old = buildLearnerPreparationProgramme([state], papers, fullCapacity, [], [], now).programme
    const advanced = new Date(2026, 9, 29, 12)
    const restarted = buildLearnerPreparationProgramme(
      [state], papers, fullCapacity, [], [], advanced).programme
    expect(restarted.weeks.length).toBeLessThan(old.weeks.length)
    expect(restarted.requirements.every((entry) => entry.evidenceStatus === 'unknown')).toBe(true)
    expect(restarted.finalKnownAssessment).toBe(old.finalKnownAssessment)
    safety(restarted)
  })

  it('SV-08: completing extra unscored work never becomes proof of mastery', () => {
    const state = sourceState()
    const papers = businessPapers()
    const topicId = scopeTopicIds(papers[0], state)[0]!
    const completed = session(topicId, '2026-10-15', 'done')
    const { programme, candidates } = buildLearnerPreparationProgramme(
      [state], papers, fullCapacity, [], [], now, [completed])
    const requirement = programme.requirements.find((entry) => entry.topicId === topicId)!
    expect(requirement.hasAcceptedSession).toBe(true)
    expect(requirement.evidenceStatus).toBe('unknown')
    expect(candidates.some((candidate) => candidate.topicId === topicId)).toBe(false)
    safety(programme)
  })

  it('SV-11: moving real paper dates rebuilds the eligible horizon and retains later shared requirements', () => {
    const state = sourceState()
    const original = businessPapers()
    const moved = [
      exam(business, 1, '2026-11-03'),
      exam(business, 2, '2027-06-19'),
      exam(business, 3, '2027-06-23'),
    ]
    const before = buildLearnerPreparationProgramme([state], original, fullCapacity, [], [], now).programme
    const after = buildLearnerPreparationProgramme([state], moved, fullCapacity, [], [], now).programme
    expect(before.finalKnownAssessment).toBe('2027-06-11')
    expect(after.finalKnownAssessment).toBe('2027-06-23')
    expect(after.requirements.some((entry) => entry.papers.length > 1)).toBe(true)
    safety(after)
  })

  it('SV-12: zero realistic time reports unserved supported activities, not a completed syllabus', () => {
    const profile: RevisionAvailabilityProfile = {
      ...fullCapacity, weekdayMinutes: 0, weekendMinutes: 0,
      weeklyMinutes: { monday: 0, tuesday: 0, wednesday: 0,
        thursday: 0, friday: 0, saturday: 0, sunday: 0 },
    }
    const { programme } = buildLearnerPreparationProgramme(
      [sourceState()], [exam(business, 1, '2026-11-03')], profile, [], [], now)
    expect(programme.requiredMinutes).toBeGreaterThan(0)
    expect(programme.allocatedMinutes).toBe(0)
    expect(programme.unserved.length).toBeGreaterThan(0)
    expect(programme.constraints.join(' ')).toContain('not allocated')
    safety(programme)
  })

  it('SV-13: missing exam dates and missing availability never become invented known capacity', () => {
    const state = sourceState()
    const withoutPapers = buildLearnerPreparationProgramme(
      [state], [], fullCapacity, [], [], now).programme
    expect(withoutPapers.finalKnownAssessment).toBeNull()
    expect(withoutPapers.weeks).toHaveLength(0)
    const withoutCapacity = buildLearnerPreparationProgramme(
      [state], [exam(business, 1, '2027-05-18')], null, [], [], now).programme
    expect(withoutCapacity.weeks.length).toBeGreaterThan(0)
    expect(withoutCapacity.weeks.every((week) => week.availableMinutes === null
      && week.allocatedMinutes === 0)).toBe(true)
    expect(withoutCapacity.constraints.join(' ')).toContain('unknown')
    safety(withoutCapacity)
  })
})
