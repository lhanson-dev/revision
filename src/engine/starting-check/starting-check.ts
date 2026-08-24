import type { LearningContentAdapter } from '../content/content-adapter'
import type { MultipleChoiceQuestion } from '../../../content/schema'
import type { LearningEvidence } from '../evidence/evidence'

export const STARTING_CHECK_QUESTION_LIMIT = 5

export type StartingCheckObservation = {
  questionId: string
  topicId: string
  correct: boolean
}

export type StartingPointReason =
  | 'incorrect_sample'
  | 'no_stronger_evidence'
  | 'course_order_fallback'

export type StartingPointRecommendation = {
  topicId: string
  reason: StartingPointReason
}

type StartingCheckContent = Pick<LearningContentAdapter, 'listTopics' | 'listQuestions'>

function evenlySpacedIndexes(total: number, count: number): number[] {
  if (count <= 0 || total <= 0) return []
  if (count >= total) return Array.from({ length: total }, (_, index) => index)
  if (count === 1) return [0]

  return Array.from({ length: count }, (_, index) =>
    Math.round((index * (total - 1)) / (count - 1)))
}

/**
 * Selects a small, deterministic and broadly distributed set of assured course
 * questions. The adapter already represents validated pack content and canonical
 * topic order. At most one question is selected per topic.
 */
export function selectStartingCheckQuestions(
  content: StartingCheckContent,
  limit = STARTING_CHECK_QUESTION_LIMIT,
): MultipleChoiceQuestion[] {
  if (!Number.isInteger(limit) || limit < 0) {
    throw new Error('Starting-check question limit must be a non-negative integer.')
  }

  const eligible = content.listTopics().flatMap((topic) => {
    const question = content.listQuestions(topic.id)[0]
    return question ? [{ topic, question }] : []
  })

  return evenlySpacedIndexes(eligible.length, Math.min(limit, eligible.length))
    .map((index) => eligible[index].question)
}

function normalEvidenceTopics(
  moduleId: string,
  evidence: readonly LearningEvidence[],
): Set<string> {
  return new Set(
    evidence
      .filter((item) => item.moduleId === moduleId)
      .map((item) => item.topicId),
  )
}

/**
 * FI-006 deterministic first-recommendation rule.
 *
 * Starting-check observations are deliberately separate from ordinary learning
 * evidence. Incorrect sampled topics win in canonical course order. Otherwise
 * prefer the earliest topic without stronger normal evidence, then fall back to
 * the first canonical topic.
 */
export function recommendStartingPoint(
  moduleId: string,
  canonicalTopicIds: readonly string[],
  observations: readonly StartingCheckObservation[],
  evidence: readonly LearningEvidence[],
): StartingPointRecommendation | null {
  if (canonicalTopicIds.length === 0) return null

  const incorrectTopics = new Set(
    observations.filter((observation) => !observation.correct).map((observation) => observation.topicId),
  )

  const firstIncorrect = canonicalTopicIds.find((topicId) => incorrectTopics.has(topicId))
  if (firstIncorrect) return { topicId: firstIncorrect, reason: 'incorrect_sample' }

  const evidencedTopics = normalEvidenceTopics(moduleId, evidence)
  const firstWithoutStrongerEvidence = canonicalTopicIds.find((topicId) => !evidencedTopics.has(topicId))
  if (firstWithoutStrongerEvidence) {
    return { topicId: firstWithoutStrongerEvidence, reason: 'no_stronger_evidence' }
  }

  return { topicId: canonicalTopicIds[0], reason: 'course_order_fallback' }
}
