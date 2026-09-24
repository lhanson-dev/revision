import { describe, expect, it } from 'vitest'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { z } from 'zod'
import { foundationCoverageModelSchema } from './foundation-compilation'
import {
  assureFoundationInternalLearningAssets,
  foundationInternalLearningIndependentReviewSchema,
  type FoundationInternalLearningAssuranceWorkers,
} from './foundation-internal-learning-assurance'
import { foundationInternalLearningBoundReviewOutputSchema } from './foundation-internal-learning-review-contract'
import { getFoundationDerivedAssetReleaseProblems } from './foundation-derived-asset'
import { foundationInternalLearningAssetBundleSchema } from './foundation-internal-learning-assets'
import { computeFoundationFingerprint } from './foundation-lifecycle'
import { foundationCandidateSchema, foundationJobSchema } from './foundation-schema'
import { fingerprintValue } from './intake-to-knowledge-model'
import { OpenAIStructuredWorkerClient } from './openai-provider-adapter'
import { courseKnowledgeModelSchema } from './schema'

const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }
const env = runtime.process?.env ?? {}
const liveEnabled = env.CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_REASSURANCE_PROOF === '1'
const evidenceDirectory = '.artifacts/content-factory-foundation-internal-learning-reassurance-proof'
const testTimeoutMs = 90 * 60 * 1000

const nonEmptyStringSchema = z.string().min(1)
const commitShaSchema = z.string().regex(/^[0-9a-f]{40}$/)
const sha256Schema = z.string().regex(/^[0-9a-f]{64}$/)
const positiveDecimalStringSchema = z.string().regex(/^[1-9][0-9]*$/)
const retainedIdentitySchema = z.object({
  workflowRunId: positiveDecimalStringSchema,
  artifactName: nonEmptyStringSchema,
  artifactDigest: nonEmptyStringSchema,
})
const sourceProofIdentitySchema = retainedIdentitySchema.extend({
  contentHeadSha: commitShaSchema,
  foundationFingerprint: sha256Schema,
})
const aiProofIdentitySchema = retainedIdentitySchema.extend({ headSha: commitShaSchema })
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
  learnerAssetCount: z.literal(0),
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
  finalState: z.literal('ai_assured'),
  aiAssured: z.literal(true),
  humanReviewStatus: z.literal('pending'),
  foundationApprovalStatus: z.literal('not_approved'),
  learnerPublicationEligible: z.literal(false),
  finalCandidate: foundationCandidateSchema,
})
const learningProofSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('foundation_internal_learning_live_proof_evidence'),
  repository: nonEmptyStringSchema,
  generationImplementationCommit: commitShaSchema,
  sourceProof: sourceProofIdentitySchema,
  aiAssuredProof: aiProofIdentitySchema,
  jobId: nonEmptyStringSchema,
  candidateId: nonEmptyStringSchema,
  foundationFingerprint: sha256Schema,
  status: z.literal('pass'),
  bundle: foundationInternalLearningAssetBundleSchema,
})
const sourceAssuranceProofSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('foundation_internal_learning_assurance_live_proof_evidence'),
  repository: nonEmptyStringSchema,
  assuranceImplementationCommit: commitShaSchema,
  foundationFingerprint: sha256Schema,
  internalLearningProof: retainedIdentitySchema.extend({
    headSha: commitShaSchema,
    sourceBundleFingerprint: sha256Schema,
  }),
  deterministicAssurance: z.object({ sourceBundleFingerprint: sha256Schema, decision: z.literal('pass') }),
  independentReview: foundationInternalLearningIndependentReviewSchema,
  status: z.literal('fail_hold'),
  foundationApprovalStatus: z.literal('not_approved'),
  learnerPublicationEligible: z.literal(false),
})
const remediationProofSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('foundation_internal_learning_remediation_live_proof_evidence'),
  repository: nonEmptyStringSchema,
  remediationImplementationCommit: commitShaSchema,
  sourceProof: sourceProofIdentitySchema,
  aiAssuredProof: aiProofIdentitySchema,
  sourceLearningProof: retainedIdentitySchema.extend({
    headSha: commitShaSchema,
    sourceBundleFingerprint: sha256Schema,
  }),
  sourceAssuranceProof: retainedIdentitySchema.extend({
    headSha: commitShaSchema,
    reviewFingerprint: sha256Schema,
  }),
  jobId: nonEmptyStringSchema,
  candidateId: nonEmptyStringSchema,
  foundationFingerprint: sha256Schema,
  coverageModelFingerprint: sha256Schema,
  courseKnowledgeModelFingerprint: sha256Schema,
  status: z.literal('pass'),
  addressedFindingCount: z.number().int().positive(),
  remediatedWorkUnitCount: z.number().int().positive(),
  remediatedAssetSideCount: z.number().int().positive(),
  remediationContextCount: z.number().int().positive(),
  remediationContextCollisions: z.array(nonEmptyStringSchema),
  resultBundleFingerprint: sha256Schema,
  learnAssetStatus: z.literal('pending'),
  practiceAssetStatus: z.literal('pending'),
  assuredAssetCount: z.literal(0),
  humanReviewStatus: z.literal('pending'),
  foundationApprovalStatus: z.literal('not_approved'),
  learnerPublicationEligible: z.literal(false),
  remediationRecord: z.object({
    remediationContextIds: z.array(nonEmptyStringSchema).min(1),
    resultBundleFingerprint: sha256Schema,
  }).passthrough(),
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

