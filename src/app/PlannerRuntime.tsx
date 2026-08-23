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
import { DrawerShell, Icon, IconButton, OverlayBackdrop, Status } from './ui'

const catalogue = buildCatalogue(listAvailableContentAdapters())
const themeStorageKey = 'revision:theme'

type ThemeName = 'light' | 'dark'
type AccountSection = 'profile' | 'settings'

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
        <button className="runtime-ask-rev" onClick={() => openRev()} aria-haspopup="dialog"><RevPresence size="nav" state="resting" decorative /><span>Ask REV</span></button>
        <nav className="runtime-sidebar-nav" aria-label="Primary navigation">
          <button className={route.kind === 'home' ? 'active' : ''} onClick={() => navigate(homeRoute())}><Icon name="home" className="nav-icon" /><span>Home</span></button>
          <button className={route.kind === 'plan' ? 'active' : ''} onClick={() => navigate(planRoute())}><Icon name="plan" className="nav-icon" /><span>Plan</span></button>
          <button className={route.kind === 'progress' ? 'active' : ''} onClick={() => navigate(progressRoute())}><Icon name="progress" className="nav-icon" /><span>Progress</span></button>
          <button className={coursesActive ? 'active' : ''} onClick={() => navigate(coursesRoute())}><Icon name="courses" className="nav-icon" /><span>Courses</span></button>
          {coursesActive && programmeResolved && !programmeError && <ContextualLearnerNavigation route={route} courses={programme} onNavigate={navigate} onOpenCourse={(courseId) => openCourse(courseId, 'global_navigation')} />}
        </nav>
        <div className="runtime-sidebar-account">
          {accountMenuOpen && <div className="runtime-account-popover" role="menu" aria-label="Profile menu">
            <button role="menuitem" onClick={() => openAccountModal('profile')}><Icon name="user" className="nav-icon" /><span>Profile</span></button>
            <button role="menuitem" onClick={() => openAccountModal('settings')}><Icon name="settings" className="nav-icon" /><span>Settings</span></button>
            {isAdmin && <button role="menuitem" onClick={() => navigate(adminRoute())}><Icon name="admin" className="nav-icon" /><span>Admin</span></button>}
            <div className="runtime-account-menu-disabled" role="menuitem" aria-disabled="true"><Icon name="upgrade" className="nav-icon" /><span className="runtime-account-menu-copy"><span>Upgrade plan</span><small>Coming soon</small></span></div>
            <div className="runtime-account-menu-separator" role="separator"></div>
            <button className="runtime-account-logout" role="menuitem" onClick={signOut}><Icon name="logout" className="nav-icon" /><span>Log out</span></button>
          </div>}
          <button className="runtime-sidebar-user" onClick={() => setAccountMenuOpen((open) => !open)} aria-haspopup="menu" aria-expanded={accountMenuOpen} aria-label={`${learner} account menu`}><span className="account-avatar">{learner.charAt(0).toUpperCase()}</span><span className="runtime-sidebar-user-name">{learner}</span></button>
        </div>
      </aside>

      <header className="mobile-topbar runtime-mobile-topbar"><button className="burger-button runtime-mobile-menu-button" onClick={openMobileMenu} aria-label="Open menu" aria-expanded={menuOpen}><span></span><span></span></button><button className="brand-button runtime-mobile-brand" onClick={() => navigate(homeRoute())} aria-label="REV home"><RevWordmark /></button></header>

      <div className="runtime-screen">{screen}</div>

      {route.kind !== 'admin' && route.kind !== 'rev' && !revPanelOpen && <button className="runtime-mobile-ask-rev-dock" onClick={() => openRev()} aria-label="Ask REV" aria-haspopup="dialog"><RevPresence size="nav" state="resting" decorative /><span>Ask REV</span></button>}

      {revPanelOpen && programmeResolved && !programmeError && <>
        <OverlayBackdrop className="runtime-rev-backdrop" label="Close Ask REV" onClick={() => setRevPanelOpen(false)} />
        <DrawerShell
          className="runtime-rev-panel"
          label="Ask REV"
          onDismiss={() => setRevPanelOpen(false)}
          initialFocusSelector=".planner-rev-input input"
          returnFocusSelector=".runtime-ask-rev, .runtime-mobile-ask-rev-dock"
        >
          <header className="runtime-rev-panel-head"><div><p className="eyebrow">Your revision guide</p><h2>Ask REV</h2></div><div className="runtime-rev-panel-actions"><button onClick={expandRev}>Expand</button><IconButton className="runtime-rev-panel-close" label="Close Ask REV" onClick={() => setRevPanelOpen(false)}><Icon name="close" size="compact" /></IconButton></div></header>
          <div className="runtime-rev-panel-body"><PlannerRevScreen client={supabase} userId={user.id} programme={programme} onOpenPlan={() => navigate(planRoute())} onOpenCourses={() => navigate(coursesRoute())} onOpenCourse={(courseId) => openCourse(courseId, 'recommendation')} /></div>
        </DrawerShell>
      </>}

      {accountModalOpen && <AccountModal learnerName={learner} email={user.email} section={accountSection} theme={theme} onSectionChange={setAccountSection} onThemeChange={setTheme} onNameChange={updateLearnerFirstName} onClose={() => setAccountModalOpen(false)} />}

      {menuOpen && <>
        <OverlayBackdrop className="runtime-mobile-menu-backdrop" label="Close menu" onClick={closeMobileMenu} />
        <DrawerShell className="runtime-mobile-drawer" label="Navigation menu" onDismiss={closeMobileMenu} initialFocusSelector=".runtime-mobile-drawer-close">
          <header className="runtime-mobile-drawer-head"><button className="brand-button" onClick={() => navigate(homeRoute())} aria-label="REV home"><RevWordmark /></button><IconButton className="runtime-mobile-drawer-close" label="Close menu" onClick={closeMobileMenu}><Icon name="close" size="compact" /></IconButton></header>
          <nav className="runtime-mobile-drawer-nav" aria-label="Mobile navigation">
            <button aria-current={route.kind === 'home' ? 'page' : undefined} onClick={() => navigate(homeRoute())}><Icon name="home" className="nav-icon" /><span>Home</span></button>
            <button aria-current={route.kind === 'plan' ? 'page' : undefined} onClick={() => navigate(planRoute())}><Icon name="plan" className="nav-icon" /><span>Plan</span></button>
            <button aria-current={route.kind === 'progress' ? 'page' : undefined} onClick={() => navigate(progressRoute())}><Icon name="progress" className="nav-icon" /><span>Progress</span></button>
            <button aria-current={coursesActive ? 'page' : undefined} onClick={() => navigate(coursesRoute())}><Icon name="courses" className="nav-icon" /><span>Courses</span></button>
            {coursesActive && programmeResolved && !programmeError && <ContextualLearnerNavigation route={route} courses={programme} onNavigate={navigate} onOpenCourse={(courseId) => openCourse(courseId, 'global_navigation')} />}
          </nav>
          <div className="runtime-mobile-drawer-spacer"></div>
          <section className="runtime-mobile-drawer-account" aria-label="Account">
            <button className="runtime-mobile-drawer-user" onClick={() => setMobileAccountOpen((open) => !open)} aria-expanded={mobileAccountOpen} aria-controls="runtime-mobile-account-links" aria-label={`${learner} account options`}><span className="account-avatar">{learner.charAt(0).toUpperCase()}</span><span className="runtime-mobile-drawer-user-name"><strong>{learner}</strong></span><Icon name="chevron-right" size="compact" className="runtime-mobile-account-chevron" /></button>
            <div id="runtime-mobile-account-links" className="runtime-mobile-account-links" hidden={!mobileAccountOpen}>
              <button onClick={() => openAccountModal('profile')}><Icon name="user" className="nav-icon" /><span>Profile</span></button>
              <button onClick={() => openAccountModal('settings')}><Icon name="settings" className="nav-icon" /><span>Settings</span></button>
              {isAdmin && <button onClick={() => navigate(adminRoute())}><Icon name="admin" className="nav-icon" /><span>Admin</span></button>}
              <div className="runtime-mobile-upgrade" aria-disabled="true"><Icon name="upgrade" className="nav-icon" /><span><span>Upgrade plan</span><small>Coming soon</small></span></div>
              <button className="runtime-mobile-logout" onClick={signOut}><Icon name="logout" className="nav-icon" /><span>Log out</span></button>
            </div>
          </section>
        </DrawerShell>
      </>}
    </div>
  )
}
