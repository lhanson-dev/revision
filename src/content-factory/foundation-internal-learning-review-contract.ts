import { z } from 'zod'
import { foundationInternalLearningWorkUnitReviewOutputSchema } from './foundation-internal-learning-assurance'

export interface FoundationInternalLearningReviewIdentity {
  foundationFingerprint: string
  foundationCandidateId: string
  sourceBundleFingerprint: string
  workUnitId: string
  workUnitFingerprint: string
}

/**
 * Bind provider-facing structured output to the exact provenance of the work unit
 * being reviewed. The reviewer owns the educational judgement, not identity fields.
 *
 * The downstream assurance boundary still checks these values again so a provider,
 * adapter or future contract regression fails closed even if this schema is bypassed.
 */
export function foundationInternalLearningBoundReviewOutputSchema(
  identity: FoundationInternalLearningReviewIdentity,
) {
  return foundationInternalLearningWorkUnitReviewOutputSchema.safeExtend({
    foundationFingerprint: z.literal(identity.foundationFingerprint),
    foundationCandidateId: z.literal(identity.foundationCandidateId),
    sourceBundleFingerprint: z.literal(identity.sourceBundleFingerprint),
    workUnitId: z.literal(identity.workUnitId),
    workUnitFingerprint: z.literal(identity.workUnitFingerprint),
  })
}
