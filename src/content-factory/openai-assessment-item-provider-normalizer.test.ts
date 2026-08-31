import { describe, expect, it, vi } from 'vitest'
import {
  currentDurableWorkerDependencyPolicy,
  durableWorkerDependencyClosure,
} from './durable-worker-dependencies'
import { createOpenAIModelAssistedWorkers } from './openai-live-adapter'
import { normaliseAssessmentItemOptionalUnits } from './openai-assessment-item-provider-normalizer'

const route = {
  model: 'test-model',
  inputUsdPerMillion: 2,
  cachedInputUsdPerMillion: 0.2,
  outputUsdPerMillion: 12,
  maxOutputTokens: 1_000,
}

const targetPolicy = {
  requirementIds: ['quantitative-skills'],
  maxMark: 4,
  format: 'calculation' as const,
}

const questionWording = 'Calculate the percentage change in sales and show your working.'

function providerOutput(dataPoints: Array<{ label: string; value: string; unit?: unknown }>) {
  return {
    id: 'quantitative-item',
    version: '1',
    title: 'Sales percentage change',
    knowledgeNodeIds: ['percentage-change'],
    command: 'calculate',
    questionWording,
    subquestions: [{
      id: 'q1',
      command: 'Calculate',
      wording: questionWording,
      maxMark: 4,
      requirementIds: ['quantitative-skills'],
      responseDemands: ['calculation'],
      coverageEvidence: [{ requirementId: 'quantitative-skills', evidence: 'percentage change' }],
    }],
    context: {
      id: 'sales-data',
      title: 'Sales data',
      body: 'A business is reviewing its sales performance.',
      dataPoints,
    },
  }
}

function responseBody(output: unknown) {
  return {
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(output) }] }],
    usage: { input_tokens: 100, output_tokens: 100 },
  }
}

function assessmentInput() {
  return {
    jobId: 'cf-generic',
    courseIdentity: {
      subject: 'Synthetic quantitative subject',
      qualification: 'Synthetic qualification',
      awardingBody: 'Synthetic board',
      specificationId: 'synthetic-1',
    },
    assessmentBlueprint: {
      schemaVersion: 1 as const,
      jobId: 'cf-generic',
      fingerprint: 'assessment-blueprint-v1',
      boardAlignmentFingerprint: 'board-alignment-v1',
      assessmentObjectives: [{ id: 'ao1', weightingPercent: 100 }],
      components: [{
        componentId: 'paper-1',
        questionFamilyIds: ['quantitative-family'],
        markTotal: 80,
        timingMinutes: 90,
        constraints: [],
      }],
      quantitativeRequirements: [],
      synopticRequirements: [],
      commandDemands: [],
      evidenceExpectations: [],
    },
    questionFamily: {
      schemaVersion: 1 as const,
      id: 'quantitative-family',
      title: 'Quantitative calculation',
      assessmentObjectiveIds: ['ao1'],
      skillProfile: ['calculation'],
      componentScope: ['paper-1'],
      markRange: { min: 4, max: 4 },
      responseShape: 'calculation with working',
      contextRequirements: ['numerical context'],
      applicationRequirements: [],
      analysisRequirements: [],
      evaluationRequirements: [],
      commonFailureModes: [],
      markingPackTemplateVersion: '1',
      calibrationStatus: 'not_calibrated' as const,
    },
    targetComponentId: 'paper-1',
    knowledgeNodes: [],
    examPrepRequirements: [],
  }
}

function workersReturning(output: unknown) {
  const fetchImpl = vi.fn(async () => new Response(JSON.stringify(responseBody(output)), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })) as typeof fetch

  const workers = createOpenAIModelAssistedWorkers({
    apiKey: 'test-secret',
    generation: route,
    independentReview: route,
    fetchImpl,
    maxRetries: 0,
    assessmentItemPolicies: { 'quantitative-family': targetPolicy },
  })
  return { workers, fetchImpl }
}

describe('assessment-item provider optional-unit normalization', () => {
  it('removes only blank optional units while preserving legitimate units and required fields', () => {
    const input = providerOutput([
      { label: 'Employees', value: '25', unit: '' },
      { label: 'Growth', value: '8', unit: '%' },
      { label: 'Cost', value: '120', unit: '£' },
      { label: 'Mass', value: '4', unit: 'kg' },
      { label: 'Index', value: '110', unit: '   ' },
      { label: 'Score', value: '84' },
    ])

    expect(normaliseAssessmentItemOptionalUnits(input)).toMatchObject({
      context: {
        dataPoints: [
          { label: 'Employees', value: '25' },
          { label: 'Growth', value: '8', unit: '%' },
          { label: 'Cost', value: '120', unit: '£' },
          { label: 'Mass', value: '4', unit: 'kg' },
          { label: 'Index', value: '110' },
          { label: 'Score', value: '84' },
        ],
      },
    })
  })

  it('normalizes Pilot 17 class output before strict provider validation with no extra provider call', async () => {
    const { workers, fetchImpl } = workersReturning(providerOutput([
      { label: 'Original sales', value: '100', unit: '' },
      { label: 'New sales', value: '120', unit: '£000' },
    ]))

    const result = await workers.generateAssessmentItem(assessmentInput())

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    expect(result.output).toMatchObject({
      context: {
        dataPoints: [
          { label: 'Original sales', value: '100' },
          { label: 'New sales', value: '120', unit: '£000' },
        ],
      },
    })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('continues to fail closed after both fresh candidates have a blank required data-point value', async () => {
    const { workers, fetchImpl } = workersReturning(providerOutput([
      { label: 'Original sales', value: '', unit: '' },
    ]))

    const result = await workers.generateAssessmentItem(assessmentInput())

    expect(result.status).toBe('failure')
    if (result.status !== 'failure') throw new Error('Expected provider contract failure')
    expect(result.error).toContain('assessment_item_v2_candidate_recovery_exhausted')
    expect(result.error).toContain('context.dataPoints[0].value')
    expect(result.error).toContain('candidate 1 provider_contract')
    expect(result.error).toContain('candidate 2 provider_contract')
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('continues to fail closed after both fresh candidates contain an invalid non-string optional unit', async () => {
    const { workers, fetchImpl } = workersReturning(providerOutput([
      { label: 'Original sales', value: '100', unit: 123 },
    ]))

    const result = await workers.generateAssessmentItem(assessmentInput())

    expect(result.status).toBe('failure')
    if (result.status !== 'failure') throw new Error('Expected provider contract failure')
    expect(result.error).toContain('assessment_item_v2_candidate_recovery_exhausted')
    expect(result.error).toContain('context.dataPoints[0].unit')
    expect(result.error).toContain('candidate 1 provider_contract')
    expect(result.error).toContain('candidate 2 provider_contract')
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('preserves the optional-unit boundary while current Assessment Item semantics advance independently', () => {
    expect(currentDurableWorkerDependencyPolicy.generateAssessmentItem.contractVersion).toBe('3+output-integrity-v6')
    expect(currentDurableWorkerDependencyPolicy.generateLearningCollateral.contractVersion).toBe('3+output-integrity-v2')
    expect(currentDurableWorkerDependencyPolicy.generatePracticeCollateral.contractVersion).toBe('3+output-integrity-v2')

    const markingClosure = durableWorkerDependencyClosure('generateMarkingPack')
    expect(markingClosure).toContainEqual({
      method: 'generateAssessmentItem',
      contractVersion: '3+output-integrity-v6',
    })
  })
})
