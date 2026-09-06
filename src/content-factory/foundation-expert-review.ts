import { z } from 'zod'
import {
  foundationCandidateSchema,
  type FoundationCandidate,
} from './foundation-schema'
import { computeFoundationFingerprint } from './foundation-lifecycle'
import { foundationReviewableArtifactKindSchema } from './foundation-independent-review'
import {
  foundationExternalSourceChallengeReportSchema,
  validateFoundationExternalSourceChallenge,
} from './foundation-external-source-challenge'

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const nonEmptyStringSchema = z.string().min(1)
const commitShaSchema = z.string().regex(/^[0-9a-f]{40}$/)
const sha256Schema = z.string().regex(/^[0-9a-f]{64}$/)

export const foundationExpertReviewScopeSchema = z.enum(['subject', 'assessment'])

export const foundationExpertReviewerSchema = z.object({
  reviewerId: nonEmptyStringSchema,
  qualificationScopes: z.array(foundationExpertReviewScopeSchema).min(1),
  qualificationEvidenceRefs: z.array(nonEmptyStringSchema).min(1),
})

export const foundationExpertReviewArtifactSchema = z.object({
  artifactKind: foundationReviewableArtifactKindSchema,
  artifactRef: nonEmptyStringSchema,
  fingerprint: nonEmptyStringSchema,
})

const foundationExpertReviewPackageBaseSchema = z.object({
  artifactType: z.literal('foundation_expert_review_package'),
  jobId: identifierSchema,
  candidateId: identifierSchema,
  reviewedCommit: commitShaSchema,
  foundationFingerprint: sha256Schema,
  candidate: foundationCandidateSchema,
  requiredReviewScopes: z.array(foundationExpertReviewScopeSchema).min(1),
  artifacts: z.array(foundationExpertReviewArtifactSchema).min(1),
  deterministicAssuranceEvidenceRefs: z.array(nonEmptyStringSchema).min(1),
  independentReviewEvidenceRefs: z.array(nonEmptyStringSchema).min(1),
  knownLimitations: z.array(nonEmptyStringSchema).default([]),
  createdAt: nonEmptyStringSchema,
})

export const historicalFoundationExpertReviewPackageSchema = foundationExpertReviewPackageBaseSchema.extend({
  schemaVersion: z.literal(1),
})

export const currentFoundationExpertReviewPackageSchema = foundationExpertReviewPackageBaseSchema.extend({
  schemaVersion: z.literal(2),
  sourceUniverse: z.object({
    profileId: identifierSchema,
    requiredSourceIds: z.array(identifierSchema).min(1),
  }),
  externalSourceChallenge: foundationExternalSourceChallengeReportSchema,
})

export const foundationExpertReviewPackageSchema = z.union([
  currentFoundationExpertReviewPackageSchema,
  historicalFoundationExpertReviewPackageSchema,
])

export const foundationExpertReviewFindingSchema = z.object({
  id: identifierSchema,
  severity: z.enum(['blocking', 'material', 'minor']),
  issueType: nonEmptyStringSchema,
  artifactKind: foundationReviewableArtifactKindSchema,
  artifactRef: nonEmptyStringSchema,
  evidence: z.array(nonEmptyStringSchema).min(1),
  finding: nonEmptyStringSchema,
  requiredCorrection: nonEmptyStringSchema,
})

export const foundationExpertReviewSubmissionSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('foundation_expert_review_submission'),
  jobId: identifierSchema,
  candidateId: identifierSchema,
  reviewedCommit: commitShaSchema,
  foundationFingerprint: sha256Schema,
  reviewers: z.array(foundationExpertReviewerSchema).min(1),
  decision: z.enum(['pass', 'fail_hold']),
  findings: z.array(foundationExpertReviewFindingSchema).default([]),
  evidenceRefs: z.array(nonEmptyStringSchema).min(1),
  knownLimitations: z.array(nonEmptyStringSchema).default([]),
  reviewedAt: nonEmptyStringSchema,
}).superRefine((submission, context) => {
  const materialFinding = submission.findings.some((finding) => ['blocking', 'material'].includes(finding.severity))
  if (materialFinding && submission.decision !== 'fail_hold') {
    context.addIssue({
      code: 'custom',
      path: ['decision'],
      message: 'Blocking/material qualified expert findings require fail_hold',
    })
  }
  if (!materialFinding && submission.decision !== 'pass') {
    context.addIssue({
      code: 'custom',
      path: ['decision'],
      message: 'Qualified expert review without blocking/material findings must pass',
    })
  }
})

function expectedArtifacts(candidate: FoundationCandidate) {
  return [
    {
      artifactKind: 'source_licence_register' as const,
      artifactRef: candidate.sourceLicenceRegister.ref,
      fingerprint: candidate.sourceLicenceRegister.fingerprint,
    },
    {
      artifactKind: 'board_alignment' as const,
      artifactRef: candidate.boardAlignment.ref,
      fingerprint: candidate.boardAlignment.fingerprint,
    },
    {
      artifactKind: 'foundation_coverage_model' as const,
      artifactRef: candidate.coverageModel.ref,
      fingerprint: candidate.coverageModel.fingerprint,
    },
    {
      artifactKind: 'course_knowledge_model' as const,
      artifactRef: candidate.courseKnowledgeModel.ref,
      fingerprint: candidate.courseKnowledgeModel.fingerprint,
    },
    {
      artifactKind: 'assessment_blueprint' as const,
      artifactRef: candidate.assessmentBlueprint.ref,
      fingerprint: candidate.assessmentBlueprint.fingerprint,
    },
    ...candidate.questionFamilies.map((family) => ({
      artifactKind: 'question_family' as const,
      artifactRef: family.ref,
      fingerprint: family.fingerprint,
    })),
  ]
}

