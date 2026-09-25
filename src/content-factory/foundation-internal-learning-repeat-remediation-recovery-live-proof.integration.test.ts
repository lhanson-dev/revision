import { describe, expect, it } from 'vitest'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { z } from 'zod'
import { foundationInternalLearningAssetBundleSchema } from './foundation-internal-learning-assets'
import { foundationInternalLearningRemediationRecordSchema } from './foundation-internal-learning-remediation'
import { fingerprintValue } from './intake-to-knowledge-model'

const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }
const env = runtime.process?.env ?? {}
const liveEnabled = env.CONTENT_FACTORY_FOUNDATION_INTERNAL_LEARNING_REPEAT_REMEDIATION_RECOVERY_PROOF === '1'
const evidenceDirectory = '.artifacts/content-factory-foundation-internal-learning-repeat-remediation-recovery-proof'
const testTimeoutMs = 5 * 60 * 1000

const nonEmptyStringSchema = z.string().min(1)
const commitShaSchema = z.string().regex(/^[0-9a-f]{40}$/)
const sha256Schema = z.string().regex(/^[0-9a-f]{64}$/)
const retainedIdentitySchema = z.object({
  workflowRunId: nonEmptyStringSchema,
  artifactName: nonEmptyStringSchema,
  artifactDigest: nonEmptyStringSchema,
})
const sourceReassuranceBaseIdentitySchema = retainedIdentitySchema.extend({
  headSha: commitShaSchema,
  correctedBundleFingerprint: sha256Schema,
})
const sourceReassuranceIdentitySchema = sourceReassuranceBaseIdentitySchema.extend({
  reviewFingerprint: sha256Schema,
})
const remediationRunSchema = z.object({
  status: z.literal('success'),
  contextId: nonEmptyStringSchema,
  runId: nonEmptyStringSchema,
  provider: nonEmptyStringSchema,
  model: nonEmptyStringSchema,
}).passthrough()
const sourcePassSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('foundation_internal_learning_remediation_live_proof_evidence'),
  status: z.literal('pass'),
  repository: nonEmptyStringSchema,
  remediationImplementationCommit: commitShaSchema,
  remediationCycle: z.number().int().min(2),
  sourceReassuranceProof: sourceReassuranceIdentitySchema,
  foundationFingerprint: sha256Schema,
  sourceOpenFindingCount: z.number().int().positive(),
  sourceRemediationTargetCount: z.number().int().positive(),
  addressedFindingCount: z.number().int().positive(),
  remediatedWorkUnitCount: z.number().int().positive(),
  remediatedAssetSideCount: z.number().int().positive(),
  remediationContextCount: z.number().int().positive(),
  remediationContextCollisions: z.array(nonEmptyStringSchema),
  cumulativePriorReviewerContextCount: z.number().int().positive(),
  resultBundleFingerprint: sha256Schema,
  learnAssetStatus: z.literal('pending'),
  practiceAssetStatus: z.literal('pending'),
  assuredAssetCount: z.literal(0),
  humanReviewStatus: z.literal('pending'),
  foundationApprovalStatus: z.literal('not_approved'),
  learnerPublicationEligible: z.literal(false),
  releaseProblems: z.object({
    learn: z.array(nonEmptyStringSchema),
    practice: z.array(nonEmptyStringSchema),
  }),
  remediationRuns: z.array(remediationRunSchema).min(1),
  remediationRecord: foundationInternalLearningRemediationRecordSchema,
  bundle: foundationInternalLearningAssetBundleSchema,
}).passthrough()
const sourceFailureSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('foundation_internal_learning_repeat_remediation_live_proof_failure_evidence'),
  status: z.literal('fail_hold'),
  repository: nonEmptyStringSchema,
  remediationImplementationCommit: commitShaSchema,
  sourceReassuranceProof: sourceReassuranceBaseIdentitySchema,
  foundationFingerprint: sha256Schema,
  assuredAssetCount: z.literal(0),
  humanReviewStatus: z.literal('pending'),
  foundationApprovalStatus: z.literal('not_approved'),
  learnerPublicationEligible: z.literal(false),
  failure: nonEmptyStringSchema,
}).passthrough()

