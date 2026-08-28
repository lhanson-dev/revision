import { z } from 'zod'
import type { ContentFactoryEndToEndWorkers } from './end-to-end-proof'
import { fingerprintValue, type WorkerExecution } from './intake-to-knowledge-model'
import { createRequestedJob } from './orchestrator'
import type { ContentFactoryJob } from './schema'
import {
  currentDurableWorkerDependencyPolicy,
  durableWorkerDependencyFingerprint,
  durableWorkerMethods,
  type DurableWorkerDependencyPolicy,
  type DurableWorkerMethod,
} from './durable-worker-dependencies'
import {
  DurableCourseSpendLedger,
  DurableIssueCheckpointBlobStore,
} from './live-pilot-durable-store'

const commitShaSchema = z.string().regex(/^[0-9a-f]{40}$/)
const durableWorkerMethodSet = new Set<string>(durableWorkerMethods)

export function isDurableWorkerMethod(value: string): value is DurableWorkerMethod {
  return durableWorkerMethodSet.has(value)
}

type SemanticCachedWorkerRecord = {
  schemaVersion: 2
  method: DurableWorkerMethod
  inputFingerprint: string
  dependencyFingerprint: string
  executedContentHeadSha: string
  execution: WorkerExecution<unknown>
}

const semanticCachedWorkerRecordSchema = z.object({
  schemaVersion: z.literal(2),
  method: z.string().refine(isDurableWorkerMethod),
  inputFingerprint: z.string().min(1),
  dependencyFingerprint: z.string().min(1),
  executedContentHeadSha: commitShaSchema,
  execution: z.unknown(),
})

const legacyCachedWorkerRecordSchema = z.object({
  schemaVersion: z.literal(1),
  method: z.string(),
  inputFingerprint: z.string().min(1),
  contentHeadSha: commitShaSchema,
  execution: z.unknown(),
})

export class DependencyAwareDurableWorkerExecutionCache {
  reusedExecutionCount = 0
  reusedAcrossHeadCount = 0
  executedWorkerCount = 0

  constructor(
    private readonly blobs: DurableIssueCheckpointBlobStore,
    private readonly contentHeadSha: string,
    private readonly dependencyPolicy: DurableWorkerDependencyPolicy = currentDurableWorkerDependencyPolicy,
  ) {
    commitShaSchema.parse(contentHeadSha)
  }

  private async semanticKey(method: DurableWorkerMethod, inputFingerprint: string) {
    const dependencyFingerprint = await durableWorkerDependencyFingerprint(method, this.dependencyPolicy)
    return {
      dependencyFingerprint,
      key: `${method}:${inputFingerprint}:${dependencyFingerprint}`,
    }
  }

  private reuse(record: SemanticCachedWorkerRecord) {
    const execution = record.execution as WorkerExecution<unknown>
    if (execution.status === 'infrastructure_failure') return undefined
    this.reusedExecutionCount += 1
    if (record.executedContentHeadSha !== this.contentHeadSha) this.reusedAcrossHeadCount += 1
    return structuredClone(execution)
  }

  async run(
    method: DurableWorkerMethod,
    input: unknown,
    execute: () => Promise<WorkerExecution<unknown>>,
  ): Promise<WorkerExecution<unknown>> {
    const inputFingerprint = await fingerprintValue(input)
    const { dependencyFingerprint, key } = await this.semanticKey(method, inputFingerprint)
    const semantic = semanticCachedWorkerRecordSchema.safeParse(this.blobs.get('worker_execution', key))
    if (semantic.success) {
      const reused = this.reuse(semantic.data as SemanticCachedWorkerRecord)
      if (reused) return reused
    }

    // Schema-v1 checkpoints are safe only on the exact head that created them.
    // Reusing one once on that head also writes a v2 semantic record so future
    // dependency-compatible heads can reuse it without treating Git identity as
    // the quality contract.
    const legacyKey = `${method}:${inputFingerprint}:${this.contentHeadSha}`
    const legacy = legacyCachedWorkerRecordSchema.safeParse(this.blobs.get('worker_execution', legacyKey))
    if (legacy.success && legacy.data.contentHeadSha === this.contentHeadSha) {
      const execution = legacy.data.execution as WorkerExecution<unknown>
      if (execution.status !== 'infrastructure_failure') {
        const migrated: SemanticCachedWorkerRecord = {
          schemaVersion: 2,
          method,
          inputFingerprint,
          dependencyFingerprint,
          executedContentHeadSha: legacy.data.contentHeadSha,
          execution: structuredClone(execution),
        }
        await this.blobs.put('worker_execution', key, migrated)
        this.reusedExecutionCount += 1
        return structuredClone(execution)
      }
    }

    this.executedWorkerCount += 1
    const execution = await execute()
    const record: SemanticCachedWorkerRecord = {
      schemaVersion: 2,
      method,
      inputFingerprint,
      dependencyFingerprint,
      executedContentHeadSha: this.contentHeadSha,
      execution: structuredClone(execution),
    }

    if (execution.status === 'infrastructure_failure') {
      await this.blobs.put('worker_execution', `${key}:infrastructure:${globalThis.crypto.randomUUID()}`, record)
    } else {
      await this.blobs.put('worker_execution', key, record)
    }
    return execution
  }
}

export function createDependencyAwareDurableCachedWorkers(
  workers: ContentFactoryEndToEndWorkers,
  cache: DependencyAwareDurableWorkerExecutionCache,
): ContentFactoryEndToEndWorkers {
  return new Proxy(workers, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver)
      if (typeof value !== 'function' || typeof property !== 'string' || !isDurableWorkerMethod(property)) return value
      return async (...args: unknown[]) => cache.run(
        property,
        args[0],
        () => value.apply(target, args) as Promise<WorkerExecution<unknown>>,
      )
    },
  }) as ContentFactoryEndToEndWorkers
}

const budgetMetaSchema = z.object({
  schemaVersion: z.literal(1),
  jobId: z.string().min(1),
  contentHeadSha: commitShaSchema,
  maxSpendUsd: z.number().positive(),
})

export async function loadDependencyAwareCourseSpendLedger(input: {
  blobs: DurableIssueCheckpointBlobStore
  jobId: string
  currentContentHeadSha: string
  maxSpendUsd: number
}) {
  const currentContentHeadSha = commitShaSchema.parse(input.currentContentHeadSha)
  const existing = input.blobs.get('budget_meta', `budget-meta:${input.jobId}`)
  const createdContentHeadSha = existing
    ? budgetMetaSchema.parse(existing).contentHeadSha
    : currentContentHeadSha
  const ledger = await DurableCourseSpendLedger.loadOrCreate({
    blobs: input.blobs,
    jobId: input.jobId,
    contentHeadSha: createdContentHeadSha,
    maxSpendUsd: input.maxSpendUsd,
  })
  return {
    ledger,
    createdContentHeadSha,
    requiresSemanticReplay: createdContentHeadSha !== currentContentHeadSha,
  }
}

export function replayDurableJobForCurrentHead(input: {
  job: ContentFactoryJob
  createdContentHeadSha: string
  currentContentHeadSha: string
}): ContentFactoryJob {
  const createdContentHeadSha = commitShaSchema.parse(input.createdContentHeadSha)
  const currentContentHeadSha = commitShaSchema.parse(input.currentContentHeadSha)
  if (createdContentHeadSha === currentContentHeadSha) return input.job

  return createRequestedJob({
    jobId: input.job.jobId,
    officialUrls: input.job.officialUrls,
    founderInstruction: input.job.founderInstruction,
    createdAt: input.job.createdAt,
    schemaVersion: 2,
  })
}
