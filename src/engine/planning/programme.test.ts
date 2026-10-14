import { describe, expect, it } from 'vitest'
import type { PlannerCandidate } from './planning'
import { buildPlannerProgramme, type ProgrammeAssessment } from './programme'

const today = '2026-10-14'
const active = new Set(['aqa:aqa-a-level:7132', 'aqa:aqa-a-level:7182'])
const business = 'aqa:aqa-a-level:7132'
const psychology = 'aqa:aqa-a-level:7182'

function exam(overrides: Partial<ProgrammeAssessment> = {}): ProgrammeAssessment {
  return {
    assessmentId: 'business-paper-1', courseId: business, subjectId: 'business',
    title: 'AQA Business Paper 1', assessmentDate: '2027-05-18',
    isActive: true, ...overrides,
  }
}

function supported(overrides: Partial<PlannerCandidate> = {}): PlannerCandidate {
  return {
    id: 'business-shared-marketing-quick-check',
    courseId: business, subjectId: 'business', assessmentId: 'business-paper-1',
    topicId: 'marketing', activityType: 'quick-check', estimatedMinutes: 20,
    daysUntilAssessment: 216, assessmentImportance: 'normal', coverage: 0,
    evidenceStrength: 0.2, understanding: null, readiness: null, examWeight: null,
    learnerPreference: 0, recentlyCompleted: false,
    assessmentTargets: [{
      assessmentId: 'business-paper-1', assessmentDate: '2027-05-18',
      topicIds: ['marketing'], daysUntilAssessment: 216, assessmentImportance: 'normal',
    }],
    ...overrides,
  }
}

