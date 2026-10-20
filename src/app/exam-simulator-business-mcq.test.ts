import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { paper1Exam } from '../../content/business/aqa-a-level/paper-1/exam'
import { ExamSimulator, createExamResponseEvidence, marksForExamAnswer, marksForSubmittedAnswer } from './ExamSimulator'
import { evidencePercentage, learningEvidenceSchema } from '../engine/evidence/evidence'
import { answeredQuestionCount } from './exam-prep'

function render(autostart: 'timed' | 'untimed', questionId = 'p1-q01') {
  return renderToStaticMarkup(createElement(ExamSimulator, {
    exam: paper1Exam,
    moduleId: 'business-aqa-a-level-7132-paper-1',
    saving: false,
    saveError: '',
    onRecordEvidence: async () => {},
    autoStart: autostart,
    preferredQuestionId: questionId,
  }))
}

describe('FI-001 Business Paper 1 original multiple-choice practice formats', () => {
  it('focused exact Start offers four selectable answers, not an invented written question', () => {
    const html = render('untimed')
    expect(html).toContain('Practise one exam question')
    expect(html).toContain('Choose one answer')
    expect(html).toContain('Which formula calculates market capitalisation?')
    expect(html).toContain('Share price × issued shares')
    expect(html).toContain('name="practice-answer-p1-q01"')
    expect((html.match(/name="practice-answer-p1-q01"/g) ?? []).length).toBe(4)
    expect(html).not.toContain('Write your answer')
    expect(html).not.toContain('Record this result')
    expect(html).toContain('Show marking guidance')
  })

  it('timed Paper 1 begins with a real multiple-choice fieldset, preserving the 100-mark paper', () => {
    const html = render('timed')
    expect(html).toContain('AQA A-level Business — Paper 1 Simulation 1')
    expect(html).toContain('Which formula calculates market capitalisation?')
    expect(html).toContain('name="answer-p1-q01"')
    expect((html.match(/name="answer-p1-q01"/g) ?? []).length).toBe(4)
    expect(html).toContain('Section A')
    expect(html).toContain('0/24 answered')
    expect(answeredQuestionCount(paper1Exam)).toBe(24)
    expect(html).not.toContain('Write your answer')
  })

  it('focused essay alternatives have distinct identifiers and one applicable question, not a combined A-or-B prompt', () => {
    const a = render('untimed', 'p1-q23-essay-a')
    const b = render('untimed', 'p1-q23-essay-b')
    expect(a).toContain('For a business seeking long-term growth')
    expect(a).not.toContain('A low-cost position is more sustainable')
    expect(b).toContain('A low-cost position is more sustainable')
    expect(b).not.toContain('For a business seeking long-term growth')
    expect(a).toContain('Write your answer')
    expect(b).toContain('Write your answer')
    const dA = render('untimed', 'p1-q24-essay-a')
    const dB = render('untimed', 'p1-q24-essay-b')
    expect(dA).toContain('Organisational culture is the most important')
    expect(dA).not.toContain('plan strategy in detail')
    expect(dB).toContain('plan strategy in detail')
    expect(dB).not.toContain('Organisational culture is the most important')
  })

  it('the existing Section B exact Start still offers a written response and self-assessment', () => {
    const html = render('untimed', 'p1-q16')
    expect(html).toContain('Calculate the break-even output')
    expect(html).toContain('Write your answer')
    expect(html).toContain('Show marking guidance')
    expect(html).not.toContain('Choose one answer')
  })
})

describe('FI-001 blank-answer integrity', () => {
  const marks = { ao1: 2, ao2: 3, ao3: 4, ao4: 5 }

  it('sets all AO marks to zero without a submitted answer, including whitespace', () => {
    const zero = { ao1: 0, ao2: 0, ao3: 0, ao4: 0 }
    expect(marksForSubmittedAnswer(undefined, marks)).toEqual(zero)
    expect(marksForSubmittedAnswer('', marks)).toEqual(zero)
    expect(marksForSubmittedAnswer(' \n\t ', marks)).toEqual(zero)
  })

  it('retains student marks for both a chosen MCQ option and a written response', () => {
    expect(marksForSubmittedAnswer('B', marks)).toEqual(marks)
    expect(marksForSubmittedAnswer('One justified recommendation.', marks)).toEqual(marks)
  })
})

describe('FI-001 original Business MCQ objective marking', () => {
  it('stores a valid, guidance-consistent exact answer key for all 15 published Paper 1 MCQs', () => {
    const questions = paper1Exam.questions.filter((item) => item.responseType === 'multiple-choice')
    expect(questions).toHaveLength(15)
    for (const question of questions) {
      expect(question.correctOptionLabel, question.id).toBeTruthy()
      expect(question.options?.some((option) => option.label === question.correctOptionLabel), question.id).toBe(true)
      expect(question.markingGuidance.join(' '), question.id).toMatch(
        new RegExp(`Correct answer: ${question.correctOptionLabel}(?:[ .—])`),
      )
    }
  })

  it('awards zero for wrong/blank answers regardless of entered self-marks and credits only the exact correct choice', () => {
    const q = paper1Exam.questions.find((item) => item.id === 'p1-q01')!
    const full = { ao1: 1, ao2: 0, ao3: 0, ao4: 0 }
    const zero = { ao1: 0, ao2: 0, ao3: 0, ao4: 0 }
    expect(marksForExamAnswer('A', full, q.correctOptionLabel, q.assessmentObjectives)).toEqual(zero)
    expect(marksForExamAnswer(' ', full, q.correctOptionLabel, q.assessmentObjectives)).toEqual(zero)
    expect(marksForExamAnswer('B', zero, q.correctOptionLabel, q.assessmentObjectives)).toEqual(full)
    expect(marksForExamAnswer('Substantiated written response', full)).toEqual(full)
  })

  it('stores truthful objective evidence for correct/wrong MCQs, not self-awarded examiner marks', () => {
    const question = paper1Exam.questions.find((item) => item.id === 'p1-q01')!
    const full = { ao1: 1, ao2: 0, ao3: 0, ao4: 0 }
    const base = { question, awarded: full, moduleId: 'business-aqa-a-level-7132-paper-1' }
    const wrong = createExamResponseEvidence({ ...base, id: 'wrong', answer: 'A' })
    const correct = createExamResponseEvidence({ ...base, id: 'correct', answer: 'B' })
    expect(wrong).toMatchObject({ source: 'multiple_choice', correct: false, selectedOption: 0, correctOption: 1 })
    expect(correct).toMatchObject({ source: 'multiple_choice', correct: true, selectedOption: 1, correctOption: 1 })
    expect(evidencePercentage(wrong)).toBe(0)
    expect(evidencePercentage(correct)).toBe(100)
    expect(learningEvidenceSchema.safeParse(wrong).success).toBe(true)
    expect(learningEvidenceSchema.safeParse(correct).success).toBe(true)
    const essay = paper1Exam.questions.find((item) => item.id === 'p1-q16')!
    expect(createExamResponseEvidence({ question: essay, answer: 'worked response', awarded: full, moduleId: base.moduleId, id: 'written' }))
      .toMatchObject({ source: 'exam_question', markingMethod: 'self_assessed' })
  })
})
