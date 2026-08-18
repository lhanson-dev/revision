import { describe, expect, it } from 'vitest'
import { paperSectionRoute, parseRoute, routeBelongsToSubjects, routeHash } from './navigation'

describe('learner navigation model', () => {
  it('maps focused paper sections to reloadable hash routes', () => {
    expect(routeHash('paper-2-learn')).toBe('#/subjects/business/aqa-as/paper-2/learn')
    expect(parseRoute('#/subjects/business/aqa-as/paper-2/exam-prep')).toBe('paper-2-exam-prep')
  })

  it('falls back to Home for an unknown hash', () => {
    expect(parseRoute('#/not-a-real-route')).toBe('home')
  })

  it('keeps subject and paper screens inside the Subjects global context', () => {
    expect(routeBelongsToSubjects('subject-business')).toBe(true)
    expect(routeBelongsToSubjects('paper-2-progress')).toBe(true)
    expect(routeBelongsToSubjects('progress')).toBe(false)
  })

  it('resolves the governed paper section routes', () => {
    expect(paperSectionRoute('overview')).toBe('paper-2-overview')
    expect(paperSectionRoute('practice')).toBe('paper-2-practice')
  })
})
