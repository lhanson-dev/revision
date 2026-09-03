import { describe, expect, it } from 'vitest'
import {
  approvedCourseFoundationSchema,
  foundationCandidateSchema,
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
  resumeFoundationJob,
  setFoundationCandidate,
} from './foundation-lifecycle'

const now = '2026-09-03T14:00:00+01:00'
const later = '2026-09-03T14:05:00+01:00'
const headSha = 'a'.repeat(40)

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
      status: 'current',
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
    deterministicAssurance: {
      status: 'pass',
      evidenceRefs: ['foundation/deterministic-assurance.json'],
    },
    independentReview: {
      status: 'pass',
      evidenceRefs: ['foundation/independent-review.json'],
    },
    unresolvedBlockers: [],
    knownLimitations: [],
    provenance: {
      createdAt: now,
      producerVersion: 'foundation-factory-v1',
      sourceSetFingerprint: 'source-set-v1',
      implementationHeadSha: headSha,
    },
    ...overrides,
  })
}

function approval() {
  return {
    reviewerId: 'qualified-subject-reviewer',
    approverId: 'content-operations-approver',
    reviewedAt: later,
    approvedAt: later,
    evidenceRefs: ['foundation/expert-review.json'],
  }
}

async function approvedFoundation(version = 1, candidateInput = candidate()) {
  let job = createFoundationJob({ jobId: 'aqa-a-level-business-7132', createdAt: now })
  job = advanceFoundationJob(job, 'compiling', now)
  job = setFoundationCandidate(job, candidateInput, now)
  job = advanceFoundationJob(job, 'assuring', now)
  job = advanceFoundationJob(job, 'expert_review', later)
  job = await approveFoundation(job, {
    foundationId: 'aqa-a-level-business-7132',
    foundationVersion: version,
    approval: approval(),
  })
  if (!job.approvedFoundation) throw new Error('Expected an approved Foundation')
  return job.approvedFoundation
}

describe('Foundation schema boundary', () => {
  it('represents a complete Foundation without any learner-facing asset requirement', () => {
    const parsed = candidate()

    expect(parsed.courseKnowledgeModel.ref).toContain('course-truth')
    expect(parsed.assessmentBlueprint.ref).toContain('exam-truth')
    expect('learningBlueprintRef' in parsed).toBe(false)
    expect('contentPackRefs' in parsed).toBe(false)
  })

  it('fails closed when a Foundation Candidate is not source-rights approved or complete', () => {
    expect(() => foundationCandidateSchema.parse({
      ...candidate(),
      sourceRightsStatus: 'pending',
    })).toThrow()

    expect(() => foundationCandidateSchema.parse({
      ...candidate(),
      coverageCompleteness: 'incomplete',
    })).toThrow()
  })

  it('rejects duplicate Question Family references in the Foundation Candidate', () => {
    const first = artifact('foundation/question-family-essay.json', 'essay-v1')
    expect(() => foundationCandidateSchema.parse({
      ...candidate(),
      questionFamilies: [first, first],
    })).toThrow(/Duplicate Question Family reference/)
  })

  it('requires an Approved Course Foundation to contain a valid SHA-256 foundation fingerprint', () => {
    expect(() => approvedCourseFoundationSchema.parse({
      schemaVersion: 1,
      foundationId: 'aqa-a-level-business-7132',
      foundationVersion: 1,
      foundationFingerprint: 'not-a-sha256',
      candidate: candidate(),
      approval: approval(),
      knownLimitations: [],
    })).toThrow()
  })

  it('rejects an Approved Course Foundation whose embedded candidate has not passed assurance', async () => {
    const approved = await approvedFoundation()
    expect(() => approvedCourseFoundationSchema.parse({
      ...approved,
      candidate: {
        ...approved.candidate,
        independentReview: { status: 'fail_hold', evidenceRefs: ['review-fail.json'] },
      },
    })).toThrow(/passing independent review/)
  })
})

