import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const plan = readFileSync(new URL('../../src/app/plan-v2.css', import.meta.url), 'utf8')

describe('C3 Plan canonical token migration', () => {
  it('removes the retired v2 compatibility namespace from the canonical Plan stylesheet', () => {
    expect(plan).not.toMatch(/--rv-[a-z0-9-]+/)
  })

  it('uses canonical learner roles for colour, shape, focus and display type', () => {
    for (const role of [
      'var(--color-bg)',
      'var(--color-surface)',
      'var(--color-surface-soft)',
      'var(--color-border)',
      'var(--color-text)',
      'var(--color-text-secondary)',
      'var(--color-action)',
      'var(--color-accent-text)',
      'var(--focus-ring)',
      'var(--radius-compact)',
      'var(--radius-control)',
      'var(--radius-surface)',
      'var(--radius-pill)',
      'var(--type-learner-h1-size)',
      'var(--type-learner-h3-size)',
    ]) expect(plan).toContain(role)
  })

  it('does not retain the historical Plan-only radius values', () => {
    expect(plan).not.toMatch(/border-radius:\s*(?:10|16|18|24)px/)
  })
})
