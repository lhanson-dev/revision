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
import { PlannerHomeScreen } from './PlannerHomeScreen'
import { PlannerRevScreen } from './PlannerRevScreen'
import { PlanScreen } from './PlanScreen'

const catalogue = buildCatalogue(listAvailableContentAdapters())
const planSubjects = catalogue.map((subject) => ({ id: subject.id, name: subject.name }))

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
  const [isAdmin, setIsAdmin] = useState(false)

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

  const learner = useMemo(() => user ? learnerName(user) : 'there', [user])
  const subjectsActive = routeBelongsToSubjects(route)

  function navigate(nextRoute: AppRoute) {
    setMenuOpen(false)
    window.location.hash = routeHash(nextRoute)
  }

  async function signOut() {
    setMenuOpen(false)
    await supabase.auth.signOut()
  }

  if (!user) return <main className="loading-shell">Loading Revision…</main>

  const navigation = (
    <>
      <button className={route.kind === 'home' ? 'active' : ''} onClick={() => navigate(homeRoute())}>Home</button>
      <button className={route.kind === 'plan' ? 'active' : ''} onClick={() => navigate(planRoute())}>Plan</button>
      <button className={`runtime-rev-link ${route.kind === 'rev' ? 'active' : ''}`} onClick={() => navigate(revRoute())}>REV</button>
      <button className={route.kind === 'progress' ? 'active' : ''} onClick={() => navigate(progressRoute())}>Progress</button>
      <button className={subjectsActive ? 'active' : ''} onClick={() => navigate(subjectsRoute())}>Subjects</button>
    </>
  )

  let screen
  if (route.kind === 'home') {
    screen = <PlannerHomeScreen client={supabase} userId={user.id} learnerName={learner} onOpenPlan={() => navigate(planRoute())} onOpenRev={() => navigate(revRoute())} onOpenProgress={() => navigate(progressRoute())} onOpenSubject={(subjectId) => navigate(subjectRoute(subjectId))} />
  } else if (route.kind === 'plan') {
    screen = <PlanScreen client={supabase} userId={user.id} subjects={planSubjects} onOpenSubject={(subjectId) => navigate(subjectRoute(subjectId))} />
  } else if (route.kind === 'rev') {
    screen = <PlannerRevScreen client={supabase} userId={user.id} onOpenPlan={() => navigate(planRoute())} onOpenSubject={(subjectId) => navigate(subjectRoute(subjectId))} />
  } else {
    screen = <App />
  }

  return (
    <div className="planner-runtime">
      <header className="topbar desktop-topbar runtime-topbar">
        <button className="brand-button" onClick={() => navigate(homeRoute())} aria-label="Revision home">Revision<span aria-hidden="true">✦</span></button>
        <nav className="desktop-nav runtime-desktop-nav" aria-label="Primary navigation">{navigation}</nav>
        <button className="account-chip" onClick={() => setMenuOpen(true)} aria-haspopup="dialog" aria-expanded={menuOpen}>
          <span className="account-avatar">{learner.charAt(0).toUpperCase()}</span>
          <span><strong>{learner}</strong><small>Account</small></span>
          <span aria-hidden="true">⌄</span>
        </button>
      </header>

      <header className="mobile-topbar runtime-mobile-topbar">
        <button className="brand-button" onClick={() => navigate(homeRoute())} aria-label="Revision home">Revision<span aria-hidden="true">✦</span></button>
        <button className="burger-button" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}><span></span><span></span><span></span></button>
      </header>

      <div className="runtime-screen">{screen}</div>

      <nav className="bottom-nav runtime-bottom-nav" aria-label="Mobile navigation">
        <button className={route.kind === 'home' ? 'active' : ''} onClick={() => navigate(homeRoute())}><span className="nav-icon" aria-hidden="true">⌂</span><span>Home</span></button>
        <button className={route.kind === 'plan' ? 'active' : ''} onClick={() => navigate(planRoute())}><span className="nav-icon" aria-hidden="true">▦</span><span>Plan</span></button>
        <button className={`runtime-rev-button ${route.kind === 'rev' ? 'active' : ''}`} onClick={() => navigate(revRoute())} aria-label="Open REV"><span className="mini-orb" aria-hidden="true"></span><span>REV</span></button>
        <button className={route.kind === 'progress' ? 'active' : ''} onClick={() => navigate(progressRoute())}><span className="nav-icon" aria-hidden="true">▥</span><span>Progress</span></button>
        <button className={subjectsActive ? 'active' : ''} onClick={() => navigate(subjectsRoute())}><span className="nav-icon" aria-hidden="true">▤</span><span>Subjects</span></button>
      </nav>

      {menuOpen && <button className="menu-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)}></button>}
      <aside className={`menu-drawer runtime-menu-drawer ${menuOpen ? 'open' : ''}`} aria-label="Account and additional links" aria-hidden={!menuOpen}>
        <div className="drawer-head"><div><p className="eyebrow">Account</p><h2>{learner}</h2><p>{user.email}</p></div><button className="drawer-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">×</button></div>
        <nav className="drawer-links">
          <button onClick={() => navigate(planRoute())}>My plan <span>→</span></button>
          <button onClick={() => navigate(subjectsRoute())}>My subjects <span>→</span></button>
          <button onClick={() => navigate(progressRoute())}>My progress <span>→</span></button>
          <button onClick={() => navigate(revRoute())}>Ask REV <span>→</span></button>
          {isAdmin && <button onClick={() => navigate(adminRoute())}>Admin <span>→</span></button>}
        </nav>
        <button className="signout-button" onClick={signOut}>Sign out</button>
      </aside>
    </div>
  )
}
