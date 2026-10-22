import { describe, expect, it } from 'vitest'
import { contentManifestSchema, contentPackSchema, examSchema } from '../../content/schema'

// Qualification-shaped, NON-PUBLISHING, provider-free characterisation.
// These original synthetic assets are not Pearson/AQA questions, course truth,
// mock exams, permission for source ingestion, or release-ready content.
// Board-level structural facts are verified independently and must undergo
// governed source-universe and licensing reconciliation before production.

const learnerExperience = {
  title: 'Synthetic curriculum-shape probe',
  what_is_this: 'Original fictional provider-free schema test.',
  why_it_matters: 'Exposes lost course and examination requirements before generation.',
  what_you_are_trying_to_do: 'Test which course-shape facts survive existing schemas.',
  how_results_are_worked_out: 'No learner achievement is recorded or inferred.',
  what_to_do_next: 'Resolve unsupported contracts before real content production.',
}

const topic = (id: string) => ({
  id,
  order: 1,
  title: 'Fictional topic',
  shortTitle: 'Topic',
  sections: [{ id: 'section-one', title: 'Fictional requirement', points: ['Original synthetic example.'] }],
})

function manifest(input: {
  id: string
  subject: string
  qualification: string
  examBoard: string
  specificationCode: string
  paper: string
  number: number
  duration: number
  marks: number
  topics: string[]
}) {
  return {
    id: input.id,
    schemaVersion: 1 as const,
    status: 'planned' as const,
    subject: { id: input.subject, name: input.subject },
    qualification: { id: input.qualification, name: input.qualification },
    examBoard: { id: input.examBoard, name: input.examBoard },
    specificationCode: input.specificationCode,
    paper: { id: input.paper, name: input.paper, number: input.number,
      durationMinutes: input.duration, totalMarks: input.marks },
    learnerExperience,
    topicIds: input.topics,
  }
}

function originalQuestion(id: string, topicId: string, marks: number, ao2 = 0) {
  return {
    id,
    marks,
    topic: topicId,
    assessmentObjectives: { ao1: marks - ao2, ao2, ao3: 0, ao4: 0 },
    prompt: 'Explain the invented scenario without a real examination question.',
    markingGuidance: ['Use only the independently authored synthetic rubric.'],
  }
}

function syntheticExam(marks: number, topicId: string, options: { ao2?: number } = {}) {
  return {
    id: 'fictional-paper',
    title: 'Non-publishing scenario',
    subtitle: 'Synthetic structural test',
    durationMinutes: 120,
    totalMarks: marks,
    caseHtml: '<p>Original unrelated fictional introduction.</p>',
    questions: [originalQuestion('fictional-question', topicId, marks, options.ao2 ?? 0)],
  }
}

function syntheticPack(courseManifest: ReturnType<typeof manifest>, paperTopicId: string) {
  return {
    manifest: courseManifest,
    topics: courseManifest.topicIds.map(topic),
    formulas: [],
    topicLinks: [],
    flashcards: [],
    questions: [],
    caseStudies: [],
    dataDrills: [],
    exams: [syntheticExam(courseManifest.paper.totalMarks, paperTopicId)],
  }
}

