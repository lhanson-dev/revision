import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const accountModal = readFileSync(new URL('../../src/app/AccountModal.tsx', import.meta.url), 'utf8')
const plannerHome = readFileSync(new URL('../../src/app/PlannerHomeScreen.tsx', import.meta.url), 'utf8')
const compactRev = readFileSync(new URL('../../src/app/RevCompactWordmark.tsx', import.meta.url), 'utf8')
const examSimulator = readFileSync(new URL('../../src/app/ExamSimulator.tsx', import.meta.url), 'utf8')
const iconRegistry = readFileSync(new URL('../../src/app/ui/Icon.tsx', import.meta.url), 'utf8')

describe('B7 identity and recurring glyph ownership', () => {
  it('keeps Account recurring section icons in the shared Icon registry', () => {
    expect(accountModal).not.toContain('function AccountSectionIcon(')
    expect(accountModal).not.toContain('<svg')
    expect(accountModal).toContain('<Icon name="user" className="runtime-account-modal-icon" />')
    expect(accountModal).toContain('<Icon name="settings" className="runtime-account-modal-icon" />')
  })

  it('uses canonical REV presence, compact REV identity and controlled Home action glyphs', () => {
    expect(plannerHome).not.toContain('>↑<')
    expect(plannerHome).not.toContain('✦')
    expect(plannerHome).not.toContain('↗')
    expect(plannerHome).not.toContain('>→<')
    expect(plannerHome).not.toContain('>›<')
    // FI-023 Home v3 replaces the old pill/card with one shared Living E, shared
    // PoweredByRev identity and a full-width, genuine contextual Ask REV field.
    expect(plannerHome).toContain("import { PoweredByRev } from './RevCompactWordmark'")
    expect(plannerHome).toContain('<PoweredByRev />')
    expect(plannerHome).toContain('<RevMark state={askFocused || askValue')
    expect(plannerHome).toContain('size="hero"')
    expect(plannerHome).not.toContain('<RevPresence')
    expect(plannerHome).not.toContain('<svg')
    expect(plannerHome).not.toContain('className="rev-compact-wordmark-e"')
    expect(plannerHome).not.toContain('<RevSuggestionCard')
    expect(plannerHome).toContain('<Icon name="arrow-right" size="inline" />')

    expect(compactRev).toContain('export function RevCompactWordmark')
    expect(compactRev).toContain('rev-compact-wordmark-e')
    expect(compactRev).not.toContain('<svg')
  })

  it('uses the controlled play glyph for exam resume', () => {
    expect(examSimulator).not.toContain('▶')
    expect(examSimulator).toContain('<Icon name="play" size="compact" />')
  })

  it('registers the additional recurring action glyphs centrally', () => {
    for (const iconName of ['arrow-up', 'play']) {
      expect(iconRegistry).toContain(`| '${iconName}'`)
    }
  })
})