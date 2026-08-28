import { describe, expect, it, vi } from 'vitest'
import { createOpenAIModelAssistedWorkers } from './openai-live-adapter'
import type { IntakeToKnowledgeModelWorkers } from './intake-to-knowledge-model'

const route = {
  model: 'test-model',
  inputUsdPerMillion: 2,
  cachedInputUsdPerMillion: 0.2,
  outputUsdPerMillion: 12,
  maxOutputTokens: 1_000,
}

const input: Parameters<IntakeToKnowledgeModelWorkers['compileKnowledgeModel']>[0] = {
  jobId: 'cf-science',
  identity: {
    courseIdentity: {
      subject: 'Science',
      qualification: 'Example GCSE Science',
      awardingBody: 'Example Board',
      specificationId: 'science-101',
    },
    cohortValidity: { status: 'current', notes: [] },
    components: [{ id: 'paper-1', name: 'Paper 1', compulsory: true, marks: 100, durationMinutes: 105 }],
    unresolvedChoices: [],
  },
  sourceLicenceRegister: {
    schemaVersion: 2,
    jobId: 'cf-science',
    fingerprint: 'source-set-v1',
    checkedAt: '2026-08-28T13:20:00+01:00',
    sources: [{
      id: 'open-science',
      issuer: 'Example Open Curriculum',
      urlOrReference: 'https://curriculum.example/science',
      sourceType: 'subject_content',
      educationalRole: ['curriculum truth'],
      versionOrDate: '2026',
      useClass: 'OPEN',
      permissionBasis: 'Open licence fixture.',
      aiInputPermitted: true,
      derivedCommercialUsePermitted: true,
      attributionRequirements: [],
      restrictions: [],
      checkedAt: '2026-08-28T13:20:00+01:00',
      checkerMethod: 'approved fixture rule',
      sourceFingerprint: 'open-science-v1',
      revalidationConditions: [],
    }],
  },
  boardAlignment: {
    schemaVersion: 1,
    jobId: 'cf-science',
    fingerprint: 'board-v1',
    courseIdentity: {
      subject: 'Science',
      qualification: 'Example GCSE Science',
      awardingBody: 'Example Board',
      specificationId: 'science-101',
    },
    cohortValidity: { status: 'current', notes: [] },
    components: [{ id: 'paper-1', name: 'Paper 1', compulsory: true, marks: 100, durationMinutes: 105 }],
    assessmentObjectives: [{ id: 'ao1', name: 'Knowledge', weightingPercent: 40, sourceRefs: ['open-science'] }],
    assessmentRequirements: [{ id: 'practical-skills', summary: 'Apply practical scientific reasoning.', componentScope: ['paper-1'], sourceRefs: ['open-science'] }],
    sourceRefs: ['open-science'],
    verificationStatus: 'verified',
  },
  coverageMap: {
    schemaVersion: 1,
    jobId: 'cf-science',
    sourceSetFingerprint: 'source-set-v1',
    requirements: [{
      requirementId: 'cell-structure',
      officialReference: 'open-science:cell-structure',
      requirementSummary: 'Understand the function of basic cell structures.',
      skillsOrKnowledge: ['cell structure', 'function'],
      componentScope: ['paper-1'],
      revisionArea: 'Cells',
      learnRequired: true,
      practiceRequired: true,
      examPrepRequired: true,
      coverageStatus: 'planned',
      contentRefs: [],
      sourceRefs: ['open-science'],
    }],
  },
  requirements: [{
    requirementId: 'cell-structure',
    summary: 'Understand the function of basic cell structures.',
    skillsOrKnowledge: ['cell structure', 'function'],
    componentScope: ['paper-1'],
    revisionArea: 'Cells',
    learnRequired: true,
    practiceRequired: true,
    examPrepRequired: true,
    sourceRefs: ['open-science'],
  }],
}

function responseBody(output: unknown) {
  return {
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(output) }] }],
    usage: { input_tokens: 100, output_tokens: 100 },
  }
}

