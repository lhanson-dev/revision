import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const plannerRuntime = readFileSync(new URL('../../src/app/PlannerRuntime.tsx', import.meta.url), 'utf8')
const iconRegistry = readFileSync(new URL('../../src/app/ui/Icon.tsx', import.meta.url), 'utf8')

describe('B7 learner shell icon ownership', () => {
  it('keeps recurring shell navigation, account and overlay controls in the shared Icon registry', () => {
    for (const iconName of ['home', 'plan', 'progress', 'courses', 'user', 'settings', 'admin', 'upgrade', 'logout', 'close', 'chevron-right']) {
      expect(iconRegistry).toContain(`| '${iconName}'`)
    }

    expect(plannerRuntime).toContain("import { DrawerShell, Icon, IconButton, OverlayBackdrop, Status } from './ui'")
    expect(plannerRuntime).not.toContain('function NavIcon(')
    expect(plannerRuntime).not.toContain('type NavIconName =')
    expect(plannerRuntime).not.toContain('<NavIcon')
    expect(plannerRuntime).not.toContain('<svg')
    expect(plannerRuntime).not.toContain('>×<')
    expect(plannerRuntime).not.toContain('>›<')

    for (const iconName of ['home', 'plan', 'progress', 'courses', 'user', 'settings', 'admin', 'upgrade', 'logout']) {
      expect(plannerRuntime).toContain(`<Icon name="${iconName}" className="nav-icon" />`)
    }

    expect(plannerRuntime).toContain('<Icon name="close" size="compact" />')
    expect(plannerRuntime).toContain('<Icon name="chevron-right" size="compact" className="runtime-mobile-account-chevron" />')
    expect(plannerRuntime).toContain('<DrawerShell')
    expect(plannerRuntime).toContain('<OverlayBackdrop')
    expect(plannerRuntime).toContain('<IconButton')
  })
})
