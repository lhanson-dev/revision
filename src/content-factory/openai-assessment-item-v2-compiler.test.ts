import { describe, expect, it, vi } from 'vitest'
import { createOpenAIModelAssistedWorkers } from './openai-live-adapter'
import {
  compileAssessmentItemV2Candidate,
  diagnoseAssessmentItemV2Candidate,
} from './openai-assessment-item-v2-compiler'

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
    subquestions: complete.subquestions.map((subquestion) => ({
      id: subquestion.id,
      command: subquestion.command,
      wording: subquestion.wording,
      responseDemands: subquestion.responseDemands,
    })),
  }
}

function simultaneousDemandMismatchOutput() {
  const complete = completeProviderOutput()
  return {
    ...complete,
    subquestions: [
      {
        id: 'q1',
        command: 'State',
        wording: 'State the sales trend shown in the data.',
        maxMark: 2,
        responseDemands: ['calculation'],
        coverageEvidence: [{ requirementId: 'quantitative-skills', evidence: 'sales trend' }],
      },
      {
        id: 'q2',
        command: 'State',
        wording: 'State what the profit data shows.',
        maxMark: 2,
        responseDemands: ['interpretation'],
        coverageEvidence: [{ requirementId: 'quantitative-skills', evidence: 'profit data' }],
      },
    ],
  }
}

function repairedSimultaneousDemandOutput() {
  const candidate = simultaneousDemandMismatchOutput()
  return {
    ...candidate,
    subquestions: [
      {
        ...candidate.subquestions[0],
        command: 'Calculate',
        wording: 'Calculate the sales trend shown in the data.',
      },
      {
        ...candidate.subquestions[1],
        command: 'Interpret',
        wording: 'Interpret what the profit data shows.',
      },
    ],
  }
}

function secondQ7MismatchSignature() {
  const complete = completeProviderOutput()
  return {
    ...complete,
    subquestions: complete.subquestions.map((subquestion) => ({
      ...subquestion,
      requirementIds: ['stale-provider-requirement'],
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
  it('collects only genuinely provider-owned missing structure before repair', () => {
    const diagnostics = diagnoseAssessmentItemV2Candidate(q7OmissionOutput(), targetPolicy)
    expect(diagnostics.map((entry) => entry.code)).toEqual([
      'ASSESSMENT_SUBQUESTION_MAX_MARK_MISSING',
      'ASSESSMENT_SUBQUESTION_COVERAGE_EVIDENCE_MISSING',
    ])
  })

  it('repairs the bounded omission class once, then compiles governed and cross-reference fields', async () => {
    const { workers, fetchImpl } = workersReturning(q7OmissionOutput(), completeProviderOutput())

    const result = await workers.generateAssessmentItem(assessmentInput())

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect(result.provenance.retryCount).toBe(1)
    expect(result.provenance.contractVersion).toBe('6')
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

  it('collects the Pilot 20 simultaneous demand defects in one actionable diagnostic set', () => {
    const diagnostics = diagnoseAssessmentItemV2Candidate(simultaneousDemandMismatchOutput(), targetPolicy)
    const demandDiagnostics = diagnostics.filter((entry) => entry.code === 'ASSESSMENT_RESPONSE_DEMAND_UNSUPPORTED')

    expect(demandDiagnostics).toHaveLength(2)
    expect(demandDiagnostics.map((entry) => entry.path)).toEqual([
      'subquestions[0].responseDemands',
      'subquestions[1].responseDemands',
    ])
    expect(demandDiagnostics[0]?.message).toContain('calculation')
    expect(demandDiagnostics[1]?.message).toContain('interpretation')
  })

  it('repairs simultaneous Pilot 20 demand defects in the single permitted repair call', async () => {
    const { workers, fetchImpl } = workersReturning(
      simultaneousDemandMismatchOutput(),
      repairedSimultaneousDemandOutput(),
    )

    const result = await workers.generateAssessmentItem(assessmentInput())

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect(result.provenance.retryCount).toBe(1)
    expect(result.provenance.contractVersion).toBe('6')
    const output = result.output as ReturnType<typeof compileAssessmentItemV2Candidate>
    expect(output.subquestions.map((subquestion) => subquestion.command)).toEqual([
      'Calculate',
      'Interpret',
    ])
  })

  it('eliminates the second-Q7 mismatch class by deriving subquestion requirementIds from coverageEvidence', async () => {
    const { workers, fetchImpl } = workersReturning(secondQ7MismatchSignature())

    const result = await workers.generateAssessmentItem(assessmentInput())

    expect(result.status).toBe('success')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    if (result.status !== 'success') throw new Error(result.error)
    const output = result.output as ReturnType<typeof compileAssessmentItemV2Candidate>
    expect(output.subquestions[0]?.requirementIds).toEqual(['quantitative-skills'])
    expect(output.subquestions[0]?.coverageEvidence).toEqual([
      { requirementId: 'quantitative-skills', evidence: 'percentage change' },
    ])
    expect(JSON.stringify(output)).not.toContain('stale-provider-requirement')
  })

  it('uses no repair call for a valid first-pass candidate', async () => {
    const { workers, fetchImpl } = workersReturning(completeProviderOutput())

    const result = await workers.generateAssessmentItem(assessmentInput())

    expect(result.status).toBe('success')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('fails closed after the one permitted repair if required provider-owned structure is still absent', async () => {
    const { workers, fetchImpl } = workersReturning(q7OmissionOutput(), q7OmissionOutput())

    const result = await workers.generateAssessmentItem(assessmentInput())

    expect(result.status).toBe('failure')
    if (result.status !== 'failure') throw new Error('Expected provider contract failure')
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect(result.error).toContain('assessment_item_v2_after_complete_diagnostic_repair')
    expect(result.error).toContain('ASSESSMENT_SUBQUESTION_MAX_MARK_MISSING')
    expect(result.error).toContain('ASSESSMENT_SUBQUESTION_COVERAGE_EVIDENCE_MISSING')
    expect(result.error).not.toContain('ASSESSMENT_SUBQUESTION_REQUIREMENTS_MISSING')
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
    expect(diagnostics).toHaveLength(4)
    expect(diagnostics.filter((entry) => entry.path.startsWith('subquestions[0]'))).toHaveLength(2)
    expect(diagnostics.filter((entry) => entry.path.startsWith('subquestions[1]'))).toHaveLength(2)
  })

  it('keeps invalid coverage mappings fail closed after deriving the duplicated requirementIds representation', () => {
    const duplicate = completeProviderOutput()
    duplicate.subquestions[0].coverageEvidence.push({
      requirementId: 'quantitative-skills',
      evidence: 'show your working',
    })
    expect(() => compileAssessmentItemV2Candidate(duplicate, assessmentInput(), targetPolicy)).toThrow(/repeat requirement IDs/i)

    const unknown = completeProviderOutput()
    unknown.subquestions[0].coverageEvidence[0].requirementId = 'unknown-requirement'
    expect(() => compileAssessmentItemV2Candidate(unknown, assessmentInput(), targetPolicy)).toThrow(/governed requirement IDs/i)

    const badExcerpt = completeProviderOutput()
    badExcerpt.subquestions[0].coverageEvidence[0].evidence = 'not present in the learner-facing wording'
    expect(() => compileAssessmentItemV2Candidate(badExcerpt, assessmentInput(), targetPolicy)).toThrow(/exact question excerpt/i)
  })
})
