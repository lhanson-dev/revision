import { z } from 'zod'
import { foundationInternalLearningAssuranceFindingSchema } from './foundation-internal-learning-assurance'

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

type FoundationInternalLearningAssuranceFinding = z.infer<typeof foundationInternalLearningAssuranceFindingSchema>

type FoundationInternalLearningReviewDecision = 'pass' | 'conditional_pass' | 'fail_hold'

function deriveReviewDecision(findings: FoundationInternalLearningAssuranceFinding[]): FoundationInternalLearningReviewDecision {
  const hasOpenMaterial = findings.some((finding) => (
    finding.resolutionStatus === 'open' && ['blocking', 'material'].includes(finding.severity)
  ))
  if (hasOpenMaterial) return 'fail_hold'

  const hasOpenMinor = findings.some((finding) => (
    finding.resolutionStatus === 'open' && finding.severity === 'minor'
  ))
  return hasOpenMinor ? 'conditional_pass' : 'pass'
}

/**
 * Bind provider-facing structured output to the exact provenance of the work unit
 * being reviewed and derive the outcome from the educational findings.
 *
 * The reviewer owns the educational findings. Identity and the aggregate decision are
 * system-owned: parsing deterministically overwrites provider-supplied identity values
 * with validated caller provenance and derives the decision from the retained findings.
 * The downstream assurance boundary reparses the result with the canonical schema and
 * verifies exact identity again, so an adapter or future contract regression fails closed.
 */
export function foundationInternalLearningBoundReviewOutputSchema(
  identity: FoundationInternalLearningReviewIdentity,
) {
  const validatedIdentity = foundationInternalLearningReviewIdentitySchema.parse(identity)

  return z.object({
    foundationFingerprint: z.string(),
    foundationCandidateId: z.string(),
    sourceBundleFingerprint: z.string(),
    workUnitId: z.string(),
    workUnitFingerprint: z.string(),
    decision: z.enum(['pass', 'conditional_pass', 'fail_hold']),
    findings: z.array(foundationInternalLearningAssuranceFindingSchema).default([]),
  }).overwrite((review) => ({
    ...review,
    ...validatedIdentity,
    decision: deriveReviewDecision(review.findings),
  }))
}