async function readJson(path: string) {
  return JSON.parse(await readFile(path, 'utf-8')) as unknown
}

function failureMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

function sameSet(left: string[], right: string[]) {
  const a = new Set(left)
  const b = new Set(right)
  return a.size === b.size && [...a].every((value) => b.has(value))
}

function exactArtifact<T>(input: {
  artifacts: z.infer<typeof sourceArtifactSchema>[]
  kind: string
  expectedFingerprint: string
  parse: (value: unknown) => T
}) {
  const matches = input.artifacts.filter((artifact) => artifact.kind === input.kind)
  if (matches.length !== 1) throw new Error(`Expected exactly one ${input.kind} artifact, found ${matches.length}`)
  if (matches[0].fingerprint !== input.expectedFingerprint) throw new Error(`${input.kind} artifact fingerprint does not match the AI-assured Candidate`)
  return input.parse(matches[0].value)
}

function githubHeaders(token: string) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  }
}

async function addIssueComment(repo: string, token: string, body: string) {
  const response = await fetch(`https://api.github.com/repos/${repo}/issues/289/comments`, {
    method: 'POST',
    headers: githubHeaders(token),
    body: JSON.stringify({ body }),
  })
  if (!response.ok) throw new Error(`GitHub issue comment failed with HTTP ${response.status}: ${(await response.text()).slice(0, 500)}`)
}

