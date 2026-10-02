import type { ReactNode } from 'react'
import { Icon } from './Icon'
import { classNames } from './classNames'

export interface FeedbackBarProps {
  /** Correct uses teal; wrong uses coral ("look at this"), never error red or yellow. */
  tone: 'correct' | 'wrong'
  title: string
  /** Why, in the content's own explanation. */
  explanation: string
  /** Optional extra line, such as "This will come back later in this session." Only say what is true. */
  note?: string
  /** The next step (a button). */
  children?: ReactNode
  className?: string
}

/**
 * The bar that slides up after each Practice answer: icon and words (never colour alone), the content's own
 * explanation, and what happens next. Put it inside a polite live region so screen readers hear it.
 */
export function FeedbackBar({ tone, title, explanation, note, children, className }: FeedbackBarProps) {
  return (
    <div className={classNames('ui-feedback-bar', `ui-feedback-bar--${tone}`, className)}>
      <p className="ui-feedback-bar__title">
        <Icon name={tone === 'correct' ? 'status-gotit' : 'status-needswork'} size="inline" />
        {title}
      </p>
      <p className="ui-feedback-bar__explanation">{explanation}</p>
      {note && <p className="ui-feedback-bar__note">{note}</p>}
      {children && <div className="ui-feedback-bar__actions">{children}</div>}
    </div>
  )
}
