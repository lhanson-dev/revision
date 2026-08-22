import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const brandTokens = readFileSync(new URL('../../src/app/brand-tokens.css', import.meta.url), 'utf8')
const interfaceSystem = readFileSync(new URL('../../src/app/interface-system.css', import.meta.url), 'utf8')
const interfacePlanProgress = readFileSync(new URL('../../src/app/interface-plan-progress.css', import.meta.url), 'utf8')
const migratedInterfaceLayers = [interfaceSystem, interfacePlanProgress]

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

    expect(brandTokens).toContain('.planner-runtime[data-theme="dark"]')
    expect(brandTokens).toContain('--color-bg: #0f2024;')
    expect(brandTokens).toContain('@media (max-width: 620px)')
    expect(brandTokens).toContain('--type-h1-size: 30px;')
  })

  it('prevents migrated interface layers from creating page-local colour palettes', () => {
    for (const css of migratedInterfaceLayers) {
      expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i)
      expect(css).not.toMatch(/\brgba?\s*\(/i)
    }
  })

  it('requires migrated interface layers to consume the central typography family and role tokens', () => {
    expect(interfaceSystem).toContain('font-family: var(--font-family-product);')
    expect(interfaceSystem).toContain('font-size: var(--type-button-size);')
    expect(interfaceSystem).toContain('font-size: var(--type-body-size);')
    expect(interfacePlanProgress).toContain('font-size: var(--type-h1-size);')
    expect(interfacePlanProgress).toContain('font-size: var(--type-h2-size);')
    expect(interfacePlanProgress).toContain('font-size: var(--type-label-size);')
    expect(interfacePlanProgress).toContain('font-size: var(--type-body-size);')

    for (const css of migratedInterfaceLayers) {
      expect(css).not.toMatch(/font-family:\s*Manrope/i)
    }
  })
})
