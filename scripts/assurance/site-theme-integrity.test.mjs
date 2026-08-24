import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const mainEntry = readFileSync(new URL('../../src/main.tsx', import.meta.url), 'utf8')
const guidance = readFileSync(new URL('../../src/app/guidance.css', import.meta.url), 'utf8')
const authEntry = readFileSync(new URL('../../src/app/auth-entry.css', import.meta.url), 'utf8')
const interfaceLearnPractice = readFileSync(new URL('../../src/app/interface-learn-practice.css', import.meta.url), 'utf8')
const retiredThemeBridge = new URL('../../src/app/interface-theme-integrity.css', import.meta.url)

const semanticLayers = [
  'brand-tokens.css',
  'auth-entry.css',
  'first-use.css',
  'guidance.css',
  'interface-system.css',
  'ui/ui-components.css',
  'interface-plan-progress.css',
  'interface-subjects-course.css',
  'interface-learn-practice.css',
  'interface-exam-experience.css',
  'interface-admin.css',
  'courses.css',
  'ask-rev-cta.css',
  'rev-resting-presence.css',
]

/* These are retained feature/composition sources, not a final catch-all theme bridge.
 * Their live consumers and retirement decisions are recorded in the B7 final
 * acceptance technical record. */
const retainedFeatureSources = new Set([
  'app.css',
  'exam.css',
  'rev-home.css',
  'hierarchy.css',
  'course-exam.css',
  'content-operations.css',
  'admin-operations-responsive.css',
  'planner.css',
  'planner-runtime.css',
  'planner-today.css',
  'planner-rev.css',
  'living-e.css',
  'living-e-accessibility.css',
  'sidebar-account-menu.css',
  'account-modal.css',
  'profile-edit.css',
  'mobile-navigation.css',
  'contextual-navigation.css',
])

describe('site-wide theme integrity governance', () => {
  it('keeps shared guidance and authentication surfaces on semantic theme roles', () => {
    for (const css of [guidance, authEntry]) {
      expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i)
      expect(css).not.toMatch(/\brgba?\s*\(/i)
      expect(css).toContain('background: var(--color-surface);')
      expect(css).toContain('color: var(--color-text);')
      expect(css).toContain('color: var(--color-text-secondary);')
      expect(css).toContain('var(--color-border)')
    }
    expect(guidance).toContain('var(--color-action)')
    expect(authEntry).toContain('var(--color-action)')
    expect(authEntry).toContain('var(--field-height-standard)')
  })

  it('keeps the rendered Practice REV recommendation in its owning semantic feature layer', () => {
    expect(interfaceLearnPractice).toContain('.planner-runtime .focused-practice .recommendation-card')
    expect(interfaceLearnPractice).toContain('background: var(--color-surface-soft);')
    expect(interfaceLearnPractice).toContain('.planner-runtime .focused-practice .recommendation-card .eyebrow')
    expect(interfaceLearnPractice).toContain('color: var(--color-accent-text);')
  })

  it('classifies every stylesheet loaded by the canonical runtime as semantic or deliberately retained feature composition', () => {
    const imports = [...mainEntry.matchAll(/import '\.\/app\/(.+\.css)'/g)].map((match) => match[1])
    expect(imports.length).toBeGreaterThan(0)

    for (const stylesheet of imports) {
      expect(
        semanticLayers.includes(stylesheet) || retainedFeatureSources.has(stylesheet),
        `Unclassified runtime stylesheet: ${stylesheet}`,
      ).toBe(true)
    }
  })

  it('fails closed if the retired final theme-integrity bridge returns', () => {
    expect(mainEntry).not.toContain('interface-theme-integrity.css')
    expect(existsSync(retiredThemeBridge)).toBe(false)
  })
})
