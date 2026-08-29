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

function markingOutput() {
  return {
    subquestionGuidance: [
      {
        subquestionId: 'q1',
        rewardedDemands: ['calculation', 'application'],
        assessmentObjectiveAllocation: [
          { objectiveId: 'ao1', marks: 2 },
          { objectiveId: 'ao2', marks: 2 },
        ],
        answerRequirements: ['Use the supplied values and a valid calculation route.'],
      },
      {
        subquestionId: 'q2',
        rewardedDemands: ['analysis', 'application'],
        assessmentObjectiveAllocation: [
          { objectiveId: 'ao2', marks: 2 },
          { objectiveId: 'ao3', marks: 2 },
        ],
        answerRequirements: ['Explain a scientifically valid reason for the difference.'],
      },
    ],
    rubricGuidance: [
      {
        subquestionId: 'q1',
        levels: [
          { descriptor: 'No or limited valid method or working.' },
          { descriptor: 'Some correct method or working with partial application.' },
          { descriptor: 'Correct method with an accurate final answer; allow consequential follow-through where appropriate.' },
        ],
      },
      {
        subquestionId: 'q2',
        levels: [
          { descriptor: 'Limited but relevant scientific explanation.' },
          { descriptor: 'Developed causal scientific explanation applied to the supplied context.' },
        ],
      },
    ],
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

function workerInput() {
  return {
    jobId: 'q2-marking-pack',
    courseIdentity,
    assessmentBlueprint,
    questionFamily,
    assessmentItem,
    knowledgeNodes,
  }
}

describe('Q2 structured Marking Pack AO ownership', () => {
  it('keeps structured aggregate AO arithmetic out of the provider schema and derives it from validated subquestion guidance', async () => {
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as {
        instructions: string
        text: { format: { schema: unknown } }
      }
      const schemaText = JSON.stringify(body.text.format.schema)
      expect(schemaText).not.toContain('overallAssessmentObjectiveAllocation')
      expect(schemaText).not.toContain('"maxMark"')
      expect(body.instructions).toContain('Revision derives it from validated subquestion allocations')
      return new Response(JSON.stringify(responseBody(markingOutput())), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }) as typeof fetch

    const result = await createOpenAIModelAssistedWorkers(config(fetchImpl)).generateMarkingPack(workerInput())

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    expect(result.provenance.contractVersion).toBe('4')
    const output = result.output as {
      assessmentObjectiveAllocation: unknown
      subquestionGuidance: Array<{ subquestionId: string; maxMark: number }>
    }
    expect(output.assessmentObjectiveAllocation).toEqual([
      { objectiveId: 'ao1', marks: 2 },
      { objectiveId: 'ao2', marks: 4 },
      { objectiveId: 'ao3', marks: 2 },
    ])
    expect(output.subquestionGuidance.map(({ subquestionId, maxMark }) => ({ subquestionId, maxMark }))).toEqual([
      { subquestionId: 'q1', maxMark: 4 },
      { subquestionId: 'q2', maxMark: 4 },
    ])
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('fails at the provider contract boundary when legacy structured aggregate and numeric-rubric fields are returned', async () => {
    const legacyOutput = {
      ...markingOutput(),
      assessmentObjectiveAllocation: [
        { objectiveId: 'ao1', marks: 4 },
        { objectiveId: 'ao2', marks: 4 },
      ],
      rubric: [{ id: 'legacy', descriptor: 'Legacy provider-authored band.', minMark: 0, maxMark: 8 }],
    }
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(responseBody(legacyOutput)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })) as typeof fetch

    const result = await createOpenAIModelAssistedWorkers(config(fetchImpl)).generateMarkingPack(workerInput())

    expect(result.status).toBe('failure')
    if (result.status !== 'failure') throw new Error('expected provider-contract failure')
    expect(result.error).toContain('provider_contract_failure')
    expect(result.error).toContain('Unrecognized keys')
    expect(result.provenance.contractVersion).toBe('4')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('collects a subquestion AO total defect, gives it one bounded repair, then fails closed if it remains', async () => {
    const invalid = markingOutput()
    invalid.subquestionGuidance[0].assessmentObjectiveAllocation = [
      { objectiveId: 'ao1', marks: 1 },
      { objectiveId: 'ao2', marks: 1 },
    ]
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(responseBody(invalid)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })) as typeof fetch

    const result = await createOpenAIModelAssistedWorkers(config(fetchImpl)).generateMarkingPack(workerInput())

    expect(result.status).toBe('failure')
    if (result.status !== 'failure') throw new Error('expected fail-closed result')
    expect(result.error).toContain('marking_pack_v2_after_complete_diagnostic_repair')
    expect(result.error).toContain('MARKING_SUBQUESTION_AO_TOTAL_MISMATCH')
    expect(result.provenance.contractVersion).toBe('4')
    expect(result.provenance.retryCount).toBe(1)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })
})
