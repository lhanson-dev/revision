import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const entry = readFileSync(new URL('../../src/app/auth-v2.css', import.meta.url), 'utf8')
const firstUse = readFileSync(new URL('../../src/app/first-use-v2.css', import.meta.url), 'utf8')
const onboarding = readFileSync(new URL('../../src/app/onboarding-v2.css', import.meta.url), 'utf8')

describe('C3 canonical learner entry visual migration', () => {
  it('removes local retired v2 token consumption in the three live entry sheets', () => {
    for (const css of [entry, firstUse, onboarding]) expect(css).not.toMatch(/--rv-[a-z0-9-]+/)
  })

  it('uses governed learner action, surface, focus, display and geometry roles', () => {
    for (const css of [entry, firstUse, onboarding]) {
      expect(css).toContain('var(--color-action)')
      expect(css).toContain('var(--focus-ring)')
      expect(css).toContain('var(--radius-control)')
      expect(css).toContain('var(--font-family-display)')
    }
    expect(entry).toContain('var(--color-inverse-action)')
    expect(entry).toContain('var(--color-inverse-action-text)')
    expect(firstUse).toContain('var(--radius-feature)')
    expect(firstUse).toContain('var(--color-inverse-accent-text)')
    expect(onboarding).toContain('var(--radius-surface)')
    expect(onboarding).toContain('var(--color-surface)')
  })

  it('does not reintroduce obsolete entry-sheet card or row radii', () => {
    for (const css of [entry, firstUse, onboarding]) expect(css).not.toMatch(/border-radius:\s*(?:16|24)px/)
  })
})
