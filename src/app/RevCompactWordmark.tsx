interface RevCompactWordmarkProps {
  className?: string
}

export function RevCompactWordmark({ className = '' }: RevCompactWordmarkProps) {
  return (
    <span className={`rev-compact-wordmark ${className}`.trim()} role="img" aria-label="REV">
      <span aria-hidden="true">R</span>
      <span className="rev-compact-wordmark-e" aria-hidden="true"><i /><i /><i /></span>
      <span aria-hidden="true">V</span>
    </span>
  )
}

export function PoweredByRev() {
  return (
    <span className="powered-by-rev">
      <span>Powered by</span>
      <RevCompactWordmark />
    </span>
  )
}
