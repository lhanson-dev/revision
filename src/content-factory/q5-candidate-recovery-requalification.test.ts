import { describe, expect, it, vi } from 'vitest'
import {
  runAssessmentAndMarkingFactory,
  type AssessmentAndMarkingWorkers,
  type AssessmentArtifactKind,
  type AssessmentArtifactStore,
} from './assessment-and-marking'
import {
  cloneDurableWorkerDependencyPolicy,
  currentDurableWorkerDependencyPolicy,
  durableWorkerMethods,
  withDurableWorkerContractVersion,
  type DurableWorkerDependencyPolicy,
  type DurableWorkerMethod,
} from './durable-worker-dependencies'
import type { WorkerExecution } from './intake-to-knowledge-model'
import {
  DurableIssueCheckpointBlobStore,
  type LivePilotIssueCommentClient,
} from './live-pilot-durable-store'
import { DependencyAwareDurableWorkerExecutionCache } from './q5-durable-resume'
import { contentFactoryJobSchema, type ContentFactoryJob } from './schema'

const now = '2026-09-01T00:40:00+01:00'
const boardAlignmentRef = 'content-factory/q5-current/board-alignment.json'
const coverageMapRef = 'content-factory/q5-current/coverage-map.json'
const knowledgeModelRef = 'content-factory/q5-current/course-knowledge-model.json'
const learningBlueprintRef = 'content-factory/q5-current/learning-blueprint.json'
const learningRef = 'content-factory/q5-current/learning-collateral.json'
const practiceRef = 'content-factory/q5-current/practice-collateral.json'

function success<T>(id: string, output: T, usageCost = 0): WorkerExecution<T> {
  return {
    status: 'success',
    output,
    provenance: {
      id,
      contextId: `context-${id}`,
      contractVersion: 'q5-current',
      provider: 'controlled-q5-provider',
      model: 'q5-current-fixture',
      retryCount: 0,
      usageCost,
    },
  }
}

function recoverableFailure(id: string): WorkerExecution<never> {
  return {
    status: 'failure',
    error: 'provider_contract_failure: injected Q5 candidate rejection',
    provenance: {
      id,
      contextId: `context-${id}`,
      contractVersion: 'q5-current',
      provider: 'controlled-q5-provider',
      model: 'q5-current-fixture',
      retryCount: 0,
      usageCost: 0,
    },
  }
}

class MemoryArtifactStore implements AssessmentArtifactStore {
  readonly values = new Map<string, unknown>()

  seed(ref: string, value: unknown) {
    this.values.set(ref, value)
  }

  async writeJson(input: { jobId: string; kind: AssessmentArtifactKind; fingerprint: string; value: unknown }) {
    const ref = `content-factory/${input.jobId}/${input.kind}-${input.fingerprint.slice(0, 12)}.json`
    this.values.set(ref, input.value)
    return { ref }
  }

  async readJson(ref: string) {
    if (!this.values.has(ref)) throw new Error(`Missing artifact ${ref}`)
    return this.values.get(ref)
  }
}

const boardAlignment = {
  schemaVersion: 1 as const,
  jobId: 'q5-current',
  fingerprint: 'q5-board-alignment',
  courseIdentity: {
    subject: 'Synthetic Business',
    qualification: 'Synthetic qualification',
    awardingBody: 'Synthetic Board',
    specificationId: 'synthetic-001',
  },
  cohortValidity: { status: 'current' as const, notes: [] },
  components: [
    { id: 'paper-1', name: 'Paper 1', compulsory: true, marks: 80, durationMinutes: 90, weightingPercent: 50 },
    { id: 'paper-2', name: 'Paper 2', compulsory: true, marks: 80, durationMinutes: 90, weightingPercent: 50 },
  ],
  assessmentObjectives: [
    { id: 'ao1', name: 'Knowledge', weightingPercent: 40, sourceRefs: ['board-reference'] },
    { id: 'ao2', name: 'Analysis and evaluation', weightingPercent: 60, sourceRefs: ['board-reference'] },
  ],
  assessmentRequirements: [
    { id: 'extended-response', summary: 'Use context and developed reasoning.', componentScope: ['paper-1', 'paper-2'], sourceRefs: ['board-reference'] },
  ],
  sourceRefs: ['board-reference'],
  verificationStatus: 'verified' as const,
}

