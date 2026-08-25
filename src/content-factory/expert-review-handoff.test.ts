import { describe, expect, it } from 'vitest'
import { contentFactoryJobSchema, type ContentFactoryJob } from './schema'
import {
  importQualifiedExpertReview,
  packageExpertReview,
  type ExpertReviewArtifactKind,
  type ExpertReviewArtifactStore,
} from './expert-review-handoff'

const now = '2026-08-26T00:30:00+01:00'
const head = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
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
const validationRef = 'content-factory/cf-business/validation.json'
const independentReviewRef = 'content-factory/cf-business/independent-review.json'

class MemoryArtifactStore implements ExpertReviewArtifactStore {
  readonly values = new Map<string, unknown>()
  writes = 0

  seed(ref: string, value: unknown) {
    this.values.set(ref, value)
  }

  async writeJson(input: { jobId: string; kind: ExpertReviewArtifactKind; fingerprint: string; value: unknown }) {
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
    coverageStatus: 'complete' as const,
    contentRefs: [learningRef, practiceRef, itemRef],
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
    summary: 'Market share is business sales as a proportion of total market sales.',
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
    introduction: 'Market share compares a business with the market.',
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
    activities: [{ id: 'apply', mode: 'application' as const, prompt: 'Why might market share matter?', expectedResponse: 'It can indicate competitive position.', explanation: 'The measure compares business sales with total market sales.', improvementAction: 'Link the measure to a decision.' }],
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
  questionFamilyId: questionFamily.id,
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
  indicativeContent: ['A stronger share may influence strategic choices.'],
  misconceptions: ['Market share automatically equals profitability.'],
  anchors: [],
  diagnosticFeedbackRules: ['Explain whether the answer uses context.'],
  improvementActions: ['Connect the measure to a business consequence.'],
  ambiguityPolicy: 'Use a range if the response is genuinely ambiguous.',
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

const validation = {
  schemaVersion: 1 as const,
  artifactType: 'deterministic_validation_report' as const,
  jobId: 'cf-business',
  reviewedCommit: head,
  contentFingerprint: 'content-fingerprint-v1',
  decision: 'pass' as const,
  checks: [{ checkId: 'all-clear', status: 'pass' as const, severity: 'informational' as const, artifactRefs: [manifestRef], message: 'Deterministic assurance passed.', evidence: [] }],
  createdAt: now,
}

const independentReview = {
  schemaVersion: 1 as const,
  artifactType: 'independent_review_report' as const,
  jobId: 'cf-business',
  reviewedCommit: head,
  deterministicValidationRef: validationRef,
  contentFingerprint: validation.contentFingerprint,
  decision: 'pass' as const,
  findings: [],
  createdAt: now,
}

function seedStore() {
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
  store.seed(markingPackRef, markingPack)
  store.seed(manifestRef, manifest)
  store.seed(validationRef, validation)
  store.seed(independentReviewRef, independentReview)
  return store
}

function independentlyReviewedJob(): ContentFactoryJob {
  return contentFactoryJobSchema.parse({
    schemaVersion: 2,
    jobId: 'cf-business',
    officialUrls: ['https://board.example/business'],
    founderInstruction: 'Add this course',
    state: 'independent_review',
    courseIdentity,
    cohortValidity: boardAlignment.cohortValidity,
    components: boardAlignment.components,
    unresolvedChoices: [],
    sourceLicenceRegisterRef,
    sourceRightsStatus: 'approved',
    sourceSetFingerprint: coverageMap.sourceSetFingerprint,
    coverageMapRef,
    coverageCompleteness: 'complete',
    boardAlignmentRef,
    courseKnowledgeModelRef: knowledgeModelRef,
    learningBlueprintRef,
    assessmentBlueprintRef,
    questionFamilyRefs: [familyRef],
    markableAssessmentItemIds: [assessmentItem.id],
    markingPackCoverage: [{ assessmentItemId: assessmentItem.id, markingPackRef }],
    artifactCompatibilityStatus: 'pass',
    knownLimitations: ['Independent review minor note: retain cautious language around market strength.'],
    contentPackRefs: [manifestRef],
    workUnits: [{ id: 'market-share-learning', title: 'Market share', requirementIds: ['market-share'], componentIds: [], status: 'complete', outputRefs: [learningRef, practiceRef] }],
    workerRuns: [
      { id: 'generation-1', stage: 'generation', contextId: 'generation-context', contractVersion: '1', status: 'success', inputRefs: [], outputRefs: [learningRef, practiceRef], retryCount: 0 },
      { id: 'review-1', stage: 'independent_review', contextId: 'review-context', contractVersion: '1', status: 'success', inputRefs: [manifestRef, validationRef], outputRefs: [independentReviewRef], retryCount: 0 },
    ],
    validation: { status: 'pass', ref: validationRef, headSha: head },
    independentReview: { decision: 'pass', ref: independentReviewRef, reviewedCommit: head, reviewerWorkerRunId: 'review-1', unresolvedBlocking: 0, unresolvedMaterial: 0 },
    blockers: [],
    createdAt: now,
    updatedAt: now,
  })
}

async function packaged() {
  const store = seedStore()
  const result = await packageExpertReview({ job: independentlyReviewedJob(), artifactStore: store, now })
  return { store, ...result }
}

describe('Content Factory v2 expert-review handoff', () => {
  it('packages the exact independently reviewed content and advances to expert_review_ready idempotently', async () => {
    const { store, job, package: pack, contract } = await packaged()

    expect(job.state).toBe('expert_review_ready')
    expect(job.expertReviewPackage?.reviewedCommit).toBe(head)
    expect(pack.reviewedCommit).toBe(head)
    expect(pack.artifacts.map((artifact) => artifact.ref)).toEqual(expect.arrayContaining([learningRef, practiceRef, itemRef, markingPackRef]))
    expect(pack.sourceLicenceSummary[0].useClass).toBe('OPEN')
    expect(contract.decision).toBe('pending')
    expect(contract.packageRef).toBe(job.expertReviewPackage?.packageRef)
    expect(contract.knownLimitations).toEqual(job.knownLimitations)

    const writes = store.writes
    const repeated = await packageExpertReview({ job, artifactStore: store, now })
    expect(repeated.job.expertReviewPackage).toEqual(job.expertReviewPackage)
    expect(store.writes).toBe(writes)
  })

  it('imports an exact qualified pass and leaves the job in human_review ready for benchmark approval', async () => {
    const { store, job, contract } = await packaged()
    const result = await importQualifiedExpertReview({
      job,
      artifactStore: store,
      now,
      submission: {
        schemaVersion: 1,
        artifactType: 'qualified_expert_review_submission',
        jobId: job.jobId,
        reviewedCommit: head,
        packageRef: contract.packageRef,
        artifactRefs: contract.artifactRefs,
        knownLimitations: contract.knownLimitations,
        reviewer: { reviewerId: 'expert-1', displayName: 'Qualified Reviewer', role: 'Subject and assessment reviewer', qualificationSummary: 'Experienced subject teacher and examiner.' },
        reviewedAt: now,
        decision: 'pass',
        findings: [],
      },
    })

    expect(result.job.state).toBe('human_review')
    expect(result.job.humanReview?.status).toBe('pass')
    expect(result.job.humanReview?.reviewedCommit).toBe(head)
    expect(result.job.humanReview?.unresolvedBlocking).toBe(0)
    expect(result.job.humanReview?.unresolvedMaterial).toBe(0)
  })

  it('round-trips material expert findings into targeted expert-review remediation state', async () => {
    const { store, job, contract } = await packaged()
    const result = await importQualifiedExpertReview({
      job,
      artifactStore: store,
      now,
      submission: {
        schemaVersion: 1,
        artifactType: 'qualified_expert_review_submission',
        jobId: job.jobId,
        reviewedCommit: head,
        packageRef: contract.packageRef,
        artifactRefs: contract.artifactRefs,
        knownLimitations: contract.knownLimitations,
        reviewer: { reviewerId: 'expert-1', displayName: 'Qualified Reviewer', role: 'Subject and assessment reviewer', qualificationSummary: 'Experienced subject teacher and examiner.' },
        reviewedAt: now,
        decision: 'conditional_pass',
        findings: [{
          id: 'expert-finding-1',
          severity: 'material',
          type: 'pedagogical_accuracy',
          artifactRef: learningRef,
          workUnitId: 'market-share-learning',
          finding: 'Clarify that market share alone does not establish profitability.',
          requiredCorrection: 'Narrow the explanation and retain the existing provenance.',
          disposition: 'open',
        }],
      },
    })

    expect(result.job.state).toBe('remediation')
    expect(result.job.remediation).toEqual({ trigger: 'expert_review', status: 'pending' })
    expect(result.job.humanReview?.status).toBe('conditional_pass')
    expect(result.job.humanReview?.unresolvedMaterial).toBe(1)
    expect(result.submission.findings[0].artifactRef).toBe(learningRef)
  })

  it('rejects reviewer findings outside the immutable exported artifact set', async () => {
    const { store, job, contract } = await packaged()
    await expect(importQualifiedExpertReview({
      job,
      artifactStore: store,
      now,
      submission: {
        schemaVersion: 1,
        artifactType: 'qualified_expert_review_submission',
        jobId: job.jobId,
        reviewedCommit: head,
        packageRef: contract.packageRef,
        artifactRefs: contract.artifactRefs,
        knownLimitations: contract.knownLimitations,
        reviewer: { reviewerId: 'expert-1', displayName: 'Qualified Reviewer', role: 'Subject reviewer', qualificationSummary: 'Qualified subject expert.' },
        reviewedAt: now,
        decision: 'conditional_pass',
        findings: [{ id: 'expert-finding-unknown', severity: 'minor', type: 'clarity', artifactRef: 'outside-package.json', finding: 'Unknown target.', requiredCorrection: 'None.', disposition: 'open' }],
      },
    })).rejects.toThrow('outside the exported package')
  })
})