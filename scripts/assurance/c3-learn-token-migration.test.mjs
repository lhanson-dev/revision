import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const learn = readFileSync(new URL('../../src/app/learn-reading.css', import.meta.url), 'utf8')
const learnerComponents = readFileSync(new URL('../../src/app/ui/learner-v2-components.css', import.meta.url), 'utf8')
const quickCheck = learnerComponents.match(/\.ui-quick-check\s*\{[\s\S]*?\n\}/)?.[0] ?? ''

describe('C3 Learn canonical token migration', () => {
  it('removes direct retired v2 compatibility roles from the Learn surface', () => {
    expect(learn).not.toMatch(/--rv-[a-z0-9-]+/)
  })

  it('uses canonical learner roles for the Learn frame, REV, headings, geometry and focus', () => {
    for (const role of [
      'var(--color-border)',
      'var(--color-inverse-action)',
      'var(--color-inverse-action-text)',
      'var(--color-inverse-accent-text)',
      'var(--color-inverse-text-secondary)',
      'var(--radius-compact)',
      'var(--radius-surface)',
      'var(--radius-pill)',
      'var(--type-learner-h2-size)',
      'var(--type-learner-h3-size)',
      'var(--focus-ring)',
    ]) expect(learn).toContain(role)
  })

  it('does not retain the superseded Learn surface radius values', () => {
    expect(learn).not.toMatch(/border-radius:\s*(?:16|24|28)px/)
  })

  it('aligns the Learn Quick Check treatment with the canonical ordinary-surface radius', () => {
    expect(quickCheck).toContain('border-radius: var(--radius-surface)')
    expect(quickCheck).not.toMatch(/border-radius:\s*24px/)
  })
})
