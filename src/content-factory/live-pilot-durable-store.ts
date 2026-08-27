import { Buffer } from 'node:buffer'
import { z } from 'zod'
import type { ContentFactoryEndToEndArtifactKind, ContentFactoryEndToEndWorkers } from './end-to-end-proof'
import { fingerprintValue, type WorkerExecution } from './intake-to-knowledge-model'
import { LivePilotArtifactStore } from './live-pilot'
import type { OpenAIModelRoute } from './openai-provider-adapter'

const checkpointMarker = '<!-- revision-content-factory-checkpoint:v1 -->'
const checkpointPattern = /<!-- revision-content-factory-checkpoint:v1 -->\s*```json\s*([\s\S]*?)\s*```/
const checkpointChunkSize = 48_000

const checkpointChunkSchema = z.object({
  schemaVersion: z.literal(1),
  recordType: z.enum(['artifact', 'worker_execution', 'budget_meta', 'budget_event', 'budget_attempt']),
  key: z.string().min(1),
  recordId: z.string().min(1),
  part: z.number().int().nonnegative(),
  parts: z.number().int().positive(),
  payloadBase64: z.string(),
})

type CheckpointRecordType = z.infer<typeof checkpointChunkSchema>['recordType']

export interface LivePilotIssueCommentClient {
  listComments(issueNumber: number): Promise<Array<{ id: number; body: string | null }>>
  createComment(issueNumber: number, body: string): Promise<{ id: number }>
}

type LoadedRecord = {
  recordType: CheckpointRecordType
  key: string
  value: unknown
  lastCommentId: number
}

function recordMapKey(recordType: CheckpointRecordType, key: string) {
  return `${recordType}\u0000${key}`
}

function encodeChunk(input: z.infer<typeof checkpointChunkSchema>) {
  return [checkpointMarker, '```json', JSON.stringify(input), '```'].join('\n')
}

function parseChunk(body: string | null) {
  if (!body) return undefined
  const match = body.match(checkpointPattern)
  if (!match?.[1]) return undefined
  try {
    return checkpointChunkSchema.parse(JSON.parse(match[1]))
  } catch {
    return undefined
  }
}

export class DurableIssueCheckpointBlobStore {
  private readonly records = new Map<string, LoadedRecord>()

  private constructor(
    readonly issueNumber: number,
    private readonly client: LivePilotIssueCommentClient,
  ) {}

  static async load(issueNumber: number, client: LivePilotIssueCommentClient) {
    const store = new DurableIssueCheckpointBlobStore(issueNumber, client)
    await store.hydrate()
    return store
  }

  private async hydrate() {
    const comments = await this.client.listComments(this.issueNumber)
    const groups = new Map<string, {
      recordType: CheckpointRecordType
      key: string
      parts: number
      chunks: Map<number, { payloadBase64: string; commentId: number }>
    }>()

    for (const comment of comments) {
      const chunk = parseChunk(comment.body)
      if (!chunk) continue
      const groupKey = `${chunk.recordType}\u0000${chunk.key}\u0000${chunk.recordId}`
      const group = groups.get(groupKey) ?? {
        recordType: chunk.recordType,
        key: chunk.key,
        parts: chunk.parts,
        chunks: new Map(),
      }
      if (group.parts !== chunk.parts) continue
      const existing = group.chunks.get(chunk.part)
      if (!existing || comment.id > existing.commentId) {
        group.chunks.set(chunk.part, { payloadBase64: chunk.payloadBase64, commentId: comment.id })
      }
      groups.set(groupKey, group)
    }

    for (const group of groups.values()) {
      if (group.chunks.size !== group.parts) continue
      const ordered = Array.from({ length: group.parts }, (_, index) => group.chunks.get(index))
      if (ordered.some((part) => !part)) continue
      try {
        const base64 = ordered.map((part) => part!.payloadBase64).join('')
        const value = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8')) as unknown
        const lastCommentId = Math.max(...ordered.map((part) => part!.commentId))
        const mapKey = recordMapKey(group.recordType, group.key)
        const current = this.records.get(mapKey)
        if (!current || lastCommentId > current.lastCommentId) {
          this.records.set(mapKey, { recordType: group.recordType, key: group.key, value, lastCommentId })
        }
      } catch {
        // Ignore incomplete or corrupted checkpoint records. They are fail-closed cache misses.
      }
    }
  }