function requiredEnv(name: string) {
  const value = env[name]?.trim()
  if (!value) throw new Error(`provider_secret_missing_or_runtime_config_missing:${name}`)
  return value
}

async function readJson(path: string) {
  return JSON.parse(await readFile(path, 'utf-8')) as unknown
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

function sameSet(left: string[], right: string[]) {
  return left.length === right.length && new Set(left).size === left.length && left.every((value) => right.includes(value))
}

const expectedPendingReleaseProblems = [
  'Derived asset assurance must pass before learner release',
  'Learner release requires qualified-human foundation_approved state',
]

describe('Foundation-native retained repeat remediation recovery proof', () => {
  const liveIt = liveEnabled ? it : it.skip

  it('requires the source review fingerprint on pass evidence while accepting its historical absence from failure evidence', () => {
    const identity = {
      workflowRunId: '36058013508',
      artifactName: 'content-factory-foundation-internal-learning-reassurance-proof-9282d1a3b134150962d3b76f531f271f17d8e509',
      artifactDigest: 'sha256:353cbb14fd05f64f65d6c6f3b9ad39ab481765ab98916adce494aa2ab7091c0b',
      headSha: '9282d1a3b134150962d3b76f531f271f17d8e509',
      correctedBundleFingerprint: '8452d1ef17ef56f626b2711c536083c9fce138015f90f0dde85885db15780cb9',
      reviewFingerprint: '9f7ed5af13c2be07dba670c4f99e6a4ea4cc2ee7711b00f092572ab061b9461c',
    }

    expect(sourceReassuranceIdentitySchema.parse(identity)).toEqual(identity)
    const { reviewFingerprint, ...historicalFailureIdentity } = identity
    expect(reviewFingerprint).toMatch(/^[0-9a-f]{64}$/)
    expect(sourceReassuranceBaseIdentitySchema.parse(historicalFailureIdentity)).toEqual(historicalFailureIdentity)
  })

  liveIt('re-attests a completed corrected bundle without another provider call', async () => {
    const repo = requiredEnv('GITHUB_REPOSITORY')
    const token = requiredEnv('GITHUB_TOKEN')
    const sourceRunId = requiredEnv('CONTENT_FACTORY_RECOVERY_SOURCE_RUN_ID')
    const sourceArtifactName = requiredEnv('CONTENT_FACTORY_RECOVERY_SOURCE_ARTIFACT_NAME')
    const sourceArtifactDigest = requiredEnv('CONTENT_FACTORY_RECOVERY_SOURCE_ARTIFACT_DIGEST')
    const sourceHeadSha = requiredEnv('CONTENT_FACTORY_RECOVERY_SOURCE_HEAD_SHA')
    const foundationFingerprint = requiredEnv('CONTENT_FACTORY_FOUNDATION_FINGERPRINT')
    const implementationCommit = requiredEnv('CONTENT_FACTORY_RECOVERY_IMPLEMENTATION_COMMIT')
    const sourcePassPath = requiredEnv('CONTENT_FACTORY_RECOVERY_SOURCE_PASS_PATH')
    const sourceFailurePath = requiredEnv('CONTENT_FACTORY_RECOVERY_SOURCE_FAILURE_PATH')
    const githubRunId = requiredEnv('GITHUB_RUN_ID')

    const source = sourcePassSchema.parse(await readJson(sourcePassPath))
    const failure = sourceFailureSchema.parse(await readJson(sourceFailurePath))

    expect(source.repository).toBe(repo)
    expect(failure.repository).toBe(repo)
    expect(source.remediationImplementationCommit).toBe(sourceHeadSha)
    expect(failure.remediationImplementationCommit).toBe(sourceHeadSha)
    expect(source.foundationFingerprint).toBe(foundationFingerprint)
    expect(failure.foundationFingerprint).toBe(foundationFingerprint)
    expect(failure.sourceReassuranceProof).toEqual(sourceReassuranceBaseIdentitySchema.parse(source.sourceReassuranceProof))
    expect(source.sourceReassuranceProof.reviewFingerprint).toBe(source.remediationRecord.sourceReviewFingerprint)
    expect(failure.failure).toContain('Learner release requires derived-asse')

    expect(source.addressedFindingCount).toBe(source.sourceOpenFindingCount)
    expect(source.remediationContextCollisions).toEqual([])
    expect(source.remediationRuns).toHaveLength(source.remediationContextCount)
    expect(source.remediationRuns.every((run) => run.status === 'success')).toBe(true)
    const runContextIds = source.remediationRuns.map((run) => run.contextId)
    expect(new Set(runContextIds).size).toBe(runContextIds.length)
    expect(sameSet(runContextIds, source.remediationRecord.remediationContextIds)).toBe(true)
    expect(source.cumulativePriorReviewerContextCount).toBe(source.remediationRecord.priorReviewerContextIds.length)
    expect(new Set(source.remediationRecord.priorReviewerContextIds).size).toBe(source.remediationRecord.priorReviewerContextIds.length)
    expect(source.remediationRecord.addressedFindingIds).toHaveLength(source.addressedFindingCount)
    expect(new Set(source.remediationRecord.targets.map((target) => target.workUnitId)).size).toBe(source.remediatedWorkUnitCount)
    expect(source.remediationRecord.targets).toHaveLength(source.remediatedAssetSideCount)
    expect(source.remediationRecord.resultBundleFingerprint).toBe(source.resultBundleFingerprint)
    expect(await fingerprintValue(source.bundle)).toBe(source.resultBundleFingerprint)

    expect(source.bundle.learnAsset.assuranceStatus).toBe('pending')
    expect(source.bundle.practiceAsset.assuranceStatus).toBe('pending')
    expect(source.releaseProblems.learn).toEqual(expectedPendingReleaseProblems)
    expect(source.releaseProblems.practice).toEqual(expectedPendingReleaseProblems)
    expect(source.learnerPublicationEligible).toBe(false)

    await mkdir(evidenceDirectory, { recursive: true })
    const evidencePath = `${evidenceDirectory}/recovered-repeat-remediation.json`
    const recovered = {
      ...source,
      recordedAt: new Date().toISOString(),
      remediationImplementationCommit: implementationCommit,
      recoveryProof: {
        workflowRunId: githubRunId,
        sourceFailedRunId: sourceRunId,
        sourceArtifactName,
        sourceArtifactDigest,
        sourceHeadSha,
        reason: 'post_generation_release_problem_assertion_drift',
        providerCallsRepeated: 0,
      },
    }
    await writeFile(evidencePath, JSON.stringify(recovered, null, 2), 'utf-8')

    await addIssueComment(repo, token, [
      'Foundation-native repeat Learn/Practice remediation proof recovered without regenerating content.',
      '',
      '- Course: **AQA A-level Business 7132 — 2027 cohort**',
      `- Foundation fingerprint: \`${foundationFingerprint}\``,
      `- Source failed proof run: **${sourceRunId}**`,
      `- Corrected bundle fingerprint: \`${source.resultBundleFingerprint}\``,
      `- Addressed findings: **${source.addressedFindingCount} / ${source.sourceOpenFindingCount}**`,
      `- Remediated work units: **${source.remediatedWorkUnitCount}**`,
      `- Remediated asset sides: **${source.remediatedAssetSideCount}**`,
      `- Retained provider runs: **${source.remediationRuns.length}** — all successful`,
      `- Context collisions: **${source.remediationContextCollisions.length}**`,
      '- Additional provider calls: **0**',
      '- Learn asset assurance: `pending`',
      '- Practice asset assurance: `pending`',
      '- Learner publication eligible: **no**',
      '',
      'The corrected bundle is re-attested only for fresh independent re-assurance. No finding is treated as resolved by recovery itself and publication remains blocked.',
    ].join('\n'))
  }, testTimeoutMs)
})
