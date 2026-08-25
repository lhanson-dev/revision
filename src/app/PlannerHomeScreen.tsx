import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { loadPlannerSetup, recordPlannerActivityEvent } from '../services/planning/planner-service'
import { createSupabaseEvidenceStore, loadLearningEvidence } from '../services/progress/learning-evidence-service'
import { createCourseLearningState, createModuleLearningState, type ModuleLearningState } from './catalogue-model'
import { fallbackHomeTasks, homeActivityLabel, tasksFromPlanner, type HomeTask } from './home-task'
import { HomeFocusedActivity } from './HomeFocusedActivity'
import { adaptersForProgramme, type LearnerProgrammeCourse } from './learner-programme'
import { learnerCourseRoute, routeHash } from './navigation'
import { buildPlannerSnapshot } from './planner-model'
import { PoweredByRev } from './RevCompactWordmark'
import { RevPresence, type RevPresenceState } from './RevPresence'
import { Icon } from './ui'

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
  const { client, userId, learnerName, programme, onOpenPlan, onOpenRev, onOpenCourses } = props
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [learningStates, setLearningStates] = useState<ModuleLearningState[]>([])
  const [setup, setSetup] = useState<Awaited<ReturnType<typeof loadPlannerSetup>> | null>(null)
  const [prompt, setPrompt] = useState('')
  const [revState, setRevState] = useState<RevPresenceState>('resting')
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
  const laterTasks = tasks.slice(1, 3)

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

  function submitPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = prompt.trim()
    if (!text) {
      setRevState('listening')
      onOpenRev()
      return
    }
    window.sessionStorage.setItem('revision:rev-draft', text)
    setRevState('complete')
    onOpenRev()
  }

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
    <main className="dashboard screen-dashboard living-home returning-home" aria-label="Home">
      <section className="living-home-hero returning-home-hero" aria-labelledby="planner-home-welcome">
        <div className="returning-home-hero-layout">
          <div className="returning-home-rev-stage">
            <RevPresence state={loading ? 'thinking' : revState} size="hero" />
          </div>
          <div className="returning-home-hero-copy">
            <PoweredByRev />
            <h1 id="planner-home-welcome">Hi {learnerName}, what shall we do today?</h1>
            <p className="returning-home-hero-intro">Ask REV anything, or start with the revision plan below.</p>
          </div>
        </div>
        <form className="living-home-prompt" onSubmit={submitPrompt}>
          <input
            value={prompt}
            maxLength={240}
            placeholder="Ask REV anything…"
            aria-label="Ask REV anything"
            onFocus={() => setRevState('listening')}
            onBlur={() => setRevState('resting')}
            onChange={(event) => setPrompt(event.target.value)}
          />
          <button className="living-home-send" type="submit" aria-label="Send to REV"><Icon name="arrow-up" size="compact" /></button>
        </form>
      </section>

      <section className="returning-home-plan" aria-labelledby="returning-home-plan-title">
        <header className="returning-home-plan-head">
          <div>
            <h2 id="returning-home-plan-title">Today’s revision plan</h2>
            <p>{loading ? 'Working out the most useful place to start…' : planSummary(tasks)}</p>
          </div>
          <button className="returning-home-view-plan" type="button" onClick={onOpenPlan}>View full plan <Icon name="arrow-right" size="inline" /></button>
        </header>

        {error && (
          <div className="returning-home-empty">
            <h3>Revision could not refresh today’s evidence.</h3>
            <p>{error}</p>
            <div className="returning-home-empty-actions"><button className="primary" type="button" onClick={retryHome}>Try again</button><button type="button" onClick={onOpenCourses}>Open Courses</button></div>
          </div>
        )}

        {!error && !loading && programme.length === 0 && (
          <div className="returning-home-empty">
            <h3>Add a course to get your first useful recommendation.</h3>
            <p>Revision only plans from the courses you actually study. It will not invent work from the wider catalogue.</p>
            <div className="returning-home-empty-actions"><button className="primary" type="button" onClick={onOpenCourses}>Add a course</button></div>
          </div>
        )}

        {!error && !loading && programme.length > 0 && !firstTask && (
          <div className="returning-home-empty">
            <h3>Your courses are ready, but there is not a supported activity to push forward yet.</h3>
            <p>Open Plan or Courses to choose useful work. Revision will keep the recommendation evidence-based rather than manufacture a priority.</p>
            <div className="returning-home-empty-actions"><button className="primary" type="button" onClick={onOpenPlan}>Open Plan</button><button type="button" onClick={onOpenCourses}>Open Courses</button></div>
          </div>
        )}

        {!error && !loading && firstTask && (
          <div className="returning-home-plan-grid">
            <article className="returning-home-start-card" data-subject-accent={firstTask.subjectAccent}>
              <div className="returning-home-card-top">
                <span className="home-subject-chip">{firstTask.subjectName}</span>
                <span className="returning-home-start-label">Start here</span>
              </div>
              <h3>{firstTask.topicLabel}</h3>
              <p className="returning-home-course-name">{firstTask.courseLabel}</p>
              <div className="returning-home-task-meta"><span>{homeActivityLabel(firstTask.activityType)}</span><span>{firstTask.estimatedMinutes} min</span></div>
              <p className="returning-home-reason">{firstTask.reason}</p>
              <button className="returning-home-start-action" type="button" onClick={() => void startTask(firstTask)}>Start {firstTask.estimatedMinutes} min</button>
            </article>

            <aside className="returning-home-later" aria-label="Remaining revision activities today">
              <h3>{laterTasks.length > 0 ? 'Then today' : 'Today'}</h3>
              {laterTasks.length === 0 ? (
                <p className="returning-home-reason">This is the only useful activity Revision needs to put in front of you right now.</p>
              ) : (
                <ol className="returning-home-task-list">
                  {laterTasks.map((task) => (
                    <li className="returning-home-task-row" key={task.id} data-subject-accent={task.subjectAccent}>
                      <button type="button" onClick={() => void startTask(task)} aria-label={`Start ${task.topicLabel}, ${task.subjectName}`}>
                        <span className="returning-home-task-accent" aria-hidden="true" />
                        <span className="returning-home-task-copy"><strong>{task.topicLabel}</strong><small>{task.subjectName} · {homeActivityLabel(task.activityType)}</small></span>
                        <span className="returning-home-task-time">{task.estimatedMinutes} min</span>
                        <Icon name="chevron-right" size="compact" />
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </aside>
          </div>
        )}
      </section>
    </main>
  )
}
