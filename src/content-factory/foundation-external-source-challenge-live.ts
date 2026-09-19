import { z } from 'zod'
import { sourceLicenceRegisterSchema, sourceLicenceRecordSchema } from './schema'
import { foundationCandidateSchema, type FoundationCandidate } from './foundation-schema'
import {
  foundationExternalSourceChallengeReportSchema,
  type FoundationExternalSourceChallengeReport,
} from './foundation-external-source-challenge'
import {
  buildAqa7132FoundationExpertReviewCoverageReconciliation,
  type FoundationExpertReviewCoverageReconciliation,
} from './foundation-expert-review-reconciliation'
import { foundationReviewableArtifactKindSchema } from './foundation-independent-review'
import {
  AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE,
  AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE_PROFILE_ID,
} from './source-seeds/aqa-a-level-business-7132-2027-source-universe'

const maxReferenceBytes = 30 * 1024 * 1024
const allowedAqaHosts = new Set(['www.aqa.org.uk', 'filestore.aqa.org.uk'])

const resolvedArtifactSchema = z.object({
  artifactKind: foundationReviewableArtifactKindSchema,
  artifactRef: z.string().min(1),
  fingerprint: z.string().min(1),
  value: z.unknown(),
})

export const foundationExternalSourceLiveCheckSchema = z.object({
  sourceId: z.string().min(1),
  requestedUrl: z.string().url(),
  finalUrl: z.string().url(),
  httpStatus: z.number().int().positive(),
  contentType: z.string(),
  contentLengthBytes: z.number().int().nonnegative(),
  contentSha256: z.string().regex(/^[0-9a-f]{64}$/),
  etag: z.string().optional(),
  lastModified: z.string().optional(),
  checkedAt: z.string().min(1),
})

export type FoundationExternalSourceLiveCheck = z.infer<typeof foundationExternalSourceLiveCheckSchema>

type ResolvedArtifact = z.infer<typeof resolvedArtifactSchema>
type ChallengeFinding = FoundationExternalSourceChallengeReport['findings'][number]
type SourceUniverseRequirement = (typeof AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE)[number]

function artifactByRef(
  _candidate: FoundationCandidate,
  artifacts: ResolvedArtifact[],
  artifactKind: z.infer<typeof foundationReviewableArtifactKindSchema>,
  artifactRef: string,
  fingerprint: string,
) {
  const artifact = artifacts.find((entry) => entry.artifactKind === artifactKind && entry.artifactRef === artifactRef)
  if (!artifact) throw new Error(`external_source_challenge_missing_artifact:${artifactKind}:${artifactRef}`)
  if (artifact.fingerprint !== fingerprint) throw new Error(`external_source_challenge_artifact_fingerprint_mismatch:${artifactRef}`)
  return artifact
}

