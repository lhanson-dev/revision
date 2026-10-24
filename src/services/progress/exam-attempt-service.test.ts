import { describe, expect, it } from 'vitest'
import {
  commitFrozenExamSubmission, createExamAttempt, discardExamAttempt, examElapsedMs,
  examPauseTiming, examResumeTiming, examHeartbeatTiming, examInterruptTiming,
  finaliseExamSnapshot, initialExamSnapshot, loadExamAttempt, updateExamAttempt,
  fingerprintExamContent, type ExamAttemptKey, type ExamAttemptRow, type ExamAttemptStore,
} from './exam-attempt-service'
import { listRetainedAqa7132MockExams } from '../../app/retained-aqa-business-mock'
import { freezeExamSubmission } from '../../app/ExamSimulator'

const key: ExamAttemptKey = {
  userId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  courseId: 'aqa:aqa-a-level:7132', moduleId: 'business-aqa-a-level-paper-1', examId: 'mock-1',
}
const hash = 'a'.repeat(64)
const attemptId = '11111111-1111-4111-8111-111111111111'
const expiry = new Date(Date.now() + 14 * 86400000).toISOString()
const starting = initialExamSnapshot(Date.parse('2026-10-22T13:00:00Z'))

function memoryStore() {
  let record: ExamAttemptRow | null = null
  let responseAfterCommit: 'none' | 'insert' | 'update' = 'none'
  const store: ExamAttemptStore = {
    async read(provided) {
      if (provided.userId !== key.userId || provided.courseId !== key.courseId ||
          provided.moduleId !== key.moduleId || provided.examId !== key.examId) return { data: null, error: null }
      return { data: record ? structuredClone(record) : null, error: null }
    },
    async insert(row) {
      if (record) return { data: null, error: { code: '23505', message: 'duplicate' } }
      record = structuredClone(row)
      if (responseAfterCommit === 'insert') return { data: null, error: { message: 'acknowledgement lost' } }
      return { data: structuredClone(record), error: null }
    },
    async compareAndSwap(provided, id, revision, next) {
      if (provided.userId !== key.userId || provided.examId !== key.examId ||
          record?.attempt_id !== id || record?.revision !== revision) return { data: null, error: null }
      record = structuredClone(next)
      if (responseAfterCommit === 'update') return { data: null, error: { message: 'acknowledgement lost' } }
      return { data: structuredClone(record), error: null }
    },
    async remove(provided, id, revision) {
      if (provided.userId !== key.userId || record?.attempt_id !== id || record?.revision !== revision) return { data: [], error: null }
      record = null
      return { data: [{ attempt_id: id }], error: null }
    },
  }
  return { store, alter: (value: ExamAttemptRow | null) => { record = value },
    row: () => record, loseAck: (value: typeof responseAfterCommit) => { responseAfterCommit = value } }
}
function frozen() {
  const exam = listRetainedAqa7132MockExams()[0]
  const question = exam.questions[0]
  return freezeExamSubmission({
    exam, moduleId: key.moduleId, questions: [question],
    answers: { [question.id]: question.correctOptionLabel ?? 'Written answer' }, marks: {},
    totalAwarded: 0, ao: {
      ao1: { awarded: 0, available: 0 }, ao2: { awarded: 0, available: 0 },
      ao3: { awarded: 0, available: 0 }, ao4: { awarded: 0, available: 0 },
    },
    durationMinutes: 10, occurredAt: '2026-10-22T13:10:00.000Z',
    makeId: prefix => prefix + '-stable-001',
  })
}
describe('REC-10 draft persistence contract', () => {
  it('saves and reloads exactly scoped unfinished written work without making learning evidence', async () => {
    const memory = memoryStore()
    const first = await createExamAttempt(memory.store, key, hash, attemptId, starting, expiry)
    const next = await updateExamAttempt(memory.store, first, {
      ...first.snapshot, answers: { q1: 'An original written paragraph' },
      selectedChoices: { 'section-a': 'essay-a' }, flagged: { q1: true }, questionIndex: 3,
    })
    const saved = await loadExamAttempt(memory.store, key, hash)
    expect(saved?.snapshot).toEqual(next.snapshot)
    expect(saved?.snapshot.answers.q1).toContain('written')
    expect(saved?.snapshot.frozenSubmission).toBeNull()
    expect(await loadExamAttempt(memory.store, { ...key, courseId: 'different-course' }, hash)).toBeNull()
    expect(await loadExamAttempt(memory.store, { ...key, userId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' }, hash)).toBeNull()
  })

  it('accepts only identical owner-confirmed insert and update after lost acknowledgements', async () => {
    const memory = memoryStore()
    memory.loseAck('insert')
    const saved = await createExamAttempt(memory.store, key, hash, attemptId, starting, expiry)
    expect(saved.revision).toBe(1)
    memory.loseAck('update')
    const target = { ...starting, answers: { q1: 'A' } }
    const revised = await updateExamAttempt(memory.store, saved, target)
    expect(revised.revision).toBe(2)
    expect((await updateExamAttempt(memory.store, saved, target)).revision).toBe(2)
    await expect(updateExamAttempt(memory.store, saved, { ...target, questionIndex: 2 })).rejects.toThrow('changed elsewhere')
  })

  it('refuses failed pre-commit writes, stale tabs, and mismatched content', async () => {
    const memory = memoryStore()
    const saved = await createExamAttempt(memory.store, key, hash, attemptId, starting, expiry)
    await updateExamAttempt(memory.store, saved, { ...starting, answers: { q1: 'newer' } })
    await expect(updateExamAttempt(memory.store, saved, { ...starting, answers: { q1: 'stale' } })).rejects.toThrow('changed elsewhere')
    await expect(loadExamAttempt(memory.store, key, 'b'.repeat(64))).rejects.toThrow('content changed')
    const tampered = memory.row()!
    memory.alter({ ...tampered, expires_at: '2026-10-01T00:00:00Z' })
    await expect(loadExamAttempt(memory.store, key, hash)).rejects.toThrow('expired')
  })

  it('refuses malformed or oversize drafts before database submission', async () => {
    const memory = memoryStore()
    await expect(createExamAttempt(memory.store, key, hash, attemptId,
      { ...starting, answers: { q1: 'x'.repeat(30001) } }, expiry)).rejects.toThrow()
    await expect(createExamAttempt(memory.store, key, hash, attemptId,
      { ...starting, phase: 'submitting' }, expiry)).rejects.toThrow('Submission must be durably frozen')
  })

  it('freezes exact evidence before any scored writes and prevents changing marks on retry', async () => {
    const memory = memoryStore()
    let saved = await createExamAttempt(memory.store, key, hash, attemptId, starting, expiry)
    saved = await updateExamAttempt(memory.store, saved, {
      ...saved.snapshot, phase: 'marking', timing: examPauseTiming(saved.snapshot.timing, Date.parse('2026-10-22T13:10:00Z')),
    })
    const batch = frozen()
    const submitting = await commitFrozenExamSubmission(memory.store, saved, batch)
    expect(submitting.snapshot.frozenSubmission).toEqual(batch)
    await expect(updateExamAttempt(memory.store, submitting, { ...submitting.snapshot, phase: 'marking' }))
      .rejects.toThrow('cannot be changed')
    await expect(updateExamAttempt(memory.store, submitting, {
      ...submitting.snapshot, frozenSubmission: { ...batch, evidence: [] },
    })).rejects.toThrow('cannot be changed')
    const completed = await updateExamAttempt(memory.store, submitting, finaliseExamSnapshot(submitting.snapshot))
    expect(completed.snapshot.answers).toEqual({})
    expect(completed.snapshot.frozenSubmission).toEqual(batch)
    await expect(updateExamAttempt(memory.store, completed, completed.snapshot)).rejects.toThrow('already been submitted')
    await expect(discardExamAttempt(memory.store, key)).rejects.toThrow('cannot be discarded')
  })

  it('supports explicit draft discard without touching evidence', async () => {
    const memory = memoryStore()
    await createExamAttempt(memory.store, key, hash, attemptId, starting, expiry)
    await discardExamAttempt(memory.store, key)
    expect(await loadExamAttempt(memory.store, key, hash)).toBeNull()
  })

  it('credits only confirmed activity and stops after a browser sleep or refresh', () => {
    const start = Date.parse('2026-10-22T10:00:00Z')
    const timing = initialExamSnapshot(start).timing
    expect(examElapsedMs(timing, start + 90_000)).toBe(15_000)
    const confirmed = examHeartbeatTiming(timing, start + 5_000)
    expect(confirmed.elapsedMs).toBe(5_000)
    const slept = examHeartbeatTiming(confirmed, start + 120_000)
    expect(slept.runningSince).toBeNull()
    expect(slept.interrupted).toBe(true)
    expect(slept.elapsedMs).toBe(5_000)
    const reopened = examInterruptTiming(confirmed)
    expect(reopened.elapsedMs).toBe(5_000)
    expect(reopened.interrupted).toBe(true)
    const resumed = examResumeTiming(reopened, start + 200_000)
    const paused = examPauseTiming(resumed, start + 205_000)
    expect(paused.elapsedMs).toBe(10_000)
    expect(examElapsedMs(paused, start + 48 * 3600_000)).toBe(10_000)
  })

  it('accumulates 81 minutes of confirmed work and stops counting after an interruption', () => {
    const initial = Date.parse('2026-10-22T10:00:00Z')
    let timing = initialExamSnapshot(initial).timing
    for (let tick = 1; tick <= 81 * 12; tick++) {
      timing = examHeartbeatTiming(timing, initial + tick * 5000)
    }
    expect(timing.elapsedMs).toBe(81 * 60 * 1000)
    expect(timing.runningSince).not.toBeNull()
    expect(timing.interrupted).toBe(false)
    const interrupted = examHeartbeatTiming(timing, initial + 83 * 60 * 1000)
    expect(interrupted.runningSince).toBeNull()
    expect(interrupted.elapsedMs).toBe(81 * 60 * 1000)
    expect(interrupted.interrupted).toBe(true)
  })

  it('detects re-authored assessment content without relying on question IDs alone', async () => {
    const exam = listRetainedAqa7132MockExams()[0]
    const fp = await fingerprintExamContent(exam)
    const changed = { ...exam, questions: exam.questions.map((q, i) => i ? q : { ...q, prompt: q.prompt + ' changed' }) }
    expect(await fingerprintExamContent(changed)).not.toBe(fp)
  })
})
