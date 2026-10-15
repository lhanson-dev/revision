import type { ProgrammeFirstDecision, ProgrammeDecisionWeek, PreparationObjective, PreparationPhase } from '../engine/planning/programme-first'
import { formatMinutes, longDate, weekRangeLabel } from './plan-dates'
import { Button, Surface } from './ui'

interface Props {
  programme: ProgrammeFirstDecision
  courseLabel: (courseId: string) => string
  topicLabel: (courseId: string, topicId: string) => string
  onOpenWeek: (weekStart: string) => void
}

function dated(key: string) {
  return `${longDate(key)} ${key.slice(0, 4)}`
}

function phaseLabel(phase: PreparationPhase) {
  if (phase === 'build') return 'Establish knowledge and identify gaps'
  if (phase === 'consolidate') return 'Consolidate and check understanding'
  return 'Prepare for the exam demands'
}

function treatmentLabel(objective: PreparationObjective) {
  if (objective.treatment === 'authentic-exam-practice') return 'Practise a supported exam question'
  if (objective.treatment === 'repair-and-check') return 'Work on an evidenced gap and check understanding'
  if (objective.treatment === 'retrieve-and-check') return 'Retrieve and apply the knowledge'
  return 'Establish your starting understanding'
}

function WeekObjectives({ week, courseLabel, topicLabel }: {
  week: ProgrammeDecisionWeek
  courseLabel: Props['courseLabel']
  topicLabel: Props['topicLabel']
}) {
  if (!week.objectives.length) return (
    <p>{week.capacityMinutes === 0 ? 'No revision time saved for this week.' :
      'No specific preparation objective allocated to this week yet. This does not mean all requirements are covered.'}</p>
  )
  return (
    <ul aria-label={`Preparation objectives for week of ${dated(week.weekStart)}`}>
      {week.objectives.map((obj) => (
        <li key={obj.obligationId}>
          <strong>{courseLabel(obj.courseId)} — {topicLabel(obj.courseId, obj.topicId)}</strong>
          <span> · {treatmentLabel(obj)} · {formatMinutes(obj.minutes)} opportunity</span>
          <p>{obj.reason}</p>
        </li>
      ))}
    </ul>
  )
}

function WeekOverview({ week, courseLabel, topicLabel, onOpenWeek }: Omit<Props, 'programme'> & {
  week: ProgrammeDecisionWeek
}) {
  return (
    <li className="pln-programme__week">
      <div>
        <strong>{weekRangeLabel(week.weekStart)} {week.visibleUntil.slice(0, 4)}</strong>
        <p>{phaseLabel(week.phase)} · {week.capacityMinutes === null ? 'Capacity not confirmed' :
          `${formatMinutes(week.proposedMinutes)} proposed of ${formatMinutes(week.capacityMinutes)} known time`}</p>
        <WeekObjectives week={week} courseLabel={courseLabel} topicLabel={topicLabel} />
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

/** Context for Month and Week, from the same decision that selects today's work. */
export function PlanPeriodObjectives({ programme, courseLabel, topicLabel, from, until, scope }: {
  programme: ProgrammeFirstDecision
  courseLabel: Props['courseLabel']
  topicLabel: Props['topicLabel']
  from: string
  until: string
  scope: 'week' | 'month'
}) {
  const shown = programme.weeks.filter((week) => week.visibleFrom <= until && week.visibleUntil >= from)
  const allocated = shown.filter((week) => week.objectives.length > 0)
  const heading = scope === 'month' ? 'This month’s preparation objectives' : 'This week’s preparation objectives'
  return (
    <section className="pln-programme__period" aria-label={heading}>
      <h2>{heading}</h2>
      {!programme.finalKnownAssessment
        ? <p>Add a known exam date to develop your full programme. Supported practice remains available now.</p>
        : <>
          {allocated.length ? (
            <ol>
              {allocated.map((week) => (
                <li key={week.weekStart}>
                  <strong>{weekRangeLabel(week.weekStart)}</strong>
                  <WeekObjectives week={week} courseLabel={courseLabel} topicLabel={topicLabel}/>
                </li>
              ))}
            </ol>
          ) : (
            <p>No specific objectives are allocated in this period. That does not mean you have finished preparing.
              Check the complete programme and your known assessment dates.</p>
          )}
          {shown.some((week) => week.milestones.length > 0) && (
            <p>Known exam milestones: {shown.flatMap((week) => week.milestones.map((m) => `${m.title} (${dated(m.date)})`)).join(' · ')}</p>
          )}
        </>}
    </section>
  )
}

/** One read-only, full-horizon exam-backwards decision; never booked sessions. */
export function PlanProgrammeOutlook({ programme, courseLabel, topicLabel, onOpenWeek }: Props) {
  const final = programme.finalKnownAssessment
  const preview = programme.weeks.slice(0, 3)
  const omitted = programme.unserved.length
  return (
    <section className="pln-programme" aria-label="Your full exam programme">
      <Surface variant="quiet" className="pln-programme__surface">
        <h2>Your programme to your exams</h2>
        {!final
          ? <p>Add known exam dates to see a full exam-backwards programme. Revision will not guess dates.</p>
          : <>
            <p>Preparation objectives through <strong>{dated(final)}</strong>, covering your selected
              courses, supported work, evidence gaps and available time. These are provisional
              opportunities, not booked sessions, not a fixed weekly allocation, and not a prediction of exam results.</p>
            {omitted > 0 && <p className="pln-card__note">{omitted} preparation {omitted === 1 ? 'requirement has' : 'requirements have'}
              not yet been allocated to a known available slot. This is a capacity or evidence limitation,
              not a judgement of your ability.</p>}
            <h3>Coming up</h3>
            <ol className="pln-programme__weeks">
              {preview.map((week) => (
                <WeekOverview key={week.weekStart} week={week} courseLabel={courseLabel}
                  topicLabel={topicLabel} onOpenWeek={onOpenWeek}/>
              ))}
            </ol>
            {programme.weeks.length > 3 && (
              <details className="pln-programme__details">
                <summary>Explore all {programme.weeks.length} weeks and exam milestones</summary>
                <ol className="pln-programme__weeks">
                  {programme.weeks.map((week) => (
                    <WeekOverview key={week.weekStart} week={week} courseLabel={courseLabel}
                      topicLabel={topicLabel} onOpenWeek={onOpenWeek}/>
                  ))}
                </ol>
              </details>
            )}
            <p className="pln-card__note">Distant capacity may not yet include saved sessions outside the
              bounded booking window. Priorities are recalculated when your evidence, availability
              or exam dates change; seeing an objective never counts as completing it.</p>
          </>}
      </Surface>
    </section>
  )
}
