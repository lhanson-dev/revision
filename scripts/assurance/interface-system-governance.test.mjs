import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const brandTokens = readFileSync(new URL('../../src/app/brand-tokens.css', import.meta.url), 'utf8')
const interfaceSystem = readFileSync(new URL('../../src/app/interface-system.css', import.meta.url), 'utf8')
const interfaceComponents = readFileSync(new URL('../../src/app/ui/ui-components.css', import.meta.url), 'utf8')
const interfacePlanProgress = readFileSync(new URL('../../src/app/interface-plan-progress.css', import.meta.url), 'utf8')
const interfaceSubjectsCourse = readFileSync(new URL('../../src/app/interface-subjects-course.css', import.meta.url), 'utf8')
const interfaceLearnPractice = readFileSync(new URL('../../src/app/interface-learn-practice.css', import.meta.url), 'utf8')
const interfaceExamExperience = readFileSync(new URL('../../src/app/interface-exam-experience.css', import.meta.url), 'utf8')
const interfaceAdmin = readFileSync(new URL('../../src/app/interface-admin.css', import.meta.url), 'utf8')
const interfaceThemeIntegrity = readFileSync(new URL('../../src/app/interface-theme-integrity.css', import.meta.url), 'utf8')
const mainEntry = readFileSync(new URL('../../src/main.tsx', import.meta.url), 'utf8')
const examSimulator = readFileSync(new URL('../../src/app/ExamSimulator.tsx', import.meta.url), 'utf8')
const componentIndex = readFileSync(new URL('../../src/app/ui/index.ts', import.meta.url), 'utf8')
const iconRegistry = readFileSync(new URL('../../src/app/ui/Icon.tsx', import.meta.url), 'utf8')
const brandAssetHelper = readFileSync(new URL('../../src/app/ui/BrandAsset.tsx', import.meta.url), 'utf8')
const brandManifest = readFileSync(new URL('../../assets/brand/manifest.json', import.meta.url), 'utf8')
const uiDirectory = new URL('../../src/app/ui/', import.meta.url)
const uiSource = readdirSync(uiDirectory)
  .filter((file) => /\.(ts|tsx|css)$/.test(file) && !file.endsWith('.test.tsx'))
  .map((file) => readFileSync(new URL(file, uiDirectory), 'utf8'))
  .join('\n')
const migratedInterfaceLayers = [interfaceSystem, interfaceComponents, interfacePlanProgress, interfaceSubjectsCourse, interfaceLearnPractice, interfaceExamExperience, interfaceAdmin, interfaceThemeIntegrity]

function expectToken(name, value) {
  expect(brandTokens).toContain(`--${name}:`)
  if (value) expect(brandTokens).toContain(`--${name}: ${value};`)
}

