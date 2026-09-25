import { z } from 'zod'
import { foundationInternalLearningWorkUnitReviewOutputSchema } from './foundation-internal-learning-assurance'

export interface FoundationInternalLearningReviewIdentity {
  foundationFingerprint: string
  foundationCandidateId: string
  sourceBundleFingerprint: string
  workUnitId: string
  workUnitFingerprint: string
}

const foundationInternalLearningReviewIdentitySchema = foundationInternalLearningWorkUnitReviewOutputSchema.pick({
  foundationFingerprint: true,
  foundationCandidateId: true,
  sourceBundleFingerprint: true,
  workUnitId: true,
  workUnitFingerprint: true,
})

function systemOwnedIdentityField(value: string) {
  return z.string().optional().default(value).overwrite(() => value)
}

/**
 * Bind provider-facing structured output to the exact provenance of the work unit
 * being reviewed. The reviewer owns the educational judgement, not identity fields.
 *
 * Identity is therefore system-owned: provider output may omit these fields or return
 * an arbitrary string, but parsing deterministically overwrites it with the validated
 * caller-supplied value. The downstream assurance boundary still checks the fully
 * bound values again so an adapter or future contract regression fails closed.
 */
export function foundationInternalLearningBoundReviewOutputSchema(
  identity: FoundationInternalLearningReviewIdentity,
) {
  const validatedIdentity = foundationInternalLearningReviewIdentitySchema.parse(identity)
  return foundationInternalLearningWorkUnitReviewOutputSchema.safeExtend({
    foundationFingerprint: systemOwnedIdentityField(validatedIdentity.foundationFingerprint),
    foundationCandidateId: systemOwnedIdentityField(validatedIdentity.foundationCandidateId),
    sourceBundleFingerprint: systemOwnedIdentityField(validatedIdentity.sourceBundleFingerprint),
    workUnitId: systemOwnedIdentityField(validatedIdentity.workUnitId),
    workUnitFingerprint: systemOwnedIdentityField(validatedIdentity.workUnitFingerprint),
  })
}
