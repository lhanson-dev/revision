import { useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { getContentAdapter, listAvailableContentAdapters } from '../engine/content/content-registry'
import type { LearningEvidence } from '../engine/evidence/evidence'
import { createSupabaseEvidenceStore, loadLearningEvidence, recordLearningEvidence } from '../services/progress/learning-evidence-service'
import { currentAppUrl, supabase } from '../services/supabase/browser-client'
import { ExamSimulator } from './ExamSimulator'
import { FocusedLearningWorkspace } from './FocusedLearningWorkspace'
import {
  availableCourseSections,
  availablePaperSections,
  buildCatalogue,
  catalogueCourseLabel,
  chooseRecommendedModule,
  courseLabel,
  createCourseLearningState,
  createModuleLearningState,
  globalRecommendationReason,
  paperLabel,
  type CatalogueSubject,
  type ModuleLearningState,
} from './catalogue-model'
import {
  courseRoute,
  homeRoute,
  moduleRoute,
  parseRoute,
  progressRoute,
  revRoute,
  routeBelongsToSubjects,
  routeHash,
  sameRoute,
  subjectRoute,
  subjectsRoute,
  type AppRoute,
  type CourseSection,
  type PaperSection,
} from './navigation'
import { recentActivity } from './progress-view'

const availableAdapters = listAvailableContentAdapters()
const catalogue = buildCatalogue(availableAdapters)
const allCourses = catalogue.flatMap((subject) => subject.courses)
const sharedLearningModuleIds = new Set(
  allCourses.filter((course) => course.sharedLearning).flatMap((course) => course.modules.map((module) => module.manifest.id)),
)
const defaultRevMessage = 'I can help you choose what deserves attention today, or you can pick a subject yourself.'

function learnerName(user: User) {
  const metadata = user.user_metadata ?? {}
  const explicit = metadata.first_name ?? metadata.given_name ?? metadata.name
  if (typeof explicit === 'string' && explicit.trim()) {
    const first = explicit.trim().split(/\s+/)[0]
    return first.charAt(0).toUpperCase() + first.slice(1)
  }
  const local = (user.email ?? '').split('@')[0].replace(/[._-]+/g, ' ').trim()
  if (/^[a-zA-Z ]+$/.test(local) && local.length > 1) {
    const first = local.split(/\s+/)[0]
    return first.charAt(0).toUpperCase() + first.slice(1)
  }
  return 'there'
}

function activityLabel(activity: 'flashcards' | 'quick-check' | 'exam-question') {
  if (activity === 'flashcards') return 'Flashcards'
  if (activity === 'exam-question') return 'Exam practice'
  return 'Quick check'
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function subjectMark(subject: CatalogueSubject) {
  return subject.name.trim().charAt(0).toUpperCase() || '•'
}

function stateForModule(states: readonly ModuleLearningState[], moduleId: string) {
  return states.find((state) => state.adapter.manifest.id === moduleId && !state.course)
}

function courseForModule(moduleId: string) {
  return allCourses.find((course) => course.modules.some((module) => module.manifest.id === moduleId))
}

function scopeLabel(state: ModuleLearningState) {
  return state.course
    ? catalogueCourseLabel(state.course, state.adapter.manifest.subject.name)
    : paperLabel(state.adapter)
}

export function App() {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [evidence, setEvidence] = useState<LearningEvidence[]>([])
  const [evidenceError, setEvidenceError] = useState('')
  const [savingEvidence, setSavingEvidence] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [revSuggested, setRevSuggested] = useState(false)
  const [revMessage, setRevMessage] = useState(defaultRevMessage)
  const [revTyping, setRevTyping] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [route, setRoute] = useState<AppRoute>(() => parseRoute(window.location.hash))
  const [reducedMotion] = useState(() => prefersReducedMotion())

  const moduleStates = useMemo(
    () => availableAdapters.map((adapter) => createModuleLearningState(adapter, evidence)),
    [evidence],
  )
  const courseStates = useMemo(
    () => allCourses.filter((course) => course.sharedLearning).map((course) => createCourseLearningState(course, evidence)),
    [evidence],
  )
  const learningStates = useMemo(
    () => [
      ...courseStates,
      ...moduleStates.filter((state) => !sharedLearningModuleIds.has(state.adapter.manifest.id)),
    ],
    [courseStates, moduleStates],
  )
  const recommendedState = useMemo(() => chooseRecommendedModule(learningStates), [learningStates])
  const recommendedSubject = recommendedState
    ? catalogue.find((subject) => subject.id === recommendedState.adapter.manifest.subject.id)
    : undefined
  const learner = user ? learnerName(user) : 'there'
  const globalActivity = useMemo(() => recentActivity(evidence), [evidence])
  const totalTopics = learningStates.reduce((sum, state) => sum + state.topicCount, 0)
  const evidencedTopics = learningStates.reduce((sum, state) => sum + state.evidencedTopics, 0)
  const readinessAvailable = learningStates.filter((state) => state.readiness.score !== null).length

  const recommendationMessage = recommendedState
    ? `${recommendedState.adapter.manifest.subject.name} is the best current place to focus. ${globalRecommendationReason(recommendedState, learningStates)}${recommendedState.recommendation && recommendedState.recommendationTopic ? ` Within ${scopeLabel(recommendedState)}, I’d start with ${recommendedState.recommendationTopic.shortTitle} using ${activityLabel(recommendedState.recommendation.activity)}.` : ''}`
    : 'There are no published subjects in your revision catalogue yet.'
  const targetRevMessage = revSuggested ? recommendationMessage : defaultRevMessage
  const displayedRevMessage = reducedMotion ? targetRevMessage : revMessage
  const displayedRevTyping = !reducedMotion && revTyping

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session) {
        setEvidence([])
        setEvidenceError('')
        setSaveError('')
        setRevSuggested(false)
        setRoute(homeRoute())
      }
    })
    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user) return
    const store = createSupabaseEvidenceStore(supabase)
    Promise.all(availableAdapters.map((adapter) => loadLearningEvidence(store, user.id, adapter.manifest.id)))
      .then((items) => {
        setEvidence(items.flat())
        setEvidenceError('')
      })
      .catch((error: unknown) => setEvidenceError(error instanceof Error ? error.message : 'Could not load progress.'))
  }, [user])

  useEffect(() => {
    if (!user || reducedMotion) return
    const text = targetRevMessage
    let index = 0
    let timer = 0
    const tick = () => {
      index = Math.min(text.length, index + 2)
      setRevMessage(text.slice(0, index))
      setRevTyping(index < text.length)
      if (index < text.length) timer = window.setTimeout(tick, 18)
    }
    timer = window.setTimeout(tick, 0)
    return () => window.clearTimeout(timer)
  }, [user, targetRevMessage, reducedMotion])

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }, [route])

  useEffect(() => {
    if (!menuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [menuOpen])

  function navigate(nextRoute: AppRoute) {
    setMenuOpen(false)
    const nextHash = routeHash(nextRoute)
    if (sameRoute(route, nextRoute) && window.location.hash === nextHash) {
      setRoute(nextRoute)
      window.scrollTo({ top: 0, behavior: 'auto' })
      return
    }
    window.location.hash = nextHash
  }

  async function saveLearningEvidence(item: LearningEvidence) {
    if (!user) return
    setSavingEvidence(true)
    setSaveError('')
    try {
      const store = createSupabaseEvidenceStore(supabase)
      const saved = await recordLearningEvidence(store, user.id, item)
      setEvidence((current) => [saved, ...current.filter((existing) => existing.id !== saved.id)])
    } catch (error: unknown) {
      const text = error instanceof Error ? error.message : 'Could not save this activity.'
      setSaveError(`${text} Your work is still on screen; try saving it again.`)
      throw error
    } finally {
      setSavingEvidence(false)
    }
  }

  async function signIn() {
    setMessage('Signing in…')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setMessage(error ? error.message : '')
  }

  async function signUp() {
    if (password.length < 6) {
      setMessage('Use a password of at least 6 characters.')
      return
    }
    setMessage('Creating account…')
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: currentAppUrl() },
    })
    if (error) setMessage(error.message)
    else setMessage(data.session ? 'Account created.' : 'Account created. Check your email to confirm your address, then return here to sign in.')
  }

  async function signOut() {
    setMenuOpen(false)
    await supabase.auth.signOut()
  }

  function suggestNextStep() {
    setRevSuggested(true)
  }

  function chooseMyself() {
    setRevSuggested(false)
    navigate(subjectsRoute())
  }

  function routeForState(state: ModuleLearningState, section: CourseSection = 'overview') {
    if (state.course) return courseRoute(state.adapter.manifest.subject.id, state.course.id, section)
    return moduleRoute(state.adapter.manifest.subject.id, state.adapter.manifest.id, section)
  }

  function goToRecommendation() {
    if (recommendedSubject) navigate(subjectRoute(recommendedSubject.id))
    else navigate(subjectsRoute())
  }

  if (loading) return <main className="loading-shell">Loading Revision…</main>

  if (!user) {
    return (
      <main className="auth-shell">
        <div className="auth-brand" aria-label="Revision">Revision<span aria-hidden="true">✦</span></div>
        <section className="auth-card" aria-labelledby="sign-in-heading">
          <p className="eyebrow">Your revision, your next step</p>
          <h1 id="sign-in-heading">Sign in</h1>
          <p className="intro">Sign in to access your revision and keep progress synced across devices.</p>
          <label>Email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <div className="auth-actions">
            <button className="primary" onClick={signIn}>Sign in</button>
            <button className="secondary" onClick={signUp}>Create account</button>
          </div>
          <p className="message" aria-live="polite">{message}</p>
        </section>
      </main>
    )
  }

  const subjectsActive = routeBelongsToSubjects(route)
  const globalNavigation = (
    <>
      <button className={route.kind === 'home' ? 'active' : ''} onClick={() => navigate(homeRoute())}>Home</button>
      <button className={subjectsActive ? 'active' : ''} onClick={() => navigate(subjectsRoute())}>Subjects</button>
      <button className={route.kind === 'progress' ? 'active' : ''} onClick={() => navigate(progressRoute())}>Progress</button>
      <button className={route.kind === 'rev' ? 'active' : ''} onClick={() => navigate(revRoute())}>REV</button>
    </>
  )

  function globalProgressSummary() {
    return (
      <div className="progress-overview">
        <article><small>Evidence coverage</small><strong>{evidencedTopics} / {totalTopics}</strong><p>Published topics with at least one recorded learning result.</p></article>
        <article><small>Scored activities</small><strong>{evidence.length}</strong><p>Evidence recorded across your current revision catalogue.</p></article>
        <article><small>Readiness available</small><strong>{readinessAvailable} / {learningStates.length}</strong><p>Courses or distinct components with enough varied evidence to show a readiness score.</p></article>
      </div>
    )
  }

  function learningProgressSummary(state: ModuleLearningState) {
    const readinessLabel = state.course ? 'Course readiness' : 'Component readiness'
    return (
      <div className="progress-overview">
        <article><small>Evidence coverage</small><strong>{state.evidencedTopics} / {state.topicCount}</strong><p>Topics with at least one recorded learning result.</p></article>
        <article><small>Scored activities</small><strong>{state.readiness.evidenceCount}</strong><p>Evidence used by this readiness model.</p></article>
        <article><small>{readinessLabel}</small><strong>{state.readiness.score === null ? 'Building' : `${state.readiness.score}%`}</strong><p>{state.readiness.score === null ? 'More varied evidence is needed before showing a score.' : `${state.readiness.confidence} confidence based on the evidence available.`}</p></article>
      </div>
    )
  }

  function learningProgressDetail(state: ModuleLearningState) {
    const activity = recentActivity(state.evidence)
    return (
      <div className="progress-grid contextual-progress" aria-label="Progress detail">
        <section aria-labelledby="recent-activity">
          <p className="eyebrow">What have I done?</p>
          <h2 id="recent-activity">Recent activity</h2>
          {evidenceError && <p className="error">{evidenceError}</p>}
          {!evidenceError && activity.length === 0 && <p className="muted">No scored activity has been recorded yet. Complete a Flashcard rating, Quick check or marked exam response and it will appear here.</p>}
          <ul className="activity-list">
            {activity.map((item) => <li key={item.id}><strong>{item.label}</strong><span>{item.detail}</span><time dateTime={item.occurredAt}>{new Date(item.occurredAt).toLocaleDateString()}</time></li>)}
          </ul>
        </section>
        <section aria-labelledby="readiness-progress">
          <p className="eyebrow">What does my progress mean?</p>
          <h2 id="readiness-progress">Readiness progress</h2>
          {state.readiness.score === null ? (
            <><div className="readiness-number">Building evidence</div><p>{state.readiness.explanation}</p><p className="muted"><strong>{state.readiness.evidenceCount}</strong> scored activities are currently available to the readiness model.</p></>
          ) : (
            <><div className="readiness-number">{state.readiness.score}%</div><p><strong>{state.readiness.confidence} confidence</strong></p><p className="muted">{state.readiness.explanation}</p></>
          )}
        </section>
      </div>
    )
  }

  function renderHome() {
    return (
      <main className="dashboard screen-dashboard" aria-label="Home">
        <div className="hero-layout">
          <section className={`rev-hero ${revSuggested ? 'rev-awake' : ''}`} aria-labelledby="rev-welcome">
            <div className="rev-copy">
              <div className="rev-pill"><span aria-hidden="true">✦</span> REV AI GUIDE</div>
              <h1 id="rev-welcome">Hi, {learner} 👋</h1>
              <h2 className="rev-question">What shall we do today?</h2>
              <p className={`rev-message ${displayedRevTyping ? 'typing' : ''}`} aria-live="polite">{displayedRevMessage}</p>
              {!revSuggested ? (
                <div className="rev-actions"><button className="rev-primary" onClick={suggestNextStep}>Suggest my next step <span aria-hidden="true">→</span></button><button className="rev-secondary" onClick={chooseMyself}>I want to choose</button></div>
              ) : (
                <div className="rev-suggestion">
                  {recommendedState && <><p><strong>{recommendedState.adapter.manifest.subject.name}{recommendedState.recommendationTopic ? ` · ${recommendedState.recommendationTopic.shortTitle}` : ''}{recommendedState.recommendation ? ` · ${activityLabel(recommendedState.recommendation.activity)}` : ''}</strong></p>{recommendedState.recommendation && <><p className="rev-evidence">{recommendedState.recommendation.evidenceSummary}</p><p className="rev-limitation">{recommendedState.recommendation.limitation}</p></>}</>}
                  <div className="rev-actions"><button className="rev-primary" onClick={goToRecommendation}>Take me to {recommendedState?.adapter.manifest.subject.name ?? 'Subjects'} <span aria-hidden="true">→</span></button><button className="rev-secondary" onClick={chooseMyself}>I’ll choose</button></div>
                </div>
              )}
            </div>
            <div className="rev-orb-wrap" aria-hidden="true"><div className="rev-orb"><span className="orb-ring ring-one"></span><span className="orb-ring ring-two"></span><span className="orbit-dot"></span><span className="orb-core"><svg viewBox="0 0 160 80"><path className="wave-line" d="M5 42H33L43 39L51 55L62 18L74 63L86 29L98 50L108 42H155" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg></span></div></div>
          </section>
          <aside className="today-card" aria-labelledby="today-title">
            <div className="today-heading"><span className="today-icon" aria-hidden="true">◎</span><div><p className="eyebrow">At a glance</p><h2 id="today-title">Today’s picture</h2></div></div>
            <dl className="today-list"><div><dt>Subjects</dt><dd>{catalogue.length} in your revision catalogue</dd></div><div><dt>REV focus</dt><dd>{recommendedState?.adapter.manifest.subject.name ?? 'Add a subject'}</dd></div><div><dt>Within that subject</dt><dd>{recommendedState?.recommendationTopic?.shortTitle ?? 'Build a baseline'}</dd></div></dl>
            <p className="today-note">{recommendedState?.recommendation?.limitation ?? 'REV will become more specific as you complete scored work.'}</p>
            <button className="text-link" onClick={goToRecommendation}>Open {recommendedState?.adapter.manifest.subject.name ?? 'Subjects'} <span aria-hidden="true">→</span></button>
          </aside>
        </div>
        <section className="home-section" aria-labelledby="home-subjects-title">
          <div className="section-heading"><div><p className="eyebrow">Your subjects</p><h2 id="home-subjects-title">Everything you’re revising</h2></div><button className="text-link" onClick={() => navigate(subjectsRoute())}>See subjects <span aria-hidden="true">→</span></button></div>
          <div className="subject-list">{catalogue.map((subject) => <article className="subject-card" key={subject.id}><div className="subject-mark" aria-hidden="true">{subjectMark(subject)}</div><div className="subject-copy"><span className="tag">Available</span><h3>{subject.name}</h3><p>{subject.courses.length} {subject.courses.length === 1 ? 'course' : 'courses'} · {subject.modules.length} {subject.modules.length === 1 ? 'exam paper/component' : 'exam papers/components'}</p></div><button className="secondary" onClick={() => navigate(subjectRoute(subject.id))}>Open subject</button></article>)}</div>
        </section>
        <section className="home-section" aria-labelledby="home-progress-title"><div className="section-heading"><div><p className="eyebrow">Your progress</p><h2 id="home-progress-title">The current evidence picture</h2></div><button className="text-link" onClick={() => navigate(progressRoute())}>See progress <span aria-hidden="true">→</span></button></div>{globalProgressSummary()}</section>
      </main>
    )
  }

  function renderSubjects() {
    return (
      <main className="dashboard screen-dashboard page-screen" aria-labelledby="subjects-page-title">
        <header className="page-heading"><p className="eyebrow">Your revision programme</p><h1 id="subjects-page-title">Subjects</h1><p>Choose the subject you want to work on. Shared syllabus learning sits at course level; paper-specific work sits inside Exam Prep.</p></header>
        <section className="subject-list" aria-label="Subjects in your revision catalogue">
          {catalogue.map((subject) => {
            const states = learningStates.filter((state) => state.adapter.manifest.subject.id === subject.id)
            const topicCount = states.reduce((sum, state) => sum + state.topicCount, 0)
            return <article className="subject-card subject-card-large" key={subject.id}><div className="subject-mark" aria-hidden="true">{subjectMark(subject)}</div><div className="subject-copy"><span className="tag">Available now</span><h2>{subject.name}</h2><p>{subject.courses.map((course) => `${course.qualificationName} · ${course.examBoardName}`).join(' · ')}</p><p className="muted">{topicCount} course/component topics across {subject.courses.length} {subject.courses.length === 1 ? 'course' : 'courses'}.</p></div><button className="primary" onClick={() => navigate(subjectRoute(subject.id))}>Open {subject.name}</button></article>
          })}
        </section>
      </main>
    )
  }

  function renderSubjectHome(subjectId: string) {
    const subject = catalogue.find((item) => item.id === subjectId)
    if (!subject) return <main className="dashboard page-screen"><p className="error">This subject is not available in the current catalogue.</p><button className="primary" onClick={() => navigate(subjectsRoute())}>Back to Subjects</button></main>
    const subjectStates = learningStates.filter((state) => state.adapter.manifest.subject.id === subject.id)
    const subjectRecommendation = chooseRecommendedModule(subjectStates)
    return (
      <main className="dashboard screen-dashboard page-screen" aria-labelledby="subject-home-title">
        <div className="breadcrumbs"><button onClick={() => navigate(subjectsRoute())}>Subjects</button><span>›</span><span>{subject.name}</span></div>
        <header className="subject-page-heading"><div className="subject-mark subject-mark-large" aria-hidden="true">{subjectMark(subject)}</div><div><p className="eyebrow">Subject Home</p><h1 id="subject-home-title">{subject.name}</h1><p>{subject.courses.map((course) => `${course.qualificationName} · ${course.examBoardName}`).join(' · ')}</p></div></header>
        <section className="subject-rev" aria-labelledby="subject-rev-title"><div className="mini-orb subject-rev-orb" aria-hidden="true"></div><div><p className="eyebrow">REV · {subject.name} context</p><h2 id="subject-rev-title">What should I work on in {subject.name}?</h2><p>{subjectRecommendation ? `I’d continue with ${scopeLabel(subjectRecommendation)}. ${subjectRecommendation.recommendationTopic ? `${subjectRecommendation.recommendationTopic.shortTitle} is the most useful current focus${subjectRecommendation.recommendation ? `, using ${activityLabel(subjectRecommendation.recommendation.activity)}` : ''}.` : 'Start with a short activity so I can build the evidence picture.'}` : 'There is no available course/component for this subject yet.'}</p>{subjectRecommendation && <div className="inline-actions"><button className="primary" onClick={() => navigate(routeForState(subjectRecommendation))}>Open {scopeLabel(subjectRecommendation)}</button><button className="secondary" onClick={() => navigate(routeForState(subjectRecommendation, 'progress'))}>See progress</button></div>}</div></section>

        {subject.courses.map((course) => {
          const label = catalogueCourseLabel(course, subject.name)
          if (course.sharedLearning) {
            return (
              <section className="home-section" aria-label={label} key={course.id}>
                <div className="section-heading"><div><p className="eyebrow">Your course</p><h2>{label}</h2></div></div>
                <article className="course-card">
                  <div><span className="tag">Specification {course.specificationCode}</span><h3>{label}</h3><p>{course.learningAdapter.catalogueEntry.topicCount} syllabus topics · {course.modules.length} {course.modules.length === 1 ? 'exam paper/component' : 'exam papers/components'}</p><p className="muted">Learn and Practice the shared syllabus once. Choose individual papers inside Exam Prep.</p></div>
                  <button className="primary" onClick={() => navigate(courseRoute(subject.id, course.id))}>Open course</button>
                </article>
              </section>
            )
          }
          return (
            <section className="home-section" aria-label={label} key={course.id}>
              <div className="section-heading"><div><p className="eyebrow">Your course</p><h2>{label}</h2></div></div>
              <div className="subject-list">{course.modules.map((adapter) => <article className="course-card" key={adapter.manifest.id}><div><span className="tag">Specification {adapter.manifest.specificationCode}</span><h3>{adapter.manifest.paper.name}</h3><p>{adapter.catalogueEntry.topicCount} topics · {adapter.catalogueEntry.totalMarks} marks · {adapter.catalogueEntry.durationMinutes} minutes</p><p className="muted">This component has distinct learning content, so it keeps its own learning context.</p></div><button className="primary" onClick={() => navigate(moduleRoute(subject.id, adapter.manifest.id))}>Open {paperLabel(adapter)}</button></article>)}</div>
            </section>
          )
        })}
      </main>
    )
  }

  function renderCourseScreen(subjectId: string, courseId: string, requestedSection: CourseSection) {
    const subject = catalogue.find((item) => item.id === subjectId)
    const course = subject?.courses.find((item) => item.id === courseId)
    const state = learningStates.find((item) => item.course?.id === courseId)
    if (!subject || !course || !course.sharedLearning || !state) return <main className="dashboard page-screen"><p className="error">This course is not available as a shared course-level learning experience.</p><button className="primary" onClick={() => navigate(subjectRoute(subjectId))}>Back to subject</button></main>

    const adapter = course.learningAdapter
    const sections = availableCourseSections(course)
    const section = sections.includes(requestedSection) ? requestedSection : 'overview'
    const topics = adapter.listTopics()
    const label = catalogueCourseLabel(course, subject.name)
    const recommendation = state.recommendation
    const recommendationTopic = state.recommendationTopic
    const recommendationSection: CourseSection = recommendation?.activity === 'exam-question' ? 'exam-prep' : 'practice'
    const courseNavigation = (
      <nav className="course-nav" aria-label={`${label} navigation`}>
        {sections.map((item) => {
          const labels = { overview: 'Overview', learn: 'Learn', practice: 'Practice', 'exam-prep': 'Exam Prep', progress: 'Progress' }
          return <button key={item} className={section === item ? 'active' : ''} onClick={() => navigate(courseRoute(subjectId, courseId, item))}>{labels[item]}</button>
        })}
      </nav>
    )

    return (
      <main className="dashboard screen-dashboard page-screen paper-screen" aria-labelledby="course-page-title">
        <div className="breadcrumbs"><button onClick={() => navigate(subjectsRoute())}>Subjects</button><span>›</span><button onClick={() => navigate(subjectRoute(subjectId))}>{subject.name}</button><span>›</span><span>{course.qualificationName}</span></div>
        <header className="page-heading paper-heading"><p className="eyebrow">{course.examBoardName} · specification {course.specificationCode}</p><h1 id="course-page-title">{label}</h1><p>Learn and practise the shared course syllabus here. Paper-specific formats, techniques and full simulations are grouped inside Exam Prep.</p></header>
        {courseNavigation}

        {section === 'overview' && <div className="paper-section-content">
          <section className="paper-recommendation" aria-labelledby="course-recommendation-title"><div><p className="eyebrow">REV · {label}</p><h2 id="course-recommendation-title">Your next useful step</h2><p>{recommendation && recommendationTopic ? `${recommendationTopic.shortTitle} · ${activityLabel(recommendation.activity)}. ${recommendation.reason}` : 'Complete a short Practice activity and I’ll use that evidence to guide the next step.'}</p>{recommendation && <p className="muted">{recommendation.limitation}</p>}</div>{sections.includes(recommendationSection) && <button className="primary" onClick={() => navigate(courseRoute(subjectId, courseId, recommendationSection))}>Go to {recommendationSection === 'exam-prep' ? 'Exam Prep' : 'Practice'}</button>}</section>
          <section className="section-choice-grid" aria-label={`${label} sections`}>
            <button className="section-choice" onClick={() => navigate(courseRoute(subjectId, courseId, 'learn'))}><span className="section-icon">L</span><strong>Learn</strong><span>Understand the syllabus once at course level.</span></button>
            {sections.includes('practice') && <button className="section-choice" onClick={() => navigate(courseRoute(subjectId, courseId, 'practice'))}><span className="section-icon">P</span><strong>Practice</strong><span>Flashcards, quick checks, application and calculations.</span></button>}
            {sections.includes('exam-prep') && <button className="section-choice" onClick={() => navigate(courseRoute(subjectId, courseId, 'exam-prep'))}><span className="section-icon">E</span><strong>Exam Prep</strong><span>Choose a paper, learn its format and practise under exam conditions.</span></button>}
            <button className="section-choice" onClick={() => navigate(courseRoute(subjectId, courseId, 'progress'))}><span className="section-icon">✓</span><strong>Progress</strong><span>Course coverage, evidence and readiness.</span></button>
          </section>
          <section className="home-section" aria-labelledby="course-topics-title"><div className="section-heading"><div><p className="eyebrow">Specification areas</p><h2 id="course-topics-title">Course topics</h2></div></div><div className="topic-list-grid">{topics.map((topic) => { const hasEvidence = state.evidence.some((item) => item.topicId === topic.id); return <article key={topic.id}><span className={`evidence-dot ${hasEvidence ? 'has-evidence' : ''}`} aria-hidden="true"></span><div><strong>{topic.shortTitle}</strong><p>{hasEvidence ? 'Evidence recorded' : 'No scored evidence yet'}</p></div></article> })}</div></section>
        </div>}

        {section === 'learn' && <div className="paper-section-content"><FocusedLearningWorkspace adapter={adapter} section="learn" recommendation={recommendation} saving={savingEvidence} saveError={saveError} onRecordEvidence={saveLearningEvidence} contextLabel={label} includeExamQuestions={false} />{sections.includes('practice') && <div className="cross-section-next"><div><strong>Ready to test it?</strong><span>Move into Practice without creating a duplicate paper-level syllabus.</span></div><button className="primary" onClick={() => navigate(courseRoute(subjectId, courseId, 'practice'))}>Go to Practice</button></div>}</div>}

        {section === 'practice' && <div className="paper-section-content"><FocusedLearningWorkspace adapter={adapter} section="practice" recommendation={recommendation?.activity === 'exam-question' ? null : recommendation} saving={savingEvidence} saveError={saveError} onRecordEvidence={saveLearningEvidence} contextLabel={label} includeExamQuestions={false} />{sections.includes('exam-prep') && <div className="cross-section-next"><div><strong>Ready for exam-specific work?</strong><span>Paper formats, written exam questions and full simulations are inside Exam Prep.</span></div><button className="primary" onClick={() => navigate(courseRoute(subjectId, courseId, 'exam-prep'))}>Go to Exam Prep</button></div>}</div>}

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

        {section === 'progress' && <div className="paper-section-content"><section className="progress-section-heading"><p className="eyebrow">{label} progress</p><h2>What the evidence says</h2><p>Shared syllabus coverage is counted once at course level. Exam attempts from individual papers still contribute evidence to the course picture.</p></section>{learningProgressSummary(state)}{learningProgressDetail(state)}<section className="home-section" aria-labelledby="course-topic-progress-title"><div className="section-heading"><div><p className="eyebrow">Topic evidence</p><h2 id="course-topic-progress-title">Where you have evidence</h2></div></div><div className="topic-list-grid">{topics.map((topic) => { const count = state.evidence.filter((item) => item.topicId === topic.id).length; return <article key={topic.id}><span className={`evidence-dot ${count > 0 ? 'has-evidence' : ''}`} aria-hidden="true"></span><div><strong>{topic.shortTitle}</strong><p>{count === 0 ? 'No scored evidence yet' : `${count} scored ${count === 1 ? 'activity' : 'activities'}`}</p></div></article> })}</div></section></div>}
      </main>
    )
  }

  function renderModuleScreen(subjectId: string, moduleId: string, requestedSection: PaperSection) {
    const sharedCourse = courseForModule(moduleId)
    if (sharedCourse?.sharedLearning) return renderCourseScreen(subjectId, sharedCourse.id, requestedSection)

    const adapter = getContentAdapter(moduleId)
    const state = stateForModule(moduleStates, moduleId)
    if (!adapter || !state || adapter.manifest.subject.id !== subjectId) return <main className="dashboard page-screen"><p className="error">This paper/component is not available in the current catalogue.</p><button className="primary" onClick={() => navigate(subjectsRoute())}>Back to Subjects</button></main>
    const sections = availablePaperSections(adapter)
    const section = sections.includes(requestedSection) ? requestedSection : 'overview'
    const topics = adapter.listTopics()
    const primaryExam = adapter.listExams()[0]
    const pLabel = paperLabel(adapter)
    const cLabel = courseLabel(adapter)
    const recommendation = state.recommendation
    const recommendationTopic = state.recommendationTopic
    const paperNavigation = <nav className="course-nav" aria-label={`${pLabel} navigation`}>{sections.map((item) => { const labels = { overview: 'Overview', learn: 'Learn', practice: 'Practice', 'exam-prep': 'Exam Prep', progress: 'Progress' }; return <button key={item} className={section === item ? 'active' : ''} onClick={() => navigate(moduleRoute(subjectId, moduleId, item))}>{labels[item]}</button> })}</nav>
    return <main className="dashboard screen-dashboard page-screen paper-screen" aria-labelledby="paper-page-title"><div className="breadcrumbs"><button onClick={() => navigate(subjectsRoute())}>Subjects</button><span>›</span><button onClick={() => navigate(subjectRoute(subjectId))}>{adapter.manifest.subject.name}</button><span>›</span><span>{pLabel}</span></div><header className="page-heading paper-heading"><p className="eyebrow">{cLabel} · specification {adapter.manifest.specificationCode}</p><h1 id="paper-page-title">{adapter.manifest.paper.name}</h1><p>{adapter.manifest.learnerExperience.what_is_this}</p></header>{paperNavigation}{section === 'overview' && <div className="paper-section-content"><section className="paper-recommendation" aria-labelledby="paper-recommendation-title"><div><p className="eyebrow">REV · {pLabel}</p><h2 id="paper-recommendation-title">Your next useful step</h2><p>{recommendation && recommendationTopic ? `${recommendationTopic.shortTitle} · ${activityLabel(recommendation.activity)}. ${recommendation.reason}` : 'Complete a short Practice activity and I’ll use that evidence to guide the next step.'}</p></div></section><section className="home-section" aria-labelledby="paper-topics-title"><div className="section-heading"><div><p className="eyebrow">Specification areas</p><h2 id="paper-topics-title">{pLabel} topics</h2></div></div><div className="topic-list-grid">{topics.map((topic) => <article key={topic.id}><div><strong>{topic.shortTitle}</strong></div></article>)}</div></section></div>}{section === 'learn' && <div className="paper-section-content"><FocusedLearningWorkspace adapter={adapter} section="learn" recommendation={recommendation} saving={savingEvidence} saveError={saveError} onRecordEvidence={saveLearningEvidence} /></div>}{section === 'practice' && <div className="paper-section-content"><FocusedLearningWorkspace adapter={adapter} section="practice" recommendation={recommendation} saving={savingEvidence} saveError={saveError} onRecordEvidence={saveLearningEvidence} /></div>}{section === 'exam-prep' && <div className="paper-section-content"><FocusedLearningWorkspace adapter={adapter} section="exam-prep" recommendation={null} saving={savingEvidence} saveError={saveError} onRecordEvidence={saveLearningEvidence} />{primaryExam && <section className="exam-simulator-section" aria-label="Full paper simulator"><ExamSimulator exam={primaryExam} moduleId={moduleId} saving={savingEvidence} saveError={saveError} onRecordEvidence={saveLearningEvidence} /></section>}</div>}{section === 'progress' && <div className="paper-section-content">{learningProgressSummary(state)}{learningProgressDetail(state)}</div>}</main>
  }

  function renderGlobalProgress() {
    return (
      <main className="dashboard screen-dashboard page-screen" aria-labelledby="global-progress-title">
        <header className="page-heading"><p className="eyebrow">Across your revision</p><h1 id="global-progress-title">Progress</h1><p>Start with the whole picture, then drill into a subject, course or distinct component when you need detail.</p></header>
        <section className="home-section" aria-labelledby="global-summary-title"><div className="section-heading"><div><p className="eyebrow">Whole programme</p><h2 id="global-summary-title">Current evidence</h2></div></div>{globalProgressSummary()}</section>
        <div className="subject-list">{catalogue.map((subject) => { const states = learningStates.filter((state) => state.adapter.manifest.subject.id === subject.id); const topicTotal = states.reduce((sum, state) => sum + state.topicCount, 0); const topicEvidence = states.reduce((sum, state) => sum + state.evidencedTopics, 0); const readinessScores = states.filter((state) => state.readiness.score !== null); return <section className="global-progress-card" aria-labelledby={`progress-${subject.id}`} key={subject.id}><div className="subject-mark" aria-hidden="true">{subjectMark(subject)}</div><div className="global-progress-copy"><p className="eyebrow">{subject.name}</p><h2 id={`progress-${subject.id}`}>{topicEvidence} of {topicTotal} topics have evidence</h2><p>{states.length} {states.length === 1 ? 'course/component learning scope' : 'course/component learning scopes'} in the current catalogue.</p><p className="muted">{readinessScores.length === 0 ? 'Readiness is still building enough evidence.' : `${readinessScores.length} ${readinessScores.length === 1 ? 'scope has' : 'scopes have'} a supported readiness score.`}</p></div><button className="primary" onClick={() => navigate(subjectRoute(subject.id))}>Open {subject.name}</button></section> })}</div>
        <section className="home-section" aria-labelledby="global-recent-title"><div className="section-heading"><div><p className="eyebrow">Recent evidence</p><h2 id="global-recent-title">Latest activity</h2></div></div>{globalActivity.length === 0 ? <p className="muted">No scored activity yet.</p> : <ul className="activity-list">{globalActivity.slice(0, 5).map((item) => { const adapter = getContentAdapter(item.moduleId); return <li key={item.id}><strong>{adapter ? `${adapter.manifest.subject.name} · ${item.label}` : item.label}</strong><span>{item.detail}</span><time dateTime={item.occurredAt}>{new Date(item.occurredAt).toLocaleDateString()}</time></li> })}</ul>}</section>
      </main>
    )
  }

  function renderRev() {
    return <main className="dashboard screen-dashboard page-screen rev-page" aria-labelledby="rev-page-title"><header className="page-heading"><p className="eyebrow">Your AI guide</p><h1 id="rev-page-title">REV</h1><p>REV keeps the wider revision picture in view, then narrows into the subject, course, topic or exam paper you are working on.</p></header><section className={`rev-hero rev-page-hero ${revSuggested ? 'rev-awake' : ''}`} aria-labelledby="rev-conversation-title"><div className="rev-copy"><div className="rev-pill"><span aria-hidden="true">✦</span> REV</div><h2 id="rev-conversation-title">What do you want help with?</h2><p className={`rev-message ${displayedRevTyping ? 'typing' : ''}`} aria-live="polite">{displayedRevMessage}</p><div className="rev-actions"><button className="rev-primary" onClick={suggestNextStep}>What should I revise?</button><button className="rev-secondary" onClick={() => navigate(subjectsRoute())}>Show my subjects</button>{recommendedState && <button className="rev-secondary" onClick={() => navigate(routeForState(recommendedState))}>Open {scopeLabel(recommendedState)}</button>}</div></div><div className="rev-orb-wrap" aria-hidden="true"><div className="rev-orb"><span className="orb-ring ring-one"></span><span className="orb-ring ring-two"></span><span className="orbit-dot"></span><span className="orb-core"></span></div></div></section><p className="quiet-note">The current REV recommendation compares course-level evidence where syllabus content is shared, so adding several exam papers does not make the same topic look like several separate learning gaps.</p></main>
  }

  let screen = renderHome()
  if (route.kind === 'subjects') screen = renderSubjects()
  else if (route.kind === 'subject') screen = renderSubjectHome(route.subjectId)
  else if (route.kind === 'course') screen = renderCourseScreen(route.subjectId, route.courseId, route.section)
  else if (route.kind === 'module') screen = renderModuleScreen(route.subjectId, route.moduleId, route.section)
  else if (route.kind === 'progress') screen = renderGlobalProgress()
  else if (route.kind === 'rev') screen = renderRev()

  return <div className="app-shell"><header className="topbar desktop-topbar"><button className="brand-button" onClick={() => navigate(homeRoute())} aria-label="Revision home">Revision<span aria-hidden="true">✦</span></button><nav className="desktop-nav" aria-label="Primary navigation">{globalNavigation}</nav><button className="account-chip" onClick={() => setMenuOpen(true)} aria-haspopup="dialog" aria-expanded={menuOpen}><span className="account-avatar">{learner.charAt(0).toUpperCase()}</span><span><strong>{learner}</strong><small>Account</small></span><span aria-hidden="true">⌄</span></button></header><header className="mobile-topbar"><button className="brand-button" onClick={() => navigate(homeRoute())} aria-label="Revision home">Revision<span aria-hidden="true">✦</span></button><button className="burger-button" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}><span></span><span></span><span></span></button></header>{screen}<nav className="bottom-nav four-item-nav" aria-label="Mobile navigation"><button className={route.kind === 'home' ? 'active' : ''} onClick={() => navigate(homeRoute())}><span className="nav-icon" aria-hidden="true">⌂</span><span>Home</span></button><button className={subjectsActive ? 'active' : ''} onClick={() => navigate(subjectsRoute())}><span className="nav-icon" aria-hidden="true">▤</span><span>Subjects</span></button><button className={route.kind === 'progress' ? 'active' : ''} onClick={() => navigate(progressRoute())}><span className="nav-icon" aria-hidden="true">▥</span><span>Progress</span></button><button className={route.kind === 'rev' ? 'active' : ''} onClick={() => navigate(revRoute())}><span className="mini-orb" aria-hidden="true"></span><span>REV</span></button></nav>{menuOpen && <button className="menu-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)}></button>}<aside className={`menu-drawer ${menuOpen ? 'open' : ''}`} aria-label="Account and additional links" aria-hidden={!menuOpen}><div className="drawer-head"><div><p className="eyebrow">Account</p><h2>{learner}</h2><p>{user.email}</p></div><button className="drawer-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">×</button></div><nav className="drawer-links"><button onClick={() => navigate(subjectsRoute())}>My subjects <span>→</span></button><button onClick={() => navigate(progressRoute())}>My progress <span>→</span></button><button onClick={() => navigate(revRoute())}>Ask REV <span>→</span></button></nav><button className="signout-button" onClick={signOut}>Sign out</button></aside></div>
}
