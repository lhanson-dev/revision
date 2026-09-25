import { describe, expect, it } from 'vitest'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { z } from 'zod'
import { foundationCoverageModelSchema } from './foundation-compilation'
import { getFoundationDerivedAssetReleaseProblems } from './foundation-derived-asset'
import { foundationInternalLearningAssetBundleSchema } from './foundation-internal-learning-assets'
import {
  foundationInternalLearningIndependentReviewSchema,
  foundationInternalLearningRemediationTargetSchema,
} from './foundation-internal-learning-assurance'
import {
  foundationInternalLearningRemediationRecordSchema,
  remediateFoundationInternalLearningAssets,
} from './foundation-internal-learning-remediation'
import { computeFoundationFingerprint } from './foundation-lifecycle'
import { foundationCandidateSchema, foundationJobSchema } from './foundation-schema'
import { fingerprintValue } from './intake-to-knowledge-model'
import { createOpenAIFoundationCourseLearningRemediationWorkers } from './openai-foundation-course-learning-remediation-workers'
import { courseKnowledgeModelSchema } from './schema'

const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }
const env = runtime.process?.env ?? {}
const liveEnabled = env.CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_REPEAT_REMEDIATION_PROOF === '1'
const evidenceDirectory = '.artifacts/content-factory-foundation-internal-learning-repeat-remediation-proof'
const testTimeoutMs = 75 * 60 * 1000

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
const remediationProofIdentitySchema = retainedIdentitySchema.extend({
  headSha: commitShaSchema,
  resultBundleFingerprint: sha256Schema,
})
const parentRemediationProofSchema = z.object({
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
  remediationContextCount: z.number().int().positive(),
  remediationContextCollisions: z.array(nonEmptyStringSchema),
  resultBundleFingerprint: sha256Schema,
  learnAssetStatus: z.literal('pending'),
  practiceAssetStatus: z.literal('pending'),
  assuredAssetCount: z.literal(0),
  humanReviewStatus: z.literal('pending'),
  foundationApprovalStatus: z.literal('not_approved'),
  learnerPublicationEligible: z.literal(false),
  remediationCycle: z.number().int().positive().optional(),
  remediationRecord: foundationInternalLearningRemediationRecordSchema,
  bundle: foundationInternalLearningAssetBundleSchema,
}).passthrough()
const reassuranceProofSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('foundation_internal_learning_reassurance_live_proof_evidence'),
  repository: nonEmptyStringSchema,
  reassuranceImplementationCommit: commitShaSchema,
  remediationProof: remediationProofIdentitySchema,
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
  correctedBundleFingerprint: sha256Schema,
  reviewerContextCollisions: z.array(nonEmptyStringSchema),
  deterministicAssurance: z.object({
    sourceBundleFingerprint: sha256Schema,
    decision: z.literal('pass'),
  }),
  independentReview: foundationInternalLearningIndependentReviewSchema,
  remediationTargets: z.array(foundationInternalLearningRemediationTargetSchema).min(1),
  status: z.enum(['fail_hold', 'conditional_pass']),
  learnAssetStatus: z.literal('pending'),
  practiceAssetStatus: z.literal('pending'),
  assuredAssetCount: z.literal(0),
  humanReviewStatus: z.literal('pending'),
  foundationApprovalStatus: z.literal('not_approved'),
  learnerPublicationEligible: z.literal(false),
}).passthrough()

