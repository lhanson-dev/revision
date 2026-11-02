import { describe, expect, it } from 'vitest'
import paper1 from '../../content/psychology/aqa-a-level/paper-1'
import { coursePackQuestionToPractice } from './practice-questions'
import { createMultipleChoiceEvidence } from './practice-evidence'
import { legacySocialInfluencePool, loadLf03CompatibleCheckpoint } from './practice-checkpoint-compat'
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
