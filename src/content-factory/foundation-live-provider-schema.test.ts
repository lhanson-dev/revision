import { z } from 'zod'
import { describe, expect, it } from 'vitest'
import { OpenAIStructuredWorkerClient } from './openai-live-adapter'
import { questionFamilySchema } from './schema'

const route = {
  model: 'fixture-model',
  inputUsdPerMillion: 0,
  cachedInputUsdPerMillion: 0,
  outputUsdPerMillion: 0,
  reasoningEffort: 'none' as const,
  maxOutputTokens: 1_000,
}

const providerQuestionFamily = {
  schemaVersion: 1 as const,
  id: 'paper2-data-response',
  title: 'Paper 2 data response',
  assessmentObjectiveIds: ['ao1', 'ao2', 'ao3', 'ao4'],
  skillProfile: ['business knowledge', 'application', 'analysis', 'evaluation'],
  componentScope: ['paper-2'],
  markRange: { min: 1, max: 100 },
  responseShape: 'Revision-owned exam-style response contract',
  contextRequirements: ['original Revision-owned business context'],
  applicationRequirements: ['apply relevant business knowledge'],
  analysisRequirements: ['develop linked reasoning'],
  evaluationRequirements: ['reach a supported judgement where required'],
  commonFailureModes: ['assertion without development'],
  markingPackTemplateVersion: 'foundation-v1',
  calibrationStatus: 'not_calibrated' as const,
}

describe('Foundation live strict provider schema', () => {
  it('keeps compiler-owned aggregateMarkTotal out of the Question Families provider contract', async () => {
    const requests: Array<Record<string, unknown>> = []
    const fetchImpl: typeof fetch = async (_input, init) => {
      requests.push(JSON.parse(String(init?.body)) as Record<string, unknown>)
      return new Response(JSON.stringify({
        status: 'completed',
        output_text: JSON.stringify({ questionFamilies: [providerQuestionFamily] }),
        usage: { input_tokens: 100, output_tokens: 100 },
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    }

    const domainEnvelope = z.object({
      questionFamilies: z.array(questionFamilySchema).min(1),
    })
    const domainSchema = z.toJSONSchema(domainEnvelope) as {
      properties?: { questionFamilies?: { items?: { properties?: Record<string, unknown> } } }
    }
    expect(domainSchema.properties?.questionFamilies?.items?.properties).toHaveProperty('aggregateMarkTotal')

    const client = new OpenAIStructuredWorkerClient({
      apiKey: 'test-key',
      generation: route,
      independentReview: route,
      maxRetries: 0,
      fetchImpl,
    })

    const execution = await client.run({
      workerId: 'content-factory.foundation.question-families',
      contractVersion: '1',
      routeKind: 'generation',
      outputSchema: domainEnvelope,
      strictOutput: true,
      instructions: 'Return the requested Question Families.',
      payload: { requestedFamilyIds: ['paper2-data-response'] },
    })

    expect(execution.status).toBe('success')
    if (execution.status !== 'success') throw new Error(execution.error)
    expect(execution.output).toEqual({ questionFamilies: [providerQuestionFamily] })

    const request = requests[0] as {
      text?: {
        format?: {
          strict?: boolean
          schema?: {
            properties?: {
              questionFamilies?: {
                items?: {
                  properties?: Record<string, unknown>
                  required?: string[]
                }
              }
            }
          }
        }
      }
    }
    expect(request.text?.format?.strict).toBe(true)
    const itemSchema = request.text?.format?.schema?.properties?.questionFamilies?.items
    expect(itemSchema?.properties).not.toHaveProperty('aggregateMarkTotal')
    expect([...(itemSchema?.required ?? [])].sort()).toEqual(Object.keys(itemSchema?.properties ?? {}).sort())
  })
})
