import { describe, expect, it } from 'vitest'
import { mkdir, writeFile } from 'node:fs/promises'
import { z } from 'zod'
import {
  advanceFoundationJob,
  computeFoundationFingerprint,
  createFoundationJob,
  setFoundationCandidate,
} from './foundation-lifecycle'
import { foundationCandidateSchema, type FoundationJob } from './foundation-schema'
import {
  foundationCompilationWorkerStageSchema,
  type FoundationCompilationWorkerRun,
} from './foundation-compilation'
import { createOpenAIFoundationLiveProvider } from './foundation-live-adapter'
import { createFoundationIndependentReviewLiveWorkers } from './foundation-independent-review-live-adapter'
import {
  foundationGenerationContextIdsFromWorkerRuns,
  runFoundationIndependentReviewWithGenerationEvidence,
} from './foundation-independent-review-context'
import type {
  FoundationIndependentReviewArtifactKind,
  FoundationIndependentReviewArtifactStore,
} from './foundation-independent-review'

const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }
const env = runtime.process?.env ?? {}
const proofEnabled = env.CONTENT_FACTORY_FOUNDATION_INDEPENDENT_REVIEW_PROOF === '1'
const evidenceDirectory = '.artifacts/content-factory-foundation-independent-review-proof'
const testTimeoutMs = 30 * 60 * 1000
const remediationMaxOutputTokens = 32_000
const independentReviewMaxOutputTokens = 12_000

type ProviderResponseDiagnostic = {
  status: string
  incompleteReason?: string
  inputTokens?: number
  outputTokens?: number
}

const workerRunSchema = z.object({
  stage: foundationCompilationWorkerStageSchema,
  provenance: z.object({
    id: z.string().min(1),
    contextId: z.string().min(1),
    contractVersion: z.string().min(1),
    provider: z.string().min(1).optional(),
    model: z.string().min(1).optional(),
    retryCount: z.number().int().nonnegative().optional(),
    usageCost: z.number().nonnegative().optional(),
  }),
  inputRefs: z.array(z.string()),
  outputRefs: z.array(z.string()),
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
  workerRuns: z.array(workerRunSchema).min(1),
  artifacts: z.array(z.object({
    kind: z.string().min(1),
    fingerprint: z.string().min(1),
    ref: z.string().min(1),
    value: z.unknown(),
  })).min(1),
  candidate: foundationCandidateSchema,
})

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

function unresolvedOperationalBlockers(job: Pick<FoundationJob, 'blockers'>) {
  return job.blockers.filter((blocker) => !blocker.resolvedAt)
}

function operationalBlockerDiagnosticLines(blockers: FoundationJob['blockers']) {
  if (blockers.length === 0) return []
  return [
    '',
    'Final operational blocker diagnostics:',
    '```json',
    JSON.stringify(blockers.map(({ id, reason, stage, createdAt }) => ({ id, reason, stage, createdAt })), null, 2),
    '```',
  ]
}

function providerResponseDiagnostic(body: unknown): ProviderResponseDiagnostic | null {
  if (typeof body !== 'object' || body === null) return null
  const value = body as {
    status?: unknown
    incomplete_details?: { reason?: unknown } | null
    usage?: { input_tokens?: unknown; output_tokens?: unknown } | null
  }
  if (typeof value.status !== 'string' || value.status === 'completed') return null
  return {
    status: value.status,
    ...(typeof value.incomplete_details?.reason === 'string'
      ? { incompleteReason: value.incomplete_details.reason }
      : {}),
    ...(typeof value.usage?.input_tokens === 'number' ? { inputTokens: value.usage.input_tokens } : {}),
    ...(typeof value.usage?.output_tokens === 'number' ? { outputTokens: value.usage.output_tokens } : {}),
  }
}

function createDiagnosticFetch(diagnostics: ProviderResponseDiagnostic[]): typeof fetch {
  return async (input, init) => {
    const response = await fetch(input, init)
    try {
      const diagnostic = providerResponseDiagnostic(await response.clone().json())
      if (diagnostic) diagnostics.push(diagnostic)
    } catch {
      // The provider adapter remains authoritative for response parsing/failure handling.
    }
    return response
  }
}

