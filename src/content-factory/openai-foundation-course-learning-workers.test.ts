import { describe, expect, it, vi } from 'vitest'
import { createOpenAIModelAssistedWorkers } from './openai-live-adapter'

const route = {
  model: 'test-model',
  inputUsdPerMillion: 2,
  cachedInputUsdPerMillion: 0.2,
  outputUsdPerMillion: 12,
  maxOutputTokens: 2_000,
}

const courseIdentity = {
  subject: 'Business',
  qualification: 'A-level',
  awardingBody: 'Test Board',
  specificationId: 'business-1',
}

const knowledgeNodes = [{
  id: 'quantitative-decision',
  kind: 'skill' as const,
  summary: 'Calculate, interpret and judge quantitative evidence in context.',
  formulas: ['measure = result / input'],
  misconceptions: ['A calculated result is sufficient without interpretation.'],
  applicationContexts: ['investment decision'],
  depth: 'advanced' as const,
  evidenceTypes: ['quantitative calculation', 'interpretation', 'contextual evaluation'],
}]

const learningDesign = {
  schemaVersion: 1 as const,
  classifications: [
    'formula_quantitative' as const,
    'procedure_skill' as const,
    'application_context' as const,
    'evaluation_judgement' as const,
    'misconception_risk' as const,
  ],
  learnTreatments: [
    'core_explanation' as const,
    'worked_example' as const,
    'guided_example' as const,
    'example_non_example' as const,
    'self_explanation_prompt' as const,
    'misconception_repair' as const,
  ],
  practiceCapabilities: [
    'retrieval' as const,
    'calculation' as const,
    'interpretation' as const,
    'procedure_execution' as const,
    'contextual_application' as const,
    'contextual_judgement' as const,
    'misconception_diagnostic' as const,
  ],
  sourceNodeIds: ['quantitative-decision'],
}

const workUnit = {
  id: 'foundation-quantitative-decision',
  title: 'Quantitative decision',
  requirementIds: ['quantitative-decision'],
  knowledgeNodeIds: ['quantitative-decision'],
  learningModes: [...([
    'explanation',
    'worked_example',
    'retrieval',
    'short_answer',
    'application',
    'quantitative',
  ] as const)],
  requiredOutputs: [...(['learning', 'practice'] as const)],
  scope: 'course' as const,
  componentIds: [],
  learningDesign,
}

const requiredTeachingPoints = ['calculate, interpret and judge quantitative evidence']

function responseBody(output: unknown) {
  return {
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(output) }] }],
    usage: { input_tokens: 100, output_tokens: 100 },
  }
}

