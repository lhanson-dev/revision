import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { answerConfidenceSchema, learningEvidenceSchema, type LearningEvidence } from '../../engine/evidence/evidence'
import type { QuestionSession } from '../../app/practice-session'

const level = z.enum(['Recall', 'Apply', 'Analyse'])
const answer = z.object({
  questionId: z.string().min(1), correct: z.boolean(),
  confidence: answerConfidenceSchema.nullable(), selectedOption: z.number().int().nonnegative().nullable(),
  typedAnswer: z.string().max(200).nullable(),
  marks: z.object({ got: z.number().nonnegative(), available: z.number().nonnegative() }).nullable(),
  pointsGiven: z.array(z.boolean()).nullable(), level, retry: z.boolean(),
})
const sessionSchema = z.object({
  total: z.number().int().min(1).max(100),
  poolIds: z.array(z.string().min(1)).min(1).max(500),
  askedIds: z.array(z.string().min(1)).min(1).max(100),
  currentId: z.string().min(1).nullable(),
  currentIsRetry: z.boolean(),
  adaptive: z.object({
    level, streak: z.number().int().nonnegative().max(100),
    lastChange: z.enum(['none', 'stepped-up', 'missed']),
  }),
  retryQueue: z.array(z.object({ questionId: z.string().min(1), dueAfterAnswers: z.number().int().nonnegative() })).max(100),
  answers: z.array(answer).max(200),
}).superRefine((session, context) => {
  const pool = new Set(session.poolIds)
  if (pool.size !== session.poolIds.length || session.total > pool.size ||
      session.askedIds.length > session.total ||
      new Set(session.askedIds).size !== session.askedIds.length ||
      session.askedIds.some(id => !pool.has(id)) ||
      (session.currentId !== null && !pool.has(session.currentId)) ||
      session.retryQueue.some(item => !pool.has(item.questionId)) ||
      session.answers.some(item => !pool.has(item.questionId))) {
    context.addIssue({ code: 'custom', message: 'Practice session refers to unavailable or duplicate questions.' })
  }
})
const checkpointSchema = z.object({
  schemaVersion: z.literal(1),
  session: sessionSchema,
  pending: z.object({
    evidence: z.union([learningEvidenceSchema]).refine(fact => fact.source === 'multiple_choice' || fact.source === 'calculation', 'Only scored objective questions may be checkpointed.'),
    nextSession: sessionSchema,
  }).nullable(),
})

export type PracticeCheckpointSnapshot = {
  schemaVersion: 1
  session: QuestionSession
  /** Write-ahead intent. Save BEFORE scored evidence; reconcile on interrupted retries. */
  pending: { evidence: LearningEvidence; nextSession: QuestionSession } | null
}
export type PracticeCheckpointKey = {
  userId: string; courseId: string; moduleId: string; topicId: string
}
export type PracticeCheckpoint = PracticeCheckpointKey & {
  sessionId: string
  revision: number
  contentFingerprint: string
  snapshot: PracticeCheckpointSnapshot
  expiresAt: string
}

export type PracticeCheckpointRow = {
  user_id: string; course_id: string; module_id: string; topic_id: string
  session_id: string; revision: number; content_fingerprint: string
  snapshot: unknown; expires_at: string
}
type DbError = { message: string; code?: string }
type Read = { data: PracticeCheckpointRow | null; error: DbError | null }
type Mutation = { data: PracticeCheckpointRow | null; error: DbError | null }
type DeleteResult = { data: { session_id: string }[] | null; error: DbError | null }

/** Separate narrow I/O contract so owner, conflicts, and ambiguous network replies are testable. */
export type PracticeCheckpointStore = {
  read(key: PracticeCheckpointKey): Promise<Read>
  insert(row: PracticeCheckpointRow): Promise<Mutation>
  compareAndSwap(key: PracticeCheckpointKey, sessionId: string, revision: number, row: PracticeCheckpointRow): Promise<Mutation>
  remove(key: PracticeCheckpointKey, sessionId: string, revision: number): Promise<DeleteResult>
}

