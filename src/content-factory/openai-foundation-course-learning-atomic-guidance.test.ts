import { describe, expect, it, vi } from 'vitest'
import { createOpenAIModelAssistedWorkers } from './openai-live-adapter'

const route = {
  model: 'test-model',
  inputUsdPerMillion: 2,
  cachedInputUsdPerMillion: 0.2,
  outputUsdPerMillion: 12,
  maxOutputTokens: 2_000,
}

const nodeId = 'course-context'
const courseTruth = `Course Truth [${nodeId}]: Apply ideas to varied contexts and analyse interrelated decisions.`
const formula = `Formula or quantitative procedure [${nodeId}]: index = current / base × 100`
const misconception = `Misconception to diagnose and repair [${nodeId}]: A numerical result is sufficient without interpretation.`
const applicationContext = `Required application context [${nodeId}]: technology investment decision`
const evidenceDemand = `Required evidence demand [${nodeId}]: contextual evaluation`
const requiredTeachingPoints = [courseTruth, formula, misconception, applicationContext, evidenceDemand]

const learningDesign = {
  schemaVersion: 1 as const,
  nodes: [{
    nodeId,
    classifications: [
      'concept' as const,
      'formula_quantitative' as const,
      'application_context' as const,
      'evaluation_judgement' as const,
      'misconception_risk' as const,
    ],
    learnTreatments: [
      'core_explanation' as const,
      'worked_example' as const,
      'misconception_repair' as const,
    ],
    practiceCapabilities: [
      'retrieval' as const,
      'calculation' as const,
      'contextual_application' as const,
      'contextual_judgement' as const,
      'misconception_diagnostic' as const,
    ],
  }],
  classifications: [
    'concept' as const,
    'formula_quantitative' as const,
    'application_context' as const,
    'evaluation_judgement' as const,
    'misconception_risk' as const,
  ],
  learnTreatments: [
    'core_explanation' as const,
    'worked_example' as const,
    'misconception_repair' as const,
  ],
  practiceCapabilities: [
    'retrieval' as const,
    'calculation' as const,
    'contextual_application' as const,
    'contextual_judgement' as const,
    'misconception_diagnostic' as const,
  ],
  sourceNodeIds: [nodeId],
}

const workUnit = {
  id: 'foundation-course-context',
  title: 'Course context',
  requirementIds: [nodeId],
  knowledgeNodeIds: [nodeId],
  learningModes: [...(['explanation', 'worked_example', 'retrieval', 'application', 'quantitative'] as const)],
  requiredOutputs: [...(['learning', 'practice'] as const)],
  scope: 'course' as const,
  componentIds: [],
  learningDesign,
}

const knowledgeNodes = [{
  id: nodeId,
  kind: 'concept' as const,
  summary: 'Apply ideas to varied contexts and analyse interrelated decisions.',
  formulas: ['index = current / base × 100'],
  misconceptions: ['A numerical result is sufficient without interpretation.'],
  applicationContexts: ['technology investment decision'],
  depth: 'advanced' as const,
  evidenceTypes: ['contextual evaluation'],
}]

const input = {
  jobId: 'provider-guidance-regression',
  courseIdentity: {
    subject: 'Business',
    qualification: 'A-level',
    awardingBody: 'Test Board',
    specificationId: 'business-1',
  },
  workUnit,
  knowledgeModelFingerprint: 'knowledge-model-v1',
  requiredTeachingPoints,
  knowledgeNodes,
}

function workersWithInstructionCapture(instructions: string[]) {
  const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body)) as { instructions: string }
    instructions.push(body.instructions)
    return new Response(JSON.stringify({ error: { message: 'stop after prompt capture' } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }) as typeof fetch

  return createOpenAIModelAssistedWorkers({
    apiKey: 'test-secret',
    generation: route,
    independentReview: route,
    fetchImpl,
    maxRetries: 0,
  })
}

describe('Foundation provider atomic evidence guidance', () => {
  it('tells Learn v7 generation to place short evidence markers in the actual generated field while preserving atomic placement', async () => {
    const instructions: string[] = []
    const workers = workersWithInstructionCapture(instructions)

    await workers.generateLearningCollateral(input)

    expect(instructions).toHaveLength(1)
    expect(instructions[0]).toContain('Learn evidence uses inline machine markers')
    expect(instructions[0]).toContain('Place each supplied marker exactly once')
    expect(instructions[0]).toContain('not evidence arrays, copied text, indexes or positional references')
    expect(instructions[0]).toContain('[[REV-C1]]')
    expect(instructions[0]).toContain('[[REV-T1]]')
    expect(instructions[0]).not.toContain('copy evidenceText verbatim')
    expect(instructions[0]).not.toContain('Use 1-based evidence indexes')
    expect(instructions[0]).toContain('Atomic coverageEvidence placement rules are mandatory')
    expect(instructions[0]).toContain('Course Truth [nodeId] summaries must point to section_explanation or section_key_point')
    expect(instructions[0]).toContain('Formula or quantitative procedure [nodeId] obligations must point to worked_example_setup, worked_example_step or worked_example_conclusion')
    expect(instructions[0]).toContain('Misconception to diagnose and repair [nodeId] obligations must point to misconception_correction')
  })

  it('tells Practice v5 generation that atomic evidence must be active, address real 1-based activities and use the same deterministic mode mapping', async () => {
    const instructions: string[] = []
    const workers = workersWithInstructionCapture(instructions)

    await workers.generatePracticeCollateral(input)

    expect(instructions).toHaveLength(1)
    expect(instructions[0]).toContain('1-based Practice evidence activityIndex')
    expect(instructions[0]).toContain('must reference an activity that actually exists in the named activitiesByMode bucket')
    expect(instructions[0]).toContain('if that bucket contains one activity, use activityIndex=1')
    expect(instructions[0]).toContain('never explanation or improvementAction')
    expect(instructions[0]).toContain('Formula or quantitative procedure [nodeId] obligations must use quantitative Practice')
    expect(instructions[0]).toContain('Required application context [nodeId] obligations must use application Practice')
    expect(instructions[0]).toContain('Misconception to diagnose and repair [nodeId] obligations must use retrieval Practice')
    expect(instructions[0]).toContain(`${evidenceDemand} -> application`)
  })
})
