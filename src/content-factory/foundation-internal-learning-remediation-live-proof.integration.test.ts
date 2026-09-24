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
import { remediateFoundationInternalLearningAssets } from './foundation-internal-learning-remediation'
import { computeFoundationFingerprint } from './foundation-lifecycle'
import { foundationCandidateSchema, foundationJobSchema } from './foundation-schema'
import { fingerprintValue } from './intake-to-knowledge-model'
import { createOpenAIFoundationCourseLearningRemediationWorkers } from './openai-foundation-course-learning-remediation-workers'
import { courseKnowledgeModelSchema } from './schema'

const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }
const env = runtime.process?.env ?? {}
const liveEnabled = env.CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_REMEDIATION_PROOF === '1'
const evidenceDirectory = '.artifacts/content-factory-foundation-internal-learning-remediation-proof'
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
  coverageModelFingerprint: sha256Schema,
  courseKnowledgeModelFingerprint: sha256Schema,
  status: z.literal('pass'),
  learnAssetStatus: z.literal('pending'),
  practiceAssetStatus: z.literal('pending'),
  learnerPublicationEligible: z.literal(false),
  bundle: foundationInternalLearningAssetBundleSchema,
})
const assuranceProofSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('foundation_internal_learning_assurance_live_proof_evidence'),
  repository: nonEmptyStringSchema,
  assuranceImplementationCommit: commitShaSchema,
  sourceProof: sourceProofIdentitySchema,
  aiAssuredProof: aiProofIdentitySchema,
  internalLearningProof: retainedIdentitySchema.extend({
    headSha: commitShaSchema,
    sourceBundleFingerprint: sha256Schema,
  }),
  jobId: nonEmptyStringSchema,
  candidateId: nonEmptyStringSchema,
  foundationFingerprint: sha256Schema,
  deterministicAssurance: z.object({
    sourceBundleFingerprint: sha256Schema,
    decision: z.literal('pass'),
  }),
  independentReview: foundationInternalLearningIndependentReviewSchema,
  remediationTargets: z.array(foundationInternalLearningRemediationTargetSchema).min(1),
  status: z.literal('fail_hold'),
  humanReviewStatus: z.literal('pending'),
  foundationApprovalStatus: z.literal('not_approved'),
  learnerPublicationEligible: z.literal(false),
})

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
  if (matches[0].fingerprint !== input.expectedFingerprint) {
    throw new Error(`${input.kind} artifact fingerprint does not match the AI-assured Candidate`)
  }
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

