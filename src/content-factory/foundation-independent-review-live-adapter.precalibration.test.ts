import { describe, expect, it } from 'vitest'
import {
  foundationAssessmentBlueprintSchema,
  type FoundationWorkerExecution,
} from './foundation-compilation'
import type { FoundationStructuredProviderClient } from './foundation-live-adapter'
import type { FoundationIndependentReviewWorkers } from './foundation-independent-review'
import { createFoundationIndependentReviewLiveWorkers } from './foundation-independent-review-live-adapter'

type ProviderRunInput = Parameters<FoundationStructuredProviderClient['run']>[0]
type RemediationInput = Parameters<FoundationIndependentReviewWorkers['remediate']>[0]

function success(output: unknown): FoundationWorkerExecution<unknown> {
  return {
    status: 'success',
    output,
    provenance: {
      id: 'precalibration-remediation-run',
      contextId: 'fresh-precalibration-remediation-context',
      contractVersion: '1',
      provider: 'test-provider',
      model: 'test-model',
    },
  }
}

function paper3Family() {
  return {
    schemaVersion: 1 as const,
    id: 'paper3-case-study',
    title: 'Paper 3 case study',
    assessmentObjectiveIds: ['ao1', 'ao2', 'ao3', 'ao4'],
    skillProfile: ['business knowledge', 'application', 'analysis', 'evaluation'],
    componentScope: ['paper-3'],
    markRange: { min: 5, max: 25 },
    responseShape: 'Six questions using a fixed 5/10/15/20/25/25 mark sequence and 6/12/18/24/30/30 minute pattern.',
    contextRequirements: ['original Revision-owned case study'],
    applicationRequirements: ['apply relevant business knowledge'],
    analysisRequirements: ['develop linked reasoning'],
    evaluationRequirements: ['reach supported judgement'],
    commonFailureModes: ['assertion without development'],
    markingPackTemplateVersion: 'foundation-v1',
    calibrationStatus: 'not_calibrated' as const,
  }
}

class Paper3RemediationProvider implements FoundationStructuredProviderClient {
  readonly calls: ProviderRunInput[] = []

  async run(input: ProviderRunInput) {
    this.calls.push(input)
    return success(input.outputSchema.parse({
      resolvedFindingIds: ['paper3-mark-and-timing-demand-is-not-calibrated'],
      resolutionNotes: ['Rebuilt the Paper 3 family from aggregate assessment structure.'],
      replacements: [{
        artifactKind: 'question_family',
        oldRef: 'foundation:paper3-family',
        correctedArtifact: paper3Family(),
      }],
    }))
  }
}

function blueprint() {
  return foundationAssessmentBlueprintSchema.parse({
    schemaVersion: 2,
    jobId: 'precalibration-remediation-job',
    boardAlignmentFingerprint: 'board-fingerprint',
    courseKnowledgeModelFingerprint: 'course-fingerprint',
    assessmentObjectives: [{ id: 'ao1' }, { id: 'ao2' }, { id: 'ao3' }, { id: 'ao4' }],
    assessmentRequirements: [{
      id: 'paper3-structure',
      summary: 'Paper 3 is a compulsory two-hour, 100-mark paper containing one compulsory case study followed by approximately six questions.',
      componentScope: ['paper-3'],
    }],
    components: [{
      componentId: 'paper-3',
      questionFamilyIds: ['paper3-case-study'],
      markTotal: 100,
      timingMinutes: 120,
      constraints: ['one compulsory case study followed by approximately six questions'],
    }],
    commandDemands: [],
    evidenceExpectations: [],
    quantitativeRequirements: [],
    synopticRequirements: [],
  })
}

function remediationInput(): RemediationInput {
  return {
    jobId: 'precalibration-remediation-job',
    sourceCandidateId: 'precalibration-remediation-candidate',
    reviewedCommit: 'a'.repeat(40),
    foundationFingerprint: 'b'.repeat(64),
    courseIdentity: {
      subject: 'Business',
      qualification: 'A-level',
      awardingBody: 'AQA',
      specificationId: '7132',
    },
    cohortValidity: { status: 'outgoing', lastAssessment: '2027', notes: [] },
    sourceEvidence: [],
    artifactIndex: [],
    boardAlignment: null as never,
    coverageModel: null as never,
    courseKnowledgeModel: null as never,
    assessmentBlueprint: blueprint(),
    questionFamilies: [],
    triggerReview: null as never,
    targets: [],
  }
}

describe('Foundation remediation pre-calibration assembly boundary', () => {
  it('normalises a rigid Paper 3 remediation before the replacement reaches the core', async () => {
    const provider = new Paper3RemediationProvider()
    const workers = createFoundationIndependentReviewLiveWorkers({ provider })

    const result = await workers.remediate(remediationInput())

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    expect(provider.calls[0].instructions).toContain('do not invent fixed constituent mark sequences')
    expect(result.output).toMatchObject({
      replacements: [{
        artifactKind: 'question_family',
        correctedArtifact: {
          id: 'paper3-case-study',
          markRange: { min: 1, max: 100 },
          responseShape: expect.stringContaining('remain unfixed until qualified calibration'),
          calibrationStatus: 'not_calibrated',
        },
      }],
    })
  })
})
