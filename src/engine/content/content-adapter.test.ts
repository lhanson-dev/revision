import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { businessAqaALevel7132Paper1 } from '../../../content/business/aqa-a-level/paper-1'
import { businessAqaALevel7132Paper2 } from '../../../content/business/aqa-a-level/paper-2'
import { businessAqaALevel7132Paper3 } from '../../../content/business/aqa-a-level/paper-3'
import { aqaBusinessQuestionBank } from '../../../content/business/aqa-a-level/shared/fast-path-questions'
import { businessFinanceNumericPracticeBank } from '../../../content/business/aqa-a-level/shared/financial-numeric-practice'
import { businessPurposeProfitNumericBank } from '../../../content/business/aqa-a-level/shared/purpose-profit-numeric-practice'
import { fastPathFlashcards } from '../../../content/business/aqa-a-level/shared/fast-path-flashcards'
import { buildQuestionPool } from '../../app/practice-questions'
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

  it('makes the existing real AQA generated Learn and Practice reachable through every course adapter', () => {
    const actualPacks = [businessAqaALevel7132Paper1, businessAqaALevel7132Paper2, businessAqaALevel7132Paper3]
    expect(aqaBusinessQuestionBank.length).toBeGreaterThan(200)
    expect(fastPathFlashcards.length).toBeGreaterThan(0)
    for (const pack of actualPacks) {
      const adapter = createLearningContentAdapter(pack)
      expect(adapter.listPracticeBank()).toHaveLength(aqaBusinessQuestionBank.length + businessFinanceNumericPracticeBank.length + businessPurposeProfitNumericBank.length)
      // Append only new source-tagged exercises. All legacy bank IDs/order stay intact.
      expect(adapter.listPracticeBank().slice(0, aqaBusinessQuestionBank.length).map((record) => [record.batch, record.id]))
        .toEqual(aqaBusinessQuestionBank.map((record) => [record.batch, record.id]))
      expect(adapter.listPracticeBank().slice(aqaBusinessQuestionBank.length).map((record) => [record.batch, record.id]))
        .toEqual([...businessFinanceNumericPracticeBank, ...businessPurposeProfitNumericBank].map((record) => [record.batch, record.id]))
      expect(adapter.listFlashcards().filter((card) => card.id.startsWith('fast-'))).toHaveLength(fastPathFlashcards.length)
      expect(adapter.listLearnChapters().length).toBe(10)
      expect(adapter.listExams()).toHaveLength(1)
      expect(adapter.listExams()[0]?.totalMarks).toBe(100)
      // Same session builder, but only canonical pack data; no AQA-specific UI import.
      const pool = buildQuestionPool({
        topicId: 'marketing',
        topicOrder: 3,
        coursePack: adapter.listQuestions('marketing'),
        bank: adapter.listPracticeBank(),
        includeWritten: true,
      })
      expect(pool.some((question) => question.source === 'aqa-bank')).toBe(true)
      expect(pool.some((question) => question.source === 'course-pack')).toBe(true)
      expect(pool.every((question) => question.topicId === 'marketing')).toBe(true)
    }
    expect(createLearningContentAdapter(businessAqaAsPaper2).listPracticeBank()).toEqual([])
  })

  it('refuses a new course with an unscoped generated question, yet permits explicit course-owned topic and namespace', () => {
    const oldRecord = aqaBusinessQuestionBank[0]
    expect(() => contentPackSchema.parse({
      ...businessAqaAsPaper2,
      practiceBank: [oldRecord],
    })).toThrow(z.ZodError)

    const scoped = { ...oldRecord, topic_id: 'finance', namespace: 'revision-as-test' }
    const candidate = contentPackSchema.parse({
      ...businessAqaAsPaper2,
      practiceBank: [scoped],
    })
    const adapter = createLearningContentAdapter(candidate)
    expect(adapter.listPracticeBank()[0]?.topic_id).toBe('finance')
    expect(buildQuestionPool({
      topicId: 'finance',
      topicOrder: 5,
      coursePack: [],
      bank: adapter.listPracticeBank(),
      includeWritten: true,
    })).toHaveLength(1)
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
    expect(new Set(entries.map((entry) => entry.id)).size).toBe(entries.length)
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
      expect.objectContaining({
        id: 'psychology-aqa-a-level-7182-paper-1',
        subject: 'Psychology',
        examBoard: 'AQA',
        durationMinutes: 120,
        totalMarks: 96,
        topicCount: 17,
      }),
      expect.objectContaining({
        id: 'psychology-aqa-a-level-7182-paper-2',
        subject: 'Psychology',
        examBoard: 'AQA',
        durationMinutes: 120,
        totalMarks: 96,
        topicCount: 17,
      }),
      expect.objectContaining({
        id: 'psychology-aqa-a-level-7182-paper-3',
        subject: 'Psychology',
        examBoard: 'AQA',
        durationMinutes: 120,
        totalMarks: 96,
        topicCount: 17,
      }),
    ]))
    expect(getContentAdapter('business-aqa-as-paper-2')?.manifest.subject.name).toBe('Business')
    expect(getContentAdapter('business-aqa-a-level-7132-paper-1')?.manifest.status).toBe('available')
    expect(getContentAdapter('business-aqa-a-level-7132-paper-2')?.manifest.status).toBe('available')
    expect(getContentAdapter('business-aqa-a-level-7132-paper-3')?.manifest.status).toBe('available')
    expect(getContentAdapter('psychology-aqa-a-level-7182-paper-1')?.manifest.status).toBe('available')
    expect(getContentAdapter('psychology-aqa-a-level-7182-paper-2')?.manifest.status).toBe('available')
    expect(getContentAdapter('psychology-aqa-a-level-7182-paper-3')?.manifest.status).toBe('available')
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
