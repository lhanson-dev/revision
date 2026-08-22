import { useEffect, useMemo, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { LearningEvidence } from '../engine/evidence/evidence'
import { createSupabaseEvidenceStore, loadLearningEvidence, recordLearningEvidence } from '../services/progress/learning-evidence-service'
import type { LearnerCourseMembership } from '../services/courses/learner-course-service'
import { ExamSimulator } from './ExamSimulator'
import { FocusedLearningWorkspace } from './FocusedLearningWorkspace'
import {
  availableCourseSections,
  availablePaperSections,
  createCourseLearningState,
  createModuleLearningState,
  paperLabel,
  type CatalogueSubject,
  type CourseSection,
  type ModuleLearningState,
} from './catalogue-model'
import { findCatalogueCourse } from './learner-programme'
import type { PaperSection } from './navigation'
import { Button, LoadingState, Status } from './ui'

type CourseExperienceScreenProps = {
  client: SupabaseClient
  userId: string
  catalogue: readonly CatalogueSubject[]
  memberships: readonly LearnerCourseMembership[]
  courseId: string
  moduleId?: string | null
  section: CourseSection | PaperSection
  onOpenCourses: () => void
  onOpenCourseSection: (courseId: string, section: CourseSection) => void
  onOpenModuleSection: (courseId: string, moduleId: string, section: PaperSection) => void
}

const sectionLabels: Record<CourseSection, string> = {
  overview: 'Overview',
  learn: 'Learn',
  practice: 'Practice',
  'exam-prep': 'Exam Prep',
  progress: 'Progress',
}

function activityLabel(activity: 'flashcards' | 'quick-check' | 'exam-question') {
  if (activity === 'flashcards') return 'Flashcards'
  if (activity === 'exam-question') return 'Exam practice'
  return 'Quick check'
}

function ProgressSummary({ state, label }: { state: ModuleLearningState; label: string }) {
  return (
    <div className="progress-overview">
      <article><small>Evidence coverage</small><strong>{state.evidencedTopics} / {state.topicCount}</strong><p>Topics with at least one recorded learning result.</p></article>
      <article><small>Scored activities</small><strong>{state.readiness.evidenceCount}</strong><p>Evidence used by this readiness model.</p></article>
      <article><small>{label}</small><strong>{state.readiness.score === null ? 'Building' : `${state.readiness.score}%`}</strong><p>{state.readiness.score === null ? 'More varied evidence is needed before showing a score.' : `${state.readiness.confidence} confidence based on the evidence available.`}</p></article>
    </div>
  )
}

export function CourseExperienceScreen({
  client,
  userId,
  catalogue,
  memberships,
  courseId,
  moduleId,
  section: requestedSection,
  onOpenCourses,
  onOpenCourseSection,
  onOpenModuleSection,
}: CourseExperienceScreenProps) {
  const resolved = useMemo(() => findCatalogueCourse(catalogue, courseId), [catalogue, courseId])
  const active = memberships.some((membership) => membership.courseId === courseId)
  const [evidence, setEvidence] = useState<LearningEvidence[]>([])
  const [loading, setLoading] = useState(true)
  const [evidenceError, setEvidenceError] = useState('')
  const [savingEvidence, setSavingEvidence] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    let current = true
    if (!resolved || !active) return () => { current = false }
    const store = createSupabaseEvidenceStore(client)
    Promise.all(resolved.course.modules.map((adapter) => loadLearningEvidence(store, userId, adapter.manifest.id)))
      .then((items) => {
        if (!current) return
        setEvidence(items.flat())
        setEvidenceError('')
      })
      .catch((error: unknown) => {
        if (current) setEvidenceError(error instanceof Error ? error.message : 'Could not load course progress.')
      })
      .finally(() => {
        if (current) setLoading(false)
      })
    return () => { current = false }
  }, [active, client, resolved, userId])

  async function saveLearningEvidence(item: LearningEvidence) {
    setSavingEvidence(true)
    setSaveError('')
    try {
      const store = createSupabaseEvidenceStore(client)
      const saved = await recordLearningEvidence(store, userId, item)
      setEvidence((current) => [saved, ...current.filter((existing) => existing.id !== saved.id)])
    } catch (error: unknown) {
      const text = error instanceof Error ? error.message : 'Could not save this activity.'
      setSaveError(`${text} Your work is still on screen; try saving it again.`)
      throw error
    } finally {
      setSavingEvidence(false)
    }
  }

  if (!resolved) {
    return (
      <main className="dashboard page-screen">
        <Status tone="warning">This saved course is not available in the current published catalogue. Historical evidence has been kept, but Revision will not silently substitute another course.</Status>
        <Button onClick={onOpenCourses}>Back to Courses</Button>
      </main>
    )
  }

  if (!active) {
    return (
      <main className="dashboard page-screen">
        <header className="page-heading"><p className="eyebrow">Course not in active programme</p><h1>{resolved.label}</h1><p>This course is published in Revision but it is not currently one of your saved courses.</p></header>
        <Button onClick={onOpenCourses}>Back to Courses</Button>
      </main>
    )
  }

  if (loading) return <LoadingState className="page-screen">Loading {resolved.label}…</LoadingState>

  const { course, subject, label } = resolved

  if (course.sharedLearning) {
    const state = createCourseLearningState(course, evidence)
    const sections = availableCourseSections(course)
    const section = sections.includes(requestedSection as CourseSection) ? requestedSection as CourseSection : 'overview'
    const adapter = course.learningAdapter
    const topics = adapter.listTopics()
    const recommendation = state.recommendation
    const recommendationTopic = state.recommendationTopic
    const recommendationSection: CourseSection = recommendation?.activity === 'exam-question' ? 'exam-prep' : 'practice'

    return (
      <main className="dashboard screen-dashboard page-screen paper-screen" aria-labelledby="course-page-title">
        <div className="breadcrumbs"><button onClick={onOpenCourses}>Courses</button><span>›</span><span>{label}</span></div>
        <header className="page-heading paper-heading"><p className="eyebrow">{course.examBoardName} · specification {course.specificationCode}</p><h1 id="course-page-title">{label}</h1><p>Learn and practise the shared course syllabus here. Paper-specific formats, techniques and full simulations sit inside Exam Prep.</p></header>
        <nav className="course-nav" aria-label={`${label} navigation`}>
          {sections.map((item) => <button key={item} className={section === item ? 'active' : ''} onClick={() => onOpenCourseSection(course.id, item)}>{sectionLabels[item]}</button>)}
        </nav>

        {evidenceError && <Status tone="warning">{evidenceError}</Status>}

        {section === 'overview' && <div className="paper-section-content">
          <section className="paper-recommendation" aria-labelledby="course-recommendation-title">
            <div><p className="eyebrow">REV · {label}</p><h2 id="course-recommendation-title">Your next useful step</h2><p>{recommendation && recommendationTopic ? `${recommendationTopic.shortTitle} · ${activityLabel(recommendation.activity)}. ${recommendation.reason}` : 'Complete a short Practice activity and REV can use that evidence to guide the next step.'}</p>{recommendation && <p className="muted">{recommendation.limitation}</p>}</div>
            {sections.includes(recommendationSection) && <Button onClick={() => onOpenCourseSection(course.id, recommendationSection)}>Go to {recommendationSection === 'exam-prep' ? 'Exam Prep' : 'Practice'}</Button>}
          </section>
          <section className="section-choice-grid" aria-label={`${label} sections`}>
            <button className="section-choice" onClick={() => onOpenCourseSection(course.id, 'learn')}><span className="section-icon">L</span><strong>Learn</strong><span>Understand the syllabus once at course level.</span></button>
            {sections.includes('practice') && <button className="section-choice" onClick={() => onOpenCourseSection(course.id, 'practice')}><span className="section-icon">P</span><strong>Practice</strong><span>Flashcards, quick checks, application and calculations.</span></button>}
            {sections.includes('exam-prep') && <button className="section-choice" onClick={() => onOpenCourseSection(course.id, 'exam-prep')}><span className="section-icon">E</span><strong>Exam Prep</strong><span>Paper-specific questions, technique and full simulations.</span></button>}
            <button className="section-choice" onClick={() => onOpenCourseSection(course.id, 'progress')}><span className="section-icon">✓</span><strong>Progress</strong><span>Course coverage, evidence and readiness.</span></button>
          </section>
          <section className="home-section" aria-labelledby="course-topics-title"><div className="section-heading"><div><p className="eyebrow">Specification areas</p><h2 id="course-topics-title">Course topics</h2></div></div><div className="topic-list-grid">{topics.map((topic) => { const hasEvidence = state.evidence.some((item) => item.topicId === topic.id); return <article key={topic.id}><span className={`evidence-dot ${hasEvidence ? 'has-evidence' : ''}`} aria-hidden="true"></span><div><strong>{topic.shortTitle}</strong><p>{hasEvidence ? 'Evidence recorded' : 'No scored evidence yet'}</p></div></article> })}</div></section>
        </div>}

        {section === 'learn' && <div className="paper-section-content"><FocusedLearningWorkspace adapter={adapter} section="learn" recommendation={recommendation} saving={savingEvidence} saveError={saveError} onRecordEvidence={saveLearningEvidence} contextLabel={label} includeExamQuestions={false} />{sections.includes('practice') && <div className="cross-section-next"><div><strong>Ready to test it?</strong><span>Move into Practice without creating a duplicate paper-level syllabus.</span></div><Button onClick={() => onOpenCourseSection(course.id, 'practice')}>Go to Practice</Button></div>}</div>}

        {section === 'practice' && <div className="paper-section-content"><FocusedLearningWorkspace adapter={adapter} section="practice" recommendation={recommendation?.activity === 'exam-question' ? null : recommendation} saving={savingEvidence} saveError={saveError} onRecordEvidence={saveLearningEvidence} contextLabel={label} includeExamQuestions={false} />{sections.includes('exam-prep') && <div className="cross-section-next"><div><strong>Ready for exam-specific work?</strong><span>Paper formats, written exam questions and full simulations are inside Exam Prep.</span></div><Button onClick={() => onOpenCourseSection(course.id, 'exam-prep')}>Go to Exam Prep</Button></div>}</div>}

        {section === 'exam-prep' && <div className="paper-section-content">
          <FocusedLearningWorkspace adapter={adapter} section="exam-prep" recommendation={null} saving={savingEvidence} saveError={saveError} onRecordEvidence={saveLearningEvidence} contextLabel={label} includeExamQuestions={false} />
          <section className="home-section" aria-labelledby="choose-paper-title">
            <div className="section-heading"><div><p className="eyebrow">Paper-specific preparation</p><h2 id="choose-paper-title">Choose a paper</h2></div></div>
            <div className="subject-list">
              {course.modules.map((paperAdapter) => (
                <details className="course-card exam-paper-card" key={paperAdapter.manifest.id}>
                  <summary><div><span className="tag">{paperLabel(paperAdapter)}</span><h3>{paperAdapter.manifest.paper.name}</h3><p>{paperAdapter.catalogueEntry.totalMarks} marks · {paperAdapter.catalogueEntry.durationMinutes} minutes · {paperAdapter.listExams().length} {paperAdapter.listExams().length === 1 ? 'simulation' : 'simulations'}</p></div><span aria-hidden="true">＋</span></summary>
                  <div className="paper-exam-content">
                    {paperAdapter.listExams().map((exam) => <section className="exam-simulator-section" aria-label={`${paperAdapter.manifest.paper.name} simulator`} key={exam.id}><ExamSimulator exam={exam} moduleId={paperAdapter.manifest.id} saving={savingEvidence} saveError={saveError} onRecordEvidence={saveLearningEvidence} /></section>)}
                    {paperAdapter.listExams().length === 0 && <p className="muted">No full simulation is published for this paper yet.</p>}
                  </div>
                </details>
              ))}
            </div>
          </section>
        </div>}

        {section === 'progress' && <div className="paper-section-content">
          <section className="progress-section-heading"><p className="eyebrow">{label} progress</p><h2>What the evidence says</h2><p>Shared syllabus coverage is counted once at course level. Exam attempts from individual papers still contribute evidence to the course picture.</p></section>
          <ProgressSummary state={state} label="Course readiness" />
          <section className="home-section" aria-labelledby="course-topic-progress-title"><div className="section-heading"><div><p className="eyebrow">Topic evidence</p><h2 id="course-topic-progress-title">Where you have evidence</h2></div></div><div className="topic-list-grid">{topics.map((topic) => { const count = state.evidence.filter((item) => item.topicId === topic.id).length; return <article key={topic.id}><span className={`evidence-dot ${count > 0 ? 'has-evidence' : ''}`} aria-hidden="true"></span><div><strong>{topic.shortTitle}</strong><p>{count === 0 ? 'No scored evidence yet' : `${count} scored ${count === 1 ? 'activity' : 'activities'}`}</p></div></article> })}</div></section>
        </div>}
      </main>
    )
  }

  if (!moduleId) {
    return (
      <main className="dashboard screen-dashboard page-screen" aria-labelledby="course-components-title">
        <div className="breadcrumbs"><button onClick={onOpenCourses}>Courses</button><span>›</span><span>{label}</span></div>
        <header className="page-heading"><p className="eyebrow">{course.examBoardName} · specification {course.specificationCode}</p><h1 id="course-components-title">{label}</h1><p>This qualification has component-specific learning content. Choose the component you want to work on.</p></header>
        <section className="subject-list" aria-label={`${label} components`}>
          {course.modules.map((adapter) => <article className="course-card" key={adapter.manifest.id}><div><span className="tag">{paperLabel(adapter)}</span><h2>{adapter.manifest.paper.name}</h2><p>{adapter.catalogueEntry.topicCount} topics · {adapter.catalogueEntry.totalMarks} marks · {adapter.catalogueEntry.durationMinutes} minutes</p></div><Button onClick={() => onOpenModuleSection(course.id, adapter.manifest.id, 'overview')}>Open component</Button></article>)}
        </section>
      </main>
    )
  }

  const adapter = course.modules.find((item) => item.manifest.id === moduleId)
  if (!adapter) {
    return <main className="dashboard page-screen"><Status tone="warning">This component is not available within {label}.</Status><Button onClick={() => onOpenCourseSection(course.id, 'overview')}>Back to course</Button></main>
  }
  const state = createModuleLearningState(adapter, evidence)
  const sections = availablePaperSections(adapter)
  const section = sections.includes(requestedSection as PaperSection) ? requestedSection as PaperSection : 'overview'
  const topics = adapter.listTopics()
  const recommendation = state.recommendation
  const recommendationTopic = state.recommendationTopic

  return (
    <main className="dashboard screen-dashboard page-screen paper-screen" aria-labelledby="component-page-title">
      <div className="breadcrumbs"><button onClick={onOpenCourses}>Courses</button><span>›</span><button onClick={() => onOpenCourseSection(course.id, 'overview')}>{label}</button><span>›</span><span>{paperLabel(adapter)}</span></div>
      <header className="page-heading paper-heading"><p className="eyebrow">{subject.name} · {course.examBoardName} · specification {course.specificationCode}</p><h1 id="component-page-title">{adapter.manifest.paper.name}</h1><p>{adapter.manifest.learnerExperience.what_is_this}</p></header>
      <nav className="course-nav" aria-label={`${adapter.manifest.paper.name} navigation`}>{sections.map((item) => <button key={item} className={section === item ? 'active' : ''} onClick={() => onOpenModuleSection(course.id, adapter.manifest.id, item)}>{sectionLabels[item]}</button>)}</nav>

      {section === 'overview' && <div className="paper-section-content"><section className="paper-recommendation"><div><p className="eyebrow">REV · {paperLabel(adapter)}</p><h2>Your next useful step</h2><p>{recommendation && recommendationTopic ? `${recommendationTopic.shortTitle} · ${activityLabel(recommendation.activity)}. ${recommendation.reason}` : 'Complete a short Practice activity and REV can use that evidence to guide the next step.'}</p></div></section><section className="home-section"><div className="section-heading"><div><p className="eyebrow">Specification areas</p><h2>{paperLabel(adapter)} topics</h2></div></div><div className="topic-list-grid">{topics.map((topic) => <article key={topic.id}><div><strong>{topic.shortTitle}</strong></div></article>)}</div></section></div>}
      {section === 'learn' && <div className="paper-section-content"><FocusedLearningWorkspace adapter={adapter} section="learn" recommendation={recommendation} saving={savingEvidence} saveError={saveError} onRecordEvidence={saveLearningEvidence} contextLabel={`${label} ${paperLabel(adapter)}`} /></div>}
      {section === 'practice' && <div className="paper-section-content"><FocusedLearningWorkspace adapter={adapter} section="practice" recommendation={recommendation} saving={savingEvidence} saveError={saveError} onRecordEvidence={saveLearningEvidence} contextLabel={`${label} ${paperLabel(adapter)}`} /></div>}
      {section === 'exam-prep' && <div className="paper-section-content"><FocusedLearningWorkspace adapter={adapter} section="exam-prep" recommendation={recommendation?.activity === 'exam-question' ? recommendation : null} saving={savingEvidence} saveError={saveError} onRecordEvidence={saveLearningEvidence} contextLabel={`${label} ${paperLabel(adapter)}`} />{adapter.listExams().map((exam) => <section className="exam-simulator-section" aria-label={`${adapter.manifest.paper.name} simulator`} key={exam.id}><ExamSimulator exam={exam} moduleId={adapter.manifest.id} saving={savingEvidence} saveError={saveError} onRecordEvidence={saveLearningEvidence} /></section>)}</div>}
      {section === 'progress' && <div className="paper-section-content"><ProgressSummary state={state} label="Component readiness" /></div>}
    </main>
  )
}
