import { useEffect, useMemo, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { PlannerItem, PlannerReasonCode } from '../engine/planning/planning'
import { saveCourseAssessment } from '../services/courses/course-planner-service'
import {
  archiveAssessment,
  loadPlannerSetup,
  recordPlannerActivityEvent,
  saveAvailabilityProfile,
  type AssessmentImportance,
  type AssessmentType,
  type RevisionAssessment,
  type RevisionAvailabilityException,
  type RevisionAvailabilityProfile,
  type RevisionPlanningPreference,
} from '../services/planning/planner-service'
import { createSupabaseEvidenceStore, loadLearningEvidence } from '../services/progress/learning-evidence-service'
import { createCourseLearningState, createModuleLearningState, type ModuleLearningState } from './catalogue-model'
import { adaptersForProgramme, type LearnerProgrammeCourse } from './learner-programme'
import { buildPlannerSnapshot, courseIdForLearningState } from './planner-model'
import { Button, EmptyState, LoadingState, PageHeader, SelectField, Status, Surface, TextField } from './ui'

interface PlanScreenProps {
  client: SupabaseClient
  userId: string
  programme: readonly LearnerProgrammeCourse[]
  onOpenCourses: () => void
  onOpenCourse: (courseId: string) => void
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
  const state = states.find((candidate) => {
    if (item.courseId && courseIdForLearningState(candidate) !== item.courseId) return false
    return Boolean(candidate.adapter.getTopic(item.topicId))
  })
  return state?.adapter.getTopic(item.topicId)?.shortTitle ?? item.topicId
}

function courseLabel(programme: readonly LearnerProgrammeCourse[], courseId: string | null | undefined, subjectId?: string) {
  if (courseId) return programme.find((item) => item.course.id === courseId)?.label ?? courseId
  const matches = programme.filter((item) => item.subject.id === subjectId)
  return matches.length === 1 ? matches[0]?.label ?? subjectId ?? 'Course' : subjectId ?? 'Course'
}

export function PlanScreen({ client, userId, programme, onOpenCourses, onOpenCourse }: PlanScreenProps) {
  const [assessments, setAssessments] = useState<RevisionAssessment[]>([])
  const [availability, setAvailability] = useState<RevisionAvailabilityProfile | null>(null)
  const [exceptions, setExceptions] = useState<RevisionAvailabilityException[]>([])
  const [preferences, setPreferences] = useState<RevisionPlanningPreference[]>([])
  const [learningStates, setLearningStates] = useState<ModuleLearningState[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [courseId, setCourseId] = useState(programme[0]?.course.id ?? '')
  const [title, setTitle] = useState('')
  const [assessmentDate, setAssessmentDate] = useState('')
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('topic_test')
  const [importance, setImportance] = useState<AssessmentImportance>('normal')
  const [weekdayMinutes, setWeekdayMinutes] = useState(45)
  const [weekendMinutes, setWeekendMinutes] = useState(90)
  const selectedCourseId = programme.some((item) => item.course.id === courseId)
    ? courseId
    : programme[0]?.course.id ?? ''

  useEffect(() => {
    let active = true
    const adapters = adaptersForProgramme(programme)
    const evidenceStore = createSupabaseEvidenceStore(client)
    Promise.all([
      loadPlannerSetup(client, userId),
      Promise.all(adapters.map((adapter) => loadLearningEvidence(evidenceStore, userId, adapter.manifest.id))),
    ])
      .then(([setup, evidenceByModule]) => {
        if (!active) return
        const evidence = evidenceByModule.flat()
        const states: ModuleLearningState[] = []
        programme.forEach(({ course }) => {
          if (course.sharedLearning) states.push(createCourseLearningState(course, evidence))
          else course.modules.forEach((adapter) => states.push(createModuleLearningState(adapter, evidence)))
        })
        setLearningStates(states)
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
  }, [client, programme, userId])

  const activeCourseIds = useMemo(() => new Set(programme.map((item) => item.course.id)), [programme])
  const activeAssessments = useMemo(() => assessments.filter((assessment) => {
    if (assessment.courseId) return activeCourseIds.has(assessment.courseId)
    const subjectMatches = programme.filter((item) => item.subject.id === assessment.subjectId)
    return !assessment.moduleId && subjectMatches.length === 1
  }), [activeCourseIds, assessments, programme])

  const upcoming = useMemo(
    () => activeAssessments
      .filter((assessment) => daysUntil(assessment.assessmentDate) >= 0)
      .sort((left, right) => left.assessmentDate.localeCompare(right.assessmentDate)),
    [activeAssessments],
  )

  const snapshot = useMemo(
    () => buildPlannerSnapshot(learningStates, activeAssessments, availability, exceptions, preferences),
    [learningStates, activeAssessments, availability, exceptions, preferences],
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
    const selected = programme.find((item) => item.course.id === selectedCourseId)
    if (!selected) {
      setMessage('Choose one of your active courses first.')
      return
    }
    setSaving(true)
    setMessage('')
    try {
      const saved = await saveCourseAssessment(client, userId, {
        courseId: selected.course.id,
        subjectId: selected.subject.id,
        title,
        assessmentDate,
        assessmentType,
        relativeImportance: importance,
      })
      setAssessments((current) => [...current, saved])
      setTitle('')
      setAssessmentDate('')
      setImportance('normal')
      setMessage('Assessment added. Revision has recalculated what deserves attention across your active courses.')
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
        courseId: item.courseId,
        topicId: item.topicId,
        activityType: item.activityType,
        metadata: { plannerVersion: 1, source: 'plan' },
      })
    } catch (error: unknown) {
      setMessage(error instanceof Error ? `${error.message} You can still continue with the revision activity.` : 'Could not record the planner start. You can still continue.')
    }
    if (item.courseId) onOpenCourse(item.courseId)
    else onOpenCourses()
  }

  return (
    <main className="dashboard page-screen planner-screen interface-plan-screen" aria-labelledby="plan-page-title">
      <PageHeader
        className="page-heading planner-heading"
        titleId="plan-page-title"
        eyebrow="Your adaptive revision programme"
        title="Plan"
        description="Your plan covers only your active courses and will change as you revise, your evidence changes and assessments get closer."
      />

      {message && <Status className="planner-message" tone="info" aria-live="polite">{message}</Status>}

      {loading ? (
        <LoadingState className="planner-panel">Loading your current plan…</LoadingState>
      ) : programme.length === 0 ? (
        <EmptyState className="planner-panel" title="Add a course before building your plan" description="Revision will not create a programme from courses you have not selected." action={<Button onClick={onOpenCourses}>Go to Courses</Button>} />
      ) : (
        <>
          <Surface className="planner-panel planner-today" aria-labelledby="today-plan-title">
            <div className="planner-panel-heading">
              <div><p className="eyebrow">Today</p><h2 id="today-plan-title">What matters now</h2></div>
              {snapshot && <span className="planner-state">{snapshot.capacityState === 'prioritising' ? 'Prioritising' : 'Current plan'}</span>}
            </div>

            {!availability && <EmptyState className="planner-empty" title="Set your realistic availability" description="Revision needs to know roughly how much time you normally have so it does not create an impossible plan." />}
            {availability && activeAssessments.length === 0 && <EmptyState className="planner-empty" title="Add an assessment" description="Once Revision knows what you are preparing for in one of your active courses, it can start balancing your time." />}
            {availability && activeAssessments.length > 0 && !snapshot && <EmptyState className="planner-empty" title="Building the evidence picture" description="Your dates and available time are saved. Complete some scored revision activity and Revision will become more specific about what deserves attention first." />}

            {snapshot?.capacityState === 'prioritising' && (
              <Surface as="div" variant="quiet" padded={false} className="planner-priority-note">
                <strong>Making the time you have count</strong>
                <p>There is not enough realistic capacity to cover every useful area before the current assessments. Revision is prioritising the work with the strongest evidence of need across your active courses.</p>
              </Surface>
            )}

            {snapshot && snapshot.today.length === 0 && <p className="muted">There is no useful planner item to add today. Your wider plan will keep checking as evidence and dates change.</p>}
            {snapshot && snapshot.today.length > 0 && (
              <ol className="planner-today-list">
                {snapshot.today.map((item) => {
                  const reasons = item.reasons.filter((reason) => reason !== 'ALREADY_STRONG').slice(0, 2)
                  return (
                    <li key={item.recommendationId}>
                      <div>
                        <span className="tag">{courseLabel(programme, item.courseId, item.subjectId)}</span>
                        <h3>{itemTopicLabel(item, learningStates)}</h3>
                        <p>{activityLabel(item.activityType)} · about {item.estimatedMinutes} minutes</p>
                        <ul className="planner-reasons">{reasons.map((reason) => <li key={reason}>{reasonLabel(reason)}</li>)}</ul>
                      </div>
                      <Button onClick={() => void handleStart(item)}>Start</Button>
                    </li>
                  )
                })}
              </ol>
            )}
          </Surface>

          <Surface className="planner-panel" aria-labelledby="plan-outlook-title">
            <div className="planner-panel-heading"><div><p className="eyebrow">Current outlook</p><h2 id="plan-outlook-title">What is coming up</h2></div><span className="planner-state">Adapts as you work</span></div>
            {upcoming.length === 0 ? (
              <EmptyState className="planner-empty" title="Add your first assessment" description="Revision needs a date and active course before it can balance your remaining time." />
            ) : (
              <ol className="planner-assessments">
                {upcoming.map((assessment) => {
                  const remaining = daysUntil(assessment.assessmentDate)
                  return (
                    <li key={assessment.assessmentId}>
                      <div className="planner-date-block"><strong>{formatDate(assessment.assessmentDate)}</strong><span>{remaining === 0 ? 'Today' : `${remaining} ${remaining === 1 ? 'day' : 'days'} away`}</span></div>
                      <div className="planner-assessment-copy"><span className="tag">{assessmentTypeLabel(assessment.assessmentType)}</span><h3>{assessment.title}</h3><p>{courseLabel(programme, assessment.courseId, assessment.subjectId)}{assessment.relativeImportance === 'high' ? ' · Higher priority' : ''}</p></div>
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
                <SelectField label="Course" value={selectedCourseId} required onChange={(event) => setCourseId(event.target.value)}>
                  {programme.map((item) => <option key={item.course.id} value={item.course.id}>{item.label}</option>)}
                </SelectField>
                <TextField label="What is it?" value={title} required maxLength={120} placeholder="e.g. Paper 2 mock" onChange={(event) => setTitle(event.target.value)} />
                <div className="planner-field-grid">
                  <SelectField label="Type" value={assessmentType} onChange={(event) => setAssessmentType(event.target.value as AssessmentType)}>
                    <option value="topic_test">Topic test</option>
                    <option value="mock">Mock</option>
                    <option value="public_exam">Public exam</option>
                    <option value="other">Other</option>
                  </SelectField>
                  <TextField label="Date" type="date" required value={assessmentDate} onChange={(event) => setAssessmentDate(event.target.value)} />
                </div>
                <SelectField label="Importance" value={importance} onChange={(event) => setImportance(event.target.value as AssessmentImportance)}><option value="normal">Normal</option><option value="high">Higher priority</option></SelectField>
                <Button type="submit" disabled={saving || programme.length === 0}>Add assessment</Button>
              </form>
            </Surface>
          </div>
        </>
      )}
    </main>
  )
}
