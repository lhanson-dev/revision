import { describe, expect, it, vi } from 'vitest'
import { createMultipleChoiceEvidence } from '../../app/practice-evidence'
import { recordSessionAnswer, startQuestionSession } from '../../app/practice-session'
import {
  createPracticeCheckpoint, discardPracticeCheckpoint, fingerprintPracticeContent,
  loadPracticeCheckpoint, removePracticeCheckpoint, updatePracticeCheckpoint,
  type PracticeCheckpointKey, type PracticeCheckpointRow, type PracticeCheckpointStore, type PracticeCheckpointSnapshot,
} from './practice-checkpoint-service'

const key: PracticeCheckpointKey = {
  userId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  courseId: 'aqa:aqa-a-level:7132', moduleId: 'business-aqa-7132-paper-1', topicId: 'marketing',
}
const fingerprint = 'a'.repeat(64)
const q = (id: string) => ({ id, level: 'Recall' as const, type: 'multiple-choice' as const })
const questions = [q('q1'), q('q2'), q('q3')]
const session = startQuestionSession(questions, 3)
const pendingEvidence = createMultipleChoiceEvidence({
  id: 'mcq-stable-intent', moduleId: key.moduleId, topicId: key.topicId,
  contentId: 'q1', selectedOption: 1, correctOption: 1,
  confidence: 'fairly', occurredAt: '2026-10-21T22:10:00.000Z',
})
const nextSession = recordSessionAnswer(session, {
  questionId: 'q1', correct: true, level: 'Recall', confidence: 'fairly', selectedOption: 1,
})
const snapshot: PracticeCheckpointSnapshot = { schemaVersion: 1, session, pending: null }
const pending: PracticeCheckpointSnapshot = {
  schemaVersion: 1, session,
  pending: { evidence: pendingEvidence, nextSession },
}

function memoryStore() {
  let record: PracticeCheckpointRow | null = null
  const insert = vi.fn(async (row: PracticeCheckpointRow) => {
    if (record) return { data: null, error: { code: '23505', message: 'duplicate' } }
    record = structuredClone(row)
    return { data: structuredClone(record), error: null }
  })
  const store: PracticeCheckpointStore = {
    async read(provided) {
      if (provided.userId !== key.userId) return { data: null, error: null }
      return { data: record ? structuredClone(record) : null, error: null }
    },
    insert,
    async compareAndSwap(provided, id, revision, desired) {
      if (provided.userId !== key.userId || record?.session_id !== id || record?.revision !== revision) {
        return { data: null, error: null }
      }
      record = structuredClone(desired)
      return { data: structuredClone(record), error: null }
    },
    async remove(provided, id, revision) {
      if (provided.userId !== key.userId || record?.session_id !== id || record?.revision !== revision) return { data: [], error: null }
      record = null
      return { data: [{ session_id: id }], error: null }
    },
  }
  return { store, insert, current: () => record, alter: (update: PracticeCheckpointRow | null) => { record = update } }
}

