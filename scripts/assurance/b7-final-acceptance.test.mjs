import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')
const mainEntry = read('../../src/main.tsx')
const focusedWorkspace = read('../../src/app/FocusedLearningWorkspace.tsx')
const learnPractice = read('../../src/app/interface-learn-practice.css')
const mobileNavigation = read('../../src/app/mobile-navigation.css')
const componentIndex = read('../../src/app/ui/index.ts')
const visualRegression = read('../../tests/e2e/interface-visual-regression.spec.ts')
const responsiveAcceptance = read('../../tests/e2e/b7-final-acceptance.spec.ts')
const retiredThemeBridge = new URL('../../src/app/interface-theme-integrity.css', import.meta.url)

describe('B7 final Interface System acceptance contract', () => {
  it('keeps the retired catch-all theme bridge out of the canonical runtime', () => {
    expect(mainEntry).not.toContain('interface-theme-integrity.css')
    expect(existsSync(retiredThemeBridge)).toBe(false)
  })

  it('keeps Focused Learn and Practice common controls on the public shared registry', () => {
    for (const sharedJob of ['Button', 'SegmentedControl', 'SelectField', 'TextAreaField']) {
      expect(focusedWorkspace).toContain(sharedJob)
      expect(componentIndex).toContain(sharedJob)
    }
    expect(focusedWorkspace).not.toContain('<select')
    expect(focusedWorkspace).not.toContain('<textarea')
  })

  it('keeps Learn on the accepted reading-workspace composition', () => {
    expect(learnPractice).toContain('.planner-runtime .focused-learn .learn-section')
    expect(learnPractice).toContain('background: transparent;')
    expect(learnPractice).toContain('.planner-runtime .focused-learn .learn-section + .learn-section')
    expect(learnPractice).toContain('border-top: 1px solid var(--color-border);')
  })

  it('keeps the persistent tutor dock clear of ordinary work and absent from timed exams', () => {
    expect(mobileNavigation).toContain('.planner-runtime:has(.exam-session-page) > .runtime-mobile-ask-rev-dock')
    expect(responsiveAcceptance).toContain('expectNoDockOverlap')
    expect(responsiveAcceptance).toContain("await expect(page.locator('.runtime-mobile-ask-rev-dock')).toBeHidden()")
  })

  it('keeps a bounded 18-state Light/Dark visual-regression matrix across canonical breakpoints', () => {
    const entries = [...visualRegression.matchAll(/\{ project: '(phone|tablet|desktop)', state: '[^']+', theme: '(light|dark)' \}/g)]
    expect(entries).toHaveLength(18)
    expect(visualRegression).toContain("state: 'admin'")
    expect(visualRegression).toContain("state: 'timed-exam'")
    expect(visualRegression).toContain("state: 'learn'")
    expect(visualRegression).toContain("state: 'practice'")
    expect(visualRegression).toContain("theme: 'light'")
    expect(visualRegression).toContain("theme: 'dark'")
    expect(visualRegression).toContain('toHaveScreenshot')
  })
})
