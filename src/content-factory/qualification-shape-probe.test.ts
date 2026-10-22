import { describe, expect, it } from 'vitest'
import {
  contentManifestSchema,
  contentPackSchema,
  examSchema,
} from '../../content/schema'

// Provider-free CHARACTERISATION tests only. These fixtures are fictional,
// independently authored and not a real board's Course Truth or Exam Truth.
// A passing test does not make a qualification suitable for publication.

const manifest = {
  id: 'synthetic-gcse-science-paper-1',
  schemaVersion: 1 as const,
  status: 'planned' as const,
  subject: { id: 'synthetic-science', name: 'Synthetic Science' },
  qualification: { id: 'synthetic-gcse', name: 'Synthetic GCSE' },
  examBoard: { id: 'synthetic', name: 'Synthetic' },
  specificationCode: 'SYN-001',
  paper: {
    id: 'paper-1',
    name: 'Paper 1',
    number: 1,
    durationMinutes: 30,
    totalMarks: 8,
  },
  learnerExperience: {
    title: 'Synthetic non-publishing test',
    what_is_this: 'A fictional course to test the shared schema.',
    why_it_matters: 'It exposes qualification shape assumptions before content production.',
    what_you_are_trying_to_do: 'Verify a minimal portable course manifest.',
    how_results_are_worked_out: 'No student marks or progress are created.',
    what_to_do_next: 'Review uncovered schema capabilities before a real course build.',
  },
  topicIds: ['synthetic-topic'],
}

function written(id: string, marks: number, overrides: Record<string, unknown> = {}) {
  return {
    id,
    topic: 'synthetic-topic',
    marks,
    assessmentObjectives: { ao1: marks, ao2: 0, ao3: 0, ao4: 0 },
    prompt: 'Explain the fictional teaching example.',
    markingGuidance: ['Award credit only for the response to this fictional question.'],
    ...overrides,
  }
}

function examination(questions: ReturnType<typeof written>[], totalMarks: number, printedMarks?: number) {
  return {
    id: 'synthetic-exam',
    title: 'Fictional exam',
    subtitle: 'No official question or assessment content',
    durationMinutes: 30,
    totalMarks,
    caseHtml: '<p>Original fictional stimulus.</p>',
    questions,
    ...(printedMarks === undefined ? {} : { printedMarks }),
  }
}

describe('Content Factory qualification-shape preflight (synthetic; no learner release)', () => {
  it('supports exactly two paper-alternative questions and distinguishes printed from attempted marks', () => {
    const questions = [
      written('compulsory', 4),
      written('essay-one', 4, {
        choiceKind: 'paper-alternative',
        choiceGroup: 'essay-choice',
        choiceOption: 'essay-one',
        sectionLabel: 'B',
        sectionTitle: 'Alternative essays',
        sectionMarks: 4,
      }),
      written('essay-two', 4, {
        choiceKind: 'paper-alternative',
        choiceGroup: 'essay-choice',
        choiceOption: 'essay-two',
        sectionLabel: 'B',
        sectionTitle: 'Alternative essays',
        sectionMarks: 4,
      }),
    ]
    expect(examSchema.safeParse(examination(questions, 8, 12)).success).toBe(true)
    expect(examSchema.safeParse(examination(questions, 8)).success).toBe(false)
  })

  it('rejects unequal attempted-mark totals among alternatives', () => {
    const questions = [
      written('compulsory', 4),
      written('essay-one', 4, {
        choiceKind: 'paper-alternative', choiceGroup: 'essay-choice', choiceOption: 'essay-one',
        sectionLabel: 'B', sectionTitle: 'Alternative essays', sectionMarks: 4,
      }),
      written('essay-two', 5, {
        choiceKind: 'paper-alternative', choiceGroup: 'essay-choice', choiceOption: 'essay-two',
        sectionLabel: 'B', sectionTitle: 'Alternative essays', sectionMarks: 5,
      }),
    ]
    const parsed = examSchema.safeParse(examination(questions, 8, 13))
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error.issues.some((issue) =>
        issue.message.includes('Choice group essay-choice has options with different mark totals')
      )).toBe(true)
    }
  })

  it('accepts multi-question syllabus options without treating them as two-question paper alternatives', () => {
    const questions = [
      written('compulsory', 2),
      written('option-a-one', 6, {
        choiceKind: 'syllabus-option', choiceGroup: 'topic-choice', choiceOption: 'option-a',
      }),
      written('option-a-two', 4, {
        choiceKind: 'syllabus-option', choiceGroup: 'topic-choice', choiceOption: 'option-a',
      }),
      written('option-b-one', 10, {
        choiceKind: 'syllabus-option', choiceGroup: 'topic-choice', choiceOption: 'option-b',
      }),
    ]
    expect(examSchema.safeParse(examination(questions, 12, 22)).success).toBe(true)
  })

  it('identifies an unsupported GCSE tier/practical declaration instead of claiming portability', () => {
    // Present in this input, but not part of contentManifestSchema. Zod strips
    // unknown fields: merely parsing a course manifest cannot prove that its
    // tier- and practical-specific learning or exam obligations are preserved.
    const candidate = { ...manifest, tier: 'higher', requiredPracticals: ['synthetic-practical'] }
    const parsed = contentManifestSchema.parse(candidate)
    expect('tier' in parsed).toBe(false)
    expect('requiredPracticals' in parsed).toBe(false)
    // This test intentionally records an unsupported feature. Do not add a
    // generic tier field without first reconciling qualification requirements.
  })

  it('rejects an exam activity belonging to a topic outside the declared course', () => {
    const pack = {
      manifest,
      topics: [{
        id: 'synthetic-topic', order: 1, title: 'Synthetic Topic',
        shortTitle: 'Topic',
        sections: [{ id: 'unit-one', title: 'Original material', points: ['Fictional example.'] }],
      }],
      formulas: [],
      topicLinks: [],
      flashcards: [],
      questions: [],
      caseStudies: [],
      dataDrills: [],
      exams: [examination([written('wrong-topic', 8, { topic: 'other-topic' })], 8)],
    }
    const parsed = contentPackSchema.safeParse(pack)
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error.issues.some((issue) =>
        issue.message.includes('references unknown topic other-topic')
      )).toBe(true)
    }
  })
})
