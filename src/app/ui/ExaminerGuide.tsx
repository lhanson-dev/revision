import { Icon } from './Icon'
import { classNames } from './classNames'

export interface ExaminerGuidePoint {
  id: string
  /** The point, taken from the approved mark scheme content. Never written by a model. */
  text: string
  /** True once the student's answer covers this point. */
  met: boolean
  /** Why it ticked: the part of the student's answer that covers it. Shown on request. */
  why?: string
}

export interface ExaminerGuideProps {
  points: readonly ExaminerGuidePoint[]
  /** Practice mode only. In a timed mock paper the guide is hidden. */
  mode: 'practice' | 'timed'
  className?: string
}

/**
 * "What examiners look for": a guide to strong answers, never a mark or predicted grade.
 * Points tick automatically as the answer covers them, and the student can see why each one ticked.
 * Hidden during timed mock papers. Stays behind a switch until the release gate passes (see STATUS.md).
 */
export function ExaminerGuide({ points, mode, className }: ExaminerGuideProps) {
  if (mode === 'timed') return null

  return (
    <section className={classNames('ui-examiner-guide', className)} aria-label="What examiners look for">
      <header className="ui-examiner-guide__head">
        <h3 className="ui-examiner-guide__title">What examiners look for</h3>
        <p className="ui-examiner-guide__note">A guide to strong answers, not a mark. Your teacher or the exam board decides marks.</p>
      </header>
      <ul className="ui-examiner-guide__points" aria-live="polite">
        {points.map((point) => (
          <li key={point.id} className={classNames('ui-examiner-guide__point', point.met && 'is-met')}>
            <Icon name={point.met ? 'status-gotit' : 'status-notstarted'} size="compact" />
            <div>
              <span>{point.text}<span className="ui-visually-hidden">{point.met ? ' (covered)' : ' (not covered yet)'}</span></span>
              {point.met && point.why && (
                <details className="ui-examiner-guide__why">
                  <summary>Why this ticked</summary>
                  <p>{point.why}</p>
                </details>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
