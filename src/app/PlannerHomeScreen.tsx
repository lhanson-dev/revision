import { useEffect, useMemo, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { loadPlannerSetup, recordPlannerActivityEvent } from '../services/planning/planner-service'
import { addPlannedSession, loadPlannedSessions, type PlannedSession } from '../services/planning/planned-session-service'
import { createSupabaseEvidenceStore, loadLearningEvidence } from '../services/progress/learning-evidence-service'
import { createCourseLearningState, createModuleLearningState, type ModuleLearningState } from './catalogue-model'
import { tasksFromPlanner, type HomeTask } from './home-task'
import { HomeFocusedActivity } from './HomeFocusedActivity'
import { adaptersForProgramme, type LearnerProgrammeCourse } from './learner-programme'
import { learnerCourseRoute, routeHash } from './navigation'
import { buildPlannerSnapshot, plannerDaysFromAvailability } from './planner-model'
import { addDays, dayWord, nextFreeDay, plannedTopicKeys, sessionActivityForTask } from './accepted-sessions'
import { buildCourseTiles, nextExam } from './home-view'
import { activeNotNow, dayKey, pickSuggestion, rankSuggestions, type NotNowRecord } from './rev-suggestions'
import { HomeSetupEmpty, planCardEmptyCopy } from './HomeSetupEmpty'
import { RevPresence } from './RevPresence'
import { Icon, RevSuggestionCard, SubjectBadge, UnderstandingBar } from './ui'

interface PlannerHomeScreenProps {
  client: SupabaseClient
  userId: string
  learnerName: string
  programme: readonly LearnerProgrammeCourse[]
  onOpenPlan: () => void
  onOpenRev: () => void
  onOpenCourses: () => void
  onOpenCourse: (courseId: string) => void
}

function planSummary(tasks: readonly HomeTask[]) {
  const minutes = tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0)
  return `${minutes} minutes · ${tasks.length} focused ${tasks.length === 1 ? 'activity' : 'activities'}`
}

function notNowStorageKey(userId: string) {
  return `revision.home.not-now.${userId}`
}

