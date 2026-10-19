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

/** Real Business course topic with synthetic but schema-valid scored evidence.
 * The second observation reuses content IDs to exercise latest-result policy.
 */
function scoredTopic(topicId: string, passed: boolean, when: string): import('../engine/evidence/evidence').LearningEvidence[] {
  const moduleId = business.learningAdapter.manifest.id
  const entries: import('../engine/evidence/evidence').LearningEvidence[] = []
  for (let i = 0; i < 3; i++) {
    entries.push({ id: 'flash-' + topicId + '-' + when + '-' + i, moduleId, topicId,
      occurredAt: when, contentId: 'scenario-card-' + topicId + '-' + i,
      source: 'flashcard', schemaVersion: 1, rating: passed ? 2 : 0 })
    entries.push({ id: 'question-' + topicId + '-' + when + '-' + i, moduleId, topicId,
      occurredAt: when, contentId: 'scenario-question-' + topicId + '-' + i,
      source: 'multiple_choice', schemaVersion: 1, correct: passed,
      selectedOption: passed ? 0 : 1, correctOption: 0 })
  }
  return entries
}

describe('FI-001 real-content scenario boundary probes (NOT five-view educational acceptance)', () => {

  it('SV-09: one high-scoring application answer is not sufficient proof for exam-practice promotion', () => {
    const examined = business.modules[0]!
    const published = examined.listExams().flatMap((paper) => paper.questions)
      .find((question) => !question.choiceGroup && business.learningAdapter.getTopic(question.topic))
    expect(published).toBeDefined()
    const topicId = published!.topic
    const oneCorrect: import('../engine/evidence/evidence').LearningEvidence = {
      id: 'one-scored-answer', moduleId: business.learningAdapter.manifest.id, topicId,
      occurredAt: '2026-10-15T08:00:00.000Z', contentId: 'one-question',
      source: 'multiple_choice', schemaVersion: 1, correct: true,
      selectedOption: 0, correctOption: 0,
    }
    const state = createCourseLearningState(business, [oneCorrect])
    expect(state.topicKnowledge.topics.find((item) => item.topicId === topicId)?.score).toBeNull()
    const near = [exam(business, 1, '2026-10-24')]
    const result = buildLearnerPreparationProgramme([state], near, fullCapacity, [], [], now)
    const candidates = result.candidates.filter((candidate) => candidate.topicId === topicId)
    expect(candidates.length).toBeGreaterThan(0)
    expect(candidates.every((candidate) => candidate.understanding === null)).toBe(true)
    expect(candidates.some((candidate) => candidate.activityType !== 'exam-question')).toBe(true)
    expect(result.programme.requirements.find((item) => item.topicId === topicId)?.evidenceStatus)
      .toBe('unknown')
    // Paper requirements stay visible, but one correct answer cannot force the
    // first recommendation into the exam-question pathway by raw percentage.
    safety(result.programme)
  })


  it('SV-06/SV-10: authentic paper practice never waits for an arbitrary unscored check', () => {
    // A published extended-response topic provides real Learn, Quick check
    // and paper-section practice. A knowledge check is an alternative valid
    // retrieval opportunity, not a compulsory hurdle to all exam techniques.
    const topicId = 'strategic-direction'
    const published = business.modules.find((part) => part.manifest.paper.number === 1)!
      .listExams().flatMap((paper) => paper.questions)
    expect(published.some((question) => question.topic === topicId
      && question.sectionLabel === 'Section C')).toBe(true)
    const unknown = buildLearnerPreparationProgramme(
      [sourceState()], businessPapers(), fullCapacity, [], [], now)
    const foundations = unknown.candidates.filter((item) =>
      item.topicId === topicId && item.preparationStage === 'acquire')
    const checks = unknown.candidates.filter((item) =>
      item.topicId === topicId && item.preparationStage === 'check')
    const essays = unknown.candidates.filter((item) =>
      item.topicId === topicId && item.activityType === 'exam-question'
      && item.paperResponseFormat?.toLowerCase().includes('essay'))
    expect(foundations).toHaveLength(1)
    expect(checks).toHaveLength(1)
    expect(essays.length).toBeGreaterThan(0)
    expect(checks[0]?.preparationPrerequisiteId).toBe(foundations[0]?.id)
    expect(essays.every((item) => item.preparationPrerequisiteId === foundations[0]?.id)).toBe(true)
    expect(essays.every((item) => item.preparationPrerequisiteId !== checks[0]?.id)).toBe(true)

    // Valid corroborated scores mean the student may go directly to an
    // appropriately mapped exam question: requiring another generic quiz
    // first would squander scarce pre-paper capacity without valid evidence.
    const proven = createCourseLearningState(business,
      scoredTopic(topicId, true, '2026-10-15T08:00:00.000Z'))
    const revised = buildLearnerPreparationProgramme(
      [proven], businessPapers(), fullCapacity, [], [], now)
    const knownEssays = revised.candidates.filter((item) =>
      item.topicId === topicId && item.activityType === 'exam-question'
      && item.paperResponseFormat?.toLowerCase().includes('essay'))
    expect(knownEssays.length).toBeGreaterThan(0)
    expect(knownEssays.every((item) => item.preparationPrerequisiteId == null)).toBe(true)
    expect(revised.candidates.some((item) =>
      item.topicId === topicId && item.preparationStage === 'acquire')).toBe(false)
    expect(revised.programme.paperResponseRequirements.some((section) =>
      section.sectionName === 'Section C'
      && section.verifiedPracticeCandidateIds.length > 0)).toBe(true)
    safety(unknown.programme)
    safety(revised.programme)
  })

  it('SV-04: Business paper alternatives offer actual essay selection without excluding compulsory syllabus topics', () => {
    const state = sourceState()
    const selected = scopeTopicIds(exam(business, 1, '2027-05-18'), state)
    expect(selected).toHaveLength(10)
    expect(selected).toContain('strategic-direction')
    expect(selected).toContain('strategic-change')
    // Paper 1 Section C/D choice means essay A or B on exam day,
    // not a qualification option that drops one of these required topics.
    const { programme } = buildLearnerPreparationProgramme(
      [state], businessPapers(), fullCapacity, [], [], now)
    expect(programme.paperResponseRequirements).toHaveLength(8)
    const paper1 = programme.paperResponseRequirements
      .filter((section) => section.assessmentId.endsWith('paper-1'))
    expect(paper1.map((item) => item.sectionName)).toEqual([
      'Section A', 'Section B', 'Section C', 'Section D',
    ])
    for (const section of paper1) {
      expect(section.verifiedPracticeCandidateIds.length, section.sectionName).toBeGreaterThan(0)
    }
    expect(paper1.find((item) => item.sectionName === 'Section A')?.verifiedAssessmentObjectives)
      .toContain('AO1')
    expect(paper1.find((item) => item.sectionName === 'Section C')?.verifiedAssessmentObjectives)
      .toContain('AO4')
    safety(programme)
  })

  it('SV-04: Psychology syllabus options remain excluded without exact approved topic scope', () => {
    const state = sourceState(psychology)
    const paper = exam(psychology, 3, '2027-06-09')
    const sectionTopics = psychology.modules
      .find((part) => part.manifest.paper.number === 3)!
      .listExams().flatMap((actual) => actual.questions)
      .filter((question) => question.choiceGroup && question.choiceOption)
      .map((question) => question.topic)
    expect(sectionTopics.length).toBeGreaterThan(0)
    const scoped = scopeTopicIds(paper, state)
    for (const topic of new Set(sectionTopics)) expect(scoped).not.toContain(topic)
    // A genuine published syllabus-option selection is different from
    // Business selecting an essay *question* on the examination paper.
  })

  it('SV-02: Business paper topics distinguish strong and weak scored evidence', () => {
    const topics = business.learningAdapter.listTopics().slice(0, 2).map((item) => item.id)
    expect(topics).toHaveLength(2)
    const state = createCourseLearningState(business, [
      ...scoredTopic(topics[0], true, '2026-10-01T09:00:00.000Z'),
      ...scoredTopic(topics[1], false, '2026-10-01T09:00:00.000Z'),
    ])
    const { programme, candidates } = buildLearnerPreparationProgramme(
      [state], businessPapers(), fullCapacity, [], [], now)
    expect(programme.requirements.find((item) => item.topicId === topics[0])?.evidenceStatus).toBe('supported')
    expect(programme.requirements.find((item) => item.topicId === topics[1])?.evidenceStatus).toBe('needs-work')
    expect(candidates.some((item) => item.topicId === topics[1] && item.understanding === 0)).toBe(true)
    expect(candidates.some((item) => item.topicId === topics[0] && item.understanding === 1)).toBe(true)
    safety(programme)
  })


  it('SV-02/SV-10: the planner uses authoritative Topic Knowledge bands at the 50% Nearly there boundary', () => {
    const topicId = business.learningAdapter.listTopics()[0]!.id
    // Six distinct scored items spanning recall and application: 1/3
    // flashcards and 2/3 questions correct -> the governed engine gives 50%.
    const mixed = scoredTopic(topicId, false, '2026-10-01T09:00:00.000Z')
      .map((item) => {
        if (item.source === 'flashcard') {
          return { ...item, rating: item.contentId.endsWith('-0') ? 2 as const : 0 as const }
        }
        if (item.source === 'multiple_choice') {
          const correct = !item.contentId.endsWith('-2')
          return { ...item, correct, selectedOption: correct ? 0 : 1 }
        }
        return item
      })
    const state = createCourseLearningState(business, mixed)
    const knowledge = state.topicKnowledge.topics.find((item) => item.topicId === topicId)
    expect(knowledge).toMatchObject({ score: 50, band: 'medium' })
    const { programme, candidates } = buildLearnerPreparationProgramme(
      [state], businessPapers(), fullCapacity, [], [], now)
    expect(programme.requirements.find((item) => item.topicId === topicId)?.evidenceStatus)
      .toBe('provisional')
    // A scored Nearly there topic should not be declared weak or forced
    // through introductory learning on a second, ungoverned 55% threshold.
    expect(candidates.some((item) => item.topicId === topicId
      && item.preparationStage === 'acquire')).toBe(false)
    const objectives = programme.weeks.flatMap((week) => week.objectives)
      .filter((item) => item.topicId === topicId)
    expect(objectives.length).toBeGreaterThan(0)
    expect(objectives.every((item) => item.evidenceStatus === 'provisional'
      && item.treatment !== 'repair')).toBe(true)
    safety(programme)
  })

  it('SV-02/SV-09: real weak evidence produces supported explanation before a later check without wiping the scored weakness', () => {
    const published = business.learningAdapter.listLearnChapters().find((chapter) =>
      chapter.groups.some((group) => group.pages.some((page) => page.topicId === chapter.topicId)))
    expect(published).toBeDefined()
    const topicId = published!.topicId
    const weak = createCourseLearningState(business,
      scoredTopic(topicId, false, '2026-10-01T09:00:00.000Z'))
    const { candidates, programme } = buildLearnerPreparationProgramme(
      [weak], businessPapers(), fullCapacity, [], [], now)
    const teaching = candidates.find((item) =>
      item.topicId === topicId && item.preparationStage === 'acquire')
    const checking = candidates.find((item) =>
      item.topicId === topicId && item.preparationStage === 'check'
      && item.preparationPrerequisiteId === teaching?.id)
    expect(teaching?.learnTarget?.learnPageId).toBeTruthy()
    expect(teaching?.understanding).toBe(0)
    expect(checking).toBeDefined()
    expect(programme.requirements.find((item) => item.topicId === topicId)?.evidenceStatus)
      .toBe('needs-work')
    const ordered = programme.weeks.flatMap((week) => week.objectives)
    const explanationPosition = ordered.findIndex((item) => item.candidateId === teaching?.id)
    const checkPosition = ordered.findIndex((item) => item.candidateId === checking?.id)
    expect(explanationPosition).toBeGreaterThanOrEqual(0)
    expect(checkPosition).toBeGreaterThan(explanationPosition)
    expect(ordered[explanationPosition]).toMatchObject({
      treatment: 'learn', evidenceStatus: 'needs-work',
    })
    expect(ordered[explanationPosition].purpose).toContain('demonstrated gap')
    // ISO date keys compare in calendar order, unlike Vitest's numeric matcher.
    expect(ordered[checkPosition].assessmentDate > '2026-10-15').toBe(true)
    // Genuine newer success should remove unnecessary foundation repetition,
    // while remaining paper demands and the scored result stay authoritative.
    const improved = createCourseLearningState(business, [
      ...scoredTopic(topicId, false, '2026-10-01T09:00:00.000Z'),
      ...scoredTopic(topicId, true, '2026-10-15T10:00:00.000Z'),
    ])
    const following = buildLearnerPreparationProgramme(
      [improved], businessPapers(), fullCapacity, [], [], now)
    expect(following.programme.requirements.find((item) =>
      item.topicId === topicId)?.evidenceStatus).toBe('supported')
    expect(following.candidates.some((item) =>
      item.topicId === topicId && item.preparationStage === 'acquire')).toBe(false)
    safety(programme)
    safety(following.programme)
  })

  it('SV-09: newer weak scores revoke supported status, not paper obligations', () => {
    const topicId = business.learningAdapter.listTopics()[0]!.id
    const initial = scoredTopic(topicId, true, '2026-10-01T09:00:00.000Z')
    const newer = scoredTopic(topicId, false, '2026-10-15T10:00:00.000Z')
    const oldPlan = buildLearnerPreparationProgramme(
      [createCourseLearningState(business, initial)], businessPapers(), fullCapacity, [], [], now)
    const revised = buildLearnerPreparationProgramme(
      [createCourseLearningState(business, [...initial, ...newer])], businessPapers(), fullCapacity, [], [], now)
    const req = (plan: typeof oldPlan.programme) => plan.requirements.find((item) => item.topicId === topicId)!
    expect(req(oldPlan.programme).evidenceStatus).toBe('supported')
    expect(req(revised.programme).evidenceStatus).toBe('needs-work')
    expect(req(revised.programme).papers).toEqual(req(oldPlan.programme).papers)
    expect(revised.candidates.some((item) => item.topicId === topicId && item.understanding === 0)).toBe(true)
    safety(revised.programme)
  })

  it('SV-10: newer improvement changes weak topic to supported but does not claim complete exam readiness', () => {
    const topicId = business.learningAdapter.listTopics()[0]!.id
    const initial = scoredTopic(topicId, false, '2026-10-01T09:00:00.000Z')
    const newer = scoredTopic(topicId, true, '2026-10-15T10:00:00.000Z')
    const oldPlan = buildLearnerPreparationProgramme(
      [createCourseLearningState(business, initial)], businessPapers(), fullCapacity, [], [], now)
    const revised = buildLearnerPreparationProgramme(
      [createCourseLearningState(business, [...initial, ...newer])], businessPapers(), fullCapacity, [], [], now)
    const status = (plan: typeof oldPlan.programme) => plan.requirements.find((item) => item.topicId === topicId)!.evidenceStatus
    expect(status(oldPlan.programme)).toBe('needs-work')
    expect(status(revised.programme)).toBe('supported')
    expect(revised.candidates.some((item) => item.topicId === topicId && item.understanding === 1)).toBe(true)
    expect(revised.programme.requirements).toHaveLength(10)
    expect(revised.programme.paperResponseRequirements).toHaveLength(8)
    safety(revised.programme)
  })

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
    const assignedCourses = new Set(programme.weeks.flatMap((week) =>
      week.objectives.map((objective) => objective.courseId)))
    // A displayed Psychology obligation without a single realistic supported
    // objective anywhere before its paper would silently starve that course.
    expect([...assignedCourses]).toContain(business.id)
    expect(assignedCourses).toContain(psychology.id)
    safety(programme)
  })

  it('SV-03: after Business Paper 1, later Business obligations remain alongside imminent Psychology', () => {
    const papers = [
      exam(business, 1, '2027-05-18'),
      exam(business, 2, '2027-06-02'),
      exam(business, 3, '2027-06-11'),
      exam(psychology, 1, '2027-05-25'),
    ]
    const after = new Date(2027, 4, 19, 12)
    const mondayOnly: RevisionAvailabilityProfile = {
      ...fullCapacity,
      weeklyMinutes: { monday: 30, tuesday: 0, wednesday: 0, thursday: 0,
        friday: 0, saturday: 0, sunday: 0 },
    }
    const { programme } = buildLearnerPreparationProgramme(
      [sourceState(), sourceState(psychology)], papers, mondayOnly, [], [], after)
    expect(programme.finalKnownAssessment).toBe('2027-06-11')
    const paperTargets = new Set(programme.paperResponseRequirements.map((section) => section.assessmentId))
    expect(paperTargets.has(business.id + ':paper-1')).toBe(false)
    expect(paperTargets.has(business.id + ':paper-2')).toBe(true)
    expect(paperTargets.has(business.id + ':paper-3')).toBe(true)
    expect(paperTargets.has(psychology.id + ':paper-1')).toBe(true)
    const businessNeed = programme.requirements.filter((item) => item.courseId === business.id)
    expect(businessNeed.length).toBeGreaterThan(0)
    expect(businessNeed.some((item) => item.papers.some((paper) =>
      paper.assessmentId === business.id + ':paper-2'))).toBe(true)
    const psychologyNeed = programme.requirements.filter((item) => item.courseId === psychology.id)
    expect(psychologyNeed.length).toBeGreaterThan(0)
    // A scenario that simply removes Business after its first paper is not
    // an adequate cross-course balance or shared-syllabus acceptance test.
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


  it('SV-05: 20 weekly minutes split into 10+10 cannot fit a whole 15-minute activity', () => {
    const profile: RevisionAvailabilityProfile = {
      ...fullCapacity,
      weeklyMinutes: { monday: 10, tuesday: 10, wednesday: 0, thursday: 0,
        friday: 0, saturday: 0, sunday: 0 },
    }
    const paper = exam(business, 1, '2026-10-27')
    const first = buildLearnerPreparationProgramme(
      [sourceState()], [paper], profile, [], [], now)
    expect(first.programme.weeks.every((week) => week.allocatedMinutes === 0)).toBe(true)
    expect(first.programme.unserved.length).toBeGreaterThan(0)
    // Adding one feasible whole-activity slot should create a real supported
    // objective, while the 10-minute slots remain insufficient individually.
    const feasible = { ...profile, weeklyMinutes: { ...profile.weeklyMinutes, tuesday: 20 } }
    const second = buildLearnerPreparationProgramme(
      [sourceState()], [paper], feasible, [], [], now)
    const placed = second.programme.weeks.flatMap((week) => week.objectives)
    expect(placed.length).toBeGreaterThan(0)
    expect(placed.every((objective) => objective.forecastDate
      && objective.forecastDate < objective.assessmentDate)).toBe(true)
    expect(placed.every((objective) => objective.forecastDate === '2026-10-20')).toBe(true)
    safety(second.programme)
  })

  it('SV-05: same-week paper cutoff and saved commitments must leave an actual day that fits', () => {
    const profile: RevisionAvailabilityProfile = {
      ...fullCapacity,
      weeklyMinutes: { monday: 0, tuesday: 0, wednesday: 0, thursday: 0,
        friday: 0, saturday: 30, sunday: 30 },
    }
    const paper = exam(business, 1, '2026-10-17') // Saturday: no paper-specific work on exam date.
    const before = buildLearnerPreparationProgramme(
      [sourceState()], [paper], profile, [], [], now)
    expect(before.programme.allocatedMinutes).toBe(0)
    const moved = exam(business, 1, '2026-10-27')
    const booked: PlannedSession = {
      ...session(business.learningAdapter.listTopics()[0]!.id, '2026-10-17', 'planned'),
      minutes: 25,
    }
    const after = buildLearnerPreparationProgramme(
      [sourceState()], [moved], profile, [], [], now, [booked])
    const firstWeek = after.programme.weeks[0]
    expect(firstWeek.availableMinutes).toBe(35) // 5m Saturday and 30m Sunday
    const placed = firstWeek.objectives
    expect(placed.every((objective) => objective.forecastDate === '2026-10-18')).toBe(true)
    expect(placed.reduce((sum, objective) => sum + objective.estimatedMinutes, 0))
      .toBeLessThanOrEqual(30)
    safety(after.programme)
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
    const realAssignments = programme.weeks.flatMap((week) => week.objectives)
    expect(realAssignments.every((objective) => objective.estimatedMinutes <= 30)).toBe(true)
    expect(realAssignments.length).toBeGreaterThan(0)
    // A 30-minute week is not licence to abandon the later enrolled course
    // over the entire exam horizon if supported small activities can fit.
    expect(realAssignments.some((objective) => objective.courseId === business.id)).toBe(true)
    expect(realAssignments.some((objective) => objective.courseId === psychology.id)).toBe(true)
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
    // Finished, unscored activity must not permanently hide the topic.
    // Only still-planned commitments suppress duplicate suggestions.
    expect(candidates.some((candidate) => candidate.topicId === topicId)).toBe(true)
    const chosen = buildLearnerPreparationProgramme([state], papers, fullCapacity, [], [], now,
      [session(topicId, '2026-10-19', 'planned')])
    expect(chosen.candidates.some((candidate) => candidate.topicId === topicId)).toBe(false)
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
