import { z } from 'zod'
import { describe, expect, it } from 'vitest'
import { advanceFoundationJob, createFoundationJob } from './foundation-lifecycle'
import {
  compileFoundationJob,
  foundationCoverageModelSchema,
  type FoundationCompilationArtifactKind,
  type FoundationCompilationArtifactStore,
  type FoundationCoverageModel,
  type FoundationAssessmentBlueprint,
  type FoundationWorkerExecution,
} from './foundation-compilation'
import {
  createAqaAlevelBusiness7132FoundationLiveWorkers,
  type FoundationStructuredProviderClient,
} from './foundation-live-adapter'
import { loadGovernedFoundationSourceRightsRules } from './foundation-source-rights-registry'
import {
  AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED,
  AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED_ID,
} from './source-seeds/aqa-a-level-business-7132-2027'

const headSha = 'a'.repeat(40)
const now = '2026-09-03T19:00:00+01:00'

class MemoryStore implements FoundationCompilationArtifactStore {
  readonly writes: Array<{ kind: FoundationCompilationArtifactKind; ref: string; value: unknown }> = []
  async writeJson(input: { jobId: string; kind: FoundationCompilationArtifactKind; fingerprint: string; value: unknown }) {
    const ref = `foundation:${input.jobId}:${input.kind}:${input.fingerprint.slice(0, 12)}`
    this.writes.push({ kind: input.kind, ref, value: structuredClone(input.value) })
    return { ref }
  }
}

function success(output: unknown, workerId: string): FoundationWorkerExecution<unknown> {
  return {
    status: 'success',
    output,
    provenance: {
      id: `${workerId}-run`,
      contextId: `${workerId}-fresh-context`,
      contractVersion: '1',
      provider: 'fake-openai',
      model: 'fixture-model',
      usageCost: 0.01,
    },
  }
}

class FakeProvider implements FoundationStructuredProviderClient {
  readonly calls: string[] = []

  async run(input: Parameters<FoundationStructuredProviderClient['run']>[0]) {
    this.calls.push(input.workerId)
    const payload = input.payload as Record<string, unknown>
    if (input.workerId.endsWith('course-truth')) {
      const canonicalNodes = payload.canonicalKnowledgeNodes as Array<{
        id: string
        knowledgeItem: string
        revisionArea: string
      }>
      const allowedNodeIds = new Set(payload.allowedNodeIds as string[])
      expect(canonicalNodes.every((node) => allowedNodeIds.has(node.id))).toBe(true)
      return success({
        nodes: canonicalNodes.map((node) => ({
          id: node.id,
          kind: node.knowledgeItem.toLowerCase().includes('ratio') || node.knowledgeItem.toLowerCase().includes('percentage') ? 'skill' : 'concept',
          summary: `Revision-authored atomic Course Truth for ${node.knowledgeItem} within ${node.revisionArea}.`,
          prerequisiteIds: [],
          relatedIds: [],
          formulas: [],
          misconceptions: [`A misconception specific to ${node.knowledgeItem}.`],
          applicationContexts: [`Apply ${node.knowledgeItem} to a business decision.`],
          depth: 'core',
          evidenceTypes: ['explain', 'apply', 'analyse'],
        })),
      }, input.workerId)
    }
    if (input.workerId.endsWith('exam-truth')) {
      return success({
        commandDemands: [
          { command: 'calculate', cognitiveDemand: 'apply an appropriate quantitative method accurately', componentScope: ['paper-1', 'paper-2', 'paper-3'] },
          { command: 'analyse', cognitiveDemand: 'develop contextual chains of reasoning', componentScope: ['paper-1', 'paper-2', 'paper-3'] },
          { command: 'evaluate', cognitiveDemand: 'weigh evidence and reach a supported contextual judgement', componentScope: ['paper-1', 'paper-2', 'paper-3'] },
        ],
        evidenceExpectations: ['Use accurate business knowledge, contextual application and evidence-based reasoning.'],
        quantitativeRequirements: ['Use the governed quantitative coverage plan and credit interpretation as well as method use.'],
        synopticRequirements: ['Connect relevant functional and strategic areas when the task demands it.'],
      }, input.workerId)
    }
    if (input.workerId.endsWith('question-families')) {
      const jsonSchema = z.toJSONSchema(input.outputSchema)
      expect(jsonSchema.type).toBe('object')
      expect(jsonSchema.properties).toHaveProperty('questionFamilies')
      const requested = payload.requestedFamilyIds as string[]
      const blueprint = payload.assessmentBlueprint as FoundationAssessmentBlueprint
      expect(blueprint.quantitativeCoveragePlan).toMatchObject({
        minimumOverallPercent: 10,
        totalAssessmentMarks: 300,
        minimumQuantitativeMarks: 30,
        generationValidation: 'sum_quantitative_marks_gte_minimum',
        interpretationCreditRequired: true,
      })
      const componentFor = (id: string) => id.startsWith('paper1-') ? 'paper-1' : id.startsWith('paper2-') ? 'paper-2' : 'paper-3'
      return success({
        questionFamilies: requested.map((id) => ({
          schemaVersion: 1,
          id,
          title: id.replaceAll('-', ' '),
          assessmentObjectiveIds: ['ao1', 'ao2', 'ao3', 'ao4'],
          skillProfile: ['business knowledge', 'application', 'analysis', 'evaluation', 'quantitative evidence where authentic'],
          componentScope: [componentFor(id)],
          markRange: { min: 1, max: id === 'paper3-case-study' ? 100 : id === 'paper2-data-response' ? 40 : id === 'paper1-essay' ? 25 : id === 'paper1-short-answer' ? 35 : 15 },
          responseShape: 'Revision-owned exam-style response contract',
          contextRequirements: id.includes('data-response') || id.includes('case-study') ? ['original Revision-owned business context'] : [],
          applicationRequirements: ['apply relevant business knowledge when context is provided'],
          analysisRequirements: ['develop linked reasoning where marks require analysis'],
          evaluationRequirements: ['reach supported judgement where marks require evaluation'],
          commonFailureModes: ['assertion without development'],
          markingPackTemplateVersion: 'foundation-v1',
          calibrationStatus: 'not_calibrated',
        })),
      }, input.workerId)
    }
    throw new Error(`Unexpected provider worker ${input.workerId}`)
  }

