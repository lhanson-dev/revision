import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { PlannerItem } from '../engine/planning/planning'
import { saveCourseAssessment } from '../services/courses/course-planner-service'
import {
  addPlannedSession,
  loadPlannedSessions,
  movePlannedSession,
  removePlannedSession,
  setPlannedSessionStatus,
  type NewPlannedSession,
  type PlannedSession,
  type PlannedSessionStatus,
} from '../services/planning/planned-session-service'
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
  type RevisionDayOfWeek,
  type RevisionPlanningPreference,
  type RevisionWeeklyAvailability,
} from '../services/planning/planner-service'
import { createSupabaseEvidenceStore, loadLearningEvidence } from '../services/progress/learning-evidence-service'
import { createCourseLearningState, createModuleLearningState, paperLabel, type ModuleLearningState } from './catalogue-model'
import { adaptersForProgramme, type LearnerProgrammeCourse } from './learner-programme'
import { learnerCourseRoute, parseRoute, planRoute, routeHash, type PlanViewKey } from './navigation'
import { PlanAddSessionDialog, type PlanAddSessionCourse } from './PlanAddSessionDialog'
import { PlanExamsCard, PlanStudyTimeCard } from './PlanSideColumn'
import { PlanDayView, PlanMonthView, PlanNav, PlanSummaryCard, PlanWeekView, type PlanRowActions } from './PlanViews'
import { buildPlannerSnapshot, courseIdForLearningState } from './planner-model'
import {
  addDaysToKey,
  daysBetween,
  monthGridKeys,
  monthName,
  monthOf,
  sameMonth,
  shiftMonth,
  shortDateWithYear,
  toKey,
  weekKeys,
  weekStart,
} from './plan-dates'
import { createPlanDayBuilder, overdueSessionCount, summarisePeriod, type PlanContext, type PlanSubject, type PlanSuggestedItem } from './plan-model'
import { resolveSubjectIdentity, type SubjectHue } from './subject-palette'
import { Button, EmptyState, Icon, LoadingState, ModalShell, OverlayBackdrop, SelectField, Status, Surface, TextField } from './ui'

interface PlanScreenProps {
  client: SupabaseClient
  userId: string
  programme: readonly LearnerProgrammeCourse[]
  onOpenCourses: () => void
  onOpenCourse: (courseId: string) => void
}

