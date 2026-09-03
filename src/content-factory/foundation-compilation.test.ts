import { describe, expect, it } from 'vitest'
import { advanceFoundationJob, createFoundationJob } from './foundation-lifecycle'
import {
  FoundationCompilationError,
  compileFoundationJob,
  foundationCoverageModelSchema,
  type FoundationCompilationArtifactKind,
  type FoundationCompilationArtifactStore,
  type FoundationCompilationWorkers,
  type FoundationSourceRightsPolicyRule,
  type FoundationWorkerExecutionProvenance,
} from './foundation-compilation'

const now = '2026-09-03T18:00:00+01:00'
const headSha = 'b'.repeat(40)
const officialUrl = 'https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification'

function provenance(id: string): FoundationWorkerExecutionProvenance {
  return {
    id,
    contextId: `fresh-context-${id}`,
    contractVersion: '1',
    provider: 'fixture',
    model: 'fixture-model',
  }
}

function success(id: string, output: unknown) {
  return { status: 'success' as const, output, provenance: provenance(id) }
}

class MemoryArtifactStore implements FoundationCompilationArtifactStore {
  readonly writes: Array<{
    jobId: string
    kind: FoundationCompilationArtifactKind
    fingerprint: string
    value: unknown
    ref: string
  }> = []

  async writeJson(input: {
    jobId: string
    kind: FoundationCompilationArtifactKind
    fingerprint: string
    value: unknown
  }) {
    const ref = `foundation/${input.kind}-${this.writes.length + 1}.json`
    this.writes.push({ ...input, ref })
    return { ref }
  }
}

const sourceRightsRules: FoundationSourceRightsPolicyRule[] = [
  {
    id: 'aqa-open-specification',
    issuer: 'AQA',
    hostnames: ['www.aqa.org.uk'],
    sourceTypes: ['specification'],
    useClass: 'OPEN',
    permissionBasis: 'Fixture-approved public specification use',
    aiInputPermitted: true,
    derivedCommercialUsePermitted: true,
    attributionRequirements: [],
    restrictions: [],
    revalidationConditions: ['recheck_on_specification_change'],
  },
]

function validBoardAlignment() {
  return {
    schemaVersion: 1 as const,
    jobId: 'aqa-a-level-business-7132-foundation-1',
    fingerprint: 'provider-value-is-replaced',
    courseIdentity: {
      subject: 'Business',
      qualification: 'A-level',
      awardingBody: 'AQA',
      specificationId: '7132',
    },
    cohortValidity: {
      status: 'current' as const,
      firstAssessment: '2027',
      notes: [],
    },
    components: [
      { id: 'paper-1', name: 'Paper 1', compulsory: true, marks: 100, durationMinutes: 120 },
    ],
    assessmentObjectives: [
      { id: 'ao1', name: 'Knowledge and understanding', weightingPercent: 20, sourceRefs: ['aqa-spec-7132'] },
    ],
    assessmentRequirements: [
      { id: 'written-exam', summary: 'Written examination', componentScope: ['paper-1'], sourceRefs: ['aqa-spec-7132'] },
    ],
    sourceRefs: ['aqa-spec-7132'],
    verificationStatus: 'verified' as const,
  }
}

function validCourseTruth(jobId: string) {
  return {
    schemaVersion: 1 as const,
    jobId,
    fingerprint: 'provider-value-is-replaced',
    nodes: [
      {
        id: 'business-objectives',
        kind: 'concept' as const,
        summary: 'Businesses set objectives that can change with circumstances and stakeholder priorities.',
        prerequisiteIds: [],
        relatedIds: ['business-calculations'],
        formulas: [],
        misconceptions: ['Objectives are fixed permanently.'],
        applicationContexts: ['growth', 'survival'],
        depth: 'core' as const,
        sourceRefs: ['aqa-spec-7132'],
        boardAlignmentRefs: ['paper-1', 'ao1'],
        evidenceTypes: ['explain', 'apply'],
      },
      {
        id: 'business-calculations',
        kind: 'skill' as const,
        summary: 'Calculate and interpret percentage change in business contexts.',
        prerequisiteIds: [],
        relatedIds: ['business-objectives'],
        formulas: ['percentage change = change / original × 100'],
        misconceptions: [],
        applicationContexts: ['sales growth'],
        depth: 'core' as const,
        sourceRefs: ['aqa-spec-7132'],
        boardAlignmentRefs: ['paper-1'],
        evidenceTypes: ['calculate', 'interpret'],
      },
    ],
  }
}

