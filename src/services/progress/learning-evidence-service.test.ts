import { describe, expect, it } from 'vitest'
import type { LearningEvidence } from '../../engine/evidence/evidence'
import {
  loadLearningEvidence,
  recordLearningEvidence,
  type EvidenceStore,
} from './learning-evidence-service'

const evidence: LearningEvidence = {
  id: 'ev-1',
  moduleId: 'business-aqa-as-paper-2',
  topicId: 'finance',
  source: 'multiple_choice',
  occurredAt: '2026-08-17T16:30:00.000Z',
  contentId: 'q-1',
  schemaVersion: 1,
  correct: true,
  selectedOption: 1,
  correctOption: 1,
}

function store(overrides: Partial<EvidenceStore> = {}): EvidenceStore {
  return {
    insert: async () => ({ error: null }),
    list: async () => ({ data: [{ payload: evidence }], error: null }),
    ...overrides,
  }
}

describe('learning evidence service', () => {
  it('records validated learner evidence', async () => {
    let recordedUser = ''
    let recordedModule = ''
    const result = await recordLearningEvidence(store({
      insert: async (record) => {
        recordedUser = record.user_id
        recordedModule = record.module_id
        return { error: null }
      },
    }), 'user-1', evidence)

    expect(result).toEqual(evidence)
    expect(recordedUser).toBe('user-1')
    expect(recordedModule).toBe('business-aqa-as-paper-2')
  })

  it('treats duplicate evidence IDs as safe idempotent retries', async () => {
    const result = await recordLearningEvidence(store({
      insert: async () => ({ error: { code: '23505', message: 'duplicate key' } }),
    }), 'user-1', evidence)

    expect(result.id).toBe('ev-1')
  })

  it('does not hide genuine save failures', async () => {
    await expect(recordLearningEvidence(store({
      insert: async () => ({ error: { code: '42501', message: 'permission denied' } }),
    }), 'user-1', evidence)).rejects.toThrow('Could not save learning evidence')
  })

  it('validates evidence again when loading persisted rows', async () => {
    const result = await loadLearningEvidence(store(), 'user-1', evidence.moduleId)
    expect(result).toEqual([evidence])
  })

  it('rejects corrupt persisted payloads instead of feeding them into readiness', async () => {
    await expect(loadLearningEvidence(store({
      list: async () => ({ data: [{ payload: { ...evidence, source: 'unknown' } }], error: null }),
    }), 'user-1', evidence.moduleId)).rejects.toThrow()
  })
})
