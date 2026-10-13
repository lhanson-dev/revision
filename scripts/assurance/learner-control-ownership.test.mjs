import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '../..')
const read = path => readFileSync(resolve(root, path), 'utf8')
const entry = read('src/main.tsx')
const styles = [...entry.matchAll(/import '\.\/app\/(.+\.css)'/g)].map(m => `src/app/${m[1]}`)
const ordinaryOwners = [
  'auth-wide-action', 'auth-provider-button', 'home-setup-primary',
  'home-focused-back', 'practice-start__button', 'practice-rev-card__button',
  'practice-rev-card__actions', 'learn-pill',
  'practice-summary__read', 'ui-quick-check__retry',
  'rev-suggestion-card__primary', 'rev-suggestion-card__secondary', 'rev-suggestion-card__plan',
]

describe('learner ordinary-control ownership', () => {
  it('prevents imported feature CSS from owning ordinary-action shape, type or target geometry', () => {
    const forks = []
    for (const file of styles.filter(p => !p.endsWith('/interface-system.css'))) {
      const css = read(file).replace(/\/\*[\s\S]*?\*\//g, '')
      for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        if (/\.ui-button\b/.test(selector) && /\bborder-radius\s*:/.test(body) && !selector.includes('.ui-segmented-control')) forks.push(`${file}: ${selector.trim()}`)
        if (!ordinaryOwners.some(name => selector.includes(`.${name}`))) continue
        // Padding/colour in tertiary reading links can be contextual; common
        // radius, type, target and hierarchy still belong to the shared owner.
        if (/\b(?:border-radius|font(?:-family|-size|-weight)?|min-height)\s*:/.test(body)) forks.push(`${file}: ${selector.trim()}`)
      }
    }
    expect(forks).toEqual([])
  })

  it('retires the unused competing Course Overview family without a replacement masking layer', () => {
    expect(existsSync(resolve(root, 'src/app/course-overview-rev-feature.css'))).toBe(false)
    expect(entry).not.toContain('course-overview-rev-feature.css')
    expect(entry).not.toContain('interface-theme-integrity.css')
  })

  it('keeps ordinary auth, recommendation, retry and exam actions on the real Button implementation', () => {
    for (const file of ['src/app/AuthGate.tsx', 'src/app/ExamSimulator.tsx', 'src/app/ui/RevSuggestionCard.tsx', 'src/app/ui/QuickCheck.tsx', 'src/app/ui/learn/WorkedExample.tsx', 'src/app/ui/learn/Quantitative.tsx']) {
      const source = read(file)
      expect(source).not.toMatch(/<button[^>]+className="(?:primary|secondary|danger|rev-suggestion-card__(?:primary|secondary|plan)|ui-quick-check__retry)\b/)
      expect(source).toContain('<Button')
    }
    // Specialist answer-choice buttons keep their own interaction anatomy.
    expect(read('src/app/ui/QuickCheck.tsx')).toContain('ui-answer-option')
    expect(read('src/app/ExamSimulator.tsx')).toContain('question-nav')
  })
})
