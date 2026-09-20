import { describe, expect, it } from 'vitest'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { z } from 'zod'
import { foundationCoverageModelSchema } from './foundation-compilation'
import {
  assureFoundationInternalLearningAssets,
  foundationInternalLearningWorkUnitReviewOutputSchema,
  type FoundationInternalLearningAssuranceWorkers,
} from './foundation-internal-learning-assurance'
import { getFoundationDerivedAssetReleaseProblems } from './foundation-derived-asset'
import { foundationInternalLearningAssetBundleSchema } from './foundation-internal-learning-assets'
import { computeFoundationFingerprint } from './foundation-lifecycle'
import { foundationCandidateSchema, foundationJobSchema } from './foundation-schema'
import { fingerprintValue } from './intake-to-knowledge-model'
import { OpenAIStructuredWorkerClient } from './openai-provider-adapter'
import { courseKnowledgeModelSchema } from './schema'

const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }
const env = runtime.process?.env ?? {}
const liveEnabled = env.CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_ASSURANCE_PROOF === '1'
const evidenceDirectory = '.artifacts/content-factory-foundation-internal-learning-assurance-proof'
const testTimeoutMs = 90 * 60 * 1000

const commitShaSchema = z.string().regex(/^[0-9a-f]{40}$/)
const sha256Schema = z.string().regex(/^[0-9a-f]{64}$/)
const nonEmptyStringSchema = z.string().min(1)
const positiveDecimalStringSchema = z.string().regex(/^[1-9][0-9]*$/)

const sourceArtifactSchema = z.object({
  kind: nonEmptyStringSchema,
  fingerprint: nonEmptyStringSchema,
  ref: nonEmptyStringSchema,
  value: z.unknown(),
})

const sourceProofSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('foundation_live_real_course_proof_evidence'),
  repository: nonEmptyStringSchema,
  contentHeadSha: commitShaSchema,
  jobId: nonEmptyStringSchema,
  candidateId: nonEmptyStringSchema,
  foundationFingerprint: sha256Schema,
  learnerAssetCount: z.number().int().nonnegative(),
  artifacts: z.array(sourceArtifactSchema).min(1),
})

const aiAssuredProofSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('foundation_real_course_ai_assured_proof_evidence'),
  repository: nonEmptyStringSchema,
  challengeImplementationCommit: commitShaSchema,
  reviewedCommit: commitShaSchema,
  foundationFingerprint: sha256Schema,
  jobId: nonEmptyStringSchema,
  candidateId: nonEmptyStringSchema,
  sourceProof: z.object({
    workflowRunId: positiveDecimalStringSchema,
    artifactName: nonEmptyStringSchema,
    artifactDigest: nonEmptyStringSchema,
    contentHeadSha: commitShaSchema,
    foundationFingerprint: sha256Schema,
  }),
  finalState: z.literal('ai_assured'),
  aiAssured: z.literal(true),
  humanReviewStatus: z.literal('pending'),
  foundationApprovalStatus: z.literal('not_approved'),
  learnerPublicationEligible: z.literal(false),
  learnerAssetCount: z.literal(0),
  finalCandidate: foundationCandidateSchema,
})

const generationRunSchema = z.object({
  stage: z.enum(['learn', 'practice']),
  workUnitId: nonEmptyStringSchema,
  status: z.enum(['success', 'failure', 'infrastructure_failure']),
  runId: nonEmptyStringSchema,
  contextId: nonEmptyStringSchema,
  contractVersion: nonEmptyStringSchema,
  provider: nonEmptyStringSchema.optional(),
  model: nonEmptyStringSchema.optional(),
  retryCount: z.number().int().nonnegative().optional(),
  usageCost: z.number().nonnegative().optional(),
  error: nonEmptyStringSchema.optional(),
})

const learningProofSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('foundation_internal_learning_live_proof_evidence'),
  repository: nonEmptyStringSchema,
  generationImplementationCommit: commitShaSchema,
  sourceProof: z.object({
    workflowRunId: positiveDecimalStringSchema,
    artifactName: nonEmptyStringSchema,
    artifactDigest: nonEmptyStringSchema,
    contentHeadSha: commitShaSchema,
    foundationFingerprint: sha256Schema,
  }),
  aiAssuredProof: z.object({
    workflowRunId: positiveDecimalStringSchema,
    artifactName: nonEmptyStringSchema,
    artifactDigest: nonEmptyStringSchema,
    headSha: commitShaSchema,
  }),
  jobId: nonEmptyStringSchema,
  candidateId: nonEmptyStringSchema,
  foundationFingerprint: sha256Schema,
  coverageModelFingerprint: sha256Schema,
  courseKnowledgeModelFingerprint: sha256Schema,
  generationRuns: z.array(generationRunSchema).min(1),
  humanReviewStatus: z.literal('pending'),
  foundationApprovalStatus: z.literal('not_approved'),
  learnerPublicationEligible: z.literal(false),
  status: z.literal('pass'),
  workUnitCount: z.number().int().positive(),
  generationContextCount: z.number().int().positive(),
  contextCollisions: z.array(nonEmptyStringSchema),
  learnAssetStatus: z.literal('pending'),
  practiceAssetStatus: z.literal('pending'),
  learnerAssetCount: z.literal(2),
  bundle: foundationInternalLearningAssetBundleSchema,
})

type ReviewRun = {
  workUnitId: string
  status: 'success' | 'failure' | 'infrastructure_failure'
  runId: string
  contextId: string
  contractVersion: string
  provider?: string
  model?: string
  retryCount?: number
  usageCost?: number
  error?: string
}

function requiredEnv(name: string) {
  const value = env[name]?.trim()
  if (!value) throw new Error(`provider_secret_missing_or_runtime_config_missing:${name}`)
  return value
}

function positiveNumberEnv(name: string, fallback: number) {
  const raw = env[name]?.trim()
  if (!raw) return fallback
  const value = Number(raw)
  if (!Number.isFinite(value) || value <= 0) throw new Error(`invalid_positive_number_runtime_config:${name}`)
  return value
}

