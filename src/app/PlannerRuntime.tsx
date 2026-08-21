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

type NavIconName = 'home' | 'plan' | 'progress' | 'subjects'
type ThemeName = 'light' | 'dark'

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
    return (
      <svg {...commonProps}>
        <path d="M3.5 10.5 12 3.5l8.5 7v9a1.5 1.5 0 0 1-1.5 1.5h-5v-6h-4v6H5a1.5 1.5 0 0 1-1.5-1.5z" />
      </svg>
    )
  }

  if (name === 'plan') {
    return (
      <svg {...commonProps}>
        <rect x="3" y="5" width="18" height="16" rx="2.5" />
        <path d="M8 3v4M16 3v4M3 10h18M8 15l2 2 4-4" />
      </svg>
    )
  }

  if (name === 'progress') {
    return (
      <svg {...commonProps}>
        <path d="M4 19V5M4 19h17M7 15l4-4 3 2 5-6" />
        <path d="M16 7h3v3" />
      </svg>
    )
  }

  return (
    <svg {...commonProps}>
      <path d="M4 5.5c3.3 0 5.8.7 8 2v12c-2.2-1.3-4.7-2-8-2zM20 5.5c-3.3 0-5.8.7-8 2v12c2.2-1.3 4.7-2 8-2z" />
    </svg>
  )
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

function subjectLabel(subjectId: string) {
  return catalogue.find((subject) => subject.id === subjectId)?.name ?? 'this subject'
}

function routeContextLabel(route: AppRoute) {
  switch (route.kind) {
    case 'home': return 'Home'
    case 'plan': return 'your Plan'
    case 'progress': return 'Progress'
    case 'subjects': return 'Subjects'
    case 'subject': return subjectLabel(route.subjectId)
    case 'course': return `${subjectLabel(route.subjectId)} · ${route.section.replace('-', ' ')}`
    case 'module': return `${subjectLabel(route.subjectId)} · ${route.section.replace('-', ' ')}`
    case 'rev': return 'REV'
    case 'admin': return 'Admin'
  }
}

function routeContextSubjectId(route: AppRoute) {
  if (route.kind === 'subject' || route.kind === 'course' || route.kind === 'module') return route.subjectId
  return undefined
}

