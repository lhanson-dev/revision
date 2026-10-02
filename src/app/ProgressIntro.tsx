import { Button } from './ui'
import { HOW_THIS_IS_WORKED_OUT, type ProgressNextAction } from './progress-summary'

type ProgressIntroProps = {
  /** The plain sentence that comes before any numbers. */
  sentence: string
  /** The one next action, or null when there is nothing to suggest (then no button is shown). */
  action: ProgressNextAction | null
  onAction: (action: ProgressNextAction) => void
}

/** Every Progress screen opens with this: a plain sentence, one next action with its reason, and an optional note on how it is worked out. */
export function ProgressIntro({ sentence, action, onAction }: ProgressIntroProps) {
  return (
    <section className="progress-intro" aria-label="Progress summary">
      <p className="progress-intro__sentence">{sentence}</p>
      {action && (
        <div className="progress-intro__action">
          <Button onClick={() => onAction(action)}>{action.label}</Button>
          <p className="progress-intro__why"><b>Why:</b> {action.reason}</p>
        </div>
      )}
      <details className="progress-intro__how">
        <summary>How this is worked out</summary>
        {HOW_THIS_IS_WORKED_OUT.map((line) => <p key={line}>{line}</p>)}
      </details>
    </section>
  )
}
