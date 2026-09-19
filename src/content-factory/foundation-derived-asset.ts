import { z } from 'zod'
import { foundationJobSchema, type FoundationJob } from './foundation-schema'
import {
  assertApprovedFoundationIntegrity,
  computeFoundationFingerprint,
} from './foundation-lifecycle'

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const nonEmptyStringSchema = z.string().min(1)
const sha256Schema = z.string().regex(/^[0-9a-f]{64}$/)

export const foundationDerivedAssetKindSchema = z.enum(['learn', 'practice', 'exam_prep'])

export const foundationDerivedAssetSchema = z.object({
  schemaVersion: z.literal(1),
  assetId: identifierSchema,
  assetKind: foundationDerivedAssetKindSchema,
  foundationFingerprint: sha256Schema,
  foundationCandidateId: identifierSchema,
  assuranceStatus: z.enum(['pending', 'pass']),
  assuranceEvidenceRefs: z.array(nonEmptyStringSchema).default([]),
  createdAt: nonEmptyStringSchema,
}).superRefine((asset, context) => {
  if (asset.assuranceStatus === 'pass' && asset.assuranceEvidenceRefs.length === 0) {
    context.addIssue({
      code: 'custom',
      path: ['assuranceEvidenceRefs'],
      message: 'Assured derived assets must retain asset-assurance evidence',
    })
  }
})

export async function createFoundationDerivedAsset(input: {
  job: FoundationJob
  assetId: string
  assetKind: 'learn' | 'practice' | 'exam_prep'
  createdAt: string
}) {
  const job = foundationJobSchema.parse(input.job)

  let candidate
  let foundationFingerprint: string

  if (job.state === 'foundation_approved' && job.approvedFoundation) {
    const approvedFoundation = await assertApprovedFoundationIntegrity(job.approvedFoundation)
    candidate = approvedFoundation.candidate
    foundationFingerprint = approvedFoundation.foundationFingerprint
  } else if (['ai_assured', 'expert_review'].includes(job.state) && job.candidate) {
    candidate = job.candidate
    foundationFingerprint = await computeFoundationFingerprint(candidate)

    if (candidate.deterministicAssurance.status !== 'pass'
      || candidate.independentReview.status !== 'pass'
      || candidate.externalSourceChallenge?.decision !== 'pass') {
      throw new Error('Internal asset derivation requires the complete AI-assurance chain to pass')
    }
    if (candidate.deterministicAssurance.foundationFingerprint !== foundationFingerprint
      || candidate.independentReview.foundationFingerprint !== foundationFingerprint
      || candidate.externalSourceChallenge.foundationFingerprint !== foundationFingerprint) {
      throw new Error('Internal asset derivation requires exact-fingerprint AI-assurance evidence')
    }
  } else {
    throw new Error('Internal Foundation-derived asset production requires ai_assured, expert_review or foundation_approved state')
  }

  return foundationDerivedAssetSchema.parse({
    schemaVersion: 1,
    assetId: input.assetId,
    assetKind: input.assetKind,
    foundationFingerprint,
    foundationCandidateId: candidate.candidateId,
    assuranceStatus: 'pending',
    assuranceEvidenceRefs: [],
    createdAt: input.createdAt,
  })
}

export function recordFoundationDerivedAssetAssurance(
  assetInput: FoundationDerivedAsset,
  evidenceRefs: string[],
) {
  const asset = foundationDerivedAssetSchema.parse(assetInput)
  return foundationDerivedAssetSchema.parse({
    ...asset,
    assuranceStatus: 'pass',
    assuranceEvidenceRefs: evidenceRefs,
  })
}

export function getFoundationDerivedAssetReleaseProblems(
  assetInput: FoundationDerivedAsset,
  jobInput: FoundationJob,
) {
  const asset = foundationDerivedAssetSchema.parse(assetInput)
  const job = foundationJobSchema.parse(jobInput)
  const problems: string[] = []

  if (asset.assuranceStatus !== 'pass') {
    problems.push('Derived asset assurance must pass before learner release')
  }
  if (job.state !== 'foundation_approved' || !job.approvedFoundation) {
    problems.push('Learner release requires qualified-human foundation_approved state')
    return problems
  }
  if (job.approvedFoundation.foundationFingerprint !== asset.foundationFingerprint) {
    problems.push('Derived asset is stale because its Foundation fingerprint is not the approved fingerprint')
  }

  return problems
}

export function assertFoundationDerivedAssetReleaseEligible(
  assetInput: FoundationDerivedAsset,
  jobInput: FoundationJob,
) {
  const problems = getFoundationDerivedAssetReleaseProblems(assetInput, jobInput)
  if (problems.length > 0) throw new Error(problems.join('; '))
  return foundationDerivedAssetSchema.parse(assetInput)
}

export type FoundationDerivedAsset = z.infer<typeof foundationDerivedAssetSchema>
