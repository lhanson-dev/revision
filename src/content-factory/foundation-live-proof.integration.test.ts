import { afterAll, describe, expect, it } from 'vitest'
import { mkdir, writeFile } from 'node:fs/promises'
import { advanceFoundationJob, computeFoundationFingerprint, createFoundationJob } from './foundation-lifecycle'
import {
  compileFoundationJob,
  type FoundationAssessmentBlueprint,
  type FoundationCompilationArtifactKind,
  type FoundationCompilationArtifactStore,
} from './foundation-compilation'
import {
  AQA_A_LEVEL_BUSINESS_7132_URLS,
  createAqaAlevelBusiness7132FoundationLiveWorkers,
  createOpenAIFoundationLiveProvider,
} from './foundation-live-adapter'
import { withAqa7132PreCalibrationAssemblyGuard } from './foundation-precalibration-assembly'
import { loadGovernedFoundationSourceRightsRules } from './foundation-source-rights-registry'
import {
  AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED,
  AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED_ID,
} from './source-seeds/aqa-a-level-business-7132-2027'

const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }
const env = runtime.process?.env ?? {}
const liveEnabled = env.CONTENT_FACTORY_FOUNDATION_LIVE_PROOF === '1'
const evidenceDirectory = '.artifacts/content-factory-foundation-live-proof'
const testTimeoutMs = 30 * 60 * 1000
const foundationGenerationMaxOutputTokens = 32_000
const independentReviewMaxOutputTokens = 12_000

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

class EvidenceArtifactStore implements FoundationCompilationArtifactStore {
  readonly artifacts: Array<{
    kind: FoundationCompilationArtifactKind
    fingerprint: string
    ref: string
    value: unknown
  }> = []

  async writeJson(input: { jobId: string; kind: FoundationCompilationArtifactKind; fingerprint: string; value: unknown }) {
    const ref = `foundation:${input.jobId}:${input.kind}:${input.fingerprint}`
    this.artifacts.push({ kind: input.kind, fingerprint: input.fingerprint, ref, value: structuredClone(input.value) })
    return { ref }
  }
}

afterAll(async () => {
  if (liveEnabled) await mkdir(evidenceDirectory, { recursive: true })
})

