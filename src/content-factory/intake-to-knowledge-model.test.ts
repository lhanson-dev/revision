import { describe, expect, it } from 'vitest'
import { createRequestedJob } from './orchestrator'
import {
  classifySourcesWithApprovedRules,
  runIntakeToKnowledgeModel,
  type ContentFactoryArtifactKind,
  type ContentFactoryArtifactStore,
  type IntakeToKnowledgeModelWorkers,
  type SourceRightsPolicyRule,
  type WorkerExecution,
} from './intake-to-knowledge-model'

const now = '2026-08-25T21:00:00+01:00'

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

const referenceOnlyRule: SourceRightsPolicyRule = {
  id: 'board-reference-only',
  issuer: 'Example Board',
  hostnames: ['board.example'],
  sourceTypes: ['course_page', 'assessment'],
  useClass: 'REFERENCE_ONLY',
  permissionBasis: 'Approved reference-only policy fixture',
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
  permissionBasis: 'Approved open-licence policy fixture',
  aiInputPermitted: true,
  derivedCommercialUsePermitted: true,
  attributionRequirements: ['Attribute the source'],
  restrictions: [],
  revalidationConditions: [],
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
    versionOrDate: '2026',
  },
  {
    id: 'open-subject',
    url: 'https://curriculum.example/economics/core',
    title: 'Economics subject content',
    issuer: 'Open Curriculum Authority',
    sourceType: 'subject_content' as const,
    educationalRole: ['Curriculum truth'],
    versionOrDate: '2026',
  },
]