function validNode() {
  return {
    id: 'cell-structure',
    kind: 'concept' as const,
    summary: 'Cell structures have specialised functions that support cell activity.',
    prerequisiteIds: [],
    relatedIds: [],
    formulas: [],
    misconceptions: ['All cells contain exactly the same structures.'],
    applicationContexts: ['Interpreting a labelled cell diagram'],
    depth: 'core' as const,
    sourceRefs: ['open-science'],
    boardAlignmentRefs: ['paper-1', 'ao1'],
    evidenceTypes: ['explanation', 'diagram interpretation'],
  }
}

function workersReturning(buildOutput: (requiredFingerprint: string) => unknown) {
  const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
    const request = JSON.parse(String(init?.body)) as { input: string }
    const payload = JSON.parse(request.input) as { requiredFingerprint: string }
    return new Response(JSON.stringify(responseBody(buildOutput(payload.requiredFingerprint))), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }) as typeof fetch

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

describe('Q2 Course Knowledge Model provider contract', () => {
  it('accepts valid first-pass science-shaped output with exactly one provider call', async () => {
    const { workers, fetchImpl } = workersReturning((requiredFingerprint) => ({
      schemaVersion: 1,
      jobId: input.jobId,
      fingerprint: requiredFingerprint,
      nodes: [validNode()],
    }))

    const result = await workers.compileKnowledgeModel(input)

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    expect((result.output as { nodes: Array<{ id: string }> }).nodes.map((node) => node.id)).toEqual(['cell-structure'])
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('fails closed on a structurally malformed knowledge node without retrying the provider', async () => {
    const { workers, fetchImpl } = workersReturning((requiredFingerprint) => ({
      schemaVersion: 1,
      jobId: input.jobId,
      fingerprint: requiredFingerprint,
      nodes: [{ ...validNode(), summary: undefined }],
    }))

    const result = await workers.compileKnowledgeModel(input)

    expect(result.status).toBe('failure')
    if (result.status === 'success') throw new Error('Expected malformed provider output to fail')
    expect(result.error).toContain('provider_contract_failure')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('fails closed when the provider duplicates a knowledge-node identifier', async () => {
    const { workers, fetchImpl } = workersReturning((requiredFingerprint) => ({
      schemaVersion: 1,
      jobId: input.jobId,
      fingerprint: requiredFingerprint,
      nodes: [validNode(), { ...validNode(), summary: 'Duplicate representation of the same governed requirement.' }],
    }))

    const result = await workers.compileKnowledgeModel(input)

    expect(result.status).toBe('failure')
    if (result.status === 'success') throw new Error('Expected duplicate node ID to fail')
    expect(result.error).toContain('Duplicate knowledge node id: cell-structure')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('fails closed when the provider invents a source or Board Alignment reference', async () => {
    const { workers, fetchImpl } = workersReturning((requiredFingerprint) => ({
      schemaVersion: 1,
      jobId: input.jobId,
      fingerprint: requiredFingerprint,
      nodes: [{
        ...validNode(),
        sourceRefs: ['invented-source'],
        boardAlignmentRefs: ['invented-alignment'],
      }],
    }))

    const result = await workers.compileKnowledgeModel(input)

    expect(result.status).toBe('failure')
    if (result.status === 'success') throw new Error('Expected invented references to fail')
    expect(result.error).toContain('invented-source')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('fails closed when the provider returns the wrong job binding', async () => {
    const { workers, fetchImpl } = workersReturning((requiredFingerprint) => ({
      schemaVersion: 1,
      jobId: 'cf-other-course',
      fingerprint: requiredFingerprint,
      nodes: [validNode()],
    }))

    const result = await workers.compileKnowledgeModel(input)

    expect(result.status).toBe('failure')
    if (result.status === 'success') throw new Error('Expected wrong job binding to fail')
    expect(result.error).toContain('job ID does not match compiler input')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})
