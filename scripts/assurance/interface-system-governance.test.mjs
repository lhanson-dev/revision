import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const brandTokens = readFileSync(new URL('../../src/app/brand-tokens.css', import.meta.url), 'utf8')
const interfaceSystem = readFileSync(new URL('../../src/app/interface-system.css', import.meta.url), 'utf8')
const interfaceComponents = readFileSync(new URL('../../src/app/ui/ui-components.css', import.meta.url), 'utf8')
const interfacePlanProgress = readFileSync(new URL('../../src/app/interface-plan-progress.css', import.meta.url), 'utf8')
const componentIndex = readFileSync(new URL('../../src/app/ui/index.ts', import.meta.url), 'utf8')
const iconRegistry = readFileSync(new URL('../../src/app/ui/Icon.tsx', import.meta.url), 'utf8')
const brandAssetHelper = readFileSync(new URL('../../src/app/ui/BrandAsset.tsx', import.meta.url), 'utf8')
const brandManifest = readFileSync(new URL('../../assets/brand/manifest.json', import.meta.url), 'utf8')
const uiDirectory = new URL('../../src/app/ui/', import.meta.url)
const uiSource = readdirSync(uiDirectory)
  .filter((file) => /\.(ts|tsx|css)$/.test(file) && !file.endsWith('.test.tsx'))
  .map((file) => readFileSync(new URL(file, uiDirectory), 'utf8'))
  .join('\n')
const migratedInterfaceLayers = [interfaceSystem, interfaceComponents, interfacePlanProgress]

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
    expectToken('icon-stroke-standard', '2')

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

    for (const css of migratedInterfaceLayers) {
      expect(css).not.toMatch(/font-family:\s*Manrope/i)
    }
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
