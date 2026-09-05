import { z } from 'zod'

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const nonEmptyStringSchema = z.string().min(1)

export const foundationSemanticCoverageItemSchema = z.object({
  id: identifierSchema,
  requirementId: identifierSchema,
  officialReference: nonEmptyStringSchema,
  knowledgeItemIndex: z.number().int().nonnegative(),
  text: nonEmptyStringSchema,
})

export const foundationCoverageObligationSchema = z.object({
  obligationId: identifierSchema,
  officialReference: nonEmptyStringSchema,
  curriculumPath: z.array(nonEmptyStringSchema).min(1),
  summary: nonEmptyStringSchema,
  semanticItemIds: z.array(identifierSchema).min(1),
  requiredTerms: z.array(nonEmptyStringSchema).default([]),
  sourceRefs: z.array(identifierSchema).min(1),
})

export type FoundationSemanticCoverageItem = z.infer<typeof foundationSemanticCoverageItemSchema>
export type FoundationCoverageObligation = z.infer<typeof foundationCoverageObligationSchema>

function assertUnique(values: string[], label: string) {
  const seen = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) throw new Error(`duplicate_${label}:${value}`)
    seen.add(value)
  }
}

function normaliseEvidenceText(value: string) {
  return value
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[–—−]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

export function canonicalKnowledgeNodeId(item: Pick<FoundationSemanticCoverageItem, 'requirementId' | 'knowledgeItemIndex'>) {
  return `${item.requirementId}.k${String(item.knowledgeItemIndex + 1).padStart(2, '0')}`
}

/**
 * Proves Foundation Course Truth completeness against the applicable requirements
 * in a source-led curriculum hierarchy.
 *
 * The source-led hierarchy defines what must be covered. Revision's semantic seed defines
 * how those obligations are represented for Course Truth generation. No fixed topic or node
 * count is part of this gate: completeness means every applicable obligation maps to governed
 * semantic content, every mapping resolves, and any mechanically checkable named scope/boundary
 * recorded on the source obligation is present in the mapped semantics.
 */
export function assertRequirementLedCoverage(input: {
  obligations: FoundationCoverageObligation[]
  semanticItems: FoundationSemanticCoverageItem[]
  supplementalSemanticItemIds?: string[]
}) {
  const obligations = z.array(foundationCoverageObligationSchema).min(1).parse(input.obligations)
  const semanticItems = z.array(foundationSemanticCoverageItemSchema).min(1).parse(input.semanticItems)
  const supplementalSemanticItemIds = input.supplementalSemanticItemIds ?? []

  assertUnique(obligations.map((item) => item.obligationId), 'coverage_obligation_id')
  assertUnique(semanticItems.map((item) => item.id), 'semantic_coverage_item_id')
  assertUnique(supplementalSemanticItemIds, 'supplemental_semantic_item_id')

  const semanticById = new Map(semanticItems.map((item) => [item.id, item]))
  const mappedSemanticIds = new Set<string>()
  const mappedCanonicalNodeIds = new Set<string>()

  for (const obligation of obligations) {
    assertUnique(obligation.semanticItemIds, `semantic_mapping_on_${obligation.obligationId}`)
    const mappedItems: FoundationSemanticCoverageItem[] = []
    for (const semanticItemId of obligation.semanticItemIds) {
      const semanticItem = semanticById.get(semanticItemId)
      if (!semanticItem) {
        throw new Error(`unmapped_curriculum_requirement:${obligation.obligationId}:${semanticItemId}`)
      }
      mappedItems.push(semanticItem)
      mappedSemanticIds.add(semanticItemId)
      mappedCanonicalNodeIds.add(canonicalKnowledgeNodeId(semanticItem))
    }

    const mappedEvidence = normaliseEvidenceText(mappedItems.map((item) => item.text).join(' '))
    for (const requiredTerm of obligation.requiredTerms) {
      if (!mappedEvidence.includes(normaliseEvidenceText(requiredTerm))) {
        throw new Error(`missing_required_curriculum_scope:${obligation.obligationId}:${requiredTerm}`)
      }
    }
  }

  const supplemental = new Set(supplementalSemanticItemIds)
  for (const supplementalId of supplemental) {
    if (!semanticById.has(supplementalId)) throw new Error(`unknown_supplemental_semantic_item:${supplementalId}`)
  }

  const ungovernedSemanticItems = semanticItems
    .map((item) => item.id)
    .filter((id) => !mappedSemanticIds.has(id) && !supplemental.has(id))
  if (ungovernedSemanticItems.length > 0) {
    throw new Error(`semantic_items_without_curriculum_requirement:${ungovernedSemanticItems.join(',')}`)
  }

  return {
    obligationIds: obligations.map((item) => item.obligationId),
    semanticItemIds: [...mappedSemanticIds],
    canonicalKnowledgeNodeIds: [...mappedCanonicalNodeIds],
  }
}
