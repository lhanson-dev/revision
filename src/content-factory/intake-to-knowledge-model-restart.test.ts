import { describe, expect, it } from 'vitest'
import { createRequestedJob, resumeJob } from './orchestrator'
import {
  runIntakeToKnowledgeModel,
  type ContentFactoryArtifactKind,
  type ContentFactoryArtifactStore,
  type IntakeToKnowledgeModelWorkers,
  type SourceRightsPolicyRule,
  type WorkerExecution,
} from './intake-to-knowledge-model'

const firstRunAt = '2026-08-25T21:00:00+01:00'
const resumedAt = '2026-08-25T21:10:00+01:00'

function success<T>(id: string, output: T): WorkerExecution<T> {
  return {
    status: 'success',
    output,
    provenance: {
      id,
      contextId: `context-${id}`,
      contractVersion: '1',
      provider: 'test-provider',
      model: 'test-model',
    },
  }
}

class MemoryArtifactStore implements ContentFactoryArtifactStore {
  readonly values = new Map<string, unknown>()

  async writeJson(input: {
    jobId: string
    kind: ContentFactoryArtifactKind
    fingerprint: string
    value: unknown
  }) {
    const ref = `content-factory/${input.jobId}/${input.kind}-${input.fingerprint.slice(0, 12)}.json`
    this.values.set(ref, input.value)
    return { ref }
  }

  async readJson(ref: string) {
    if (!this.values.has(ref)) throw new Error(`Missing artifact ${ref}`)
    return this.values.get(ref)
  }
}

const identity = {
  courseIdentity: {
    subject: 'Economics',
    qualification: 'Example AS Economics',
    awardingBody: 'Example Board',
    specificationId: 'econ-101',
  },
  cohortValidity: {
    status: 'current' as const,
    firstAssessment: '2026',
    notes: [],
  },
  components: [
    {
      id: 'paper-1',
      name: 'Paper 1',
      compulsory: true,
      marks: 80,
      durationMinutes: 90,
      weightingPercent: 100,
    },
  ],
  unresolvedChoices: [],
}

const discoveredSources = [
  {
    id: 'board-course',
    url: 'https://board.example/economics/econ-101',
    title: 'Example AS Economics',
    issuer: 'Example Board',
    sourceType: 'course_page' as const,
    educationalRole: ['Course identity', 'Board Alignment'],
  },
  {
    id: 'open-subject',
    url: 'https://curriculum.example/economics/core',
    title: 'Economics subject content',
    issuer: 'Open Curriculum Authority',
    sourceType: 'subject_content' as const,
    educationalRole: ['Curriculum truth'],
  },
]

const referenceOnlyRule: SourceRightsPolicyRule = {
  id: 'board-reference-only',
  issuer: 'Example Board',
  hostnames: ['board.example'],
  sourceTypes: ['course_page'],
  useClass: 'REFERENCE_ONLY',
  permissionBasis: 'Approved reference-only test policy',
  aiInputPermitted: false,
  derivedCommercialUsePermitted: false,
  attributionRequirements: [],
  restrictions: ['Structured Board Alignment facts only'],
  revalidationConditions: [],
}

const openCurriculumRule: SourceRightsPolicyRule = {
  id: 'open-curriculum',
  issuer: 'Open Curriculum Authority',
  hostnames: ['curriculum.example'],
  sourceTypes: ['subject_content'],
  useClass: 'OPEN',
  permissionBasis: 'Approved open-licence test policy',
  aiInputPermitted: true,
  derivedCommercialUsePermitted: true,
  attributionRequirements: [],
  restrictions: [],
  revalidationConditions: [],
}

