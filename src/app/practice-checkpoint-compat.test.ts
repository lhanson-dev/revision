import { describe, expect, it } from 'vitest'
import paper1 from '../../content/psychology/aqa-a-level/paper-1'
import { coursePackQuestionToPractice } from './practice-questions'
import { createMultipleChoiceEvidence } from './practice-evidence'
import { legacySocialInfluencePool, legacyMemoryPool, legacyAttachmentPool, legacyPsychologyCheckpointPool, loadLf03CompatibleCheckpoint } from './practice-checkpoint-compat'
import { startQuestionSession, recordSessionAnswer } from './practice-session'
import {
  createPracticeCheckpoint, fingerprintPracticeContent, type PracticeCheckpointKey,
  type PracticeCheckpointRow, type PracticeCheckpointStore,
} from '../services/progress/practice-checkpoint-service'

const key: PracticeCheckpointKey = {
  userId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  courseId: 'aqa:aqa-a-level:7182', moduleId: paper1.manifest.id, topicId: 'social-influence',
}
const current = paper1.questions.filter(q => q.topic === 'social-influence').map(coursePackQuestionToPractice)
const previous = legacySocialInfluencePool('7182', 'social-influence', current)

function memoryStore(): PracticeCheckpointStore {
  let saved: PracticeCheckpointRow | null = null
  return {
    async read() { return { data: saved, error: null } },
    async insert(record) { saved = record; return { data: record, error: null } },
    async compareAndSwap() { return { data: null, error: { message: 'not needed' } } },
    async remove() { return { data: [], error: null } },
  }
}

describe('LF-03 previous Psychology Practice session preservation', () => {
  it('does not offer legacy questions in a fresh activity or a different topic', () => {
    expect(previous).not.toBeNull()
    expect(current.map(q => q.id)).toEqual([
      'psy-psy0101-check-v2', 'psy-psy0102-check-v2', 'psy-psy0103-check-v2', 'psy-psy0104-check-v2',
    ])
    expect(previous!.map(q => q.id)).toEqual([
      'psy-psy0101-check', 'psy-psy0102-check', 'psy-psy0103-check', 'psy-psy0104-check',
    ])
    expect(legacySocialInfluencePool('7132', 'social-influence', current)).toBeNull()
    expect(legacySocialInfluencePool('7182', 'memory', current)).toBeNull()
  })

  it('recognises only an exact old full-pool fingerprint and retains historical selected/keyed evidence', async () => {
    const store = memoryStore()
    const original = startQuestionSession(previous!, 4)
    const saved = await createPracticeCheckpoint(store, key, await fingerprintPracticeContent(previous!), crypto.randomUUID(), {
      schemaVersion: 1, session: original, pending: null,
    })
    expect(saved.snapshot.session.currentId).toBe('psy-psy0101-check')
    const loaded = await loadLf03CompatibleCheckpoint(store, key, current, previous)
    expect(loaded.legacy).toBe(true)
    expect(loaded.checkpoint?.snapshot.session).toEqual(original)
    const oldQuestion = previous![0]!
    if (oldQuestion.type !== 'multiple-choice') throw new Error('must be multiple choice')
    const historical = createMultipleChoiceEvidence({
      id: 'historical-social-influence', moduleId: key.moduleId,
      topicId: key.topicId, contentId: oldQuestion.id,
      selectedOption: 3, correctOption: oldQuestion.correctOption, confidence: 'certain',
    })
    expect(historical).toMatchObject({ source: 'multiple_choice', correct: true, contentId: 'psy-psy0101-check', selectedOption: 3, correctOption: 3 })
    const next = recordSessionAnswer(original, {
      questionId: oldQuestion.id, correct: true, level: oldQuestion.level,
      selectedOption: 3, confidence: 'certain',
    })
    expect(next.answers[0]).toMatchObject({ questionId: 'psy-psy0101-check', selectedOption: 3, correct: true })
    expect(current[0]!.id).not.toBe(historical.contentId)
  })

  it('rejects unknown fingerprints rather than remapping older answers into new keys', async () => {
    const store = memoryStore()
    await createPracticeCheckpoint(store, key, 'a'.repeat(64), crypto.randomUUID(), {
      schemaVersion: 1, session: startQuestionSession(previous!, 4), pending: null,
    })
    await expect(loadLf03CompatibleCheckpoint(store, key, current, previous)).rejects.toThrow(/content changed/)
  })
})

