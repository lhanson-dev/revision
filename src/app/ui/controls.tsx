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

function isoDate(value: unknown) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : ''
}

function dateFromIso(value: string) {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  const candidate = new Date(year, month - 1, day)
  if (candidate.getFullYear() !== year || candidate.getMonth() !== month - 1 || candidate.getDate() !== day) return null
  return candidate
}

function dateToIso(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function dateDisplay(value: string) {
  const parsed = dateFromIso(value)
  if (!parsed) return ''
  return `${String(parsed.getDate()).padStart(2, '0')} / ${String(parsed.getMonth() + 1).padStart(2, '0')} / ${parsed.getFullYear()}`
}

function dateDraft(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean)
  return parts.join(' / ')
}

function isoFromDisplay(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 8) return ''
  const day = Number(digits.slice(0, 2))
  const month = Number(digits.slice(2, 4))
  const year = Number(digits.slice(4, 8))
  const candidate = new Date(year, month - 1, day)
  if (candidate.getFullYear() !== year || candidate.getMonth() !== month - 1 || candidate.getDate() !== day) return ''
  return dateToIso(candidate)
}

function dateWithinBounds(value: string, min?: string, max?: string) {
  if (!value) return false
  if (min && value < min) return false
  if (max && value > max) return false
  return true
}

function dateChangeEvent(value: string) {
  const target = { value } as HTMLInputElement
  return { target, currentTarget: target } as ChangeEvent<HTMLInputElement>
}

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & FieldSupportProps

