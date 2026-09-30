import { useEffect, useState, type ReactNode } from 'react'
import { loadAuthCapabilities } from '../services/auth/auth-capabilities'
import { currentAppUrl, supabase } from '../services/supabase/browser-client'
import { BrandAsset, Status, type StatusTone } from './ui'

type AuthMode = 'sign-in' | 'create-account'
type ThemeName = 'light' | 'dark'
type BusyAction = 'sign-in' | 'create-account' | 'google' | 'reset' | 'update-password'
type AuthField = 'firstName' | 'email' | 'password' | 'newPassword' | 'confirmPassword'
type AuthFieldErrors = Partial<Record<AuthField, string>>
type AuthFeedback = { tone: StatusTone; message: string } | null

type AuthGateProps = {
  children: ReactNode
}

const themeStorageKey = 'revision:theme'

function currentTheme(): ThemeName {
  const saved = window.localStorage.getItem(themeStorageKey)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function friendlyAuthError(action: BusyAction, rawMessage: string) {
  const message = rawMessage.toLocaleLowerCase()

  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'There have been too many attempts. Try again later.'
  }
  if (action === 'sign-in' && message.includes('email not confirmed')) {
    return 'Confirm your email address using the link we sent, then try signing in again.'
  }
  if (action === 'sign-in' && (message.includes('invalid login') || message.includes('invalid credentials'))) {
    return 'Email or password is incorrect. Check both and try again.'
  }
  if (action === 'create-account' && (message.includes('already registered') || message.includes('already exists'))) {
    return 'An account may already exist for this email address. Try signing in or use Forgot password.'
  }

  if (action === 'sign-in') return 'Revision could not sign you in. Try again.'
  if (action === 'create-account') return 'Revision could not create your account. Try again.'
  if (action === 'google') return 'Revision could not open Google sign-in. Try again.'
  if (action === 'reset') return 'Revision could not send the password reset email. Try again.'
  return 'Revision could not update your password. Try again.'
}

function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null
  return <span id={id} className="auth-field-error">{children}</span>
}

