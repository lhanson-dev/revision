import { describe, expect, it } from 'vitest'
import type { LearningEvidence } from '../engine/evidence/evidence'
import { recordLearningEvidence, type EvidenceStore } from '../services/progress/learning-evidence-service'
import { listRetainedAqa7132MockExams } from './retained-aqa-business-mock'
import { freezeExamSubmission } from './ExamSimulator'

const moduleId = 'business-aqa-a-level-paper-1'

function submittedPaper() {
  const exam = listRetainedAqa7132MockExams()[0]
  const questions = exam.questions.slice(0, 2)
  const answers = Object.fromEntries(questions.map((item) => [item.id, item.correctOptionLabel ?? 'A student answer']))
  let next = 0
  return freezeExamSubmission({
    exam, moduleId, questions, answers, marks: {},
    totalAwarded: 0,
    ao: { ao1: { awarded: 0, available: 0 }, ao2: { awarded: 0, available: 0 }, ao3: { awarded: 0, available: 0 }, ao4: { awarded: 0, available: 0 } },
    durationMinutes: 20,
    occurredAt: '2026-10-21T20:00:00.000Z',
    makeId: (prefix) => `${prefix}-retry-fixture-${++next}`,
  })
}

function ownedEvidenceStore() {
  const saved = new Map<string, LearningEvidence>()
  const store: EvidenceStore = {
    async insert(record) {
      if (saved.has(record.evidence_id)) return { error: { code: '23505', message: 'duplicate key' } }
      saved.set(record.evidence_id, record.payload)
      return { error: null }
    },
    async find(userId, evidenceId) {
      if (userId !== 'student-1') return { data: null, error: { message: 'Not your evidence' } }
      const payload = saved.get(evidenceId)
      return { data: payload ? { payload } : null, error: null }
    },
    async list() { return { data: [...saved.values()].map((payload) => ({ payload })), error: null } },
  }
  return { saved, store }
}

describe('R2 whole-paper partial-save retry', () => {
  it('freezes one paper and its per-question evidence together, without storing raw answers', () => {
    const submission = submittedPaper()
    expect(submission.evidence).toHaveLength(3)
    expect(submission.evidence.at(-1)).toMatchObject({
      source: 'exam_attempt', contentId: listRetainedAqa7132MockExams()[0].id,
      occurredAt: '2026-10-21T20:00:00.000Z',
    })
    expect(submission.evidence.map((item) => item.id)).toEqual([
      'exam-question-retry-fixture-1', 'exam-question-retry-fixture-2', 'exam-attempt-retry-fixture-3',
    ])
    const payload = JSON.stringify(submission)
    expect(payload).not.toContain('A student answer')
    expect(payload).not.toContain('Your answer')
  })

  it('replays verified identical learner evidence after a partial successful save', async () => {
    const submission = submittedPaper()
    const { store, saved } = ownedEvidenceStore()
    const firstFact = submission.evidence[0]
    const original = structuredClone(submission.evidence)
    await recordLearningEvidence(store, 'student-1', firstFact)
    // The first request committed; the second request fails before the browser receives success.
    for (const fact of submission.evidence) await recordLearningEvidence(store, 'student-1', fact)
    for (const fact of submission.evidence) await recordLearningEvidence(store, 'student-1', fact)
    expect(saved.size).toBe(submission.evidence.length)
    expect(submission.evidence).toEqual(original)
    expect([...saved.values()]).toEqual(original)
  })

  it('rejects a stale/conflicting payload rather than treating an ID collision as success', async () => {
    const submission = submittedPaper()
    const { store } = ownedEvidenceStore()
    const first = submission.evidence[0]
    await recordLearningEvidence(store, 'student-1', first)
    const altered = { ...first, occurredAt: '2026-10-22T00:00:00.000Z' }
    await expect(recordLearningEvidence(store, 'student-1', altered)).rejects.toThrow('Could not verify saved learning evidence')
  })

  it('will not manufacture an evidence batch for a blank paper', () => {
    const exam = listRetainedAqa7132MockExams()[0]
    expect(() => freezeExamSubmission({
      exam, moduleId, questions: exam.questions.slice(0, 1), answers: {}, marks: {},
      totalAwarded: 0, ao: { ao1: { awarded: 0, available: 0 }, ao2: { awarded: 0, available: 0 }, ao3: { awarded: 0, available: 0 }, ao4: { awarded: 0, available: 0 } },
      durationMinutes: 10, occurredAt: '2026-10-21T20:00:00.000Z',
    })).toThrow('empty paper')
  })
})