function positiveIntegerEnv(name: string, fallback: number) {
  const value = positiveNumberEnv(name, fallback)
  if (!Number.isInteger(value)) throw new Error(`invalid_positive_integer_runtime_config:${name}`)
  return value
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

async function readJson(path: string) {
  return JSON.parse(await readFile(path, 'utf-8')) as unknown
}

function exactArtifact<T>(input: {
  artifacts: z.infer<typeof sourceArtifactSchema>[]
  kind: string
  expectedFingerprint: string
  parse: (value: unknown) => T
}) {
  const matches = input.artifacts.filter((artifact) => artifact.kind === input.kind)
  if (matches.length !== 1) throw new Error(`Expected exactly one ${input.kind} artifact, found ${matches.length}`)
  const artifact = matches[0]
  if (artifact.fingerprint !== input.expectedFingerprint) throw new Error(`${input.kind} artifact fingerprint does not match the AI-assured Candidate`)
  return { artifact, value: input.parse(artifact.value) }
}

function failureMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

function sameSet(left: string[], right: string[]) {
  const a = new Set(left)
  const b = new Set(right)
  return a.size === b.size && [...a].every((value) => b.has(value))
}

describe('Foundation-native live internal Learn/Practice asset assurance proof', () => {
  const liveIt = liveEnabled ? it : it.skip

  liveIt('independently assures the exact retained Business Learn/Practice bundle using fresh review contexts only', async () => {
    const repo = requiredEnv('GITHUB_REPOSITORY')
    const token = requiredEnv('GITHUB_TOKEN')
    const sourceProofPath = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_PROOF_PATH')
    const aiAssuredProofPath = requiredEnv('CONTENT_FACTORY_FOUNDATION_AI_ASSURED_PROOF_PATH')
    const learningProofPath = requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_PROOF_PATH')
    const sourceRunId = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_RUN_ID')
    const sourceArtifactName = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_ARTIFACT_NAME')
    const sourceArtifactDigest = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_ARTIFACT_DIGEST')
    const sourceHeadSha = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_HEAD_SHA')
    const sourceFoundationFingerprint = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_FINGERPRINT')
    const aiAssuredRunId = requiredEnv('CONTENT_FACTORY_FOUNDATION_AI_ASSURED_RUN_ID')
    const aiAssuredArtifactName = requiredEnv('CONTENT_FACTORY_FOUNDATION_AI_ASSURED_ARTIFACT_NAME')
    const aiAssuredArtifactDigest = requiredEnv('CONTENT_FACTORY_FOUNDATION_AI_ASSURED_ARTIFACT_DIGEST')
    const aiAssuredHeadSha = requiredEnv('CONTENT_FACTORY_FOUNDATION_AI_ASSURED_HEAD_SHA')
    const learningRunId = requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_RUN_ID')
    const learningArtifactName = requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_ARTIFACT_NAME')
    const learningArtifactDigest = requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_ARTIFACT_DIGEST')
    const learningHeadSha = requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_HEAD_SHA')
    const foundationFingerprint = requiredEnv('CONTENT_FACTORY_FOUNDATION_FINGERPRINT')
    const implementationCommit = requiredEnv('CONTENT_FACTORY_ASSURANCE_IMPLEMENTATION_COMMIT')
    const githubRunId = requiredEnv('GITHUB_RUN_ID')
    const apiKey = requiredEnv('OPENAI_API_KEY')
    const maxSpendUsd = positiveNumberEnv('CONTENT_FACTORY_ASSURANCE_MAX_SPEND_USD', 12)
    const maxOutputTokens = positiveIntegerEnv('CONTENT_FACTORY_ASSURANCE_MAX_OUTPUT_TOKENS', 5_000)
    const reviewModel = env.CONTENT_FACTORY_ASSURANCE_MODEL?.trim() || 'gpt-5.6-terra'
    const now = new Date().toISOString()

    await mkdir(evidenceDirectory, { recursive: true })
    const failureEvidencePath = `${evidenceDirectory}/live-proof-failure.json`

    try {
      const sourceProof = sourceProofSchema.parse(await readJson(sourceProofPath))
      const aiProof = aiAssuredProofSchema.parse(await readJson(aiAssuredProofPath))
      const learningProof = learningProofSchema.parse(await readJson(learningProofPath))

      expect(sourceProof.repository).toBe(repo)
      expect(aiProof.repository).toBe(repo)
      expect(learningProof.repository).toBe(repo)
      expect(sourceProof.contentHeadSha).toBe(sourceHeadSha)
      expect(sourceProof.foundationFingerprint).toBe(sourceFoundationFingerprint)
      expect(aiProof.challengeImplementationCommit).toBe(aiAssuredHeadSha)
      expect(aiProof.reviewedCommit).toBe(sourceHeadSha)
      expect(aiProof.foundationFingerprint).toBe(foundationFingerprint)
      expect(learningProof.generationImplementationCommit).toBe(learningHeadSha)
      expect(learningProof.foundationFingerprint).toBe(foundationFingerprint)
      expect(learningProof.sourceProof.workflowRunId).toBe(sourceRunId)
      expect(learningProof.sourceProof.artifactName).toBe(sourceArtifactName)
      expect(learningProof.sourceProof.artifactDigest).toBe(sourceArtifactDigest)
      expect(learningProof.aiAssuredProof.workflowRunId).toBe(aiAssuredRunId)
      expect(learningProof.aiAssuredProof.artifactName).toBe(aiAssuredArtifactName)
      expect(learningProof.aiAssuredProof.artifactDigest).toBe(aiAssuredArtifactDigest)
      expect(learningProof.aiAssuredProof.headSha).toBe(aiAssuredHeadSha)
      expect(learningProof.contextCollisions).toEqual([])
      expect(learningProof.generationRuns.every((run) => run.status === 'success')).toBe(true)

      const candidate = foundationCandidateSchema.parse(aiProof.finalCandidate)
      expect(aiProof.jobId).toBe(sourceProof.jobId)
      expect(learningProof.jobId).toBe(aiProof.jobId)
      expect(learningProof.candidateId).toBe(candidate.candidateId)
      expect(await computeFoundationFingerprint(candidate)).toBe(foundationFingerprint)

      const { value: coverageModel } = exactArtifact({
        artifacts: sourceProof.artifacts,
        kind: 'foundation_coverage_model',
        expectedFingerprint: candidate.coverageModel.fingerprint,
        parse: (value) => foundationCoverageModelSchema.parse(value),
      })
      const { value: courseKnowledgeModel } = exactArtifact({
        artifacts: sourceProof.artifacts,
        kind: 'course_knowledge_model',
        expectedFingerprint: candidate.courseKnowledgeModel.fingerprint,
        parse: (value) => courseKnowledgeModelSchema.parse(value),
      })
      expect(learningProof.coverageModelFingerprint).toBe(candidate.coverageModel.fingerprint)
      expect(learningProof.courseKnowledgeModelFingerprint).toBe(candidate.courseKnowledgeModel.fingerprint)
      expect(learningProof.bundle.foundationFingerprint).toBe(foundationFingerprint)
      expect(learningProof.workUnitCount).toBe(learningProof.bundle.workUnits.length)
      expect(learningProof.generationContextCount).toBe(learningProof.bundle.generationContextIds.length)
      expect(sameSet(
        learningProof.generationRuns.map((run) => run.contextId),
        learningProof.bundle.generationContextIds,
      )).toBe(true)

      const job = foundationJobSchema.parse({
        schemaVersion: 1,
        jobId: aiProof.jobId,
        state: 'ai_assured',
        candidate,
        blockers: [],
        createdAt: candidate.provenance.createdAt,
        updatedAt: now,
      })

      const reviewRoute = {
        model: reviewModel,
        inputUsdPerMillion: 2,
        cachedInputUsdPerMillion: 0.2,
        outputUsdPerMillion: 12,
        cacheWriteMultiplier: 1.25,
        longContextThresholdTokens: 272_000,
        longContextInputMultiplier: 2,
        longContextOutputMultiplier: 1.5,
        reasoningEffort: 'high' as const,
        maxOutputTokens,
      }
      const client = new OpenAIStructuredWorkerClient({
        apiKey,
        maxSpendUsd,
        generation: { ...reviewRoute, reasoningEffort: 'medium' },
        independentReview: reviewRoute,
        maxRetries: 2,
      })

      const reviewRuns: ReviewRun[] = []
      const workers: FoundationInternalLearningAssuranceWorkers = {
        async independentReview(input) {
          const execution = await client.run({
            workerId: 'content-factory.foundation-internal-learning-independent-review',
            contractVersion: '1',
            routeKind: 'independent_review',
            outputSchema: foundationInternalLearningWorkUnitReviewOutputSchema,
            instructions: [
              'Act as an adversarial independent educational reviewer for exactly one Foundation-derived AQA A-level Business Learn/Practice work unit.',
              'Review only the supplied Revision-owned learner content against the supplied structured Foundation Course Truth and governed coverage facts.',
              'Do not use or request protected awarding-body prose and do not claim awarding-body endorsement.',
              'Identify factual distortion, omitted conditions, misleading certainty, curriculum drift, weak pedagogy, invalid misconceptions, internally inconsistent practice, incorrect expected responses, and quantitative errors.',
              'Independently recompute any calculations or quantitative conclusions in the generated work unit from the supplied values and formula truth.',
              'Check that Practice genuinely exercises the governed teaching point rather than merely repeating it, and that improvement guidance teaches the correct rule or reasoning habit.',
              'Return blocking/material findings only for issues that make the affected content unsafe or materially misleading; minor findings are non-critical accuracy/clarity issues, not style preferences.',
              'Do not rewrite or improve prose. Return only the issue register and decision.',
              'A clean review returns decision=pass and findings=[]. Any open blocking/material finding requires fail_hold; only open minor findings require conditional_pass.',
              'Copy the exact foundationFingerprint, foundationCandidateId, sourceBundleFingerprint, workUnitId and workUnitFingerprint from the supplied input.',
              'If you create finding IDs, make them globally specific by prefixing the supplied workUnitId.',
            ].join(' '),
            payload: input,
          })
          reviewRuns.push({
            workUnitId: input.plan.id,
            status: execution.status,
            runId: execution.provenance.id,
            contextId: execution.provenance.contextId,
            contractVersion: execution.provenance.contractVersion,
            provider: execution.provenance.provider,
            model: execution.provenance.model,
            retryCount: execution.provenance.retryCount,
            usageCost: execution.provenance.usageCost,
            ...('error' in execution ? { error: execution.error } : {}),
          })
          return execution
        },
      }

      const assuranceEvidenceRef = `github-actions-run:${githubRunId}`
      const result = await assureFoundationInternalLearningAssets({
        job,
        bundle: learningProof.bundle,
        coverageModel,
        courseKnowledgeModel,
        workers,
        assuranceEvidenceRef,
        now,
      })

      const reportedUsageRuns = reviewRuns.filter((run) => typeof run.usageCost === 'number')
      const reportedFinalResponseUsageCostUsd = Number(reportedUsageRuns.reduce((total, run) => total + (run.usageCost ?? 0), 0).toFixed(8))
      const reviewerContextIds = reviewRuns.map((run) => run.contextId)
      const priorContexts = new Set([
        ...candidate.provenance.generationContextIds,
        ...candidate.provenance.assuranceContextIds,
        ...(candidate.externalSourceChallenge ? [candidate.externalSourceChallenge.reviewerContextId] : []),
        ...learningProof.bundle.generationContextIds,
      ])
      const contextCollisions = reviewerContextIds.filter((contextId) => priorContexts.has(contextId))
      const sourceBundleFingerprint = await fingerprintValue(learningProof.bundle)
      const evidencePath = `${evidenceDirectory}/${aiProof.jobId}-internal-learning-assurance.json`

      const evidenceBase = {
        schemaVersion: 1,
        artifactType: 'foundation_internal_learning_assurance_live_proof_evidence',
        recordedAt: new Date().toISOString(),
        repository: repo,
        assuranceImplementationCommit: implementationCommit,
        sourceProof: {
          workflowRunId: sourceRunId,
          artifactName: sourceArtifactName,
          artifactDigest: sourceArtifactDigest,
          contentHeadSha: sourceHeadSha,
          foundationFingerprint: sourceFoundationFingerprint,
        },
        aiAssuredProof: {
          workflowRunId: aiAssuredRunId,
          artifactName: aiAssuredArtifactName,
          artifactDigest: aiAssuredArtifactDigest,
          headSha: aiAssuredHeadSha,
        },
        internalLearningProof: {
          workflowRunId: learningRunId,
          artifactName: learningArtifactName,
          artifactDigest: learningArtifactDigest,
          headSha: learningHeadSha,
          sourceBundleFingerprint,
        },
        jobId: aiProof.jobId,
        candidateId: candidate.candidateId,
        foundationFingerprint,
        courseIdentity: candidate.courseIdentity,
        workUnitCount: learningProof.bundle.workUnits.length,
        generationContextCount: learningProof.bundle.generationContextIds.length,
        reviewerContextCount: reviewerContextIds.length,
        reviewerContextCollisions: contextCollisions,
        reviewModel,
        reviewMaxOutputTokens: maxOutputTokens,
        configuredHardSpendCeilingUsd: maxSpendUsd,
        costTelemetry: {
          reportedFinalResponseUsageCostUsd,
          reportedUsageRunCount: reportedUsageRuns.length,
          reviewRunCount: reviewRuns.length,
          note: 'Final-response usageCost values are retained where the provider reports them. This sum is not retry-complete total spend; the provider client separately enforces the configured hard spend ceiling before starting calls.',
        },
        reviewRuns,
        deterministicAssurance: result.deterministicAssurance,
        independentReview: result.independentReview,
        remediationTargets: result.remediationTargets,
        humanReviewStatus: 'pending' as const,
        foundationApprovalStatus: 'not_approved' as const,
        learnerPublicationEligible: false as const,
      }

      if (contextCollisions.length > 0) throw new Error(`Independent review context collision detected: ${contextCollisions.join(', ')}`)

      if (result.status !== 'pass' || !result.assuredAssets) {
        await writeFile(evidencePath, JSON.stringify({
          ...evidenceBase,
          status: result.status,
          learnAssetStatus: learningProof.bundle.learnAsset.assuranceStatus,
          practiceAssetStatus: learningProof.bundle.practiceAsset.assuranceStatus,
          assuredAssetCount: 0,
        }, null, 2), 'utf-8')
        await addIssueComment(repo, token, 289, [
          'Foundation-native internal Learn/Practice asset assurance did not pass.',
          '',
          `- Course: **AQA A-level Business 7132 — 2027 cohort**`,
          `- Foundation fingerprint: \`${foundationFingerprint}\``,
          `- Generated bundle: run **${learningRunId}** / \`${learningArtifactName}\``,
          `- Assurance decision: **${result.status}**`,
          `- Review work units: **${reviewRuns.length}**`,
          `- Remediation targets: **${result.remediationTargets.length}**`,
          `- Reviewer context collisions: **${contextCollisions.length}**`,
          `- Reported final-response review cost: **$${reportedFinalResponseUsageCostUsd.toFixed(4)}** across **${reportedUsageRuns.length}** runs (not retry-complete total spend)`,
          '',
          'Learn and Practice remain unassured and learner publication remains blocked.',
        ].join('\n'))
        expect(result.status).toBe('pass')
      }

      const releaseProblems = {
        learn: getFoundationDerivedAssetReleaseProblems(result.assuredAssets.learnAsset, job),
        practice: getFoundationDerivedAssetReleaseProblems(result.assuredAssets.practiceAsset, job),
      }
      expect(result.assuredAssets.learnAsset.assuranceStatus).toBe('pass')
      expect(result.assuredAssets.practiceAsset.assuranceStatus).toBe('pass')
      expect(releaseProblems.learn).toContain('Learner release requires qualified-human foundation_approved state')
      expect(releaseProblems.practice).toContain('Learner release requires qualified-human foundation_approved state')
      expect(reviewRuns).toHaveLength(learningProof.bundle.workUnits.length)
      expect(reviewRuns.every((run) => run.status === 'success')).toBe(true)
      expect(new Set(reviewerContextIds).size).toBe(reviewerContextIds.length)

      await writeFile(evidencePath, JSON.stringify({
        ...evidenceBase,
        status: 'pass',
        learnAssetStatus: result.assuredAssets.learnAsset.assuranceStatus,
        practiceAssetStatus: result.assuredAssets.practiceAsset.assuranceStatus,
        assuredAssetCount: 2,
        assuredAssets: result.assuredAssets,
        releaseProblems,
      }, null, 2), 'utf-8')

      await addIssueComment(repo, token, 289, [
        'Foundation-native internal Learn/Practice asset assurance passed.',
        '',
        `- Course: **AQA A-level Business 7132 — 2027 cohort**`,
        `- Foundation fingerprint: \`${foundationFingerprint}\``,
        `- Generated bundle: run **${learningRunId}** / \`${learningArtifactName}\``,
        `- Work units independently reviewed: **${reviewRuns.length}**`,
        `- Fresh reviewer contexts: **${reviewerContextIds.length}**`,
        `- Reviewer context collisions: **${contextCollisions.length}**`,
        `- Learn assurance: **PASS**`,
        `- Practice assurance: **PASS**`,
        `- Reported final-response review cost: **$${reportedFinalResponseUsageCostUsd.toFixed(4)}** across **${reportedUsageRuns.length}** runs (not retry-complete total spend)`,
        '',
        'The assets remain pre-production. Qualified-human Foundation approval is still pending and learner publication remains blocked.',
      ].join('\n'))
    } catch (error) {
      await writeFile(failureEvidencePath, JSON.stringify({
        schemaVersion: 1,
        artifactType: 'foundation_internal_learning_assurance_live_proof_failure_evidence',
        recordedAt: new Date().toISOString(),
        repository: env.GITHUB_REPOSITORY ?? 'unknown',
        assuranceImplementationCommit: env.CONTENT_FACTORY_ASSURANCE_IMPLEMENTATION_COMMIT ?? 'unknown',
        foundationFingerprint: env.CONTENT_FACTORY_FOUNDATION_FINGERPRINT ?? 'unknown',
        humanReviewStatus: 'pending',
        foundationApprovalStatus: 'not_approved',
        learnerPublicationEligible: false,
        status: 'fail_hold',
        failure: failureMessage(error),
      }, null, 2), 'utf-8')
      throw error
    }
  }, testTimeoutMs)
})