describe('FI-001 R2a full-exam weekly programme projection', () => {
  it('R2-01 shows a known paper beyond 60 days without creating dated daily tasks', () => {
    const result = buildPlannerProgramme(today, [exam()], active, [supported()])
    expect(result.finalKnownAssessment).toBe('2027-05-18')
    expect(result.weeks.length).toBeGreaterThan(28)
    expect(result.weeks[0].visibleFrom).toBe(today)
    expect(result.weeks.at(-1)?.milestones).toEqual([{
      assessmentId: 'business-paper-1', courseId: business,
      subjectId: 'business', title: 'AQA Business Paper 1', date: '2027-05-18',
    }])
    expect(result.weeks.every((week) => !('items' in week) && !('bookedMinutes' in week))).toBe(true)
    expect(result.weeks.every((week) => week.visibleFrom <= week.visibleUntil)).toBe(true)
    expect(result.weeks[0].supportedCourseIds).toEqual([business])
  })

  it.each([120, 365, 730])('R2-01 %d-day horizon stays coarse and includes final date', (days) => {
    const date = new Date(Date.parse(`${today}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10)
    const result = buildPlannerProgramme(today, [exam({ assessmentDate: date })], active)
    expect(result.finalKnownAssessment).toBe(date)
    expect(result.weeks.length).toBeGreaterThan(1)
    expect(result.weeks.at(-1)?.milestones[0]?.date).toBe(date)
    expect(result.weeks.every((w) => w.supportedCourseIds.length === 0)).toBe(true)
  })

  it('R2-02 preserves separate paper milestones but shared supported course appears once per week', () => {
    const second = exam({ assessmentId: 'business-paper-2', title: 'AQA Business Paper 2', assessmentDate: '2027-06-02' })
    const candidates = [supported({ assessmentTargets: [
      supported().assessmentTargets![0],
      { assessmentId: 'business-paper-2', assessmentDate: '2027-06-02', topicIds: ['marketing'],
        daysUntilAssessment: 231, assessmentImportance: 'normal' },
    ] })]
    const result = buildPlannerProgramme(today, [second, exam()], active, candidates)
    expect(result.finalKnownAssessment).toBe('2027-06-02')
    expect(result.weeks.flatMap((w) => w.milestones.map((m) => m.assessmentId))).toEqual([
      'business-paper-1', 'business-paper-2',
    ])
    expect(result.weeks[0].supportedCourseIds).toEqual([business])
    const postFirstPaper = result.weeks.find((w) => w.visibleFrom > '2027-05-18' && w.visibleFrom < '2027-06-02')
    expect(postFirstPaper?.supportedCourseIds).toEqual([business])
    expect(result.weeks.at(-1)?.supportedCourseIds).toEqual([business])
  })

  it('R2-05 excludes past, inactive, unknown and wrong-course exams without inventing deadlines', () => {
    const onlyInvalid = [
      exam({ assessmentDate: '2026-02-31' }),
      exam({ assessmentId: 'a', isActive: false }),
      exam({ assessmentId: 'b', assessmentDate: '2026-10-13' }),
      exam({ assessmentId: 'c', courseId: 'unknown' }),
      exam({ assessmentId: 'd', courseId: null }),
    ]
    expect(buildPlannerProgramme(today, onlyInvalid, active)).toEqual({
      version: 1, today, finalKnownAssessment: null, weeks: [],
    })
    expect(() => buildPlannerProgramme('2026-02-31', [exam()], active)).toThrow('valid local today')
  })

  it('R2-03/R2-06 leaves unsupported Psychology, unverified routes and absent evidence unclaimed', () => {
    const psychologyPaper = exam({
      assessmentId: 'psychology-paper-3', courseId: psychology, subjectId: 'psychology',
      title: 'Psychology Paper 3', assessmentDate: '2027-06-11',
    })
    const result = buildPlannerProgramme(today, [psychologyPaper], active, [
      supported({ courseId: psychology, assessmentTargets: undefined }),
      supported({ courseId: psychology, assessmentTargets: [
        { assessmentId: 'fabricated-option', assessmentDate: '2027-06-11', topicIds: ['unknown'],
          daysUntilAssessment: 240, assessmentImportance: 'normal' },
      ] }),
    ])
    expect(result.weeks.at(-1)?.milestones[0]?.assessmentId).toBe('psychology-paper-3')
    expect(result.weeks.every((w) => w.supportedCourseIds.length === 0)).toBe(true)
  })

  it('R2-05 keeps R1 paper eligibility cutoffs even when an earlier paper has expired', () => {
    const first = exam({ assessmentDate: '2026-10-14' })
    const second = exam({ assessmentId: 'business-paper-2', assessmentDate: '2026-10-26' })
    const result = buildPlannerProgramme(today, [first, second], active, [
      supported({ assessmentTargets: [
        { assessmentId: 'business-paper-1', assessmentDate: '2026-10-14', topicIds: ['marketing'],
          daysUntilAssessment: 0, assessmentImportance: 'normal' },
        { assessmentId: 'business-paper-2', assessmentDate: '2026-10-26', topicIds: ['marketing'],
          daysUntilAssessment: 12, assessmentImportance: 'normal' },
      ] }),
    ])
    expect(result.weeks[0].milestones[0].assessmentId).toBe('business-paper-1')
    expect(result.weeks[0].supportedCourseIds).toEqual([business]) // Only for later eligible paper.
    expect(result.weeks.at(-1)?.supportedCourseIds).toEqual([]) // Paper date itself is not study time.
  })

  it('R2-11 is deterministic independent of input ordering and never mutates the source', () => {
    const assessments = [
      exam({ assessmentId: 'psychology-paper-1', courseId: psychology, subjectId: 'psychology', assessmentDate: '2027-05-13' }),
      exam(),
    ]
    const candidates = [supported(), supported({ courseId: psychology, id: 'psychology-topic',
      assessmentTargets: [{ assessmentId: 'psychology-paper-1', assessmentDate: '2027-05-13', topicIds: ['social-influence'],
        daysUntilAssessment: 211, assessmentImportance: 'normal' }] })]
    const before = structuredClone({ assessments, candidates })
    const first = buildPlannerProgramme(today, assessments, active, candidates)
    const second = buildPlannerProgramme(today, [...assessments].reverse(), active, [...candidates].reverse())
    expect(first).toEqual(second)
    expect({ assessments, candidates }).toEqual(before)
    expect(first.weeks[0].supportedCourseIds).toEqual([business, psychology])
  })

  it('R2-05 uses stable date keys across autumn and spring UK clock changes', () => {
    for (const key of ['2026-10-25', '2027-03-28']) {
      const result = buildPlannerProgramme('2026-10-14', [exam({ assessmentDate: key })], active)
      expect(result.finalKnownAssessment).toBe(key)
      expect(result.weeks.at(-1)?.visibleUntil).toBe(key)
      expect(result.weeks.flatMap((w) => w.milestones).map((m) => m.date)).toEqual([key])
    }
  })
})
