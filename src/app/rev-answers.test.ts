import { describe, expect, it } from 'vitest'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import type { LearningEvidence } from '../engine/evidence/evidence'
import type { RevisionAssessment } from '../services/planning/planner-service'
import { buildCatalogue, createCourseLearningState } from './catalogue-model'
import { allCatalogueCourses } from './learner-programme'
import { answerExams, answerProgress, answerToday, CANNOT_ANSWER_YET, classifyQuestion, promptChips, safeguardingReply, screenForSafeguarding } from './rev-answers'

const catalogue = buildCatalogue(listAvailableContentAdapters())
const business = allCatalogueCourses(catalogue).find((item) => item.subject.id === 'business')
if (!business) throw new Error('Business missing')
const moduleId = business.course.learningAdapter.manifest.id
const topics = business.course.learningAdapter.listTopics().map((topic) => topic.id)
const now = new Date(2026, 9, 7, 9, 0)

function weak(topicId: string): LearningEvidence[] {
  const common = { moduleId, topicId, occurredAt: '2026-10-05T10:00:00.000Z', schemaVersion: 1 as const }
  return [
    ...[1, 2, 3].map((n) => ({ ...common, id: `${topicId}-f${n}`, contentId: `${topicId}-f${n}`, source: 'flashcard' as const, rating: 0 as const })),
    ...[1, 2, 3].map((n) => ({ ...common, id: `${topicId}-m${n}`, contentId: `${topicId}-m${n}`, source: 'multiple_choice' as const, correct: false, selectedOption: 0, correctOption: 1 })),
  ]
}

function exam(date: string, overrides: Partial<RevisionAssessment> = {}): RevisionAssessment {
  return { assessmentId: 'a1', userId: 'u', subjectId: 'business', courseId: business!.course.id, moduleId: null, assessmentType: 'exam', title: 'Paper 1', assessmentDate: date, relativeImportance: 'high', scope: {}, isActive: true, ...overrides } as RevisionAssessment
}

describe('Safeguarding screen', () => {
  it('flags danger first, then struggling, and leaves ordinary revision talk alone', () => {
    expect(screenForSafeguarding('I want to kill myself')).toBe('immediate')
    expect(screenForSafeguarding('I don’t want to be alive')).toBe('immediate')
    expect(screenForSafeguarding('I’m really struggling and can’t cope')).toBe('concern')
    expect(screenForSafeguarding('I\'m struggling with break-even')).toBeNull()
    expect(screenForSafeguarding('this exam is killing me')).toBeNull()
    expect(screenForSafeguarding('What should I do today?')).toBeNull()
  })

  it('replies with fixed text that names 999 for danger and UK support for both', () => {
    const danger = safeguardingReply('immediate')
    expect(danger.paragraphs.join(' ')).toContain('999')
    for (const level of ['immediate', 'concern'] as const) {
      const reply = safeguardingReply(level)
      expect(reply.support.join(' ')).toContain('0800 1111')
      expect(reply.support.join(' ')).toContain('85258')
      expect(reply.paragraphs.join(' ')).toMatch(/adult|teacher|parent/)
    }
  })
})

describe('Questions REV can answer from the student\'s own data', () => {
  it('recognises the three question kinds and leaves the rest as unknown', () => {
    expect(classifyQuestion('What should I do today?')).toBe('today')
    expect(classifyQuestion('how am I doing in Business?')).toBe('progress')
    expect(classifyQuestion('When are my exams?')).toBe('exams')
    expect(classifyQuestion('What is break-even?')).toBe('unknown')
  })

  it('says what to do today with a reason, and offers one action', () => {
    const state = createCourseLearningState(business.course, weak(topics[2]))
    const answer = answerToday([state], [business], now)
    expect(answer.text).toContain('I’d start with')
    expect(answer.action?.courseId).toBe(business.course.id)
  })

  it('is honest when there is no course', () => {
    expect(answerToday([], [], now).text).toContain('haven’t added a course')
    expect(answerProgress([], [], 'how am I doing').text).toContain('haven’t added a course')
  })

  it('reports progress in the same words as the Progress screens', () => {
    const state = createCourseLearningState(business.course, weak(topics[0]))
    expect(answerProgress([state], [business], 'how am I doing in Business?').text).toContain(`You’ve covered 1 of ${topics.length} topics. So far: 1 needs work.`)
  })

  it('lists the next exams with real dates, and is honest when there are none', () => {
    expect(answerExams([], [business], now).text).toContain('don’t have any exam dates')
    expect(answerExams([exam('2026-10-10')], [business], now).text).toContain('in 3 days')
    expect(answerExams([exam('2026-09-01')], [business], now).text).toContain('don’t have any exam dates')
    expect(answerExams([exam('2026-10-10', { isActive: false })], [business], now).text).toContain('don’t have any exam dates')
  })

  it('shows prompt chips only for what is true for the student', () => {
    expect(promptChips([], false)).toEqual([])
    expect(promptChips([business], false)).toEqual(['What should I do today?', `How am I doing in ${business.subject.name}?`])
    expect(promptChips([business], true)).toContain('When are my exams?')
  })

  it('never makes up an answer: other questions get an honest "not yet"', () => {
    expect(CANNOT_ANSWER_YET).toContain('can’t answer that one yet')
  })
})
