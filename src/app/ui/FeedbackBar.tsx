import type { ReactNode } from 'react'
import { Icon } from './Icon'
import { classNames } from './classNames'

export interface FeedbackBarProps {
  /** Correct uses teal; wrong uses coral ("look at this"), never error red or yellow. */
  tone: 'correct' | 'wrong'
  title: string
  /** For a wrong answer: what the student picked and why it was tempting, e.g. "You picked B: this describes a moving average." */
  picked?: string
  /** Why, in the content's own explanation. */
  explanation: string
  /** Optional extra line, such as "This will come back later in this session." Only say what is true. */
  note?: string
  /** The next step (a button). */
  children?: ReactNode
  className?: string
}

/**
 * The bar pinned to the bottom of the Practice pop-up after each answer (v2.2): a soft tint with a status-coloured top
 * edge, never solid coral. Icon and words (never colour alone), the content's own explanation, and one action. Put it inside a polite live region so screen readers hear it.
 */
export function FeedbackBar({ tone, title, picked, explanation, note, children, className }: FeedbackBarProps) {
  return (
    <div className={classNames('ui-feedback-bar', `ui-feedback-bar--${tone}`, className)}>
      <div className="ui-feedback-bar__inner">
        <div className="ui-feedback-bar__body">
          <p className="ui-feedback-bar__title">
            <Icon name={tone === 'correct' ? 'status-gotit' : 'status-needswork'} size="standard" />
            {title}
          </p>
          {picked && <p className="ui-feedback-bar__picked">{picked}</p>}
          <p className="ui-feedback-bar__explanation">{explanation}</p>
          {note && <p className="ui-feedback-bar__note">{note}</p>}
        </div>
        {children && <div className="ui-feedback-bar__actions">{children}</div>}
      </div>
    </div>
  )
}
