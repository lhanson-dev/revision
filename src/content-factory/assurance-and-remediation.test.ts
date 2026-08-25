import { describe, expect, it } from 'vitest'
import { contentFactoryJobSchema, type ContentFactoryJob } from './schema'
import {
  runAssuranceAndRemediationFactory,
  type AssuranceAndRemediationWorkers,
  type AssuranceArtifactKind,
  type AssuranceArtifactStore,
  type RemediationVersionPersister,
} from './assurance-and-remediation'
import type { WorkerExecution } from './intake-to-knowledge-model'

const now = '2026-08-25T23:45:00+01:00'
const initialHead = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const correctedHead = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
const sourceLicenceRegisterRef = 'content-factory/cf-business/source-licence-register.json'
const boardAlignmentRef = 'content-factory/cf-business/board-alignment.json'
const coverageMapRef = 'content-factory/cf-business/coverage-map.json'
const knowledgeModelRef = 'content-factory/cf-business/course-knowledge-model.json'
const learningBlueprintRef = 'content-factory/cf-business/learning-blueprint.json'
const learningRef = 'content-factory/cf-business/learning.json'
const practiceRef = 'content-factory/cf-business/practice.json'
const assessmentBlueprintRef = 'content-factory/cf-business/assessment-blueprint.json'
const familyRef = 'content-factory/cf-business/question-family.json'
const itemRef = 'content-factory/cf-business/assessment-item.json'
const markingPackRef = 'content-factory/cf-business/marking-pack.json'
const manifestRef = 'content-factory/cf-business/course-content-pack.json'

class MemoryArtifactStore implements AssuranceArtifactStore {
  readonly values = new Map<string, unknown>()
  writes = 0

  seed(ref: string, value: unknown) {
    this.values.set(ref, value)
  }

  async writeJson(input: { jobId: string; kind: AssuranceArtifactKind; fingerprint: string; value: unknown }) {
    this.writes += 1
    const ref = `content-factory/${input.jobId}/${input.kind}-${this.writes}-${input.fingerprint.slice(0, 10)}.json`
    this.values.set(ref, input.value)
    return { ref }
  }

  async readJson(ref: string) {
    if (!this.values.has(ref)) throw new Error(`Missing artifact ${ref}`)
    return this.values.get(ref)
  }
}

function success<T>(id: string, contextId: string, output: T): WorkerExecution<T> {
  return {
    status: 'success',
    output,
    provenance: {
      id,
      contextId,
      contractVersion: '1',
      provider: 'test-provider',
      model: 'test-model',
    },
  }
}

const sourceLicenceRegister = {
  schemaVersion: 2 as const,
  jobId: 'cf-business',
  fingerprint: 'source-rights-v1',
  checkedAt: now,
  sources: [{
    id: 'open-curriculum',
    issuer: 'Example Open Curriculum',
    urlOrReference: 'https://example.org/business',
    sourceType: 'subject_content' as const,
    educationalRole: ['subject truth'],
    versionOrDate: '2026',
    useClass: 'OPEN' as const,
    permissionBasis: 'Open licence permits reuse and transformation.',
    aiInputPermitted: true,
    derivedCommercialUsePermitted: true,
    attributionRequirements: [],
    restrictions: [],
    checkedAt: now,
    checkerMethod: 'approved policy rule',
    sourceFingerprint: 'open-curriculum-v1',
    revalidationConditions: [],
  }],
}

const courseIdentity = {
  subject: 'Business',
  qualification: 'Example AS Business',
  awardingBody: 'Example Board',
  specificationId: 'business-101',
}

const boardAlignment = {
  schemaVersion: 1 as const,
  jobId: 'cf-business',
  fingerprint: 'board-v1',
  courseIdentity,
  cohortValidity: { status: 'current' as const, notes: [] },
  components: [{ id: 'paper-1', name: 'Paper 1', compulsory: true, marks: 80, durationMinutes: 90, weightingPercent: 100 }],
  assessmentObjectives: [{ id: 'ao1', name: 'Knowledge and application', weightingPercent: 100, sourceRefs: ['open-curriculum'] }],
  assessmentRequirements: [{ id: 'extended', summary: 'Apply business knowledge to context.', componentScope: ['paper-1'], sourceRefs: ['open-curriculum'] }],
  sourceRefs: ['open-curriculum'],
  verificationStatus: 'verified' as const,
}