  get(recordType: CheckpointRecordType, key: string) {
    return this.records.get(recordMapKey(recordType, key))?.value
  }

  values(recordType: CheckpointRecordType) {
    return [...this.records.values()]
      .filter((record) => record.recordType === recordType)
      .sort((left, right) => left.lastCommentId - right.lastCommentId)
      .map((record) => ({ key: record.key, value: record.value, lastCommentId: record.lastCommentId }))
  }

  async put(recordType: CheckpointRecordType, key: string, value: unknown) {
    const mapKey = recordMapKey(recordType, key)
    const existing = this.records.get(mapKey)
    if (existing) {
      if (JSON.stringify(existing.value) !== JSON.stringify(value)) {
        throw new Error(`Durable checkpoint key collision for ${recordType}:${key}`)
      }
      return existing
    }

    const serialized = JSON.stringify(value)
    const base64 = Buffer.from(serialized, 'utf-8').toString('base64')
    const chunks = base64.match(new RegExp(`.{1,${checkpointChunkSize}}`, 'g')) ?? ['']
    const recordId = `${recordType}-${(await fingerprintValue({ key, serialized })).slice(0, 24)}`
    let lastCommentId = 0

    for (let part = 0; part < chunks.length; part += 1) {
      const created = await this.client.createComment(this.issueNumber, encodeChunk({
        schemaVersion: 1,
        recordType,
        key,
        recordId,
        part,
        parts: chunks.length,
        payloadBase64: chunks[part],
      }))
      lastCommentId = Math.max(lastCommentId, created.id)
    }

    const record = { recordType, key, value: structuredClone(value), lastCommentId }
    this.records.set(mapKey, record)
    return record
  }
}

export class DurableLivePilotArtifactStore extends LivePilotArtifactStore {
  private readonly values = new Map<string, unknown>()
  private readonly refsByValue = new Map<string, string>()

  private constructor(private readonly blobs: DurableIssueCheckpointBlobStore) {
    super()
  }

  static async load(blobs: DurableIssueCheckpointBlobStore) {
    const store = new DurableLivePilotArtifactStore(blobs)
    for (const record of blobs.values('artifact')) {
      const parsed = z.object({ ref: z.string().min(1), value: z.unknown() }).safeParse(record.value)
      if (!parsed.success) continue
      store.values.set(parsed.data.ref, parsed.data.value)
      store.refsByValue.set(JSON.stringify(parsed.data.value), parsed.data.ref)
    }
    return store
  }

  override async writeJson(input: { jobId: string; kind: ContentFactoryEndToEndArtifactKind; fingerprint: string; value: unknown }) {
    const ref = `pilot-artifact:${input.jobId}:${input.kind}:${input.fingerprint.slice(0, 32)}`
    const existing = this.values.get(ref)
    if (existing !== undefined) {
      if (JSON.stringify(existing) !== JSON.stringify(input.value)) {
        throw new Error(`Durable artifact fingerprint collision for ${ref}`)
      }
      return { ref }
    }

    const value = structuredClone(input.value)
    await this.blobs.put('artifact', ref, {
      schemaVersion: 1,
      ref,
      jobId: input.jobId,
      kind: input.kind,
      fingerprint: input.fingerprint,
      value,
    })
    this.values.set(ref, value)
    this.refsByValue.set(JSON.stringify(value), ref)
    return { ref }
  }

