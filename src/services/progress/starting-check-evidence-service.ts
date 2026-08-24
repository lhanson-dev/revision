import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

const topicIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const nonNegativeInteger = z.number().int().nonnegative()

export const startingCheckEvidenceSchema = z.object({
  id: z.string().min(1),
  moduleId: z.string().min(1),
  topicId: topicIdSchema,
  occurredAt: z.iso.datetime(),
  questionId: z.string().min(1),
  selectedOption: nonNegativeInteger,
  correctOption: nonNegativeInteger,
  correct: z.boolean(),
  schemaVersion: z.literal(1),
})

export type StartingCheckEvidence = z.infer<typeof startingCheckEvidenceSchema>

type DatabaseError = { code?: string; message: string }
type StartingCheckEvidenceRow = {
  user_id: string
  evidence_id: string
  module_id: string
  topic_id: string
  question_id: string
  occurred_at: string
  payload: StartingCheckEvidence
  schema_version: 1
}

type StartingCheckEvidencePayloadRow = { payload: unknown }

export type StartingCheckEvidenceStore = {
  insert(record: StartingCheckEvidenceRow): Promise<{ error: DatabaseError | null }>
  list(userId: string, moduleId: string): Promise<{ data: StartingCheckEvidencePayloadRow[] | null; error: DatabaseError | null }>
}

export function toStartingCheckEvidenceRow(
  userId: string,
  value: unknown,
): StartingCheckEvidenceRow {
  if (!userId.trim()) throw new Error('userId is required')
  const evidence = startingCheckEvidenceSchema.parse(value)
  return {
    user_id: userId,
    evidence_id: evidence.id,
    module_id: evidence.moduleId,
    topic_id: evidence.topicId,
    question_id: evidence.questionId,
    occurred_at: evidence.occurredAt,
    payload: evidence,
    schema_version: evidence.schemaVersion,
  }
}

export function createSupabaseStartingCheckEvidenceStore(
  client: SupabaseClient,
): StartingCheckEvidenceStore {
  return {
    async insert(record) {
      const { error } = await client.from('starting_check_evidence').insert(record)
      return { error }
    },
    async list(userId, moduleId) {
      const { data, error } = await client
        .from('starting_check_evidence')
        .select('payload')
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .order('occurred_at', { ascending: true })
      return { data: data as StartingCheckEvidencePayloadRow[] | null, error }
    },
  }
}

export async function recordStartingCheckEvidence(
  store: StartingCheckEvidenceStore,
  userId: string,
  value: unknown,
): Promise<StartingCheckEvidence> {
  const evidence = startingCheckEvidenceSchema.parse(value)
  const { error } = await store.insert(toStartingCheckEvidenceRow(userId, evidence))
  if (error && error.code !== '23505') {
    throw new Error(`Could not save starting-check evidence: ${error.message}`)
  }
  return evidence
}

export async function loadStartingCheckEvidence(
  store: StartingCheckEvidenceStore,
  userId: string,
  moduleId: string,
): Promise<StartingCheckEvidence[]> {
  if (!userId.trim()) throw new Error('userId is required')
  if (!moduleId.trim()) throw new Error('moduleId is required')

  const { data, error } = await store.list(userId, moduleId)
  if (error) throw new Error(`Could not load starting-check evidence: ${error.message}`)
  return (data ?? []).map((row) => startingCheckEvidenceSchema.parse(row.payload))
}
