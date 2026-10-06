import { describe, expect, it } from 'vitest'
import { aqaBusiness7132ExamPapers } from '../../content/business/aqa-a-level/shared/exam-papers'
import { examPapersContentSchema } from '../../content/exam-papers-schema'
import { answeredQuestionCount, examPapersFor, lastMockFrom, mockRowFor, suggestMock, timeSegments, topicsCoveredPhrase, weeksAwayPhrase, type MockExamLike } from './exam-prep'
import type { TopicProgress } from './topic-status'

const progress = (entries: Record<string, TopicProgress['status']>): Record<string, TopicProgress> =>
  Object.fromEntries(Object.entries(entries).map(([id, status]) => [id, { status, lastPractisedAt: null }]))

const exam: MockExamLike = {
  id: 'e1', title: 'AQA A-level Business — Paper 1 Simulation 1', durationMinutes: 120, totalMarks: 100,
  questions: [
    { id: 'q1', topic: 'finance' }, { id: 'q2', topic: 'marketing' },
    { id: 'q3', topic: 'hr', choiceGroup: 'C' }, { id: 'q4', topic: 'hr', choiceGroup: 'C' },
  ],
}

describe('the AQA 7132 paper guide', () => {
  it('matches AQA: three papers, 2 hours, 100 marks each', () => {
    expect(aqaBusiness7132ExamPapers.papers.map((p) => [p.number, p.durationMinutes, p.totalMarks])).toEqual([[1, 120, 100], [2, 120, 100], [3, 120, 100]])
  })
  it('Paper 1 is 15 + 35 + 25 + 25 marks', () => {
    expect(aqaBusiness7132ExamPapers.papers[0].sections.map((s) => s.marks)).toEqual([15, 35, 25, 25])
  })
  it('Paper 2 is three data responses of about 33 marks', () => {
    expect(aqaBusiness7132ExamPapers.papers[1].sections.map((s) => s.marks)).toEqual([33, 33, 34])
  })
  it('every paper’s sections add up to its marks and its 2 hours', () => {
    for (const paper of aqaBusiness7132ExamPapers.papers) {
      expect(paper.sections.reduce((n, s) => n + s.marks, 0)).toBe(paper.totalMarks)
      expect(timeSegments(paper).reduce((n, s) => n + s.minutes, 0)).toBe(paper.durationMinutes)
    }
  })
  it('refuses a paper whose time does not add up', () => {
    const bad = structuredClone(aqaBusiness7132ExamPapers)
    bad.papers[0].sections[0].minutes = 99
    expect(examPapersContentSchema.safeParse(bad).success).toBe(false)
  })
  it('is found by board and specification only', () => {
    expect(examPapersFor('AQA', '7132')).not.toBeNull()
    expect(examPapersFor('AQA', '9999')).toBeNull()
  })
})

describe('exam dates and topics', () => {
  it('says weeks, then days', () => {
    const now = new Date(2026, 9, 6)
    expect(weeksAwayPhrase('2027-05-11', now)).toBe('31 weeks away')
    expect(weeksAwayPhrase('2026-10-13', now)).toBe('1 week away')
    expect(weeksAwayPhrase('2026-10-09', now)).toBe('3 days away')
    expect(weeksAwayPhrase('2026-10-06', now)).toBe('Today')
  })
  it('counts topics covered from the student’s progress', () => {
    const paper = aqaBusiness7132ExamPapers.papers[0]
    expect(topicsCoveredPhrase(paper, progress({ a: 'gotit', b: 'started', c: 'notstarted' }), ['a', 'b', 'c'])).toBe('2 of 3 topics covered')
  })
})

describe('mock rows', () => {
  it('counts a choice between essays once, and never invents a note', () => {
    expect(answeredQuestionCount(exam)).toBe(3)
    const row = mockRowFor(exam, progress({ finance: 'gotit', marketing: 'gotit', hr: 'started' }))
    expect(row.meta).toBe('Paper 1 style · 3 questions · 100 marks')
    expect(row.note).toBeNull()
    expect(row.name).toBe('Paper 1 Simulation 1')
  })
  it('says how many topics are not started', () => {
    expect(mockRowFor(exam, progress({ finance: 'gotit' })).note).toBe('Has 2 topics you haven’t started yet.')
  })
  it('suggests a mock only when at least half its topics are started, and says the real numbers', () => {
    const rows = [mockRowFor(exam, progress({ finance: 'gotit', marketing: 'started' }))]
    expect(suggestMock(rows, progress({ finance: 'gotit', marketing: 'started' }))?.reason).toContain('2 of the 3 topics')
    expect(suggestMock(rows, progress({}))).toBeNull()
  })
  it('finds the last saved attempt', () => {
    const rows = [mockRowFor(exam, progress({}))]
    const last = lastMockFrom([
      { source: 'exam_attempt', contentId: 'e1', occurredAt: '2026-10-03T10:00:00Z', marksAwarded: 21, marksAvailable: 100, timed: true },
      { source: 'exam_attempt', contentId: 'e1', occurredAt: '2026-09-01T10:00:00Z', marksAwarded: 5, marksAvailable: 100, timed: false },
    ], rows)
    expect(last).toMatchObject({ marks: '21 of 100', mode: 'Timed' })
    expect(lastMockFrom([], rows)).toBeNull()
  })
})
