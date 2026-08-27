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
        requirementIds: ['finance-analysis'], responseDemands: ['calculation', 'application'],
        coverageEvidence: [{ requirementId: 'finance-analysis', evidence: 'contribution per unit' }],
      },
      {
        id: 'q2', command: 'Analyse', wording: q2, maxMark: 4,
        requirementIds: ['finance-analysis'], responseDemands: ['analysis', 'application'],
        coverageEvidence: [{ requirementId: 'finance-analysis', evidence: 'higher contribution per unit' }],
      },
    ],
  }
}

function config(fetchImpl: typeof fetch) {
  return {
    apiKey: 'test-secret',
    generation: route,
    independentReview: route,
    fetchImpl,
    maxRetries: 2,
    assessmentItemPolicies: {
      'data-response': { requirementIds: ['finance-analysis'], maxMark: 8, format: 'mixed' as const },
    },
  }
}

describe('OpenAI assessment integrity compiler', () => {
  it('requires configured assessment policies to produce auditable structured subquestions', async () => {
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { input: string }
      const payload = JSON.parse(body.input) as { questionFamily: { responseShape: string }; assessmentBlueprint: { evidenceExpectations: string[] } }
      expect(payload.questionFamily.responseShape).toContain('non-empty subquestions array')
      expect(payload.assessmentBlueprint.evidenceExpectations.join(' ')).toContain('misconceptionBasis')
      return new Response(JSON.stringify(responseBody(validAssessmentOutput())), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }) as typeof fetch

    const workers = createOpenAIModelAssistedWorkers(config(fetchImpl))
    const result = await workers.generateAssessmentItem({
      jobId: 'assessment-job', courseIdentity, assessmentBlueprint: blueprint, questionFamily: family,
      targetComponentId: 'paper-1', knowledgeNodes, examPrepRequirements,
    })
    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    expect((result.output as { subquestions: unknown[] }).subquestions).toHaveLength(2)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('turns a completed but unstructured provider response into a terminal contract failure without retrying', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(responseBody({
      ...validAssessmentOutput(), subquestions: [],
    })), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch
    const workers = createOpenAIModelAssistedWorkers(config(fetchImpl))
    const result = await workers.generateAssessmentItem({
      jobId: 'assessment-job', courseIdentity, assessmentBlueprint: blueprint, questionFamily: family,
      targetComponentId: 'paper-1', knowledgeNodes, examPrepRequirements,
    })
    expect(result.status).toBe('failure')
    if (result.status === 'failure') expect(result.error).toContain('assessment_item_compilation')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})
