import { describe, expect, it, vi } from 'vitest'
import q5RecordText from '../../content-factory/reliability-q5-restart-reuse-invalidation.json?raw'
import { createRequestedJob } from './orchestrator'
import type { ContentFactoryJob } from './schema'
import type { WorkerExecution } from './intake-to-knowledge-model'
import {
  cloneDurableWorkerDependencyPolicy,
  currentDurableWorkerDependencyPolicy,
  durableWorkerDependencyClosure,
  durableWorkerMethods,
  withDurableWorkerContractVersion,
  type DurableWorkerDependencyPolicy,
  type DurableWorkerMethod,
} from './durable-worker-dependencies'
import {
  DependencyAwareDurableWorkerExecutionCache,
  loadDependencyAwareCourseSpendLedger,
  replayDurableJobForCurrentHead,
} from './q5-durable-resume'
import {
  DurableIssueCheckpointBlobStore,
  type LivePilotIssueCommentClient,
} from './live-pilot-durable-store'

type Q5Record = {
  schemaVersion: number
  gate: string
  status: string
  q5Pass: boolean
  reviewedAgainstMainSha: string
  providerCallsUsed: boolean
  paidPilotEligible: boolean
  scenarios: Array<{ id: string; decision: string }>
}

const q5Record = JSON.parse(q5RecordText) as Q5Record

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

function success(
  method: DurableWorkerMethod,
  idSuffix: string,
  usageCost = 0.01,
  retryCount = 0,
): WorkerExecution<unknown> {
  return {
    status: 'success',
    output: { method, idSuffix },
    provenance: {
      id: `${method}-${idSuffix}`,
      contextId: `${method}-context-${idSuffix}`,
      contractVersion: currentDurableWorkerDependencyPolicy[method].contractVersion,
      provider: 'controlled-q5-provider',
      model: 'q5-fixture-v1',
      retryCount,
      usageCost,
    },
  }
}

async function executeMatrix(input: {
  cache: DependencyAwareDurableWorkerExecutionCache
  calls: Map<DurableWorkerMethod, number>
  suffix: string
}) {
  const results = new Map<DurableWorkerMethod, WorkerExecution<unknown>>()
  for (const method of durableWorkerMethods) {
    const execution = await input.cache.run(
      method,
      { jobId: 'q5-course', stableInput: method },
      async () => {
        input.calls.set(method, (input.calls.get(method) ?? 0) + 1)
        return success(method, `${input.suffix}-${input.calls.get(method)}`)
      },
    )
    results.set(method, execution)
  }
  return results
}

async function changedHeadScenario(policy: DurableWorkerDependencyPolicy) {
  const { client } = memoryCommentClient()
  const issueNumber = 500
  const calls = new Map<DurableWorkerMethod, number>()
  const firstBlobs = await DurableIssueCheckpointBlobStore.load(issueNumber, client)
  const firstCache = new DependencyAwareDurableWorkerExecutionCache(
    firstBlobs,
    '1'.repeat(40),
    currentDurableWorkerDependencyPolicy,
  )
  await executeMatrix({ cache: firstCache, calls, suffix: 'first' })

  const restartedBlobs = await DurableIssueCheckpointBlobStore.load(issueNumber, client)
  const restartedCache = new DependencyAwareDurableWorkerExecutionCache(
    restartedBlobs,
    '2'.repeat(40),
    policy,
  )
  await executeMatrix({ cache: restartedCache, calls, suffix: 'second' })
  return { calls, restartedCache }
}

function executedOnSecondPass(calls: Map<DurableWorkerMethod, number>) {
  return durableWorkerMethods.filter((method) => calls.get(method) === 2)
}

