import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { loadPlannerSetup, recordPlannerActivityEvent } from '../services/planning/planner-service'
import { loadPlannedSessions, type PlannedSession } from '../services/planning/planned-session-service'
import { createSupabaseEvidenceStore, loadLearningEvidence } from '../services/progress/learning-evidence-service'
import { createCourseLearningState, createModuleLearningState, type ModuleLearningState } from './catalogue-model'
import { homeActivityLabel, supportedActivityMinutes, type HomeTask } from './home-task'
import { HomeFocusedActivity } from './HomeFocusedActivity'
import { adaptersForProgramme, type LearnerProgrammeCourse } from './learner-programme'
import { type CourseSection } from './navigation'
import { buildPlannerSnapshot } from './planner-model'
import { buildPlannerSnapshot as buildBaselinePlannerSnapshot } from './planner-model-baseline'
import { ACCEPTED_COMMITMENT_HORIZON_DAYS, DETAILED_PLANNER_HORIZON_DAYS } from './plan-session-windows'
import { addDays } from './accepted-sessions'
import { buildCourseTiles } from './home-view'
import { homeTaskOnToday, homeTaskMatchesPlanRow, homeToday, upcomingHomeExams, type HomeExam } from './home-v3-model'
import { progressMeasuresFor, progressSummarySentence, readinessAcross } from './progress-summary'
import { activeNotNow, dayKey, type NotNowRecord } from './rev-suggestions'
import { HomeSetupEmpty, planCardEmptyCopy } from './HomeSetupEmpty'
import { PoweredByRev } from './RevCompactWordmark'
import { Button, HueProgressBar, Icon, ProgressMeasures, RevMark, SubjectBadge } from './ui'
import { todayRecommendations, learnRouteForTask, ACCEPTED_ACTIVITY_UNAVAILABLE, taskForTodayRow } from './today-recommendations'
import { resolveSubjectIdentity } from './subject-palette'
import { useLocalDay } from './use-local-day'
import type { PlanItem } from './plan-model'

interface PlannerHomeScreenProps {
  client: SupabaseClient
  userId: string
  pilotEnabled?: boolean
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
    return typeof parsed.day === 'string' && Array.isArray(parsed.keys) && parsed.keys.every((key) => typeof key === 'string') ? parsed : null
  } catch { return null }
}

function writeNotNow(userId: string, record: NotNowRecord) {
  try { window.sessionStorage.setItem(notNowStorageKey(userId), JSON.stringify(record)) }
  catch { /* Alternative choices remain available for this browser visit. */ }
}

function examTypeLabel(kind: HomeExam['kind']) {
  return kind === 'public_exam' ? 'Official exam' : 'Mock exam'
}

function examDateLabel(key: string, short = false) {
  return new Date(key + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: short ? undefined : 'long', day: 'numeric', month: short ? 'short' : 'long',
  })
}

