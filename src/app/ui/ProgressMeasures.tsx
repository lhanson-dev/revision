import { useId } from 'react'
import { Icon } from './Icon'
import { HueProgressBar } from './HueProgressBar'
import { UnderstandingBar } from './UnderstandingBar'
import { classNames } from './classNames'
import type { LearningStatus } from './learning-status'
import type { SubjectHue } from '../subject-palette'

export interface ProgressMeasuresProps {
  hue?: SubjectHue | 'brand'
  /** Topics the student has covered, and the topics in the course. Both come from real data. */
  covered: number
  total: number
  understanding: Partial<Record<LearningStatus, number>>
  /** An engine-produced readiness value, or leave out for "Not enough evidence yet". No predicted grade. */
  readiness?: string | null
  /** Plain words on what would unlock readiness, or how it was worked out. */
  readinessNote?: string
  /** Stack the three measures in one column. */
  stack?: boolean
  className?: string
}

/**
 * The three progress measures, side by side and never blended into one percentage:
 * Topics covered, Understanding, Exam readiness.
 */
export function ProgressMeasures({ hue = 'brand', covered, total, understanding, readiness, readinessNote, stack = false, className }: ProgressMeasuresProps) {
  const id = useId()
  return (
    <div className={classNames('ui-progress-measures', stack && 'ui-progress-measures--stack', className)}>
      <section className="ui-progress-measure" aria-labelledby={`${id}-covered`}>
        <h3 className="ui-eyebrow" id={`${id}-covered`}>Topics covered</h3>
        <p className="ui-progress-measure__stat">
          <span className="ui-progress-measure__number">{covered}</span>
          <span className="ui-progress-measure__of">of {total}</span>
        </p>
        <HueProgressBar value={total > 0 ? (covered / total) * 100 : 0} hue={hue} size="sm" label="Topics covered" valueText={`${covered} of ${total} topics`} className="ui-progress-measure__bar" />
      </section>
      <section className="ui-progress-measure" aria-labelledby={`${id}-understanding`}>
        <h3 className="ui-eyebrow" id={`${id}-understanding`}>Understanding</h3>
        <UnderstandingBar counts={understanding} />
      </section>
      <section className="ui-progress-measure" aria-labelledby={`${id}-readiness`}>
        <h3 className="ui-eyebrow" id={`${id}-readiness`}>Exam readiness</h3>
        {readiness ? (
          <p className="ui-progress-measure__readiness">{readiness}</p>
        ) : (
          <p className="ui-progress-measure__no-evidence"><Icon name="status-started" size="compact" />Not enough evidence yet</p>
        )}
        {readinessNote && <p className="ui-progress-measure__note">{readinessNote}</p>}
      </section>
    </div>
  )
}
