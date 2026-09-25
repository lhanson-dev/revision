import { z } from 'zod'
import { foundationInternalLearningWorkUnitReviewOutputSchema } from './foundation-internal-learning-assurance'

export interface FoundationInternalLearningReviewIdentity {
  foundationFingerprint: string
  foundationCandidateId: string
  sourceBundleFingerprint: string
  workUnitId: string
  workUnitFingerprint: string
}

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const sha256Schema = z.string().regex(/^[0-9a-f]{64}$/)
const foundationInternalLearningReviewIdentitySchema = z.object({
  foundationFingerprint: sha256Schema,
  foundationCandidateId: identifierSchema,
  sourceBundleFingerprint: sha256Schema,
  workUnitId: identifierSchema,
  workUnitFingerprint: sha256Schema,
})

function systemOwnedIdentityField(value: string) {
  return z.string().overwrite(() => value)
}

/**
 * Bind provider-facing structured output to the exact provenance of the work unit
 * being reviewed. The reviewer owns the educational judgement, not identity fields.
 *
 * Identity is therefore system-owned: the provider returns the existing string fields,
 * but parsing deterministically overwrites their values with validated caller-supplied
 * provenance. The downstream assurance boundary still checks the fully bound values
 * again so an adapter or future contract regression fails closed.
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
