import { describe, expect, it } from 'vitest'
import { businessAqaAsPaper2 } from '../../content/business/aqa-as/paper-2'
import { businessAqaALevel7132Paper1 } from '../../content/business/aqa-a-level/paper-1'
import { businessAqaALevel7132Paper2 } from '../../content/business/aqa-a-level/paper-2'
import { businessAqaALevel7132Paper3 } from '../../content/business/aqa-a-level/paper-3'
import { createLearningContentAdapter } from '../engine/content/content-adapter'
import type { ContentPack } from '../../content/schema'
import { buildCatalogue, chooseRecommendedModule, createCourseLearningState, createModuleLearningState } from './catalogue-model'

function variantPack(subjectId: string, subjectName: string, moduleId: string, paperNumber: number): ContentPack {
  return {
    ...businessAqaAsPaper2,
    manifest: {
      ...businessAqaAsPaper2.manifest,
      id: moduleId,
      subject: { id: subjectId, name: subjectName },
      paper: { ...businessAqaAsPaper2.manifest.paper, id: `paper-${paperNumber}`, name: `Paper ${paperNumber}`, number: paperNumber },
    },
  }
}

describe('catalogue-driven learner model', () => {
  it('groups arbitrary available modules into subjects and courses without UI-specific subject logic', () => {
    const adapters = [
      createLearningContentAdapter(businessAqaAsPaper2),
      createLearningContentAdapter(variantPack('spanish', 'Spanish', 'spanish-example-paper-1', 1)),
    ]
    const catalogue = buildCatalogue(adapters)

    expect(catalogue.map((subject) => subject.name)).toEqual(['Business', 'Spanish'])
    expect(catalogue.find((subject) => subject.id === 'spanish')?.modules[0]?.manifest.id).toBe('spanish-example-paper-1')
  })

  it('collapses identical A-level paper learning content into one shared course learning scope', () => {
    const adapters = [
      createLearningContentAdapter(businessAqaALevel7132Paper1),
      createLearningContentAdapter(businessAqaALevel7132Paper2),
      createLearningContentAdapter(businessAqaALevel7132Paper3),
    ]
    const business = buildCatalogue(adapters)[0]
    const course = business?.courses[0]

    expect(course?.sharedLearning).toBe(true)
    expect(course?.modules).toHaveLength(3)
    expect(course?.learningAdapter.listTopics()).toHaveLength(10)
  })

  it('treats the current AS Business pack as one course-level learning scope rather than a Paper 2 syllabus', () => {
    const adapter = createLearningContentAdapter(businessAqaAsPaper2)
    const course = buildCatalogue([adapter])[0]?.courses[0]

    expect(course?.sharedLearning).toBe(true)
    expect(course?.learningAdapter.manifest.id).toBe('business-aqa-as-paper-2')
    expect(course?.modules).toHaveLength(1)
  })

  it('aggregates course evidence recorded under different A-level paper module ids', () => {
    const adapters = [
      createLearningContentAdapter(businessAqaALevel7132Paper1),
      createLearningContentAdapter(businessAqaALevel7132Paper2),
      createLearningContentAdapter(businessAqaALevel7132Paper3),
    ]
    const course = buildCatalogue(adapters)[0]!.courses[0]!
    const topicId = course.learningAdapter.listTopics()[0]!.id
    const evidence = [
      {
        id: 'paper-1-evidence', schemaVersion: 1 as const, moduleId: businessAqaALevel7132Paper1.manifest.id,
        topicId, source: 'flashcard' as const, occurredAt: '2026-08-18T08:00:00.000Z', contentId: businessAqaALevel7132Paper1.flashcards[0]!.id, rating: 2 as const,
      },
      {
        id: 'paper-2-evidence', schemaVersion: 1 as const, moduleId: businessAqaALevel7132Paper2.manifest.id,
        topicId, source: 'flashcard' as const, occurredAt: '2026-08-18T09:00:00.000Z', contentId: businessAqaALevel7132Paper2.flashcards[0]!.id, rating: 1 as const,
      },
    ]

    const state = createCourseLearningState(course, evidence)
    expect(state.evidence).toHaveLength(2)
    expect(state.evidencedTopics).toBe(1)
    expect(state.course?.id).toBe(course.id)
  })

  it('recommends a learning scope with no evidence before one that already has evidence', () => {
    const business = createLearningContentAdapter(businessAqaAsPaper2)
    const spanish = createLearningContentAdapter(variantPack('spanish', 'Spanish', 'spanish-example-paper-1', 1))
    const businessEvidence = [{
      id: 'evidence-1',
      schemaVersion: 1 as const,
      moduleId: business.manifest.id,
      topicId: business.listTopics()[0]!.id,
      source: 'flashcard' as const,
      occurredAt: '2026-08-18T08:00:00.000Z',
      contentId: business.listFlashcards()[0]!.id,
      rating: 2 as const,
    }]

    const selected = chooseRecommendedModule([
      createModuleLearningState(business, businessEvidence),
      createModuleLearningState(spanish, businessEvidence),
    ])

    expect(selected?.adapter.manifest.subject.name).toBe('Spanish')
  })
})
