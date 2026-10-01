import { useId, useState } from 'react'
import { Icon } from './Icon'
import { classNames } from './classNames'

export interface QuickCheckOption {
  id: string
  text: string
}

export interface QuickCheckProps {
  question: string
  options: readonly QuickCheckOption[]
  correctOptionId: string
  /** Why the right answer is right. Shown after the student answers, for right and wrong. */
  explanation: string
  className?: string
}

/**
 * Quick check: an unscored check inside Learn, labelled "Not scored".
 * Instant feedback that explains why, and another try is allowed.
 *
 * It deliberately has no "on answer" callback and writes nothing: a quick check never changes status,
 * Topics covered or readiness (Founder decision 1 Oct 2026). If recording is ever allowed it is a
 * separate decision under Claims and Progress Governance.
 */
export function QuickCheck({ question, options, correctOptionId, explanation, className }: QuickCheckProps) {
  const headingId = useId()
  const [pickedId, setPickedId] = useState<string | null>(null)
  const answered = pickedId !== null
  const correct = pickedId === correctOptionId

  return (
    <section className={classNames('ui-quick-check', className)} aria-labelledby={headingId}>
      <header className="ui-quick-check__head">
        <h3 className="ui-eyebrow" id={headingId}>Quick check</h3>
        <span className="ui-quick-check__tag">Not scored</span>
      </header>
      <p className="ui-quick-check__question">{question}</p>
      <div className="ui-quick-check__options" role="group" aria-label="Answers">
        {options.map((option, index) => {
          const state = !answered ? 'idle' : option.id === correctOptionId ? 'correct' : option.id === pickedId ? 'wrong' : 'idle'
          return (
            <button
              key={option.id}
              type="button"
              className={`ui-answer-option ui-answer-option--${state}`}
              disabled={answered}
              onClick={() => setPickedId(option.id)}
            >
              <span className="ui-answer-option__letter" aria-hidden="true">
                {state === 'correct' ? <Icon name="check" size="inline" /> : state === 'wrong' ? <Icon name="close" size="inline" /> : 'ABCDEF'[index]}
              </span>
              <span className="ui-answer-option__text">{option.text}</span>
              {state === 'correct' && <span className="ui-answer-option__note">Correct</span>}
              {state === 'wrong' && <span className="ui-answer-option__note">Not quite</span>}
            </button>
          )
        })}
      </div>
      <div className="ui-quick-check__feedback" aria-live="polite">
        {answered && (
          <>
            <p><b>{correct ? 'Yep.' : 'Not quite.'}</b> {explanation} This doesn’t count towards your progress.</p>
            {!correct && (
              <button type="button" className="ui-quick-check__retry" onClick={() => setPickedId(null)}>
                <Icon name="retry" size="inline" />Try again
              </button>
            )}
          </>
        )}
      </div>
    </section>
  )
}
