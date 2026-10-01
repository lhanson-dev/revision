import { useEffect, useState } from 'react'
import { RevPresence, type RevPresenceSize, type RevPresenceState } from '../RevPresence'
import { classNames } from './classNames'

/** The four states a student sees. Waiting is the calm default. */
export type RevMarkState = 'waiting' | 'listening' | 'thinking' | 'responding'

const presenceState: Record<RevMarkState, RevPresenceState> = {
  waiting: 'resting',
  listening: 'listening',
  thinking: 'thinking',
  responding: 'responding',
}

const stateText: Record<RevMarkState, string> = {
  waiting: 'REV is ready',
  listening: 'REV is listening',
  thinking: 'REV is thinking',
  responding: 'REV is answering',
}

/** How long the responding settle takes before the mark goes back to waiting. */
const settleMs = 1100

export interface RevMarkProps {
  state?: RevMarkState
  size?: RevPresenceSize
  /** Called when the responding state has settled back to waiting. */
  onSettled?: () => void
  className?: string
}

/**
 * REV's Living E with the four states from the v2 design: waiting, listening, thinking, responding.
 * It reuses the one governed Living E (RevPresence) rather than a second implementation.
 *
 * Every state is also given as text. Screen readers always get it (polite live region). With
 * "reduce motion" on, the mark stays still and the same text becomes visible, for example
 * "REV is thinking".
 */
export function RevMark({ state = 'waiting', size = 'compact', onSettled, className }: RevMarkProps) {
  // Responding settles back to waiting by itself. `settledFor` remembers which responding run has
  // settled, so a new run (the prop changes away and back) plays again.
  const [runs, setRuns] = useState({ requested: state, settled: false })
  if (runs.requested !== state) setRuns({ requested: state, settled: false })
  const shown: RevMarkState = state === 'responding' && runs.settled ? 'waiting' : state

  useEffect(() => {
    if (state !== 'responding') return undefined
    const timer = window.setTimeout(() => {
      setRuns({ requested: 'responding', settled: true })
      onSettled?.()
    }, settleMs)
    return () => window.clearTimeout(timer)
  }, [state, onSettled])

  return (
    <span className={classNames('ui-rev-mark', shown !== 'waiting' && 'ui-rev-mark--active', className)}>
      <RevPresence state={presenceState[shown]} size={size} decorative />
      <span className="ui-rev-mark__text" aria-live="polite">{stateText[shown]}</span>
    </span>
  )
}
