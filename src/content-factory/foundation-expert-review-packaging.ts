import { z } from 'zod'
import {
  foundationExpertReviewPackageSchema,
  foundationExpertReviewSubmissionSchema,
  type FoundationExpertReviewPackage,
} from './foundation-expert-review'
import { foundationReviewableArtifactKindSchema } from './foundation-independent-review'

const nonEmptyStringSchema = z.string().min(1)
const commitShaSchema = z.string().regex(/^[0-9a-f]{40}$/)

export const foundationExpertReviewResolvedArtifactSchema = z.object({
  artifactKind: foundationReviewableArtifactKindSchema,
  artifactRef: nonEmptyStringSchema,
  fingerprint: nonEmptyStringSchema,
  value: z.unknown(),
})

export const foundationExpertReviewBundleSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('foundation_expert_review_bundle'),
  packagingCommit: commitShaSchema,
  reviewPackage: foundationExpertReviewPackageSchema,
  resolvedArtifacts: z.array(foundationExpertReviewResolvedArtifactSchema).min(1),
}).superRefine((bundle, context) => {
  const packaged = new Map(bundle.reviewPackage.artifacts.map((artifact) => [artifact.artifactRef, artifact] as const))
  const resolved = new Map(bundle.resolvedArtifacts.map((artifact) => [artifact.artifactRef, artifact] as const))

  if (packaged.size !== bundle.reviewPackage.artifacts.length) {
    context.addIssue({ code: 'custom', path: ['reviewPackage', 'artifacts'], message: 'Expert review package contains duplicate artifact references' })
  }
  if (resolved.size !== bundle.resolvedArtifacts.length) {
    context.addIssue({ code: 'custom', path: ['resolvedArtifacts'], message: 'Resolved expert review bundle contains duplicate artifact references' })
  }

  for (const [artifactRef, expected] of packaged) {
    const actual = resolved.get(artifactRef)
    if (!actual) {
      context.addIssue({ code: 'custom', path: ['resolvedArtifacts'], message: `Expert review bundle is missing packaged artifact ${artifactRef}` })
      continue
    }
    if (actual.artifactKind !== expected.artifactKind || actual.fingerprint !== expected.fingerprint) {
      context.addIssue({ code: 'custom', path: ['resolvedArtifacts'], message: `Expert review bundle artifact identity does not match package ${artifactRef}` })
    }
  }

  for (const artifactRef of resolved.keys()) {
    if (!packaged.has(artifactRef)) {
      context.addIssue({ code: 'custom', path: ['resolvedArtifacts'], message: `Expert review bundle contains artifact outside package ${artifactRef}` })
    }
  }
})

export function buildFoundationExpertReviewBundle(input: {
  packagingCommit: string
  reviewPackage: FoundationExpertReviewPackage
  resolvedArtifacts: Array<z.infer<typeof foundationExpertReviewResolvedArtifactSchema>>
}) {
  return foundationExpertReviewBundleSchema.parse({
    schemaVersion: 1,
    artifactType: 'foundation_expert_review_bundle',
    ...input,
  })
}

export function buildFoundationExpertReviewSubmissionTemplate(reviewPackageInput: FoundationExpertReviewPackage) {
  const reviewPackage = foundationExpertReviewPackageSchema.parse(reviewPackageInput)
  return {
    schemaVersion: 1,
    artifactType: 'foundation_expert_review_submission',
    jobId: reviewPackage.jobId,
    candidateId: reviewPackage.candidateId,
    reviewedCommit: reviewPackage.reviewedCommit,
    foundationFingerprint: reviewPackage.foundationFingerprint,
    reviewers: [
      {
        reviewerId: '<qualified-reviewer-id>',
        qualificationScopes: ['subject', 'assessment'],
        qualificationEvidenceRefs: ['<qualification-evidence-ref>'],
      },
    ],
    decision: 'pass',
    findings: [],
    evidenceRefs: ['<completed-review-evidence-ref>'],
    knownLimitations: reviewPackage.knownLimitations,
    reviewedAt: '<ISO-8601-review-timestamp>',
  }
}

export function renderFoundationExpertReviewInstructions(reviewPackageInput: FoundationExpertReviewPackage) {
  const reviewPackage = foundationExpertReviewPackageSchema.parse(reviewPackageInput)
  const artifactLines = reviewPackage.artifacts
    .map((artifact, index) => `${index + 1}. ${artifact.artifactKind} — ${artifact.artifactRef} — ${artifact.fingerprint}`)
    .join('\n')

  return `# Qualified Foundation Expert Review\n\n` +
    `Course: ${reviewPackage.candidate.courseIdentity.awardingBody} ${reviewPackage.candidate.courseIdentity.qualification} ${reviewPackage.candidate.courseIdentity.subject} ${reviewPackage.candidate.courseIdentity.specificationId}\n\n` +
    `Foundation fingerprint: ${reviewPackage.foundationFingerprint}\n` +
    `Candidate: ${reviewPackage.candidateId}\n` +
    `Reviewed implementation commit: ${reviewPackage.reviewedCommit}\n\n` +
    `## Human qualification requirement\n\n` +
    `The completed review must be performed by a genuinely qualified human reviewer or reviewer set covering both subject and assessment expertise. AI review is not a substitute. Record qualification evidence references in the submission.\n\n` +
    `## Review task\n\n` +
    `Review the complete resolved artifact set for educational accuracy, curriculum scope, assessment authenticity, internal consistency and any known limitations. Record every blocking, material or minor issue against the exact artifact reference in the supplied submission template.\n\n` +
    `A blocking or material finding requires fail_hold. A pass is valid only when no blocking or material findings remain.\n\n` +
    `## Exact artifact set\n\n${artifactLines}\n\n` +
    `## Return format\n\nComplete submission-template.json without changing the jobId, candidateId, reviewedCommit or foundationFingerprint. Add reviewer identity, qualification evidence, findings, evidence references and review timestamp.\n`
}

export function assertFoundationExpertReviewSubmissionTemplateShape(template: unknown) {
  const value = template as Record<string, unknown>
  if (value.artifactType !== 'foundation_expert_review_submission') throw new Error('Expert review submission template has the wrong artifact type')
  if (!Array.isArray(value.reviewers) || value.reviewers.length === 0) throw new Error('Expert review submission template requires reviewer placeholders')
  return value
}

export type FoundationExpertReviewBundle = z.infer<typeof foundationExpertReviewBundleSchema>

// Exported only to keep the durable submission schema co-located with packaging consumers.
export { foundationExpertReviewSubmissionSchema }
