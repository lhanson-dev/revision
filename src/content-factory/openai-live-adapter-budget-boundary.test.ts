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
  qualification: 'A-level',
  awardingBody: 'Test Board',
  specificationId: 'business-1',
}

const learningDesign = {
  schemaVersion: 1 as const,
  nodes: [{
    nodeId: 'node-1',
    classifications: ['concept' as const],
    learnTreatments: ['core_explanation' as const],
    practiceCapabilities: ['retrieval' as const],
  }],
  classifications: ['concept' as const],
  learnTreatments: ['core_explanation' as const],
  practiceCapabilities: ['retrieval' as const],
  sourceNodeIds: ['node-1'],
}

function completed(output: unknown) {
  return new Response(JSON.stringify({
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(output) }] }],
    usage: { input_tokens: 100, output_tokens: 100 },
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

describe('OpenAI live adapter provider budget boundary', () => {
  it('fails closed before a base-v4 call after a Foundation-v5 call in the same factory instance', async () => {
    const fetchImpl = vi.fn(async () => completed({
      title: 'Concept practice',
      instructions: 'Recall the concept.',
      activitiesByMode: {
        retrieval: [{
          prompt: 'Recall the concept.',
          expectedResponse: 'The concept.',
          explanation: 'This checks recall.',
          improvementAction: 'Review the explanation.',
        }],
      },
      coverageEvidence: [{
        teachingPoint: 'understand the concept',
        location: { mode: 'retrieval', activityIndex: 1, field: 'prompt' },
      }],
      capabilityEvidence: [{
        capability: 'retrieval',
        location: { mode: 'retrieval', activityIndex: 1, field: 'prompt' },
      }],
    })) as typeof fetch

    const workers = createOpenAIModelAssistedWorkers({
      apiKey: 'test-secret',
      generation: route,
      independentReview: route,
      maxSpendUsd: 12,
      fetchImpl,
      maxRetries: 0,
    })

    const first = await workers.generatePracticeCollateral({
      jobId: 'foundation-budget-boundary',
      courseIdentity,
      workUnit: {
        id: 'foundation-node-1',
        title: 'Concept',
        requirementIds: ['requirement-1'],
        knowledgeNodeIds: ['node-1'],
        learningModes: ['explanation', 'retrieval'],
        requiredOutputs: ['learning', 'practice'],
        scope: 'course',
        componentIds: [],
        learningDesign,
      },
      knowledgeModelFingerprint: 'knowledge-model-v1',
      requiredTeachingPoints: ['understand the concept'],
      knowledgeNodes: [{
        id: 'node-1',
        kind: 'concept',
        summary: 'Understand the concept.',
        formulas: [],
        misconceptions: [],
        applicationContexts: [],
        depth: 'core',
        evidenceTypes: ['explanation'],
      }],
    })

    expect(first.status).toBe('success')
    expect(first.provenance.contractVersion).toBe('5')
    expect(fetchImpl).toHaveBeenCalledTimes(1)

    await expect(workers.planLearningBlueprint({
      jobId: 'legacy-budget-boundary',
      courseIdentity,
      knowledgeModelFingerprint: 'knowledge-model-v1',
      knowledgeNodes: [{
        id: 'node-1',
        kind: 'concept',
        summary: 'Understand the concept.',
        formulas: [],
        misconceptions: [],
        applicationContexts: [],
        depth: 'core',
        evidenceTypes: ['explanation'],
      }],
      coverageRequirements: [{
        requirementId: 'requirement-1',
        requirementSummary: 'Understand the concept.',
        skillsOrKnowledge: ['understand the concept'],
        componentScope: [],
        revisionArea: 'Concept',
        learnRequired: true,
        practiceRequired: true,
        examPrepRequired: false,
        coverageStatus: 'planned',
      }],
    })).rejects.toThrow(/content_factory_provider_budget_boundary/)

    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})
