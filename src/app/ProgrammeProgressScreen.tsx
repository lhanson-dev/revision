import { useEffect, useMemo, useState } from 'react'
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
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [loadedRequestKey, setLoadedRequestKey] = useState('')
  const adapterKey = useMemo(() => adapters.map((adapter) => adapter.manifest.id).join('|'), [adapters])
  const requestKey = adapters.length > 0 ? `${userId}:${adapterKey}:${refreshKey}` : ''
  const loading = requestKey !== '' && loadedRequestKey !== requestKey
  const currentError = loadedRequestKey === requestKey ? error : ''

  useEffect(() => {
    let active = true
    if (!requestKey) return () => { active = false }

    const store = createSupabaseEvidenceStore(client)
    Promise.all(adapters.map((adapter) => loadLearningEvidence(store, userId, adapter.manifest.id)))
      .then((items) => {
        if (!active) return
        setEvidence(items.flat())
        setError('')
        setLoadedRequestKey(requestKey)
      })
      .catch(() => {
        if (!active) return
        setEvidence([])
        setError('Revision could not load your learning evidence. Your saved evidence has not been changed.')
        setLoadedRequestKey(requestKey)
      })
    return () => { active = false }
  }, [adapters, client, requestKey, userId])

  const grouped = useMemo(() => courseStates(programme.courses, evidence), [evidence, programme.courses])
  const allStates = grouped.flatMap((item) => item.states)
  const totalTopics = allStates.reduce((sum, state) => sum + state.topicCount, 0)
  const evidencedTopics = allStates.reduce((sum, state) => sum + state.evidencedTopics, 0)
  const readinessAvailable = allStates.filter((state) => state.readiness.score !== null).length

  if (loading) return <LoadingState className="page-screen">Loading progress across your active courses…</LoadingState>

  return (
    <main className="dashboard screen-dashboard page-screen" aria-labelledby="global-progress-title">
      <header className="page-heading"><p className="eyebrow">Your evidence picture</p><h1 id="global-progress-title">Progress</h1><p>This view covers only the courses in your active Revision programme. Course membership itself is not progress evidence.</p></header>

      {programme.unknownCourseIds.length > 0 && <Status tone="warning">A saved course no longer resolves to the published catalogue. Its historical evidence is preserved, but it is excluded from this active programme view.</Status>}

      {currentError ? (
        <Status tone="error" label="Progress unavailable">
          <p>{currentError}</p>
          <Button variant="secondary" onClick={() => setRefreshKey((value) => value + 1)}>Try again</Button>
        </Status>
      ) : programme.courses.length === 0 ? (
        <EmptyState title="Add a course to build your progress view" description="Revision will show evidence and readiness only for courses that belong to your active programme." action={<Button onClick={onOpenCourses}>Choose a course</Button>} />
      ) : (
        <>
          <div className="progress-overview">
            <article><small>Evidence coverage</small><strong>{evidencedTopics} / {totalTopics}</strong><p>Active-course topics with at least one recorded learning result.</p></article>
            <article><small>Scored activities</small><strong>{evidence.length}</strong><p>Evidence recorded within your active course set.</p></article>
            <article><small>Readiness available</small><strong>{readinessAvailable} / {allStates.length}</strong><p>Courses/components with enough varied evidence to support a readiness score.</p></article>
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
                  <article className="course-card global-progress-card" key={item.courseId}>
                    <div><span className="tag">{evidenced} / {topics} topics evidenced</span><h3>{item.label}</h3><p>{averageReadiness === null ? 'Readiness is still building from varied evidence.' : `${averageReadiness}% current supported readiness across the available course/component evidence.`}</p></div>
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
