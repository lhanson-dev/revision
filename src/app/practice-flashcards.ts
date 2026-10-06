/**
 * Flashcard decks for the Practice warm-up (v2.2, PR 4). Plain rules, not a model's choice.
 *
 * After each card the student says No, Partly or Yes (saved as flashcard evidence, rating 0, 1 or 2). The next deck is
 * ordered with the No and Partly cards first, so the ones they were not sure of come up before the ones they knew.
 */
import type { LearningEvidence } from '../engine/evidence/evidence'

export type FlashRating = 0 | 1 | 2

export const FLASHCARD_DECK_SIZE = 12

export const flashRatingChoices: ReadonlyArray<{ rating: FlashRating; label: 'No' | 'Partly' | 'Yes' }> = [
  { rating: 0, label: 'No' },
  { rating: 1, label: 'Partly' },
  { rating: 2, label: 'Yes' },
]

/** The student's latest rating for each card, from the evidence they have saved. */
export function lastFlashcardRatings(evidence: ReadonlyArray<Pick<LearningEvidence, 'source' | 'contentId' | 'occurredAt'> & { rating?: number }>): Record<string, FlashRating> {
  const latest: Record<string, { at: string; rating: FlashRating }> = {}
  evidence.forEach((item) => {
    if (item.source !== 'flashcard' || (item.rating !== 0 && item.rating !== 1 && item.rating !== 2)) return
    const current = latest[item.contentId]
    if (!current || item.occurredAt >= current.at) latest[item.contentId] = { at: item.occurredAt, rating: item.rating }
  })
  return Object.fromEntries(Object.entries(latest).map(([id, entry]) => [id, entry.rating]))
}

const groupOf = (rating: FlashRating | undefined) => (rating === 0 ? 0 : rating === 1 ? 1 : rating === undefined ? 2 : 3)

/** No first, then Partly, then cards not seen yet, then Yes. Order inside each group stays as it was. */
export function orderDeck<C extends { id: string }>(cards: readonly C[], ratings: Readonly<Record<string, FlashRating>>, size: number = FLASHCARD_DECK_SIZE): C[] {
  return cards
    .map((card, index) => ({ card, index, group: groupOf(ratings[card.id]) }))
    .sort((left, right) => left.group - right.group || left.index - right.index)
    .slice(0, Math.max(0, size))
    .map((entry) => entry.card)
}

export type DeckSession = {
  ids: string[]
  /** The card on screen. Equal to ids.length when the deck is done. */
  index: number
  ratings: Array<{ id: string; rating: FlashRating }>
}

export function startDeck<C extends { id: string }>(cards: readonly C[], ratings: Readonly<Record<string, FlashRating>>): DeckSession {
  return { ids: orderDeck(cards, ratings).map((card) => card.id), index: 0, ratings: [] }
}

export function rateCurrentCard(deck: DeckSession, rating: FlashRating): DeckSession {
  if (deck.index >= deck.ids.length) return deck
  return { ...deck, index: deck.index + 1, ratings: [...deck.ratings, { id: deck.ids[deck.index], rating }] }
}

export function isDeckDone(deck: DeckSession): boolean {
  return deck.index >= deck.ids.length
}

export function tallyDeck(deck: DeckSession): { yes: number; partly: number; no: number } {
  return {
    yes: deck.ratings.filter((entry) => entry.rating === 2).length,
    partly: deck.ratings.filter((entry) => entry.rating === 1).length,
    no: deck.ratings.filter((entry) => entry.rating === 0).length,
  }
}

/** The ratings a deck has just given, laid over what was known before, for ordering the next deck. */
export function ratingsAfterDeck(before: Readonly<Record<string, FlashRating>>, deck: DeckSession): Record<string, FlashRating> {
  const merged: Record<string, FlashRating> = { ...before }
  deck.ratings.forEach((entry) => { merged[entry.id] = entry.rating })
  return merged
}
