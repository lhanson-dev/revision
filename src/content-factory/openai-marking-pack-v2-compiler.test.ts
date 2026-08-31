import { describe, expect, it, vi } from 'vitest'
import {
  compileMarkingPackV2Candidate,
  createOpenAIModelAssistedWorkers,
  diagnoseMarkingPackV2Candidate,
  markingPackV2ProviderOutputSchema,
} from './openai-marking-pack-v2-compiler'

const route = {
  model: 'test-model',
  inputUsdPerMillion: 2,
  cachedInputUsdPerMillion: 0.2,
  outputUsdPerMillion: 12,
  maxOutputTokens: 2_000,
}

const input = {
  jobId: 'pilot-18-reproduction',
  courseIdentity: {
    subject: 'Synthetic Economics',
    qualification: 'Synthetic A Level',
    awardingBody: 'Test Board',
    specificationId: 'synthetic-econ-1',
  },
  assessmentBlueprint: {
    schemaVersion: 1 as const,
    jobId: 'pilot-18-reproduction',
    fingerprint: 'blueprint-v1',
    boardAlignmentFingerprint: 'board-v1',
    assessmentObjectives: [{ id: 'ao1' }, { id: 'ao2' }],
    components: [{ componentId: 'paper-1', questionFamilyIds: ['mixed-family'], markTotal: 10, timingMinutes: 20, constraints: [] }],
    quantitativeRequirements: [],
    synopticRequirements: [],
    commandDemands: [],
    evidenceExpectations: [],
  },
  questionFamily: {
    schemaVersion: 1 as const,
    id: 'mixed-family',
    title: 'Calculation and evaluation',
    assessmentObjectiveIds: ['ao1', 'ao2'],
    skillProfile: ['calculation', 'evaluation'],
    componentScope: ['paper-1'],
    markRange: { min: 10, max: 10 },
    responseShape: 'one calculation followed by one evaluation',
    contextRequirements: [],
    applicationRequirements: ['Apply the supplied information.'],
    analysisRequirements: [],
    evaluationRequirements: ['Reach a supported judgement.'],
    commonFailureModes: [],
    markingPackTemplateVersion: '1',
    calibrationStatus: 'not_calibrated' as const,
  },
  assessmentItem: {
    id: 'mixed-item',
    version: '1',
    title: 'Synthetic mixed item',
    componentId: 'paper-1',
    questionFamilyId: 'mixed-family',
    requirementIds: ['requirement'],
    knowledgeNodeIds: ['node'],
    format: 'mixed' as const,
    command: 'Complete',
    maxMark: 10,
    questionWording: 'Calculate the value. Evaluate the option.',
    subquestions: [
      {
        id: 'q1',
        command: 'Calculate',
        wording: 'Calculate the value.',
        maxMark: 4,
        requirementIds: ['requirement'],
        responseDemands: ['calculation'] as Array<'calculation'>,
        coverageEvidence: [{ requirementId: 'requirement', evidence: 'Calculate the value' }],
      },
      {
        id: 'q2',
        command: 'Evaluate',
        wording: 'Evaluate the option.',
        maxMark: 6,
        requirementIds: ['requirement'],
        responseDemands: ['evaluation'] as Array<'evaluation'>,
        coverageEvidence: [{ requirementId: 'requirement', evidence: 'Evaluate the option' }],
      },
    ],
  },
  knowledgeNodes: [{
    id: 'node',
    kind: 'concept' as const,
    summary: 'Synthetic concept.',
    formulas: [],
    misconceptions: [],
    applicationContexts: [],
    depth: 'core' as const,
    evidenceTypes: ['synthetic'],
  }],
}

function baseCandidate() {
  return {
    subquestionGuidance: [
      {
        subquestionId: 'q1',
        rewardedDemands: ['calculation'],
        assessmentObjectiveAllocation: [{ objectiveId: 'ao1', marks: 4 }],
        answerRequirements: ['Use a valid calculation route.'],
      },
      {
        subquestionId: 'q2',
        rewardedDemands: ['evaluation'],
        assessmentObjectiveAllocation: [{ objectiveId: 'ao2', marks: 6 }],
        answerRequirements: ['Reach a supported judgement.'],
      },
    ],
    applicationRequirements: ['Apply the supplied information.'],
    analysisRequirements: [],
    evaluationRequirements: ['Reach a supported judgement.'],
    validReasoningRoutes: ['Any valid supported route.'],
    indicativeContent: ['Relevant synthetic content.'],
    misconceptions: ['A plausible misconception.'],
    diagnosticFeedbackRules: ['Diagnose the weakest rewarded demand.'],
    improvementActions: ['Improve the weakest rewarded demand.'],
    ambiguityPolicy: 'Escalate material ambiguity.',
    confidencePolicy: 'Do not overstate confidence.',
  }
}

