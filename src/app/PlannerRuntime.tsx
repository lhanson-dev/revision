import { useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import {
  loadLearnerCourses,
  recordLearnerCourseEventBestEffort,
  type LearnerCourseMembership,
} from '../services/courses/learner-course-service'
import { supabase } from '../services/supabase/browser-client'
import { AccountModal } from './AccountModal'
import { buildCatalogue } from './catalogue-model'
import { ContentOperations } from './ContentOperations'
import { ContextualLearnerNavigation } from './ContextualLearnerNavigation'
import { CourseExperienceScreen } from './CourseExperienceScreen'
import { CoursesScreen } from './CoursesScreen'
import { findCourseForModule, projectLearnerProgramme } from './learner-programme'
import {
  adminRoute,
  coursesRoute,
  homeRoute,
  learnerCourseRoute,
  learnerModuleRoute,
  parseRoute,
  planRoute,
  progressRoute,
  revRoute,
  routeBelongsToCourses,
  routeHash,
  type AppRoute,
  type CourseSection,
  type PaperSection,
} from './navigation'
import { PlannerActivityReconciler } from './PlannerActivityReconciler'
import { PlannerAdminScreen } from './PlannerAdminScreen'
import { PlannerHomeScreen } from './PlannerHomeScreen'
import { PlannerRevScreen } from './PlannerRevScreen'
import { PlanScreen } from './PlanScreen'
import { ProgrammeProgressScreen } from './ProgrammeProgressScreen'
import { RevPresence } from './RevPresence'
import { Status } from './ui'

const catalogue = buildCatalogue(listAvailableContentAdapters())
const themeStorageKey = 'revision:theme'

type NavIconName = 'home' | 'plan' | 'progress' | 'courses' | 'profile' | 'settings' | 'admin' | 'upgrade' | 'logout'
type ThemeName = 'light' | 'dark'
type AccountSection = 'profile' | 'settings'

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

  if (name === 'home') return <svg {...commonProps}><path d="M3.5 10.5 12 3.5l8.5 7v9a1.5 1.5 0 0 1-1.5 1.5h-5v-6h-4v6H5a1.5 1.5 0 0 1-1.5-1.5z" /></svg>
  if (name === 'plan') return <svg {...commonProps}><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M8 3v4M16 3v4M3 10h18M8 15l2 2 4-4" /></svg>
  if (name === 'progress') return <svg {...commonProps}><path d="M4 19V5M4 19h17M7 15l4-4 3 2 5-6" /><path d="M16 7h3v3" /></svg>
  if (name === 'courses') return <svg {...commonProps}><path d="M4 5.5c3.3 0 5.8.7 8 2v12c-2.2-1.3-4.7-2-8-2zM20 5.5c-3.3 0-5.8.7-8 2v12c2.2-1.3 4.7-2 8-2z" /></svg>
  if (name === 'profile') return <svg {...commonProps}><circle cx="12" cy="8" r="3.5" /><path d="M5 21c.7-4.3 3.1-6.5 7-6.5s6.3 2.2 7 6.5" /></svg>
  if (name === 'settings') return <svg {...commonProps}><circle cx="12" cy="12" r="3.2" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1z" /></svg>
  if (name === 'admin') return <svg {...commonProps}><path d="M12 3.5 19 6v5.2c0 4.5-2.7 7.7-7 9.3-4.3-1.6-7-4.8-7-9.3V6z" /><path d="M9.5 12.2 11 13.7l3.7-3.7" /></svg>
  if (name === 'upgrade') return <svg {...commonProps}><path d="M5 19 19 5M10 5h9v9" /><path d="M5 8v11h11" /></svg>
  return <svg {...commonProps}><path d="M10 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H10" /><path d="M14 8l4 4-4 4M18 12H9" /></svg>
}

function RevWordmark() {
  return <span className="rev-wordmark" aria-hidden="true"><span>R</span><span className="rev-wordmark-e"><i></i><i></i><i></i></span><span>V</span></span>
}

