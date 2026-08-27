import { describe, expect, it, vi } from 'vitest'
import type { WorkerExecution } from './intake-to-knowledge-model'
import {
  createDurableBudgetFetch,
  DurableCourseSpendLedger,
  DurableIssueCheckpointBlobStore,
  DurableLivePilotArtifactStore,
  DurableWorkerExecutionCache,
  type LivePilotIssueCommentClient,
} from './live-pilot-durable-store'

function memoryCommentClient() {
  let id = 0
  const comments = new Map<number, Array<{ id: number; body: string | null }>>()
  const client: LivePilotIssueCommentClient = {
    async listComments(issueNumber) {
      return [...(comments.get(issueNumber) ?? [])]
    },
    async createComment(issueNumber, body) {
      id += 1
      comments.set(issueNumber, [...(comments.get(issueNumber) ?? []), { id, body }])
      return { id }
    },
  }
  return { client, comments }
}

function success(id: string, output: unknown, usageCost = 0.01): WorkerExecution<unknown> {
  return {
    status: 'success',
    output,
    provenance: {
      id,
      contextId: `context-${id}`,
      contractVersion: '1',
      provider: 'openai',
      model: 'test-model',
      retryCount: 0,
      usageCost,
    },
  }
}

function infrastructureFailure(id: string): WorkerExecution<unknown> {
  return {
    status: 'infrastructure_failure',
    error: 'temporary upstream failure',
    provenance: {
      id,
      contextId: `context-${id}`,
      contractVersion: '1',
      provider: 'openai',
      model: 'test-model',
      retryCount: 0,
    },
  }
}

function terminalFailure(id: string): WorkerExecution<unknown> {
  return {
    status: 'failure',
    error: 'provider_contract_failure: invalid structured output',
    provenance: {
      id,
      contextId: `context-${id}`,
      contractVersion: '1',
      provider: 'openai',
      model: 'test-model',
      retryCount: 0,
      usageCost: 0.01,
    },
  }
}

