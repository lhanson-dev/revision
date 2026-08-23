import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')
const mainEntry = read('../../src/main.tsx')
const focusedWorkspace = read('../../src/app/FocusedLearningWorkspace.tsx')
const contentOperations = read('../../src/app/ContentOperations.tsx')
const learnPractice = read('../../src/app/interface-learn-practice.css')
const subjectsCourse = read('../../src/app/interface-subjects-course.css')
const hierarchy = read('../../src/app/hierarchy.css')
const courseExam = read('../../src/app/course-exam.css')
const mobileNavigation = read('../../src/app/mobile-navigation.css')
const componentIndex = read('../../src/app/ui/index.ts')
const visualRegression = read('../../tests/e2e/interface-visual-regression.spec.ts')
const responsiveAcceptance = read('../../tests/e2e/b7-final-acceptance.spec.ts')
const finalRecord = read('../../docs/technical/Interface System B7 Final Acceptance.md')
const acceptanceAudit = read('../../audits/2026-08-23-b7-design-acceptance-rerun.md')
const retiredThemeBridge = new URL('../../src/app/interface-theme-integrity.css', import.meta.url)

describe('B7 final Interface System acceptance contract', () => {
  it('keeps the retired catch-all theme bridge out of the canonical runtime', () => {
    expect(mainEntry).not.toContain('interface-theme-integrity.css')
    expect(existsSync(retiredThemeBridge)).toBe(false)
  })

  it('keeps Course Overview theme ownership in the B3 semantic layer after bridge retirement', () => {
    for (const selector of [
      '.planner-runtime .section-choice',
      '.planner-runtime .section-choice .section-icon',
      '.planner-runtime .evidence-dot',
      '.planner-runtime .evidence-dot.has-evidence',
    ]) {
      expect(subjectsCourse).toContain(selector)
    }
    expect(subjectsCourse).toContain('background: var(--color-surface);')
    expect(subjectsCourse).toContain('color: var(--color-text);')
    expect(subjectsCourse).toContain('background: var(--color-surface-soft);')
    expect(subjectsCourse).toContain('color: var(--color-accent-text);')
    expect(subjectsCourse).toContain('background: var(--brand-primary-teal);')
  })

  it('keeps retained course hierarchy and Exam Prep surfaces on their intended semantic theme roles', () => {
    expect(hierarchy).toContain('.cross-section-next{')
    expect(hierarchy).toContain('background:var(--color-surface)')
    expect(courseExam).toContain('.paper-exam-content{')
    expect(courseExam).toContain('background:var(--color-surface-soft)')
  })

  it('keeps Focused Learn and Practice common controls on the public shared registry', () => {
    for (const sharedJob of ['Button', 'SegmentedControl', 'SelectField', 'TextAreaField']) {
      expect(focusedWorkspace).toContain(sharedJob)
      expect(componentIndex).toContain(sharedJob)
    }
    expect(focusedWorkspace).not.toContain('<select')
    expect(focusedWorkspace).not.toContain('<textarea')
  })

  it('keeps ordinary Admin actions and intake fields on the public shared registry', () => {
    for (const sharedJob of ['Button', 'TextField', 'TextAreaField']) {
      expect(contentOperations).toContain(sharedJob)
      expect(componentIndex).toContain(sharedJob)
    }
    expect(contentOperations).not.toContain('<textarea')
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

  it('keeps the final consumer inventory and point-in-time acceptance rerun in the governed record set', () => {
    expect(finalRecord).toContain('## Retained runtime stylesheet inventory')
    expect(finalRecord).toContain('## Design Acceptance reconciliation')
    expect(acceptanceAudit).toContain('## Original DAR disposition')
    expect(acceptanceAudit).toContain('Candidate for B7 foundation acceptance')
  })
})
