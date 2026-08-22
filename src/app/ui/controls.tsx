import { useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type HTMLAttributes } from 'react'
import { classNames } from './classNames'

export type ButtonVariant = 'primary' | 'strong' | 'secondary' | 'tertiary' | 'destructive'
export type ButtonSize = 'compact' | 'standard' | 'large'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({ variant = 'primary', size = 'standard', className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={classNames(
        'ui-button',
        `ui-button--${variant}`,
        size !== 'standard' && `ui-button--${size}`,
        className,
      )}
      {...props}
    />
  )
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
}

export function IconButton({ label, className, type = 'button', ...props }: IconButtonProps) {
  return <button type={type} aria-label={label} className={classNames('ui-icon-button', className)} {...props} />
}

interface FieldSupportProps {
  label: ReactNode
  hint?: ReactNode
  error?: ReactNode
  groupClassName?: string
}

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement>, FieldSupportProps {}

export function TextField({ label, hint, error, groupClassName, id, className, ...props }: TextFieldProps) {
  const generatedId = useId()
  const controlId = id ?? generatedId
  const supportId = hint || error ? `${controlId}-support` : undefined
  const describedBy = [props['aria-describedby'], supportId].filter(Boolean).join(' ') || undefined

  return (
    <label className={classNames('ui-field-group', groupClassName)} htmlFor={controlId}>
      <span className="ui-field-label">{label}</span>
      <input
        {...props}
        id={controlId}
        className={classNames('ui-field', error && 'ui-field--error', className)}
        aria-describedby={describedBy}
        aria-invalid={error ? true : props['aria-invalid']}
      />
      {(hint || error) && <span id={supportId} className={classNames('ui-field-support', error && 'ui-field-support--error')}>{error ?? hint}</span>}
    </label>
  )
}

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement>, FieldSupportProps {}

export function SelectField({ label, hint, error, groupClassName, id, className, children, ...props }: SelectFieldProps) {
  const generatedId = useId()
  const controlId = id ?? generatedId
  const supportId = hint || error ? `${controlId}-support` : undefined
  const describedBy = [props['aria-describedby'], supportId].filter(Boolean).join(' ') || undefined

  return (
    <label className={classNames('ui-field-group', groupClassName)} htmlFor={controlId}>
      <span className="ui-field-label">{label}</span>
      <select
        {...props}
        id={controlId}
        className={classNames('ui-field', error && 'ui-field--error', className)}
        aria-describedby={describedBy}
        aria-invalid={error ? true : props['aria-invalid']}
      >
        {children}
      </select>
      {(hint || error) && <span id={supportId} className={classNames('ui-field-support', error && 'ui-field-support--error')}>{error ?? hint}</span>}
    </label>
  )
}

export interface SegmentedControlProps extends HTMLAttributes<HTMLDivElement> {
  label: string
}

export function SegmentedControl({ label, className, ...props }: SegmentedControlProps) {
  return <div role="group" aria-label={label} className={classNames('ui-segmented-control', className)} {...props} />
}
