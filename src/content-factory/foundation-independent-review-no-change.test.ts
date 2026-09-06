import { describe, expect, it } from 'vitest'
import {
  classifyFoundationSourcesWithApprovedRules,
  fingerprintFoundationArtifact,
  foundationAssessmentBlueprintSchema,
  foundationCoverageModelSchema,
  type FoundationSourceRightsPolicyRule,
} from './foundation-compilation'
import {
  advanceFoundationJob,
  computeFoundationFingerprint,
  createFoundationJob,
  setFoundationCandidate,
} from './foundation-lifecycle'
import { foundationCandidateSchema } from './foundation-schema'
import {
  runFoundationIndependentReviewAndRemediation,
  type FoundationIndependentReviewArtifactKind,
  type FoundationIndependentReviewArtifactStore,
  type FoundationIndependentReviewWorkers,
} from './foundation-independent-review'
import {
  boardAlignmentSchema,
  courseKnowledgeModelSchema,
  questionFamilySchema,
} from './schema'

const now = '2026-09-06T20:00:00+01:00'
const reviewedCommit = 'd'.repeat(40)
const jobId = 'foundation-no-change-fixture'

class MemoryStore implements FoundationIndependentReviewArtifactStore {
  readonly values = new Map<string, unknown>()
  readonly writes: Array<{ kind: FoundationIndependentReviewArtifactKind; ref: string; value: unknown }> = []

  put(ref: string, value: unknown) {
    this.values.set(ref, structuredClone(value))
  }

  async readJson(ref: string) {
    if (!this.values.has(ref)) throw new Error(`Artifact ${ref} not found`)
    return structuredClone(this.values.get(ref))
  }

  async writeJson(input: { jobId: string; kind: FoundationIndependentReviewArtifactKind; fingerprint: string; value: unknown }) {
    const ref = `foundation/${input.kind}-${this.writes.length + 1}.json`
    this.writes.push({ kind: input.kind, ref, value: structuredClone(input.value) })
    this.values.set(ref, structuredClone(input.value))
    return { ref }
  }
}

const rightsRules: FoundationSourceRightsPolicyRule[] = [{
  id: 'revision-owned-no-change-fixture',
  issuer: 'Revision',
  hostnames: ['revision.app'],
  sourceTypes: ['other_primary'],
  useClass: 'REVISION_OWNED',
  permissionBasis: 'Revision-owned no-change remediation fixture',
  aiInputPermitted: true,
  derivedCommercialUsePermitted: true,
  attributionRequirements: [],
  restrictions: [],
  revalidationConditions: [],
}]

