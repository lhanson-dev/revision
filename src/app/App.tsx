import { useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { getContentAdapter } from '../engine/content/content-registry'
import { assessPaperReadiness, recommendNextActivity } from '../engine/readiness/readiness'
import type { LearningEvidence } from '../engine/evidence/evidence'
import { createSupabaseEvidenceStore, loadLearningEvidence, recordLearningEvidence } from '../services/progress/learning-evidence-service'
import { currentAppUrl, supabase } from '../services/supabase/browser-client'
import { ExamSimulator } from './ExamSimulator'
import { LearningWorkspace } from './LearningWorkspace'
import { recentActivity } from './progress-view'

const moduleId = 'business-aqa-as-paper-2'
const defaultRevMessage = 'I can guide you to the most useful thing to work on next, or you can choose where to start.'

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
    ? `I’d start with ${recommendationTopic.shortTitle} using ${activityLabel(recommendation.activity)}. ${recommendation.reason}`
    : 'I need a little more evidence before I can make a useful recommendation. Start with a short activity and I’ll use what you show me.'

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
    if (!user) return
    const text = revSuggested ? recommendationMessage : defaultRevMessage
    if (prefersReducedMotion()) {
      setRevMessage(text)
      setRevTyping(false)
      return
    }

    setRevMessage('')
    setRevTyping(true)
    let index = 0
    const timer = window.setInterval(() => {
      index = Math.min(text.length, index + 2)
      setRevMessage(text.slice(0, index))
      if (index >= text.length) {
        window.clearInterval(timer)
        setRevTyping(false)
      }
    }, 18)

    return () => window.clearInterval(timer)
  }, [user, revSuggested, recommendationMessage])

  useEffect(() => {
    if (!menuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [menuOpen])

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

  function scrollToSection(id: string) {
    const element = document.getElementById(id)
    if (!element) return
    element.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
  }

  function suggestNextStep() {
    setRevSuggested(true)
  }

  function chooseMyself() {
    setRevSuggested(false)
    scrollToSection('practice')
  }

  function goToRecommendation() {
    scrollToSection('practice')
    window.setTimeout(() => {
      document.querySelector<HTMLButtonElement>('.recommendation-card .primary')?.focus({ preventScroll: true })
    }, prefersReducedMotion() ? 0 : 450)
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

  return (
    <div className="app-shell">
      <header className="topbar desktop-topbar">
        <button className="brand-button" onClick={() => scrollToSection('home')} aria-label="Revision home">
          Revision<span aria-hidden="true">✦</span>
        </button>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <button className="active" onClick={() => scrollToSection('home')}>Home</button>
          <button onClick={() => scrollToSection('subjects')}>Subjects</button>
          <button onClick={() => scrollToSection('practice')}>Practice</button>
          <button onClick={() => scrollToSection('exam-prep')}>Exam Prep</button>
          <button onClick={() => scrollToSection('progress')}>Progress</button>
          <button onClick={() => scrollToSection('home')}>REV</button>
        </nav>
        <button className="account-chip" onClick={() => setMenuOpen(true)} aria-haspopup="dialog" aria-expanded={menuOpen}>
          <span className="account-avatar">{learner.charAt(0).toUpperCase()}</span>
          <span><strong>{learner}</strong><small>Account</small></span>
          <span aria-hidden="true">⌄</span>
        </button>
      </header>

      <header className="mobile-topbar">
        <button className="brand-button" onClick={() => scrollToSection('home')} aria-label="Revision home">
          Revision<span aria-hidden="true">✦</span>
        </button>
        <button className="burger-button" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}>
          <span></span><span></span><span></span>
        </button>
      </header>

      <main className="dashboard" id="home">
        <div className="hero-layout">
          <section className={`rev-hero ${revSuggested ? 'rev-awake' : ''}`} aria-labelledby="rev-welcome">
            <div className="rev-copy">
              <div className="rev-pill"><span aria-hidden="true">✦</span> REV AI GUIDE</div>
              <h1 id="rev-welcome">Hi, {learner} 👋</h1>
              <h2 className="rev-question">What shall we do today?</h2>
              <p className={`rev-message ${revTyping ? 'typing' : ''}`} aria-live="polite">{revMessage}</p>

              {!revSuggested ? (
                <div className="rev-actions">
                  <button className="rev-primary" onClick={suggestNextStep}>Suggest my next step <span aria-hidden="true">→</span></button>
                  <button className="rev-secondary" onClick={chooseMyself}>I want to choose</button>
                </div>
              ) : (
                <div className="rev-suggestion">
                  {recommendation && recommendationTopic && (
                    <>
                      <p><strong>{recommendationTopic.shortTitle} · {activityLabel(recommendation.activity)}</strong></p>
                      <p className="rev-evidence">{recommendation.evidenceSummary}</p>
                      <p className="rev-limitation">{recommendation.limitation}</p>
                    </>
                  )}
                  <div className="rev-actions">
                    <button className="rev-primary" onClick={goToRecommendation}>Take me there <span aria-hidden="true">→</span></button>
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
              <div><dt>Current course</dt><dd>Business · AQA AS · Paper 2</dd></div>
              <div><dt>REV recommends</dt><dd>{recommendationTopic?.shortTitle ?? 'Build your baseline'}</dd></div>
              <div><dt>Next activity</dt><dd>{recommendation ? activityLabel(recommendation.activity) : 'Quick check'}</dd></div>
            </dl>
            <p className="today-note">{recommendation?.limitation ?? readiness.progress.message}</p>
            <button className="text-link" onClick={() => scrollToSection('practice')}>Open Business Paper 2 <span aria-hidden="true">→</span></button>
          </aside>
        </div>

        <section className="home-section" id="subjects" aria-labelledby="subjects-title">
          <div className="section-heading">
            <div><p className="eyebrow">Your subjects</p><h2 id="subjects-title">Keep everything in one place</h2></div>
          </div>
          <article className="subject-card">
            <div className="subject-mark" aria-hidden="true">B</div>
            <div className="subject-copy">
              <span className="tag">Available now</span>
              <h3>Business · AQA AS · Paper 2</h3>
              <p>{adapter?.catalogueEntry.topicCount ?? 0} topics · {adapter?.catalogueEntry.totalMarks ?? 0} marks</p>
            </div>
            <button className="secondary" onClick={() => scrollToSection('practice')}>Continue</button>
          </article>
        </section>

        <section className="home-section" aria-labelledby="progress-overview-title">
          <div className="section-heading">
            <div><p className="eyebrow">Your progress</p><h2 id="progress-overview-title">What the evidence says</h2></div>
            <button className="text-link" onClick={() => scrollToSection('progress')}>See detail <span aria-hidden="true">→</span></button>
          </div>
          <div className="progress-overview">
            <article><small>Evidence coverage</small><strong>{evidencedTopics} / {topicIds.length}</strong><p>Topics with at least one recorded learning result.</p></article>
            <article><small>Scored activities</small><strong>{readiness.evidenceCount}</strong><p>Evidence used by the current paper-readiness model.</p></article>
            <article><small>Paper readiness</small><strong>{readiness.score === null ? 'Building' : `${readiness.score}%`}</strong><p>{readiness.score === null ? 'More varied evidence is needed before showing a score.' : `${readiness.confidence} confidence based on the evidence available.`}</p></article>
          </div>
        </section>

        <section className="feature-section" id="practice" aria-label="Practice">
          {adapter && <LearningWorkspace adapter={adapter} recommendation={recommendation} saving={savingEvidence} saveError={saveError} onRecordEvidence={saveLearningEvidence} />}
        </section>

        <section className="feature-section" id="exam-prep" aria-label="Exam preparation">
          {primaryExam && <ExamSimulator exam={primaryExam} moduleId={moduleId} saving={savingEvidence} saveError={saveError} onRecordEvidence={saveLearningEvidence} />}
        </section>

        <section className="progress-grid" id="progress" aria-label="Progress detail">
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
        </section>
      </main>

      <nav className="bottom-nav" aria-label="Mobile navigation">
        <button className="active" onClick={() => scrollToSection('home')}><span className="nav-icon" aria-hidden="true">⌂</span><span>Home</span></button>
        <button onClick={() => scrollToSection('subjects')}><span className="nav-icon" aria-hidden="true">▤</span><span>Subjects</span></button>
        <button onClick={() => scrollToSection('practice')}><span className="nav-icon" aria-hidden="true">✓</span><span>Practice</span></button>
        <button onClick={() => scrollToSection('progress')}><span className="nav-icon" aria-hidden="true">▥</span><span>Progress</span></button>
        <button onClick={() => scrollToSection('home')}><span className="mini-orb" aria-hidden="true"></span><span>REV</span></button>
      </nav>

      {menuOpen && <button className="menu-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)}></button>}
      <aside className={`menu-drawer ${menuOpen ? 'open' : ''}`} aria-label="Account and additional links" aria-hidden={!menuOpen}>
        <div className="drawer-head">
          <div><p className="eyebrow">Account</p><h2>{learner}</h2><p>{user.email}</p></div>
          <button className="drawer-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">×</button>
        </div>
        <nav className="drawer-links">
          <button onClick={() => { setMenuOpen(false); scrollToSection('subjects') }}>My subjects <span>→</span></button>
          <button onClick={() => { setMenuOpen(false); scrollToSection('exam-prep') }}>Exam Prep <span>→</span></button>
          <button onClick={() => { setMenuOpen(false); scrollToSection('home') }}>Ask REV <span>→</span></button>
        </nav>
        <button className="signout-button" onClick={signOut}>Sign out</button>
      </aside>
    </div>
  )
}
