import { RevPresence } from '../RevPresence'
import { Icon } from './Icon'
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
  /** Small uppercase label, e.g. "REV suggests · 45 min". ("REV noticed" cards are not part of launch.) */
  eyebrow: string
  /** Optional headline, used by the larger Home variant. */
  title?: string
  /** The suggestion. Every REV card gives a reason taken from real data. No reason, no card: show the empty state instead. */
  reason: string
  /** Optional Learn → Practice → Exam Prep session list. */
  steps?: readonly RevSuggestionStep[]
  /** Does the suggestion (add to plan, start practice). */
  primaryAction?: RevSuggestionAction
  /** Dismisses it or asks for something else. */
  secondaryAction?: RevSuggestionAction
  /** A quiet third choice, e.g. "Not now". */
  tertiaryAction?: RevSuggestionAction
  /** Puts the suggestion on the student's plan, e.g. "Add to Thursday". */
  planAction?: RevSuggestionAction
  /** `hero` is the larger Home treatment with a headline and a big start button. */
  variant?: 'default' | 'hero'
  className?: string
}

const stepStateLabel: Record<RevSuggestionStepState, string> = {
  done: 'Done',
  current: 'Up next',
  upcoming: 'Later',
}

export function RevSuggestionCard({ eyebrow, title, reason, steps, primaryAction, secondaryAction, tertiaryAction, planAction, variant = 'default', className }: RevSuggestionCardProps) {
  return (
    <article className={classNames('rev-suggestion-card', variant === 'hero' && 'rev-suggestion-card--hero', className)}>
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
              <span className="rev-suggestion-card__step-mark" aria-hidden="true">{step.state === 'done' && <Icon name="check" size="inline" />}</span>
              <span className="rev-suggestion-card__step-label">{step.label}</span>
              <span className="rev-suggestion-card__step-meta">{step.meta ?? stepStateLabel[step.state]}</span>
            </li>
          ))}
        </ol>
      )}
      {(primaryAction || planAction || secondaryAction || tertiaryAction) && (
        <div className="rev-suggestion-card__actions">
          {primaryAction && <button type="button" className="rev-suggestion-card__primary" onClick={primaryAction.onClick}>{primaryAction.label}{variant === 'hero' && <Icon name="arrow-right" size="inline" />}</button>}
          {planAction && <button type="button" className="rev-suggestion-card__plan" onClick={planAction.onClick}>{planAction.label}</button>}
          {secondaryAction && <button type="button" className="rev-suggestion-card__secondary" onClick={secondaryAction.onClick}>{secondaryAction.label}</button>}
          {tertiaryAction && <button type="button" className="rev-suggestion-card__secondary" onClick={tertiaryAction.onClick}>{tertiaryAction.label}</button>}
        </div>
      )}
    </article>
  )
}

/** The design system calls this component RevCard. It is the same component: one REV card, not two. */
export { RevSuggestionCard as RevCard }
