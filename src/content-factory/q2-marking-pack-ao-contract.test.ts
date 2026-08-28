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
  subject: 'Science',
  qualification: 'General qualification',
  awardingBody: 'Test Board',
  specificationId: 'science-generic-1',
}

const assessmentBlueprint = {
  schemaVersion: 1 as const,
  jobId: 'q2-marking-pack',
  fingerprint: 'assessment-blueprint-v1',
  boardAlignmentFingerprint: 'board-v1',
  assessmentObjectives: [{ id: 'ao1' }, { id: 'ao2' }, { id: 'ao3' }],
  components: [{ componentId: 'paper-1', questionFamilyIds: ['structured-response'], markTotal: 8, timingMinutes: 15, constraints: [] }],
  quantitativeRequirements: [],
  synopticRequirements: [],
  commandDemands: [],
  evidenceExpectations: [],
}

const questionFamily = {
  schemaVersion: 1 as const,
  id: 'structured-response',
  title: 'Structured response',
  assessmentObjectiveIds: ['ao1', 'ao2', 'ao3'],
  skillProfile: ['calculation', 'application', 'analysis'],
  componentScope: ['paper-1'],
  markRange: { min: 8, max: 8 },
  responseShape: 'Two linked structured questions.',
  contextRequirements: [],
  applicationRequirements: ['Use the supplied scientific context.'],
  analysisRequirements: ['Develop a causal explanation.'],
  evaluationRequirements: [],
  commonFailureModes: [],
  markingPackTemplateVersion: '1',
  calibrationStatus: 'not_calibrated' as const,
}

const assessmentItem = {
  id: 'energy-transfer-structured',
  version: '1',
  title: 'Energy transfer',
  componentId: 'paper-1',
  questionFamilyId: 'structured-response',
  requirementIds: ['energy-transfer'],
  knowledgeNodeIds: ['energy-transfer'],
  format: 'mixed' as const,
  command: 'mixed',
  maxMark: 8,
  questionWording: 'Calculate the energy transferred. Explain one reason the observed transfer is lower than the theoretical value.',
  subquestions: [
    {
      id: 'q1',
      command: 'Calculate',
      wording: 'Calculate the energy transferred.',
      maxMark: 4,
      requirementIds: ['energy-transfer'],
      responseDemands: ['calculation', 'application'] as Array<'calculation' | 'application'>,
      coverageEvidence: [{ requirementId: 'energy-transfer', evidence: 'energy transferred' }],
    },
    {
      id: 'q2',
      command: 'Explain',
      wording: 'Explain one reason the observed transfer is lower than the theoretical value.',
      maxMark: 4,
      requirementIds: ['energy-transfer'],
      responseDemands: ['analysis', 'application'] as Array<'analysis' | 'application'>,
      coverageEvidence: [{ requirementId: 'energy-transfer', evidence: 'observed transfer is lower' }],
    },
  ],
}

const knowledgeNodes = [{
  id: 'energy-transfer',
  kind: 'concept' as const,
  summary: 'Apply energy-transfer relationships and explain losses.',
  formulas: ['energy transferred = power × time'],
  misconceptions: ['All supplied energy becomes useful output.'],
  applicationContexts: ['laboratory measurements'],
  depth: 'core' as const,
  evidenceTypes: ['calculation', 'explanation'],
}]

function responseBody(output: unknown) {
  return {
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(output) }] }],
    usage: { input_tokens: 100, output_tokens: 100 },
  }
}

