import { useEffect, useRef, type ButtonHTMLAttributes, type HTMLAttributes, type MutableRefObject } from 'react'
import { classNames } from './classNames'

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

const activeDialogStack: HTMLElement[] = []
const inertOwners = new Map<HTMLElement, { count: number; wasInert: boolean }>()
let scrollLockCount = 0
let previousBodyOverflow = ''

function isAvailableForFocus(element: HTMLElement) {
  if (element.closest('[hidden], [inert], [aria-hidden="true"]')) return false
  return element.getClientRects().length > 0
}

function focusableElements(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(focusableSelector)).filter(isAvailableForFocus)
}

function focusElement(element: HTMLElement) {
  element.focus({ preventScroll: true })
}

function retainInert(element: HTMLElement) {
  const existing = inertOwners.get(element)
  if (existing) {
    existing.count += 1
    element.setAttribute('inert', '')
    return
  }

  inertOwners.set(element, { count: 1, wasInert: element.hasAttribute('inert') })
  element.setAttribute('inert', '')
}

function releaseInert(element: HTMLElement) {
  const existing = inertOwners.get(element)
  if (!existing) return
  existing.count -= 1
  if (existing.count > 0) return

  if (!existing.wasInert) element.removeAttribute('inert')
  inertOwners.delete(element)
}

function inertBackground(dialog: HTMLElement) {
  const retained: HTMLElement[] = []
  let branch: HTMLElement = dialog
  let parent = dialog.parentElement

  while (parent) {
    Array.from(parent.children).forEach((child) => {
      if (!(child instanceof HTMLElement) || child === branch || child.hasAttribute('data-ui-overlay-backdrop')) return
      retainInert(child)
      retained.push(child)
    })

    if (parent === document.body) break
    branch = parent
    parent = parent.parentElement
  }

  return () => {
    retained.reverse().forEach(releaseInert)
  }
}

function lockBodyScroll() {
  if (scrollLockCount === 0) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  scrollLockCount += 1

  return () => {
    scrollLockCount = Math.max(0, scrollLockCount - 1)
    if (scrollLockCount === 0) document.body.style.overflow = previousBodyOverflow
  }
}

function useDialogFocusContract(
  dialogRef: MutableRefObject<HTMLDivElement | null>,
  onDismiss: (() => void) | undefined,
  initialFocusSelector: string | undefined,
) {
  const onDismissRef = useRef(onDismiss)

  useEffect(() => {
    onDismissRef.current = onDismiss
  }, [onDismiss])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const releaseBackground = inertBackground(dialog)
    const releaseScroll = lockBodyScroll()
    activeDialogStack.push(dialog)

    const preferredInitialFocus = () => {
      const requested = initialFocusSelector
        ? dialog.querySelector<HTMLElement>(initialFocusSelector)
        : dialog.querySelector<HTMLElement>('[data-ui-overlay-initial-focus]')
      if (requested && isAvailableForFocus(requested)) return requested
      return focusableElements(dialog)[0] ?? dialog
    }

    focusElement(preferredInitialFocus())

    const isTopDialog = () => activeDialogStack[activeDialogStack.length - 1] === dialog

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isTopDialog()) return

      if (event.key === 'Escape' && onDismissRef.current) {
        event.preventDefault()
        event.stopPropagation()
        onDismissRef.current()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = focusableElements(dialog)
      if (focusable.length === 0) {
        event.preventDefault()
        focusElement(dialog)
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const activeElement = document.activeElement

      if (!(activeElement instanceof Node) || !dialog.contains(activeElement)) {
        event.preventDefault()
        focusElement(event.shiftKey ? last : first)
      } else if (event.shiftKey && activeElement === first) {
        event.preventDefault()
        focusElement(last)
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault()
        focusElement(first)
      }
    }

    const handleFocusIn = (event: FocusEvent) => {
      if (!isTopDialog() || !(event.target instanceof Node) || dialog.contains(event.target)) return
      focusElement(preferredInitialFocus())
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('focusin', handleFocusIn)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('focusin', handleFocusIn)

      const stackIndex = activeDialogStack.lastIndexOf(dialog)
      if (stackIndex >= 0) activeDialogStack.splice(stackIndex, 1)

      releaseBackground()
      releaseScroll()
      if (previousFocus?.isConnected) focusElement(previousFocus)
    }
  }, [dialogRef, initialFocusSelector])
}

export interface OverlayBackdropProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
}

export function OverlayBackdrop({ label = 'Close', className, type = 'button', tabIndex = -1, ...props }: OverlayBackdropProps) {
  return (
    <button
      {...props}
      type={type}
      tabIndex={tabIndex}
      aria-label={label}
      data-ui-overlay-backdrop=""
      className={classNames('ui-overlay-backdrop', className)}
    />
  )
}

export interface DialogShellProps extends HTMLAttributes<HTMLDivElement> {
  label?: string
  labelledBy?: string
  onDismiss?: () => void
  initialFocusSelector?: string
}

function DialogShell({
  label,
  labelledBy,
  onDismiss,
  initialFocusSelector,
  className,
  shellClassName,
  ...props
}: DialogShellProps & { shellClassName: string }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useDialogFocusContract(dialogRef, onDismiss, initialFocusSelector)

  return (
    <div
      {...props}
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      aria-labelledby={labelledBy}
      tabIndex={props.tabIndex ?? -1}
      className={classNames('ui-overlay-surface', shellClassName, className)}
    />
  )
}

export function ModalShell(props: DialogShellProps) {
  return <DialogShell {...props} shellClassName="ui-modal-shell" />
}

export function DrawerShell(props: DialogShellProps) {
  return <DialogShell {...props} shellClassName="ui-drawer-shell" />
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
