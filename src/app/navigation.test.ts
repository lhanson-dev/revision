import { describe, expect, it } from 'vitest'
import { homeRoute, moduleRoute, parseRoute, progressRoute, routeBelongsToSubjects, routeHash, subjectRoute } from './navigation'

describe('learner navigation model', () => {
  it('maps arbitrary modules to reloadable hash routes', () => {
    const spanish = moduleRoute('spanish', 'spanish-aqa-a-level-paper-1', 'exam-prep')
    expect(routeHash(spanish)).toBe('#/subjects/spanish/modules/spanish-aqa-a-level-paper-1/exam-prep')
    expect(parseRoute(routeHash(spanish))).toEqual(spanish)
  })

  it('falls back to Home for an unknown hash', () => {
    expect(parseRoute('#/not-a-real-route')).toEqual(homeRoute())
  })

  it('keeps subject and module screens inside the Subjects global context', () => {
    expect(routeBelongsToSubjects(subjectRoute('business'))).toBe(true)
    expect(routeBelongsToSubjects(moduleRoute('business', 'business-aqa-as-paper-2', 'progress'))).toBe(true)
    expect(routeBelongsToSubjects(progressRoute())).toBe(false)
  })

  it('keeps the short-lived Business Paper 2 hashes compatible', () => {
    expect(parseRoute('#/subjects/business/aqa-as/paper-2/learn')).toEqual(moduleRoute('business', 'business-aqa-as-paper-2', 'learn'))
  })
})
