import { z } from 'zod'
import {
  currentFoundationExpertReviewPackageSchema,
  historicalFoundationExpertReviewPackageSchema,
  foundationExpertReviewSubmissionSchema,
  type FoundationExpertReviewPackage,
} from './foundation-expert-review'
import { foundationReviewableArtifactKindSchema } from './foundation-independent-review'
import { foundationExpertReviewCoverageReconciliationSchema } from './foundation-expert-review-reconciliation'

const nonEmptyStringSchema = z.string().min(1)
const commitShaSchema = z.string().regex(/^[0-9a-f]{40}$/)

export const foundationExpertReviewResolvedArtifactSchema = z.object({
  artifactKind: foundationReviewableArtifactKindSchema,
  artifactRef: nonEmptyStringSchema,
  fingerprint: nonEmptyStringSchema,
  value: z.unknown(),
})

type ResolvedArtifact = z.infer<typeof foundationExpertReviewResolvedArtifactSchema>
type PackageArtifactIdentity = { artifactKind: string; artifactRef: string; fingerprint: string }

function validateResolvedArtifacts(
  bundle: {
    reviewPackage: { artifacts: PackageArtifactIdentity[] }
    resolvedArtifacts: ResolvedArtifact[]
  },
  context: z.RefinementCtx,
) {
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
}

const foundationExpertReviewBundleV1Schema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('foundation_expert_review_bundle'),
  packagingCommit: commitShaSchema,
  reviewPackage: historicalFoundationExpertReviewPackageSchema,
  resolvedArtifacts: z.array(foundationExpertReviewResolvedArtifactSchema).min(1),
}).superRefine(validateResolvedArtifacts)

export const foundationExpertReviewBundleV2Schema = z.object({
  schemaVersion: z.literal(2),
  artifactType: z.literal('foundation_expert_review_bundle'),
  packagingCommit: commitShaSchema,
  reviewPackage: currentFoundationExpertReviewPackageSchema,
  resolvedArtifacts: z.array(foundationExpertReviewResolvedArtifactSchema).min(1),
  coverageReconciliation: foundationExpertReviewCoverageReconciliationSchema,
}).superRefine((bundle, context) => {
  validateResolvedArtifacts(bundle, context)
  const resolvedRefs = new Set(bundle.resolvedArtifacts.map((artifact) => artifact.artifactRef))
  const reconciliationRefs = [
    bundle.coverageReconciliation.sourceLicenceRegisterRef,
    ...bundle.coverageReconciliation.curriculum.flatMap((item) => item.resolvedArtifactRefs),
    ...bundle.coverageReconciliation.exam.flatMap((item) => item.resolvedArtifactRefs),
  ]
  for (const artifactRef of reconciliationRefs) {
    if (!resolvedRefs.has(artifactRef)) {
      context.addIssue({
        code: 'custom',
        path: ['coverageReconciliation'],
        message: `Coverage reconciliation references artifact outside exact review bundle ${artifactRef}`,
      })
    }
  }
})

export const foundationExpertReviewBundleSchema = z.union([
  foundationExpertReviewBundleV1Schema,
  foundationExpertReviewBundleV2Schema,
])

export function buildFoundationExpertReviewBundle(input: {
  packagingCommit: string
  reviewPackage: FoundationExpertReviewPackage
  resolvedArtifacts: ResolvedArtifact[]
  coverageReconciliation: z.infer<typeof foundationExpertReviewCoverageReconciliationSchema>
}) {
  return foundationExpertReviewBundleV2Schema.parse({
    schemaVersion: 2,
    artifactType: 'foundation_expert_review_bundle',
    ...input,
  })
}

export function buildFoundationExpertReviewSubmissionTemplate(reviewPackageInput: FoundationExpertReviewPackage) {
  const reviewPackage = currentFoundationExpertReviewPackageSchema.parse(reviewPackageInput)
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
    decision: '<pass-or-fail_hold>',
    findings: [],
    evidenceRefs: ['<completed-review-evidence-ref>'],
    knownLimitations: reviewPackage.knownLimitations,
    reviewedAt: '<ISO-8601-review-timestamp>',
  }
}