  override async readJson(ref: string) {
    if (!this.values.has(ref)) throw new Error(`Unknown durable live-pilot artifact reference: ${ref}`)
    return structuredClone(this.values.get(ref))
  }

  override findRef(value: unknown) {
    return this.refsByValue.get(JSON.stringify(value))
  }

  override exportArtifacts() {
    return [...this.values.entries()].map(([ref, value]) => ({ ref, value: structuredClone(value) }))
  }
}

type CachedWorkerRecord = {
  schemaVersion: 1
  method: string
  inputFingerprint: string
  contentHeadSha: string
  execution: WorkerExecution<unknown>
}

export class DurableWorkerExecutionCache {
  reusedExecutionCount = 0
  executedWorkerCount = 0

  constructor(
    private readonly blobs: DurableIssueCheckpointBlobStore,
    private readonly contentHeadSha: string,
  ) {}

  async run(
    method: string,
    input: unknown,
    execute: () => Promise<WorkerExecution<unknown>>,
  ): Promise<WorkerExecution<unknown>> {
    const inputFingerprint = await fingerprintValue(input)
    const key = `${method}:${inputFingerprint}:${this.contentHeadSha}`
    const cached = this.blobs.get('worker_execution', key)
    const parsed = z.object({
      schemaVersion: z.literal(1),
      method: z.string(),
      inputFingerprint: z.string(),
      contentHeadSha: z.string(),
      execution: z.unknown(),
    }).safeParse(cached)

    if (parsed.success && parsed.data.contentHeadSha === this.contentHeadSha) {
      const execution = parsed.data.execution as WorkerExecution<unknown>
      if (execution.status !== 'infrastructure_failure') {
        this.reusedExecutionCount += 1
        return structuredClone(execution)
      }
    }

    this.executedWorkerCount += 1
    const execution = await execute()
    const record: CachedWorkerRecord = {
      schemaVersion: 1,
      method,
      inputFingerprint,
      contentHeadSha: this.contentHeadSha,
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

export function createDurableCachedWorkers(
  workers: ContentFactoryEndToEndWorkers,
  cache: DurableWorkerExecutionCache,
): ContentFactoryEndToEndWorkers {
  return new Proxy(workers, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver)
      if (typeof value !== 'function' || typeof property !== 'string') return value
      return async (...args: unknown[]) => cache.run(
        property,
        args[0],
        () => value.apply(target, args) as Promise<WorkerExecution<unknown>>,
      )
    },
  }) as ContentFactoryEndToEndWorkers
}

type BudgetMeta = {
  schemaVersion: 1
  jobId: string
  contentHeadSha: string
  maxSpendUsd: number
}

type BudgetEvent = {
  schemaVersion: 1
  callId: string
  kind: 'reserve' | 'settle'
  amountUsd: number
  label: string
  recordedAt: string
}

type BudgetAttempt = {
  schemaVersion: 1
  attempt: number
  recordedAt: string
}

export class DurableCourseSpendLedger {
  private constructor(
    private readonly blobs: DurableIssueCheckpointBlobStore,
    readonly meta: BudgetMeta,
  ) {}

  static async loadOrCreate(input: {
    blobs: DurableIssueCheckpointBlobStore
    jobId: string
    contentHeadSha: string
    maxSpendUsd: number
  }) {
    const key = `budget-meta:${input.jobId}`
    const existing = input.blobs.get('budget_meta', key)
    if (existing) {
      const meta = z.object({
        schemaVersion: z.literal(1),
        jobId: z.string().min(1),
        contentHeadSha: z.string().regex(/^[0-9a-f]{40}$/),
        maxSpendUsd: z.number().positive(),
      }).parse(existing)
      if (meta.jobId !== input.jobId) throw new Error('Durable spend ledger job ID mismatch')
      if (meta.contentHeadSha !== input.contentHeadSha) {
        throw new Error(`durable_resume_head_mismatch: job was created on ${meta.contentHeadSha}, current head is ${input.contentHeadSha}`)
      }
      if (Math.abs(meta.maxSpendUsd - input.maxSpendUsd) > 0.000001) {
        throw new Error(`durable_resume_spend_ceiling_mismatch: job ceiling is $${meta.maxSpendUsd.toFixed(2)}, requested ceiling is $${input.maxSpendUsd.toFixed(2)}`)
      }
      return new DurableCourseSpendLedger(input.blobs, meta)
    }

    const meta: BudgetMeta = {
      schemaVersion: 1,
      jobId: input.jobId,
      contentHeadSha: input.contentHeadSha,
      maxSpendUsd: input.maxSpendUsd,
    }
    await input.blobs.put('budget_meta', key, meta)
    return new DurableCourseSpendLedger(input.blobs, meta)
  }

