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
import { foundationCandidateSchema, type FoundationCandidate, type FoundationJob } from './foundation-schema'
import {
  runDeterministicFoundationAssurance,
  type FoundationAssuranceArtifactStore,
} from './foundation-assurance'
import {
  boardAlignmentSchema,
  courseKnowledgeModelSchema,
  questionFamilySchema,
  sourceLicenceRegisterSchema,
} from './schema'

const now = '2026-09-03T21:45:00+01:00'
const reviewedCommit = 'c'.repeat(40)
const jobId = 'foundation-assurance-fixture-1'

class MemoryAssuranceStore implements FoundationAssuranceArtifactStore {
  readonly values = new Map<string, unknown>()
  readonly writes: Array<{
    jobId: string
    kind: 'foundation_deterministic_assurance_report'
    fingerprint: string
    value: unknown
    ref: string
  }> = []

  put(ref: string, value: unknown) {
    this.values.set(ref, structuredClone(value))
  }

  mutate(ref: string, updater: (value: unknown) => unknown) {
    const current = this.values.get(ref)
    if (current === undefined) throw new Error(`Missing fixture artifact ${ref}`)
    this.values.set(ref, structuredClone(updater(structuredClone(current))))
  }

  async readJson(ref: string) {
    if (!this.values.has(ref)) throw new Error(`Artifact ${ref} not found`)
    return structuredClone(this.values.get(ref))
  }

  async writeJson(input: {
    jobId: string
    kind: 'foundation_deterministic_assurance_report'
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
  id: 'revision-owned-fixture',
  issuer: 'Revision',
  hostnames: ['revision.app'],
  sourceTypes: ['other_primary'],
  useClass: 'REVISION_OWNED',
  permissionBasis: 'Revision-owned deterministic assurance fixture',
  aiInputPermitted: true,
  derivedCommercialUsePermitted: true,
  attributionRequirements: [],
  restrictions: [],
  revalidationConditions: [],
}]

async function fixture(): Promise<{
  job: FoundationJob
  candidate: FoundationCandidate
  store: MemoryAssuranceStore
}> {
  const store = new MemoryAssuranceStore()
  const identity = {
    subject: 'Business',
    qualification: 'A-level',
    awardingBody: 'AQA',
    specificationId: '7132',
  }
  const cohortValidity = {
    status: 'current' as const,
    firstAssessment: '2027',
    notes: [],
  }

  const rights = await classifyFoundationSourcesWithApprovedRules({
    jobId,
    sources: [{
      id: 'revision-fixture-source',
      url: 'https://revision.app/foundation-fixture',
      title: 'Revision Foundation assurance fixture',
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
    courseIdentity: identity,
    cohortValidity,
    components: [{ id: 'paper-1', name: 'Paper 1', compulsory: true, marks: 100, durationMinutes: 120 }],
    assessmentObjectives: [{
      id: 'ao1',
      name: 'Knowledge and understanding',
      weightingPercent: 20,
      sourceRefs: ['revision-fixture-source'],
    }],
    assessmentRequirements: [{
      id: 'written-exam',
      summary: 'Written examination',
      componentScope: ['paper-1'],
      sourceRefs: ['revision-fixture-source'],
    }],
    sourceRefs: ['revision-fixture-source'],
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
      sourceRefs: ['revision-fixture-source'],
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
      sourceRefs: ['revision-fixture-source'],
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
    components: [{
      componentId: 'paper-1',
      questionFamilyIds: ['short-explain'],
      markTotal: 100,
      timingMinutes: 120,
      constraints: ['written examination'],
    }],
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
    candidateId: 'foundation-assurance-candidate-1',
    courseIdentity: identity,
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
    knownLimitations: ['Fixture proves deterministic structure only.'],
    provenance: {
      createdAt: now,
      producerVersion: 'foundation-assurance-fixture-v1',
      sourceSetFingerprint: rights.register.fingerprint,
      implementationHeadSha: reviewedCommit,
    },
  })

  const requested = createFoundationJob({ jobId, createdAt: now })
  const compiling = advanceFoundationJob(requested, 'compiling', now)
  const withCandidate = setFoundationCandidate(compiling, candidate, now)
  const assuring = advanceFoundationJob(withCandidate, 'assuring', now)
  return { job: assuring, candidate, store }
}

describe('Foundation deterministic assurance', () => {
  it('passes a coherent Foundation Candidate, binds evidence to the exact fingerprint, and ignores revalidation timestamps as material identity', async () => {
    const { job, candidate, store } = await fixture()

    store.mutate(candidate.sourceLicenceRegister.ref, (value) => {
      const register = sourceLicenceRegisterSchema.parse(value)
      return {
        ...register,
        checkedAt: '2026-09-04T08:00:00+01:00',
        sources: register.sources.map((source) => ({ ...source, checkedAt: '2026-09-04T08:00:00+01:00' })),
      }
    })

    const result = await runDeterministicFoundationAssurance({
      job,
      artifactStore: store,
      reviewedCommit,
      now,
    })
    const foundationFingerprint = await computeFoundationFingerprint(candidate)

    expect(result.report.decision).toBe('pass')
    expect(result.report.foundationFingerprint).toBe(foundationFingerprint)
    expect(result.report.checks.some((item) => item.status === 'fail')).toBe(false)
    expect(result.job.candidate?.deterministicAssurance).toEqual({
      status: 'pass',
      foundationFingerprint,
      evidenceRefs: [result.reportRef],
    })
    expect(store.writes).toHaveLength(1)
    expect(store.writes[0].kind).toBe('foundation_deterministic_assurance_report')
  })

  it('reports simultaneous persisted-artifact, Course Truth and Question Family defects without stopping at the first failure', async () => {
    const { job, candidate, store } = await fixture()

    store.mutate(candidate.coverageModel.ref, (value) => {
      const coverage = foundationCoverageModelSchema.parse(value)
      return {
        ...coverage,
        requirements: coverage.requirements.map((requirement, index) => index === 0
          ? { ...requirement, knowledgeNodeIds: ['missing-node'] }
          : requirement),
      }
    })
    store.mutate(candidate.questionFamilies[0].ref, (value) => {
      const family = questionFamilySchema.parse(value)
      return { ...family, componentScope: ['unknown-paper'] }
    })

    const result = await runDeterministicFoundationAssurance({
      job,
      artifactStore: store,
      reviewedCommit,
      now,
    })
    const failedCheckIds = result.report.checks
      .filter((item) => item.status === 'fail')
      .map((item) => item.checkId)

    expect(result.report.decision).toBe('fail')
    expect(failedCheckIds).toContain('artifact-fingerprints')
    expect(failedCheckIds).toContain('course-truth-integrity')
    expect(failedCheckIds).toContain('question-family-integrity')
    expect(failedCheckIds.length).toBeGreaterThanOrEqual(3)
    expect(result.job.candidate?.deterministicAssurance.status).toBe('fail')
    expect(() => advanceFoundationJob(result.job, 'expert_review', now)).toThrow(/Deterministic Foundation assurance must pass/)
  })
})
