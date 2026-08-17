import { useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { getContentAdapter } from '../engine/content/content-registry'
import { assessPaperReadiness } from '../engine/readiness/readiness'
import type { LearningEvidence } from '../engine/evidence/evidence'
import { createSupabaseEvidenceStore, loadLearningEvidence } from '../services/progress/learning-evidence-service'
import { currentAppUrl, supabase } from '../services/supabase/browser-client'
import { recentActivity } from './progress-view'

const moduleId = 'business-aqa-as-paper-2'

export function App() {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [evidence, setEvidence] = useState<LearningEvidence[]>([])
  const [evidenceError, setEvidenceError] = useState('')

  const adapter = getContentAdapter(moduleId)
  const topicIds = useMemo(() => adapter?.listTopics().map((topic) => topic.id) ?? [], [adapter])
  const readiness = useMemo(() => assessPaperReadiness(moduleId, topicIds, evidence), [topicIds, evidence])
  const activity = useMemo(() => recentActivity(evidence), [evidence])

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user) {
      setEvidence([])
      return
    }
    const store = createSupabaseEvidenceStore(supabase)
    loadLearningEvidence(store, user.id, moduleId)
      .then((items) => {
        setEvidence(items)
        setEvidenceError('')
      })
      .catch((error: unknown) => setEvidenceError(error instanceof Error ? error.message : 'Could not load progress.'))
  }, [user])

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
    await supabase.auth.signOut()
  }

  if (loading) return <main className="loading-shell">Loading Revision…</main>

  if (!user) {
    return (
      <main className="auth-shell">
        <section className="auth-card" aria-labelledby="sign-in-heading">
          <p className="eyebrow">Revision</p>
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
      <header className="topbar">
        <strong>Revision</strong>
        <div className="account"><span>{user.email}</span><button onClick={signOut}>Sign out</button></div>
      </header>
      <main className="dashboard">
        <p className="eyebrow">My Revision</p>
        <h1>Revision Hub</h1>
        <p className="intro">See what you have been working on and how your evidence is building towards exam readiness.</p>

        <section className="course-card">
          <div><span className="tag">Available now</span><h2>Business · AQA AS · Paper 2</h2><p>{adapter?.catalogueEntry.topicCount ?? 0} topics · {adapter?.catalogueEntry.totalMarks ?? 0} marks</p></div>
          <a className="primary-link" href="../subjects/business/aqa-as/paper-2/">Continue revising</a>
        </section>

        <div className="progress-grid">
          <section aria-labelledby="recent-activity">
            <p className="eyebrow">What have I done?</p>
            <h2 id="recent-activity">Recent activity</h2>
            {evidenceError && <p className="error">{evidenceError}</p>}
            {!evidenceError && activity.length === 0 && <p className="muted">No new structured activity has been recorded yet. Your existing Revision progress is still preserved.</p>}
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
                <p className="muted"><strong>{readiness.evidenceCount}</strong> scored activities are currently available to the new readiness model.</p>
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
      </main>
    </div>
  )
}