export function renderFoundationExpertReviewInstructions(bundleInput: z.infer<typeof foundationExpertReviewBundleV2Schema>) {
  const bundle = foundationExpertReviewBundleV2Schema.parse(bundleInput)
  const reviewPackage = bundle.reviewPackage
  const reconciliation = bundle.coverageReconciliation
  const challenge = reviewPackage.externalSourceChallenge
  const artifactLines = reviewPackage.artifacts
    .map((artifact, index) => `${index + 1}. ${artifact.artifactKind} — ${artifact.artifactRef} — ${artifact.fingerprint}`)
    .join('\n')

  return `# Qualified Foundation Expert Review\n\n` +
    `Course: ${reviewPackage.candidate.courseIdentity.awardingBody} ${reviewPackage.candidate.courseIdentity.qualification} ${reviewPackage.candidate.courseIdentity.subject} ${reviewPackage.candidate.courseIdentity.specificationId}\n\n` +
    `Foundation fingerprint: ${reviewPackage.foundationFingerprint}\n` +
    `Candidate: ${reviewPackage.candidateId}\n` +
    `Reviewed implementation commit: ${reviewPackage.reviewedCommit}\n` +
    `Source universe: ${reviewPackage.sourceUniverse.profileId} — ${reviewPackage.sourceUniverse.requiredSourceIds.length} required sources\n` +
    `External-source challenge: ${challenge.challengeId} — ${challenge.decision} — ${challenge.challengedSourceIds.length} sources challenged\n` +
    `Curriculum reconciliation: ${reconciliation.curriculumProfileId} — ${reconciliation.curriculum.length} applicable obligations — ${reconciliation.status}\n` +
    `Exam reconciliation: ${reconciliation.examProfileId} — ${reconciliation.exam.length} applicable obligations — ${reconciliation.status}\n\n` +
    `## Human qualification requirement\n\n` +
    `The completed review must be performed by a genuinely qualified human reviewer or reviewer set covering both subject and assessment expertise. AI review is not a substitute. Record qualification evidence references in the submission.\n\n` +
    `## Pre-human assurance boundary\n\n` +
    `This package was allowed to exist only after deterministic assurance, ordinary fresh-context independent review and a separate fresh-context external-source challenge passed for this exact Foundation fingerprint. The external challenge deliberately assumed Revision's own source/requirement universe could be incomplete and challenged it against the independently declared source universe. These controls reduce avoidable omissions; they do not replace expert judgement.\n\n` +
    `## Review task\n\n` +
    `Review the complete resolved artifact set for educational accuracy, curriculum scope, assessment authenticity, internal consistency and any known limitations. Record every blocking, material or minor issue against the exact artifact reference in the supplied submission template.\n\n` +
    `The supplied coverage-reconciliation.json is a mandatory review artifact. It exposes the source-led curriculum and exam requirement universes separately from the generated Foundation, together with their source references and exact Course Truth / Exam Truth artifact mappings. Do not infer completeness solely from the generated artifact structure.\n\n` +
    `Do not treat prior deterministic assurance, independent AI review or the external-source challenge as proof that the curriculum/exam requirement universe itself is correct. Challenge whether the Curriculum Coverage Map covers the complete applicable curriculum for this exact cohort, then verify that Course Truth satisfies every obligation accurately and at sufficient depth.\n\n` +
    `Separately challenge the Exam Coverage Map against the applicable assessment specification and current governed exam evidence. Verify component structure, question/response families, assessment-objective demand, quantitative requirements, marking/response expectations and any explicit pre-calibration boundaries. If an applicable curriculum or exam requirement is absent from the reconciliation, that omission is itself a Foundation defect.\n\n` +
    `A blocking or material finding requires fail_hold. A pass is valid only when no blocking or material findings remain.\n\n` +
    `## Exact artifact set\n\n${artifactLines}\n\n` +
    `## Return format\n\nComplete submission-template.json without changing the jobId, candidateId, reviewedCommit or foundationFingerprint. Replace the decision placeholder explicitly with pass or fail_hold based on the completed review; do not assume a pass. Add reviewer identity, qualification evidence, findings, evidence references and review timestamp.\n`
}

export function assertFoundationExpertReviewSubmissionTemplateShape(template: unknown) {
  const value = template as Record<string, unknown>
  if (value.artifactType !== 'foundation_expert_review_submission') throw new Error('Expert review submission template has the wrong artifact type')
  if (!Array.isArray(value.reviewers) || value.reviewers.length === 0) throw new Error('Expert review submission template requires reviewer placeholders')
  return value
}

export type FoundationExpertReviewBundle = z.infer<typeof foundationExpertReviewBundleV2Schema>
export type HistoricalFoundationExpertReviewBundle = z.infer<typeof foundationExpertReviewBundleV1Schema>

// Exported only to keep the durable submission schema co-located with packaging consumers.
export { foundationExpertReviewSubmissionSchema }
