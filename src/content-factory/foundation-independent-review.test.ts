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
import { foundationCandidateSchema, type FoundationJob } from './foundation-schema'
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

const now = '2026-09-03T23:30:00+01:00'
const reviewedCommit = 'd'.repeat(40)
const jobId = 'foundation-review-fixture-1'

class MemoryFoundationReviewStore implements FoundationIndependentReviewArtifactStore {
  readonly values = new Map<string, unknown>()
  readonly writes: Array<{
    jobId: string
    kind: FoundationIndependentReviewArtifactKind
    fingerprint: string
    value: unknown
    ref: string
  }> = []

  put(ref: string, value: unknown) {
    this.values.set(ref, structuredClone(value))
  }

  async readJson(ref: string) {
    if (!this.values.has(ref)) throw new Error(`Artifact ${ref} not found`)
    return structuredClone(this.values.get(ref))
  }

  async writeJson(input: {
    jobId: string
    kind: FoundationIndependentReviewArtifactKind
    fingerprint: string
    value: unknown
  }) {
    const ref = `foundation/${input.kind}-${this.writes.length + 1}.json`
    this.writes.push({ ...input, ref, value: structuredClone(input.value) })
    this.values.set(ref, structuredClone(input.value))
    return { ref }
  }
}

const rightsRules: FoundationSourceRightsPolicyRule[] = [{
  id: 'revision-owned-review-fixture',
  issuer: 'Revision',
  hostnames: ['revision.app'],
  sourceTypes: ['other_primary'],
  useClass: 'REVISION_OWNED',
  permissionBasis: 'Revision-owned Foundation review fixture',
  aiInputPermitted: true,
  derivedCommercialUsePermitted: true,
  attributionRequirements: [],
  restrictions: [],
  revalidationConditions: [],
}]

