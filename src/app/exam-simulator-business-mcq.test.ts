import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { paper1Exam } from '../../content/business/aqa-a-level/paper-1/exam'
import { ExamSimulator } from './ExamSimulator'

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
    expect(html).not.toContain('Write your answer')
  })

  it('the existing Section B exact Start still offers a written response and self-assessment', () => {
    const html = render('untimed', 'p1-q16')
    expect(html).toContain('Calculate the break-even output')
    expect(html).toContain('Write your answer')
    expect(html).toContain('Show marking guidance')
    expect(html).not.toContain('Choose one answer')
  })
})
