import { describe, expect, it, vi } from 'vitest'
import { createOpenAIModelAssistedWorkers } from './openai-remediation-compiler'

const route = {
  model: 'test-model',
  inputUsdPerMillion: 2,
  cachedInputUsdPerMillion: 0.2,
  outputUsdPerMillion: 12,
  maxOutputTokens: 1_000,
}

function providerResponse(output: unknown) {
  return {
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(output) }] }],
    usage: { input_tokens: 100, output_tokens: 100 },
  }
}

function learningArtifact() {
  return {
    schemaVersion: 1 as const,
    artifactType: 'learning' as const,
    jobId: 'cf-maths',
    workUnitId: 'quadratic-roots',
    knowledgeModelFingerprint: 'maths-knowledge-fingerprint',
    knowledgeNodeIds: ['quadratic-roots'],
    sourceRefs: ['maths-source'],
    content: {
      title: 'Quadratic roots',
      introduction: 'Original introduction.',
      sections: [{
        id: 'quadratic-roots-section-1',
        title: 'Roots',
        explanation: 'Original explanation.',
        keyPoints: ['A root makes the quadratic equal zero.'],
      }],
      workedExamples: [],
      misconceptions: [],
      nextAction: 'Try a practice question.',
      coverageEvidence: [{
        teachingPoint: 'Identify roots of a quadratic.',
        evidence: 'A root makes the quadratic equal zero.',
      }],
    },
  }
}

function remediationInput() {
  return {
    jobId: 'cf-maths',
    reviewedCommit: 'a'.repeat(40),
    courseIdentity: {
      subject: 'Mathematics',
      qualification: 'GCSE',
      awardingBody: 'Example Board',
      specificationId: 'MAT-01',
    },
    target: {
      kind: 'learning' as const,
      artifactRef: 'fixture:maths:learning:quadratic-roots',
      artifact: learningArtifact(),
    },
    findings: [{
      id: 'missing-method-step',
      severity: 'material' as const,
      issueType: 'pedagogy',
      artifactRef: 'fixture:maths:learning:quadratic-roots',
      workUnitId: 'quadratic-roots',
      evidence: ['The method skips the zero-product step.'],
      finding: 'A necessary reasoning step is missing.',
      recommendedCorrection: 'Add the missing zero-product step.',
      resolutionStatus: 'open' as const,
    }],
  }
}

function correctedLearning(overrides: Record<string, unknown> = {}) {
  const original = learningArtifact()
  return {
    ...original,
    ...overrides,
    content: {
      ...original.content,
      introduction: 'Corrected introduction with the missing reasoning step.',
    },
  }
}

function workersFor(output: unknown) {
  const fetchImpl = vi.fn(async () => new Response(JSON.stringify(providerResponse(output)), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })) as typeof fetch
  const workers = createOpenAIModelAssistedWorkers({
    apiKey: 'test-secret',
    generation: route,
    independentReview: route,
    fetchImpl,
    maxRetries: 0,
  })
  return { workers, fetchImpl }
}

describe('Q2 remediation direct provider contract', () => {
  it('accepts a valid mathematics-shaped targeted correction in one provider call', async () => {
    const input = remediationInput()
    const { workers, fetchImpl } = workersFor({
      correctedArtifact: correctedLearning(),
      resolvedFindingIds: ['missing-method-step'],
      resolutionNotes: ['Added the missing zero-product reasoning step only.'],
    })

    const result = await workers.remediate(input)
    expect(result.status).toBe('success')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(result.provenance.retryCount).toBe(0)
  })

  it('fails closed on malformed remediation output without a retry', async () => {
    const input = remediationInput()
    const { workers, fetchImpl } = workersFor({
      correctedArtifact: correctedLearning(),
      resolvedFindingIds: ['missing-method-step'],
    })

    const result = await workers.remediate(input)
    expect(result.status).toBe('failure')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('fails closed when the provider resolves an unknown finding', async () => {
    const input = remediationInput()
    const { workers, fetchImpl } = workersFor({
      correctedArtifact: correctedLearning(),
      resolvedFindingIds: ['not-assigned-to-this-target'],
      resolutionNotes: ['Attempted an unrelated correction.'],
    })

    const result = await workers.remediate(input)
    expect(result.status).toBe('failure')
    if (result.status === 'failure') expect(result.error).toContain('resolve exactly the findings')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('fails closed when the provider expands the correction beyond governed target identity', async () => {
    const input = remediationInput()
    const { workers, fetchImpl } = workersFor({
      correctedArtifact: correctedLearning({ workUnitId: 'different-work-unit' }),
      resolvedFindingIds: ['missing-method-step'],
      resolutionNotes: ['Changed the target identity.'],
    })

    const result = await workers.remediate(input)
    expect(result.status).toBe('failure')
    if (result.status === 'failure') expect(result.error).toContain('may not expand or change governed target identity')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('fails closed when a learning correction invents a dependent Marking Pack', async () => {
    const input = remediationInput()
    const { workers, fetchImpl } = workersFor({
      correctedArtifact: correctedLearning(),
      correctedDependentMarkingPack: { unexpected: true },
      resolvedFindingIds: ['missing-method-step'],
      resolutionNotes: ['Expanded scope beyond the learning artifact.'],
    })

    const result = await workers.remediate(input)
    expect(result.status).toBe('failure')
    if (result.status === 'failure') expect(result.error).toContain('may not return a dependent Marking Pack')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})