async function fixture(): Promise<{
  job: FoundationJob
  store: MemoryFoundationReviewStore
  refs: { source: string; board: string; coverage: string; course: string; exam: string; family: string }
}> {
  const store = new MemoryFoundationReviewStore()
  const courseIdentity = { subject: 'Business', qualification: 'A-level', awardingBody: 'AQA', specificationId: '7132' }
  const cohortValidity = { status: 'current' as const, firstAssessment: '2027', notes: [] }
  const rights = await classifyFoundationSourcesWithApprovedRules({
    jobId,
    sources: [{
      id: 'revision-review-source',
      url: 'https://revision.app/foundation-review-fixture',
      title: 'Revision Foundation review fixture',
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
    assessmentObjectives: [{ id: 'ao1', name: 'Knowledge and understanding', weightingPercent: 20, sourceRefs: ['revision-review-source'] }],
    assessmentRequirements: [{ id: 'written-exam', summary: 'Written examination', componentScope: ['paper-1'], sourceRefs: ['revision-review-source'] }],
    sourceRefs: ['revision-review-source'],
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
      sourceRefs: ['revision-review-source'],
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
      sourceRefs: ['revision-review-source'],
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
    candidateId: 'foundation-review-candidate-1',
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
      producerVersion: 'foundation-review-fixture-v1',
      sourceSetFingerprint: rights.register.fingerprint,
      implementationHeadSha: reviewedCommit,
      generationContextIds: ['generation-course-truth-context'],
      assuranceContextIds: [],
    },
  })

  const requested = createFoundationJob({ jobId, createdAt: now })
  const compiling = advanceFoundationJob(requested, 'compiling', now)
  const withCandidate = setFoundationCandidate(compiling, candidate, now)
  const assuring = advanceFoundationJob(withCandidate, 'assuring', now)
  return { job: assuring, store, refs }
}

function success(output: unknown, id: string, contextId: string) {
  return {
    status: 'success' as const,
    output,
    provenance: { id, contextId, contractVersion: '1', provider: 'test-provider', model: 'test-model' },
  }
}

describe('Foundation independent review and remediation', () => {
  it('binds a fresh independent review to the exact fingerprint and retains minor findings as limitations', async () => {
    const { job, store, refs } = await fixture()
    const initialFingerprint = await computeFoundationFingerprint(job.candidate!)
    const workers: FoundationIndependentReviewWorkers = {
      async independentReview(input) {
        return success({
          reviewedCommit: input.reviewedCommit,
          foundationFingerprint: input.foundationFingerprint,
          decision: 'pass',
          findings: [{
            id: 'minor-wording-1',
            severity: 'minor',
            issueType: 'precision',
            artifactKind: 'course_knowledge_model',
            artifactRef: refs.course,
            evidence: ['The concept is correct but could distinguish strategic from tactical objectives more explicitly.'],
            finding: 'One explanation could be more precise without changing the governed concept.',
            recommendedCorrection: 'Carry this nuance into expert review or a later material revision.',
            resolutionStatus: 'open',
          }],
        }, 'foundation-review-run-1', 'fresh-review-context-1')
      },
      async remediate() {
        throw new Error('Minor findings must not trigger material remediation')
      },
    }

    const result = await runFoundationIndependentReviewAndRemediation({ job, artifactStore: store, workers, reviewedCommit, now })

    expect(result.job.state).toBe('assuring')
    expect(result.job.candidate?.deterministicAssurance.status).toBe('pass')
    expect(result.job.candidate?.independentReview.status).toBe('pass')
    expect(result.job.candidate?.independentReview.foundationFingerprint).toBe(initialFingerprint)
    expect(result.job.candidate?.knownLimitations.some((entry) => entry.includes('minor-wording-1'))).toBe(true)
    expect(result.job.candidate?.provenance.assuranceContextIds).toContain('fresh-review-context-1')
    expect(result.reviewReports).toHaveLength(1)
    expect(result.reviewReports[0].excludedContextIds).toContain('generation-course-truth-context')
    expect(result.remediationRecords).toHaveLength(0)
  })

  it('fails closed when the independent reviewer reuses a generation context', async () => {
    const { job, store } = await fixture()
    const workers: FoundationIndependentReviewWorkers = {
      async independentReview(input) {
        return success({
          reviewedCommit: input.reviewedCommit,
          foundationFingerprint: input.foundationFingerprint,
          decision: 'pass',
          findings: [],
        }, 'foundation-review-run-reused', 'generation-course-truth-context')
      },
      async remediate() {
        throw new Error('Contaminated review must not reach remediation')
      },
    }

    const result = await runFoundationIndependentReviewAndRemediation({ job, artifactStore: store, workers, reviewedCommit, now })

    expect(result.job.state).toBe('blocked')
    expect(result.job.blockers.some((blocker) => blocker.reason.includes('reused a generation/review/remediation context'))).toBe(true)
    expect(result.reviewReports).toHaveLength(0)
  })

  it('remediates a Course Truth material finding at the dependency closure, changes the fingerprint, re-assures deterministically, then re-reviews fresh', async () => {
    const { job, store, refs } = await fixture()
    const sourceFingerprint = await computeFoundationFingerprint(job.candidate!)
    let reviewCount = 0
    let remediationTargetKinds: string[] = []
    const workers: FoundationIndependentReviewWorkers = {
      async independentReview(input) {
        reviewCount += 1
        if (reviewCount === 1) {
          return success({
            reviewedCommit: input.reviewedCommit,
            foundationFingerprint: input.foundationFingerprint,
            decision: 'fail_hold',
            findings: [{
              id: 'course-depth-gap',
              severity: 'material',
              issueType: 'educational_sufficiency',
              artifactKind: 'course_knowledge_model',
              artifactRef: refs.course,
              evidence: ['The Course Truth definition omits that objectives can conflict and require trade-offs.'],
              finding: 'The concept is materially too shallow for the declared depth.',
              recommendedCorrection: 'Add the missing trade-off nuance while preserving the canonical node and provenance.',
              resolutionStatus: 'open',
            }],
          }, 'foundation-review-run-1', 'fresh-review-context-1')
        }
        return success({
          reviewedCommit: input.reviewedCommit,
          foundationFingerprint: input.foundationFingerprint,
          decision: 'pass',
          findings: [],
        }, 'foundation-review-run-2', 'fresh-review-context-2')
      },
      async remediate(input) {
        remediationTargetKinds = input.targets.map((target) => target.artifactKind).sort()
        return success({
          resolvedFindingIds: ['course-depth-gap'],
          resolutionNotes: ['Expanded the governed concept and rebuilt dependent assessment truth against the corrected Course Truth fingerprint.'],
          replacements: input.targets.map((target) => {
            if (target.artifactKind === 'course_knowledge_model') {
              const course = courseKnowledgeModelSchema.parse(target.value)
              return {
                artifactKind: target.artifactKind,
                oldRef: target.oldRef,
                correctedArtifact: {
                  ...course,
                  nodes: course.nodes.map((node) => node.id === 'business-objectives'
                    ? { ...node, summary: `${node.summary} Objectives may also conflict, requiring deliberate trade-offs between priorities.` }
                    : node),
                },
              }
            }
            if (target.artifactKind === 'assessment_blueprint') {
              return { artifactKind: target.artifactKind, oldRef: target.oldRef, correctedArtifact: foundationAssessmentBlueprintSchema.parse(target.value) }
            }
            return { artifactKind: target.artifactKind, oldRef: target.oldRef, correctedArtifact: questionFamilySchema.parse(target.value) }
          }),
        }, 'foundation-remediation-run-1', 'fresh-remediation-context-1')
      },
    }

    const result = await runFoundationIndependentReviewAndRemediation({ job, artifactStore: store, workers, reviewedCommit, now })
    const finalCandidate = result.job.candidate!
    const finalFingerprint = await computeFoundationFingerprint(finalCandidate)

    expect(remediationTargetKinds).toEqual(['assessment_blueprint', 'course_knowledge_model', 'question_family'])
    expect(result.remediationRecords).toHaveLength(1)
    expect(result.reviewReports).toHaveLength(2)
    expect(result.remediationRecords[0].sourceFoundationFingerprint).toBe(sourceFingerprint)
    expect(result.remediationRecords[0].remediatedFoundationFingerprint).toBe(finalFingerprint)
    expect(finalFingerprint).not.toBe(sourceFingerprint)
    expect(result.remediationRecords[0].deterministicReassurance.decision).toBe('pass')
    expect(finalCandidate.deterministicAssurance.status).toBe('pass')
    expect(finalCandidate.independentReview.status).toBe('pass')
    expect(finalCandidate.deterministicAssurance.foundationFingerprint).toBe(finalFingerprint)
    expect(finalCandidate.independentReview.foundationFingerprint).toBe(finalFingerprint)
    expect(finalCandidate.candidateId).toBe('foundation-review-candidate-1-r1')
    expect(finalCandidate.provenance.assuranceContextIds).toEqual(expect.arrayContaining([
      'fresh-review-context-1',
      'fresh-remediation-context-1',
      'fresh-review-context-2',
    ]))
  })

  it('blocks upstream Board Alignment remediation instead of silently rewriting governed truth during assurance', async () => {
    const { job, store, refs } = await fixture()
    const workers: FoundationIndependentReviewWorkers = {
      async independentReview(input) {
        return success({
          reviewedCommit: input.reviewedCommit,
          foundationFingerprint: input.foundationFingerprint,
          decision: 'fail_hold',
          findings: [{
            id: 'board-alignment-gap',
            severity: 'blocking',
            issueType: 'assessment_alignment',
            artifactKind: 'board_alignment',
            artifactRef: refs.board,
            evidence: ['The reviewer cannot reconcile one governed assessment requirement with the declared component facts.'],
            finding: 'Board Alignment requires authoritative re-compilation before educational review can continue.',
            recommendedCorrection: 'Reopen Foundation compilation and re-establish Board Alignment from governed structured evidence.',
            resolutionStatus: 'open',
          }],
        }, 'foundation-review-run-upstream', 'fresh-review-context-upstream')
      },
      async remediate() {
        throw new Error('Upstream governed truth must not be rewritten by the assurance remediation worker')
      },
    }

    const result = await runFoundationIndependentReviewAndRemediation({ job, artifactStore: store, workers, reviewedCommit, now })

    expect(result.job.state).toBe('blocked')
    expect(result.job.blockers.some((blocker) => blocker.reason.includes('requires reopening Foundation compilation'))).toBe(true)
    expect(result.remediationRecords).toHaveLength(0)
  })
})