function DateTextField({
  label,
  hint,
  error,
  groupClassName,
  id,
  className,
  value,
  defaultValue,
  onChange,
  name,
  required,
  disabled,
  min,
  max,
  placeholder,
  ...props
}: TextFieldProps) {
  const generatedId = useId()
  const controlId = id ?? generatedId
  const supportId = fieldSupportId(controlId, hint, error)
  const controlledValue = value === undefined ? undefined : isoDate(value)
  const [internalValue, setInternalValue] = useState(() => isoDate(defaultValue))
  const selectedValue = controlledValue ?? internalValue
  const [draft, setDraft] = useState(() => dateDisplay(selectedValue))
  const [open, setOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const selected = dateFromIso(selectedValue)
    const today = new Date()
    return new Date((selected ?? today).getFullYear(), (selected ?? today).getMonth(), 1)
  })
  const rootRef = useRef<HTMLLabelElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDraft(dateDisplay(selectedValue))
    const selected = dateFromIso(selectedValue)
    if (selected) setVisibleMonth(new Date(selected.getFullYear(), selected.getMonth(), 1))
  }, [selectedValue])

  useEffect(() => {
    if (!open) return
    const closeOnPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && rootRef.current?.contains(event.target)) return
      setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      inputRef.current?.focus()
    }
    document.addEventListener('pointerdown', closeOnPointerDown)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnPointerDown)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear()
    const month = visibleMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const mondayOffset = (firstDay.getDay() + 6) % 7
    const start = new Date(year, month, 1 - mondayOffset)
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start)
      day.setDate(start.getDate() + index)
      return day
    })
  }, [visibleMonth])

  const monthLabel = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(visibleMonth)
  const selectedDate = dateFromIso(selectedValue)
  const minDate = isoDate(min)
  const maxDate = isoDate(max)

  function commit(nextValue: string) {
    if (controlledValue === undefined) setInternalValue(nextValue)
    onChange?.(dateChangeEvent(nextValue))
  }

  function updateValidity(displayValue: string, nextIso: string) {
    const input = inputRef.current
    if (!input) return
    if (!displayValue) {
      input.setCustomValidity('')
      return
    }
    if (!nextIso) {
      input.setCustomValidity('Enter a valid date as DD / MM / YYYY.')
      return
    }
    if (!dateWithinBounds(nextIso, minDate || undefined, maxDate || undefined)) {
      input.setCustomValidity('Choose a date within the available range.')
      return
    }
    input.setCustomValidity('')
  }

  function handleDraftChange(event: ChangeEvent<HTMLInputElement>) {
    const nextDraft = dateDraft(event.target.value)
    setDraft(nextDraft)
    if (!nextDraft) {
      updateValidity('', '')
      commit('')
      return
    }
    const nextIso = isoFromDisplay(nextDraft)
    updateValidity(nextDraft, nextIso)
    if (nextIso && dateWithinBounds(nextIso, minDate || undefined, maxDate || undefined)) commit(nextIso)
  }

  function chooseDate(nextDate: Date) {
    const nextIso = dateToIso(nextDate)
    if (!dateWithinBounds(nextIso, minDate || undefined, maxDate || undefined)) return
    updateValidity(dateDisplay(nextIso), nextIso)
    setDraft(dateDisplay(nextIso))
    commit(nextIso)
    setOpen(false)
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }

  return (
    <label ref={rootRef} className={classNames('ui-field-group', 'ui-date-field-group', groupClassName)} htmlFor={controlId}>
      <span className="ui-field-label">{label}</span>
      <span className="ui-date-control">
        <Icon name="plan" size="compact" className="ui-date-control__icon" />
        <input
          {...props}
          ref={inputRef}
          id={controlId}
          type="text"
          inputMode="numeric"
          autoComplete={props.autoComplete ?? 'off'}
          value={draft}
          required={required}
          disabled={disabled}
          placeholder={placeholder ?? 'DD / MM / YYYY'}
          pattern="[0-9]{2} / [0-9]{2} / [0-9]{4}"
          className={classNames('ui-field', 'ui-date-input', Boolean(error) && 'ui-field--error', className)}
          aria-describedby={describedBy(props['aria-describedby'], supportId)}
          aria-invalid={error ? true : props['aria-invalid']}
          aria-haspopup="dialog"
          aria-expanded={open}
          onChange={handleDraftChange}
          onClick={() => !disabled && setOpen(true)}
        />
        <button type="button" className="ui-date-picker-trigger" aria-label="Open date picker" aria-controls={`${controlId}-calendar`} aria-expanded={open} disabled={disabled} onClick={() => setOpen((current) => !current)}>
          <span aria-hidden="true">Choose</span>
        </button>
        {name && <input type="hidden" name={name} value={selectedValue} />}
        {open && <div id={`${controlId}-calendar`} className="ui-date-popover" role="dialog" aria-label={`Choose date, ${monthLabel}`}>
          <div className="ui-date-popover__header">
            <button type="button" onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}>Previous</button>
            <strong aria-live="polite">{monthLabel}</strong>
            <button type="button" onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}>Next</button>
          </div>
          <div className="ui-date-popover__weekdays" aria-hidden="true">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="ui-date-popover__days">
            {calendarDays.map((day) => {
              const nextIso = dateToIso(day)
              const outsideMonth = day.getMonth() !== visibleMonth.getMonth()
              const selected = Boolean(selectedDate && dateToIso(selectedDate) === nextIso)
              const unavailable = !dateWithinBounds(nextIso, minDate || undefined, maxDate || undefined)
              return <button
                key={nextIso}
                type="button"
                className={classNames(outsideMonth && 'is-outside-month', selected && 'is-selected')}
                aria-label={new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(day)}
                aria-pressed={selected}
                disabled={unavailable}
                onClick={() => chooseDate(day)}
              >{day.getDate()}</button>
            })}
          </div>
        </div>}
      </span>
      {(hint || error) && <span id={supportId} className={classNames('ui-field-support', Boolean(error) && 'ui-field-support--error')}>{error ?? hint}</span>}
    </label>
  )
}

function StandardTextField({ label, hint, error, groupClassName, id, className, ...props }: TextFieldProps) {
  const generatedId = useId()
  const controlId = id ?? generatedId
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

export function TextField(props: TextFieldProps) {
  return props.type === 'date' ? <DateTextField {...props} /> : <StandardTextField {...props} />
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
        <span className="ui-select-chevron" aria-hidden="true" />
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