type RemediationRun = {
  stage: 'learn' | 'practice'
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
type LoggedExecution = {
  status: RemediationRun['status']
  error?: string
  provenance: {
    id: string
    contextId: string
    contractVersion: string
    provider?: string
    model?: string
    retryCount?: number
    usageCost?: number
    providerRuns?: Array<{
      status: RemediationRun['status']
      error?: string
      id: string
      contextId: string
      contractVersion: string
      provider?: string
      model?: string
      retryCount?: number
      usageCost?: number
    }>
  }
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

function unique(values: string[]) {
  return [...new Set(values)]
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

function appendRuns(runs: RemediationRun[], stage: RemediationRun['stage'], workUnitId: string, execution: LoggedExecution) {
  const providerRuns = execution.provenance.providerRuns
  if (providerRuns && providerRuns.length > 0) {
    runs.push(...providerRuns.map((run) => ({
      stage,
      workUnitId,
      status: run.status,
      runId: run.id,
      contextId: run.contextId,
      contractVersion: run.contractVersion,
      provider: run.provider,
      model: run.model,
      retryCount: run.retryCount,
      usageCost: run.usageCost,
      ...(run.error ? { error: run.error } : {}),
    })))
    return
  }
  runs.push({
    stage,
    workUnitId,
    status: execution.status,
    runId: execution.provenance.id,
    contextId: execution.provenance.contextId,
    contractVersion: execution.provenance.contractVersion,
    provider: execution.provenance.provider,
    model: execution.provenance.model,
    retryCount: execution.provenance.retryCount,
    usageCost: execution.provenance.usageCost,
    ...(execution.error ? { error: execution.error } : {}),
  })
}

function executionContextIds(execution: LoggedExecution) {
  const providerRuns = execution.provenance.providerRuns
  if (providerRuns && providerRuns.length > 0) return providerRuns.map((run) => run.contextId)
  return [execution.provenance.contextId]
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

describe('Foundation-native retained repeat Learn/Practice remediation proof', () => {
  const liveIt = liveEnabled ? it : it.skip

  liveIt('remediates every and only the latest re-assurance findings while excluding the full prior context chain', async () => {
    const repo = requiredEnv('GITHUB_REPOSITORY')
    const token = requiredEnv('GITHUB_TOKEN')
    const reassuranceRunId = requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_REASSURANCE_RUN_ID')
    const reassuranceArtifactName = requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_REASSURANCE_ARTIFACT_NAME')
    const reassuranceArtifactDigest = requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_REASSURANCE_ARTIFACT_DIGEST')
    const reassuranceHeadSha = requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_REASSURANCE_HEAD_SHA')
    const correctedBundleFingerprint = requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_CORRECTED_BUNDLE_FINGERPRINT')
    const parentRemediationRunId = requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_PARENT_REMEDIATION_RUN_ID')
    const parentRemediationArtifactName = requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_PARENT_REMEDIATION_ARTIFACT_NAME')
    const parentRemediationArtifactDigest = requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_PARENT_REMEDIATION_ARTIFACT_DIGEST')
    const parentRemediationHeadSha = requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_PARENT_REMEDIATION_HEAD_SHA')
    const foundationFingerprint = requiredEnv('CONTENT_FACTORY_FOUNDATION_FINGERPRINT')
    const implementationCommit = requiredEnv('CONTENT_FACTORY_REPEAT_REMEDIATION_IMPLEMENTATION_COMMIT')
    const maxSpendUsd = positiveNumberEnv('CONTENT_FACTORY_REMEDIATION_MAX_SPEND_USD', 12)
    const maxOutputTokens = positiveIntegerEnv('CONTENT_FACTORY_REMEDIATION_MAX_OUTPUT_TOKENS', 8_000)
    const remediationModel = env.CONTENT_FACTORY_REMEDIATION_MODEL?.trim() || 'gpt-5.6-terra'
    const now = new Date().toISOString()

    await mkdir(evidenceDirectory, { recursive: true })
    const fallbackEvidencePath = `${evidenceDirectory}/live-proof-failure.json`

    try {
      const sourceProof = sourceProofSchema.parse(await readJson(requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_PROOF_PATH')))
      const aiProof = aiAssuredProofSchema.parse(await readJson(requiredEnv('CONTENT_FACTORY_FOUNDATION_AI_ASSURED_PROOF_PATH')))
      const parentRemediationProof = parentRemediationProofSchema.parse(await readJson(requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_PARENT_REMEDIATION_PROOF_PATH')))
      const sourceReassuranceProof = reassuranceProofSchema.parse(await readJson(requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_REASSURANCE_PROOF_PATH')))

      expect(sourceProof.repository).toBe(repo)
      expect(aiProof.repository).toBe(repo)
      expect(parentRemediationProof.repository).toBe(repo)
      expect(sourceReassuranceProof.repository).toBe(repo)
      expect(sourceReassuranceProof.reassuranceImplementationCommit).toBe(reassuranceHeadSha)
      expect(sourceReassuranceProof.foundationFingerprint).toBe(foundationFingerprint)
      expect(sourceReassuranceProof.correctedBundleFingerprint).toBe(correctedBundleFingerprint)
      expect(sourceReassuranceProof.deterministicAssurance.sourceBundleFingerprint).toBe(correctedBundleFingerprint)
      expect(sourceReassuranceProof.independentReview.sourceBundleFingerprint).toBe(correctedBundleFingerprint)
      expect(sourceReassuranceProof.reviewerContextCollisions).toEqual([])
      expect(sourceReassuranceProof.remediationProof).toEqual({
        workflowRunId: parentRemediationRunId,
        artifactName: parentRemediationArtifactName,
        artifactDigest: parentRemediationArtifactDigest,
        headSha: parentRemediationHeadSha,
        resultBundleFingerprint: correctedBundleFingerprint,
      })

      expect(parentRemediationProof.remediationImplementationCommit).toBe(parentRemediationHeadSha)
      expect(parentRemediationProof.foundationFingerprint).toBe(foundationFingerprint)
      expect(parentRemediationProof.resultBundleFingerprint).toBe(correctedBundleFingerprint)
      expect(parentRemediationProof.remediationRecord.resultBundleFingerprint).toBe(correctedBundleFingerprint)
      expect(await fingerprintValue(parentRemediationProof.bundle)).toBe(correctedBundleFingerprint)
      expect(parentRemediationProof.remediationContextCollisions).toEqual([])
      expect(parentRemediationProof.sourceProof).toEqual(sourceReassuranceProof.sourceProof)
      expect(parentRemediationProof.aiAssuredProof).toEqual(sourceReassuranceProof.aiAssuredProof)
      expect(parentRemediationProof.sourceLearningProof).toEqual(sourceReassuranceProof.sourceLearningProof)
      expect(parentRemediationProof.sourceAssuranceProof).toEqual(sourceReassuranceProof.sourceAssuranceProof)

      const candidate = foundationCandidateSchema.parse(aiProof.finalCandidate)
      expect(sourceProof.contentHeadSha).toBe(parentRemediationProof.sourceProof.contentHeadSha)
      expect(sourceProof.foundationFingerprint).toBe(foundationFingerprint)
      expect(aiProof.challengeImplementationCommit).toBe(parentRemediationProof.aiAssuredProof.headSha)
      expect(aiProof.reviewedCommit).toBe(sourceProof.contentHeadSha)
      expect(aiProof.foundationFingerprint).toBe(foundationFingerprint)
      expect(aiProof.jobId).toBe(sourceProof.jobId)
      expect(aiProof.candidateId).toBe(parentRemediationProof.candidateId)
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
      expect(parentRemediationProof.coverageModelFingerprint).toBe(candidate.coverageModel.fingerprint)
      expect(parentRemediationProof.courseKnowledgeModelFingerprint).toBe(candidate.courseKnowledgeModel.fingerprint)

      const job = foundationJobSchema.parse({
        schemaVersion: 1,
        jobId: aiProof.jobId,
        state: 'ai_assured',
        candidate,
        blockers: [],
        createdAt: candidate.provenance.createdAt,
        updatedAt: now,
      })

      const route = {
        model: remediationModel,
        inputUsdPerMillion: 2,
        cachedInputUsdPerMillion: 0.2,
        outputUsdPerMillion: 12,
        cacheWriteMultiplier: 1.25,
        longContextThresholdTokens: 272_000,
        longContextInputMultiplier: 2,
        longContextOutputMultiplier: 1.5,
        reasoningEffort: 'medium' as const,
        maxOutputTokens,
      }
      const baseWorkers = createOpenAIFoundationCourseLearningRemediationWorkers({
        apiKey: requiredEnv('OPENAI_API_KEY'),
        maxSpendUsd,
        generation: route,
        independentReview: { ...route, reasoningEffort: 'high' },
        maxRetries: 2,
      })

      const historicalReviewerContextIds = parentRemediationProof.remediationRecord.priorReviewerContextIds
      const historicalReviewerContexts = new Set(historicalReviewerContextIds)
      const remediationRuns: RemediationRun[] = []
      const workers = {
        async remediateLearningCollateral(input: Parameters<typeof baseWorkers.remediateLearningCollateral>[0]) {
          const execution = await baseWorkers.remediateLearningCollateral(input)
          appendRuns(remediationRuns, 'learn', input.workUnit.id, execution as LoggedExecution)
          const collisions = executionContextIds(execution as LoggedExecution).filter((contextId) => historicalReviewerContexts.has(contextId))
          if (collisions.length > 0) throw new Error(`Repeat remediation reused historical reviewer context(s): ${collisions.join(', ')}`)
          return execution
        },
        async remediatePracticeCollateral(input: Parameters<typeof baseWorkers.remediatePracticeCollateral>[0]) {
          const execution = await baseWorkers.remediatePracticeCollateral(input)
          appendRuns(remediationRuns, 'practice', input.workUnit.id, execution as LoggedExecution)
          const collisions = executionContextIds(execution as LoggedExecution).filter((contextId) => historicalReviewerContexts.has(contextId))
          if (collisions.length > 0) throw new Error(`Repeat remediation reused historical reviewer context(s): ${collisions.join(', ')}`)
          return execution
        },
      }

      let result: Awaited<ReturnType<typeof remediateFoundationInternalLearningAssets>> | undefined
      let remediationFailure: string | undefined
      try {
        result = await remediateFoundationInternalLearningAssets({
          job,
          sourceBundle: parentRemediationProof.bundle,
          coverageModel,
          courseKnowledgeModel,
          independentReview: sourceReassuranceProof.independentReview,
          remediationTargets: sourceReassuranceProof.remediationTargets,
          workers,
          now,
          assetIdPrefix: `aqa-7132-2027-${foundationFingerprint.slice(0, 12)}-repeat-remediation`,
        })
      } catch (error) {
        remediationFailure = failureMessage(error)
      }

      const openFindingIds = sourceReassuranceProof.independentReview.findings
        .filter((finding) => finding.resolutionStatus === 'open' && finding.severity !== 'no_issue')
        .map((finding) => finding.id)
        .sort()
      const reportedUsageRuns = remediationRuns.filter((run) => typeof run.usageCost === 'number')
      const reportedUsageCostUsd = Number(reportedUsageRuns.reduce((total, run) => total + (run.usageCost ?? 0), 0).toFixed(8))
      const sourceReviewFingerprint = await fingerprintValue(sourceReassuranceProof.independentReview)
      const remediationCycle = (parentRemediationProof.remediationCycle ?? 1) + 1
      const evidenceBase = {
        schemaVersion: 1,
        artifactType: 'foundation_internal_learning_remediation_live_proof_evidence',
        recordedAt: new Date().toISOString(),
        repository: repo,
        remediationImplementationCommit: implementationCommit,
        remediationCycle,
        sourceProof: parentRemediationProof.sourceProof,
        aiAssuredProof: parentRemediationProof.aiAssuredProof,
        sourceLearningProof: parentRemediationProof.sourceLearningProof,
        sourceAssuranceProof: parentRemediationProof.sourceAssuranceProof,
        parentRemediationProof: {
          workflowRunId: parentRemediationRunId,
          artifactName: parentRemediationArtifactName,
          artifactDigest: parentRemediationArtifactDigest,
          headSha: parentRemediationHeadSha,
          resultBundleFingerprint: correctedBundleFingerprint,
        },
        sourceReassuranceProof: {
          workflowRunId: reassuranceRunId,
          artifactName: reassuranceArtifactName,
          artifactDigest: reassuranceArtifactDigest,
          headSha: reassuranceHeadSha,
          correctedBundleFingerprint,
          reviewFingerprint: sourceReviewFingerprint,
        },
        jobId: aiProof.jobId,
        candidateId: candidate.candidateId,
        foundationFingerprint,
        courseIdentity: candidate.courseIdentity,
        coverageModelFingerprint: candidate.coverageModel.fingerprint,
        courseKnowledgeModelFingerprint: candidate.courseKnowledgeModel.fingerprint,
        sourceOpenFindingCount: openFindingIds.length,
        sourceRemediationTargetCount: sourceReassuranceProof.remediationTargets.length,
        remediationModel,
        remediationMaxOutputTokens: maxOutputTokens,
        configuredHardSpendCeilingUsd: maxSpendUsd,
        costTelemetry: {
          reportedFinalResponseUsageCostUsd: reportedUsageCostUsd,
          reportedUsageRunCount: reportedUsageRuns.length,
          remediationRunCount: remediationRuns.length,
          note: 'Final-response usageCost values are retained where the provider reports them. This sum is not retry-complete total spend; the provider client separately enforces the configured hard spend ceiling before starting calls.',
        },
        remediationRuns,
        humanReviewStatus: 'pending' as const,
        foundationApprovalStatus: 'not_approved' as const,
        learnerPublicationEligible: false as const,
      }
      const evidencePath = `${evidenceDirectory}/${aiProof.jobId}-internal-learning-repeat-remediation.json`

      if (!result) {
        await writeFile(evidencePath, JSON.stringify({
          ...evidenceBase,
          status: 'fail_hold',
          failure: remediationFailure ?? 'unknown_repeat_remediation_failure',
          addressedFindingCount: 0,
          assuredAssetCount: 0,
        }, null, 2), 'utf-8')
        await addIssueComment(repo, token, [
          'Foundation-native repeat Learn/Practice remediation proof failed closed.',
          '',
          '- Course: **AQA A-level Business 7132 — 2027 cohort**',
          `- Foundation fingerprint: \`${foundationFingerprint}\``,
          `- Source re-assurance run: **${reassuranceRunId}**`,
          `- Open findings: **${openFindingIds.length}**`,
          `- Remediation targets: **${sourceReassuranceProof.remediationTargets.length}**`,
          `- Provider calls attempted: **${remediationRuns.length}**`,
          `- Failure: \`${remediationFailure ?? 'unknown_repeat_remediation_failure'}\``,
          '',
          'No finding has been treated as resolved, no derived asset has been marked assured and learner publication remains blocked.',
        ].join('\n'))
        throw new Error(remediationFailure ?? 'Foundation-native repeat targeted learning remediation failed')
      }

      const { bundle } = result
      const cumulativePriorReviewerContextIds = unique([
        ...historicalReviewerContextIds,
        ...sourceReassuranceProof.independentReview.reviewerContextIds,
      ])
      const remediationRecord = foundationInternalLearningRemediationRecordSchema.parse({
        ...result.remediationRecord,
        priorReviewerContextIds: cumulativePriorReviewerContextIds,
      })

      const targetLearnUnits = new Set<string>()
      const targetPracticeUnits = new Set<string>()
      for (const target of sourceReassuranceProof.remediationTargets) {
        if (target.assetKind === 'learn' || target.assetKind === 'both') targetLearnUnits.add(target.workUnitId)
        if (target.assetKind === 'practice' || target.assetKind === 'both') targetPracticeUnits.add(target.workUnitId)
      }
      for (const sourceWorkUnit of parentRemediationProof.bundle.workUnits) {
        const corrected = bundle.workUnits.find((workUnit) => workUnit.plan.id === sourceWorkUnit.plan.id)
        expect(corrected).toBeDefined()
        if (!targetLearnUnits.has(sourceWorkUnit.plan.id)) expect(corrected?.learning).toEqual(sourceWorkUnit.learning)
        if (!targetPracticeUnits.has(sourceWorkUnit.plan.id)) expect(corrected?.practice).toEqual(sourceWorkUnit.practice)
      }

      const allForbiddenContexts = new Set([
        ...candidate.provenance.generationContextIds,
        ...candidate.provenance.assuranceContextIds,
        ...(candidate.externalSourceChallenge ? [candidate.externalSourceChallenge.reviewerContextId] : []),
        ...parentRemediationProof.bundle.generationContextIds,
        ...cumulativePriorReviewerContextIds,
      ])
      const contextCollisions = remediationRecord.remediationContextIds.filter((contextId) => allForbiddenContexts.has(contextId))
      const expectedBundleContexts = unique([...parentRemediationProof.bundle.generationContextIds, ...remediationRecord.remediationContextIds])
      const resultBundleFingerprint = await fingerprintValue(bundle)
      const releaseProblems = {
        learn: getFoundationDerivedAssetReleaseProblems(bundle.learnAsset, job),
        practice: getFoundationDerivedAssetReleaseProblems(bundle.practiceAsset, job),
      }

      await writeFile(evidencePath, JSON.stringify({
        ...evidenceBase,
        status: 'pass',
        addressedFindingCount: remediationRecord.addressedFindingIds.length,
        remediatedWorkUnitCount: new Set(remediationRecord.targets.map((target) => target.workUnitId)).size,
        remediatedAssetSideCount: remediationRecord.targets.length,
        remediationContextCount: remediationRecord.remediationContextIds.length,
        remediationContextCollisions: contextCollisions,
        cumulativePriorReviewerContextCount: cumulativePriorReviewerContextIds.length,
        resultBundleFingerprint,
        learnAssetStatus: bundle.learnAsset.assuranceStatus,
        practiceAssetStatus: bundle.practiceAsset.assuranceStatus,
        assuredAssetCount: 0,
        releaseProblems,
        remediationRecord,
        bundle,
      }, null, 2), 'utf-8')

      await addIssueComment(repo, token, [
        'Foundation-native repeat Learn/Practice remediation proof completed.',
        '',
        '- Course: **AQA A-level Business 7132 — 2027 cohort**',
        `- Foundation fingerprint: \`${foundationFingerprint}\``,
        `- Remediation cycle: **${remediationCycle}**`,
        `- Addressed findings: **${remediationRecord.addressedFindingIds.length} / ${openFindingIds.length}**`,
        `- Remediated work units: **${new Set(remediationRecord.targets.map((target) => target.workUnitId)).size}**`,
        `- Remediated asset sides: **${remediationRecord.targets.length}**`,
        `- Fresh remediation contexts: **${remediationRecord.remediationContextIds.length}**`,
        `- Prior reviewer contexts excluded: **${cumulativePriorReviewerContextIds.length}**`,
        `- Provider calls: **${remediationRuns.length}**`,
        `- Reported final-response usage cost: **$${reportedUsageCostUsd.toFixed(4)}** across **${reportedUsageRuns.length}** runs (not retry-complete total spend)`,
        '- Learn asset assurance: `pending`',
        '- Practice asset assurance: `pending`',
        '- Learner publication eligible: **no**',
        '',
        'The newly corrected bundle is retained only for another deterministic and genuinely fresh independent re-assurance. Remediation itself does not resolve findings or permit publication.',
      ].join('\n'))

      const learnRuns = remediationRuns.filter((run) => run.stage === 'learn')
      const practiceRuns = remediationRuns.filter((run) => run.stage === 'practice')
      expect(remediationRecord.sourceBundleFingerprint).toBe(correctedBundleFingerprint)
      expect(remediationRecord.sourceReviewFingerprint).toBe(sourceReviewFingerprint)
      expect(remediationRecord.resultBundleFingerprint).toBe(resultBundleFingerprint)
      expect(sameSet(remediationRecord.addressedFindingIds, openFindingIds)).toBe(true)
      expect(remediationRecord.addressedFindingIds).toHaveLength(openFindingIds.length)
      expect(contextCollisions).toEqual([])
      expect(sameSet(bundle.generationContextIds, expectedBundleContexts)).toBe(true)
      expect(learnRuns).toHaveLength(targetLearnUnits.size * 2)
      expect(practiceRuns).toHaveLength(targetPracticeUnits.size)
      expect(learnRuns.every((run) => run.contractVersion === '9-remediation')).toBe(true)
      expect(practiceRuns.every((run) => run.contractVersion === '5-remediation')).toBe(true)
      expect(remediationRuns.every((run) => run.status === 'success')).toBe(true)
      expect(remediationRuns.every((run) => run.provider === 'openai' && run.model === remediationModel)).toBe(true)
      expect(new Set(remediationRuns.map((run) => run.contextId))).toEqual(new Set(remediationRecord.remediationContextIds))
      expect(bundle.learnAsset.assuranceStatus).toBe('pending')
      expect(bundle.practiceAsset.assuranceStatus).toBe('pending')
      expect(releaseProblems.learn).toContain('Learner release requires derived-asset assurance pass')
      expect(releaseProblems.practice).toContain('Learner release requires derived-asset assurance pass')
      expect(releaseProblems.learn).toContain('Learner release requires qualified-human foundation_approved state')
      expect(releaseProblems.practice).toContain('Learner release requires qualified-human foundation_approved state')
    } catch (error) {
      await writeFile(fallbackEvidencePath, JSON.stringify({
        schemaVersion: 1,
        artifactType: 'foundation_internal_learning_repeat_remediation_live_proof_failure_evidence',
        status: 'fail_hold',
        recordedAt: new Date().toISOString(),
        repository: repo,
        remediationImplementationCommit: implementationCommit,
        sourceReassuranceProof: {
          workflowRunId: reassuranceRunId,
          artifactName: reassuranceArtifactName,
          artifactDigest: reassuranceArtifactDigest,
          headSha: reassuranceHeadSha,
          correctedBundleFingerprint,
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
