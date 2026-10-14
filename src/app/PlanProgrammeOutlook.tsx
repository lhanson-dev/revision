import type { FocusedPlannerProgramme, ProgrammeFocusWeek } from '../engine/planning/weekly-focus'
import { formatMinutes, longDate, weekRangeLabel } from './plan-dates'
import { Button, Surface } from './ui'

interface Props {
  programme: FocusedPlannerProgramme
  courseLabel: (courseId: string) => string
  topicLabel: (courseId: string, topicId: string) => string
  onOpenWeek: (weekStart: string) => void
}

function dated(key: string) {
  return `${longDate(key)} ${key.slice(0, 4)}`
}

function activityHint(kind: string) {
  if (kind === 'quick-check') return 'Quick check'
  if (kind === 'flashcards') return 'Flashcards'
  if (kind === 'exam-question') return 'Exam question practice'
  if (kind === 'learn') return 'Learn'
  return 'Supported study'
}

function weeklyTime(week: ProgrammeFocusWeek) {
  if (week.availableMinutes === null) return 'Study time not set'
  if (week.availableMinutes === 0) return 'No study time available in your settings'
  return `${formatMinutes(week.availableMinutes)} available in your settings`
}

function WeekOverview({ week, courseLabel, topicLabel, onOpenWeek }: Omit<Props, 'programme'> & { week: ProgrammeFocusWeek }) {
  return (
    <li className="pln-programme__week">
      <div>
        <strong>{weekRangeLabel(week.weekStart)} {week.visibleUntil.slice(0, 4)}</strong>
        <p>{weeklyTime(week)}</p>
        {week.topicFocus.length ? (
          <>
            <p><strong>Topics to focus on</strong></p>
            <ul aria-label={`Study topics for week of ${dated(week.weekStart)}`}>
              {week.topicFocus.map((focus) => (
                <li key={`${focus.courseId}:${focus.topicId}`}>
                  {courseLabel(focus.courseId)} — {topicLabel(focus.courseId, focus.topicId)} · {activityHint(focus.activityType)}
                  {focus.revisit ? ' (revisit opportunity)' : ''}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>{week.availableMinutes === 0
            ? 'No study topics proposed while this week has no saved availability.'
            : week.supportedCourseIds.length
              ? 'No supported topic fits the study time currently set for this week.'
              : 'No supported study topic can be identified for this week. This does not mean the course is complete.'}</p>
        )}
        {week.milestones.length > 0 && (
          <ul aria-label="Exams and assessments this week">
            {week.milestones.map((milestone) => (
              <li key={milestone.assessmentId}>{milestone.title} · {courseLabel(milestone.courseId)} · {dated(milestone.date)}</li>
            ))}
          </ul>
        )}
      </div>
      <Button variant="tertiary" size="compact" onClick={() => onOpenWeek(week.weekStart)}>
        View week<span className="sr-only"> of {dated(week.weekStart)}</span>
      </Button>
    </li>
  )
}

/** Read-only full-horizon topical outlook, not a dated task calendar. */
export function PlanProgrammeOutlook({ programme, courseLabel, topicLabel, onOpenWeek }: Props) {
  const final = programme.finalKnownAssessment
  const previewWeeks = programme.weeks.slice(0, 3)
  return (
    <section className="pln-programme" aria-label="Your full exam programme">
      <Surface variant="quiet" className="pln-programme__surface">
        <h2>Your programme to your exams</h2>
        {!final
          ? <p>Add known exam dates to see a longer-term programme. Revision will not guess when your final paper is.</p>
          : (
            <>
              <p>Weekly topic priorities through <strong>{dated(final)}</strong>, across {programme.weeks.length} calendar weeks. These are provisional topics drawn from your selected courses and supported learning activities, not booked sessions and not a fixed weekly allocation. REV will adapt them as your progress and exam dates change.</p>
              <p className="pln-card__note">Study time is based on your saved availability before any distant accepted commitments. Use Day/Week for your near-term activities.</p>
              <h3>Coming up</h3>
              <ol className="pln-programme__weeks">
                {previewWeeks.map((week) => (
                  <WeekOverview key={week.weekStart} week={week} courseLabel={courseLabel} topicLabel={topicLabel} onOpenWeek={onOpenWeek} />
                ))}
              </ol>
              {programme.weeks.length > 3 && (
                <details className="pln-programme__details">
                  <summary>Explore all {programme.weeks.length} weeks and exam milestones</summary>
                  <ol className="pln-programme__weeks">
                    {programme.weeks.map((week) => (
                      <WeekOverview key={week.weekStart} week={week} courseLabel={courseLabel} topicLabel={topicLabel} onOpenWeek={onOpenWeek} />
                    ))}
                  </ol>
                </details>
              )}
              <p className="pln-card__note">A future topic focus is not an assigned task, a learning result, a promise that all content fits or proof of readiness. You can change your study choices.</p>
            </>
          )}
      </Surface>
    </section>
  )
}