/** "Not now" is kept for this browser session only until the suggestion-events table exists (data model proposal, section 8). */
function readNotNow(userId: string): NotNowRecord | null {
  try {
    const raw = window.sessionStorage.getItem(notNowStorageKey(userId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as NotNowRecord
    return typeof parsed.day === 'string' && Array.isArray(parsed.keys) ? parsed : null
  } catch {
    return null
  }
}

function writeNotNow(userId: string, record: NotNowRecord) {
  try {
    window.sessionStorage.setItem(notNowStorageKey(userId), JSON.stringify(record))
  } catch {
    // Not now still works for this visit even if the browser will not store it.
  }
}

export function PlannerHomeScreen(props: PlannerHomeScreenProps) {
  const { client, userId, learnerName, programme, onOpenPlan, onOpenRev, onOpenCourses, onOpenCourse } = props
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [learningStates, setLearningStates] = useState<ModuleLearningState[]>([])
  const [setup, setSetup] = useState<Awaited<ReturnType<typeof loadPlannerSetup>> | null>(null)
  const [activeTask, setActiveTask] = useState<HomeTask | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [notNow, setNotNow] = useState<NotNowRecord | null>(() => readNotNow(userId))
  const [skipped, setSkipped] = useState<string[]>([])
  // Accepted sessions. If the table is not available yet, `plannedSessions` stays null and "Add to" is not offered.
  const [plannedSessions, setPlannedSessions] = useState<PlannedSession[] | null>(null)
  const [planNote, setPlanNote] = useState('')

  useEffect(() => {
    let active = true
    const adapters = adaptersForProgramme(programme)
    const evidenceStore = createSupabaseEvidenceStore(client)
    Promise.all([
      loadPlannerSetup(client, userId),
      Promise.all(adapters.map((adapter) => loadLearningEvidence(evidenceStore, userId, adapter.manifest.id))),
    ])
      .then(([plannerSetup, evidenceByModule]) => {
        if (!active) return
        const evidence = evidenceByModule.flat()
        const states: ModuleLearningState[] = []
        programme.forEach(({ course }) => {
          if (course.sharedLearning) states.push(createCourseLearningState(course, evidence))
          else course.modules.forEach((adapter) => states.push(createModuleLearningState(adapter, evidence)))
        })
        setLearningStates(states)
        setSetup(plannerSetup)
        setError('')
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof Error ? caught.message : 'Could not load today’s revision plan.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [client, programme, refreshKey, userId])

  // Accepted sessions load on their own: Home never waits for them. If they cannot be read, Home simply does not offer "Add to".
  useEffect(() => {
    let active = true
    const todayKey = dayKey(new Date())
    loadPlannedSessions(client, userId, todayKey, addDays(todayKey, 27))
      .then((sessions) => { if (active) setPlannedSessions(sessions) })
      .catch(() => { if (active) setPlannedSessions(null) })
    return () => { active = false }
  }, [client, userId, refreshKey])

  const snapshot = useMemo(() => setup
    ? buildPlannerSnapshot(learningStates, setup.assessments, setup.availability, setup.exceptions, setup.preferences, new Date(), plannedSessions ?? [])
    : null,
  [learningStates, plannedSessions, setup])

  const plannerTasks = useMemo(
    () => snapshot ? tasksFromPlanner(snapshot.today, learningStates, programme) : [],
    [learningStates, programme, snapshot],
  )
  const today = useMemo(() => new Date(), [])
  // REV's suggestion is chosen by the rules in rev-suggestions.ts, not by the planner or a model.
  const ranked = useMemo(
    () => setup ? rankSuggestions(learningStates, setup.assessments, programme, today, plannedTopicKeys(plannedSessions ?? [])) : [],
    [learningStates, plannedSessions, programme, setup, today],
  )
  const hiddenToday = activeNotNow(notNow, today)
  const pick = pickSuggestion(ranked, hiddenToday, skipped)
  const suggestion = pick.suggestion
  const firstTask = suggestion?.task ?? null
  const planDay = useMemo(() => {
    if (!firstTask || !setup || plannedSessions === null) return null
    const days = plannerDaysFromAvailability(setup.availability, setup.exceptions, setup.assessments, today)
    return nextFreeDay(days, plannedSessions, firstTask.estimatedMinutes, dayKey(today))
  }, [firstTask, plannedSessions, setup, today])
  const planDayLabel = planDay ? dayWord(planDay, dayKey(today)) : 'plan'
  const courseTiles = useMemo(() => buildCourseTiles(programme, learningStates), [learningStates, programme])
  const planCard = planCardEmptyCopy({ hasExamDates: (setup?.assessments.length ?? 0) > 0, hasStudyTimes: Boolean(setup?.availability) })
  const exam = useMemo(() => setup ? nextExam(setup.assessments, today) : null, [setup, today])
  const todayLabel = today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  async function recordTaskStart(task: HomeTask) {
    if (!task.plannerItem) return
    try {
      await recordPlannerActivityEvent(client, userId, {
        recommendationId: task.plannerItem.recommendationId,
        eventType: 'started',
        subjectId: task.plannerItem.subjectId,
        topicId: task.plannerItem.topicId,
        activityType: task.plannerItem.activityType,
        metadata: {
          plannerVersion: 1,
          source: 'home',
          capacityState: snapshot?.capacityState ?? 'unknown',
          courseId: task.plannerItem.courseId ?? null,
        },
      })
    } catch {
      // Activity logging must never block a learner from starting useful revision.
    }
  }

  async function startTask(task: HomeTask) {
    await recordTaskStart(task)
    if (task.activityType === 'exam-question') {
      // Shared-course planner items do not yet carry a paper identity. Route to the
      // exact governed Exam Prep surface rather than pretending a paper was selected.
      window.location.hash = routeHash(learnerCourseRoute(task.courseId, 'exam-prep'))
      return
    }
    setActiveTask(task)
  }

  function suggestSomethingElse() {
    if (!suggestion) return
    setSkipped(pickSuggestion(ranked, hiddenToday, [...skipped, suggestion.key]).skipped)
  }

  async function addToPlan() {
    if (!suggestion || !firstTask || !setup || plannedSessions === null) return
    const days = plannerDaysFromAvailability(setup.availability, setup.exceptions, setup.assessments, today)
    const date = nextFreeDay(days, plannedSessions, firstTask.estimatedMinutes, dayKey(today))
    try {
      const saved = await addPlannedSession(client, userId, {
        plannedDate: date,
        courseId: firstTask.courseId,
        topicId: firstTask.topicId,
        activityType: sessionActivityForTask(firstTask.activityType),
        minutes: firstTask.estimatedMinutes,
        addedBy: 'rev',
        recommendationId: firstTask.id,
      })
      setPlannedSessions((current) => [...(current ?? []), saved])
      setSkipped([])
      setPlanNote(`Added ${firstTask.topicLabel} to ${dayWord(date, dayKey(today))}. You can move it on Plan.`)
    } catch (caught: unknown) {
      setPlanNote(caught instanceof Error ? caught.message : 'Could not add that to your plan.')
    }
  }

  function hideUntilTomorrow() {
    if (!suggestion) return
    const record = { day: dayKey(today), keys: [...hiddenToday, suggestion.key] }
    setNotNow(record)
    writeNotNow(userId, record)
  }

  function completeFocusedTask() {
    setActiveTask(null)
    setLoading(true)
    setRefreshKey((value) => value + 1)
  }

  function retryHome() {
    setLoading(true)
    setRefreshKey((value) => value + 1)
  }

  const showSetup = !error && !loading && (programme.length === 0 || !firstTask)

  if (activeTask) {
    return (
      <HomeFocusedActivity
        client={client}
        userId={userId}
        task={activeTask}
        onBack={() => setActiveTask(null)}
        onFinish={completeFocusedTask}
      />
    )
  }

  return (
    <main className="dashboard screen-dashboard home-v2" aria-label="Home">
      <header className="home-v2-head">
        <div>
          <p className="home-v2-date">{todayLabel}</p>
          <h1 id="planner-home-welcome">Hey {learnerName}. Here’s what I’d do today.</h1>
        </div>
        <button className="home-v2-ask" type="button" onClick={onOpenRev}>
          <RevPresence size="compact" decorative />
          Ask REV anything
        </button>
      </header>

      <div className={`home-v2-grid${showSetup ? ' home-v2-grid--setup' : ''}`}>
        <div className="home-v2-main">
          {error && (
            <div className="returning-home-empty">
              <h3>Revision could not refresh today’s evidence.</h3>
              <p>{error}</p>
              <div className="returning-home-empty-actions"><button className="primary" type="button" onClick={retryHome}>Try again</button><button type="button" onClick={onOpenCourses}>Open Courses</button></div>
            </div>
          )}

          {!error && loading && <p className="home-v2-loading" role="status">Working out the most useful place to start…</p>}

          {showSetup && (
            <HomeSetupEmpty
              courseCount={programme.length}
              hasExamDates={(setup?.assessments.length ?? 0) > 0}
              hasStudyTimes={Boolean(setup?.availability)}
              onOpenCourses={onOpenCourses}
              onOpenPlan={onOpenPlan}
              onOpenRev={onOpenRev}
            />
          )}

          {planNote && <p className="home-v2-plan-note" role="status" aria-live="polite">{planNote}</p>}

          {!error && !loading && suggestion && firstTask && (
            <RevSuggestionCard
              className="home-v2-hero"
              variant="hero"
              eyebrow={`REV suggests · ${firstTask.estimatedMinutes} min`}
              title={firstTask.topicLabel}
              reason={`Why: ${suggestion.reason}`}
              primaryAction={{ label: `Start ${firstTask.estimatedMinutes} min`, onClick: () => void startTask(firstTask) }}
              planAction={plannedSessions === null ? undefined : { label: `Add to ${planDayLabel}`, onClick: () => void addToPlan() }}
              secondaryAction={{ label: 'Suggest something else', onClick: suggestSomethingElse }}
              tertiaryAction={{ label: 'Not now', onClick: hideUntilTomorrow }}
            />
          )}

          {!error && !loading && !suggestion && pick.allHidden && (
            <section className="home-v2-rest" aria-labelledby="home-v2-rest-title">
              <h2 id="home-v2-rest-title">That’s all I’d suggest for today.</h2>
              <p>You’ve put today’s suggestions to one side. They’ll be back tomorrow, or you can look at your plan or ask me something.</p>
              <div className="home-v2-rest-actions"><button type="button" onClick={onOpenPlan}>Open your plan</button><button type="button" onClick={onOpenRev}>Ask REV</button></div>
            </section>
          )}

          {courseTiles.length > 0 && (
            <section className="home-v2-courses" aria-labelledby="home-v2-courses-title">
              <header>
                <h2 id="home-v2-courses-title">Your courses</h2>
                <button type="button" onClick={onOpenCourses}>See all</button>
              </header>
              <ul>
                {courseTiles.map((tile) => (
                  <li key={tile.courseId}>
                    <button type="button" onClick={() => onOpenCourse(tile.courseId)} aria-label={`Open ${tile.subjectName}`}>
                      <span className="home-v2-tile-head" style={{ background: `var(--subject-${tile.hue})`, color: `var(--subject-${tile.hue}-on)` }}>
                        <SubjectBadge hue={tile.hue} mark={tile.mark} size="tile" onSolid />
                        <strong>{tile.subjectName}</strong>
                      </span>
                      <span className="home-v2-tile-body">
                        <small>{tile.total === 0 ? 'No topics yet' : `${tile.covered} of ${tile.total} topics covered`}</small>
                        <UnderstandingBar counts={tile.counts} size="sm" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {!showSetup && <aside className="home-v2-side" aria-label="Coming up">
          {exam && (
            <section className="home-v2-exam">
              <p className="home-v2-eyebrow"><Icon name="clock" size="inline" /> Next exam</p>
              <p className="home-v2-exam-days"><strong>{exam.daysAway}</strong> {exam.daysAway === 1 ? 'day' : 'days'}</p>
              <p className="home-v2-exam-title">{exam.title} · {exam.dateLabel}</p>
            </section>
          )}
          <section className="home-v2-plan-link">
            <p className="home-v2-eyebrow">Your plan</p>
            <p>{plannerTasks.length === 0 ? planCard.text : planSummary(plannerTasks)}</p>
            <button type="button" onClick={onOpenPlan}>{plannerTasks.length === 0 ? planCard.label : 'View full plan'} <Icon name="arrow-right" size="inline" /></button>
          </section>
        </aside>}
      </div>
    </main>
  )
}
