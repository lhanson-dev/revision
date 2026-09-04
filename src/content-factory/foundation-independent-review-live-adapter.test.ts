import { describe, expect, it } from 'vitest'
import {
  foundationAssessmentBlueprintSchema,
  fingerprintFoundationArtifact,
  type FoundationWorkerExecution,
} from './foundation-compilation'
import type { FoundationStructuredProviderClient } from './foundation-live-adapter'
import type { FoundationIndependentReviewWorkers } from './foundation-independent-review'
import { createFoundationIndependentReviewLiveWorkers } from './foundation-independent-review-live-adapter'
import { courseKnowledgeModelSchema } from './schema'

const reviewedCommit = 'a'.repeat(40)
const foundationFingerprint = 'b'.repeat(64)

type ProviderRunInput = Parameters<FoundationStructuredProviderClient['run']>[0]
type ReviewInput = Parameters<FoundationIndependentReviewWorkers['independentReview']>[0]
type RemediationInput = Parameters<FoundationIndependentReviewWorkers['remediate']>[0]

function success(output: unknown, id: string, contextId: string): FoundationWorkerExecution<unknown> {
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

class CapturingProvider implements FoundationStructuredProviderClient {
  readonly calls: ProviderRunInput[] = []

  async run(input: ProviderRunInput): Promise<FoundationWorkerExecution<unknown>> {
    this.calls.push(input)
    if (input.routeKind === 'independent_review') {
      return success({
        reviewedCommit,
        foundationFingerprint,
        decision: 'pass',
        findings: [],
      }, 'review-run', 'fresh-review-context')
    }
    return success({
      resolvedFindingIds: ['material-finding'],
      resolutionNotes: ['Corrected only the supplied remediation target.'],
      replacements: [],
    }, 'remediation-run', 'fresh-remediation-context')
  }
}

class SchemaValidatingRemediationProvider implements FoundationStructuredProviderClient {
  readonly calls: ProviderRunInput[] = []

  constructor(private readonly remediationOutput: unknown) {}

  async run(input: ProviderRunInput): Promise<FoundationWorkerExecution<unknown>> {
    this.calls.push(input)
    return success(
      input.outputSchema.parse(this.remediationOutput),
      'remediation-run-semantic-only',
      'fresh-remediation-context-semantic-only',
    )
  }
}

function reviewInput(): ReviewInput {
  return {
    jobId: 'foundation-live-review-job',
    candidateId: 'foundation-live-review-candidate',
    reviewedCommit,
    foundationFingerprint,
    courseIdentity: {
      subject: 'Business',
      qualification: 'A-level',
      awardingBody: 'AQA',
      specificationId: '7132',
    },
    cohortValidity: { status: 'current', firstAssessment: '2027', notes: [] },
    sourceEvidence: [],
    artifactIndex: [],
    boardAlignment: null as never,
    coverageModel: null as never,
    courseKnowledgeModel: null as never,
    assessmentBlueprint: null as never,
    questionFamilies: [],
    deterministicAssurance: null as never,
  }
}

function remediationInput(): RemediationInput {
  return {
    jobId: 'foundation-live-review-job',
    sourceCandidateId: 'foundation-live-review-candidate',
    reviewedCommit,
    foundationFingerprint,
    courseIdentity: {
      subject: 'Business',
      qualification: 'A-level',
      awardingBody: 'AQA',
      specificationId: '7132',
    },
    cohortValidity: { status: 'current', firstAssessment: '2027', notes: [] },
    sourceEvidence: [],
    artifactIndex: [],
    boardAlignment: null as never,
    coverageModel: null as never,
    courseKnowledgeModel: null as never,
    assessmentBlueprint: null as never,
    questionFamilies: [],
    triggerReview: null as never,
    targets: [],
  }
}

describe('Foundation independent-review live adapter', () => {
  it('routes educational review through the dedicated independent-review provider boundary', async () => {
    const provider = new CapturingProvider()
    const workers = createFoundationIndependentReviewLiveWorkers({ provider })

    const result = await workers.independentReview(reviewInput())

    expect(result.status).toBe('success')
    expect(provider.calls).toHaveLength(1)
    expect(provider.calls[0].routeKind).toBe('independent_review')
    expect(provider.calls[0].workerId).toBe('content-factory.foundation.independent-review')
    expect(provider.calls[0].instructions).toContain('Do not browse or reconstruct awarding-body prose')
    expect(provider.calls[0].payload).toMatchObject({
      reviewIdentity: { reviewedCommit, foundationFingerprint },
      artifactIndex: [],
    })
  })

  it('routes targeted correction through the bounded generation provider boundary', async () => {
    const provider = new CapturingProvider()
    const workers = createFoundationIndependentReviewLiveWorkers({ provider })

    const result = await workers.remediate(remediationInput())

    expect(result.status).toBe('success')
    expect(provider.calls).toHaveLength(1)
    expect(provider.calls[0].routeKind).toBe('generation')
    expect(provider.calls[0].workerId).toBe('content-factory.foundation.targeted-remediation')
    expect(provider.calls[0].instructions).toContain('Do not modify Source Rights, Board Alignment or Foundation coverage')
    expect(provider.calls[0].instructions).toContain('Do not return or attempt to calculate Course Truth or dependency SHA fingerprints')
    expect(provider.calls[0].payload).toMatchObject({
      remediationIdentity: { reviewedCommit, foundationFingerprint },
      targets: [],
    })
  })

  it('restores compiler-owned fingerprints locally when remediation returns semantic Course Truth and Exam Truth only', async () => {
    const correctedCourseSemantic = {
      schemaVersion: 1 as const,
      jobId: 'foundation-live-review-job',
      nodes: [{
        id: 'business-objectives',
        kind: 'concept' as const,
        summary: 'Businesses set objectives that can conflict and require deliberate trade-offs between priorities.',
        prerequisiteIds: [],
        relatedIds: [],
        formulas: [],
        misconceptions: ['Objectives never change or conflict.'],
        applicationContexts: ['growth', 'survival'],
        depth: 'core' as const,
        sourceRefs: ['revision-review-source'],
        boardAlignmentRefs: ['paper-1', 'ao1'],
        evidenceTypes: ['explain', 'apply'],
      }],
    }
    const correctedExamSemantic = {
      schemaVersion: 1 as const,
      jobId: 'foundation-live-review-job',
      assessmentObjectives: [{ id: 'ao1', weightingPercent: 20 }],
      assessmentRequirements: [{ id: 'written-exam', summary: 'Written examination', componentScope: ['paper-1'] }],
      components: [{ componentId: 'paper-1', questionFamilyIds: ['short-explain'], markTotal: 100, timingMinutes: 120, constraints: ['written examination'] }],
      commandDemands: [{ command: 'explain', cognitiveDemand: 'develop a linked explanation', componentScope: ['paper-1'] }],
      evidenceExpectations: ['Use accurate business knowledge and make relevant trade-offs explicit.'],
      quantitativeRequirements: [],
      synopticRequirements: [],
    }
    const provider = new SchemaValidatingRemediationProvider({
      resolvedFindingIds: ['material-finding'],
      resolutionNotes: ['Corrected Course Truth and rebuilt dependent Exam Truth semantically without model-generated fingerprints.'],
      replacements: [
        {
          artifactKind: 'course_knowledge_model',
          oldRef: 'foundation/course-knowledge-model.json',
          correctedArtifact: correctedCourseSemantic,
        },
        {
          artifactKind: 'assessment_blueprint',
          oldRef: 'foundation/assessment-blueprint.json',
          correctedArtifact: correctedExamSemantic,
        },
      ],
    })
    const workers = createFoundationIndependentReviewLiveWorkers({ provider })
    const sourceCourse = courseKnowledgeModelSchema.parse({
      ...correctedCourseSemantic,
      fingerprint: 'source-course-fingerprint',
      nodes: correctedCourseSemantic.nodes.map((node) => ({ ...node, summary: 'Businesses set objectives that guide decisions.' })),
    })
    const sourceExam = foundationAssessmentBlueprintSchema.parse({
      ...correctedExamSemantic,
      boardAlignmentFingerprint: 'source-board-fingerprint',
      courseKnowledgeModelFingerprint: sourceCourse.fingerprint,
    })

    const result = await workers.remediate({
      ...remediationInput(),
      boardAlignment: { fingerprint: 'source-board-fingerprint' } as RemediationInput['boardAlignment'],
      courseKnowledgeModel: sourceCourse,
      assessmentBlueprint: sourceExam,
    })

    expect(result.status).toBe('success')
    expect(provider.calls).toHaveLength(1)
    if (result.status !== 'success') throw new Error(result.error)
    const output = result.output as {
      replacements: Array<{ artifactKind: string; correctedArtifact: unknown }>
    }
    const courseReplacement = output.replacements.find((replacement) => replacement.artifactKind === 'course_knowledge_model')
    const examReplacement = output.replacements.find((replacement) => replacement.artifactKind === 'assessment_blueprint')
    const correctedCourse = courseKnowledgeModelSchema.parse(courseReplacement?.correctedArtifact)
    const correctedExam = foundationAssessmentBlueprintSchema.parse(examReplacement?.correctedArtifact)
    const expectedCourseFingerprint = await fingerprintFoundationArtifact(correctedCourseSemantic)

    expect(correctedCourse.fingerprint).toBe(expectedCourseFingerprint)
    expect(correctedExam.boardAlignmentFingerprint).toBe('source-board-fingerprint')
    expect(correctedExam.courseKnowledgeModelFingerprint).toBe(expectedCourseFingerprint)
  })
})