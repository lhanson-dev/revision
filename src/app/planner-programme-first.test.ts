import { describe, expect, it } from 'vitest'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import { buildCatalogue, createCourseLearningState } from './catalogue-model'
import { allCatalogueCourses } from './learner-programme'
import { buildLearnerPreparationProgramme, buildPlannerSnapshot, preparationCandidatesFromLearningState } from './planner-model'
import type { RevisionAssessment, RevisionAvailabilityProfile } from '../services/planning/planner-service'

const courses = allCatalogueCourses(buildCatalogue(listAvailableContentAdapters()))
const business = courses.find((x) => x.course.id === 'aqa:aqa-a-level:7132')!.course
const psychology = courses.find((x) => x.course.id === 'aqa:aqa-a-level:7182')!.course
const now = new Date(2026, 9, 15, 12)
const availability: RevisionAvailabilityProfile = {
  userId: 'fixture', timezone: 'Europe/London',
  weeklyMinutes: { monday: 60, tuesday: 45, wednesday: 60, thursday: 30, friday: 45, saturday: 90, sunday: 0 },
  weekdayMinutes: 48, weekendMinutes: 45,
}
function paper(course: typeof business, paperNumber: number, date: string, scope: RevisionAssessment['scope'] = {}): RevisionAssessment {
  return { assessmentId: `${course.id}:p${paperNumber}`, userId: 'fixture',
    courseId: course.id, subjectId: course.subjectId,
    moduleId: course.modules.find((x) => x.manifest.paper.number === paperNumber)!.manifest.id,
    title: `Paper ${paperNumber}`, assessmentType: 'public_exam', assessmentDate: date,
    relativeImportance: 'high', scope, isActive: true }
}
describe('FI-001: published Business 7132 and Psychology 7182 programme pathway', () => {
  it('new learner can see full paper horizon, named learning objectives and an exact supported next task', () => {
    const states = [createCourseLearningState(business, []), createCourseLearningState(psychology, [])]
    const assessments = [paper(business, 1, '2027-05-18'), paper(business, 2, '2027-06-02'),
      paper(psychology, 1, '2027-05-25')]
    const { programme, candidates } = buildLearnerPreparationProgramme(states, assessments, availability, [], [], now)
    expect(programme.finalKnownAssessment).toBe('2027-06-02')
    expect(programme.weeks.length).toBeGreaterThan(30)
    expect(programme.weeks.flatMap((week) => week.objectives).length).toBeGreaterThan(3)
    expect(programme.weeks.flatMap((week) => week.objectives).every((goal) =>
      states.some((state) => state.adapter.getTopic(goal.topicId)
        && state.adapter.listLearnChapters().some((ch) => ch.topicId === goal.topicId)))).toBe(true)
    expect(candidates.every((candidate) => candidate.understanding === null)).toBe(true)
    const snapshot = buildPlannerSnapshot(states, assessments, availability, [], [], now, [], 14)
    expect(snapshot?.today.length).toBeGreaterThan(0)
    const eligibleGoals = new Set(programme.weeks.slice(0, 2).flatMap((week) => week.objectives.map((goal) => goal.candidateId)))
    expect(snapshot?.today.every((item) => eligibleGoals.has(item.candidateId))).toBe(true)
    expect(snapshot?.today.every((item) => item.assessmentTargets?.some((target) => target.assessmentDate > '2026-10-15'))).toBe(true)
  })
  it('pairs published Learn material with a later scored-check opportunity without treating exposure as mastery', () => {
    const states = [createCourseLearningState(business, [])]
    const assessments = [paper(business, 1, '2027-05-18')]
    const candidates = preparationCandidatesFromLearningState(states, assessments, [], now)
    const teaching = candidates.filter((item) => item.preparationStage === 'acquire')
    const checks = candidates.filter((item) => item.preparationStage === 'check')
    expect(teaching.length).toBeGreaterThan(0)
    expect(checks.length).toBeGreaterThan(0)
    for (const check of checks) {
      const introduction = teaching.find((item) => item.id === check.preparationPrerequisiteId)
      expect(introduction?.learnTarget?.learnPageId).toBeTruthy()
      expect(check.understanding).toBeNull()
    }
    const result = buildLearnerPreparationProgramme(states, assessments, availability, [], [], now)
    const ordered = result.programme.weeks.flatMap((week) => week.objectives.map((goal) => goal.candidateId))
    for (const check of checks) {
      const introduction = ordered.indexOf(check.preparationPrerequisiteId ?? '')
      const verification = ordered.indexOf(check.id)
      if (verification >= 0) expect(introduction).toBeGreaterThanOrEqual(0)
      if (verification >= 0) expect(verification).toBeGreaterThan(introduction)
    }
  })

  it('builds exact paper-response opportunities only from verified, eligible published Business questions', () => {
    const states = [createCourseLearningState(business, [])]
    const exam = paper(business, 1, '2027-05-18')
    const candidates = preparationCandidatesFromLearningState(states, [exam], [], now)
    const practice = candidates.filter((item) => item.preparationStage === 'exam-practice')
    expect(practice.length).toBeGreaterThan(0)
    expect(practice.every((item) => item.examTarget?.moduleId === exam.moduleId
      && item.assessmentTargets?.every((target) => target.assessmentId === exam.assessmentId
        && target.assessmentDate === exam.assessmentDate))).toBe(true)
    expect(practice.every((item) => item.preparationPrerequisiteId
      && candidates.some((candidate) => candidate.id === item.preparationPrerequisiteId))).toBe(true)
    const snapshot = buildLearnerPreparationProgramme(states, [exam], availability, [], [], now)
    const ordered = snapshot.programme.weeks.flatMap((week) => week.objectives.map((goal) => goal.candidateId))
    expect(ordered.filter((id) => practice.some((item) => item.id === id)).length).toBeGreaterThan(0)
    for (const item of practice) {
      const after = ordered.indexOf(item.id)
      if (after < 0) continue
      expect(after).toBeGreaterThan(ordered.indexOf(item.preparationPrerequisiteId!))
    }
  })

  it('unselected psychology paper 3 options never become preparation goals', () => {
    const state = createCourseLearningState(psychology, [])
    const disputed = paper(psychology, 3, '2027-06-11', { topicIds: ['relationships', 'gender'] })
    expect(preparationCandidatesFromLearningState([state], [disputed], [], now)).toHaveLength(0)
  })
  it('without dates the planner does not manufacture a last paper or readiness', () => {
    const state = createCourseLearningState(business, [])
    const { programme } = buildLearnerPreparationProgramme([state], [], availability, [], [], now)
    expect(programme.finalKnownAssessment).toBeNull()
    expect(programme.weeks).toEqual([])
    expect(programme.constraints.join(' ')).toContain('No confirmed future examination')
  })
})
