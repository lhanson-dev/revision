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
  subject: 'Mathematics',
  qualification: 'A Level',
  awardingBody: 'Test Board',
  specificationId: 'math-1',
}

const knowledgeNodes = [{
  id: 'algebra',
  kind: 'concept' as const,
  summary: 'Use algebraic relationships accurately.',
  formulas: [],
  misconceptions: ['Treating unlike terms as like terms.'],
  applicationContexts: ['Symbolic manipulation'],
  depth: 'core' as const,
  evidenceTypes: ['worked reasoning'],
}]

function responseBody(output: unknown) {
  return {
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(output) }] }],
    usage: { input_tokens: 100, output_tokens: 100 },
  }
}

const practiceModes = ['retrieval', 'flashcard', 'short_answer', 'application', 'quantitative'] as const
type LearnMode = 'explanation' | 'worked_example'

describe('Content Factory provider contract hardening', () => {
  it('enforces all 31 non-empty Practice-mode combinations at the provider schema boundary', async () => {
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as {
        input: string
        instructions: string
        text: { format: { strict: boolean; schema: Record<string, unknown> } }
      }
      const input = JSON.parse(body.input) as { workUnit: { learningModes: string[] } }
      const selected = practiceModes.filter((mode) => input.workUnit.learningModes.includes(mode))
      expect(body.text.format.strict).toBe(true)
      expect(body.instructions.toLowerCase()).not.toContain('business context')
      expect(body.instructions).toContain('subject-authentic')

      const schema = body.text.format.schema as {
        properties?: {
          activitiesByMode?: {
            properties?: Record<string, { items?: { properties?: Record<string, unknown> } }>
          }
        }
      }
      const modeProperties = schema.properties?.activitiesByMode?.properties ?? {}
      expect(Object.keys(modeProperties).sort()).toEqual([...selected].sort())
      for (const mode of selected) {
        const activityProperties = modeProperties[mode]?.items?.properties ?? {}
        expect(activityProperties).not.toHaveProperty('mode')
        expect(activityProperties).not.toHaveProperty('id')
      }

      const activitiesByMode = Object.fromEntries(selected.map((mode) => [mode, [{
        prompt: `${mode} prompt`,
        expectedResponse: `${mode} answer`,
        explanation: `${mode} explanation`,
        improvementAction: `${mode} improvement`,
      }]]))
      return new Response(JSON.stringify(responseBody({
        title: 'Algebra practice',
        instructions: 'Complete the planned practice.',
        activitiesByMode,
      })), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }) as typeof fetch

    const workers = createOpenAIModelAssistedWorkers({
      apiKey: 'test-secret',
      generation: route,
      independentReview: route,
      fetchImpl,
      maxRetries: 2,
    })

    for (let mask = 1; mask < 2 ** practiceModes.length; mask += 1) {
      const selected = practiceModes.filter((_mode, index) => (mask & (1 << index)) !== 0)
      const result = await workers.generatePracticeCollateral({
        jobId: `cf-practice-${mask}`,
        courseIdentity,
        workUnit: {
          id: `algebra-practice-${mask}`,
          title: 'Algebra practice',
          requirementIds: ['algebra'],
          knowledgeNodeIds: ['algebra'],
          learningModes: ['explanation', ...selected],
          requiredOutputs: ['learning', 'practice'],
          scope: 'course',
          componentIds: [],
        },
        knowledgeModelFingerprint: 'knowledge-model-v1',
        knowledgeNodes,
      })

      expect(result.status).toBe('success')
      if (result.status !== 'success') throw new Error(result.error)
      const output = result.output as { activities: Array<{ id: string; mode: string }> }
      expect(output.activities.map((activity) => activity.mode)).toEqual(selected)
      expect(output.activities.map((activity) => activity.id)).toEqual(
        selected.map((mode) => `algebra-practice-${mask}-${mode}-1`),
      )
    }

    expect(fetchImpl).toHaveBeenCalledTimes(31)
  })

  it('derives strict Learn schemas from the exact selected modes and injects identifiers deterministically', async () => {
    const learnModeSets: LearnMode[][] = [
      ['explanation'],
      ['worked_example'],
      ['explanation', 'worked_example'],
    ]
    let callIndex = 0
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const selected = learnModeSets[callIndex]
      callIndex += 1
      const body = JSON.parse(String(init?.body)) as {
        instructions: string
        text: { format: { strict: boolean; schema: { properties?: Record<string, unknown> } } }
      }
      expect(body.text.format.strict).toBe(true)
      expect(body.instructions.toLowerCase()).not.toContain('business contexts')
      expect(body.instructions).toContain('subject-authentic')
      const properties = body.text.format.schema.properties ?? {}
      expect('sections' in properties).toBe(selected.includes('explanation'))
      expect('workedExamples' in properties).toBe(selected.includes('worked_example'))

      return new Response(JSON.stringify(responseBody({
        title: 'Algebra',
        introduction: 'Understand the structure before applying it.',
        ...(selected.includes('explanation') ? {
          sections: [{ title: 'Collecting terms', explanation: 'Only like terms combine.', keyPoints: ['Match variable and power.'] }],
        } : {}),
        ...(selected.includes('worked_example') ? {
          workedExamples: [{ title: 'Simplify', setup: 'Simplify 2x + 3x.', steps: ['Identify like terms.', 'Add coefficients.'], conclusion: 'The result is 5x.' }],
        } : {}),
        misconceptions: [{ misconception: 'All terms can be combined.', correction: 'Only like terms combine.' }],
        nextAction: 'Try a mixed example.',
      })), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }) as typeof fetch

    const workers = createOpenAIModelAssistedWorkers({
      apiKey: 'test-secret',
      generation: route,
      independentReview: route,
      fetchImpl,
      maxRetries: 0,
    })

    for (const [index, modes] of learnModeSets.entries()) {
      const unitId = `algebra-learn-${index + 1}`
      const result = await workers.generateLearningCollateral({
        jobId: `cf-learn-${index + 1}`,
        courseIdentity,
        workUnit: {
          id: unitId,
          title: 'Algebra',
          requirementIds: ['algebra'],
          knowledgeNodeIds: ['algebra'],
          learningModes: modes,
          requiredOutputs: ['learning'],
          scope: 'course',
          componentIds: [],
        },
        knowledgeModelFingerprint: 'knowledge-model-v1',
        knowledgeNodes,
      })

      expect(result.status).toBe('success')
      if (result.status !== 'success') throw new Error(result.error)
      const output = result.output as {
        sections: Array<{ id: string }>
        workedExamples: Array<{ id: string }>
      }
      expect(output.sections.map((section) => section.id)).toEqual(
        modes.includes('explanation') ? [`${unitId}-section-1`] : [],
      )
      expect(output.workedExamples.map((example) => example.id)).toEqual(
        modes.includes('worked_example') ? [`${unitId}-worked-example-1`] : [],
      )
    }
  })

  it('turns impossible provider-normalisation output into a non-retryable worker failure', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(responseBody({
      title: 'Bad practice',
      instructions: 'Bad output',
      activitiesByMode: {
        retrieval: [{
          prompt: 'Prompt',
          expectedResponse: 'Answer',
          explanation: 'Explanation',
          improvementAction: 'Improve',
        }],
        short_answer: [{
          prompt: 'Unplanned prompt',
          expectedResponse: 'Answer',
          explanation: 'Explanation',
          improvementAction: 'Improve',
        }],
      },
    })), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch

    const workers = createOpenAIModelAssistedWorkers({
      apiKey: 'test-secret',
      generation: route,
      independentReview: route,
      fetchImpl,
      maxRetries: 2,
    })

    const result = await workers.generatePracticeCollateral({
      jobId: 'cf-extra-mode',
      courseIdentity,
      workUnit: {
        id: 'algebra-extra-mode',
        title: 'Algebra',
        requirementIds: ['algebra'],
        knowledgeNodeIds: ['algebra'],
        learningModes: ['retrieval'],
        requiredOutputs: ['practice'],
        scope: 'course',
        componentIds: [],
      },
      knowledgeModelFingerprint: 'knowledge-model-v1',
      knowledgeNodes,
    })

    expect(result.status).toBe('failure')
    if (result.status === 'success') throw new Error('Expected contract failure')
    expect(result.error).toContain('provider_contract_failure')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})
