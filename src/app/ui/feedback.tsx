import type { HTMLAttributes, ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import { classNames } from './classNames'

export type StatusTone = 'success' | 'warning' | 'error' | 'info'

const statusMeta: Record<StatusTone, { label: string; icon: IconName }> = {
  success: { label: 'Success', icon: 'check' },
  warning: { label: 'Warning', icon: 'warning' },
  error: { label: 'Error', icon: 'error' },
  info: { label: 'Information', icon: 'info' },
}

export interface StatusProps extends HTMLAttributes<HTMLDivElement> {
  tone?: StatusTone
  label?: ReactNode
}

export function Status({ tone = 'info', label, className, children, role, ...props }: StatusProps) {
  const meta = statusMeta[tone]
  return (
    <div
      className={classNames('ui-status', `ui-status--${tone}`, className)}
      role={role ?? (tone === 'error' ? 'alert' : 'status')}
      {...props}
    >
      <Icon name={meta.icon} size="compact" />
      <div className="ui-status__content">
        <strong className="ui-status__label">{label ?? meta.label}</strong>
        <div className="ui-status__message">{children}</div>
      </div>
    </div>
  )
}