function providerResponseDiagnosticLines(diagnostics: ProviderResponseDiagnostic[]) {
  if (diagnostics.length === 0) return []
  return [
    '',
    'Non-completed provider response diagnostics:',
    '```json',
    JSON.stringify(diagnostics, null, 2),
    '```',
  ]
}

class RetainedProofReviewStore implements FoundationIndependentReviewArtifactStore {
  readonly values = new Map<string, unknown>()
  readonly writes: Array<{
    jobId: string
    kind: FoundationIndependentReviewArtifactKind
    fingerprint: string
    value: unknown
    ref: string
  }> = []

  constructor(artifacts: Array<{ ref: string; value: unknown }>) {
    for (const artifact of artifacts) this.values.set(artifact.ref, structuredClone(artifact.value))
  }

  async readJson(ref: string) {
    if (!this.values.has(ref)) throw new Error(`Retained Foundation artifact ${ref} not found`)
    return structuredClone(this.values.get(ref))
  }

  async writeJson(input: {
    jobId: string
    kind: FoundationIndependentReviewArtifactKind
    fingerprint: string
    value: unknown
  }) {
    const ref = `foundation:${input.jobId}:${input.kind}:${input.fingerprint}`
    const write = { ...input, ref, value: structuredClone(input.value) }
    this.writes.push(write)
    this.values.set(ref, structuredClone(input.value))
    return { ref }
  }
}

describe('Foundation independent review proof diagnostics', () => {
  it('retains the exact unresolved remediation blocker reason for failed provider output', () => {
    const blockers: FoundationJob['blockers'] = [{
      id: 'remediation-worker-failure-content-factory.foundation.targeted-remediation-test-run',
      reason: 'remediation worker failure: provider_contract_failure: correctedArtifact failed schema validation',
      stage: 'assuring',
      createdAt: '2026-09-04T05:54:00.000Z',
    }]

    const unresolved = unresolvedOperationalBlockers({ blockers })
    expect(unresolved).toEqual(blockers)

    const rendered = operationalBlockerDiagnosticLines(unresolved).join('\n')
    expect(rendered).toContain(blockers[0].id)
    expect(rendered).toContain(blockers[0].reason)
    expect(rendered).toContain('"stage": "assuring"')
  })

  it('keeps targeted remediation output capacity bounded above the independent-review route', () => {
    expect(remediationMaxOutputTokens).toBe(32_000)
    expect(independentReviewMaxOutputTokens).toBe(12_000)
    expect(remediationMaxOutputTokens).toBeGreaterThan(independentReviewMaxOutputTokens)
  })

  it('retains incomplete response reason and token usage without changing provider handling', () => {
    expect(providerResponseDiagnostic({
      status: 'incomplete',
      incomplete_details: { reason: 'max_tokens' },
      usage: { input_tokens: 21_000, output_tokens: 12_000 },
    })).toEqual({
      status: 'incomplete',
      incompleteReason: 'max_tokens',
      inputTokens: 21_000,
      outputTokens: 12_000,
    })
    expect(providerResponseDiagnostic({ status: 'completed' })).toBeNull()
  })
})

