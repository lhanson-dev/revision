import type { ReactNode } from 'react'

/** Shared eyebrow for every block: a small subject-colour square and an uppercase label. */
export function BlockLabel({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <div className="learn-block__label">
      {icon ?? <span className="learn-block__mark" aria-hidden="true" />}
      <span className="learn-block__eyebrow">{children}</span>
    </div>
  )
}
