import { describe, expect, it } from 'vitest'
import { nextSetupAction } from './HomeSetupEmpty'

describe('Home setup next step', () => {
  it('asks for a course first, then exam dates, then study times', () => {
    expect(nextSetupAction({ courseCount: 0, hasExamDates: false, hasStudyTimes: false })).toMatchObject({ step: 1, target: 'courses' })
    expect(nextSetupAction({ courseCount: 2, hasExamDates: false, hasStudyTimes: false })).toMatchObject({ step: 2, target: 'plan', label: 'Build my plan' })
    expect(nextSetupAction({ courseCount: 2, hasExamDates: true, hasStudyTimes: false })).toMatchObject({ step: 3, label: 'Choose study times' })
  })
})
