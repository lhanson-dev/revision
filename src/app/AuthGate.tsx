import { useEffect, useState, type ReactNode } from 'react'
import { loadAuthCapabilities } from '../services/auth/auth-capabilities'
import { currentAppUrl, supabase } from '../services/supabase/browser-client'

type AuthMode = 'sign-in' | 'create-account'
type ThemeName = 'light' | 'dark'

type AuthGateProps = {
  children: ReactNode
}

const themeStorageKey = 'revision:theme'

function currentTheme(): ThemeName {
  const saved = window.localStorage.getItem(themeStorageKey)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function AuthGate({ children }: AuthGateProps) {
  const [authReady, setAuthReady] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [googleEnabled, setGoogleEnabled] = useState(false)
  const [recoveryMode, setRecoveryMode] = useState(() => window.location.hash.includes('type=recovery'))
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [authTheme, setAuthTheme] = useState<ThemeName>(() => currentTheme())

  useEffect(() => {
    let active = true

    void loadAuthCapabilities().then((capabilities) => {
      if (active) setGoogleEnabled(capabilities.google)
    })

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setHasSession(Boolean(data.session))
      setAuthReady(true)
      if (!data.session) setAuthTheme(currentTheme())
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return
      if (event === 'PASSWORD_RECOVERY') setRecoveryMode(true)
      setHasSession(Boolean(session))
      setAuthReady(true)
      if (!session) setAuthTheme(currentTheme())
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode)
    setMessage('')
    setPassword('')
  }

  async function signIn() {
    if (!email.trim() || !password) {
      setMessage('Enter your email address and password.')
      return
    }

    setBusy(true)
    setMessage('Signing in…')
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setMessage(error ? error.message : '')
    setBusy(false)
  }

  async function createAccount() {
    const cleanFirstName = firstName.trim()
    if (!cleanFirstName) {
      setMessage('Enter your first name.')
      return
    }
    if (!email.trim()) {
      setMessage('Enter your email address.')
      return
    }
    if (password.length < 8) {
      setMessage('Use a password of at least 8 characters.')
      return
    }

    setBusy(true)
    setMessage('Creating account…')
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { first_name: cleanFirstName },
        emailRedirectTo: currentAppUrl(),
      },
    })

    if (error) setMessage(error.message)
    else setMessage(data.session ? 'Account created.' : 'Account created. Check your email to confirm your address, then return here to sign in.')
    setBusy(false)
  }

  async function continueWithGoogle() {
    setBusy(true)
    setMessage('Opening Google…')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: currentAppUrl() },
    })

    if (error) {
      setMessage(error.message)
      setBusy(false)
    }
  }

  async function requestPasswordReset() {
    const resetEmail = email.trim()
    if (!resetEmail) {
      setMessage('Enter your email address first, then choose Forgot password?')
      return
    }

    setBusy(true)
    setMessage('Sending password reset…')
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: currentAppUrl(),
    })
    setMessage(error ? error.message : 'If that account exists, a password reset email has been sent. Open the link in that email to choose a new password.')
    setBusy(false)
  }

  async function updatePassword() {
    if (newPassword.length < 8) {
      setMessage('Use a new password of at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage('The two passwords do not match.')
      return
    }

    setBusy(true)
    setMessage('Updating password…')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setMessage(error.message)
      setBusy(false)
      return
    }

    setRecoveryMode(false)
    setNewPassword('')
    setConfirmPassword('')
    setPassword('')
    setMessage('Password updated.')
    setBusy(false)
  }

  if (!authReady) return <main className="loading-shell" data-theme={authTheme}>Loading Revision…</main>

  if (recoveryMode && hasSession) {
    return (
      <main className="auth-shell" data-theme={authTheme}>
        <div className="auth-brand" aria-label="Revision">Revision<span aria-hidden="true">✦</span></div>
        <section className="auth-card" aria-labelledby="reset-password-heading">
          <p className="eyebrow">Account recovery</p>
          <h1 id="reset-password-heading">Set a new password</h1>
          <p className="intro">Choose a new password for your Revision account.</p>
          <div className="auth-email-form">
            <label>New password<input type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>
            <label>Confirm new password<input type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>
            <button className="primary auth-wide-action" disabled={busy} onClick={updatePassword}>Update password</button>
          </div>
          <p className="message" aria-live="polite">{message}</p>
        </section>
      </main>
    )
  }

  if (hasSession) return children

  const creatingAccount = mode === 'create-account'

  return (
    <main className="auth-shell" data-theme={authTheme}>
      <div className="auth-brand" aria-label="Revision">Revision<span aria-hidden="true">✦</span></div>
      <section className="auth-card auth-entry-card" aria-labelledby="auth-heading">
        <p className="eyebrow">Your revision, your next step</p>
        <h1 id="auth-heading">{creatingAccount ? 'Create your account' : 'Sign in'}</h1>
        <p className="intro">{creatingAccount ? 'Create an account so Revision can remember your subjects and progress.' : 'Welcome back. Sign in to continue your revision.'}</p>

        {googleEnabled && (
          <button className="auth-provider-button" type="button" disabled={busy} onClick={continueWithGoogle}>
            <span className="google-mark" aria-hidden="true">G</span>
            Continue with Google
          </button>
        )}

        {googleEnabled && <div className="auth-divider" aria-hidden="true"><span>or</span></div>}

        <div className="auth-email-form">
          {creatingAccount && <label>First name<input type="text" autoComplete="given-name" maxLength={40} value={firstName} onChange={(event) => setFirstName(event.target.value)} /></label>}
          <label>Email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Password<input type="password" autoComplete={creatingAccount ? 'new-password' : 'current-password'} minLength={creatingAccount ? 8 : undefined} value={password} onChange={(event) => setPassword(event.target.value)} /></label>

          {creatingAccount ? (
            <button className="primary auth-wide-action" disabled={busy} onClick={createAccount}>Create account</button>
          ) : (
            <>
              <button className="primary auth-wide-action" disabled={busy} onClick={signIn}>Sign in</button>
              <button className="auth-recovery-link" type="button" disabled={busy} onClick={requestPasswordReset}>Forgot password?</button>
            </>
          )}
        </div>

        <div className="auth-switch">
          <span>{creatingAccount ? 'Already have an account?' : 'New to Revision?'}</span>
          <button type="button" disabled={busy} onClick={() => switchMode(creatingAccount ? 'sign-in' : 'create-account')}>
            {creatingAccount ? 'Sign in' : 'Create account'}
          </button>
        </div>

        <p className="message" aria-live="polite">{message}</p>
      </section>
    </main>
  )
}