describe('Source-verified second-board Business shape, with fictional assets', () => {
  // The actual 9BS0 course has three 100-raw-mark papers but a 35/35/30
  // weighting distribution, and a pre-released-context assessment component.
  // Only simplified structured facts are used here; protected source text
  // never becomes AI input or learner teaching/marking material.
  const common = {
    subject: 'business',
    qualification: 'synthetic-a-level',
    examBoard: 'synthetic-second-board',
    specificationCode: '9bs0-shape-only',
    duration: 120,
    marks: 100,
    topics: ['theme-one', 'theme-two', 'theme-three', 'theme-four'],
  }
  const paper1 = manifest({ ...common, id: 'synthetic-business-paper-one',
    paper: 'paper-one', number: 1 })
  const paper2 = manifest({ ...common, id: 'synthetic-business-paper-two',
    paper: 'paper-two', number: 2 })
  const paper3 = manifest({ ...common, id: 'synthetic-business-paper-three',
    paper: 'paper-three', number: 3 })
  const paperWeights = [35, 35, 30]

  it('does not mistake three equal raw-mark papers for equal qualification weighting', () => {
    expect(paperWeights.reduce((sum, weight) => sum + weight, 0)).toBe(100)
    for (const [index, paper] of [paper1, paper2, paper3].entries()) {
      const parsed = contentManifestSchema.parse({
        ...paper,
        paper: { ...paper.paper, qualificationWeightPercent: paperWeights[index] },
      })
      expect(parsed.paper.totalMarks).toBe(100)
      expect('qualificationWeightPercent' in parsed.paper).toBe(false)
    }
    // This is a manifest contract gap, not evidence that course-level Exam
    // Truth cannot represent weighting independently.
  })

  it('does not retain a declared pre-released context/cohort in the paper manifest', () => {
    const parsed = contentManifestSchema.parse({
      ...paper3,
      paper: { ...paper3.paper, preReleaseContextCohort: 'fictional-cohort' },
    })
    expect('preReleaseContextCohort' in parsed.paper).toBe(false)
  })

  it('does not enforce paper-specific syllabus eligibility through the shared pack schema', () => {
    // In the real course the paper themes differ, so a specification mapping
    // must check that a question is in the intended component scope.
    // This schema only establishes membership of a course-wide topic list.
    const parsed = contentPackSchema.safeParse(syntheticPack(paper2, 'theme-one'))
    expect(parsed.success).toBe(true)
  })
})

describe('GCSE science two-tier shape, with fictional assets', () => {
  const common = {
    subject: 'synthetic-biology',
    qualification: 'synthetic-gcse',
    examBoard: 'synthetic-aqa-like',
    specificationCode: '8461-shape-only',
    duration: 105,
    marks: 100,
    topics: ['topic-one', 'topic-two'],
  }
  const paper1 = manifest({ ...common, id: 'synthetic-gcse-bio-one',
    paper: 'paper-one', number: 1 })
  const paper2 = manifest({ ...common, id: 'synthetic-gcse-bio-two',
    paper: 'paper-two', number: 2 })

  it('accepts paper metadata but drops declared tier and required-practical scope', () => {
    const parsed = contentManifestSchema.parse({
      ...paper1,
      paper: { ...paper1.paper, tier: 'higher', requiredPracticalIds: ['fictional-practical'] },
    })
    expect(parsed.paper.durationMinutes).toBe(105)
    expect('tier' in parsed.paper).toBe(false)
    expect('requiredPracticalIds' in parsed.paper).toBe(false)
  })

  it('accepts an internal-only higher-tier annotation without preserving its restriction', () => {
    const content = topic('topic-two')
    const parsed = contentPackSchema.parse({
      ...syntheticPack(paper2, 'topic-two'),
      topics: [
        { ...topic('topic-one'), order: 1 },
        { ...content, order: 2, higherTierOnly: true },
      ],
    })
    expect('higherTierOnly' in parsed.topics[1]).toBe(false)
  })

  it('cannot prove paper-specific topic coverage merely by checking a valid course topic', () => {
    // This fictional paper-two question uses topic-one, which the synthetic
    // intended Paper 2 profile deliberately excludes. Pack parse still passes.
    expect(contentPackSchema.safeParse(syntheticPack(paper2, 'topic-one')).success).toBe(true)
  })

  it('cannot enforce a required practical-mark share from basic exam metadata', () => {
    // Real AQA GCSE Biology practical questions account for at least 15% of
    // qualification marks; this specific input intentionally supplies no
    // separately tagged practical-demand assessment items.
    const parsed = examSchema.parse(syntheticExam(100, 'topic-two'))
    expect(parsed.totalMarks).toBe(100)
    expect('practicalMarkRequirement' in parsed).toBe(false)
    // This is not a negative validation of official Exam Truth: this schema
    // lacks the explicit attributes needed to test that independent contract.
  })

  it('does not infer a valid application stimulus from AO2 mark allocation alone', () => {
    // An AO2 question may use common case material or its own scenario.
    // Mechanical AO totals are not proof that the question presents a
    // sufficient, relevant application context to the learner.
    const parsed = examSchema.parse(syntheticExam(100, 'topic-two', { ao2: 100 }))
    expect(parsed.questions[0]?.assessmentObjectives.ao2).toBe(100)
    expect(parsed.questions[0]?.stimulus).toBeUndefined()
  })
})
