import { estimatedMinutes as practiceEstimatedMinutes } from './practice-start'

/** Content-bounded focused work, not a measured study time or an optimal pedagogic dose. */
export type FocusedActivityKind = 'quick-check' | 'flashcards'
const LIMITS: Record<FocusedActivityKind, number> = { 'quick-check': 12, flashcards: 8 }

export function focusedActivityCount(kind: FocusedActivityKind, available: number): number {
  if (!Number.isFinite(available)) return 0
  return Math.min(LIMITS[kind], Math.max(0, Math.floor(available)))
}

export function focusedActivityMinutes(kind: FocusedActivityKind, available: number): number {
  const count = focusedActivityCount(kind, available)
  if (count === 0) return 0
  return kind === 'quick-check' ? practiceEstimatedMinutes(count) : count * 2
}