const coverageMap = {
  schemaVersion: 1 as const,
  jobId: 'cf-business',
  sourceSetFingerprint: 'source-set-v1',
  requirements: [{
    requirementId: 'market-share',
    officialReference: 'open:market-share',
    requirementSummary: 'Understand and apply market share.',
    skillsOrKnowledge: ['market share', 'application'],
    componentScope: ['paper-1'],
    revisionArea: 'Marketing',
    learnRequired: true,
    practiceRequired: true,
    examPrepRequired: true,
    coverageStatus: 'planned' as const,
    contentRefs: [],
    sourceRefs: ['open-curriculum'],
  }],
}

const knowledgeModel = {
  schemaVersion: 1 as const,
  jobId: 'cf-business',
  fingerprint: 'knowledge-v1',
  nodes: [{
    id: 'market-share',
    kind: 'concept' as const,
    summary: 'Market share is a business sales as a proportion of total market sales.',
    prerequisiteIds: [],
    relatedIds: [],
    formulas: ['market share = business sales / total market sales × 100'],
    misconceptions: ['A high market share guarantees profit.'],
    applicationContexts: ['competitive markets'],
    depth: 'core' as const,
    sourceRefs: ['open-curriculum'],
    boardAlignmentRefs: ['paper-1'],
    evidenceTypes: ['application', 'written response'],
  }],
}

const learningBlueprint = {
  schemaVersion: 1 as const,
  jobId: 'cf-business',
  knowledgeModelFingerprint: knowledgeModel.fingerprint,
  workUnits: [{
    id: 'market-share-learning',
    title: 'Market share',
    knowledgeNodeIds: ['market-share'],
    learningModes: ['explanation', 'application'] as const,
    requiredOutputs: ['learning', 'practice'],
  }],
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
    introduction: 'Market share helps compare a business with the total market.',
    sections: [{ id: 'meaning', title: 'Meaning', explanation: 'It shows the proportion of market sales made by one business.', keyPoints: ['Expressed as a percentage.'] }],
    workedExamples: [],
    misconceptions: [],
    nextAction: 'Apply market share to a business decision.',
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
    instructions: 'Apply the concept.',
    activities: [{ id: 'apply', mode: 'application' as const, prompt: 'Why might market share matter?', expectedResponse: 'It can indicate competitive position.', explanation: 'The measure compares business sales with the total market.', improvementAction: 'Link the measure to a decision.' }],
  },
}

const assessmentBlueprint = {
  schemaVersion: 1 as const,
  jobId: 'cf-business',
  fingerprint: 'assessment-v1',
  boardAlignmentFingerprint: boardAlignment.fingerprint,
  assessmentObjectives: [{ id: 'ao1', weightingPercent: 100 }],
  components: [{ componentId: 'paper-1', questionFamilyIds: ['application-4'], markTotal: 80, timingMinutes: 90, constraints: [] }],
  quantitativeRequirements: [],
  synopticRequirements: [],
  commandDemands: [{ command: 'Explain', cognitiveDemand: 'application', componentScope: ['paper-1'] }],
  evidenceExpectations: ['Use the scenario.'],
}

const questionFamily = {
  schemaVersion: 1 as const,
  id: 'application-4',
  title: 'Four-mark application',
  assessmentObjectiveIds: ['ao1'],
  skillProfile: ['application'],
  componentScope: ['paper-1'],
  markRange: { min: 4, max: 4 },
  responseShape: 'One developed contextual explanation.',
  contextRequirements: [],
  applicationRequirements: ['Use relevant business context.'],
  analysisRequirements: [],
  evaluationRequirements: [],
  commonFailureModes: ['Generic response.'],
  markingPackTemplateVersion: '1',
  calibrationStatus: 'not_calibrated' as const,
}

