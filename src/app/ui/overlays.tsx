import type { ButtonHTMLAttributes, HTMLAttributes } from 'react'
import { classNames } from './classNames'

export interface OverlayBackdropProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
}

export function OverlayBackdrop({ label = 'Close', className, type = 'button', ...props }: OverlayBackdropProps) {
  return <button type={type} aria-label={label} className={classNames('ui-overlay-backdrop', className)} {...props} />
}

interface DialogShellProps extends HTMLAttributes<HTMLDivElement> {
  label?: string
  labelledBy?: string
}

export function ModalShell({ label, labelledBy, className, ...props }: DialogShellProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      aria-labelledby={labelledBy}
      className={classNames('ui-overlay-surface', 'ui-modal-shell', className)}
      {...props}
    />
  )
}

export function DrawerShell({ label, labelledBy, className, ...props }: DialogShellProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      aria-labelledby={labelledBy}
      className={classNames('ui-overlay-surface', 'ui-drawer-shell', className)}
      {...props}
    />
  )
}

export function PopoverShell({ label, labelledBy, className, ...props }: DialogShellProps) {
  return (
    <div
      role="dialog"
      aria-label={label}
      aria-labelledby={labelledBy}
      className={classNames('ui-floating-surface', 'ui-popover-shell', className)}
      {...props}
    />
  )
}

export interface MenuProps extends HTMLAttributes<HTMLElement> {
  label: string
}

export function Menu({ label, className, ...props }: MenuProps) {
  return <nav aria-label={label} className={classNames('ui-menu', className)} {...props} />
}

export interface MenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  current?: boolean
}

export function MenuItem({ current, className, type = 'button', ...props }: MenuItemProps) {
  return (
    <button
      type={type}
      aria-current={current ? 'page' : undefined}
      className={classNames('ui-menu-item', className)}
      {...props}
    />
  )
}
