import type { SupabaseClient } from '@supabase/supabase-js'
import { learningEvidenceSchema, type LearningEvidence } from '../../engine/evidence/evidence'
import { toLearningEvidenceRecord, type LearningEvidenceRecord } from './evidence-record'

type EvidenceRow = { payload: unknown }
type DatabaseError = { code?: string; message: string }

export type EvidenceStore = {
  insert(record: LearningEvidenceRecord): Promise<{ error: DatabaseError | null }>
  list(userId: string, moduleId: string, topicId?: string): Promise<{ data: EvidenceRow[] | null; error: DatabaseError | null }>
}

export function createSupabaseEvidenceStore(client: SupabaseClient): EvidenceStore {
  return {
    async insert(record) {
      const { error } = await client.from('learning_evidence').insert(record)
      return { error }
    },
    async list(userId, moduleId, topicId) {
      let query = client
        .from('learning_evidence')
        .select('payload')
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .order('occurred_at', { ascending: false })

      if (topicId) query = query.eq('topic_id', topicId)
      const { data, error } = await query
      return { data: data as EvidenceRow[] | null, error }
    },
  }
}

export async function recordLearningEvidence(
  store: EvidenceStore,
  userId: string,
  value: unknown,
): Promise<LearningEvidence> {
  const evidence = learningEvidenceSchema.parse(value)
  const record = toLearningEvidenceRecord(userId, evidence)
  const { error } = await store.insert(record)

  // Evidence IDs are stable. Treat a primary-key collision as an idempotent retry,
  // never as permission to mutate an existing evidence fact.
  if (error && error.code !== '23505') {
    throw new Error(`Could not save learning evidence: ${error.message}`)
  }

  return evidence
}

export async function loadLearningEvidence(
  store: EvidenceStore,
  userId: string,
  moduleId: string,
  topicId?: string,
): Promise<LearningEvidence[]> {
  if (!userId.trim()) throw new Error('userId is required')
  if (!moduleId.trim()) throw new Error('moduleId is required')

  const { data, error } = await store.list(userId, moduleId, topicId)
  if (error) throw new Error(`Could not load learning evidence: ${error.message}`)

  return (data ?? []).map((row) => learningEvidenceSchema.parse(row.payload))
}
