import { describe, expect, it } from 'vitest'
import { adminRoute, courseRoute, homeRoute, moduleRoute, parseRoute, planRoute, progressRoute, routeBelongsToSubjects, routeHash, subjectRoute } from './navigation'

describe('learner navigation model', () => {
  it('maps the governed Plan destination to a reloadable hash route', () => {
    expect(routeHash(planRoute())).toBe('#/plan')
    expect(parseRoute('#/plan')).toEqual(planRoute())
  })

  it('maps course learning scopes to reloadable hash routes', () => {
    const business = courseRoute('business', 'aqa:aqa-a-level:7132', 'exam-prep')
    expect(routeHash(business)).toBe('#/subjects/business/courses/aqa%3Aaqa-a-level%3A7132/exam-prep')
    expect(parseRoute(routeHash(business))).toEqual(business)
  })

  it('keeps module routes for genuinely component-specific content and compatibility', () => {
    const spanish = moduleRoute('spanish', 'spanish-aqa-a-level-paper-1', 'exam-prep')
    expect(routeHash(spanish)).toBe('#/subjects/spanish/modules/spanish-aqa-a-level-paper-1/exam-prep')
    expect(parseRoute(routeHash(spanish))).toEqual(spanish)
  })

  it('keeps protected Admin detail hashes inside the Admin route', () => {
    expect(parseRoute('#/admin')).toEqual(adminRoute())
    expect(parseRoute('#/admin/users')).toEqual(adminRoute())
    expect(parseRoute('#/admin/activity')).toEqual(adminRoute())
    expect(parseRoute('#/admin/health')).toEqual(adminRoute())
    expect(parseRoute('#/admin/content')).toEqual(adminRoute())
  })

  it('falls back to Home for an unknown hash', () => {
    expect(parseRoute('#/not-a-real-route')).toEqual(homeRoute())
  })

  it('keeps subject, course and module screens inside the Subjects global context', () => {
    expect(routeBelongsToSubjects(subjectRoute('business'))).toBe(true)
    expect(routeBelongsToSubjects(courseRoute('business', 'aqa:aqa-a-level:7132', 'progress'))).toBe(true)
    expect(routeBelongsToSubjects(moduleRoute('business', 'business-aqa-as-paper-2', 'progress'))).toBe(true)
    expect(routeBelongsToSubjects(planRoute())).toBe(false)
    expect(routeBelongsToSubjects(progressRoute())).toBe(false)
  })

  it('keeps the short-lived Business Paper 2 hashes compatible', () => {
    expect(parseRoute('#/subjects/business/aqa-as/paper-2/learn')).toEqual(moduleRoute('business', 'business-aqa-as-paper-2', 'learn'))
  })
})
