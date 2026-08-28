import { describe, expect, it, vi } from 'vitest'
import { createOpenAIModelAssistedWorkers } from './openai-live-adapter'
import type { AssessmentAndMarkingWorkers } from './assessment-and-marking'

const route = {
  model: 'test-model',
  inputUsdPerMillion: 2,
  cachedInputUsdPerMillion: 0.2,
  outputUsdPerMillion: 12,
  maxOutputTokens: 1_000,
}

const input: Parameters<AssessmentAndMarkingWorkers['generateQuestionFamilies']>[0] = {
  jobId: 'cf-history',
  courseIdentity: {
    subject: 'History',
    qualification: 'Example GCSE History',
    awardingBody: 'Example Board',
    specificationId: 'history-201',
  },
  assessmentBlueprint: {
    schemaVersion: 1,
    jobId: 'cf-history',
    fingerprint: 'assessment-blueprint-v1',
    boardAlignmentFingerprint: 'board-v1',
    assessmentObjectives: [
      { id: 'ao1', weightingPercent: 40 },
      { id: 'ao2', weightingPercent: 60 },
    ],
    components: [{
      componentId: 'paper-1',
      questionFamilyIds: ['source-analysis', 'extended-judgement'],
      markTotal: 80,
      timingMinutes: 105,
      constraints: [],
    }],
    quantitativeRequirements: [],
    synopticRequirements: ['Connect evidence across the studied period.'],
    commandDemands: [{ command: 'evaluate', cognitiveDemand: 'weigh evidence and reach a supported judgement', componentScope: ['paper-1'] }],
    evidenceExpectations: ['Use relevant historical evidence to support reasoning.'],
  },
  requestedFamilyIds: ['source-analysis', 'extended-judgement'],
  knowledgeNodes: [{
    id: 'industrial-change',
    kind: 'concept',
    summary: 'Industrial change altered work, settlement and living conditions.',
    formulas: [],
    misconceptions: ['Change was uniform across all regions and groups.'],
    applicationContexts: ['Comparing contemporary accounts'],
    depth: 'core',
    evidenceTypes: ['source comparison', 'causal explanation'],
  }],
  examPrepRequirements: [{
    requirementId: 'historical-evidence',
    requirementSummary: 'Use evidence to explain and evaluate historical interpretations.',
    skillsOrKnowledge: ['source analysis', 'supported judgement'],
    componentScope: ['paper-1'],
    revisionArea: 'Historical evidence',
  }],
}

function responseBody(output: unknown) {
  return {
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(output) }] }],
    usage: { input_tokens: 100, output_tokens: 100 },
  }
}

function sourceAnalysisFamily() {
  return {
    schemaVersion: 1 as const,
    id: 'source-analysis',
    title: 'Analyse a historical source',
    assessmentObjectiveIds: ['ao1', 'ao2'],
    skillProfile: ['analyse provenance', 'use contextual knowledge'],
    componentScope: ['paper-1'],
    markRange: { min: 4, max: 12 },
    responseShape: 'A concise source analysis supported by contextual evidence.',
    contextRequirements: ['A Revision-owned historical source extract or structured source description.'],
    applicationRequirements: [],
    analysisRequirements: ['Explain what the source suggests and why provenance matters.'],
    evaluationRequirements: [],
    commonFailureModes: ['Paraphrasing without analysis.'],
    markingPackTemplateVersion: '1',
    calibrationStatus: 'not_calibrated' as const,
  }
}

function extendedJudgementFamily() {
  return {
    schemaVersion: 1 as const,
    id: 'extended-judgement',
    title: 'Reach a supported historical judgement',
    assessmentObjectiveIds: ['ao1', 'ao2'],
    skillProfile: ['select evidence', 'weigh factors', 'reach a judgement'],
    componentScope: ['paper-1'],
    markRange: { min: 12, max: 20 },
    responseShape: 'A structured argument with a supported overall judgement.',
    contextRequirements: [],
    applicationRequirements: [],
    analysisRequirements: ['Explain relationships between factors and evidence.'],
    evaluationRequirements: ['Weigh competing explanations before reaching a judgement.'],
    commonFailureModes: ['Listing factors without weighing them.'],
    markingPackTemplateVersion: '1',
    calibrationStatus: 'not_calibrated' as const,
  }
}

function workersReturning(buildFamilies: () => unknown[]) {
  const fetchImpl = vi.fn(async () => new Response(JSON.stringify(responseBody({ questionFamilies: buildFamilies() })), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })) as typeof fetch

  return {
    workers: createOpenAIModelAssistedWorkers({
      apiKey: 'test-secret',
      generation: route,
      independentReview: route,
      fetchImpl,
      maxRetries: 2,
    }),
    fetchImpl,
  }
}

describe('Q2 Question Family provider contract', () => {
  it('accepts valid first-pass humanities-shaped output with exactly one provider call', async () => {
    const { workers, fetchImpl } = workersReturning(() => [sourceAnalysisFamily(), extendedJudgementFamily()])

    const result = await workers.generateQuestionFamilies(input)

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    expect((result.output as Array<{ id: string }>).map((family) => family.id)).toEqual(['source-analysis', 'extended-judgement'])
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('fails closed on structurally malformed family output without provider retry', async () => {
    const { workers, fetchImpl } = workersReturning(() => [{ ...sourceAnalysisFamily(), title: undefined }, extendedJudgementFamily()])

    const result = await workers.generateQuestionFamilies(input)

    expect(result.status).toBe('failure')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('fails closed on missing, duplicate or unexpected family identity', async () => {
    for (const families of [
      [sourceAnalysisFamily()],
      [sourceAnalysisFamily(), sourceAnalysisFamily()],
      [sourceAnalysisFamily(), { ...extendedJudgementFamily(), id: 'invented-family' }],
    ]) {
      const { workers, fetchImpl } = workersReturning(() => families)
      const result = await workers.generateQuestionFamilies(input)
      expect(result.status).toBe('failure')
      expect(fetchImpl).toHaveBeenCalledTimes(1)
    }
  })

  it('fails closed on unknown or out-of-blueprint component scope', async () => {
    const { workers, fetchImpl } = workersReturning(() => [
      { ...sourceAnalysisFamily(), componentScope: ['paper-2'] },
      extendedJudgementFamily(),
    ])

    const result = await workers.generateQuestionFamilies(input)

    expect(result.status).toBe('failure')
    if (result.status === 'success') throw new Error('Expected component scope failure')
    expect(result.error).toContain('component scope')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('fails closed on unknown assessment-objective reference', async () => {
    const { workers, fetchImpl } = workersReturning(() => [
      { ...sourceAnalysisFamily(), assessmentObjectiveIds: ['ao1', 'ao9'] },
      extendedJudgementFamily(),
    ])

    const result = await workers.generateQuestionFamilies(input)

    expect(result.status).toBe('failure')
    if (result.status === 'success') throw new Error('Expected objective failure')
    expect(result.error).toContain('unknown assessment objective ao9')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('fails closed when a Question Family mark range exceeds its governed component total', async () => {
    const { workers, fetchImpl } = workersReturning(() => [
      sourceAnalysisFamily(),
      { ...extendedJudgementFamily(), markRange: { min: 12, max: 81 } },
    ])

    const result = await workers.generateQuestionFamilies(input)

    expect(result.status).toBe('failure')
    if (result.status === 'success') throw new Error('Expected excessive mark-range failure')
    expect(result.error).toContain('mark range exceeds governed component paper-1 total')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})
