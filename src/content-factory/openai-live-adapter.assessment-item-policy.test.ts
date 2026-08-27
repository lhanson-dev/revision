import { describe, expect, it, vi } from 'vitest'
import { createOpenAIModelAssistedWorkers } from './openai-live-adapter'

const route = {
  model: 'test-model',
  inputUsdPerMillion: 2,
  cachedInputUsdPerMillion: 0.2,
  outputUsdPerMillion: 12,
  maxOutputTokens: 1_000,
}

function responseBody(output: unknown) {
  return {
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(output) }] }],
    usage: { input_tokens: 100, output_tokens: 100 },
  }
}

describe('OpenAI assessment-item governed target boundary', () => {
  it('keeps governed target fields out of provider output and injects the exact policy values deterministically', async () => {
    const targetPolicy = {
      requirementIds: ['business-foundations'],
      maxMark: 10,
      format: 'mixed' as const,
    }
    const questionWording = 'A new business is choosing an ownership structure. Analyse one factor the owners should consider when making this decision.'

    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as {
        input: string
        text: {
          format: {
            schema: {
              properties?: Record<string, unknown>
            }
          }
        }
      }
      const properties = body.text.format.schema.properties ?? {}
      expect(properties.componentId).toBeUndefined()
      expect(properties.questionFamilyId).toBeUndefined()
      expect(properties.requirementIds).toBeUndefined()
      expect(properties.maxMark).toBeUndefined()
      expect(properties.format).toBeUndefined()

      const payload = JSON.parse(body.input) as { targetPolicy?: unknown }
      expect(payload.targetPolicy).toEqual(targetPolicy)

      return new Response(JSON.stringify(responseBody({
        id: 'paper1-knowledge-10-item',
        version: '1',
        title: 'Business ownership and stakeholder decisions',
        knowledgeNodeIds: ['business-foundations'],
        command: 'analyse',
        questionWording,
        subquestions: [{
          id: 'q1',
          command: 'Analyse',
          wording: questionWording,
          maxMark: 10,
          requirementIds: ['business-foundations'],
          responseDemands: ['analysis'],
          coverageEvidence: [{ requirementId: 'business-foundations', evidence: 'ownership structure' }],
        }],
        componentId: 'provider-invented-component',
        questionFamilyId: 'provider-invented-family',
        requirementIds: ['provider-invented-requirement'],
        maxMark: 999,
        format: 'essay',
      })), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }) as typeof fetch

    const workers = createOpenAIModelAssistedWorkers({
      apiKey: 'test-secret',
      generation: route,
      independentReview: route,
      fetchImpl,
      maxRetries: 0,
      assessmentItemPolicies: {
        'paper1-knowledge-10': targetPolicy,
      },
    })

    const result = await workers.generateAssessmentItem({
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
        assessmentObjectives: [{ id: 'ao1', weightingPercent: 100 }],
        components: [{
          componentId: 'paper-1',
          questionFamilyIds: ['paper1-knowledge-10'],
          markTotal: 80,
          timingMinutes: 90,
          constraints: [],
        }],
        quantitativeRequirements: [],
        synopticRequirements: [],
        commandDemands: [],
        evidenceExpectations: [],
      },
      questionFamily: {
        schemaVersion: 1,
        id: 'paper1-knowledge-10',
        title: 'Paper 1 knowledge and short response',
        assessmentObjectiveIds: ['ao1'],
        skillProfile: ['knowledge'],
        componentScope: ['paper-1'],
        markRange: { min: 10, max: 10 },
        responseShape: 'short structured responses',
        contextRequirements: [],
        applicationRequirements: [],
        analysisRequirements: [],
        evaluationRequirements: [],
        commonFailureModes: [],
        markingPackTemplateVersion: '1',
        calibrationStatus: 'not_calibrated',
      },
      targetComponentId: 'paper-1',
      knowledgeNodes: [],
      examPrepRequirements: [],
    })

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    expect(result.output).toEqual(expect.objectContaining({
      componentId: 'paper-1',
      questionFamilyId: 'paper1-knowledge-10',
      requirementIds: ['business-foundations'],
      maxMark: 10,
      format: 'mixed',
    }))
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})