async function fixture() {
  const store = new MemoryStore()
  const courseIdentity = { subject: 'Business', qualification: 'A-level', awardingBody: 'AQA', specificationId: '7132' }
  const cohortValidity = { status: 'current' as const, firstAssessment: '2027', notes: [] }
  const rights = await classifyFoundationSourcesWithApprovedRules({
    jobId,
    sources: [{
      id: 'revision-no-change-source',
      url: 'https://revision.app/foundation-no-change-fixture',
      title: 'Revision no-change remediation fixture',
      issuer: 'Revision',
      sourceType: 'other_primary',
      educationalRole: ['curriculum', 'assessment'],
      versionOrDate: 'v1',
    }],
    rules: rightsRules,
    checkedAt: now,
  })
  expect(rights.status).toBe('approved')

  const boardWithoutFingerprint = {
    schemaVersion: 1 as const,
    jobId,
    courseIdentity,
    cohortValidity,
    components: [{ id: 'paper-1', name: 'Paper 1', compulsory: true, marks: 100, durationMinutes: 120 }],
    assessmentObjectives: [{ id: 'ao1', name: 'Knowledge and understanding', weightingPercent: 20, sourceRefs: ['revision-no-change-source'] }],
    assessmentRequirements: [{ id: 'written-exam', summary: 'Written examination', componentScope: ['paper-1'], sourceRefs: ['revision-no-change-source'] }],
    sourceRefs: ['revision-no-change-source'],
    verificationStatus: 'verified' as const,
  }
  const boardFingerprint = await fingerprintFoundationArtifact(boardWithoutFingerprint)
  const boardAlignment = boardAlignmentSchema.parse({ ...boardWithoutFingerprint, fingerprint: boardFingerprint })

  const coverageModel = foundationCoverageModelSchema.parse({
    schemaVersion: 1,
    jobId,
    sourceSetFingerprint: rights.register.fingerprint,
    requirements: [{
      requirementId: 'business-objectives',
      officialReference: 'fixture-1',
      requirementSummary: 'Understand why businesses set and change objectives.',
      skillsOrKnowledge: ['business objectives'],
      componentScope: ['paper-1'],
      revisionArea: 'Business objectives',
      sourceRefs: ['revision-no-change-source'],
      knowledgeNodeIds: ['business-objectives'],
      coverageStatus: 'complete',
    }],
  })
  const coverageFingerprint = await fingerprintFoundationArtifact(coverageModel)

  const courseWithoutFingerprint = {
    schemaVersion: 1 as const,
    jobId,
    nodes: [{
      id: 'business-objectives',
      kind: 'concept' as const,
      summary: 'Businesses set objectives that guide decisions and can change as circumstances change.',
      prerequisiteIds: [],
      relatedIds: [],
      formulas: [],
      misconceptions: ['Objectives never change.'],
      applicationContexts: ['growth', 'survival'],
      depth: 'core' as const,
      sourceRefs: ['revision-no-change-source'],
      boardAlignmentRefs: ['paper-1', 'ao1'],
      evidenceTypes: ['explain', 'apply'],
    }],
  }
  const courseFingerprint = await fingerprintFoundationArtifact(courseWithoutFingerprint)
  const courseKnowledgeModel = courseKnowledgeModelSchema.parse({ ...courseWithoutFingerprint, fingerprint: courseFingerprint })

  const assessmentBlueprint = foundationAssessmentBlueprintSchema.parse({
    schemaVersion: 1,
    jobId,
    boardAlignmentFingerprint: boardFingerprint,
    courseKnowledgeModelFingerprint: courseFingerprint,
    assessmentObjectives: [{ id: 'ao1', weightingPercent: 20 }],
    assessmentRequirements: [{ id: 'written-exam', summary: 'Written examination', componentScope: ['paper-1'] }],
    components: [{ componentId: 'paper-1', questionFamilyIds: ['short-explain'], markTotal: 100, timingMinutes: 120, constraints: ['written examination'] }],
    commandDemands: [{ command: 'explain', cognitiveDemand: 'develop a linked explanation', componentScope: ['paper-1'] }],
    evidenceExpectations: ['Use accurate business knowledge.'],
    quantitativeRequirements: [],
    synopticRequirements: [],
  })
  const examFingerprint = await fingerprintFoundationArtifact(assessmentBlueprint)

  const questionFamily = questionFamilySchema.parse({
    schemaVersion: 1,
    id: 'short-explain',
    title: 'Short explain question',
    assessmentObjectiveIds: ['ao1'],
    skillProfile: ['explain'],
    componentScope: ['paper-1'],
    markRange: { min: 2, max: 6 },
    responseShape: 'short developed response',
    contextRequirements: [],
    applicationRequirements: [],
    analysisRequirements: [],
    evaluationRequirements: [],
    commonFailureModes: ['assertion without development'],
    markingPackTemplateVersion: 'foundation-v1',
    calibrationStatus: 'not_calibrated',
  })
  const familyFingerprint = await fingerprintFoundationArtifact(questionFamily)

  const refs = {
    source: 'foundation/source-licence-register.json',
    board: 'foundation/board-alignment.json',
    coverage: 'foundation/coverage-model.json',
    course: 'foundation/course-knowledge-model.json',
    exam: 'foundation/assessment-blueprint.json',
    family: 'foundation/question-family-short-explain.json',
  }
  store.put(refs.source, rights.register)
  store.put(refs.board, boardAlignment)
  store.put(refs.coverage, coverageModel)
  store.put(refs.course, courseKnowledgeModel)
  store.put(refs.exam, assessmentBlueprint)
  store.put(refs.family, questionFamily)

  const candidate = foundationCandidateSchema.parse({
    schemaVersion: 1,
    candidateId: 'foundation-no-change-candidate',
    courseIdentity,
    cohortValidity,
    sourceLicenceRegister: { ref: refs.source, fingerprint: rights.register.fingerprint },
    sourceRightsStatus: 'approved',
    boardAlignment: { ref: refs.board, fingerprint: boardFingerprint },
    boardAlignmentStatus: 'verified',
    coverageModel: { ref: refs.coverage, fingerprint: coverageFingerprint },
    coverageCompleteness: 'complete',
    courseKnowledgeModel: { ref: refs.course, fingerprint: courseFingerprint },
    courseTruthCompleteness: 'complete',
    assessmentBlueprint: { ref: refs.exam, fingerprint: examFingerprint },
    examTruthCompleteness: 'complete',
    questionFamilies: [{ ref: refs.family, fingerprint: familyFingerprint }],
    deterministicAssurance: { status: 'pending', evidenceRefs: [] },
    independentReview: { status: 'pending', evidenceRefs: [] },
    unresolvedBlockers: [],
    knownLimitations: [],
    provenance: {
      createdAt: now,
      producerVersion: 'foundation-no-change-fixture-v1',
      sourceSetFingerprint: rights.register.fingerprint,
      implementationHeadSha: reviewedCommit,
      generationContextIds: ['generation-context'],
      assuranceContextIds: [],
    },
  })

  const requested = createFoundationJob({ jobId, createdAt: now })
  const compiling = advanceFoundationJob(requested, 'compiling', now)
  const withCandidate = setFoundationCandidate(compiling, candidate, now)
  return {
    job: advanceFoundationJob(withCandidate, 'assuring', now),
    store,
    refs,
  }
}

