import { describe, expect, it } from 'vitest'
import { mkdir, writeFile } from 'node:fs/promises'
import { z } from 'zod'
import { foundationCandidateSchema } from './foundation-schema'
import { computeFoundationFingerprint } from './foundation-lifecycle'
import { foundationReviewableArtifactKindSchema } from './foundation-independent-review'
import { buildFoundationExpertReviewPackage } from './foundation-expert-review'
import {
  buildFoundationExpertReviewBundle,
  buildFoundationExpertReviewSubmissionTemplate,
  renderFoundationExpertReviewInstructions,
} from './foundation-expert-review-packaging'
import { buildAqa7132FoundationExpertReviewCoverageReconciliation } from './foundation-expert-review-reconciliation'

const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }
const env = runtime.process?.env ?? {}
const proofEnabled = env.CONTENT_FACTORY_FOUNDATION_EXPERT_REVIEW_PACKAGE_PROOF === '1'
const evidenceDirectory = '.artifacts/content-factory-foundation-expert-review-package'

const storedArtifactSchema = z.object({
  kind: foundationReviewableArtifactKindSchema,
  fingerprint: z.string().min(1),
  ref: z.string().min(1),
  value: z.unknown(),
})

const retainedArtifactWriteSchema = z.object({
  kind: z.string().min(1),
  fingerprint: z.string().min(1),
  ref: z.string().min(1),
  value: z.unknown(),
})

const sourceProofSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('foundation_live_real_course_proof_evidence'),
  repository: z.string().min(1),
  contentHeadSha: z.string().regex(/^[0-9a-f]{40}$/),
  jobId: z.string().min(1),
  candidateId: z.string().min(1),
  foundationFingerprint: z.string().regex(/^[0-9a-f]{64}$/),
  learnerAssetCount: z.number().int().nonnegative(),
  artifacts: z.array(storedArtifactSchema).min(1),
  candidate: foundationCandidateSchema,
})

const reviewProofSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('foundation_real_course_independent_review_proof_evidence'),
  repository: z.string().min(1),
  reviewedCommit: z.string().regex(/^[0-9a-f]{40}$/),
  sourceProof: z.object({
    workflowRunId: z.string().min(1),
    artifactName: z.string().min(1),
    artifactDigest: z.string().min(1),
    contentHeadSha: z.string().regex(/^[0-9a-f]{40}$/),
    jobId: z.string().min(1),
    candidateId: z.string().min(1),
    foundationFingerprint: z.string().regex(/^[0-9a-f]{64}$/),
  }),
  finalFoundationFingerprint: z.string().regex(/^[0-9a-f]{64}$/),
  deterministicAssuranceStatus: z.literal('pass'),
  independentReviewStatus: z.literal('pass'),
  finalCandidateUnresolvedBlockers: z.array(z.unknown()).length(0),
  finalCandidate: foundationCandidateSchema,
  learnerAssetCount: z.number().int().nonnegative(),
  finalPass: z.literal(true),
  newArtifacts: z.array(retainedArtifactWriteSchema).default([]),
})

function toReviewableStoredArtifact(artifact: z.infer<typeof retainedArtifactWriteSchema>) {
  const kind = foundationReviewableArtifactKindSchema.safeParse(artifact.kind)
  if (!kind.success) return null
  return storedArtifactSchema.parse({ ...artifact, kind: kind.data })
}

function requiredEnv(name: string) {
  const value = env[name]?.trim()
  if (!value) throw new Error(`runtime_config_missing:${name}`)
  return value
}

async function readUtf8File(path: string) {
  const fsPromises = await import('node:fs/promises') as unknown as {
    readFile(path: string, encoding: 'utf-8'): Promise<string>
  }
  return fsPromises.readFile(path, 'utf-8')
}

function safeArtifactFilename(index: number, kind: string) {
  return `${String(index + 1).padStart(2, '0')}-${kind}.json`
}

