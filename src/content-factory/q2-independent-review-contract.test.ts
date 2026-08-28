import { describe, expect, it, vi } from 'vitest'
import { createOpenAIModelAssistedWorkers } from './openai-independent-review-compiler'

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

function reviewInput() {
  const reviewedCommit = 'a'.repeat(40)
  const learningRef = 'fixture:history:learning:industrial-revolution'
  return {
    reviewedCommit,
    contentFingerprint: 'history-content-fingerprint',
    learningRef,
    input: {
      jobId: 'cf-history',
      reviewedCommit,
      contentFingerprint: 'history-content-fingerprint',
      courseIdentity: {
        subject: 'History',
        qualification: 'GCSE',
        awardingBody: 'Example Board',
        specificationId: 'HIS-01',
      },
      sourceEvidence: [],
      boardAlignment: { __ref: 'fixture:history:board-alignment' },
      coverageMap: { __ref: 'fixture:history:coverage-map' },
      courseKnowledgeModel: { __ref: 'fixture:history:knowledge-model' },
      learningBlueprint: { __ref: 'fixture:history:learning-blueprint' },
      assessmentBlueprint: { __ref: 'fixture:history:assessment-blueprint' },
      questionFamilies: [{ __ref: 'fixture:history:question-family:essay' }],
      learningArtifacts: [{
        __ref: learningRef,
        schemaVersion: 1,
        artifactType: 'learning',
        jobId: 'cf-history',
        workUnitId: 'industrial-revolution',
        knowledgeModelFingerprint: 'history-knowledge-fingerprint',
        knowledgeNodeIds: ['industrial-revolution'],
        sourceRefs: ['history-source'],
        content: {
          title: 'Industrial Revolution',
          introduction: 'Introduction',
          sections: [],
          workedExamples: [],
          misconceptions: [],
          nextAction: 'Practise an explanation.',
        },
      }],
      practiceArtifacts: [],
      assessmentItems: [{ __ref: 'fixture:history:assessment-item:essay' }],
      markingPacks: [{ __ref: 'fixture:history:marking-pack:essay' }],
      deterministicValidation: {
        schemaVersion: 1 as const,
        artifactType: 'deterministic_validation_report' as const,
        jobId: 'cf-history',
        reviewedCommit,
        contentFingerprint: 'history-content-fingerprint',
        decision: 'pass' as const,
        checks: [{
          checkId: 'fixture-ready',
          status: 'pass' as const,
          severity: 'informational' as const,
          artifactRefs: [],
          message: 'Deterministic validation passed.',
          evidence: ['provider-free fixture'],
        }],
        createdAt: '2026-08-28T12:00:00Z',
      },
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
    resolveArtifactRef(value) {
      if (typeof value !== 'object' || value === null || !('__ref' in value)) return undefined
      const ref = (value as { __ref?: unknown }).__ref
      return typeof ref === 'string' ? ref : undefined
    },
  })
  return { workers, fetchImpl }
}

describe('Q2 independent-review direct provider contract', () => {
  it('accepts a valid humanities-shaped review in one provider call and derives work-unit scope', async () => {
    const fixture = reviewInput()
    const { workers, fetchImpl } = workersFor({
      reviewedCommit: fixture.reviewedCommit,
      contentFingerprint: fixture.contentFingerprint,
      decision: 'fail_hold',
      findings: [{
        id: 'missing-causal-link',
        severity: 'material',
        issueType: 'pedagogy',
        artifactRef: fixture.learningRef,
        evidence: ['The explanation jumps from invention to impact without a causal bridge.'],
        finding: 'A causal reasoning step is missing.',
        recommendedCorrection: 'Add the missing causal bridge.',
        resolutionStatus: 'open',
      }],
    })

    const result = await workers.independentReview(fixture.input)
    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    expect((result.output as { findings: Array<{ workUnitId?: string }> }).findings[0]?.workUnitId).toBe('industrial-revolution')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(result.provenance.retryCount).toBe(0)
  })

  it('fails closed when a provider finding omits required evidence', async () => {
    const fixture = reviewInput()
    const { workers, fetchImpl } = workersFor({
      reviewedCommit: fixture.reviewedCommit,
      contentFingerprint: fixture.contentFingerprint,
      decision: 'fail_hold',
      findings: [{
        id: 'missing-evidence',
        severity: 'material',
        issueType: 'accuracy',
        artifactRef: fixture.learningRef,
        finding: 'The claim is unsupported.',
        recommendedCorrection: 'Correct the claim.',
        resolutionStatus: 'open',
      }],
    })

    const result = await workers.independentReview(fixture.input)
    expect(result.status).toBe('failure')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('fails closed on an unknown artifact reference', async () => {
    const fixture = reviewInput()
    const { workers, fetchImpl } = workersFor({
      reviewedCommit: fixture.reviewedCommit,
      contentFingerprint: fixture.contentFingerprint,
      decision: 'fail_hold',
      findings: [{
        id: 'unknown-artifact',
        severity: 'material',
        issueType: 'assessment_alignment',
        artifactRef: 'fixture:history:not-governed',
        evidence: ['Unknown artifact.'],
        finding: 'This finding is not bound to a governed artifact.',
        recommendedCorrection: 'Do not accept the reference.',
        resolutionStatus: 'open',
      }],
    })

    const result = await workers.independentReview(fixture.input)
    expect(result.status).toBe('failure')
    if (result.status === 'failure') expect(result.error).toContain('references unknown artifact')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('fails closed on duplicate finding IDs', async () => {
    const fixture = reviewInput()
    const finding = {
      id: 'duplicate-finding',
      severity: 'minor',
      issueType: 'pedagogy',
      artifactRef: fixture.learningRef,
      evidence: ['A minor wording issue.'],
      finding: 'Minor wording could be clearer.',
      recommendedCorrection: 'Clarify the wording.',
      resolutionStatus: 'open',
    }
    const { workers, fetchImpl } = workersFor({
      reviewedCommit: fixture.reviewedCommit,
      contentFingerprint: fixture.contentFingerprint,
      decision: 'conditional_pass',
      findings: [finding, finding],
    })

    const result = await workers.independentReview(fixture.input)
    expect(result.status).toBe('failure')
    if (result.status === 'failure') expect(result.error).toContain('Duplicate independent-review finding id')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('fails closed on mismatched reviewed-commit binding', async () => {
    const fixture = reviewInput()
    const { workers, fetchImpl } = workersFor({
      reviewedCommit: 'b'.repeat(40),
      contentFingerprint: fixture.contentFingerprint,
      decision: 'pass',
      findings: [],
    })

    const result = await workers.independentReview(fixture.input)
    expect(result.status).toBe('failure')
    if (result.status === 'failure') expect(result.error).toContain('review commit')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('fails closed when decision metadata understates a material finding', async () => {
    const fixture = reviewInput()
    const { workers, fetchImpl } = workersFor({
      reviewedCommit: fixture.reviewedCommit,
      contentFingerprint: fixture.contentFingerprint,
      decision: 'pass',
      findings: [{
        id: 'material-but-pass',
        severity: 'material',
        issueType: 'accuracy',
        artifactRef: fixture.learningRef,
        evidence: ['Material problem.'],
        finding: 'Material problem found.',
        recommendedCorrection: 'Correct it.',
        resolutionStatus: 'open',
      }],
    })

    const result = await workers.independentReview(fixture.input)
    expect(result.status).toBe('failure')
    if (result.status === 'failure') expect(result.error).toContain('require fail_hold')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})
