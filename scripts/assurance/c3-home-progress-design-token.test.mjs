import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const brandTokens = readFileSync(new URL('../../src/app/brand-tokens.css', import.meta.url), 'utf8')
const home = readFileSync(new URL('../../src/app/home-v2.css', import.meta.url), 'utf8')
const progress = readFileSync(new URL('../../src/app/progress-v2.css', import.meta.url), 'utf8')
const learnerComponents = readFileSync(new URL('../../src/app/ui/learner-v2-components.css', import.meta.url), 'utf8')
const hueProgressBar = readFileSync(new URL('../../src/app/ui/HueProgressBar.tsx', import.meta.url), 'utf8')

describe('C3 Home and Progress design-token migration', () => {
  it('keeps Home and learner-wide Progress off the retired --rv-* compatibility namespace', () => {
    expect(home).not.toContain('--rv-')
    expect(progress).not.toContain('--rv-')
    expect(hueProgressBar).not.toContain('--rv-')
  })

  it('owns learner display roles centrally instead of page-local H1/H2 scales', () => {
    for (const token of [
      '--type-learner-h1-size',
      '--type-learner-h2-size',
      '--type-learner-h3-size',
      '--type-learner-hero-size',
      '--type-learner-display-weight',
      '--type-learner-display-tracking',
    ]) {
      expect(brandTokens).toContain(token)
    }
    expect(home).toContain('font-size: var(--type-learner-h1-size)')
    expect(progress).toContain('font-size: var(--type-learner-h1-size)')
  })

  it('decouples governed learning-status roles and the shared scrim from --rv-*', () => {
    const learningStatusBlock = brandTokens.slice(
      brandTokens.indexOf('--learning-status-gotit:'),
      brandTokens.indexOf('/* Focus ring used by the v2 components'),
    )
    expect(learningStatusBlock).not.toContain('var(--rv-')
    expect(brandTokens).toContain('--scrim: color-mix(in srgb, var(--brand-deep-teal) 72%, transparent)')
  })

  it('uses the canonical ordinary-surface radius for shared progress measures', () => {
    expect(learnerComponents).toContain('border-radius: var(--radius-surface); background: var(--color-surface);')
    expect(learnerComponents).not.toContain('.ui-progress-measure { display: flex; flex-direction: column; gap: 14px; min-width: 0; padding: 22px; border: 1px solid var(--color-border); border-radius: 24px;')
  })
})
