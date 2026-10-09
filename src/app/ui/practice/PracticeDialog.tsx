import type { CSSProperties, ReactNode } from 'react'
import { Icon } from '../Icon'
import { ModalShell } from '../overlays'
import { StatusBadge } from '../StatusBadge'
import type { LearningStatus } from '../learning-status'
import { classNames } from '../classNames'

export interface PracticeDialogProps {
  /** Accessible name for the dialog, e.g. "Practice: Break-even, questions". */
  label: string
  /** Subject letter mark, always shown beside the close button. */
  subjectMark: string
  /** `--accent*` variables for the subject hue (see `accentStyle` in the Learn components). */
  accentStyle: CSSProperties
  /** Esc and the close button both call this. Closing never discards a saved answer. */
  onClose: () => void
  /** The activity's own bar content: a progress strip for questions, or a title for a warm-up. */
  bar: ReactNode
  children: ReactNode
  /** Pinned under the body, e.g. the feedback bar. */
  footer?: ReactNode
  className?: string
  /** A second row inside the bar, under the close button and title: the mock exam's question strip. */
  barExtra?: ReactNode
  /** Accessible name of the close button. Defaults to "Close practice". */
  closeLabel?: string
  /** Accessible name of the scrolling body. Defaults to "Practice content". */
  contentLabel?: string
}

/**
 * Every Practice exercise opens in this pop-up (v2.2). It is a real dialog: focus is trapped, Esc and the
 * close button leave it, and focus goes back to the button that opened it (the shared overlay contract).
 * On desktop and tablet it floats over the dimmed page; on a phone it is a full-height sheet.
 */
export function PracticeDialog({ label, subjectMark, accentStyle, onClose, bar, children, footer, className, barExtra, closeLabel = 'Close practice', contentLabel = 'Practice content' }: PracticeDialogProps) {
  return (
    <div className="practice-overlay" style={accentStyle}>
      <ModalShell className={classNames('practice-dialog', className)} label={label} onDismiss={onClose}>
        <div className="practice-dialog__bar">
          <div className="practice-dialog__bar-inner">
            <button type="button" className="practice-dialog__close" aria-label={closeLabel} onClick={onClose}>
              <Icon name="close" size="standard" />
            </button>
            <span className="practice-dialog__mark" aria-hidden="true">{subjectMark}</span>
            {bar}
          </div>
          {barExtra}
        </div>
        <div className="practice-dialog__body" tabIndex={0} role="region" aria-label={contentLabel}>
          <div className="practice-dialog__column">{children}</div>
        </div>
        {footer}
      </ModalShell>
    </div>
  )
}

export interface PracticeBarTitleProps {
  title: string
  detail?: string
}

/** The bar content for a warm-up: "{topic} · Warm-up · Flashcards" style title and an optional line under it. */
export function PracticeBarTitle({ title, detail }: PracticeBarTitleProps) {
  return (
    <div className="practice-bar-title">
      <span className="practice-bar-title__main">{title}</span>
      {detail && <span className="practice-bar-title__detail">{detail}</span>}
    </div>
  )
}

export interface PracticeProgressBarProps {
  /** Number of questions in the session; one segment each. */
  total: number
  /** How many are finished. The segment after them is the current one. */
  done: number
  topicName: string
  status?: LearningStatus
  /** For one question after the topic's status changes. */
  move?: 'up' | 'down' | null
}

/** The questions bar: a segmented strip, "{n} of {total}", the topic name and its live status. */
export function PracticeProgressBar({ total, done, topicName, status, move }: PracticeProgressBarProps) {
  const current = Math.min(done + 1, total)
  return (
    <>
      <div className="practice-progress">
        <div className="practice-progress__strip" aria-hidden="true">
          {Array.from({ length: total }, (_, index) => (
            <span key={index} className="practice-progress__segment" data-state={index < done ? 'done' : index === done ? 'current' : 'todo'} />
          ))}
        </div>
        <span className="practice-progress__count">{current} of {total}</span>
      </div>
      <div className="practice-progress__topic">
        <span className="practice-progress__topic-name">{topicName}</span>
        {status && <StatusBadge status={status} size="sm" />}
        {move && <span className="practice-progress__move" role="status">{move === 'up' ? '▲ up' : '▼ down'}</span>}
      </div>
    </>
  )
}

/** The neutral chip that says a warm-up does not count towards Exam readiness. */
export function WarmupChip() {
  return <span className="practice-chip">Warm-up · doesn’t count towards Exam readiness</span>
}
