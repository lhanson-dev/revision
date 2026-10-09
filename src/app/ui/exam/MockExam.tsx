import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Icon, type IconName } from '../Icon'
import { classNames } from '../classNames'
import { stripLabel, stripSummary, type BriefModel } from '../../mock-exam'

/* Presentation only. The mock exam flow (src/app/MockExamFlow.tsx) owns the clock, the answers and the saving.
   Every number and sentence about the exam arrives as a prop; the questions and marks are the factory's, shown as they are. */

export interface MockTimerPillProps {
  /** `timed` shows the countdown; `untimed` shows a neutral "Untimed · n min in". */
  mode: 'timed' | 'untimed'
  label: string
  /** Timed only: `low` is the yellow tint for the last 5 minutes. It never flashes. */
  tone?: 'normal' | 'low'
}

/** The pill at the right of the bar. Always an icon plus words, in one row that never wraps mid-label. */
export function MockTimerPill({ mode, label, tone = 'normal' }: MockTimerPillProps) {
  return (
    <span className={classNames('mock-timer', mode === 'untimed' && 'mock-timer--untimed', mode === 'timed' && tone === 'low' && 'mock-timer--low')} role="timer" aria-live="off" aria-label={mode === 'timed' ? `Time left ${label}` : label}>
      <Icon name="clock" size="inline" />
      <span>{label}</span>
    </span>
  )
}

const ruleIcons: Record<BriefModel['rules'][number]['icon'], IconName> = { clock: 'clock', check: 'check', info: 'info', flag: 'flag', play: 'play' }

export interface MockBriefViewProps {
  model: BriefModel
  /** A saved attempt from earlier. It carries on untimed, which is said plainly. */
  saved?: { answered: number; total: number; wasTimed: boolean } | null
  onBegin: () => void
  onNotNow: () => void
  onCarryOn?: () => void
}

/** "Before you start": the rules as rows (icon tile, title, one line), a neutral chip, then Start and Not now. */
export function MockBriefView({ model, saved, onBegin, onNotNow, onCarryOn }: MockBriefViewProps) {
  const headingId = useId()
  return (
    <section className="mock-brief" aria-labelledby={headingId}>
      <header className="mock-brief__head">
        <p className="ui-eyebrow">Before you start</p>
        <h2 id={headingId} className="mock-brief__title">{model.heading}</h2>
      </header>
      {saved && onCarryOn && (
        <div className="mock-brief__saved">
          <span className="mock-brief__saved-text"><strong>You have a saved attempt.</strong> {saved.answered} of {saved.total} answered. {saved.wasTimed ? 'It was left while timed, so it carries on untimed and won’t count as a timed mock.' : 'Your saved answers are kept.'}</span>
          <button type="button" className="exam-button exam-button--secondary" onClick={onCarryOn}>Carry on</button>
        </div>
      )}
      <ul className="mock-brief__rules">
        {model.rules.map((rule) => (
          <li key={rule.id} className="mock-rule">
            <span className="mock-rule__tile" aria-hidden="true"><Icon name={ruleIcons[rule.icon]} size="compact" /></span>
            <span className="mock-rule__copy"><strong>{rule.title}</strong><span>{rule.line}</span></span>
          </li>
        ))}
      </ul>
      <span className="exam-chip mock-brief__counts">{model.counts}</span>
      <div className="mock-brief__actions">
        <button type="button" className="exam-button exam-button--primary mock-brief__begin" onClick={onBegin}>{saved ? 'Start again' : model.beginLabel}</button>
        <button type="button" className="mock-link" onClick={onNotNow}>Not now</button>
      </div>
    </section>
  )
}

export interface MockStripItem {
  id: string
  number: number
  answered: boolean
  flagged: boolean
  current: boolean
}

export interface MockStripProps {
  items: readonly MockStripItem[]
  answered: number
  flagged: number
  onGo: (index: number) => void
}

/** Question squares under the bar: 44px, answered = filled, current = teal ring, flagged = flag icon. Scrolls inside itself. */
export function MockStrip({ items, answered, flagged, onGo }: MockStripProps) {
  const currentRef = useRef<HTMLButtonElement>(null)
  const currentId = items.find((item) => item.current)?.id
  useEffect(() => {
    // Keep the current square in view inside the strip, without scrolling the page.
    const button = currentRef.current
    const strip = button?.parentElement
    if (button && strip && strip.scrollWidth > strip.clientWidth) strip.scrollLeft = button.offsetLeft - (strip.clientWidth - button.offsetWidth) / 2
  }, [currentId])
  return (
    <div className="mock-strip" role="group" aria-label="Questions">
      <div className="mock-strip__squares">
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={item.current ? currentRef : undefined}
            type="button"
            className={classNames('mock-strip__square', item.answered && 'is-answered', item.current && 'is-current')}
            aria-label={stripLabel(item)}
            aria-current={item.current ? 'true' : undefined}
            onClick={() => onGo(index)}
          >
            <span>{item.number}</span>
            {item.flagged && <Icon name="flag" size="inline" />}
          </button>
        ))}
      </div>
      <span className="mock-strip__note">{stripSummary(answered, items.length, flagged)}</span>
    </div>
  )
}

