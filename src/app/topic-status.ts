import type { TopicKnowledgeBand } from '../engine/knowledge/topic-knowledge'
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