describe('Q5 dependency-aware durable restart qualification', () => {
  it('locks the Q5 PASS record without itself granting pilot eligibility', () => {
    expect(q5Record.schemaVersion).toBe(1)
    expect(q5Record.gate).toBe('Q5')
    expect(q5Record.status).toBe('complete')
    expect(q5Record.q5Pass).toBe(true)
    expect(q5Record.reviewedAgainstMainSha).toBe('93b6bd9c2bb29d4c2150710eef79becc76525d69')
    expect(q5Record.providerCallsUsed).toBe(false)
    expect(q5Record.paidPilotEligible).toBe(false)
    expect(q5Record.scenarios.every((scenario) => scenario.decision === 'pass')).toBe(true)
  })

  it('covers every durable worker contract with an acyclic semantic dependency closure', () => {
    expect(Object.keys(currentDurableWorkerDependencyPolicy).sort()).toEqual([...durableWorkerMethods].sort())
    for (const method of durableWorkerMethods) {
      const closure = durableWorkerDependencyClosure(method)
      expect(closure.some((entry) => entry.method === method)).toBe(true)
      expect(new Set(closure.map((entry) => entry.method)).size).toBe(closure.length)
    }
  })

  it('reuses all unchanged completed executions after a Git-head-only change', async () => {
    const { calls, restartedCache } = await changedHeadScenario(cloneDurableWorkerDependencyPolicy())
    expect(executedOnSecondPass(calls)).toEqual([])
    expect(restartedCache.reusedExecutionCount).toBe(durableWorkerMethods.length)
    expect(restartedCache.reusedAcrossHeadCount).toBe(durableWorkerMethods.length)
    expect(restartedCache.executedWorkerCount).toBe(0)
  })

  it('invalidates a Practice contract change without invalidating Course Knowledge Model, Learn or assessment generation', async () => {
    const policy = withDurableWorkerContractVersion(
      currentDurableWorkerDependencyPolicy,
      'generatePracticeCollateral',
      'q5-practice-contract-change',
    )
    const { calls } = await changedHeadScenario(policy)
    expect(executedOnSecondPass(calls).sort()).toEqual([
      'generatePracticeCollateral',
      'independentReview',
      'remediate',
    ].sort())
    expect(calls.get('compileKnowledgeModel')).toBe(1)
    expect(calls.get('generateLearningCollateral')).toBe(1)
    expect(calls.get('compileAssessmentBlueprint')).toBe(1)
  })

  it('invalidates an assessment compiler change without invalidating Learn or Practice', async () => {
    const policy = withDurableWorkerContractVersion(
      currentDurableWorkerDependencyPolicy,
      'compileAssessmentBlueprint',
      'q5-assessment-contract-change',
    )
    const { calls } = await changedHeadScenario(policy)
    expect(executedOnSecondPass(calls).sort()).toEqual([
      'compileAssessmentBlueprint',
      'generateQuestionFamilies',
      'generateAssessmentItem',
      'generateMarkingPack',
      'independentReview',
      'remediate',
    ].sort())
    expect(calls.get('generateLearningCollateral')).toBe(1)
    expect(calls.get('generatePracticeCollateral')).toBe(1)
  })

  it('propagates a coverage-contract change through all genuinely coverage-dependent content while preserving unrelated identity/source work', async () => {
    const policy = withDurableWorkerContractVersion(
      currentDurableWorkerDependencyPolicy,
      'compileCoverage',
      'q5-coverage-contract-change',
    )
    const { calls } = await changedHeadScenario(policy)
    expect(executedOnSecondPass(calls).sort()).toEqual([
      'compileCoverage',
      'compileKnowledgeModel',
      'planLearningBlueprint',
      'generateLearningCollateral',
      'generatePracticeCollateral',
      'compileAssessmentBlueprint',
      'generateQuestionFamilies',
      'generateAssessmentItem',
      'generateMarkingPack',
      'independentReview',
      'remediate',
    ].sort())
    expect(calls.get('resolveIdentity')).toBe(1)
    expect(calls.get('discoverSources')).toBe(1)
    expect(calls.get('resolveStructuredEvidence')).toBe(1)
    expect(calls.get('compileBoardAlignment')).toBe(1)
  })

  it('preserves worker retry/cost provenance on cross-head reuse and keeps course spend cumulative without double charging reused work', async () => {
    const { client } = memoryCommentClient()
    const issueNumber = 501
    const firstBlobs = await DurableIssueCheckpointBlobStore.load(issueNumber, client)
    const firstCache = new DependencyAwareDurableWorkerExecutionCache(firstBlobs, '3'.repeat(40))
    const firstExecute = vi.fn(async () => success('generateLearningCollateral', 'priced', 0.37, 2))
    const first = await firstCache.run('generateLearningCollateral', { jobId: 'q5-priced', unit: 'learn-1' }, firstExecute)
    expect(firstExecute).toHaveBeenCalledTimes(1)

    const firstLedgerLoad = await loadDependencyAwareCourseSpendLedger({
      blobs: firstBlobs,
      jobId: 'q5-priced',
      currentContentHeadSha: '3'.repeat(40),
      maxSpendUsd: 1,
    })
    await firstLedgerLoad.ledger.startAttempt('2026-08-28T20:20:00Z')
    await firstLedgerLoad.ledger.reserve('provider-call-1', 0.5, 'learning')
    await firstLedgerLoad.ledger.settle('provider-call-1', 0.37, 'learning')
    expect(firstLedgerLoad.ledger.snapshot().conservativeConsumedUsd).toBe(0.37)

    const restartedBlobs = await DurableIssueCheckpointBlobStore.load(issueNumber, client)
    const secondLedgerLoad = await loadDependencyAwareCourseSpendLedger({
      blobs: restartedBlobs,
      jobId: 'q5-priced',
      currentContentHeadSha: '4'.repeat(40),
      maxSpendUsd: 1,
    })
    expect(secondLedgerLoad.createdContentHeadSha).toBe('3'.repeat(40))
    expect(secondLedgerLoad.requiresSemanticReplay).toBe(true)
    expect(secondLedgerLoad.ledger.snapshot().conservativeConsumedUsd).toBe(0.37)

    const secondCache = new DependencyAwareDurableWorkerExecutionCache(restartedBlobs, '4'.repeat(40))
    const shouldNotRun = vi.fn(async () => success('generateLearningCollateral', 'unexpected', 0.99, 5))
    const reused = await secondCache.run('generateLearningCollateral', { jobId: 'q5-priced', unit: 'learn-1' }, shouldNotRun)
    expect(shouldNotRun).not.toHaveBeenCalled()
    expect(reused).toEqual(first)
    expect(reused.provenance.retryCount).toBe(2)
    expect(reused.provenance.usageCost).toBe(0.37)
    expect(secondLedgerLoad.ledger.snapshot().conservativeConsumedUsd).toBe(0.37)
  })

  it('replays an old late-stage job from requested on a changed head while preserving its governed request identity', () => {
    const requested = createRequestedJob({
      jobId: 'q5-semantic-replay',
      officialUrls: ['https://example.test/course'],
      founderInstruction: 'Build the governed synthetic course.',
      createdAt: '2026-08-28T20:30:00Z',
      schemaVersion: 2,
    })
    const oldLateStageJob = { ...requested, state: 'expert_review_ready' as const } as ContentFactoryJob

    expect(replayDurableJobForCurrentHead({
      job: oldLateStageJob,
      createdContentHeadSha: '5'.repeat(40),
      currentContentHeadSha: '5'.repeat(40),
    })).toBe(oldLateStageJob)

    const replayed = replayDurableJobForCurrentHead({
      job: oldLateStageJob,
      createdContentHeadSha: '5'.repeat(40),
      currentContentHeadSha: '6'.repeat(40),
    })
    expect(replayed.state).toBe('requested')
    expect(replayed.jobId).toBe(requested.jobId)
    expect(replayed.officialUrls).toEqual(requested.officialUrls)
    expect(replayed.founderInstruction).toBe(requested.founderInstruction)
    expect(replayed.workerRuns).toEqual([])
  })
})