describe('Foundation Course Learning Blueprint provider contract v5', () => {
  it('binds every selected Learn treatment and Practice capability into strict generated-content evidence', async () => {
    let call = 0
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      call += 1
      const body = JSON.parse(String(init?.body)) as {
        instructions: string
        text: { format: { strict: boolean; schema: { properties?: Record<string, unknown> } } }
      }
      expect(body.text.format.strict).toBe(true)

      if (call === 1) {
        expect(body.instructions).toContain('Learn treatments')
        expect(body.instructions).toContain('treatmentEvidence')
        expect(body.text.format.schema.properties).toHaveProperty('treatmentEvidence')
        return new Response(JSON.stringify(responseBody({
          title: 'Quantitative decision',
          introduction: 'A useful measure needs calculation, interpretation and contextual judgement.',
          sections: [{
            title: 'Meaning and context',
            explanation: 'Interpret the result against the decision context and compare it with a plausible alternative.',
            keyPoints: [
              'Example: a stronger result may still be unsuitable when the context changes.',
              'Guided step: identify the inputs first, then decide which interpretation is supported.',
              'Self-explain why the same numerical result could support a different judgement in another context.',
            ],
          }],
          workedExamples: [{
            title: 'Worked calculation',
            setup: 'A business result is 80 from an input of 40.',
            steps: ['Calculate 80 / 40 = 2.', 'Interpret what 2 means before making a decision.'],
            conclusion: 'The calculation is evidence, not the whole judgement.',
          }],
          misconceptions: [{
            misconception: 'A calculated result is sufficient without interpretation.',
            correction: 'A result must be interpreted against the supplied context before a judgement is made.',
          }],
          nextAction: 'Explain why the calculation alone cannot determine the decision.',
          coverageEvidence: [{
            teachingPoint: requiredTeachingPoints[0],
            location: { area: 'section_explanation', itemIndex: 1, detailIndex: 1 },
          }],
          treatmentEvidence: [
            { treatment: 'core_explanation', location: { area: 'section_explanation', itemIndex: 1, detailIndex: 1 } },
            { treatment: 'worked_example', location: { area: 'worked_example_step', itemIndex: 1, detailIndex: 1 } },
            { treatment: 'guided_example', location: { area: 'section_key_point', itemIndex: 1, detailIndex: 2 } },
            { treatment: 'example_non_example', location: { area: 'section_key_point', itemIndex: 1, detailIndex: 1 } },
            { treatment: 'self_explanation_prompt', location: { area: 'next_action', itemIndex: 1, detailIndex: 1 } },
            { treatment: 'misconception_repair', location: { area: 'misconception_correction', itemIndex: 1, detailIndex: 1 } },
          ],
        })), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }

      expect(body.instructions).toContain('Practice capabilities')
      expect(body.instructions).toContain('capabilityEvidence')
      expect(body.text.format.schema.properties).toHaveProperty('capabilityEvidence')
      return new Response(JSON.stringify(responseBody({
        title: 'Quantitative decision practice',
        instructions: 'Complete each task from the supplied facts.',
        activitiesByMode: {
          retrieval: [{
            prompt: 'State what must happen after calculating a measure before making a decision.',
            expectedResponse: 'Interpret the result against the context.',
            explanation: 'Treating a number as self-explanatory is a diagnostic misconception.',
            improvementAction: 'Revisit the interpretation rule.',
          }],
          short_answer: [{
            prompt: 'Execute the method: identify the inputs, calculate the measure, then state the next reasoning step.',
            expectedResponse: 'Identify 80 and 40, calculate 2, then interpret it.',
            explanation: 'The procedure combines correct calculation with the next interpretation step.',
            improvementAction: 'Repeat the method with different values.',
          }],
          application: [{
            prompt: 'A business must choose between two investments. Use the supplied measure of 2 together with demand uncertainty and a cash constraint to recommend one option.',
            expectedResponse: 'Apply the measure to the stated facts and make a conditional judgement that weighs demand uncertainty and cash constraints.',
            explanation: 'Context changes what the numerical evidence means for the decision.',
            improvementAction: 'Name the fact that most changes the judgement.',
          }],
          quantitative: [{
            prompt: 'Calculate the measure when result = 80 and input = 40, then interpret the answer.',
            expectedResponse: '80 / 40 = 2; the value must then be interpreted in context.',
            explanation: 'Calculation supplies evidence; interpretation gives it decision meaning.',
            improvementAction: 'Check both arithmetic and interpretation.',
          }],
        },
        coverageEvidence: [{
          teachingPoint: requiredTeachingPoints[0],
          location: { mode: 'application', activityIndex: 1, field: 'prompt' },
        }],
        capabilityEvidence: [
          { capability: 'retrieval', location: { mode: 'retrieval', activityIndex: 1, field: 'prompt' } },
          { capability: 'calculation', location: { mode: 'quantitative', activityIndex: 1, field: 'prompt' } },
          { capability: 'interpretation', location: { mode: 'quantitative', activityIndex: 1, field: 'expectedResponse' } },
          { capability: 'procedure_execution', location: { mode: 'short_answer', activityIndex: 1, field: 'prompt' } },
          { capability: 'contextual_application', location: { mode: 'application', activityIndex: 1, field: 'prompt' } },
          { capability: 'contextual_judgement', location: { mode: 'application', activityIndex: 1, field: 'expectedResponse' } },
          { capability: 'misconception_diagnostic', location: { mode: 'retrieval', activityIndex: 1, field: 'explanation' } },
        ],
      })), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }) as typeof fetch

    const workers = createOpenAIModelAssistedWorkers({
      apiKey: 'test-secret',
      generation: route,
      independentReview: route,
      fetchImpl,
      maxRetries: 0,
    })

    const learning = await workers.generateLearningCollateral({
      jobId: 'foundation-v2-test',
      courseIdentity,
      workUnit,
      knowledgeModelFingerprint: 'knowledge-model-v1',
      requiredTeachingPoints,
      knowledgeNodes,
    })
    expect(learning.status).toBe('success')
    expect(learning.provenance.contractVersion).toBe('5')

    const practice = await workers.generatePracticeCollateral({
      jobId: 'foundation-v2-test',
      courseIdentity,
      workUnit,
      knowledgeModelFingerprint: 'knowledge-model-v1',
      requiredTeachingPoints,
      knowledgeNodes,
    })
    expect(practice.status).toBe('success')
    expect(practice.provenance.contractVersion).toBe('5')
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('fails closed when a deterministic Practice capability is evidenced in the wrong mode', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(responseBody({
      title: 'Bad practice',
      instructions: 'Complete the tasks.',
      activitiesByMode: {
        retrieval: [{
          prompt: 'Recall the rule.',
          expectedResponse: 'Rule.',
          explanation: 'Explanation.',
          improvementAction: 'Review.',
        }],
        short_answer: [{
          prompt: 'Construct the required output.',
          expectedResponse: 'Constructed output.',
          explanation: 'Construction explanation.',
          improvementAction: 'Try again.',
        }],
        application: [{
          prompt: 'Apply the idea in context.',
          expectedResponse: 'Applied answer.',
          explanation: 'Application explanation.',
          improvementAction: 'Use more context.',
        }],
      },
      coverageEvidence: [{
        teachingPoint: 'construct and apply a representation',
        location: { mode: 'short_answer', activityIndex: 1, field: 'prompt' },
      }],
      capabilityEvidence: [
        { capability: 'retrieval', location: { mode: 'retrieval', activityIndex: 1, field: 'prompt' } },
        { capability: 'construction', location: { mode: 'application', activityIndex: 1, field: 'prompt' } },
        { capability: 'contextual_application', location: { mode: 'application', activityIndex: 1, field: 'prompt' } },
      ],
    })), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch

    const workers = createOpenAIModelAssistedWorkers({
      apiKey: 'test-secret',
      generation: route,
      independentReview: route,
      fetchImpl,
      maxRetries: 0,
    })
    const badWorkUnit = {
      ...workUnit,
      learningModes: [...(['explanation', 'retrieval', 'short_answer', 'application'] as const)],
      learningDesign: {
        ...learningDesign,
        learnTreatments: ['core_explanation' as const],
        practiceCapabilities: ['retrieval' as const, 'construction' as const, 'contextual_application' as const],
      },
    }

    const result = await workers.generatePracticeCollateral({
      jobId: 'foundation-v2-bad-mode',
      courseIdentity,
      workUnit: badWorkUnit,
      knowledgeModelFingerprint: 'knowledge-model-v1',
      requiredTeachingPoints: ['construct and apply a representation'],
      knowledgeNodes,
    })

    expect(result.status).toBe('failure')
    if (result.status === 'success') throw new Error('Expected provider contract failure')
    expect(result.error).toContain('Blueprint capability construction must be exercised in short_answer')
    expect(result.provenance.contractVersion).toBe('5')
  })
})
