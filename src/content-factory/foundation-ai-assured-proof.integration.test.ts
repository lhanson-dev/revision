import { describe, expect, it } from 'vitest'
import { mkdir, writeFile } from 'node:fs/promises'
import { z } from 'zod'
import { foundationCandidateSchema, foundationJobSchema } from './foundation-schema'
import {
  computeFoundationFingerprint,
  markFoundationAiAssured,
  recordFoundationExternalSourceChallenge,
} from './foundation-lifecycle'
import { foundationReviewableArtifactKindSchema } from './foundation-independent-review'
import { runAqa7132LiveExternalSourceChallenge } from './foundation-external-source-challenge-live'
import {
  AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE,
  AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE_PROFILE_ID,
} from './source-seeds/aqa-a-level-business-7132-2027-source-universe'

const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }
const env = runtime.process?.env ?? {}
const proofEnabled = env.CONTENT_FACTORY_FOUNDATION_AI_ASSURED_PROOF === '1'
const evidenceDirectory = '.artifacts/content-factory-foundation-ai-assured-proof'
const testTimeoutMs = 20 * 60 * 1000

const storedArtifactSchema = z.object({
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
  generationContextIds: z.array(z.string().min(1)).min(1),
  reviewContextIds: z.array(z.string().min(1)).min(1),
  remediationContextIds: z.array(z.string().min(1)),
  finalState: z.literal('assuring'),
  finalOperationalBlockers: z.array(z.unknown()).length(0),
  finalCandidateId: z.string().min(1),
  finalFoundationFingerprint: z.string().regex(/^[0-9a-f]{64}$/),
  deterministicAssuranceStatus: z.literal('pass'),
  independentReviewStatus: z.literal('pass'),
  finalCandidateUnresolvedBlockers: z.array(z.unknown()).length(0),
  newArtifacts: z.array(storedArtifactSchema).default([]),
  finalCandidate: foundationCandidateSchema,
  learnerAssetCount: z.number().int().nonnegative(),
  finalPass: z.literal(true),
})

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

function githubHeaders(token: string) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  }
}

