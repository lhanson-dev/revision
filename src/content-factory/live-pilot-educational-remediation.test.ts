import { describe, expect, it, vi } from 'vitest'
import {
  AQA_AS_BUSINESS_7131_ASSESSMENT_ITEM_POLICIES,
  AQA_AS_BUSINESS_7131_FIXED_ASSESSMENT_CONTEXTS,
  AQA_AS_BUSINESS_7131_QUESTION_FAMILY_POLICIES,
  LivePilotArtifactStore,
  createAqaAsBusiness7131LivePilotWorkers,
} from './live-pilot'

const route = {
  model: 'test-model',
  inputUsdPerMillion: 2,
  cachedInputUsdPerMillion: 0.2,
  outputUsdPerMillion: 12,
  maxOutputTokens: 2_000,
}

function responseBody(output: unknown) {
  return {
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(output) }] }],
    usage: { input_tokens: 100, output_tokens: 100 },
  }
}

function testWorkers(fetchImpl: typeof fetch) {
  return createAqaAsBusiness7131LivePilotWorkers({
    openAI: {
      apiKey: 'test-secret',
      generation: route,
      independentReview: route,
      fetchImpl,
      maxRetries: 0,
    },
    artifactStore: new LivePilotArtifactStore(),
  })
}

const courseIdentity = {
  subject: 'Business',
  qualification: 'AS Level',
  awardingBody: 'AQA',
  specificationId: '7131',
}

const components = [
  { id: 'paper-1', name: 'Business 1', compulsory: true, marks: 80, durationMinutes: 90, weightingPercent: 50 },
  { id: 'paper-2', name: 'Business 2', compulsory: true, marks: 80, durationMinutes: 90, weightingPercent: 50 },
]

const paper2Family = {
  schemaVersion: 1 as const,
  id: 'paper2-case-study-80',
  title: 'Paper 2 compulsory case study',
  assessmentObjectiveIds: ['ao1', 'ao2', 'ao3', 'ao4'],
  skillProfile: ['application', 'analysis', 'evaluation'],
  componentScope: ['paper-2'],
  markRange: { min: 80, max: 80 },
  responseShape: 'one shared original case study followed by approximately seven linked questions totalling 80 marks',
  contextRequirements: ['One shared original case study.'],
  applicationRequirements: ['Use case facts.'],
  analysisRequirements: ['Develop contextual chains.'],
  evaluationRequirements: ['Reach a supported judgement.'],
  commonFailureModes: [],
  markingPackTemplateVersion: '1',
  calibrationStatus: 'not_calibrated' as const,
}

const assessmentBlueprint = {
  schemaVersion: 1 as const,
  jobId: 'cf-business',
  fingerprint: 'assessment-blueprint-v2',
  boardAlignmentFingerprint: 'board-alignment-v2',
  assessmentObjectives: [{ id: 'ao1' }, { id: 'ao2' }, { id: 'ao3' }, { id: 'ao4' }],
  components: [
    {
      componentId: 'paper-1',
      questionFamilyIds: ['paper1-mcq-10', 'paper1-short-answer-20', 'paper1-data-response-a-25', 'paper1-data-response-b-25'],
      markTotal: 80,
      timingMinutes: 90,
      constraints: [],
    },
    {
      componentId: 'paper-2',
      questionFamilyIds: ['paper2-case-study-80'],
      markTotal: 80,
      timingMinutes: 90,
      constraints: [],
    },
  ],
  quantitativeRequirements: [],
  synopticRequirements: [],
  commandDemands: [],
  evidenceExpectations: [],
}

