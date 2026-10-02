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
import { ProgressIntro } from './ProgressIntro'
import { RevPresence } from './RevPresence'
import { nextProgressAction, progressMeasuresFor, progressSummarySentence, readinessAcross, readinessFor } from './progress-summary'
import { resolveSubjectIdentity } from './subject-palette'
import { adaptersForProgramme, projectLearnerProgramme } from './learner-programme'
import type { CourseSection } from './navigation'
import { Button, EmptyState, LoadingState, ProgressMeasures, Status, SubjectBadge } from './ui'

type ProgrammeProgressScreenProps = {
  client: SupabaseClient
  userId: string
  catalogue: readonly CatalogueSubject[]
  memberships: readonly LearnerCourseMembership[]
  onOpenCourses: () => void
  onOpenCourseProgress: (courseId: string) => void
  onOpenCourseSection: (courseId: string, section: CourseSection) => void
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

export function ProgrammeProgressScreen({ client, userId, catalogue, memberships, onOpenCourses, onOpenCourseProgress, onOpenCourseSection }: ProgrammeProgressScreenProps) {
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
  const allStates = useMemo(() => grouped.flatMap((item) => item.states), [grouped])
  const [now] = useState(() => new Date())
  const measures = useMemo(() => progressMeasuresFor(allStates), [allStates])
  const readiness = useMemo(() => readinessAcross(allStates), [allStates])
  const nextAction = useMemo(() => nextProgressAction(allStates, programme.courses, now), [allStates, programme.courses, now])
  const nextTopicName = nextAction?.topicName ?? null

  if (adapters.length > 0 && loading) return <LoadingState className="page-screen">Loading progress across your active courses…</LoadingState>

  return (
    <main className="dashboard screen-dashboard page-screen" aria-labelledby="global-progress-title">
      <header className="page-heading"><p className="eyebrow">Across your courses</p><h1 id="global-progress-title">Progress</h1></header>

      {error && <Status tone="warning">{error}</Status>}
      {programme.unknownCourseIds.length > 0 && <Status tone="warning">A saved course no longer resolves to the published catalogue. Its historical evidence is preserved, but it is excluded from this active programme view.</Status>}

      {programme.courses.length === 0 ? (
        <EmptyState title="Add a course to build your progress view" description="Add the courses you’re studying and your progress will build here as you work." action={<Button onClick={onOpenCourses}>Choose a course</Button>} />
      ) : (
        <>
          <ProgressIntro sentence={progressSummarySentence(measures, nextTopicName)} action={nextAction} onAction={(action) => onOpenCourseSection(action.courseId, action.section)} />

          <ProgressMeasures covered={measures.covered} total={measures.total} understanding={measures.understanding} readiness={readiness.value} readinessNote={readiness.note} />

          {evidence.length === 0 && (
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
