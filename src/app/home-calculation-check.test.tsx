import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import paper1 from '../../content/business/aqa-a-level/paper-1'
import { createLearningContentAdapter } from '../engine/content/content-adapter'
import type { HomeTask } from './home-task'
import { authoredCalculationForTask, authoredQuestionsForTask, supportedActivityMinutes } from './home-task'
import { HomeCalculationCheck } from './HomeCalculationCheck'

function task(): HomeTask {
  return {
    id: 'exact-check', source: 'planner', courseId: 'aqa:aqa-a-level:7132',
    subjectId: 'business', subjectName: 'Business', subjectAccent: 'business',
    courseLabel: 'AQA Business', topicId: 'leadership', topicLabel: 'Leadership',
    activityType: 'quick-check', estimatedMinutes: 2, reason: 'Independently check the expected value calculation',
    adapter: createLearningContentAdapter(paper1),
    targetedQuestionIds: ['rev7132-3.2.2-expected-value-02'],
    skillFocus: { specItemId: 'aqa-7132-3.2.2:expected-value', need: 'missed', treatment: 'recheck' },
  }
}

describe('Home and Plan calculation start path', () => {
  it('starts the precise published calculation instead of pretending it has MCQ choices', () => {
    const item = task()
    const calculation = authoredCalculationForTask(item)
    expect(calculation?.type).toBe('calculation')
    expect(authoredQuestionsForTask(item)).toEqual([])
    expect(supportedActivityMinutes(item)).toBeGreaterThan(0)
    expect(authoredCalculationForTask({ ...item, skillFocus: { ...item.skillFocus!, specItemId: 'not-this-skill' } })).toBeNull()
    expect(authoredCalculationForTask({ ...item, targetedQuestionIds: ['unknown'] })).toBeNull()
  })

  it('keeps the answer and workings hidden until a saved result exists', () => {
    const item = task()
    const question = authoredCalculationForTask(item)!
    const common = {
      task: item, question, typedAnswer: '42', onTypedAnswer() {}, onCheck() {},
      saving: false, error: '', completed: false, completionPending: false,
      onRetryCompletion() {}, finishedBooking: null, backLabel: 'Plan', onBack() {}, onFinish() {},
    }
    const before = renderToStaticMarkup(createElement(HomeCalculationCheck, { ...common, result: null }))
    expect(before).toContain('Your final number')
    expect(before).toContain('Guessing')
    expect(before).not.toContain('Published answer:')
    // Scenario inputs may contain the same number as the answer. Check for
    // answer/working disclosures, not a bare numeric substring in the prompt.
    expect(before).not.toContain('<strong>Worked answer</strong>')
    const after = renderToStaticMarkup(createElement(HomeCalculationCheck, {
      ...common, result: { correct: false, typed: '42' }, completed: true,
    }))
    expect(after).toContain('Not the expected final number')
    expect(after).toContain('Published answer:')
    expect(after).toContain(question.answerText)
    if (question.workings) expect(after).toContain('<strong>Worked answer</strong>')
  })
})
