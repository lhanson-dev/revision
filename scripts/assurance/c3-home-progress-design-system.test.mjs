import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const homeCss = readFileSync(new URL('../../src/app/home-v2.css', import.meta.url), 'utf8')
const progressCss = readFileSync(new URL('../../src/app/progress-v2.css', import.meta.url), 'utf8')
const tokensCss = readFileSync(new URL('../../src/app/brand-tokens.css', import.meta.url), 'utf8')

describe('C3 Home and learner-wide Progress design-system migration', () => {
  it('keeps Home and Progress off the legacy --rv-* compatibility namespace', () => {
    expect(homeCss).not.toMatch(/--rv-[a-z0-9-]+/)
    expect(progressCss).not.toMatch(/--rv-[a-z0-9-]+/)
  })

  it('owns canonical learner display roles centrally', () => {
    for (const token of [
      '--type-learner-hero-size',
      '--type-learner-h1-size',
      '--type-learner-h1-line',
      '--type-learner-h2-size',
      '--type-learner-h2-line',
      '--type-learner-h3-size',
      '--type-learner-h3-line',
    ]) {
      expect(tokensCss).toContain(token)
    }
    expect(homeCss).toContain('var(--type-learner-h1-size)')
    expect(progressCss).toContain('var(--type-learner-h1-size)')
  })

  it('keeps governed learning-status roles independent of compatibility colours', () => {
    const statusBlock = tokensCss.slice(
      tokensCss.indexOf('/* Learning status: Got it'),
      tokensCss.indexOf('/* Focus ring used by the v2 components'),
    )
    expect(statusBlock).not.toContain('var(--rv-')
    expect(tokensCss).toContain('--scrim: color-mix(in srgb, var(--brand-deep-teal) 72%, transparent);')
  })
})