  async startAttempt(recordedAt: string) {
    const attempt = this.blobs.values('budget_attempt').length + 1
    const value: BudgetAttempt = { schemaVersion: 1, attempt, recordedAt }
    await this.blobs.put('budget_attempt', `budget-attempt:${this.meta.jobId}:${attempt}`, value)
    return attempt
  }

  snapshot() {
    const byCall = new Map<string, { reserve?: number; settle?: number }>()
    for (const record of this.blobs.values('budget_event')) {
      const event = z.object({
        schemaVersion: z.literal(1),
        callId: z.string().min(1),
        kind: z.enum(['reserve', 'settle']),
        amountUsd: z.number().nonnegative(),
        label: z.string().min(1),
        recordedAt: z.string().min(1),
      }).safeParse(record.value)
      if (!event.success) continue
      const current = byCall.get(event.data.callId) ?? {}
      current[event.data.kind] = event.data.amountUsd
      byCall.set(event.data.callId, current)
    }
    const conservativeConsumedUsd = [...byCall.values()].reduce(
      (sum, call) => sum + (call.settle ?? call.reserve ?? 0),
      0,
    )
    return {
      maxSpendUsd: this.meta.maxSpendUsd,
      conservativeConsumedUsd: Number(conservativeConsumedUsd.toFixed(8)),
      remainingUsd: Number(Math.max(0, this.meta.maxSpendUsd - conservativeConsumedUsd).toFixed(8)),
      attemptCount: this.blobs.values('budget_attempt').length,
      callCount: byCall.size,
    }
  }

  async reserve(callId: string, amountUsd: number, label: string, recordedAt = new Date().toISOString()) {
    const current = this.snapshot().conservativeConsumedUsd
    if (current + amountUsd > this.meta.maxSpendUsd + 0.0000001) {
      throw new Error(`content_factory_spend_ceiling_reached: cumulative $${current.toFixed(4)} + next-call reserve $${amountUsd.toFixed(4)} exceeds $${this.meta.maxSpendUsd.toFixed(2)} course ceiling`)
    }
    const event: BudgetEvent = { schemaVersion: 1, callId, kind: 'reserve', amountUsd, label, recordedAt }
    await this.blobs.put('budget_event', `budget-reserve:${callId}`, event)
  }

  async settle(callId: string, amountUsd: number, label: string, recordedAt = new Date().toISOString()) {
    const event: BudgetEvent = { schemaVersion: 1, callId, kind: 'settle', amountUsd, label, recordedAt }
    await this.blobs.put('budget_event', `budget-settle:${callId}`, event)
  }
}

type ResponseUsage = {
  input_tokens?: number
  output_tokens?: number
  input_tokens_details?: {
    cached_tokens?: number
    cache_write_tokens?: number
  }
}

