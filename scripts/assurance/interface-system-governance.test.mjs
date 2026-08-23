import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')
const brandTokens = read('../../src/app/brand-tokens.css')
const interfaceSystem = read('../../src/app/interface-system.css')
const interfaceComponents = read('../../src/app/ui/ui-components.css')
const interfacePlanProgress = read('../../src/app/interface-plan-progress.css')
const interfaceSubjectsCourse = read('../../src/app/interface-subjects-course.css')
const interfaceLearnPractice = read('../../src/app/interface-learn-practice.css')
const interfaceExamExperience = read('../../src/app/interface-exam-experience.css')
const interfaceAdmin = read('../../src/app/interface-admin.css')
const mobileNavigation = read('../../src/app/mobile-navigation.css')
const mainEntry = read('../../src/main.tsx')
const examSimulator = read('../../src/app/ExamSimulator.tsx')
const componentIndex = read('../../src/app/ui/index.ts')
const iconRegistry = read('../../src/app/ui/Icon.tsx')
const brandAssetHelper = read('../../src/app/ui/BrandAsset.tsx')
const brandManifest = read('../../assets/brand/manifest.json')
const retiredThemeBridge = new URL('../../src/app/interface-theme-integrity.css', import.meta.url)
const uiDirectory = new URL('../../src/app/ui/', import.meta.url)
const uiSource = readdirSync(uiDirectory)
  .filter((file) => /\.(ts|tsx|css)$/.test(file) && !file.endsWith('.test.tsx'))
  .map((file) => readFileSync(new URL(file, uiDirectory), 'utf8'))
  .join('\n')
const migratedLayers = [interfaceSystem, interfaceComponents, interfacePlanProgress, interfaceSubjectsCourse, interfaceLearnPractice, interfaceExamExperience, interfaceAdmin]

function expectToken(name, value) {
  expect(brandTokens).toContain(`--${name}:`)
  if (value) expect(brandTokens).toContain(`--${name}: ${value};`)
}

describe('Revision Interface System governance', () => {
  it('keeps approved foundations in the central token source', () => {
    for (const [name, value] of [
      ['type-h1-size', '36px'], ['type-h2-size', '28px'], ['type-body-size', '16px'],
      ['space-4', '16px'], ['radius-control', '14px'], ['radius-surface', '20px'],
      ['control-height-standard', '44px'], ['field-height-standard', '48px'],
      ['icon-size-standard', '24px'], ['icon-stroke-standard', '2px'],
    ]) expectToken(name, value)
    expectToken('font-family-product')
    expect(brandTokens).toContain('.planner-runtime[data-theme="dark"]')
    expect(brandTokens).toContain('--color-bg: #0f2024;')
  })

  it('prevents semantic Interface System layers and reusable components from creating local colour palettes', () => {
    for (const css of migratedLayers) {
      expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i)
      expect(css).not.toMatch(/\brgba?\s*\(/i)
      expect(css).not.toMatch(/font-family:\s*Manrope/i)
    }
    expect(uiSource).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    expect(uiSource).not.toMatch(/\brgba?\s*\(/i)
  })

  it('keeps migrated learner and Admin families on semantic roles', () => {
    expect(interfaceSystem).toContain('font-family: var(--font-family-product);')
    expect(interfaceComponents).toContain('.ui-field--textarea')
    expect(interfacePlanProgress).toContain('font-size: var(--type-h1-size);')
    expect(interfaceSubjectsCourse).toContain('background: var(--color-surface);')
    expect(interfaceLearnPractice).toContain('var(--status-success-fg)')
    expect(interfaceLearnPractice).toContain('var(--status-error-fg)')
    expect(interfaceExamExperience).toContain('var(--overlay-backdrop)')
    expect(interfaceAdmin).toContain('var(--control-height-compact)')
    expect(interfaceAdmin).toContain('position: sticky;')
  })

  it('keeps Learn as a reading workspace rather than nested bordered cards', () => {
    expect(interfaceLearnPractice).toContain('.planner-runtime .focused-learn .learn-section')
    expect(interfaceLearnPractice).toContain('background: transparent;')
    expect(interfaceLearnPractice).toContain('.planner-runtime .focused-learn .learn-section + .learn-section')
    expect(interfaceLearnPractice).toContain('border-top: 1px solid var(--color-border);')
    expect(interfaceLearnPractice).toContain('.planner-runtime .focused-practice .recommendation-card')
  })

  it('keeps timed exam interruption and responsive tutor-dock ownership explicit', () => {
    expect(interfaceExamExperience).toContain('.planner-runtime .exam-session-page')
    expect(interfaceExamExperience).toContain('.planner-runtime .exam-interruption')
    expect(examSimulator).toContain("beginInterruption('paused')")
    expect(examSimulator).toContain("beginInterruption('stop-confirm')")
    expect(mobileNavigation).toContain('.planner-runtime:has(.exam-session-page) > .runtime-mobile-ask-rev-dock')
  })

  it('retires the pre-B7 catch-all theme bridge', () => {
    expect(mainEntry).not.toContain('interface-theme-integrity.css')
    expect(existsSync(retiredThemeBridge)).toBe(false)
  })

  it('publishes the governed reusable component registry', () => {
    for (const exportName of [
      'PageHeader', 'Surface', 'Button', 'IconButton', 'TextField', 'TextAreaField', 'SelectField',
      'Status', 'EmptyState', 'LoadingState', 'ModalShell', 'DrawerShell', 'PopoverShell',
      'Menu', 'MenuItem', 'SegmentedControl', 'Icon', 'BrandAsset',
    ]) expect(componentIndex).toContain(exportName)
  })

  it('uses one controlled rounded-line icon registry and canonical brand assets', () => {
    expect(iconRegistry).toContain('stroke="currentColor"')
    expect(iconRegistry).toContain('strokeLinecap="round"')
    expect(iconRegistry).toContain('strokeLinejoin="round"')
    expect(iconRegistry.toLowerCase()).not.toContain('living-e')
    for (const asset of [
      'revision-wordmark-primary-light.svg', 'revision-wordmark-primary-dark.svg',
      'revision-rev-living-e-resting-light.svg', 'revision-rev-living-e-resting-dark.svg',
      'revision-rev-living-e-nav-light.svg', 'revision-rev-living-e-nav-dark.svg',
    ]) {
      expect(brandAssetHelper).toContain(asset)
      expect(brandManifest).toContain(asset)
    }
  })
})
