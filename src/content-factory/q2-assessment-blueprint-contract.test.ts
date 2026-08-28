import { describe, expect, it, vi } from 'vitest'
import { createOpenAIModelAssistedWorkers } from './openai-live-adapter'
import { fingerprintValue } from './intake-to-knowledge-model'
import type { AssessmentAndMarkingWorkers } from './assessment-and-marking'

const route = {
  model: 'test-model',
  inputUsdPerMillion: 2,
  cachedInputUsdPerMillion: 0.2,
  outputUsdPerMillion: 12,
  maxOutputTokens: 1_000,
}

const input: Parameters<AssessmentAndMarkingWorkers['compileAssessmentBlueprint']>[0] = {
  jobId: 'cf-language',
  courseIdentity: {
    subject: 'Example Language',
    qualification: 'Example GCSE Language',
    awardingBody: 'Example Board',
    specificationId: 'language-101',
  },
  components: [
    { id: 'reading', name: 'Reading', compulsory: true, marks: 80, durationMinutes: 105, weightingPercent: 50 },
    { id: 'writing', name: 'Writing', compulsory: true, marks: 80, durationMinutes: 105, weightingPercent: 50 },
  ],
  assessmentObjectives: [
    { id: 'ao1', name: 'Understand and interpret', weightingPercent: 50 },
    { id: 'ao2', name: 'Communicate effectively', weightingPercent: 50 },
  ],
  assessmentRequirements: [
    { id: 'reading-demand', summary: 'Interpret supplied text.', componentScope: ['reading'] },
    { id: 'writing-demand', summary: 'Produce an extended response.', componentScope: ['writing'] },
  ],
  examPrepRequirements: [
    { requirementId: 'reading-demand', requirementSummary: 'Interpret supplied text.', skillsOrKnowledge: ['interpretation'], componentScope: ['reading'], revisionArea: 'Reading' },
    { requirementId: 'writing-demand', requirementSummary: 'Produce an extended response.', skillsOrKnowledge: ['composition'], componentScope: ['writing'], revisionArea: 'Writing' },
  ],
  knowledgeNodes: [
    { id: 'interpretation', kind: 'skill', summary: 'Interpret meaning and evidence.', formulas: [], misconceptions: [], applicationContexts: [], depth: 'core', evidenceTypes: ['textual evidence'] },
    { id: 'composition', kind: 'skill', summary: 'Shape a clear written response.', formulas: [], misconceptions: [], applicationContexts: [], depth: 'core', evidenceTypes: ['written response'] },
  ],
}

function responseBody(output: unknown) {
  return {
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(output) }] }],
    usage: { input_tokens: 100, output_tokens: 100 },
  }
}

async function validBlueprint() {
  const fingerprint = await fingerprintValue({
    jobId: input.jobId,
    components: input.components,
    assessmentObjectives: input.assessmentObjectives,
    assessmentRequirements: input.assessmentRequirements,
  })
  return {
    schemaVersion: 1,
    jobId: input.jobId,
    fingerprint,
    boardAlignmentFingerprint: 'board-language-v1',
    assessmentObjectives: [
      { id: 'ao1', weightingPercent: 50 },
      { id: 'ao2', weightingPercent: 50 },
    ],
    components: [
      { componentId: 'reading', questionFamilyIds: ['reading-response'], markTotal: 80, timingMinutes: 105, constraints: ['Use original Revision-owned stimulus only.'] },
      { componentId: 'writing', questionFamilyIds: ['extended-writing'], markTotal: 80, timingMinutes: 105, constraints: ['Do not imitate protected source wording.'] },
    ],
    quantitativeRequirements: [],
    synopticRequirements: [],
    commandDemands: [
      { command: 'explain', cognitiveDemand: 'interpretation', componentScope: ['reading'] },
      { command: 'write', cognitiveDemand: 'composition', componentScope: ['writing'] },
    ],
    evidenceExpectations: ['Responses should use evidence appropriate to the task.'],
  }
}

function workersReturning(buildOutput: (valid: Awaited<ReturnType<typeof validBlueprint>>) => unknown) {
  const fetchImpl = vi.fn(async () => {
    const valid = await validBlueprint()
    return new Response(JSON.stringify(responseBody(buildOutput(valid))), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }) as typeof fetch
  return {
    workers: createOpenAIModelAssistedWorkers({ apiKey: 'test-secret', generation: route, independentReview: route, fetchImpl, maxRetries: 2 }),
    fetchImpl,
  }
}

describe('Q2 Assessment Blueprint provider contract', () => {
  it('accepts valid first-pass language-shaped output with exactly one provider call', async () => {
    const { workers, fetchImpl } = workersReturning((valid) => valid)
    const result = await workers.compileAssessmentBlueprint(input)
    expect(result.status).toBe('success')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('fails closed on malformed output without provider retry', async () => {
    const { workers, fetchImpl } = workersReturning((valid) => ({ ...valid, components: [{ ...valid.components[0], questionFamilyIds: [] }, valid.components[1]] }))
    const result = await workers.compileAssessmentBlueprint(input)
    expect(result.status).toBe('failure')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('fails closed on inconsistent component marks or timing', async () => {
    const { workers, fetchImpl } = workersReturning((valid) => ({ ...valid, components: [{ ...valid.components[0], markTotal: 79, timingMinutes: 104 }, valid.components[1]] }))
    const result = await workers.compileAssessmentBlueprint(input)
    expect(result.status).toBe('failure')
    if (result.status === 'success') throw new Error('Expected governed component mismatch to fail')
    expect(result.error).toContain('mark total')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('fails closed on inconsistent assessment-objective weighting', async () => {
    const { workers, fetchImpl } = workersReturning((valid) => ({ ...valid, assessmentObjectives: [{ id: 'ao1', weightingPercent: 60 }, { id: 'ao2', weightingPercent: 40 }] }))
    const result = await workers.compileAssessmentBlueprint(input)
    expect(result.status).toBe('failure')
    if (result.status === 'success') throw new Error('Expected AO weighting mismatch to fail')
    expect(result.error).toContain('weighting')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('fails closed on unknown or duplicate command-demand component references', async () => {
    const { workers, fetchImpl } = workersReturning((valid) => ({ ...valid, commandDemands: [{ command: 'explain', cognitiveDemand: 'interpretation', componentScope: ['invented-component'] }] }))
    const result = await workers.compileAssessmentBlueprint(input)
    expect(result.status).toBe('failure')
    if (result.status === 'success') throw new Error('Expected unknown command-demand reference to fail')
    expect(result.error).toContain('invented-component')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('fails closed on wrong job or deterministic fingerprint binding', async () => {
    const { workers, fetchImpl } = workersReturning((valid) => ({ ...valid, jobId: 'cf-other', fingerprint: 'wrong-fingerprint' }))
    const result = await workers.compileAssessmentBlueprint(input)
    expect(result.status).toBe('failure')
    if (result.status === 'success') throw new Error('Expected deterministic binding mismatch to fail')
    expect(result.error).toContain('job ID')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})
