import { describe, expect, it } from 'vitest'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { z } from 'zod'
import { foundationCoverageModelSchema } from './foundation-compilation'
import {
  generateFoundationInternalLearningAssets,
} from './foundation-internal-learning-assets'
import {
  computeFoundationFingerprint,
} from './foundation-lifecycle'
import {
  foundationCandidateSchema,
  foundationJobSchema,
} from './foundation-schema'
import {
  getFoundationDerivedAssetReleaseProblems,
} from './foundation-derived-asset'
import { createOpenAIModelAssistedWorkers } from './openai-live-adapter'
import { courseKnowledgeModelSchema } from './schema'

const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }
const env = runtime.process?.env ?? {}
const liveEnabled = env.CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_PROOF === '1'
const evidenceDirectory = '.artifacts/content-factory-foundation-internal-learning-proof'
const testTimeoutMs = 75 * 60 * 1000

const commitShaSchema = z.string().regex(/^[0-9a-f]{40}$/)
const sha256Schema = z.string().regex(/^[0-9a-f]{64}$/)
const nonEmptyStringSchema = z.string().min(1)

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
    workflowRunId: nonEmptyStringSchema,
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

type GenerationRun = {
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
  if (artifact.fingerprint !== input.expectedFingerprint) {
    throw new Error(`${input.kind} artifact fingerprint does not match the AI-assured Candidate`)
  }
  return { artifact, value: input.parse(artifact.value) }
}

function failureMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

