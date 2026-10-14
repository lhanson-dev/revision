import type { PlannerProgramme, ProgrammeWeek } from '../engine/planning/programme'
import { formatMinutes, longDate, weekRangeLabel } from './plan-dates'
import type { RevisionAvailabilityException, RevisionWeeklyAvailability } from '../services/planning/planner-service'
import { knownProgrammeWeekMinutes } from './plan-weekly-capacity'
import { Button, Surface } from './ui'

interface Props {
  programme: PlannerProgramme
  courseLabel: (courseId: string) => string
  onOpenWeek: (weekStart: string) => void
  weeklyAvailability: RevisionWeeklyAvailability | null
  availabilityExceptions: readonly RevisionAvailabilityException[]
}

function dated(key: string) {
  return `${longDate(key)} ${key.slice(0, 4)}`
}

function weekFocus(week: ProgrammeWeek, courseLabel: Props['courseLabel']) {
  if (!week.supportedCourseIds.length) return 'No supported preparation activity identified yet. This does not mean the course is complete.'
  return week.supportedCourseIds.map(courseLabel).join(' · ')
}

function capacityExplanation(week: ProgrammeWeek, weekly: RevisionWeeklyAvailability | null, exceptions: readonly RevisionAvailabilityException[]) {
  const minutes = knownProgrammeWeekMinutes(week, weekly, exceptions)
  if (minutes === null) return 'Weekly study availability is unknown; Revision cannot yet say how much time may fit.'
  if (minutes === 0) return 'No study time is currently available in your settings for these dates; preparation opportunities are not booked work.'
  return `Study time in current availability settings: ${formatMinutes(minutes)} for these dates, before any accepted commitments. This is not a booking.`
}

/** A factual full-horizon overview, not an appointment calendar or predicted attainment. */
export function PlanProgrammeOutlook({ programme, courseLabel, onOpenWeek, weeklyAvailability, availabilityExceptions }: Props) {
  const final = programme.finalKnownAssessment
  return (
    <section className="pln-programme" aria-label="Your full exam programme">
      <Surface variant="quiet" className="pln-programme__surface">
        <h2>Your programme to your exams</h2>
        {!final
          ? <p>Add known exam dates to see your longer-term programme. Revision will not guess when your final paper is.</p>
          : (
            <>
              <p>Planned outlook through <strong>{dated(final)}</strong>, across {programme.weeks.length} calendar weeks. Dates shown are real saved assessment dates; future course focuses are possibilities, not booked sessions.</p>
              <details className="pln-programme__details">
                <summary>Explore all {programme.weeks.length} weeks and exam milestones</summary>
                <ol className="pln-programme__weeks">
                  {programme.weeks.map((week) => (
                    <li key={week.weekStart} className="pln-programme__week">
                      <div>
                        <strong>{weekRangeLabel(week.weekStart)} {week.visibleUntil.slice(0, 4)}</strong>
                        <p>Preparation opportunities: {weekFocus(week, courseLabel)}</p>
                        <p>{capacityExplanation(week, weeklyAvailability, availabilityExceptions)}</p>
                        {week.milestones.length > 0 && (
                          <ul aria-label="Exams and assessments this week">
                            {week.milestones.map((milestone) => (
                              <li key={milestone.assessmentId}>{milestone.title} · {courseLabel(milestone.courseId)} · {dated(milestone.date)}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <Button variant="tertiary" size="compact" onClick={() => onOpenWeek(week.weekStart)}>View week<span className="sr-only"> of {dated(week.weekStart)}</span></Button>
                    </li>
                  ))}
                </ol>
              </details>
              <p className="pln-card__note">This is a changing study outlook, not a timetable. Specific recommendations and available time are considered only in the near-term plan. Missing evidence does not mean you have mastered a course.</p>
            </>
          )}
      </Surface>
    </section>
  )
}
