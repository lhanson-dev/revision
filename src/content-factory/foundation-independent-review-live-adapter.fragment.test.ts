import { describe, expect, it } from 'vitest'
import type { FoundationStructuredProviderClient } from './foundation-live-adapter'
import type { FoundationWorkerExecution } from './foundation-compilation'
import type { FoundationIndependentReviewWorkers } from './foundation-independent-review'
import { createFoundationIndependentReviewLiveWorkers } from './foundation-independent-review-live-adapter'
import { courseKnowledgeModelSchema } from './schema'

type ProviderRunInput = Parameters<FoundationStructuredProviderClient['run']>[0]
type RemediationInput = Parameters<FoundationIndependentReviewWorkers['remediate']>[0]

function success(output: unknown): FoundationWorkerExecution<unknown> {
  return {
    status: 'success',
    output,
    provenance: {
      id: 'fragment-remediation-run',
      contextId: 'fresh-fragment-remediation-context',
      contractVersion: '1',
      provider: 'test-provider',
      model: 'test-model',
    },
  }
}

class FragmentProvider implements FoundationStructuredProviderClient {
  readonly calls: ProviderRunInput[] = []

  constructor(private readonly correctedNode: Record<string, unknown>) {}

  async run(input: ProviderRunInput): Promise<FoundationWorkerExecution<unknown>> {
    this.calls.push(input)
    return success(input.outputSchema.parse({
      resolvedFindingIds: ['percentage-change-formula'],
      resolutionNotes: ['Corrected only the affected quantitative Course Truth node.'],
      replacements: [{
        artifactKind: 'course_knowledge_model',
        oldRef: 'foundation/course-truth.json',
        correctedArtifact: {
          schemaVersion: 1,
          jobId: 'foundation-fragment-job',
          nodes: [this.correctedNode],
        },
      }],
    }))
  }
}

function node(input: {
  id: string
  summary?: string
  prerequisiteIds?: string[]
  relatedIds?: string[]
}) {
  return {
    id: input.id,
    kind: 'concept' as const,
    summary: input.summary ?? `Knowledge for ${input.id}`,
    prerequisiteIds: input.prerequisiteIds ?? [],
    relatedIds: input.relatedIds ?? [],
    formulas: [],
    misconceptions: [],
    applicationContexts: [],
    depth: 'core' as const,
    sourceRefs: ['revision-owned-seed'],
    boardAlignmentRefs: ['paper-1'],
    evidenceTypes: ['explain'],
  }
}

function sourceCourse() {
  return courseKnowledgeModelSchema.parse({
    schemaVersion: 1,
    jobId: 'foundation-fragment-job',
    fingerprint: 'source-course-fingerprint',
    nodes: [
      node({ id: 'quantitative-skills.k01' }),
      node({
        id: 'quantitative-skills.k02',
        summary: 'Percentage change compares a change with the original value.',
        prerequisiteIds: ['quantitative-skills.k01'],
        relatedIds: ['marketing-analysis.k05', 'financial-performance.k04'],
      }),
      node({ id: 'marketing-analysis.k05' }),
      node({ id: 'financial-performance.k04' }),
    ],
  })
}

function remediationInput(): RemediationInput {
  const courseKnowledgeModel = sourceCourse()
  return {
    jobId: 'foundation-fragment-job',
    sourceCandidateId: 'foundation-fragment-candidate',
    reviewedCommit: 'a'.repeat(40),
    foundationFingerprint: 'b'.repeat(64),
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
    courseKnowledgeModel,
    assessmentBlueprint: null as never,
    questionFamilies: [],
    triggerReview: null as never,
    targets: [],
  }
}

describe('Foundation Course Truth remediation fragment normalisation', () => {
  it('merges a corrected node into the complete Course Truth graph before referential validation', async () => {
    const correctedNode = node({
      id: 'quantitative-skills.k02',
      summary: 'Percentage change is calculated using the original value as the denominator.',
      prerequisiteIds: ['quantitative-skills.k01'],
      relatedIds: ['marketing-analysis.k05', 'financial-performance.k04'],
    })
    const provider = new FragmentProvider(correctedNode)
    const workers = createFoundationIndependentReviewLiveWorkers({ provider })

    const result = await workers.remediate(remediationInput())

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    const output = result.output as {
      replacements: Array<{ artifactKind: string; correctedArtifact: unknown }>
    }
    const replacement = output.replacements.find((entry) => entry.artifactKind === 'course_knowledge_model')
    const corrected = courseKnowledgeModelSchema.parse(replacement?.correctedArtifact)

    expect(corrected.nodes).toHaveLength(4)
    expect(corrected.nodes.find((entry) => entry.id === 'quantitative-skills.k02')?.summary)
      .toBe('Percentage change is calculated using the original value as the denominator.')
    expect(corrected.nodes.find((entry) => entry.id === 'quantitative-skills.k01')?.summary)
      .toBe('Knowledge for quantitative-skills.k01')
    expect(corrected.fingerprint).not.toBe('source-course-fingerprint')
    expect(provider.calls[0].instructions).toContain('Revision preserves omitted canonical nodes')
  })

  it('still fails closed when a patched node introduces a genuinely unknown Course Truth reference', async () => {
    const correctedNode = node({
      id: 'quantitative-skills.k02',
      prerequisiteIds: ['quantitative-skills.k01'],
      relatedIds: ['unknown-topic.k99'],
    })
    const provider = new FragmentProvider(correctedNode)
    const workers = createFoundationIndependentReviewLiveWorkers({ provider })

    const result = await workers.remediate(remediationInput())

    expect(result.status).toBe('failure')
    if (result.status !== 'failure') throw new Error('Expected remediation normalisation to fail closed')
    expect(result.error).toContain('remediation_normalisation')
    expect(result.error).toContain('unknown node unknown-topic.k99')
  })
})
