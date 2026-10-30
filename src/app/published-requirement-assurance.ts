/**
 * #698/#703 — evidence crosswalk for the exact content actually published in
 * the canonical learner catalogue.
 *
 * This is a *supply audit*, not independent examination-spec verification or
 * an educational-quality verdict. The input requirement universe is always
 * explicitly labelled provisional until checked against the exact user PDF.
 *
 * Questions, Learn pages and exams are distinct capability/evidence types.
 * A generic topic MCQ cannot certify a specific requirement. Two question IDs
 * with identical stimuli cannot count as an independent recheck. A Learn page
 * being present does not show adequate teaching or learner understanding.
 */
import type { CatalogueCourse } from './catalogue-model'
import { bankRecordToPractice, bankQuestionId, objectiveItemMappingForPractice, type MultipleChoicePracticeQuestion } from './practice-questions'

export type ProvisionalRequirement = {
  id: string
  topicId: string
  /** Exact named requirement locator only when actually verified against a source. */
  sourceLocator: string | null
  /** A candidate structural source, never independent source approval. */
  inventoryOrigin: 'published-bank-target' | 'psychology-prototype-truth'
  /** Approved original source IDs. Never infer them from a topic text match. */
  sourceSectionIds: readonly string[]
}

export type PublishedRequirementRow = {
  requirementId: string
  topicId: string
  sourceLocator: string | null
  inventoryOrigin: ProvisionalRequirement['inventoryOrigin']
  learnPageIds: string[]
  /** Published ordinary MCQs for the TOPIC; cannot be treated as per-item evidence. */
  topicOnlyMcqIds: string[]
  /** Bank records expressly claiming to target the item; not all can be software scored. */
  taggedBankQuestionIds: string[]
  /** One-target software-scored source questions carrying exact item provenance. */
  independentlyScoredMcqIds: string[]
  /** A supported distinct authored recheck pair, or null (never invented). */
  independentRecheckPair: [string, string] | null
  unscoredOrOtherTaggedQuestionIds: string[]
  /** Current supply only: no implied teaching adequacy, mastery or exam readiness. */
  sourcePdfVerified: false
  teachingAdequacy: 'unverified'
  practiceAdequacy: 'unverified'
}

export type PublishedCourseSupplyReport = {
  courseId: string
  specificationCode: string
  publishedModuleIds: string[]
  sourceUniverseStatus: 'provisional-not-independently-enumerated'
  rows: PublishedRequirementRow[]
  counts: {
    provisionalItems: number
    itemsWithIdentifiedLearnPage: number
    itemsWithSingleTargetScoredMcq: number
    itemsWithIndependentRetestPair: number
    itemsWithoutSingleTargetScoredMcq: number
  }
}

function distinctById<T extends { id: string }>(items: readonly T[]) {
  return [...new Map(items.map(item => [item.id, item])).values()]
}

function sameQuestion(a: MultipleChoicePracticeQuestion, b: MultipleChoicePracticeQuestion) {
  return a.prompt === b.prompt
    && a.context === b.context
    && JSON.stringify(a.options) === JSON.stringify(b.options)
}

/** The consumer supplies a provisional set of requirement candidates rather
 * than pretending question tags themselves establish source-PDF completeness.
 */
export function buildPublishedCourseSupplyReport(
  course: CatalogueCourse,
  candidates: readonly ProvisionalRequirement[],
): PublishedCourseSupplyReport {
  const adapter = course.learningAdapter
  const moduleIds = course.modules.map(module => module.manifest.id)
  const allPages = adapter.listLearnChapters().flatMap(chapter =>
    chapter.groups.flatMap(group => group.pages))
  const bank = adapter.listPracticeBank()
  const mcqs = adapter.listQuestions()
  const uniqueCandidates = new Map<string, ProvisionalRequirement>()
  for (const candidate of candidates) {
    if (uniqueCandidates.has(candidate.id)) throw new Error(`Repeated provisional requirement ID: ${candidate.id}`)
    if (!adapter.getTopic(candidate.topicId)) throw new Error(`Unknown published topic for ${candidate.id}: ${candidate.topicId}`)
    uniqueCandidates.set(candidate.id, candidate)
  }

  const rows: PublishedRequirementRow[] = [...uniqueCandidates.values()].map(candidate => {
    const tagged = bank.filter(item => item.target_item_ids.includes(candidate.id))
    const sourceNodes = new Set(tagged.flatMap(record => record.target_node_ids))
    const sections = new Set(candidate.sourceSectionIds)
    const learnPageIds = allPages.filter(page => page.topicId === candidate.topicId
      && (sourceNodes.has(page.id) || (page.sourceSectionIds ?? []).some(id => sections.has(id))))
      .map(page => page.id)
    const singleTarget = tagged.flatMap(record => {
      if (record.target_item_ids.length !== 1) return []
      const q = bankRecordToPractice(record, candidate.topicId)
      if (!q || q.type !== 'multiple-choice') return []
      const mapping = objectiveItemMappingForPractice(q)
      return mapping?.singleTargetSpecItemId === candidate.id ? [q] : []
    })
    const uniqueScored = distinctById(singleTarget)
    let pair: [string, string] | null = null
    for (let i = 0; i < uniqueScored.length && !pair; i++) {
      for (let j = i + 1; j < uniqueScored.length; j++) {
        if (!sameQuestion(uniqueScored[i]!, uniqueScored[j]!)) {
          pair = [uniqueScored[i]!.id, uniqueScored[j]!.id]
          break
        }
      }
    }
    const scoredIds = new Set(uniqueScored.map(q => q.id))
    return {
      requirementId: candidate.id,
      topicId: candidate.topicId,
      sourceLocator: candidate.sourceLocator,
      inventoryOrigin: candidate.inventoryOrigin,
      learnPageIds: [...new Set(learnPageIds)].sort(),
      topicOnlyMcqIds: mcqs.filter(q => q.topic === candidate.topicId).map(q => q.id).sort(),
      taggedBankQuestionIds: [...new Set(tagged.map(bankQuestionId))].sort(),
      independentlyScoredMcqIds: [...scoredIds].sort(),
      independentRecheckPair: pair,
      unscoredOrOtherTaggedQuestionIds: [...new Set(tagged.map(bankQuestionId))]
        .filter(id => !scoredIds.has(id)).sort(),
      sourcePdfVerified: false as const,
      teachingAdequacy: 'unverified' as const,
      practiceAdequacy: 'unverified' as const,
    }
  }).sort((a,b) => a.topicId.localeCompare(b.topicId) || a.requirementId.localeCompare(b.requirementId))

  return {
    courseId: course.id,
    specificationCode: course.specificationCode,
    publishedModuleIds: moduleIds,
    sourceUniverseStatus: 'provisional-not-independently-enumerated',
    rows,
    counts: {
      provisionalItems: rows.length,
      itemsWithIdentifiedLearnPage: rows.filter(r => r.learnPageIds.length > 0).length,
      itemsWithSingleTargetScoredMcq: rows.filter(r => r.independentlyScoredMcqIds.length > 0).length,
      itemsWithIndependentRetestPair: rows.filter(r => r.independentRecheckPair !== null).length,
      itemsWithoutSingleTargetScoredMcq: rows.filter(r => r.independentlyScoredMcqIds.length === 0).length,
    },
  }
}
