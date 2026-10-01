import { Icon } from './Icon'
import { classNames } from './classNames'
import { learningStatusMeta, learningStatusOrder, type LearningStatus } from './learning-status'

export interface UnderstandingBarProps {
  /** How many topics are in each status. Statuses with none are left out. */
  counts: Partial<Record<LearningStatus, number>>
  /** Show the text labels under the bar. They carry the meaning, so keep them unless space is very tight. */
  labels?: boolean
  size?: 'sm' | 'md'
  className?: string
}

/** Understanding: a stacked bar with text labels, e.g. "1 got it · 2 nearly there · 6 not started". */
export function UnderstandingBar({ counts, labels = true, size = 'md', className }: UnderstandingBarProps) {
  const items = learningStatusOrder
    .map((status) => [status, counts[status] ?? 0] as const)
    .filter(([, count]) => count > 0)
  const summary = items.map(([status, count]) => `${count} ${learningStatusMeta[status].label.toLowerCase()}`).join(' · ')

  return (
    <div className={classNames('ui-understanding', size === 'sm' && 'ui-understanding--sm', className)}>
      <div className="ui-understanding__bar" role="img" aria-label={`Understanding: ${summary || 'no topics yet'}`}>
        {items.map(([status, count]) => (
          <i key={status} className={`ui-understanding__segment ui-understanding__segment--${status}`} style={{ flexGrow: count }} />
        ))}
      </div>
      {labels && items.length > 0 && (
        <ul className="ui-understanding__labels">
          {items.map(([status, count]) => (
            <li key={status} className={`ui-understanding__label ui-understanding__label--${status}`}>
              <Icon name={learningStatusMeta[status].icon} size="inline" />
              <b>{count}</b> {learningStatusMeta[status].label.toLowerCase()}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