function markingOutput(overrides: Record<string, unknown> = {}) {
  return {
    assessmentObjectiveAllocation: [],
    subquestionGuidance: [
      {
        subquestionId: 'q1',
        maxMark: 4,
        rewardedDemands: ['calculation', 'application'],
        assessmentObjectiveAllocation: [
          { objectiveId: 'ao1', marks: 2 },
          { objectiveId: 'ao2', marks: 2 },
        ],
        answerRequirements: ['Use the supplied values and a valid calculation route.'],
      },
      {
        subquestionId: 'q2',
        maxMark: 4,
        rewardedDemands: ['analysis', 'application'],
        assessmentObjectiveAllocation: [
          { objectiveId: 'ao2', marks: 2 },
          { objectiveId: 'ao3', marks: 2 },
        ],
        answerRequirements: ['Explain a scientifically valid reason for the difference.'],
      },
    ],
    rubric: [{ id: 'all-marks', descriptor: 'Credit valid science and reasoning up to the available marks.', minMark: 0, maxMark: 8 }],
    applicationRequirements: ['Use the supplied scientific context.'],
    analysisRequirements: ['Develop a causal explanation.'],
    evaluationRequirements: [],
    validReasoningRoutes: ['A correct calculation followed by a valid explanation of energy loss.'],
    indicativeContent: ['Possible losses include thermal transfer to the surroundings.'],
    misconceptions: ['Assuming perfect efficiency.'],
    diagnosticFeedbackRules: ['Identify whether the calculation or causal explanation needs improvement.'],
    improvementActions: ['Check units and link the explanation to the physical process.'],
    ambiguityPolicy: 'Credit scientifically valid alternatives supported by the supplied context.',
    confidencePolicy: 'Use the governed confidence behaviour where evidence is insufficient for a precise mark.',
    ...overrides,
  }
}

function config(fetchImpl: typeof fetch) {
  return {
    apiKey: 'test-secret',
    generation: route,
    independentReview: route,
    fetchImpl,
    maxRetries: 0,
  }
}

describe('Q2 structured Marking Pack AO ownership', () => {
  it('derives the overall AO allocation from validated subquestion guidance with one provider call', async () => {
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { input: string }
      const payload = JSON.parse(body.input) as { questionFamily: { responseShape: string }; assessmentBlueprint: { evidenceExpectations: string[] } }
      expect(payload.questionFamily.responseShape).toContain('top-level assessmentObjectiveAllocation to an empty array')
      expect(payload.questionFamily.responseShape).toContain('Revision derives the overall AO allocation deterministically')
      expect(payload.assessmentBlueprint.evidenceExpectations.join(' ')).toContain('do not duplicate that arithmetic')
      return new Response(JSON.stringify(responseBody(markingOutput())), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }) as typeof fetch

    const workers = createOpenAIModelAssistedWorkers(config(fetchImpl))
    const result = await workers.generateMarkingPack({
      jobId: 'q2-marking-pack',
      courseIdentity,
      assessmentBlueprint,
      questionFamily,
      assessmentItem,
      knowledgeNodes,
    })

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    expect(result.provenance.contractVersion).toBe('3')
    expect((result.output as { assessmentObjectiveAllocation: unknown }).assessmentObjectiveAllocation).toEqual([
      { objectiveId: 'ao1', marks: 2 },
      { objectiveId: 'ao2', marks: 4 },
      { objectiveId: 'ao3', marks: 2 },
    ])
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('fails closed when the provider tries to author the structured aggregate AO arithmetic', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(responseBody(markingOutput({
      assessmentObjectiveAllocation: [
        { objectiveId: 'ao1', marks: 4 },
        { objectiveId: 'ao2', marks: 4 },
        { objectiveId: 'ao3', marks: 0 },
      ],
    }))), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch

    const result = await createOpenAIModelAssistedWorkers(config(fetchImpl)).generateMarkingPack({
      jobId: 'q2-marking-pack', courseIdentity, assessmentBlueprint, questionFamily, assessmentItem, knowledgeNodes,
    })

    expect(result.status).toBe('failure')
    if (result.status === 'failure') expect(result.error).toContain('must leave overall AO allocation empty for deterministic derivation')
    expect(result.provenance.contractVersion).toBe('3')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('fails closed when a subquestion AO allocation does not total its governed marks', async () => {
    const invalid = markingOutput()
    invalid.subquestionGuidance[0].assessmentObjectiveAllocation = [
      { objectiveId: 'ao1', marks: 1 },
      { objectiveId: 'ao2', marks: 1 },
    ]
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(responseBody(invalid)), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch

    const result = await createOpenAIModelAssistedWorkers(config(fetchImpl)).generateMarkingPack({
      jobId: 'q2-marking-pack', courseIdentity, assessmentBlueprint, questionFamily, assessmentItem, knowledgeNodes,
    })

    expect(result.status).toBe('failure')
    if (result.status === 'failure') expect(result.error).toContain('guidance AO allocation for q1 must total 4')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})
