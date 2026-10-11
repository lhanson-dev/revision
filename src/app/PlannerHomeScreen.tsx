import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { loadPlannerSetup, recordPlannerActivityEvent } from '../services/planning/planner-service'
import { addPlannedSession, loadPlannedSessions, type PlannedSession } from '../services/planning/planned-session-service'
import { createSupabaseEvidenceStore, loadLearningEvidence } from '../services/progress/learning-evidence-service'
import { availableCourseSections, createCourseLearningState, createModuleLearningState, type ModuleLearningState } from './catalogue-model'
import { tasksFromPlanner, fallbackHomeTasks, homeActivityLabel, type HomeTask } from './home-task'
import { HomeFocusedActivity } from './HomeFocusedActivity'
import { adaptersForProgramme, type LearnerProgrammeCourse } from './learner-programme'
import { learnerCourseRoute, routeHash, type CourseSection } from './navigation'
import { buildPlannerSnapshot, plannerDaysFromAvailability } from './planner-model'
import { addDays, dayWord, nextFreeDay, plannedTopicKeys, sessionActivityForTask } from './accepted-sessions'
import { buildCourseTiles } from './home-view'
import { homeTaskOnToday, homeTaskMatchesPlanRow, homeToday, upcomingHomeExams, type HomeExam } from './home-v3-model'
import { progressMeasuresFor, progressSummarySentence, readinessAcross } from './progress-summary'
import { activeNotNow, dayKey, pickSuggestion, rankSuggestions, type NotNowRecord } from './rev-suggestions'
import { HomeSetupEmpty, planCardEmptyCopy } from './HomeSetupEmpty'
import { Button, HueProgressBar, Icon, ProgressMeasures, RevMark, SubjectBadge, type IconName } from './ui'
import type { PlanItem } from './plan-model'

type LearningMode = 'learn' | 'practice' | 'exam-prep'

interface PlannerHomeScreenProps {
  client: SupabaseClient
  userId: string
  learnerName: string
  programme: readonly LearnerProgrammeCourse[]
  onOpenPlan: () => void
  onOpenExamDates: () => void
  onOpenProgress: () => void
  onOpenRev: (draft?: string, submit?: boolean) => void
  onOpenCourses: () => void
  onOpenCourse: (courseId: string) => void
  onOpenCourseSection: (courseId: string, section: CourseSection) => void
}

function notNowStorageKey(userId: string) {
  return 'revision.home.not-now.' + userId
}