  budgetSnapshot() {
    return { maxSpendUsd: 5, conservativeConsumedUsd: this.calls.length * 0.01 }
  }
}

const fetchImpl: typeof fetch = async () => new Response([
  'Business Open Government Licence assessment objectives',
  'Business Fundamentals CC BY 4.0 content can be downloaded or copied licensing of the material',
  'A-level Business 7132 outgoing 2027 Paper 1 Paper 2 Paper 3 100 marks AO1 AO4',
  AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED_ID,
  'governed_main_only',
].join(' '), { status: 200 })

async function compilingJob() {
  return advanceFoundationJob(createFoundationJob({ jobId: 'aqa-a-level-business-7132-foundation-live-proof', createdAt: now }), 'compiling', now)
}

describe('Foundation live adapter', () => {
  it('loads source-rights rules only through the governed-main boundary', async () => {
    await expect(loadGovernedFoundationSourceRightsRules({
      repository: 'lhanson-dev/revision',
      gitRef: 'refs/heads/content-factory-foundation-live-proof',
      headSha,
    })).rejects.toThrow('foundation_source_rights_registry_requires_approved_main')

    const loaded = await loadGovernedFoundationSourceRightsRules({
      repository: 'lhanson-dev/revision',
      gitRef: 'refs/heads/main',
      headSha,
    })
    expect(loaded.rules.some((rule) => rule.issuer === 'AQA' && rule.useClass === 'REFERENCE_ONLY')).toBe(true)
    expect(loaded.rules.some((rule) => rule.issuer === 'Revision' && rule.useClass === 'REVISION_OWNED')).toBe(true)
    expect(loaded.registryFingerprint).toMatch(/^[0-9a-f]{64}$/)
    expect(loaded.approvalEvidenceRef).toContain(`:${loaded.registryFingerprint}@${headSha}`)
    expect(loaded.authorityRef).toContain(headSha)
  })

  it('compiles granular Course Truth and an enforceable quantitative Exam Truth invariant with zero learner assets', async () => {
    const provider = new FakeProvider()
    const store = new MemoryStore()
    const rights = await loadGovernedFoundationSourceRightsRules({ repository: 'lhanson-dev/revision', gitRef: 'refs/heads/main', headSha })
    const result = await compileFoundationJob({
      job: await compilingJob(),
      candidateId: 'aqa-a-level-business-7132-candidate-live-proof',
      officialUrls: ['https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification'],
      founderInstruction: 'Compile a new AQA A-level Business 7132 Foundation for the 2027 examination cohort. Generate no learner-facing assets.',
      workers: createAqaAlevelBusiness7132FoundationLiveWorkers({ provider, fetchImpl }),
      artifactStore: store,
      sourceRightsRules: rights.rules,
      now,
      producerVersion: 'foundation-live-adapter-v2',
      implementationHeadSha: headSha,
    })

    expect(result.job.state).toBe('compiling')
    expect(result.candidate.courseIdentity).toMatchObject({ awardingBody: 'AQA', specificationId: '7132' })
    expect(result.candidate.cohortValidity).toMatchObject({ status: 'outgoing', lastAssessment: '2027' })
    expect(result.candidate.courseTruthCompleteness).toBe('complete')
    expect(result.candidate.examTruthCompleteness).toBe('complete')
    expect(result.candidate.deterministicAssurance.status).toBe('pending')
    expect(result.candidate.independentReview.status).toBe('pending')
    expect(provider.calls).toEqual([
      'content-factory.foundation.course-truth',
      'content-factory.foundation.exam-truth',
      'content-factory.foundation.question-families',
    ])
    expect(store.writes.map((write) => write.kind)).toEqual([
      'source_licence_register',
      'board_alignment',
      'foundation_coverage_model',
      'course_knowledge_model',
      'assessment_blueprint',
      'question_family',
      'question_family',
      'question_family',
      'question_family',
      'question_family',
    ])

    const coverage = store.writes.find((write) => write.kind === 'foundation_coverage_model')?.value as FoundationCoverageModel
    expect(coverage.schemaVersion).toBe(2)
    const governedById = new Map(AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED.requirements.map((requirement) => [requirement.requirementId, requirement]))
    for (const requirement of coverage.requirements) {
      expect(requirement.knowledgeNodeIds).toHaveLength(governedById.get(requirement.requirementId)!.skillsOrKnowledge.length)
      expect(requirement.knowledgeNodeIds.every((id) => id.startsWith(`${requirement.requirementId}.k`))).toBe(true)
    }
    expect(coverage.requirements.flatMap((requirement) => requirement.knowledgeNodeIds).length)
      .toBeGreaterThan(coverage.requirements.length)

    const courseTruth = store.writes.find((write) => write.kind === 'course_knowledge_model')?.value as { nodes: Array<{ id: string; summary: string }> }
    expect(courseTruth.nodes).toHaveLength(coverage.requirements.flatMap((requirement) => requirement.knowledgeNodeIds).length)
    expect(courseTruth.nodes.some((node) => node.id === 'marketing-analysis.k01')).toBe(true)
    expect(courseTruth.nodes.some((node) => node.summary.toLowerCase().includes('market research'))).toBe(true)
    expect(JSON.stringify(courseTruth)).toContain(AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED_ID)

    const blueprint = store.writes.find((write) => write.kind === 'assessment_blueprint')?.value as FoundationAssessmentBlueprint
    expect(blueprint.schemaVersion).toBe(2)
    expect(blueprint.quantitativeCoveragePlan).toEqual({
      sourceAssessmentRequirementId: 'quantitative-minimum',
      scope: 'qualification_total',
      minimumOverallPercent: 10,
      totalAssessmentMarks: 300,
      minimumQuantitativeMarks: 30,
      eligibleQuestionFamilyIds: ['paper1-mcq', 'paper1-short-answer', 'paper1-essay', 'paper2-data-response', 'paper3-case-study'],
      generationValidation: 'sum_quantitative_marks_gte_minimum',
      interpretationCreditRequired: true,
    })

    expect(store.writes.some((write) => ['learning', 'practice', 'assessment_item', 'marking_pack'].includes(write.kind))).toBe(false)
  })

  it('fails v2 coverage that collapses governed knowledge items into too few canonical nodes', () => {
    const requirement = AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED.requirements[0]
    expect(() => foundationCoverageModelSchema.parse({
      schemaVersion: 2,
      jobId: 'test-job',
      sourceSetFingerprint: 'source-fingerprint',
      requirements: [{ ...requirement, knowledgeNodeIds: [requirement.requirementId], coverageStatus: 'complete' }],
    })).toThrow('requires at least one canonical knowledge node for every governed skillsOrKnowledge item')
  })

  it('fails closed before model execution when live source preflight fails', async () => {
    const provider = new FakeProvider()
    const store = new MemoryStore()
    const rights = await loadGovernedFoundationSourceRightsRules({ repository: 'lhanson-dev/revision', gitRef: 'refs/heads/main', headSha })
    const badFetch: typeof fetch = async () => new Response('unexpected page', { status: 200 })

    await expect(compileFoundationJob({
      job: await compilingJob(),
      candidateId: 'aqa-a-level-business-7132-candidate-preflight-fail',
      officialUrls: ['https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification'],
      founderInstruction: 'Compile the Foundation only.',
      workers: createAqaAlevelBusiness7132FoundationLiveWorkers({ provider, fetchImpl: badFetch }),
      artifactStore: store,
      sourceRightsRules: rights.rules,
      now,
      producerVersion: 'foundation-live-adapter-v2',
      implementationHeadSha: headSha,
    })).rejects.toMatchObject({ stage: 'source_discovery' })

    expect(provider.calls).toHaveLength(0)
    expect(store.writes).toHaveLength(0)
  })
})
