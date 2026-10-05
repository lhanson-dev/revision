import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { addDaysToKey, fromKey, longDate, monthGridKeys, monthOf, monthTitle, toKey, weekdayShort, weekStart } from './plan-dates'
import { Button, Icon } from './ui'
import type { SubjectHue } from './subject-palette'

export interface PlanDatePickerProps {
  /** The day the screen is showing. The picker opens on its month with focus on it. */
  selectedKey: string
  todayKey: string
  /** Exam dates and the subject hue of each, shown as a dot. */
  examHues: ReadonlyMap<string, SubjectHue>
  /** In Day and Week view the shown week is tinted so the student can see where they are. */
  highlightWeekOf?: string
  onSelect: (key: string) => void
  onClose: () => void
}

/**
 * The mini calendar behind the date label. It is a small dialog (not modal): arrow keys move between days,
 * Page Up and Page Down change month, Enter picks a day, Escape closes it.
 */
export function PlanDatePicker({ selectedKey, todayKey, examHues, highlightWeekOf, onSelect, onClose }: PlanDatePickerProps) {
  const [focusKey, setFocusKey] = useState(selectedKey)
  const [view, setView] = useState(() => monthOf(selectedKey))
  const gridRef = useRef<HTMLDivElement>(null)
  const movedByKeyboard = useRef(true)
  const days = monthGridKeys(view.year, view.month)
  const highlightStart = highlightWeekOf ? weekStart(highlightWeekOf) : null

  // Put focus on the day being shown when the picker opens, and keep it on the day the arrow keys land on.
  useEffect(() => {
    if (!movedByKeyboard.current) return
    gridRef.current?.querySelector<HTMLElement>(`[data-day="${focusKey}"]`)?.focus()
  }, [focusKey, view])

  function moveTo(key: string) {
    movedByKeyboard.current = true
    setFocusKey(key)
    const next = monthOf(key)
    if (next.year !== view.year || next.month !== view.month) setView(next)
  }

  function stepMonth(count: number) {
    // Month buttons change what is shown without stealing focus from the button the student just pressed.
    movedByKeyboard.current = false
    const target = new Date(view.year, view.month + count, 1, 12)
    const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
    target.setDate(Math.min(fromKey(focusKey).getDate(), lastDay))
    setView(monthOf(toKey(target)))
    setFocusKey(toKey(target))
  }

  function onGridKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const moves: Record<string, string | null> = {
      ArrowLeft: addDaysToKey(focusKey, -1),
      ArrowRight: addDaysToKey(focusKey, 1),
      ArrowUp: addDaysToKey(focusKey, -7),
      ArrowDown: addDaysToKey(focusKey, 7),
      Home: weekStart(focusKey),
      End: addDaysToKey(weekStart(focusKey), 6),
      PageUp: monthShiftKey(focusKey, -1),
      PageDown: monthShiftKey(focusKey, 1),
    }
    const next = moves[event.key]
    if (!next) return
    event.preventDefault()
    moveTo(next)
  }

  return (
    <div
      className="pln-picker"
      role="dialog"
      aria-label="Go to date"
      onKeyDown={(event) => { if (event.key === 'Escape') { event.stopPropagation(); onClose() } }}
    >
      <div className="pln-picker__head">
        <button type="button" className="pln-picker__step" aria-label="Previous month" onClick={() => stepMonth(-1)}><Icon name="arrow-right" size="compact" className="pln-flip" /></button>
        <span className="pln-picker__month" aria-live="polite">{monthTitle(view.year, view.month)}</span>
        <button type="button" className="pln-picker__step" aria-label="Next month" onClick={() => stepMonth(1)}><Icon name="arrow-right" size="compact" /></button>
      </div>
      <div className="pln-picker__grid" role="group" aria-label={monthTitle(view.year, view.month)} ref={gridRef} onKeyDown={onGridKeyDown}>
        {weekdayShort.map((name) => <span key={name} className="pln-picker__weekday" aria-hidden="true">{name[0]}</span>)}
        {days.map((key) => {
          const date = fromKey(key)
          const outside = date.getMonth() !== view.month
          const exam = examHues.get(key)
          const today = key === todayKey
          const inShownWeek = highlightStart !== null && key >= highlightStart && key <= addDaysToKey(highlightStart, 6)
          return (
            <button
              key={key}
              type="button"
              data-day={key}
              className="pln-picker__day"
              data-outside={outside || undefined}
              data-today={today || undefined}
              data-in-week={inShownWeek || undefined}
              aria-current={key === selectedKey ? 'date' : undefined}
              aria-label={`${longDate(key)} ${date.getFullYear()}${today ? ', today' : ''}${exam ? ', exam' : ''}`}
              tabIndex={key === focusKey ? 0 : -1}
              onClick={() => onSelect(key)}
              onFocus={() => { movedByKeyboard.current = true; setFocusKey(key) }}
            >
              {date.getDate()}
              {exam && <span className="pln-picker__dot" aria-hidden="true" style={{ background: `var(--subject-${exam})` }} />}
            </button>
          )
        })}
      </div>
      <div className="pln-picker__foot">
        <Button size="compact" variant="secondary" onClick={() => onSelect(todayKey)}>Today</Button>
        <Button size="compact" variant="tertiary" onClick={onClose}>Close</Button>
      </div>
    </div>
  )
}

function monthShiftKey(key: string, count: number) {
  const date = fromKey(key)
  const target = new Date(date.getFullYear(), date.getMonth() + count, 1, 12)
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  target.setDate(Math.min(date.getDate(), last))
  return toKey(target)
}
