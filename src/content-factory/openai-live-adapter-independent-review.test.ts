import { describe, expect, it, vi } from 'vitest'
import { createOpenAIModelAssistedWorkers } from './openai-live-adapter'

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

describe('OpenAI independent review provider boundary', () => {
  it('removes model discretion over workUnitId and derives governed scope from the referenced artifact', async () => {
    const reviewedCommit = 'a'.repeat(40)
    const learningRef = 'pilot-artifact:learning:1'
    const assessmentRef = 'pilot-artifact:assessment-item:1'

    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as {
        instructions: string
        text: { format: { schema: Record<string, unknown> } }
      }
      expect(body.instructions).toContain('Do not return workUnitId')
      expect(JSON.stringify(body.text.format.schema)).not.toContain('workUnitId')

      return new Response(JSON.stringify(providerResponse({
        reviewedCommit,
        contentFingerprint: 'content-fingerprint',
        decision: 'fail_hold',
        findings: [
          {
            id: 'learning-pedagogy-gap',
            severity: 'material',
            issueType: 'pedagogy',
            artifactRef: learningRef,
            workUnitId: 'assessment-set',
            evidence: ['The explanation skips a required conceptual bridge.'],
            finding: 'The learning explanation needs a clearer reasoning step.',
            recommendedCorrection: 'Add the missing reasoning bridge.',
            resolutionStatus: 'open',
          },
          {
            id: 'assessment-component-format-mismatch',
            severity: 'material',
            issueType: 'assessment_alignment',
            artifactRef: assessmentRef,
            workUnitId: 'assessment-set',
            evidence: ['The assessment format does not align with the target component.'],
            finding: 'The assessment item format needs correction.',
            recommendedCorrection: 'Correct the assessment item against the governed component contract.',
            resolutionStatus: 'open',
          },
        ],
      })), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }) as typeof fetch

    const workers = createOpenAIModelAssistedWorkers({
      apiKey: 'test-secret',
      generation: route,
      independentReview: route,
      fetchImpl,
      maxRetries: 2,
      resolveArtifactRef(value) {
        if (typeof value !== 'object' || value === null || !('__ref' in value)) return undefined
        const ref = (value as { __ref?: unknown }).__ref
        return typeof ref === 'string' ? ref : undefined
      },
    })

    const result = await workers.independentReview({
      jobId: 'cf-business',
      reviewedCommit,
      contentFingerprint: 'content-fingerprint',
      courseIdentity: {
        subject: 'Business',
        qualification: 'AS Level',
        awardingBody: 'AQA',
        specificationId: '7131',
      },
      sourceEvidence: [],
      boardAlignment: { __ref: 'pilot-artifact:board-alignment:1' },
      coverageMap: { __ref: 'pilot-artifact:coverage-map:1' },
      courseKnowledgeModel: { __ref: 'pilot-artifact:knowledge-model:1' },
      learningBlueprint: { __ref: 'pilot-artifact:learning-blueprint:1' },
      assessmentBlueprint: { __ref: 'pilot-artifact:assessment-blueprint:1' },
      questionFamilies: [],
      learningArtifacts: [{
        __ref: learningRef,
        schemaVersion: 1,
        artifactType: 'learning',
        jobId: 'cf-business',
        workUnitId: 'business-foundations',
        knowledgeModelFingerprint: 'knowledge-model-fingerprint',
        knowledgeNodeIds: ['business-foundations'],
        sourceRefs: ['dfe-business'],
        content: {
          title: 'Business foundations',
          introduction: 'Introduction',
          sections: [],
          workedExamples: [],
          misconceptions: [],
          nextAction: 'Practise the concept.',
        },
      }],
      practiceArtifacts: [],
      assessmentItems: [{ __ref: assessmentRef }],
      markingPacks: [],
      deterministicValidation: {
        schemaVersion: 1,
        artifactType: 'deterministic_validation_report',
        jobId: 'cf-business',
        reviewedCommit,
        contentFingerprint: 'content-fingerprint',
        decision: 'pass',
        checks: [{
          checkId: 'pilot-ready',
          status: 'pass',
          severity: 'informational',
          artifactRefs: [],
          message: 'Deterministic validation passed.',
          evidence: ['test fixture'],
        }],
        createdAt: '2026-08-26T12:00:00Z',
      },
    })

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    const output = result.output as { findings: Array<{ id: string; workUnitId?: string }> }
    expect(output.findings.find((finding) => finding.id === 'learning-pedagogy-gap')?.workUnitId).toBe('business-foundations')
    expect(output.findings.find((finding) => finding.id === 'assessment-component-format-mismatch')?.workUnitId).toBeUndefined()
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(result.provenance.retryCount).toBe(0)
  })
})
