import { describe, expect, it } from 'vitest'
import {
  FLASHCARD_DECK_SIZE,
  isDeckDone,
  lastFlashcardRatings,
  orderDeck,
  rateCurrentCard,
  ratingsAfterDeck,
  startDeck,
  tallyDeck,
} from './practice-flashcards'

const cards = ['a', 'b', 'c', 'd', 'e'].map((id) => ({ id }))

describe('flashcard deck order', () => {
  it('puts No first, then Partly, then cards not seen yet, then Yes, keeping the order inside each group', () => {
    const ordered = orderDeck(cards, { a: 2, b: 1, d: 0, e: 2 })
    expect(ordered.map((card) => card.id)).toEqual(['d', 'b', 'c', 'a', 'e'])
  })

  it('keeps the original order when nothing has been rated', () => {
    expect(orderDeck(cards, {}).map((card) => card.id)).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('takes only a round of cards at a time, the ones to see first', () => {
    const many = Array.from({ length: 30 }, (_, index) => ({ id: `c${index}` }))
    const ordered = orderDeck(many, { c29: 0, c28: 1 })
    expect(ordered).toHaveLength(FLASHCARD_DECK_SIZE)
    expect(ordered.slice(0, 2).map((card) => card.id)).toEqual(['c29', 'c28'])
  })
})

describe('the student’s latest rating for each card', () => {
  it('uses the most recent flashcard evidence and ignores everything else', () => {
    const ratings = lastFlashcardRatings([
      { source: 'flashcard', contentId: 'a', occurredAt: '2026-10-01T10:00:00.000Z', rating: 0 },
      { source: 'flashcard', contentId: 'a', occurredAt: '2026-10-03T10:00:00.000Z', rating: 2 },
      { source: 'multiple_choice', contentId: 'b', occurredAt: '2026-10-03T10:00:00.000Z' },
      { source: 'flashcard', contentId: 'c', occurredAt: '2026-10-02T10:00:00.000Z', rating: 1 },
    ])
    expect(ratings).toEqual({ a: 2, c: 1 })
  })
})

describe('going through a deck', () => {
  it('moves one card on for each rating, and tallies No, Partly and Yes', () => {
    let deck = startDeck(cards, {})
    expect(isDeckDone(deck)).toBe(false)
    ;([2, 1, 0, 2, 2] as const).forEach((rating) => { deck = rateCurrentCard(deck, rating) })
    expect(isDeckDone(deck)).toBe(true)
    expect(tallyDeck(deck)).toEqual({ yes: 3, partly: 1, no: 1 })
    expect(rateCurrentCard(deck, 2)).toBe(deck)
  })

  it('orders the next deck with what this deck showed: the No and Partly cards come first', () => {
    let deck = startDeck(cards, {})
    ;([2, 0, 2, 1, 2] as const).forEach((rating) => { deck = rateCurrentCard(deck, rating) })
    const next = startDeck(cards, ratingsAfterDeck({}, deck))
    expect(next.ids).toEqual(['b', 'd', 'a', 'c', 'e'])
  })
})