export function PlannerRuntime() {
  const [user, setUser] = useState<User | null>(null)
  const [route, setRoute] = useState<AppRoute>(() => parseRoute(window.location.hash))
  const [menuOpen, setMenuOpen] = useState(false)
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
      setRevPanelOpen(false)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (!revPanelOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setRevPanelOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [revPanelOpen])

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

  const learner = useMemo(() => user ? learnerName(user) : 'there', [user])
  const subjectsActive = routeBelongsToSubjects(route)
  const plannerAdminActive = route.kind === 'admin' && window.location.hash.startsWith('#/admin/planner')
  const revContextLabel = routeContextLabel(route)
  const revContextSubjectId = routeContextSubjectId(route)

  function navigate(nextRoute: AppRoute) {
    setMenuOpen(false)
    setRevPanelOpen(false)
    window.location.hash = routeHash(nextRoute)
  }

  function openPlannerAdmin() {
    setMenuOpen(false)
    setRevPanelOpen(false)
    window.location.hash = '#/admin/planner'
  }

  function toggleTheme() {
    setTheme((current) => current === 'light' ? 'dark' : 'light')
  }

  async function signOut() {
    setMenuOpen(false)
    setRevPanelOpen(false)
    await supabase.auth.signOut()
  }

  if (!user) return <main className="loading-shell">Loading Revision…</main>

  const desktopNavigation = (
    <>
      <button className={route.kind === 'home' ? 'active' : ''} onClick={() => navigate(homeRoute())}>Home</button>
      <button className={route.kind === 'plan' ? 'active' : ''} onClick={() => navigate(planRoute())}>Plan</button>
      <button className={route.kind === 'progress' ? 'active' : ''} onClick={() => navigate(progressRoute())}>Progress</button>
      <button className={subjectsActive ? 'active' : ''} onClick={() => navigate(subjectsRoute())}>Subjects</button>
    </>
  )

  let screen
  if (route.kind === 'home') {
    screen = <PlannerHomeScreen client={supabase} userId={user.id} learnerName={learner} onOpenPlan={() => navigate(planRoute())} onOpenRev={() => navigate(revRoute())} onOpenProgress={() => navigate(progressRoute())} onOpenSubjects={() => navigate(subjectsRoute())} onOpenSubject={(subjectId) => navigate(subjectRoute(subjectId))} />
  } else if (route.kind === 'plan') {
    screen = <PlanScreen client={supabase} userId={user.id} subjects={planSubjects} onOpenSubject={(subjectId) => navigate(subjectRoute(subjectId))} />
  } else if (route.kind === 'rev') {
    screen = <PlannerRevScreen client={supabase} userId={user.id} onOpenPlan={() => navigate(planRoute())} onOpenSubject={(subjectId) => navigate(subjectRoute(subjectId))} />
  } else if (plannerAdminActive && isAdmin) {
    screen = <PlannerAdminScreen onBack={() => navigate(adminRoute())} />
  } else {
    screen = <App />
  }

  return (
    <div className="planner-runtime" data-theme={theme}>
      {route.kind !== 'admin' && <PlannerActivityReconciler client={supabase} userId={user.id} routeKey={routeHash(route)} />}
      <header className="topbar desktop-topbar runtime-topbar">
        <button className="brand-button" onClick={() => navigate(homeRoute())} aria-label="REV home"><RevWordmark /></button>
        <nav className="desktop-nav runtime-desktop-nav" aria-label="Primary navigation">{desktopNavigation}</nav>
        <div className="runtime-utilities">
          <button className="theme-toggle desktop-theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>{theme === 'light' ? 'Dark mode' : 'Light mode'}</button>
          <button className="account-chip" onClick={() => setMenuOpen(true)} aria-haspopup="dialog" aria-expanded={menuOpen}>
            <span className="account-avatar">{learner.charAt(0).toUpperCase()}</span>
            <span><strong>{learner}</strong><small>Account</small></span>
            <span aria-hidden="true">⌄</span>
          </button>
        </div>
      </header>

      <header className="mobile-topbar runtime-mobile-topbar">
        <button className="brand-button" onClick={() => navigate(homeRoute())} aria-label="REV home"><RevWordmark /></button>
        <button className="burger-button" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}><span></span><span></span><span></span></button>
      </header>

      <div className="runtime-screen">{screen}</div>

      <nav className="bottom-nav runtime-bottom-nav" aria-label="Mobile navigation">
        <button className={route.kind === 'home' ? 'active' : ''} onClick={() => navigate(homeRoute())}><NavIcon name="home" /><span>Home</span></button>
        <button className={route.kind === 'plan' ? 'active' : ''} onClick={() => navigate(planRoute())}><NavIcon name="plan" /><span>Plan</span></button>
        <button className={`runtime-rev-button ${route.kind === 'rev' ? 'active' : ''}`} onClick={() => navigate(revRoute())} aria-label="Open REV"><RevPresence size="nav" state="resting" decorative /><span>REV</span></button>
        <button className={route.kind === 'progress' ? 'active' : ''} onClick={() => navigate(progressRoute())}><NavIcon name="progress" /><span>Progress</span></button>
        <button className={subjectsActive ? 'active' : ''} onClick={() => navigate(subjectsRoute())}><NavIcon name="subjects" /><span>Subjects</span></button>
      </nav>

      {route.kind !== 'admin' && route.kind !== 'rev' && (
        <button className="runtime-rev-fab" onClick={() => setRevPanelOpen(true)} aria-haspopup="dialog" aria-expanded={revPanelOpen} aria-controls="runtime-rev-panel">
          <RevPresence size="nav" state="resting" decorative />
          <span><strong>Ask REV</strong><small>About this screen</small></span>
        </button>
      )}

      {revPanelOpen && route.kind !== 'admin' && route.kind !== 'rev' && (
        <aside id="runtime-rev-panel" className="runtime-rev-panel" role="dialog" aria-modal="false" aria-label={`Ask REV about ${revContextLabel}`}>
          <div className="runtime-rev-panel-head">
            <div><p className="eyebrow">Ask REV</p><strong>{revContextLabel}</strong></div>
            <button className="drawer-close" onClick={() => setRevPanelOpen(false)} aria-label="Close REV chat">×</button>
          </div>
          <PlannerRevScreen
            client={supabase}
            userId={user.id}
            onOpenPlan={() => navigate(planRoute())}
            onOpenSubject={(subjectId) => navigate(subjectRoute(subjectId))}
            embedded
            contextLabel={revContextLabel}
            contextSubjectId={revContextSubjectId}
          />
        </aside>
      )}

      {menuOpen && (
        <>
          <button className="menu-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)}></button>
          <aside className="menu-drawer runtime-menu-drawer open" aria-label="Account and additional links">
            <div className="drawer-head"><div><p className="eyebrow">Account</p><h2>{learner}</h2><p>{user.email}</p></div><button className="drawer-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">×</button></div>
            <nav className="drawer-links">
              <button onClick={() => navigate(planRoute())}>My plan <span>→</span></button>
              <button onClick={() => navigate(subjectsRoute())}>My subjects <span>→</span></button>
              <button onClick={() => navigate(progressRoute())}>My progress <span>→</span></button>
              <button onClick={() => navigate(revRoute())}>Ask REV <span>→</span></button>
              {isAdmin && <button onClick={() => navigate(adminRoute())}>Admin <span>→</span></button>}
              {isAdmin && <button onClick={openPlannerAdmin}>Planner assurance <span>→</span></button>}
            </nav>
            <button className="theme-toggle drawer-theme-toggle" onClick={toggleTheme}>{theme === 'light' ? 'Use dark mode' : 'Use light mode'}</button>
            <button className="signout-button" onClick={signOut}>Sign out</button>
          </aside>
        </>
      )}
    </div>
  )
}
