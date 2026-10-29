import type { PreparationProgramme } from '../engine/planning/preparation'
import { formatMinutes, monthName, weekRangeLabel } from './plan-dates'
import { Button, Surface } from './ui'

interface Props {
  programme: PreparationProgramme
  anchor: string
  courseLabel: (courseId: string) => string
  topicLabel: (courseId: string, topicId: string) => string
  onOpenWeek: (week: string) => void
}

/**
 * Read-only presentation of the SAME programme used by Today/Week/REV.
 * Future weekly objectives must not be represented as calendar appointments.
 */
export function PlanMonthPriorities({ programme, anchor, courseLabel, topicLabel, onOpenWeek }: Props) {
  const month = anchor.slice(0, 7)
  const weeks = programme.weeks.filter((week) =>
    week.visibleFrom.slice(0, 7) <= month && week.visibleUntil.slice(0, 7) >= month)
  const activeWeeks = weeks.filter((week) => week.objectives.length > 0)
  const total = activeWeeks.reduce((count, week) => count + week.objectives.length, 0)

  return (
    <Surface variant="quiet" className="pln-weekly-outlook pln-month-priorities"
      aria-label={`Preparation priorities for ${monthName(anchor)}`}>
      <h2>{monthName(anchor)} preparation priorities</h2>
      <p>
        {total} supported {total === 1 ? 'objective' : 'objectives'} currently allocated across
        {' '}{activeWeeks.length} {activeWeeks.length === 1 ? 'week' : 'weeks'}.
        These are provisional preparation goals, not booked sessions or evidence of mastery.
        Dated activities are recommended within the rolling two-week view.
      </p>
      {total ? <ol>
        {weeks.map((week) => <li key={week.weekStart}>
          <div><strong>{weekRangeLabel(week.weekStart)}</strong>
            {' '}— {formatMinutes(week.allocatedMinutes)} of supported objectives
            {week.availableMinutes === null ? ' (study time unknown)'
              : ` (of ${formatMinutes(week.availableMinutes)} available)`}
          </div>
          {week.objectives.length ? <ul>
            {week.objectives.map((objective) => <li key={objective.candidateId}>
              <strong>{courseLabel(objective.courseId)} — {topicLabel(objective.courseId, objective.topicId)}</strong>
              {' '}· {objective.purpose} · {formatMinutes(objective.estimatedMinutes)}
            </li>)}
          </ul> : <p>No supported objectives are currently allocated in this week; that does not mean preparation is complete.</p>}
          <Button variant="tertiary" size="compact" onClick={() => onOpenWeek(week.weekStart)}>
            View week
          </Button>
        </li>)}
      </ol> : <p>No supported preparation objectives have been allocated to this month. This does not mean the exams are prepared for. Explore the longer-term programme below to see any coverage or activity gaps.</p>}
    </Surface>
  )
}