const coverageMap = {
  schemaVersion: 1 as const,
  jobId: 'q5-current',
  sourceSetFingerprint: 'q5-source-set',
  requirements: [
    {
      requirementId: 'market-share',
      officialReference: 'synthetic:market-share',
      requirementSummary: 'Understand and apply market share.',
      skillsOrKnowledge: ['market share', 'application', 'evaluation'],
      componentScope: ['paper-1', 'paper-2'],
      revisionArea: 'Marketing',
      learnRequired: true,
      practiceRequired: true,
      examPrepRequired: true,
      coverageStatus: 'planned' as const,
      contentRefs: [],
      sourceRefs: ['open-curriculum'],
    },
  ],
}

const knowledgeModel = {
  schemaVersion: 1 as const,
  jobId: 'q5-current',
  fingerprint: 'q5-knowledge-model',
  nodes: [
    {
      id: 'market-share',
      kind: 'concept' as const,
      summary: 'Market share compares one business with the market total.',
      prerequisiteIds: [],
      relatedIds: [],
      formulas: ['market share = business sales / market sales × 100'],
      misconceptions: ['Higher market share automatically means higher profit.'],
      applicationContexts: ['Competitive markets'],
      depth: 'core' as const,
      sourceRefs: ['open-curriculum'],
      boardAlignmentRefs: ['paper-1', 'paper-2'],
      evidenceTypes: ['application', 'evaluation'],
    },
  ],
}

const learningBlueprint = {
  schemaVersion: 1 as const,
  jobId: 'q5-current',
  knowledgeModelFingerprint: knowledgeModel.fingerprint,
  workUnits: [
    {
      id: 'market-share-learning',
      title: 'Market share',
      knowledgeNodeIds: ['market-share'],
      learningModes: ['explanation', 'application'],
      requiredOutputs: ['learning', 'practice'],
    },
  ],
}

const learningArtifact = {
  schemaVersion: 1 as const,
  artifactType: 'learning' as const,
  jobId: 'q5-current',
  workUnitId: 'market-share-learning',
  knowledgeModelFingerprint: knowledgeModel.fingerprint,
  knowledgeNodeIds: ['market-share'],
  sourceRefs: ['open-curriculum'],
  content: {
    title: 'Market share',
    introduction: 'Market share helps compare a business with its market.',
    sections: [{ id: 'meaning', title: 'Meaning', explanation: 'It is the proportion of market sales made by one business.', keyPoints: ['Use context', 'Evaluate trade-offs'] }],
    workedExamples: [],
    misconceptions: [],
    nextAction: 'Apply the idea.',
    coverageEvidence: [
      { teachingPoint: 'market share', evidence: 'It is the proportion of market sales made by one business.' },
      { teachingPoint: 'application', evidence: 'Use context.' },
      { teachingPoint: 'evaluation', evidence: 'Evaluate trade-offs.' },
    ],
  },
}

const practiceArtifact = {
  schemaVersion: 1 as const,
  artifactType: 'practice' as const,
  jobId: 'q5-current',
  workUnitId: 'market-share-learning',
  knowledgeModelFingerprint: knowledgeModel.fingerprint,
  knowledgeNodeIds: ['market-share'],
  sourceRefs: ['open-curriculum'],
  content: {
    title: 'Practice market share',
    instructions: 'Apply and evaluate.',
    activities: [{ id: 'apply', mode: 'application' as const, prompt: 'Why might market share matter?', expectedResponse: 'It can indicate competitive position.', explanation: 'Application uses the measure in context and evaluation weighs trade-offs.', improvementAction: 'Link the measure to a decision.' }],
    coverageEvidence: [
      { teachingPoint: 'market share', evidence: 'It can indicate competitive position.' },
      { teachingPoint: 'application', evidence: 'Application uses the measure in context.' },
      { teachingPoint: 'evaluation', evidence: 'Evaluation weighs trade-offs.' },
    ],
  },
}

function seedStore() {
  const store = new MemoryArtifactStore()
  store.seed(boardAlignmentRef, boardAlignment)
  store.seed(coverageMapRef, coverageMap)
  store.seed(knowledgeModelRef, knowledgeModel)
  store.seed(learningBlueprintRef, learningBlueprint)
  store.seed(learningRef, learningArtifact)
  store.seed(practiceRef, practiceArtifact)
  return store
}

