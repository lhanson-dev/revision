import { describe, expect, it } from 'vitest'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import { buildPlannerProgramme } from '../engine/planning/programme'
import type { RevisionAssessment } from '../services/planning/planner-service'
import { buildCatalogue, createCourseLearningState } from './catalogue-model'
import { allCatalogueCourses } from './learner-programme'
import { plannerCandidatesFromLearningState } from './planner-model'

const courses = allCatalogueCourses(buildCatalogue(listAvailableContentAdapters()))
const business = courses.find(({ course }) => course.id === 'aqa:aqa-a-level:7132')!.course
const psychology = courses.find(({ course }) => course.id === 'aqa:aqa-a-level:7182')!.course
const now = new Date(2026, 9, 14, 12)
const today = '2026-10-14'
const active = new Set([business.id, psychology.id])
const states = [createCourseLearningState(business, []), createCourseLearningState(psychology, [])]

function paper(course: typeof business, paperNumber: number, date: string, scope: RevisionAssessment['scope'] = {}): RevisionAssessment {
  return {
    assessmentId: `${course.id}-paper-${paperNumber}`, userId: 'r2c-fixture', courseId: course.id,
    subjectId: course.subjectId,
    moduleId: course.modules.find((item) => item.manifest.paper.number === paperNumber)!.manifest.id,
    assessmentType: 'public_exam', title: `Paper ${paperNumber}`,
    assessmentDate: date, relativeImportance: 'normal', scope, isActive: true,
  }
}

function programme(assessments: RevisionAssessment[]) {
  const candidates = plannerCandidatesFromLearningState(states, assessments, [], now)
  return buildPlannerProgramme(today, assessments.map((a) => ({
    assessmentId: a.assessmentId, subjectId: a.subjectId,
    courseId: a.courseId, title: a.title, assessmentDate: a.assessmentDate, isActive: a.isActive,
  })), active, candidates)
}

describe('FI-001 R2c real-course programme projection and benchmark', () => {
  it('R2-02 real Business 7132 shares a course opportunity across later paper dates', () => {
    const first = paper(business, 1, '2027-05-18')
    const second = paper(business, 2, '2027-06-02')
    const result = programme([first, second])
    expect(result.weeks.flatMap((week) => week.milestones.map((m) => m.assessmentId))).toEqual([
      first.assessmentId, second.assessmentId,
    ])
    expect(result.weeks[0].supportedCourseIds).toEqual([business.id])
    const between = result.weeks.find((week) => week.visibleFrom === '2027-05-24')
    expect(between?.priorities).toEqual([{ courseId: business.id, nextAssessmentDate: '2027-06-02' }])
    expect(result.weeks.at(-1)?.supportedCourseIds).toEqual([business.id])
  })

  it('R2-03 rejects conflicting Psychology 7182 Paper 3 options without inventing focus', () => {
    const paper3 = paper(psychology, 3, '2027-06-11', { topicIds: ['relationships', 'gender'] })
    const result = programme([paper3])
    expect(result.finalKnownAssessment).toBe(paper3.assessmentDate)
    expect(result.weeks.at(-1)?.milestones.map((m) => m.assessmentId)).toEqual([paper3.assessmentId])
    expect(result.weeks.every((week) => week.supportedCourseIds.length === 0 && !week.priorities?.length)).toBe(true)
  })

  it.each([120, 365, 730])('R2-11 real-course %d-day horizon remains deterministic and records compute cost', (days) => {
    const key = new Date(Date.parse(today + 'T00:00:00Z') + days * 86_400_000).toISOString().slice(0, 10)
    const assessments = [paper(business, 1, key), paper(psychology, 1, key)]
    const start = performance.now()
    const first = programme(assessments)
    const durationMs = Math.round((performance.now() - start) * 100) / 100
    const second = programme([...assessments].reverse())
    expect(first).toEqual(second)
    expect(first.finalKnownAssessment).toBe(key)
    expect(first.weeks.every((week) => week.visibleFrom <= week.visibleUntil)).toBe(true)
    // Observations, not an invented product SLA: compare CI measurements in review.
    console.info(`FI-001 R2c ${days}-day real registry horizon: ${first.weeks.length} weeks, ${durationMs} ms first projection`)
  })

  it('R2-03 real selected Psychology 7182 Paper 3 scope only exposes assured selected topics', () => {
    const selected = paper(psychology, 3, '2027-06-11', {
      topicIds: ['issues-and-debates-in-psychology', 'relationships', 'schizophrenia', 'aggression'],
    })
    const candidates = plannerCandidatesFromLearningState(states, [selected], [], now)
    expect(candidates.length).toBeGreaterThan(0)
    expect(candidates.every((item) => item.courseId === psychology.id
      && (selected.scope.topicIds as string[]).includes(item.topicId)
      && item.assessmentTargets?.every((target) => target.assessmentId === selected.assessmentId))).toBe(true)
    const result = programme([selected])
    expect(result.weeks[0].supportedCourseIds).toEqual([psychology.id])
    expect(result.weeks[0].priorities).toEqual([{ courseId: psychology.id, nextAssessmentDate: selected.assessmentDate }])
  })
})
