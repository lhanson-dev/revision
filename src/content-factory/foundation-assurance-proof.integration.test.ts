import { describe, expect, it } from 'vitest'
import { mkdir, writeFile } from 'node:fs/promises'
import { z } from 'zod'
import {
  advanceFoundationJob,
  computeFoundationFingerprint,
  createFoundationJob,
  setFoundationCandidate,
} from './foundation-lifecycle'
import { foundationCandidateSchema } from './foundation-schema'
import {
  runDeterministicFoundationAssurance,
  type FoundationAssuranceArtifactStore,
} from './foundation-assurance'

const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }
const env = runtime.process?.env ?? {}
const proofEnabled = env.CONTENT_FACTORY_FOUNDATION_ASSURANCE_PROOF === '1'
const evidenceDirectory = '.artifacts/content-factory-foundation-assurance-proof'
const testTimeoutMs = 5 * 60 * 1000

const sourceProofSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('foundation_live_real_course_proof_evidence'),
  repository: z.string().min(1),
  contentHeadSha: z.string().regex(/^[0-9a-f]{40}$/),
  jobId: z.string().min(1),
  candidateId: z.string().min(1),
  foundationFingerprint: z.string().regex(/^[0-9a-f]{64}$/),
  learnerAssetCount: z.number().int().nonnegative(),
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

class RetainedProofAssuranceStore implements FoundationAssuranceArtifactStore {
  readonly values = new Map<string, unknown>()
  readonly writes: Array<{
    jobId: string
    kind: 'foundation_deterministic_assurance_report'
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
    kind: 'foundation_deterministic_assurance_report'
    fingerprint: string
    value: unknown
  }) {
    const ref = `foundation:${input.jobId}:${input.kind}:${input.fingerprint}`
    this.writes.push({ ...input, ref, value: structuredClone(input.value) })
    this.values.set(ref, structuredClone(input.value))
    return { ref }
  }
}

describe('Foundation retained real-course deterministic assurance proof', () => {
  const proofIt = proofEnabled ? it : it.skip

  proofIt('assures the exact retained AQA Business Foundation Candidate without regenerating content', async () => {
    const sourceProofPath = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_PROOF_PATH')
    const expectedSourceHead = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_HEAD_SHA')
    const expectedFoundationFingerprint = requiredEnv('CONTENT_FACTORY_FOUNDATION_FINGERPRINT')
    const reviewedCommit = requiredEnv('CONTENT_FACTORY_REVIEWED_COMMIT')
    const sourceRunId = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_RUN_ID')
    const sourceArtifactId = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_ARTIFACT_ID')
    const sourceArtifactName = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_ARTIFACT_NAME')
    const sourceArtifactDigest = requiredEnv('CONTENT_FACTORY_FOUNDATION_SOURCE_ARTIFACT_DIGEST')
    const repo = requiredEnv('GITHUB_REPOSITORY')
    const token = requiredEnv('GITHUB_TOKEN')
    const now = new Date().toISOString()

    const sourceProof = sourceProofSchema.parse(JSON.parse(await readUtf8File(sourceProofPath)))
    expect(sourceProof.repository).toBe(repo)
    expect(sourceProof.contentHeadSha).toBe(expectedSourceHead)
    expect(sourceProof.foundationFingerprint).toBe(expectedFoundationFingerprint)
    expect(sourceProof.candidateId).toBe(sourceProof.candidate.candidateId)
    expect(sourceProof.learnerAssetCount).toBe(0)

    const recomputedFoundationFingerprint = await computeFoundationFingerprint(sourceProof.candidate)
    expect(recomputedFoundationFingerprint).toBe(expectedFoundationFingerprint)

    const store = new RetainedProofAssuranceStore(sourceProof.artifacts)
    const requested = createFoundationJob({ jobId: sourceProof.jobId, createdAt: sourceProof.candidate.provenance.createdAt })
    const compiling = advanceFoundationJob(requested, 'compiling', now)
    const withCandidate = setFoundationCandidate(compiling, sourceProof.candidate, now)
    const assuring = advanceFoundationJob(withCandidate, 'assuring', now)

    const result = await runDeterministicFoundationAssurance({
      job: assuring,
      artifactStore: store,
      reviewedCommit,
      now,
    })

    const failedChecks = result.report.checks.filter((check) => check.status === 'fail')
    const proofEvidence = {
      schemaVersion: 1,
      artifactType: 'foundation_real_course_deterministic_assurance_proof_evidence',
      recordedAt: new Date().toISOString(),
      repository: repo,
      reviewedCommit,
      sourceProof: {
        workflowRunId: sourceRunId,
        artifactId: sourceArtifactId,
        artifactName: sourceArtifactName,
        artifactDigest: sourceArtifactDigest,
        contentHeadSha: sourceProof.contentHeadSha,
        jobId: sourceProof.jobId,
        candidateId: sourceProof.candidateId,
      },
      foundationFingerprint: result.report.foundationFingerprint,
      decision: result.report.decision,
      checkCount: result.report.checks.length,
      failedCheckCount: failedChecks.length,
      failedChecks,
      reportRef: result.reportRef,
      report: result.report,
      assuredJob: result.job,
      learnerAssetCount: sourceProof.learnerAssetCount,
    }

    await mkdir(evidenceDirectory, { recursive: true })
    const evidencePath = `${evidenceDirectory}/${sourceProof.jobId}-deterministic-assurance.json`
    await writeFile(evidencePath, JSON.stringify(proofEvidence, null, 2), 'utf-8')

    await addIssueComment(repo, token, 289, [
      'Slice 3A real-course deterministic Foundation assurance proof completed.',
      '',
      `- Source proof workflow run: \`${sourceRunId}\``,
      `- Source proof artifact: \`${sourceArtifactId}\``,
      `- Source content head: \`${sourceProof.contentHeadSha}\``,
      `- Assurance reviewed commit: \`${reviewedCommit}\``,
      `- Course: **AQA A-level Business 7132 — 2027 cohort**`,
      `- Foundation fingerprint: \`${result.report.foundationFingerprint}\``,
      `- Deterministic assurance decision: **${result.report.decision.toUpperCase()}**`,
      `- Deterministic checks: **${result.report.checks.length}** total / **${failedChecks.length}** failed`,
      `- Learner-facing assets generated by the source proof: **${sourceProof.learnerAssetCount}**`,
      '',
      result.report.decision === 'pass'
        ? 'This proves the retained real-course Foundation Candidate clears the released deterministic Foundation assurance layer. It does not establish independent educational sufficiency, qualified expert approval or `foundation_approved`.'
        : `The Candidate remains blocked at deterministic assurance. Failed checks: ${failedChecks.map((check) => `\`${check.checkId}\``).join(', ')}. No independent review or approval should begin until remediation and deterministic re-assurance pass.`,
    ].join('\n'))

    expect(store.writes).toHaveLength(1)
    expect(result.report.foundationFingerprint).toBe(expectedFoundationFingerprint)
    expect(result.job.state).toBe('assuring')
    expect(result.job.candidate?.deterministicAssurance.status).toBe(result.report.decision)
    expect(result.job.candidate?.independentReview.status).toBe('pending')
    expect(result.report.decision).toBe('pass')
    expect(failedChecks).toHaveLength(0)
  }, testTimeoutMs)
})