function generatingJob(): ContentFactoryJob {
  return contentFactoryJobSchema.parse({
    schemaVersion: 2,
    jobId: 'q5-current',
    officialUrls: ['https://example.test/synthetic-course'],
    founderInstruction: 'Run the provider-free Q5 qualification fixture.',
    state: 'generating',
    courseIdentity: boardAlignment.courseIdentity,
    cohortValidity: boardAlignment.cohortValidity,
    components: boardAlignment.components,
    unresolvedChoices: [],
    sourceLicenceRegisterRef: 'content-factory/q5-current/source-licence-register.json',
    sourceRightsStatus: 'approved',
    sourceSetFingerprint: coverageMap.sourceSetFingerprint,
    boardAlignmentRef,
    coverageMapRef,
    coverageCompleteness: 'pending',
    courseKnowledgeModelRef: knowledgeModelRef,
    learningBlueprintRef,
    workUnits: [
      {
        id: 'market-share-learning',
        title: 'Market share',
        requirementIds: ['market-share'],
        componentIds: [],
        status: 'complete',
        outputRefs: [learningRef, practiceRef],
      },
    ],
    workerRuns: [],
    blockers: [],
    createdAt: now,
    updatedAt: now,
  })
}

function blueprint() {
  return {
    schemaVersion: 1 as const,
    jobId: 'q5-current',
    fingerprint: 'q5-assessment-blueprint',
    boardAlignmentFingerprint: boardAlignment.fingerprint,
    assessmentObjectives: [
      { id: 'ao1', weightingPercent: 40 },
      { id: 'ao2', weightingPercent: 60 },
    ],
    components: [
      { componentId: 'paper-1', questionFamilyIds: ['extended-evaluation'], markTotal: 80, timingMinutes: 90, constraints: ['Use original Revision-owned contexts'] },
      { componentId: 'paper-2', questionFamilyIds: ['extended-evaluation'], markTotal: 80, timingMinutes: 90, constraints: ['Use original Revision-owned contexts'] },
    ],
    quantitativeRequirements: [],
    synopticRequirements: [],
    commandDemands: [{ command: 'Evaluate', cognitiveDemand: 'Develop and weigh contextual arguments.', componentScope: ['paper-1', 'paper-2'] }],
    evidenceExpectations: ['Use contextual evidence and developed reasoning.'],
  }
}

const questionFamily = {
  schemaVersion: 1 as const,
  id: 'extended-evaluation',
  title: 'Contextual extended evaluation',
  assessmentObjectiveIds: ['ao1', 'ao2'],
  skillProfile: ['application', 'analysis', 'evaluation'],
  componentScope: ['paper-1', 'paper-2'],
  markRange: { min: 8, max: 12 },
  responseShape: 'Extended written response with contextual argument and judgement.',
  contextRequirements: ['A plausible Revision-owned context is required.'],
  applicationRequirements: ['Apply reasoning to the named context.'],
  analysisRequirements: ['Develop linked consequences.'],
  evaluationRequirements: ['Reach a supported judgement.'],
  commonFailureModes: ['Generic theory', 'Unsupported judgement'],
  markingPackTemplateVersion: '1',
  calibrationStatus: 'not_calibrated' as const,
}

function assessmentItem(componentId: string) {
  return {
    id: `market-share-${componentId}`,
    version: '1',
    title: `Market share decision — ${componentId}`,
    componentId,
    questionFamilyId: questionFamily.id,
    requirementIds: ['market-share'],
    knowledgeNodeIds: ['market-share'],
    format: 'case_question' as const,
    command: 'Evaluate',
    maxMark: 10,
    questionWording: `Evaluate whether increasing market share should be the main objective on ${componentId}.`,
    context: {
      id: `northstar-${componentId}`,
      title: 'Northstar Ltd',
      body: 'Northstar Ltd is considering a lower-price strategy in a competitive market.',
      dataPoints: [{ label: 'Current market share', value: '12', unit: '%' }],
    },
  }
}

