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
      <ModalShell
        className="runtime-account-modal"
        label="Account settings"
        onDismiss={onClose}
        initialFocusSelector=".runtime-account-modal-close"
        returnFocusSelector=".runtime-sidebar-user, .runtime-mobile-menu-button"
      >
        <aside className="runtime-account-modal-nav">
          <div className="runtime-account-modal-identity">
            <span className="runtime-account-modal-avatar" aria-hidden="true">{learnerName.charAt(0).toUpperCase()}</span>
            <span>{learnerName}</span>
          </div>
          <nav className="ui-menu" aria-label="Account sections">
            <button className={`ui-menu-item ${section === 'profile' ? 'active' : ''}`} onClick={() => onSectionChange('profile')} aria-current={section === 'profile' ? 'page' : undefined}>
              <Icon name="user" className="runtime-account-modal-icon" />
              <span>Profile</span>
            </button>
            <button className={`ui-menu-item ${section === 'settings' ? 'active' : ''}`} onClick={() => onSectionChange('settings')} aria-current={section === 'settings' ? 'page' : undefined}>
              <Icon name="settings" className="runtime-account-modal-icon" />
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
