import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { learningEvidenceSchema } from '../../engine/evidence/evidence'
import type { ExamRuntime, FrozenExamSubmission } from '../../app/ExamSimulator'

const marks = z.object({
  ao1: z.number().int().min(0).max(1000),
  ao2: z.number().int().min(0).max(1000),
  ao3: z.number().int().min(0).max(1000),
  ao4: z.number().int().min(0).max(1000),
})
const result = z.object({
  recorded: z.boolean(), totalAwarded: z.number().min(0),
  totalAvailable: z.number().min(0), durationMinutes: z.number().min(0),
  timed: z.boolean(),
  ao: z.object({
    ao1: z.object({ awarded: z.number().min(0), available: z.number().min(0) }),
    ao2: z.object({ awarded: z.number().min(0), available: z.number().min(0) }),
    ao3: z.object({ awarded: z.number().min(0), available: z.number().min(0) }),
    ao4: z.object({ awarded: z.number().min(0), available: z.number().min(0) }),
  }),
})
const snapshotSchema = z.object({
  schemaVersion: z.literal(1),
  phase: z.enum(['writing', 'marking', 'submitting', 'submitted']),
  answers: z.record(z.string().min(1).max(200), z.string().max(30000)),
  marks: z.record(z.string().min(1).max(200), marks),
  selectedChoices: z.record(z.string().min(1).max(200), z.string().min(1).max(200)),
  flagged: z.record(z.string().min(1).max(200), z.boolean()),
  questionIndex: z.number().int().min(0).max(500),
  timing: z.object({
    // Explicit model; no elapsed-time reset when returning after sleep/refresh.
    elapsedMs: z.number().int().min(0).max(86400000),
    runningSince: z.string().datetime().nullable(),
    // This is a candidate, NOT a Founder-approved interruption timer policy.
    policy: z.literal('wall-clock'),
  }),
  frozenSubmission: z.object({ evidence: z.array(learningEvidenceSchema).max(501), result }).nullable(),
}).superRefine((snapshot, ctx) => {
  if (['submitting', 'submitted'].includes(snapshot.phase) && !snapshot.frozenSubmission) {
    ctx.addIssue({ code: 'custom', message: 'Submission must be durably frozen before scoring.' })
  }
  if (snapshot.frozenSubmission && !['submitting', 'submitted'].includes(snapshot.phase)) {
    ctx.addIssue({ code: 'custom', message: 'A frozen exam cannot return to editing.' })
  }
  if (snapshot.phase !== 'writing' && snapshot.timing.runningSince !== null) {
    ctx.addIssue({ code: 'custom', message: 'Writing time must stop before marking or submission.' })
  }
  if (Object.keys(snapshot.answers).length > 500 || Object.keys(snapshot.marks).length > 500 ||
      Object.keys(snapshot.flagged).length > 500 || Object.keys(snapshot.selectedChoices).length > 100) {
    ctx.addIssue({ code: 'custom', message: 'Invalid examination state size.' })
  }
})
export type ExamAttemptSnapshot = z.infer<typeof snapshotSchema>
export type ExamAttemptKey = { userId: string; courseId: string; moduleId: string; examId: string }
export type ExamAttemptRow = {
  user_id: string; course_id: string; module_id: string; exam_id: string
  attempt_id: string; revision: number; content_fingerprint: string
  snapshot: unknown; expires_at: string
}
export type ExamAttempt = ExamAttemptKey & {
  attemptId: string; revision: number; contentFingerprint: string
  snapshot: ExamAttemptSnapshot; expiresAt: string
}
type DbError = { code?: string; message: string }
type Mutation = { data: ExamAttemptRow | null; error: DbError | null }
export type ExamAttemptStore = {
  read(key: ExamAttemptKey): Promise<Mutation>
  insert(row: ExamAttemptRow): Promise<Mutation>
  compareAndSwap(key: ExamAttemptKey, attemptId: string, revision: number, next: ExamAttemptRow): Promise<Mutation>
  remove(key: ExamAttemptKey, attemptId: string, revision: number): Promise<{ data: { attempt_id: string }[] | null; error: DbError | null }>
}