function usageCost(usage: ResponseUsage | undefined, route: OpenAIModelRoute) {
  if (!usage) return undefined
  const inputTokens = Math.max(0, usage.input_tokens ?? 0)
  const outputTokens = Math.max(0, usage.output_tokens ?? 0)
  const cachedTokens = Math.min(inputTokens, Math.max(0, usage.input_tokens_details?.cached_tokens ?? 0))
  const cacheWriteTokens = Math.min(inputTokens - cachedTokens, Math.max(0, usage.input_tokens_details?.cache_write_tokens ?? 0))
  const uncachedTokens = inputTokens - cachedTokens - cacheWriteTokens
  const isLongContext = inputTokens > (route.longContextThresholdTokens ?? 272_000)
  const inputMultiplier = isLongContext ? (route.longContextInputMultiplier ?? 2) : 1
  const outputMultiplier = isLongContext ? (route.longContextOutputMultiplier ?? 1.5) : 1
  const cacheWriteMultiplier = route.cacheWriteMultiplier ?? 1.25
  return Number((
    uncachedTokens * route.inputUsdPerMillion * inputMultiplier
    + cachedTokens * route.cachedInputUsdPerMillion * inputMultiplier
    + cacheWriteTokens * route.inputUsdPerMillion * inputMultiplier * cacheWriteMultiplier
    + outputTokens * route.outputUsdPerMillion * outputMultiplier
  ) / 1_000_000)
}

function estimateMaxCallCost(requestBody: unknown, route: OpenAIModelRoute) {
  const estimatedInputTokens = Math.ceil(JSON.stringify(requestBody).length / 3)
  const maxOutputTokens = route.maxOutputTokens ?? 8_000
  const isLongContext = estimatedInputTokens > (route.longContextThresholdTokens ?? 272_000)
  const inputMultiplier = isLongContext ? (route.longContextInputMultiplier ?? 2) : 1
  const outputMultiplier = isLongContext ? (route.longContextOutputMultiplier ?? 1.5) : 1
  const conservativeInputRate = route.inputUsdPerMillion * Math.max(1, route.cacheWriteMultiplier ?? 1.25)
  return Number((
    estimatedInputTokens * conservativeInputRate * inputMultiplier
    + maxOutputTokens * route.outputUsdPerMillion * outputMultiplier
  ) / 1_000_000)
}

function matchingRoutes(model: string, generation: OpenAIModelRoute, independentReview: OpenAIModelRoute) {
  const routes = [generation, independentReview].filter((route) => route.model === model)
  if (routes.length === 0) throw new Error(`No durable spend route configured for model ${model}`)
  return routes
}

export function createDurableBudgetFetch(input: {
  ledger: DurableCourseSpendLedger
  generation: OpenAIModelRoute
  independentReview: OpenAIModelRoute
  fetchImpl?: typeof fetch
}): typeof fetch {
  const fetchImpl = input.fetchImpl ?? fetch
  return (async (resource: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    const requestBody = typeof init?.body === 'string' ? JSON.parse(init.body) as { model?: string; text?: { format?: { name?: string } } } : undefined
    const model = requestBody?.model
    if (!model) throw new Error('Durable budget wrapper requires an OpenAI request body with model')
    const routes = matchingRoutes(model, input.generation, input.independentReview)
    const reserveUsd = Math.max(...routes.map((route) => estimateMaxCallCost(requestBody, route)))
    const callId = globalThis.crypto.randomUUID()
    const label = requestBody?.text?.format?.name ?? model
    await input.ledger.reserve(callId, reserveUsd, label)

    let response: Response
    try {
      response = await fetchImpl(resource, init)
    } catch (error) {
      await input.ledger.settle(callId, 0, label)
      throw error
    }

    let settledUsd = reserveUsd
    try {
      const body = await response.clone().json() as { usage?: ResponseUsage }
      const observed = routes
        .map((route) => usageCost(body.usage, route))
        .filter((value): value is number => value !== undefined)
      if (observed.length > 0) settledUsd = Math.max(...observed)
    } catch {
      // Keep the conservative reservation when provider usage cannot be read.
    }
    await input.ledger.settle(callId, settledUsd, label)
    return response
  }) as typeof fetch
}