function success(output: unknown, id: string, contextId: string) {
  return {
    status: 'success' as const,
    output,
    provenance: { id, contextId, contractVersion: '1', provider: 'test-provider', model: 'test-model' },
  }
}

describe('Foundation no-change remediation evidence', () => {
  it('blocks an unchanged remediation but retains the exact review and remediation evidence', async () => {
    const { job, store, refs } = await fixture()
    const sourceFingerprint = await computeFoundationFingerprint(job.candidate!)
    const workers: FoundationIndependentReviewWorkers = {
      async independentReview(input) {
        return success({
          reviewedCommit: input.reviewedCommit,
          foundationFingerprint: input.foundationFingerprint,
          decision: 'fail_hold',
          findings: [{
            id: 'question-family-material-finding',
            severity: 'material',
            issueType: 'assessment_authenticity',
            artifactKind: 'question_family',
            artifactRef: refs.family,
            evidence: ['The reviewer requests a constituent change to this Question Family.'],
            finding: 'The reviewer classifies the current Question Family as materially insufficient.',
            recommendedCorrection: 'Change the Question Family within the governed remediation scope.',
            resolutionStatus: 'open',
          }],
        }, 'review-no-change', 'fresh-review-no-change')
      },
      async remediate(input) {
        return success({
          resolvedFindingIds: ['question-family-material-finding'],
          resolutionNotes: ['Attempted the requested correction, but the governed artifact remains semantically unchanged.'],
          replacements: input.targets.map((target) => ({
            artifactKind: target.artifactKind,
            oldRef: target.oldRef,
            correctedArtifact: target.value,
          })),
        }, 'remediation-no-change', 'fresh-remediation-no-change')
      },
    }

    const result = await runFoundationIndependentReviewAndRemediation({
      job,
      artifactStore: store,
      workers,
      reviewedCommit,
      now,
    })

    expect(result.job.state).toBe('blocked')
    expect(result.job.candidate?.independentReview.status).toBe('fail_hold')
    expect(await computeFoundationFingerprint(result.job.candidate!)).toBe(sourceFingerprint)
    expect(result.reviewReports).toHaveLength(1)
    expect(result.reviewReports[0].findings[0].id).toBe('question-family-material-finding')
    expect(result.remediationRecords).toHaveLength(0)
    expect(result.remediationNoChangeRecords).toHaveLength(1)
    expect(result.remediationNoChangeRefs).toHaveLength(1)

    const noChange = result.remediationNoChangeRecords![0]
    expect(noChange.sourceFoundationFingerprint).toBe(sourceFingerprint)
    expect(noChange.unchangedFoundationFingerprint).toBe(sourceFingerprint)
    expect(noChange.triggerReviewRef).toBe(result.reviewRefs[0])
    expect(noChange.attemptedFindingIds).toEqual(['question-family-material-finding'])
    expect(noChange.remediationWorker.contextId).toBe('fresh-remediation-no-change')
    expect(noChange.outcome).toBe('no_material_change')
    expect(result.job.candidate?.provenance.assuranceContextIds).toEqual(expect.arrayContaining([
      'fresh-review-no-change',
      'fresh-remediation-no-change',
    ]))
    expect(result.job.blockers.some((blocker) => (
      blocker.reason.includes('unchanged Foundation fingerprint')
      && blocker.reason.includes(result.reviewRefs[0])
      && blocker.reason.includes(result.remediationNoChangeRefs![0])
    ))).toBe(true)
    expect(store.writes.some((write) => write.kind === 'foundation_remediation_no_change_record')).toBe(true)
  })
})