const assessmentItem = {
  schemaVersion: 1 as const,
  artifactType: 'assessment_item' as const,
  jobId: 'cf-business',
  id: 'item-market-share',
  version: '1',
  title: 'Market share application',
  componentId: 'paper-1',
  questionFamilyId: 'application-4',
  requirementIds: ['market-share'],
  knowledgeNodeIds: ['market-share'],
  format: 'written_question' as const,
  command: 'Explain',
  maxMark: 4,
  questionWording: 'Explain one reason why market share could matter to a business.',
  origin: 'revision_owned' as const,
  presentationLabel: 'Revision-authored exam-style practice' as const,
  assessmentBlueprintFingerprint: assessmentBlueprint.fingerprint,
  knowledgeModelFingerprint: knowledgeModel.fingerprint,
  sourceRefs: ['open-curriculum'],
}

const markingPack = {
  schemaVersion: 1 as const,
  id: 'marking-pack-item-market-share',
  questionId: assessmentItem.id,
  questionVersion: assessmentItem.version,
  exactQuestionWording: assessmentItem.questionWording,
  maxMark: 4,
  conceptIds: ['market-share'],
  assessmentObjectiveAllocation: [{ objectiveId: 'ao1', marks: 4 }],
  rubric: [{ id: 'rubric-1', descriptor: 'Credit relevant contextual application.', minMark: 0, maxMark: 4 }],
  applicationRequirements: ['Use relevant business context.'],
  analysisRequirements: [],
  evaluationRequirements: [],
  validReasoningRoutes: ['Competitive position can affect strategic choices.'],
  indicativeContent: ['A business with a stronger share may have greater market influence.'],
  misconceptions: ['Market share automatically equals profitability.'],
  anchors: [],
  diagnosticFeedbackRules: ['Explain whether the answer uses the context.'],
  improvementActions: ['Connect the measure to a business consequence.'],
  ambiguityPolicy: 'Use a mark range if the response is genuinely ambiguous.',
  confidencePolicy: 'Do not state false precision when evidence is borderline.',
  questionFamilyId: questionFamily.id,
  assessmentBlueprintFingerprint: assessmentBlueprint.fingerprint,
  sourceRefs: assessmentItem.sourceRefs,
  calibrationStatus: 'not_calibrated' as const,
  questionOrigin: 'revision_owned' as const,
  indicativeContentPolicy: 'non_exhaustive' as const,
}

const manifest = {
  schemaVersion: 1 as const,
  artifactType: 'course_content_pack_manifest' as const,
  jobId: 'cf-business',
  publicationStatus: 'factory_generated_unassured' as const,
  courseIdentity,
  boardAlignmentFingerprint: boardAlignment.fingerprint,
  knowledgeModelFingerprint: knowledgeModel.fingerprint,
  learningBlueprintRef,
  learningArtifactRefs: [learningRef],
  practiceArtifactRefs: [practiceRef],
  assessmentBlueprintRef,
  questionFamilyRefs: [familyRef],
  assessmentItemRefs: [itemRef],
  markingPackRefs: [markingPackRef],
  markableAssessmentItemIds: [assessmentItem.id],
}

function seedStore(markingPackOverride: unknown = markingPack) {
  const store = new MemoryArtifactStore()
  store.seed(sourceLicenceRegisterRef, sourceLicenceRegister)
  store.seed(boardAlignmentRef, boardAlignment)
  store.seed(coverageMapRef, coverageMap)
  store.seed(knowledgeModelRef, knowledgeModel)
  store.seed(learningBlueprintRef, learningBlueprint)
  store.seed(learningRef, learningArtifact)
  store.seed(practiceRef, practiceArtifact)
  store.seed(assessmentBlueprintRef, assessmentBlueprint)
  store.seed(familyRef, questionFamily)
  store.seed(itemRef, assessmentItem)
  store.seed(markingPackRef, markingPackOverride)
  store.seed(manifestRef, manifest)
  return store
}

