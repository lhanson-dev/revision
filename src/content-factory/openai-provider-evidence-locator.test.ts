import { describe, expect, it, vi } from 'vitest'
import { createOpenAIModelAssistedWorkers } from './openai-live-adapter'

const route = {
  model: 'test-model',
  inputUsdPerMillion: 2,
  cachedInputUsdPerMillion: 0.2,
  outputUsdPerMillion: 12,
  maxOutputTokens: 1_000,
}

const courseIdentity = {
  subject: 'Business',
  qualification: 'AS Level',
  awardingBody: 'Test Board',
  specificationId: 'business-1',
}

const knowledgeNodes = [{
  id: 'ownership',
  kind: 'concept' as const,
  summary: 'Understand ownership and shareholder returns.',
  formulas: [],
  misconceptions: ['Shareholders always receive all profit as dividends.'],
  applicationContexts: ['A retailer deciding whether to reinvest profit.'],
  depth: 'core' as const,
  evidenceTypes: ['explanation'],
}]

function responseBody(output: unknown) {
  return {
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(output) }] }],
    usage: { input_tokens: 100, output_tokens: 100 },
  }
}

function workers(fetchImpl: typeof fetch) {
  return createOpenAIModelAssistedWorkers({
    apiKey: 'test-secret',
    generation: route,
    independentReview: route,
    fetchImpl,
    maxRetries: 0,
  })
}

describe('Content Factory provider coverage evidence locations', () => {
  it('resolves Learn evidence locations to exact generated learner text', async () => {
    const exactEvidence = 'Shareholders expect returns such as dividends, while retained profit can support future growth.'
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as {
        instructions: string
        text: { format: { schema: { properties?: Record<string, unknown> } } }
      }
      expect(body.instructions).toContain('structured location')
      expect(body.instructions).toContain('do not copy or paraphrase the evidence text')
      expect(body.text.format.schema.properties).toHaveProperty('coverageEvidence')

      return new Response(JSON.stringify(responseBody({
        title: 'Ownership and shareholder returns',
        introduction: 'Ownership affects control, finance and how returns are distributed.',
        sections: [{
          title: 'Shareholder returns',
          explanation: exactEvidence,
          keyPoints: ['Dividends are one possible shareholder return.'],
        }],
        misconceptions: [{
          misconception: 'All profit must be paid as dividends.',
          correction: 'A business can retain profit for reinvestment instead of paying it all as dividends.',
        }],
        nextAction: 'Compare immediate dividends with reinvestment for growth.',
        coverageEvidence: [{
          teachingPoint: 'shareholders and returns',
          location: { area: 'section_explanation', itemIndex: 1, detailIndex: 1 },
        }],
      })), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }) as typeof fetch

    const result = await workers(fetchImpl).generateLearningCollateral({
      jobId: 'cf-locator-learn',
      courseIdentity,
      workUnit: {
        id: 'ownership-learn',
        title: 'Ownership',
        requirementIds: ['ownership'],
        knowledgeNodeIds: ['ownership'],
        learningModes: ['explanation'],
        requiredOutputs: ['learning'],
        scope: 'course',
        componentIds: [],
      },
      knowledgeModelFingerprint: 'knowledge-model-v1',
      requiredTeachingPoints: ['shareholders and returns'],
      knowledgeNodes,
    })

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    expect(result.provenance.contractVersion).toBe('4')
    expect((result.output as { coverageEvidence: Array<{ evidence: string }> }).coverageEvidence).toEqual([
      { teachingPoint: 'shareholders and returns', evidence: exactEvidence },
    ])
  })

  it('resolves Practice evidence locations to exact generated activity text', async () => {
    const exactEvidence = 'Explain why retaining profit may reduce dividends now but support shareholder returns later.'
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(responseBody({
      title: 'Ownership practice',
      instructions: 'Answer the short question.',
      activitiesByMode: {
        short_answer: [{
          prompt: exactEvidence,
          expectedResponse: 'Retained profit can finance growth, potentially increasing future returns.',
          explanation: 'Shareholders can trade off immediate dividends against reinvestment.',
          improvementAction: 'Link the decision explicitly to shareholder objectives.',
        }],
      },
      coverageEvidence: [{
        teachingPoint: 'shareholders and returns',
        location: { mode: 'short_answer', activityIndex: 1, field: 'prompt' },
      }],
    })), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch

    const result = await workers(fetchImpl).generatePracticeCollateral({
      jobId: 'cf-locator-practice',
      courseIdentity,
      workUnit: {
        id: 'ownership-practice',
        title: 'Ownership',
        requirementIds: ['ownership'],
        knowledgeNodeIds: ['ownership'],
        learningModes: ['short_answer'],
        requiredOutputs: ['practice'],
        scope: 'course',
        componentIds: [],
      },
      knowledgeModelFingerprint: 'knowledge-model-v1',
      requiredTeachingPoints: ['shareholders and returns'],
      knowledgeNodes,
    })

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    expect(result.provenance.contractVersion).toBe('4')
    expect((result.output as { coverageEvidence: Array<{ evidence: string }> }).coverageEvidence).toEqual([
      { teachingPoint: 'shareholders and returns', evidence: exactEvidence },
    ])
  })

  it('fails closed when a provider points at content that does not exist', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(responseBody({
      title: 'Ownership and shareholder returns',
      introduction: 'Ownership affects control and returns.',
      sections: [{
        title: 'Shareholder returns',
        explanation: 'Shareholders may receive dividends.',
        keyPoints: ['Returns can take more than one form.'],
      }],
      misconceptions: [],
      nextAction: 'Apply the idea.',
      coverageEvidence: [{
        teachingPoint: 'shareholders and returns',
        location: { area: 'section_explanation', itemIndex: 2, detailIndex: 1 },
      }],
    })), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch

    const result = await workers(fetchImpl).generateLearningCollateral({
      jobId: 'cf-locator-invalid',
      courseIdentity,
      workUnit: {
        id: 'ownership-invalid',
        title: 'Ownership',
        requirementIds: ['ownership'],
        knowledgeNodeIds: ['ownership'],
        learningModes: ['explanation'],
        requiredOutputs: ['learning'],
        scope: 'course',
        componentIds: [],
      },
      knowledgeModelFingerprint: 'knowledge-model-v1',
      requiredTeachingPoints: ['shareholders and returns'],
      knowledgeNodes,
    })

    expect(result.status).toBe('failure')
    if (result.status === 'success') throw new Error('Expected provider contract failure')
    expect(result.error).toContain('provider_contract_failure')
    expect(result.error).toContain('missing section 2')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})
