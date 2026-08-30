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
  subject: 'Economics',
  qualification: 'A Level',
  awardingBody: 'Test Board',
  specificationId: 'econ-1',
}

const blueprint = {
  schemaVersion: 1 as const,
  jobId: 'assessment-job',
  fingerprint: 'assessment-blueprint-v1',
  boardAlignmentFingerprint: 'board-v1',
  assessmentObjectives: [{ id: 'ao1' }, { id: 'ao2' }, { id: 'ao3' }],
  components: [{ componentId: 'paper-1', questionFamilyIds: ['data-response'], markTotal: 8, timingMinutes: 20, constraints: [] }],
  quantitativeRequirements: [],
  synopticRequirements: [],
  commandDemands: [],
  evidenceExpectations: [],
}

const family = {
  schemaVersion: 1 as const,
  id: 'data-response',
  title: 'Data response',
  assessmentObjectiveIds: ['ao1', 'ao2', 'ao3'],
  skillProfile: ['calculation and analysis'],
  componentScope: ['paper-1'],
  markRange: { min: 8, max: 8 },
  responseShape: 'two linked questions totalling eight marks',
  contextRequirements: [],
  applicationRequirements: ['Use supplied data.'],
  analysisRequirements: ['Develop reasoning when asked.'],
  evaluationRequirements: [],
  commonFailureModes: [],
  markingPackTemplateVersion: '1',
  calibrationStatus: 'not_calibrated' as const,
}

const knowledgeNodes = [{
  id: 'contribution',
  kind: 'formula' as const,
  summary: 'Calculate contribution.',
  formulas: ['contribution = selling price - variable cost'],
  misconceptions: ['Using fixed cost as unit variable cost.'],
  applicationContexts: ['business data'],
  depth: 'core' as const,
  evidenceTypes: ['calculation'],
}]

const examPrepRequirements = [{
  requirementId: 'finance-analysis',
  requirementSummary: 'Use contribution in business decisions.',
  skillsOrKnowledge: ['calculate contribution'],
  componentScope: ['paper-1'],
  revisionArea: 'Finance',
}]

function responseBody(output: unknown) {
  return {
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(output) }] }],
    usage: { input_tokens: 100, output_tokens: 100 },
  }
}

function validAssessmentOutput() {
  const q1 = 'Calculate the contribution per unit using the supplied selling price and variable cost.'
  const q2 = 'Analyse one reason why a higher contribution per unit could improve the business decision.'
  return {
    id: 'finance-item',
    version: '1',
    title: 'Contribution decision',
    knowledgeNodeIds: ['contribution'],
    command: 'mixed',
    questionWording: `1. ${q1} [4]\n2. ${q2} [4]`,
    subquestions: [
      {
        id: 'q1', command: 'Calculate', wording: q1, maxMark: 4,
        responseDemands: ['calculation', 'application'],
        coverageEvidence: [{ requirementId: 'finance-analysis', evidence: 'contribution per unit' }],
      },
      {
        id: 'q2', command: 'Analyse', wording: q2, maxMark: 4,
        responseDemands: ['analysis', 'application'],
        coverageEvidence: [{ requirementId: 'finance-analysis', evidence: 'higher contribution per unit' }],
      },
    ],
  }
}

function invalidCalculationSelectionOutput() {
  const wording = 'Which option shows the contribution per unit from the supplied figures?'
  return {
    id: 'finance-mcq-item', version: '1', title: 'Contribution selection', knowledgeNodeIds: ['contribution'],
    command: 'Select', questionWording: wording,
    subquestions: [{
      id: 'q1', command: 'Select', wording, maxMark: 8,
      responseDemands: ['selection', 'calculation'],
      coverageEvidence: [{ requirementId: 'finance-analysis', evidence: 'contribution per unit' }],
      options: [
        { label: 'A', text: 'GBP 2', correct: false, misconceptionBasis: 'Subtracts the values in the wrong order.' },
        { label: 'B', text: 'GBP 3', correct: true },
        { label: 'C', text: 'GBP 5', correct: false, misconceptionBasis: 'Adds selling price and variable cost.' },
        { label: 'D', text: 'GBP 8', correct: false, misconceptionBasis: 'Uses total figures without a per-unit calculation.' },
      ],
    }],
  }
}