const markingOutput = {
  assessmentObjectiveAllocation: [
    { objectiveId: 'ao1', marks: 4 },
    { objectiveId: 'ao2', marks: 6 },
  ],
  rubric: [
    { id: 'limited', descriptor: 'Some relevant knowledge but limited contextual development.', minMark: 0, maxMark: 3 },
    { id: 'developed', descriptor: 'Developed contextual reasoning with a supported judgement.', minMark: 4, maxMark: 10 },
  ],
  applicationRequirements: ['Use the named business context.'],
  analysisRequirements: ['Explain linked consequences.'],
  evaluationRequirements: ['Weigh trade-offs and reach a supported judgement.'],
  validReasoningRoutes: ['Market-share growth can strengthen competitive position but may reduce margin.'],
  indicativeContent: ['Possible benefits include stronger competitive position.'],
  misconceptions: ['Higher market share automatically guarantees higher profit.'],
  diagnosticFeedbackRules: ['Reward contextual developed reasoning.'],
  improvementActions: ['Add a counterargument and contextual judgement.'],
  ambiguityPolicy: 'Treat unusual but economically valid contextual reasoning as potentially creditworthy.',
  confidencePolicy: 'Do not force a precise mark when evidence does not support one.',
}

function memoryCommentClient() {
  let id = 0
  const comments = new Map<number, Array<{ id: number; body: string | null }>>()
  const client: LivePilotIssueCommentClient = {
    async listComments(issueNumber) {
      return [...(comments.get(issueNumber) ?? [])]
    },
    async createComment(issueNumber, body) {
      id += 1
      comments.set(issueNumber, [...(comments.get(issueNumber) ?? []), { id, body }])
      return { id }
    },
  }
  return { client }
}

function cachedSuccess(method: DurableWorkerMethod, suffix: string, usageCost = 0.01, retryCount = 0): WorkerExecution<unknown> {
  return {
    status: 'success',
    output: { method, suffix },
    provenance: {
      id: `${method}-${suffix}`,
      contextId: `${method}-context-${suffix}`,
      contractVersion: currentDurableWorkerDependencyPolicy[method].contractVersion,
      provider: 'controlled-q5-cache',
      model: 'q5-cache-v1',
      retryCount,
      usageCost,
    },
  }
}

async function executeMatrix(input: {
  cache: DependencyAwareDurableWorkerExecutionCache
  calls: Map<DurableWorkerMethod, number>
  suffix: string
}) {
  for (const method of durableWorkerMethods) {
    await input.cache.run(method, { jobId: 'q5-current', stableInput: method }, async () => {
      input.calls.set(method, (input.calls.get(method) ?? 0) + 1)
      return cachedSuccess(method, `${input.suffix}-${input.calls.get(method)}`)
    })
  }
}

async function policyTransitionScenario(fromPolicy: DurableWorkerDependencyPolicy, toPolicy: DurableWorkerDependencyPolicy) {
  const { client } = memoryCommentClient()
  const issueNumber = 901
  const calls = new Map<DurableWorkerMethod, number>()
  const firstBlobs = await DurableIssueCheckpointBlobStore.load(issueNumber, client)
  const firstCache = new DependencyAwareDurableWorkerExecutionCache(firstBlobs, '1'.repeat(40), fromPolicy)
  await executeMatrix({ cache: firstCache, calls, suffix: 'first' })

  const restartedBlobs = await DurableIssueCheckpointBlobStore.load(issueNumber, client)
  const restartedCache = new DependencyAwareDurableWorkerExecutionCache(restartedBlobs, '2'.repeat(40), toPolicy)
  await executeMatrix({ cache: restartedCache, calls, suffix: 'second' })
  return { calls, restartedCache }
}

function executedOnSecondPass(calls: Map<DurableWorkerMethod, number>) {
  return durableWorkerMethods.filter((method) => calls.get(method) === 2)
}