describe('Foundation-native live internal Learn/Practice production proof', () => {
  const liveIt = liveEnabled ? it : it.skip

  liveIt('generates retained AQA A-level Business 7132 Learn/Practice content from the exact AI-assured Foundation only', async () => {
    const repo = requiredEnv('GITHUB_REPOSITORY')
    const token = requiredEnv('GITHUB_TOKEN')
    const sourceProofPath = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_PROOF_PATH')
    const aiAssuredProofPath = requiredEnv('CONTENT_FACTORY_FOUNDATION_AI_ASSURED_PROOF_PATH')
    const sourceRunId = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_RUN_ID')
    const sourceArtifactName = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_ARTIFACT_NAME')
    const sourceArtifactDigest = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_ARTIFACT_DIGEST')
    const sourceHeadSha = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_HEAD_SHA')
    const sourceFoundationFingerprint = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_FINGERPRINT')
    const aiAssuredRunId = requiredEnv('CONTENT_FACTORY_FOUNDATION_AI_ASSURED_RUN_ID')
    const aiAssuredArtifactName = requiredEnv('CONTENT_FACTORY_FOUNDATION_AI_ASSURED_ARTIFACT_NAME')
    const aiAssuredArtifactDigest = requiredEnv('CONTENT_FACTORY_FOUNDATION_AI_ASSURED_ARTIFACT_DIGEST')
    const aiAssuredHeadSha = requiredEnv('CONTENT_FACTORY_FOUNDATION_AI_ASSURED_HEAD_SHA')
    const foundationFingerprint = requiredEnv('CONTENT_FACTORY_FOUNDATION_FINGERPRINT')
    const implementationCommit = requiredEnv('CONTENT_FACTORY_GENERATION_IMPLEMENTATION_COMMIT')
    const apiKey = requiredEnv('OPENAI_API_KEY')
    const maxSpendUsd = positiveNumberEnv('CONTENT_FACTORY_MAX_SPEND_USD', 12)
    const maxOutputTokens = positiveIntegerEnv('CONTENT_FACTORY_GENERATION_MAX_OUTPUT_TOKENS', 4_000)
    const generationModel = env.CONTENT_FACTORY_GENERATION_MODEL?.trim() || 'gpt-5.6-terra'
    const now = new Date().toISOString()

    const sourceProof = sourceProofSchema.parse(await readJson(sourceProofPath))
    const aiProof = aiAssuredProofSchema.parse(await readJson(aiAssuredProofPath))

    expect(sourceProof.repository).toBe(repo)
    expect(aiProof.repository).toBe(repo)
    expect(sourceProof.contentHeadSha).toBe(sourceHeadSha)
    expect(sourceProof.foundationFingerprint).toBe(sourceFoundationFingerprint)
    expect(sourceProof.learnerAssetCount).toBe(0)
    expect(aiProof.challengeImplementationCommit).toBe(aiAssuredHeadSha)
    expect(aiProof.reviewedCommit).toBe(sourceHeadSha)
    expect(aiProof.foundationFingerprint).toBe(foundationFingerprint)
    expect(aiProof.sourceProof.workflowRunId).toBe(sourceRunId)
    expect(aiProof.sourceProof.artifactName).toBe(sourceArtifactName)
    expect(aiProof.sourceProof.artifactDigest).toBe(sourceArtifactDigest)
    expect(aiProof.sourceProof.contentHeadSha).toBe(sourceHeadSha)
    expect(aiProof.sourceProof.foundationFingerprint).toBe(sourceFoundationFingerprint)
    expect(aiProof.jobId).toBe(sourceProof.jobId)
    expect(aiProof.candidateId).toBe(aiProof.finalCandidate.candidateId)

    const candidate = foundationCandidateSchema.parse(aiProof.finalCandidate)
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

    expect(coverageModel.jobId).toBe(aiProof.jobId)
    expect(courseKnowledgeModel.jobId).toBe(aiProof.jobId)
    expect(courseKnowledgeModel.fingerprint).toBe(candidate.courseKnowledgeModel.fingerprint)

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
      model: generationModel,
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
    const baseWorkers = createOpenAIModelAssistedWorkers({
      apiKey,
      maxSpendUsd,
      generation: route,
      independentReview: { ...route, reasoningEffort: 'high' },
      maxRetries: 2,
    })

    const generationRuns: GenerationRun[] = []
    const workers = {
      async generateLearningCollateral(input: Parameters<typeof baseWorkers.generateLearningCollateral>[0]) {
        const execution = await baseWorkers.generateLearningCollateral(input)
        generationRuns.push({
          stage: 'learn',
          workUnitId: input.workUnit.id,
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
      async generatePracticeCollateral(input: Parameters<typeof baseWorkers.generatePracticeCollateral>[0]) {
        const execution = await baseWorkers.generatePracticeCollateral(input)
        generationRuns.push({
          stage: 'practice',
          workUnitId: input.workUnit.id,
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

    const priorContextIds = new Set([
      ...candidate.provenance.generationContextIds,
      ...candidate.provenance.assuranceContextIds,
      ...(candidate.externalSourceChallenge ? [candidate.externalSourceChallenge.reviewerContextId] : []),
    ])

    let bundle: Awaited<ReturnType<typeof generateFoundationInternalLearningAssets>> | undefined
    let generationFailure: string | undefined
    try {
      bundle = await generateFoundationInternalLearningAssets({
        job,
        coverageModel,
        coverageModelFingerprint: candidate.coverageModel.fingerprint,
        courseKnowledgeModel,
        workers,
        now,
        assetIdPrefix: `aqa-7132-2027-${foundationFingerprint.slice(0, 12)}`,
      })
    } catch (error) {
      generationFailure = failureMessage(error)
    }

    const observedUsageCostUsd = Number(generationRuns.reduce((total, run) => total + (run.usageCost ?? 0), 0).toFixed(8))
    const evidenceBase = {
      schemaVersion: 1,
      artifactType: 'foundation_internal_learning_live_proof_evidence',
      recordedAt: new Date().toISOString(),
      repository: repo,
      generationImplementationCommit: implementationCommit,
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
      jobId: aiProof.jobId,
      candidateId: candidate.candidateId,
      foundationFingerprint,
      courseIdentity: candidate.courseIdentity,
      coverageModelFingerprint: candidate.coverageModel.fingerprint,
      courseKnowledgeModelFingerprint: candidate.courseKnowledgeModel.fingerprint,
      generationModel,
      generationMaxOutputTokens: maxOutputTokens,
      configuredMaxSpendUsd: maxSpendUsd,
      observedUsageCostUsd,
      generationRuns,
      humanReviewStatus: 'pending' as const,
      foundationApprovalStatus: 'not_approved' as const,
      learnerPublicationEligible: false as const,
    }

    await mkdir(evidenceDirectory, { recursive: true })
    const evidencePath = `${evidenceDirectory}/${aiProof.jobId}-internal-learning.json`

    if (!bundle) {
      await writeFile(evidencePath, JSON.stringify({
        ...evidenceBase,
        status: 'fail_hold',
        failure: generationFailure ?? 'unknown_generation_failure',
        learnerAssetCount: 0,
      }, null, 2), 'utf-8')
      await addIssueComment(repo, token, 289, [
        'Foundation-native internal Learn/Practice production proof failed closed.',
        '',
        `- Course: **AQA A-level Business 7132 — 2027 cohort**`,
        `- Foundation fingerprint: \`${foundationFingerprint}\``,
        `- Generation implementation: \`${implementationCommit}\``,
        `- Generation calls attempted: **${generationRuns.length}**`,
        `- Observed provider spend: **$${observedUsageCostUsd.toFixed(4)} / $${maxSpendUsd.toFixed(2)}**`,
        `- Failure: \`${generationFailure ?? 'unknown_generation_failure'}\``,
        '',
        'No generated asset has been marked assured or publication-eligible.',
      ].join('\n'))
      throw new Error(generationFailure ?? 'Foundation-native internal learning generation failed')
    }

    const releaseProblems = {
      learn: getFoundationDerivedAssetReleaseProblems(bundle.learnAsset, job),
      practice: getFoundationDerivedAssetReleaseProblems(bundle.practiceAsset, job),
    }
    const contextCollisions = bundle.generationContextIds.filter((contextId) => priorContextIds.has(contextId))
    const expectedWorkUnitCount = new Set(coverageModel.requirements.map((requirement) => requirement.revisionArea)).size

    const evidence = {
      ...evidenceBase,
      status: 'pass',
      workUnitCount: bundle.workUnits.length,
      generationContextCount: bundle.generationContextIds.length,
      contextCollisions,
      learnAssetStatus: bundle.learnAsset.assuranceStatus,
      practiceAssetStatus: bundle.practiceAsset.assuranceStatus,
      learnerAssetCount: 2,
      releaseProblems,
      bundle,
    }
    await writeFile(evidencePath, JSON.stringify(evidence, null, 2), 'utf-8')

    await addIssueComment(repo, token, 289, [
      'Foundation-native internal Learn/Practice production proof completed.',
      '',
      `- Course: **AQA A-level Business 7132 — 2027 cohort**`,
      `- Foundation fingerprint: \`${foundationFingerprint}\``,
      `- Generation implementation: \`${implementationCommit}\``,
      `- Deterministic work units: **${bundle.workUnits.length}**`,
      `- Learn outputs: **${bundle.workUnits.length}**`,
      `- Practice outputs: **${bundle.workUnits.length}**`,
      `- Fresh generation contexts: **${bundle.generationContextIds.length}**`,
      `- Provider calls: **${generationRuns.length}**`,
      `- Observed provider spend: **$${observedUsageCostUsd.toFixed(4)} / $${maxSpendUsd.toFixed(2)}**`,
      `- Learn asset assurance: \`${bundle.learnAsset.assuranceStatus}\``,
      `- Practice asset assurance: \`${bundle.practiceAsset.assuranceStatus}\``,
      `- Qualified-human Foundation review: \`pending\``,
      `- Learner publication eligible: **no**`,
      '',
      'The generated bundle is retained for the next independent asset-assurance slice. It is internal pre-production evidence only and has not entered the production learner-content registry.',
    ].join('\n'))

    expect(bundle.foundationFingerprint).toBe(foundationFingerprint)
    expect(bundle.foundationCandidateId).toBe(candidate.candidateId)
    expect(bundle.coverageModelFingerprint).toBe(candidate.coverageModel.fingerprint)
    expect(bundle.knowledgeModelFingerprint).toBe(candidate.courseKnowledgeModel.fingerprint)
    expect(bundle.workUnits).toHaveLength(expectedWorkUnitCount)
    expect(generationRuns).toHaveLength(bundle.workUnits.length * 2)
    expect(generationRuns.every((run) => run.status === 'success')).toBe(true)
    expect(generationRuns.every((run) => run.provider === 'openai' && run.model === generationModel)).toBe(true)
    expect(generationRuns.every((run) => typeof run.usageCost === 'number')).toBe(true)
    expect(observedUsageCostUsd).toBeLessThanOrEqual(maxSpendUsd)
    expect(contextCollisions).toEqual([])
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
  }, testTimeoutMs)
})
