import { describe, expect, it } from 'vitest'
import { nextSetupAction, planCardEmptyCopy } from './HomeSetupEmpty'

describe('Home setup next step', () => {
  it('asks for a course first, then exam dates, then study times', () => {
    expect(nextSetupAction({ courseCount: 0, hasExamDates: false, hasStudyTimes: false })).toMatchObject({ step: 1, target: 'courses' })
    expect(nextSetupAction({ courseCount: 2, hasExamDates: false, hasStudyTimes: false })).toMatchObject({ step: 2, target: 'plan', label: 'Build my plan' })
    expect(nextSetupAction({ courseCount: 2, hasExamDates: true, hasStudyTimes: false })).toMatchObject({ step: 3, label: 'Choose study times' })
  })

  it('tells the plan card what is missing, in order, and never pretends a plan exists', () => {
    expect(planCardEmptyCopy({ hasExamDates: false, hasStudyTimes: false })).toMatchObject({ label: 'Add exam dates' })
    expect(planCardEmptyCopy({ hasExamDates: true, hasStudyTimes: false })).toMatchObject({ label: 'Choose study times' })
    expect(planCardEmptyCopy({ hasExamDates: true, hasStudyTimes: true }).text).toContain('Nothing is planned yet')
  })
})