function workers(overrides: Partial<FoundationCompilationWorkers> = {}): FoundationCompilationWorkers {
  const base: FoundationCompilationWorkers = {
    async resolveIdentity() {
      return success('identity-1', {
        courseIdentity: {
          subject: 'Business',
          qualification: 'A-level',
          awardingBody: 'AQA',
          specificationId: '7132',
        },
        cohortValidity: {
          status: 'current',
          firstAssessment: '2027',
          notes: [],
        },
        components: [
          { id: 'paper-1', name: 'Paper 1', compulsory: true, marks: 100, durationMinutes: 120 },
        ],
        unresolvedChoices: [],
      })
    },
    async discoverSources() {
      return success('source-1', [{
        id: 'aqa-spec-7132',
        url: officialUrl,
        title: 'A-level Business 7132 specification',
        issuer: 'AQA',
        sourceType: 'specification',
        educationalRole: ['course_identity', 'curriculum', 'assessment'],
        versionOrDate: '2026',
      }])
    },
    async resolveStructuredEvidence() {
      return success('evidence-1', {
        boardAlignmentFacts: [
          {
            id: 'paper-1-fact',
            sourceRef: 'aqa-spec-7132',
            category: 'component',
            value: 'Paper 1: 100 marks, 2 hours',
            verificationStatus: 'verified',
          },
          {
            id: 'ao1-fact',
            sourceRef: 'aqa-spec-7132',
            category: 'assessment_objective',
            value: 'AO1',
            verificationStatus: 'verified',
          },
        ],
        curriculumRequirements: [
          {
            requirementId: 'business-objectives',
            officialReference: '3.1.1',
            requirementSummary: 'Understand business objectives and why they change.',
            skillsOrKnowledge: ['business objectives', 'stakeholder influence'],
            componentScope: ['paper-1'],
            revisionArea: 'What is business?',
            sourceRefs: ['aqa-spec-7132'],
          },
          {
            requirementId: 'business-calculations',
            officialReference: '3.1.2',
            requirementSummary: 'Apply quantitative business calculations.',
            skillsOrKnowledge: ['percentage change', 'interpretation'],
            componentScope: ['paper-1'],
            revisionArea: 'Quantitative skills',
            sourceRefs: ['aqa-spec-7132'],
          },
        ],
      })
    },
    async compileBoardAlignment() {
      return success('board-1', validBoardAlignment())
    },
    async compileCoverage(input) {
      return success('coverage-1', {
        schemaVersion: 1,
        jobId: input.jobId,
        sourceSetFingerprint: input.sourceLicenceRegister.fingerprint,
        requirements: [
          {
            ...input.requirements[0],
            knowledgeNodeIds: ['business-objectives'],
            coverageStatus: 'complete',
          },
          {
            ...input.requirements[1],
            knowledgeNodeIds: ['business-calculations'],
            coverageStatus: 'complete',
          },
        ],
      })
    },
    async compileCourseTruth(input) {
      return success('course-truth-1', validCourseTruth(input.jobId))
    },
    async compileExamTruth(input) {
      return success('exam-truth-1', {
        schemaVersion: 1,
        jobId: input.jobId,
        boardAlignmentFingerprint: input.boardAlignmentFingerprint,
        courseKnowledgeModelFingerprint: input.courseKnowledgeModelFingerprint,
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
        evidenceExpectations: ['Use accurate business knowledge and apply it where the question requires.'],
        quantitativeRequirements: ['percentage change'],
        synopticRequirements: [],
      })
    },
    async compileQuestionFamilies() {
      return success('families-1', [{
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
        markingPackTemplateVersion: '1',
        calibrationStatus: 'not_calibrated',
      }])
    },
  }
  return { ...base, ...overrides }
}

async function compilingJob() {
  return advanceFoundationJob(
    createFoundationJob({ jobId: 'aqa-a-level-business-7132-foundation-1', createdAt: now }),
    'compiling',
    now,
  )
}