function readNotNow(userId: string): NotNowRecord | null {
  try {
    const raw = window.sessionStorage.getItem(notNowStorageKey(userId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as NotNowRecord
    return typeof parsed.day === 'string' && Array.isArray(parsed.keys) ? parsed : null
  } catch { return null }
}

function writeNotNow(userId: string, record: NotNowRecord) {
  try { window.sessionStorage.setItem(notNowStorageKey(userId), JSON.stringify(record)) }
  catch { /* Suggestions remain dismissible for this browser visit. */ }
}

function examTypeLabel(kind: HomeExam['kind']) {
  return kind === 'public_exam' ? 'Official exam' : 'Mock exam'
}

function examDateLabel(key: string) {
  return new Date(key + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

const activityIntroductions: readonly {
  id: LearningMode | 'plan' | 'progress' | 'courses'
  title: string
  summary: string
  icon: IconName
}[] = [
  { id: 'learn', title: 'Learn', summary: 'Understand the topics and ideas you need to know.', icon: 'book' },
  { id: 'practice', title: 'Practice', summary: 'Check what you remember, then use your feedback.', icon: 'progress' },
  { id: 'exam-prep', title: 'Exam Prep', summary: 'Work on exam questions, papers and technique.', icon: 'paper' },
  { id: 'plan', title: 'Plan', summary: 'See your week and decide when you can study.', icon: 'plan' },
  { id: 'progress', title: 'Progress', summary: 'See what your answers actually show.', icon: 'progress' },
  { id: 'courses', title: 'Courses', summary: 'Find and manage the courses you study.', icon: 'courses' },
]

/** One real Home runtime: the global shell, planner, evidence and REV conversation remain the owners. */
export function PlannerHomeScreen({
  client, userId, learnerName, programme,
  onOpenPlan, onOpenExamDates, onOpenProgress, onOpenRev, onOpenCourses,
  onOpenCourse, onOpenCourseSection,
}: PlannerHomeScreenProps) {
  const [evidenceLoading, setEvidenceLoading] = useState(true)
  const [setupLoading, setSetupLoading] = useState(true)
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [evidenceError, setEvidenceError] = useState('')
  const [setupError, setSetupError] = useState('')
  const [sessionsError, setSessionsError] = useState('')
  const [learningStates, setLearningStates] = useState<ModuleLearningState[]>([])
  const [setup, setSetup] = useState<Awaited<ReturnType<typeof loadPlannerSetup>> | null>(null)
  const [plannedSessions, setPlannedSessions] = useState<PlannedSession[] | null>(null)
  const [activeTask, setActiveTask] = useState<HomeTask | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [notNow, setNotNow] = useState<NotNowRecord | null>(() => readNotNow(userId))
  const [skipped, setSkipped] = useState<string[]>([])
  const [planNote, setPlanNote] = useState('')
  const [askValue, setAskValue] = useState('')
  const [askFocused, setAskFocused] = useState(false)
  const [chooser, setChooser] = useState<LearningMode | null>(null)
  const chooserRoot = useRef<HTMLDivElement>(null)
  const chooserToggles = useRef<Partial<Record<LearningMode, HTMLButtonElement | null>>>({})
  const today = useMemo(() => new Date(), [])
  const todayKey = dayKey(today)

  // Each data owner is independent. A failed exam/setup read does not erase valid Progress data.
  useEffect(() => {
    let active = true
    const evidenceStore = createSupabaseEvidenceStore(client)
    const adapters = adaptersForProgramme(programme)
    Promise.all(adapters.map((adapter) => loadLearningEvidence(evidenceStore, userId, adapter.manifest.id)))
      .then((evidenceByModule) => {
        if (!active) return
        const evidence = evidenceByModule.flat()
        const states: ModuleLearningState[] = []
        programme.forEach(({ course }) => {
          if (course.sharedLearning) states.push(createCourseLearningState(course, evidence))
          else course.modules.forEach((adapter) => states.push(createModuleLearningState(adapter, evidence)))
        })
        setLearningStates(states)
        setEvidenceError('')
      })
      .catch((error: unknown) => {
        if (active) setEvidenceError(error instanceof Error ? error.message : 'Progress could not be loaded.')
      })
      .finally(() => { if (active) setEvidenceLoading(false) })
    return () => { active = false }
  }, [client, programme, refreshKey, userId])

  useEffect(() => {
    let active = true
    loadPlannerSetup(client, userId)
      .then((value) => {
        if (!active) return
        setSetup(value)
        setSetupError('')
      })
      .catch((error: unknown) => {
        if (active) setSetupError(error instanceof Error ? error.message : 'Your plan and exam dates could not be loaded.')
      })
      .finally(() => { if (active) setSetupLoading(false) })
    return () => { active = false }
  }, [client, refreshKey, userId])

  useEffect(() => {
    let active = true
    loadPlannedSessions(client, userId, todayKey, addDays(todayKey, 27))
      .then((sessions) => {
        if (!active) return
        setPlannedSessions(sessions)
        setSessionsError('')
      })
      .catch((error: unknown) => {
        if (!active) return
        setPlannedSessions(null)
        setSessionsError(error instanceof Error ? error.message : 'Your accepted sessions could not be loaded.')
      })
      .finally(() => { if (active) setSessionsLoading(false) })
    return () => { active = false }
  }, [client, refreshKey, todayKey, userId])

  useEffect(() => {
    if (!chooser) return
    const onOutside = (event: PointerEvent) => {
      if (!chooserRoot.current?.contains(event.target as Node)) setChooser(null)
    }
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setChooser(null)
      chooserToggles.current[chooser]?.focus()
    }
    document.addEventListener('pointerdown', onOutside)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('pointerdown', onOutside)
      document.removeEventListener('keydown', onEscape)
    }
  }, [chooser])

  const assessments = useMemo(() => setup?.assessments.filter((assessment) => {
    if (!assessment.isActive) return false
    if (assessment.courseId) return programme.some((item) => item.course.id === assessment.courseId)
    return programme.filter((item) => item.subject.id === assessment.subjectId).length === 1
  }) ?? [], [setup, programme])

  const snapshot = useMemo(() => setup && !evidenceLoading && !evidenceError
    ? buildPlannerSnapshot(learningStates, assessments, setup.availability, setup.exceptions, setup.preferences, today, plannedSessions ?? [])
    : null,
  [setup, evidenceLoading, evidenceError, learningStates, assessments, plannedSessions, today])

  const todayPlan = useMemo(() => {
    if (!setup || setupLoading || evidenceLoading || evidenceError || sessionsLoading || plannedSessions === null) return null
    return homeToday(todayKey, plannedSessions, snapshot?.schedule ?? [], assessments,
      setup.availability?.weeklyMinutes ?? null, setup.exceptions, programme, learningStates)
  }, [setup, setupLoading, evidenceLoading, evidenceError, sessionsLoading, plannedSessions, todayKey, snapshot, assessments, programme, learningStates])

  const ranked = useMemo(() => evidenceLoading || evidenceError ? [] :
    rankSuggestions(learningStates, assessments, programme, today, plannedTopicKeys(plannedSessions ?? [])),
  [evidenceLoading, evidenceError, learningStates, assessments, programme, today, plannedSessions])
  const hiddenToday = activeNotNow(notNow, today)
  const pick = pickSuggestion(ranked, hiddenToday, skipped)
  const suggestion = pick.suggestion
  const firstTask = suggestion?.task ??
    (!evidenceLoading && !evidenceError && !pick.allHidden ? fallbackHomeTasks(learningStates, programme, 1)[0] ?? null : null)
  const recommendedReason = suggestion?.reason ?? firstTask?.reason
  const plannerTasks = useMemo(() => snapshot ? tasksFromPlanner(snapshot.today, learningStates, programme) : [],
    [snapshot, learningStates, programme])
  const exams = useMemo(() => upcomingHomeExams(assessments, programme, today), [assessments, programme, today])
  const courseTiles = useMemo(() => buildCourseTiles(programme, learningStates), [programme, learningStates])
  const measures = useMemo(() => progressMeasuresFor(learningStates), [learningStates])
  const readiness = useMemo(() => readinessAcross(learningStates), [learningStates])
  const onToday = firstTask && todayPlan ? homeTaskOnToday(firstTask, todayPlan) : false
  const hasPlanSetup = Boolean(setup?.availability)
  const planTag = todayPlan === null ? (loadingPlanUnavailable(setupLoading, sessionsLoading, evidenceLoading) ? 'Checking today’s plan' : 'Plan status unavailable') :
    onToday ? 'On today’s plan' : hasPlanSetup ? 'Not on today’s plan' : 'Not on a plan yet'
  const planEmpty = planCardEmptyCopy({ hasExamDates: assessments.length > 0, hasStudyTimes: hasPlanSetup })

  function retryHome() {
    // Refreshes are user actions; effects only settle the resulting asynchronous requests.
    setEvidenceLoading(true)
    setSetupLoading(true)
    setSessionsLoading(true)
    setPlanNote('')
    setRefreshKey((value) => value + 1)
  }

  async function recordTaskStart(task: HomeTask) {
    if (!task.plannerItem) return
    try {
      await recordPlannerActivityEvent(client, userId, {
        recommendationId: task.plannerItem.recommendationId,
        eventType: 'started',
        subjectId: task.plannerItem.subjectId,
        topicId: task.plannerItem.topicId,
        activityType: task.plannerItem.activityType,
        metadata: { plannerVersion: 1, source: 'home', courseId: task.courseId, capacityState: snapshot?.capacityState ?? 'unknown' },
      })
    } catch { /* The student must still be able to start useful work. */ }
  }

  async function startTask(task: HomeTask) {
    await recordTaskStart(task)
    if (task.activityType === 'exam-question') {
      window.location.assign(routeHash(learnerCourseRoute(task.courseId, 'exam-prep')))
      return
    }
    setActiveTask(task)
  }

  function startPlanRow(row: PlanItem) {
    if (row.kind === 'exam') return
    if (row.kind === 'session') {
      if (row.done || !programme.some((item) => item.course.id === row.session.courseId)) return
      const section = row.session.activityType === 'learn' ? 'learn' : row.session.activityType === 'exam_prep' ? 'exam-prep' : 'practice'
      if (section === 'practice') {
        window.location.assign(routeHash(learnerCourseRoute(row.session.courseId, 'practice', { topicId: row.session.topicId })))
      } else onOpenCourseSection(row.session.courseId, section)
      return
    }
    const task = plannerTasks.find((item) => item.plannerItem?.recommendationId === row.item.recommendationId)
    if (task) void startTask(task)
    else onOpenPlan()
  }

  function suggestSomethingElse() {
    if (!suggestion) return
    setSkipped(pickSuggestion(ranked, hiddenToday, [...skipped, suggestion.key]).skipped)
  }

  function hideUntilTomorrow() {
    if (!suggestion) return
    const record = { day: todayKey, keys: [...hiddenToday, suggestion.key] }
    setNotNow(record)
    writeNotNow(userId, record)
  }

  async function addToPlan() {
    if (!suggestion || !firstTask || !setup || plannedSessions === null) return
    const days = plannerDaysFromAvailability(setup.availability, setup.exceptions, assessments, today)
    const date = nextFreeDay(days, plannedSessions, firstTask.estimatedMinutes, todayKey)
    try {
      const saved = await addPlannedSession(client, userId, {
        plannedDate: date, courseId: firstTask.courseId, topicId: firstTask.topicId,
        activityType: sessionActivityForTask(firstTask.activityType), minutes: firstTask.estimatedMinutes,
        addedBy: 'rev', recommendationId: firstTask.id,
      })
      setPlannedSessions((current) => [...(current ?? []), saved])
      setSkipped([])
      setPlanNote('Added ' + firstTask.topicLabel + ' to ' + dayWord(date, todayKey) + '. You can move it on Plan.')
    } catch (error: unknown) {
      setPlanNote(error instanceof Error ? error.message : 'Could not add this to your plan.')
    }
  }

  function sendHomeQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const question = askValue.trim()
    if (!question) { onOpenRev(); return }
    setAskValue('')
    onOpenRev(question, true)
  }

  const name = learnerName.trim() || 'there'
  const loadingHero = evidenceLoading
  const loadingPlan = setupLoading || sessionsLoading || evidenceLoading
  const selectedPlanRows = todayPlan?.items.filter((item) => item.kind !== 'exam') ?? []
  const focusMode = (mode: LearningMode) => {
    setChooser((current) => current === mode ? null : mode)
  }

  if (activeTask) return <HomeFocusedActivity client={client} userId={userId} task={activeTask}
    onBack={() => setActiveTask(null)} onFinish={() => { setActiveTask(null); retryHome() }} />

  if (programme.length === 0) return (
    <main className="dashboard screen-dashboard home-v2" aria-label="Home">
      <HomeSetupEmpty courseCount={0} hasExamDates={false} hasStudyTimes={false}
        onOpenCourses={onOpenCourses} onOpenPlan={onOpenPlan} onOpenRev={() => onOpenRev()} />
    </main>
  )

  return (
    <main className="dashboard screen-dashboard home-v3" aria-label="Home">
      <section className="home-v3-hero" aria-labelledby="home-v3-heading">
        <div className="home-v3-hero-layout">
          <div className="home-v3-hero-presence">
            <RevMark state={askFocused || askValue ? 'listening' : 'waiting'} size="hero" />
          </div>
          <div className="home-v3-hero-main">
            <div className="powered-by-rev">
              Powered by <span className="rev-compact-wordmark">R<span className="rev-compact-wordmark-e" aria-label="E"><i /><i /><i /></span>V</span>
            </div>
            <h1 id="home-v3-heading">{todayPlan?.allDone ? 'That’s today done, ' + name + '. Nice work.' : 'Hey ' + name + '. Here’s what I’d do next.'}</h1>
            {loadingHero ? <p role="status" className="home-v3-hero-status">Finding your next useful step…</p> :
              evidenceError ? <div className="home-v3-hero-status" role="alert">REV could not read your current progress. <Button variant="secondary" onClick={retryHome}>Try again</Button></div> :
              firstTask ? <div className="home-v3-next">
                <p className="home-v3-hero-eyebrow">{todayPlan?.allDone ? 'If you want to do more' : 'Your next useful step'}</p>
                <p className="home-v3-topic-meta">{firstTask.courseLabel} · {homeActivityLabel(firstTask.activityType)} · {firstTask.estimatedMinutes} min</p>
                <h2>{firstTask.topicLabel}</h2>
                <p className="home-v3-hero-reason">{recommendedReason}{todayPlan?.allDone ? ' You can also stop for today.' : ''}</p>
                <span className="home-v3-plan-tag">{planTag}</span>
                <div className="home-v3-hero-actions">
                  <Button onClick={() => void startTask(firstTask)}>Start {firstTask.estimatedMinutes} min {homeActivityLabel(firstTask.activityType).toLowerCase()} <Icon name="arrow-right" size="inline" /></Button>
                  <Button variant="secondary" onClick={onOpenPlan}>Open Plan</Button>
                </div>
                {suggestion && <details className="home-v3-alternatives">
                  <summary>Other options</summary>
                  <div>
                    <Button variant="tertiary" onClick={suggestSomethingElse}>Suggest something else</Button>
                    <Button variant="tertiary" onClick={hideUntilTomorrow}>Not now</Button>
                    {plannedSessions !== null && !onToday && <Button variant="tertiary" onClick={() => void addToPlan()}>Add to Plan</Button>}
                  </div>
                </details>}
              </div> : <div className="home-v3-no-task">
                <p>{pick.allHidden ? 'You’ve put today’s suggestions aside. They’ll be back tomorrow.' : 'There’s no recommended activity to start just now.'}</p>
                <Button variant="secondary" onClick={onOpenPlan}>Open Plan</Button>
              </div>
            }
          </div>
        </div>
        <form className="home-v3-ask" onSubmit={sendHomeQuestion} aria-label="Ask REV">
          <label htmlFor="home-v3-ask-input" className="sr-only">Ask REV anything</label>
          <input id="home-v3-ask-input" value={askValue} maxLength={240}
            placeholder="Ask REV anything…" onChange={(event) => setAskValue(event.target.value)}
            onFocus={() => setAskFocused(true)} onBlur={() => setAskFocused(false)} />
          <Button type="submit" aria-label={askValue.trim() ? 'Send question to REV' : 'Open Ask REV'}><Icon name="arrow-up" /></Button>
        </form>
      </section>

      {planNote && <p className="home-v3-notice" role="status">{planNote}</p>}

      <div className="home-v3-upper">
        <section className="home-v3-card home-v3-plan" aria-labelledby="home-v3-plan-title" aria-busy={loadingPlan}>
          <header className="home-v3-card-heading">
            <div><p className="home-v3-eyebrow">Your day</p><h2 id="home-v3-plan-title">Today’s plan</h2></div>
            <Button variant="tertiary" onClick={onOpenPlan}>Open Plan <Icon name="arrow-right" size="inline" /></Button>
          </header>
          {loadingPlan ? <p className="home-v3-muted" role="status">Loading today’s plan…</p> :
            setupError || sessionsError ? <div className="home-v3-error" role="alert">
              <p>Your plan is unavailable right now. Your other sections are unaffected.</p>
              <Button variant="secondary" onClick={retryHome}>Try again</Button>
            </div> :
            todayPlan && selectedPlanRows.length > 0 ? <>
              <p className="home-v3-plan-summary">
                <strong>{todayPlan.plannedMinutes} min planned</strong>
                <span> · {todayPlan.doneCount} of {todayPlan.studyCount} done · {todayPlan.plannedMinutes - todayPlan.doneMinutes} min left</span>
              </p>
              <HueProgressBar value={todayPlan.plannedMinutes > 0 ? todayPlan.doneMinutes / todayPlan.plannedMinutes * 100 : 0}
                hue="brand" size="sm" label="Time done against today's plan"
                valueText={todayPlan.doneMinutes + ' of ' + todayPlan.plannedMinutes + ' minutes done'} />
              <ol className="home-v3-plan-rows">
                {selectedPlanRows.map((row) => {
                  const isNext = Boolean(firstTask && onToday && homeTaskMatchesPlanRow(firstTask, row))
                  return <li key={row.key} className={isNext ? 'home-v3-plan-row home-v3-plan-row--next' : 'home-v3-plan-row'}>
                    <SubjectBadge hue={row.subject.hue} mark={row.subject.mark} size="plan" />
                    <span className="home-v3-plan-row-copy">
                      <strong>{row.topic}</strong>
                      <small>{row.subject.name} · {row.activityLabel} · {row.minutes} min{isNext ? ' · REV’s pick above' : ''}</small>
                    </span>
                    {row.kind === 'session' && row.done ? <span className="home-v3-done"><Icon name="check" size="inline" /> Done</span> :
                      <Button variant="tertiary" size="compact" onClick={() => startPlanRow(row)}>{isNext ? 'Up next' : 'Start'} <Icon name="arrow-right" size="inline" /></Button>}
                  </li>
                })}
              </ol>
            </> : <div className="home-v3-empty">
              <p>{planEmpty.text}</p><Button variant="secondary" onClick={onOpenPlan}>{hasPlanSetup ? 'Open Plan' : 'Set up Plan'}</Button>
            </div>}
        </section>

        <section className="home-v3-card home-v3-exams" aria-labelledby="home-v3-exams-title" aria-busy={setupLoading}>
          <header className="home-v3-card-heading">
            <div><p className="home-v3-eyebrow">Coming up</p><h2 id="home-v3-exams-title">Your exams</h2></div>
            <Button variant="tertiary" onClick={onOpenExamDates}>Edit dates <Icon name="pencil" size="inline" /></Button>
          </header>
          {setupLoading ? <p className="home-v3-muted" role="status">Loading your exam dates…</p> :
            setupError ? <div role="alert" className="home-v3-error"><p>Could not load your exam dates.</p><Button variant="secondary" onClick={retryHome}>Try again</Button></div> :
            exams.next ? <>
              {(() => {
                const next = exams.next
                const canOpen = programme.some((entry) => entry.course.id === next.courseId && availableCourseSections(entry.course).includes('exam-prep'))
                return <div className="home-v3-next-exam">
                  <p className="home-v3-eyebrow">Next · {examTypeLabel(next.kind)}</p>
                  <strong className="home-v3-exam-countdown">{next.daysAway === 0 ? 'Today' : 'In ' + next.daysAway + (next.daysAway === 1 ? ' day' : ' days')}</strong>
                  <p>{next.assessment.title}</p>
                  <small>{examDateLabel(next.assessment.assessmentDate)}</small>
                  {canOpen && <Button variant="tertiary" onClick={() => onOpenCourseSection(next.courseId, 'exam-prep')}>Open Exam Prep <Icon name="arrow-right" size="inline" /></Button>}
                </div>
              })()}
              {exams.mocks.length > 0 && <div className="home-v3-exam-group">
                <p className="home-v3-eyebrow">Then · mocks</p>
                <ul>{exams.mocks.map((exam) => <li key={exam.assessment.assessmentId}>
                  <span>{exam.assessment.title}</span><small>{examDateLabel(exam.assessment.assessmentDate)}</small>
                </li>)}</ul>
              </div>}
              {exams.officials.length > 0 && <div className="home-v3-exam-group">
                <p className="home-v3-eyebrow">Official exams</p>
                <ul>{exams.officials.slice(0, 3).map((exam) => <li key={exam.assessment.assessmentId}>
                  <span>{exam.assessment.title}</span><small>{examDateLabel(exam.assessment.assessmentDate)}</small>
                </li>)}</ul>
              </div>}
            </> : <div className="home-v3-empty"><p>No upcoming mock or official exam dates added yet.</p>
              <Button variant="secondary" onClick={onOpenExamDates}>Add exam dates</Button></div>}
        </section>
      </div>

      <section className="home-v3-card home-v3-progress" aria-labelledby="home-v3-progress-title" aria-busy={evidenceLoading}>
        <header className="home-v3-card-heading">
          <div><p className="home-v3-eyebrow">How you’re doing</p><h2 id="home-v3-progress-title">Your progress</h2></div>
          <Button variant="tertiary" onClick={onOpenProgress}>Open Progress <Icon name="arrow-right" size="inline" /></Button>
        </header>
        {evidenceLoading ? <p className="home-v3-muted" role="status">Loading your progress…</p> :
          evidenceError ? <div className="home-v3-error" role="alert"><p>Your learning evidence could not be loaded.</p>
            <Button variant="secondary" onClick={retryHome}>Try again</Button></div> : <>
            <p className="home-v3-section-summary">{progressSummarySentence(measures, firstTask?.topicLabel ?? null)}</p>
            <ProgressMeasures covered={measures.covered} total={measures.total}
              understanding={measures.understanding} readiness={readiness.value} readinessNote={readiness.note} />
          </>}
      </section>

      <section className="home-v3-courses" aria-labelledby="home-v3-courses-title">
        <header className="home-v3-card-heading">
          <div><p className="home-v3-eyebrow">Your subjects</p><h2 id="home-v3-courses-title">Your courses</h2></div>
          <Button variant="tertiary" onClick={onOpenCourses}>All courses <Icon name="arrow-right" size="inline" /></Button>
        </header>
        <div className="home-v3-course-grid">
          {programme.map((entry) => {
            const tile = courseTiles.find((item) => item.courseId === entry.course.id)
            return <button key={entry.course.id} type="button" className="home-v3-course-card"
              onClick={() => onOpenCourse(entry.course.id)} aria-label={'Open ' + entry.label + ' Overview'}>
              <SubjectBadge hue={tile?.hue ?? 'blue'} mark={tile?.mark ?? entry.subject.name.charAt(0)} size="tile" />
              <span><strong>{entry.subject.name}</strong><small>{entry.label}</small>
                {!evidenceLoading && !evidenceError && tile && <span className="home-v3-course-covered">
                  {tile.covered} of {tile.total} topics covered
                </span>}
              </span>
              <Icon name="chevron-right" size="compact" />
            </button>
          })}
        </div>
      </section>

      <section className="home-v3-activities" aria-labelledby="home-v3-activities-title" ref={chooserRoot}>
        <div className="home-v3-activities-head">
          <p className="home-v3-eyebrow">Your choice</p>
          <h2 id="home-v3-activities-title">What do you want to do?</h2>
          <p>You can always choose your own next step.</p>
        </div>
        <div className="home-v3-activity-grid">
          {activityIntroductions.map((activity) => {
            const specific = activity.id === 'learn' || activity.id === 'practice' || activity.id === 'exam-prep'
            const mode = specific ? activity.id as LearningMode : null
            const eligible = mode ? programme.filter((entry) => availableCourseSections(entry.course).includes(mode)) : []
            const isOpen = mode !== null && chooser === mode
            return <div className="home-v3-activity" key={activity.id}>
              <span className="home-v3-activity-icon" aria-hidden="true"><Icon name={activity.icon} /></span>
              <div className="home-v3-activity-copy"><h3>{activity.title}</h3><p>{activity.summary}</p>
                {mode ? eligible.length === 0 ?
                  <Button variant="tertiary" onClick={onOpenCourses}>Find a course</Button> :
                  eligible.length === 1 ?
                    <Button variant="tertiary" onClick={() => onOpenCourseSection(eligible[0].course.id, mode)}>Open {entryLabel(eligible[0].subject.name)} {activity.title} <Icon name="arrow-right" size="inline" /></Button> :
                    <>
                      <button type="button" className="ui-button ui-button--tertiary" aria-expanded={isOpen} aria-controls={'home-v3-choose-' + mode}
                        ref={(node) => { chooserToggles.current[mode] = node }}
                        onClick={() => focusMode(mode)}>Choose a course <Icon name="chevron-right" size="inline" /></button>
                      {isOpen && <ul className="home-v3-course-chooser" id={'home-v3-choose-' + mode}>
                        {eligible.map((entry) => <li key={entry.course.id}>
                          <button type="button" onClick={() => { setChooser(null); onOpenCourseSection(entry.course.id, mode) }}>{entry.label}</button>
                        </li>)}
                      </ul>}
                    </> :
                  <Button variant="tertiary" onClick={activity.id === 'plan' ? onOpenPlan : activity.id === 'progress' ? onOpenProgress : onOpenCourses}>
                    Open {activity.title} <Icon name="arrow-right" size="inline" />
                  </Button>}
              </div>
            </div>
          })}
        </div>
      </section>
    </main>
  )
}

function loadingPlanUnavailable(...values: boolean[]) { return values.some(Boolean) }

function entryLabel(subject: string) {
  return subject.trim() || 'course'
}
