import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const plannerRuntime = readFileSync(new URL('../../src/app/PlannerRuntime.tsx', import.meta.url), 'utf8')
const iconRegistry = readFileSync(new URL('../../src/app/ui/Icon.tsx', import.meta.url), 'utf8')

describe('B7 learner shell icon ownership', () => {
  it('keeps recurring shell navigation and account icons in the shared Icon registry', () => {
    for (const iconName of ['home', 'plan', 'progress', 'courses', 'user', 'settings', 'admin', 'upgrade', 'logout']) {
      expect(iconRegistry).toContain(`| '${iconName}'`)
    }

    expect(plannerRuntime).toContain("import { Icon, Status } from './ui'")
    expect(plannerRuntime).not.toContain('function NavIcon(')
    expect(plannerRuntime).not.toContain('type NavIconName =')
    expect(plannerRuntime).not.toContain('<NavIcon')
    expect(plannerRuntime).not.toContain('<svg')

    for (const iconName of ['home', 'plan', 'progress', 'courses', 'user', 'settings', 'admin', 'upgrade', 'logout']) {
      expect(plannerRuntime).toContain(`<Icon name="${iconName}" className="nav-icon" />`)
    }
  })
})
