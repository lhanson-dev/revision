import { describe, expect, it, vi } from 'vitest'
import { createOpenAIModelAssistedWorkers } from './openai-live-adapter'
import { diagnoseAssessmentItemV2Candidate } from './openai-assessment-item-v2-compiler'

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

function assessmentInput() {
  return {
    jobId: 'cf-q7-regression',
    courseIdentity: {
      subject: 'Synthetic quantitative subject',
      qualification: 'Synthetic qualification',
      awardingBody: 'Synthetic board',
      specificationId: 'synthetic-1',
    },
    assessmentBlueprint: {
      schemaVersion: 1 as const,
      jobId: 'cf-q7-regression',
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

function completeProviderOutput() {
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
      dataPoints: [
        { label: 'Original sales', value: '100', unit: '' },
        { label: 'New sales', value: '120', unit: '£000' },
      ],
    },
  }
}

function q7OmissionOutput() {
  const complete = completeProviderOutput()
  return {
    ...complete,
    subquestions: complete.subquestions.map(({ maxMark: _maxMark, requirementIds: _requirementIds, coverageEvidence: _coverageEvidence, ...subquestion }) => subquestion),
  }
}

function responseBody(output: unknown) {
  return {
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(output) }] }],
    usage: { input_tokens: 100, output_tokens: 100 },
  }
}

function workersReturning(...outputs: unknown[]) {
  let index = 0
  const fetchImpl = vi.fn(async () => {
    const output = outputs[Math.min(index, outputs.length - 1)]
    index += 1
    return new Response(JSON.stringify(responseBody(output)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }) as typeof fetch

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

describe('Reliability v2 Q7 Assessment Item provider-contract repair', () => {
  it('collects the complete Q7 missing-structure defect set before repair', () => {
    const diagnostics = diagnoseAssessmentItemV2Candidate(q7OmissionOutput(), targetPolicy)
    expect(diagnostics.map((entry) => entry.code)).toEqual([
      'ASSESSMENT_SUBQUESTION_MAX_MARK_MISSING',
      'ASSESSMENT_SUBQUESTION_REQUIREMENTS_MISSING',
      'ASSESSMENT_SUBQUESTION_COVERAGE_EVIDENCE_MISSING',
    ])
  })

  it('repairs the Q7 omission class once, then compiles governed top-level fields and validates the complete item', async () => {
    const { workers, fetchImpl } = workersReturning(q7OmissionOutput(), completeProviderOutput())

    const result = await workers.generateAssessmentItem(assessmentInput())

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect(result.provenance.retryCount).toBe(1)
    expect(result.provenance.contractVersion).toBe('4')
    expect(result.output).toMatchObject({
      componentId: 'paper-1',
      questionFamilyId: 'quantitative-family',
      requirementIds: ['quantitative-skills'],
      maxMark: 4,
      format: 'calculation',
      subquestions: [{
        maxMark: 4,
        requirementIds: ['quantitative-skills'],
        coverageEvidence: [{ requirementId: 'quantitative-skills', evidence: 'percentage change' }],
      }],
      context: {
        dataPoints: [
          { label: 'Original sales', value: '100' },
          { label: 'New sales', value: '120', unit: '£000' },
        ],
      },
    })
  })

  it('uses no repair call for a valid first-pass candidate', async () => {
    const { workers, fetchImpl } = workersReturning(completeProviderOutput())

    const result = await workers.generateAssessmentItem(assessmentInput())

    expect(result.status).toBe('success')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('fails closed after the one permitted repair if required subquestion structure is still absent', async () => {
    const { workers, fetchImpl } = workersReturning(q7OmissionOutput(), q7OmissionOutput())

    const result = await workers.generateAssessmentItem(assessmentInput())

    expect(result.status).toBe('failure')
    if (result.status !== 'failure') throw new Error('Expected provider contract failure')
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect(result.error).toContain('assessment_item_v2_after_complete_diagnostic_repair')
    expect(result.error).toContain('ASSESSMENT_SUBQUESTION_MAX_MARK_MISSING')
    expect(result.error).toContain('ASSESSMENT_SUBQUESTION_REQUIREMENTS_MISSING')
    expect(result.error).toContain('ASSESSMENT_SUBQUESTION_COVERAGE_EVIDENCE_MISSING')
  })

  it('reports simultaneous omissions across every parseable subquestion rather than stopping at the first defect', () => {
    const first = q7OmissionOutput()
    const candidate = {
      ...first,
      subquestions: [
        ...first.subquestions,
        { ...first.subquestions[0], id: 'q2', wording: 'Calculate the percentage change in profit and show your working.' },
      ],
    }

    const diagnostics = diagnoseAssessmentItemV2Candidate(candidate, targetPolicy)
    expect(diagnostics).toHaveLength(6)
    expect(diagnostics.filter((entry) => entry.path.startsWith('subquestions[0]'))).toHaveLength(3)
    expect(diagnostics.filter((entry) => entry.path.startsWith('subquestions[1]'))).toHaveLength(3)
  })
})
