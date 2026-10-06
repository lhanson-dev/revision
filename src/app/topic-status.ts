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

export type TopicProgress = { status: LearningStatus; lastPractisedAt: string | null }

/** Status and last-practised time for every topic in a course, from the evidence the student has saved. */
export function topicProgressFor(state: ModuleLearningState): Record<string, TopicProgress> {
  const progress: Record<string, TopicProgress> = {}
  state.topicKnowledge.topics.forEach((topic) => {
    const answers = state.evidence.filter((item) => item.topicId === topic.topicId)
    const lastPractisedAt = answers.reduce<string | null>((latest, item) => (latest === null || item.occurredAt > latest ? item.occurredAt : latest), null)
    progress[topic.topicId] = { status: topicLearningStatus(topic.band, answers.length > 0), lastPractisedAt }
  })
  return progress
}