const columns = 'user_id,course_id,module_id,topic_id,session_id,revision,content_fingerprint,snapshot,expires_at'
export function supabasePracticeCheckpointStore(client: SupabaseClient): PracticeCheckpointStore {
  const table = () => client.from('learner_practice_checkpoints')
  const byKey = (key: PracticeCheckpointKey) => table().select(columns).eq('user_id', key.userId)
    .eq('course_id', key.courseId).eq('module_id', key.moduleId).eq('topic_id', key.topicId)
  return {
    async read(key) {
      const { data, error } = await byKey(key).maybeSingle()
      return { data: data as PracticeCheckpointRow | null, error }
    },
    async insert(row) {
      const { data, error } = await table().insert(row).select(columns).maybeSingle()
      return { data: data as PracticeCheckpointRow | null, error }
    },
    async compareAndSwap(key, sessionId, revision, row) {
      const { data, error } = await table().update({
        snapshot: row.snapshot, revision: revision + 1, updated_at: new Date().toISOString(),
      }).eq('user_id', key.userId).eq('course_id', key.courseId)
        .eq('module_id', key.moduleId).eq('topic_id', key.topicId)
        .eq('session_id', sessionId).eq('revision', revision).select(columns).maybeSingle()
      return { data: data as PracticeCheckpointRow | null, error }
    },
    async remove(key, sessionId, revision) {
      const { data, error } = await table().delete().eq('user_id', key.userId)
        .eq('course_id', key.courseId).eq('module_id', key.moduleId)
        .eq('topic_id', key.topicId).eq('session_id', sessionId)
        .eq('revision', revision).select('session_id')
      return { data: data as { session_id: string }[] | null, error }
    },
  }
}

function validateKey(key: PracticeCheckpointKey) {
  for (const value of Object.values(key)) if (!value.trim() || value.length > 200) throw new Error('A valid exact learner/course/module/topic is required.')
}
function fingerprintValid(value: string) {
  if (!/^[0-9a-f]{64}$/.test(value)) throw new Error('A content fingerprint is required for Practice recovery.')
}
function stable(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']'
  if (value && typeof value === 'object') {
    return '{' + Object.entries(value).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => JSON.stringify(key) + ':' + stable(item)).join(',') + '}'
  }
  return JSON.stringify(value)
}

/** Content changes fail closed, even if a question ID is reused with a revised answer key. */
export async function fingerprintPracticeContent(questions: readonly { id: string }[]): Promise<string> {
  const content = questions.map(item => item).sort((a, b) => a.id.localeCompare(b.id))
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(stable(content)))
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('')
}

function decode(row: PracticeCheckpointRow): PracticeCheckpoint {
  const parsed = checkpointSchema.parse(row.snapshot) as PracticeCheckpointSnapshot
  validateSnapshotForKey(parsed, { userId: row.user_id, courseId: row.course_id, moduleId: row.module_id, topicId: row.topic_id })
  return {
    userId: row.user_id, courseId: row.course_id, moduleId: row.module_id,
    topicId: row.topic_id, sessionId: row.session_id, revision: Number(row.revision),
    contentFingerprint: row.content_fingerprint, snapshot: parsed, expiresAt: row.expires_at,
  }
}
function validateSnapshotForKey(snapshot: PracticeCheckpointSnapshot, key: PracticeCheckpointKey) {
  const pending = snapshot.pending
  if (!pending) return
  const { evidence, nextSession } = pending
  const previous = snapshot.session
  if (evidence.moduleId !== key.moduleId || evidence.topicId !== key.topicId ||
      evidence.contentId !== previous.currentId ||
      nextSession.currentId !== previous.currentId ||
      nextSession.poolIds.join('|') !== previous.poolIds.join('|') ||
      nextSession.answers.length !== previous.answers.length + 1 ||
      nextSession.answers.at(-1)?.questionId !== evidence.contentId) {
    throw new Error('Pending Practice answer does not match the owner, question, or source session.')
  }
}

