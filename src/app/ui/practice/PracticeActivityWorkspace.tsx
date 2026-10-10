import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { Icon } from '../Icon'
import { StatusBadge } from '../StatusBadge'
import type { LearningStatus } from '../learning-status'

export interface PracticeActivityWorkspaceProps {
  /** Accessible label for the current Practice activity. */
  label: string
  subjectMark: string
  accentStyle: CSSProperties
  /** Return to setup without discarding saved evidence or session state. */
  onClose: () => void
  bar: ReactNode
  children: ReactNode
  /** Feedback follows the task in normal page flow, not in a modal footer. */
  footer?: ReactNode
}

/** A real page-level work area. No scrim, focus trap, viewport locking or dialog semantics. */
export function PracticeActivityWorkspace({ label, subjectMark, accentStyle, onClose, bar, children, footer }: PracticeActivityWorkspaceProps) {
  const backButton = useRef<HTMLButtonElement>(null)
  useEffect(() => { backButton.current?.focus() }, [])

  return (
    <section className="practice-activity" role="region" aria-label={label} style={accentStyle}>
      <header className="practice-activity__bar">
        <div className="practice-activity__bar-inner">
          <button ref={backButton} type="button" className="practice-activity__close" aria-label="Back to practice" onClick={onClose}>
            <Icon name="arrow-right" size="standard" />
          </button>
          <span className="practice-activity__mark" aria-hidden="true">{subjectMark}</span>
          {bar}
        </div>
      </header>
      <div className="practice-activity__body" role="group" aria-label="Practice content">
        <div className="practice-activity__column">{children}</div>
      </div>
      {footer && <div className="practice-activity__footer">{footer}</div>}
    </section>
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
