import { describe, expect, it } from 'vitest'
import { foundationCandidateSchema, type FoundationCandidate } from './foundation-schema'
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
  assertFoundationDerivedAssetReleaseEligible,
  createFoundationDerivedAsset,
  getFoundationDerivedAssetReleaseProblems,
  recordFoundationDerivedAssetAssurance,
} from './foundation-derived-asset'

const now = '2026-09-18T21:00:00+01:00'
const headSha = 'a'.repeat(40)
const jobId = 'aqa-a-level-business-7132'

function artifact(ref: string, fingerprint: string) {
  return { ref, fingerprint }
}

function candidate(overrides: Partial<FoundationCandidate> = {}) {
  return foundationCandidateSchema.parse({
    schemaVersion: 1,
    candidateId: 'aqa-a-level-business-7132-candidate-1',
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
      implementationHeadSha: headSha,
      generationContextIds: ['generation-context-1'],
      assuranceContextIds: ['review-context-1'],
    },
    ...overrides,
  })
}

async function aiAssuredJob(candidateInput = candidate()) {
  let job = createFoundationJob({ jobId, createdAt: now })
  job = advanceFoundationJob(job, 'compiling', now)
  job = setFoundationCandidate(job, candidateInput, now)
  job = advanceFoundationJob(job, 'assuring', now)
  if (!job.candidate) throw new Error('Expected candidate')
  const foundationFingerprint = await computeFoundationFingerprint(job.candidate)
  job = await recordDeterministicFoundationAssurance(job, {
    status: 'pass', foundationFingerprint, evidenceRefs: ['deterministic.json'],
  }, now)
  job = await recordIndependentFoundationReview(job, {
    status: 'pass', foundationFingerprint, evidenceRefs: ['independent-review.json'],
  }, now)
  if (!job.candidate) throw new Error('Expected candidate')
  job = await recordFoundationExternalSourceChallenge(job, {
    report: {
      schemaVersion: 1,
      artifactType: 'foundation_external_source_challenge_report',
      challengeId: 'challenge-1',
      jobId,
      candidateId: job.candidate.candidateId,
      reviewedCommit: headSha,
      foundationFingerprint,
      sourceUniverseProfileId: 'aqa-7132-2027-source-universe',
      challengedSourceIds: ['aqa-7132-specification'],
      reviewerContextId: 'external-challenge-context-1',
      excludedContextIds: ['generation-context-1', 'review-context-1'],
      decision: 'pass',
      findings: [],
      evidenceRefs: ['external-challenge.json'],
      createdAt: now,
    },
    requiredSourceUniverseProfileId: 'aqa-7132-2027-source-universe',
    requiredSourceIds: ['aqa-7132-specification'],
  }, now)
  return { job: await markFoundationAiAssured(job, now), foundationFingerprint }
}

async function approvedJob(candidateInput = candidate(), version = 1, previous = null) {
  const { job: aiJob, foundationFingerprint } = await aiAssuredJob(candidateInput)
  const expertJob = advanceFoundationJob(aiJob, 'expert_review', now)
  const job = await approveFoundation(expertJob, {
    foundationId: jobId,
    foundationVersion: version,
    previousApprovedFoundation: previous,
    approval: {
      reviewerId: 'qualified-reviewer',
      approverId: 'content-ops',
      foundationFingerprint,
      reviewedAt: now,
      approvedAt: now,
      evidenceRefs: ['expert-review.json'],
    },
  })
  return job
}

describe('Foundation-derived pre-production asset gate', () => {
  it('allows internal Learn, Practice and Exam Prep derivation from ai_assured', async () => {
    const { job } = await aiAssuredJob()
    for (const assetKind of ['learn', 'practice', 'exam_prep'] as const) {
      const asset = await createFoundationDerivedAsset({
        job,
        assetId: `${assetKind}-asset-1`,
        assetKind,
        createdAt: now,
      })
      expect(asset.foundationFingerprint).toBe(job.candidate?.deterministicAssurance.foundationFingerprint)
      expect(asset.assuranceStatus).toBe('pending')
    }
  })

  it('blocks learner release while qualified-human review is pending even after asset assurance passes', async () => {
    const { job } = await aiAssuredJob()
    const draft = await createFoundationDerivedAsset({
      job, assetId: 'learn-asset-1', assetKind: 'learn', createdAt: now,
    })
    const assured = recordFoundationDerivedAssetAssurance(draft, ['learn-asset-assurance.json'])

    expect(getFoundationDerivedAssetReleaseProblems(assured, job)).toContain(
      'Learner release requires qualified-human foundation_approved state',
    )
    expect(() => assertFoundationDerivedAssetReleaseEligible(assured, job)).toThrow(/qualified-human/)
  })

  it('allows release only when the exact asset Foundation fingerprint is human approved and asset assurance passed', async () => {
    const { job: aiJob } = await aiAssuredJob()
    const draft = await createFoundationDerivedAsset({
      job: aiJob, assetId: 'practice-asset-1', assetKind: 'practice', createdAt: now,
    })
    const assured = recordFoundationDerivedAssetAssurance(draft, ['practice-asset-assurance.json'])
    const expertJob = advanceFoundationJob(aiJob, 'expert_review', now)
    if (!expertJob.candidate) throw new Error('Expected candidate')
    const fingerprint = await computeFoundationFingerprint(expertJob.candidate)
    const approved = await approveFoundation(expertJob, {
      foundationId: jobId,
      foundationVersion: 1,
      previousApprovedFoundation: null,
      approval: {
        reviewerId: 'qualified-reviewer', approverId: 'content-ops', foundationFingerprint: fingerprint,
        reviewedAt: now, approvedAt: now, evidenceRefs: ['expert-review.json'],
      },
    })

    expect(getFoundationDerivedAssetReleaseProblems(assured, approved)).toEqual([])
    expect(() => assertFoundationDerivedAssetReleaseEligible(assured, approved)).not.toThrow()
  })

  it('invalidates prior-fingerprint assets for release after a material Foundation correction', async () => {
    const firstAi = await aiAssuredJob()
    const firstAsset = recordFoundationDerivedAssetAssurance(
      await createFoundationDerivedAsset({
        job: firstAi.job, assetId: 'exam-prep-asset-1', assetKind: 'exam_prep', createdAt: now,
      }),
      ['exam-prep-assurance.json'],
    )
    const firstApproved = await approvedJob()
    if (!firstApproved.approvedFoundation) throw new Error('Expected first approved Foundation')

    const changed = candidate({
      candidateId: 'aqa-a-level-business-7132-candidate-2',
      courseKnowledgeModel: artifact('foundation/course-truth.json', 'course-truth-v2'),
    })
    const secondApproved = await approvedJob(changed, 2, firstApproved.approvedFoundation)

    expect(getFoundationDerivedAssetReleaseProblems(firstAsset, secondApproved)).toContain(
      'Derived asset is stale because its Foundation fingerprint is not the approved fingerprint',
    )
  })

  it('does not allow an unassured asset to become release eligible merely because its Foundation is approved', async () => {
    const approved = await approvedJob()
    const draft = await createFoundationDerivedAsset({
      job: approved, assetId: 'learn-asset-unassured', assetKind: 'learn', createdAt: now,
    })
    expect(getFoundationDerivedAssetReleaseProblems(draft, approved)).toContain(
      'Derived asset assurance must pass before learner release',
    )
  })
})
