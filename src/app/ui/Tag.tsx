import type { HTMLAttributes } from 'react'
import { classNames } from './classNames'

export type TagProps = HTMLAttributes<HTMLSpanElement>

/** A small teal label on a row, for example "REV pick". Teal means brand and REV; it never carries a status. */
export function Tag({ className, ...props }: TagProps) {
  return <span className={classNames('ui-tag', className)} {...props} />
}
