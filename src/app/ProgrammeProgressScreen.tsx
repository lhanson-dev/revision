import { useEffect, useMemo, useState } from 'react'
import { loadPlannerSetup } from '../services/planning/planner-service'
import { loadPlannedSessions, type PlannedSession } from '../services/planning/planned-session-service'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { LearningEvidence } from '../engine/evidence/evidence'
import { createSupabaseEvidenceStore, loadLearningEvidence } from '../services/progress/learning-evidence-service'
import { loadLearnExposures, type LearnPageExposure } from '../services/progress/learn-exposure-service'
import type { LearnerCourseMembership } from '../services/courses/learner-course-service'
import {
  createCourseLearningState,
  createModuleLearningState,
  type CatalogueSubject,
  type ModuleLearningState,
} from './catalogue-model'
import { ProgressIntro } from './ProgressIntro'
import { homeToday } from './home-v3-model'
import { buildPlannerSnapshot } from './planner-model'
import { ACCEPTED_COMMITMENT_HORIZON_DAYS, DETAILED_PLANNER_HORIZON_DAYS } from './plan-session-windows'
import { addDays } from './accepted-sessions'
import { todayRecommendations, readTodayChoice } from './today-recommendations'
import { dayKey } from './rev-suggestions'
import { useLocalDay } from './use-local-day'
import { RevPresence } from './RevPresence'
import { progressActionFromPlannerTask, progressMeasuresFor, progressSummarySentence, readinessAcross, readinessFor } from './progress-summary'
import { resolveSubjectIdentity } from './subject-palette'
import { adaptersForProgramme, projectLearnerProgramme } from './learner-programme'
import { Button, EmptyState, LoadingState, ProgressMeasures, Status, SubjectBadge } from './ui'

type ProgrammeProgressScreenProps = {
  client: SupabaseClient
  userId: string
  catalogue: readonly CatalogueSubject[]
  memberships: readonly LearnerCourseMembership[]
  onOpenCourses: () => void
  onOpenHome: () => void
  onOpenCourseProgress: (courseId: string) => void
  onOpenCourseSection: (courseId: string, section: CourseSection) => void
}

function courseStates(programme: ReturnType<typeof projectLearnerProgramme>['courses'], evidence: readonly LearningEvidence[], exposures: readonly LearnPageExposure[]) {
  const states: Array<{ courseId: string; label: string; states: ModuleLearningState[] }> = []
  programme.forEach(({ course, label }) => {
    if (course.sharedLearning) {
      states.push({ courseId: course.id, label, states: [createCourseLearningState(course, evidence, exposures)] })
      return
    }
    states.push({
      courseId: course.id,
      label,
      states: course.modules.map((adapter) => createModuleLearningState(adapter, evidence, exposures, course.id)),
    })
  })
  return states
}