async function sha256(bytes: ArrayBuffer) {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function safeUrl(value: string) {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

export function validateAqa7132ReferenceOnlySourceContract(
  sourceInput: unknown,
  expected: SourceUniverseRequirement,
): ChallengeFinding[] {
  const source = sourceLicenceRecordSchema.parse(sourceInput)
  const findings: ChallengeFinding[] = []
  const base = `source-${expected.sourceId.replace(/[^a-z0-9._-]/g, '-')}`

  if (source.issuer !== expected.issuer) {
    findings.push({
      id: `${base}-issuer-mismatch`,
      severity: 'material',
      issueType: 'source_universe',
      sourceRefs: [expected.sourceId],
      finding: `Expected issuer ${expected.issuer}; retained source records ${source.issuer}.`,
      requiredCorrection: 'Re-resolve the governed source universe and rebuild the exact Foundation Candidate.',
    })
  }
  if (source.sourceType !== expected.sourceType) {
    findings.push({
      id: `${base}-type-mismatch`,
      severity: 'material',
      issueType: 'source_universe',
      sourceRefs: [expected.sourceId],
      finding: `Expected source type ${expected.sourceType}; retained source records ${source.sourceType}.`,
      requiredCorrection: 'Correct source classification and rerun Foundation compilation plus assurance.',
    })
  }
  if (source.useClass !== expected.requiredUseClass || source.aiInputPermitted) {
    findings.push({
      id: `${base}-rights-mismatch`,
      severity: 'blocking',
      issueType: 'source_universe',
      sourceRefs: [expected.sourceId],
      finding: 'AQA source is not retained as REFERENCE_ONLY with generative source-text input disabled.',
      requiredCorrection: 'Restore the governed AQA reference-only rights classification before any downstream derivation.',
    })
  }

  const url = safeUrl(source.urlOrReference)
  if (!url || url.protocol !== 'https:' || !allowedAqaHosts.has(url.hostname)) {
    findings.push({
      id: `${base}-url-mismatch`,
      severity: 'material',
      issueType: 'source_universe',
      sourceRefs: [expected.sourceId],
      finding: `The retained AQA reference does not resolve to an approved official HTTPS AQA host: ${source.urlOrReference}`,
      requiredCorrection: 'Resolve the source from the governed official AQA source universe and rerun the Foundation proof.',
    })
  }
  return findings
}

export async function inspectAqaReferenceOnlySource(input: {
  source: z.infer<typeof sourceLicenceRecordSchema>
  fetchImpl: typeof fetch
  checkedAt: string
}): Promise<FoundationExternalSourceLiveCheck> {
  const requested = new URL(input.source.urlOrReference)
  const response = await input.fetchImpl(requested, {
    method: 'GET',
    redirect: 'follow',
    headers: {
      'User-Agent': 'Revision-Foundation-External-Source-Challenge/1.0',
      Accept: 'text/html,application/pdf,application/octet-stream;q=0.8,*/*;q=0.5',
    },
  })
  if (!response.ok) throw new Error(`http_${response.status}`)

  const finalUrl = new URL(response.url || requested.toString())
  if (finalUrl.protocol !== 'https:' || !allowedAqaHosts.has(finalUrl.hostname)) {
    throw new Error(`redirected_outside_approved_aqa_hosts:${finalUrl.hostname}`)
  }

  const contentLengthHeader = response.headers.get('content-length')
  if (contentLengthHeader) {
    const declaredLength = Number(contentLengthHeader)
    if (Number.isFinite(declaredLength) && declaredLength > maxReferenceBytes) {
      throw new Error(`reference_too_large:${declaredLength}`)
    }
  }

  const bytes = await response.arrayBuffer()
  if (bytes.byteLength === 0) throw new Error('empty_reference')
  if (bytes.byteLength > maxReferenceBytes) throw new Error(`reference_too_large:${bytes.byteLength}`)

  return foundationExternalSourceLiveCheckSchema.parse({
    sourceId: input.source.id,
    requestedUrl: requested.toString(),
    finalUrl: finalUrl.toString(),
    httpStatus: response.status,
    contentType: response.headers.get('content-type') ?? '',
    contentLengthBytes: bytes.byteLength,
    contentSha256: await sha256(bytes),
    ...(response.headers.get('etag') ? { etag: response.headers.get('etag') } : {}),
    ...(response.headers.get('last-modified') ? { lastModified: response.headers.get('last-modified') } : {}),
    checkedAt: input.checkedAt,
  })
}

export async function runAqa7132LiveExternalSourceChallenge(input: {
  candidate: FoundationCandidate
  resolvedArtifacts: ResolvedArtifact[]
  fetchImpl?: typeof fetch
  checkedAt?: string
  reviewerContextId?: string
}) {
  const candidate = foundationCandidateSchema.parse(input.candidate)
  const resolvedArtifacts = z.array(resolvedArtifactSchema).min(1).parse(input.resolvedArtifacts)
  const fetchImpl = input.fetchImpl ?? fetch
  const checkedAt = input.checkedAt ?? new Date().toISOString()
  const reviewerContextId = input.reviewerContextId ?? `external-source-challenge-${globalThis.crypto.randomUUID()}`
  const excludedContextIds = [...new Set([
    ...candidate.provenance.generationContextIds,
    ...candidate.provenance.assuranceContextIds,
  ])]
  if (excludedContextIds.length === 0) throw new Error('external_source_challenge_requires_prior_context_exclusions')

  const findings: ChallengeFinding[] = []
  const sourceChecks: FoundationExternalSourceLiveCheck[] = []
  const evidenceRefs: string[] = []
  const sourceRegisterArtifact = artifactByRef(
    candidate,
    resolvedArtifacts,
    'source_licence_register',
    candidate.sourceLicenceRegister.ref,
    candidate.sourceLicenceRegister.fingerprint,
  )
  const sourceRegister = sourceLicenceRegisterSchema.parse(sourceRegisterArtifact.value)
  const sourceById = new Map(sourceRegister.sources.map((source) => [source.id, source] as const))

  let coverageReconciliation: FoundationExpertReviewCoverageReconciliation | null = null
  try {
    coverageReconciliation = buildAqa7132FoundationExpertReviewCoverageReconciliation({ candidate, resolvedArtifacts })
    evidenceRefs.push(
      `coverage:${coverageReconciliation.curriculumProfileId}:${coverageReconciliation.curriculum.length}`,
      `exam:${coverageReconciliation.examProfileId}:${coverageReconciliation.exam.length}`,
    )
  } catch (error) {
    findings.push({
      id: 'governed-coverage-reconciliation-failed',
      severity: 'material',
      issueType: 'curriculum_scope',
      sourceRefs: AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE.map((entry) => entry.sourceId),
      finding: `The exact Candidate failed independent governed curriculum/exam reconciliation: ${error instanceof Error ? error.message : String(error)}`,
      requiredCorrection: 'Repair the exact Foundation coverage/exam evidence and rerun deterministic plus independent assurance before retrying the challenge.',
    })
  }

  for (const expected of AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE) {
    const source = sourceById.get(expected.sourceId)
    if (!source) {
      findings.push({
        id: `source-${expected.sourceId}-missing`,
        severity: 'blocking',
        issueType: 'source_universe',
        sourceRefs: [expected.sourceId],
        finding: `The exact Candidate source register omits required governed source ${expected.sourceId}.`,
        requiredCorrection: 'Re-run source discovery and source-rights validation against the complete governed source universe.',
      })
      continue
    }

    const contractFindings = validateAqa7132ReferenceOnlySourceContract(source, expected)
    findings.push(...contractFindings)
    if (contractFindings.length > 0) continue

    try {
      const check = await inspectAqaReferenceOnlySource({ source, fetchImpl, checkedAt })
      sourceChecks.push(check)
      evidenceRefs.push(`external-source:${check.sourceId}:sha256:${check.contentSha256}`)
    } catch (error) {
      findings.push({
        id: `source-${expected.sourceId}-fresh-check-failed`,
        severity: 'material',
        issueType: 'source_currency',
        sourceRefs: [expected.sourceId],
        finding: `Fresh official-source retrieval failed for ${expected.sourceId}: ${error instanceof Error ? error.message : String(error)}`,
        requiredCorrection: 'Resolve the current official AQA reference and rerun the external-source challenge before AI assurance.',
      })
    }
  }

  if (sourceChecks.length !== AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE.length) {
    evidenceRefs.push(`external-source-attempt:${AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE_PROFILE_ID}:${checkedAt}`)
  }

  const report = foundationExternalSourceChallengeReportSchema.parse({
    schemaVersion: 1,
    artifactType: 'foundation_external_source_challenge_report',
    challengeId: `aqa-7132-external-${globalThis.crypto.randomUUID()}`,
    jobId: sourceRegister.jobId,
    candidateId: candidate.candidateId,
    reviewedCommit: candidate.provenance.implementationHeadSha,
    foundationFingerprint: candidate.deterministicAssurance.foundationFingerprint,
    sourceUniverseProfileId: AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE_PROFILE_ID,
    challengedSourceIds: AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_UNIVERSE.map((entry) => entry.sourceId),
    reviewerContextId,
    excludedContextIds,
    decision: findings.some((finding) => ['blocking', 'material'].includes(finding.severity)) ? 'fail_hold' : 'pass',
    findings,
    evidenceRefs,
    createdAt: checkedAt,
  })

  return {
    report,
    sourceChecks,
    coverageReconciliation,
  }
}
