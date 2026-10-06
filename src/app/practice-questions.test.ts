import { describe, expect, it } from 'vitest'
import { aqaBusinessQuestionBank } from '../../content/business/aqa-a-level/shared/fast-path-questions'
import { questions as coursePackQuestions } from '../../content/business/aqa-a-level/shared/questions'
import { topics as coursePackTopics } from '../../content/business/aqa-a-level/shared/topics'
import {
  availableTypes,
  bankRecordToPractice,
  isCalculationRecord,
  buildQuestionPool,
  cleanRationale,
  lastAnsweredByContent,
  orderByFreshness,
  topicOrderForSpecItem,
} from './practice-questions'

describe('rationale wording', () => {
  it('reads after "You picked B:"', () => {
    expect(cleanRationale('B is incorrect because this describes using a moving average.')).toBe('This describes using a moving average.')
    expect(cleanRationale('A is correct because extrapolation extends a trend.')).toBe('Extrapolation extends a trend.')
    expect(cleanRationale('Incorrect: setting rotas is day-to-day.')).toBe('Setting rotas is day-to-day.')
    expect(cleanRationale('B is wrong because Fair trade aims to protect producers.')).toBe('Fair trade aims to protect producers.')
    expect(cleanRationale('B is correct: re-order level is stock plus lead time.')).toBe('Re-order level is stock plus lead time.')
    expect(cleanRationale(undefined)).toBeNull()
  })
})

describe('spec item to topic', () => {
  it('maps spec section 3.N to the Nth topic', () => {
    expect(topicOrderForSpecItem('aqa-7132-3.7.8:payback')).toBe(7)
    expect(topicOrderForSpecItem('aqa-7132-3.10.3:total-float')).toBe(10)
    expect(topicOrderForSpecItem('other-1.2')).toBeNull()
  })
})