describe('Foundation retained real-course independent review proof', () => {
  const proofIt = proofEnabled ? it : it.skip

  proofIt('reviews and, if required, remediates the retained AQA Business Foundation through the released Slice 3B boundary', async () => {
    const sourceProofPath = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_PROOF_PATH')
    const expectedSourceHead = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_HEAD_SHA')
    const expectedFoundationFingerprint = requiredEnv('CONTENT_FACTORY_FOUNDATION_FINGERPRINT')
    const reviewedCommit = requiredEnv('CONTENT_FACTORY_REVIEWED_COMMIT')
    const sourceRunId = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_RUN_ID')
    const sourceArtifactName = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_ARTIFACT_NAME')
    const sourceArtifactDigest = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_ARTIFACT_DIGEST')
    const repo = requiredEnv('GITHUB_REPOSITORY')
    const token = requiredEnv('GITHUB_TOKEN')
    const apiKey = requiredEnv('OPENAI_API_KEY')
    const maxSpendUsd = positiveNumberEnv('CONTENT_FACTORY_MAX_SPEND_USD', 12)
    const generationModel = env.CONTENT_FACTORY_GENERATION_MODEL?.trim() || 'gpt-5.6-terra'
    const now = new Date().toISOString()

    const sourceProof = sourceProofSchema.parse(JSON.parse(await readUtf8File(sourceProofPath)))
    expect(sourceProof.repository).toBe(repo)
    expect(sourceProof.contentHeadSha).toBe(expectedSourceHead)
    expect(sourceProof.foundationFingerprint).toBe(expectedFoundationFingerprint)
    expect(sourceProof.candidateId).toBe(sourceProof.candidate.candidateId)
    expect(sourceProof.learnerAssetCount).toBe(0)
    expect(await computeFoundationFingerprint(sourceProof.candidate)).toBe(expectedFoundationFingerprint)

    const generationContextIds = foundationGenerationContextIdsFromWorkerRuns(
      sourceProof.workerRuns as FoundationCompilationWorkerRun[],
    )
    expect(generationContextIds.length).toBeGreaterThan(0)

    const providerResponseDiagnostics: ProviderResponseDiagnostic[] = []
    const provider = createOpenAIFoundationLiveProvider({
      apiKey,
      maxSpendUsd,
      fetchImpl: createDiagnosticFetch(providerResponseDiagnostics),
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
        maxOutputTokens: remediationMaxOutputTokens,
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
    const store = new RetainedProofReviewStore(sourceProof.artifacts)
    const requested = createFoundationJob({ jobId: sourceProof.jobId, createdAt: sourceProof.candidate.provenance.createdAt })
    const compiling = advanceFoundationJob(requested, 'compiling', now)
    const withCandidate = setFoundationCandidate(compiling, sourceProof.candidate, now)
    const assuring = advanceFoundationJob(withCandidate, 'assuring', now)

    const result = await runFoundationIndependentReviewWithGenerationEvidence({
      job: assuring,
      artifactStore: store,
      workers: createFoundationIndependentReviewLiveWorkers({ provider }),
      reviewedCommit,
      now,
      generationContextIds,
      maxRemediationCycles: 3,
    })

    const finalCandidate = result.job.candidate
    const finalFoundationFingerprint = finalCandidate
      ? await computeFoundationFingerprint(finalCandidate)
      : null
    const reviewContextIds = result.reviewReports.map((report) => report.reviewer.contextId)
    const remediationNoChangeRecords = result.remediationNoChangeRecords ?? []
    const remediationNoChangeRefs = result.remediationNoChangeRefs ?? []
    const remediationContextIds = [
      ...result.remediationRecords.map((record) => record.remediationWorker.contextId),
      ...remediationNoChangeRecords.map((record) => record.remediationWorker.contextId),
    ]
    const providerContextIds = [...reviewContextIds, ...remediationContextIds]
    const budget = provider.budgetSnapshot?.() ?? { conservativeConsumedUsd: 0 }
    const operationalBlockers = unresolvedOperationalBlockers(result.job)
    const finalPass = result.job.state === 'assuring'
      && finalCandidate?.deterministicAssurance.status === 'pass'
      && finalCandidate.independentReview.status === 'pass'
      && result.reviewReports.at(-1)?.decision === 'pass'

    for (const contextId of providerContextIds) expect(generationContextIds).not.toContain(contextId)
    expect(new Set(providerContextIds).size).toBe(providerContextIds.length)

    const evidence = {
      schemaVersion: 1,
      artifactType: 'foundation_real_course_independent_review_proof_evidence',
      recordedAt: new Date().toISOString(),
      repository: repo,
      reviewedCommit,
      sourceProof: {
        workflowRunId: sourceRunId,
        artifactName: sourceArtifactName,
        artifactDigest: sourceArtifactDigest,
        contentHeadSha: sourceProof.contentHeadSha,
        jobId: sourceProof.jobId,
        candidateId: sourceProof.candidateId,
        foundationFingerprint: sourceProof.foundationFingerprint,
      },
      generationContextIds,
      reviewContextIds,
      remediationContextIds,
      providerResponseDiagnostics,
      configuredMaxSpendUsd: maxSpendUsd,
      providerBudget: budget,
      finalState: result.job.state,
      blockedFromState: result.job.blockedFromState ?? null,
      finalOperationalBlockers: operationalBlockers,
      finalCandidateId: finalCandidate?.candidateId ?? null,
      finalFoundationFingerprint,
      deterministicAssuranceStatus: finalCandidate?.deterministicAssurance.status ?? null,
      independentReviewStatus: finalCandidate?.independentReview.status ?? null,
      finalCandidateUnresolvedBlockers: finalCandidate?.unresolvedBlockers ?? [],
      reviewReports: result.reviewReports,
      reviewRefs: result.reviewRefs,
      remediationRecords: result.remediationRecords,
      remediationRefs: result.remediationRefs,
      remediationNoChangeRecords,
      remediationNoChangeRefs,
      newArtifacts: store.writes,
      finalCandidate,
      learnerAssetCount: sourceProof.learnerAssetCount,
      finalPass,
    }

    await mkdir(evidenceDirectory, { recursive: true })
    const evidencePath = `${evidenceDirectory}/${sourceProof.jobId}-independent-review.json`
    await writeFile(evidencePath, JSON.stringify(evidence, null, 2), 'utf-8')

    const finalReview = result.reviewReports.at(-1)
    const materialFindingCount = result.reviewReports.reduce(
      (count, report) => count + report.findings.filter((finding) => ['blocking', 'material'].includes(finding.severity)).length,
      0,
    )
    await addIssueComment(repo, token, 289, [
      'Slice 3B retained real-course independent Foundation review proof completed.',
      '',
      `- Source proof workflow run: \`${sourceRunId}\``,
      `- Source Foundation fingerprint: \`${sourceProof.foundationFingerprint}\``,
      `- Review implementation commit: \`${reviewedCommit}\``,
      `- Course: **AQA A-level Business 7132 — 2027 cohort**`,
      `- Generation contexts excluded from assurance: **${generationContextIds.length}**`,
      `- Fresh independent review contexts: **${reviewContextIds.length}**`,
      `- Targeted remediation contexts: **${remediationContextIds.length}**`,
      `- Material/blocking findings encountered across review cycles: **${materialFindingCount}**`,
      `- Successful remediation cycles retained: **${result.remediationRecords.length}**`,
      `- No-change remediation attempts retained: **${remediationNoChangeRecords.length}**`,
      `- Final Foundation fingerprint: \`${finalFoundationFingerprint ?? 'unavailable'}\``,
      `- Final deterministic assurance: **${finalCandidate?.deterministicAssurance.status ?? 'unavailable'}**`,
      `- Final independent review: **${finalCandidate?.independentReview.status ?? 'unavailable'}**`,
      `- Final operational blockers: **${operationalBlockers.length}**`,
      `- Non-completed provider responses retained: **${providerResponseDiagnostics.length}**`,
      `- Conservative provider spend: **$${budget.conservativeConsumedUsd.toFixed(4)} / $${maxSpendUsd.toFixed(2)}**`,
      `- Learner-facing assets generated: **${sourceProof.learnerAssetCount}**`,
      ...operationalBlockerDiagnosticLines(operationalBlockers),
      ...providerResponseDiagnosticLines(providerResponseDiagnostics),
      '',
      finalPass
        ? 'Slice 3B operational proof PASS: the exact retained/current Foundation version has deterministic PASS and fresh-context independent-review PASS. This does not constitute qualified expert approval or `foundation_approved`; Slice 3C remains mandatory.'
        : `Slice 3B operational proof is blocked. Final review decision: ${finalReview?.decision ?? 'no review report'}. The Foundation must not progress to Slice 3C until the blocking condition is resolved and the exact version passes deterministic assurance plus fresh independent review.`,
    ].join('\n'))

    expect(result.reviewReports.length).toBeGreaterThan(0)
    expect(result.job.state).toBe('assuring')
    expect(finalCandidate?.deterministicAssurance.status).toBe('pass')
    expect(finalCandidate?.independentReview.status).toBe('pass')
    expect(result.reviewReports.at(-1)?.decision).toBe('pass')
    expect(sourceProof.learnerAssetCount).toBe(0)
    expect(budget.conservativeConsumedUsd).toBeLessThanOrEqual(maxSpendUsd)
  }, testTimeoutMs)
})