function makeWorkers(runSuffix: string): IntakeToKnowledgeModelWorkers {
  return {
    resolveIdentity: async () => success(`identity-${runSuffix}`, identity),
    discoverSources: async () => success(`source-${runSuffix}`, discoveredSources),
    resolveStructuredEvidence: async () => success(`evidence-${runSuffix}`, {
      boardAlignmentFacts: [
        {
          id: 'component-structure',
          sourceRef: 'board-course',
          category: 'component',
          value: 'One compulsory paper',
          verificationStatus: 'verified',
        },
      ],
      curriculumRequirements: [
        {
          requirementId: 'scarcity',
          summary: 'Understand scarcity and opportunity cost',
          skillsOrKnowledge: ['scarcity', 'opportunity cost'],
          componentScope: ['paper-1'],
          revisionArea: 'Core economic ideas',
          learnRequired: true,
          practiceRequired: true,
          examPrepRequired: true,
          sourceRefs: ['open-subject'],
        },
      ],
    }),
    compileBoardAlignment: async () => success(`alignment-${runSuffix}`, {
      schemaVersion: 1,
      jobId: 'cf-restart',
      fingerprint: `alignment-${runSuffix}`,
      courseIdentity: identity.courseIdentity,
      cohortValidity: identity.cohortValidity,
      components: identity.components,
      assessmentObjectives: [],
      assessmentRequirements: [],
      sourceRefs: ['board-course'],
      verificationStatus: 'verified',
    }),
    compileCoverage: async ({ sourceLicenceRegister }) => success(`coverage-${runSuffix}`, {
      schemaVersion: 1,
      jobId: 'cf-restart',
      sourceSetFingerprint: sourceLicenceRegister.fingerprint,
      requirements: [
        {
          requirementId: 'scarcity',
          officialReference: 'open-subject:scarcity',
          requirementSummary: 'Understand scarcity and opportunity cost',
          skillsOrKnowledge: ['scarcity', 'opportunity cost'],
          componentScope: ['paper-1'],
          revisionArea: 'Core economic ideas',
          learnRequired: true,
          practiceRequired: true,
          examPrepRequired: true,
          coverageStatus: 'planned',
          contentRefs: [],
          sourceRefs: ['open-subject'],
        },
      ],
    }),
    compileKnowledgeModel: async () => success(`knowledge-${runSuffix}`, {
      schemaVersion: 1,
      jobId: 'cf-restart',
      fingerprint: `knowledge-${runSuffix}`,
      nodes: [
        {
          id: 'scarcity',
          kind: 'concept',
          summary: 'Finite resources require choices between competing uses.',
          prerequisiteIds: [],
          relatedIds: [],
          formulas: [],
          misconceptions: [],
          applicationContexts: ['Household choices'],
          depth: 'core',
          sourceRefs: ['open-subject'],
          boardAlignmentRefs: ['paper-1'],
          evidenceTypes: ['explanation'],
        },
      ],
    }),
  }
}

describe('Content Factory intake restartability', () => {
  it('resumes a source-rights blocker from durable identified state after an approved rule becomes available', async () => {
    const artifactStore = new MemoryArtifactStore()
    const requested = createRequestedJob({
      jobId: 'cf-restart',
      officialUrls: ['https://board.example/economics/econ-101'],
      founderInstruction: 'Add this course to Revision',
      createdAt: firstRunAt,
    })

    const blocked = await runIntakeToKnowledgeModel({
      job: requested,
      workers: makeWorkers('first'),
      artifactStore,
      sourceRightsRules: [referenceOnlyRule],
      now: firstRunAt,
    })

    expect(blocked.state).toBe('blocked')
    expect(blocked.blockedFromState).toBe('identified')
    const blocker = blocked.blockers.find((item) => !item.resolvedAt)
    expect(blocker?.reason).toContain('source_rights_review_required')

    const resumed = resumeJob(blocked, blocker!.id, resumedAt)
    expect(resumed.state).toBe('identified')

    const completed = await runIntakeToKnowledgeModel({
      job: resumed,
      workers: makeWorkers('resume'),
      artifactStore,
      sourceRightsRules: [referenceOnlyRule, openCurriculumRule],
      now: resumedAt,
    })

    expect(completed.state).toBe('mapped')
    expect(completed.sourceRightsStatus).toBe('approved')
    expect(completed.courseKnowledgeModelRef).toContain('course_knowledge_model')
    expect(completed.blockers.every((item) => Boolean(item.resolvedAt))).toBe(true)
    expect(completed.workerRuns.some((run) => run.id === 'source-first')).toBe(true)
    expect(completed.workerRuns.some((run) => run.id === 'source-resume')).toBe(true)
  })

  it('is idempotent when the mapped job already has its Course Knowledge Model', async () => {
    const artifactStore = new MemoryArtifactStore()
    const completed = await runIntakeToKnowledgeModel({
      job: createRequestedJob({
        jobId: 'cf-restart',
        officialUrls: ['https://board.example/economics/econ-101'],
        founderInstruction: 'Add this course to Revision',
        createdAt: firstRunAt,
      }),
      workers: makeWorkers('initial'),
      artifactStore,
      sourceRightsRules: [referenceOnlyRule, openCurriculumRule],
      now: firstRunAt,
    })

    const workerRunCount = completed.workerRuns.length
    const rerun = await runIntakeToKnowledgeModel({
      job: completed,
      workers: makeWorkers('should-not-run'),
      artifactStore,
      sourceRightsRules: [referenceOnlyRule, openCurriculumRule],
      now: resumedAt,
    })

    expect(rerun.courseKnowledgeModelRef).toBe(completed.courseKnowledgeModelRef)
    expect(rerun.workerRuns).toHaveLength(workerRunCount)
  })
})
