import { useEffect, useMemo, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { LearningContentAdapter } from '../engine/content/content-adapter'
import type { LearningEvidence } from '../engine/evidence/evidence'
import { createSupabaseEvidenceStore, loadLearningEvidence, recordLearningEvidence } from '../services/progress/learning-evidence-service'
import type { LearnerCourseMembership } from '../services/courses/learner-course-service'
import {
  loadUpcomingPublicExamAssessments,
  type CourseExamAssessment,
} from '../services/planning/course-exam-date-service'
import { CourseHeader, courseSectionLabels as sectionLabels } from './CourseHeader'
import { ExamPrepSection } from './ExamPrepSection'
import { ExamSimulator } from './ExamSimulator'
import { FocusedLearningWorkspace } from './FocusedLearningWorkspace'
import { LearnReadingWorkspace } from './LearnReadingWorkspace'
import {
  availableCourseSections,
  availablePaperSections,
  createCourseLearningState,
  createModuleLearningState,
  paperLabel,
  type CatalogueCourse,
  type CatalogueSubject,
  type CourseSection,
  type ModuleLearningState,
} from './catalogue-model'
import { findCatalogueCourse, type LearnerProgrammeCourse } from './learner-programme'
import { ProgressIntro } from './ProgressIntro'
import { nextProgressAction, progressMeasuresFor, progressSummarySentence, readinessAcross, readinessFor, type ProgressNextAction } from './progress-summary'
import type { PaperSection } from './navigation'
import { resolveSubjectIdentity } from './subject-palette'
import { lastFlashcardRatings } from './practice-flashcards'
import { lastAnsweredByContent } from './practice-questions'
import { topicLearningStatus, topicProgressFor, understandingCounts } from './topic-status'
import { Button, LoadingState, ProgressMeasures, RevSuggestionCard, Status, StatusBadge } from './ui'

type CourseExperienceScreenProps = {
  client: SupabaseClient
  userId: string
  catalogue: readonly CatalogueSubject[]
  memberships: readonly LearnerCourseMembership[]
  courseId: string
  moduleId?: string | null
  section: CourseSection | PaperSection
  learnPageId?: string | null
  practiceTopicId?: string | null
  onOpenCourses: () => void
  onOpenCourseSection: (courseId: string, section: CourseSection) => void
  onOpenModuleSection: (courseId: string, moduleId: string, section: PaperSection) => void
  onOpenLearnPage: (pageId: string) => void
  onOpenPracticeTopic: (topicId: string) => void
  onOpenRev: (draft?: string) => void
}

type ExamDateStatus = 'loading' | 'ready' | 'error'

function activityLabel(activity: 'flashcards' | 'quick-check' | 'exam-question') {
  if (activity === 'flashcards') return 'Flashcards'
  if (activity === 'exam-question') return 'Exam practice'
  return 'Quick check'
}

function recommendationHeading(topic: string, activity: 'flashcards' | 'quick-check' | 'exam-question') {
  if (activity === 'flashcards') return `Let's refresh ${topic} with flashcards`
  if (activity === 'exam-question') return `Let's use ${topic} in an exam question`
  return `Let's practise ${topic} with a quick check`
}

function recommendationCopy(recommendation: NonNullable<ModuleLearningState['recommendation']>) {
  if (recommendation.activity === 'flashcards') {
    return recommendation.readinessScore === null
      ? 'Flashcards are the best next step because REV needs a stronger picture of your core recall before moving on to more application work.'
      : 'Flashcards are the best next step because recall is currently the weakest part of the evidence for this topic.'
  }

  if (recommendation.activity === 'exam-question') {
    return 'An exam question is the best next step because REV needs to see how this knowledge performs in an exam-style response.'
  }

  if (recommendation.evidenceCount === 0) {
    return 'A quick check is the best starting point because REV has no scored evidence for this topic yet. It will show how well you can apply what you know.'
  }

  return recommendation.readinessScore === null
    ? 'A quick check is the best next step because REV needs more evidence of how well you can apply the knowledge, not just recall it.'
    : 'A quick check is the best next step because application is currently the weakest part of the evidence for this topic.'
}

function localDateKey(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function examCountdown(value: string, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const target = new Date(`${value}T00:00:00`).getTime()
  const days = Math.max(0, Math.ceil((target - today) / 86_400_000))
  if (days === 0) return 'Today'
  if (days === 1) return '1 day to go'
  return `${days} days to go`
}

function examCountdownShort(date: string) {
  const text = examCountdown(date)
  return text.replace(' to go', '')
}

function findNextCourseExam(
  assessments: readonly CourseExamAssessment[],
  course: CatalogueCourse,
  catalogue: readonly CatalogueSubject[],
  memberships: readonly LearnerCourseMembership[],
) {
  const moduleIds = new Set(course.modules.map((adapter) => adapter.manifest.id))
  const activeCourseIds = new Set(memberships.map((membership) => membership.courseId))
  const activeSubjectCourseCount = catalogue
    .flatMap((subject) => subject.courses)
    .filter((candidate) => candidate.subjectId === course.subjectId && activeCourseIds.has(candidate.id))
    .length

  return assessments.find((assessment) => {
    if (assessment.courseId) return assessment.courseId === course.id
    if (assessment.moduleId) return moduleIds.has(assessment.moduleId)
    return assessment.subjectId === course.subjectId && activeSubjectCourseCount === 1
  }) ?? null
}

function withPreferredTopic(adapter: LearningContentAdapter, topicId?: string | null): LearningContentAdapter {
  if (!topicId) return adapter
  const preferred = adapter.getTopic(topicId)
  if (!preferred) return adapter
  return {
    ...adapter,
    listTopics: () => [preferred, ...adapter.listTopics().filter((topic) => topic.id !== topicId)],
  }
}

function ProgressPanel({ states, programmeCourse, topics, onAction }: {
  states: readonly ModuleLearningState[]
  programmeCourse: LearnerProgrammeCourse
  topics: ReturnType<LearningContentAdapter['listTopics']>
  onAction: (action: ProgressNextAction) => void
}) {
  const [now] = useState(() => new Date())
  const measures = progressMeasuresFor(states)
  const readiness = states.length === 1 ? readinessFor(states[0]) : readinessAcross(states)
  const action = nextProgressAction(states, [programmeCourse], now)
  const { hue } = resolveSubjectIdentity(programmeCourse.subject.id, programmeCourse.subject.name)
  const knowledge = new Map(states.flatMap((state) => state.topicKnowledge.topics.map((item) => [item.topicId, { band: item.band, answered: state.evidence.some((entry) => entry.topicId === item.topicId), count: state.evidence.filter((entry) => entry.topicId === item.topicId).length }] as const)))
  return (
    <>
      <ProgressIntro sentence={progressSummarySentence(measures, action?.topicName ?? null)} action={action} onAction={onAction} />
      <ProgressMeasures hue={hue} covered={measures.covered} total={measures.total} understanding={measures.understanding} readiness={readiness.value} readinessNote={readiness.note} />
      <section className="home-section" aria-labelledby="course-topic-progress-title">
        <div className="section-heading"><div><p className="eyebrow">Topic by topic</p><h2 id="course-topic-progress-title">Where you are in each topic</h2></div></div>
        <ul className="progress-topic-list">
          {topics.map((topic) => {
            const item = knowledge.get(topic.id)
            const status = topicLearningStatus(item?.band ?? 'not-enough-evidence', item?.answered ?? false)
            const count = item?.count ?? 0
            return (
              <li key={topic.id}>
                <span className="progress-topic-list__name"><strong>{topic.shortTitle}</strong><small>{count === 0 ? 'No answers yet' : `${count} ${count === 1 ? 'answer' : 'answers'}`}</small></span>
                <StatusBadge status={status} size="sm" />
              </li>
            )
          })}
        </ul>
      </section>
    </>
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
  learnPageId,
  practiceTopicId,
  onOpenCourses,
  onOpenCourseSection,
  onOpenModuleSection,
  onOpenLearnPage,
  onOpenPracticeTopic,
  onOpenRev,
}: CourseExperienceScreenProps) {
  const resolved = useMemo(() => findCatalogueCourse(catalogue, courseId), [catalogue, courseId])
  const active = memberships.some((membership) => membership.courseId === courseId)
  const [evidence, setEvidence] = useState<LearningEvidence[]>([])
  const [loading, setLoading] = useState(true)
  const [evidenceError, setEvidenceError] = useState('')
  const [savingEvidence, setSavingEvidence] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [examAssessments, setExamAssessments] = useState<CourseExamAssessment[]>([])
  const [examDateStatus, setExamDateStatus] = useState<ExamDateStatus>('loading')

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

  useEffect(() => {
    let current = true
    if (!resolved || !active) return () => { current = false }
    loadUpcomingPublicExamAssessments(client, userId, localDateKey(new Date()))
      .then((items) => {
        if (!current) return
        setExamAssessments(items)
        setExamDateStatus('ready')
      })
      .catch(() => {
        if (!current) return
        setExamAssessments([])
        setExamDateStatus('error')
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
    const practiceAdapter = withPreferredTopic(adapter, practiceTopicId)
    const topics = adapter.listTopics()
    const recommendation = state.recommendation
    const recommendationTopic = state.recommendationTopic
    const recommendationSection: CourseSection = recommendation?.activity === 'exam-question' ? 'exam-prep' : 'practice'
    const nextExam = findNextCourseExam(examAssessments, course, catalogue, memberships)
    const { hue } = resolveSubjectIdentity(subject.id, subject.name)
    const understanding = understandingCounts([state])
    return (
      <main className="dashboard screen-dashboard page-screen paper-screen" aria-labelledby="course-page-title">
        <CourseHeader course={course} subjectName={subject.name} navLabel={label} sections={sections} section={section} titleId="course-page-title" onOpenCourses={onOpenCourses} onOpenSection={(next) => onOpenCourseSection(course.id, next)} />

        {evidenceError && <Status tone="warning">{evidenceError}</Status>}

        {section === 'overview' && <div className="paper-section-content course-overview-content course-overview-v2">
          <section className="course-overview-decision" aria-label="Course next step and overall progress">
            <div className="course-overview-rev">
              <RevSuggestionCard
                variant="hero"
                eyebrow="REV’s advice"
                title="Your next useful step"
                reason={recommendation && recommendationTopic ? `${recommendationHeading(recommendationTopic.shortTitle, recommendation.activity)}. ${recommendationCopy(recommendation)}` : 'Start with a short Practice activity and I’ll use what you show me to help guide the next step.'}
                primaryAction={sections.includes(recommendationSection) ? { label: recommendation ? `Start ${activityLabel(recommendation.activity).toLowerCase()}` : 'Start Practice', onClick: () => onOpenCourseSection(course.id, recommendationSection) } : undefined}
              />
            </div>
            <section className="course-overview-summary" aria-labelledby="course-overview-summary-heading">
              <h2 id="course-overview-summary-heading">Your progress at a glance</h2>
              <ProgressMeasures
                stack
                hue={hue}
                covered={state.evidencedTopics}
                total={state.topicCount}
                understanding={understanding}
                readiness={readinessFor(state).value}
                readinessNote={readinessFor(state).note}
              />
              <p className="course-overview-exam">
                <span>Exam date</span>
                <strong>{examDateStatus === 'loading' ? 'Checking…' : examDateStatus === 'error' ? 'Unavailable' : nextExam ? examCountdownShort(nextExam.assessmentDate) : 'Not set'}</strong>
              </p>
            </section>
          </section>
          <div className="course-overview-ask">
            <p>Need help deciding what to do next? Ask REV about this course.</p>
            <Button variant="secondary" onClick={() => onOpenRev()}>Ask REV about this course</Button>
          </div>
        </div>}

        {section === 'learn' && <div className="paper-section-content"><LearnReadingWorkspace adapter={adapter} pageId={learnPageId} onOpenPage={onOpenLearnPage} onOpenPractice={onOpenPracticeTopic} onOpenRev={onOpenRev} /></div>}

        {section === 'practice' && <div className="paper-section-content"><FocusedLearningWorkspace key={`course-practice-${practiceTopicId ?? 'default'}`} adapter={practiceAdapter} section="practice" preferredTopicId={practiceTopicId} topicProgress={topicProgressFor(state)} lastAnsweredAt={lastAnsweredByContent(state.evidence)} flashcardRatings={lastFlashcardRatings(state.evidence)} onOpenLearnPage={onOpenLearnPage} recommendation={recommendation?.activity === 'exam-question' ? null : recommendation} saving={savingEvidence} saveError={saveError} onRecordEvidence={saveLearningEvidence} contextLabel={label} includeExamQuestions={false} />{sections.includes('exam-prep') && <div className="cross-section-next"><div><strong>Ready for exam-specific work?</strong><span>Paper formats, written exam questions and full simulations are inside Exam Prep.</span></div><Button onClick={() => onOpenCourseSection(course.id, 'exam-prep')}>Go to Exam Prep</Button></div>}</div>}

        {section === 'exam-prep' && <div className="paper-section-content"><ExamPrepSection course={course} state={state} subjectId={subject.id} subjectName={subject.name} nextExam={examDateStatus === 'ready' ? nextExam : null} saving={savingEvidence} saveError={saveError} onRecordEvidence={saveLearningEvidence} /></div>}

        {section === 'progress' && <div className="paper-section-content">
          <ProgressPanel states={[state]} programmeCourse={resolved} topics={topics} onAction={(action) => onOpenCourseSection(course.id, action.section)} />
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
  const practiceAdapter = withPreferredTopic(adapter, practiceTopicId)
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
      {section === 'learn' && <div className="paper-section-content"><LearnReadingWorkspace adapter={adapter} pageId={learnPageId} onOpenPage={onOpenLearnPage} onOpenPractice={onOpenPracticeTopic} onOpenRev={onOpenRev} /></div>}
      {section === 'practice' && <div className="paper-section-content"><FocusedLearningWorkspace key={`module-practice-${practiceTopicId ?? 'default'}`} adapter={practiceAdapter} section="practice" topicProgress={topicProgressFor(state)} lastAnsweredAt={lastAnsweredByContent(state.evidence)} flashcardRatings={lastFlashcardRatings(state.evidence)} onOpenLearnPage={onOpenLearnPage} recommendation={recommendation} saving={savingEvidence} saveError={saveError} onRecordEvidence={saveLearningEvidence} contextLabel={`${label} ${paperLabel(adapter)}`} /></div>}
      {section === 'exam-prep' && <div className="paper-section-content"><FocusedLearningWorkspace adapter={adapter} section="exam-prep" recommendation={recommendation?.activity === 'exam-question' ? recommendation : null} saving={savingEvidence} saveError={saveError} onRecordEvidence={saveLearningEvidence} contextLabel={`${label} ${paperLabel(adapter)}`} />{adapter.listExams().map((exam) => <section className="exam-simulator-section" aria-label={`${adapter.manifest.paper.name} simulator`} key={exam.id}><ExamSimulator exam={exam} moduleId={adapter.manifest.id} saving={savingEvidence} saveError={saveError} onRecordEvidence={saveLearningEvidence} /></section>)}</div>}
      {section === 'progress' && <div className="paper-section-content"><ProgressPanel states={[state]} programmeCourse={resolved} topics={topics} onAction={(action) => onOpenModuleSection(course.id, adapter.manifest.id, action.section)} /></div>}
    </main>
  )
}
