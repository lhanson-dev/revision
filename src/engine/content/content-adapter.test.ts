import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { businessAqaALevel7132Paper1 } from '../../../content/business/aqa-a-level/paper-1'
import { businessAqaAsPaper2 } from '../../../content/business/aqa-as/paper-2'
import { contentPackSchema } from '../../../content/schema'
import { createLearningContentAdapter } from './content-adapter'
import { getContentAdapter, listCatalogueEntries } from './content-registry'

describe('shared content adapter', () => {
  it('adapts the Business Paper 2 pack without subject-specific engine logic', () => {
    const adapter = createLearningContentAdapter(businessAqaAsPaper2)

    expect(adapter.manifest.id).toBe('business-aqa-as-paper-2')
    expect(adapter.listTopics()).toHaveLength(6)
    expect(adapter.listTopics().map((topic) => topic.order)).toEqual([1, 2, 3, 4, 5, 6])
    expect(adapter.listFlashcards('finance').length).toBeGreaterThan(10)
    expect(adapter.listQuestions('operations').length).toBeGreaterThan(3)
    expect(adapter.listExamTechnique()).toHaveLength(6)
    expect(adapter.listExamTechnique()[0]?.id).toBe('blt-analysis')
    expect(adapter.listExams()[0]?.totalMarks).toBe(80)
  })

  it('builds a complete Learn hierarchy while preserving richer authored pages', () => {
    const adapter = createLearningContentAdapter(businessAqaALevel7132Paper1)
    const topics = adapter.listTopics()
    const chapters = adapter.listLearnChapters()

    expect(chapters).toHaveLength(topics.length)
    expect(chapters.map((chapter) => chapter.topicId)).toEqual(topics.map((topic) => topic.id))

    const limitedCompanies = adapter.getLearnPage('limited-companies-and-shareholders')
    expect(limitedCompanies?.blocks.some((block) => block.type === 'comparison')).toBe(true)

    const breakEven = adapter.getLearnPage('understanding-break-even')
    expect(breakEven?.blocks.some((block) => block.type === 'quantitative')).toBe(true)

    const businessTopic = topics.find((topic) => topic.id === 'business')
    const businessChapter = chapters.find((chapter) => chapter.topicId === 'business')
    const coveredSourceSections = new Set(
      businessChapter?.groups.flatMap((group) => group.pages.flatMap((page) => page.sourceSectionIds ?? [])) ?? [],
    )

    expect(businessTopic).toBeDefined()
    expect(businessTopic?.sections.every((section) => coveredSourceSections.has(section.id))).toBe(true)
  })

  it('exposes catalogue metadata from the same manifests used by learning', () => {
    const entries = listCatalogueEntries()
    expect(entries).toHaveLength(4)
    expect(entries).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'business-aqa-as-paper-2',
        subject: 'Business',
        examBoard: 'AQA',
        durationMinutes: 90,
        totalMarks: 80,
        topicCount: 6,
      }),
      expect.objectContaining({
        id: 'business-aqa-a-level-7132-paper-1',
        subject: 'Business',
        examBoard: 'AQA',
        durationMinutes: 120,
        totalMarks: 100,
        topicCount: 10,
      }),
      expect.objectContaining({
        id: 'business-aqa-a-level-7132-paper-2',
        subject: 'Business',
        examBoard: 'AQA',
        durationMinutes: 120,
        totalMarks: 100,
        topicCount: 10,
      }),
      expect.objectContaining({
        id: 'business-aqa-a-level-7132-paper-3',
        subject: 'Business',
        examBoard: 'AQA',
        durationMinutes: 120,
        totalMarks: 100,
        topicCount: 10,
      }),
    ]))
    expect(getContentAdapter('business-aqa-as-paper-2')?.manifest.subject.name).toBe('Business')
    expect(getContentAdapter('business-aqa-a-level-7132-paper-1')?.manifest.status).toBe('available')
    expect(getContentAdapter('business-aqa-a-level-7132-paper-2')?.manifest.status).toBe('available')
    expect(getContentAdapter('business-aqa-a-level-7132-paper-3')?.manifest.status).toBe('available')
    expect(getContentAdapter('missing-module')).toBeUndefined()
  })

  it('allows future subjects to use their own topic IDs and omit optional technique guides', () => {
    const futurePack = contentPackSchema.parse({
      manifest: {
        id: 'maths-example-paper-1',
        schemaVersion: 1,
        status: 'planned',
        subject: { id: 'maths', name: 'Maths' },
        qualification: { id: 'example-gcse', name: 'Example GCSE' },
        examBoard: { id: 'example-board', name: 'Example Board' },
        specificationCode: 'EX-1',
        paper: { id: 'paper-1', name: 'Paper 1', number: 1, durationMinutes: 60, totalMarks: 10 },
        learnerExperience: {
          title: 'Maths Paper 1',
          what_is_this: 'Example pack.',
          why_it_matters: 'Example reason.',
          what_you_are_trying_to_do: 'Example goal.',
          how_results_are_worked_out: 'Example method.',
          what_to_do_next: 'Example next step.',
        },
        topicIds: ['algebra'],
      },
      topics: [{ id: 'algebra', order: 1, title: 'Algebra', shortTitle: 'Algebra', sections: [{ id: 'linear-equations', title: 'Linear equations', points: ['Solve equations.'] }] }],
      formulas: [], topicLinks: [], flashcards: [], questions: [], caseStudies: [], dataDrills: [],
      exams: [{ id: 'example-exam', title: 'Example', subtitle: 'Example', durationMinutes: 60, totalMarks: 10, caseHtml: '<p>Example</p>', questions: [{ id: 'q1', marks: 10, topic: 'algebra', assessmentObjectives: { ao1: 10, ao2: 0, ao3: 0, ao4: 0 }, prompt: 'Solve.', markingGuidance: ['Award marks.'] }] }],
    })

    const adapter = createLearningContentAdapter(futurePack)
    expect(adapter.getTopic('algebra')?.title).toBe('Algebra')
    expect(adapter.listExamTechnique()).toEqual([])
    expect(adapter.listLearnChapters()).toHaveLength(1)
    expect(adapter.listLearnChapters()[0]?.groups[0]?.pages[0]?.title).toBe('Linear equations')
  })

  it('rejects content that references a topic outside its manifest', () => {
    expect(() => contentPackSchema.parse({
      ...businessAqaAsPaper2,
      flashcards: [{ ...businessAqaAsPaper2.flashcards[0], topic: 'unknown-topic' }],
    })).toThrow(z.ZodError)
  })
})
