import { describe, expect, it } from 'vitest'
import type { FoundationWorkerExecution } from './foundation-compilation'
import type { FoundationStructuredProviderClient } from './foundation-live-adapter'
import type { FoundationIndependentReviewWorkers } from './foundation-independent-review'
import { createFoundationIndependentReviewLiveWorkers } from './foundation-independent-review-live-adapter'

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
    expect(provider.calls[0].instructions).toContain('Do not attempt to calculate SHA fingerprints')
    expect(provider.calls[0].payload).toMatchObject({
      remediationIdentity: { reviewedCommit, foundationFingerprint },
      targets: [],
    })
  })
})
