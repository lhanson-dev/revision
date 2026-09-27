import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { PlannerItem, PlannerReasonCode, PlannerScheduledDay } from '../engine/planning/planning'
import { saveCourseAssessment } from '../services/courses/course-planner-service'
import {
  archiveAssessment,
  loadPlannerSetup,
  recordPlannerActivityEvent,
  revisionWeekDays,
  saveAvailabilityProfile,
  type AssessmentImportance,
  type AssessmentType,
  type RevisionAssessment,
  type RevisionAvailabilityException,
  type RevisionAvailabilityProfile,
  type RevisionPlanningPreference,
  type RevisionWeeklyAvailability,
} from '../services/planning/planner-service'
import { createSupabaseEvidenceStore, loadLearningEvidence } from '../services/progress/learning-evidence-service'
import { createCourseLearningState, createModuleLearningState, paperLabel, type ModuleLearningState } from './catalogue-model'
import { adaptersForProgramme, type LearnerProgrammeCourse } from './learner-programme'
import { buildPlannerSnapshot, courseIdForLearningState } from './planner-model'
import { subjectAccentKey } from './subject-accents'
import { Button, EmptyState, Icon, LoadingState, PageHeader, SegmentedControl, SelectField, Status, Surface, TextField } from './ui'

interface PlanScreenProps {
  client: SupabaseClient
  userId: string
  programme: readonly LearnerProgrammeCourse[]
  onOpenCourses: () => void
  onOpenCourse: (courseId: string) => void
  onOpenRev?: (draft?: string) => void
}

type PlanView = 'day' | 'week' | 'month'

const emptyWeeklyAvailability: RevisionWeeklyAvailability = {
  monday: 0,
  tuesday: 0,
  wednesday: 0,
  thursday: 0,
  friday: 0,
  saturday: 0,
  sunday: 0,
}

const dayLabels: Record<keyof RevisionWeeklyAvailability, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
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
    case 'HIGH_IMPORTANCE_ASSESSMENT': return 'You marked this assessment as a higher priority.'
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

