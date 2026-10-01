import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { loadPlannerSetup, recordPlannerActivityEvent } from '../services/planning/planner-service'
import { createSupabaseEvidenceStore, loadLearningEvidence } from '../services/progress/learning-evidence-service'
import { createCourseLearningState, createModuleLearningState, type ModuleLearningState } from './catalogue-model'
import { fallbackHomeTasks, tasksFromPlanner, type HomeTask } from './home-task'
import { HomeFocusedActivity } from './HomeFocusedActivity'
import { adaptersForProgramme, type LearnerProgrammeCourse } from './learner-programme'
import { learnerCourseRoute, routeHash } from './navigation'
import { buildPlannerSnapshot } from './planner-model'
import { buildCourseTiles, nextExam, sessionSteps } from './home-view'
import { HomeSetupEmpty } from './HomeSetupEmpty'
import { RevPresence } from './RevPresence'
import { Icon, RevSuggestionCard } from './ui'

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
  if (tasks.length === 0) return 'A useful next step will appear here as Revision learns more.'
  return `${minutes} minutes · ${tasks.length} focused ${tasks.length === 1 ? 'activity' : 'activities'}`
}

export function PlannerHomeScreen(props: PlannerHomeScreenProps) {
  const { client, userId, learnerName, programme, onOpenPlan, onOpenRev, onOpenCourses, onOpenCourse } = props
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [learningStates, setLearningStates] = useState<ModuleLearningState[]>([])
  const [setup, setSetup] = useState<Awaited<ReturnType<typeof loadPlannerSetup>> | null>(null)
  const [activeTask, setActiveTask] = useState<HomeTask | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

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

  const snapshot = useMemo(() => setup
    ? buildPlannerSnapshot(learningStates, setup.assessments, setup.availability, setup.exceptions, setup.preferences)
    : null,
  [learningStates, setup])

  const plannerTasks = useMemo(
    () => snapshot ? tasksFromPlanner(snapshot.today, learningStates, programme) : [],
    [learningStates, programme, snapshot],
  )
  const fallbackTasks = useMemo(
    () => fallbackHomeTasks(learningStates, programme),
    [learningStates, programme],
  )
  const tasks = plannerTasks.length > 0 ? plannerTasks : fallbackTasks
  const firstTask = tasks[0] ?? null
  const steps = useMemo(() => sessionSteps(tasks), [tasks])
  const courseTiles = useMemo(() => buildCourseTiles(programme, learningStates), [learningStates, programme])
  const exam = useMemo(() => setup ? nextExam(setup.assessments, new Date()) : null, [setup])
  const todayLabel = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  const suggestedMinutes = tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0)

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

          {!error && !loading && firstTask && (
            <RevSuggestionCard
              className="home-v2-hero"
              variant="hero"
              eyebrow={`REV suggests · ${suggestedMinutes} min`}
              title={firstTask.topicLabel}
              reason={`Why: ${firstTask.reason}`}
              steps={steps}
              primaryAction={{ label: `Start ${firstTask.estimatedMinutes} min`, onClick: () => void startTask(firstTask) }}
              secondaryAction={{ label: 'Suggest something else', onClick: onOpenRev }}
            />
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
                    <button type="button" onClick={() => onOpenCourse(tile.courseId)} aria-label={`Open ${tile.subjectName}`} style={{ '--tile-fill': tile.colour.fill, '--tile-text': tile.colour.text } as CSSProperties}>
                      <span className="home-v2-tile-mark" aria-hidden="true">{tile.initials}</span>
                      <strong>{tile.subjectName}</strong>
                      <span className="home-v2-bar" role="progressbar" aria-label={`${tile.subjectName} mastery`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={tile.mastery ?? 0}>
                        <span style={{ width: `${tile.mastery ?? 0}%` }} />
                      </span>
                      <small>{tile.mastery === null ? 'Not enough work yet' : `${tile.mastery}% mastered`}</small>
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
              <p className="home-v2-eyebrow">Next exam</p>
              <p className="home-v2-exam-days"><strong>{exam.daysAway}</strong> {exam.daysAway === 1 ? 'day' : 'days'}</p>
              <p className="home-v2-exam-title">{exam.title} · {exam.dateLabel}</p>
            </section>
          )}
          <section className="home-v2-plan-link">
            <p className="home-v2-eyebrow">Your plan</p>
            <p>{planSummary(tasks)}</p>
            <button type="button" onClick={onOpenPlan}>View full plan <Icon name="arrow-right" size="inline" /></button>
          </section>
        </aside>}
      </div>
    </main>
  )
}