function workers(): IntakeToKnowledgeModelWorkers {
  return {
    resolveIdentity: async () => success('identity-run', identity),
    discoverSources: async () => success('source-run', discoveredSources),
    resolveStructuredEvidence: async () => success('evidence-run', {
      boardAlignmentFacts: [
        {
          id: 'component-structure',
          sourceRef: 'board-course',
          category: 'component',
          value: 'One compulsory 80-mark paper lasting 90 minutes',
          verificationStatus: 'verified',
        },
      ],
      curriculumRequirements: [
        {
          requirementId: 'scarcity',
          summary: 'Understand scarcity, choice and opportunity cost',
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
    compileBoardAlignment: async () => success('alignment-run', {
      schemaVersion: 1,
      jobId: 'cf-economics',
      fingerprint: 'alignment-v1',
      courseIdentity: identity.courseIdentity,
      cohortValidity: identity.cohortValidity,
      components: identity.components,
      assessmentObjectives: [],
      assessmentRequirements: [
        {
          id: 'paper-1-structure',
          summary: 'One compulsory paper',
          componentScope: ['paper-1'],
          sourceRefs: ['board-course'],
        },
      ],
      sourceRefs: ['board-course'],
      verificationStatus: 'verified',
    }),
    compileCoverage: async ({ sourceLicenceRegister }) => success('coverage-run', {
      schemaVersion: 1,
      jobId: 'cf-economics',
      sourceSetFingerprint: sourceLicenceRegister.fingerprint,
      requirements: [
        {
          requirementId: 'scarcity',
          officialReference: 'open-subject:scarcity',
          requirementSummary: 'Understand scarcity, choice and opportunity cost',
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
    compileKnowledgeModel: async () => success('knowledge-run', {
      schemaVersion: 1,
      jobId: 'cf-economics',
      fingerprint: 'knowledge-v1',
      nodes: [
        {
          id: 'scarcity',
          kind: 'concept',
          summary: 'Resources are finite while wants are unlimited, requiring choices.',
          prerequisiteIds: [],
          relatedIds: [],
          formulas: [],
          misconceptions: ['Scarcity means the same thing as a temporary shortage.'],
          applicationContexts: ['Household choices', 'Government spending choices'],
          depth: 'core',
          sourceRefs: ['open-subject'],
          boardAlignmentRefs: ['paper-1'],
          evidenceTypes: ['explanation', 'application'],
        },
      ],
    }),
  }
}

describe('Content Factory source-rights policy engine', () => {
  it('fails closed when no approved reusable source-rights rule matches', async () => {
    const result = await classifySourcesWithApprovedRules({
      jobId: 'cf-economics',
      sources: [discoveredSources[0]],
      rules: [],
      checkedAt: now,
    })

    expect(result.status).toBe('blocked')
    expect(result.blockingSourceIds).toEqual(['board-course'])
    expect(result.register.sources[0].useClass).toBe('UNKNOWN')
    expect(result.register.sources[0].aiInputPermitted).toBe(false)
  })

  it('allows REFERENCE_ONLY material as a classified source without granting AI-input permission', async () => {
    const result = await classifySourcesWithApprovedRules({
      jobId: 'cf-economics',
      sources: [discoveredSources[0]],
      rules: [referenceOnlyRule],
      checkedAt: now,
    })

    expect(result.status).toBe('approved')
    expect(result.register.sources[0].useClass).toBe('REFERENCE_ONLY')
    expect(result.register.sources[0].aiInputPermitted).toBe(false)
    expect(result.register.sources[0].derivedCommercialUsePermitted).toBe(false)
  })
})

describe('Content Factory intake to knowledge model', () => {
  it('runs a rights-safe course request through mapped state with a Course Knowledge Model', async () => {
    const artifactStore = new MemoryArtifactStore()
    const job = createRequestedJob({
      jobId: 'cf-economics',
      officialUrls: ['https://board.example/economics/econ-101'],
      founderInstruction: 'Add this course to Revision',
      createdAt: now,
    })

    const result = await runIntakeToKnowledgeModel({
      job,
      workers: workers(),
      artifactStore,
      sourceRightsRules: [referenceOnlyRule, openCurriculumRule],
      now,
    })

    expect(result.state).toBe('mapped')
    expect(result.sourceRightsStatus).toBe('approved')
    expect(result.sourceLicenceRegisterRef).toContain('source_licence_register')
    expect(result.boardAlignmentRef).toContain('board_alignment')
    expect(result.coverageMapRef).toContain('coverage_map')
    expect(result.courseKnowledgeModelRef).toContain('course_knowledge_model')
    expect(result.workerRuns.map((run) => run.stage)).toEqual([
      'identity',
      'source',
      'source_rights',
      'source',
      'board_alignment',
      'coverage',
      'knowledge_model',
    ])
  })

  it('blocks before sourcing when a discovered source has no approved rights rule', async () => {
    const artifactStore = new MemoryArtifactStore()
    const job = createRequestedJob({
      jobId: 'cf-economics',
      officialUrls: ['https://board.example/economics/econ-101'],
      founderInstruction: 'Add this course to Revision',
      createdAt: now,
    })

    const result = await runIntakeToKnowledgeModel({
      job,
      workers: workers(),
      artifactStore,
      sourceRightsRules: [referenceOnlyRule],
      now,
    })

    expect(result.state).toBe('blocked')
    expect(result.blockedFromState).toBe('identified')
    expect(result.sourceRightsStatus).toBe('blocked')
    expect(result.blockers.at(-1)?.reason).toContain('source_rights_review_required')
    expect(result.courseKnowledgeModelRef).toBeUndefined()
  })

  it('rejects REFERENCE_ONLY material when a worker tries to use it as curriculum authority', async () => {
    const unsafeWorkers = workers()
    unsafeWorkers.resolveStructuredEvidence = async () => success('evidence-run', {
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
          requirementId: 'unsafe-requirement',
          summary: 'Unsafe derived curriculum requirement',
          skillsOrKnowledge: ['unsafe'],
          componentScope: ['paper-1'],
          revisionArea: 'Unsafe',
          learnRequired: true,
          practiceRequired: true,
          examPrepRequired: true,
          sourceRefs: ['board-course'],
        },
      ],
    })

    const artifactStore = new MemoryArtifactStore()
    const job = createRequestedJob({
      jobId: 'cf-economics',
      officialUrls: ['https://board.example/economics/econ-101'],
      founderInstruction: 'Add this course to Revision',
      createdAt: now,
    })

    await expect(runIntakeToKnowledgeModel({
      job,
      workers: unsafeWorkers,
      artifactStore,
      sourceRightsRules: [referenceOnlyRule, openCurriculumRule],
      now,
    })).rejects.toThrow(/without permitted curriculum\/commercial-use rights/)
  })

  it('blocks on a genuine unresolved course option rather than guessing', async () => {
    const optionWorkers = workers()
    optionWorkers.resolveIdentity = async () => success('identity-run', {
      ...identity,
      unresolvedChoices: ['Higher or Foundation tier'],
    })

    const result = await runIntakeToKnowledgeModel({
      job: createRequestedJob({
        jobId: 'cf-economics',
        officialUrls: ['https://board.example/economics/econ-101'],
        founderInstruction: 'Add this course to Revision',
        createdAt: now,
      }),
      workers: optionWorkers,
      artifactStore: new MemoryArtifactStore(),
      sourceRightsRules: [referenceOnlyRule, openCurriculumRule],
      now,
    })

    expect(result.state).toBe('blocked')
    expect(result.blockedFromState).toBe('requested')
    expect(result.blockers.at(-1)?.reason).toContain('course_option_resolution_required')
  })
})
