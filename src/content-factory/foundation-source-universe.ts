import { z } from 'zod'

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const nonEmptyStringSchema = z.string().min(1)

export const foundationSourceUniverseRequirementSchema = z.object({
  sourceId: identifierSchema,
  issuer: nonEmptyStringSchema,
  sourceType: nonEmptyStringSchema,
  requiredUseClass: z.enum(['OPEN', 'REVISION_OWNED', 'LICENSED', 'REFERENCE_ONLY']).optional(),
  role: z.enum(['course_identity', 'curriculum_scope', 'exam_scope', 'quantitative_truth', 'assessment_calibration', 'source_discovery_surface']),
  rationale: nonEmptyStringSchema,
})

export const foundationSourceUniverseEvidenceSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('foundation_source_universe_evidence'),
  status: z.literal('complete'),
  profileId: identifierSchema,
  requiredSourceIds: z.array(identifierSchema).min(1),
  resolvedSourceIds: z.array(identifierSchema).min(1),
})

export type FoundationSourceUniverseRequirement = z.infer<typeof foundationSourceUniverseRequirementSchema>

export type FoundationSourceUniverseSourceEvidence = {
  id: string
  issuer: string
  sourceType: string
  useClass: string
}

function assertUnique(values: string[], label: string) {
  const seen = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) throw new Error(`duplicate_${label}:${value}`)
    seen.add(value)
  }
}

/**
 * Proves that the source set used to define a Foundation requirement universe includes
 * every independently-declared source category required for the exact course/cohort.
 *
 * This gate deliberately sits upstream of curriculum/exam reconciliation. A coverage map
 * cannot prove its own completeness merely by matching itself; the source universe that
 * informed that map must itself be explicit and inspectable.
 */
export function assertFoundationSourceUniverse(input: {
  profileId: string
  requirements: FoundationSourceUniverseRequirement[]
  sourceEvidence: FoundationSourceUniverseSourceEvidence[]
}) {
  const requirements = z.array(foundationSourceUniverseRequirementSchema).min(1).parse(input.requirements)
  assertUnique(requirements.map((item) => item.sourceId), 'source_universe_requirement')
  assertUnique(input.sourceEvidence.map((item) => item.id), 'source_universe_evidence')

  const evidenceById = new Map(input.sourceEvidence.map((source) => [source.id, source] as const))
  for (const requirement of requirements) {
    const source = evidenceById.get(requirement.sourceId)
    if (!source) throw new Error(`source_universe_missing_required_source:${requirement.sourceId}`)
    if (source.issuer !== requirement.issuer) {
      throw new Error(`source_universe_issuer_mismatch:${requirement.sourceId}:${source.issuer}`)
    }
    if (source.sourceType !== requirement.sourceType) {
      throw new Error(`source_universe_source_type_mismatch:${requirement.sourceId}:${source.sourceType}`)
    }
    if (requirement.requiredUseClass && source.useClass !== requirement.requiredUseClass) {
      throw new Error(`source_universe_use_class_mismatch:${requirement.sourceId}:${source.useClass}`)
    }
  }

  return foundationSourceUniverseEvidenceSchema.parse({
    schemaVersion: 1,
    artifactType: 'foundation_source_universe_evidence',
    status: 'complete',
    profileId: input.profileId,
    requiredSourceIds: requirements.map((item) => item.sourceId),
    resolvedSourceIds: requirements.map((item) => evidenceById.get(item.sourceId)!.id),
  })
}