describe('Foundation retained artifact write classification', () => {
  it('keeps assurance-report evidence out of the reviewable Foundation artifact overlay', () => {
    expect(toReviewableStoredArtifact({
      kind: 'foundation_deterministic_assurance_report',
      fingerprint: 'assurance-fingerprint',
      ref: 'foundation:assurance-report',
      value: { status: 'pass' },
    })).toBeNull()

    expect(toReviewableStoredArtifact({
      kind: 'question_family',
      fingerprint: 'question-family-fingerprint',
      ref: 'foundation:question-family',
      value: { status: 'not_calibrated' },
    })?.kind).toBe('question_family')
  })
})

describe('Foundation retained real-course expert review package proof', () => {
  const proofIt = proofEnabled ? it : it.skip

  proofIt('assembles the exact assured AQA 7132 Foundation and explicit source-led reconciliation into a portable qualified-human review bundle', async () => {
    const sourceProofPath = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_PROOF_PATH')
    const reviewProofPath = requiredEnv('CONTENT_FACTORY_FOUNDATION_REVIEW_PROOF_PATH')
    const expectedSourceHead = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_HEAD_SHA')
    const expectedSourceFingerprint = requiredEnv('CONTENT_FACTORY_FOUNDATION_FINGERPRINT')
    const expectedReviewedCommit = requiredEnv('CONTENT_FACTORY_FOUNDATION_REVIEWED_COMMIT')
    const packagingCommit = requiredEnv('CONTENT_FACTORY_PACKAGING_COMMIT')
    const repo = requiredEnv('GITHUB_REPOSITORY')

    const sourceProof = sourceProofSchema.parse(JSON.parse(await readUtf8File(sourceProofPath)))
    const reviewProof = reviewProofSchema.parse(JSON.parse(await readUtf8File(reviewProofPath)))

    expect(sourceProof.repository).toBe(repo)
    expect(reviewProof.repository).toBe(repo)
    expect(sourceProof.contentHeadSha).toBe(expectedSourceHead)
    expect(sourceProof.foundationFingerprint).toBe(expectedSourceFingerprint)
    expect(reviewProof.sourceProof.foundationFingerprint).toBe(expectedSourceFingerprint)
    expect(reviewProof.finalFoundationFingerprint).toBe(expectedSourceFingerprint)
    expect(reviewProof.reviewedCommit).toBe(expectedReviewedCommit)
    expect(sourceProof.learnerAssetCount).toBe(0)
    expect(reviewProof.learnerAssetCount).toBe(0)
    expect(reviewProof.finalCandidate.candidateId).toBe(sourceProof.candidateId)
    expect(await computeFoundationFingerprint(reviewProof.finalCandidate)).toBe(expectedSourceFingerprint)

    const reviewPackage = await buildFoundationExpertReviewPackage({
      jobId: sourceProof.jobId,
      candidate: reviewProof.finalCandidate,
      reviewedCommit: reviewProof.reviewedCommit,
      createdAt: new Date().toISOString(),
    })

    const availableArtifacts = new Map<string, z.infer<typeof storedArtifactSchema>>()
    for (const artifact of sourceProof.artifacts) {
      availableArtifacts.set(artifact.ref, artifact)
    }
    for (const artifact of reviewProof.newArtifacts) {
      const reviewableArtifact = toReviewableStoredArtifact(artifact)
      if (reviewableArtifact) availableArtifacts.set(reviewableArtifact.ref, reviewableArtifact)
    }

    const resolvedArtifacts = reviewPackage.artifacts.map((expected) => {
      const actual = availableArtifacts.get(expected.artifactRef)
      if (!actual) throw new Error(`Expert review package artifact is unavailable: ${expected.artifactRef}`)
      if (actual.kind !== expected.artifactKind) throw new Error(`Expert review package artifact kind mismatch: ${expected.artifactRef}`)
      if (actual.fingerprint !== expected.fingerprint) throw new Error(`Expert review package artifact fingerprint mismatch: ${expected.artifactRef}`)
      return {
        artifactKind: expected.artifactKind,
        artifactRef: expected.artifactRef,
        fingerprint: expected.fingerprint,
        value: actual.value,
      }
    })

    const coverageReconciliation = buildAqa7132FoundationExpertReviewCoverageReconciliation({
      candidate: reviewProof.finalCandidate,
      resolvedArtifacts,
    })
    const bundle = buildFoundationExpertReviewBundle({
      packagingCommit,
      reviewPackage,
      resolvedArtifacts,
      coverageReconciliation,
    })
    const submissionTemplate = buildFoundationExpertReviewSubmissionTemplate(reviewPackage)
    const instructions = renderFoundationExpertReviewInstructions(bundle)

    expect(bundle.schemaVersion).toBe(2)
    expect(bundle.reviewPackage.foundationFingerprint).toBe(expectedSourceFingerprint)
    expect(bundle.resolvedArtifacts).toHaveLength(reviewPackage.artifacts.length)
    expect(bundle.resolvedArtifacts).toHaveLength(5 + reviewProof.finalCandidate.questionFamilies.length)
    expect(bundle.coverageReconciliation.status).toBe('complete')
    expect(bundle.coverageReconciliation.curriculum.length).toBeGreaterThan(0)
    expect(bundle.coverageReconciliation.exam.length).toBeGreaterThan(0)
    expect(reviewPackage.requiredReviewScopes).toEqual(['subject', 'assessment'])
    expect(instructions).toContain('coverage-reconciliation.json')

    await mkdir(`${evidenceDirectory}/artifacts`, { recursive: true })
    await writeFile(`${evidenceDirectory}/expert-review-bundle.json`, JSON.stringify(bundle, null, 2), 'utf-8')
    await writeFile(`${evidenceDirectory}/review-package.json`, JSON.stringify(reviewPackage, null, 2), 'utf-8')
    await writeFile(`${evidenceDirectory}/coverage-reconciliation.json`, JSON.stringify(coverageReconciliation, null, 2), 'utf-8')
    await writeFile(`${evidenceDirectory}/submission-template.json`, JSON.stringify(submissionTemplate, null, 2), 'utf-8')
    await writeFile(`${evidenceDirectory}/review-instructions.md`, instructions, 'utf-8')

    for (const [index, artifact] of bundle.resolvedArtifacts.entries()) {
      await writeFile(
        `${evidenceDirectory}/artifacts/${safeArtifactFilename(index, artifact.artifactKind)}`,
        JSON.stringify(artifact, null, 2),
        'utf-8',
      )
    }

    await writeFile(`${evidenceDirectory}/manifest.json`, JSON.stringify({
      schemaVersion: 2,
      artifactType: 'foundation_real_course_expert_review_package_evidence',
      recordedAt: new Date().toISOString(),
      repository: repo,
      packagingCommit,
      foundationFingerprint: reviewPackage.foundationFingerprint,
      reviewedCommit: reviewPackage.reviewedCommit,
      jobId: reviewPackage.jobId,
      candidateId: reviewPackage.candidateId,
      sourceProof: {
        workflowRunId: requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_RUN_ID'),
        artifactName: requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_ARTIFACT_NAME'),
        artifactDigest: requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_ARTIFACT_DIGEST'),
      },
      assuranceProof: {
        workflowRunId: requiredEnv('CONTENT_FACTORY_FOUNDATION_REVIEW_RUN_ID'),
        artifactName: requiredEnv('CONTENT_FACTORY_FOUNDATION_REVIEW_ARTIFACT_NAME'),
        artifactDigest: requiredEnv('CONTENT_FACTORY_FOUNDATION_REVIEW_ARTIFACT_DIGEST'),
      },
      coverageReconciliation: {
        status: coverageReconciliation.status,
        curriculumProfileId: coverageReconciliation.curriculumProfileId,
        curriculumObligationCount: coverageReconciliation.curriculum.length,
        examProfileId: coverageReconciliation.examProfileId,
        examObligationCount: coverageReconciliation.exam.length,
      },
      requiredReviewScopes: reviewPackage.requiredReviewScopes,
      artifactCount: bundle.resolvedArtifacts.length,
      learnerAssetCount: 0,
      humanReviewStatus: 'pending',
      foundationApprovalStatus: 'not_approved',
    }, null, 2), 'utf-8')
  })
})
