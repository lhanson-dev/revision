import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { HomeTask } from './home-task'
import { HomeQuickCheck, quickCheckDefinition } from './HomeQuickCheck'

const question = {
  prompt: 'Which concept or approach completes this definition? ______ manipulates an independent variable.',
  options: ['naturalistic observation', 'true experiment'],
  correctOption: 1,
  explanation: 'A true experiment controls other variables.',
}
const task = {
  subjectId: 'psychology', subjectName: 'Psychology', subjectAccent: 'neutral',
  topicLabel: 'Research methods', courseLabel: 'AQA A-level Psychology',
  source: 'rules', estimatedMinutes: 2,
} as HomeTask

function render(selected: number | null, checked = false, saving = false, completionPending = false, retryOption: number | null = null) {
  return renderToStaticMarkup(createElement(HomeQuickCheck, {
    task, questions: [question], index: 0, actualMinutes: 2, selected, retryOption, checked, saving,
    error: '', results: checked ? [selected === 1] : [], backLabel: 'Plan', finishedBooking: null,
    completionPending, onRetryCompletion() {},
    onSelect() {}, onCheck() {}, onNext() {}, onBack() {}, onFinish() {},
  }))
}

describe('Home/Plan quick check presentation', () => {
  it('preserves ordinary questions without a definition blank', () => {
    expect(quickCheckDefinition('Which approach should be used?')).toEqual({ pre: 'Which approach should be used?', post: '', hasBlank: false })
    expect(quickCheckDefinition(question.prompt)).toEqual({ pre: '', post: ' manipulates an independent variable.', hasBlank: true })
    expect(quickCheckDefinition('This is an ___ design.')).toEqual({ pre: 'This is an ', post: ' design.', hasBlank: true })
  })

  it('shows a readable inactive action and the originating back link', () => {
    const html = render(null)
    expect(html).toContain('Pick an answer to check')
    expect(html).toContain('aria-disabled="true"')
    expect(html).toContain('Back to Plan')
    expect(html).toContain('aria-label="blank"')
  })

  it('inserts the chosen term while retaining the question after a wrong saved answer', () => {
    const picked = render(0)
    expect(picked).toContain('data-state="picked">Naturalistic observation')
    expect(picked).toContain('aria-pressed="true"')
    const html = render(0, true)
    expect(html).toContain('<s>Naturalistic observation</s>')
    expect(html).toContain('True experiment')
    expect(html).toContain('manipulates an independent variable.')
    expect(html).toContain('Your answer')
    expect(html).toContain('Correct</small>')
    expect(html).toContain('A true experiment controls other variables.')
    expect(html).toContain('See how it went')
    expect(html.match(/disabled=""/g)).toHaveLength(2)
  })

  it('does not claim finished work if Plan completion confirmation failed', () => {
    const html = render(1, true, false, true)
    expect(html).toContain('Retry confirming session')
    expect(html).not.toContain('See how it went')
  })

  it('keeps a failed MCQ save on its originally selected choice', () => {
    const html = render(1, false, false, false, 1)
    expect(html).toContain('Retry the same choice to protect your progress')
    expect(html).toContain('Check “True experiment”')
    expect(html.match(/data-quick-action="option"[^>]*disabled=""/g)).toHaveLength(2)
  })

  it('labels a correct answer without a wrong-answer state', () => {
    const html = render(1, true)
    expect(html).toContain('Correct.')
    expect(html).not.toContain('Your answer')
    expect(html).not.toContain('<s>')
  })

  it('locks options and indicates saving while evidence is in flight', () => {
    const html = render(1, false, true)
    expect(html).toContain('Saving answer…')
    expect(html.match(/disabled=""/g)).toHaveLength(3)
  })
})