function invalidInterpretationOutput() {
  const wording = 'Which option shows the capacity utilisation figure from the supplied data?'
  return {
    id: 'capacity-choice', version: '1', title: 'Capacity utilisation choice', knowledgeNodeIds: ['contribution'],
    command: 'Select', questionWording: wording,
    subquestions: [{
      id: 'q1', command: 'Select', wording, maxMark: 8,
      responseDemands: ['selection', 'interpretation'],
      coverageEvidence: [{ requirementId: 'finance-analysis', evidence: 'capacity utilisation figure' }],
      options: [
        { label: 'A', text: '40%', correct: false, misconceptionBasis: 'Reverses the utilisation ratio.' },
        { label: 'B', text: '60%', correct: true },
        { label: 'C', text: '100%', correct: false, misconceptionBasis: 'Assumes all capacity is used.' },
        { label: 'D', text: '160%', correct: false, misconceptionBasis: 'Uses the ratio in reverse.' },
      ],
    }],
  }
}

function pilot14InvalidOutput() {
  const q1 = 'Calculate the contribution per unit using the supplied selling price and variable cost.'
  const q2 = 'State one consequence of the result for the business decision.'
  return {
    id: 'pilot14-item', version: '1', title: 'Financial workforce decision', knowledgeNodeIds: ['contribution'],
    command: 'mixed', questionWording: `1. ${q1} [4]\n2. ${q2} [4]`,
    subquestions: [
      {
        id: 'q1', command: 'Calculate', wording: q1, maxMark: 4,
        responseDemands: ['calculation', 'application'],
        coverageEvidence: [{ requirementId: 'finance-analysis', evidence: 'contribution per unit' }],
      },
      {
        id: 'q2', command: 'State', wording: q2, maxMark: 4,
        responseDemands: ['knowledge', 'interpretation'],
        coverageEvidence: [{ requirementId: 'finance-analysis', evidence: 'consequence of the result' }],
      },
    ],
  }
}

function pilot14RepairedOutput() {
  const q1 = 'Calculate the contribution per unit using the supplied selling price and variable cost.'
  const q2 = 'Explain what the result suggests for the business decision.'
  return {
    id: 'pilot14-item', version: '1', title: 'Financial workforce decision', knowledgeNodeIds: ['contribution'],
    command: 'mixed', questionWording: `1. ${q1} [4]\n2. ${q2} [4]`,
    subquestions: [
      {
        id: 'q1', command: 'Calculate', wording: q1, maxMark: 4,
        responseDemands: ['calculation', 'application'],
        coverageEvidence: [{ requirementId: 'finance-analysis', evidence: 'contribution per unit' }],
      },
      {
        id: 'q2', command: 'Explain', wording: q2, maxMark: 4,
        responseDemands: ['interpretation', 'analysis'],
        coverageEvidence: [{ requirementId: 'finance-analysis', evidence: 'result suggests' }],
      },
    ],
  }
}

function config(fetchImpl: typeof fetch) {
  return {
    apiKey: 'test-secret', generation: route, independentReview: route, fetchImpl, maxRetries: 2,
    assessmentItemPolicies: {
      'data-response': { requirementIds: ['finance-analysis'], maxMark: 8, format: 'mixed' as const },
    },
  }
}

function assessmentInput() {
  return {
    jobId: 'assessment-job', courseIdentity, assessmentBlueprint: blueprint, questionFamily: family,
    targetComponentId: 'paper-1', knowledgeNodes, examPrepRequirements,
  }
}

