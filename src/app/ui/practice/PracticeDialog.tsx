import type { CSSProperties, ReactNode } from 'react'
import { Icon } from '../Icon'
import { ModalShell } from '../overlays'
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
}

/**
 * Transitional Exam Prep-only shell: ExamPrepSection still uses this for its mock activity.
 * Do not use this shell for Practice. Retire it with the bounded Exam Prep/Simulator redesign.
 */
export function PracticeDialog({ label, subjectMark, accentStyle, onClose, bar, children, footer, className }: PracticeDialogProps) {
  return (
    <div className="practice-overlay" style={accentStyle}>
      <ModalShell className={classNames('practice-dialog', className)} label={label} onDismiss={onClose}>
        <div className="practice-dialog__bar">
          <div className="practice-dialog__bar-inner">
            <button type="button" className="practice-dialog__close" aria-label="Close practice" onClick={onClose}>
              <Icon name="close" size="standard" />
            </button>
            <span className="practice-dialog__mark" aria-hidden="true">{subjectMark}</span>
            {bar}
          </div>
        </div>
        <div className="practice-dialog__body" tabIndex={0} role="region" aria-label="Practice content">
          <div className="practice-dialog__column">{children}</div>
        </div>
        {footer}
      </ModalShell>
    </div>
  )
}

