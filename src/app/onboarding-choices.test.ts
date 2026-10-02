import { describe, expect, it } from 'vitest'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import { buildCatalogue } from './catalogue-model'
import { allCatalogueCourses } from './learner-programme'
import { boardsComplete, chosenCourseIds, levelOfCourse, levelsAvailable, offeringsFor, subjectsAtLevel } from './onboarding-choices'

const courses = allCatalogueCourses(buildCatalogue(listAvailableContentAdapters()))

describe('Onboarding choices come from the live catalogue', () => {
  it('puts every live course under a level, with AS under A-level', () => {
    expect(courses.length).toBeGreaterThan(0)
    courses.forEach((item) => expect(['gcse', 'a-level']).toContain(levelOfCourse(item)))
    const as = courses.find((item) => /\bAS\b/.test(item.course.qualificationName))
    if (as) expect(levelOfCourse(as)).toBe('a-level')
  })

  it('offers only levels that have a live course', () => {
    const levels = levelsAvailable(courses).map((level) => level.id)
    expect(levels).toContain('a-level')
    expect(levelsAvailable([]).length).toBe(0)
  })

  it('lists the subjects at a level and the ways to study each one', () => {
    const subjects = subjectsAtLevel(courses, 'a-level')
    expect(subjects.map((subject) => subject.id)).toContain('business')
    expect(subjectsAtLevel(courses, 'gcse')).toEqual(courses.some((item) => levelOfCourse(item) === 'gcse') ? subjectsAtLevel(courses, 'gcse') : [])
    const offerings = offeringsFor(courses, 'a-level', 'business')
    expect(offerings.length).toBeGreaterThan(0)
    offerings.forEach((item) => expect(item.subject.id).toBe('business'))
  })

  it('picks the course for a subject with one offering, and needs a pick when there are several', () => {
    const offerings = offeringsFor(courses, 'a-level', 'business')
    if (offerings.length === 1) {
      expect(chosenCourseIds(courses, 'a-level', ['business'], {})).toEqual([offerings[0].course.id])
      expect(boardsComplete(courses, 'a-level', ['business'], {})).toBe(true)
    } else {
      expect(chosenCourseIds(courses, 'a-level', ['business'], {})).toEqual([])
      expect(boardsComplete(courses, 'a-level', ['business'], {})).toBe(false)
      expect(boardsComplete(courses, 'a-level', ['business'], { business: offerings[0].course.id })).toBe(true)
    }
    expect(boardsComplete(courses, 'a-level', [], {})).toBe(false)
  })
})
