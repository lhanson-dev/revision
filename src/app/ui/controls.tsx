import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
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

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function isoDate(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`
}

function parseIsoDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

function formatDisplayDate(value: string) {
  const parsed = parseIsoDate(value)
  if (!parsed) return 'DD / MM / YYYY'
  return `${pad(parsed.getDate())} / ${pad(parsed.getMonth() + 1)} / ${parsed.getFullYear()}`
}

function dateValueFromProps(value: InputHTMLAttributes<HTMLInputElement>['value']) {
  return typeof value === 'string' ? value : ''
}

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & FieldSupportProps

function DateTextField({ label, hint, error, groupClassName, id, className, value, defaultValue, onChange, min, max, required, disabled, ...props }: TextFieldProps) {
  const generatedId = useId()
  const controlId = id ?? generatedId
  const labelId = `${controlId}-label`
  const supportId = fieldSupportId(controlId, hint, error)
  const controlledValue = dateValueFromProps(value)
  const [uncontrolledValue, setUncontrolledValue] = useState(() => dateValueFromProps(defaultValue))
  const currentValue = value === undefined ? uncontrolledValue : controlledValue
  const initialDate = parseIsoDate(currentValue) ?? new Date()
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1))
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const nativeInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear()
    const month = visibleMonth.getMonth()
    const mondayOffset = (new Date(year, month, 1).getDay() + 6) % 7
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(year, month, index - mondayOffset + 1)
      return {
        date,
        value: isoDate(date.getFullYear(), date.getMonth(), date.getDate()),
        inMonth: date.getMonth() === month,
      }
    })
  }, [visibleMonth])

  function emitChange(nextValue: string) {
    if (value === undefined) setUncontrolledValue(nextValue)
    const input = nativeInputRef.current
    if (!input) return
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    setter?.call(input, nextValue)
    onChange?.({ target: input, currentTarget: input } as ChangeEvent<HTMLInputElement>)
  }

  function selectDate(nextValue: string) {
    emitChange(nextValue)
    setOpen(false)
    triggerRef.current?.focus()
  }

  function toggleCalendar() {
    if (!open) {
      const selectedDate = parseIsoDate(currentValue) ?? new Date()
      setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
    }
    setOpen((current) => !current)
  }

  const minValue = typeof min === 'string' ? min : undefined
  const maxValue = typeof max === 'string' ? max : undefined
  const monthLabel = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(visibleMonth)

  return (
    <div className={classNames('ui-field-group', groupClassName)} ref={rootRef}>
      <span id={labelId} className="ui-field-label">{label}</span>
      <input
        {...props}
        ref={nativeInputRef}
        id={controlId}
        type="date"
        className="ui-date-native-input"
        value={currentValue}
        min={min}
        max={max}
        required={required}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        onChange={onChange}
        onInvalid={(event) => {
          event.preventDefault()
          triggerRef.current?.focus()
        }}
      />
      <button
        ref={triggerRef}
        type="button"
        className={classNames('ui-field', 'ui-date-trigger', Boolean(error) && 'ui-field--error', className)}
        aria-labelledby={labelId}
        aria-describedby={describedBy(props['aria-describedby'], supportId)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={error ? true : props['aria-invalid']}
        aria-required={required || undefined}
        disabled={disabled}
        onClick={toggleCalendar}
      >
        <Icon name="plan" size="compact" />
        <span className={classNames('ui-date-value', !currentValue && 'ui-date-value--placeholder')}>{formatDisplayDate(currentValue)}</span>
      </button>
      {open && !disabled && <div className="ui-date-popover" role="dialog" aria-label={`Choose ${String(label)}`}>
        <div className="ui-date-popover-header">
          <button type="button" className="ui-icon-button" aria-label="Previous month" onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}>
            <Icon name="chevron-right" size="compact" className="ui-icon--chevron-left" />
          </button>
          <strong>{monthLabel}</strong>
          <button type="button" className="ui-icon-button" aria-label="Next month" onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}>
            <Icon name="chevron-right" size="compact" />
          </button>
        </div>
        <div className="ui-date-weekdays" aria-hidden="true">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="ui-date-grid">
          {calendarDays.map(({ date, value: dayValue, inMonth }) => {
            const outOfRange = Boolean((minValue && dayValue < minValue) || (maxValue && dayValue > maxValue))
            return <button
              key={dayValue}
              type="button"
              className={classNames(
                'ui-date-day',
                !inMonth && 'ui-date-day--outside',
                dayValue === currentValue && 'ui-date-day--selected',
              )}
              aria-label={new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date)}
              aria-pressed={dayValue === currentValue}
              disabled={outOfRange}
              onClick={() => selectDate(dayValue)}
            >{date.getDate()}</button>
          })}
        </div>
      </div>}
      {(hint || error) && <span id={supportId} className={classNames('ui-field-support', Boolean(error) && 'ui-field-support--error')}>{error ?? hint}</span>}
    </div>
  )
}

function PlainTextField({ label, hint, error, groupClassName, id, className, type, ...props }: TextFieldProps) {
  const generatedId = useId()
  const controlId = id ?? generatedId
  const supportId = fieldSupportId(controlId, hint, error)

  return (
    <label className={classNames('ui-field-group', groupClassName)} htmlFor={controlId}>
      <span className="ui-field-label">{label}</span>
      <input
        {...props}
        type={type}
        id={controlId}
        className={classNames('ui-field', Boolean(error) && 'ui-field--error', className)}
        aria-describedby={describedBy(props['aria-describedby'], supportId)}
        aria-invalid={error ? true : props['aria-invalid']}
      />
      {(hint || error) && <span id={supportId} className={classNames('ui-field-support', Boolean(error) && 'ui-field-support--error')}>{error ?? hint}</span>}
    </label>
  )
}

export function TextField(props: TextFieldProps) {
  return props.type === 'date' ? <DateTextField {...props} /> : <PlainTextField {...props} />
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
      <span className="ui-select-control">
        <select
          {...props}
          id={controlId}
          className={classNames('ui-field', 'ui-select-field', Boolean(error) && 'ui-field--error', className)}
          aria-describedby={describedBy(props['aria-describedby'], supportId)}
          aria-invalid={error ? true : props['aria-invalid']}
        >
          {children}
        </select>
        <Icon name="chevron-right" size="compact" className="ui-select-chevron" />
      </span>
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
