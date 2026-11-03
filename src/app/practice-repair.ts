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

/**
 * #705 bounded guided repair for two separately assessed AQA Business 7132
 * calculation skills. Both remain bound to the *existing* approved Foundation
 * page bus-evi-004, which already has distinct worked examples for each skill.
 *
 * This supports a different unscored teaching step. An incorrect final number
 * cannot diagnose which part of the method was misunderstood; the repair is a
 * skill-specific refresher, NOT a proven misconception or assessed performance.
 * The examples reuse the original published Foundation case, not the question
 * the learner just answered or its independently authored recheck pair.
 */
export type GuidedMethodRepair = {
  kind: 'unscored-guided-repair'
  specItemId: string
  sourceLearnPageId: string
  title: string
  challenge: string
  steps: readonly string[]
  answer: string
  caution: string
}

const decisionTreeGuidedRepairs: Record<string, Omit<GuidedMethodRepair, 'specItemId' | 'sourceLearnPageId'>> = {
  'aqa-7132-3.2.2:expected-value': {
    kind: 'unscored-guided-repair',
    title: 'Calculate a probability-weighted expected value',
    challenge: 'A regional launch has a 0.7 chance of a £180,000 outcome and a 0.3 chance of a £100,000 loss. Before any separate launch costs, what is the expected value?',
    steps: [
      'Multiply the favourable outcome by its probability: 0.7 × £180,000 = £126,000.',
      'Keep the loss negative: 0.3 × −£100,000 = −£30,000.',
      'Add the signed weighted outcomes: £126,000 − £30,000 = £96,000.',
    ],
    answer: 'Expected value = £96,000, a probability-weighted average rather than a guaranteed return.',
    caution: 'Do not change a loss into a positive amount or subtract a separate option cost when asked only for expected value.',
  },
  'aqa-7132-3.2.2:net-gain': {
    kind: 'unscored-guided-repair',
    title: 'Separate net gain from expected value',
    challenge: 'A regional launch has an expected value of £96,000 before a certain £60,000 launch cost. What is its net gain?',
    steps: [
      'Identify the expected value before the separate certain cost: £96,000.',
      'Identify the certain cost of the option, which has not yet been included: £60,000.',
      'Subtract that cost once from expected value: £96,000 − £60,000 = £36,000.',
    ],
    answer: 'Net gain = £36,000. This is not the same thing as its £96,000 expected value.',
    caution: 'Check whether the stated outcomes already include the cost. Never deduct a cost again when it is already accounted for.',
  },
}

/** Only select an authored treatment after the exact source-backed single-skill
 * question has resolved to the actually published Foundation Learn page.
 */
export function sourceBackedGuidedMethodRepair(
  question: PracticeQuestion,
  adapter: Pick<LearningContentAdapter, 'getLearnPage'>,
): GuidedMethodRepair | null {
  if (question.type !== 'calculation') return null
  const page = sourceBackedPracticeRepairPage(question, adapter)
  const item = objectiveItemMappingForPractice(question)?.singleTargetSpecItemId
  if (!page || page.id !== 'bus-evi-004' || page.topicId !== 'leadership' || !item) return null
  return guidedMethodRepairForPublishedPage(item, page)
}

/**
 * Planned FI-001 repair route only: this is read-only teaching content. The
 * URL parameter does not prove the learner got anything wrong; it is never
 * accepted as assessment evidence or a mastery decision. Non-matching page
 * and item combinations fail closed.
 */
export function guidedMethodRepairForPublishedPage(
  specItemId: string | null | undefined,
  page: { id: string; topicId: string },
): GuidedMethodRepair | null {
  if (!specItemId || page.id !== 'bus-evi-004' || page.topicId !== 'leadership') return null
  const method = Object.prototype.hasOwnProperty.call(decisionTreeGuidedRepairs, specItemId)
    ? decisionTreeGuidedRepairs[specItemId] : null
  return method ? { ...method, specItemId, sourceLearnPageId: page.id } : null
}