describe('AQA AS Business Pilot #6 educational remediation', () => {
  it('encodes the governed Paper 1 section mix and a single Paper 2 case study before generation', async () => {
    const workers = testWorkers(vi.fn() as unknown as typeof fetch)
    const execution = await workers.compileAssessmentBlueprint({
      jobId: 'cf-business',
      courseIdentity,
      components,
      assessmentObjectives: [],
      assessmentRequirements: [],
      examPrepRequirements: [],
      knowledgeNodes: [],
    })

    expect(execution.status).toBe('success')
    if (execution.status !== 'success') throw new Error(execution.error)
    const blueprint = execution.output as typeof assessmentBlueprint
    const paper1 = blueprint.components.find((component) => component.componentId === 'paper-1')
    const paper2 = blueprint.components.find((component) => component.componentId === 'paper-2')

    expect(paper1?.questionFamilyIds).toEqual([
      'paper1-mcq-10',
      'paper1-short-answer-20',
      'paper1-data-response-a-25',
      'paper1-data-response-b-25',
    ])
    expect(paper1?.questionFamilyIds.reduce((sum, id) => sum + AQA_AS_BUSINESS_7131_QUESTION_FAMILY_POLICIES[id]!.maxMark, 0)).toBe(80)
    expect(AQA_AS_BUSINESS_7131_QUESTION_FAMILY_POLICIES['paper1-mcq-10']?.responseShape).toContain('exactly 10 one-mark multiple-choice questions')
    expect(paper2?.questionFamilyIds).toEqual(['paper2-case-study-80'])
    expect(AQA_AS_BUSINESS_7131_QUESTION_FAMILY_POLICIES['paper2-case-study-80']?.maxMark).toBe(80)
    expect(AQA_AS_BUSINESS_7131_ASSESSMENT_ITEM_POLICIES['paper2-case-study-80']?.maxMark).toBe(80)
  })

  it('supplies and then deterministically owns the shared Paper 2 case facts', async () => {
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { input: string }
      const payload = JSON.parse(body.input) as { questionFamily: { contextRequirements: string[]; responseShape: string } }

      expect(payload.questionFamily.contextRequirements.join(' ')).toContain('RefillWorks Ltd')
      expect(payload.questionFamily.contextRequirements.join(' ')).toContain('Current annual output=72000')
      expect(payload.questionFamily.responseShape).toContain('approximately seven linked subquestions')
      expect(payload.questionFamily.responseShape).toContain('Do not introduce a second business')

      return new Response(JSON.stringify(responseBody({
        id: 'paper2-case-study-80-item',
        version: '1',
        title: 'A coherent growth decision',
        knowledgeNodeIds: ['business-foundations'],
        command: 'analyse',
        questionWording: 'Use the supplied RefillWorks case to answer the linked questions.',
        context: {
          id: 'provider-invented-context',
          title: 'Provider invented context',
          body: 'This must not escape the deterministic pilot boundary.',
          dataPoints: [{ label: 'Invented loan', value: '999999', unit: 'GBP' }],
        },
      })), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }) as typeof fetch

    const workers = testWorkers(fetchImpl)
    const result = await workers.generateAssessmentItem({
      jobId: 'cf-business',
      courseIdentity,
      assessmentBlueprint,
      questionFamily: paper2Family,
      targetComponentId: 'paper-2',
      knowledgeNodes: [{
        id: 'business-foundations',
        kind: 'concept',
        summary: 'Business ownership and objectives.',
        formulas: [],
        misconceptions: [],
        applicationContexts: [],
        depth: 'core',
        evidenceTypes: ['written response'],
      }],
      examPrepRequirements: [],
    })

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    const output = result.output as { context?: unknown; command: string }
    expect(output.context).toEqual(AQA_AS_BUSINESS_7131_FIXED_ASSESSMENT_CONTEXTS['paper2-case-study-80'])
    expect(output.command).toBe('mixed case study')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('pushes the revenue-versus-cash correction into Practice generation input', async () => {
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { input: string }
      const payload = JSON.parse(body.input) as {
        knowledgeNodes: Array<{ summary: string; misconceptions: string[]; applicationContexts: string[] }>
      }
      const finance = payload.knowledgeNodes[0]!
      expect(finance.summary).toContain('delayed payment changes cash timing, not the sales-revenue amount')
      expect(finance.misconceptions).toContain('Delayed customer payment reduces sales revenue rather than delaying cash receipts.')
      expect(finance.applicationContexts.join(' ')).toContain('sales-revenue variance caused by price or volume')

      return new Response(JSON.stringify(responseBody({
        title: 'Revenue, profit and cash practice',
        instructions: 'Keep revenue and cash timing separate.',
        activities: [{
          id: 'revenue-cash-1',
          mode: 'short_answer',
          prompt: 'Explain why a late customer payment does not by itself reduce sales revenue already earned.',
          expectedResponse: 'The sale creates revenue; late payment delays the cash receipt.',
          explanation: 'Revenue and cash receipts are different measures.',
          improvementAction: 'Check whether a variance concerns sales activity or payment timing.',
        }],
      })), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }) as typeof fetch

    const workers = testWorkers(fetchImpl)
    const result = await workers.generatePracticeCollateral({
      jobId: 'cf-business',
      courseIdentity,
      workUnit: {
        id: 'finance-profit-cash-budgeting',
        title: 'Profit, cash flow, budgets and variances',
        requirementIds: ['finance-profit-cash-budgeting'],
        knowledgeNodeIds: ['finance-profit-cash-budgeting'],
        learningModes: ['short_answer'],
        requiredOutputs: ['practice'],
        scope: 'course',
        componentIds: [],
      },
      knowledgeModelFingerprint: 'knowledge-v2',
      knowledgeNodes: [{
        id: 'finance-profit-cash-budgeting',
        kind: 'concept',
        summary: 'Understand revenue, profit and cash flow.',
        formulas: [],
        misconceptions: [],
        applicationContexts: [],
        depth: 'core',
        evidenceTypes: ['short answer'],
      }],
    })

    expect(result.status).toBe('success')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})
