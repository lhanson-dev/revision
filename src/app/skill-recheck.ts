/** B2a: find a defensible independent check of a specifically assessed AQA skill.
 * This is NOT a mastery score, a universal review interval, or a question generator.
 * A different published, single-target objective question is required. A missing
 * source-backed question is a measured content gap, never a scheduled retest.
 */
import type { LearningContentAdapter } from '../engine/content/content-adapter'
import { individualSpecItemObservation, withoutSuperseded, type LearningEvidence, type ObjectiveItemMapping } from '../engine/evidence/evidence'
import { buildQuestionPool, objectiveItemMappingForPractice, type MultipleChoicePracticeQuestion } from './practice-questions'

export type SkillRecheckNeed = 'missed' | 'uncertain'
export type SkillRecheckOpportunity = {
  specItemId: string
  topicId: string
  sourceEvidenceId: string
  need: SkillRecheckNeed
  freshQuestionId: string | null
  /** A verified exact Foundation node-to-Learn page link, not a guessed topic page. */
  repairLearnPageId: string | null
}

/** All published software-scored and exact-tagged questions from the selected course adapter. */
export function authoredSkillQuestions(adapter: LearningContentAdapter, topicId: string): MultipleChoicePracticeQuestion[] {
  const topic = adapter.getTopic(topicId)
  if (!topic || adapter.manifest.status !== 'available') return []
  return buildQuestionPool({
    topicId, topicOrder: topic.order, coursePack: [], bank: adapter.listPracticeBank(),
  }).filter((question): question is MultipleChoicePracticeQuestion =>
    question.type === 'multiple-choice' && Boolean(objectiveItemMappingForPractice(question)?.singleTargetSpecItemId))
}

/** Evidence-only diagnosis; the same skill and same authored question must match on save and read.
 * Any cross-course/module, missing source, multi-target answer, or old topic-only result is ignored.
 */
export function findSkillRecheckOpportunities(
  questions: readonly MultipleChoicePracticeQuestion[],
  evidence: readonly LearningEvidence[],
  topicId: string,
  allowedModuleIds: readonly string[],
  availableLearnPageIds: readonly string[] = [],
): SkillRecheckOpportunity[] {
  const allowed = new Set(allowedModuleIds)
  const choices = new Map(questions
    .filter((question) => question.topicId === topicId)
    .map((question) => [question.id, question]))
  const validEvidence = withoutSuperseded(evidence).filter((item) =>
    allowed.has(item.moduleId) && item.topicId === topicId)
  const answeredContent = new Set(validEvidence.map((item) => item.contentId))
  const latest = new Map<string, { observation: NonNullable<ReturnType<typeof individualSpecItemObservation>>; mapping: ObjectiveItemMapping }>()
  for (const fact of validEvidence) {
    const observation = individualSpecItemObservation(fact)
    if (!observation || fact.source !== 'multiple_choice' || !fact.itemMapping) continue
    const authored = choices.get(fact.contentId)
    const mapping = authored && objectiveItemMappingForPractice(authored)
    // Trust only the stored single-target fact that still points to an actual,
    // matching published authored item for this exact topic.
    if (!mapping?.singleTargetSpecItemId || mapping.singleTargetSpecItemId !== observation.specItemId
      || fact.correct !== (fact.selectedOption === authored?.correctOption)
      || fact.correctOption !== authored?.correctOption
      || fact.itemMapping.singleTargetSpecItemId !== mapping.singleTargetSpecItemId
      || fact.itemMapping.source !== mapping.source
      || fact.itemMapping.targetNodeIds.join('\0') !== mapping.targetNodeIds.join('\0')) continue
    const existing = latest.get(observation.specItemId)
    if (!existing || observation.occurredAt > existing.observation.occurredAt
      || observation.occurredAt === existing.observation.occurredAt && observation.evidenceId > existing.observation.evidenceId) {
      latest.set(observation.specItemId, { observation, mapping })
    }
  }
  const pages = new Set(availableLearnPageIds)
  return [...latest.values()].flatMap(({ observation, mapping }) => {
    const need: SkillRecheckNeed | null = !observation.correct ? 'missed'
      : observation.confidence === 'guess' ? 'uncertain' : null
    if (!need) return []
    const source = choices.get(observation.contentId)
    const next = [...choices.values()].find((question) =>
      !answeredContent.has(question.id)
      && question.id !== observation.contentId
      && objectiveItemMappingForPractice(question)?.singleTargetSpecItemId === observation.specItemId
      // Different IDs containing the same authored question are not a fresh check.
      && (question.prompt !== source?.prompt
        || question.context !== source.context
        || JSON.stringify(question.options) !== JSON.stringify(source.options)))
    const repairLearnPageId = mapping.targetNodeIds.find((id) => pages.has(id)) ?? null
    return [{
      specItemId: observation.specItemId, topicId, sourceEvidenceId: observation.evidenceId,
      need, freshQuestionId: next?.id ?? null, repairLearnPageId,
    }]
  }).sort((a, b) => (a.need === b.need ? a.specItemId.localeCompare(b.specItemId) : a.need === 'missed' ? -1 : 1))
}
