import { describe, expect, it } from 'vitest'
import { resumeJob } from './orchestrator'
import { contentFactoryJobSchema, type ContentFactoryJob } from './schema'
import {
  assessmentItemArtifactSchema,
  courseContentPackManifestSchema,
  executableMarkingPackSchema,
  runAssessmentAndMarkingFactory,
  type AssessmentAndMarkingWorkers,
  type AssessmentArtifactKind,
  type AssessmentArtifactStore,
} from './assessment-and-marking'
import type { WorkerExecution } from './intake-to-knowledge-model'

const now = '2026-08-25T23:10:00+01:00'
const boardAlignmentRef = 'content-factory/cf-business/board-alignment.json'
const coverageMapRef = 'content-factory/cf-business/coverage-map.json'
const knowledgeModelRef = 'content-factory/cf-business/course-knowledge-model.json'
const learningBlueprintRef = 'content-factory/cf-business/learning-blueprint.json'
const learningRef = 'content-factory/cf-business/learning-collateral.json'
const practiceRef = 'content-factory/cf-business/practice-collateral.json'

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

function failure(id: string, error: string): WorkerExecution<never> {
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

class MemoryArtifactStore implements AssessmentArtifactStore {
  readonly values = new Map<string, unknown>()
  writes = 0

  seed(ref: string, value: unknown) {
    this.values.set(ref, value)
  }

  async writeJson(input: { jobId: string; kind: AssessmentArtifactKind; fingerprint: string; value: unknown }) {
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

const boardAlignment = {
  schemaVersion: 1 as const,
  jobId: 'cf-business',
  fingerprint: 'board-alignment-v1',
  courseIdentity: {
    subject: 'Business',
    qualification: 'Example AS Business',
    awardingBody: 'Example Board',
    specificationId: 'business-101',
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
    { id: 'extended-response', summary: 'Extended responses should use context and developed reasoning.', componentScope: ['paper-1', 'paper-2'], sourceRefs: ['board-reference'] },
  ],
  sourceRefs: ['board-reference'],
  verificationStatus: 'verified' as const,
}

const coverageMap = {
  schemaVersion: 1 as const,
  jobId: 'cf-business',
  sourceSetFingerprint: 'source-set-v1',
  requirements: [
    {
      requirementId: 'market-share',
      officialReference: 'open-curriculum:market-share',
      requirementSummary: 'Understand and apply market share in business decisions.',
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
  jobId: 'cf-business',
  fingerprint: 'knowledge-model-v1',
  nodes: [
    {
      id: 'market-share',
      kind: 'concept' as const,
      summary: 'Market share measures a business sales as a proportion of total market sales.',
      prerequisiteIds: [],
      relatedIds: [],
      formulas: ['market share = business sales / market sales × 100'],
      misconceptions: ['A larger market share always means higher profit.'],
      applicationContexts: ['Competitive markets', 'Growth decisions'],
      depth: 'core' as const,
      sourceRefs: ['open-curriculum'],
      boardAlignmentRefs: ['paper-1', 'paper-2'],
      evidenceTypes: ['calculation', 'application', 'evaluation'],
    },
  ],
}

const learningBlueprint = {
  schemaVersion: 1 as const,
  jobId: 'cf-business',
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
  jobId: 'cf-business',
  workUnitId: 'market-share-learning',
  knowledgeModelFingerprint: knowledgeModel.fingerprint,
  knowledgeNodeIds: ['market-share'],
  sourceRefs: ['open-curriculum'],
  content: {
    title: 'Market share',
    introduction: 'Market share helps compare a business with its market.',
    sections: [{ id: 'meaning', title: 'What it means', explanation: 'It is the proportion of market sales made by one business.', keyPoints: ['It is a percentage'] }],
    workedExamples: [],
    misconceptions: [],
    nextAction: 'Apply the idea to a business decision.',
  },
}

const practiceArtifact = {
  schemaVersion: 1 as const,
  artifactType: 'practice' as const,
  jobId: 'cf-business',
  workUnitId: 'market-share-learning',
  knowledgeModelFingerprint: knowledgeModel.fingerprint,
  knowledgeNodeIds: ['market-share'],
  sourceRefs: ['open-curriculum'],
  content: {
    title: 'Practice market share',
    instructions: 'Apply the idea.',
    activities: [{ id: 'apply', mode: 'application' as const, prompt: 'Why might market share matter?', expectedResponse: 'It can indicate competitive position.', explanation: 'It compares sales with the total market.', improvementAction: 'Link the measure to a business decision.' }],
  },
}

function generatingJob(): ContentFactoryJob {
  return contentFactoryJobSchema.parse({
    schemaVersion: 2,
    jobId: 'cf-business',
    officialUrls: ['https://board.example/business/business-101'],
    founderInstruction: 'Add this course to Revision',
    state: 'generating',
    courseIdentity: boardAlignment.courseIdentity,
    cohortValidity: boardAlignment.cohortValidity,
    components: boardAlignment.components,
    unresolvedChoices: [],
    sourceLicenceRegisterRef: 'content-factory/cf-business/source-licence-register.json',
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

function blueprint() {
  return {
    schemaVersion: 1 as const,
    jobId: 'cf-business',
    fingerprint: 'assessment-blueprint-v1',
    boardAlignmentFingerprint: boardAlignment.fingerprint,
    assessmentObjectives: [
      { id: 'ao1', weightingPercent: 40 },
      { id: 'ao2', weightingPercent: 60 },
    ],
    components: [
      { componentId: 'paper-1', questionFamilyIds: ['extended-evaluation'], markTotal: 80, timingMinutes: 90, constraints: ['Use original Revision-owned contexts'] },
      { componentId: 'paper-2', questionFamilyIds: ['extended-evaluation'], markTotal: 80, timingMinutes: 90, constraints: ['Use original Revision-owned contexts'] },
    ],
    quantitativeRequirements: ['Use valid calculations where appropriate'],
    synopticRequirements: [],
    commandDemands: [{ command: 'Evaluate', cognitiveDemand: 'Develop and weigh contextual arguments before a supported judgement.', componentScope: ['paper-1', 'paper-2'] }],
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
  contextRequirements: ['A plausible Revision-owned business context is required.'],
  applicationRequirements: ['Apply reasoning to the named business context.'],
  analysisRequirements: ['Develop linked consequences rather than assert effects.'],
  evaluationRequirements: ['Reach a supported judgement that recognises conditions or trade-offs.'],
  commonFailureModes: ['Generic theory without context', 'Unsupported judgement'],
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
    questionWording: `Evaluate whether increasing market share should be the main objective for Northstar Ltd on ${componentId}.`,
    context: {
      id: `northstar-${componentId}`,
      title: 'Northstar Ltd',
      body: 'Northstar Ltd is considering a lower-price strategy to increase sales volume in a competitive market.',
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
  applicationRequirements: ['Use Northstar Ltd and its competitive situation.'],
  analysisRequirements: ['Explain how increasing market share could affect sales, costs, pricing or competitive position.'],
  evaluationRequirements: ['Weigh benefits against profitability or strategic trade-offs and reach a supported judgement.'],
  validReasoningRoutes: [
    'Market-share growth can strengthen competitive position but may reduce margin if achieved through lower prices.',
    'A profit or cash objective may be more important if the strategy creates unsustainable cost or margin pressure.',
  ],
  indicativeContent: ['Possible benefits include scale or stronger competitive position.', 'Possible drawbacks include lower margins or costly promotion.'],
  misconceptions: ['Higher market share automatically guarantees higher profit.'],
  diagnosticFeedbackRules: ['Reward contextual developed reasoning, not the presence of a memorised phrase.'],
  improvementActions: ['Add a counterargument and make the final judgement depend on the business context.'],
  ambiguityPolicy: 'Treat unusual but economically valid contextual reasoning as potentially creditworthy rather than excluding it because it is not listed in indicative content.',
  confidencePolicy: 'Do not force a precise mark when the response sits materially between rubric boundaries; use the governed confidence behaviour.',
}

function createWorkers(overrides: Partial<AssessmentAndMarkingWorkers> = {}) {
  let itemCalls = 0
  let markingCalls = 0
  const workers: AssessmentAndMarkingWorkers = {
    compileAssessmentBlueprint: async () => success('assessment-blueprint-run', blueprint()),
    generateQuestionFamilies: async () => success('question-family-run', [questionFamily]),
    generateAssessmentItem: async (input) => {
      itemCalls += 1
      return success(`assessment-item-run-${itemCalls}`, assessmentItem(input.targetComponentId))
    },
    generateMarkingPack: async () => {
      markingCalls += 1
      return success(`marking-pack-run-${markingCalls}`, markingOutput)
    },
    ...overrides,
  }
  return { workers, counts: { get itemCalls() { return itemCalls }, get markingCalls() { return markingCalls } } }
}

describe('Content Factory assessment and Marking Pack factory', () => {
  it('builds a reusable Question Family, component-specific original assessment items and Marking Packs, then enters validating', async () => {
    const store = seedStore()
    let blueprintInput: Parameters<AssessmentAndMarkingWorkers['compileAssessmentBlueprint']>[0] | undefined
    let markingInput: Parameters<AssessmentAndMarkingWorkers['generateMarkingPack']>[0] | undefined
    const { workers, counts } = createWorkers({
      compileAssessmentBlueprint: async (input) => {
        blueprintInput = input
        return success('assessment-blueprint-run', blueprint())
      },
      generateMarkingPack: async (input) => {
        markingInput = input
        return success(`marking-pack-run-${input.assessmentItem.componentId}`, markingOutput)
      },
    })

    const result = await runAssessmentAndMarkingFactory({ job: generatingJob(), artifactStore: store, workers, now })

    expect(result.state).toBe('validating')
    expect(result.assessmentBlueprintRef).toBeTruthy()
    expect(result.questionFamilyRefs).toHaveLength(1)
    expect(result.markableAssessmentItemIds).toEqual(['market-share-paper-1', 'market-share-paper-2'])
    expect(result.markingPackCoverage).toHaveLength(2)
    expect(result.contentPackRefs).toHaveLength(1)
    expect(counts.itemCalls).toBe(2)

    expect(JSON.stringify(blueprintInput)).not.toContain('sourceRefs')
    expect(JSON.stringify(blueprintInput)).not.toContain('https://')
    expect(JSON.stringify(markingInput)).not.toContain('sourceRefs')
    expect(JSON.stringify(markingInput)).not.toContain('board-reference')

    const itemRefs = result.workerRuns.filter((run) => run.stage === 'generation').flatMap((run) => run.outputRefs)
    expect(itemRefs).toHaveLength(2)
    for (const ref of itemRefs) {
      const item = assessmentItemArtifactSchema.parse(await store.readJson(ref))
      expect(item.origin).toBe('revision_owned')
      expect(item.presentationLabel).toBe('Revision-authored exam-style practice')
      expect(item.sourceRefs).toEqual(['board-reference', 'open-curriculum'])
    }

    for (const coverage of result.markingPackCoverage) {
      const pack = executableMarkingPackSchema.parse(await store.readJson(coverage.markingPackRef))
      expect(pack.questionId).toBe(coverage.assessmentItemId)
      expect(pack.indicativeContentPolicy).toBe('non_exhaustive')
      expect(pack.questionOrigin).toBe('revision_owned')
      expect(pack.calibrationStatus).toBe('not_calibrated')
      expect(pack.anchors).toEqual([])
    }

    const manifest = courseContentPackManifestSchema.parse(await store.readJson(result.contentPackRefs[0]))
    expect(manifest.publicationStatus).toBe('factory_generated_unassured')
    expect(manifest.assessmentItemRefs).toHaveLength(2)
    expect(manifest.markingPackRefs).toHaveLength(2)
  })

  it('rejects an assessment item whose mark allocation is outside its Question Family contract', async () => {
    const store = seedStore()
    const { workers } = createWorkers({
      generateAssessmentItem: async (input) => success(`bad-item-${input.targetComponentId}`, { ...assessmentItem(input.targetComponentId), maxMark: 20 }),
    })

    await expect(runAssessmentAndMarkingFactory({ job: generatingJob(), artifactStore: store, workers, now }))
      .rejects.toThrow('mark allocation is outside Question Family')
  })

  it('rejects a Marking Pack whose AO allocation does not total the exact question mark', async () => {
    const store = seedStore()
    const { workers } = createWorkers({
      generateMarkingPack: async (input) => success(`bad-pack-${input.assessmentItem.componentId}`, {
        ...markingOutput,
        assessmentObjectiveAllocation: [
          { objectiveId: 'ao1', marks: 3 },
          { objectiveId: 'ao2', marks: 3 },
        ],
      }),
    })

    await expect(runAssessmentAndMarkingFactory({ job: generatingJob(), artifactStore: store, workers, now }))
      .rejects.toThrow('must total 10 marks')
  })

  it('resumes after a Marking Pack worker failure without regenerating successful assessment items', async () => {
    const store = seedStore()
    let itemCalls = 0
    let markingCalls = 0
    const firstWorkers: AssessmentAndMarkingWorkers = {
      compileAssessmentBlueprint: async () => success('assessment-blueprint-run', blueprint()),
      generateQuestionFamilies: async () => success('question-family-run', [questionFamily]),
      generateAssessmentItem: async (input) => {
        itemCalls += 1
        return success(`assessment-item-run-${itemCalls}`, assessmentItem(input.targetComponentId))
      },
      generateMarkingPack: async () => {
        markingCalls += 1
        return failure(`marking-pack-failure-${markingCalls}`, 'provider unavailable')
      },
    }

    const blocked = await runAssessmentAndMarkingFactory({ job: generatingJob(), artifactStore: store, workers: firstWorkers, now })
    expect(blocked.state).toBe('blocked')
    expect(itemCalls).toBe(2)
    const blockerId = blocked.blockers.find((blocker) => !blocker.resolvedAt)!.id
    const resumed = resumeJob(blocked, blockerId, '2026-08-25T23:11:00+01:00')

    const resumedWorkers: AssessmentAndMarkingWorkers = {
      compileAssessmentBlueprint: async () => { throw new Error('blueprint should be reused') },
      generateQuestionFamilies: async () => { throw new Error('Question Family should be reused') },
      generateAssessmentItem: async () => {
        itemCalls += 1
        throw new Error('assessment item should be reused')
      },
      generateMarkingPack: async (_input) => {
        markingCalls += 1
        return success(`marking-pack-resume-${markingCalls}`, markingOutput)
      },
    }

    const result = await runAssessmentAndMarkingFactory({ job: resumed, artifactStore: store, workers: resumedWorkers, now: '2026-08-25T23:11:00+01:00' })
    expect(result.state).toBe('validating')
    expect(itemCalls).toBe(2)
    expect(result.markingPackCoverage).toHaveLength(2)
  })

  it('is idempotent after the assessment stage has entered validating', async () => {
    const store = seedStore()
    const { workers } = createWorkers()
    const completed = await runAssessmentAndMarkingFactory({ job: generatingJob(), artifactStore: store, workers, now })
    const writesAfterFirstRun = store.writes

    const neverRun: AssessmentAndMarkingWorkers = {
      compileAssessmentBlueprint: async () => { throw new Error('must not rerun') },
      generateQuestionFamilies: async () => { throw new Error('must not rerun') },
      generateAssessmentItem: async () => { throw new Error('must not rerun') },
      generateMarkingPack: async () => { throw new Error('must not rerun') },
    }
    const repeated = await runAssessmentAndMarkingFactory({ job: completed, artifactStore: store, workers: neverRun, now })

    expect(repeated).toEqual(completed)
    expect(store.writes).toBe(writesAfterFirstRun)
  })
})
