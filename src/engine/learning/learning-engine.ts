import type { TopicId } from '../../../content/schema'
import type { LearningContentAdapter } from '../content/content-adapter'
import { selectBalancedQuestions, selectFlashcards, selectQuestions } from './selection'

export function createLearningEngine(adapter: LearningContentAdapter) {
  return {
    content: adapter,
    recall: {
      select: (options: { seed: string; limit?: number; topicId?: TopicId }) =>
        selectFlashcards(adapter, options),
    },
    assessment: {
      select: (options: { seed: string; limit?: number; topicId?: TopicId }) =>
        selectQuestions(adapter, options),
      diagnostic: (options: { seed: string; perTopic: number }) =>
        selectBalancedQuestions(adapter, options),
    },
  }
}

export type LearningEngine = ReturnType<typeof createLearningEngine>