describe('Foundation lifecycle', () => {
  it('uses the small approved lifecycle rather than the legacy end-to-end states', () => {
    const requested = createFoundationJob({ jobId: 'aqa-a-level-business-7132', createdAt: now })
    expect(requested.state).toBe('requested')

    const compiling = advanceFoundationJob(requested, 'compiling', now)
    expect(() => advanceFoundationJob(compiling, 'assuring', now)).toThrow(/Foundation Candidate/)

    const withCandidate = setFoundationCandidate(compiling, candidate(), now)
    const assuring = advanceFoundationJob(withCandidate, 'assuring', now)
    const expertReview = advanceFoundationJob(assuring, 'expert_review', later)

    expect(expertReview.state).toBe('expert_review')
    expect(getFoundationTransitionProblems(expertReview, 'foundation_approved'))
      .toContain('Use approveFoundation to enter foundation_approved with exact approval evidence')
  })

  it('fails closed before expert review when deterministic or independent assurance has not passed', () => {
    let job = createFoundationJob({ jobId: 'job-1', createdAt: now })
    job = advanceFoundationJob(job, 'compiling', now)
    job = setFoundationCandidate(job, candidate({
      deterministicAssurance: { status: 'fail', evidenceRefs: ['deterministic.json'] },
      independentReview: { status: 'pending', evidenceRefs: [] },
    }), now)
    job = advanceFoundationJob(job, 'assuring', now)

    const problems = getFoundationTransitionProblems(job, 'expert_review')
    expect(problems).toContain('Deterministic Foundation assurance must pass before expert approval')
    expect(problems).toContain('Independent Foundation review must pass before expert approval')
  })

  it('does not approve a candidate with unresolved educational blockers', () => {
    let job = createFoundationJob({ jobId: 'job-1', createdAt: now })
    job = advanceFoundationJob(job, 'compiling', now)
    job = setFoundationCandidate(job, candidate({
      unresolvedBlockers: [{ id: 'coverage-gap', reason: 'One material curriculum requirement is unresolved' }],
    }), now)
    job = advanceFoundationJob(job, 'assuring', now)

    expect(() => advanceFoundationJob(job, 'expert_review', later)).toThrow(/unresolved blockers/)
  })

  it('records and resumes an operational blocker at the exact Foundation stage', () => {
    const requested = createFoundationJob({ jobId: 'job-1', createdAt: now })
    const compiling = advanceFoundationJob(requested, 'compiling', now)
    const blocked = blockFoundationJob(compiling, {
      id: 'rights-question',
      reason: 'Source-use decision required',
      createdAt: now,
    })

    expect(blocked.state).toBe('blocked')
    expect(blocked.blockedFromState).toBe('compiling')

    const resumed = resumeFoundationJob(blocked, 'rights-question', later)
    expect(resumed.state).toBe('compiling')
    expect(resumed.blockedFromState).toBeUndefined()
  })

  it('allows an abandoned blocked Foundation to be superseded without falsely resolving its blocker', () => {
    const requested = createFoundationJob({ jobId: 'job-1', createdAt: now })
    const compiling = advanceFoundationJob(requested, 'compiling', now)
    const blocked = blockFoundationJob(compiling, {
      id: 'rights-question',
      reason: 'Source-use decision required',
      createdAt: now,
    })

    const superseded = advanceFoundationJob(blocked, 'superseded', later)
    expect(superseded.state).toBe('superseded')
    expect(superseded.blockedFromState).toBeUndefined()
    expect(superseded.blockers[0]?.resolvedAt).toBeUndefined()
  })

  it('enters foundation_approved only through exact qualified approval evidence', async () => {
    const approved = await approvedFoundation()

    expect(approved.foundationVersion).toBe(1)
    expect(approved.foundationFingerprint).toMatch(/^[0-9a-f]{64}$/)
    expect(approved.approval.reviewerId).toBe('qualified-subject-reviewer')
    await expect(assertApprovedFoundationIntegrity(approved)).resolves.toEqual(approved)
  })
})

describe('Foundation fingerprint and version invariants', () => {
  it('produces the same fingerprint for the same Foundation inputs regardless of Question Family ordering', async () => {
    const first = candidate()
    const second = candidate({ questionFamilies: [...first.questionFamilies].reverse() })

    await expect(computeFoundationFingerprint(first)).resolves.toBe(await computeFoundationFingerprint(second))
  })

  it('changes the fingerprint when Course Truth or Exam Truth changes', async () => {
    const base = candidate()
    const changedCourseTruth = candidate({
      courseKnowledgeModel: artifact('foundation/course-truth.json', 'course-truth-v2'),
    })
    const changedExamTruth = candidate({
      assessmentBlueprint: artifact('foundation/exam-truth.json', 'exam-truth-v2'),
    })

    const baseFingerprint = await computeFoundationFingerprint(base)
    expect(await computeFoundationFingerprint(changedCourseTruth)).not.toBe(baseFingerprint)
    expect(await computeFoundationFingerprint(changedExamTruth)).not.toBe(baseFingerprint)
  })

  it('does not change the content fingerprint merely because assurance evidence is refreshed', async () => {
    const base = candidate()
    const reReviewed = candidate({
      deterministicAssurance: { status: 'pass', evidenceRefs: ['foundation/deterministic-assurance-v2.json'] },
      independentReview: { status: 'pass', evidenceRefs: ['foundation/independent-review-v2.json'] },
      provenance: {
        ...base.provenance,
        createdAt: later,
      },
    })

    await expect(computeFoundationFingerprint(reReviewed)).resolves.toBe(await computeFoundationFingerprint(base))
  })

  it('requires a newer version when the approved Foundation inputs change', async () => {
    const first = await approvedFoundation(1)
    const changed = await approvedFoundation(2, candidate({
      courseKnowledgeModel: artifact('foundation/course-truth.json', 'course-truth-v2'),
    }))

    expect(() => assertFoundationVersionInvariant(first, changed)).not.toThrow()

    const invalidVersion = approvedCourseFoundationSchema.parse({
      ...changed,
      foundationVersion: 1,
    })
    expect(() => assertFoundationVersionInvariant(first, invalidVersion)).toThrow(/newer foundationVersion/)
  })

  it('detects fingerprint tampering after approval', async () => {
    const approved = await approvedFoundation()
    const tampered = approvedCourseFoundationSchema.parse({
      ...approved,
      candidate: candidate({
        assessmentBlueprint: artifact('foundation/exam-truth.json', 'tampered-exam-truth'),
      }),
    })

    await expect(assertApprovedFoundationIntegrity(tampered)).rejects.toThrow(/does not match/)
  })
})
