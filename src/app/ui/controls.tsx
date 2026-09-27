import { useEffect, useId, useMemo, useRef, useState, type ButtonHTMLAttributes, type ChangeEvent, type HTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { classNames } from './classNames'
import { Icon } from './Icon'

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

function fieldSupportId(controlId: string, hint?: ReactNode, error?: ReactNode) {
  return hint || error ? `${controlId}-support` : undefined
}

function describedBy(existing: string | undefined, supportId: string | undefined) {
  return [existing, supportId].filter(Boolean).join(' ') || undefined
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

function isoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function displayDate(value: string) {
  const date = dateParts(value)
  if (!date) return ''
  return `${String(date.getDate()).padStart(2, '0')} / ${String(date.getMonth() + 1).padStart(2, '0')} / ${date.getFullYear()}`
}

function labelledDate(value: string) {
  const date = dateParts(value)
  if (!date) return value
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

function calendarDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const mondayIndex = (first.getDay() + 6) % 7
  return Array.from({ length: 42 }, (_, index) => new Date(month.getFullYear(), month.getMonth(), 1 - mondayIndex + index))
}

function dateInRange(value: string, min?: string | number, max?: string | number) {
  const minimum = typeof min === 'string' ? min : undefined
  const maximum = typeof max === 'string' ? max : undefined
  if (minimum && value < minimum) return false
  if (maximum && value > maximum) return false
  return true
}

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & FieldSupportProps

type DateFieldProps = TextFieldProps & { id: string }

function DateTextField({ label, hint, error, groupClassName, id, className, value, defaultValue, onChange, disabled, readOnly, min, max, name, required, placeholder, 'aria-describedby': ariaDescribedBy, 'aria-invalid': ariaInvalid }: DateFieldProps) {
  const controlled = value !== undefined
  const [internalValue, setInternalValue] = useState(() => typeof defaultValue === 'string' ? defaultValue : '')
  const currentValue = controlled ? (typeof value === 'string' ? value : '') : internalValue
  const selectedDate = dateParts(currentValue)
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(() => selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1) : new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const rootRef = useRef<HTMLDivElement>(null)
  const supportId = fieldSupportId(id, hint, error)
  const labelId = `${id}-label`
  const requiredAccessibleLabel = required && typeof label === 'string' ? `${label} (required)` : undefined
  const days = useMemo(() => calendarDays(month), [month])
  const today = isoDate(new Date())

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function toggleCalendar() {
    if (disabled || readOnly) return
    if (!open && selectedDate) setMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
    setOpen((current) => !current)
  }

  function chooseDate(nextValue: string) {
    if (!controlled) setInternalValue(nextValue)
    if (onChange) {
      onChange({ target: { value: nextValue }, currentTarget: { value: nextValue } } as unknown as ChangeEvent<HTMLInputElement>)
    }
    setOpen(false)
  }

  return (
    <div ref={rootRef} className={classNames('ui-field-group', 'ui-date-field-group', groupClassName)}>
      <span id={labelId} className="ui-field-label">{label}</span>
      <button
        id={id}
        type="button"
        disabled={disabled}
        className={classNames('ui-field', 'ui-date-field-trigger', Boolean(error) && 'ui-field--error', className)}
        aria-label={requiredAccessibleLabel}
        aria-labelledby={requiredAccessibleLabel ? undefined : labelId}
        aria-describedby={describedBy(ariaDescribedBy, supportId)}
        aria-invalid={error ? true : ariaInvalid}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggleCalendar}
      >
        <Icon name="plan" size="compact" />
        <span className={classNames(!currentValue && 'ui-date-field-placeholder')}>{displayDate(currentValue) || placeholder || 'DD / MM / YYYY'}</span>
      </button>
      <input type="hidden" name={name} value={currentValue} data-required={required ? 'true' : undefined} />
      {open && <div className="ui-date-popover" role="dialog" aria-label={`Choose ${typeof label === 'string' ? label.toLowerCase() : 'date'}`}>
        <div className="ui-date-popover-header">
          <button type="button" className="ui-date-nav" aria-label="Previous month" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}><Icon name="chevron-right" size="compact" /></button>
          <strong>{new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(month)}</strong>
          <button type="button" className="ui-date-nav" aria-label="Next month" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}><Icon name="chevron-right" size="compact" /></button>
        </div>
        <div className="ui-date-weekdays" aria-hidden="true"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
        <div className="ui-date-grid">
          {days.map((date) => {
            const nextValue = isoDate(date)
            const outsideMonth = date.getMonth() !== month.getMonth()
            const unavailable = !dateInRange(nextValue, min, max)
            return <button
              type="button"
              key={nextValue}
              className={classNames('ui-date-day', outsideMonth && 'ui-date-day--outside')}
              disabled={unavailable}
              aria-label={labelledDate(nextValue)}
              aria-pressed={nextValue === currentValue}
              aria-current={nextValue === today ? 'date' : undefined}
              onClick={() => chooseDate(nextValue)}
            >{date.getDate()}</button>
          })}
        </div>
      </div>}
      {(hint || error) && <span id={supportId} className={classNames('ui-field-support', Boolean(error) && 'ui-field-support--error')}>{error ?? hint}</span>}
    </div>
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