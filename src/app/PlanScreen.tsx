import { useEffect, useMemo, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  archiveAssessment,
  loadPlannerSetup,
  saveAssessment,
  saveAvailabilityProfile,
  type AssessmentImportance,
  type AssessmentType,
  type RevisionAssessment,
  type RevisionAvailabilityProfile,
} from '../services/planning/planner-service'

export interface PlanSubjectOption {
  id: string
  name: string
}

interface PlanScreenProps {
  client: SupabaseClient
  userId: string
  subjects: readonly PlanSubjectOption[]
}

function assessmentTypeLabel(type: AssessmentType) {
  if (type === 'public_exam') return 'Public exam'
  if (type === 'topic_test') return 'Topic test'
  if (type === 'mock') return 'Mock'
  return 'Other assessment'
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00`))
}

function daysUntil(date: string) {
  const today = new Date()
  const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const target = new Date(`${date}T00:00:00`)
  return Math.ceil((target.getTime() - localToday.getTime()) / 86_400_000)
}

export function PlanScreen({ client, userId, subjects }: PlanScreenProps) {
  const [assessments, setAssessments] = useState<RevisionAssessment[]>([])
  const [availability, setAvailability] = useState<RevisionAvailabilityProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [assessmentDate, setAssessmentDate] = useState('')
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('topic_test')
  const [importance, setImportance] = useState<AssessmentImportance>('normal')
  const [weekdayMinutes, setWeekdayMinutes] = useState(45)
  const [weekendMinutes, setWeekendMinutes] = useState(90)

  useEffect(() => {
    let active = true
    setLoading(true)
    loadPlannerSetup(client, userId)
      .then((setup) => {
        if (!active) return
        setAssessments(setup.assessments)
        setAvailability(setup.availability)
        if (setup.availability) {
          setWeekdayMinutes(setup.availability.weekdayMinutes)
          setWeekendMinutes(setup.availability.weekendMinutes)
        }
        setMessage('')
      })
      .catch((error: unknown) => {
        if (!active) return
        setMessage(error instanceof Error ? error.message : 'Could not load your plan.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [client, userId])

  const upcoming = useMemo(
    () => assessments
      .filter((assessment) => daysUntil(assessment.assessmentDate) >= 0)
      .sort((left, right) => left.assessmentDate.localeCompare(right.assessmentDate)),
    [assessments],
  )

  async function handleSaveAvailability() {
    setSaving(true)
    setMessage('')
    try {
      const saved = await saveAvailabilityProfile(client, userId, { weekdayMinutes, weekendMinutes })
      setAvailability(saved)
      setMessage('Availability saved. Revision will use this as realistic capacity, not a target you have to hit.')
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Could not save availability.')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddAssessment(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const saved = await saveAssessment(client, userId, {
        subjectId,
        title,
        assessmentDate,
        assessmentType,
        relativeImportance: importance,
      })
      setAssessments((current) => [...current, saved])
      setTitle('')
      setAssessmentDate('')
      setImportance('normal')
      setMessage('Assessment added. Revision will use it when deciding what deserves attention.')
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Could not add assessment.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemoveAssessment(assessmentId: string) {
    setSaving(true)
    setMessage('')
    try {
      await archiveAssessment(client, userId, assessmentId)
      setAssessments((current) => current.filter((assessment) => assessment.assessmentId !== assessmentId))
      setMessage('Assessment removed from the active plan.')
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Could not remove assessment.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="dashboard page-screen planner-screen" aria-labelledby="plan-page-title">
      <header className="page-heading planner-heading">
        <p className="eyebrow">Your adaptive revision programme</p>
        <h1 id="plan-page-title">Plan</h1>
        <p>Your plan will change as you revise, your evidence changes and assessments get closer. You do not need to manually move missed tasks around.</p>
      </header>

      {message && <p className="planner-message" aria-live="polite">{message}</p>}

      {loading ? (
        <section className="planner-panel"><p>Loading your current plan…</p></section>
      ) : (
        <>
          <section className="planner-panel" aria-labelledby="plan-outlook-title">
            <div className="planner-panel-heading">
              <div>
                <p className="eyebrow">Current outlook</p>
                <h2 id="plan-outlook-title">What is coming up</h2>
              </div>
              <span className="planner-state">Adapts as you work</span>
            </div>
            {upcoming.length === 0 ? (
              <div className="planner-empty">
                <h3>Add your first assessment</h3>
                <p>Revision needs a date and subject before it can balance your remaining time.</p>
              </div>
            ) : (
              <ol className="planner-assessments">
                {upcoming.map((assessment) => {
                  const subject = subjects.find((item) => item.id === assessment.subjectId)
                  const remaining = daysUntil(assessment.assessmentDate)
                  return (
                    <li key={assessment.assessmentId}>
                      <div className="planner-date-block">
                        <strong>{formatDate(assessment.assessmentDate)}</strong>
                        <span>{remaining === 0 ? 'Today' : `${remaining} ${remaining === 1 ? 'day' : 'days'} away`}</span>
                      </div>
                      <div className="planner-assessment-copy">
                        <span className="tag">{assessmentTypeLabel(assessment.assessmentType)}</span>
                        <h3>{assessment.title}</h3>
                        <p>{subject?.name ?? assessment.subjectId}{assessment.relativeImportance === 'high' ? ' · Higher priority' : ''}</p>
                      </div>
                      <button className="text-link" type="button" disabled={saving} onClick={() => handleRemoveAssessment(assessment.assessmentId)}>Remove</button>
                    </li>
                  )
                })}
              </ol>
            )}
          </section>

          <div className="planner-setup-grid">
            <section className="planner-panel" aria-labelledby="availability-title">
              <p className="eyebrow">Realistic capacity</p>
              <h2 id="availability-title">How much time is normally available?</h2>
              <p className="muted">This is not a target. It helps Revision avoid creating an impossible plan.</p>
              <div className="planner-field-grid">
                <label>
                  Weekday minutes
                  <input type="number" min={0} max={1440} step={5} value={weekdayMinutes} onChange={(event) => setWeekdayMinutes(Number(event.target.value))} />
                </label>
                <label>
                  Weekend minutes
                  <input type="number" min={0} max={1440} step={5} value={weekendMinutes} onChange={(event) => setWeekendMinutes(Number(event.target.value))} />
                </label>
              </div>
              <button className="primary" type="button" disabled={saving} onClick={handleSaveAvailability}>{availability ? 'Update availability' : 'Save availability'}</button>
            </section>

            <section className="planner-panel" aria-labelledby="assessment-add-title">
              <p className="eyebrow">Assessment</p>
              <h2 id="assessment-add-title">Add something you are preparing for</h2>
              <form className="planner-form" onSubmit={handleAddAssessment}>
                <label>
                  Subject
                  <select value={subjectId} required onChange={(event) => setSubjectId(event.target.value)}>
                    {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                  </select>
                </label>
                <label>
                  What is it?
                  <input value={title} required maxLength={120} placeholder="e.g. Business Paper 2 mock" onChange={(event) => setTitle(event.target.value)} />
                </label>
                <div className="planner-field-grid">
                  <label>
                    Type
                    <select value={assessmentType} onChange={(event) => setAssessmentType(event.target.value as AssessmentType)}>
                      <option value="topic_test">Topic test</option>
                      <option value="mock">Mock</option>
                      <option value="public_exam">Public exam</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                  <label>
                    Date
                    <input type="date" required value={assessmentDate} onChange={(event) => setAssessmentDate(event.target.value)} />
                  </label>
                </div>
                <label>
                  Importance
                  <select value={importance} onChange={(event) => setImportance(event.target.value as AssessmentImportance)}>
                    <option value="normal">Normal</option>
                    <option value="high">Higher priority</option>
                  </select>
                </label>
                <button className="primary" type="submit" disabled={saving || subjects.length === 0}>Add assessment</button>
              </form>
            </section>
          </div>
        </>
      )}
    </main>
  )
}
