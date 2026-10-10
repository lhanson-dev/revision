import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { RevSuggestionCard } from './RevSuggestionCard'

describe('REV suggestion card', () => {
  it('shows the eyebrow, the reason and both actions', () => {
    const markup = renderToStaticMarkup(
      <RevSuggestionCard
        eyebrow="REV suggests"
        reason="Psychology is strong (78%), but you haven't touched it in 9 days."
        primaryAction={{ label: 'Add to Thursday', onClick: () => undefined }}
        secondaryAction={{ label: 'Not now', onClick: () => undefined }}
      />,
    )
    expect(markup).toContain('REV suggests')
    expect(markup).toContain('touched it in 9 days')
    expect(markup).toContain('>Add to Thursday<')
    expect(markup).toContain('>Not now<')
    expect(markup).not.toContain('rev-suggestion-card__steps')
  })

  it('renders the session steps with done, current and upcoming states', () => {
    const markup = renderToStaticMarkup(
      <RevSuggestionCard
        eyebrow="REV suggests · 45 min"
        title="Nail break-even before Friday's quiz"
        reason="Why: you scored 38% on break-even last week, and it's on Friday's quiz."
        steps={[
          { id: 'learn', label: 'Learn', state: 'done' },
          { id: 'practice', label: 'Practice', meta: '15 min', state: 'current' },
          { id: 'exam', label: 'Exam Prep', state: 'upcoming' },
        ]}
      />,
    )
    expect(markup).toContain('data-state="done"')
    expect(markup).toContain('data-state="current"')
    expect(markup).toContain('aria-current="step"')
    expect(markup).toContain('data-state="upcoming"')
    expect(markup).toContain('>15 min<')
    expect(markup).toContain('>Done<')
    expect(markup).toContain('ui-icon--inline')
    expect(markup).toContain('<h3')
    expect(markup).not.toContain('rev-suggestion-card__actions')
  })
})

// This is the live Home and Course Overview shared component; do not restore v2 role aliases.
describe('REV recommendation appearance contract', () => {
  it('uses canonical inverse, action and shape roles without direct --rv-* dependencies', () => {
    const styles = readFileSync(new URL('./rev-suggestion-card.css', import.meta.url), 'utf8')
    expect(styles).not.toMatch(/var\(--rv-/)
    expect(styles).toContain('var(--color-inverse-action)')
    expect(styles).toContain('var(--color-action)')
    expect(styles).toContain('var(--radius-feature)')
    expect(styles).toContain('var(--radius-surface)')
  })
})