describe('Foundation-native retained targeted Learn/Practice remediation proof', () => {
  const liveIt = liveEnabled ? it : it.skip

  liveIt('remediates every and only retained open finding at the reviewed asset side', async () => {
    const repo = requiredEnv('GITHUB_REPOSITORY')
    const token = requiredEnv('GITHUB_TOKEN')
    const learningRunId = requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_RUN_ID')
    const learningArtifactName = requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_ARTIFACT_NAME')
    const learningArtifactDigest = requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_ARTIFACT_DIGEST')
    const learningHeadSha = requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_HEAD_SHA')
    const assuranceRunId = requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_ASSURANCE_RUN_ID')
    const assuranceArtifactName = requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_ASSURANCE_ARTIFACT_NAME')
    const assuranceArtifactDigest = requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_ASSURANCE_ARTIFACT_DIGEST')
    const assuranceHeadSha = requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_ASSURANCE_HEAD_SHA')
    const foundationFingerprint = requiredEnv('CONTENT_FACTORY_FOUNDATION_FINGERPRINT')
    const implementationCommit = requiredEnv('CONTENT_FACTORY_REMEDIATION_IMPLEMENTATION_COMMIT')
    const maxSpendUsd = positiveNumberEnv('CONTENT_FACTORY_REMEDIATION_MAX_SPEND_USD', 12)
    const maxOutputTokens = positiveIntegerEnv('CONTENT_FACTORY_REMEDIATION_MAX_OUTPUT_TOKENS', 8_000)
    const remediationModel = env.CONTENT_FACTORY_REMEDIATION_MODEL?.trim() || 'gpt-5.6-terra'
    const now = new Date().toISOString()

    await mkdir(evidenceDirectory, { recursive: true })
    const fallbackEvidencePath = `${evidenceDirectory}/live-proof-failure.json`

    try {
      const sourceProof = sourceProofSchema.parse(await readJson(requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_PROOF_PATH')))
      const aiProof = aiAssuredProofSchema.parse(await readJson(requiredEnv('CONTENT_FACTORY_FOUNDATION_AI_ASSURED_PROOF_PATH')))
      const learningProof = learningProofSchema.parse(await readJson(requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_PROOF_PATH')))
      const assuranceProof = assuranceProofSchema.parse(await readJson(requiredEnv('CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_ASSURANCE_PROOF_PATH')))

      expect(sourceProof.repository).toBe(repo)
      expect(aiProof.repository).toBe(repo)
      expect(learningProof.repository).toBe(repo)
      expect(assuranceProof.repository).toBe(repo)
      expect(learningProof.generationImplementationCommit).toBe(learningHeadSha)
      expect(assuranceProof.assuranceImplementationCommit).toBe(assuranceHeadSha)
      expect(learningProof.foundationFingerprint).toBe(foundationFingerprint)
      expect(assuranceProof.foundationFingerprint).toBe(foundationFingerprint)
      expect(assuranceProof.internalLearningProof).toMatchObject({
        workflowRunId: learningRunId,
        artifactName: learningArtifactName,
        artifactDigest: learningArtifactDigest,
        headSha: learningHeadSha,
      })
      expect(learningProof.sourceProof).toEqual(assuranceProof.sourceProof)
      expect(learningProof.aiAssuredProof).toEqual(assuranceProof.aiAssuredProof)
      expect(sourceProof.contentHeadSha).toBe(learningProof.sourceProof.contentHeadSha)
      expect(sourceProof.foundationFingerprint).toBe(foundationFingerprint)
      expect(aiProof.challengeImplementationCommit).toBe(learningProof.aiAssuredProof.headSha)
      expect(aiProof.reviewedCommit).toBe(sourceProof.contentHeadSha)
      expect(aiProof.foundationFingerprint).toBe(foundationFingerprint)
      expect(aiProof.jobId).toBe(sourceProof.jobId)
      expect(aiProof.candidateId).toBe(learningProof.candidateId)

      const candidate = foundationCandidateSchema.parse(aiProof.finalCandidate)
      expect(await computeFoundationFingerprint(candidate)).toBe(foundationFingerprint)
      expect(candidate.candidateId).toBe(learningProof.candidateId)

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
      expect(coverageModel.jobId).toBe(aiProof.jobId)
      expect(courseKnowledgeModel.jobId).toBe(aiProof.jobId)
      expect(learningProof.coverageModelFingerprint).toBe(candidate.coverageModel.fingerprint)
      expect(learningProof.courseKnowledgeModelFingerprint).toBe(candidate.courseKnowledgeModel.fingerprint)

      const job = foundationJobSchema.parse({
        schemaVersion: 1,
        jobId: aiProof.jobId,
        state: 'ai_assured',
        candidate,
        blockers: [],
        createdAt: candidate.provenance.createdAt,
        updatedAt: now,
      })
      const sourceBundleFingerprint = await fingerprintValue(learningProof.bundle)
      expect(sourceBundleFingerprint).toBe(assuranceProof.internalLearningProof.sourceBundleFingerprint)
      expect(sourceBundleFingerprint).toBe(assuranceProof.deterministicAssurance.sourceBundleFingerprint)
      expect(sourceBundleFingerprint).toBe(assuranceProof.independentReview.sourceBundleFingerprint)

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
      const remediationRuns: RemediationRun[] = []
      const workers = {
        async remediateLearningCollateral(input: Parameters<typeof baseWorkers.remediateLearningCollateral>[0]) {
          const execution = await baseWorkers.remediateLearningCollateral(input)
          appendRuns(remediationRuns, 'learn', input.workUnit.id, execution as LoggedExecution)
          return execution
        },
        async remediatePracticeCollateral(input: Parameters<typeof baseWorkers.remediatePracticeCollateral>[0]) {
          const execution = await baseWorkers.remediatePracticeCollateral(input)
          appendRuns(remediationRuns, 'practice', input.workUnit.id, execution as LoggedExecution)
          return execution
        },
      }

      let result: Awaited<ReturnType<typeof remediateFoundationInternalLearningAssets>> | undefined
      let remediationFailure: string | undefined
      try {
        result = await remediateFoundationInternalLearningAssets({
          job,
          sourceBundle: learningProof.bundle,
          coverageModel,
          courseKnowledgeModel,
          independentReview: assuranceProof.independentReview,
          remediationTargets: assuranceProof.remediationTargets,
          workers,
          now,
          assetIdPrefix: `aqa-7132-2027-${foundationFingerprint.slice(0, 12)}-targeted-remediation`,
        })
      } catch (error) {
        remediationFailure = failureMessage(error)
      }

      const openFindingIds = assuranceProof.independentReview.findings
        .filter((finding) => finding.resolutionStatus === 'open' && finding.severity !== 'no_issue')
        .map((finding) => finding.id)
        .sort()
      const reportedUsageRuns = remediationRuns.filter((run) => typeof run.usageCost === 'number')
      const reportedUsageCostUsd = Number(reportedUsageRuns.reduce((total, run) => total + (run.usageCost ?? 0), 0).toFixed(8))
      const evidenceBase = {
        schemaVersion: 1,
        artifactType: 'foundation_internal_learning_remediation_live_proof_evidence',
        recordedAt: new Date().toISOString(),
        repository: repo,
        remediationImplementationCommit: implementationCommit,
        sourceProof: learningProof.sourceProof,
        aiAssuredProof: learningProof.aiAssuredProof,
        sourceLearningProof: {
          workflowRunId: learningRunId,
          artifactName: learningArtifactName,
          artifactDigest: learningArtifactDigest,
          headSha: learningHeadSha,
          sourceBundleFingerprint,
        },
        sourceAssuranceProof: {
          workflowRunId: assuranceRunId,
          artifactName: assuranceArtifactName,
          artifactDigest: assuranceArtifactDigest,
          headSha: assuranceHeadSha,
          reviewFingerprint: await fingerprintValue(assuranceProof.independentReview),
        },
        jobId: aiProof.jobId,
        candidateId: candidate.candidateId,
        foundationFingerprint,
        courseIdentity: candidate.courseIdentity,
        coverageModelFingerprint: candidate.coverageModel.fingerprint,
        courseKnowledgeModelFingerprint: candidate.courseKnowledgeModel.fingerprint,
        sourceOpenFindingCount: openFindingIds.length,
        sourceRemediationTargetCount: assuranceProof.remediationTargets.length,
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
      const evidencePath = `${evidenceDirectory}/${aiProof.jobId}-internal-learning-remediation.json`

      if (!result) {
        await writeFile(evidencePath, JSON.stringify({
          ...evidenceBase,
          status: 'fail_hold',
          failure: remediationFailure ?? 'unknown_targeted_remediation_failure',
          addressedFindingCount: 0,
          assuredAssetCount: 0,
        }, null, 2), 'utf-8')
        await addIssueComment(repo, token, [
          'Foundation-native targeted Learn/Practice remediation proof failed closed.',
          '',
          `- Course: **AQA A-level Business 7132 — 2027 cohort**`,
          `- Foundation fingerprint: \`${foundationFingerprint}\``,
          `- Retained open findings: **${openFindingIds.length}**`,
          `- Retained remediation targets: **${assuranceProof.remediationTargets.length}**`,
          `- Remediation provider calls attempted: **${remediationRuns.length}**`,
          `- Hard provider spend ceiling: **$${maxSpendUsd.toFixed(2)}**`,
          `- Failure: \`${remediationFailure ?? 'unknown_targeted_remediation_failure'}\``,
          '',
          'No finding has been treated as resolved, no derived asset has been marked assured and learner publication remains blocked.',
        ].join('\n'))
        throw new Error(remediationFailure ?? 'Foundation-native targeted learning remediation failed')
      }

      const { bundle, remediationRecord } = result
      const targetLearnUnits = new Set<string>()
      const targetPracticeUnits = new Set<string>()
      for (const target of assuranceProof.remediationTargets) {
        if (target.assetKind === 'learn' || target.assetKind === 'both') targetLearnUnits.add(target.workUnitId)
        if (target.assetKind === 'practice' || target.assetKind === 'both') targetPracticeUnits.add(target.workUnitId)
      }
      for (const sourceWorkUnit of learningProof.bundle.workUnits) {
        const corrected = bundle.workUnits.find((workUnit) => workUnit.plan.id === sourceWorkUnit.plan.id)
        expect(corrected).toBeDefined()
        if (!targetLearnUnits.has(sourceWorkUnit.plan.id)) expect(corrected?.learning).toEqual(sourceWorkUnit.learning)
        if (!targetPracticeUnits.has(sourceWorkUnit.plan.id)) expect(corrected?.practice).toEqual(sourceWorkUnit.practice)
      }

      const priorContexts = [
        ...candidate.provenance.generationContextIds,
        ...candidate.provenance.assuranceContextIds,
        ...(candidate.externalSourceChallenge ? [candidate.externalSourceChallenge.reviewerContextId] : []),
        ...learningProof.bundle.generationContextIds,
        ...assuranceProof.independentReview.reviewerContextIds,
      ]
      const contextCollisions = remediationRecord.remediationContextIds.filter((contextId) => priorContexts.includes(contextId))
      const expectedBundleContexts = [...new Set([...learningProof.bundle.generationContextIds, ...remediationRecord.remediationContextIds])]
      const resultBundleFingerprint = await fingerprintValue(bundle)
      const sourceReviewFingerprint = await fingerprintValue(assuranceProof.independentReview)
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
        resultBundleFingerprint,
        learnAssetStatus: bundle.learnAsset.assuranceStatus,
        practiceAssetStatus: bundle.practiceAsset.assuranceStatus,
        assuredAssetCount: 0,
        releaseProblems,
        remediationRecord,
        bundle,
      }, null, 2), 'utf-8')

      await addIssueComment(repo, token, [
        'Foundation-native targeted Learn/Practice remediation proof completed.',
        '',
        `- Course: **AQA A-level Business 7132 — 2027 cohort**`,
        `- Foundation fingerprint: \`${foundationFingerprint}\``,
        `- Addressed retained findings: **${remediationRecord.addressedFindingIds.length} / ${openFindingIds.length}**`,
        `- Remediated work units: **${new Set(remediationRecord.targets.map((target) => target.workUnitId)).size}**`,
        `- Remediated asset sides: **${remediationRecord.targets.length}**`,
        `- Fresh remediation contexts: **${remediationRecord.remediationContextIds.length}**`,
        `- Provider calls: **${remediationRuns.length}**`,
        `- Hard provider spend ceiling: **$${maxSpendUsd.toFixed(2)}**`,
        `- Reported final-response usage cost: **$${reportedUsageCostUsd.toFixed(4)}** across **${reportedUsageRuns.length}** runs (not retry-complete total spend)`,
        `- Learn asset assurance: \`${bundle.learnAsset.assuranceStatus}\``,
        `- Practice asset assurance: \`${bundle.practiceAsset.assuranceStatus}\``,
        `- Qualified-human Foundation review: \`pending\``,
        `- Learner publication eligible: **no**`,
        '',
        'The corrected bundle is retained only for deterministic and genuinely fresh independent re-assurance. Remediation itself does not resolve findings or permit publication.',
      ].join('\n'))

      const learnRuns = remediationRuns.filter((run) => run.stage === 'learn')
      const practiceRuns = remediationRuns.filter((run) => run.stage === 'practice')
      expect(remediationRecord.sourceBundleFingerprint).toBe(sourceBundleFingerprint)
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
      expect(releaseProblems.learn).toEqual(expect.arrayContaining([
        'Derived asset assurance must pass before learner release',
        'Learner release requires qualified-human foundation_approved state',
      ]))
      expect(releaseProblems.practice).toEqual(expect.arrayContaining([
        'Derived asset assurance must pass before learner release',
        'Learner release requires qualified-human foundation_approved state',
      ]))
    } catch (error) {
      await writeFile(fallbackEvidencePath, JSON.stringify({
        schemaVersion: 1,
        artifactType: 'foundation_internal_learning_remediation_live_proof_failure_evidence',
        status: 'fail_hold',
        recordedAt: new Date().toISOString(),
        repository: repo,
        remediationImplementationCommit: implementationCommit,
        sourceLearningProof: {
          workflowRunId: learningRunId,
          artifactName: learningArtifactName,
          artifactDigest: learningArtifactDigest,
          headSha: learningHeadSha,
        },
        sourceAssuranceProof: {
          workflowRunId: assuranceRunId,
          artifactName: assuranceArtifactName,
          artifactDigest: assuranceArtifactDigest,
          headSha: assuranceHeadSha,
        },
        foundationFingerprint,
        remediationModel,
        configuredHardSpendCeilingUsd: maxSpendUsd,
        failure: failureMessage(error),
        assuredAssetCount: 0,
        humanReviewStatus: 'pending',
        foundationApprovalStatus: 'not_approved',
        learnerPublicationEligible: false,
      }, null, 2), 'utf-8')
      throw error
    }
  }, testTimeoutMs)
})
