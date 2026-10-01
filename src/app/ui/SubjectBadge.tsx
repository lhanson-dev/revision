import { classNames } from './classNames'
import type { SubjectHue } from '../subject-palette'

export interface SubjectBadgeProps {
  hue: SubjectHue
  /** The subject's letter mark, from the catalogue (`subjects.mark`). */
  mark: string
  /** tile 40px · plan 26px · panel 56px */
  size?: 'tile' | 'plan' | 'panel'
  /** Use inside a solid-hue block (Plan sessions): white square with ink letter so the mark stays visible. */
  onSolid?: boolean
  className?: string
}

/**
 * The subject icon: a letter mark on a rounded square, like a periodic-table element.
 * Decorative: the subject name always sits beside it and carries the meaning, so it is hidden from screen readers.
 */
export function SubjectBadge({ hue, mark, size = 'tile', onSolid = false, className }: SubjectBadgeProps) {
  return (
    <span
      aria-hidden="true"
      className={classNames('ui-subject-badge', `ui-subject-badge--${size}`, onSolid && 'ui-subject-badge--on-solid', className)}
      style={
        onSolid
          ? { color: `var(--subject-${hue}-ink)` }
          : { background: `var(--subject-${hue})`, color: `var(--subject-${hue}-on)` }
      }
    >
      {mark}
    </span>
  )
}
