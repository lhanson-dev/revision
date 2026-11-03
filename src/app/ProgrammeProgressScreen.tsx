import { useMemo } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { LearnerCourseMembership } from '../services/courses/learner-course-service'

import { ProgressIntro } from './ProgressIntro'
import type { CatalogueSubject } from './catalogue-model'
import { useProgrammeFi001Progress } from './use-programme-fi001-progress'
import { progressMeasuresFor, progressSummarySentence, readinessAcross, readinessFor } from './progress-summary'
import { RevPresence } from './RevPresence'

import { resolveSubjectIdentity } from './subject-palette'

import { Button, EmptyState, LoadingState, ProgressMeasures, Status, SubjectBadge } from './ui'

type ProgrammeProgressScreenProps = {
  client: SupabaseClient
  userId: string
  catalogue: readonly CatalogueSubject[]
  memberships: readonly LearnerCourseMembership[]
  onOpenCourses: () => void
  onOpenHome: () => void
  onOpenCourseProgress: (courseId: string) => void
}

export function ProgrammeProgressScreen({ client, userId, catalogue, memberships, onOpenCourses, onOpenHome, onOpenCourseProgress }: ProgrammeProgressScreenProps) {
  const { programme, evidence, exposures, grouped, allStates, loading, error, plannerError, nextAction } =
    useProgrammeFi001Progress(client, userId, catalogue, memberships)
  const measures = useMemo(() => progressMeasuresFor(allStates), [allStates])
  const readiness = useMemo(() => readinessAcross(allStates), [allStates])
  const nextTopicName = nextAction?.topicName ?? null

  if (programme.courses.length > 0 && loading) return <LoadingState className="page-screen">Loading progress across your active courses…</LoadingState>
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