function invalidPilot18StyleCandidate() {
  return {
    ...baseCandidate(),
    rubricGuidance: [
      { subquestionId: 'q1', levels: [{ descriptor: 'Some credit for a plausible result.' }] },
      { subquestionId: 'q2', levels: [{ descriptor: 'Evaluation with some support.' }] },
    ],
  }
}

function validCandidate() {
  return {
    ...baseCandidate(),
    rubricGuidance: [
      {
        subquestionId: 'q1',
        levels: [
          { descriptor: 'No or limited valid method or working.' },
          { descriptor: 'Valid method with an accurate answer; allow consequential follow-through where appropriate.' },
        ],
      },
      {
        subquestionId: 'q2',
        levels: [
          { descriptor: 'Limited evaluation with weak support.' },
          { descriptor: 'Developed evaluation using relevant support.' },
          { descriptor: 'Well-supported evaluation reaching a justified judgement.' },
        ],
      },
    ],
  }
}

function responseBody(output: unknown) {
  return {
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(output) }] }],
    usage: { input_tokens: 100, output_tokens: 100 },
  }
}

describe('Reliability v2-A Marking Pack compiler', () => {
  it('keeps structured compiler-owned aggregate and rubric mechanics out of the provider contract', () => {
    const candidate = validCandidate()
    expect(markingPackV2ProviderOutputSchema.safeParse(candidate).success).toBe(true)
    expect(markingPackV2ProviderOutputSchema.safeParse({
      ...candidate,
      overallAssessmentObjectiveAllocation: [],
    }).success).toBe(false)
    expect(markingPackV2ProviderOutputSchema.safeParse({
      ...candidate,
      rubric: [{ id: 'q1-level-1', descriptor: 'Mechanical provider field.', minMark: 0, maxMark: 4 }],
    }).success).toBe(false)
  })

  it('returns the complete actionable defect set for a parseable Pilot 18 style candidate', () => {
    const diagnostics = diagnoseMarkingPackV2Candidate(invalidPilot18StyleCandidate(), input)
    expect(diagnostics.map((entry) => entry.code)).toEqual([
      'MARKING_CALCULATION_METHOD_TREATMENT_MISSING',
      'MARKING_CALCULATION_ACCURACY_TREATMENT_MISSING',
      'MARKING_EXTENDED_RESPONSE_LEVELS_INSUFFICIENT',
    ])
  })

  it('compiles deterministic IDs, contiguous bands, subquestion maxMark and aggregate AO arithmetic', () => {
    const compiled = compileMarkingPackV2Candidate(validCandidate(), input)
    expect(compiled.assessmentObjectiveAllocation).toEqual([
      { objectiveId: 'ao1', marks: 4 },
      { objectiveId: 'ao2', marks: 6 },
    ])
    expect(compiled.subquestionGuidance.map((entry) => ({ id: entry.subquestionId, maxMark: entry.maxMark }))).toEqual([
      { id: 'q1', maxMark: 4 },
      { id: 'q2', maxMark: 6 },
    ])
    expect(compiled.rubric).toEqual([
      {
        id: 'q1-level-1',
        descriptor: 'No or limited valid method or working.',
        minMark: 0,
        maxMark: 2,
      },
      {
        id: 'q1-level-2',
        descriptor: 'Valid method with an accurate answer; allow consequential follow-through where appropriate.',
        minMark: 3,
        maxMark: 4,
      },
      {
        id: 'q2-level-1',
        descriptor: 'Limited evaluation with weak support.',
        minMark: 0,
        maxMark: 2,
      },
      {
        id: 'q2-level-2',
        descriptor: 'Developed evaluation using relevant support.',
        minMark: 3,
        maxMark: 4,
      },
      {
        id: 'q2-level-3',
        descriptor: 'Well-supported evaluation reaching a justified judgement.',
        minMark: 5,
        maxMark: 6,
      },
    ])
  })

  it('sends every first-pass defect in the one targeted repair and then succeeds after whole-artifact revalidation', async () => {
    let call = 0
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      call += 1
      const body = JSON.parse(String(init?.body)) as { instructions: string; text: { format: { schema: unknown } } }
      const schemaText = JSON.stringify(body.text.format.schema)
      expect(schemaText).not.toContain('minMark')
      expect(schemaText).not.toContain('maxMark')
      expect(schemaText).not.toContain('overallAssessmentObjectiveAllocation')
      expect(schemaText).not.toContain('"rubric"')
      if (call === 1) {
        return new Response(JSON.stringify(responseBody(invalidPilot18StyleCandidate())), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      expect(body.instructions).toContain('MARKING_CALCULATION_METHOD_TREATMENT_MISSING')
      expect(body.instructions).toContain('MARKING_CALCULATION_ACCURACY_TREATMENT_MISSING')
      expect(body.instructions).toContain('MARKING_EXTENDED_RESPONSE_LEVELS_INSUFFICIENT')
      return new Response(JSON.stringify(responseBody(validCandidate())), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }) as typeof fetch

    const result = await createOpenAIModelAssistedWorkers({
      apiKey: 'test-secret',
      generation: route,
      independentReview: route,
      fetchImpl,
      maxRetries: 0,
    }).generateMarkingPack({ ...input, candidateNumber: 1, maxCandidates: 2 })

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    expect(result.provenance.contractVersion).toBe('5')
    expect(result.provenance.retryCount).toBe(1)
    expect((result.output as { rubric: unknown[] }).rubric).toHaveLength(5)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('returns a rejected candidate after the one repair when whole-artifact revalidation still finds defects', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(responseBody(invalidPilot18StyleCandidate())), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })) as typeof fetch

    const result = await createOpenAIModelAssistedWorkers({
      apiKey: 'test-secret',
      generation: route,
      independentReview: route,
      fetchImpl,
      maxRetries: 0,
    }).generateMarkingPack({ ...input, candidateNumber: 1, maxCandidates: 2 })

    expect(result.status).toBe('failure')
    if (result.status !== 'failure') throw new Error('expected failure')
    expect(result.error).toContain('marking_pack_v2_candidate_rejected')
    expect(result.error).toContain('MARKING_CALCULATION_METHOD_TREATMENT_MISSING')
    expect(result.error).toContain('MARKING_EXTENDED_RESPONSE_LEVELS_INSUFFICIENT')
    expect(result.provenance.contractVersion).toBe('5')
    expect(result.provenance.retryCount).toBe(1)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('freshly resamples the same accepted question after a rejected repaired candidate', async () => {
    let call = 0
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      call += 1
      const body = JSON.parse(String(init?.body)) as { instructions: string; input?: unknown }
      if (call <= 2) {
        return new Response(JSON.stringify(responseBody(invalidPilot18StyleCandidate())), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      expect(body.instructions).toContain('FRESH MARKING PACK CANDIDATE RESAMPLE REQUIRED')
      expect(body.instructions).toContain('accepted assessment question is fixed')
      return new Response(JSON.stringify(responseBody(validCandidate())), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }) as typeof fetch

    const result = await createOpenAIModelAssistedWorkers({
      apiKey: 'test-secret',
      generation: route,
      independentReview: route,
      fetchImpl,
      maxRetries: 0,
    }).generateMarkingPack(input)

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    expect(result.provenance.contractVersion).toBe('5')
    expect(result.provenance.retryCount).toBe(2)
    expect(fetchImpl).toHaveBeenCalledTimes(3)
  })

  it('fails closed after both fresh candidates exhaust their one-repair allowance', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(responseBody(invalidPilot18StyleCandidate())), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })) as typeof fetch

    const result = await createOpenAIModelAssistedWorkers({
      apiKey: 'test-secret',
      generation: route,
      independentReview: route,
      fetchImpl,
      maxRetries: 0,
    }).generateMarkingPack(input)

    expect(result.status).toBe('failure')
    if (result.status !== 'failure') throw new Error('expected failure')
    expect(result.error).toContain('marking_pack_v2_candidate_recovery_exhausted')
    expect(result.error).toContain('candidate 1 diagnostics_after_repair')
    expect(result.error).toContain('candidate 2 diagnostics_after_repair')
    expect(result.provenance.contractVersion).toBe('5')
    expect(fetchImpl).toHaveBeenCalledTimes(4)
  })
})