async function addIssueComment(repo: string, token: string, issueNumber: number, body: string) {
  const response = await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}/comments`, {
    method: 'POST',
    headers: githubHeaders(token),
    body: JSON.stringify({ body }),
  })
  if (!response.ok) throw new Error(`GitHub issue comment failed with HTTP ${response.status}: ${(await response.text()).slice(0, 500)}`)
}

function toResolvedArtifact(artifact: z.infer<typeof storedArtifactSchema>) {
  const kind = foundationReviewableArtifactKindSchema.safeParse(artifact.kind)
  if (!kind.success) return null
  return {
    artifactKind: kind.data,
    artifactRef: artifact.ref,
    fingerprint: artifact.fingerprint,
    value: artifact.value,
  }
}

describe('Foundation retained real-course AI assurance proof', () => {
  const proofIt = proofEnabled ? it : it.skip

  proofIt('freshly challenges the exact AQA 7132 Foundation and enters ai_assured without claiming human approval', async () => {
    const sourceProofPath = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_PROOF_PATH')
    const reviewProofPath = requiredEnv('CONTENT_FACTORY_FOUNDATION_REVIEW_PROOF_PATH')
    const expectedSourceHead = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_HEAD_SHA')
    const expectedSourceFingerprint = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_FINGERPRINT')
    const expectedFoundationFingerprint = requiredEnv('CONTENT_FACTORY_FOUNDATION_FINGERPRINT')
    const expectedReviewedCommit = requiredEnv('CONTENT_FACTORY_FOUNDATION_REVIEWED_COMMIT')
    const challengeImplementationCommit = requiredEnv('CONTENT_FACTORY_CHALLENGE_IMPLEMENTATION_COMMIT')
    const sourceRunId = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_RUN_ID')
    const sourceArtifactName = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_ARTIFACT_NAME')
    const sourceArtifactDigest = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_ARTIFACT_DIGEST')
    const reviewRunId = requiredEnv('CONTENT_FACTORY_FOUNDATION_REVIEW_RUN_ID')
    const reviewArtifactName = requiredEnv('CONTENT_FACTORY_FOUNDATION_REVIEW_ARTIFACT_NAME')
    const reviewArtifactDigest = requiredEnv('CONTENT_FACTORY_FOUNDATION_REVIEW_ARTIFACT_DIGEST')
    const repo = requiredEnv('GITHUB_REPOSITORY')
    const token = requiredEnv('GITHUB_TOKEN')
    const now = new Date().toISOString()

    const sourceProof = sourceProofSchema.parse(JSON.parse(await readUtf8File(sourceProofPath)))
    const reviewProof = reviewProofSchema.parse(JSON.parse(await readUtf8File(reviewProofPath)))

    expect(sourceProof.repository).toBe(repo)
    expect(reviewProof.repository).toBe(repo)
    expect(sourceProof.contentHeadSha).toBe(expectedSourceHead)
    expect(sourceProof.foundationFingerprint).toBe(expectedSourceFingerprint)
    expect(reviewProof.sourceProof.workflowRunId).toBe(sourceRunId)
    expect(reviewProof.sourceProof.artifactName).toBe(sourceArtifactName)
    expect(reviewProof.sourceProof.artifactDigest).toBe(sourceArtifactDigest)
    expect(reviewProof.reviewedCommit).toBe(expectedReviewedCommit)
    expect(reviewProof.finalFoundationFingerprint).toBe(expectedFoundationFingerprint)
    expect(await computeFoundationFingerprint(reviewProof.finalCandidate)).toBe(expectedFoundationFingerprint)
    expect(sourceProof.learnerAssetCount).toBe(0)
    expect(reviewProof.learnerAssetCount).toBe(0)

    const availableArtifacts = new Map<string, ReturnType<typeof toResolvedArtifact>>()
    for (const artifact of sourceProof.artifacts) {
      const resolved = toResolvedArtifact(artifact)
      if (resolved) availableArtifacts.set(resolved.artifactRef, resolved)
    }
    for (const artifact of reviewProof.newArtifacts) {
      const resolved = toResolvedArtifact(artifact)
      if (resolved) availableArtifacts.set(resolved.artifactRef, resolved)
    }
    const resolvedArtifacts = [...availableArtifacts.values()].filter((value): value is NonNullable<typeof value> => value !== null)

    const challenge = await runAqa7132LiveExternalSourceChallenge({
      candidate: reviewProof.finalCandidate,
      resolvedArtifacts,
      checkedAt: now,
    })

    const priorContexts = [...new Set([
      ...reviewProof.generationContextIds,
      ...reviewProof.reviewContextIds,
      ...reviewProof.remediationContextIds,
    ])]
    for (const contextId of priorContexts) {
      expect(challenge.report.excludedContextIds).toContain(contextId)
      expect(challenge.report.reviewerContextId).not.toBe(contextId)
    }
    expect(challenge.report.challengedSourceIds).toEqual(
      AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE.map((entry) => entry.sourceId),
    )
    expect(challenge.sourceChecks).toHaveLength(AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE.length)
    expect(challenge.coverageReconciliation?.status).toBe('complete')

    let job = foundationJobSchema.parse({
      schemaVersion: 1,
      jobId: sourceProof.jobId,
      state: 'assuring',
      candidate: reviewProof.finalCandidate,
      blockers: [],
      createdAt: sourceProof.candidate.provenance.createdAt,
      updatedAt: now,
    })
    job = await recordFoundationExternalSourceChallenge(job, {
      report: challenge.report,
      requiredSourceUniverseProfileId: AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE_PROFILE_ID,
      requiredSourceIds: AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE.map((entry) => entry.sourceId),
    }, now)

    if (challenge.report.decision === 'pass') {
      job = await markFoundationAiAssured(job, now)
    }

    const evidence = {
      schemaVersion: 1,
      artifactType: 'foundation_real_course_ai_assured_proof_evidence',
      recordedAt: now,
      repository: repo,
      challengeImplementationCommit,
      reviewedCommit: expectedReviewedCommit,
      foundationFingerprint: expectedFoundationFingerprint,
      jobId: sourceProof.jobId,
      candidateId: reviewProof.finalCandidate.candidateId,
      sourceProof: {
        workflowRunId: sourceRunId,
        artifactName: sourceArtifactName,
        artifactDigest: sourceArtifactDigest,
        contentHeadSha: expectedSourceHead,
        foundationFingerprint: expectedSourceFingerprint,
      },
      independentReviewProof: {
        workflowRunId: reviewRunId,
        artifactName: reviewArtifactName,
        artifactDigest: reviewArtifactDigest,
        reviewedCommit: expectedReviewedCommit,
        finalFoundationFingerprint: expectedFoundationFingerprint,
      },
      externalSourceChallenge: challenge.report,
      externalSourceLiveChecks: challenge.sourceChecks,
      coverageReconciliation: challenge.coverageReconciliation,
      finalState: job.state,
      aiAssured: job.state === 'ai_assured',
      humanReviewStatus: 'pending',
      foundationApprovalStatus: 'not_approved',
      learnerPublicationEligible: false,
      learnerAssetCount: 0,
      finalCandidate: job.candidate,
    }

    await mkdir(evidenceDirectory, { recursive: true })
    const evidencePath = `${evidenceDirectory}/${sourceProof.jobId}-ai-assured.json`
    await writeFile(evidencePath, JSON.stringify(evidence, null, 2), 'utf-8')

    await addIssueComment(repo, token, 289, [
      'AI-Assured Foundation retained real-course proof completed.',
      '',
      `- Source proof workflow run: \`${sourceRunId}\``,
      `- Independent review workflow run: \`${reviewRunId}\``,
      `- Candidate implementation commit: \`${expectedReviewedCommit}\``,
      `- External challenge implementation commit: \`${challengeImplementationCommit}\``,
      `- Course: **AQA A-level Business 7132 — 2027 cohort**`,
      `- Foundation fingerprint: \`${expectedFoundationFingerprint}\``,
      `- Governed source universe: \`${AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE_PROFILE_ID}\``,
      `- Fresh official sources checked: **${challenge.sourceChecks.length}/${AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE.length}**`,
      `- External-source challenge decision: **${challenge.report.decision}**`,
      `- External-source challenge findings: **${challenge.report.findings.length}**`,
      `- Final Foundation state: **${job.state}**`,
      '- Qualified-human review: **pending**',
      '- Learner publication eligibility: **false**',
      '- Learner-facing assets generated by this proof: **0**',
      '',
      job.state === 'ai_assured'
        ? 'AI assurance gate PASS: this exact Foundation is now eligible for controlled internal Learn/Practice/Exam Prep derivation, site integration and internal testing. It is not `foundation_approved` and must not be learner-published until qualified-human approval of the exact fingerprint.'
        : 'AI assurance gate is on fail_hold. Controlled internal asset derivation must not start until the exact Foundation passes the fresh external-source challenge.',
    ].join('\n'))

    expect(challenge.report.decision).toBe('pass')
    expect(challenge.report.findings).toEqual([])
    expect(job.state).toBe('ai_assured')
    expect(job.candidate?.externalSourceChallenge?.foundationFingerprint).toBe(expectedFoundationFingerprint)
    expect(job.candidate?.externalSourceChallenge?.decision).toBe('pass')
    expect(evidence.learnerPublicationEligible).toBe(false)
  }, testTimeoutMs)
})