describe('Foundation-native retained targeted Learn/Practice re-assurance proof', () => {
  const liveIt = liveEnabled ? it : it.skip

  liveIt('deterministically validates and freshly re-reviews the exact corrected Business bundle', async () => {
    const repo = requiredEnv('GITHUB_REPOSITORY')
    const token = requiredEnv('GITHUB_TOKEN')
    const remediationRunId = requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_REMEDIATION_RUN_ID')
    const remediationArtifactName = requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_REMEDIATION_ARTIFACT_NAME')
    const remediationArtifactDigest = requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_REMEDIATION_ARTIFACT_DIGEST')
    const remediationHeadSha = requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_REMEDIATION_HEAD_SHA')
    const resultBundleFingerprint = requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_RESULT_BUNDLE_FINGERPRINT')
    const foundationFingerprint = requiredEnv('CONTENT_FACTORY_FOUNDATION_FINGERPRINT')
    const implementationCommit = requiredEnv('CONTENT_FACTORY_REASSURANCE_IMPLEMENTATION_COMMIT')
    const githubRunId = requiredEnv('GITHUB_RUN_ID')
    const maxSpendUsd = positiveNumberEnv('CONTENT_FACTORY_REASSURANCE_MAX_SPEND_USD', 12)
    const maxOutputTokens = positiveIntegerEnv('CONTENT_FACTORY_REASSURANCE_MAX_OUTPUT_TOKENS', 5_000)
    const reviewModel = env.CONTENT_FACTORY_REASSURANCE_MODEL?.trim() || 'gpt-5.6-terra'
    const now = new Date().toISOString()

    await mkdir(evidenceDirectory, { recursive: true })
    const fallbackEvidencePath = `${evidenceDirectory}/live-proof-failure.json`

    try {
      const sourceProof = sourceProofSchema.parse(await readJson(requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_PROOF_PATH')))
      const aiProof = aiAssuredProofSchema.parse(await readJson(requiredEnv('CONTENT_FACTORY_FOUNDATION_AI_ASSURED_PROOF_PATH')))
      const learningProof = learningProofSchema.parse(await readJson(requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_PROOF_PATH')))
      const sourceAssuranceProof = sourceAssuranceProofSchema.parse(await readJson(requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_ASSURANCE_PROOF_PATH')))
      const remediationProof = remediationProofSchema.parse(await readJson(requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_REMEDIATION_PROOF_PATH')))

      expect(sourceProof.repository).toBe(repo)
      expect(aiProof.repository).toBe(repo)
      expect(learningProof.repository).toBe(repo)
      expect(sourceAssuranceProof.repository).toBe(repo)
      expect(remediationProof.repository).toBe(repo)
      expect(remediationProof.remediationImplementationCommit).toBe(remediationHeadSha)
      expect(remediationProof.foundationFingerprint).toBe(foundationFingerprint)
      expect(remediationProof.resultBundleFingerprint).toBe(resultBundleFingerprint)
      expect(await fingerprintValue(remediationProof.bundle)).toBe(resultBundleFingerprint)
      expect(remediationProof.remediationRecord.resultBundleFingerprint).toBe(resultBundleFingerprint)
      expect(remediationProof.remediationContextCollisions).toEqual([])

      expect(remediationProof.sourceProof).toEqual(learningProof.sourceProof)
      expect(remediationProof.aiAssuredProof).toEqual(learningProof.aiAssuredProof)
      expect(remediationProof.sourceLearningProof).toMatchObject({
        workflowRunId: requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_SOURCE_RUN_ID'),
        artifactName: requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_SOURCE_ARTIFACT_NAME'),
        artifactDigest: requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_SOURCE_ARTIFACT_DIGEST'),
        headSha: requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_SOURCE_HEAD_SHA'),
      })
      expect(remediationProof.sourceAssuranceProof).toMatchObject({
        workflowRunId: requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_SOURCE_ASSURANCE_RUN_ID'),
        artifactName: requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_SOURCE_ASSURANCE_ARTIFACT_NAME'),
        artifactDigest: requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_SOURCE_ASSURANCE_ARTIFACT_DIGEST'),
        headSha: requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_SOURCE_ASSURANCE_HEAD_SHA'),
      })
      expect(await fingerprintValue(sourceAssuranceProof.independentReview)).toBe(remediationProof.sourceAssuranceProof.reviewFingerprint)
      expect(await fingerprintValue(learningProof.bundle)).toBe(remediationProof.sourceLearningProof.sourceBundleFingerprint)
      expect(sourceAssuranceProof.internalLearningProof.sourceBundleFingerprint).toBe(remediationProof.sourceLearningProof.sourceBundleFingerprint)

      const candidate = foundationCandidateSchema.parse(aiProof.finalCandidate)
      expect(sourceProof.contentHeadSha).toBe(remediationProof.sourceProof.contentHeadSha)
      expect(sourceProof.foundationFingerprint).toBe(foundationFingerprint)
      expect(aiProof.challengeImplementationCommit).toBe(remediationProof.aiAssuredProof.headSha)
      expect(aiProof.reviewedCommit).toBe(sourceProof.contentHeadSha)
      expect(aiProof.foundationFingerprint).toBe(foundationFingerprint)
      expect(aiProof.jobId).toBe(sourceProof.jobId)
      expect(aiProof.candidateId).toBe(remediationProof.candidateId)
      expect(await computeFoundationFingerprint(candidate)).toBe(foundationFingerprint)

      const coverageModel = exactArtifact({
        artifacts: sourceProof.artifacts,
        kind: 'foundation_coverage_model',
        expectedFingerprint: candidate.coverageModel.fingerprint,
        parse: (value) => foundationCoverageModelSchema.parse(value),
      })
      const courseKnowledgeModel = exactArtifact({
        artifacts: sourceProof.artifacts,
        kind: 'course_knowledge_model',
        expectedFingerprint: candidate.courseKnowledgeModel.fingerprint,
        parse: (value) => courseKnowledgeModelSchema.parse(value),
      })
      expect(remediationProof.coverageModelFingerprint).toBe(candidate.coverageModel.fingerprint)
      expect(remediationProof.courseKnowledgeModelFingerprint).toBe(candidate.courseKnowledgeModel.fingerprint)

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
        apiKey: requiredEnv('OPENAI_API_KEY'),
        maxSpendUsd,
        generation: { ...reviewRoute, reasoningEffort: 'medium' },
        independentReview: reviewRoute,
        maxRetries: 2,
      })

      const reviewRuns: ReviewRun[] = []
      const workers: FoundationInternalLearningAssuranceWorkers = {
        async independentReview(input) {
          const execution = await client.run({
            workerId: 'content-factory.foundation-internal-learning-remediation-reassurance-review',
            contractVersion: '1',
            routeKind: 'independent_review',
            outputSchema: foundationInternalLearningBoundReviewOutputSchema({
              foundationFingerprint: input.foundationFingerprint,
              foundationCandidateId: input.foundationCandidateId,
              sourceBundleFingerprint: input.sourceBundleFingerprint,
              workUnitId: input.plan.id,
              workUnitFingerprint: input.workUnitFingerprint,
            }),
            instructions: [
              'Act as a genuinely fresh adversarial educational reviewer for exactly one corrected Foundation-derived AQA A-level Business Learn/Practice work unit.',
              'Review the corrected Revision-owned learner content against the supplied structured Foundation Course Truth and coverage facts; do not rely on any earlier reviewer conclusion or remediation claim.',
              'Do not use or request protected awarding-body prose and do not claim awarding-body endorsement.',
              'Identify factual distortion, omitted conditions, misleading certainty, curriculum drift, invalid misconceptions, misleading pedagogy, internally inconsistent practice, incorrect expected responses, and quantitative errors.',
              'Independently recompute calculations or quantitative conclusions from supplied values and formula truth.',
              'Check that Practice genuinely exercises each governed teaching point rather than merely repeating it.',
              'Blocking/material findings are issues that make content unsafe or materially misleading; minor findings are non-critical accuracy or clarity issues, not style preferences.',
              'Do not rewrite prose. Return only the issue register and decision.',
              'Clean review means decision=pass and findings=[]. Open blocking/material findings require fail_hold; open minor findings require conditional_pass.',
              'Identity fields are fixed by the response contract. Judge only the supplied corrected work unit.',
              'Prefix every finding ID with the supplied workUnitId.',
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

      const priorReviewerContextIds = sourceAssuranceProof.independentReview.reviewerContextIds
      const result = await assureFoundationInternalLearningAssets({
        job,
        bundle: remediationProof.bundle,
        coverageModel,
        courseKnowledgeModel,
        workers,
        assuranceEvidenceRef: `github-actions-run:${githubRunId}`,
        additionalForbiddenContextIds: priorReviewerContextIds,
        now,
      })

      const reviewerContextIds = reviewRuns.map((run) => run.contextId)
      const allForbiddenContexts = new Set([
        ...candidate.provenance.generationContextIds,
        ...candidate.provenance.assuranceContextIds,
        ...(candidate.externalSourceChallenge ? [candidate.externalSourceChallenge.reviewerContextId] : []),
        ...remediationProof.bundle.generationContextIds,
        ...priorReviewerContextIds,
      ])
      const reviewerContextCollisions = reviewerContextIds.filter((contextId) => allForbiddenContexts.has(contextId))
      const reportedUsageRuns = reviewRuns.filter((run) => typeof run.usageCost === 'number')
      const reportedFinalResponseUsageCostUsd = Number(reportedUsageRuns.reduce((total, run) => total + (run.usageCost ?? 0), 0).toFixed(8))
      const evidencePath = `${evidenceDirectory}/${aiProof.jobId}-internal-learning-reassurance.json`
      const evidenceBase = {
        schemaVersion: 1,
        artifactType: 'foundation_internal_learning_reassurance_live_proof_evidence',
        recordedAt: new Date().toISOString(),
        repository: repo,
        reassuranceImplementationCommit: implementationCommit,
        remediationProof: {
          workflowRunId: remediationRunId,
          artifactName: remediationArtifactName,
          artifactDigest: remediationArtifactDigest,
          headSha: remediationHeadSha,
          resultBundleFingerprint,
        },
        sourceProof: remediationProof.sourceProof,
        aiAssuredProof: remediationProof.aiAssuredProof,
        sourceLearningProof: remediationProof.sourceLearningProof,
        sourceAssuranceProof: remediationProof.sourceAssuranceProof,
        jobId: aiProof.jobId,
        candidateId: candidate.candidateId,
        foundationFingerprint,
        courseIdentity: candidate.courseIdentity,
        correctedBundleFingerprint: resultBundleFingerprint,
        workUnitCount: remediationProof.bundle.workUnits.length,
        correctedBundleContextCount: remediationProof.bundle.generationContextIds.length,
        priorReviewerContextCount: priorReviewerContextIds.length,
        reviewerContextCount: reviewerContextIds.length,
        reviewerContextCollisions,
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

      if (reviewerContextCollisions.length > 0) throw new Error(`Fresh re-assurance reviewer context collision detected: ${reviewerContextCollisions.join(', ')}`)

      if (result.status !== 'pass' || !result.assuredAssets) {
        await writeFile(evidencePath, JSON.stringify({
          ...evidenceBase,
          status: result.status,
          learnAssetStatus: remediationProof.bundle.learnAsset.assuranceStatus,
          practiceAssetStatus: remediationProof.bundle.practiceAsset.assuranceStatus,
          assuredAssetCount: 0,
        }, null, 2), 'utf-8')
        await addIssueComment(repo, token, [
          'Foundation-native corrected Learn/Practice re-assurance did not pass.',
          '',
          '- Course: **AQA A-level Business 7132 — 2027 cohort**',
          `- Foundation fingerprint: \`${foundationFingerprint}\``,
          `- Corrected bundle: remediation run **${remediationRunId}** / \`${remediationArtifactName}\``,
          `- Corrected bundle fingerprint: \`${resultBundleFingerprint}\``,
          `- Re-assurance decision: **${result.status}**`,
          `- Fresh review work units completed: **${reviewRuns.length}**`,
          `- New remediation targets: **${result.remediationTargets.length}**`,
          `- Reviewer context collisions: **${reviewerContextCollisions.length}**`,
          `- Reported final-response review cost: **$${reportedFinalResponseUsageCostUsd.toFixed(4)}** across **${reportedUsageRuns.length}** runs (not retry-complete total spend)`,
          '',
          'Learn and Practice remain unassured and learner publication remains blocked. Any new blocking/material findings require another smallest-safe remediation cycle; a Foundation defect must reopen the Foundation instead of being patched downstream.',
        ].join('\n'))
        throw new Error(`Foundation-native corrected Learn/Practice re-assurance returned ${result.status}`)
      }

      const assuredAssets = result.assuredAssets
      const releaseProblems = {
        learn: getFoundationDerivedAssetReleaseProblems(assuredAssets.learnAsset, job),
        practice: getFoundationDerivedAssetReleaseProblems(assuredAssets.practiceAsset, job),
      }
      expect(assuredAssets.learnAsset.assuranceStatus).toBe('pass')
      expect(assuredAssets.practiceAsset.assuranceStatus).toBe('pass')
      expect(releaseProblems.learn).toContain('Learner release requires qualified-human foundation_approved state')
      expect(releaseProblems.practice).toContain('Learner release requires qualified-human foundation_approved state')
      expect(reviewRuns).toHaveLength(remediationProof.bundle.workUnits.length)
      expect(reviewRuns.every((run) => run.status === 'success')).toBe(true)
      expect(new Set(reviewerContextIds).size).toBe(reviewerContextIds.length)
      expect(sameSet(remediationProof.remediationRecord.remediationContextIds, remediationProof.bundle.generationContextIds.filter((contextId) => remediationProof.remediationRecord.remediationContextIds.includes(contextId)))).toBe(true)

      await writeFile(evidencePath, JSON.stringify({
        ...evidenceBase,
        status: 'pass',
        learnAssetStatus: assuredAssets.learnAsset.assuranceStatus,
        practiceAssetStatus: assuredAssets.practiceAsset.assuranceStatus,
        assuredAssetCount: 2,
        assuredAssets,
        releaseProblems,
      }, null, 2), 'utf-8')

      await addIssueComment(repo, token, [
        'Foundation-native corrected Learn/Practice re-assurance passed.',
        '',
        '- Course: **AQA A-level Business 7132 — 2027 cohort**',
        `- Foundation fingerprint: \`${foundationFingerprint}\``,
        `- Corrected bundle: remediation run **${remediationRunId}** / \`${remediationArtifactName}\``,
        `- Corrected bundle fingerprint: \`${resultBundleFingerprint}\``,
        `- Work units independently re-reviewed: **${reviewRuns.length}**`,
        `- Fresh reviewer contexts: **${reviewerContextIds.length}**`,
        `- Reviewer context collisions: **${reviewerContextCollisions.length}**`,
        '- Learn assurance: **PASS**',
        '- Practice assurance: **PASS**',
        `- Reported final-response review cost: **$${reportedFinalResponseUsageCostUsd.toFixed(4)}** across **${reportedUsageRuns.length}** runs (not retry-complete total spend)`,
        '',
        'The corrected assets are assured but remain pre-production. Qualified-human Foundation approval is still pending, so learner publication remains blocked.',
      ].join('\n'))
    } catch (error) {
      await writeFile(fallbackEvidencePath, JSON.stringify({
        schemaVersion: 1,
        artifactType: 'foundation_internal_learning_reassurance_live_proof_failure_evidence',
        status: 'fail_hold',
        recordedAt: new Date().toISOString(),
        repository: repo,
        reassuranceImplementationCommit: implementationCommit,
        remediationProof: {
          workflowRunId: remediationRunId,
          artifactName: remediationArtifactName,
          artifactDigest: remediationArtifactDigest,
          headSha: remediationHeadSha,
          resultBundleFingerprint,
        },
        foundationFingerprint,
        assuredAssetCount: 0,
        humanReviewStatus: 'pending',
        foundationApprovalStatus: 'not_approved',
        learnerPublicationEligible: false,
        failure: failureMessage(error),
      }, null, 2), 'utf-8')
      throw error
    }
  }, testTimeoutMs)
})