function initialTheme(): ThemeName {
  const saved = window.localStorage.getItem(themeStorageKey)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function titleCaseFirstCharacter(value: string) {
  const trimmed = value.trim().replace(/\s+/g, ' ')
  return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : ''
}

function learnerName(user: User) {
  const metadata = user.user_metadata ?? {}
  const explicitFirstName = metadata.first_name ?? metadata.given_name
  if (typeof explicitFirstName === 'string' && explicitFirstName.trim()) return titleCaseFirstCharacter(explicitFirstName)
  if (typeof metadata.name === 'string' && metadata.name.trim()) return titleCaseFirstCharacter(metadata.name.trim().split(/\s+/)[0])
  const local = (user.email ?? '').split('@')[0].replace(/[._-]+/g, ' ').trim()
  if (/^[a-zA-Z ]+$/.test(local) && local.length > 1) return titleCaseFirstCharacter(local.split(/\s+/)[0])
  return 'there'
}

function canonicalRoute(route: AppRoute) {
  if (route.kind === 'subjects' || route.kind === 'subject') return coursesRoute()
  if (route.kind === 'course') return learnerCourseRoute(route.courseId, route.section)
  if (route.kind === 'module') {
    const resolved = route.courseId
      ? { course: { id: route.courseId } }
      : findCourseForModule(catalogue, route.moduleId)
    return resolved ? learnerModuleRoute(resolved.course.id, route.moduleId, route.section) : coursesRoute()
  }
  return route
}

export function PlannerRuntime() {
  const [user, setUser] = useState<User | null>(null)
  const [route, setRoute] = useState<AppRoute>(() => canonicalRoute(parseRoute(window.location.hash)))
  const [memberships, setMemberships] = useState<LearnerCourseMembership[]>([])
  const [programmeResolved, setProgrammeResolved] = useState(false)
  const [programmeError, setProgrammeError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const [accountSection, setAccountSection] = useState<AccountSection>('profile')
  const [revPanelOpen, setRevPanelOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminAccessResolved, setAdminAccessResolved] = useState(false)
  const [theme, setTheme] = useState<ThemeName>(() => initialTheme())

  const programmeProjection = useMemo(() => projectLearnerProgramme(catalogue, memberships), [memberships])
  const programme = programmeProjection.courses

  useEffect(() => {
    let active = true
    void supabase.auth.getSession().then(({ data }) => { if (active) setUser(data.session?.user ?? null) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setUser(session?.user ?? null)
        setIsAdmin(false)
        setAdminAccessResolved(false)
        setMemberships([])
        setProgrammeResolved(false)
        setProgrammeError('')
      }
    })
    return () => { active = false; listener.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    const syncRoute = () => {
      const parsed = parseRoute(window.location.hash)
      const canonical = canonicalRoute(parsed)
      const canonicalHash = routeHash(canonical)
      if (window.location.hash !== canonicalHash) {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${canonicalHash}`)
      }
      setRoute(canonical)
      setMenuOpen(false)
      setMobileAccountOpen(false)
      setAccountMenuOpen(false)
      setAccountModalOpen(false)
      setRevPanelOpen(false)
    }
    syncRoute()
    window.addEventListener('hashchange', syncRoute)
    return () => window.removeEventListener('hashchange', syncRoute)
  }, [])

  useEffect(() => {
    let active = true
    if (!user) return () => { active = false }
    void loadLearnerCourses(supabase, user.id)
      .then((items) => {
        if (!active) return
        setMemberships(items)
        setProgrammeError('')
      })
      .catch((error: unknown) => {
        if (!active) return
        setMemberships([])
        setProgrammeError(error instanceof Error ? error.message : 'Could not load your courses.')
      })
      .finally(() => { if (active) setProgrammeResolved(true) })
    return () => { active = false }
  }, [user])

  useEffect(() => {
    let active = true
    if (!user) return () => { active = false }
    void supabase.from('profiles').select('is_admin').eq('user_id', user.id).single().then(({ data, error }) => {
      if (active) {
        setIsAdmin(!error && data?.is_admin === true)
        setAdminAccessResolved(true)
      }
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
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setAccountMenuOpen(false) }
    document.addEventListener('pointerdown', closeOnPointerDown)
    document.addEventListener('keydown', closeOnEscape)
    return () => { document.removeEventListener('pointerdown', closeOnPointerDown); document.removeEventListener('keydown', closeOnEscape) }
  }, [accountMenuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenuOpen(false); setMobileAccountOpen(false) } }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeOnEscape)
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', closeOnEscape) }
  }, [menuOpen])

  const learner = useMemo(() => user ? learnerName(user) : 'there', [user])
  const coursesActive = routeBelongsToCourses(route)
  const plannerAdminActive = route.kind === 'admin' && window.location.hash.startsWith('#/admin/planner')

  function navigate(nextRoute: AppRoute) {
    setMenuOpen(false)
    setMobileAccountOpen(false)
    setAccountMenuOpen(false)
    setAccountModalOpen(false)
    setRevPanelOpen(false)
    const canonical = canonicalRoute(nextRoute)
    const hash = routeHash(canonical)
    if (window.location.hash === hash) setRoute(canonical)
    else window.location.hash = hash
  }

  function openCourse(courseId: string, source: 'global_navigation' | 'courses_index' | 'recommendation' = 'global_navigation') {
    if (user) {
      const eventType = source === 'courses_index' ? 'course_opened_from_courses_index' : 'course_opened_from_global_navigation'
      void recordLearnerCourseEventBestEffort(supabase, user.id, eventType, courseId, { source })
    }
    navigate(learnerCourseRoute(courseId))
  }

  function openRev(draft?: string) {
    if (draft?.trim()) window.sessionStorage.setItem('revision:rev-draft', draft.trim())
    setMenuOpen(false)
    setMobileAccountOpen(false)
    setAccountMenuOpen(false)
    setAccountModalOpen(false)
    setRevPanelOpen(true)
  }

  function expandRev() {
    setRevPanelOpen(false)
    window.location.hash = routeHash(revRoute())
  }

  function openAccountModal(section: AccountSection) {
    setMenuOpen(false)
    setMobileAccountOpen(false)
    setAccountMenuOpen(false)
    setAccountSection(section)
    setAccountModalOpen(true)
  }

  function openMobileMenu() {
    setMobileAccountOpen(false)
    setAccountMenuOpen(false)
    setAccountModalOpen(false)
    setMenuOpen(true)
  }

  function closeMobileMenu() { setMenuOpen(false); setMobileAccountOpen(false) }

  async function updateLearnerFirstName(firstName: string) {
    const { data, error } = await supabase.auth.updateUser({ data: { first_name: firstName } })
    if (error) return 'We could not update your name. Try again.'
    if (data.user) setUser(data.user)
    return null
  }

  async function signOut() {
    setMenuOpen(false)
    setMobileAccountOpen(false)
    setAccountMenuOpen(false)
    setAccountModalOpen(false)
    await supabase.auth.signOut()
  }

  if (!user) return <main className="loading-shell">Loading Revision…</main>

  let screen
  if (route.kind !== 'admin' && !programmeResolved) {
    screen = <main className="loading-shell">Loading your courses…</main>
  } else if (route.kind !== 'admin' && programmeError) {
    screen = <main className="dashboard screen-dashboard page-screen"><Status tone="error">{programmeError} Revision will not substitute the published catalogue for your programme.</Status></main>
  } else if (route.kind === 'home') {
    screen = <PlannerHomeScreen client={supabase} userId={user.id} learnerName={learner} programme={programme} onOpenPlan={() => navigate(planRoute())} onOpenRev={() => openRev()} onOpenCourses={() => navigate(coursesRoute())} onOpenCourse={(courseId) => openCourse(courseId, 'recommendation')} />
  } else if (route.kind === 'plan') {
    screen = <PlanScreen client={supabase} userId={user.id} programme={programme} onOpenCourses={() => navigate(coursesRoute())} onOpenCourse={(courseId) => openCourse(courseId, 'recommendation')} />
  } else if (route.kind === 'rev') {
    screen = <PlannerRevScreen client={supabase} userId={user.id} programme={programme} onOpenPlan={() => navigate(planRoute())} onOpenCourses={() => navigate(coursesRoute())} onOpenCourse={(courseId) => openCourse(courseId, 'recommendation')} />
  } else if (route.kind === 'courses' || route.kind === 'subjects' || route.kind === 'subject') {
    screen = <CoursesScreen client={supabase} userId={user.id} catalogue={catalogue} memberships={memberships} onMembershipsChange={setMemberships} onOpenCourse={(courseId) => openCourse(courseId, 'courses_index')} />
  } else if (route.kind === 'progress') {
    screen = <ProgrammeProgressScreen client={supabase} userId={user.id} catalogue={catalogue} memberships={memberships} onOpenCourses={() => navigate(coursesRoute())} onOpenCourseProgress={(courseId) => navigate(learnerCourseRoute(courseId, 'progress'))} />
  } else if (route.kind === 'course') {
    screen = <CourseExperienceScreen client={supabase} userId={user.id} catalogue={catalogue} memberships={memberships} courseId={route.courseId} section={route.section} onOpenCourses={() => navigate(coursesRoute())} onOpenCourseSection={(courseId, section: CourseSection) => navigate(learnerCourseRoute(courseId, section))} onOpenModuleSection={(courseId, moduleId, section: PaperSection) => navigate(learnerModuleRoute(courseId, moduleId, section))} />
  } else if (route.kind === 'module') {
    screen = <CourseExperienceScreen client={supabase} userId={user.id} catalogue={catalogue} memberships={memberships} courseId={route.courseId} moduleId={route.moduleId} section={route.section} onOpenCourses={() => navigate(coursesRoute())} onOpenCourseSection={(courseId, section: CourseSection) => navigate(learnerCourseRoute(courseId, section))} onOpenModuleSection={(courseId, moduleId, section: PaperSection) => navigate(learnerModuleRoute(courseId, moduleId, section))} />
  } else if (route.kind === 'admin') {
    if (!adminAccessResolved) screen = <main className="loading-shell">Checking Admin access…</main>
    else if (!isAdmin) screen = <main className="dashboard screen-dashboard page-screen" aria-labelledby="admin-access-title"><header className="page-heading"><p className="eyebrow">Account</p><h1 id="admin-access-title">Admin access unavailable</h1><p>This account does not have permission to open Revision Admin.</p></header><button className="primary" onClick={() => navigate(homeRoute())}>Back to Home</button></main>
    else if (plannerAdminActive) screen = <PlannerAdminScreen onBack={() => navigate(adminRoute())} />
    else screen = <ContentOperations />
  }

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
          <button className={coursesActive ? 'active' : ''} onClick={() => navigate(coursesRoute())}><NavIcon name="courses" /><span>Courses</span></button>
          {coursesActive && programmeResolved && !programmeError && <ContextualLearnerNavigation route={route} courses={programme} onNavigate={navigate} onOpenCourse={(courseId) => openCourse(courseId, 'global_navigation')} />}
        </nav>
        <div className="runtime-sidebar-account">
          {accountMenuOpen && <div className="runtime-account-popover" role="menu" aria-label="Profile menu">
            <button role="menuitem" onClick={() => openAccountModal('profile')}><NavIcon name="profile" /><span>Profile</span></button>
            <button role="menuitem" onClick={() => openAccountModal('settings')}><NavIcon name="settings" /><span>Settings</span></button>
            {isAdmin && <button role="menuitem" onClick={() => navigate(adminRoute())}><NavIcon name="admin" /><span>Admin</span></button>}
            <div className="runtime-account-menu-disabled" role="menuitem" aria-disabled="true"><NavIcon name="upgrade" /><span className="runtime-account-menu-copy"><span>Upgrade plan</span><small>Coming soon</small></span></div>
            <div className="runtime-account-menu-separator" role="separator"></div>
            <button className="runtime-account-logout" role="menuitem" onClick={signOut}><NavIcon name="logout" /><span>Log out</span></button>
          </div>}
          <button className="runtime-sidebar-user" onClick={() => setAccountMenuOpen((open) => !open)} aria-haspopup="menu" aria-expanded={accountMenuOpen} aria-label={`${learner} account menu`}><span className="account-avatar">{learner.charAt(0).toUpperCase()}</span><span className="runtime-sidebar-user-name">{learner}</span></button>
        </div>
      </aside>

      <header className="mobile-topbar runtime-mobile-topbar"><button className="burger-button runtime-mobile-menu-button" onClick={openMobileMenu} aria-label="Open menu" aria-expanded={menuOpen}><span></span><span></span></button><button className="brand-button runtime-mobile-brand" onClick={() => navigate(homeRoute())} aria-label="REV home"><RevWordmark /></button></header>

      <div className="runtime-screen">{screen}</div>

      {route.kind !== 'admin' && route.kind !== 'rev' && !revPanelOpen && <button className="runtime-mobile-ask-rev-dock" onClick={() => openRev()} aria-label="Ask REV" aria-haspopup="dialog"><RevPresence size="nav" state="resting" decorative /><span>Ask REV</span></button>}

      {revPanelOpen && programmeResolved && !programmeError && <><button className="runtime-rev-backdrop" aria-label="Close Ask REV" onClick={() => setRevPanelOpen(false)}></button><aside className="runtime-rev-panel" role="dialog" aria-modal="true" aria-label="Ask REV"><header className="runtime-rev-panel-head"><div><p className="eyebrow">Your revision guide</p><h2>Ask REV</h2></div><div className="runtime-rev-panel-actions"><button onClick={expandRev}>Expand</button><button onClick={() => setRevPanelOpen(false)} aria-label="Close Ask REV">×</button></div></header><div className="runtime-rev-panel-body"><PlannerRevScreen client={supabase} userId={user.id} programme={programme} onOpenPlan={() => navigate(planRoute())} onOpenCourses={() => navigate(coursesRoute())} onOpenCourse={(courseId) => openCourse(courseId, 'recommendation')} /></div></aside></>}

      {accountModalOpen && <AccountModal learnerName={learner} email={user.email} section={accountSection} theme={theme} onSectionChange={setAccountSection} onThemeChange={setTheme} onNameChange={updateLearnerFirstName} onClose={() => setAccountModalOpen(false)} />}

      {menuOpen && <><button className="runtime-mobile-menu-backdrop" aria-label="Close menu" onClick={closeMobileMenu}></button><aside className="runtime-mobile-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu">
        <header className="runtime-mobile-drawer-head"><button className="brand-button" onClick={() => navigate(homeRoute())} aria-label="REV home"><RevWordmark /></button><button className="runtime-mobile-drawer-close" onClick={closeMobileMenu} aria-label="Close menu">×</button></header>
        <nav className="runtime-mobile-drawer-nav" aria-label="Mobile navigation">
          <button aria-current={route.kind === 'home' ? 'page' : undefined} onClick={() => navigate(homeRoute())}><NavIcon name="home" /><span>Home</span></button>
          <button aria-current={route.kind === 'plan' ? 'page' : undefined} onClick={() => navigate(planRoute())}><NavIcon name="plan" /><span>Plan</span></button>
          <button aria-current={route.kind === 'progress' ? 'page' : undefined} onClick={() => navigate(progressRoute())}><NavIcon name="progress" /><span>Progress</span></button>
          <button aria-current={coursesActive ? 'page' : undefined} onClick={() => navigate(coursesRoute())}><NavIcon name="courses" /><span>Courses</span></button>
          {coursesActive && programmeResolved && !programmeError && <ContextualLearnerNavigation route={route} courses={programme} onNavigate={navigate} onOpenCourse={(courseId) => openCourse(courseId, 'global_navigation')} />}
        </nav>
        <div className="runtime-mobile-drawer-spacer"></div>
        <section className="runtime-mobile-drawer-account" aria-label="Account">
          <button className="runtime-mobile-drawer-user" onClick={() => setMobileAccountOpen((open) => !open)} aria-expanded={mobileAccountOpen} aria-controls="runtime-mobile-account-links" aria-label={`${learner} account options`}><span className="account-avatar">{learner.charAt(0).toUpperCase()}</span><span className="runtime-mobile-drawer-user-name"><strong>{learner}</strong></span><span className="runtime-mobile-account-chevron" aria-hidden="true">›</span></button>
          <div id="runtime-mobile-account-links" className="runtime-mobile-account-links" hidden={!mobileAccountOpen}>
            <button onClick={() => openAccountModal('profile')}><NavIcon name="profile" /><span>Profile</span></button>
            <button onClick={() => openAccountModal('settings')}><NavIcon name="settings" /><span>Settings</span></button>
            {isAdmin && <button onClick={() => navigate(adminRoute())}><NavIcon name="admin" /><span>Admin</span></button>}
            <div className="runtime-mobile-upgrade" aria-disabled="true"><NavIcon name="upgrade" /><span><span>Upgrade plan</span><small>Coming soon</small></span></div>
            <button className="runtime-mobile-logout" onClick={signOut}><NavIcon name="logout" /><span>Log out</span></button>
          </div>
        </section>
      </aside></>}
    </div>
  )
}
