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
  qualification: 'A Level',
  awardingBody: 'Test Board',
  specificationId: 'business-1',
}

const knowledgeNodes = [{
  id: 'leadership',
  kind: 'concept' as const,
  summary: 'Compare management and leadership approaches.',
  formulas: [],
  misconceptions: ['One leadership style is always best.'],
  applicationContexts: ['A growing business changing leadership style.'],
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

function learningInput(requiredTeachingPoints: string[]) {
  return {
    jobId: 'cf-teaching-point-contract',
    courseIdentity,
    workUnit: {
      id: 'leadership-learn',
      title: 'Management and leadership',
      requirementIds: ['leadership'],
      knowledgeNodeIds: ['leadership'],
      learningModes: ['explanation'] as Array<'explanation'>,
      requiredOutputs: ['learning'] as Array<'learning'>,
      scope: 'course' as const,
      componentIds: [],
    },
    knowledgeModelFingerprint: 'knowledge-model-v1',
    requiredTeachingPoints,
    knowledgeNodes,
  }
}

describe('Content Factory teaching-point provider contract', () => {
  it('binds Learn coverage evidence to the exact required teaching-point set and cardinality', async () => {
    const requiredTeachingPoints = [
      'Distinguish management from leadership.',
      'Judge leadership effectiveness from the situation.',
    ]
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as {
        text: { format: { strict: boolean; schema: { properties?: Record<string, unknown> } } }
      }
      const coverageEvidence = body.text.format.schema.properties?.coverageEvidence as {
        minItems?: number
        maxItems?: number
        items?: { properties?: { teachingPoint?: { enum?: string[] } } }
      }
      expect(body.text.format.strict).toBe(true)
      expect(coverageEvidence.minItems).toBe(requiredTeachingPoints.length)
      expect(coverageEvidence.maxItems).toBe(requiredTeachingPoints.length)
      expect(coverageEvidence.items?.properties?.teachingPoint?.enum).toEqual(requiredTeachingPoints)

      return new Response(JSON.stringify(responseBody({
        title: 'Management and leadership',
        introduction: 'Leadership choices depend on context.',
        sections: [{
          title: 'Leadership choices',
          explanation: 'Managers coordinate resources while leaders influence direction and people.',
          keyPoints: ['Different situations can justify different leadership approaches.'],
        }],
        misconceptions: [],
        nextAction: 'Compare two contrasting situations.',
        coverageEvidence: [{
          teachingPoint: requiredTeachingPoints[0],
          location: { area: 'section_explanation', itemIndex: 1, detailIndex: 1 },
        }],
      })), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }) as typeof fetch

    const workers = createOpenAIModelAssistedWorkers({
      apiKey: 'test-secret',
      generation: route,
      independentReview: route,
      fetchImpl,
      maxRetries: 0,
    })

    const result = await workers.generateLearningCollateral(learningInput(requiredTeachingPoints))
    expect(result.status).toBe('failure')
    if (result.status === 'success') throw new Error('Expected provider contract failure')
    expect(result.error).toContain('provider_contract_failure')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('rejects a structurally valid Learn evidence entry whose teaching-point label is not governed', async () => {
    const requiredTeachingPoints = ['Distinguish management from leadership.']
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(responseBody({
      title: 'Management and leadership',
      introduction: 'Leadership choices depend on context.',
      sections: [{
        title: 'Leadership choices',
        explanation: 'Managers coordinate resources while leaders influence direction and people.',
        keyPoints: ['Different situations can justify different leadership approaches.'],
      }],
      misconceptions: [],
      nextAction: 'Compare two contrasting situations.',
      coverageEvidence: [{
        teachingPoint: 'Leadership is important.',
        location: { area: 'section_explanation', itemIndex: 1, detailIndex: 1 },
      }],
    })), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch

    const workers = createOpenAIModelAssistedWorkers({
      apiKey: 'test-secret',
      generation: route,
      independentReview: route,
      fetchImpl,
      maxRetries: 0,
    })

    const result = await workers.generateLearningCollateral(learningInput(requiredTeachingPoints))
    expect(result.status).toBe('failure')
    if (result.status === 'success') throw new Error('Expected provider contract failure')
    expect(result.error).toContain('provider_contract_failure')
  })
})
