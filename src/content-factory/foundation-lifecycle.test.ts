import { describe, expect, it } from 'vitest'
import {
  approvedCourseFoundationSchema,
  foundationCandidateSchema,
  foundationJobSchema,
  type ApprovedCourseFoundation,
  type FoundationCandidate,
} from './foundation-schema'
import {
  advanceFoundationJob,
  approveFoundation,
  assertApprovedFoundationIntegrity,
  assertFoundationVersionInvariant,
  blockFoundationJob,
  computeFoundationFingerprint,
  createFoundationJob,
  getFoundationTransitionProblems,
  markFoundationAiAssured,
  recordDeterministicFoundationAssurance,
  recordFoundationExternalSourceChallenge,
  recordIndependentFoundationReview,
  resumeFoundationJob,
  setFoundationCandidate,
} from './foundation-lifecycle'

const now = '2026-09-18T20:00:00+01:00'
const later = '2026-09-18T20:05:00+01:00'
const headSha = 'a'.repeat(40)
const jobId = 'aqa-a-level-business-7132'
const sourceUniverse = {
  profileId: 'aqa-7132-2027-source-universe',
  requiredSourceIds: ['aqa-7132-specification', 'aqa-7131-7132-formulae-key-data'],
}

function artifact(ref: string, fingerprint: string) {
  return { ref, fingerprint }
}

function candidate(overrides: Partial<FoundationCandidate> = {}): FoundationCandidate {
  return foundationCandidateSchema.parse({
    schemaVersion: 1,
    candidateId: 'aqa-a-level-business-7132-candidate-1',
    courseIdentity: {
      subject: 'Business',
      qualification: 'A-level',
      awardingBody: 'AQA',
      specificationId: '7132',
    },
    cohortValidity: {
      status: 'outgoing',
      lastAssessment: '2027',
      notes: [],
    },
    sourceLicenceRegister: artifact('foundation/source-licence-register.json', 'sources-v1'),
    sourceRightsStatus: 'approved',
    boardAlignment: artifact('foundation/board-alignment.json', 'board-v1'),
    boardAlignmentStatus: 'verified',
    coverageModel: artifact('foundation/coverage.json', 'coverage-v1'),
    coverageCompleteness: 'complete',
    courseKnowledgeModel: artifact('foundation/course-truth.json', 'course-truth-v1'),
    courseTruthCompleteness: 'complete',
    assessmentBlueprint: artifact('foundation/exam-truth.json', 'exam-truth-v1'),
    examTruthCompleteness: 'complete',
    questionFamilies: [
      artifact('foundation/question-family-essay.json', 'essay-v1'),
      artifact('foundation/question-family-data-response.json', 'data-response-v1'),
    ],
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
      assuranceContextIds: ['independent-review-context-1'],
    },
    ...overrides,
  })
}

function approval(foundationFingerprint: string) {
  return {
    reviewerId: 'qualified-subject-reviewer',
    approverId: 'content-operations-approver',
    foundationFingerprint,
    reviewedAt: later,
    approvedAt: later,
    evidenceRefs: ['foundation/expert-review.json'],
  }
}

async function passingChallenge(candidateInput: FoundationCandidate, overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: 1 as const,
    artifactType: 'foundation_external_source_challenge_report' as const,
    challengeId: 'aqa-7132-external-source-challenge-1',
    jobId,
    candidateId: candidateInput.candidateId,
    reviewedCommit: headSha,
    foundationFingerprint: await computeFoundationFingerprint(candidateInput),
    sourceUniverseProfileId: sourceUniverse.profileId,
    challengedSourceIds: sourceUniverse.requiredSourceIds,
    reviewerContextId: 'external-source-challenge-context-1',
    excludedContextIds: [
      ...candidateInput.provenance.generationContextIds,
      ...candidateInput.provenance.assuranceContextIds,
    ],
    decision: 'pass' as const,
    findings: [],
    evidenceRefs: ['foundation/external-source-challenge.json'],
    createdAt: later,
    ...overrides,
  }
}

async function jobAtAssuring(candidateInput = candidate()) {
  let job = createFoundationJob({ jobId, createdAt: now })
  job = advanceFoundationJob(job, 'compiling', now)
  job = setFoundationCandidate(job, candidateInput, now)
  return advanceFoundationJob(job, 'assuring', now)
}