describe('Foundation live real-course proof', () => {
  const liveIt = liveEnabled ? it : it.skip

  liveIt('compiles AQA A-level Business 7132 for the 2027 cohort to a complete Foundation Candidate with zero learner assets', async () => {
    const repo = requiredEnv('GITHUB_REPOSITORY')
    const token = requiredEnv('GITHUB_TOKEN')
    const headSha = requiredEnv('CONTENT_FACTORY_CONTENT_HEAD_SHA')
    const gitRef = requiredEnv('CONTENT_FACTORY_GIT_REF')
    const apiKey = requiredEnv('OPENAI_API_KEY')
    const maxSpendUsd = positiveNumberEnv('CONTENT_FACTORY_MAX_SPEND_USD', 12)
    const generationModel = env.CONTENT_FACTORY_GENERATION_MODEL?.trim() || 'gpt-5.6-terra'
    const now = new Date().toISOString()
    const jobId = `aqa-a-level-business-7132-foundation-${headSha.slice(0, 12)}-${Date.now()}`
    const candidateId = `${jobId}-candidate-1`

    const rights = await loadGovernedFoundationSourceRightsRules({ repository: repo, gitRef, headSha })
    const provider = createOpenAIFoundationLiveProvider({
      apiKey,
      maxSpendUsd,
      generation: {
        model: generationModel,
        inputUsdPerMillion: 2,
        cachedInputUsdPerMillion: 0.2,
        outputUsdPerMillion: 12,
        cacheWriteMultiplier: 1.25,
        longContextThresholdTokens: 272_000,
        longContextInputMultiplier: 2,
        longContextOutputMultiplier: 1.5,
        reasoningEffort: 'high',
        maxOutputTokens: foundationGenerationMaxOutputTokens,
      },
      independentReview: {
        model: generationModel,
        inputUsdPerMillion: 2,
        cachedInputUsdPerMillion: 0.2,
        outputUsdPerMillion: 12,
        cacheWriteMultiplier: 1.25,
        longContextThresholdTokens: 272_000,
        longContextInputMultiplier: 2,
        longContextOutputMultiplier: 1.5,
        reasoningEffort: 'high',
        maxOutputTokens: independentReviewMaxOutputTokens,
      },
      maxRetries: 2,
    })
    const store = new EvidenceArtifactStore()
    const requested = createFoundationJob({ jobId, createdAt: now })
    const compiling = advanceFoundationJob(requested, 'compiling', now)
    const workers = withAqa7132PreCalibrationAssemblyGuard(
      createAqaAlevelBusiness7132FoundationLiveWorkers({ provider }),
    )

    const result = await compileFoundationJob({
      job: compiling,
      candidateId,
      officialUrls: [AQA_A_LEVEL_BUSINESS_7132_URLS.specification],
      founderInstruction: 'Compile a new governed AQA A-level Business 7132 Foundation for the 2027 examination cohort. Establish Course Truth and Exam Truth only. Generate no learner-facing assets.',
      workers,
      artifactStore: store,
      sourceRightsRules: rights.rules,
      now,
      producerVersion: 'foundation-live-adapter-v3',
      implementationHeadSha: headSha,
    })

    const foundationFingerprint = await computeFoundationFingerprint(result.candidate)
    const learnerAssetKinds = new Set(['learning', 'practice', 'assessment_item', 'marking_pack'])
    const learnerAssetCount = store.artifacts.filter((artifact) => learnerAssetKinds.has(artifact.kind)).length
    const budget = provider.budgetSnapshot?.() ?? { conservativeConsumedUsd: 0 }
    const providerRuns = result.workerRuns.filter((run) => run.provenance.provider === 'openai')
    const courseTruthArtifact = store.artifacts.find((artifact) => artifact.kind === 'course_knowledge_model')
    const coverageArtifact = store.artifacts.find((artifact) => artifact.kind === 'foundation_coverage_model')
    const assessmentBlueprintArtifact = store.artifacts.find((artifact) => artifact.kind === 'assessment_blueprint')
    const courseTruthNodeCount = (courseTruthArtifact?.value as { nodes?: unknown[] } | undefined)?.nodes?.length ?? 0
    const canonicalCoverageNodeCount = (coverageArtifact?.value as { requirements?: Array<{ knowledgeNodeIds?: unknown[] }> } | undefined)
      ?.requirements?.reduce((total, requirement) => total + (requirement.knowledgeNodeIds?.length ?? 0), 0) ?? 0
    const quantitativeCoveragePlan = (assessmentBlueprintArtifact?.value as FoundationAssessmentBlueprint | undefined)?.quantitativeCoveragePlan ?? null
    const evidence = {
      schemaVersion: 1,
      artifactType: 'foundation_live_real_course_proof_evidence',
      recordedAt: new Date().toISOString(),
      repository: repo,
      contentHeadSha: headSha,
      gitRef,
      sourceRightsRegistryFingerprint: rights.registryFingerprint,
      sourceRightsApprovalEvidenceRef: rights.approvalEvidenceRef,
      sourceRightsAuthorityRef: rights.authorityRef,
      courseTruthSeedId: AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED_ID,
      courseTruthSeedLimitations: AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED.limitations,
      configuredMaxSpendUsd: maxSpendUsd,
      providerBudget: budget,
      foundationGenerationMaxOutputTokens,
      independentReviewMaxOutputTokens,
      jobId,
      candidateId,
      foundationFingerprint,
      finalState: result.job.state,
      courseIdentity: result.candidate.courseIdentity,
      cohortValidity: result.candidate.cohortValidity,
      courseTruthCompleteness: result.candidate.courseTruthCompleteness,
      examTruthCompleteness: result.candidate.examTruthCompleteness,
      deterministicAssuranceStatus: result.candidate.deterministicAssurance.status,
      independentReviewStatus: result.candidate.independentReview.status,
      courseTruthNodeCount,
      canonicalCoverageNodeCount,
      quantitativeCoveragePlan,
      learnerAssetCount,
      workerRuns: result.workerRuns,
      providerRunCount: providerRuns.length,
      artifactKinds: store.artifacts.map((artifact) => artifact.kind),
      courseTruthArtifact,
      artifacts: store.artifacts,
      candidate: result.candidate,
    }

    await mkdir(evidenceDirectory, { recursive: true })
    await writeFile(`${evidenceDirectory}/${jobId}.json`, JSON.stringify(evidence, null, 2), 'utf-8')
    await addIssueComment(repo, token, 289, [
      'Slice 2B live Foundation proof completed.',
      '',
      `- Job: \`${jobId}\``,
      `- Course: **AQA A-level Business 7132 — 2027 cohort**`,
      `- Content head: \`${headSha}\``,
      `- Foundation fingerprint: \`${foundationFingerprint}\``,
      `- Rights registry: \`${rights.approvalEvidenceRef}\``,
      `- Governed Course Truth seed: \`${AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED_ID}\``,
      `- Canonical Course Truth nodes: **${courseTruthNodeCount}**`,
      `- Canonical coverage nodes: **${canonicalCoverageNodeCount}**`,
      `- Quantitative aggregate minimum: **${quantitativeCoveragePlan?.minimumQuantitativeMarks ?? 'unavailable'} / ${quantitativeCoveragePlan?.totalAssessmentMarks ?? 'unavailable'} marks**`,
      `- Course Truth compiler-complete: **${result.candidate.courseTruthCompleteness === 'complete' ? 'yes' : 'no'}**`,
      `- Exam Truth compiler-complete: **${result.candidate.examTruthCompleteness === 'complete' ? 'yes' : 'no'}**`,
      `- Live OpenAI worker runs: **${providerRuns.length}**`,
      `- Conservative provider spend: **$${budget.conservativeConsumedUsd.toFixed(4)} / $${maxSpendUsd.toFixed(2)}**`,
      `- Learner-facing assets generated: **${learnerAssetCount}**`,
      `- Foundation assurance status: \`${result.candidate.deterministicAssurance.status}\` / independent review \`${result.candidate.independentReview.status}\``,
      '',
      'This proves the live Foundation compilation boundary only. Compiler completeness is against the exact governed seed and new atomic coverage/quantitative/pre-calibration assembly contracts; it is not a claim of qualified-human curriculum completeness or Foundation approval. No Learn, Practice, assessment items, mocks or Marking Packs were generated.',
    ].join('\n'))

    expect(result.job.state).toBe('compiling')
    expect(result.candidate.courseTruthCompleteness).toBe('complete')
    expect(result.candidate.examTruthCompleteness).toBe('complete')
    expect(result.candidate.deterministicAssurance.status).toBe('pending')
    expect(result.candidate.independentReview.status).toBe('pending')
    expect(providerRuns.map((run) => run.stage)).toEqual(['course_truth', 'exam_truth', 'question_families'])
    expect(courseTruthNodeCount).toBe(canonicalCoverageNodeCount)
    expect(courseTruthNodeCount).toBeGreaterThan(AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED.requirements.length)
    expect(quantitativeCoveragePlan).toMatchObject({ minimumOverallPercent: 10, minimumQuantitativeMarks: 30, totalAssessmentMarks: 300 })
    expect(JSON.stringify(courseTruthArtifact?.value)).toContain(AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED_ID)
    expect(learnerAssetCount).toBe(0)
    expect(budget.conservativeConsumedUsd).toBeLessThanOrEqual(maxSpendUsd)
  }, testTimeoutMs)
})