export function ProgrammeProgressScreen({ client, userId, catalogue, memberships, onOpenCourses, onOpenHome, onOpenCourseProgress }: ProgrammeProgressScreenProps) {
  const programme = useMemo(() => projectLearnerProgramme(catalogue, memberships), [catalogue, memberships])
  const adapters = useMemo(() => adaptersForProgramme(programme.courses), [programme.courses])
  const [evidence, setEvidence] = useState<LearningEvidence[]>([])
  const [exposures, setExposures] = useState<LearnPageExposure[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [plannerSetup, setPlannerSetup] = useState<Awaited<ReturnType<typeof loadPlannerSetup>> | null>(null)
  const [acceptedSessions, setAcceptedSessions] = useState<PlannedSession[] | null>(null)
  const [plannerLoading, setPlannerLoading] = useState(true)
  const [plannerError, setPlannerError] = useState('')
  const now = useLocalDay()
  const todayKey = dayKey(now)

  useEffect(() => {
    let active = true
    if (adapters.length === 0) return () => { active = false }
    const store = createSupabaseEvidenceStore(client)
    Promise.all([
      Promise.all(adapters.map((adapter) => loadLearningEvidence(store, userId, adapter.manifest.id))),
      loadLearnExposures(client, userId),
    ])
      .then(([items, reviewed]) => {
        if (!active) return
        setEvidence(items.flat())
        setExposures(reviewed)
        setError('')
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof Error ? caught.message : 'Could not load your progress.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [adapters, client, userId])

  // One FI-001 action is projected into global Progress; evidence measures remain separate.
  useEffect(() => {
    let active = true
    if (programme.courses.length === 0) {
      setPlannerLoading(false)
      return () => { active = false }
    }
    setPlannerLoading(true)
    void Promise.all([
      loadPlannerSetup(client, userId),
      loadPlannedSessions(client, userId, todayKey, addDays(todayKey, ACCEPTED_COMMITMENT_HORIZON_DAYS - 1)),
    ]).then(([setup, sessions]) => {
      if (!active) return
      setPlannerSetup(setup)
      setAcceptedSessions(sessions)
      setPlannerError('')
    }).catch((caught: unknown) => {
      if (!active) return
      setPlannerSetup(null)
      setAcceptedSessions(null)
      setPlannerError(caught instanceof Error ? caught.message : 'Could not read your current plan.')
    }).finally(() => { if (active) setPlannerLoading(false) })
    return () => { active = false }
  }, [client, userId, todayKey, programme.courses.length])

  const grouped = useMemo(() => courseStates(programme.courses, evidence, exposures), [evidence, exposures, programme.courses])
  const allStates = useMemo(() => grouped.flatMap((item) => item.states), [grouped])
  const measures = useMemo(() => progressMeasuresFor(allStates), [allStates])
  const readiness = useMemo(() => readinessAcross(allStates), [allStates])
  const activeAssessments = useMemo(() => plannerSetup?.assessments.filter((assessment) => {
    if (!assessment.isActive) return false
    if (assessment.courseId) return programme.courses.some((item) => item.course.id === assessment.courseId)
    return programme.courses.filter((item) => item.subject.id === assessment.subjectId).length === 1
  }) ?? [], [plannerSetup, programme.courses])
  const snapshot = useMemo(() =>
    plannerSetup && acceptedSessions !== null && !loading && !error
      ? buildPlannerSnapshot(allStates, activeAssessments, plannerSetup.availability,
        plannerSetup.exceptions, plannerSetup.preferences, now, acceptedSessions, DETAILED_PLANNER_HORIZON_DAYS)
      : null,
  [plannerSetup, acceptedSessions, loading, error, allStates, activeAssessments, now])
  const nextTask = useMemo(() => {
    if (!plannerSetup || plannerLoading || plannerError || acceptedSessions === null || loading || error) return null
    const todayPlan = homeToday(todayKey, acceptedSessions, snapshot?.schedule ?? [], activeAssessments,
      plannerSetup.availability?.weeklyMinutes ?? null, plannerSetup.exceptions, programme.courses, allStates)
    return todayRecommendations(todayPlan, allStates, programme.courses,
      !plannerSetup.availability || activeAssessments.length === 0, true, now,
      readTodayChoice(userId), activeAssessments, plannerSetup.preferences)[0] ?? null
  }, [plannerSetup, plannerLoading, plannerError, acceptedSessions, loading, error,
    todayKey, snapshot, activeAssessments, programme.courses, allStates, now, userId])
  const nextAction = useMemo(() => progressActionFromPlannerTask(nextTask), [nextTask])
  const nextTopicName = nextAction?.topicName ?? null

  if (adapters.length > 0 && loading) return <LoadingState className="page-screen">Loading progress across your active courses…</LoadingState>
  if (error) return (
    <main className="dashboard page-screen" aria-label="Progress temporarily unavailable">
      <Status tone="warning">Your saved progress could not be loaded. Revision will not show zero coverage or readiness while your existing records are unavailable.</Status>
      <Button onClick={() => window.location.reload()}>Retry loading progress</Button>
      <Button variant="secondary" onClick={onOpenCourses}>Open Courses</Button>
    </main>
  )

  return (
    <main className="dashboard screen-dashboard page-screen" aria-labelledby="global-progress-title">
      <header className="page-heading"><p className="eyebrow">Across your courses</p><h1 id="global-progress-title">Progress</h1></header>

      {error && <Status tone="warning">{error}</Status>}
      {plannerError && <Status tone="warning">Your progress measures are available, but the current Plan recommendation could not be checked. Open Plan to review your next activity.</Status>}
      {programme.unknownCourseIds.length > 0 && <Status tone="warning">A saved course no longer resolves to the published catalogue. Its historical evidence is preserved, but it is excluded from this active programme view.</Status>}

      {programme.courses.length === 0 ? (
        <EmptyState title="Add a course to build your progress view" description="Add the courses you’re studying and your progress will build here as you work." action={<Button onClick={onOpenCourses}>Choose a course</Button>} />
      ) : (
        <>
          <ProgressIntro sentence={progressSummarySentence(measures, nextTopicName)} action={nextAction} onAction={() => onOpenHome()} />

          <ProgressMeasures covered={measures.covered} total={measures.total} understanding={measures.understanding} readiness={readiness.value} readinessNote={readiness.note} />

          {evidence.length === 0 && exposures.length === 0 && (
            <section className="progress-empty-card" aria-labelledby="progress-empty-title">
              <RevPresence size="compact" decorative />
              <div>
                <h2 id="progress-empty-title">The more you revise, the better my suggestions get</h2>
                <p>After a few sessions I’ll show your strong and weak topics here, and tell you what to do next.</p>
              </div>
              <Button onClick={onOpenCourses}>Start first session</Button>
            </section>
          )}

          <section className="home-section" aria-labelledby="course-progress-list-title">
            <div className="section-heading"><div><p className="eyebrow">Active programme</p><h2 id="course-progress-list-title">Progress by course</h2></div></div>
            <div className="progress-course-list">
              {grouped.map((item) => {
                const itemMeasures = progressMeasuresFor(item.states)
                const subject = programme.courses.find((entry) => entry.course.id === item.courseId)?.subject
                const { hue, mark } = resolveSubjectIdentity(subject?.id ?? item.courseId, subject?.name ?? item.label)
                const courseReadiness = item.states.length === 1 ? readinessFor(item.states[0]) : readinessAcross(item.states)
                return (
                  <article className="progress-course-card" key={item.courseId} aria-labelledby={`progress-course-${item.courseId}`}>
                    <header className="progress-course-card__head">
                      <SubjectBadge hue={hue} mark={mark} />
                      <h3 id={`progress-course-${item.courseId}`}>{item.label}</h3>
                    </header>
                    <ProgressMeasures hue={hue} stack covered={itemMeasures.covered} total={itemMeasures.total} understanding={itemMeasures.understanding} readiness={courseReadiness.value} readinessNote={courseReadiness.note} />
                    <Button variant="secondary" onClick={() => onOpenCourseProgress(item.courseId)}>Open {item.label} progress</Button>
                  </article>
                )
              })}
            </div>
          </section>
        </>
      )}
    </main>
  )
}
