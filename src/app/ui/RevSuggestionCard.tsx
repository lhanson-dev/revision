import { RevPresence } from '../RevPresence'
import { classNames } from './classNames'

export type RevSuggestionStepState = 'done' | 'current' | 'upcoming'

export interface RevSuggestionStep {
  id: string
  label: string
  meta?: string
  state: RevSuggestionStepState
}

export interface RevSuggestionAction {
  label: string
  onClick: () => void
}

export interface RevSuggestionCardProps {
  /** Small uppercase label, e.g. "REV suggests · 45 min", "REV noticed", "REV's advice". */
  eyebrow: string
  /** Optional headline, used by the larger Home variant. */
  title?: string
  /** The suggestion. It must say why, using the learner's own data. */
  reason: string
  /** Optional Learn → Practice → Exam Prep session list. */
  steps?: readonly RevSuggestionStep[]
  /** Does the suggestion (add to plan, start practice). */
  primaryAction?: RevSuggestionAction
  /** Dismisses it or asks for something else. */
  secondaryAction?: RevSuggestionAction
  className?: string
}

const stepStateLabel: Record<RevSuggestionStepState, string> = {
  done: 'Done',
  current: 'Up next',
  upcoming: 'Later',
}

export function RevSuggestionCard({ eyebrow, title, reason, steps, primaryAction, secondaryAction, className }: RevSuggestionCardProps) {
  return (
    <article className={classNames('rev-suggestion-card', className)}>
      <header className="rev-suggestion-card__head">
        <RevPresence size="compact" decorative />
        <span className="rev-suggestion-card__eyebrow">{eyebrow}</span>
      </header>
      {title && <h3 className="rev-suggestion-card__title">{title}</h3>}
      <p className="rev-suggestion-card__reason">{reason}</p>
      {steps && steps.length > 0 && (
        <ol className="rev-suggestion-card__steps">
          {steps.map((step) => (
            <li key={step.id} className="rev-suggestion-card__step" data-state={step.state} aria-current={step.state === 'current' ? 'step' : undefined}>
              <span className="rev-suggestion-card__step-mark" aria-hidden="true" />
              <span className="rev-suggestion-card__step-label">{step.label}</span>
              <span className="rev-suggestion-card__step-meta">{step.meta ?? stepStateLabel[step.state]}</span>
            </li>
          ))}
        </ol>
      )}
      {(primaryAction || secondaryAction) && (
        <div className="rev-suggestion-card__actions">
          {primaryAction && <button type="button" className="rev-suggestion-card__primary" onClick={primaryAction.onClick}>{primaryAction.label}</button>}
          {secondaryAction && <button type="button" className="rev-suggestion-card__secondary" onClick={secondaryAction.onClick}>{secondaryAction.label}</button>}
        </div>
      )}
    </article>
  )
}
