import { describe, expect, it } from 'vitest'
import {
  contentFactoryJobSchema,
  coverageMapSchema,
  sourceLicenceRecordSchema,
  sourceLicenceRegisterSchema,
  sourceRegisterSchema,
  type ContentFactoryJob,
  type ContentFactorySchemaVersion,
} from './schema'
import { advanceJob, blockJob, createRequestedJob, getTransitionProblems, resumeJob } from './orchestrator'
import { parseJobIssueBody, serializeJobIssueBody } from './github-issue-job-store'

const shaA = 'a'.repeat(40)
const shaB = 'b'.repeat(40)
const now = '2026-08-18T21:45:00+01:00'

function identifiedJob(schemaVersion: ContentFactorySchemaVersion = 2): ContentFactoryJob {
  return contentFactoryJobSchema.parse({
    ...createRequestedJob({
      jobId: 'aqa-a-level-economics-7136',
      officialUrls: ['https://www.aqa.org.uk/subjects/economics/a-level/economics-7136/specification'],
      founderInstruction: 'Add this course to Revision',
      createdAt: now,
      schemaVersion,
    }),
    courseIdentity: {
      subject: 'Economics',
      qualification: 'A-level',
      awardingBody: 'AQA',
      specificationId: '7136',
    },
    cohortValidity: { status: 'current', notes: [] },
    components: [
      { id: 'paper-1', name: 'Paper 1', compulsory: true, marks: 80, durationMinutes: 120 },
      { id: 'paper-2', name: 'Paper 2', compulsory: true, marks: 80, durationMinutes: 120 },
    ],
  })
}

function reviewReadyJob(reviewContext = 'review-context'): ContentFactoryJob {
  const base = identifiedJob(2)
  return contentFactoryJobSchema.parse({
    ...base,
    state: 'independent_review',
    sourceLicenceRegisterRef: 'content/economics/aqa-a-level/SOURCE_LICENCE_REGISTER.json',
    sourceRightsStatus: 'approved',
    sourceSetFingerprint: 'aqa-7136-source-v2',
    boardAlignmentRef: 'content/economics/aqa-a-level/BOARD_ALIGNMENT.json',
    coverageMapRef: 'content/economics/aqa-a-level/COVERAGE.json',
    coverageCompleteness: 'complete',
    courseKnowledgeModelRef: 'content/economics/aqa-a-level/KNOWLEDGE_MODEL.json',
    learningBlueprintRef: 'content/economics/aqa-a-level/LEARNING_BLUEPRINT.json',
    assessmentBlueprintRef: 'content/economics/aqa-a-level/ASSESSMENT_BLUEPRINT.json',
    questionFamilyRefs: ['content/economics/aqa-a-level/question-families/essay.json'],
    markableAssessmentItemIds: ['question-1'],
    markingPackCoverage: [
      { assessmentItemId: 'question-1', markingPackRef: 'content/economics/aqa-a-level/marking-packs/question-1.json' },
    ],
    artifactCompatibilityStatus: 'pass',
    knownLimitations: [],
    contentPackRefs: ['content/economics/aqa-a-level/paper-1/index.ts'],
    workUnits: [
      {
        id: 'microeconomics',
        title: 'Microeconomics',
        requirementIds: ['req-1'],
        componentIds: ['paper-1'],
        status: 'complete',
        outputRefs: ['content/economics/aqa-a-level/shared/microeconomics.ts'],
      },
    ],
    workerRuns: [
      {
        id: 'generation-1',
        stage: 'generation',
        contextId: 'generation-context',
        contractVersion: 'generation-v1',
        provider: 'test',
        model: 'test-model',
        inputRefs: ['req-1'],
        outputRefs: ['content/economics/aqa-a-level/shared/microeconomics.ts'],
        status: 'success',
        retryCount: 0,
      },
      {
        id: 'review-1',
        stage: 'independent_review',
        contextId: reviewContext,
        contractVersion: 'review-v1',
        provider: 'test',
        model: 'test-model',
        inputRefs: [shaA],
        outputRefs: ['content/economics/aqa-a-level/ASSURANCE.md'],
        status: 'success',
        retryCount: 0,
      },
    ],
    validation: { status: 'pass', ref: 'validation.json', headSha: shaA },
    independentReview: {
      decision: 'pass',
      ref: 'content/economics/aqa-a-level/ASSURANCE.md',
      reviewedCommit: shaA,
      reviewerWorkerRunId: 'review-1',
      unresolvedBlocking: 0,
      unresolvedMaterial: 0,
    },
  })
}