function formatDate(date: string, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) {
  return new Intl.DateTimeFormat('en-GB', options).format(new Date(`${date}T12:00:00`))
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

function subjectLabel(programme: readonly LearnerProgrammeCourse[], subjectId: string) {
  return programme.find((item) => item.subject.id === subjectId)?.subject.name ?? subjectId
}

function conciseReason(item: PlannerItem) {
  const preferred = item.reasons.find((reason) => reason !== 'ALREADY_STRONG' && reason !== 'CAPACITY_CONSTRAINED')
    ?? item.reasons[0]
  return preferred ? reasonLabel(preferred) : 'Revision is balancing this against your other current priorities.'
}

function totalWeeklyMinutes(availability: RevisionAvailabilityProfile | null) {
  if (!availability) return 0
  return revisionWeekDays.reduce((sum, day) => sum + availability.weeklyMinutes[day], 0)
}

function formatDuration(totalMinutes: number) {
  if (totalMinutes <= 0) return 'No time set'
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

function weekRange(days: readonly PlannerScheduledDay[]) {
  if (days.length === 0) return 'Current week'
  const first = days[0]?.date
  const last = days[days.length - 1]?.date
  if (!first || !last) return 'Current week'
  const firstDate = new Date(`${first}T12:00:00`)
  const lastDate = new Date(`${last}T12:00:00`)
  const sameMonth = firstDate.getMonth() === lastDate.getMonth() && firstDate.getFullYear() === lastDate.getFullYear()
  if (sameMonth) return `${formatDate(first, { day: 'numeric' })}–${formatDate(last, { day: 'numeric', month: 'short', year: 'numeric' })}`
  return `${formatDate(first, { day: 'numeric', month: 'short' })} – ${formatDate(last, { day: 'numeric', month: 'short', year: 'numeric' })}`
}

export function PlanScreen({ client, userId, programme, onOpenCourses, onOpenCourse, onOpenRev }: PlanScreenProps) {
  const examTemplates = useMemo(() => programme.flatMap((item) => item.course.modules.map((module) => ({
    key: `${item.course.id}::${module.manifest.id}`,
    courseId: item.course.id,
    subjectId: item.subject.id,
    courseLabel: item.label,
    paperLabel: paperLabel(module),
    title: module.manifest.paper.name,
  }))), [programme])

  const [assessments, setAssessments] = useState<RevisionAssessment[]>([])
  const [availability, setAvailability] = useState<RevisionAvailabilityProfile | null>(null)
  const [exceptions, setExceptions] = useState<RevisionAvailabilityException[]>([])
  const [preferences, setPreferences] = useState<RevisionPlanningPreference[]>([])
  const [learningStates, setLearningStates] = useState<ModuleLearningState[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [view, setView] = useState<PlanView>('week')
  const [manageExamsOpen, setManageExamsOpen] = useState(false)
  const [planSettingsOpen, setPlanSettingsOpen] = useState(false)
  const [explanationOpen, setExplanationOpen] = useState(false)
  const [revPrompt, setRevPrompt] = useState('')
  const [weeklyDraft, setWeeklyDraft] = useState<RevisionWeeklyAvailability>(emptyWeeklyAvailability)
  const [examTemplateKey, setExamTemplateKey] = useState('')
  const [examDate, setExamDate] = useState('')
  const [otherAssessmentOpen, setOtherAssessmentOpen] = useState(false)
  const [courseId, setCourseId] = useState(programme[0]?.course.id ?? '')
  const [title, setTitle] = useState('')
  const [assessmentDate, setAssessmentDate] = useState('')
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('mock')
  const [importance, setImportance] = useState<AssessmentImportance>('normal')

  const selectedCourseId = programme.some((item) => item.course.id === courseId)
    ? courseId
    : programme[0]?.course.id ?? ''
  const selectedExamTemplate = examTemplates.find((template) => template.key === examTemplateKey) ?? examTemplates[0]

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
        if (setup.availability) setWeeklyDraft(setup.availability.weeklyMinutes)
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

  useEffect(() => {
    if (examTemplateKey || examTemplates.length === 0) return
    setExamTemplateKey(examTemplates[0]?.key ?? '')
  }, [examTemplateKey, examTemplates])

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

  const weekDays = snapshot?.schedule.slice(0, 7) ?? []
  const monthDays = snapshot?.schedule.slice(0, 28) ?? []
  const nextExam = upcoming[0] ?? null
  const setupMissingExams = activeAssessments.length === 0
  const setupMissingAvailability = availability === null
  const setupComplete = !setupMissingExams && !setupMissingAvailability
  const currentWeekMinutes = weekDays.length > 0
    ? weekDays.reduce((sum, day) => sum + day.availableMinutes, 0)
    : totalWeeklyMinutes(availability)

  function updateWeeklyDay(day: keyof RevisionWeeklyAvailability, delta: number) {
    setWeeklyDraft((current) => ({
      ...current,
      [day]: Math.max(0, Math.min(1440, current[day] + delta)),
    }))
  }

  async function handleSaveAvailability() {
    setSaving(true)
    setMessage('')
    try {
      const saved = await saveAvailabilityProfile(client, userId, { weeklyMinutes: weeklyDraft })
      setAvailability(saved)
      setWeeklyDraft(saved.weeklyMinutes)
      setPlanSettingsOpen(false)
      setMessage('Weekly study time saved. Revision has recalculated around the time you realistically have.')
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Could not save weekly study time.')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddKnownExam(event: FormEvent) {
    event.preventDefault()
    if (!selectedExamTemplate || !examDate) {
      setMessage('Choose an exam and add its date first.')
      return
    }
    const duplicate = activeAssessments.some((assessment) => assessment.courseId === selectedExamTemplate.courseId
      && assessment.assessmentType === 'public_exam'
      && assessment.title === selectedExamTemplate.title)
    if (duplicate) {
      setMessage('That exam is already in your plan. Remove the existing date first if you need to replace it.')
      return
    }

    setSaving(true)
    setMessage('')
    try {
      const saved = await saveCourseAssessment(client, userId, {
        courseId: selectedExamTemplate.courseId,
        subjectId: selectedExamTemplate.subjectId,
        title: selectedExamTemplate.title,
        assessmentDate: examDate,
        assessmentType: 'public_exam',
        relativeImportance: 'high',
      })
      setAssessments((current) => [...current, saved])
      setExamDate('')
      setMessage('Exam added. Revision has recalculated the plan around the new date.')
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Could not add exam.')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddAssessment(event: FormEvent) {
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

  function submitRevPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = revPrompt.trim()
    if (!onOpenRev) return
    onOpenRev(text || undefined)
    setRevPrompt('')
  }

  function renderExamManager() {
    return (
      <Surface className="plan-management-panel" aria-labelledby="manage-exams-title">
        <div className="planner-panel-heading">
          <div><p className="eyebrow">Exam dates</p><h2 id="manage-exams-title">Manage exams</h2><p>Revision uses these dates to understand what is getting closer and when exam-style work becomes more useful.</p></div>
          {!setupMissingExams && <Button variant="tertiary" size="compact" onClick={() => setManageExamsOpen(false)}>Close</Button>}
        </div>

        {upcoming.length > 0 && <ol className="plan-exam-list">
          {upcoming.map((assessment) => (
            <li key={assessment.assessmentId}>
              <div><span className="tag">{assessmentTypeLabel(assessment.assessmentType)}</span><strong>{assessment.title}</strong><span>{courseLabel(programme, assessment.courseId, assessment.subjectId)}</span></div>
              <div className="plan-exam-date"><strong>{formatDate(assessment.assessmentDate)}</strong><span>{daysUntil(assessment.assessmentDate) === 0 ? 'Today' : `${daysUntil(assessment.assessmentDate)} days`}</span></div>
              <Button variant="tertiary" size="compact" disabled={saving} onClick={() => void handleRemoveAssessment(assessment.assessmentId)}>Remove</Button>
            </li>
          ))}
        </ol>}

        {examTemplates.length > 0 && <form className="plan-add-exam" onSubmit={handleAddKnownExam}>
          <SelectField label="Exam" value={selectedExamTemplate?.key ?? ''} onChange={(event) => setExamTemplateKey(event.target.value)}>
            {examTemplates.map((template) => <option key={template.key} value={template.key}>{template.courseLabel} · {template.paperLabel}</option>)}
          </SelectField>
          <TextField label="Exam date" type="date" required value={examDate} onChange={(event) => setExamDate(event.target.value)} />
          <Button type="submit" disabled={saving || !selectedExamTemplate}>Add exam</Button>
        </form>}

        <button className="plan-disclosure-link" type="button" onClick={() => setOtherAssessmentOpen((open) => !open)} aria-expanded={otherAssessmentOpen}>+ Add a mock, topic test or other assessment</button>
        {otherAssessmentOpen && <form className="planner-form plan-other-assessment" onSubmit={handleAddAssessment}>
          <SelectField label="Course" value={selectedCourseId} required onChange={(event) => setCourseId(event.target.value)}>
            {programme.map((item) => <option key={item.course.id} value={item.course.id}>{item.label}</option>)}
          </SelectField>
          <TextField label="What is it?" value={title} required maxLength={120} placeholder="e.g. Paper 2 mock" onChange={(event) => setTitle(event.target.value)} />
          <div className="planner-field-grid">
            <SelectField label="Type" value={assessmentType} onChange={(event) => setAssessmentType(event.target.value as AssessmentType)}>
              <option value="mock">Mock</option>
              <option value="topic_test">Topic test</option>
              <option value="other">Other</option>
            </SelectField>
            <TextField label="Date" type="date" required value={assessmentDate} onChange={(event) => setAssessmentDate(event.target.value)} />
          </div>
          <SelectField label="Importance" value={importance} onChange={(event) => setImportance(event.target.value as AssessmentImportance)}><option value="normal">Normal</option><option value="high">Higher priority</option></SelectField>
          <Button type="submit" disabled={saving || programme.length === 0}>Add assessment</Button>
        </form>}
      </Surface>
    )
  }

  function renderWeeklySettings(inSetup = false) {
    return (
      <Surface className={`plan-management-panel plan-weekly-settings ${inSetup ? 'plan-setup-weekly' : ''}`} aria-labelledby={inSetup ? 'weekly-setup-title' : 'plan-settings-title'}>
        <div className="planner-panel-heading">
          <div>
            <p className="eyebrow">{inSetup ? 'Step 2 of 2' : 'Plan settings'}</p>
            <h2 id={inSetup ? 'weekly-setup-title' : 'plan-settings-title'}>Your weekly study time</h2>
            <p>Tell Revision how much time you realistically have. This is not a target; it helps the plan fit around your week.</p>
          </div>
          {!inSetup && <Button variant="tertiary" size="compact" onClick={() => setPlanSettingsOpen(false)}>Close</Button>}
        </div>
        <div className="plan-weekly-capacity-grid">
          {revisionWeekDays.map((day) => (
            <div className="plan-capacity-day" key={day}>
              <strong>{dayLabels[day]}</strong>
              <span>Add time</span>
              <div className="plan-capacity-stepper">
                <button type="button" aria-label={`Decrease ${dayLabels[day]} study time`} onClick={() => updateWeeklyDay(day, -15)}>−</button>
                <b>{formatDuration(weeklyDraft[day])}</b>
                <button type="button" aria-label={`Increase ${dayLabels[day]} study time`} onClick={() => updateWeeklyDay(day, 15)}>+</button>
              </div>
            </div>
          ))}
        </div>
        <div className="plan-settings-footer"><span>You can update this later. Your plan will recalculate automatically when your availability changes.</span><Button disabled={saving} onClick={() => void handleSaveAvailability()}>{availability ? 'Save changes' : 'Save weekly time'}</Button></div>
      </Surface>
    )
  }

  function renderTask(item: PlannerItem, compact = false) {
    return (
      <button className={`plan-task ${compact ? 'plan-task-compact' : ''}`} key={item.recommendationId} data-subject-accent={subjectAccentKey(item.subjectId)} onClick={() => void handleStart(item)}>
        <span className="plan-task-subject">{subjectLabel(programme, item.subjectId)}</span>
        <strong>{itemTopicLabel(item, learningStates)}</strong>
        <span>{activityLabel(item.activityType)} · {item.estimatedMinutes} mins</span>
        <small><b>Why this?</b> {conciseReason(item)}</small>
        <Icon name="chevron-right" size="compact" className="plan-task-arrow" />
      </button>
    )
  }

  function renderDayView() {
    const day = weekDays[0]
    return <section className="plan-view-panel" aria-labelledby="plan-day-title">
      <div className="plan-view-heading"><div><p className="eyebrow">Today</p><h2 id="plan-day-title">{day ? formatDate(day.date, { weekday: 'long', day: 'numeric', month: 'long' }) : 'Today'}</h2></div><strong>{day ? formatDuration(day.availableMinutes) : formatDuration(0)} available</strong></div>
      {!day || day.items.length === 0 ? <EmptyState title="Nothing useful needs scheduling here yet" description="Revision will keep checking as your evidence, exam dates and available time change." /> : <div className="plan-day-list">{day.items.map((item) => renderTask(item))}</div>}
    </section>
  }

  function renderWeekView() {
    return <section className="plan-view-panel" aria-labelledby="plan-week-title">
      <div className="plan-view-heading"><div><p className="eyebrow">Current outlook</p><h2 id="plan-week-title">{weekRange(weekDays)}</h2></div><span>Your plan will adapt as you work.</span></div>
      <div className="plan-week-grid">
        {weekDays.map((day) => <article className="plan-week-day" key={day.date}>
          <header><strong>{formatDate(day.date, { weekday: 'short' })}</strong><span>{formatDate(day.date, { day: 'numeric', month: 'short' })}</span><b>{formatDuration(day.availableMinutes)}</b></header>
          <div className="plan-week-day-items">{day.items.length > 0 ? day.items.map((item) => renderTask(item, true)) : <p className="plan-no-task">No planned task</p>}</div>
        </article>)}
      </div>
    </section>
  }

  function renderMonthView() {
    const groups = Array.from({ length: 4 }, (_, index) => monthDays.slice(index * 7, (index + 1) * 7)).filter((group) => group.length > 0)
    return <section className="plan-view-panel plan-month-view" aria-labelledby="plan-month-title">
      <div className="plan-view-heading"><div><p className="eyebrow">Strategic outlook</p><h2 id="plan-month-title">Next four weeks</h2></div><span>Further ahead, Revision shows direction rather than pretending every task is fixed.</span></div>
      <div className="plan-month-weeks">
        {groups.map((days, index) => {
          const items = days.flatMap((day) => day.items)
          const bySubject = new Map<string, number>()
          items.forEach((item) => bySubject.set(item.subjectId, (bySubject.get(item.subjectId) ?? 0) + item.estimatedMinutes))
          const focus = [...bySubject.entries()].sort((left, right) => right[1] - left[1]).slice(0, 3)
          const start = days[0]?.date ?? ''
          const end = days[days.length - 1]?.date ?? ''
          const exams = upcoming.filter((assessment) => assessment.assessmentDate >= start && assessment.assessmentDate <= end)
          return <article key={`${start}-${index}`}>
            <div><p className="eyebrow">Week {index + 1}</p><h3>{weekRange(days)}</h3></div>
            <div className="plan-month-focus">{focus.length > 0 ? focus.map(([subjectId, minutes]) => <span key={subjectId} data-subject-accent={subjectAccentKey(subjectId)}><b>{subjectLabel(programme, subjectId)}</b> · about {formatDuration(minutes)}</span>) : <span>Revision will refine this week as stronger evidence becomes available.</span>}</div>
            {exams.length > 0 && <div className="plan-month-exams">{exams.map((assessment) => <span key={assessment.assessmentId}><Icon name="plan" size="compact" /> {formatDate(assessment.assessmentDate, { day: 'numeric', month: 'short' })} · {assessment.title}</span>)}</div>}
          </article>
        })}
      </div>
    </section>
  }

  return (
    <main className="dashboard page-screen planner-screen interface-plan-screen plan-experience" aria-labelledby="plan-page-title">
      <div className="plan-page-header-row">
        <PageHeader className="page-heading planner-heading" titleId="plan-page-title" eyebrow="Your adaptive revision programme" title="Plan" description="See what Revision is prioritising and how your plan is taking shape." />
        {onOpenRev && <div className="plan-header-rev"><span>Got something else on your mind?</span><form onSubmit={submitRevPrompt}><input value={revPrompt} maxLength={240} onChange={(event) => setRevPrompt(event.target.value)} placeholder="Ask REV anything…" aria-label="Ask REV about your plan" /><button type="submit" aria-label="Ask REV"><Icon name="arrow-right" size="compact" /></button></form></div>}
      </div>

      <Surface variant="quiet" className="plan-adaptive-explainer">
        <Icon name="plan" />
        <div><strong>Your plan adapts as you go</strong><p>Revision uses your exam dates, the time you realistically have available and evidence from how you're getting on to decide what is most useful to work on. As you revise and Revision gets stronger evidence about where you're strong and where you need more work, your plan updates automatically.</p>{explanationOpen && <p className="plan-adaptive-detail">It considers things such as how close your exams are, what they cover, where your performance evidence suggests more work would help, what you're already strong at, competing subjects and the time you have available.</p>}</div>
        <button type="button" className="plan-explainer-toggle" onClick={() => setExplanationOpen((open) => !open)} aria-expanded={explanationOpen}>How does this work? <span aria-hidden="true">⌄</span></button>
      </Surface>

      {message && <Status className="planner-message" tone="info" aria-live="polite">{message}</Status>}

      {loading ? <LoadingState className="planner-panel">Loading your current plan…</LoadingState> : programme.length === 0 ? <EmptyState className="planner-panel" title="Add a course before building your plan" description="Revision will not create a programme from courses you have not selected." action={<Button onClick={onOpenCourses}>Go to Courses</Button>} /> : <>
        {!setupComplete && <div className="plan-setup-flow">
          {setupMissingExams && <Surface className="plan-setup-exams" aria-labelledby="plan-setup-exams-title"><div className="plan-setup-step-icon"><Icon name="plan" size="large" /></div><div className="plan-setup-copy"><p className="eyebrow">Step 1 of 2</p><h2 id="plan-setup-exams-title">Add your exams</h2><p>Add your exam dates so Revision can build a personalised plan. Your dates help work out what to focus on and when, so the time you have is used where it can help most.</p>{renderExamManager()}</div></Surface>}
          {setupMissingAvailability && renderWeeklySettings(true)}
          <Surface variant="quiet" className="plan-awaiting"><Icon name="plan" size="large" /><strong>Your plan will appear here</strong><p>Once you've added the missing exam dates and weekly study time, Revision will build your personalised plan and keep adapting it as you work.</p></Surface>
        </div>}

        {setupComplete && <>
          <Surface className="plan-overview-strip">
            <div className="plan-overview-item"><Icon name="plan" /><div><span>Next exam</span><strong>{nextExam ? nextExam.title : 'No upcoming exam'}</strong><small>{nextExam ? `${courseLabel(programme, nextExam.courseId, nextExam.subjectId)} · ${formatDate(nextExam.assessmentDate)} · ${daysUntil(nextExam.assessmentDate)} days` : 'Add another exam when you know the date.'}</small></div></div>
            <div className="plan-overview-item"><Icon name="progress" /><div><span>This week</span><strong>{formatDuration(currentWeekMinutes)} available</strong><small>Your plan fits around this realistic capacity.</small></div></div>
            <div className="plan-overview-item"><Icon name={snapshot?.capacityState === 'prioritising' ? 'info' : 'check'} /><div><span>Plan status</span><strong>{snapshot?.capacityState === 'prioritising' ? 'Prioritising' : 'Current plan'}</strong><small>{snapshot?.capacityState === 'prioritising' ? 'Revision is concentrating on the highest-value work for the time available.' : 'Revision is balancing work across your current programme.'}</small></div></div>
            <div className="plan-overview-actions"><Button variant="secondary" onClick={() => { setManageExamsOpen((open) => !open); setPlanSettingsOpen(false) }}><Icon name="plan" size="compact" /> Manage exams</Button><Button variant="secondary" onClick={() => { setPlanSettingsOpen((open) => !open); setManageExamsOpen(false) }}><Icon name="settings" size="compact" /> Plan settings</Button></div>
          </Surface>

          {manageExamsOpen && renderExamManager()}
          {planSettingsOpen && renderWeeklySettings()}

          {snapshot?.capacityState === 'prioritising' && <Surface variant="quiet" className="planner-priority-note"><strong>Making the time you have count</strong><p>There is not enough realistic capacity to cover every useful area before the current assessments. Revision is focusing on the strongest evidence of need without treating this as a failure.</p></Surface>}

          <div className="plan-view-toolbar">
            <SegmentedControl label="Plan view">
              {(['day', 'week', 'month'] as PlanView[]).map((item) => <button key={item} type="button" className={view === item ? 'active' : ''} aria-pressed={view === item} onClick={() => setView(item)}>{item.charAt(0).toUpperCase() + item.slice(1)}</button>)}
            </SegmentedControl>
            {view === 'week' && <strong>{weekRange(weekDays)}</strong>}
          </div>

          {snapshot ? <>{view === 'day' && renderDayView()}{view === 'week' && renderWeekView()}{view === 'month' && renderMonthView()}</> : <EmptyState className="planner-panel" title="Building the evidence picture" description="Your dates and available time are saved. Revision will become more specific as useful scored evidence builds." />}

          <Surface className="plan-upcoming-exams" aria-labelledby="upcoming-exams-title"><div className="planner-panel-heading"><div><p className="eyebrow">Milestones</p><h2 id="upcoming-exams-title">Upcoming exams</h2></div><Button variant="tertiary" size="compact" onClick={() => setManageExamsOpen(true)}>Manage exams</Button></div>{upcoming.length === 0 ? <p className="muted">No upcoming assessment dates are set.</p> : <div className="plan-upcoming-grid">{upcoming.map((assessment) => <article key={assessment.assessmentId} data-subject-accent={subjectAccentKey(assessment.subjectId)}><strong>{formatDate(assessment.assessmentDate, { day: 'numeric', month: 'short', year: 'numeric' })}</strong><span>{subjectLabel(programme, assessment.subjectId)} · {assessment.title}</span><small>{daysUntil(assessment.assessmentDate)} days</small></article>)}</div>}</Surface>
        </>}
      </>}
    </main>
  )
}