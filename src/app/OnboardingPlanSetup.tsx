import { useMemo, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { saveKnownPaperDates } from '../services/courses/course-planner-service'
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

function todayIso() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

/**
 * Optional exam dates are the last first-course setup step (4 of 4).
 * The Student may save some known paper dates or skip them independently of the
 * starting check. Weekly study availability is configured later in Plan.
 */
export function OnboardingPlanSetup({ client, userId, courses, onDone }: OnboardingPlanSetupProps) {
  const [dates, setDates] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const papers = useMemo(() => courses.flatMap((item) => item.course.modules.map((module) => ({
    key: `${item.course.id}::${module.manifest.id}`,
    courseId: item.course.id,
    subjectId: item.subject.id,
    moduleId: module.manifest.id,
    paperLabel: paperLabel(module),
    title: module.manifest.paper.name,
  }))), [courses])
  const today = todayIso()

  async function saveExams() {
    const chosen = papers.filter((paper) => dates[paper.key])
    if (chosen.some((paper) => dates[paper.key] < today)) {
      setError('An exam date can’t be in the past. Check the dates, or skip this step.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await saveKnownPaperDates(client, userId, chosen.map((paper) => ({
        courseId: paper.courseId,
        subjectId: paper.subjectId,
        moduleId: paper.moduleId,
        title: paper.title,
        assessmentDate: dates[paper.key],
      })))
      onDone()
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Could not save your exam dates.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="onb-choice">
      <div className="first-use-heading">
        <p className="eyebrow">Nearly there</p>
        <h1 id="first-course-heading">Add your exam dates</h1>
        <p className="onb-choice__step">Step 4 of 4</p>
      </div>
      <div className="first-use-rev-note"><strong>REV</strong><span>Only add dates you know. You can skip this and add or change dates any time in Plan.</span></div>
      {error && <Status tone="error">{error}</Status>}

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
          <Button variant="secondary" size="large" disabled={busy} onClick={onDone}>Skip for now</Button>
          <Button size="large" disabled={busy || !papers.some((paper) => dates[paper.key])} onClick={() => void saveExams()}>Save dates and continue</Button>
        </div>
      </div>
    </div>
  )
}
