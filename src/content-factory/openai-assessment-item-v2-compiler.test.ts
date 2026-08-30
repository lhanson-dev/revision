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
      coverageEvidence: [{ requirementPosition: 1, evidence: 'percentage change' }],
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
    subquestions: complete.subquestions.map((subquestion) => ({
      id: subquestion.id,
      command: subquestion.command,
      wording: subquestion.wording,
      responseDemands: subquestion.responseDemands,
    })),
  }
}

function secondQ7LegacyCrossReferenceOutput() {
  const complete = completeProviderOutput()
  return {
    ...complete,
    subquestions: complete.subquestions.map((subquestion) => ({
      ...subquestion,
      coverageEvidence: [{
        requirementId: 'wrong-provider-authored-pointer',
        evidence: 'percentage change',
      }],
    })),
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
  it('collects the complete first-Q7 missing-structure defect set before repair', () => {
    const diagnostics = diagnoseAssessmentItemV2Candidate(q7OmissionOutput(), targetPolicy)
    expect(diagnostics.map((entry) => entry.code)).toEqual([
      'ASSESSMENT_SUBQUESTION_MAX_MARK_MISSING',
      'ASSESSMENT_SUBQUESTION_REQUIREMENTS_MISSING',
      'ASSESSMENT_SUBQUESTION_COVERAGE_EVIDENCE_MISSING',
    ])
  })

  it('repairs the first-Q7 omission class once, then compiles governed fields and coverage pointers', async () => {
    const { workers, fetchImpl } = workersReturning(q7OmissionOutput(), completeProviderOutput())

    const result = await workers.generateAssessmentItem(assessmentInput())

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect(result.provenance.retryCount).toBe(1)
    expect(result.provenance.contractVersion).toBe('5')
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

  it('uses no repair call when a bounded coverage locator is valid first pass', async () => {
    const { workers, fetchImpl } = workersReturning(completeProviderOutput())

    const result = await workers.generateAssessmentItem(assessmentInput())

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(result.provenance.contractVersion).toBe('5')
    expect(result.output.subquestions[0]?.coverageEvidence).toEqual([
      { requirementId: 'quantitative-skills', evidence: 'percentage change' },
    ])
  })

  it('turns the second-Q7 provider-authored requirementId mismatch into a repairable missing bounded locator', () => {
    const diagnostics = diagnoseAssessmentItemV2Candidate(secondQ7LegacyCrossReferenceOutput(), targetPolicy)
    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: 'ASSESSMENT_SUBQUESTION_COVERAGE_REQUIREMENT_POSITION_MISSING',
        path: 'subquestions[0].coverageEvidence[0].requirementPosition',
      }),
    ])
  })

  it('repairs the second-Q7 legacy cross-reference representation once and resolves the final requirementId deterministically', async () => {
    const { workers, fetchImpl } = workersReturning(secondQ7LegacyCrossReferenceOutput(), completeProviderOutput())

    const result = await workers.generateAssessmentItem(assessmentInput())

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect(result.provenance.retryCount).toBe(1)
    expect(result.provenance.contractVersion).toBe('5')
    expect(result.output.subquestions[0]?.coverageEvidence).toEqual([
      { requirementId: 'quantitative-skills', evidence: 'percentage change' },
    ])
  })

  it('reports duplicate, out-of-range and unevidenced coverage locators in one complete diagnostic set', () => {
    const policy = {
      requirementIds: ['requirement-a', 'requirement-b', 'requirement-c'],
      maxMark: 4,
      format: 'calculation' as const,
    }
    const candidate = completeProviderOutput()
    candidate.subquestions[0] = {
      ...candidate.subquestions[0]!,
      requirementIds: [...policy.requirementIds],
      coverageEvidence: [
        { requirementPosition: 1, evidence: 'percentage change' },
        { requirementPosition: 1, evidence: 'show your working' },
        { requirementPosition: 4, evidence: 'sales' },
      ],
    }

    const codes = diagnoseAssessmentItemV2Candidate(candidate, policy).map((entry) => entry.code)
    expect(codes).toEqual([
      'ASSESSMENT_SUBQUESTION_COVERAGE_REQUIREMENT_POSITION_DUPLICATE',
      'ASSESSMENT_SUBQUESTION_COVERAGE_REQUIREMENT_POSITION_OUT_OF_RANGE',
      'ASSESSMENT_SUBQUESTION_COVERAGE_REQUIREMENT_POSITION_UNEVIDENCED',
      'ASSESSMENT_SUBQUESTION_COVERAGE_REQUIREMENT_POSITION_UNEVIDENCED',
    ])
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
