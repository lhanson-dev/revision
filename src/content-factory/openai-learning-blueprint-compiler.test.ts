import { describe, expect, it, vi } from 'vitest'
import { createOpenAIModelAssistedWorkers } from './openai-live-adapter'
import type { LearningPracticeWorkers } from './learning-and-practice'

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

function plannerInput(overrides: {
  learnRequired?: boolean
  practiceRequired?: boolean
  formulas?: string[]
  applicationContexts?: string[]
} = {}): Parameters<LearningPracticeWorkers['planLearningBlueprint']>[0] {
  return {
    jobId: 'cf-blueprint-test',
    courseIdentity: {
      subject: 'Mathematics',
      qualification: 'A Level',
      awardingBody: 'Test Board',
      specificationId: 'math-1',
    },
    knowledgeModelFingerprint: 'knowledge-model-v1',
    knowledgeNodes: [{
      id: 'algebra',
      kind: 'concept',
      summary: 'Use algebraic relationships accurately.',
      formulas: overrides.formulas ?? [],
      misconceptions: ['Unlike terms cannot be combined.'],
      applicationContexts: overrides.applicationContexts ?? ['Symbolic manipulation'],
      depth: 'core',
      evidenceTypes: ['worked reasoning'],
    }],
    coverageRequirements: [{
      requirementId: 'algebra',
      requirementSummary: 'Understand and use algebraic relationships.',
      skillsOrKnowledge: ['algebra'],
      componentScope: [],
      revisionArea: 'Algebra',
      learnRequired: overrides.learnRequired ?? true,
      practiceRequired: overrides.practiceRequired ?? true,
      examPrepRequired: true,
      coverageStatus: 'planned',
    }],
  }
}

function providerBlueprint(input: Parameters<LearningPracticeWorkers['planLearningBlueprint']>[0], options: {
  learningModes: string[]
  requiredOutputs: string[]
}) {
  return {
    schemaVersion: 1,
    jobId: input.jobId,
    knowledgeModelFingerprint: input.knowledgeModelFingerprint,
    workUnits: [{
      id: 'algebra-foundations',
      title: 'Algebra foundations',
      requirementIds: ['algebra'],
      knowledgeNodeIds: ['algebra'],
      learningModes: options.learningModes,
      requiredOutputs: options.requiredOutputs,
      scope: 'course',
      componentIds: [],
    }],
  }
}

function workersReturning(output: unknown) {
  const fetchImpl = vi.fn(async () => new Response(JSON.stringify(responseBody(output)), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })) as typeof fetch

  return {
    workers: createOpenAIModelAssistedWorkers({
      apiKey: 'test-secret',
      generation: route,
      independentReview: route,
      fetchImpl,
      maxRetries: 2,
    }),
    fetchImpl,
  }
}

describe('Learning Blueprint deterministic compiler', () => {
  it('repairs the exact Pilot #8 contradiction without another provider call', async () => {
    const input = plannerInput({ learnRequired: true, practiceRequired: true })
    const { workers, fetchImpl } = workersReturning(providerBlueprint(input, {
      learningModes: ['explanation', 'worked_example'],
      requiredOutputs: ['learning'],
    }))

    const result = await workers.planLearningBlueprint(input)

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    const unit = (result.output as { workUnits: Array<{ learningModes: string[]; requiredOutputs: string[] }> }).workUnits[0]
    expect(unit.requiredOutputs).toEqual(['learning', 'practice'])
    expect(unit.learningModes).toEqual(['explanation', 'worked_example', 'application'])
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('uses a quantitative fallback when governed Practice is required and the knowledge contains formulas', async () => {
    const input = plannerInput({
      learnRequired: false,
      practiceRequired: true,
      formulas: ['y = mx + c'],
      applicationContexts: [],
    })
    const { workers, fetchImpl } = workersReturning(providerBlueprint(input, {
      learningModes: ['explanation'],
      requiredOutputs: ['learning'],
    }))

    const result = await workers.planLearningBlueprint(input)

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    const unit = (result.output as { workUnits: Array<{ learningModes: string[]; requiredOutputs: string[] }> }).workUnits[0]
    expect(unit.requiredOutputs).toEqual(['practice'])
    expect(unit.learningModes).toEqual(['quantitative'])
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('strips ungoverned Practice modes and guarantees explanation for a Learn-only requirement', async () => {
    const input = plannerInput({ learnRequired: true, practiceRequired: false })
    const { workers } = workersReturning(providerBlueprint(input, {
      learningModes: ['worked_example', 'retrieval', 'short_answer'],
      requiredOutputs: ['practice'],
    }))

    const result = await workers.planLearningBlueprint(input)

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    const unit = (result.output as { workUnits: Array<{ learningModes: string[]; requiredOutputs: string[] }> }).workUnits[0]
    expect(unit.requiredOutputs).toEqual(['learning'])
    expect(unit.learningModes).toEqual(['explanation', 'worked_example'])
  })

  it('uses retrieval as the minimum generic Practice fallback when no formula or application context exists', async () => {
    const input = plannerInput({
      learnRequired: false,
      practiceRequired: true,
      formulas: [],
      applicationContexts: [],
    })
    const { workers } = workersReturning(providerBlueprint(input, {
      learningModes: ['explanation'],
      requiredOutputs: ['learning'],
    }))

    const result = await workers.planLearningBlueprint(input)

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    const unit = (result.output as { workUnits: Array<{ learningModes: string[]; requiredOutputs: string[] }> }).workUnits[0]
    expect(unit.learningModes).toEqual(['retrieval'])
  })

  it('fails once rather than retrying a work unit with no governed Learn or Practice requirement', async () => {
    const input = plannerInput({ learnRequired: false, practiceRequired: false })
    const { workers, fetchImpl } = workersReturning(providerBlueprint(input, {
      learningModes: ['explanation'],
      requiredOutputs: ['learning'],
    }))

    const result = await workers.planLearningBlueprint(input)

    expect(result.status).toBe('failure')
    if (result.status === 'success') throw new Error('Expected Learning Blueprint contract failure')
    expect(result.error).toContain('learning_blueprint_compilation')
    expect(result.error).toContain('no governed Learn or Practice output requirement')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})
