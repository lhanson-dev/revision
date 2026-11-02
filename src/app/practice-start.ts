/**
 * Plain rules for the Practice start screen (v2.2, PR 1). Nothing here is a model's choice.
 * The wording and numbers come from the Practice redesign brief: three session lengths with a time
 * estimate, three question types of which at least one stays on.
 */
export const PRACTICE_LENGTHS = [5, 10, 15] as const
export type PracticeLength = (typeof PRACTICE_LENGTHS)[number]

export type PracticeQuestionType = 'multiple-choice' | 'calculation' | 'written'

export const practiceQuestionTypeLabels: Record<PracticeQuestionType, string> = {
  'multiple-choice': 'Multiple choice',
  calculation: 'Calculations',
  written: 'Written answers',
}

/**
 * The legacy "Data drill" is an unmarked exercise with a model answer, not
 * necessarily a numerical task. Name the warm-up from the actual supplied
 * formula/exercise counts rather than advertising non-existent formulas.
 */
export function guidedExerciseWarmup(formulaCount: number, exerciseCount: number): { name: string; meta: string } | null {
  if (formulaCount <= 0 && exerciseCount <= 0) return null
  const name = formulaCount > 0 && exerciseCount > 0
    ? 'Formulas and guided exercises'
    : formulaCount > 0 ? 'Formulas' : 'Guided exercises'
  const details = [
    ...(formulaCount > 0 ? [`${formulaCount} ${formulaCount === 1 ? 'formula' : 'formulas'}`] : []),
    ...(exerciseCount > 0 ? [`${exerciseCount} ${exerciseCount === 1 ? 'exercise' : 'exercises'} · model answers`] : []),
  ]
  return { name, meta: details.join(' · ') }
}

const knownMinutes: Record<PracticeLength, number> = { 5: 8, 10: 15, 15: 25 }

/** "About 8 min" for 5 questions, 15 for 10, 25 for 15. Other counts (a short topic) use the same pace. */
export function estimatedMinutes(questionCount: number): number {
  if (questionCount in knownMinutes) return knownMinutes[questionCount as PracticeLength]
  return Math.max(1, Math.round(questionCount * 1.6))
}

/** A session never promises more questions than the topic has. */
export function sessionQuestionCount(chosen: PracticeLength, available: number): number {
  return Math.max(0, Math.min(chosen, available))
}

/** Toggles a question type. The last one switched on cannot be switched off. */
export function toggleQuestionType(
  selected: readonly PracticeQuestionType[],
  type: PracticeQuestionType,
): PracticeQuestionType[] {
  if (!selected.includes(type)) return [...selected, type]
  if (selected.length === 1) return [...selected]
  return selected.filter((item) => item !== type)
}

/** Keeps only the types that have questions, and falls back to all of them if none of the picks survive. */
export function usableQuestionTypes(
  selected: readonly PracticeQuestionType[],
  available: readonly PracticeQuestionType[],
): PracticeQuestionType[] {
  const usable = selected.filter((type) => available.includes(type))
  return usable.length > 0 ? usable : [...available]
}

/**
 * Only offer a topic-relevant case where the content author declared topic IDs.
 * Preserve first-case fallback for older packs with no relevance tags at all.
 * An explicitly tagged pack without a match must not advertise a random case.
 */
export function caseStudyForPractice<T extends { id: string; topicIds?: readonly string[] }>(
  studies: readonly T[],
  topicId: string,
): T | null {
  if (studies.length === 0) return null
  if (studies.some(study => study.topicIds && study.topicIds.length > 0)) {
    return studies.find(study => study.topicIds?.includes(topicId)) ?? null
  }
  return studies[0]
}

const DAY_MS = 86_400_000

/** "Last practised 3 days ago". Null when the student has never practised the topic. */
export function lastPractisedLabel(lastPractisedAt: string | null | undefined, now: Date = new Date()): string | null {
  if (!lastPractisedAt) return null
  const then = new Date(lastPractisedAt)
  if (Number.isNaN(then.getTime())) return null
  const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const days = Math.max(0, Math.round((startOfDay(now) - startOfDay(then)) / DAY_MS))
  if (days === 0) return 'Last practised today'
  if (days === 1) return 'Last practised yesterday'
  if (days < 14) return `Last practised ${days} days ago`
  const weeks = Math.floor(days / 7)
  if (days < 60) return `Last practised ${weeks} weeks ago`
  return `Last practised ${Math.floor(days / 30)} months ago`
}
