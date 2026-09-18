import { describe, expect, it } from 'vitest'
import {
  approvedCourseFoundationSchema,
  foundationCandidateSchema,
  foundationJobSchema,
  type FoundationCandidate,
} from './foundation-schema'
import {
  advanceFoundationJob,
  approveFoundation,
  computeFoundationFingerprint,
  createFoundationJob,
  markFoundationAiAssured,
  recordDeterministicFoundationAssurance,
  recordFoundationExternalSourceChallenge,
  recordIndependentFoundationReview,
  setFoundationCandidate,
} from './foundation-lifecycle'
import {
  createFoundationDerivedAsset,
  getFoundationDerivedAssetReleaseProblems,
  recordFoundationDerivedAssetAssurance,
} from './foundation-derived-asset'

const now = '2026-09-18T22:00:00+01:00'
const reviewedCommit = 'a'.repeat(40)
const jobId = 'aqa-a-level-business-7132'
const sourceUniverseProfileId = 'aqa-7132-2027-source-universe'
const requiredSourceIds = ['aqa-7132-specification', 'aqa-7131-7132-formulae-key-data']

function artifact(ref: string, fingerprint: string) {
  return { ref, fingerprint }
}

function candidate(candidateId = 'aqa-a-level-business-7132-candidate-1'): FoundationCandidate {
  return foundationCandidateSchema.parse({
    schemaVersion: 1,
    candidateId,
    courseIdentity: {
      subject: 'Business', qualification: 'A-level', awardingBody: 'AQA', specificationId: '7132',
    },
    cohortValidity: { status: 'outgoing', lastAssessment: '2027', notes: [] },
    sourceLicenceRegister: artifact('foundation/source-rights.json', 'source-rights-v1'),
    sourceRightsStatus: 'approved',
    boardAlignment: artifact('foundation/board-alignment.json', 'board-v1'),
    boardAlignmentStatus: 'verified',
    coverageModel: artifact('foundation/coverage.json', 'coverage-v1'),
    coverageCompleteness: 'complete',
    courseKnowledgeModel: artifact('foundation/course-truth.json', 'course-truth-v1'),
    courseTruthCompleteness: 'complete',
    assessmentBlueprint: artifact('foundation/exam-truth.json', 'exam-truth-v1'),
    examTruthCompleteness: 'complete',
    questionFamilies: [artifact('foundation/question-family.json', 'question-family-v1')],
    deterministicAssurance: { status: 'pending', evidenceRefs: [] },
    independentReview: { status: 'pending', evidenceRefs: [] },
    unresolvedBlockers: [],
    knownLimitations: [],
    provenance: {
      createdAt: now,
      producerVersion: 'foundation-factory-v1',
      sourceSetFingerprint: 'source-set-v1',
      implementationHeadSha: reviewedCommit,
      generationContextIds: ['generation-context-1'],
      assuranceContextIds: ['independent-review-context-1'],
    },
  })
}

async function assuringWithAiReview(candidateInput = candidate()) {
  let job = createFoundationJob({ jobId, createdAt: now })
  job = advanceFoundationJob(job, 'compiling', now)
  job = setFoundationCandidate(job, candidateInput, now)
  job = advanceFoundationJob(job, 'assuring', now)
  if (!job.candidate) throw new Error('Expected Foundation Candidate')
  const foundationFingerprint = await computeFoundationFingerprint(job.candidate)
  job = await recordDeterministicFoundationAssurance(job, {
    status: 'pass', foundationFingerprint, evidenceRefs: ['deterministic.json'],
  }, now)
  job = await recordIndependentFoundationReview(job, {
    status: 'pass', foundationFingerprint, evidenceRefs: ['independent-review.json'],
  }, now)
  return { job, foundationFingerprint }
}

async function challengeReport(
  candidateInput: FoundationCandidate,
  foundationFingerprint: string,
  decision: 'pass' | 'fail_hold' = 'pass',
) {
  return {
    schemaVersion: 1 as const,
    artifactType: 'foundation_external_source_challenge_report' as const,
    challengeId: `challenge-${candidateInput.candidateId}`,
    jobId,
    candidateId: candidateInput.candidateId,
    reviewedCommit,
    foundationFingerprint,
    sourceUniverseProfileId,
    challengedSourceIds: requiredSourceIds,
    reviewerContextId: 'external-source-challenge-context-1',
    excludedContextIds: ['generation-context-1', 'independent-review-context-1'],
    decision,
    findings: decision === 'fail_hold'
      ? [{
          id: 'material-source-gap',
          severity: 'material' as const,
          issueType: 'source_universe' as const,
          sourceRefs: ['aqa-7132-specification'],
          finding: 'A material official-source requirement is not reconciled.',
          requiredCorrection: 'Reconcile the requirement before progression.',
        }]
      : [],
    evidenceRefs: ['external-source-challenge.json'],
    createdAt: now,
  }
}

