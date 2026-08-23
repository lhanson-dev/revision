import { useState, type FormEvent } from 'react'
import { Icon, IconButton, ModalShell, OverlayBackdrop } from './ui'

type AccountSection = 'profile' | 'settings'
type ThemeName = 'light' | 'dark'

type AccountModalProps = {
  learnerName: string
  email: string | undefined
  section: AccountSection
  theme: ThemeName
  onSectionChange: (section: AccountSection) => void
  onThemeChange: (theme: ThemeName) => void
  onNameChange: (firstName: string) => Promise<string | null>
  onClose: () => void
}

function AccountSectionIcon({ name }: { name: AccountSection }) {
  const commonProps = {
    className: 'runtime-account-modal-icon',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  if (name === 'profile') {
    return <svg {...commonProps}><circle cx="12" cy="8" r="3.5" /><path d="M5 21c.7-4.3 3.1-6.5 7-6.5s6.3 2.2 7 6.5" /></svg>
  }

  return <svg {...commonProps}><circle cx="12" cy="12" r="3.2" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1z" /></svg>
}

export function AccountModal({
  learnerName,
  email,
  section,
  theme,
  onSectionChange,
  onThemeChange,
  onNameChange,
  onClose,
}: AccountModalProps) {
  const [nameDraft, setNameDraft] = useState(learnerName)
  const [nameSaveState, setNameSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [nameError, setNameError] = useState('')

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextName = nameDraft.trim().replace(/\s+/g, ' ')
    if (!nextName) {
      setNameSaveState('error')
      setNameError('Enter the name you want Revision to use.')
      return
    }
    if (nextName.length > 60) {
      setNameSaveState('error')
      setNameError('Keep your first name to 60 characters or fewer.')
      return
    }
    if (nextName === learnerName) {
      setNameSaveState('idle')
      setNameError('')
      return
    }

    setNameSaveState('saving')
    setNameError('')
    const error = await onNameChange(nextName)
    if (error) {
      setNameSaveState('error')
      setNameError(error)
      return
    }

    setNameDraft(nextName)
    setNameSaveState('saved')
  }

  return (
    <>
      <OverlayBackdrop className="runtime-account-modal-backdrop" label="Close account window" onClick={onClose} />
      <ModalShell className="runtime-account-modal" label="Account settings" onDismiss={onClose} initialFocusSelector=".runtime-account-modal-close">
        <aside className="runtime-account-modal-nav">
          <div className="runtime-account-modal-identity">
            <span className="runtime-account-modal-avatar" aria-hidden="true">{learnerName.charAt(0).toUpperCase()}</span>
            <span>{learnerName}</span>
          </div>
          <nav className="ui-menu" aria-label="Account sections">
            <button className={`ui-menu-item ${section === 'profile' ? 'active' : ''}`} onClick={() => onSectionChange('profile')} aria-current={section === 'profile' ? 'page' : undefined}>
              <AccountSectionIcon name="profile" />
              <span>Profile</span>
            </button>
            <button className={`ui-menu-item ${section === 'settings' ? 'active' : ''}`} onClick={() => onSectionChange('settings')} aria-current={section === 'settings' ? 'page' : undefined}>
              <AccountSectionIcon name="settings" />
              <span>Settings</span>
            </button>
          </nav>
        </aside>

        <div className="runtime-account-modal-content">
          <header className="runtime-account-modal-header">
            <div>
              <p className="eyebrow">Account</p>
              <h2>{section === 'profile' ? 'Profile' : 'Settings'}</h2>
            </div>
            <IconButton className="runtime-account-modal-close" label="Close account window" onClick={onClose}><Icon name="close" size="compact" /></IconButton>
          </header>

          {section === 'profile' ? (
            <div className="runtime-account-modal-section">
              <div className="runtime-account-profile-hero ui-surface-quiet">
                <span className="runtime-account-profile-avatar" aria-hidden="true">{learnerName.charAt(0).toUpperCase()}</span>
                <div><h3>{learnerName}</h3><p>{email}</p></div>
              </div>
              <form className="runtime-profile-edit-form" onSubmit={saveName} aria-label="Profile details">
                <div className="runtime-profile-edit-row">
                  <label htmlFor="revision-profile-first-name">
                    <span>First name</span>
                    <small>Used in your Revision greeting and account menu.</small>
                  </label>
                  <div className="runtime-profile-edit-control">
                    <input
                      className="ui-field"
                      id="revision-profile-first-name"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      maxLength={60}
                      value={nameDraft}
                      onChange={(event) => {
                        setNameDraft(event.target.value)
                        setNameSaveState('idle')
                        setNameError('')
                      }}
                    />
                    <button className="ui-button ui-button--primary ui-button--compact" type="submit" disabled={nameSaveState === 'saving' || nameDraft.trim().replace(/\s+/g, ' ') === learnerName}>
                      {nameSaveState === 'saving' ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
                <div className="runtime-profile-readonly-row">
                  <div><span>Email</span><small>Your sign-in email is managed by your account identity.</small></div>
                  <strong>{email}</strong>
                </div>
                {nameSaveState === 'saved' && <p className="runtime-profile-save-message" role="status">Name updated.</p>}
                {nameSaveState === 'error' && <p className="runtime-profile-save-error" role="alert">{nameError}</p>}
              </form>
            </div>
          ) : (
            <div className="runtime-account-modal-section">
              <section className="runtime-account-setting-row">
                <div><h3>Appearance</h3><p>Choose how Revision looks on this device.</p></div>
                <div className="runtime-theme-choice ui-segmented-control" role="group" aria-label="Appearance">
                  <button className={`ui-button ui-button--tertiary ui-button--compact ${theme === 'light' ? 'active' : ''}`} aria-pressed={theme === 'light'} onClick={() => onThemeChange('light')}>Light</button>
                  <button className={`ui-button ui-button--tertiary ui-button--compact ${theme === 'dark' ? 'active' : ''}`} aria-pressed={theme === 'dark'} onClick={() => onThemeChange('dark')}>Dark</button>
                </div>
              </section>
            </div>
          )}
        </div>
      </ModalShell>
    </>
  )
}
