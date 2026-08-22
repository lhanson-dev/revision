import { describe, expect, it } from 'vitest'
import {
  adminRoute,
  coursesRoute,
  homeRoute,
  learnerCourseRoute,
  learnerModuleRoute,
  parseRoute,
  planRoute,
  progressRoute,
  routeBelongsToCourses,
  routeHash,
} from './navigation'

describe('learner navigation model', () => {
  it('maps the governed Plan destination to a reloadable hash route', () => {
    expect(routeHash(planRoute())).toBe('#/plan')
    expect(parseRoute('#/plan')).toEqual(planRoute())
  })

  it('uses Courses as the canonical learner index', () => {
    expect(routeHash(coursesRoute())).toBe('#/courses')
    expect(parseRoute('#/courses')).toEqual(coursesRoute())
  })

  it('addresses course learning scopes without a subject URL hop', () => {
    const route = learnerCourseRoute('aqa:aqa-a-level:7132', 'exam-prep')
    expect(routeHash(route)).toBe('#/courses/aqa%3Aaqa-a-level%3A7132/exam-prep')
    expect(parseRoute(routeHash(route))).toEqual(route)
    expect(routeBelongsToCourses(route)).toBe(true)
  })

  it('keeps component-specific content beneath the owning course', () => {
    const route = learnerModuleRoute('aqa:aqa-as:7131', 'business-aqa-as-paper-2', 'exam-prep')
    expect(routeHash(route)).toBe('#/courses/aqa%3Aaqa-as%3A7131/components/business-aqa-as-paper-2/exam-prep')
    expect(parseRoute(routeHash(route))).toEqual(route)
  })

  it('accepts legacy Subjects links but emits the Courses route family', () => {
    const legacyCourse = parseRoute('#/subjects/business/courses/aqa%3Aaqa-a-level%3A7132/exam-prep')
    expect(legacyCourse.kind).toBe('course')
    expect(routeHash(legacyCourse)).toBe('#/courses/aqa%3Aaqa-a-level%3A7132/exam-prep')

    const legacyIndex = parseRoute('#/subjects')
    expect(routeHash(legacyIndex)).toBe('#/courses')
  })

  it('preserves protected Admin detail hashes instead of normalising them to the Admin root', () => {
    expect(parseRoute('#/admin')).toEqual(adminRoute())
    expect(parseRoute('#/admin/users')).toEqual(adminRoute('users'))
    expect(parseRoute('#/admin/activity')).toEqual(adminRoute('activity'))
    expect(parseRoute('#/admin/health')).toEqual(adminRoute('health'))
    expect(parseRoute('#/admin/assurance')).toEqual(adminRoute('assurance'))
    expect(parseRoute('#/admin/content')).toEqual(adminRoute('content'))
    expect(parseRoute('#/admin/planner')).toEqual(adminRoute('planner'))
    expect(routeHash(adminRoute('users'))).toBe('#/admin/users')
  })

  it('falls back to Home for an unknown hash', () => {
    expect(parseRoute('#/not-a-real-route')).toEqual(homeRoute())
  })

  it('does not classify Plan or global Progress as Courses context', () => {
    expect(routeBelongsToCourses(planRoute())).toBe(false)
    expect(routeBelongsToCourses(progressRoute())).toBe(false)
  })

  it('keeps the short-lived Business Paper 2 hashes compatible', () => {
    const legacy = parseRoute('#/subjects/business/aqa-as/paper-2/learn')
    expect(legacy.kind).toBe('module')
    expect(routeHash(legacy)).toBe('#/courses')
  })
})
