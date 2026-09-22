import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { LearningEvidence } from '../engine/evidence/evidence'
import { topicKnowledgeLabel } from '../engine/knowledge/topic-knowledge'
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
import { PoweredByRev } from './RevCompactWordmark'
import { RevPresence } from './RevPresence'
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
  onOpenRev: (draft?: string) => void
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

function recommendationHeading(topic: string, activity: 'flashcards' | 'quick-check' | 'exam-question') {
  if (activity === 'flashcards') return `Let's refresh ${topic}`
  if (activity === 'exam-question') return `Let's use ${topic} in an exam question`
  return `Let's practise ${topic}`
}

function recommendationCopy(recommendation: NonNullable<ModuleLearningState['recommendation']>) {
  if (recommendation.evidenceCount === 0) {
    return `We haven't got enough evidence on this topic yet. A ${activityLabel(recommendation.activity).toLowerCase()} will give us a useful starting point.`
  }
  if (recommendation.readinessScore === null) {
    if (recommendation.activity === 'flashcards') return `You've started building evidence here. A quick knowledge refresh will help strengthen the picture before we ask more of you.`
    if (recommendation.activity === 'exam-question') return `You've built a useful base here. The next helpful step is to see how that knowledge holds up in an exam-style response.`
    return `You've started building evidence here. A little more application practice will help us see what you know well and what is worth revisiting.`
  }
  if (recommendation.activity === 'flashcards') return `Your recent work suggests the underlying knowledge is the best place to focus next. A short refresh should make the next application task easier.`
  if (recommendation.activity === 'exam-question') return `Your knowledge and application evidence are in place. The next useful step is checking how well that transfers into an exam response.`
  return `Your recent work suggests application is the most useful thing to strengthen next. A focused quick check should help.`
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

function CourseOverviewProgressPanel({ state }: { state: ModuleLearningState }) {
  const { good, medium, low, notEnoughEvidence } = state.topicKnowledge.distribution
  const supportedTopics = good + medium + low
  const knowledgeSummary = [
    good > 0 ? `${good} Good` : '',
    medium > 0 ? `${medium} Medium` : '',
    low > 0 ? `${low} Low` : '',
  ].filter(Boolean).join(' · ')

  return (
    <aside className="course-overview-progress-panel" aria-label="Your progress">
      <p className="eyebrow">Your progress</p>
      <div className="course-overview-progress-signal">
        <small>Exam readiness</small>
        <strong>{state.readiness.score === null ? 'Building' : `${state.readiness.score}%`}</strong>
        <span>{state.readiness.score === null ? 'More varied evidence is needed before showing a score.' : `${state.readiness.confidence} evidence confidence.`}</span>
      </div>
      <div className="course-overview-progress-signal">
        <small>Topic knowledge</small>
        <strong>{supportedTopics === 0 ? 'Not enough evidence' : knowledgeSummary}</strong>
        <span>{notEnoughEvidence > 0 ? `${notEnoughEvidence} ${notEnoughEvidence === 1 ? 'topic needs' : 'topics need'} more scored evidence.` : 'Based on scored Practice and Exam Prep evidence.'}</span>
      </div>
    </aside>
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
  onOpenRev,
}: CourseExperienceScreenProps) {
  const resolved = useMemo(() => findCatalogueCourse(catalogue, courseId), [catalogue, courseId])
  const active = memberships.some((membership) => membership.courseId === courseId)
  const [evidence, setEvidence] = useState<LearningEvidence[]>([])
  const [loading, setLoading] = useState(true)
  const [evidenceError, setEvidenceError] = useState('')
  const [savingEvidence, setSavingEvidence] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [revPrompt, setRevPrompt] = useState('')

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

  function submitRevPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = revPrompt.trim()
    onOpenRev(text || undefined)
    setRevPrompt('')
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
        <header className="page-heading paper-heading"><p className="eyebrow">{course.examBoardName} · specification {course.specificationCode}</p><h1 id="course-page-title">{label}</h1><p>{section === 'overview' ? 'Learn, practise and prepare for the exam from one course view.' : 'Learn and practise the shared course syllabus here. Paper-specific formats, techniques and full simulations sit inside Exam Prep.'}</p></header>
        <nav className="course-nav" aria-label={`${label} navigation`}>
          {sections.map((item) => <button key={item} className={section === item ? 'active' : ''} onClick={() => onOpenCourseSection(course.id, item)}>{sectionLabels[item]}</button>)}
        </nav>

        {evidenceError && <Status tone="warning">{evidenceError}</Status>}

        {section === 'overview' && <div className="paper-section-content course-overview-content">
          <section className="course-overview-recommendation" aria-labelledby="course-recommendation-title">
            <div className="course-overview-recommendation-main">
              <div className="course-overview-recommendation-presence"><RevPresence size="hero" state="resting" decorative /></div>
              <div className="course-overview-recommendation-copy">
                <PoweredByRev />
                <p className="eyebrow">Your next useful step in {subject.name}</p>
                <h2 id="course-recommendation-title">{recommendation && recommendationTopic ? recommendationHeading(recommendationTopic.shortTitle, recommendation.activity) : 'Let’s get a useful starting point'}</h2>
                <p>{recommendation && recommendationTopic ? recommendationCopy(recommendation) : 'Start with a short Practice activity and I’ll use what you show me to help guide the next step.'}</p>
                {recommendation && <p className="course-overview-recommendation-note">{recommendation.limitation}</p>}
                <div className="course-overview-recommendation-actions">
                  {sections.includes(recommendationSection) && <Button onClick={() => onOpenCourseSection(course.id, recommendationSection)}>{recommendation ? `Start ${activityLabel(recommendation.activity).toLowerCase()}` : 'Start Practice'}</Button>}
                  {recommendation && <button className="course-overview-why" type="button" title={recommendation.evidenceSummary}>Why this?</button>}
                </div>
              </div>
              <CourseOverviewProgressPanel state={state} />
            </div>
            <div className="course-overview-conversation">
              <div className="course-overview-conversation-copy"><strong>Got something else on your mind?</strong><span>Ask REV about this course, a topic, or what you want to work on.</span></div>
              <form className="course-overview-rev-form" onSubmit={submitRevPrompt}>
                <input value={revPrompt} maxLength={240} onChange={(event) => setRevPrompt(event.target.value)} placeholder="Ask REV anything…" aria-label={`Ask REV about ${label}`} />
                <button type="submit">Ask REV</button>
              </form>
            </div>
          </section>

          <section className="home-section course-overview-topics" aria-labelledby="course-topics-title">
            <div className="section-heading"><div><p className="eyebrow">Course structure</p><h2 id="course-topics-title">Course topics</h2><p>Choose an area to explore, or follow REV’s recommendation above.</p></div></div>
            <div className="topic-list-grid">{topics.map((topic) => { const knowledge = state.topicKnowledge.topics.find((item) => item.topicId === topic.id); return <article key={topic.id}><div><strong>{topic.shortTitle}</strong><p>Topic knowledge · {topicKnowledgeLabel(knowledge?.band ?? 'not-enough-evidence')}</p></div></article> })}</div>
          </section>
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