describe('R2 owner-scoped Practice checkpoint', () => {
  it('creates, loads and discards a session without any scored learning evidence', async () => {
    const memory = memoryStore()
    const created = await createPracticeCheckpoint(memory.store, key, fingerprint, crypto.randomUUID(), snapshot)
    expect(created.revision).toBe(1)
    expect(created.snapshot.pending).toBeNull()
    expect((await loadPracticeCheckpoint(memory.store, key, fingerprint))?.sessionId).toBe(created.sessionId)
    await removePracticeCheckpoint(memory.store, created)
    expect(await loadPracticeCheckpoint(memory.store, key, fingerprint)).toBeNull()
  })

  it('confirms only an identical owner-readable response after an ambiguous insert', async () => {
    const memory = memoryStore()
    const id = crypto.randomUUID()
    const saved = await createPracticeCheckpoint(memory.store, key, fingerprint, id, snapshot)
    const retry = await createPracticeCheckpoint(memory.store, key, fingerprint, id, snapshot)
    expect(retry).toEqual(saved)
    await expect(createPracticeCheckpoint(memory.store, key, fingerprint, crypto.randomUUID(), snapshot))
      .rejects.toThrow('already have a Practice session')
  })

  it('serialises a pending answer before scoring, then advances exactly one revision', async () => {
    const memory = memoryStore()
    const saved = await createPracticeCheckpoint(memory.store, key, fingerprint, crypto.randomUUID(), snapshot)
    const staged = await updatePracticeCheckpoint(memory.store, saved, pending)
    expect(staged.revision).toBe(2)
    expect(staged.snapshot.session.answers).toHaveLength(0)
    expect(staged.snapshot.pending?.evidence.id).toBe('mcq-stable-intent')
    const reloaded = await loadPracticeCheckpoint(memory.store, key, fingerprint)
    expect(reloaded?.snapshot.pending).toEqual(pending.pending)
    const committed = await updatePracticeCheckpoint(memory.store, staged, { schemaVersion: 1, session: nextSession, pending: null })
    expect(committed.revision).toBe(3)
    expect(committed.snapshot.session.answers).toHaveLength(1)
  })

  it('never treats a stale competing tab as a successful checkpoint write', async () => {
    const memory = memoryStore()
    const original = await createPracticeCheckpoint(memory.store, key, fingerprint, crypto.randomUUID(), snapshot)
    await updatePracticeCheckpoint(memory.store, original, pending)
    // Replaying the same facts is an allowed ambiguous acknowledgement. A stale
    // tab submitting different evidence for the same revision must be refused.
    const conflicting = {
      ...pending,
      pending: { ...pending.pending!, evidence: { ...pendingEvidence, id: 'a-different-attempt-id' } },
    }
    await expect(updatePracticeCheckpoint(memory.store, original, conflicting)).rejects.toThrow('another tab')
    await expect(removePracticeCheckpoint(memory.store, original)).rejects.toThrow('changed')
  })

  it('allows safe replay only when committed ambiguous update has exactly the expected facts', async () => {
    const memory = memoryStore()
    const original = await createPracticeCheckpoint(memory.store, key, fingerprint, crypto.randomUUID(), snapshot)
    const updated = await updatePracticeCheckpoint(memory.store, original, pending)
    const repeat = await updatePracticeCheckpoint(memory.store, original, pending)
    expect(repeat).toEqual(updated)
    expect(memory.current()?.revision).toBe(2)
  })

  it('refuses changed answers, pending evidence belonging to another topic, and unsupported raw written evidence', async () => {
    const memory = memoryStore()
    const original = await createPracticeCheckpoint(memory.store, key, fingerprint, crypto.randomUUID(), snapshot)
    const otherTopic = { ...pending, pending: {
      ...pending.pending!, evidence: { ...pendingEvidence, topicId: 'finance' },
    } }
    await expect(updatePracticeCheckpoint(memory.store, original, otherTopic)).rejects.toThrow('does not match')
    const wrongQuestion = { ...pending, pending: {
      ...pending.pending!, evidence: { ...pendingEvidence, contentId: 'q3' },
    } }
    await expect(updatePracticeCheckpoint(memory.store, original, wrongQuestion)).rejects.toThrow('does not match')
  })

  it('does not restore expired or re-authored content; explicit discard leaves evidence untouched', async () => {
    const memory = memoryStore()
    await createPracticeCheckpoint(memory.store, key, fingerprint, crypto.randomUUID(), snapshot)
    await expect(loadPracticeCheckpoint(memory.store, key, 'b'.repeat(64))).rejects.toThrow('content changed')
    await discardPracticeCheckpoint(memory.store, key)
    expect(memory.current()).toBeNull()
  })

  it('changes fingerprint when an authored answer key changes, independent of freshness ordering', async () => {
    const a = [{ id: 'q2', correctOption: 0 }, { id: 'q1', correctOption: 1 }]
    const b = [{ id: 'q1', correctOption: 1 }, { id: 'q2', correctOption: 0 }]
    expect(await fingerprintPracticeContent(a)).toBe(await fingerprintPracticeContent(b))
    expect(await fingerprintPracticeContent(a)).not.toBe(await fingerprintPracticeContent([{ id: 'q2', correctOption: 2 }, a[1]]))
  })
})
