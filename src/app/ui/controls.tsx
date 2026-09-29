import { useId, type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { classNames } from './classNames'

export type ButtonVariant = 'primary' | 'strong' | 'secondary' | 'tertiary' | 'destructive'
export type ButtonSize = 'compact' | 'standard' | 'large'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  loadingLabel?: ReactNode
}

export function Button({ variant = 'primary', size = 'standard', loading = false, loadingLabel, className, type = 'button', disabled, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classNames(
        'ui-button',
        `ui-button--${variant}`,
        size !== 'standard' && `ui-button--${size}`,
        className,
      )}
    >
      {loading && <span className="ui-button__spinner" aria-hidden="true" />}
      {loading && loadingLabel ? loadingLabel : children}
    </button>
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

function fieldSupportId(controlId: string, hint?: ReactNode, error?: ReactNode) {
  return hint || error ? `${controlId}-support` : undefined
}

function describedBy(...ids: Array<string | undefined>) {
  return ids.filter(Boolean).join(' ') || undefined
}

function dateParts(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  const date = new Date(year, month, day)
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return null
  return date
}

function labelledDate(value: string) {
  const date = dateParts(value)
  if (!date) return ''
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & FieldSupportProps

type DateFieldProps = TextFieldProps & { id: string }

function DateTextField({ label, hint, error, groupClassName, id, className, value, defaultValue, 'aria-describedby': ariaDescribedBy, 'aria-invalid': ariaInvalid, ...props }: DateFieldProps) {
  const currentValue = typeof value === 'string' ? value : typeof defaultValue === 'string' ? defaultValue : ''
  const readableDate = labelledDate(currentValue)
  const supportId = fieldSupportId(id, hint, error)
  const readableId = readableDate ? `${id}-readable-date` : undefined

  return (
    <label className={classNames('ui-field-group', 'ui-date-field-group', groupClassName)} htmlFor={id}>
      <span className="ui-field-label">{label}</span>
      <input
        {...props}
        id={id}
        type="date"
        value={value}
        defaultValue={defaultValue}
        className={classNames('ui-field', 'ui-date-field-input', Boolean(error) && 'ui-field--error', className)}
        aria-describedby={describedBy(ariaDescribedBy, supportId, readableId)}
        aria-invalid={error ? true : ariaInvalid}
      />
      {(hint || error) && <span id={supportId} className={classNames('ui-field-support', Boolean(error) && 'ui-field-support--error')}>{error ?? hint}</span>}
      {readableDate && <span id={readableId} className="ui-date-field-readable">Selected date: {readableDate}</span>}
    </label>
  )
}

export function TextField({ label, hint, error, groupClassName, id, className, ...props }: TextFieldProps) {
  const generatedId = useId()
  const controlId = id ?? generatedId

  if (props.type === 'date') {
    return <DateTextField label={label} hint={hint} error={error} groupClassName={groupClassName} id={controlId} className={className} {...props} />
  }

  const supportId = fieldSupportId(controlId, hint, error)

  return (
    <label className={classNames('ui-field-group', groupClassName)} htmlFor={controlId}>
      <span className="ui-field-label">{label}</span>
      <input
        {...props}
        id={controlId}
        className={classNames('ui-field', Boolean(error) && 'ui-field--error', className)}
        aria-describedby={describedBy(props['aria-describedby'], supportId)}
        aria-invalid={error ? true : props['aria-invalid']}
      />
      {(hint || error) && <span id={supportId} className={classNames('ui-field-support', Boolean(error) && 'ui-field-support--error')}>{error ?? hint}</span>}
    </label>
  )
}

export type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & FieldSupportProps

export function TextAreaField({ label, hint, error, groupClassName, id, className, ...props }: TextAreaFieldProps) {
  const generatedId = useId()
  const controlId = id ?? generatedId
  const supportId = fieldSupportId(controlId, hint, error)

  return (
    <label className={classNames('ui-field-group', groupClassName)} htmlFor={controlId}>
      <span className="ui-field-label">{label}</span>
      <textarea
        {...props}
        id={controlId}
        className={classNames('ui-field', 'ui-field--textarea', Boolean(error) && 'ui-field--error', className)}
        aria-describedby={describedBy(props['aria-describedby'], supportId)}
        aria-invalid={error ? true : props['aria-invalid']}
      />
      {(hint || error) && <span id={supportId} className={classNames('ui-field-support', Boolean(error) && 'ui-field-support--error')}>{error ?? hint}</span>}
    </label>
  )
}

export type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & FieldSupportProps

export function SelectField({ label, hint, error, groupClassName, id, className, children, ...props }: SelectFieldProps) {
  const generatedId = useId()
  const controlId = id ?? generatedId
  const supportId = fieldSupportId(controlId, hint, error)

  return (
    <label className={classNames('ui-field-group', groupClassName)} htmlFor={controlId}>
      <span className="ui-field-label">{label}</span>
      <select
        {...props}
        id={controlId}
        className={classNames('ui-field', 'ui-select-field', Boolean(error) && 'ui-field--error', className)}
        aria-describedby={describedBy(props['aria-describedby'], supportId)}
        aria-invalid={error ? true : props['aria-invalid']}
      >
        {children}
      </select>
      {(hint || error) && <span id={supportId} className={classNames('ui-field-support', Boolean(error) && 'ui-field-support--error')}>{error ?? hint}</span>}
    </label>
  )
}

export interface SegmentedControlProps extends HTMLAttributes<HTMLDivElement> {
  label: string
}

export function SegmentedControl({ label, className, ...props }: SegmentedControlProps) {
  return <div role="group" aria-label={label} className={classNames('ui-segmented-control', className)} {...props} />
}
