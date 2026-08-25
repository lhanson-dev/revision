import { describe, expect, it } from 'vitest'
import { resumeJob } from './orchestrator'
import { contentFactoryJobSchema, type ContentFactoryJob } from './schema'
import {
  learningPracticeArtifactSchema,
  runLearningAndPracticeFactory,
  type LearningPracticeArtifactKind,
  type LearningPracticeArtifactStore,
  type LearningPracticeWorkerExecution,
  type LearningPracticeWorkers,
} from './learning-and-practice'

const now = '2026-08-25T22:40:00+01:00'

function success<T>(id: string, output: T): LearningPracticeWorkerExecution<T> {
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

function failure(id: string, error: string): LearningPracticeWorkerExecution<never> {
  return {
    status: 'failure',
    error,
    provenance: {
      id,
      contextId: `context-${id}`,
      contractVersion: '1',
      provider: 'test-provider',
      model: 'test-model',
    },
  }
}

class MemoryArtifactStore implements LearningPracticeArtifactStore {
  readonly values = new Map<string, unknown>()
  writes = 0

  seed(ref: string, value: unknown) {
    this.values.set(ref, value)
  }

  async writeJson(input: {
    jobId: string
    kind: LearningPracticeArtifactKind
    fingerprint: string
    value: unknown
  }) {
    this.writes += 1
    const ref = `content-factory/${input.jobId}/${input.kind}-${input.fingerprint.slice(0, 12)}.json`
    this.values.set(ref, input.value)
    return { ref }
  }

  async readJson(ref: string) {
    if (!this.values.has(ref)) throw new Error(`Missing artifact ${ref}`)
    return this.values.get(ref)
  }
}

const knowledgeModelRef = 'content-factory/cf-economics/course-knowledge-model.json'
const coverageMapRef = 'content-factory/cf-economics/coverage-map.json'

const knowledgeModel = {
  schemaVersion: 1 as const,
  jobId: 'cf-economics',
  fingerprint: 'knowledge-economics-v1',
  nodes: [
    {
      id: 'scarcity',
      kind: 'concept' as const,
      summary: 'Resources are finite while wants are unlimited, so choices carry opportunity cost.',
      prerequisiteIds: [],
      relatedIds: [],
      formulas: [],
      misconceptions: ['Scarcity is the same as a temporary shortage.'],
      applicationContexts: ['Household choices', 'Government spending choices'],
      depth: 'core' as const,
      sourceRefs: ['open-subject'],
      boardAlignmentRefs: ['paper-1', 'paper-2'],
      evidenceTypes: ['explanation', 'application'],
    },
  ],
}

function coverage(componentScope = ['paper-1', 'paper-2']) {
  return {
    schemaVersion: 1 as const,
    jobId: 'cf-economics',
    sourceSetFingerprint: 'source-set-v1',
    requirements: [
      {
        requirementId: 'scarcity',
        officialReference: 'open-subject:scarcity',
        requirementSummary: 'Understand scarcity, choice and opportunity cost',
        skillsOrKnowledge: ['scarcity', 'opportunity cost'],
        componentScope,
        revisionArea: 'Core economic ideas',
        learnRequired: true,
        practiceRequired: true,
        examPrepRequired: true,
        coverageStatus: 'planned' as const,
        contentRefs: [],
        sourceRefs: ['open-subject'],
      },
    ],
  }
}

function mappedJob(): ContentFactoryJob {
  return contentFactoryJobSchema.parse({
    schemaVersion: 2,
    jobId: 'cf-economics',
    officialUrls: ['https://board.example/economics/econ-101'],
    founderInstruction: 'Add this course to Revision',
    state: 'mapped',
    courseIdentity: {
      subject: 'Economics',
      qualification: 'Example AS Economics',
      awardingBody: 'Example Board',
      specificationId: 'econ-101',
    },
    cohortValidity: { status: 'current', notes: [] },
    components: [
      { id: 'paper-1', name: 'Paper 1', compulsory: true },
      { id: 'paper-2', name: 'Paper 2', compulsory: true },
    ],
    unresolvedChoices: [],
    sourceLicenceRegisterRef: 'content-factory/cf-economics/source-licence-register.json',
    sourceRightsStatus: 'approved',
    sourceSetFingerprint: 'source-set-v1',
    boardAlignmentRef: 'content-factory/cf-economics/board-alignment.json',
    coverageMapRef,
    coverageCompleteness: 'pending',
    courseKnowledgeModelRef: knowledgeModelRef,
    workUnits: [],
    workerRuns: [],
    blockers: [],
    createdAt: now,
    updatedAt: now,
  })
}

function seedStore(componentScope = ['paper-1', 'paper-2']) {
  const store = new MemoryArtifactStore()
  store.seed(knowledgeModelRef, knowledgeModel)
  store.seed(coverageMapRef, coverage(componentScope))
  return store
}

function blueprint(scope: 'course' | 'component' = 'course') {
  return {
    schemaVersion: 1 as const,
    jobId: 'cf-economics',
    knowledgeModelFingerprint: knowledgeModel.fingerprint,
    workUnits: [
      {
        id: 'scarcity-foundations',
        title: 'Scarcity and opportunity cost',
        requirementIds: ['scarcity'],
        knowledgeNodeIds: ['scarcity'],
        learningModes: ['explanation', 'retrieval', 'application'] as const,
        requiredOutputs: ['learning', 'practice'] as const,
        scope,
        componentIds: scope === 'component' ? ['paper-1'] : [],
      },
    ],
  }
}

const learningOutput = {
  title: 'Scarcity and opportunity cost',
  introduction: 'Scarcity is the reason economic choices have to be made.',
  sections: [
    {
      id: 'scarcity-explained',
      title: 'Why scarcity creates choice',
      explanation: 'Finite resources cannot satisfy every possible want at the same time.',
      keyPoints: ['Choices use resources', 'Choosing one option means giving up another'],
    },
  ],
  workedExamples: [],
  misconceptions: [
    {
      misconception: 'Scarcity only happens when shops run out of something.',
      correction: 'Scarcity is the permanent economic problem of finite resources relative to wants.',
    },
  ],
  nextAction: 'Test the idea by applying it to a real choice.',
}

const practiceOutput = {
  title: 'Test your understanding of scarcity',
  instructions: 'Answer from memory, then use the feedback to improve the weak part.',
  activities: [
    {
      id: 'scarcity-retrieval',
      mode: 'retrieval' as const,
      prompt: 'What does scarcity mean in economics?',
      expectedResponse: 'Resources are finite relative to wants, so choices are necessary.',
      explanation: 'The key idea is the relationship between finite resources and competing wants.',
      improvementAction: 'Include both finite resources and the need to choose.',
    },
    {
      id: 'scarcity-application',
      mode: 'application' as const,
      prompt: 'A council can fund either a library extension or more bus services. Explain the opportunity cost of choosing the library.',
      expectedResponse: 'The opportunity cost is the value of the bus-service improvement that is forgone.',
      explanation: 'Opportunity cost is the next-best alternative given up when a choice is made.',
      improvementAction: 'Name the specific forgone alternative rather than saying only that money was spent.',
    },
  ],
}

function workers(overrides: Partial<LearningPracticeWorkers> = {}): LearningPracticeWorkers {
  return {
    planLearningBlueprint: async () => success('blueprint-run', blueprint()),
    generateLearningCollateral: async () => success('learning-run', learningOutput),
    generatePracticeCollateral: async () => success('practice-run', practiceOutput),
    ...overrides,
  }
}

describe('Content Factory Learning Blueprint and collateral factory', () => {
  it('moves a mapped Course Knowledge Model into generating with complete Learn and Practice work units', async () => {
    const store = seedStore()
    let plannerInput: Parameters<LearningPracticeWorkers['planLearningBlueprint']>[0] | undefined
    let learningInput: Parameters<LearningPracticeWorkers['generateLearningCollateral']>[0] | undefined

    const result = await runLearningAndPracticeFactory({
      job: mappedJob(),
      artifactStore: store,
      workers: workers({
        planLearningBlueprint: async (input) => {
          plannerInput = input
          return success('blueprint-run', blueprint())
        },
        generateLearningCollateral: async (input) => {
          learningInput = input
          return success('learning-run', learningOutput)
        },
      }),
      now,
    })

    expect(result.state).toBe('generating')
    expect(result.learningBlueprintRef).toBeTruthy()
    expect(result.workUnits).toHaveLength(1)
    expect(result.workUnits[0].status).toBe('complete')
    expect(result.workUnits[0].componentIds).toEqual([])
    expect(result.workUnits[0].outputRefs).toHaveLength(2)
    expect(result.workerRuns.map((run) => run.stage)).toEqual(['learning_blueprint', 'generation', 'generation'])

    expect(plannerInput?.knowledgeNodes[0]).not.toHaveProperty('sourceRefs')
    expect(learningInput?.knowledgeNodes[0]).not.toHaveProperty('sourceRefs')

    const artifacts = await Promise.all(result.workUnits[0].outputRefs.map((ref) => store.readJson(ref)))
    const parsed = artifacts.map((artifact) => learningPracticeArtifactSchema.parse(artifact))
    expect(parsed.map((artifact) => artifact.artifactType).sort()).toEqual(['learning', 'practice'])
    expect(parsed.every((artifact) => artifact.sourceRefs.includes('open-subject'))).toBe(true)
  })

  it('does not force flashcards or identical practice modes when the Learning Blueprint does not select them', async () => {
    const result = await runLearningAndPracticeFactory({
      job: mappedJob(),
      artifactStore: seedStore(),
      workers: workers(),
      now,
    })

    const practiceRun = result.workerRuns.find((run) => run.id === 'practice-run')
    expect(practiceRun).toBeTruthy()
    expect(blueprint().workUnits[0].learningModes).not.toContain('flashcard')
  })

  it('rejects paper duplication for a requirement that coverage marks as shared across multiple components', async () => {
    await expect(runLearningAndPracticeFactory({
      job: mappedJob(),
      artifactStore: seedStore(['paper-1', 'paper-2']),
      workers: workers({
        planLearningBlueprint: async () => success('blueprint-run', blueprint('component')),
      }),
      now,
    })).rejects.toThrow(/Shared multi-component requirement scarcity must remain course-scoped/)
  })

  it('rejects practice output that introduces an unplanned mode', async () => {
    await expect(runLearningAndPracticeFactory({
      job: mappedJob(),
      artifactStore: seedStore(),
      workers: workers({
        generatePracticeCollateral: async () => success('practice-run', {
          ...practiceOutput,
          activities: [
            ...practiceOutput.activities,
            {
              id: 'unplanned-flashcard',
              mode: 'flashcard',
              prompt: 'Define scarcity.',
              expectedResponse: 'Finite resources relative to wants.',
              explanation: 'Definition check.',
              improvementAction: 'Use the full definition.',
            },
          ],
        }),
      }),
      now,
    })).rejects.toThrow(/generated unplanned mode flashcard/)
  })

  it('resumes after a practice-worker blocker without regenerating already persisted learning collateral', async () => {
    const store = seedStore()
    let learningCalls = 0
    let practiceCalls = 0

    const first = await runLearningAndPracticeFactory({
      job: mappedJob(),
      artifactStore: store,
      workers: workers({
        generateLearningCollateral: async () => {
          learningCalls += 1
          return success('learning-run', learningOutput)
        },
        generatePracticeCollateral: async () => {
          practiceCalls += 1
          return failure('practice-fail', 'temporary provider failure')
        },
      }),
      now,
    })

    expect(first.state).toBe('blocked')
    expect(first.blockedFromState).toBe('generating')
    expect(first.workUnits[0].outputRefs).toHaveLength(1)
    expect(learningCalls).toBe(1)
    expect(practiceCalls).toBe(1)

    const resumed = resumeJob(first, 'worker-failure-practice-fail', '2026-08-25T22:41:00+01:00')
    const completed = await runLearningAndPracticeFactory({
      job: resumed,
      artifactStore: store,
      workers: workers({
        generateLearningCollateral: async () => {
          learningCalls += 1
          return success('learning-rerun', learningOutput)
        },
        generatePracticeCollateral: async () => {
          practiceCalls += 1
          return success('practice-retry', practiceOutput)
        },
      }),
      now: '2026-08-25T22:42:00+01:00',
    })

    expect(completed.state).toBe('generating')
    expect(completed.workUnits[0].status).toBe('complete')
    expect(completed.workUnits[0].outputRefs).toHaveLength(2)
    expect(learningCalls).toBe(1)
    expect(practiceCalls).toBe(2)
  })

  it('is idempotent after all Learning Blueprint outputs have been persisted', async () => {
    const store = seedStore()
    let calls = 0
    const countingWorkers = workers({
      generateLearningCollateral: async () => {
        calls += 1
        return success('learning-run', learningOutput)
      },
      generatePracticeCollateral: async () => {
        calls += 1
        return success('practice-run', practiceOutput)
      },
    })

    const completed = await runLearningAndPracticeFactory({
      job: mappedJob(),
      artifactStore: store,
      workers: countingWorkers,
      now,
    })
    const runs = completed.workerRuns.length
    const writes = store.writes

    const rerun = await runLearningAndPracticeFactory({
      job: completed,
      artifactStore: store,
      workers: workers({
        generateLearningCollateral: async () => {
          calls += 1
          return success('learning-unexpected', learningOutput)
        },
        generatePracticeCollateral: async () => {
          calls += 1
          return success('practice-unexpected', practiceOutput)
        },
      }),
      now: '2026-08-25T22:43:00+01:00',
    })

    expect(calls).toBe(2)
    expect(rerun.workerRuns).toHaveLength(runs)
    expect(store.writes).toBe(writes)
    expect(rerun.workUnits[0].status).toBe('complete')
  })
})