describe('post-Pilot #20 Q5 candidate-recovery requalification', () => {
  it('preserves an accepted sibling Marking Pack across another slot rejection and resumes only the rejected slot at candidate two', async () => {
    const store = seedStore()
    let checkpointed: ContentFactoryJob | undefined
    const firstMarkingCalls: Array<{ componentId: string; candidateNumber: number | undefined }> = []

    const firstWorkers: AssessmentAndMarkingWorkers = {
      compileAssessmentBlueprint: async () => success('q5-blueprint', blueprint()),
      generateQuestionFamilies: async () => success('q5-families', [questionFamily]),
      generateAssessmentItem: async (input) => success(`q5-item-${input.targetComponentId}`, assessmentItem(input.targetComponentId)),
      generateMarkingPack: async (input) => {
        firstMarkingCalls.push({ componentId: input.assessmentItem.componentId, candidateNumber: input.candidateNumber })
        if (input.assessmentItem.componentId === 'paper-2') return recoverableFailure('q5-pack-paper-2-candidate-1')
        return success('q5-pack-paper-1-candidate-1', markingOutput)
      },
    }

    await expect(runAssessmentAndMarkingFactory({
      job: generatingJob(),
      artifactStore: store,
      workers: firstWorkers,
      now,
      checkpointJob: async (job) => {
        const rejectedPaperTwo = job.workerRuns.find((run) => (
          run.stage === 'marking_pack'
          && run.status === 'failure'
          && run.inputRefs.includes('marking-pack-slot:market-share-paper-2')
        ))
        if (!rejectedPaperTwo) return
        checkpointed = job
        throw new Error('synthetic Q5 interruption after sibling Marking Pack rejection')
      },
    })).rejects.toThrow('synthetic Q5 interruption after sibling Marking Pack rejection')

    if (!checkpointed) throw new Error('Expected current Q5 durable checkpoint')
    const resumeFrom = checkpointed
    const acceptedPaperOne = resumeFrom.markingPackCoverage.find((coverage) => coverage.assessmentItemId === 'market-share-paper-1')
    expect(acceptedPaperOne).toBeTruthy()
    expect(firstMarkingCalls).toEqual([
      { componentId: 'paper-1', candidateNumber: 1 },
      { componentId: 'paper-2', candidateNumber: 1 },
    ])

    const resumedMarkingCalls: Array<{ componentId: string; candidateNumber: number | undefined }> = []
    const resumedWorkers: AssessmentAndMarkingWorkers = {
      compileAssessmentBlueprint: async () => { throw new Error('Assessment Blueprint must be reused') },
      generateQuestionFamilies: async () => { throw new Error('Question Families must be reused') },
      generateAssessmentItem: async () => { throw new Error('accepted Assessment Items must be reused') },
      generateMarkingPack: async (input) => {
        resumedMarkingCalls.push({ componentId: input.assessmentItem.componentId, candidateNumber: input.candidateNumber })
        expect(input.assessmentItem.componentId).toBe('paper-2')
        expect(input.candidateNumber).toBe(2)
        return success('q5-pack-paper-2-candidate-2', markingOutput)
      },
    }

    const result = await runAssessmentAndMarkingFactory({
      job: resumeFrom,
      artifactStore: store,
      workers: resumedWorkers,
      now: '2026-09-01T00:41:00+01:00',
    })

    expect(result.state).toBe('validating')
    expect(resumedMarkingCalls).toEqual([{ componentId: 'paper-2', candidateNumber: 2 }])
    expect(result.markingPackCoverage).toHaveLength(2)
    expect(result.markingPackCoverage.find((coverage) => coverage.assessmentItemId === 'market-share-paper-1')).toEqual(acceptedPaperOne)
    const paperTwoRuns = result.workerRuns.filter((run) => run.stage === 'marking_pack' && run.inputRefs.includes('marking-pack-slot:market-share-paper-2'))
    expect(paperTwoRuns.map((run) => run.status)).toEqual(['failure', 'success'])
  })

  it('reuses exact terminal Assessment and Marking candidate cache entries across a head-only restart without a second provider execution', async () => {
    const { client } = memoryCommentClient()
    const issueNumber = 902
    const firstBlobs = await DurableIssueCheckpointBlobStore.load(issueNumber, client)
    const firstCache = new DependencyAwareDurableWorkerExecutionCache(firstBlobs, '3'.repeat(40))

    const assessmentInput = {
      jobId: 'q5-current',
      slotRef: 'assessment-slot:extended-evaluation:paper-1',
      candidateNumber: 2,
      maxCandidates: 2,
    }
    const markingInput = {
      jobId: 'q5-current',
      slotRef: 'marking-pack-slot:market-share-paper-1',
      assessmentItemRef: 'content-factory/q5-current/assessment-item-paper-1.json',
      candidateNumber: 2,
      maxCandidates: 2,
    }

    const assessmentExecute = vi.fn(async () => cachedSuccess('generateAssessmentItem', 'candidate-2', 0.17, 1))
    const markingExecute = vi.fn(async () => cachedSuccess('generateMarkingPack', 'candidate-2', 0.09, 0))
    const assessmentFirst = await firstCache.run('generateAssessmentItem', assessmentInput, assessmentExecute)
    const markingFirst = await firstCache.run('generateMarkingPack', markingInput, markingExecute)
    expect(assessmentExecute).toHaveBeenCalledTimes(1)
    expect(markingExecute).toHaveBeenCalledTimes(1)

    const restartedBlobs = await DurableIssueCheckpointBlobStore.load(issueNumber, client)
    const restartedCache = new DependencyAwareDurableWorkerExecutionCache(restartedBlobs, '4'.repeat(40))
    const shouldNotRunAssessment = vi.fn(async () => cachedSuccess('generateAssessmentItem', 'unexpected', 9.99, 9))
    const shouldNotRunMarking = vi.fn(async () => cachedSuccess('generateMarkingPack', 'unexpected', 9.99, 9))

    const assessmentReused = await restartedCache.run('generateAssessmentItem', assessmentInput, shouldNotRunAssessment)
    const markingReused = await restartedCache.run('generateMarkingPack', markingInput, shouldNotRunMarking)

    expect(shouldNotRunAssessment).not.toHaveBeenCalled()
    expect(shouldNotRunMarking).not.toHaveBeenCalled()
    expect(assessmentReused).toEqual(assessmentFirst)
    expect(markingReused).toEqual(markingFirst)
    expect(assessmentReused.provenance.usageCost).toBe(0.17)
    expect(assessmentReused.provenance.retryCount).toBe(1)
    expect(markingReused.provenance.usageCost).toBe(0.09)
    expect(restartedCache.reusedAcrossHeadCount).toBe(2)
  })

  it('does not infer pre-candidate Assessment or Marking semantics reusable across a changed-head replay while preserving unrelated Learn and Practice', async () => {
    const legacyPolicy = cloneDurableWorkerDependencyPolicy()
    legacyPolicy.generateAssessmentItem.contractVersion = '2+output-integrity-v5'
    legacyPolicy.generateMarkingPack.contractVersion = '2+output-integrity-v2'

    const { calls } = await policyTransitionScenario(legacyPolicy, cloneDurableWorkerDependencyPolicy())
    expect(executedOnSecondPass(calls).sort()).toEqual([
      'generateAssessmentItem',
      'generateMarkingPack',
      'independentReview',
      'remediate',
    ].sort())
    expect(calls.get('generateLearningCollateral')).toBe(1)
    expect(calls.get('generatePracticeCollateral')).toBe(1)
    expect(calls.get('compileAssessmentBlueprint')).toBe(1)
    expect(calls.get('generateQuestionFamilies')).toBe(1)
  })

  it('invalidates current Assessment semantics through Marking and review without invalidating unrelated Learn or Practice', async () => {
    const changed = withDurableWorkerContractVersion(
      currentDurableWorkerDependencyPolicy,
      'generateAssessmentItem',
      'q5-current-assessment-semantic-change',
    )
    const { calls } = await policyTransitionScenario(cloneDurableWorkerDependencyPolicy(), changed)

    expect(executedOnSecondPass(calls).sort()).toEqual([
      'generateAssessmentItem',
      'generateMarkingPack',
      'independentReview',
      'remediate',
    ].sort())
    expect(calls.get('generateLearningCollateral')).toBe(1)
    expect(calls.get('generatePracticeCollateral')).toBe(1)
  })

  it('invalidates current Marking semantics through review while retaining accepted Assessment, Learn and Practice', async () => {
    const changed = withDurableWorkerContractVersion(
      currentDurableWorkerDependencyPolicy,
      'generateMarkingPack',
      'q5-current-marking-semantic-change',
    )
    const { calls } = await policyTransitionScenario(cloneDurableWorkerDependencyPolicy(), changed)

    expect(executedOnSecondPass(calls).sort()).toEqual([
      'generateMarkingPack',
      'independentReview',
      'remediate',
    ].sort())
    expect(calls.get('generateAssessmentItem')).toBe(1)
    expect(calls.get('generateLearningCollateral')).toBe(1)
    expect(calls.get('generatePracticeCollateral')).toBe(1)
  })
})