function validatingJob(extraWorkerRuns: ContentFactoryJob['workerRuns'] = []): ContentFactoryJob {
  return contentFactoryJobSchema.parse({
    schemaVersion: 2,
    jobId: 'cf-business',
    officialUrls: ['https://board.example/business'],
    founderInstruction: 'Add this course',
    state: 'validating',
    courseIdentity,
    cohortValidity: boardAlignment.cohortValidity,
    components: boardAlignment.components,
    unresolvedChoices: [],
    sourceLicenceRegisterRef,
    sourceRightsStatus: 'approved',
    sourceSetFingerprint: coverageMap.sourceSetFingerprint,
    coverageMapRef,
    coverageCompleteness: 'pending',
    boardAlignmentRef,
    courseKnowledgeModelRef: knowledgeModelRef,
    learningBlueprintRef,
    assessmentBlueprintRef,
    questionFamilyRefs: [familyRef],
    markableAssessmentItemIds: [assessmentItem.id],
    markingPackCoverage: [{ assessmentItemId: assessmentItem.id, markingPackRef }],
    artifactCompatibilityStatus: 'pending',
    contentPackRefs: [manifestRef],
    workUnits: [{ id: 'market-share-learning', title: 'Market share', requirementIds: ['market-share'], componentIds: [], status: 'complete', outputRefs: [learningRef, practiceRef] }],
    workerRuns: [{ id: 'generation-1', stage: 'generation', contextId: 'generation-context', contractVersion: '1', status: 'success', inputRefs: [], outputRefs: [learningRef, practiceRef], retryCount: 0 }, ...extraWorkerRuns],
    blockers: [],
    createdAt: now,
    updatedAt: now,
  })
}

class PassWorkers implements AssuranceAndRemediationWorkers {
  reviewCalls = 0
  remediationCalls = 0

  async independentReview(input: Parameters<AssuranceAndRemediationWorkers['independentReview']>[0]) {
    this.reviewCalls += 1
    return success(`review-${this.reviewCalls}`, `review-context-${this.reviewCalls}`, {
      reviewedCommit: input.reviewedCommit,
      contentFingerprint: input.contentFingerprint,
      decision: 'pass' as const,
      findings: [],
    })
  }

  async remediate(): Promise<WorkerExecution<unknown>> {
    this.remediationCalls += 1
    throw new Error('Remediation should not run for a pass case')
  }
}

class OneFindingWorkers implements AssuranceAndRemediationWorkers {
  reviewCalls = 0
  remediationCalls = 0

  async independentReview(input: Parameters<AssuranceAndRemediationWorkers['independentReview']>[0]) {
    this.reviewCalls += 1
    if (this.reviewCalls === 1) {
      return success('review-1', 'review-context-1', {
        reviewedCommit: input.reviewedCommit,
        contentFingerprint: input.contentFingerprint,
        decision: 'fail_hold' as const,
        findings: [{
          id: 'finding-learning-1',
          severity: 'material' as const,
          issueType: 'pedagogical_accuracy',
          artifactRef: learningRef,
          workUnitId: 'market-share-learning',
          evidence: ['The explanation overstates what market share alone proves.'],
          finding: 'The introduction implies market share directly proves overall business strength.',
          recommendedCorrection: 'Limit the claim to relative sales position and avoid implying profitability or overall strength.',
          resolutionStatus: 'open' as const,
        }],
      })
    }
    return success('review-2', 'review-context-2', {
      reviewedCommit: input.reviewedCommit,
      contentFingerprint: input.contentFingerprint,
      decision: 'pass' as const,
      findings: [],
    })
  }

  async remediate(input: Parameters<AssuranceAndRemediationWorkers['remediate']>[0]) {
    this.remediationCalls += 1
    const original = input.target.artifact as typeof learningArtifact
    return success('remediation-1', 'remediation-context-1', {
      correctedArtifact: {
        ...original,
        content: {
          ...original.content,
          introduction: 'Market share compares a business sales with total market sales; it does not by itself prove profitability or overall strength.',
        },
      },
      resolvedFindingIds: input.findings.map((finding) => finding.id),
      resolutionNotes: ['Narrowed the claim without changing governed identity or provenance.'],
    })
  }
}

