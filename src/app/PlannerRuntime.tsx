import { useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import { supabase } from '../services/supabase/browser-client'
import { App } from './App'
import { buildCatalogue } from './catalogue-model'
import {
  adminRoute,
  homeRoute,
  parseRoute,
  planRoute,
  progressRoute,
  revRoute,
  routeBelongsToSubjects,
  routeHash,
  subjectRoute,
  subjectsRoute,
  type AppRoute,
} from './navigation'
import { PlannerActivityReconciler } from './PlannerActivityReconciler'
import { PlannerAdminScreen } from './PlannerAdminScreen'
import { PlannerHomeScreen } from './PlannerHomeScreen'
import { PlannerRevScreen } from './PlannerRevScreen'
import { PlanScreen } from './PlanScreen'
import { RevPresence } from './RevPresence'

const catalogue = buildCatalogue(listAvailableContentAdapters())
const planSubjects = catalogue.map((subject) => ({ id: subject.id, name: subject.name }))
const themeStorageKey = 'revision:theme'

type NavIconName = 'home' | 'plan' | 'progress' | 'subjects' | 'profile' | 'settings' | 'upgrade' | 'logout'
type ThemeName = 'light' | 'dark'
type AccountPanel = 'profile' | 'settings' | 'menu'

function NavIcon({ name }: { name: NavIconName }) {
  const commonProps = {
    className: 'nav-icon',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
  }

  if (name === 'home') {
    return <svg {...commonProps}><path d="M3.5 10.5 12 3.5l8.5 7v9a1.5 1.5 0 0 1-1.5 1.5h-5v-6h-4v6H5a1.5 1.5 0 0 1-1.5-1.5z" /></svg>
  }
  if (name === 'plan') {
    return <svg {...commonProps}><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M8 3v4M16 3v4M3 10h18M8 15l2 2 4-4" /></svg>
  }
  if (name === 'progress') {
    return <svg {...commonProps}><path d="M4 19V5M4 19h17M7 15l4-4 3 2 5-6" /><path d="M16 7h3v3" /></svg>
  }
  if (name === 'subjects') {
    return <svg {...commonProps}><path d="M4 5.5c3.3 0 5.8.7 8 2v12c-2.2-1.3-4.7-2-8-2zM20 5.5c-3.3 0-5.8.7-8 2v12c2.2-1.3 4.7-2 8-2z" /></svg>
  }
  if (name === 'profile') {
    return <svg {...commonProps}><circle cx="12" cy="8" r="3.5" /><path d="M5 21c.7-4.3 3.1-6.5 7-6.5s6.3 2.2 7 6.5" /></svg>
  }
  if (name === 'settings') {
    return <svg {...commonProps}><circle cx="12" cy="12" r="3.2" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1z" /></svg>
  }
  if (name === 'upgrade') {
    return <svg {...commonProps}><path d="M5 19 19 5M10 5h9v9" /><path d="M5 8v11h11" /></svg>
  }
  return <svg {...commonProps}><path d="M10 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H10" /><path d="M14 8l4 4-4 4M18 12H9" /></svg>
}

function RevWordmark() {
  return (
    <span className="rev-wordmark" aria-hidden="true">
      <span>R</span>
      <span className="rev-wordmark-e"><i></i><i></i><i></i></span>
      <span>V</span>
    </span>
  )
}

function initialTheme(): ThemeName {
  const saved = window.localStorage.getItem(themeStorageKey)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

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

export function PlannerRuntime() {
  const [user, setUser] = useState<User | null>(null)
  const [route, setRoute] = useState<AppRoute>(() => parseRoute(window.location.hash))
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [accountPanel, setAccountPanel] = useState<AccountPanel>('menu')
  const [revPanelOpen, setRevPanelOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [theme, setTheme] = useState<ThemeName>(() => initialTheme())

  useEffect(() => {
    let active = true
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setUser(data.session?.user ?? null)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null)
    })
    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseRoute(window.location.hash))
      setMenuOpen(false)
      setAccountMenuOpen(false)
      setRevPanelOpen(false)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    let active = true
    if (!user) return () => { active = false }
    void supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (active) setIsAdmin(!error && data?.is_admin === true)
      })
    return () => { active = false }
  }, [user])

  useEffect(() => {
    window.localStorage.setItem(themeStorageKey, theme)
    document.documentElement.dataset.revisionTheme = theme
  }, [theme])

  useEffect(() => {
    if (!accountMenuOpen) return

    const closeOnPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest('.runtime-sidebar-account')) return
      setAccountMenuOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAccountMenuOpen(false)
    }

    document.addEventListener('pointerdown', closeOnPointerDown)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnPointerDown)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [accountMenuOpen])

  const learner = useMemo(() => user ? learnerName(user) : 'there', [user])
  const subjectsActive = routeBelongsToSubjects(route)
  const plannerAdminActive = route.kind === 'admin' && window.location.hash.startsWith('#/admin/planner')

  function navigate(nextRoute: AppRoute) {
    setMenuOpen(false)
    setAccountMenuOpen(false)
    setRevPanelOpen(false)
    window.location.hash = routeHash(nextRoute)
  }

  function openRev(draft?: string) {
    if (draft?.trim()) window.sessionStorage.setItem('revision:rev-draft', draft.trim())
    setMenuOpen(false)
    setAccountMenuOpen(false)
    setRevPanelOpen(true)
  }

  function expandRev() {
    setRevPanelOpen(false)
    window.location.hash = routeHash(revRoute())
  }

  function openAccount(nextPanel: AccountPanel) {
    setAccountMenuOpen(false)
    setAccountPanel(nextPanel)
    setMenuOpen(true)
  }

  function openPlannerAdmin() {
    setMenuOpen(false)
    setAccountMenuOpen(false)
    window.location.hash = '#/admin/planner'
  }

  function toggleTheme() {
    setTheme((current) => current === 'light' ? 'dark' : 'light')
  }

  async function signOut() {
    setMenuOpen(false)
    setAccountMenuOpen(false)
    await supabase.auth.signOut()
  }

  if (!user) return <main className="loading-shell">Loading Revision…</main>

  let screen
  if (route.kind === 'home') {
    screen = <PlannerHomeScreen client={supabase} userId={user.id} learnerName={learner} onOpenPlan={() => navigate(planRoute())} onOpenRev={() => openRev()} onOpenProgress={() => navigate(progressRoute())} onOpenSubject={(subjectId) => navigate(subjectRoute(subjectId))} />
  } else if (route.kind === 'plan') {
    screen = <PlanScreen client={supabase} userId={user.id} subjects={planSubjects} onOpenSubject={(subjectId) => navigate(subjectRoute(subjectId))} />
  } else if (route.kind === 'rev') {
    screen = <PlannerRevScreen client={supabase} userId={user.id} onOpenPlan={() => navigate(planRoute())} onOpenSubject={(subjectId) => navigate(subjectRoute(subjectId))} />
  } else if (plannerAdminActive && isAdmin) {
    screen = <PlannerAdminScreen onBack={() => navigate(adminRoute())} />
  } else {
    screen = <App />
  }

  const accountHeading = accountPanel === 'profile' ? 'Profile' : accountPanel === 'settings' ? 'Settings' : 'Account'

  return (
    <div className="planner-runtime" data-theme={theme}>
      {route.kind !== 'admin' && <PlannerActivityReconciler client={supabase} userId={user.id} routeKey={routeHash(route)} />}

      <aside className="runtime-sidebar" aria-label="Learner navigation">
        <button className="runtime-sidebar-brand" onClick={() => navigate(homeRoute())} aria-label="REV home"><RevWordmark /></button>
        <button className="runtime-ask-rev" onClick={() => openRev()} aria-haspopup="dialog"><span aria-hidden="true">✦</span>Ask REV</button>
        <nav className="runtime-sidebar-nav" aria-label="Primary navigation">
          <button className={route.kind === 'home' ? 'active' : ''} onClick={() => navigate(homeRoute())}><NavIcon name="home" /><span>Home</span></button>
          <button className={route.kind === 'plan' ? 'active' : ''} onClick={() => navigate(planRoute())}><NavIcon name="plan" /><span>Plan</span></button>
          <button className={route.kind === 'progress' ? 'active' : ''} onClick={() => navigate(progressRoute())}><NavIcon name="progress" /><span>Progress</span></button>
          <button className={subjectsActive ? 'active' : ''} onClick={() => navigate(subjectsRoute())}><NavIcon name="subjects" /><span>Subjects</span></button>
        </nav>
        <div className="runtime-sidebar-account">
          {accountMenuOpen && (
            <div className="runtime-account-popover" role="menu" aria-label="Profile menu">
              <button role="menuitem" onClick={() => openAccount('profile')}><NavIcon name="profile" /><span>Profile</span></button>
              <button role="menuitem" onClick={() => openAccount('settings')}><NavIcon name="settings" /><span>Settings</span></button>
              <div className="runtime-account-menu-disabled" role="menuitem" aria-disabled="true">
                <NavIcon name="upgrade" />
                <span className="runtime-account-menu-copy"><span>Upgrade plan</span><small>Coming soon</small></span>
              </div>
              <div className="runtime-account-menu-separator" role="separator"></div>
              <button className="runtime-account-logout" role="menuitem" onClick={signOut}><NavIcon name="logout" /><span>Log out</span></button>
            </div>
          )}
          <button
            className="runtime-sidebar-user"
            onClick={() => setAccountMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={accountMenuOpen}
            aria-label={`${learner} account menu`}
          >
            <span className="account-avatar">{learner.charAt(0).toUpperCase()}</span>
            <span className="runtime-sidebar-user-name">{learner}</span>
          </button>
        </div>
      </aside>

      <header className="mobile-topbar runtime-mobile-topbar">
        <button className="brand-button" onClick={() => navigate(homeRoute())} aria-label="REV home"><RevWordmark /></button>
        <button className="burger-button" onClick={() => openAccount('menu')} aria-label="Open menu" aria-expanded={menuOpen}><span></span><span></span><span></span></button>
      </header>

      <div className="runtime-screen">{screen}</div>

      <nav className="bottom-nav runtime-bottom-nav" aria-label="Mobile navigation">
        <button className={route.kind === 'home' ? 'active' : ''} onClick={() => navigate(homeRoute())}><NavIcon name="home" /><span>Home</span></button>
        <button className={route.kind === 'plan' ? 'active' : ''} onClick={() => navigate(planRoute())}><NavIcon name="plan" /><span>Plan</span></button>
        <button className="runtime-rev-button" onClick={() => openRev()} aria-label="Ask REV" aria-haspopup="dialog"><RevPresence size="nav" state="resting" decorative /><span>REV</span></button>
        <button className={route.kind === 'progress' ? 'active' : ''} onClick={() => navigate(progressRoute())}><NavIcon name="progress" /><span>Progress</span></button>
        <button className={subjectsActive ? 'active' : ''} onClick={() => navigate(subjectsRoute())}><NavIcon name="subjects" /><span>Subjects</span></button>
      </nav>

      {revPanelOpen && (
        <>
          <button className="runtime-rev-backdrop" aria-label="Close Ask REV" onClick={() => setRevPanelOpen(false)}></button>
          <aside className="runtime-rev-panel" role="dialog" aria-modal="true" aria-label="Ask REV">
            <header className="runtime-rev-panel-head">
              <div><p className="eyebrow">Your revision guide</p><h2>Ask REV</h2></div>
              <div className="runtime-rev-panel-actions"><button onClick={expandRev}>Expand</button><button onClick={() => setRevPanelOpen(false)} aria-label="Close Ask REV">×</button></div>
            </header>
            <div className="runtime-rev-panel-body"><PlannerRevScreen client={supabase} userId={user.id} onOpenPlan={() => navigate(planRoute())} onOpenSubject={(subjectId) => navigate(subjectRoute(subjectId))} /></div>
          </aside>
        </>
      )}

      {menuOpen && (
        <>
          <button className="menu-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)}></button>
          <aside className="menu-drawer runtime-menu-drawer open" aria-label="Account and additional links">
            <div className="drawer-head"><div><p className="eyebrow">{accountHeading}</p><h2>{learner}</h2><p>{user.email}</p></div><button className="drawer-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">×</button></div>
            {accountPanel === 'menu' && (
              <nav className="drawer-links">
                <button onClick={() => navigate(planRoute())}>My plan <span>→</span></button>
                <button onClick={() => navigate(subjectsRoute())}>My subjects <span>→</span></button>
                <button onClick={() => navigate(progressRoute())}>My progress <span>→</span></button>
                <button onClick={() => openRev()}>Ask REV <span>→</span></button>
                {isAdmin && <button onClick={() => navigate(adminRoute())}>Admin <span>→</span></button>}
                {isAdmin && <button onClick={openPlannerAdmin}>Planner assurance <span>→</span></button>}
              </nav>
            )}
            {accountPanel === 'profile' && (
              <div className="runtime-account-details" aria-label="Profile details">
                <div><span>Name</span><strong>{learner}</strong></div>
                <div><span>Email</span><strong>{user.email}</strong></div>
              </div>
            )}
            {accountPanel === 'settings' && (
              <div className="runtime-account-settings">
                <p>Appearance</p>
                <button className="theme-toggle drawer-theme-toggle" onClick={toggleTheme}>{theme === 'light' ? 'Use dark mode' : 'Use light mode'}</button>
              </div>
            )}
            {accountPanel !== 'settings' && <button className="theme-toggle drawer-theme-toggle" onClick={toggleTheme}>{theme === 'light' ? 'Use dark mode' : 'Use light mode'}</button>}
            <button className="signout-button" onClick={signOut}>Sign out</button>
          </aside>
        </>
      )}
    </div>
  )
}
