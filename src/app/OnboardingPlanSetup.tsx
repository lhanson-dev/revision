import { useMemo, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { saveCourseAssessment } from '../services/courses/course-planner-service'
import { revisionWeekDays, saveAvailabilityProfile, type RevisionWeeklyAvailability } from '../services/planning/planner-service'
import { paperLabel } from './catalogue-model'
import type { LearnerProgrammeCourse } from './learner-programme'
import { Button, Status, TextField } from './ui'

type OnboardingPlanSetupProps = {
  client: SupabaseClient
  userId: string
  /** The courses the student has just added. */
  courses: readonly LearnerProgrammeCourse[]
  onDone: () => void
}

const DAY_LABELS: Record<keyof RevisionWeeklyAvailability, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
}

const EMPTY_WEEK: RevisionWeeklyAvailability = { monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0 }

export function formatStudyTime(totalMinutes: number) {
  if (totalMinutes <= 0) return 'No time'
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

function todayIso() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

/**
 * Onboarding steps 4 and 5: exam dates, then weekly study time (decisions file section 4). Both are optional here
 * and can be changed any time on Plan; the plan recalculates itself whenever they change.
 */
export function OnboardingPlanSetup({ client, userId, courses, onDone }: OnboardingPlanSetupProps) {
  const [step, setStep] = useState<'exams' | 'time'>('exams')
  const [dates, setDates] = useState<Record<string, string>>({})
  const [week, setWeek] = useState<RevisionWeeklyAvailability>(EMPTY_WEEK)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const papers = useMemo(() => courses.flatMap((item) => item.course.modules.map((module) => ({
    key: `${item.course.id}::${module.manifest.id}`,
    courseId: item.course.id,
    subjectId: item.subject.id,
    courseLabel: item.label,
    paperLabel: paperLabel(module),
    title: module.manifest.paper.name,
  }))), [courses])
  const today = todayIso()
  const weekTotal = revisionWeekDays.reduce((sum, day) => sum + week[day], 0)

  function change(day: keyof RevisionWeeklyAvailability, delta: number) {
    setWeek((current) => ({ ...current, [day]: Math.max(0, Math.min(1440, current[day] + delta)) }))
  }

  function changeEveryDay(delta: number) {
    setWeek((current) => Object.fromEntries(revisionWeekDays.map((day) => [day, Math.max(0, Math.min(1440, current[day] + delta))])) as RevisionWeeklyAvailability)
  }

  async function saveExams() {
    const chosen = papers.filter((paper) => dates[paper.key])
    if (chosen.some((paper) => dates[paper.key] < today)) {
      setError('An exam date can’t be in the past. Check the dates, or skip this step.')
      return
    }
    setBusy(true)
    setError('')
    try {
      for (const paper of chosen) {
        await saveCourseAssessment(client, userId, {
          courseId: paper.courseId,
          subjectId: paper.subjectId,
          title: paper.title,
          assessmentDate: dates[paper.key],
          assessmentType: 'public_exam',
          relativeImportance: 'high',
        })
      }
      setStep('time')
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Could not save your exam dates.')
    } finally {
      setBusy(false)
    }
  }

  async function saveTime() {
    setBusy(true)
    setError('')
    try {
      if (weekTotal > 0) await saveAvailabilityProfile(client, userId, { weeklyMinutes: week })
      onDone()
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Could not save your study time.')
      setBusy(false)
    }
  }

  return (
    <div className="onb-choice">
      <div className="first-use-heading">
        <p className="eyebrow">Nearly there</p>
        <h1 id="first-course-heading">Make a plan that fits you</h1>
        <p className="onb-choice__step">Step {step === 'exams' ? 4 : 5} of 5</p>
      </div>
      <div className="first-use-rev-note"><strong>REV</strong><span>You can change your exam dates and study time any time on Plan. Your plan updates itself when you do.</span></div>
      {error && <Status tone="error">{error}</Status>}

      {step === 'exams' && (
        <div className="onb-choice__group">
          <h2 className="onb-choice__question">When are your exams?</h2>
          <p className="onb-choice__hint">Add the dates you know. You can leave any blank and add them later.</p>
          {papers.length === 0 && <p className="onb-choice__note">There are no exam papers to date for these courses yet.</p>}
          {courses.map((item) => {
            const own = papers.filter((paper) => paper.courseId === item.course.id)
            if (own.length === 0) return null
            return (
              <fieldset key={item.course.id} className="onb-choice__subject">
                <legend>{item.label}</legend>
                <div className="onb-dates">
                  {own.map((paper) => (
                    <TextField key={paper.key} label={`${paper.paperLabel} date`} type="date" min={today} value={dates[paper.key] ?? ''} onChange={(event) => setDates((current) => ({ ...current, [paper.key]: event.target.value }))} />
                  ))}
                </div>
              </fieldset>
            )
          })}
          <div className="onb-choice__actions">
            <Button variant="secondary" size="large" disabled={busy} onClick={() => { setError(''); setStep('time') }}>Skip for now</Button>
            <Button size="large" disabled={busy || !papers.some((paper) => dates[paper.key])} onClick={() => void saveExams()}>Save dates and continue</Button>
          </div>
        </div>
      )}

      {step === 'time' && (
        <div className="onb-choice__group">
          <h2 className="onb-choice__question">How much time can you revise each day?</h2>
          <p className="onb-choice__hint">Be realistic. This isn’t a target; it helps your plan fit around your week.</p>
          <div className="onb-time">
            <div className="onb-time__row onb-time__row--all">
              <strong>Every day</strong>
              <div className="onb-time__stepper">
                <button type="button" aria-label="Decrease every day by 15 minutes" onClick={() => changeEveryDay(-15)}>−</button>
                <span>15 min</span>
                <button type="button" aria-label="Increase every day by 15 minutes" onClick={() => changeEveryDay(15)}>+</button>
              </div>
            </div>
            {revisionWeekDays.map((day) => (
              <div className="onb-time__row" key={day}>
                <strong>{DAY_LABELS[day]}</strong>
                <div className="onb-time__stepper">
                  <button type="button" aria-label={`Decrease ${DAY_LABELS[day]} study time`} onClick={() => change(day, -15)}>−</button>
                  <span>{formatStudyTime(week[day])}</span>
                  <button type="button" aria-label={`Increase ${DAY_LABELS[day]} study time`} onClick={() => change(day, 15)}>+</button>
                </div>
              </div>
            ))}
          </div>
          <p className="onb-choice__note">{weekTotal > 0 ? `That’s ${formatStudyTime(weekTotal)} a week.` : 'No time set yet.'}</p>
          <div className="onb-choice__actions">
            <Button variant="secondary" size="large" disabled={busy} onClick={() => setStep('exams')}>Back</Button>
            <Button variant="secondary" size="large" disabled={busy} onClick={onDone}>Skip for now</Button>
            <Button size="large" disabled={busy || weekTotal === 0} onClick={() => void saveTime()}>Save and continue</Button>
          </div>
        </div>
      )}
    </div>
  )
}
