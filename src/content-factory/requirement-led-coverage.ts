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
  summary: nonEmptyStringSchema,
  semanticItemIds: z.array(identifierSchema).min(1),
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

export function canonicalKnowledgeNodeId(item: Pick<FoundationSemanticCoverageItem, 'requirementId' | 'knowledgeItemIndex'>) {
  return `${item.requirementId}.k${String(item.knowledgeItemIndex + 1).padStart(2, '0')}`
}

/**
 * Proves Foundation curriculum completeness against an explicit source-led obligation ledger.
 *
 * The ledger defines what must be covered. The semantic seed defines how Revision expresses
 * those obligations for generation. No fixed topic, node or asset count is part of this gate.
 * Completeness means every applicable obligation maps to at least one governed semantic item,
 * every mapping resolves, and no governed semantic item silently sits outside the ledger unless
 * it is explicitly declared supplemental.
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
    for (const semanticItemId of obligation.semanticItemIds) {
      const semanticItem = semanticById.get(semanticItemId)
      if (!semanticItem) {
        throw new Error(`unmapped_curriculum_or_exam_obligation:${obligation.obligationId}:${semanticItemId}`)
      }
      mappedSemanticIds.add(semanticItemId)
      mappedCanonicalNodeIds.add(canonicalKnowledgeNodeId(semanticItem))
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
    throw new Error(`semantic_items_without_coverage_obligation:${ungovernedSemanticItems.join(',')}`)
  }

  return {
    obligationIds: obligations.map((item) => item.obligationId),
    semanticItemIds: [...mappedSemanticIds],
    canonicalKnowledgeNodeIds: [...mappedCanonicalNodeIds],
  }
}