/** One real Home runtime: the global shell, planner, evidence and REV conversation remain the owners. */
export function PlannerHomeScreen({
  client, userId, learnerName, programme, pilotEnabled = true,
  onOpenPlan, onOpenExamDates, onOpenProgress, onOpenRev, onOpenCourses,
  onOpenCourse,
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
  const [planNote, setPlanNote] = useState('')
  const [askValue, setAskValue] = useState('')
  const [askFocused, setAskFocused] = useState(false)
  const today = useLocalDay()
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
    loadPlannedSessions(client, userId, todayKey, addDays(todayKey, ACCEPTED_COMMITMENT_HORIZON_DAYS - 1))
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

  const assessments = useMemo(() => setup?.assessments.filter((assessment) => {
    if (!assessment.isActive) return false
    if (assessment.courseId) return programme.some((item) => item.course.id === assessment.courseId)
    return programme.filter((item) => item.subject.id === assessment.subjectId).length === 1
  }) ?? [], [setup, programme])

  const pilotRestricted = import.meta.env.PROD && pilotEnabled
  const snapshot = useMemo(() => setup && !evidenceLoading && !evidenceError
    ? pilotEnabled
      ? buildPlannerSnapshot(learningStates, assessments, setup.availability, setup.exceptions, setup.preferences, today, plannedSessions ?? [], DETAILED_PLANNER_HORIZON_DAYS, pilotRestricted)
      : buildBaselinePlannerSnapshot(learningStates, assessments, setup.availability, setup.exceptions, setup.preferences, today, plannedSessions ?? [], DETAILED_PLANNER_HORIZON_DAYS)
    : null,
  [setup, evidenceLoading, evidenceError, learningStates, assessments, plannedSessions, today, pilotEnabled, pilotRestricted])

  const todayPlan = useMemo(() => {
    if (!setup || setupLoading || sessionsLoading || plannedSessions === null) return null
    return homeToday(todayKey, plannedSessions, snapshot?.schedule ?? [], assessments,
      setup.availability?.weeklyMinutes ?? null, setup.exceptions, programme, learningStates)
  }, [setup, setupLoading, evidenceLoading, evidenceError, sessionsLoading, plannedSessions, todayKey, snapshot, assessments, programme, learningStates])

  const hiddenToday = activeNotNow(notNow, today)
  const choices = todayRecommendations(todayPlan, learningStates, programme, !setup?.availability || assessments.length === 0,
    !evidenceLoading && !setupLoading && !sessionsLoading && !evidenceError && !setupError && !sessionsError && plannedSessions !== null, today, notNow, assessments, setup?.preferences ?? []).filter((task) => !pilotRestricted || task.activityType !== 'exam-question')
  const firstTask = choices[0] ?? null
  const suggestion = firstTask ? { key: firstTask.id } : null
  const recommendedReason = firstTask?.reason
  const availableChoices = todayRecommendations(todayPlan, learningStates, programme, !setup?.availability || assessments.length === 0,
    !evidenceLoading && !setupLoading && !sessionsLoading && !evidenceError && !setupError && !sessionsError && plannedSessions !== null, today, null, assessments, setup?.preferences ?? [])
  const alternativesExhausted = availableChoices.length > 0 && hiddenToday.length > 0 && choices.length === 0 &&
    !evidenceError && !setupError && !sessionsError && !evidenceLoading && !setupLoading && !sessionsLoading && !todayPlan?.allDone
  const exams = useMemo(() => upcomingHomeExams(assessments, programme, today), [assessments, programme, today])
  const courseTiles = useMemo(() => buildCourseTiles(programme, learningStates), [programme, learningStates])
  const measures = useMemo(() => progressMeasuresFor(learningStates), [learningStates])
  const readiness = useMemo(() => readinessAcross(learningStates), [learningStates])
  const onToday = firstTask && todayPlan ? homeTaskOnToday(firstTask, todayPlan) : false
  const hasPlanSetup = Boolean(setup?.availability)
  const planTag = todayPlan === null ? (loadingPlanUnavailable(setupLoading, sessionsLoading, evidenceLoading) ? 'Checking today’s plan' : 'Plan status unavailable') :
    onToday ? 'On today’s plan' : hasPlanSetup && assessments.length > 0 ? 'Not on today’s plan' : 'Not on a plan yet'
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
        metadata: { plannerVersion: 1, source: 'home', courseId: task.courseId, capacityState: snapshot?.capacityState ?? 'unknown', ...(task.activityType === 'quick-check' || task.activityType === 'flashcards' ? { completionMode: 'explicit_focused_session' } : {}) },
      })
    } catch { /* The student must still be able to start useful work. */ }
  }

  async function startTask(task: HomeTask) {
    if (pilotRestricted && task.activityType === 'exam-question') { setPlanNote('Original exam simulations are not part of this restricted pilot. Choose Practice or Learn.'); return }
    if (task.activityType === 'learn') { window.location.assign(learnRouteForTask(task)!); return }
    await recordTaskStart(task)
    setActiveTask(task)
  }

  function startPlanRow(row: PlanItem) {
    if (row.kind === 'exam') return
    const task = taskForTodayRow(row, learningStates, programme, assessments, todayKey)
    if (task) void startTask(task)
    else setPlanNote(ACCEPTED_ACTIVITY_UNAVAILABLE)
  }

  function suggestSomethingElse() {
    if (!suggestion) return
    const record = { day: todayKey, keys: [...hiddenToday, suggestion.key] }
    setNotNow(record)
    writeNotNow(userId, record)
  }

  function sendHomeQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const question = askValue.trim()
    if (!question) { onOpenRev(); return }
    setAskValue('')
    onOpenRev(question, true)
  }

  const name = learnerName.trim() || 'there'
  const loadingHero = evidenceLoading || setupLoading || sessionsLoading
  const loadingPlan = setupLoading || sessionsLoading || evidenceLoading
  const allStudyRows = todayPlan?.items.filter((item) => item.kind !== 'exam') ?? []
  const outstandingRows = allStudyRows.filter((row) => {
    const task = taskForTodayRow(row, learningStates, programme, assessments, todayKey)
    return task !== null && (!pilotRestricted || task.activityType !== 'exam-question')
  })
  const selectedPlanRows = outstandingRows.slice(0, 3)
  const bookedFocused = Boolean(firstTask?.sessionId && (firstTask.activityType === 'quick-check' || firstTask.activityType === 'flashcards'))
  const immediateMinutes = firstTask ? supportedActivityMinutes(firstTask) : 0
  if (activeTask) return <HomeFocusedActivity client={client} userId={userId} task={activeTask} programme={programme}
    onBack={() => setActiveTask(null)} onFinish={() => { setActiveTask(null); retryHome() }} />

  if (programme.length === 0) return (
    <main className="dashboard screen-dashboard home-v3" aria-label="Home">
      <HomeSetupEmpty courseCount={0} hasExamDates={false} hasStudyTimes={false}
        onOpenCourses={onOpenCourses} onOpenPlan={onOpenPlan} onOpenRev={onOpenRev} />
    </main>
  )

  return (
    <main className="dashboard screen-dashboard home-v3" aria-label="Home">
      {pilotRestricted && <p role="status" className="home-v3-notice">Planner pilot: recommendations are being evaluated. Original exam simulations are not included.</p>}
      <section className="home-v3-hero" aria-labelledby="home-v3-heading">
        <div className="home-v3-hero-layout">
          <div className="home-v3-hero-presence">
            <RevMark state={askFocused || askValue ? 'listening' : 'waiting'} onInverse size="hero" />
            <PoweredByRev />
          </div>
          <div className="home-v3-hero-main">
            <h1 id="home-v3-heading">{!loadingHero && !setupError && !sessionsError && !evidenceError && todayPlan?.allDone ? 'That’s today done, ' + name + '. Nice work.' : 'Hey ' + name + '. Here’s what I’d do next.'}</h1>
            {loadingHero ? <p role="status" className="home-v3-hero-status">Finding your next useful step…</p> :
              evidenceError ? <div className="home-v3-hero-status" role="alert">I couldn’t read your progress just now. <Button variant="secondary" onInverse onClick={retryHome}>Try again</Button></div> :
              firstTask ? <div className="home-v3-next">
                <p className="ui-eyebrow">{todayPlan?.allDone ? 'If you want to do more' : 'Your next useful step'}</p>
                <p className="home-v3-topic-meta"><SubjectBadge {...resolveSubjectIdentity(firstTask.subjectId, firstTask.subjectName)} size="plan" />{firstTask.courseLabel} · {homeActivityLabel(firstTask.activityType)} · {firstTask.source === 'fallback' ? 'Not scheduled' : bookedFocused
                  ? firstTask.estimatedMinutes + ' min booked · about ' + immediateMinutes + ' min practice'
                  : firstTask.estimatedMinutes + ' min'}</p>
                <h2>{firstTask.topicLabel}</h2>
                <p className="home-v3-hero-reason">{recommendedReason}{todayPlan?.allDone ? ' You can also stop for today.' : ''}</p>
                <span className="home-v3-plan-tag"><Icon name="clock" size="inline" />{planTag}</span>
                <div className="home-v3-hero-actions">
                  <Button size="large" onClick={() => void startTask(firstTask)}>Start {firstTask.source === 'fallback' ? '' : bookedFocused ? 'about ' + immediateMinutes + ' min ' : firstTask.estimatedMinutes + ' min '} {homeActivityLabel(firstTask.activityType).toLowerCase()} <Icon name="arrow-right" size="inline" /></Button>
                  <Button variant="tertiary" onInverse onClick={suggestSomethingElse}>Suggest something else</Button>
                </div>
              </div> : <div className="home-v3-no-task">
                <p>{setupError || sessionsError ? 'I couldn’t check today’s plan just now.' : todayPlan?.allDone ? 'Everything on today’s plan is done. You can stop for today.' : alternativesExhausted ? "That's everything I'd suggest for today. You can still choose what you'd like to work on in your plan." : todayPlan?.rest && todayPlan.studyCount === 0 ? 'There’s no planned work for today. You can choose your own work in Courses.' : 'There’s no supported recommendation to start just now. You can choose your own work in Courses.'}</p>
                <Button variant="secondary" onInverse onClick={onOpenPlan}>Open Plan</Button>
              </div>
            }
          </div>
        </div>
        <form className="home-v3-ask" onSubmit={sendHomeQuestion} aria-label="Ask REV">
          <input id="home-v3-ask-input" aria-label="Ask REV anything" value={askValue} maxLength={240}
            placeholder="Ask REV anything…" onChange={(event) => setAskValue(event.target.value)}
            onFocus={() => setAskFocused(true)} onBlur={() => setAskFocused(false)} />
          <Button type="submit" aria-label={askValue.trim() ? 'Send question to REV' : 'Open Ask REV'}><Icon name="arrow-up" /></Button>
        </form>
      </section>

      {planNote && <p className="home-v3-notice" role="status">{planNote}</p>}

      <div className="home-v3-upper">
        <section className="home-v3-card home-v3-plan" aria-labelledby="home-v3-plan-title" aria-busy={loadingPlan}>
          <header className="home-v3-card-heading">
            <div><h2 id="home-v3-plan-title">Today’s plan</h2></div>
            <Button variant="tertiary" onClick={onOpenPlan}>Open Plan <Icon name="arrow-right" size="inline" /></Button>
          </header>
          {loadingPlan ? <p className="home-v3-muted" role="status">Loading today’s plan…</p> :
            setupError || sessionsError ? <div className="home-v3-error" role="alert">
              <p>Your plan is unavailable right now. Your other sections are unaffected.</p>
              <Button variant="secondary" onClick={retryHome}>Try again</Button>
            </div> :
            todayPlan && allStudyRows.length > 0 ? <>
              <p className="home-v3-plan-summary">
                <strong>{todayPlan.plannedMinutes} min planned</strong>
                <span> · {todayPlan.doneCount} of {todayPlan.studyCount} done · {todayPlan.plannedMinutes - todayPlan.doneMinutes} min left</span>
              </p>
              <HueProgressBar value={todayPlan.plannedMinutes > 0 ? todayPlan.doneMinutes / todayPlan.plannedMinutes * 100 : 0}
                hue="brand" size="sm" label="Time done against today's plan"
                valueText={todayPlan.doneMinutes + ' of ' + todayPlan.plannedMinutes + ' minutes done'} />
              {todayPlan.allDone ? <p className="home-v3-done"><Icon name="check" size="inline" />Everything on today’s plan is done.</p> : <>
              <ol className="home-v3-plan-rows">
                {selectedPlanRows.map((row) => {
                  const isNext = Boolean(firstTask && onToday && homeTaskMatchesPlanRow(firstTask, row))
                  return <li key={row.key} data-kind={row.kind} className={isNext ? 'home-v3-plan-row home-v3-plan-row--next' : 'home-v3-plan-row'}>
                    <SubjectBadge hue={row.subject.hue} mark={row.subject.mark} size="plan" />
                    <span className="home-v3-plan-row-copy">
                      <strong>{row.topic}</strong>
                      <small>{row.subject.name} · {row.activityLabel} · {row.minutes} min{isNext ? ' · REV’s pick' : ''}</small>
                    </span>
                    <Button variant="secondary" onClick={() => startPlanRow(row)}>Start <Icon name="arrow-right" size="inline" /></Button>
                  </li>
                })}
              </ol>
              {outstandingRows.length > 3 && <p className="home-v3-muted">{outstandingRows.length - 3} more later today · see them all in Plan</p>}
              {outstandingRows.length === 0 && <p className="home-v3-muted">Your remaining sessions have been kept. Open their courses to choose supported work.</p>}
              </>}
            </> : <div className="home-v3-empty">
              <p>{todayPlan?.rest ? 'There’s no planned work for today.' : planEmpty.text}</p><Button variant="secondary" onClick={onOpenPlan}>{hasPlanSetup ? 'Open Plan' : 'Set up Plan'}</Button>
            </div>}
        </section>

        <section className="home-v3-card home-v3-exams" aria-labelledby="home-v3-exams-title" aria-busy={setupLoading}>
          <header className="home-v3-card-heading">
            <div><h2 id="home-v3-exams-title">Your exams</h2></div>
            <Button variant="tertiary" onClick={onOpenExamDates}>Edit dates <Icon name="pencil" size="inline" /></Button>
          </header>
          {setupLoading ? <p className="home-v3-muted" role="status">Loading your exam dates…</p> :
            setupError ? <div role="alert" className="home-v3-error"><p>Could not load your exam dates.</p><Button variant="secondary" onClick={retryHome}>Try again</Button></div> :
            exams.next ? <>
              {(() => {
                const next = exams.next
                const entry = programme.find((item) => item.course.id === next.courseId)!
                const identity = resolveSubjectIdentity(entry.subject.id, entry.subject.name)
                return <div className="home-v3-next-exam" style={{ background: `var(--subject-${identity.hue}-tint)` }}>
                  <strong className="home-v3-exam-countdown">{next.daysAway === 0 ? 'Today' : <>{next.daysAway}<small>{next.daysAway === 1 ? 'day away' : 'days away'}</small></>}</strong>
                  <div><p className="home-v3-topic-meta"><SubjectBadge {...identity} size="plan" />{entry.subject.name}</p>
                    <p>{examTypeLabel(next.kind)}</p>
                    <p>{next.assessment.title}</p>
                    <small>{examDateLabel(next.assessment.assessmentDate)}</small></div>
                </div>
              })()}
              {exams.later.length > 0 && <div className="home-v3-exam-group">
                <ul>{exams.later.map((exam) => <li key={exam.assessment.assessmentId}>
                  <span>{exam.assessment.title} · {examTypeLabel(exam.kind)}</span><small>{examDateLabel(exam.assessment.assessmentDate, true)}</small>
                </li>)}</ul>
              </div>}
            </> : <div className="home-v3-empty"><p>No upcoming mock or official exam dates added yet.</p>
              <Button variant="secondary" onClick={onOpenExamDates}>Add exam dates</Button></div>}
        </section>
      </div>

      <section className="home-v3-card home-v3-progress" aria-labelledby="home-v3-progress-title" aria-busy={evidenceLoading}>
        <header className="home-v3-card-heading">
          <div><h2 id="home-v3-progress-title">Your progress</h2></div>
          <Button variant="tertiary" onClick={onOpenProgress}>Open Progress <Icon name="arrow-right" size="inline" /></Button>
        </header>
        {evidenceLoading ? <p className="home-v3-muted" role="status">Loading your progress…</p> :
          evidenceError ? <div className="home-v3-error" role="alert"><p>Your learning evidence could not be loaded.</p>
            <Button variant="secondary" onClick={retryHome}>Try again</Button></div> : <>
            <p className="home-v3-section-summary">{progressSummarySentence(measures, firstTask?.topicLabel ?? null)}</p>
            <ProgressMeasures variant="flat" covered={measures.covered} total={measures.total}
              understanding={measures.understanding} readiness={readiness.value} readinessNote={readiness.note} />
          </>}
      </section>

      <section className="home-v3-card home-v3-courses" aria-labelledby="home-v3-courses-title">
        <header className="home-v3-card-heading">
          <div><h2 id="home-v3-courses-title">Your courses</h2></div>
          <Button variant="tertiary" onClick={onOpenCourses}>All courses <Icon name="arrow-right" size="inline" /></Button>
        </header>
        <div className="home-v3-course-grid">
          {programme.map((entry) => {
            const tile = courseTiles.find((item) => item.courseId === entry.course.id)
            return <button key={entry.course.id} type="button" className="home-v3-course-card"
              onClick={() => onOpenCourse(entry.course.id)} aria-label={'Open ' + entry.label + ' Overview'}>
              <SubjectBadge hue={tile?.hue ?? resolveSubjectIdentity(entry.subject.id, entry.subject.name).hue} mark={tile?.mark ?? resolveSubjectIdentity(entry.subject.id, entry.subject.name).mark} size="tile" />
              <span><strong>{entry.subject.name}</strong><small>{entry.label}</small>
                {!evidenceLoading && !evidenceError && tile && <span className="home-v3-course-covered">
                  <HueProgressBar value={tile.total > 0 ? tile.covered / tile.total * 100 : 0} hue={tile.hue} size="sm" label={entry.label + ' topics covered'} valueText={tile.covered + ' of ' + tile.total + ' topics covered'} />
                </span>}
              </span>
              <Icon name="chevron-right" size="compact" />
            </button>
          })}
        </div>
      </section>

    </main>
  )
}

function loadingPlanUnavailable(...values: boolean[]) { return values.some(Boolean) }
