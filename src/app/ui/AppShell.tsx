import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import { RevMark } from './RevMark'
import { classNames } from './classNames'
import { useBreakpoint, type Breakpoint } from './useBreakpoint'

export interface ShellNavItem {
  key: string
  label: string
  icon: IconName
}

interface ShellNavProps {
  items: readonly ShellNavItem[]
  /** Key of the current destination, or null when none of the items is current (for example inside Admin). */
  active: string | null
  onNavigate: (key: string) => void
  /** Opens Ask REV. Kept separate from onNavigate so Ask REV can be a page, an overlay, or both. */
  onAskRev: () => void
  /** True while Ask REV is open. */
  askRevActive?: boolean
}

export interface SidebarProps extends ShellNavProps {
  /** Below the navigation: the account control, and the week's study time once that exists. */
  footer?: ReactNode
}

function NavButton({ item, active, onNavigate, showLabel }: { item: ShellNavItem; active: boolean; onNavigate: (key: string) => void; showLabel: boolean }) {
  return (
    <button
      type="button"
      className={classNames('ui-shell-nav__item', active && 'is-active')}
      aria-current={active ? 'page' : undefined}
      aria-label={showLabel ? undefined : item.label}
      onClick={() => onNavigate(item.key)}
    >
      <Icon name={item.icon} size="compact" />
      {showLabel && <span>{item.label}</span>}
    </button>
  )
}

/** Desktop and laptop (above 960px): the 248px sidebar. */
export function Sidebar({ items, active, onNavigate, onAskRev, askRevActive, footer }: SidebarProps) {
  return (
    <aside className="ui-sidebar">
      <p className="ui-sidebar__wordmark" aria-label="Revision">Revision</p>
      <button type="button" className={classNames('ui-sidebar__ask-rev', askRevActive && 'is-active')} onClick={onAskRev}>
        <RevMark size="nav" />
        <span>Ask REV</span>
      </button>
      <nav className="ui-shell-nav" aria-label="Primary navigation">
        {items.map((item) => <NavButton key={item.key} item={item} active={active === item.key} onNavigate={onNavigate} showLabel />)}
      </nav>
      {footer && <div className="ui-sidebar__footer">{footer}</div>}
    </aside>
  )
}

/**
 * Tablet (621 to 960px): the 84px icon rail. Labels are the accessible names.
 * `onOpenMenu` adds the two-line menu button at the top, which opens the full left navigation
 * (course list, account) exactly as it does on a phone.
 */
export function Rail({ items, active, onNavigate, onAskRev, askRevActive, onOpenMenu, menuOpen }: ShellNavProps & { onOpenMenu?: () => void; menuOpen?: boolean }) {
  return (
    <aside className="ui-rail">
      {onOpenMenu && (
        <button type="button" className="ui-rail__menu" aria-label="Open menu" aria-expanded={menuOpen ?? false} onClick={onOpenMenu}>
          <span></span><span></span>
        </button>
      )}
      <button type="button" className={classNames('ui-rail__ask-rev', askRevActive && 'is-active')} aria-label="Ask REV" onClick={onAskRev}>
        <RevMark size="nav" />
      </button>
      <nav className="ui-shell-nav ui-shell-nav--rail" aria-label="Primary navigation">
        {items.map((item) => <NavButton key={item.key} item={item} active={active === item.key} onNavigate={onNavigate} showLabel={false} />)}
      </nav>
    </aside>
  )
}

/** Phone (620px and below): the bottom tab bar with REV raised in the centre. */
export function TabBar({ items, active, onNavigate, onAskRev, askRevActive }: ShellNavProps) {
  const middle = Math.ceil(items.length / 2)
  const before = items.slice(0, middle)
  const after = items.slice(middle)
  const tab = (item: ShellNavItem) => (
    <button
      key={item.key}
      type="button"
      className={classNames('ui-tabbar__item', active === item.key && 'is-active')}
      aria-current={active === item.key ? 'page' : undefined}
      onClick={() => onNavigate(item.key)}
    >
      <Icon name={item.icon} size="compact" />
      <span>{item.label}</span>
    </button>
  )
  return (
    <nav className="ui-tabbar" aria-label="Primary navigation">
      {before.map(tab)}
      <button type="button" className={classNames('ui-tabbar__ask-rev', askRevActive && 'is-active')} aria-label="Ask REV" onClick={onAskRev}>
        <RevMark size="nav" />
      </button>
      {after.map(tab)}
    </nav>
  )
}

export interface AppShellProps extends ShellNavProps {
  children: ReactNode
  /** Exam Prep focus mode: all navigation is hidden. Leaving a running timed paper asks first (in the Exam Prep screen). */
  focus?: boolean
  /** Sidebar footer (desktop and laptop only). */
  sidebarFooter?: ReactNode
  /** A sticky bottom slot, for example the Practice feedback bar. Sits above the tab bar on phones. */
  stickyFooter?: ReactNode
  /** Override the measured layout band (tests, previews). */
  breakpoint?: Breakpoint
}

/**
 * The page shell for every learner screen.
 * Sidebar above 960px, icon rail from 621 to 960px, bottom tab bar at 620px and below.
 * Content sits in one centred 1100px canvas, and the page scrolls down, never sideways.
 */
export function AppShell({ children, focus = false, sidebarFooter, stickyFooter, breakpoint, ...nav }: AppShellProps) {
  const measured = useBreakpoint().breakpoint
  const band = breakpoint ?? measured
  const showSidebar = !focus && (band === 'desktop' || band === 'laptop')
  const showRail = !focus && band === 'tablet'
  const showTabBar = !focus && band === 'phone'

  return (
    <div className={classNames('ui-app-shell', `ui-app-shell--${band}`, focus && 'ui-app-shell--focus')}>
      {showSidebar && <Sidebar {...nav} footer={sidebarFooter} />}
      {showRail && <Rail {...nav} />}
      <div className="ui-app-shell__body">
        <main className="ui-app-shell__main" id="main-content">{children}</main>
        {stickyFooter && <div className="ui-app-shell__sticky">{stickyFooter}</div>}
      </div>
      {showTabBar && <TabBar {...nav} />}
    </div>
  )
}
