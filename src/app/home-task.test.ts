import { describe, expect, it } from 'vitest'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import { buildCatalogue, createCourseLearningState } from './catalogue-model'
import { fallbackHomeTasks } from './home-task'
import { allCatalogueCourses } from './learner-programme'
import { subjectAccentKey } from './subject-accents'

describe('Returning Student Home tasks', () => {
  it('builds a deterministic useful fallback without planner setup', () => {
    const catalogue = buildCatalogue(listAvailableContentAdapters())
    const business = allCatalogueCourses(catalogue).find((item) => item.subject.id === 'business')
    expect(business).toBeDefined()
    if (!business) return

    const state = createCourseLearningState(business.course, [])
    const first = fallbackHomeTasks([state], [business])
    const second = fallbackHomeTasks([state], [business])

    expect(first).toHaveLength(1)
    expect(second).toEqual(first)
    expect(first[0]?.courseId).toBe(business.course.id)
    expect(first[0]?.subjectName).toBe('Business')
    expect(first[0]?.subjectAccent).toBe('business')
    expect(first[0]?.reason.length).toBeGreaterThan(0)
    expect(['flashcards', 'quick-check', 'exam-question']).toContain(first[0]?.activityType)
  })

  it('keeps the governed subject mapping central and safely neutral by default', () => {
    expect(subjectAccentKey('business')).toBe('business')
    expect(subjectAccentKey('economics')).toBe('economics')
    expect(subjectAccentKey('physics')).toBe('neutral')
  })
})
