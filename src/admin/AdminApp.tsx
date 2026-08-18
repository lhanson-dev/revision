import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../services/supabase/browser-client'

type IntakeResponse = {
  jobId: string
  issueNumber: number
  issueUrl: string
}

async function loadAdminFlag(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data?.is_admin === true
}

function recoveryRedirectUrl() {
  return new URL('./', window.location.href).toString()
}

export function AdminApp() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [recoveryMode, setRecoveryMode] = useState(() => window.location.hash.includes('type=recovery'))
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [officialUrl, setOfficialUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [createdJob, setCreatedJob] = useState<IntakeResponse | null>(null)

  useEffect(() => {
    let active = true

    async function refreshAccess(nextUser: User | null) {
      if (!active) return
      setUser(nextUser)
      setAuthError('')
      setIsAdmin(false)

      if (!nextUser) {
        setLoading(false)
        return
      }

      try {
        const allowed = await loadAdminFlag(nextUser.id)
        if (!active) return
        setIsAdmin(allowed)
      } catch {
        if (!active) return
        setAuthError('Admin access could not be verified. Check the database migration and try again.')
      } finally {
        if (active) setLoading(false)
      }
    }

    supabase.auth.getSession().then(({ data }) => refreshAccess(data.session?.user ?? null))
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setRecoveryMode(true)
      setLoading(true)
      void refreshAccess(session?.user ?? null)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthError('')
    setAuthMessage('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setAuthError(error.message)
      setLoading(false)
    }
  }

  async function requestPasswordReset() {
    setAuthError('')
    setAuthMessage('')

    const resetEmail = email.trim()
    if (!resetEmail) {
      setAuthError('Enter your email address first, then choose Forgot password?')
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: recoveryRedirectUrl(),
    })

    if (error) {
      setAuthError(error.message)
      return
    }

    setAuthMessage('If that account exists, a password reset email has been sent. Open the link in that email to set a new password.')
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthError('')
    setAuthMessage('')

    if (newPassword.length < 8) {
      setAuthError('Use a password with at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setAuthError('The two passwords do not match.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setAuthError(error.message)
      setLoading(false)
      return
    }

    setRecoveryMode(false)
    setNewPassword('')
    setConfirmPassword('')
    window.history.replaceState({}, document.title, window.location.pathname)
    setAuthMessage('Password updated. You are now signed in.')
    setLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setCreatedJob(null)
    setOfficialUrl('')
    setNotes('')
    setRecoveryMode(false)
  }

  async function addCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError('')
    setCreatedJob(null)
    setSubmitting(true)

    try {
      const parsed = new URL(officialUrl)
      if (parsed.protocol !== 'https:') throw new Error('Use an HTTPS awarding-body URL.')

      const { data, error } = await supabase.functions.invoke<IntakeResponse>('content-factory-intake', {
        body: { officialUrl: parsed.toString(), notes: notes.trim() || undefined },
      })

      if (error) throw error
      if (!data?.issueNumber || !data.jobId || !data.issueUrl) throw new Error('The Content Factory did not return a valid job record.')

      setCreatedJob(data)
      setOfficialUrl('')
      setNotes('')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Course intake failed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="admin-shell admin-centred">
        <p className="admin-eyebrow">Revision</p>
        <h1>Content Operations</h1>
        <p>Checking access…</p>
      </main>
    )
  }

  if (recoveryMode && user) {
    return (
      <main className="admin-shell admin-centred">
        <section className="admin-auth-card" aria-labelledby="admin-reset-title">
          <p className="admin-eyebrow">Revision internal</p>
          <h1 id="admin-reset-title">Set a new password</h1>
          <p>Choose a new password for your Revision account.</p>
          <form className="admin-form" onSubmit={updatePassword}>
            <label>
              New password
              <input type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
            </label>
            <label>
              Confirm new password
              <input type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
            </label>
            {authError ? <p className="admin-error" role="alert">{authError}</p> : null}
            <button type="submit">Update password</button>
          </form>
        </section>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="admin-shell admin-centred">
        <section className="admin-auth-card" aria-labelledby="admin-sign-in-title">
          <p className="admin-eyebrow">Revision internal</p>
          <h1 id="admin-sign-in-title">Content Operations</h1>
          <p>Sign in with an account that has been assigned admin access in Revision.</p>
          <form className="admin-form" onSubmit={signIn}>
            <label>
              Email
              <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label>
              Password
              <input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            {authError ? <p className="admin-error" role="alert">{authError}</p> : null}
            {authMessage ? <p className="admin-success" role="status">{authMessage}</p> : null}
            <div className="admin-auth-actions">
              <button type="submit">Sign in</button>
              <button type="button" className="admin-text-button" onClick={requestPasswordReset}>Forgot password?</button>
            </div>
          </form>
        </section>
      </main>
    )
  }

  if (!isAdmin) {
    return (
      <main className="admin-shell admin-centred">
        <section className="admin-auth-card">
          <p className="admin-eyebrow">Revision internal</p>
          <h1>Admin access required</h1>
          <p>This signed-in account has not been assigned admin access in the Revision database.</p>
          {authError ? <p className="admin-error" role="alert">{authError}</p> : null}
          <button type="button" className="admin-secondary" onClick={signOut}>Sign out</button>
        </section>
      </main>
    )
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div>
          <p className="admin-eyebrow">Revision</p>
          <strong>Content Operations</strong>
        </div>
        <nav aria-label="Admin navigation">
          <a href="#add-course" aria-current="page">Add course</a>
        </nav>
        <button type="button" className="admin-link-button" onClick={signOut}>Sign out</button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">Content</p>
            <h1>Add course</h1>
            <p>Start a governed Content Factory job from one official awarding-body course or specification URL.</p>
          </div>
          <span className="admin-user">{user.email}</span>
        </header>

        {authMessage ? <p className="admin-success admin-panel-message" role="status">{authMessage}</p> : null}

        <section id="add-course" className="admin-panel" aria-labelledby="add-course-title">
          <h2 id="add-course-title">Official course source</h2>
          <p>Revision will resolve the course identity, official source set and specification coverage before learner content is generated.</p>

          <form className="admin-form" onSubmit={addCourse}>
            <label>
              Official awarding-body URL
              <input
                type="url"
                inputMode="url"
                placeholder="https://www.aqa.org.uk/..."
                required
                value={officialUrl}
                onChange={(event) => setOfficialUrl(event.target.value)}
              />
              <span className="admin-help">Use the official course or specification page, not a third-party revision site.</span>
            </label>

            <label>
              Optional instruction
              <textarea
                rows={4}
                maxLength={2000}
                placeholder="For example: include the complete course and all compulsory papers."
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </label>

            {submitError ? <p className="admin-error" role="alert">{submitError}</p> : null}
            {createdJob ? (
              <div className="admin-success" role="status">
                <strong>Course job created.</strong>
                <span>Job {createdJob.jobId} · GitHub issue #{createdJob.issueNumber}</span>
                <a href={createdJob.issueUrl} target="_blank" rel="noreferrer">Open job record</a>
              </div>
            ) : null}

            <button type="submit" disabled={submitting}>{submitting ? 'Creating course job…' : 'Add course'}</button>
          </form>
        </section>
      </main>
    </div>
  )
}
