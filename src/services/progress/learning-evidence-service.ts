import type { SupabaseClient } from '@supabase/supabase-js'
import { learningEvidenceSchema, type LearningEvidence } from '../../engine/evidence/evidence'
import { toLearningEvidenceRecord, type LearningEvidenceRecord } from './evidence-record'

type EvidenceRow = { payload: unknown }
type DatabaseError = { code?: string; message: string }

export type EvidenceStore = {
  insert(record: LearningEvidenceRecord): Promise<{ error: DatabaseError | null }>
  list(userId: string, moduleId: string, topicId?: string): Promise<{ data: EvidenceRow[] | null; error: DatabaseError | null }>
  find(userId: string, evidenceId: string): Promise<{ data: EvidenceRow | null; error: DatabaseError | null }>
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
    async find(userId, evidenceId) {
      const { data, error } = await client
        .from('learning_evidence')
        .select('payload')
        .eq('user_id', userId)
        .eq('evidence_id', evidenceId)
        .maybeSingle()
      return { data: data as EvidenceRow | null, error }
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

  // A duplicate (user_id, evidence_id) is an accepted retry ONLY when the
  // previously saved fact is readable and exactly the same. A collision is not
  // permission to invent progress, change an answer or mask a failed write.
  if (error?.code === '23505') {
    const existing = await store.find(userId, evidence.id)
    if (existing.error) throw new Error(`Could not verify saved learning evidence: ${existing.error.message}`)
    const parsed = existing.data ? learningEvidenceSchema.safeParse(existing.data.payload) : null
    if (!parsed?.success || JSON.stringify(parsed.data) !== JSON.stringify(evidence)) {
      throw new Error('Could not verify saved learning evidence: this ID belongs to a different or unavailable answer.')
    }
  } else if (error) {
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