const columns = 'user_id,course_id,module_id,exam_id,attempt_id,revision,content_fingerprint,snapshot,expires_at'
export function supabaseExamAttemptStore(client: SupabaseClient): ExamAttemptStore {
  const table = () => client.from('learner_exam_attempts')
  const byKey = (key: ExamAttemptKey) => table().select(columns)
    .eq('user_id', key.userId).eq('course_id', key.courseId)
    .eq('module_id', key.moduleId).eq('exam_id', key.examId)
  return {
    async read(key) {
      const { data, error } = await byKey(key).maybeSingle()
      return { data: data as ExamAttemptRow | null, error }
    },
    async insert(row) {
      const { data, error } = await table().insert(row).select(columns).maybeSingle()
      return { data: data as ExamAttemptRow | null, error }
    },
    async compareAndSwap(key, attemptId, revision, next) {
      const { data, error } = await table().update({
        revision: revision + 1, snapshot: next.snapshot, updated_at: new Date().toISOString(),
      }).eq('user_id', key.userId).eq('course_id', key.courseId)
        .eq('module_id', key.moduleId).eq('exam_id', key.examId)
        .eq('attempt_id', attemptId).eq('revision', revision).select(columns).maybeSingle()
      return { data: data as ExamAttemptRow | null, error }
    },
    async remove(key, attemptId, revision) {
      const { data, error } = await table().delete().eq('user_id', key.userId)
        .eq('course_id', key.courseId).eq('module_id', key.moduleId).eq('exam_id', key.examId)
        .eq('attempt_id', attemptId).eq('revision', revision).select('attempt_id')
      return { data: data as { attempt_id: string }[] | null, error }
    },
  }
}
function stable(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']'
  if (value && typeof value === 'object') return '{' +
    Object.entries(value).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => JSON.stringify(key) + ':' + stable(item)).join(',') + '}'
  return JSON.stringify(value)
}
export async function fingerprintExamContent(exam: ExamRuntime): Promise<string> {
  // Hash all authored exam material, selections, mark scheme and answer keys;
  // immutable content is never duplicated in the database.
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(stable(exam)))
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('')
}
function validateKey(key: ExamAttemptKey) {
  for (const value of Object.values(key)) if (!value.trim() || value.length > 200) {
    throw new Error('A valid authenticated learner and exact exam are required.')
  }
}
function asRow(key: ExamAttemptKey, attemptId: string, revision: number,
  contentFingerprint: string, snapshot: ExamAttemptSnapshot, expiresAt: string): ExamAttemptRow {
  validateKey(key)
  if (!/^[a-f0-9]{64}$/.test(contentFingerprint)) throw new Error('Invalid exam content fingerprint.')
  if (!/^[0-9a-f-]{36}$/i.test(attemptId)) throw new Error('Invalid attempt identity.')
  if (!Number.isInteger(revision) || revision < 1) throw new Error('Invalid attempt revision.')
  const parsed = snapshotSchema.parse(snapshot)
  const expiry = Date.parse(expiresAt)
  if (!Number.isFinite(expiry)) throw new Error('Exam draft needs a valid retention expiry.')
  if (new TextEncoder().encode(JSON.stringify(parsed)).byteLength > 262144) {
    throw new Error('This exam draft is too large to save safely.')
  }
  return {
    user_id: key.userId, course_id: key.courseId, module_id: key.moduleId, exam_id: key.examId,
    attempt_id: attemptId, revision, content_fingerprint: contentFingerprint,
    snapshot: parsed, expires_at: expiresAt,
  }
}
function decode(row: ExamAttemptRow): ExamAttempt {
  const snapshot = snapshotSchema.parse(row.snapshot)
  return {
    userId: row.user_id, courseId: row.course_id, moduleId: row.module_id, examId: row.exam_id,
    attemptId: row.attempt_id, revision: Number(row.revision),
    contentFingerprint: row.content_fingerprint, snapshot, expiresAt: row.expires_at,
  }
}
async function verifiedRead(store: ExamAttemptStore, key: ExamAttemptKey): Promise<ExamAttempt | null> {
  const { data, error } = await store.read(key)
  if (error) throw new Error('Could not verify your saved exam. Your answers were not assumed saved.')
  return data ? decode(data) : null
}
function exactMatch(found: ExamAttempt, expected: ExamAttemptRow) {
  return found.attemptId === expected.attempt_id &&
    found.revision === expected.revision &&
    found.contentFingerprint === expected.content_fingerprint &&
    found.expiresAt === expected.expires_at &&
    stable(found.snapshot) === stable(expected.snapshot)
}
export async function loadExamAttempt(store: ExamAttemptStore, key: ExamAttemptKey, fingerprint: string): Promise<ExamAttempt | null> {
  validateKey(key)
  const found = await verifiedRead(store, key)
  if (!found) return null
  if (found.contentFingerprint !== fingerprint || Date.parse(found.expiresAt) <= Date.now()) {
    throw new Error('This saved exam cannot safely resume because its content changed or its draft expired. Review and discard the old attempt before starting another.')
  }
  return found
}
export async function createExamAttempt(store: ExamAttemptStore, key: ExamAttemptKey, fingerprint: string,
  attemptId: string, snapshot: ExamAttemptSnapshot, expiresAt: string): Promise<ExamAttempt> {
  const row = asRow(key, attemptId, 1, fingerprint, snapshot, expiresAt)
  const { data, error } = await store.insert(row)
  if (!error && data) return decode(data)
  const found = await verifiedRead(store, key)
  if (found && exactMatch(found, row)) return found
  throw new Error(error?.code === '23505'
    ? 'This paper already has an unfinished attempt. Continue or discard it first.'
    : 'Could not confirm your exam was saved. Please retry.')
}
export async function updateExamAttempt(store: ExamAttemptStore, current: ExamAttempt, next: ExamAttemptSnapshot): Promise<ExamAttempt> {
  const key: ExamAttemptKey = {
    userId: current.userId, courseId: current.courseId, moduleId: current.moduleId, examId: current.examId,
  }
  if (current.snapshot.phase === 'submitted') throw new Error('This exam has already been submitted and cannot be changed.')
  if (['submitting', 'submitted'].includes(current.snapshot.phase) &&
      (next.phase === 'writing' || next.phase === 'marking' ||
       stable(current.snapshot.frozenSubmission) !== stable(next.frozenSubmission))) {
    throw new Error('The submitted answers and marks cannot be changed.')
  }
  const expected = asRow(key, current.attemptId, current.revision + 1, current.contentFingerprint, next, current.expiresAt)
  const { data, error } = await store.compareAndSwap(key, current.attemptId, current.revision, expected)
  if (!error && data) return decode(data)
  const found = await verifiedRead(store, key)
  if (found && exactMatch(found, expected)) return found
  throw new Error('This exam changed elsewhere or its latest save is unconfirmed. Reload the saved attempt before continuing.')
}
export async function discardExamAttempt(store: ExamAttemptStore, key: ExamAttemptKey): Promise<void> {
  validateKey(key)
  const found = await verifiedRead(store, key)
  if (!found) return
  if (found.snapshot.phase === 'submitting' || found.snapshot.phase === 'submitted') {
    throw new Error('An exam being submitted cannot be discarded until saving is resolved.')
  }
  const { data, error } = await store.remove(key, found.attemptId, found.revision)
  if (!error && data?.length === 1) return
  const after = await verifiedRead(store, key)
  if (!after) return
  throw new Error('Could not confirm this unfinished attempt was discarded. Reload before trying again.')
}

