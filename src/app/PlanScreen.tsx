import { useEffect, useMemo, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import type { PlannerItem, PlannerReasonCode } from '../engine/planning/planning'
import {
  archiveAssessment,
  loadPlannerSetup,
  recordPlannerActivityEvent,
  saveAssessment,
  saveAvailabilityProfile,
  type AssessmentImportance,
  type AssessmentType,
  type RevisionAssessment,
  type RevisionAvailabilityException,
  type RevisionAvailabilityProfile,
  type RevisionPlanningPreference,
} from '../services/planning/planner-service'
import { createSupabaseEvidenceStore, loadLearningEvidence } from '../services/progress/learning-evidence-service'
import {
  buildCatalogue,
  createCourseLearningState,
  createModuleLearningState,
  type ModuleLearningState,
} from './catalogue-model'
import { buildPlannerSnapshot } from './planner-model'
import { Button, EmptyState, LoadingState, PageHeader, SelectField, Status, Surface, TextField } from './ui'

const availableAdapters = listAvailableContentAdapters()
const plannerCatalogue = buildCatalogue(availableAdapters)
const plannerCourses = plannerCatalogue.flatMap((subject) => subject.courses)
const sharedLearningModuleIds = new Set(
  plannerCourses.filter((course) => course.sharedLearning).flatMap((course) => course.modules.map((module) => module.manifest.id)),
)

export interface PlanSubjectOption {
  id: string
  name: string
}

interface PlanScreenProps {
  client: SupabaseClient
  userId: string
  subjects: readonly PlanSubjectOption[]
  onOpenSubject?: (subjectId: string) => void
}

function assessmentTypeLabel(type: AssessmentType) {
  if (type === 'public_exam') return 'Public exam'
  if (type === 'topic_test') return 'Topic test'
  if (type === 'mock') return 'Mock'
  return 'Other assessment'
}

function activityLabel(activity: string) {
  if (activity === 'exam-question') return 'Exam practice'
  if (activity === 'quick-check') return 'Quick check'
  if (activity === 'flashcards') return 'Flashcards'
  return 'Revision activity'
}

function reasonLabel(reason: PlannerReasonCode) {
  switch (reason) {
    case 'ASSESSMENT_SOON': return 'The assessment is getting closer.'
    case 'HIGH_IMPORTANCE_ASSESSMENT': return 'You marked this assessment as higher priority.'
    case 'LOW_EVIDENCE': return 'Revision has limited evidence in this area so far.'
    case 'WEAK_EVIDENCE': return 'Recent evidence suggests this area needs more work.'
    case 'UNDER_COVERED': return 'This area has less evidence coverage than others.'
    case 'EXAM_PRACTICE_DUE': return 'Exam-style practice is becoming more useful as the assessment approaches.'
    case 'HIGH_MARK_OPPORTUNITY': return 'This area has a larger known mark opportunity.'
    case 'ALREADY_STRONG': return 'You already have stronger evidence here, so it is less urgent.'
    case 'LEARNER_PRIORITY': return 'You asked Revision to give this more attention for now.'
    case 'COMPETING_PRIORITY': return 'Revision is balancing this against another important priority.'
    case 'CAPACITY_CONSTRAINED': return 'Available time is limited, so Revision is focusing on the highest-value work.'
  }
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

function itemTopicLabel(item: PlannerItem, states: readonly ModuleLearningState[]) {
  const state = states.find((candidate) => candidate.adapter.manifest.subject.id === item.subjectId && candidate.recommendationTopic?.id === item.topicId)
  return state?.recommendationTopic?.shortTitle ?? item.topicId
}

export function PlanScreen({ client, userId, subjects, onOpenSubject }: PlanScreenProps) {
  const [assessments, setAssessments] = useState<RevisionAssessment[]>([])
  const [availability, setAvailability] = useState<RevisionAvailabilityProfile | null>(null)
  const [exceptions, setExceptions] = useState<RevisionAvailabilityException[]>([])
  const [preferences, setPreferences] = useState<RevisionPlanningPreference[]>([])
  const [learningStates, setLearningStates] = useState<ModuleLearningState[]>([])
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
    const evidenceStore = createSupabaseEvidenceStore(client)
    Promise.all([
      loadPlannerSetup(client, userId),
      Promise.all(availableAdapters.map((adapter) => loadLearningEvidence(evidenceStore, userId, adapter.manifest.id))),
    ])
      .then(([setup, evidenceByModule]) => {
        if (!active) return
        const evidence = evidenceByModule.flat()
        const moduleStates = availableAdapters.map((adapter) => createModuleLearningState(adapter, evidence))
        const courseStates = plannerCourses.filter((course) => course.sharedLearning).map((course) => createCourseLearningState(course, evidence))
        setLearningStates([
          ...courseStates,
          ...moduleStates.filter((state) => !sharedLearningModuleIds.has(state.adapter.manifest.id)),
        ])
        setAssessments(setup.assessments)
        setAvailability(setup.availability)
        setExceptions(setup.exceptions)
        setPreferences(setup.preferences)
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

  const snapshot = useMemo(
    () => buildPlannerSnapshot(learningStates, assessments, availability, exceptions, preferences),
    [learningStates, assessments, availability, exceptions, preferences],
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
      setMessage('Assessment added. Revision has recalculated what deserves attention.')
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
      setMessage('Assessment removed. Revision has recalculated from the remaining priorities.')
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Could not remove assessment.')
    } finally {
      setSaving(false)
    }
  }

  async function handleStart(item: PlannerItem) {
    try {
      await recordPlannerActivityEvent(client, userId, {
        recommendationId: item.recommendationId,
        eventType: 'started',
        subjectId: item.subjectId,
        topicId: item.topicId,
        activityType: item.activityType,
        metadata: { plannerVersion: 1, source: 'plan' },
      })
    } catch (error: unknown) {
      setMessage(error instanceof Error ? `${error.message} You can still continue with the revision activity.` : 'Could not record the planner start. You can still continue.')
    }
    onOpenSubject?.(item.subjectId)
  }

  return (
    <main className="dashboard page-screen planner-screen interface-plan-screen" aria-labelledby="plan-page-title">
      <PageHeader
        className="page-heading planner-heading"
        titleId="plan-page-title"
        eyebrow="Your adaptive revision programme"
        title="Plan"
        description="Your plan will change as you revise, your evidence changes and assessments get closer. You do not need to manually move missed tasks around."
      />

      {message && <Status className="planner-message" tone="info" aria-live="polite">{message}</Status>}

      {loading ? (
        <LoadingState className="planner-panel">Loading your current plan…</LoadingState>
      ) : (
        <>
          <Surface className="planner-panel planner-today" aria-labelledby="today-plan-title">
            <div className="planner-panel-heading">
              <div>
                <p className="eyebrow">Today</p>
                <h2 id="today-plan-title">What matters now</h2>
              </div>
              {snapshot && <span className="planner-state">{snapshot.capacityState === 'prioritising' ? 'Prioritising' : 'Current plan'}</span>}
            </div>

            {!availability && <EmptyState className="planner-empty" title="Set your realistic availability" description="Revision needs to know roughly how much time you normally have so it does not create an impossible plan." />}
            {availability && assessments.length === 0 && <EmptyState className="planner-empty" title="Add an assessment" description="Once Revision knows what you are preparing for, it can start balancing your time." />}
            {availability && assessments.length > 0 && !snapshot && <EmptyState className="planner-empty" title="Building the evidence picture" description="Your dates and available time are saved. Complete some scored revision activity and Revision will become more specific about what deserves attention first." />}

            {snapshot?.capacityState === 'prioritising' && (
              <Surface as="div" variant="quiet" padded={false} className="planner-priority-note">
                <strong>Making the time you have count</strong>
                <p>There is not enough realistic capacity to cover every useful area before the current assessments. Revision is prioritising the work with the strongest evidence of need. You can still choose differently.</p>
              </Surface>
            )}

            {snapshot && snapshot.today.length === 0 && <p className="muted">There is no useful planner item to add today. Your wider plan will keep checking as evidence and dates change.</p>}
            {snapshot && snapshot.today.length > 0 && (
              <ol className="planner-today-list">
                {snapshot.today.map((item) => {
                  const subject = subjects.find((candidate) => candidate.id === item.subjectId)
                  const reasons = item.reasons.filter((reason) => reason !== 'ALREADY_STRONG').slice(0, 2)
                  return (
                    <li key={item.recommendationId}>
                      <div>
                        <span className="tag">{subject?.name ?? item.subjectId}</span>
                        <h3>{itemTopicLabel(item, learningStates)}</h3>
                        <p>{activityLabel(item.activityType)} · about {item.estimatedMinutes} minutes</p>
                        <ul className="planner-reasons">{reasons.map((reason) => <li key={reason}>{reasonLabel(reason)}</li>)}</ul>
                      </div>
                      {onOpenSubject && <Button onClick={() => void handleStart(item)}>Start</Button>}
                    </li>
                  )
                })}
              </ol>
            )}
          </Surface>

          <Surface className="planner-panel" aria-labelledby="plan-outlook-title">
            <div className="planner-panel-heading">
              <div>
                <p className="eyebrow">Current outlook</p>
                <h2 id="plan-outlook-title">What is coming up</h2>
              </div>
              <span className="planner-state">Adapts as you work</span>
            </div>
            {upcoming.length === 0 ? (
              <EmptyState className="planner-empty" title="Add your first assessment" description="Revision needs a date and subject before it can balance your remaining time." />
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
                      <Button variant="tertiary" size="compact" disabled={saving} onClick={() => void handleRemoveAssessment(assessment.assessmentId)}>Remove</Button>
                    </li>
                  )
                })}
              </ol>
            )}
          </Surface>

          <div className="planner-setup-grid">
            <Surface className="planner-panel" aria-labelledby="availability-title">
              <p className="eyebrow">Realistic capacity</p>
              <h2 id="availability-title">How much time is normally available?</h2>
              <p className="muted">This is not a target. It helps Revision avoid creating an impossible plan.</p>
              <div className="planner-field-grid">
                <TextField label="Weekday minutes" type="number" min={0} max={1440} step={5} value={weekdayMinutes} onChange={(event) => setWeekdayMinutes(Number(event.target.value))} />
                <TextField label="Weekend minutes" type="number" min={0} max={1440} step={5} value={weekendMinutes} onChange={(event) => setWeekendMinutes(Number(event.target.value))} />
              </div>
              <Button disabled={saving} onClick={() => void handleSaveAvailability()}>{availability ? 'Update availability' : 'Save availability'}</Button>
            </Surface>

            <Surface className="planner-panel" aria-labelledby="assessment-add-title">
              <p className="eyebrow">Assessment</p>
              <h2 id="assessment-add-title">Add something you are preparing for</h2>
              <form className="planner-form" onSubmit={handleAddAssessment}>
                <SelectField label="Subject" value={subjectId} required onChange={(event) => setSubjectId(event.target.value)}>
                  {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                </SelectField>
                <TextField label="What is it?" value={title} required maxLength={120} placeholder="e.g. Business Paper 2 mock" onChange={(event) => setTitle(event.target.value)} />
                <div className="planner-field-grid">
                  <SelectField label="Type" value={assessmentType} onChange={(event) => setAssessmentType(event.target.value as AssessmentType)}>
                    <option value="topic_test">Topic test</option>
                    <option value="mock">Mock</option>
                    <option value="public_exam">Public exam</option>
                    <option value="other">Other</option>
                  </SelectField>
                  <TextField label="Date" type="date" required value={assessmentDate} onChange={(event) => setAssessmentDate(event.target.value)} />
                </div>
                <SelectField label="Importance" value={importance} onChange={(event) => setImportance(event.target.value as AssessmentImportance)}>
                  <option value="normal">Normal</option>
                  <option value="high">Higher priority</option>
                </SelectField>
                <Button type="submit" disabled={saving || subjects.length === 0}>Add assessment</Button>
              </form>
            </Surface>
          </div>
        </>
      )}
    </main>
  )
}