export async function buildFoundationExpertReviewPackage(input: {
  jobId: string
  candidate: FoundationCandidate
  reviewedCommit: string
  createdAt: string
  sourceUniverse: {
    profileId: string
    requiredSourceIds: string[]
  }
  externalSourceChallenge: unknown
}) {
  const candidate = foundationCandidateSchema.parse(input.candidate)
  if (candidate.deterministicAssurance.status !== 'pass') {
    throw new Error('Qualified expert review package requires passing deterministic Foundation assurance')
  }
  if (candidate.independentReview.status !== 'pass') {
    throw new Error('Qualified expert review package requires passing independent Foundation review')
  }
  if (candidate.unresolvedBlockers.length > 0) {
    throw new Error('Qualified expert review package cannot contain unresolved Foundation blockers')
  }

  const foundationFingerprint = await computeFoundationFingerprint(candidate)
  if (candidate.deterministicAssurance.foundationFingerprint !== foundationFingerprint) {
    throw new Error('Qualified expert review package contains stale deterministic assurance evidence')
  }
  if (candidate.independentReview.foundationFingerprint !== foundationFingerprint) {
    throw new Error('Qualified expert review package contains stale independent review evidence')
  }

  const sourceUniverse = z.object({
    profileId: identifierSchema,
    requiredSourceIds: z.array(identifierSchema).min(1),
  }).parse(input.sourceUniverse)
  const externalSourceChallenge = validateFoundationExternalSourceChallenge({
    report: input.externalSourceChallenge,
    jobId: input.jobId,
    candidateId: candidate.candidateId,
    reviewedCommit: input.reviewedCommit,
    foundationFingerprint,
    requiredSourceUniverseProfileId: sourceUniverse.profileId,
    requiredSourceIds: sourceUniverse.requiredSourceIds,
    forbiddenContextIds: [
      ...candidate.provenance.generationContextIds,
      ...candidate.provenance.assuranceContextIds,
    ],
  })

  return currentFoundationExpertReviewPackageSchema.parse({
    schemaVersion: 2,
    artifactType: 'foundation_expert_review_package',
    jobId: input.jobId,
    candidateId: candidate.candidateId,
    reviewedCommit: input.reviewedCommit,
    foundationFingerprint,
    candidate,
    requiredReviewScopes: ['subject', 'assessment'],
    artifacts: expectedArtifacts(candidate),
    deterministicAssuranceEvidenceRefs: candidate.deterministicAssurance.evidenceRefs,
    independentReviewEvidenceRefs: candidate.independentReview.evidenceRefs,
    sourceUniverse,
    externalSourceChallenge,
    knownLimitations: candidate.knownLimitations,
    createdAt: input.createdAt,
  })
}

export function validateFoundationExpertReviewSubmission(
  packageInput: unknown,
  submissionInput: unknown,
) {
  const reviewPackage = foundationExpertReviewPackageSchema.parse(packageInput)
  const submission = foundationExpertReviewSubmissionSchema.parse(submissionInput)

  if (submission.jobId !== reviewPackage.jobId) {
    throw new Error('Qualified expert review submission does not match the review package job')
  }
  if (submission.candidateId !== reviewPackage.candidateId) {
    throw new Error('Qualified expert review submission does not match the exact Foundation Candidate')
  }
  if (submission.reviewedCommit !== reviewPackage.reviewedCommit) {
    throw new Error('Qualified expert review submission does not match the reviewed implementation commit')
  }
  if (submission.foundationFingerprint !== reviewPackage.foundationFingerprint) {
    throw new Error('Qualified expert review submission does not match the exact Foundation fingerprint')
  }

  const coveredScopes = new Set(submission.reviewers.flatMap((reviewer) => reviewer.qualificationScopes))
  for (const requiredScope of reviewPackage.requiredReviewScopes) {
    if (!coveredScopes.has(requiredScope)) {
      throw new Error(`Qualified expert review is missing required ${requiredScope} qualification coverage`)
    }
  }

  const packageArtifacts = new Map(
    reviewPackage.artifacts.map((artifact) => [artifact.artifactRef, artifact] as const),
  )
  for (const finding of submission.findings) {
    const artifact = packageArtifacts.get(finding.artifactRef)
    if (!artifact) {
      throw new Error(`Qualified expert finding references artifact outside the exact review package: ${finding.artifactRef}`)
    }
    if (artifact.artifactKind !== finding.artifactKind) {
      throw new Error(`Qualified expert finding artifact kind does not match packaged artifact ${finding.artifactRef}`)
    }
  }

  return submission
}

export type FoundationExpertReviewPackage = z.infer<typeof currentFoundationExpertReviewPackageSchema>
export type HistoricalFoundationExpertReviewPackage = z.infer<typeof historicalFoundationExpertReviewPackageSchema>
export type FoundationExpertReviewSubmission = z.infer<typeof foundationExpertReviewSubmissionSchema>
export type FoundationExpertReviewFinding = z.infer<typeof foundationExpertReviewFindingSchema>