async function aiAssured(candidateInput = candidate()) {
  const reviewed = await assuringWithAiReview(candidateInput)
  let { job } = reviewed
  const { foundationFingerprint } = reviewed
  if (!job.candidate) throw new Error('Expected Foundation Candidate')
  job = await recordFoundationExternalSourceChallenge(job, {
    report: await challengeReport(job.candidate, foundationFingerprint),
    requiredSourceUniverseProfileId: sourceUniverseProfileId,
    requiredSourceIds,
  }, now)
  return { job: await markFoundationAiAssured(job, now), foundationFingerprint }
}

describe('AI-assured adversarial safety boundaries', () => {
  it('durably records an external-source fail_hold but refuses ai_assured progression', async () => {
    const reviewed = await assuringWithAiReview()
    let { job } = reviewed
    const { foundationFingerprint } = reviewed
    if (!job.candidate) throw new Error('Expected Foundation Candidate')

    job = await recordFoundationExternalSourceChallenge(job, {
      report: await challengeReport(job.candidate, foundationFingerprint, 'fail_hold'),
      requiredSourceUniverseProfileId: sourceUniverseProfileId,
      requiredSourceIds,
    }, now)

    expect(job.state).toBe('assuring')
    expect(job.candidate?.externalSourceChallenge?.decision).toBe('fail_hold')
    await expect(markFoundationAiAssured(job, now)).rejects.toThrow(/Fresh external-source challenge must pass/)
  })

  it('fails closed if lifecycle recording omits the governed source-universe contract', async () => {
    const { job, foundationFingerprint } = await assuringWithAiReview()
    if (!job.candidate) throw new Error('Expected Foundation Candidate')
    const report = await challengeReport(job.candidate, foundationFingerprint)

    await expect(recordFoundationExternalSourceChallenge(job, {
      report,
      requiredSourceUniverseProfileId: '',
      requiredSourceIds,
    }, now)).rejects.toThrow(/governed source-universe profile/)

    await expect(recordFoundationExternalSourceChallenge(job, {
      report,
      requiredSourceUniverseProfileId: sourceUniverseProfileId,
      requiredSourceIds: [],
    }, now)).rejects.toThrow(/governed source-universe source list/)
  })

  it('keeps already human-approved historical Foundations usable for downstream derivation', async () => {
    const base = candidate('historical-human-approved-candidate')
    const foundationFingerprint = await computeFoundationFingerprint(base)
    const historicalCandidate = foundationCandidateSchema.parse({
      ...base,
      deterministicAssurance: {
        status: 'pass', foundationFingerprint, evidenceRefs: ['historical-deterministic.json'],
      },
      independentReview: {
        status: 'pass', foundationFingerprint, evidenceRefs: ['historical-independent-review.json'],
      },
    })
    const approvedFoundation = approvedCourseFoundationSchema.parse({
      schemaVersion: 1,
      foundationId: jobId,
      foundationVersion: 1,
      foundationFingerprint,
      candidate: historicalCandidate,
      approval: {
        reviewerId: 'qualified-reviewer',
        approverId: 'content-ops',
        foundationFingerprint,
        reviewedAt: now,
        approvedAt: now,
        evidenceRefs: ['historical-qualified-review.json'],
      },
      knownLimitations: [],
    })
    const historicalJob = foundationJobSchema.parse({
      schemaVersion: 1,
      jobId,
      state: 'foundation_approved',
      approvedFoundation,
      blockers: [],
      createdAt: now,
      updatedAt: now,
    })

    const asset = await createFoundationDerivedAsset({
      job: historicalJob,
      assetId: 'historical-approved-learn-asset',
      assetKind: 'learn',
      createdAt: now,
    })
    expect(asset.foundationFingerprint).toBe(foundationFingerprint)
    expect(asset.foundationCandidateId).toBe('historical-human-approved-candidate')
  })

  it('uses the exact Foundation fingerprint, not Candidate ID, as the release identity', async () => {
    const first = await aiAssured(candidate('candidate-one'))
    const asset = recordFoundationDerivedAssetAssurance(
      await createFoundationDerivedAsset({
        job: first.job,
        assetId: 'same-fingerprint-asset',
        assetKind: 'practice',
        createdAt: now,
      }),
      ['asset-assurance.json'],
    )

    const second = await aiAssured(candidate('candidate-two'))
    expect(second.foundationFingerprint).toBe(first.foundationFingerprint)
    const expertJob = advanceFoundationJob(second.job, 'expert_review', now)
    const approvedJob = await approveFoundation(expertJob, {
      foundationId: jobId,
      foundationVersion: 1,
      previousApprovedFoundation: null,
      approval: {
        reviewerId: 'qualified-reviewer',
        approverId: 'content-ops',
        foundationFingerprint: second.foundationFingerprint,
        reviewedAt: now,
        approvedAt: now,
        evidenceRefs: ['qualified-review.json'],
      },
    })

    expect(asset.foundationCandidateId).toBe('candidate-one')
    expect(approvedJob.approvedFoundation?.candidate.candidateId).toBe('candidate-two')
    expect(getFoundationDerivedAssetReleaseProblems(asset, approvedJob)).toEqual([])
  })
})
