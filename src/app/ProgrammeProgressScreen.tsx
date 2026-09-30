import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { LearningEvidence } from '../engine/evidence/evidence'
import { createSupabaseEvidenceStore, loadLearningEvidence } from '../services/progress/learning-evidence-service'
import type { LearnerCourseMembership } from '../services/courses/learner-course-service'
import {
  createCourseLearningState,
  createModuleLearningState,
  type CatalogueSubject,
  type ModuleLearningState,
} from './catalogue-model'
import { assignSubjectColours } from './home-view'
import { adaptersForProgramme, projectLearnerProgramme } from './learner-programme'
import { Button, EmptyState, LoadingState, Status } from './ui'

type ProgrammeProgressScreenProps = {
  client: SupabaseClient
  userId: string
  catalogue: readonly CatalogueSubject[]
  memberships: readonly LearnerCourseMembership[]
  onOpenCourses: () => void
  onOpenCourseProgress: (courseId: string) => void
}

function courseStates(programme: ReturnType<typeof projectLearnerProgramme>['courses'], evidence: readonly LearningEvidence[]) {
  const states: Array<{ courseId: string; label: string; states: ModuleLearningState[] }> = []
  programme.forEach(({ course, label }) => {
    if (course.sharedLearning) {
      states.push({ courseId: course.id, label, states: [createCourseLearningState(course, evidence)] })
      return
    }
    states.push({
      courseId: course.id,
      label,
      states: course.modules.map((adapter) => createModuleLearningState(adapter, evidence)),
    })
  })
  return states
}

export function ProgrammeProgressScreen({ client, userId, catalogue, memberships, onOpenCourses, onOpenCourseProgress }: ProgrammeProgressScreenProps) {
  const programme = useMemo(() => projectLearnerProgramme(catalogue, memberships), [catalogue, memberships])
  const adapters = useMemo(() => adaptersForProgramme(programme.courses), [programme.courses])
  const [evidence, setEvidence] = useState<LearningEvidence[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    if (adapters.length === 0) return () => { active = false }
    const store = createSupabaseEvidenceStore(client)
    Promise.all(adapters.map((adapter) => loadLearningEvidence(store, userId, adapter.manifest.id)))
      .then((items) => {
        if (!active) return
        setEvidence(items.flat())
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

  const grouped = useMemo(() => courseStates(programme.courses, evidence), [evidence, programme.courses])
  const allStates = grouped.flatMap((item) => item.states)
  const subjectColours = useMemo(() => assignSubjectColours(programme.courses.map((item) => item.subject.id)), [programme.courses])
  const subjectIdByCourse = useMemo(() => new Map(programme.courses.map((item) => [item.course.id, item.subject.id])), [programme.courses])
  const totalTopics = allStates.reduce((sum, state) => sum + state.topicCount, 0)
  const evidencedTopics = allStates.reduce((sum, state) => sum + state.evidencedTopics, 0)
  const readinessAvailable = allStates.filter((state) => state.readiness.score !== null).length

  if (adapters.length > 0 && loading) return <LoadingState className="page-screen">Loading progress across your active courses…</LoadingState>

  return (
    <main className="dashboard screen-dashboard page-screen" aria-labelledby="global-progress-title">
      <header className="page-heading"><p className="eyebrow">Your evidence picture</p><h1 id="global-progress-title">Progress</h1><p>What your answers so far show across the courses you’re studying.</p></header>

      {error && <Status tone="warning">{error}</Status>}
      {programme.unknownCourseIds.length > 0 && <Status tone="warning">A saved course no longer resolves to the published catalogue. Its historical evidence is preserved, but it is excluded from this active programme view.</Status>}

      {programme.courses.length === 0 ? (
        <EmptyState title="Add a course to build your progress view" description="Add the courses you’re studying and your progress will build here as you work." action={<Button onClick={onOpenCourses}>Choose a course</Button>} />
      ) : (
        <>
          <div className="progress-overview">
            <article><small>Topics covered</small><strong>{evidencedTopics} / {totalTopics}</strong><p>Topics where you’ve done at least one scored activity.</p></article>
            <article><small>Scored activities</small><strong>{evidence.length}</strong><p>Questions and checks you’ve completed and had marked.</p></article>
            <article><small>Exam readiness</small><strong>{readinessAvailable} / {allStates.length}</strong><p>Courses with enough varied work for a readiness estimate. Keep practising to unlock it.</p></article>
          </div>

          <section className="home-section" aria-labelledby="course-progress-list-title">
            <div className="section-heading"><div><p className="eyebrow">Active programme</p><h2 id="course-progress-list-title">Progress by course</h2></div></div>
            <div className="subject-list">
              {grouped.map((item) => {
                const topics = item.states.reduce((sum, state) => sum + state.topicCount, 0)
                const evidenced = item.states.reduce((sum, state) => sum + state.evidencedTopics, 0)
                const scoredStates = item.states.filter((state) => state.readiness.score !== null)
                const averageReadiness = scoredStates.length === 0 ? null : Math.round(scoredStates.reduce((sum, state) => sum + (state.readiness.score ?? 0), 0) / scoredStates.length)
                return (
                  <article className="course-card global-progress-card" key={item.courseId} style={{ '--tile-fill': subjectColours.get(subjectIdByCourse.get(item.courseId) ?? '')?.fill } as CSSProperties}>
                    <div><span className="tag">{evidenced} / {topics} topics evidenced</span><h3>{item.label}</h3><p>{averageReadiness === null ? 'Readiness is still building from varied evidence.' : `${averageReadiness}% current supported readiness across the available course/component evidence.`}</p></div>
                    <span className="progress-course-bar" role="progressbar" aria-label={`${item.label} topics evidenced`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={topics === 0 ? 0 : Math.round((evidenced / topics) * 100)}><span style={{ width: `${topics === 0 ? 0 : Math.round((evidenced / topics) * 100)}%` }} /></span>
                    <Button onClick={() => onOpenCourseProgress(item.courseId)}>Open course progress</Button>
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
