import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { PlanDatePicker } from './PlanDatePicker'
import {
  countdownWords,
  formatMinutes,
  fromKey,
  longDate,
  monthName,
  monthTitle,
  shortDate,
  weekdayName,
  weekdayShort,
  weekRangeLabel,
} from './plan-dates'
import type { PlanDay, PlanExamItem, PlanItem, PlanSessionItem, PlanSuggestedItem, PlanSummary } from './plan-model'
import { daysFromToday } from './plan-model'
import type { PlannedSession, PlannedSessionStatus } from '../services/planning/planned-session-service'
import type { PlanViewKey } from './navigation'
import type { SubjectHue } from './subject-palette'
import { Button, HueProgressBar, Icon, SegmentedControl, SubjectBadge, Tag, TextField } from './ui'

/* ------------------------------------------------------------------ Summary */

export function PlanSummaryCard({ label, summary }: { label: string; summary: PlanSummary }) {
  const { status } = summary
  return (
    <section className="pln-summary" aria-label={`${label}: time against plan`}>
      <div className="pln-summary__main">
        <div className="pln-summary__top">
          <span className="pln-eyebrow">{label}</span>
          <span className="pln-summary__percent">{summary.percent}%</span>
        </div>
        <p className="pln-summary__time">
          <strong>{formatMinutes(summary.doneMinutes)}</strong>
          <span>of {formatMinutes(summary.plannedMinutes)} planned</span>
        </p>
        <HueProgressBar value={summary.percent} size="lg" label="Time done against time planned" />
      </div>
      <div className="pln-summary__status">
        <span className="pln-summary__label"><Icon name={status.icon} size="compact" />{status.label}</span>
        <span className="pln-summary__text">{status.text}</span>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------- Date nav */

export interface PlanNavProps {
  view: PlanViewKey
  anchorKey: string
  todayKey: string
  /** True when the period shown is the one containing today, so "This week" is hidden. */
  atNow: boolean
  examHues: ReadonlyMap<string, SubjectHue>
  onShift: (direction: -1 | 1) => void
  onGo: (key: string) => void
  onToday: () => void
  onView: (view: PlanViewKey) => void
}

const viewLabels: Record<PlanViewKey, string> = { day: 'Day', week: 'Week', month: 'Month' }

export function PlanNav({ view, anchorKey, todayKey, atNow, examHues, onShift, onGo, onToday, onView }: PlanNavProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const month = view === 'month'
  const unit = month ? 'month' : 'week'
  const { year, month: monthIndex } = { year: fromKey(anchorKey).getFullYear(), month: fromKey(anchorKey).getMonth() }
  const dateLabel = month ? monthTitle(year, monthIndex) : weekRangeLabel(anchorKey)

  function closePicker(returnFocus = true) {
    setPickerOpen(false)
    if (returnFocus) triggerRef.current?.focus()
  }

  return (
    <div className="pln-controls">
      <div className="pln-nav">
        <button type="button" className="pln-nav__step" aria-label={`Previous ${unit}`} onClick={() => onShift(-1)}><Icon name="arrow-right" size="compact" className="pln-flip" /></button>
        <div className="pln-nav__date">
          <button
            type="button"
            ref={triggerRef}
            className="pln-nav__label"
            aria-haspopup="dialog"
            aria-expanded={pickerOpen}
            onClick={() => setPickerOpen((open) => !open)}
          >
            <Icon name="plan" size="compact" />
            <span>{dateLabel}</span>
            <span className="sr-only">. Choose a date</span>
          </button>
          {pickerOpen && (
            <>
              <button type="button" className="pln-nav__backdrop" tabIndex={-1} aria-hidden="true" onClick={() => closePicker(false)} />
              <PlanDatePicker
                selectedKey={anchorKey}
                todayKey={todayKey}
                examHues={examHues}
                highlightWeekOf={month ? undefined : anchorKey}
                onSelect={(key) => { onGo(key); closePicker() }}
                onClose={() => closePicker()}
              />
            </>
          )}
        </div>
        <button type="button" className="pln-nav__step" aria-label={`Next ${unit}`} onClick={() => onShift(1)}><Icon name="arrow-right" size="compact" /></button>
        {!atNow && <Button size="compact" variant="secondary" onClick={onToday}>{month ? 'This month' : 'This week'}</Button>}
      </div>
      <div className="plan-view-toolbar">
        <SegmentedControl label="Plan view">
          {(['day', 'week', 'month'] as PlanViewKey[]).map((item) => (
            <button key={item} type="button" className={view === item ? 'active' : ''} aria-pressed={view === item} onClick={() => { setPickerOpen(false); onView(item) }}>{viewLabels[item]}</button>
          ))}
        </SegmentedControl>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- Day strip */

export interface PlanStripProps {
  days: readonly PlanDay[]
  selectedKey: string
  onSelect: (key: string) => void
}

function dayDescription(day: PlanDay) {
  const parts = [day.today ? `Today, ${longDate(day.key)}` : longDate(day.key)]
  if (day.exams.length) parts.push(day.exams.length === 1 ? 'exam' : `${day.exams.length} exams`)
  if (day.studyCount) parts.push(day.allDone ? 'all done' : `${day.studyCount} ${day.studyCount === 1 ? 'session' : 'sessions'}`)
  else if (day.rest) parts.push('rest day')
  return parts.join(', ')
}

export function PlanDayStrip({ days, selectedKey, onSelect }: PlanStripProps) {
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const tabs = [...event.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]')]
    const index = tabs.indexOf(document.activeElement as HTMLElement)
    if (index < 0) return
    const target = event.key === 'ArrowRight' ? index + 1 : event.key === 'ArrowLeft' ? index - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null
    if (target === null) return
    event.preventDefault()
    const next = Math.max(0, Math.min(tabs.length - 1, target))
    tabs[next]?.focus()
    onSelect(days[next].key)
  }

  return (
    <div className="pln-strip" role="tablist" aria-label="Days of the week" onKeyDown={onKeyDown}>
      {days.map((day) => {
        const selected = day.key === selectedKey
        const exam = day.exams[0]
        return (
          <button
            key={day.key}
            type="button"
            role="tab"
            id={`pln-tab-${day.key}`}
            aria-selected={selected}
            aria-controls="pln-day-panel"
            aria-label={dayDescription(day)}
            tabIndex={selected ? 0 : -1}
            className="pln-tab"
            data-today={day.today || undefined}
            data-past={day.past || undefined}
            onClick={() => onSelect(day.key)}
          >
            <span className="pln-tab__name" aria-hidden="true">{day.today ? 'Today' : weekdayName(day.key)}</span>
            <span className="pln-tab__number" aria-hidden="true">{fromKey(day.key).getDate()}</span>
            <span className="pln-tab__marks" aria-hidden="true">
              {exam
                ? <span className="pln-tab__exam" style={{ background: `var(--subject-${exam.subject.hue})` }} />
                : day.allDone
                  ? <Icon name="check" size="inline" />
                  : day.items.map((item) => <span key={item.key} className="pln-dot" style={{ background: `var(--subject-${item.subject.hue})` }} />)}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ Rows */

export interface PlanRowActions {
  onStartSession: (session: PlannedSession) => void
  onStartSuggested: (item: PlanSuggestedItem) => void
  onStatus: (session: PlannedSession, status: PlannedSessionStatus) => void
  onMove: (session: PlannedSession, date: string) => Promise<boolean>
  onRemove: (session: PlannedSession) => void
}

function ExamRow({ item, day, todayKey }: { item: PlanExamItem; day: PlanDay; todayKey: string }) {
  const { hue, mark } = item.subject
  const days = daysFromToday(todayKey, day.key)
  return (
    <li className="pln-row pln-row--exam" style={{ background: `var(--subject-${hue})`, color: `var(--subject-${hue}-on)` }}>
      <SubjectBadge hue={hue} mark={mark} onSolid />
      <div className="pln-row__text">
        <span className="pln-row__title">{item.assessment.title}</span>
        <span className="pln-row__meta">{item.dayLabel}{day.past ? '' : ` · ${countdownWords(days)}`}</span>
      </div>
    </li>
  )
}

function SessionOptions({ item, todayKey, actions }: { item: PlanSessionItem; todayKey: string; actions: PlanRowActions }) {
  const { session } = item
  const [moveOpen, setMoveOpen] = useState(false)
  const [moveDate, setMoveDate] = useState('')
  return (
    <details className="pln-row__options">
      <summary>Options<span className="sr-only"> for {item.topic}</span></summary>
      <div className="pln-row__option-buttons">
        {!item.done && <Button size="compact" variant="secondary" onClick={() => actions.onStartSession(session)}>Start</Button>}
        {!item.done && <Button size="compact" variant="secondary" onClick={() => actions.onStatus(session, 'done')}>Mark done</Button>}
        {item.done && <Button size="compact" variant="secondary" onClick={() => actions.onStatus(session, 'planned')}>Put back on plan</Button>}
        <Button size="compact" variant="secondary" aria-expanded={moveOpen} onClick={() => { setMoveOpen((open) => !open); setMoveDate('') }}>Move it</Button>
        {!item.done && <Button size="compact" variant="secondary" onClick={() => actions.onStatus(session, 'skipped')}>Skip</Button>}
        <Button size="compact" variant="secondary" onClick={() => actions.onRemove(session)}>Remove</Button>
      </div>
      {moveOpen && (
        <div className="pln-row__move">
          <TextField label="Move to" type="date" min={todayKey} value={moveDate} onChange={(event) => setMoveDate(event.target.value)} />
          <Button size="compact" onClick={async () => { if (await actions.onMove(session, moveDate)) { setMoveOpen(false); setMoveDate('') } }}>Move</Button>
        </div>
      )}
    </details>
  )
}

export interface PlanRowProps {
  item: PlanItem
  day: PlanDay
  todayKey: string
  actions: PlanRowActions
  compact?: boolean
}

export function PlanRow({ item, day, todayKey, actions, compact = false }: PlanRowProps) {
  if (item.kind === 'exam') return <ExamRow item={item} day={day} todayKey={todayKey} />
  const { hue, mark, name } = item.subject
  const done = item.kind === 'session' && item.done
  const revPick = item.kind === 'session' && item.revPick
  const meta = `${item.activityLabel} · ${formatMinutes(item.minutes)}`
  let action: ReactNode = null
  if (done) action = <span className="pln-row__done"><Icon name="check" size="inline" />Done</span>
  else if (day.today && item.kind === 'session' && revPick) action = <Button onClick={() => actions.onStartSession(item.session)}>Continue<span className="sr-only"> {item.topic}</span></Button>
  else if (day.today && !compact) {
    action = <Button variant="secondary" onClick={() => (item.kind === 'session' ? actions.onStartSession(item.session) : actions.onStartSuggested(item))}>Start<span className="sr-only"> {item.topic}</span></Button>
  } else if (day.today && item.kind === 'suggested') {
    action = <Button variant="secondary" onClick={() => actions.onStartSuggested(item)}>Start<span className="sr-only"> {item.topic}</span></Button>
  }

  return (
    <li className={`pln-row${compact ? ' pln-row--compact' : ''}`} data-kind={item.kind} data-done={done || undefined}>
      <span className="pln-row__mark" data-done={done || undefined}><SubjectBadge hue={hue} mark={mark} /></span>
      <div className="pln-row__text">
        <span className="pln-row__heading">
          <span className="pln-row__title" data-done={done || undefined}>{name} · {item.topic}</span>
          {revPick && <Tag>REV pick</Tag>}
        </span>
        <span className="pln-row__meta">{meta}</span>
      </div>
      {action && <div className="pln-row__action">{action}</div>}
      {item.kind === 'session' && <SessionOptions item={item} todayKey={todayKey} actions={actions} />}
    </li>
  )
}

function EmptyDay({ day, compact = false }: { day: PlanDay; compact?: boolean }) {
  const text = day.rest ? 'Rest day. Nothing planned, on purpose.' : day.past ? 'Nothing was planned.' : 'Free. Nothing planned.'
  return <p className={`pln-empty${compact ? ' pln-empty--compact' : ''}`}>{text}</p>
}

/* ----------------------------------------------------------------- Views */

export interface PlanDayViewProps {
  days: readonly PlanDay[]
  selectedKey: string
  todayKey: string
  actions: PlanRowActions
  onSelect: (key: string) => void
}

export function PlanDayView({ days, selectedKey, todayKey, actions, onSelect }: PlanDayViewProps) {
  const day = days.find((item) => item.key === selectedKey) ?? days[0]
  return (
    <div className="pln-dayview">
      <PlanDayStrip days={days} selectedKey={day.key} onSelect={onSelect} />
      <div className="pln-daypanel" role="tabpanel" id="pln-day-panel" aria-labelledby={`pln-tab-${day.key}`}>
        <div className="pln-daypanel__head">
          <h2>{day.today ? 'Today' : `${weekdayName(day.key)} ${shortDate(day.key)}`}</h2>
          {day.plannedMinutes > 0 && <span>{formatMinutes(day.plannedMinutes)} planned</span>}
        </div>
        {day.items.length > 0
          ? <ul className="pln-list">{day.items.map((item) => <PlanRow key={item.key} item={item} day={day} todayKey={todayKey} actions={actions} />)}</ul>
          : <EmptyDay day={day} />}
      </div>
    </div>
  )
}

export interface PlanWeekViewProps {
  days: readonly PlanDay[]
  todayKey: string
  actions: PlanRowActions
  onOpenDay: (key: string) => void
}

export function PlanWeekView({ days, todayKey, actions, onOpenDay }: PlanWeekViewProps) {
  return (
    <div className="pln-weekview">
      {days.map((day) => (
        <section key={day.key} className="pln-weekgroup" aria-label={longDate(day.key)}>
          <button type="button" className="pln-weekgroup__day" data-today={day.today || undefined} data-past={day.past || undefined} aria-label={`Open ${longDate(day.key)}`} onClick={() => onOpenDay(day.key)}>
            <span className="pln-weekgroup__name">{day.today ? 'Today' : weekdayName(day.key)}</span>
            <span className="pln-weekgroup__number">{fromKey(day.key).getDate()}</span>
          </button>
          {day.items.length > 0
            ? <ul className="pln-list pln-list--week" data-today={day.today || undefined}>{day.items.map((item) => <PlanRow key={item.key} item={item} day={day} todayKey={todayKey} actions={actions} compact />)}</ul>
            : <EmptyDay day={day} compact />}
        </section>
      ))}
    </div>
  )
}

export interface PlanMonthViewProps {
  days: readonly PlanDay[]
  monthIndex: number
  onOpenDay: (key: string) => void
}

function cellDescription(day: PlanDay) {
  const parts = [day.today ? `Today, ${longDate(day.key)}` : longDate(day.key)]
  day.exams.forEach((exam) => parts.push(`${exam.subject.name} ${exam.noun}`))
  if (day.studyCount) parts.push(`${day.studyCount} ${day.studyCount === 1 ? 'session' : 'sessions'}${day.allDone ? ', all done' : ''}`)
  return parts.join(', ')
}

export function PlanMonthView({ days, monthIndex, onOpenDay }: PlanMonthViewProps) {
  const [focusKey, setFocusKey] = useState<string | null>(null)
  const firstInMonth = days.find((day) => fromKey(day.key).getMonth() === monthIndex)?.key ?? days[0].key
  const tabStop = focusKey && days.some((day) => day.key === focusKey) ? focusKey : (days.find((day) => day.today)?.key ?? firstInMonth)

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const cells = [...event.currentTarget.querySelectorAll<HTMLElement>('[data-cell]')]
    const index = cells.indexOf(document.activeElement as HTMLElement)
    if (index < 0) return
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowDown' ? 7 : event.key === 'ArrowUp' ? -7 : null
    const target = step !== null ? index + step : event.key === 'Home' ? index - (index % 7) : event.key === 'End' ? index - (index % 7) + 6 : null
    if (target === null) return
    event.preventDefault()
    const next = Math.max(0, Math.min(cells.length - 1, target))
    cells[next]?.focus()
  }

  return (
    <div className="pln-month" role="group" aria-label={`${monthName(firstInMonth)} calendar`} onKeyDown={onKeyDown}>
      {weekdayShort.map((name) => <span key={name} className="pln-month__weekday" aria-hidden="true"><span className="pln-month__weekday-long">{name}</span><span className="pln-month__weekday-short">{name[0]}</span></span>)}
      {days.map((day) => {
        const outside = fromKey(day.key).getMonth() !== monthIndex
        const exam = day.exams[0]
        return (
          <button
            key={day.key}
            type="button"
            data-cell=""
            className="pln-cell"
            data-today={day.today || undefined}
            data-past={day.past || undefined}
            data-outside={outside || undefined}
            data-exam={exam ? '' : undefined}
            style={exam ? { background: `var(--subject-${exam.subject.hue})`, color: `var(--subject-${exam.subject.hue}-on)` } : undefined}
            aria-label={cellDescription(day)}
            tabIndex={day.key === tabStop ? 0 : -1}
            onFocus={() => setFocusKey(day.key)}
            onClick={() => onOpenDay(day.key)}
          >
            <span className="pln-cell__number" aria-hidden="true">{fromKey(day.key).getDate()}</span>
            {exam
              ? <span className="pln-cell__exam" aria-hidden="true"><span className="pln-cell__exam-long">{exam.subject.mark} {exam.noun}</span><span className="pln-cell__exam-short">{exam.subject.mark}</span></span>
              : <span className="pln-cell__dots" aria-hidden="true">
                {day.items.map((item) => <span key={item.key} className="pln-dot" data-done={(item.kind === 'session' && item.done) || undefined} style={{ background: `var(--subject-${item.subject.hue})` }} />)}
              </span>}
          </button>
        )
      })}
    </div>
  )
}