describe('Revision Interface System governance', () => {
  it('keeps approved typography, spacing, controls, icon sizes and themes in the central token source', () => {
    expectToken('font-family-product')
    expectToken('type-h1-size', '36px')
    expectToken('type-h1-line', '44px')
    expectToken('type-h2-size', '28px')
    expectToken('type-body-size', '16px')
    expectToken('type-label-size', '13px')
    expectToken('type-button-size', '15px')
    expectToken('space-4', '16px')
    expectToken('radius-control', '14px')
    expectToken('radius-surface', '20px')
    expectToken('control-height-standard', '44px')
    expectToken('field-height-standard', '48px')
    expectToken('icon-size-standard', '24px')
    expectToken('icon-stroke-standard', '2px')

    expect(brandTokens).toContain('.planner-runtime[data-theme="dark"]')
    expect(brandTokens).toContain('--color-bg: #0f2024;')
    expect(brandTokens).toContain('@media (max-width: 620px)')
    expect(brandTokens).toContain('--type-h1-size: 30px;')
  })

  it('prevents migrated interface layers and reusable components from creating local colour palettes', () => {
    for (const css of migratedInterfaceLayers) {
      expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i)
      expect(css).not.toMatch(/\brgba?\s*\(/i)
    }
    expect(uiSource).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    expect(uiSource).not.toMatch(/\brgba?\s*\(/i)
  })

  it('requires migrated interface layers to consume central typography and theme roles', () => {
    expect(interfaceSystem).toContain('font-family: var(--font-family-product);')
    expect(interfaceSystem).toContain('font-size: var(--type-button-size);')
    expect(interfaceSystem).toContain('font-size: var(--type-body-size);')
    expect(interfaceComponents).toContain('font-size: var(--type-h1-size);')
    expect(interfaceComponents).toContain('stroke-width: var(--icon-stroke-standard);')
    expect(interfaceComponents).toContain('.planner-runtime[data-theme="dark"] .ui-brand-asset__image--dark')
    expect(interfacePlanProgress).toContain('font-size: var(--type-h1-size);')
    expect(interfaceSubjectsCourse).toContain('font-size: var(--type-h1-size);')
    expect(interfaceSubjectsCourse).toContain('background: var(--color-surface);')
    expect(interfaceSubjectsCourse).toContain('border-radius: var(--radius-feature);')
    expect(interfaceLearnPractice).toContain('font-family: var(--font-family-product);')
    expect(interfaceLearnPractice).toContain('font-size: var(--type-h2-size);')
    expect(interfaceLearnPractice).toContain('background: var(--color-surface);')
    expect(interfaceLearnPractice).toContain('border-radius: var(--radius-surface);')
    expect(interfaceExamExperience).toContain('font-family: var(--font-family-product);')
    expect(interfaceExamExperience).toContain('font-size: var(--type-h2-size);')
    expect(interfaceExamExperience).toContain('background: var(--color-surface);')
    expect(interfaceExamExperience).toContain('border-radius: var(--radius-surface);')
    expect(interfaceAdmin).toContain('font-family: var(--font-family-product);')
    expect(interfaceAdmin).toContain('font-size: var(--type-body-s-size);')
    expect(interfaceAdmin).toContain('background: var(--color-surface);')
    expect(interfaceAdmin).toContain('border-radius: var(--radius-compact);')

    for (const css of migratedInterfaceLayers) {
      expect(css).not.toMatch(/font-family:\s*Manrope/i)
    }
  })

  it('keeps B3 subject and course migration on semantic interface roles', () => {
    for (const selector of [
      '.planner-runtime .subject-card',
      '.planner-runtime .subject-rev',
      '.planner-runtime .course-card',
      '.planner-runtime .course-nav',
      '.planner-runtime .topic-list-grid',
    ]) {
      expect(interfaceSubjectsCourse).toContain(selector)
    }
    expect(interfaceSubjectsCourse).toContain('var(--color-action)')
    expect(interfaceSubjectsCourse).toContain('var(--color-action-text)')
    expect(interfaceSubjectsCourse).toContain('var(--focus-ring)')
    expect(interfaceSubjectsCourse).toContain('@media (max-width: 620px)')
    expect(interfaceSubjectsCourse).toContain('@media (prefers-reduced-motion: reduce)')
  })

  it('keeps B4 Learn and Practice focused-work patterns on semantic interface roles', () => {
    for (const selector of [
      '.planner-runtime .focused-workspace',
      '.planner-runtime .focused-workspace .mode-tabs',
      '.planner-runtime .focused-workspace .answer-panel',
      '.planner-runtime .focused-workspace .option-list label.correct',
      '.planner-runtime .focused-workspace .answer-label textarea',
    ]) {
      expect(interfaceLearnPractice).toContain(selector)
    }
    expect(interfaceLearnPractice).toContain('var(--color-action)')
    expect(interfaceLearnPractice).toContain('var(--status-success-fg)')
    expect(interfaceLearnPractice).toContain('var(--status-error-fg)')
    expect(interfaceLearnPractice).toContain('var(--status-info-fg)')
    expect(interfaceLearnPractice).toContain('var(--focus-ring)')
    expect(interfaceLearnPractice).toContain('@media (max-width: 620px)')
    expect(interfaceLearnPractice).toContain('@media (prefers-reduced-motion: reduce)')
  })

  it('keeps B5 Exam Prep and timed-session patterns on the governed Exam/Performance family', () => {
    for (const selector of [
      '.planner-runtime .exam-simulator',
      '.planner-runtime .exam-session-page',
      '.planner-runtime .exam-sticky-bar',
      '.planner-runtime .timer.warning',
      '.planner-runtime .exam-interruption',
      '.planner-runtime .exam-resume-button',
      '.planner-runtime .exam-confirm-actions .danger',
    ]) {
      expect(interfaceExamExperience).toContain(selector)
    }
    expect(interfaceExamExperience).toContain('var(--color-inverse-action)')
    expect(interfaceExamExperience).toContain('var(--status-error-fg)')
    expect(interfaceExamExperience).toContain('var(--overlay-backdrop)')
    expect(interfaceExamExperience).toContain('var(--focus-ring)')
    expect(interfaceExamExperience).toContain('@media (max-width: 620px)')
    expect(interfaceExamExperience).toContain('@media (prefers-reduced-motion: reduce)')

    expect(examSimulator).toContain("beginInterruption('paused')")
    expect(examSimulator).toContain("beginInterruption('stop-confirm')")
    expect(examSimulator).toContain('if (!started || finishedWriting || sessionOverlay) return')
    expect(examSimulator).toContain('Your exam is hidden while paused. The timer will continue only when you resume.')
    expect(examSimulator).toContain('Stopping will end this attempt and discard the answers from this unsaved exam.')
  })

  it('keeps B6 Admin on the governed dense operational grammar', () => {
    for (const selector of [
      '.planner-runtime .admin-operations',
      '.planner-runtime .admin-subnav',
      '.planner-runtime .admin-stat-card',
      '.planner-runtime .admin-table-wrap',
      '.planner-runtime .admin-table thead th',
      '.planner-runtime .content-operations-form input',
      '.planner-runtime .assurance-summary-card',
      '.planner-runtime .assurance-coverage-badge.uncovered',
    ]) {
      expect(interfaceAdmin).toContain(selector)
    }
    expect(interfaceAdmin).toContain('var(--control-height-compact)')
    expect(interfaceAdmin).toContain('var(--status-success-fg)')
    expect(interfaceAdmin).toContain('var(--status-warning-fg)')
    expect(interfaceAdmin).toContain('var(--status-error-fg)')
    expect(interfaceAdmin).toContain('var(--focus-ring)')
    expect(interfaceAdmin).toContain('position: sticky;')
    expect(interfaceAdmin).toContain('@media (max-width: 620px)')
    expect(interfaceAdmin).toContain('@media (prefers-reduced-motion: reduce)')
  })

  it('keeps remaining pre-B7 compatibility text and surfaces theme-safe', () => {
    expect(interfaceThemeIntegrity).toContain('.planner-runtime[data-theme="dark"]')
    expect(interfaceThemeIntegrity).toContain('color-scheme: dark;')
    expect(interfaceThemeIntegrity).toContain('.planner-runtime .learn-section ul')
    expect(interfaceThemeIntegrity).toContain('.planner-runtime .content-operations-form input')
    expect(interfaceThemeIntegrity).toContain('.planner-runtime .admin-table thead th')
    expect(interfaceThemeIntegrity).toContain('background: var(--color-surface);')
    expect(interfaceThemeIntegrity).toContain('color: var(--color-text);')
    expect(interfaceThemeIntegrity).toContain('color: var(--color-text-secondary);')
    expect(interfaceThemeIntegrity).toContain('var(--status-success-bg)')
    expect(interfaceThemeIntegrity).toContain('var(--status-warning-bg)')
    expect(interfaceThemeIntegrity).toContain('var(--status-error-bg)')
    expect(mainEntry.indexOf("./app/interface-theme-integrity.css")).toBeGreaterThan(mainEntry.indexOf("./app/interface-admin.css"))
  })

  it('publishes the required reusable component registry before B3', () => {
    for (const exportName of [
      'PageHeader', 'Surface', 'Button', 'IconButton', 'TextField', 'SelectField', 'Status',
      'EmptyState', 'LoadingState', 'ModalShell', 'DrawerShell', 'PopoverShell', 'Menu',
      'MenuItem', 'SegmentedControl', 'Icon', 'BrandAsset',
    ]) {
      expect(componentIndex).toContain(exportName)
    }
  })

  it('uses a controlled currentColor rounded-line icon source and keeps the Living E out of the generic icon registry', () => {
    expect(iconRegistry).toContain('stroke="currentColor"')
    expect(iconRegistry).toContain("strokeLinecap=\"round\"")
    expect(iconRegistry).toContain("strokeLinejoin=\"round\"")
    expect(iconRegistry).toContain("className={classNames('ui-icon', `ui-icon--${size}`, className)}")
    expect(iconRegistry.toLowerCase()).not.toContain('living-e')
  })

  it('binds runtime identity helpers to assets that are registered in the canonical brand manifest', () => {
    for (const asset of [
      'revision-wordmark-primary-light.svg',
      'revision-wordmark-primary-dark.svg',
      'revision-rev-living-e-resting-light.svg',
      'revision-rev-living-e-resting-dark.svg',
      'revision-rev-living-e-nav-light.svg',
      'revision-rev-living-e-nav-dark.svg',
    ]) {
      expect(brandAssetHelper).toContain(asset)
      expect(brandManifest).toContain(asset)
    }
  })
})