import { describe, expect, it } from 'vitest'
import { businessAqaAsPaper2 } from '../../content/business/aqa-as/paper-2'
import { createLearningContentAdapter } from '../engine/content/content-adapter'
import type { ContentPack } from '../../content/schema'
import { buildCatalogue, chooseRecommendedModule, createModuleLearningState } from './catalogue-model'

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

  it('recommends a module with no evidence before one that already has evidence', () => {
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