function expertReadyJob(): ContentFactoryJob {
  const packaging = advanceJob(reviewReadyJob(), 'expert_review_packaging', now)
  return advanceJob(contentFactoryJobSchema.parse({
    ...packaging,
    expertReviewPackage: {
      status: 'complete',
      packageRef: 'content/economics/aqa-a-level/EXPERT_REVIEW.pdf',
      contractRef: 'content/economics/aqa-a-level/EXPERT_REVIEW.json',
      reviewedCommit: shaA,
    },
  }), 'expert_review_ready', now)
}

describe('Content Factory schemas', () => {
  it('creates new requested jobs on schema v2', () => {
    const job = createRequestedJob({
      jobId: 'aqa-a-level-business-7132',
      officialUrls: ['https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification'],
      founderInstruction: 'Add this course to Revision',
      createdAt: now,
    })

    expect(job.state).toBe('requested')
    expect(job.schemaVersion).toBe(2)
    expect(job.sourceRightsStatus).toBe('pending')
  })

  it('keeps schema v1 jobs parseable for migration compatibility', () => {
    const legacy = identifiedJob(1)
    expect(legacy.schemaVersion).toBe(1)

    const sourced = contentFactoryJobSchema.parse({
      ...advanceJob(legacy, 'identified', now),
      sourceRegisterRef: 'content/economics/aqa-a-level/SOURCE_REGISTER.json',
      sourceSetFingerprint: 'legacy-source-v1',
    })

    expect(advanceJob(sourced, 'sourced', now).state).toBe('sourced')
  })

  it('rejects duplicate legacy source identifiers', () => {
    const source = {
      id: 'specification',
      url: 'https://www.aqa.org.uk/example',
      title: 'Specification',
      issuingOrganisation: 'AQA',
      sourceType: 'specification' as const,
      checkedAt: now,
      governs: ['course content'],
      currency: 'current' as const,
      limitations: [],
    }

    expect(() => sourceRegisterSchema.parse({
      schemaVersion: 1,
      jobId: 'job-1',
      fingerprint: 'source-v1',
      checkedAt: now,
      sources: [source, source],
    })).toThrow(/Duplicate source id/)
  })

  it('fails closed when a reference-only source is marked as AI-input permitted', () => {
    expect(() => sourceLicenceRecordSchema.parse({
      id: 'aqa-specification',
      issuer: 'AQA',
      urlOrReference: 'https://www.aqa.org.uk/example',
      sourceType: 'specification',
      educationalRole: ['Board Alignment'],
      useClass: 'REFERENCE_ONLY',
      permissionBasis: 'Reference-only policy',
      aiInputPermitted: true,
      derivedCommercialUsePermitted: false,
      attributionRequirements: [],
      restrictions: [],
      checkedAt: now,
      checkerMethod: 'approved-policy-rule',
      sourceFingerprint: 'aqa-spec-v1',
      revalidationConditions: [],
    })).toThrow(/REFERENCE_ONLY/)
  })

  it('rejects duplicate v2 source-licence identifiers', () => {
    const source = {
      id: 'open-curriculum',
      issuer: 'Example issuer',
      urlOrReference: 'https://example.com/curriculum',
      sourceType: 'subject_content' as const,
      educationalRole: ['Curriculum truth'],
      useClass: 'OPEN' as const,
      permissionBasis: 'Open licence',
      aiInputPermitted: true,
      derivedCommercialUsePermitted: true,
      attributionRequirements: [],
      restrictions: [],
      checkedAt: now,
      checkerMethod: 'approved-policy-rule',
      sourceFingerprint: 'open-v1',
      revalidationConditions: [],
    }

    expect(() => sourceLicenceRegisterSchema.parse({
      schemaVersion: 2,
      jobId: 'job-1',
      fingerprint: 'source-v2',
      checkedAt: now,
      sources: [source, source],
    })).toThrow(/Duplicate source licence id/)
  })

  it('requires complete coverage to reference generated content', () => {
    expect(() => coverageMapSchema.parse({
      schemaVersion: 1,
      jobId: 'job-1',
      sourceSetFingerprint: 'source-v1',
      requirements: [{
        requirementId: 'req-1',
        officialReference: '3.1.1',
        requirementSummary: 'A governed requirement',
        skillsOrKnowledge: ['Explain the concept'],
        componentScope: ['paper-1'],
        revisionArea: 'Area 1',
        learnRequired: true,
        practiceRequired: true,
        examPrepRequired: true,
        coverageStatus: 'complete',
        contentRefs: [],
        sourceRefs: ['specification'],
      }],
    })).toThrow(/Complete coverage must reference/)
  })
})