describe('the AQA 7132 question bank as practice questions', () => {
  const mcqs = aqaBusinessQuestionBank.filter((record) => record.question.family === 'MCQ')

  it('turns every multiple-choice record into a well-formed question', () => {
    expect(mcqs.length).toBeGreaterThan(50)
    mcqs.forEach((record) => {
      const converted = bankRecordToPractice(record, 'finance')
      expect(converted, `${record.batch} ${record.id}`).not.toBeNull()
      if (converted?.type !== 'multiple-choice') throw new Error('expected a multiple-choice question')
      expect(converted.options.length).toBeGreaterThanOrEqual(2)
      expect(converted.options[converted.correctOption].why).toBeNull()
      expect(converted.explanation.length).toBeGreaterThan(5)
      expect(converted.context ?? '').not.toMatch(/^Revision-authored/i)
      expect(converted.explanation).not.toMatch(/^[A-D] is (correct|wrong|incorrect)/i)
    })
  })

  it('gives every wrong option a reason', () => {
    mcqs.forEach((record) => {
      const converted = bankRecordToPractice(record, 'finance')
      if (converted?.type !== 'multiple-choice') throw new Error('expected a multiple-choice question')
      converted.options.forEach((option, index) => {
        if (index !== converted.correctOption) expect(option.why, `${record.batch} ${record.id} option ${index}`).toBeTruthy()
      })
    })
  })

  it('has unique ids across every question it can offer', () => {
    const all = aqaBusinessQuestionBank.map((record) => bankRecordToPractice(record, 'finance')).filter((question) => question !== null)
    const ids = all.map((question) => question!.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('offers written points questions up to 6 marks, each with mark points that add up to the question’s marks', () => {
    const written = aqaBusinessQuestionBank.map((record) => bankRecordToPractice(record, 'finance')).filter((question) => question?.type === 'written')
    expect(written.length).toBeGreaterThan(80)
    written.forEach((question) => {
      if (question?.type !== 'written') return
      expect(question.marks).toBeLessThanOrEqual(6)
      expect(question.points.reduce((sum, point) => sum + point.marks, 0)).toBe(question.marks)
      question.points.forEach((point) => expect(point.accept.length).toBeGreaterThan(0))
    })
  })

  it('leaves levels-based questions out, and turns single-number calculations into calculation questions, not written ones', () => {
    const levels = aqaBusinessQuestionBank.find((record) => record.question.mark_scheme.type === 'levels')!
    expect(bankRecordToPractice(levels, 'finance')).toBeNull()
    const calculation = aqaBusinessQuestionBank.find((record) => isCalculationRecord(record))!
    expect(bankRecordToPractice(calculation, 'finance')?.type).toBe('calculation')
  })

  it('makes a calculation question the student can type an answer to, without "Show your working"', () => {
    const records = aqaBusinessQuestionBank.filter((record) => isCalculationRecord(record))
    expect(records.length).toBeGreaterThanOrEqual(13)
    const questions = records.map((record) => bankRecordToPractice(record, 'finance')).filter((question) => question?.type === 'calculation')
    expect(questions.length).toBe(records.length)
    questions.forEach((question) => {
      if (question?.type !== 'calculation') return
      expect(question.prompt).not.toMatch(/show your working/i)
      expect(question.accepted).toContain(question.expected)
      expect(question.answerText).not.toBe('')
      expect(question.workings).not.toBe('')
    })
    const market = bankRecordToPractice(records.find((record) => record.question.calcs[0].unit === '£m')!, 'finance')
    expect(market).toMatchObject({ type: 'calculation', expected: 24.2, answerText: '£24.2m' })
  })

  it('accepts the roundings a mark scheme allows for payback and receivables days', () => {
    const accepted = (answer: number) => aqaBusinessQuestionBank
      .filter((record) => isCalculationRecord(record) && record.question.calcs[0].stated_answer === answer)
      .map((record) => bankRecordToPractice(record, 'finance'))
      .flatMap((question) => (question?.type === 'calculation' ? question.accepted : []))
    expect(accepted(2.67)).toContain(2.7)
    expect(accepted(36.5)).toContain(37)
  })

  it('offers written questions only when a marker is connected', () => {
    const without = buildQuestionPool({ topicId: 'finance', topicOrder: 5, coursePack: coursePackQuestions, bank: aqaBusinessQuestionBank })
    const withMarker = buildQuestionPool({ topicId: 'finance', topicOrder: 5, coursePack: coursePackQuestions, bank: aqaBusinessQuestionBank, includeWritten: true })
    expect(without.some((question) => question.type === 'written')).toBe(false)
    expect(availableTypes(without)).toEqual(['multiple-choice', 'calculation'])
    expect(withMarker.some((question) => question.type === 'written')).toBe(true)
    expect(availableTypes(withMarker)).toEqual(['multiple-choice', 'calculation', 'written'])
  })

  it('builds a pool for each topic that has more than the five course-pack questions', () => {
    const adapterTopics = coursePackTopics
    const sizes = adapterTopics.map((topic) => buildQuestionPool({ topicId: topic.id, topicOrder: topic.order, coursePack: coursePackQuestions, bank: aqaBusinessQuestionBank }).length)
    expect(sizes.reduce((sum, size) => sum + size, 0)).toBeGreaterThan(coursePackQuestions.length)
    expect(Math.max(...sizes)).toBeGreaterThan(5)
  })

  it('without the bank, a topic keeps only its course-pack questions', () => {
    const pool = buildQuestionPool({ topicId: 'finance', topicOrder: 5, coursePack: coursePackQuestions })
    expect(pool.every((question) => question.source === 'course-pack')).toBe(true)
    expect(availableTypes(pool)).toEqual(['multiple-choice'])
  })
})

describe('freshness order', () => {
  it('puts unanswered questions first, then the one answered longest ago, keeping the original order otherwise', () => {
    const pool = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]
    expect(orderByFreshness(pool, { a: '2026-10-05', c: '2026-10-01' }).map((item) => item.id)).toEqual(['b', 'd', 'c', 'a'])
    expect(orderByFreshness(pool).map((item) => item.id)).toEqual(['a', 'b', 'c', 'd'])
  })
})

describe('last answered', () => {
  it('keeps the latest time for each question', () => {
    expect(lastAnsweredByContent([
      { contentId: 'a', occurredAt: '2026-10-01T10:00:00.000Z' },
      { contentId: 'a', occurredAt: '2026-10-03T10:00:00.000Z' },
      { contentId: 'b', occurredAt: '2026-10-02T10:00:00.000Z' },
    ])).toEqual({ a: '2026-10-03T10:00:00.000Z', b: '2026-10-02T10:00:00.000Z' })
  })
})
