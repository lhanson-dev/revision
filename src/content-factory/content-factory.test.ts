import { describe, expect, it } from 'vitest'
import {
  contentFactoryJobSchema,
  coverageMapSchema,
  sourceRegisterSchema,
  type ContentFactoryJob,
} from './schema'
import { advanceJob, blockJob, createRequestedJob, getTransitionProblems, resumeJob } from './orchestrator'
import { parseJobIssueBody, serializeJobIssueBody } from './github-issue-job-store'

const shaA = 'a'.repeat(40)
const shaB = 'b'.repeat(40)
const now = '2026-08-18T21:45:00+01:00'

function identifiedJob(): ContentFactoryJob {
  return contentFactoryJobSchema.parse({
    ...createRequestedJob({
      jobId: 'aqa-a-level-economics-7136',
      officialUrls: ['https://www.aqa.org.uk/subjects/economics/a-level/economics-7136/specification'],
      founderInstruction: 'Add this course to Revision',
      createdAt: now,
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
  const base = identifiedJob()
  return contentFactoryJobSchema.parse({
    ...base,
    state: 'independent_review',
    sourceRegisterRef: 'content/economics/aqa-a-level/SOURCE_REGISTER.json',
    sourceSetFingerprint: 'aqa-7136-source-v1',
    coverageMapRef: 'content/economics/aqa-a-level/COVERAGE.json',
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

describe('Content Factory schemas', () => {
  it('creates a requested job from one official URL', () => {
    const job = createRequestedJob({
      jobId: 'aqa-a-level-business-7132',
      officialUrls: ['https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification'],
      founderInstruction: 'Add this course to Revision',
      createdAt: now,
    })

    expect(job.state).toBe('requested')
    expect(job.schemaVersion).toBe(1)
  })

  it('rejects duplicate source identifiers', () => {
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

describe('Content Factory state machine', () => {
  it('requires resolved identity before leaving requested', () => {
    const job = createRequestedJob({
      jobId: 'job-1',
      officialUrls: ['https://www.aqa.org.uk/example'],
      founderInstruction: 'Add course',
      createdAt: now,
    })

    expect(getTransitionProblems(job, 'identified')).toContain('Course identity has not been resolved')
  })

  it('moves through identified and sourced only when evidence exists', () => {
    const identified = advanceJob(identifiedJob(), 'identified', now)
    expect(identified.state).toBe('identified')

    expect(() => advanceJob(identified, 'sourced', now)).toThrow(/Source register reference is required/)

    const withSources = contentFactoryJobSchema.parse({
      ...identified,
      sourceRegisterRef: 'content/economics/aqa-a-level/SOURCE_REGISTER.json',
      sourceSetFingerprint: 'aqa-7136-source-v1',
    })
    expect(advanceJob(withSources, 'sourced', now).state).toBe('sourced')
  })

  it('rejects a reviewer that shares the generation context', () => {
    const job = reviewReadyJob('generation-context')
    expect(() => advanceJob(job, 'ci_verification', now)).toThrow(/fresh context/)
  })

  it('requires CI on the same independently reviewed commit', () => {
    const reviewed = advanceJob(reviewReadyJob(), 'ci_verification', now)
    const wrongCiHead = contentFactoryJobSchema.parse({
      ...reviewed,
      ci: { status: 'pass', runId: '146', headSha: shaB },
    })

    expect(() => advanceJob(wrongCiHead, 'ready_for_founder_merge_approval', now)).toThrow(/CI head must match/)

    const correctCiHead = contentFactoryJobSchema.parse({
      ...reviewed,
      ci: { status: 'pass', runId: '146', headSha: shaA },
    })
    expect(advanceJob(correctCiHead, 'ready_for_founder_merge_approval', now).state)
      .toBe('ready_for_founder_merge_approval')
  })

  it('requires explicit Founder approval before recording a merge', () => {
    const reviewed = advanceJob(reviewReadyJob(), 'ci_verification', now)
    const ciPassed = advanceJob(contentFactoryJobSchema.parse({
      ...reviewed,
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
    const blocked = blockJob(job, { id: 'choice-1', reason: 'Tier is unresolved', createdAt: now })
    expect(blocked.state).toBe('blocked')
    expect(blocked.blockedFromState).toBe('identified')

    const resumed = resumeJob(blocked, 'choice-1', '2026-08-18T21:50:00+01:00')
    expect(resumed.state).toBe('identified')
    expect(resumed.blockedFromState).toBeUndefined()
  })
})

describe('GitHub Issue job payload', () => {
  it('round-trips a schema-validated job', () => {
    const job = identifiedJob()
    const body = serializeJobIssueBody(job)
    expect(parseJobIssueBody(body)).toEqual(job)
  })
})