function compileInput(store: MemoryArtifactStore, workerSet = workers()) {
  return {
    candidateId: 'aqa-a-level-business-7132-candidate-1',
    officialUrls: [officialUrl],
    founderInstruction: 'Create the exact current AQA A-level Business 7132 Foundation.',
    workers: workerSet,
    artifactStore: store,
    sourceRightsRules,
    now,
    producerVersion: 'foundation-factory-v2',
    implementationHeadSha: headSha,
  }
}

describe('Foundation compilation', () => {
  it('compiles Course Truth and Exam Truth into a complete Foundation Candidate without learner assets', async () => {
    const store = new MemoryArtifactStore()
    const result = await compileFoundationJob({
      job: await compilingJob(),
      ...compileInput(store),
    })

    expect(result.job.state).toBe('compiling')
    expect(result.job.candidate).toEqual(result.candidate)
    expect(result.candidate.sourceRightsStatus).toBe('approved')
    expect(result.candidate.coverageCompleteness).toBe('complete')
    expect(result.candidate.courseTruthCompleteness).toBe('complete')
    expect(result.candidate.examTruthCompleteness).toBe('complete')
    expect(result.candidate.deterministicAssurance.status).toBe('pending')
    expect(result.candidate.independentReview.status).toBe('pending')

    expect(store.writes.map((write) => write.kind)).toEqual([
      'source_licence_register',
      'board_alignment',
      'foundation_coverage_model',
      'course_knowledge_model',
      'assessment_blueprint',
      'question_family',
    ])
    expect(store.writes.some((write) => ['learning', 'practice', 'assessment_item', 'marking_pack'].includes(write.kind))).toBe(false)

    const coverageWrite = store.writes.find((write) => write.kind === 'foundation_coverage_model')
    const coverage = foundationCoverageModelSchema.parse(coverageWrite?.value)
    expect(coverage.requirements.every((requirement) => requirement.knowledgeNodeIds.length > 0)).toBe(true)
    expect('contentRefs' in coverage.requirements[0]).toBe(false)
    expect('learnRequired' in coverage.requirements[0]).toBe(false)
    expect('practiceRequired' in coverage.requirements[0]).toBe(false)
  })

  it('fails closed when source rights cannot be resolved', async () => {
    const store = new MemoryArtifactStore()
    const noRules: FoundationSourceRightsPolicyRule[] = []

    await expect(compileFoundationJob({
      job: await compilingJob(),
      ...compileInput(store),
      sourceRightsRules: noRules,
    })).rejects.toMatchObject({
      name: 'FoundationCompilationError',
      stage: 'source_rights',
    })

    expect(store.writes).toHaveLength(0)
  })

  it('rejects Board Alignment that changes a resolved component contract', async () => {
    const store = new MemoryArtifactStore()
    const workerSet = workers({
      async compileBoardAlignment() {
        return success('board-drift', {
          ...validBoardAlignment(),
          components: [
            { id: 'paper-1', name: 'Paper 1', compulsory: true, marks: 80, durationMinutes: 120 },
          ],
        })
      },
    })

    await expect(compileFoundationJob({
      job: await compilingJob(),
      ...compileInput(store, workerSet),
    })).rejects.toMatchObject({
      name: 'FoundationCompilationError',
      stage: 'board_alignment',
    })
  })

  it('rejects coverage that silently omits a governed curriculum requirement', async () => {
    const store = new MemoryArtifactStore()
    const workerSet = workers({
      async compileCoverage(input) {
        return success('coverage-incomplete', {
          schemaVersion: 1,
          jobId: input.jobId,
          sourceSetFingerprint: input.sourceLicenceRegister.fingerprint,
          requirements: [{
            ...input.requirements[0],
            knowledgeNodeIds: ['business-objectives'],
            coverageStatus: 'complete',
          }],
        })
      },
    })

    await expect(compileFoundationJob({
      job: await compilingJob(),
      ...compileInput(store, workerSet),
    })).rejects.toMatchObject({
      name: 'FoundationCompilationError',
      stage: 'coverage',
    })
  })

  it('rejects Course Truth that does not implement the canonical coverage node set', async () => {
    const store = new MemoryArtifactStore()
    const workerSet = workers({
      async compileCourseTruth(input) {
        return success('course-truth-incomplete', {
          schemaVersion: 1,
          jobId: input.jobId,
          fingerprint: 'provider-value-is-replaced',
          nodes: [validCourseTruth(input.jobId).nodes[0]],
        })
      },
    })

    await expect(compileFoundationJob({
      job: await compilingJob(),
      ...compileInput(store, workerSet),
    })).rejects.toMatchObject({
      name: 'FoundationCompilationError',
      stage: 'course_truth',
    })
  })

  it('rejects Course Truth nodes with no Board Alignment relevance', async () => {
    const store = new MemoryArtifactStore()
    const workerSet = workers({
      async compileCourseTruth(input) {
        const model = validCourseTruth(input.jobId)
        return success('course-truth-unanchored', {
          ...model,
          nodes: model.nodes.map((node) => node.id === 'business-calculations'
            ? { ...node, boardAlignmentRefs: [] }
            : node),
        })
      },
    })

    await expect(compileFoundationJob({
      job: await compilingJob(),
      ...compileInput(store, workerSet),
    })).rejects.toMatchObject({
      name: 'FoundationCompilationError',
      stage: 'course_truth',
    })
  })

  it('rejects Exam Truth bound to stale Board Alignment or Course Truth', async () => {
    const store = new MemoryArtifactStore()
    const workerSet = workers({
      async compileExamTruth(input) {
        return success('exam-truth-stale', {
          schemaVersion: 1,
          jobId: input.jobId,
          boardAlignmentFingerprint: 'stale-board',
          courseKnowledgeModelFingerprint: input.courseKnowledgeModelFingerprint,
          assessmentObjectives: [{ id: 'ao1', weightingPercent: 20 }],
          assessmentRequirements: [{ id: 'written-exam', summary: 'Written examination', componentScope: ['paper-1'] }],
          components: [{ componentId: 'paper-1', questionFamilyIds: [], markTotal: 100, timingMinutes: 120, constraints: [] }],
          commandDemands: [],
          evidenceExpectations: [],
          quantitativeRequirements: [],
          synopticRequirements: [],
        })
      },
    })

    await expect(compileFoundationJob({
      job: await compilingJob(),
      ...compileInput(store, workerSet),
    })).rejects.toMatchObject({
      name: 'FoundationCompilationError',
      stage: 'exam_truth',
    })
  })

  it('rejects Exam Truth that omits a governed assessment requirement', async () => {
    const store = new MemoryArtifactStore()
    const workerSet = workers({
      async compileExamTruth(input) {
        return success('exam-truth-missing-requirement', {
          schemaVersion: 1,
          jobId: input.jobId,
          boardAlignmentFingerprint: input.boardAlignmentFingerprint,
          courseKnowledgeModelFingerprint: input.courseKnowledgeModelFingerprint,
          assessmentObjectives: [{ id: 'ao1', weightingPercent: 20 }],
          assessmentRequirements: [],
          components: [{
            componentId: 'paper-1',
            questionFamilyIds: [],
            markTotal: 100,
            timingMinutes: 120,
            constraints: [],
          }],
          commandDemands: [],
          evidenceExpectations: [],
          quantitativeRequirements: [],
          synopticRequirements: [],
        })
      },
    })

    await expect(compileFoundationJob({
      job: await compilingJob(),
      ...compileInput(store, workerSet),
    })).rejects.toMatchObject({
      name: 'FoundationCompilationError',
      stage: 'exam_truth',
    })
  })

  it('rejects Question Families whose component scope disagrees with Exam Truth', async () => {
    const store = new MemoryArtifactStore()
    const workerSet = workers({
      async compileQuestionFamilies() {
        return success('families-wrong-scope', [{
          schemaVersion: 1,
          id: 'short-explain',
          title: 'Short explain question',
          assessmentObjectiveIds: ['ao1'],
          skillProfile: ['explain'],
          componentScope: [],
          markRange: { min: 2, max: 6 },
          responseShape: 'short developed response',
          contextRequirements: [],
          applicationRequirements: [],
          analysisRequirements: [],
          evaluationRequirements: [],
          commonFailureModes: [],
          markingPackTemplateVersion: '1',
          calibrationStatus: 'not_calibrated',
        }])
      },
    })

    await expect(compileFoundationJob({
      job: await compilingJob(),
      ...compileInput(store, workerSet),
    })).rejects.toBeInstanceOf(FoundationCompilationError)
  })
})
