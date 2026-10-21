import { describe, expect, it } from 'vitest'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import { buildCatalogue, createCourseLearningState, coveredTopicsFromLearn } from './catalogue-model'
import type { LearnPageExposure } from '../services/progress/learn-exposure-service'

const catalogue = buildCatalogue(listAvailableContentAdapters())
const specifications = ['7132', '7182'] as const

for (const specification of specifications) {
  describe(`R2 Learn exposure and truthful coverage — AQA ${specification}`, () => {
    const course = catalogue.flatMap(subject => subject.courses)
      .find(item => item.specificationCode === specification && item.id.startsWith('aqa:'))
    if (!course) throw new Error(`Expected live AQA ${specification} course`)
    const adapter = course.learningAdapter
    const pages = adapter.listLearnChapters().flatMap(chapter => chapter.groups.flatMap(group => group.pages))
    const topic = pages[0]?.topicId
    if (!topic) throw new Error(`AQA ${specification} has no Learn page to verify`)
    const topicPages = pages.filter(page => page.topicId === topic)
    const makeExposure = (pageId: string, topicId = topic, courseId = course.id, moduleId = adapter.manifest.id): LearnPageExposure => ({
      userId: 'student-one', courseId, moduleId, topicId, pageId, reviewedAt: '2026-10-21T12:00:00.000Z',
    })

    it('does not claim coverage just from opening a page or an incomplete multi-page read', () => {
      const initial = createCourseLearningState(course, [])
      expect(initial.evidencedTopics).toBe(0)
      expect(coveredTopicsFromLearn(adapter, course.id, [])).toEqual(new Set())
      if (topicPages.length > 1) {
        const partial = [makeExposure(topicPages[0].id)]
        expect(coveredTopicsFromLearn(adapter, course.id, partial).has(topic)).toBe(false)
        expect(createCourseLearningState(course, [], partial).evidencedTopics).toBe(0)
      }
    })

    it('allows explicit review of all current pages to change Topics covered but never scored understanding or exam readiness', () => {
      const baseline = createCourseLearningState(course, [])
      const reviewed = topicPages.map(page => makeExposure(page.id))
      const result = createCourseLearningState(course, [], reviewed)
      expect(coveredTopicsFromLearn(adapter, course.id, reviewed).has(topic)).toBe(true)
      expect(result.evidencedTopics).toBe(1)
      expect(result.topicKnowledge).toEqual(baseline.topicKnowledge)
      expect(result.readiness).toEqual(baseline.readiness)
      expect(result.recommendation).toEqual(baseline.recommendation)
      expect(result.evidence).toEqual([])
    })

    it('refuses another course, module, stale page or falsified topic when counting reviewed material', () => {
      const exposed = topicPages.map(page => makeExposure(page.id))
      const cases = [
        exposed.map(page => ({ ...page, courseId: 'aqa:aqa-a-level:other' })),
        exposed.map(page => ({ ...page, moduleId: 'unrelated-module' })),
        exposed.map(page => ({ ...page, pageId: 'nonexistent-page' })),
        exposed.map(page => ({ ...page, topicId: 'unrelated-topic' })),
      ]
      for (const items of cases) {
        expect(coveredTopicsFromLearn(adapter, course.id, items).has(topic)).toBe(false)
      }
    })
  })
}