describe('durable Content Factory live-pilot checkpoints', () => {
  it('survives a forced mid-course failure and reuses completed work after a fresh process', async () => {
    const { client } = memoryCommentClient()
    const issueNumber = 192
    const headSha = '1'.repeat(40)
    const firstBlobs = await DurableIssueCheckpointBlobStore.load(issueNumber, client)
    const firstCache = new DurableWorkerExecutionCache(firstBlobs, headSha)
    const calls = new Map<string, number>()

    const executeUnit = async (cache: DurableWorkerExecutionCache, unitId: string) => cache.run(
      'generatePracticeCollateral',
      { jobId: 'course-1', workUnit: { id: unitId }, contractVersion: '2' },
      async () => {
        calls.set(unitId, (calls.get(unitId) ?? 0) + 1)
        if (unitId === 'unit-3' && calls.get(unitId) === 1) return infrastructureFailure(`${unitId}-infra-1`)
        return success(`${unitId}-success`, { id: `${unitId}-output`, content: `content-${unitId}` })
      },
    )

    expect((await executeUnit(firstCache, 'unit-1')).status).toBe('success')
    expect((await executeUnit(firstCache, 'unit-2')).status).toBe('success')
    expect((await executeUnit(firstCache, 'unit-3')).status).toBe('infrastructure_failure')

    const restartedBlobs = await DurableIssueCheckpointBlobStore.load(issueNumber, client)
    const restartedCache = new DurableWorkerExecutionCache(restartedBlobs, headSha)
    const first = await executeUnit(restartedCache, 'unit-1')
    const second = await executeUnit(restartedCache, 'unit-2')
    const third = await executeUnit(restartedCache, 'unit-3')

    expect(first.status).toBe('success')
    expect(second.status).toBe('success')
    expect(third.status).toBe('success')
    if (first.status !== 'success' || second.status !== 'success' || third.status !== 'success') throw new Error('Expected successful resumed executions')
    expect(first.output).toEqual({ id: 'unit-1-output', content: 'content-unit-1' })
    expect(second.output).toEqual({ id: 'unit-2-output', content: 'content-unit-2' })
    expect(third.output).toEqual({ id: 'unit-3-output', content: 'content-unit-3' })
    expect(calls.get('unit-1')).toBe(1)
    expect(calls.get('unit-2')).toBe(1)
    expect(calls.get('unit-3')).toBe(2)
    expect(restartedCache.reusedExecutionCount).toBe(2)
    expect(restartedCache.executedWorkerCount).toBe(1)
  })

  it('does not repurchase an unchanged terminal provider-contract failure', async () => {
    const { client } = memoryCommentClient()
    const issueNumber = 193
    const headSha = '2'.repeat(40)
    const blobs = await DurableIssueCheckpointBlobStore.load(issueNumber, client)
    const firstCache = new DurableWorkerExecutionCache(blobs, headSha)
    const execute = vi.fn(async () => terminalFailure('terminal-1'))
    expect((await firstCache.run('generateLearningCollateral', { workUnit: 'unit-x' }, execute)).status).toBe('failure')

    const restarted = new DurableWorkerExecutionCache(await DurableIssueCheckpointBlobStore.load(issueNumber, client), headSha)
    const shouldNotRun = vi.fn(async () => success('unexpected', { value: true }))
    const result = await restarted.run('generateLearningCollateral', { workUnit: 'unit-x' }, shouldNotRun)
    expect(result.status).toBe('failure')
    expect(shouldNotRun).not.toHaveBeenCalled()
    expect(restarted.reusedExecutionCount).toBe(1)
  })

  it('round-trips large artifacts and reuses the same deterministic artifact reference after restart', async () => {
    const { client, comments } = memoryCommentClient()
    const issueNumber = 194
    const blobs = await DurableIssueCheckpointBlobStore.load(issueNumber, client)
    const store = await DurableLivePilotArtifactStore.load(blobs)
    const value = { text: 'x'.repeat(120_000), nested: { stable: true } }
    const first = await store.writeJson({
      jobId: 'course-large-artifact',
      kind: 'learning_collateral',
      fingerprint: 'f'.repeat(64),
      value,
    })
    expect((comments.get(issueNumber) ?? []).length).toBeGreaterThan(1)

    const restartedStore = await DurableLivePilotArtifactStore.load(await DurableIssueCheckpointBlobStore.load(issueNumber, client))
    expect(await restartedStore.readJson(first.ref)).toEqual(value)
    const before = (comments.get(issueNumber) ?? []).length
    const second = await restartedStore.writeJson({
      jobId: 'course-large-artifact',
      kind: 'learning_collateral',
      fingerprint: 'f'.repeat(64),
      value,
    })
    expect(second.ref).toBe(first.ref)
    expect((comments.get(issueNumber) ?? []).length).toBe(before)
  })

  it('carries the course spend ceiling across workflow attempts and rejects a changed-head resume', async () => {
    const { client } = memoryCommentClient()
    const issueNumber = 195
    const headSha = '3'.repeat(40)
    const generation = {
      model: 'test-model',
      inputUsdPerMillion: 1,
      cachedInputUsdPerMillion: 0.1,
      outputUsdPerMillion: 10,
      maxOutputTokens: 50,
    }
    const review = { ...generation, model: 'review-model' }
    const firstBlobs = await DurableIssueCheckpointBlobStore.load(issueNumber, client)
    const firstLedger = await DurableCourseSpendLedger.loadOrCreate({
      blobs: firstBlobs,
      jobId: 'course-budget',
      contentHeadSha: headSha,
      maxSpendUsd: 0.0011,
    })
    expect(await firstLedger.startAttempt('2026-08-27T12:00:00Z')).toBe(1)

    const providerFetch = vi.fn(async () => new Response(JSON.stringify({
      status: 'completed',
      usage: { input_tokens: 100, output_tokens: 50 },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch
    const firstFetch = createDurableBudgetFetch({ ledger: firstLedger, generation, independentReview: review, fetchImpl: providerFetch })
    await firstFetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      body: JSON.stringify({ model: 'test-model', text: { format: { name: 'worker-one' } }, input: 'small' }),
    })
    expect(firstLedger.snapshot().conservativeConsumedUsd).toBeCloseTo(0.0006, 8)

    const restartedBlobs = await DurableIssueCheckpointBlobStore.load(issueNumber, client)
    const restartedLedger = await DurableCourseSpendLedger.loadOrCreate({
      blobs: restartedBlobs,
      jobId: 'course-budget',
      contentHeadSha: headSha,
      maxSpendUsd: 0.0011,
    })
    expect(await restartedLedger.startAttempt('2026-08-27T12:05:00Z')).toBe(2)
    const restartedFetch = createDurableBudgetFetch({ ledger: restartedLedger, generation, independentReview: review, fetchImpl: providerFetch })
    await expect(restartedFetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      body: JSON.stringify({ model: 'test-model', text: { format: { name: 'worker-two' } }, input: 'small' }),
    })).rejects.toThrow(/spend_ceiling_reached/)
    expect(providerFetch).toHaveBeenCalledTimes(1)

    await expect(DurableCourseSpendLedger.loadOrCreate({
      blobs: restartedBlobs,
      jobId: 'course-budget',
      contentHeadSha: '4'.repeat(40),
      maxSpendUsd: 0.0011,
    })).rejects.toThrow(/head_mismatch/)
  })
})
