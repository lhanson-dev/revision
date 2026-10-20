import { describe, expect, it } from 'vitest'
import { focusedActivityCount, focusedActivityMinutes } from './focused-activity-dose'

describe('REV focused work and available content', () => {
  it('does not promise twenty minutes for one question', () => {
    expect(focusedActivityCount('quick-check', 1)).toBe(1)
    expect(focusedActivityMinutes('quick-check', 1)).toBe(2)
    expect(focusedActivityMinutes('quick-check', 3)).toBe(5)
    expect(focusedActivityCount('quick-check', 100)).toBe(12)
    expect(focusedActivityMinutes('quick-check', 100)).toBe(19)
  })
  it('does not promise fifteen minutes for one flashcard', () => {
    expect(focusedActivityMinutes('flashcards', 1)).toBe(2)
    expect(focusedActivityCount('flashcards', 100)).toBe(8)
    expect(focusedActivityMinutes('flashcards', 100)).toBe(16)
  })
  it('returns no workload for missing or invalid assets', () => {
    for (const kind of ['quick-check', 'flashcards'] as const) {
      expect(focusedActivityMinutes(kind, 0)).toBe(0)
      expect(focusedActivityCount(kind, Number.NaN)).toBe(0)
      expect(focusedActivityCount(kind, -10)).toBe(0)
    }
  })
})