describe('OpenAI assessment integrity compiler', () => {
  it('requires configured assessment policies to produce auditable structured subquestions', async () => {
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { instructions: string; input: string }
      const payload = JSON.parse(body.input) as { targetPolicy: { requirementIds: string[]; maxMark: number; format: string } }
      expect(body.instructions).toContain('Every subquestion must include maxMark, responseDemands and coverageEvidence.')
      expect(body.instructions).toContain('Do not return subquestion requirementIds; Revision derives them deterministically from coverageEvidence requirementId values.')
      expect(body.instructions).toContain('Subquestion maxMark values must sum exactly to targetPolicy.maxMark.')
      expect(body.instructions).toContain('coverageEvidence entry must identify the governed requirementId')
      expect(body.instructions).toContain('selection/MCQ tasks provide exactly four distinct options A-D')
      expect(payload.targetPolicy).toEqual({ requirementIds: ['finance-analysis'], maxMark: 8, format: 'mixed' })
      return new Response(JSON.stringify(responseBody(validAssessmentOutput())), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }) as typeof fetch

    const workers = createOpenAIModelAssistedWorkers(config(fetchImpl))
    const result = await workers.generateAssessmentItem(assessmentInput())
    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    expect(result.provenance.contractVersion).toBe('5')
    expect(result.provenance.retryCount).toBe(0)
    const output = result.output as { subquestions: Array<{ requirementIds: string[] }> }
    expect(output.subquestions).toHaveLength(2)
    expect(output.subquestions.every((subquestion) => subquestion.requirementIds[0] === 'finance-analysis')).toBe(true)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('makes one targeted repair attempt for a completed but unstructured provider response, then fails closed if still invalid', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(responseBody({
      ...validAssessmentOutput(), subquestions: [],
    })), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch
    const workers = createOpenAIModelAssistedWorkers(config(fetchImpl))
    const result = await workers.generateAssessmentItem(assessmentInput())
    expect(result.status).toBe('failure')
    expect(result.provenance.contractVersion).toBe('5')
    expect(result.provenance.retryCount).toBe(1)
    if (result.status === 'failure') expect(result.error).toContain('assessment_item_v2_after_complete_diagnostic_repair')
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('keeps the fail-closed calculation-demand guard after one targeted repair attempt', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(responseBody(invalidCalculationSelectionOutput())), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })) as typeof fetch
    const workers = createOpenAIModelAssistedWorkers(config(fetchImpl))
    const result = await workers.generateAssessmentItem(assessmentInput())
    expect(result.status).toBe('failure')
    expect(result.provenance.contractVersion).toBe('5')
    expect(result.provenance.retryCount).toBe(1)
    if (result.status === 'failure') expect(result.error).toContain('command does not ask for rewarded demand calculation')
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('keeps the fail-closed interpretation guard for Pilot 12 style selection wording after one targeted repair attempt', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(responseBody(invalidInterpretationOutput())), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })) as typeof fetch
    const workers = createOpenAIModelAssistedWorkers(config(fetchImpl))
    const result = await workers.generateAssessmentItem(assessmentInput())
    expect(result.status).toBe('failure')
    expect(result.provenance.contractVersion).toBe('5')
    expect(result.provenance.retryCount).toBe(1)
    if (result.status === 'failure') expect(result.error).toContain('command does not ask for rewarded demand interpretation')
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('repairs a Pilot 14 style response-demand mismatch once using the exact deterministic validation error', async () => {
    let call = 0
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      call += 1
      const body = JSON.parse(String(init?.body)) as { instructions: string; input: string }
      if (call === 1) {
        return new Response(JSON.stringify(responseBody(pilot14InvalidOutput())), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
      expect(body.instructions).toContain('TARGETED ASSESSMENT ITEM REPAIR REQUIRED')
      expect(body.instructions).toContain('command does not ask for rewarded demand interpretation')
      const payload = JSON.parse(body.input) as { repairDiagnostics: Array<{ code: string; message: string }> }
      expect(payload.repairDiagnostics).toEqual(expect.arrayContaining([
        expect.objectContaining({ code: 'ASSESSMENT_STRUCTURED_CONTRACT_INVALID' }),
      ]))
      return new Response(JSON.stringify(responseBody(pilot14RepairedOutput())), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }) as typeof fetch

    const workers = createOpenAIModelAssistedWorkers(config(fetchImpl))
    const result = await workers.generateAssessmentItem(assessmentInput())
    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    expect(result.provenance.contractVersion).toBe('5')
    expect(result.provenance.retryCount).toBe(1)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    const repaired = result.output as { id: string; subquestions: Array<{ id: string; command: string; responseDemands: string[] }> }
    expect(repaired.id).toBe('pilot14-item')
    expect(repaired.subquestions[1]).toMatchObject({ id: 'q2', command: 'Explain', responseDemands: ['interpretation', 'analysis'] })
  })
})
