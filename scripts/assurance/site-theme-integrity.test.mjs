import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const mainEntry = readFileSync(new URL('../../src/main.tsx', import.meta.url), 'utf8')
const guidance = readFileSync(new URL('../../src/app/guidance.css', import.meta.url), 'utf8')
const themeIntegrity = readFileSync(new URL('../../src/app/interface-theme-integrity.css', import.meta.url), 'utf8')

const semanticLayers = [
  'interface-system.css',
  'ui/ui-components.css',
  'interface-plan-progress.css',
  'interface-subjects-course.css',
  'interface-learn-practice.css',
  'interface-exam-experience.css',
  'interface-admin.css',
  'interface-theme-integrity.css',
]

const classifiedLegacyThemeDebt = new Set([
  'app.css',
  'auth-entry.css',
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
  it('keeps shared guidance surfaces on semantic theme roles', () => {
    expect(guidance).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    expect(guidance).not.toMatch(/\brgba?\s*\(/i)
    expect(guidance).toContain('background: var(--color-surface);')
    expect(guidance).toContain('color: var(--color-text);')
    expect(guidance).toContain('color: var(--color-text-secondary);')
    expect(guidance).toContain('var(--color-action)')
    expect(guidance).toContain('var(--color-border)')
  })

  it('classifies every stylesheet loaded by the canonical runtime as semantic or known compatibility debt', () => {
    const imports = [...mainEntry.matchAll(/import '\.\/app\/(.+\.css)'/g)].map((match) => match[1])
    expect(imports.length).toBeGreaterThan(0)

    for (const stylesheet of imports) {
      expect(
        semanticLayers.includes(stylesheet) || classifiedLegacyThemeDebt.has(stylesheet),
        `Unclassified runtime stylesheet: ${stylesheet}`,
      ).toBe(true)
    }
  })

  it('keeps the final compatibility layer loaded after all semantic feature layers', () => {
    for (const stylesheet of semanticLayers.filter((name) => name !== 'interface-theme-integrity.css')) {
      expect(mainEntry.indexOf(`./app/${stylesheet}`)).toBeLessThan(mainEntry.indexOf('./app/interface-theme-integrity.css'))
    }
    expect(themeIntegrity).toContain('color-scheme: dark;')
  })
})
