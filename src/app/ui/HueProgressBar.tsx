import { classNames } from './classNames'
import type { SubjectHue } from '../subject-palette'

export interface HueProgressBarProps {
  /** 0 to 100. */
  value: number
  /** Subject hue for subject bars; `brand` for the teal brand bar (for example the week's study time). */
  hue?: SubjectHue | 'brand'
  size?: 'sm' | 'md'
  /** Names what is being measured, for screen readers. */
  label: string
  /** Text shown beside the bar. Leave out to show only the bar. */
  valueText?: string
  className?: string
}

/** A progress bar in a subject hue. Used for Topics covered. It is not a status, so it never uses a status colour. */
export function HueProgressBar({ value, hue = 'brand', size = 'md', label, valueText, className }: HueProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className={classNames('ui-hue-bar', size === 'sm' && 'ui-hue-bar--sm', className)}>
      <div
        className="ui-hue-bar__track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped)}
        aria-valuetext={valueText}
      >
        <div
          className="ui-hue-bar__fill"
          style={{ width: `${clamped}%`, background: hue === 'brand' ? 'var(--rv-teal)' : `var(--subject-${hue})` }}
        />
      </div>
      {valueText && <span className="ui-hue-bar__text">{valueText}</span>}
    </div>
  )
}