async function jobWithAiEvidence(candidateInput = candidate()) {
  let job = await jobAtAssuring(candidateInput)
  if (!job.candidate) throw new Error('Expected a Foundation Candidate')
  const foundationFingerprint = await computeFoundationFingerprint(job.candidate)
  job = await recordDeterministicFoundationAssurance(job, {
    status: 'pass',
    foundationFingerprint,
    evidenceRefs: ['foundation/deterministic-assurance.json'],
  }, later)
  job = await recordIndependentFoundationReview(job, {
    status: 'pass',
    foundationFingerprint,
    evidenceRefs: ['foundation/independent-review.json'],
  }, later)
  if (!job.candidate) throw new Error('Expected a Foundation Candidate')
  job = await recordFoundationExternalSourceChallenge(job, {
    report: await passingChallenge(job.candidate),
    requiredSourceUniverseProfileId: sourceUniverse.profileId,
    requiredSourceIds: sourceUniverse.requiredSourceIds,
  }, later)
  return { job, foundationFingerprint }
}

async function jobAtAiAssured(candidateInput = candidate()) {
  const { job, foundationFingerprint } = await jobWithAiEvidence(candidateInput)
  return {
    job: await markFoundationAiAssured(job, later),
    foundationFingerprint,
  }
}

async function jobAtExpertReview(candidateInput = candidate()) {
  const { job, foundationFingerprint } = await jobAtAiAssured(candidateInput)
  return {
    job: advanceFoundationJob(job, 'expert_review', later),
    foundationFingerprint,
  }
}

async function approvedFoundation(
  version = 1,
  candidateInput = candidate(),
  previousApprovedFoundation: ApprovedCourseFoundation | null = null,
) {
  const { job, foundationFingerprint } = await jobAtExpertReview(candidateInput)
  const approvedJob = await approveFoundation(job, {
    foundationId: jobId,
    foundationVersion: version,
    previousApprovedFoundation,
    approval: approval(foundationFingerprint),
  })
  if (!approvedJob.approvedFoundation) throw new Error('Expected an approved Foundation')
  return approvedJob.approvedFoundation
}

describe('Foundation schema boundary', () => {
  it('represents a complete Foundation without any learner-facing asset requirement', () => {
    const parsed = candidate()
    expect(parsed.courseKnowledgeModel.ref).toContain('course-truth')
    expect(parsed.assessmentBlueprint.ref).toContain('exam-truth')
    expect('learningBlueprintRef' in parsed).toBe(false)
    expect('contentPackRefs' in parsed).toBe(false)
  })

  it('keeps historical Candidates readable when no external-source challenge was persisted on the Candidate', () => {
    const parsed = candidate()
    expect(parsed.externalSourceChallenge).toBeUndefined()
  })

  it('fails closed when a Foundation Candidate is not source-rights approved or complete', () => {
    expect(() => foundationCandidateSchema.parse({ ...candidate(), sourceRightsStatus: 'pending' })).toThrow()
    expect(() => foundationCandidateSchema.parse({ ...candidate(), coverageCompleteness: 'incomplete' })).toThrow()
  })

  it('rejects duplicate Question Family references', () => {
    const first = artifact('foundation/question-family-essay.json', 'essay-v1')
    expect(() => foundationCandidateSchema.parse({ ...candidate(), questionFamilies: [first, first] }))
      .toThrow(/Duplicate Question Family reference/)
  })

  it('requires completed deterministic and independent evidence to identify the exact fingerprint', () => {
    expect(() => foundationCandidateSchema.parse({
      ...candidate(),
      deterministicAssurance: { status: 'pass', evidenceRefs: ['deterministic.json'] },
    })).toThrow(/exact Foundation fingerprint/)
    expect(() => foundationCandidateSchema.parse({
      ...candidate(),
      independentReview: { status: 'pass', evidenceRefs: ['review.json'] },
    })).toThrow(/exact Foundation fingerprint/)
  })

  it('requires an Approved Course Foundation to contain a valid SHA-256 fingerprint', () => {
    expect(() => approvedCourseFoundationSchema.parse({
      schemaVersion: 1,
      foundationId: jobId,
      foundationVersion: 1,
      foundationFingerprint: 'not-a-sha256',
      candidate: candidate(),
      approval: approval('a'.repeat(64)),
      knownLimitations: [],
    })).toThrow()
  })
})

