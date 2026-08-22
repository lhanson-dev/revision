import type { HTMLAttributes, ReactNode } from 'react'
import { classNames } from './classNames'

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  titleId: string
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
}

export function PageHeader({ titleId, eyebrow, title, description, className, children, ...props }: PageHeaderProps) {
  return (
    <header className={classNames('ui-page-header', className)} {...props}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 id={titleId}>{title}</h1>
      {description && <p>{description}</p>}
      {children}
    </header>
  )
}

export type SurfaceVariant = 'standard' | 'quiet' | 'interactive' | 'feature' | 'floating'
export type SurfaceElement = 'section' | 'article' | 'aside' | 'div'

export interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  as?: SurfaceElement
  variant?: SurfaceVariant
  padded?: boolean
}

const surfaceClasses: Record<SurfaceVariant, string> = {
  standard: 'ui-surface-standard',
  quiet: 'ui-surface-quiet',
  interactive: 'ui-surface-interactive',
  feature: 'ui-surface-feature',
  floating: 'ui-floating-surface',
}

export function Surface({ as = 'section', variant = 'standard', padded = true, className, ...props }: SurfaceProps) {
  const Component = as
  return <Component className={classNames(surfaceClasses[variant], padded && 'ui-surface-component', className)} {...props} />
}

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  title: ReactNode
  description: ReactNode
  action?: ReactNode
}

export function EmptyState({ title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div className={classNames('ui-empty-state', className)} {...props}>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <div className="ui-empty-state__action">{action}</div>}
    </div>
  )
}

export interface LoadingStateProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export function LoadingState({ children = 'Loading…', className, ...props }: LoadingStateProps) {
  return (
    <div className={classNames('ui-loading-state', 'ui-surface-standard', className)} role="status" aria-live="polite" aria-busy="true" {...props}>
      <p>{children}</p>
    </div>
  )
}