describe('LF-03 #787 exact previous Memory sessions, not silently rekeyed', () => {
  const memoryKey = { ...key, topicId: 'memory' }
  const published = paper1.questions.filter(q => q.topic === 'memory').map(coursePackQuestionToPractice)
  const legacy = legacyMemoryPool('7182', 'memory', published)
  const ids = [1, 2, 3, 4].map(i => `psy-psy020${i}-check`)

  it('offers only the new V2 questions in new sessions while preserving exact previous V1 keys for recovery', () => {
    expect(published.map(q => q.id)).toEqual(ids.map(id => id + '-v2'))
    expect(legacy?.map(q => q.id)).toEqual(ids)
    expect(legacy?.map(q => q.type === 'multiple-choice' ? q.correctOption : null)).toEqual([0, 1, 1, 2])
    expect(legacyPsychologyCheckpointPool('7182', 'memory', published)).toEqual(legacy)
    expect(legacyPsychologyCheckpointPool('7132', 'memory', published)).toBeNull()
    expect(legacyPsychologyCheckpointPool('7182', 'social-influence', published)).toBeNull()
    expect(legacyMemoryPool('7182', 'memory', published.slice(1))).toBeNull()
  })

  it('recovers an exact old owner-scoped checkpoint and its already scored answer without duplicate new evidence', async () => {
    const store = memoryStore()
    const oldSession = recordSessionAnswer(startQuestionSession(legacy!, 4), {
      questionId: ids[0]!, correct: true, level: legacy![0]!.level,
      selectedOption: 0, confidence: 'certain',
    })
    await createPracticeCheckpoint(store, memoryKey, await fingerprintPracticeContent(legacy!), crypto.randomUUID(), {
      schemaVersion: 1, session: oldSession, pending: null,
    })
    const restored = await loadLf03CompatibleCheckpoint(store, memoryKey, published, legacy)
    expect(restored.legacy).toBe(true)
    expect(restored.checkpoint?.snapshot.session).toEqual(oldSession)
    const original = createMultipleChoiceEvidence({
      id: 'memory-v1-historical', moduleId: memoryKey.moduleId, topicId: 'memory',
      contentId: ids[0]!, selectedOption: 0, correctOption: 0, confidence: 'certain',
    })
    expect(original).toMatchObject({ source: 'multiple_choice', correct: true, contentId: ids[0], selectedOption: 0, correctOption: 0 })
    expect(published[0]!.id).not.toBe(original.contentId)
  })

  it('fails closed for unrelated content drift and cannot remap a stored answer to a new key', async () => {
    const store = memoryStore()
    await createPracticeCheckpoint(store, memoryKey, 'b'.repeat(64), crypto.randomUUID(), {
      schemaVersion: 1, session: startQuestionSession(legacy!, 4), pending: null,
    })
    await expect(loadLf03CompatibleCheckpoint(store, memoryKey, published, legacy)).rejects.toThrow(/content changed/)
  })
})

// #787: two changed Attachment questions must not strand the previous five-item session.
describe('LF-03 #787 original Attachment checkpoint compatibility', () => {
  const attachmentKey = { ...key, topicId: 'attachment' }
  const published = paper1.questions.filter(q => q.topic === 'attachment').map(coursePackQuestionToPractice)
  const legacy = legacyAttachmentPool('7182', 'attachment', published)

  it('publishes two new keys while reconstructing the complete previous five-item content', () => {
    expect(published).toHaveLength(5)
    expect(published.map(x => x.id)).toEqual([
      'psy-psy0301-check', 'psy-psy0302-check', 'psy-psy0303-check',
      'psy-psy0304-check-v2', 'psy-psy0305-check-v2',
    ])
    expect(legacy?.map(x => x.id)).toEqual([
      'psy-psy0301-check', 'psy-psy0302-check', 'psy-psy0303-check',
      'psy-psy0304-check', 'psy-psy0305-check',
    ])
    expect(legacyPsychologyCheckpointPool('7182', 'attachment', published)).toEqual(legacy)
    expect(legacyAttachmentPool('7132', 'attachment', published)).toBeNull()
    expect(legacyAttachmentPool('7182', 'memory', published)).toBeNull()
    expect(legacyAttachmentPool('7182', 'attachment', published.slice(0, 3))).toBeNull()
  })

  it('recovers the immutable old session only for its full exact fingerprint', async () => {
    const store = memoryStore()
    const prior = recordSessionAnswer(startQuestionSession(legacy!, 5), {
      questionId: legacy![0]!.id, correct: true, level: legacy![0]!.level,
      selectedOption: 0, confidence: 'certain',
    })
    await createPracticeCheckpoint(store, attachmentKey, await fingerprintPracticeContent(legacy!), crypto.randomUUID(), {
      schemaVersion: 1, session: prior, pending: null,
    })
    const restored = await loadLf03CompatibleCheckpoint(store, attachmentKey, published, legacy)
    expect(restored.legacy).toBe(true)
    expect(restored.checkpoint?.snapshot.session).toEqual(prior)
    const store2 = memoryStore()
    await createPracticeCheckpoint(store2, attachmentKey, 'c'.repeat(64), crypto.randomUUID(), {
      schemaVersion: 1, session: prior, pending: null,
    })
    await expect(loadLf03CompatibleCheckpoint(store2, attachmentKey, published, legacy)).rejects.toThrow(/content changed/)
  })
})