/** Timers use persisted UTC anchors: sleep, refresh and lost network time do not invent additional minutes. */
export function examElapsedMs(timing: ExamAttemptSnapshot['timing'], now = Date.now()): number {
  const active = timing.runningSince ? Math.max(0, now - Date.parse(timing.runningSince)) : 0
  if (!Number.isFinite(active)) throw new Error('Invalid saved exam timer.')
  return timing.elapsedMs + active
}
export function examPauseTiming(timing: ExamAttemptSnapshot['timing'], now = Date.now()): ExamAttemptSnapshot['timing'] {
  return { ...timing, elapsedMs: examElapsedMs(timing, now), runningSince: null }
}
export function examResumeTiming(timing: ExamAttemptSnapshot['timing'], now = Date.now()): ExamAttemptSnapshot['timing'] {
  return { ...timing, runningSince: new Date(now).toISOString() }
}
export function initialExamSnapshot(now = Date.now()): ExamAttemptSnapshot {
  return {
    schemaVersion: 1, phase: 'writing', answers: {}, marks: {}, selectedChoices: {}, flagged: {},
    questionIndex: 0, timing: { elapsedMs: 0, runningSince: new Date(now).toISOString(), policy: 'wall-clock' },
    frozenSubmission: null,
  }
}
/** A frozen submission is idempotent across process and browser restarts, never re-generated. */
export async function commitFrozenExamSubmission(
  store: ExamAttemptStore, current: ExamAttempt, frozen: FrozenExamSubmission,
): Promise<ExamAttempt> {
  if (current.snapshot.phase !== 'marking') throw new Error('Marking must finish before committing an exam.')
  return updateExamAttempt(store, current, {
    ...current.snapshot, phase: 'submitting', frozenSubmission: frozen,
  })
}