const MAX_STUDY_MINUTES = 240
/** The planner looks about two months ahead, so accepted sessions are loaded at least that far. */
const PLANNER_HORIZON_DAYS = 60

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

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00`))
}

function courseLabel(programme: readonly LearnerProgrammeCourse[], courseId: string | null | undefined, subjectId?: string) {
  if (courseId) return programme.find((item) => item.course.id === courseId)?.label ?? courseId
  const matches = programme.filter((item) => item.subject.id === subjectId)
  return matches.length === 1 ? matches[0]?.label ?? subjectId ?? 'Course' : subjectId ?? 'Course'
}

function subjectFor(programme: readonly LearnerProgrammeCourse[], subjectId: string, courseId?: string | null): PlanSubject {
  const entry = (courseId ? programme.find((item) => item.course.id === courseId) : undefined) ?? programme.find((item) => item.subject.id === subjectId)
  const name = entry?.subject.name ?? subjectId
  const { hue, mark } = resolveSubjectIdentity(entry?.subject.id ?? subjectId, name)
  return { subjectId: entry?.subject.id ?? subjectId, name, hue, mark }
}

function readPlace(todayKey: string): { view: PlanViewKey; anchor: string } {
  const route = parseRoute(window.location.hash)
  if (route.kind === 'plan') return { view: route.view ?? 'day', anchor: route.date ?? todayKey }
  return { view: 'day', anchor: todayKey }
}

function weekTitle(anchor: string, todayKey: string) {
  const offset = daysBetween(weekStart(todayKey), weekStart(anchor)) / 7
  if (offset === 0) return { title: 'Your week', label: 'This week' }
  if (offset === 1) return { title: 'Next week', label: 'Next week' }
  if (offset === -1) return { title: 'Last week', label: 'Last week' }
  const text = `Week of ${shortDateWithYear(weekStart(anchor), todayKey)}`
  return { title: text, label: text }
}

function monthLabel(anchor: string, todayKey: string) {
  const { year } = monthOf(anchor)
  const name = monthName(anchor)
  return year === monthOf(todayKey).year ? name : `${name} ${year}`
}

export function PlanScreen({ client, userId, programme, onOpenCourses, onOpenCourse }: PlanScreenProps) {
  const now = useMemo(() => new Date(), [])
  const todayKey = toKey(now)

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
  // Sessions the student accepted. Null means the table cannot be read yet, so Plan shows none and says nothing about it.
  const [plannedSessions, setPlannedSessions] = useState<PlannedSession[] | null>(null)
  const [sessionsLoadedRange, setSessionsLoadedRange] = useState<{ from: string; to: string } | null>(null)
  const [sessionsUnavailable, setSessionsUnavailable] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [place, setPlace] = useState(() => readPlace(todayKey))
  const [studyDraft, setStudyDraft] = useState<RevisionWeeklyAvailability | null>(null)
  const [addSessionOpen, setAddSessionOpen] = useState(false)
  const [addSessionError, setAddSessionError] = useState('')
  const [examsOpen, setExamsOpen] = useState(false)
  const [otherAssessmentOpen, setOtherAssessmentOpen] = useState(false)
  const [examTemplateKey, setExamTemplateKey] = useState(() => examTemplates[0]?.key ?? '')
  const [examDate, setExamDate] = useState('')
  const [courseId, setCourseId] = useState(programme[0]?.course.id ?? '')
  const [title, setTitle] = useState('')
  const [assessmentDate, setAssessmentDate] = useState('')
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('mock')
  const [importance, setImportance] = useState<AssessmentImportance>('normal')

  const { view, anchor } = place
  const selectedCourseId = programme.some((item) => item.course.id === courseId) ? courseId : programme[0]?.course.id ?? ''
  const selectedExamTemplate = examTemplates.find((template) => template.key === examTemplateKey) ?? examTemplates[0]

  /** Moves the screen and writes the view and date into the address, so a reload or a shared link lands in the same place. */
  const goTo = useCallback((nextView: PlanViewKey, nextAnchor: string) => {
    setPlace({ view: nextView, anchor: nextAnchor })
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${routeHash(planRoute({ view: nextView, date: nextAnchor }))}`)
  }, [])

  // Back, forward and the Plan link in the navigation change the address; follow it.
  useEffect(() => {
    const follow = () => {
      if (parseRoute(window.location.hash).kind === 'plan') setPlace(readPlace(todayKey))
    }
    window.addEventListener('hashchange', follow)
    return () => window.removeEventListener('hashchange', follow)
  }, [todayKey])

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

  // The days on screen, and the planner's horizon, decide which accepted sessions to load. Loaded ranges only grow.
  const visibleKeys = useMemo(
    () => (view === 'month' ? monthGridKeys(monthOf(anchor).year, monthOf(anchor).month) : weekKeys(anchor)),
    [view, anchor],
  )
  const neededFrom = visibleKeys[0] < todayKey ? visibleKeys[0] : todayKey
  const horizonKey = addDaysToKey(todayKey, PLANNER_HORIZON_DAYS)
  const neededTo = visibleKeys[visibleKeys.length - 1] > horizonKey ? visibleKeys[visibleKeys.length - 1] : horizonKey

  useEffect(() => {
    if (sessionsLoadedRange && sessionsLoadedRange.from <= neededFrom && sessionsLoadedRange.to >= neededTo) return
    let active = true
    const from = sessionsLoadedRange && sessionsLoadedRange.from < neededFrom ? sessionsLoadedRange.from : neededFrom
    const to = sessionsLoadedRange && sessionsLoadedRange.to > neededTo ? sessionsLoadedRange.to : neededTo
    loadPlannedSessions(client, userId, from, to)
      .then((sessions) => {
        if (!active) return
        setPlannedSessions(sessions)
        setSessionsUnavailable(false)
        setSessionsLoadedRange({ from, to })
      })
      .catch(() => {
        if (!active) return
        // The table cannot be read (for example it has not been applied yet): show no accepted sessions and say nothing.
        setPlannedSessions(null)
        setSessionsUnavailable(true)
        setSessionsLoadedRange({ from, to })
      })
    return () => { active = false }
  }, [client, userId, neededFrom, neededTo, sessionsLoadedRange])

  const activeCourseIds = useMemo(() => new Set(programme.map((item) => item.course.id)), [programme])
  const activeAssessments = useMemo(() => assessments.filter((assessment) => {
    if (assessment.courseId) return activeCourseIds.has(assessment.courseId)
    const subjectMatches = programme.filter((item) => item.subject.id === assessment.subjectId)
    return !assessment.moduleId && subjectMatches.length === 1
  }), [activeCourseIds, assessments, programme])

  const upcoming = useMemo(
    () => activeAssessments
      .filter((assessment) => assessment.assessmentDate >= todayKey)
      .sort((left, right) => left.assessmentDate.localeCompare(right.assessmentDate)),
    [activeAssessments, todayKey],
  )

  const snapshot = useMemo(
    () => buildPlannerSnapshot(learningStates, activeAssessments, availability, exceptions, preferences, now, plannedSessions ?? []),
    [learningStates, activeAssessments, availability, exceptions, preferences, plannedSessions, now],
  )

  const setupMissingExams = activeAssessments.length === 0
  const setupMissingAvailability = availability === null
  const setupComplete = !setupMissingExams && !setupMissingAvailability

  const topicLabel = useCallback((forCourseId: string | undefined, topicId: string) => {
    const state = learningStates.find((candidate) => (!forCourseId || courseIdForLearningState(candidate) === forCourseId) && candidate.adapter.getTopic(topicId))
    return state?.adapter.getTopic(topicId)?.shortTitle ?? topicId
  }, [learningStates])

  const planContext = useMemo<PlanContext>(() => ({
    todayKey,
    sessions: plannedSessions ?? [],
    schedule: snapshot?.schedule ?? [],
    assessments: activeAssessments,
    weeklyMinutes: availability?.weeklyMinutes ?? null,
    exceptions,
    subjectForCourse: (forCourseId) => {
      const entry = programme.find((item) => item.course.id === forCourseId)
      return entry ? subjectFor(programme, entry.subject.id, forCourseId) : { subjectId: '', name: courseLabel(programme, forCourseId), ...resolveSubjectIdentity('', courseLabel(programme, forCourseId)) }
    },
    subjectForItem: (item) => subjectFor(programme, item.subjectId, item.courseId),
    subjectForAssessment: (assessment) => subjectFor(programme, assessment.subjectId, assessment.courseId),
    topicLabel,
    suggestedActivityLabel: activityLabel,
  }), [todayKey, plannedSessions, snapshot, activeAssessments, availability, exceptions, programme, topicLabel])

  const buildDay = useMemo(() => createPlanDayBuilder(planContext), [planContext])
  const visibleDays = useMemo(() => visibleKeys.map(buildDay), [visibleKeys, buildDay])

  const monthIndex = monthOf(anchor).month
  const isMonth = view === 'month'
  // The summary covers the whole week (Day and Week views) or the days inside the month, never the muted days around it.
  const periodDays = isMonth ? visibleDays.filter((day) => sameMonth(day.key, anchor)) : visibleDays
  const periodStart = periodDays[0]?.key ?? anchor
  const periodEnd = periodDays[periodDays.length - 1]?.key ?? anchor
  const summary = useMemo(
    () => summarisePeriod(periodDays, todayKey, periodStart, periodEnd, overdueSessionCount(periodDays)),
    [periodDays, todayKey, periodStart, periodEnd],
  )

  const week = weekTitle(anchor, todayKey)
  const pageTitle = isMonth ? (sameMonth(anchor, todayKey) ? 'Your month' : monthLabel(anchor, todayKey)) : week.title
  const summaryLabel = isMonth ? monthLabel(anchor, todayKey) : week.label
  const atNow = isMonth ? sameMonth(anchor, todayKey) : weekStart(anchor) === weekStart(todayKey)

  const examHues = useMemo(() => {
    const hues = new Map<string, SubjectHue>()
    activeAssessments.forEach((assessment) => hues.set(assessment.assessmentDate, subjectFor(programme, assessment.subjectId, assessment.courseId).hue))
    return hues
  }, [activeAssessments, programme])

  const examEntries = useMemo(
    () => upcoming.map((assessment) => ({ assessment, subject: subjectFor(programme, assessment.subjectId, assessment.courseId) })),
    [upcoming, programme],
  )

  const addSessionCourses = useMemo<PlanAddSessionCourse[]>(() => programme.map((item) => {
    const topics = new Map<string, string>()
    learningStates
      .filter((state) => courseIdForLearningState(state) === item.course.id)
      .forEach((state) => state.adapter.listTopics().forEach((topic) => { if (!topics.has(topic.id)) topics.set(topic.id, topic.shortTitle ?? topic.id) }))
    return { courseId: item.course.id, label: item.label, topics: [...topics].map(([id, label]) => ({ id, label })) }
  }).filter((item) => item.topics.length > 0), [programme, learningStates])

  /* -------------------------------------------------------------- Handlers */

  function updateStudyDay(day: RevisionDayOfWeek, delta: number) {
    setStudyDraft((current) => (current ? { ...current, [day]: Math.max(0, Math.min(MAX_STUDY_MINUTES, current[day] + delta)) } : current))
  }

  function startEditingStudyTime() {
    setStudyDraft(availability?.weeklyMinutes ?? { monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0 })
  }

  async function handleSaveAvailability() {
    if (!studyDraft) return
    setSaving(true)
    setMessage('')
    try {
      const saved = await saveAvailabilityProfile(client, userId, { weeklyMinutes: studyDraft })
      setAvailability(saved)
      setStudyDraft(null)
      setMessage('Study time saved. REV has re-planned around it. Sessions you have done stay put.')
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Could not save study time.')
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
      setExamsOpen(false)
      setMessage('Exam added. REV has re-planned around the new date.')
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
      setExamsOpen(false)
      setMessage('Assessment added. REV has re-planned around it.')
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
      setMessage('Removed. REV has re-planned from what is left.')
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Could not remove assessment.')
    } finally {
      setSaving(false)
    }
  }

  async function handleStartSuggested(entry: PlanSuggestedItem) {
    const item: PlannerItem = entry.item
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

  function startSession(session: PlannedSession) {
    const section = session.activityType === 'learn' ? 'learn' : session.activityType === 'exam_prep' ? 'exam-prep' : 'practice'
    window.location.assign(routeHash(learnerCourseRoute(session.courseId, section)))
  }

  function replaceSession(updated: PlannedSession) {
    setPlannedSessions((current) => (current ?? []).map((session) => (session.sessionId === updated.sessionId ? updated : session)))
  }

  async function changeSessionStatus(session: PlannedSession, status: PlannedSessionStatus) {
    setMessage('')
    try {
      replaceSession(await setPlannedSessionStatus(client, userId, session.sessionId, status))
      setMessage(status === 'done' ? 'Marked as done.' : status === 'skipped' ? 'Skipped. That topic can be suggested again.' : 'Back on your plan.')
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Could not update that session.')
    }
  }

  async function moveSession(session: PlannedSession, date: string) {
    if (!date) {
      setMessage('Choose a day to move it to.')
      return false
    }
    setMessage('')
    try {
      replaceSession(await movePlannedSession(client, userId, session.sessionId, date))
      setMessage('Moved.')
      return true
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Could not move that session.')
      return false
    }
  }

  async function deleteSession(session: PlannedSession) {
    setMessage('')
    try {
      await removePlannedSession(client, userId, session.sessionId)
      setPlannedSessions((current) => (current ?? []).filter((item) => item.sessionId !== session.sessionId))
      setMessage('Removed from your plan.')
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Could not remove that session.')
    }
  }

  async function handleAddSession(session: NewPlannedSession) {
    setSaving(true)
    setAddSessionError('')
    try {
      const saved = await addPlannedSession(client, userId, session)
      setPlannedSessions((current) => [...(current ?? []), saved])
      setAddSessionOpen(false)
      goTo('day', saved.plannedDate)
      setMessage('Session added to your plan.')
    } catch (error: unknown) {
      setAddSessionError(error instanceof Error ? error.message : 'Could not add that session.')
    } finally {
      setSaving(false)
    }
  }

  const actions: PlanRowActions = {
    onStartSession: startSession,
    onStartSuggested: (entry) => void handleStartSuggested(entry),
    onStatus: (session, status) => void changeSessionStatus(session, status),
    onMove: moveSession,
    onRemove: (session) => void deleteSession(session),
  }

  /* ----------------------------------------------------------------- View */

  function renderExamManager() {
    return (
      <div className="pln-overlay">
        <OverlayBackdrop label="Close exam dates" onClick={() => setExamsOpen(false)} />
        <ModalShell className="pln-dialog pln-dialog--wide" labelledBy="manage-exams-title" onDismiss={() => setExamsOpen(false)} initialFocusSelector="select, input">
          <div className="pln-dialog__form">
            <div className="pln-dialog__head">
              <div>
                <p className="eyebrow">Exam dates</p>
                <h2 id="manage-exams-title">Your exams</h2>
                <p className="pln-card__note">REV uses these dates to see what is getting closer and when exam-style work becomes more useful.</p>
              </div>
              <Button variant="tertiary" size="compact" onClick={() => setExamsOpen(false)}>Close</Button>
            </div>
            {activeAssessments.length > 0 && (
              <ol className="plan-exam-list">
                {[...activeAssessments].sort((left, right) => left.assessmentDate.localeCompare(right.assessmentDate)).map((assessment) => (
                  <li key={assessment.assessmentId}>
                    <div><span className="tag">{assessmentTypeLabel(assessment.assessmentType)}</span><strong>{assessment.title}</strong><span>{courseLabel(programme, assessment.courseId, assessment.subjectId)}</span></div>
                    <div className="plan-exam-date"><strong>{formatDate(assessment.assessmentDate)}</strong></div>
                    <Button variant="tertiary" size="compact" disabled={saving} onClick={() => void handleRemoveAssessment(assessment.assessmentId)}>Remove<span className="sr-only"> {assessment.title}</span></Button>
                  </li>
                ))}
              </ol>
            )}
            {examTemplates.length > 0 && (
              <form className="plan-add-exam" onSubmit={handleAddKnownExam}>
                <SelectField label="Exam" value={selectedExamTemplate?.key ?? ''} onChange={(event) => setExamTemplateKey(event.target.value)}>
                  {examTemplates.map((template) => <option key={template.key} value={template.key}>{template.courseLabel} · {template.paperLabel}</option>)}
                </SelectField>
                <TextField label="Exam date" type="date" required value={examDate} onChange={(event) => setExamDate(event.target.value)} />
                <Button type="submit" disabled={saving || !selectedExamTemplate}>Add exam</Button>
              </form>
            )}
            <button className="plan-disclosure-link" type="button" onClick={() => setOtherAssessmentOpen((open) => !open)} aria-expanded={otherAssessmentOpen}>+ Add a mock, topic test or other assessment</button>
            {otherAssessmentOpen && (
              <form className="planner-form plan-other-assessment" onSubmit={handleAddAssessment}>
                <SelectField label="Course" value={selectedCourseId} required onChange={(event) => setCourseId(event.target.value)}>
                  {programme.map((item) => <option key={item.course.id} value={item.course.id}>{item.label}</option>)}
                </SelectField>
                <TextField label="What is it?" value={title} required maxLength={120} placeholder="e.g. Paper 2 mock" onChange={(event) => setTitle(event.target.value)} />
                <div className="planner-field-grid">
                  <SelectField label="Type" value={assessmentType} onChange={(event) => setAssessmentType(event.target.value as AssessmentType)}>
                    <option value="mock">Mock</option><option value="topic_test">Topic test</option><option value="other">Other</option>
                  </SelectField>
                  <TextField label="Date" type="date" required value={assessmentDate} onChange={(event) => setAssessmentDate(event.target.value)} />
                </div>
                <SelectField label="Importance" value={importance} onChange={(event) => setImportance(event.target.value as AssessmentImportance)}>
                  <option value="normal">Normal</option><option value="high">Higher priority</option>
                </SelectField>
                <Button type="submit" disabled={saving || programme.length === 0}>Add assessment</Button>
              </form>
            )}
          </div>
        </ModalShell>
      </div>
    )
  }

  const canAddSession = programme.length > 0 && !loading && !sessionsUnavailable && addSessionCourses.length > 0

  const missingText = setupMissingExams && setupMissingAvailability
    ? 'Add your exam dates and your study time, and REV will plan what to work on.'
    : setupMissingExams
      ? 'Add your exam dates and REV will plan what to work on.'
      : 'Add your study time and REV will plan what fits your week.'

  return (
    <main className="dashboard page-screen planner-screen interface-plan-screen pln" aria-labelledby="plan-page-title">
      <header className="pln-head">
        <h1 id="plan-page-title">{programme.length === 0 ? 'Plan' : pageTitle}</h1>
        {canAddSession && <Button onClick={() => { setAddSessionError(''); setAddSessionOpen(true) }}><Icon name="plus" size="compact" />Add session</Button>}
      </header>

      {message && <Status className="planner-message" tone="info" aria-live="polite">{message}</Status>}

      {loading
        ? <LoadingState className="planner-panel">Loading your plan…</LoadingState>
        : programme.length === 0
          ? <EmptyState className="planner-panel" title="Add a course before building your plan" description="REV will not create a plan from courses you have not selected." action={<Button onClick={onOpenCourses}>Go to Courses</Button>} />
          : (
            <>
              <PlanNav
                view={view}
                anchorKey={anchor}
                todayKey={todayKey}
                atNow={atNow}
                examHues={examHues}
                onShift={(direction) => goTo(view, isMonth ? shiftMonth(anchor, direction, todayKey) : addDaysToKey(anchor, direction * 7))}
                onGo={(key) => goTo(view, key)}
                onToday={() => goTo(view, todayKey)}
                onView={(next) => goTo(next, anchor)}
              />

              <div className="pln-layout">
                <div className="pln-main">
                  <PlanSummaryCard label={summaryLabel} summary={summary} />

                  {!setupComplete && (
                    <Surface variant="quiet" className="pln-setup-note" aria-label="Finish setting up your plan">
                      <Icon name="plan" />
                      <div>
                        <strong>Your plan is waiting on you</strong>
                        <p>{missingText} You can do it in the cards beside this. Sessions you add yourself show here either way.</p>
                      </div>
                    </Surface>
                  )}

                  {snapshot?.capacityState === 'prioritising' && summary.phase !== 'past' && (
                    <p className="pln-note">There is not enough study time to cover everything before your exams, so REV is focusing on the work that will help most.</p>
                  )}

                  {view === 'day' && <PlanDayView days={visibleDays} selectedKey={anchor} todayKey={todayKey} actions={actions} onSelect={(key) => goTo('day', key)} />}
                  {view === 'week' && <PlanWeekView days={visibleDays} todayKey={todayKey} actions={actions} onOpenDay={(key) => goTo('day', key)} />}
                  {view === 'month' && <PlanMonthView days={visibleDays} monthIndex={monthIndex} onOpenDay={(key) => goTo('day', key)} />}
                </div>

                <div className="pln-side">
                  <PlanExamsCard exams={examEntries} todayKey={todayKey} onJump={(key) => goTo(view, key)} onAdd={() => setExamsOpen(true)} />
                  <PlanStudyTimeCard
                    saved={availability?.weeklyMinutes ?? null}
                    draft={studyDraft}
                    saving={saving}
                    onEdit={startEditingStudyTime}
                    onChange={updateStudyDay}
                    onSave={() => void handleSaveAvailability()}
                    onCancel={() => setStudyDraft(null)}
                  />
                </div>
              </div>
            </>
          )}

      {addSessionOpen && (
        <PlanAddSessionDialog
          courses={addSessionCourses}
          defaultDate={anchor}
          todayKey={todayKey}
          saving={saving}
          error={addSessionError}
          onSave={(session) => void handleAddSession(session)}
          onClose={() => setAddSessionOpen(false)}
        />
      )}
      {examsOpen && renderExamManager()}
    </main>
  )
}