const persister: RemediationVersionPersister = {
  async persist() {
    return { headSha: correctedHead }
  },
}

describe('Content Factory v2 assurance and remediation', () => {
  it('runs deterministic assurance then a fresh independent review and stops cleanly at independent_review', async () => {
    const store = seedStore()
    const workers = new PassWorkers()
    const job = await runAssuranceAndRemediationFactory({ job: validatingJob(), artifactStore: store, workers, versionPersister: persister, contentHeadSha: initialHead, now })

    expect(job.state).toBe('independent_review')
    expect(job.validation?.status).toBe('pass')
    expect(job.validation?.headSha).toBe(initialHead)
    expect(job.coverageCompleteness).toBe('complete')
    expect(job.artifactCompatibilityStatus).toBe('pass')
    expect(job.independentReview?.decision).toBe('pass')
    expect(job.independentReview?.reviewedCommit).toBe(initialHead)
    expect(job.independentReview?.unresolvedBlocking).toBe(0)
    expect(job.independentReview?.unresolvedMaterial).toBe(0)
    expect(workers.reviewCalls).toBe(1)
    expect(workers.remediationCalls).toBe(0)
  })

  it('remediates only the affected artifact, persists a new version, then revalidates and re-reviews in a fresh context', async () => {
    const store = seedStore()
    const workers = new OneFindingWorkers()
    const job = await runAssuranceAndRemediationFactory({ job: validatingJob(), artifactStore: store, workers, versionPersister: persister, contentHeadSha: initialHead, now })

    expect(job.state).toBe('independent_review')
    expect(job.validation?.status).toBe('pass')
    expect(job.validation?.headSha).toBe(correctedHead)
    expect(job.independentReview?.decision).toBe('pass')
    expect(job.independentReview?.reviewedCommit).toBe(correctedHead)
    expect(job.remediation?.status).toBe('complete')
    expect(job.remediation?.correctedHeadSha).toBe(correctedHead)
    expect(workers.reviewCalls).toBe(2)
    expect(workers.remediationCalls).toBe(1)
    expect(job.workerRuns.filter((run) => run.stage === 'independent_review').map((run) => run.contextId)).toEqual(['review-context-1', 'review-context-2'])
    expect(job.workUnits[0].outputRefs).not.toContain(learningRef)
    expect(job.workUnits[0].outputRefs).toContain(practiceRef)
    expect(job.markingPackCoverage[0].markingPackRef).toBe(markingPackRef)
    expect(job.contentPackRefs.length).toBe(2)
  })

  it('fails closed if the independent reviewer reuses a generation context', async () => {
    const store = seedStore()
    const workers: AssuranceAndRemediationWorkers = {
      async independentReview(input) {
        return success('review-reused', 'generation-context', {
          reviewedCommit: input.reviewedCommit,
          contentFingerprint: input.contentFingerprint,
          decision: 'pass' as const,
          findings: [],
        })
      },
      async remediate() {
        throw new Error('not expected')
      },
    }
    const job = await runAssuranceAndRemediationFactory({ job: validatingJob(), artifactStore: store, workers, versionPersister: persister, contentHeadSha: initialHead, now })

    expect(job.state).toBe('blocked')
    expect(job.blockedFromState).toBe('independent_review')
    expect(job.blockers.at(-1)?.reason).toContain('fresh context')
  })

  it('blocks before independent review when deterministic Marking Pack integrity fails', async () => {
    const brokenPack = { ...markingPack, assessmentObjectiveAllocation: [{ objectiveId: 'ao1', marks: 3 }] }
    const store = seedStore(brokenPack)
    const workers = new PassWorkers()
    const job = await runAssuranceAndRemediationFactory({ job: validatingJob(), artifactStore: store, workers, versionPersister: persister, contentHeadSha: initialHead, now })

    expect(job.state).toBe('blocked')
    expect(job.blockedFromState).toBe('validating')
    expect(job.validation?.status).toBe('fail')
    expect(job.blockers.at(-1)?.reason).toContain('assessment-marking-integrity')
    expect(workers.reviewCalls).toBe(0)
  })
})