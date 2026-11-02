/** Resolve a precise post-answer Learn repair only when the scored objective
 * question names one AQA requirement and its exact published Foundation page.
 * Multi-target, untagged and mismatched-topic work is not an individual diagnosis.
 * Reading the page is exposure, never evidence of mastery.
 */
import type { LearningContentAdapter } from '../engine/content/content-adapter'
import type { PracticeQuestion } from './practice-questions'
import { objectiveItemMappingForPractice } from './practice-questions'

export function sourceBackedPracticeRepairPage(
  question: PracticeQuestion,
  adapter: Pick<LearningContentAdapter, 'getLearnPage'>,
) {
  if (question.type === 'written') return null
  const mapping = objectiveItemMappingForPractice(question)
  if (!mapping?.singleTargetSpecItemId) return null
  for (const nodeId of mapping.targetNodeIds) {
    const page = adapter.getLearnPage(nodeId)
    if (page && page.id === nodeId && page.topicId === question.topicId) return page
  }
  return null
}