describe('AI-assured Foundation lifecycle', () => {
  it('uses requested -> compiling -> assuring -> ai_assured -> expert_review -> foundation_approved', async () => {
    const requested = createFoundationJob({ jobId, createdAt: now })
    const compiling = advanceFoundationJob(requested, 'compiling', now)
    const withCandidate = setFoundationCandidate(compiling, candidate(), now)
    const assuring = advanceFoundationJob(withCandidate, 'assuring', now)

    expect(assuring.state).toBe('assuring')
    expect(() => advanceFoundationJob(assuring, 'expert_review', later)).toThrow(/not allowed/)

    const { job: aiAssured } = await jobAtAiAssured()
    expect(aiAssured.state).toBe('ai_assured')
    expect(advanceFoundationJob(aiAssured, 'expert_review', later).state).toBe('expert_review')
  })

  it('freezes Foundation dependencies when assurance begins', async () => {
    const assuring = await jobAtAssuring()
    expect(() => setFoundationCandidate(assuring, candidate({
      courseKnowledgeModel: artifact('foundation/course-truth.json', 'course-truth-v2'),
    }), later)).toThrow(/only while compiling/)
  })

  it('cannot enter ai_assured before the complete exact-fingerprint AI chain passes', async () => {
    let job = await jobAtAssuring()
    if (!job.candidate) throw new Error('Expected a Foundation Candidate')
    const foundationFingerprint = await computeFoundationFingerprint(job.candidate)
    job = await recordDeterministicFoundationAssurance(job, {
      status: 'pass',
      foundationFingerprint,
      evidenceRefs: ['deterministic.json'],
    }, later)

    expect(getFoundationTransitionProblems(job, 'ai_assured')).toContain(
      'Independent Foundation review must pass before AI assurance',
    )
    await expect(markFoundationAiAssured(job, later)).rejects.toThrow(/Independent Foundation review/)
  })

  it('treats independent fail_hold as a material assurance failure rather than a lifecycle state', async () => {
    let job = await jobAtAssuring()
    if (!job.candidate) throw new Error('Expected a Foundation Candidate')
    const foundationFingerprint = await computeFoundationFingerprint(job.candidate)
    job = await recordDeterministicFoundationAssurance(job, {
      status: 'pass',
      foundationFingerprint,
      evidenceRefs: ['deterministic.json'],
    }, later)
    job = await recordIndependentFoundationReview(job, {
      status: 'fail_hold',
      foundationFingerprint,
      evidenceRefs: ['review-fail-hold.json'],
    }, later)

    expect(job.state).toBe('assuring')
    await expect(markFoundationAiAssured(job, later)).rejects.toThrow(/Independent Foundation review/)
  })

  it('does not treat pending qualified-human review as fail_hold', async () => {
    const { job } = await jobAtAiAssured()
    expect(job.state).toBe('ai_assured')
    expect(job.candidate?.independentReview.status).toBe('pass')
    expect(job.approvedFoundation).toBeUndefined()
  })

  it('rejects stale external-source challenge evidence', async () => {
    let job = await jobAtAssuring()
    if (!job.candidate) throw new Error('Expected a Foundation Candidate')
    const foundationFingerprint = await computeFoundationFingerprint(job.candidate)
    job = await recordDeterministicFoundationAssurance(job, {
      status: 'pass', foundationFingerprint, evidenceRefs: ['deterministic.json'],
    }, later)
    job = await recordIndependentFoundationReview(job, {
      status: 'pass', foundationFingerprint, evidenceRefs: ['review.json'],
    }, later)
    if (!job.candidate) throw new Error('Expected a Foundation Candidate')

    await expect(recordFoundationExternalSourceChallenge(job, {
      report: await passingChallenge(job.candidate, { foundationFingerprint: 'b'.repeat(64) }),
      requiredSourceUniverseProfileId: sourceUniverse.profileId,
      requiredSourceIds: sourceUniverse.requiredSourceIds,
    }, later)).rejects.toThrow(/stale for the exact Foundation fingerprint/)
  })

  it('records and resumes an operational blocker at ai_assured without calling it fail_hold', async () => {
    const { job } = await jobAtAiAssured()
    const blocked = blockFoundationJob(job, {
      id: 'expert-scheduling',
      reason: 'Qualified reviewer temporarily unavailable',
      createdAt: later,
    })
    expect(blocked.state).toBe('blocked')
    expect(blocked.blockedFromState).toBe('ai_assured')

    const resumed = resumeFoundationJob(blocked, 'expert-scheduling', later)
    expect(resumed.state).toBe('ai_assured')
  })

  it('enters foundation_approved only through exact qualified approval evidence', async () => {
    const approved = await approvedFoundation()
    expect(approved.foundationVersion).toBe(1)
    expect(approved.foundationFingerprint).toMatch(/^[0-9a-f]{64}$/)
    expect(approved.approval.reviewerId).toBe('qualified-subject-reviewer')
    expect(approved.candidate.externalSourceChallenge?.decision).toBe('pass')
    await expect(assertApprovedFoundationIntegrity(approved)).resolves.toEqual(approved)
  })

  it('rejects stale assurance if Foundation content is tampered after AI assurance', async () => {
    const { job, foundationFingerprint } = await jobAtExpertReview()
    if (!job.candidate) throw new Error('Expected a Foundation Candidate')
    const tamperedJob = foundationJobSchema.parse({
      ...job,
      candidate: {
        ...job.candidate,
        courseKnowledgeModel: artifact('foundation/course-truth.json', 'course-truth-v2'),
      },
    })

    await expect(approveFoundation(tamperedJob, {
      foundationId: jobId,
      foundationVersion: 1,
      previousApprovedFoundation: null,
      approval: approval(foundationFingerprint),
    })).rejects.toThrow(/assurance is stale/)
  })
})

