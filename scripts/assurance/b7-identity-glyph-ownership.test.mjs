import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const accountModal = readFileSync(new URL('../../src/app/AccountModal.tsx', import.meta.url), 'utf8')
const plannerHome = readFileSync(new URL('../../src/app/PlannerHomeScreen.tsx', import.meta.url), 'utf8')
const examSimulator = readFileSync(new URL('../../src/app/ExamSimulator.tsx', import.meta.url), 'utf8')
const iconRegistry = readFileSync(new URL('../../src/app/ui/Icon.tsx', import.meta.url), 'utf8')

describe('B7 identity and recurring glyph ownership', () => {
  it('keeps Account recurring section icons in the shared Icon registry', () => {
    expect(accountModal).not.toContain('function AccountSectionIcon(')
    expect(accountModal).not.toContain('<svg')
    expect(accountModal).toContain('<Icon name="user" className="runtime-account-modal-icon" />')
    expect(accountModal).toContain('<Icon name="settings" className="runtime-account-modal-icon" />')
  })

  it('uses canonical REV presence and controlled Home action glyphs', () => {
    expect(plannerHome).not.toContain('>↑<')
    expect(plannerHome).not.toContain('✦')
    expect(plannerHome).not.toContain('↗')
    expect(plannerHome).not.toContain('>→<')
    expect(plannerHome).not.toContain('>›<')
    expect(plannerHome).toContain("<RevPresence state={loading ? 'thinking' : revState} size=\"hero\" />")
    expect(plannerHome).not.toContain('<RevPresence size="compact"')
    expect(plannerHome).not.toContain('<RevPresence size="nav"')
    expect(plannerHome).toContain('<Icon name="arrow-up" size="compact" />')
    expect(plannerHome).toContain('<Icon name="arrow-right" size="inline" />')
    expect(plannerHome).toContain('<Icon name="chevron-right" size="compact" />')
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