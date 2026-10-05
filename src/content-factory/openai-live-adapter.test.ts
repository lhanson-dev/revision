import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { createOpenAIModelAssistedWorkers, OpenAIStructuredWorkerClient } from './openai-live-adapter'

const route = {
  model: 'test-model',
  inputUsdPerMillion: 2,
  cachedInputUsdPerMillion: 0.2,
  outputUsdPerMillion: 12,
  maxOutputTokens: 1_000,
}

type TestUsage = {
  input_tokens: number
  output_tokens: number
  input_tokens_details?: { cached_tokens?: number; cache_write_tokens?: number }
}

function responseBody(output: unknown, usage: TestUsage = { input_tokens: 1_000, output_tokens: 500, input_tokens_details: { cached_tokens: 200 } }) {
  return {
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(output) }] }],
    usage,
  }
}

describe('OpenAIStructuredWorkerClient', () => {
  it('uses the Responses structured-output boundary and records model/cost provenance', async () => {
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      expect(init?.headers).toEqual(expect.objectContaining({ Authorization: 'Bearer test-secret' }))
      const body = JSON.parse(String(init?.body)) as {
        model: string
        instructions: string
        input: string
        max_output_tokens: number
        text: { format: { type: string; name: string; strict: boolean; schema: Record<string, unknown> } }
      }
      expect(body.model).toBe('test-model')
      expect(body.max_output_tokens).toBe(1_000)
      expect(body.text.format.type).toBe('json_schema')
      expect(body.text.format.strict).toBe(false)
      expect(body.instructions).toContain('Do not browse, quote or reconstruct awarding-body source prose')
      expect(body.input).toBe(JSON.stringify({ safeFact: 'structured only' }))
      expect(body.input).not.toContain('AQA protected source body')
      return new Response(JSON.stringify(responseBody({ answer: 'ok' })), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }) as typeof fetch

    const client = new OpenAIStructuredWorkerClient({ apiKey: 'test-secret', generation: route, independentReview: route, fetchImpl, maxRetries: 0 })
    const result = await client.run({
      workerId: 'content-factory.test',
      contractVersion: '1',
      routeKind: 'generation',
      outputSchema: z.object({ answer: z.literal('ok') }),
      instructions: 'Return the safe test object.',
      payload: { safeFact: 'structured only' },
    })

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    expect(result.output).toEqual({ answer: 'ok' })
    expect(result.provenance.provider).toBe('openai')
    expect(result.provenance.model).toBe('test-model')
    expect(result.provenance.retryCount).toBe(0)
    expect(result.provenance.usageCost).toBeCloseTo(0.00764, 8)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('uses a provider-compatible object envelope for Question Family arrays and unwraps the domain output', async () => {
    const questionFamily = {
      schemaVersion: 1 as const,
      id: 'extended-evaluation',
      title: 'Contextual extended evaluation',
      assessmentObjectiveIds: ['ao1', 'ao2'],
      skillProfile: ['application', 'analysis', 'evaluation'],
      componentScope: ['paper-1'],
      markRange: { min: 10, max: 10 },
      responseShape: 'Extended written response with contextual argument and judgement.',
      contextRequirements: ['A plausible Revision-owned business context is required.'],
      applicationRequirements: ['Apply reasoning to the named business context.'],
      analysisRequirements: ['Develop linked consequences rather than assert effects.'],
      evaluationRequirements: ['Reach a supported judgement that recognises conditions or trade-offs.'],
      commonFailureModes: ['Generic theory without context', 'Unsupported judgement'],
      markingPackTemplateVersion: '1',
      calibrationStatus: 'not_calibrated' as const,
    }

    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as {
        text: { format: { schema: { type?: string; properties?: Record<string, { type?: string }> } } }
      }
      expect(body.text.format.schema.type).toBe('object')
      expect(body.text.format.schema.properties?.questionFamilies?.type).toBe('array')
      return new Response(JSON.stringify(responseBody({ questionFamilies: [questionFamily] }, { input_tokens: 100, output_tokens: 100 })), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }) as typeof fetch

    const workers = createOpenAIModelAssistedWorkers({
      apiKey: 'test-secret',
      generation: route,
      independentReview: route,
      fetchImpl,
      maxRetries: 0,
    })

    const result = await workers.generateQuestionFamilies({
      jobId: 'cf-business',
      courseIdentity: {
        subject: 'Business',
        qualification: 'AS Level',
        awardingBody: 'AQA',
        specificationId: '7131',
      },
      assessmentBlueprint: {
        schemaVersion: 1,
        jobId: 'cf-business',
        fingerprint: 'assessment-blueprint-v1',
        boardAlignmentFingerprint: 'board-alignment-v1',
        assessmentObjectives: [
          { id: 'ao1', weightingPercent: 50 },
          { id: 'ao2', weightingPercent: 50 },
        ],
        components: [
          {
            componentId: 'paper-1',
            questionFamilyIds: ['extended-evaluation'],
            markTotal: 80,
            timingMinutes: 90,
            constraints: [],
          },
        ],
        quantitativeRequirements: [],
        synopticRequirements: [],
        commandDemands: [],
        evidenceExpectations: [],
      },
      requestedFamilyIds: ['extended-evaluation'],
      knowledgeNodes: [],
      examPrepRequirements: [],
    })

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    expect(result.output).toEqual([questionFamily])
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('retries bounded transient failures and preserves retry telemetry', async () => {
    let calls = 0
    const fetchImpl = vi.fn(async () => {
      calls += 1
      if (calls === 1) return new Response(JSON.stringify({ error: { message: 'rate limited' } }), { status: 429, headers: { 'Content-Type': 'application/json' } })
      return new Response(JSON.stringify(responseBody({ answer: 'ok' }, { input_tokens: 10, output_tokens: 10 })), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }) as typeof fetch
    const sleep = vi.fn(async () => undefined)
    const client = new OpenAIStructuredWorkerClient({ apiKey: 'test-secret', generation: route, independentReview: route, fetchImpl, sleep, maxRetries: 1 })

    const result = await client.run({
      workerId: 'content-factory.retry-test',
      contractVersion: '1',
      routeKind: 'generation',
      outputSchema: z.object({ answer: z.literal('ok') }),
      instructions: 'Return the test object.',
      payload: { safeFact: true },
    })

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    expect(result.provenance.retryCount).toBe(1)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect(sleep).toHaveBeenCalledTimes(1)
  })

  it('fails closed without retrying when completed provider output violates the worker contract', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(responseBody({ answer: 'wrong' })), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch
    const sleep = vi.fn(async () => undefined)
    const client = new OpenAIStructuredWorkerClient({ apiKey: 'test-secret', generation: route, independentReview: route, fetchImpl, sleep, maxRetries: 2 })

    const result = await client.run({
      workerId: 'content-factory.schema-test',
      contractVersion: '1',
      routeKind: 'generation',
      outputSchema: z.object({ answer: z.literal('ok') }),
      instructions: 'Return the test object.',
      payload: { safeFact: true },
    })

    expect(result.status).toBe('failure')
    if (result.status === 'success') throw new Error('Expected schema failure')
    expect(result.error).toContain('provider_contract_failure')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(sleep).not.toHaveBeenCalled()
  })

  it('binds AQA 7132 mock semantic review output to the exact payload unit id', async () => {
    const cases = [
      { workerId: 'content-factory.aqa-7132.mock-unit-review.p1-b-chunk-2', unitId: 'P1-B-CHUNK-2' },
      { workerId: 'content-factory.aqa-7132.mock-paper-review.7132-2', unitId: '7132/2' },
      { workerId: 'content-factory.aqa-7132.mock-set-review', unitId: 'complete-set' },
    ]
    const outputSchema = z.object({ unit_id: z.string().min(1), answer: z.literal('ok') })

    for (const testCase of cases) {
      const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
        const body = JSON.parse(String(init?.body)) as {
          instructions: string
          text: { format: { schema: { properties?: Record<string, { const?: string; enum?: string[] }> } } }
        }
        const unitIdSchema = body.text.format.schema.properties?.unit_id
        expect(unitIdSchema?.const ?? unitIdSchema?.enum?.[0]).toBe(testCase.unitId)
        expect(body.instructions).toContain('Return unit_id exactly as supplied in the payload')
        expect(body.instructions).toContain('overrides any general lowercase-identifier instruction')
        return new Response(JSON.stringify(responseBody({ unit_id: testCase.unitId, answer: 'ok' }, { input_tokens: 100, output_tokens: 100 })), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }) as typeof fetch
      const client = new OpenAIStructuredWorkerClient({ apiKey: 'test-secret', generation: route, independentReview: route, fetchImpl, maxRetries: 0 })
      const result = await client.run({
        workerId: testCase.workerId,
        contractVersion: '1',
        routeKind: 'independent_review',
        outputSchema,
        instructions: 'Review the supplied unit.',
        payload: { unit_id: testCase.unitId },
        strictOutput: true,
      })
      expect(result.status).toBe('success')
      expect(fetchImpl).toHaveBeenCalledTimes(1)
    }

    const lowercaseFetch = vi.fn(async () => new Response(JSON.stringify(responseBody({ unit_id: 'p1-b-chunk-2', answer: 'ok' }, { input_tokens: 100, output_tokens: 100 })), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch
    const client = new OpenAIStructuredWorkerClient({ apiKey: 'test-secret', generation: route, independentReview: route, fetchImpl: lowercaseFetch, maxRetries: 0 })
    const result = await client.run({
      workerId: 'content-factory.aqa-7132.mock-unit-review.p1-b-chunk-2',
      contractVersion: '1',
      routeKind: 'independent_review',
      outputSchema,
      instructions: 'Review the supplied unit.',
      payload: { unit_id: 'P1-B-CHUNK-2' },
      strictOutput: true,
    })
    expect(result.status).toBe('failure')
    if (result.status === 'success') throw new Error('Expected exact unit-id contract failure')
    expect(result.error).toContain('provider_contract_failure')
    expect(lowercaseFetch).toHaveBeenCalledTimes(1)
  })

  it('refuses a provider call before spend can breach the configured course ceiling', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(responseBody({ answer: 'ok' })), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch
    const client = new OpenAIStructuredWorkerClient({
      apiKey: 'test-secret',
      generation: route,
      independentReview: route,
      fetchImpl,
      maxRetries: 0,
      maxSpendUsd: 0.0001,
    })

    const result = await client.run({
      workerId: 'content-factory.budget-test',
      contractVersion: '1',
      routeKind: 'generation',
      outputSchema: z.object({ answer: z.literal('ok') }),
      instructions: 'Return the test object.',
      payload: { safeFact: true },
    })

    expect(result.status).toBe('infrastructure_failure')
    if (result.status === 'success') throw new Error('Expected budget ceiling failure')
    expect(result.error).toContain('content_factory_spend_ceiling_reached')
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(client.budgetSnapshot().maxSpendUsd).toBe(0.0001)
  })
})
