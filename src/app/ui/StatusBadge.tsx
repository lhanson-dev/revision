import { Icon } from './Icon'
import { classNames } from './classNames'
import { learningStatusMeta, type LearningStatus } from './learning-status'

export interface StatusBadgeProps {
  status: LearningStatus
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/** Learning status: always an icon plus the fixed label, on the status tint. Never colour alone. */
export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const meta = learningStatusMeta[status]
  return (
    <span className={classNames('ui-status-badge', `ui-status-badge--${status}`, size === 'sm' && 'ui-status-badge--sm', size === 'lg' && 'ui-status-badge--lg', className)}>
      <Icon name={meta.icon} size="inline" />
      {meta.label}
    </span>
  )
}
