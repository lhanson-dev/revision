import { describe, expect, it, vi } from 'vitest'
import {
  loadStartingCheckEvidence,
  recordStartingCheckEvidence,
  type StartingCheckEvidenceStore,
} from './starting-check-evidence-service'

const example = {
  id: 'starting-check-q1',
  moduleId: 'aqa-a-level-business-paper-2',
  topicId: 'business-objectives-and-strategy',
  occurredAt: '2026-08-24T19:30:00.000Z',
  questionId: 'business-objectives-q1',
  selectedOption: 1,
  correctOption: 0,
  correct: false,
  schemaVersion: 1 as const,
}

describe('starting-check evidence service', () => {
  it('persists explicit directional evidence provenance without using learning_evidence', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null })
    const store: StartingCheckEvidenceStore = {
      insert,
      list: vi.fn(),
    }

    await expect(recordStartingCheckEvidence(store, 'user-1', example)).resolves.toEqual(example)
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'user-1',
      evidence_id: example.id,
      question_id: example.questionId,
      payload: example,
    }))
  })

  it('treats an evidence-id collision as an idempotent retry', async () => {
    const store: StartingCheckEvidenceStore = {
      insert: vi.fn().mockResolvedValue({ error: { code: '23505', message: 'duplicate' } }),
      list: vi.fn(),
    }

    await expect(recordStartingCheckEvidence(store, 'user-1', example)).resolves.toEqual(example)
  })

  it('loads and validates persisted directional observations in occurrence order', async () => {
    const store: StartingCheckEvidenceStore = {
      insert: vi.fn(),
      list: vi.fn().mockResolvedValue({ data: [{ payload: example }], error: null }),
    }

    await expect(loadStartingCheckEvidence(store, 'user-1', example.moduleId)).resolves.toEqual([example])
  })
})
