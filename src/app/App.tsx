import { useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { getContentAdapter } from '../engine/content/content-registry'
import type { LearningEvidence } from '../engine/evidence/evidence'
import { assessPaperReadiness, recommendNextActivity } from '../engine/readiness/readiness'
import { createSupabaseEvidenceStore, loadLearningEvidence, recordLearningEvidence } from '../services/progress/learning-evidence-service'
import { currentAppUrl, supabase } from '../services/supabase/browser-client'
import { ExamSimulator } from './ExamSimulator'
import { FocusedLearningWorkspace } from './FocusedLearningWorkspace'
import { parseRoute, paperSectionRoute, routeBelongsToSubjects, routeHash, type AppRoute } from './navigation'
import { recentActivity } from './progress-view'

const moduleId = 'business-aqa-as-paper-2'
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
  if (activity === 'exam-question') return 'Exam question'
  return 'Quick check'
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function isPaperRoute(route: AppRoute) {
  return route.startsWith('paper-2-')
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

  const adapter = getContentAdapter(moduleId)
  const topics = useMemo(() => adapter?.listTopics() ?? [], [adapter])
  const topicIds = useMemo(() => topics.map((topic) => topic.id), [topics])
  const readiness = useMemo(() => assessPaperReadiness(moduleId, topicIds, evidence), [topicIds, evidence])
  const recommendation = useMemo(() => recommendNextActivity(moduleId, topicIds, evidence), [topicIds, evidence])
  const activity = useMemo(() => recentActivity(evidence), [evidence])
  const primaryExam = adapter?.listExams()[0]
  const recommendationTopic = recommendation && adapter ? adapter.getTopic(recommendation.topicId) : undefined
  const learner = user ? learnerName(user) : 'there'
  const evidencedTopics = useMemo(
    () => new Set(evidence.filter((item) => item.moduleId === moduleId).map((item) => item.topicId)).size,
    [evidence],
  )

  const recommendationMessage = recommendation && recommendationTopic
    ? `Business is the subject currently in your revision list. Within Paper 2, I’d start with ${recommendationTopic.shortTitle} using ${activityLabel(recommendation.activity)}. ${recommendation.reason}`
    : 'Business is the subject currently in your revision list. I need a little more evidence before I can make a useful Paper 2 recommendation.'
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
        setRoute('home')
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
    loadLearningEvidence(store, user.id, moduleId)
      .then((items) => {
        setEvidence(items)
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
    if (window.location.hash === nextHash) {
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
    navigate('subjects')
  }

  function goToRecommendation() {
    navigate('subject-business')
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
  const paperLabel = adapter ? `Paper ${adapter.manifest.paper.number}` : 'Paper 2'
  const courseLabel = adapter ? `${adapter.manifest.qualification.name} Business` : 'AQA AS Business'
  const specificationCode = adapter?.manifest.specificationCode ?? '7131'

  const globalNavigation = (
    <>
      <button className={route === 'home' ? 'active' : ''} onClick={() => navigate('home')}>Home</button>
      <button className={subjectsActive ? 'active' : ''} onClick={() => navigate('subjects')}>Subjects</button>
      <button className={route === 'progress' ? 'active' : ''} onClick={() => navigate('progress')}>Progress</button>
      <button className={route === 'rev' ? 'active' : ''} onClick={() => navigate('rev')}>REV</button>
    </>
  )

  const paperNavigation = isPaperRoute(route) ? (
    <nav className="course-nav" aria-label="Paper 2 navigation">
      {(['overview', 'learn', 'practice', 'exam-prep', 'progress'] as const).map((section) => {
        const target = paperSectionRoute(section)
        const labels = { overview: 'Overview', learn: 'Learn', practice: 'Practice', 'exam-prep': 'Exam Prep', progress: 'Progress' }
        return <button key={section} className={route === target ? 'active' : ''} onClick={() => navigate(target)}>{labels[section]}</button>
      })}
    </nav>
  ) : null

  function progressSummary() {
    return (
      <div className="progress-overview">
        <article><small>Evidence coverage</small><strong>{evidencedTopics} / {topicIds.length}</strong><p>Topics with at least one recorded learning result.</p></article>
        <article><small>Scored activities</small><strong>{readiness.evidenceCount}</strong><p>Evidence used by the current Paper 2 readiness model.</p></article>
        <article><small>Paper readiness</small><strong>{readiness.score === null ? 'Building' : `${readiness.score}%`}</strong><p>{readiness.score === null ? 'More varied evidence is needed before showing a score.' : `${readiness.confidence} confidence based on the evidence available.`}</p></article>
      </div>
    )
  }

  function progressDetail() {
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
          {readiness.score === null ? (
            <>
              <div className="readiness-number">Building evidence</div>
              <p>{readiness.explanation}</p>
              <p className="muted"><strong>{readiness.evidenceCount}</strong> scored activities are currently available to the readiness model.</p>
            </>
          ) : (
            <>
              <div className="readiness-number">{readiness.score}%</div>
              <p><strong>{readiness.confidence} confidence</strong></p>
              <p className="muted">{readiness.explanation}</p>
            </>
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
                <div className="rev-actions">
                  <button className="rev-primary" onClick={suggestNextStep}>Suggest my next step <span aria-hidden="true">→</span></button>
                  <button className="rev-secondary" onClick={chooseMyself}>I want to choose</button>
                </div>
              ) : (
                <div className="rev-suggestion">
                  {recommendation && recommendationTopic && (
                    <>
                      <p><strong>Business · {recommendationTopic.shortTitle} · {activityLabel(recommendation.activity)}</strong></p>
                      <p className="rev-evidence">{recommendation.evidenceSummary}</p>
                      <p className="rev-limitation">{recommendation.limitation}</p>
                    </>
                  )}
                  <div className="rev-actions">
                    <button className="rev-primary" onClick={goToRecommendation}>Take me to Business <span aria-hidden="true">→</span></button>
                    <button className="rev-secondary" onClick={chooseMyself}>I’ll choose</button>
                  </div>
                </div>
              )}
            </div>

            <div className="rev-orb-wrap" aria-hidden="true">
              <div className="rev-orb">
                <span className="orb-ring ring-one"></span>
                <span className="orb-ring ring-two"></span>
                <span className="orbit-dot"></span>
                <span className="orb-core">
                  <svg viewBox="0 0 160 80">
                    <path className="wave-line" d="M5 42H33L43 39L51 55L62 18L74 63L86 29L98 50L108 42H155" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </div>
          </section>

          <aside className="today-card" aria-labelledby="today-title">
            <div className="today-heading">
              <span className="today-icon" aria-hidden="true">◎</span>
              <div><p className="eyebrow">At a glance</p><h2 id="today-title">Today’s picture</h2></div>
            </div>
            <dl className="today-list">
              <div><dt>Subjects</dt><dd>1 in your revision list</dd></div>
              <div><dt>REV focus</dt><dd>Business</dd></div>
              <div><dt>Within Business</dt><dd>{recommendationTopic?.shortTitle ?? 'Build your Paper 2 baseline'}</dd></div>
            </dl>
            <p className="today-note">{recommendation?.limitation ?? readiness.progress.message}</p>
            <button className="text-link" onClick={() => navigate('subject-business')}>Open Business <span aria-hidden="true">→</span></button>
          </aside>
        </div>

        <section className="home-section" aria-labelledby="home-subjects-title">
          <div className="section-heading">
            <div><p className="eyebrow">Your subjects</p><h2 id="home-subjects-title">Everything you’re revising</h2></div>
            <button className="text-link" onClick={() => navigate('subjects')}>See subjects <span aria-hidden="true">→</span></button>
          </div>
          <article className="subject-card">
            <div className="subject-mark" aria-hidden="true">B</div>
            <div className="subject-copy">
              <span className="tag">Current subject</span>
              <h3>Business</h3>
              <p>{courseLabel} · specification {specificationCode}</p>
            </div>
            <button className="secondary" onClick={() => navigate('subject-business')}>Open subject</button>
          </article>
        </section>

        <section className="home-section" aria-labelledby="home-progress-title">
          <div className="section-heading">
            <div><p className="eyebrow">Your progress</p><h2 id="home-progress-title">The current evidence picture</h2></div>
            <button className="text-link" onClick={() => navigate('progress')}>See progress <span aria-hidden="true">→</span></button>
          </div>
          {progressSummary()}
        </section>
      </main>
    )
  }

  function renderSubjects() {
    return (
      <main className="dashboard screen-dashboard page-screen" aria-labelledby="subjects-page-title">
        <header className="page-heading">
          <p className="eyebrow">Your revision programme</p>
          <h1 id="subjects-page-title">Subjects</h1>
          <p>Choose the subject you want to work on. Each subject keeps its own course, paper/component, learning and progress context.</p>
        </header>
        <section className="subject-list" aria-label="Subjects in your revision list">
          <article className="subject-card subject-card-large">
            <div className="subject-mark" aria-hidden="true">B</div>
            <div className="subject-copy">
              <span className="tag">Available now</span>
              <h2>Business</h2>
              <p>{courseLabel} · specification {specificationCode}</p>
              <p className="muted">{adapter?.catalogueEntry.topicCount ?? 0} Paper 2 topics currently available.</p>
            </div>
            <button className="primary" onClick={() => navigate('subject-business')}>Open Business</button>
          </article>
        </section>
        <p className="quiet-note">Additional subjects can be added to this level without changing Home or the global navigation.</p>
      </main>
    )
  }

  function renderSubjectHome() {
    return (
      <main className="dashboard screen-dashboard page-screen" aria-labelledby="business-home-title">
        <div className="breadcrumbs"><button onClick={() => navigate('subjects')}>Subjects</button><span>›</span><span>Business</span></div>
        <header className="subject-page-heading">
          <div className="subject-mark subject-mark-large" aria-hidden="true">B</div>
          <div><p className="eyebrow">Subject Home</p><h1 id="business-home-title">Business</h1><p>{courseLabel} · AQA specification {specificationCode}</p></div>
        </header>

        <section className="subject-rev" aria-labelledby="business-rev-title">
          <div className="mini-orb subject-rev-orb" aria-hidden="true"></div>
          <div>
            <p className="eyebrow">REV · Business context</p>
            <h2 id="business-rev-title">What should I work on in Business?</h2>
            <p>{recommendation && recommendationTopic ? `I’d continue with ${paperLabel}. ${recommendationTopic.shortTitle} is the most useful current focus, using ${activityLabel(recommendation.activity)}. ${recommendation.reason}` : `Start in ${paperLabel} and give me some evidence; I’ll use it to guide what comes next.`}</p>
            <div className="inline-actions">
              <button className="primary" onClick={() => navigate('paper-2-overview')}>Open {paperLabel}</button>
              <button className="secondary" onClick={() => navigate('paper-2-progress')}>See Business progress</button>
            </div>
          </div>
        </section>

        <section className="home-section" aria-labelledby="business-course-title">
          <div className="section-heading"><div><p className="eyebrow">Your course</p><h2 id="business-course-title">{courseLabel}</h2></div></div>
          <article className="course-card">
            <div>
              <span className="tag">Specification {specificationCode}</span>
              <h3>{adapter?.manifest.paper.name ?? 'Paper 2: Business 2'}</h3>
              <p>{adapter?.catalogueEntry.topicCount ?? 0} topics · {adapter?.catalogueEntry.totalMarks ?? 0} marks · {adapter?.catalogueEntry.durationMinutes ?? 90} minutes</p>
              <p className="muted">Open the paper hub, then choose Learn, Practice, Exam Prep or Progress.</p>
            </div>
            <button className="primary" onClick={() => navigate('paper-2-overview')}>Open {paperLabel}</button>
          </article>
        </section>

        <section className="home-section" aria-labelledby="business-progress-summary">
          <div className="section-heading"><div><p className="eyebrow">Business progress</p><h2 id="business-progress-summary">Current Paper 2 evidence</h2></div><button className="text-link" onClick={() => navigate('paper-2-progress')}>See detail <span aria-hidden="true">→</span></button></div>
          {progressSummary()}
        </section>
      </main>
    )
  }

  function renderPaperScreen() {
    if (!adapter) return <main className="dashboard page-screen"><p className="error">Business Paper 2 content is unavailable.</p></main>

    return (
      <main className="dashboard screen-dashboard page-screen paper-screen" aria-labelledby="paper-page-title">
        <div className="breadcrumbs">
          <button onClick={() => navigate('subjects')}>Subjects</button><span>›</span>
          <button onClick={() => navigate('subject-business')}>Business</button><span>›</span>
          <span>{paperLabel}</span>
        </div>
        <header className="page-heading paper-heading">
          <p className="eyebrow">{courseLabel} · specification {specificationCode}</p>
          <h1 id="paper-page-title">{adapter.manifest.paper.name}</h1>
          <p>{adapter.manifest.learnerExperience.what_is_this}</p>
        </header>
        {paperNavigation}

        {route === 'paper-2-overview' && (
          <div className="paper-section-content">
            <section className="paper-recommendation" aria-labelledby="paper-recommendation-title">
              <div><p className="eyebrow">REV · {paperLabel}</p><h2 id="paper-recommendation-title">Your next useful step</h2>
                <p>{recommendation && recommendationTopic ? `${recommendationTopic.shortTitle} · ${activityLabel(recommendation.activity)}. ${recommendation.reason}` : 'Complete a short Practice activity and I’ll use that evidence to guide the next step.'}</p>
                {recommendation && <p className="muted">{recommendation.limitation}</p>}
              </div>
              <button className="primary" onClick={() => navigate('paper-2-practice')}>Go to Practice</button>
            </section>

            <section className="section-choice-grid" aria-label="Paper 2 sections">
              <button className="section-choice" onClick={() => navigate('paper-2-learn')}><span className="section-icon">L</span><strong>Learn</strong><span>Understand topics, revisit notes and connect ideas.</span></button>
              <button className="section-choice" onClick={() => navigate('paper-2-practice')}><span className="section-icon">P</span><strong>Practice</strong><span>Flashcards, quick checks, application and exam questions.</span></button>
              <button className="section-choice" onClick={() => navigate('paper-2-exam-prep')}><span className="section-icon">E</span><strong>Exam Prep</strong><span>Exam technique and the full timed Paper 2 simulator.</span></button>
              <button className="section-choice" onClick={() => navigate('paper-2-progress')}><span className="section-icon">✓</span><strong>Progress</strong><span>Coverage, scored evidence and readiness for this paper.</span></button>
            </section>

            <section className="home-section" aria-labelledby="paper-topics-title">
              <div className="section-heading"><div><p className="eyebrow">Specification areas</p><h2 id="paper-topics-title">Paper 2 topics</h2></div></div>
              <div className="topic-list-grid">
                {topics.map((topic) => {
                  const hasEvidence = evidence.some((item) => item.moduleId === moduleId && item.topicId === topic.id)
                  return <article key={topic.id}><span className={`evidence-dot ${hasEvidence ? 'has-evidence' : ''}`} aria-hidden="true"></span><div><strong>{topic.shortTitle}</strong><p>{hasEvidence ? 'Evidence recorded' : 'No scored evidence yet'}</p></div></article>
                })}
              </div>
            </section>
          </div>
        )}

        {route === 'paper-2-learn' && (
          <div className="paper-section-content">
            <FocusedLearningWorkspace adapter={adapter} section="learn" recommendation={null} saving={savingEvidence} saveError={saveError} onRecordEvidence={saveLearningEvidence} />
            <div className="cross-section-next"><div><strong>Ready to test it?</strong><span>Keep the same Paper 2 context and move into active recall or questions.</span></div><button className="primary" onClick={() => navigate('paper-2-practice')}>Go to Practice</button></div>
          </div>
        )}

        {route === 'paper-2-practice' && (
          <div className="paper-section-content">
            <FocusedLearningWorkspace adapter={adapter} section="practice" recommendation={recommendation} saving={savingEvidence} saveError={saveError} onRecordEvidence={saveLearningEvidence} />
            <div className="cross-section-next"><div><strong>Working towards exam conditions?</strong><span>Move into exam technique and the full timed simulator when that is the useful next step.</span></div><button className="primary" onClick={() => navigate('paper-2-exam-prep')}>Go to Exam Prep</button></div>
          </div>
        )}

        {route === 'paper-2-exam-prep' && (
          <div className="paper-section-content">
            <FocusedLearningWorkspace adapter={adapter} section="exam-prep" recommendation={null} saving={savingEvidence} saveError={saveError} onRecordEvidence={saveLearningEvidence} />
            {primaryExam && <section className="exam-simulator-section" aria-label="Full paper simulator"><ExamSimulator exam={primaryExam} moduleId={moduleId} saving={savingEvidence} saveError={saveError} onRecordEvidence={saveLearningEvidence} /></section>}
          </div>
        )}

        {route === 'paper-2-progress' && (
          <div className="paper-section-content">
            <section className="progress-section-heading"><p className="eyebrow">{paperLabel} progress</p><h2>What the evidence says</h2><p>Coverage, understanding evidence and exam readiness are kept distinct. A missing score means more evidence is needed, not that you are failing.</p></section>
            {progressSummary()}
            {progressDetail()}
            <section className="home-section" aria-labelledby="topic-progress-title">
              <div className="section-heading"><div><p className="eyebrow">Topic evidence</p><h2 id="topic-progress-title">Where you have evidence</h2></div></div>
              <div className="topic-list-grid">
                {topics.map((topic) => {
                  const count = evidence.filter((item) => item.moduleId === moduleId && item.topicId === topic.id).length
                  return <article key={topic.id}><span className={`evidence-dot ${count > 0 ? 'has-evidence' : ''}`} aria-hidden="true"></span><div><strong>{topic.shortTitle}</strong><p>{count === 0 ? 'No scored evidence yet' : `${count} scored ${count === 1 ? 'activity' : 'activities'}`}</p></div></article>
                })}
              </div>
            </section>
          </div>
        )}
      </main>
    )
  }

  function renderGlobalProgress() {
    return (
      <main className="dashboard screen-dashboard page-screen" aria-labelledby="global-progress-title">
        <header className="page-heading"><p className="eyebrow">Across your revision</p><h1 id="global-progress-title">Progress</h1><p>Start with the whole picture, then drill into a subject, paper or topic when you need detail.</p></header>
        <section className="global-progress-card" aria-labelledby="business-progress-title">
          <div className="subject-mark" aria-hidden="true">B</div>
          <div className="global-progress-copy"><p className="eyebrow">Business</p><h2 id="business-progress-title">{paperLabel} evidence</h2><p>{evidencedTopics} of {topicIds.length} topics currently have scored evidence.</p><p className="muted">Readiness: {readiness.score === null ? 'still building enough evidence' : `${readiness.score}% with ${readiness.confidence} confidence`}.</p></div>
          <button className="primary" onClick={() => navigate('paper-2-progress')}>Open Business progress</button>
        </section>
        <section className="home-section" aria-labelledby="global-recent-title"><div className="section-heading"><div><p className="eyebrow">Recent evidence</p><h2 id="global-recent-title">Latest activity</h2></div></div>{activity.length === 0 ? <p className="muted">No scored activity yet.</p> : <ul className="activity-list">{activity.slice(0, 5).map((item) => <li key={item.id}><strong>{item.label}</strong><span>{item.detail}</span><time dateTime={item.occurredAt}>{new Date(item.occurredAt).toLocaleDateString()}</time></li>)}</ul>}</section>
      </main>
    )
  }

  function renderRev() {
    return (
      <main className="dashboard screen-dashboard page-screen rev-page" aria-labelledby="rev-page-title">
        <header className="page-heading"><p className="eyebrow">Your AI guide</p><h1 id="rev-page-title">REV</h1><p>REV keeps the wider revision picture in view, then narrows into the subject, paper or activity you are working on.</p></header>
        <section className={`rev-hero rev-page-hero ${revSuggested ? 'rev-awake' : ''}`} aria-labelledby="rev-conversation-title">
          <div className="rev-copy">
            <div className="rev-pill"><span aria-hidden="true">✦</span> REV</div>
            <h2 id="rev-conversation-title">What do you want help with?</h2>
            <p className={`rev-message ${displayedRevTyping ? 'typing' : ''}`} aria-live="polite">{displayedRevMessage}</p>
            <div className="rev-actions">
              <button className="rev-primary" onClick={suggestNextStep}>What should I revise?</button>
              <button className="rev-secondary" onClick={() => navigate('subjects')}>Show my subjects</button>
              <button className="rev-secondary" onClick={() => navigate('subject-business')}>Open Business</button>
            </div>
          </div>
          <div className="rev-orb-wrap" aria-hidden="true"><div className="rev-orb"><span className="orb-ring ring-one"></span><span className="orb-ring ring-two"></span><span className="orbit-dot"></span><span className="orb-core"></span></div></div>
        </section>
        <p className="quiet-note">The current REV recommendation is deterministic and evidence-aware. The conversational tutor layer can build on the same context model without changing this hierarchy.</p>
      </main>
    )
  }

  let screen = renderHome()
  if (route === 'subjects') screen = renderSubjects()
  else if (route === 'subject-business') screen = renderSubjectHome()
  else if (isPaperRoute(route)) screen = renderPaperScreen()
  else if (route === 'progress') screen = renderGlobalProgress()
  else if (route === 'rev') screen = renderRev()

  return (
    <div className="app-shell">
      <header className="topbar desktop-topbar">
        <button className="brand-button" onClick={() => navigate('home')} aria-label="Revision home">Revision<span aria-hidden="true">✦</span></button>
        <nav className="desktop-nav" aria-label="Primary navigation">{globalNavigation}</nav>
        <button className="account-chip" onClick={() => setMenuOpen(true)} aria-haspopup="dialog" aria-expanded={menuOpen}>
          <span className="account-avatar">{learner.charAt(0).toUpperCase()}</span><span><strong>{learner}</strong><small>Account</small></span><span aria-hidden="true">⌄</span>
        </button>
      </header>

      <header className="mobile-topbar">
        <button className="brand-button" onClick={() => navigate('home')} aria-label="Revision home">Revision<span aria-hidden="true">✦</span></button>
        <button className="burger-button" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}><span></span><span></span><span></span></button>
      </header>

      {screen}

      <nav className="bottom-nav four-item-nav" aria-label="Mobile navigation">
        <button className={route === 'home' ? 'active' : ''} onClick={() => navigate('home')}><span className="nav-icon" aria-hidden="true">⌂</span><span>Home</span></button>
        <button className={subjectsActive ? 'active' : ''} onClick={() => navigate('subjects')}><span className="nav-icon" aria-hidden="true">▤</span><span>Subjects</span></button>
        <button className={route === 'progress' ? 'active' : ''} onClick={() => navigate('progress')}><span className="nav-icon" aria-hidden="true">▥</span><span>Progress</span></button>
        <button className={route === 'rev' ? 'active' : ''} onClick={() => navigate('rev')}><span className="mini-orb" aria-hidden="true"></span><span>REV</span></button>
      </nav>

      {menuOpen && <button className="menu-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)}></button>}
      <aside className={`menu-drawer ${menuOpen ? 'open' : ''}`} aria-label="Account and additional links" aria-hidden={!menuOpen}>
        <div className="drawer-head"><div><p className="eyebrow">Account</p><h2>{learner}</h2><p>{user.email}</p></div><button className="drawer-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">×</button></div>
        <nav className="drawer-links">
          <button onClick={() => navigate('subjects')}>My subjects <span>→</span></button>
          <button onClick={() => navigate('progress')}>My progress <span>→</span></button>
          <button onClick={() => navigate('rev')}>Ask REV <span>→</span></button>
        </nav>
        <button className="signout-button" onClick={signOut}>Sign out</button>
      </aside>
    </div>
  )
}