export function AuthGate({ children }: AuthGateProps) {
  const [authReady, setAuthReady] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [feedback, setFeedback] = useState<AuthFeedback>(null)
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({})
  const [busyAction, setBusyAction] = useState<BusyAction | null>(null)
  const [googleEnabled, setGoogleEnabled] = useState(false)
  const [recoveryMode, setRecoveryMode] = useState(() => window.location.hash.includes('type=recovery'))
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [authTheme, setAuthTheme] = useState<ThemeName>(() => currentTheme())
  const busy = busyAction !== null

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

  function clearFieldError(field: AuthField) {
    setFieldErrors((current) => current[field] ? { ...current, [field]: undefined } : current)
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode)
    setFeedback(null)
    setFieldErrors({})
    setPassword('')
  }

  async function signIn() {
    const errors: AuthFieldErrors = {}
    if (!email.trim()) errors.email = 'Enter your email address.'
    if (!password) errors.password = 'Enter your password.'
    setFieldErrors(errors)
    setFeedback(null)
    if (Object.keys(errors).length > 0) return

    setBusyAction('sign-in')
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) setFeedback({ tone: 'error', message: friendlyAuthError('sign-in', error.message) })
    setBusyAction(null)
  }

  async function createAccount() {
    const cleanFirstName = firstName.trim()
    const errors: AuthFieldErrors = {}
    if (!cleanFirstName) errors.firstName = 'Enter your first name.'
    if (!email.trim()) errors.email = 'Enter your email address.'
    if (password.length < 8) errors.password = 'Use a password of at least 8 characters.'
    setFieldErrors(errors)
    setFeedback(null)
    if (Object.keys(errors).length > 0) return

    setBusyAction('create-account')
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { first_name: cleanFirstName },
        emailRedirectTo: currentAppUrl(),
      },
    })

    if (error) setFeedback({ tone: 'error', message: friendlyAuthError('create-account', error.message) })
    else setFeedback({
      tone: 'success',
      message: data.session ? 'Account created.' : 'Account created. Check your email to confirm your address, then return here to sign in.',
    })
    setBusyAction(null)
  }

  async function continueWithGoogle() {
    setFeedback(null)
    setBusyAction('google')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: currentAppUrl() },
    })

    if (error) {
      setFeedback({ tone: 'error', message: friendlyAuthError('google', error.message) })
      setBusyAction(null)
    }
  }

  async function requestPasswordReset() {
    const resetEmail = email.trim()
    if (!resetEmail) {
      setFieldErrors((current) => ({ ...current, email: 'Enter your email address before requesting a password reset.' }))
      setFeedback(null)
      return
    }

    setFieldErrors((current) => ({ ...current, email: undefined }))
    setFeedback(null)
    setBusyAction('reset')
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: currentAppUrl(),
    })
    setFeedback(error
      ? { tone: 'error', message: friendlyAuthError('reset', error.message) }
      : { tone: 'info', message: 'If that account exists, a password reset email has been sent. Open the link in that email to choose a new password.' })
    setBusyAction(null)
  }

  async function updatePassword() {
    const errors: AuthFieldErrors = {}
    if (newPassword.length < 8) errors.newPassword = 'Use a new password of at least 8 characters.'
    if (!confirmPassword) errors.confirmPassword = 'Enter the new password again.'
    else if (newPassword !== confirmPassword) errors.confirmPassword = 'The two passwords do not match.'
    setFieldErrors(errors)
    setFeedback(null)
    if (Object.keys(errors).length > 0) return

    setBusyAction('update-password')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setFeedback({ tone: 'error', message: friendlyAuthError('update-password', error.message) })
      setBusyAction(null)
      return
    }

    setRecoveryMode(false)
    setNewPassword('')
    setConfirmPassword('')
    setPassword('')
    setFieldErrors({})
    setFeedback({ tone: 'success', message: 'Password updated. You can continue using Revision.' })
    setBusyAction(null)
  }

  if (!authReady) return <main className="loading-shell" data-theme={authTheme}>Loading Revision…</main>

  if (recoveryMode && hasSession) {
    return (
      <main className="auth-shell" data-theme={authTheme}>
        <BrandAsset asset="wordmark" className="auth-brand" alt="Revision" />
        <section className="auth-card" aria-labelledby="reset-password-heading">
          <p className="eyebrow">Account recovery</p>
          <h1 id="reset-password-heading">Set a new password</h1>
          <p className="intro">Choose a new password for your Revision account.</p>
          <div className="auth-email-form">
            <label>New password<input type="password" autoComplete="new-password" minLength={8} value={newPassword} aria-invalid={Boolean(fieldErrors.newPassword)} aria-describedby={fieldErrors.newPassword ? 'new-password-error' : undefined} onChange={(event) => { setNewPassword(event.target.value); clearFieldError('newPassword') }} /><FieldError id="new-password-error">{fieldErrors.newPassword}</FieldError></label>
            <label>Confirm new password<input type="password" autoComplete="new-password" minLength={8} value={confirmPassword} aria-invalid={Boolean(fieldErrors.confirmPassword)} aria-describedby={fieldErrors.confirmPassword ? 'confirm-password-error' : undefined} onChange={(event) => { setConfirmPassword(event.target.value); clearFieldError('confirmPassword') }} /><FieldError id="confirm-password-error">{fieldErrors.confirmPassword}</FieldError></label>
            <button className="primary auth-wide-action" disabled={busy} onClick={updatePassword}>{busyAction === 'update-password' ? 'Updating password…' : 'Update password'}</button>
          </div>
          {feedback && <Status className="message" tone={feedback.tone} aria-live="polite">{feedback.message}</Status>}
        </section>
      </main>
    )
  }

  if (hasSession) return children

  const creatingAccount = mode === 'create-account'

  return (
    <main className="auth-shell" data-theme={authTheme}>
      <BrandAsset asset="wordmark" className="auth-brand" alt="Revision" />
      <section className="auth-card auth-entry-card" aria-labelledby="auth-heading">
        <p className="eyebrow">Your revision, your next step</p>
        <h1 id="auth-heading">{creatingAccount ? 'Create your account' : 'Sign in'}</h1>
        <p className="intro">{creatingAccount ? 'Create an account so Revision can remember your subjects and progress.' : 'Welcome back. Sign in to continue your revision.'}</p>

        {googleEnabled && (
          <button className="auth-provider-button" type="button" disabled={busy} onClick={continueWithGoogle}>
            <span className="google-mark" aria-hidden="true">G</span>
            {busyAction === 'google' ? 'Opening Google…' : 'Continue with Google'}
          </button>
        )}

        {googleEnabled && <div className="auth-divider" aria-hidden="true"><span>or</span></div>}

        <div className="auth-email-form">
          {creatingAccount && <label>First name<input type="text" autoComplete="given-name" maxLength={40} value={firstName} aria-invalid={Boolean(fieldErrors.firstName)} aria-describedby={fieldErrors.firstName ? 'first-name-error' : undefined} onChange={(event) => { setFirstName(event.target.value); clearFieldError('firstName') }} /><FieldError id="first-name-error">{fieldErrors.firstName}</FieldError></label>}
          <label>Email<input type="email" autoComplete="email" value={email} aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'email-error' : undefined} onChange={(event) => { setEmail(event.target.value); clearFieldError('email') }} /><FieldError id="email-error">{fieldErrors.email}</FieldError></label>
          <label>Password<input type="password" autoComplete={creatingAccount ? 'new-password' : 'current-password'} minLength={creatingAccount ? 8 : undefined} value={password} aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? 'password-error' : undefined} onChange={(event) => { setPassword(event.target.value); clearFieldError('password') }} /><FieldError id="password-error">{fieldErrors.password}</FieldError></label>

          {creatingAccount ? (
            <button className="primary auth-wide-action" disabled={busy} onClick={createAccount}>{busyAction === 'create-account' ? 'Creating account…' : 'Create account'}</button>
          ) : (
            <>
              <button className="primary auth-wide-action" disabled={busy} onClick={signIn}>{busyAction === 'sign-in' ? 'Signing in…' : 'Sign in'}</button>
              <button className="auth-recovery-link" type="button" disabled={busy} onClick={requestPasswordReset}>{busyAction === 'reset' ? 'Sending reset…' : 'Forgot password?'}</button>
            </>
          )}
        </div>

        <div className="auth-switch">
          <span>{creatingAccount ? 'Already have an account?' : 'New to Revision?'}</span>
          <button type="button" disabled={busy} onClick={() => switchMode(creatingAccount ? 'sign-in' : 'create-account')}>
            {creatingAccount ? 'Sign in' : 'Create account'}
          </button>
        </div>

        {feedback && <Status className="message" tone={feedback.tone} aria-live="polite">{feedback.message}</Status>}
      </section>
    </main>
  )
}
