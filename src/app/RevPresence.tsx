export type RevPresenceState = 'resting' | 'listening' | 'thinking' | 'responding' | 'complete'
export type RevPresenceSize = 'hero' | 'conversation' | 'nav' | 'compact'

interface RevPresenceProps {
  state?: RevPresenceState
  size?: RevPresenceSize
  decorative?: boolean
  className?: string
}

const stateLabels: Record<RevPresenceState, string> = {
  resting: 'REV is ready',
  listening: 'REV is listening',
  thinking: 'REV is thinking',
  responding: 'REV is responding',
  complete: 'REV has finished responding',
}

export function RevPresence({ state = 'resting', size = 'hero', decorative = false, className = '' }: RevPresenceProps) {
  return (
    <div
      className={`rev-presence rev-presence-${size} ${className}`.trim()}
      data-state={state}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : stateLabels[state]}
    >
      <span className="rev-halo" aria-hidden="true"></span>
      <svg className="rev-living-e" viewBox="0 0 120 88" aria-hidden="true" focusable="false">
        <rect className="rev-e-bar rev-e-bar-one" x="16" y="12" width="88" height="12" rx="6" />
        <rect className="rev-e-bar rev-e-bar-two" x="16" y="38" width="88" height="12" rx="6" />
        <rect className="rev-e-bar rev-e-bar-three" x="16" y="64" width="88" height="12" rx="6" />
      </svg>
    </div>
  )
}
