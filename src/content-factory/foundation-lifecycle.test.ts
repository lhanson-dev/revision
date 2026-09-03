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
  recordDeterministicFoundationAssurance,
  recordIndependentFoundationReview,
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
      status: 'pending',
      evidenceRefs: [],
    },
    independentReview: {
      status: 'pending',
      evidenceRefs: [],
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

async function jobAtAssuring(candidateInput = candidate()) {
  let job = createFoundationJob({ jobId: 'aqa-a-level-business-7132', createdAt: now })
  job = advanceFoundationJob(job, 'compiling', now)
  job = setFoundationCandidate(job, candidateInput, now)
  return advanceFoundationJob(job, 'assuring', now)
}

async function jobAtExpertReview(candidateInput = candidate()) {
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
    foundationId: 'aqa-a-level-business-7132',
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

  it('requires completed assurance and review evidence to identify an exact Foundation fingerprint', () => {
    expect(() => foundationCandidateSchema.parse({
      ...candidate(),
      deterministicAssurance: {
        status: 'pass',
        evidenceRefs: ['foundation/deterministic-assurance.json'],
      },
    })).toThrow(/exact Foundation fingerprint/)

    expect(() => foundationCandidateSchema.parse({
      ...candidate(),
      independentReview: {
        status: 'pass',
        evidenceRefs: ['foundation/independent-review.json'],
      },
    })).toThrow(/exact Foundation fingerprint/)
  })

  it('requires an Approved Course Foundation to contain a valid SHA-256 foundation fingerprint', () => {
    expect(() => approvedCourseFoundationSchema.parse({
      schemaVersion: 1,
      foundationId: 'aqa-a-level-business-7132',
      foundationVersion: 1,
      foundationFingerprint: 'not-a-sha256',
      candidate: candidate(),
      approval: approval('a'.repeat(64)),
      knownLimitations: [],
    })).toThrow()
  })

  it('rejects an Approved Course Foundation whose review evidence is not bound to its exact fingerprint', async () => {
    const approved = await approvedFoundation()
    expect(() => approvedCourseFoundationSchema.parse({
      ...approved,
      approval: {
        ...approved.approval,
        foundationFingerprint: 'b'.repeat(64),
      },
    })).toThrow(/exact approved Foundation fingerprint/)
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
    expect(assuring.state).toBe('assuring')
  })

  it('freezes Foundation dependencies when assurance begins', async () => {
    const assuring = await jobAtAssuring()
    expect(() => setFoundationCandidate(assuring, candidate({
      courseKnowledgeModel: artifact('foundation/course-truth.json', 'course-truth-v2'),
    }), later)).toThrow(/only while compiling/)
  })

  it('records assurance only when evidence targets the exact current Foundation fingerprint', async () => {
    const assuring = await jobAtAssuring()
    await expect(recordDeterministicFoundationAssurance(assuring, {
      status: 'pass',
      foundationFingerprint: 'b'.repeat(64),
      evidenceRefs: ['foundation/deterministic-assurance.json'],
    }, later)).rejects.toThrow(/exact current Foundation fingerprint/)
  })

  it('fails closed before expert review when deterministic or independent assurance has not passed', async () => {
    let job = await jobAtAssuring()
    if (!job.candidate) throw new Error('Expected a Foundation Candidate')
    const foundationFingerprint = await computeFoundationFingerprint(job.candidate)
    job = await recordDeterministicFoundationAssurance(job, {
      status: 'fail',
      foundationFingerprint,
      evidenceRefs: ['deterministic.json'],
    }, later)

    const problems = getFoundationTransitionProblems(job, 'expert_review')
    expect(problems).toContain('Deterministic Foundation assurance must pass before expert approval')
    expect(problems).toContain('Independent Foundation review must pass before expert approval')
  })

  it('does not approve a candidate with unresolved educational blockers', async () => {
    const job = await jobAtAssuring(candidate({
      unresolvedBlockers: [{ id: 'coverage-gap', reason: 'One material curriculum requirement is unresolved' }],
    }))

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
    expect(approved.approval.foundationFingerprint).toBe(approved.foundationFingerprint)
    await expect(assertApprovedFoundationIntegrity(approved)).resolves.toEqual(approved)
  })

  it('rejects stale assurance if Foundation content is changed after review evidence was created', async () => {
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
      foundationId: 'aqa-a-level-business-7132',
      foundationVersion: 1,
      previousApprovedFoundation: null,
      approval: approval(foundationFingerprint),
    })).rejects.toThrow(/assurance is stale/)
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
    const baseFingerprint = await computeFoundationFingerprint(base)
    const reReviewed = candidate({
      deterministicAssurance: {
        status: 'pass',
        foundationFingerprint: baseFingerprint,
        evidenceRefs: ['foundation/deterministic-assurance-v2.json'],
      },
      independentReview: {
        status: 'pass',
        foundationFingerprint: baseFingerprint,
        evidenceRefs: ['foundation/independent-review-v2.json'],
      },
      provenance: {
        ...base.provenance,
        createdAt: later,
      },
    })

    await expect(computeFoundationFingerprint(reReviewed)).resolves.toBe(baseFingerprint)
  })

  it('enforces a newer version inside approval when approved Foundation inputs change', async () => {
    const first = await approvedFoundation(1)
    const changedCandidate = candidate({
      courseKnowledgeModel: artifact('foundation/course-truth.json', 'course-truth-v2'),
    })
    const { job, foundationFingerprint } = await jobAtExpertReview(changedCandidate)

    await expect(approveFoundation(job, {
      foundationId: 'aqa-a-level-business-7132',
      foundationVersion: 1,
      previousApprovedFoundation: first,
      approval: approval(foundationFingerprint),
    })).rejects.toThrow(/newer foundationVersion/)

    const secondJob = await approveFoundation(job, {
      foundationId: 'aqa-a-level-business-7132',
      foundationVersion: 2,
      previousApprovedFoundation: first,
      approval: approval(foundationFingerprint),
    })
    expect(secondJob.approvedFoundation?.foundationVersion).toBe(2)
  })

  it('requires an initial Foundation lineage to start at version 1', async () => {
    const { job, foundationFingerprint } = await jobAtExpertReview()
    await expect(approveFoundation(job, {
      foundationId: 'aqa-a-level-business-7132',
      foundationVersion: 2,
      previousApprovedFoundation: null,
      approval: approval(foundationFingerprint),
    })).rejects.toThrow(/must start at foundationVersion 1/)
  })

  it('retains the standalone version assertion as a reusable integrity check', async () => {
    const first = await approvedFoundation(1)
    const changed = await approvedFoundation(2, candidate({
      courseKnowledgeModel: artifact('foundation/course-truth.json', 'course-truth-v2'),
    }), first)

    expect(() => assertFoundationVersionInvariant(first, changed)).not.toThrow()
  })

  it('detects fingerprint tampering after approval', async () => {
    const approved = await approvedFoundation()
    const tampered = approvedCourseFoundationSchema.parse({
      ...approved,
      candidate: {
        ...approved.candidate,
        assessmentBlueprint: artifact('foundation/exam-truth.json', 'tampered-exam-truth'),
      },
    })

    await expect(assertApprovedFoundationIntegrity(tampered)).rejects.toThrow(/does not match/)
  })
})
