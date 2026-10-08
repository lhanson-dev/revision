import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const home = readFileSync(new URL('../../src/app/home-v2.css', import.meta.url), 'utf8')
const progress = readFileSync(new URL('../../src/app/progress-v2.css', import.meta.url), 'utf8')
const tokens = readFileSync(new URL('../../src/app/brand-tokens.css', import.meta.url), 'utf8')

describe('C3 Home and learner-wide Progress canonical token migration', () => {
  it('removes the retired v2 compatibility namespace from the scoped page styles', () => {
    expect(home).not.toMatch(/--rv-[a-z0-9-]+/)
    expect(progress).not.toMatch(/--rv-[a-z0-9-]+/)
  })

  it('uses canonical learner semantic roles for colour, shape, focus and display type', () => {
    for (const css of [home, progress]) {
      expect(css).toContain('var(--color-surface)')
      expect(css).toContain('var(--color-border)')
      expect(css).toContain('var(--color-text)')
      expect(css).toContain('var(--font-family-display)')
      expect(css).toContain('var(--radius-surface)')
    }

    expect(home).toContain('var(--focus-ring)')
    expect(home).toContain('var(--radius-feature)')
    expect(home).toContain('var(--type-learner-h1-size)')
    expect(progress).toContain('var(--type-learner-h1-size)')
  })

  it('keeps the canonical responsive display and inverse feature roles centrally owned', () => {
    expect(tokens).toContain('--type-learner-h1-size: clamp(34px, 2.4vw + 18px, 46px);')
    expect(tokens).toContain('--type-learner-h2-size: clamp(26px, 1.2vw + 18px, 32px);')
    expect(tokens).toContain('--color-inverse-text-secondary:')
    expect(tokens).toContain('--color-inverse-accent-text:')
  })
})
