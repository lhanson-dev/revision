import type { TopicKnowledgeBand } from '../engine/knowledge/topic-knowledge'
import type { ModuleLearningState } from './catalogue-model'
import type { LearningStatus } from './ui'

/**
 * Engine topic knowledge band to learner-facing status label.
 * Founder decision 1 Oct 2026: good = Got it, medium = Nearly there, low = Needs work,
 * not enough evidence = Just started if the student has answered anything in the topic, otherwise Not started.
 */
export function topicLearningStatus(band: TopicKnowledgeBand, hasAnsweredAnything: boolean): LearningStatus {
  switch (band) {
    case 'good': return 'gotit'
    case 'medium': return 'nearly'
    case 'low': return 'needswork'
    case 'not-enough-evidence': return hasAnsweredAnything ? 'started' : 'notstarted'
  }
}

/** How many of a course's topics are in each status (the Understanding measure). Every topic is counted once. */
export function understandingCounts(states: readonly ModuleLearningState[]): Partial<Record<LearningStatus, number>> {
  const counts: Partial<Record<LearningStatus, number>> = {}
  states.forEach((state) => {
    state.topicKnowledge.topics.forEach((topic) => {
      const answered = state.evidence.some((item) => item.topicId === topic.topicId)
      const status = topicLearningStatus(topic.band, answered)
      counts[status] = (counts[status] ?? 0) + 1
    })
  })
  return counts
}