function asRow(key: PracticeCheckpointKey, sessionId: string, revision: number, fingerprint: string, snapshot: PracticeCheckpointSnapshot, expiresAt: string): PracticeCheckpointRow {
  validateKey(key)
  fingerprintValid(fingerprint)
  checkpointSchema.parse(snapshot)
  validateSnapshotForKey(snapshot, key)
  if (new TextEncoder().encode(JSON.stringify(snapshot)).byteLength > 65536) throw new Error('Practice checkpoint exceeds the safe size limit.')
  return {
    user_id: key.userId, course_id: key.courseId, module_id: key.moduleId, topic_id: key.topicId,
    session_id: sessionId, revision, content_fingerprint: fingerprint, snapshot, expires_at: expiresAt,
  }
}
async function verifiedRead(store: PracticeCheckpointStore, key: PracticeCheckpointKey) {
  const { data, error } = await store.read(key)
  if (error) throw new Error('Could not verify Practice session state. No session progress was assumed.')
  return data ? decode(data) : null
}
function equals(a: PracticeCheckpoint, b: PracticeCheckpointRow): boolean {
  return a.sessionId === b.session_id && a.revision === b.revision &&
    a.contentFingerprint === b.content_fingerprint && stable(a.snapshot) === stable(b.snapshot)
}

/** Explicit discard is allowed for expired/changed content; no attempt is resumed. */
export async function discardPracticeCheckpoint(store: PracticeCheckpointStore, key: PracticeCheckpointKey): Promise<void> {
  validateKey(key)
  const existing = await verifiedRead(store, key)
  if (!existing) return
  await removePracticeCheckpoint(store, existing)
}

export async function loadPracticeCheckpoint(store: PracticeCheckpointStore, key: PracticeCheckpointKey, expectedFingerprint: string): Promise<PracticeCheckpoint | null> {
  validateKey(key)
  fingerprintValid(expectedFingerprint)
  const found = await verifiedRead(store, key)
  if (found && (found.contentFingerprint !== expectedFingerprint || Date.parse(found.expiresAt) <= Date.now())) {
    throw new Error('Your saved Practice session cannot safely resume because the content changed or the checkpoint expired. Your completed answers are still saved. Discard the old session to begin again.')
  }
  return found
}

export async function createPracticeCheckpoint(store: PracticeCheckpointStore, key: PracticeCheckpointKey, fingerprint: string, sessionId: string, snapshot: PracticeCheckpointSnapshot): Promise<PracticeCheckpoint> {
  const row = asRow(key, sessionId, 1, fingerprint, snapshot, new Date(Date.now() + 14 * 86400000).toISOString())
  const { data, error } = await store.insert(row)
  if (!error && data) return decode(data)
  // Ambiguous post-commit acknowledgement is success only if the owner's exact original row matches.
  const existing = await verifiedRead(store, key)
  if (existing && equals(existing, row)) return existing
  throw new Error(error?.code === '23505' ? 'You already have a Practice session saved for this topic. Resume or discard it first.' : 'Could not confirm your Practice session was saved. Try again.')
}

export async function updatePracticeCheckpoint(store: PracticeCheckpointStore, current: PracticeCheckpoint, snapshot: PracticeCheckpointSnapshot): Promise<PracticeCheckpoint> {
  const key: PracticeCheckpointKey = { userId: current.userId, courseId: current.courseId, moduleId: current.moduleId, topicId: current.topicId }
  const expected = asRow(key, current.sessionId, current.revision + 1, current.contentFingerprint, snapshot, current.expiresAt)
  const { data, error } = await store.compareAndSwap(key, current.sessionId, current.revision, expected)
  if (!error && data) return decode(data)
  // Compare-and-swap failure may mean another tab advanced. Never silently overwrite its work.
  const existing = await verifiedRead(store, key)
  if (existing && equals(existing, expected)) return existing
  throw new Error('Practice session changed in another tab or saving could not be confirmed. Reload it before continuing.')
}

export async function removePracticeCheckpoint(store: PracticeCheckpointStore, current: PracticeCheckpoint): Promise<void> {
  const key: PracticeCheckpointKey = { userId: current.userId, courseId: current.courseId, moduleId: current.moduleId, topicId: current.topicId }
  const { data, error } = await store.remove(key, current.sessionId, current.revision)
  if (!error && data?.length === 1) return
  // A second delete after a committed but unacknowledged response can be accepted.
  const existing = await verifiedRead(store, key)
  if (!existing) return
  throw new Error('The saved Practice session has changed or cannot be discarded safely. Reload before trying again.')
}