export interface MockLeavePanelProps {
  text: string
  onKeepGoing: () => void
  onSaveAndLeave: () => void
}

/** The inline yellow-tint panel the close button opens. Focus goes to "Keep going" so a stray key never leaves the mock. */
export function MockLeavePanel({ text, onKeepGoing, onSaveAndLeave }: MockLeavePanelProps) {
  const titleId = useId()
  const keepRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { keepRef.current?.focus() }, [])
  return (
    <div className="mock-leave" role="alertdialog" aria-labelledby={titleId} aria-describedby={`${titleId}-text`}>
      <span id={titleId} className="mock-leave__title"><Icon name="warning" size="compact" /><span>Leave this mock?</span></span>
      <span id={`${titleId}-text`} className="mock-leave__text">{text}</span>
      <div className="mock-leave__actions">
        <button ref={keepRef} type="button" className="exam-button exam-button--primary" onClick={onKeepGoing}>Keep going</button>
        <button type="button" className="exam-button exam-button--secondary" onClick={onSaveAndLeave}>Save and leave</button>
      </div>
    </div>
  )
}

export interface MockQuestionViewProps {
  number: number
  total: number
  marks: number
  /** "about 5 min": already worded. */
  minutesLabel: string
  /** The case study or source material, as it came from the paper. Null when the question has none. */
  caseBox: { title: string; body: ReactNode } | null
  /** Open on desktop and tablet; on a phone only for question 1. */
  caseOpen: boolean
  prompt: string
  kind: 'mcq' | 'written'
  options?: ReadonlyArray<{ label: string; text: string }>
  value: string
  onChange: (value: string) => void
  /** "12 words · saved" under a written answer. */
  savedNote: string
  /** For a section where the student chooses one question of two. */
  choice?: { group: string; selected: boolean; onSelect: () => void } | null
  flagged: boolean
  onToggleFlag: () => void
  onPrevious?: () => void
  onNext?: () => void
  onFinish?: () => void
  /** Why Finish is not available yet, in words (for example a choice still to make). */
  finishBlockedNote?: string | null
}

/** One question: meta row, case study, the prompt, the answer (options or a box) and the footer. No feedback ever appears here. */
export function MockQuestionView(props: MockQuestionViewProps) {
  const { number, total, marks, minutesLabel, caseBox, caseOpen, prompt, kind, options, value, onChange, savedNote, choice, flagged, onToggleFlag, onPrevious, onNext, onFinish, finishBlockedNote } = props
  const boxId = useId()
  const promptId = useId()
  return (
    <article className="mock-question practice-question" aria-labelledby={promptId}>
      <div className="mock-question__meta">
        <span className="ui-eyebrow">Question {number} of {total}</span>
        <span className="exam-chip">{marks} {marks === 1 ? 'mark' : 'marks'}</span>
        <span className="mock-question__time"><Icon name="clock" size="inline" /><span>{minutesLabel}</span></span>
      </div>
      {choice && (
        <label className="exam-choice-select">
          <input type="radio" name={choice.group} checked={choice.selected} onChange={choice.onSelect} />
          <span>Attempt this question for section {choice.group}</span>
        </label>
      )}
      {caseBox && (
        <details className="mock-case" key={`${number}-${caseBox.title}`} open={caseOpen}>
          <summary>{caseBox.title}</summary>
          <div className="mock-case__body">{caseBox.body}</div>
        </details>
      )}
      <h2 id={promptId} className="practice-question__prompt mock-question__prompt">{prompt}</h2>
      {kind === 'mcq' ? (
        <div className="practice-question__options" role="group" aria-label="Your answer">
          {options?.map((option) => {
            const picked = value === option.label
            return (
              <button key={option.label} type="button" className={classNames('ui-answer-option', picked && 'ui-answer-option--selected')} aria-pressed={picked} onClick={() => onChange(option.label)}>
                <span className="ui-answer-option__letter" aria-hidden="true">{option.label}</span>
                <span className="ui-answer-option__text">{option.text}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="practice-written">
          <label className="practice-written__label" htmlFor={boxId}>Your answer</label>
          <textarea id={boxId} className="practice-written__box" rows={marks >= 16 ? 14 : marks >= 6 ? 9 : 5} value={value} onChange={(event) => onChange(event.target.value)} placeholder="Write as you would in the exam." />
          <p className="mock-question__saved" aria-live="off">{savedNote}</p>
        </div>
      )}
      <div className="mock-question__footer">
        <button type="button" className={classNames('mock-flag', flagged && 'is-on')} aria-pressed={flagged} onClick={onToggleFlag}>
          <Icon name="flag" size="inline" />
          <span>{flagged ? 'Flagged' : 'Flag to check'}</span>
        </button>
        <span className="mock-question__nav">
          {onPrevious && <button type="button" className="exam-button exam-button--secondary" onClick={onPrevious}>Previous</button>}
          {onNext && <button type="button" className="exam-button exam-button--primary" onClick={onNext}>Next question</button>}
          {onFinish && <button type="button" className="exam-button exam-button--primary" disabled={Boolean(finishBlockedNote)} onClick={onFinish}>Finish</button>}
        </span>
      </div>
      {finishBlockedNote && <p className="mock-question__blocked">{finishBlockedNote}</p>}
    </article>
  )
}