describe('Foundation fingerprint and version invariants', () => {
  it('produces the same fingerprint regardless of Question Family ordering', async () => {
    const first = candidate()
    const second = candidate({ questionFamilies: [...first.questionFamilies].reverse() })
    await expect(computeFoundationFingerprint(first)).resolves.toBe(await computeFoundationFingerprint(second))
  })

  it('does not change material identity merely because assurance/challenge evidence is added', async () => {
    const base = candidate()
    const baseFingerprint = await computeFoundationFingerprint(base)
    const { job } = await jobWithAiEvidence(base)
    if (!job.candidate) throw new Error('Expected a Foundation Candidate')
    await expect(computeFoundationFingerprint(job.candidate)).resolves.toBe(baseFingerprint)
  })

  it('changes the fingerprint when Course Truth or Exam Truth changes', async () => {
    const baseFingerprint = await computeFoundationFingerprint(candidate())
    await expect(computeFoundationFingerprint(candidate({
      courseKnowledgeModel: artifact('foundation/course-truth.json', 'course-truth-v2'),
    }))).resolves.not.toBe(baseFingerprint)
    await expect(computeFoundationFingerprint(candidate({
      assessmentBlueprint: artifact('foundation/exam-truth.json', 'exam-truth-v2'),
    }))).resolves.not.toBe(baseFingerprint)
  })

  it('enforces a newer version when approved Foundation inputs change', async () => {
    const first = await approvedFoundation(1)
    const changedCandidate = candidate({
      courseKnowledgeModel: artifact('foundation/course-truth.json', 'course-truth-v2'),
    })
    const { job, foundationFingerprint } = await jobAtExpertReview(changedCandidate)

    await expect(approveFoundation(job, {
      foundationId: jobId,
      foundationVersion: 1,
      previousApprovedFoundation: first,
      approval: approval(foundationFingerprint),
    })).rejects.toThrow(/newer foundationVersion/)

    const secondJob = await approveFoundation(job, {
      foundationId: jobId,
      foundationVersion: 2,
      previousApprovedFoundation: first,
      approval: approval(foundationFingerprint),
    })
    expect(secondJob.approvedFoundation?.foundationVersion).toBe(2)
  })

  it('retains the standalone version assertion as a reusable integrity check', async () => {
    const first = await approvedFoundation(1)
    const changed = await approvedFoundation(2, candidate({
      courseKnowledgeModel: artifact('foundation/course-truth.json', 'course-truth-v2'),
    }), first)
    expect(() => assertFoundationVersionInvariant(first, changed)).not.toThrow()
  })
})