describe('Content Factory v2 state machine', () => {
  it('requires resolved identity before leaving requested', () => {
    const job = createRequestedJob({
      jobId: 'job-1',
      officialUrls: ['https://www.aqa.org.uk/example'],
      founderInstruction: 'Add course',
      createdAt: now,
    })

    expect(getTransitionProblems(job, 'identified')).toContain('Course identity has not been resolved')
  })

  it('requires a rights-approved Source Licence Register before leaving identified', () => {
    const identified = advanceJob(identifiedJob(), 'identified', now)
    expect(() => advanceJob(identified, 'sourced', now)).toThrow(/Source Licence Register/)

    const blockedRights = contentFactoryJobSchema.parse({
      ...identified,
      sourceLicenceRegisterRef: 'content/economics/aqa-a-level/SOURCE_LICENCE_REGISTER.json',
      sourceSetFingerprint: 'aqa-7136-source-v2',
      sourceRightsStatus: 'blocked',
    })
    expect(() => advanceJob(blockedRights, 'sourced', now)).toThrow(/Source rights must be approved/)

    const approvedRights = contentFactoryJobSchema.parse({
      ...blockedRights,
      sourceRightsStatus: 'approved',
    })
    expect(advanceJob(approvedRights, 'sourced', now).state).toBe('sourced')
  })

  it('rejects a reviewer that shares the generation context', () => {
    const job = reviewReadyJob('generation-context')
    expect(() => advanceJob(job, 'expert_review_packaging', now)).toThrow(/fresh context/)
  })

  it('does not allow v2 to skip expert review and go directly to publication CI', () => {
    expect(() => advanceJob(reviewReadyJob(), 'ci_verification', now)).toThrow(/not allowed for schema v2/)
  })

  it('requires complete artifacts and Marking Pack coverage before expert packaging', () => {
    const incomplete = contentFactoryJobSchema.parse({
      ...reviewReadyJob(),
      coverageCompleteness: 'incomplete',
      markingPackCoverage: [],
    })

    const problems = getTransitionProblems(incomplete, 'expert_review_packaging')
    expect(problems).toContain('Coverage must be complete before expert-review packaging')
    expect(problems.join(' ')).toMatch(/Marking Packs are missing/)
  })

  it('reaches expert_review_ready only with an exact-version portable package', () => {
    const packaging = advanceJob(reviewReadyJob(), 'expert_review_packaging', now)
    expect(() => advanceJob(packaging, 'expert_review_ready', now)).toThrow(/package must be complete/)

    const wrongPackage = contentFactoryJobSchema.parse({
      ...packaging,
      expertReviewPackage: {
        status: 'complete',
        packageRef: 'expert-review.pdf',
        contractRef: 'expert-review.json',
        reviewedCommit: shaB,
      },
    })
    expect(() => advanceJob(wrongPackage, 'expert_review_ready', now)).toThrow(/independently reviewed commit/)

    expect(expertReadyJob().state).toBe('expert_review_ready')
  })

  it('requires qualified expert approval before benchmark and publication CI', () => {
    const humanReview = advanceJob(expertReadyJob(), 'human_review', now)
    expect(() => advanceJob(humanReview, 'benchmark_approved', now)).toThrow(/Qualified human subject review/)

    const passed = contentFactoryJobSchema.parse({
      ...humanReview,
      humanReview: {
        status: 'pass',
        ref: 'expert-review-result.json',
        reviewedCommit: shaA,
        unresolvedBlocking: 0,
        unresolvedMaterial: 0,
      },
    })
    const benchmark = advanceJob(passed, 'benchmark_approved', now)
    expect(advanceJob(benchmark, 'ci_verification', now).state).toBe('ci_verification')
  })

  it('supports remediation when expert review returns material findings', () => {
    const humanReview = advanceJob(expertReadyJob(), 'human_review', now)
    const failed = contentFactoryJobSchema.parse({
      ...humanReview,
      humanReview: {
        status: 'conditional_pass',
        ref: 'expert-review-result.json',
        reviewedCommit: shaA,
        unresolvedBlocking: 0,
        unresolvedMaterial: 1,
      },
    })

    expect(advanceJob(failed, 'remediation', now).state).toBe('remediation')
  })

  it('requires CI on the final expert-reviewed commit', () => {
    const humanReview = advanceJob(expertReadyJob(), 'human_review', now)
    const benchmark = advanceJob(contentFactoryJobSchema.parse({
      ...humanReview,
      humanReview: {
        status: 'pass',
        ref: 'expert-review-result.json',
        reviewedCommit: shaA,
        unresolvedBlocking: 0,
        unresolvedMaterial: 0,
      },
    }), 'benchmark_approved', now)
    const ciStage = advanceJob(benchmark, 'ci_verification', now)

    const wrongCiHead = contentFactoryJobSchema.parse({
      ...ciStage,
      ci: { status: 'pass', runId: '146', headSha: shaB },
    })
    expect(() => advanceJob(wrongCiHead, 'ready_for_founder_merge_approval', now)).toThrow(/final reviewed commit/)

    const correctCiHead = contentFactoryJobSchema.parse({
      ...ciStage,
      ci: { status: 'pass', runId: '146', headSha: shaA },
    })
    expect(advanceJob(correctCiHead, 'ready_for_founder_merge_approval', now).state)
      .toBe('ready_for_founder_merge_approval')
  })

  it('requires explicit Founder approval before recording a merge', () => {
    const humanReview = advanceJob(expertReadyJob(), 'human_review', now)
    const benchmark = advanceJob(contentFactoryJobSchema.parse({
      ...humanReview,
      humanReview: { status: 'pass', ref: 'expert.json', reviewedCommit: shaA },
    }), 'benchmark_approved', now)
    const ciStage = advanceJob(benchmark, 'ci_verification', now)
    const ciPassed = advanceJob(contentFactoryJobSchema.parse({
      ...ciStage,
      ci: { status: 'pass', runId: '146', headSha: shaA },
    }), 'ready_for_founder_merge_approval', now)

    expect(() => advanceJob(ciPassed, 'merged', now)).toThrow(/Founder merge approval/)

    const mergedEvidence = contentFactoryJobSchema.parse({
      ...ciPassed,
      merge: { founderApproved: true, mergedCommit: shaB },
    })
    expect(advanceJob(mergedEvidence, 'merged', now).state).toBe('merged')
  })

  it('does not report pilot live until deployment covers the merged commit', () => {
    const merged = contentFactoryJobSchema.parse({
      ...reviewReadyJob(),
      state: 'deployment_verification',
      merge: { founderApproved: true, mergedCommit: shaB },
      deployment: { status: 'pass', ref: 'pages-run-1', deployedCommit: shaA },
    })

    expect(() => advanceJob(merged, 'pilot_live', now)).toThrow(/merged commit/)

    const deployed = contentFactoryJobSchema.parse({
      ...merged,
      deployment: { status: 'pass', ref: 'pages-run-2', deployedCommit: shaB },
    })
    expect(advanceJob(deployed, 'pilot_live', now).state).toBe('pilot_live')
  })

  it('can block and resume a job without losing its previous stage', () => {
    const job = advanceJob(identifiedJob(), 'identified', now)
    const blocked = blockJob(job, { id: 'rights-1', reason: 'source_rights_review_required', createdAt: now })
    expect(blocked.state).toBe('blocked')
    expect(blocked.blockedFromState).toBe('identified')

    const resumed = resumeJob(blocked, 'rights-1', '2026-08-18T21:50:00+01:00')
    expect(resumed.state).toBe('identified')
    expect(resumed.blockedFromState).toBeUndefined()
  })
})

describe('GitHub Issue job payload', () => {
  it('round-trips a schema-validated v2 job', () => {
    const job = identifiedJob()
    const body = serializeJobIssueBody(job)
    expect(parseJobIssueBody(body)).toEqual(job)
  })
})
