import type { Flashcard, MultipleChoiceQuestion, TopicId } from '../../../content/schema'
import type { LearningContentAdapter } from '../content/content-adapter'

type SelectionOptions = {
  seed: string
  limit?: number
  topicId?: TopicId
}

function hashString(input: string): number {
  let hash = 2166136261
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function seededUnit(seed: string, itemId: string): number {
  return hashString(`${seed}:${itemId}`) / 0xffffffff
}

function deterministicOrder<T extends { id: string }>(items: readonly T[], seed: string): T[] {
  return [...items].sort((left, right) => {
    const scoreDifference = seededUnit(seed, left.id) - seededUnit(seed, right.id)
    return scoreDifference || left.id.localeCompare(right.id)
  })
}

function applyLimit<T>(items: T[], limit?: number): T[] {
  if (limit === undefined) return items
  if (!Number.isInteger(limit) || limit < 0) throw new Error('limit must be a non-negative integer')
  return items.slice(0, limit)
}

export function selectFlashcards(
  adapter: LearningContentAdapter,
  options: SelectionOptions,
): Flashcard[] {
  const pool = adapter.listFlashcards(options.topicId)
  return applyLimit(deterministicOrder(pool, options.seed), options.limit)
}

export function selectQuestions(
  adapter: LearningContentAdapter,
  options: SelectionOptions,
): MultipleChoiceQuestion[] {
  const pool = adapter.listQuestions(options.topicId)
  return applyLimit(deterministicOrder(pool, options.seed), options.limit)
}

export function selectBalancedQuestions(
  adapter: LearningContentAdapter,
  options: Omit<SelectionOptions, 'topicId'> & { perTopic: number },
): MultipleChoiceQuestion[] {
  if (!Number.isInteger(options.perTopic) || options.perTopic < 0) {
    throw new Error('perTopic must be a non-negative integer')
  }

  return adapter.listTopics().flatMap((topic) =>
    selectQuestions(adapter, {
      seed: `${options.seed}:${topic.id}`,
      topicId: topic.id,
      limit: options.perTopic,
    }),
  )
}
