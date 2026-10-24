import { daysBetween, formatMinutes, fromKey, shortDateWithYear, weekdayName, weekdayShort } from './plan-dates'
import type { PlanSubject } from './plan-model'
import { Button, Icon, SubjectBadge } from './ui'
import type { RevisionAssessment, RevisionDayOfWeek, RevisionWeeklyAvailability } from '../services/planning/planner-service'

const STEP_MINUTES = 15
const MAX_DAY_MINUTES = 240
/** A day at or above this fills its bar. */
const BAR_FULL_MINUTES = 120

/* -------------------------------------------------------------- Your exams */

export interface PlanExamEntry {
  assessment: RevisionAssessment
  subject: PlanSubject
}

export interface PlanExamsCardProps {
  /** Upcoming only, soonest first. */
  exams: readonly PlanExamEntry[]
  todayKey: string
  onJump: (dateKey: string) => void
  onAdd: () => void
}

export function PlanExamsCard({ exams, todayKey, onJump, onAdd }: PlanExamsCardProps) {
  const [next, ...rest] = exams
  const daysTo = (key: string) => Math.max(0, Math.round((fromKey(key).getTime() - fromKey(todayKey).getTime()) / 86_400_000))
  return (
    <section className="pln-card" aria-labelledby="pln-exams-title">
      <h2 className="pln-eyebrow" id="pln-exams-title">Your exams</h2>
      {next
        ? (
          <button
            type="button"
            className="pln-next-exam"
            style={{ background: `var(--subject-${next.subject.hue})`, color: `var(--subject-${next.subject.hue}-on)` }}
            onClick={() => onJump(next.assessment.assessmentDate)}
          >
            <span className="pln-next-exam__count">
              <strong>{daysTo(next.assessment.assessmentDate)}</strong>
              <span>{daysTo(next.assessment.assessmentDate) === 1 ? 'day' : 'days'}</span>
            </span>
            <span className="pln-next-exam__text">
              <span className="pln-next-exam__kicker">Next up</span>
              <span className="pln-next-exam__title">{next.assessment.title}</span>
              <span className="pln-next-exam__date">{weekdayName(next.assessment.assessmentDate)} {shortDateWithYear(next.assessment.assessmentDate, todayKey)}</span>
            </span>
          </button>
        )
        : <p className="pln-card__note">No exam dates yet. Add one and REV will plan towards it.</p>}
      {rest.length > 0 && (
        <ul className="pln-exam-list">
          {rest.map(({ assessment, subject }) => (
            <li key={assessment.assessmentId}>
              <button type="button" className="pln-exam-item" onClick={() => onJump(assessment.assessmentDate)}>
                <SubjectBadge hue={subject.hue} mark={subject.mark} />
                <span className="pln-exam-item__text">
                  <span className="pln-exam-item__title">{assessment.title}</span>
                  <span className="pln-exam-item__date">{weekdayName(assessment.assessmentDate)} {shortDateWithYear(assessment.assessmentDate, todayKey)}</span>
                </span>
                <span className="pln-exam-item__days">{daysTo(assessment.assessmentDate)} {daysTo(assessment.assessmentDate) === 1 ? 'day' : 'days'}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <Button variant="secondary" onClick={onAdd}><Icon name="plus" size="compact" />Add exam date</Button>
    </section>
  )
}

/** Compact exam orientation for the timetable. Uses existing learner-owned assessments. */
export function PlanExamStrip({ exams, todayKey, onJump, onAdd }: PlanExamsCardProps) {
  const visible = exams.slice(0, 3)
  return (
    <section className="pln-exams-strip" aria-label="Upcoming exams">
      <div className="pln-exams-strip__heading">
        <h2>Upcoming exams</h2>
        {exams.length > 3 && <Button variant="tertiary" size="compact" onClick={onAdd}>See all exams</Button>}
      </div>
      {visible.length > 0 ? (
        <div className="pln-exams-strip__list">
          {visible.map(({ assessment, subject }, index) => {
            const days = Math.max(0, daysBetween(todayKey, assessment.assessmentDate))
            return (
              <button key={assessment.assessmentId} type="button" className="pln-exam-chip"
                data-next={index === 0 || undefined}
                style={index === 0 ? { background: `var(--subject-${subject.hue})`, color: `var(--subject-${subject.hue}-on)` } : undefined}
                onClick={() => onJump(assessment.assessmentDate)}>
                <SubjectBadge hue={subject.hue} mark={subject.mark} onSolid={index === 0} />
                <span className="pln-exam-chip__body">
                  <strong>{assessment.title}</strong>
                  <span>{assessmentTypeWord(assessment.assessmentType)} · {shortDateWithYear(assessment.assessmentDate, todayKey)}</span>
                </span>
                <strong className="pln-exam-chip__count">{days === 0 ? 'Today' : `${days} ${days === 1 ? 'day' : 'days'}`}</strong>
              </button>
            )
          })}
        </div>
      ) : <p className="pln-exams-strip__empty">No exam dates added yet. <Button variant="tertiary" size="compact" onClick={onAdd}>Add exam dates</Button></p>}
    </section>
  )
}

function assessmentTypeWord(type: RevisionAssessment['assessmentType']) {
  if (type === 'mock') return 'Mock'
  if (type === 'public_exam') return 'Public exam'
  if (type === 'topic_test') return 'Topic test'
  return 'Assessment'
}

/* -------------------------------------------------------------- Study time */

const dayKeys: readonly RevisionDayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export interface PlanStudyTimeCardProps {
  /** Null until the student has set study time. */
  saved: RevisionWeeklyAvailability | null
  /** The numbers being edited, or null when the card is showing what is saved. */
  draft: RevisionWeeklyAvailability | null
  saving: boolean
  onEdit: () => void
  onChange: (day: RevisionDayOfWeek, delta: number) => void
  onSave: () => void
  onCancel: () => void
}

const emptyWeek: RevisionWeeklyAvailability = { monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0 }

export function PlanStudyTimeCard({ saved, draft, saving, onEdit, onChange, onSave, onCancel }: PlanStudyTimeCardProps) {
  const editing = draft !== null
  const shown = draft ?? saved ?? emptyWeek
  const total = dayKeys.reduce((sum, day) => sum + shown[day], 0)
  const neverSet = saved === null
  return (
    <section className="pln-card" aria-labelledby="pln-study-title">
      <div className="pln-card__head">
        <h2 className="pln-eyebrow" id="pln-study-title">Study time</h2>
        <span className="pln-card__total">{neverSet && !editing ? 'Not set' : `${formatMinutes(total)} a week`}</span>
      </div>
      {neverSet && !editing
        ? <p className="pln-card__note">Tell REV how much time you realistically have each day. It is not a target. It helps the plan fit your week.</p>
        : (
          <ul className="pln-study" data-editing={editing || undefined}>
            {dayKeys.map((day, index) => {
              const minutes = shown[day]
              return (
                <li key={day} className="pln-study__row">
                  <span className="pln-study__day" aria-hidden="true">{weekdayShort[index]}</span>
                  {editing
                    ? <span className="pln-study__value" data-rest={!minutes || undefined}><span className="sr-only">{dayNames[index]}: </span>{minutes ? formatMinutes(minutes) : 'Rest'}</span>
                    : <span className="pln-study__bar" aria-hidden="true"><span style={{ width: `${Math.min(100, (minutes / BAR_FULL_MINUTES) * 100)}%` }} /></span>}
                  {editing
                    ? (
                      <span className="pln-study__steppers">
                        <button type="button" aria-label={`Less study time on ${dayNames[index]}`} disabled={!minutes} onClick={() => onChange(day, -STEP_MINUTES)}>−</button>
                        <button type="button" aria-label={`More study time on ${dayNames[index]}`} disabled={minutes >= MAX_DAY_MINUTES} onClick={() => onChange(day, STEP_MINUTES)}>+</button>
                      </span>
                    )
                    : <span className="pln-study__value" data-rest={!minutes || undefined}><span className="sr-only">{dayNames[index]}: </span>{minutes ? formatMinutes(minutes) : 'Rest'}</span>}
                </li>
              )
            })}
          </ul>
        )}
      {editing
        ? (
          <>
            <p className="pln-card__note">REV will re-plan the rest of this week around your new times. Sessions you've done stay put. Set a day to 0 for a rest day.</p>
            <div className="pln-card__actions">
              <Button loading={saving} loadingLabel="Saving…" onClick={onSave}>{neverSet ? 'Save study time' : 'Save and re-plan'}</Button>
              <Button variant="secondary" disabled={saving} onClick={onCancel}>Cancel</Button>
            </div>
          </>
        )
        : <Button variant="secondary" onClick={onEdit}>{neverSet ? 'Set study time' : 'Change study time'}</Button>}
    </section>
  )
}
