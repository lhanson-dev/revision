import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PracticeStart } from './PracticeStart'
import { QuestionHead } from './PracticeQuestion'

const noop = () => undefined

function startFor(availableQuestions: number, sessionCount: number) {
  return renderToStaticMarkup(
    <PracticeStart
      topicTitle="Memory"
      lastPractised={null}
      topics={[{ id: 'memory', label: 'Memory' }]}
      topicId="memory"
      onChangeTopic={noop}
      length={5}
      onChangeLength={noop}
      availableQuestions={availableQuestions}
      sessionCount={sessionCount}
      questionTypes={['multiple-choice']}
      selectedTypes={['multiple-choice']}
      onToggleType={noop}
      onStart={noop}
      warmups={[]}
      onOpenWarmup={noop}
    />,
  )
}

describe('LF-09 / LF-10 canonical Practice clarity', () => {
  it('explains a capped one-question session without the dismissive legacy wording', () => {
    const markup = startFor(1, 1)
    expect(markup).toContain('Start 1 question')
    expect(markup).toContain('There is 1 question available for this topic. Your session will use it.')
    expect(markup).not.toContain('so that is what you will get')
  })

  it('uses natural grammar when multiple questions are available', () => {
    const markup = startFor(3, 3)
    expect(markup).toContain('There are 3 questions available for this topic. Your session will use them all.')
    expect(markup).not.toContain('so that is what you will get')
  })

  it('makes marks readable before level, with a text alternative for screen readers', () => {
    const markup = renderToStaticMarkup(
      <QuestionHead eyebrow="Question 1" level="Apply" marksLabel="3 marks" context={null} table={null} />,
    )
    expect(markup).toContain('class="practice-question__marks"')
    expect(markup).toContain('aria-label="Available marks: 3 marks"')
    expect(markup.indexOf('3 marks')).toBeLessThan(markup.indexOf('Apply'))
    expect(markup).toContain('>3 marks</strong>')
    expect(markup).toContain('Question 1')
  })

  it('works for one-mark questions and preserves question stimulus rendering', () => {
    const markup = renderToStaticMarkup(
      <QuestionHead
        eyebrow="Question 2"
        level="Recall"
        marksLabel="1 mark"
        context="A short fictional business case."
        table={{ title: 'Sales', columns: ['Year', 'Revenue'], rows: [['2026', '£40k']] }}
      />,
    )
    expect(markup).toContain('Available marks: 1 mark')
    expect(markup).toContain('A short fictional business case.')
    expect(markup).toContain('<caption>Sales</caption>')
    expect(markup).toContain('£40k')
  })
})
