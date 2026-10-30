import { describe, expect, it } from 'vitest'
import paper1 from '../../content/business/aqa-a-level/paper-1'
import paper2 from '../../content/business/aqa-a-level/paper-2'
import paper3 from '../../content/business/aqa-a-level/paper-3'
import { individualSpecItemObservation, learningEvidenceSchema } from '../engine/evidence/evidence'
import { recordLearningEvidence, loadLearningEvidence, type EvidenceStore } from '../services/progress/learning-evidence-service'
import { createCalculationEvidence } from './practice-evidence'
import { buildQuestionPool, objectiveItemMappingForPractice, type CalculationPracticeQuestion } from './practice-questions'

const paperPacks = [paper1, paper2, paper3]
const at = '2026-10-30T19:00:00.000Z'
const cases = [
  ['rev7132-3.2.2-expected-value-01', 'aqa-7132-3.2.2:expected-value'],
  ['rev7132-3.2.2-expected-value-02', 'aqa-7132-3.2.2:expected-value'],
  ['rev7132-3.2.2-net-gain-01', 'aqa-7132-3.2.2:net-gain'],
  ['rev7132-3.2.2-net-gain-02', 'aqa-7132-3.2.2:net-gain'],
] as const

function earned(question: CalculationPracticeQuestion, correct: boolean, id: string) {
  return createCalculationEvidence({
    id, moduleId: paper1.manifest.id, topicId: 'leadership', contentId: question.id,
    correct, enteredValue: correct ? question.expected : question.expected + 1000,
    expectedValue: question.expected, unit: question.unit, confidence: correct ? 'guess' : 'certain',
    occurredAt: at, itemMapping: objectiveItemMappingForPractice(question),
  })
}

describe('IA-03 B1b: typed final-answer calculations carry bounded exact-skill observations', () => {
  it('maps four independently scored, source-tagged calculations in every real published AQA Business pack', () => {
    for (const pack of paperPacks) {
      const pool = buildQuestionPool({
        topicId: 'leadership', topicOrder: 2, coursePack: pack.questions,
        bank: pack.practiceBank, includeWritten: false,
      })
      for (const [id, specItemId] of cases) {
        const question = pool.find(item => item.id === id)
        expect(question?.type, id).toBe('calculation')
        if (!question || question.type !== 'calculation') continue
        const itemMapping = objectiveItemMappingForPractice(question)
        expect(itemMapping).toEqual({
          mappingVersion: 1, source: 'structured-practice-bank',
          targetSpecItemIds: [specItemId], targetNodeIds: ['bus-evi-004'],
          singleTargetSpecItemId: specItemId,
        })
        const result = earned(question, true, id + '-attempt')
        const stored = learningEvidenceSchema.parse(result)
        expect(stored).toEqual(result)
        expect(individualSpecItemObservation(stored)).toMatchObject({
          specItemId, correct: true, confidence: 'guess',
          scoring: 'software-scored-final-number', contentId: id,
        })
        expect(individualSpecItemObservation(stored)).not.toHaveProperty('mastery')
        expect(individualSpecItemObservation(stored)).not.toHaveProperty('methodVerified')
      }
    }
  })

  it('does not infer a skill from an untagged, ambiguous or historical calculation', () => {
    const pool = buildQuestionPool({
      topicId: 'leadership', topicOrder: 2, coursePack: paper1.questions,
      bank: paper1.practiceBank, includeWritten: false,
    })
    const question = pool.find(item => item.id === cases[0][0])
    expect(question?.type).toBe('calculation')
    if (!question || question.type !== 'calculation') return
    const wrong = earned(question, false, 'wrong-value')
    expect(individualSpecItemObservation(wrong)).toMatchObject({
      specItemId: 'aqa-7132-3.2.2:expected-value', correct: false,
      confidence: 'certain', scoring: 'software-scored-final-number',
    })
    const historical = learningEvidenceSchema.parse({ ...wrong, itemMapping: undefined })
    expect(individualSpecItemObservation(historical)).toBeNull()
    const ambiguous = { ...question, specItemIds: ['aqa-7132-3.2.2:expected-value', 'aqa-7132-3.2.2:net-gain'] }
    const provenance = objectiveItemMappingForPractice(ambiguous)
    expect(provenance?.targetSpecItemIds).toHaveLength(2)
    expect(provenance?.singleTargetSpecItemId).toBeUndefined()
    expect(individualSpecItemObservation(learningEvidenceSchema.parse({
      ...wrong, itemMapping: provenance,
    }))).toBeNull()
    expect(learningEvidenceSchema.safeParse({
      ...wrong, itemMapping: { ...provenance, singleTargetSpecItemId: 'aqa-7132-3.2.2:expected-value' },
    }).success).toBe(false)
    expect(objectiveItemMappingForPractice({ ...question, source: 'course-pack' })).toBeUndefined()
  })

  it('keeps distinct same-topic skills and idempotent saved evidence intact after reload', async () => {
    const pool = buildQuestionPool({
      topicId: 'leadership', topicOrder: 2, coursePack: paper1.questions,
      bank: paper1.practiceBank, includeWritten: false,
    })
    const questionA = pool.find(item => item.id === cases[0][0])
    const questionB = pool.find(item => item.id === cases[2][0])
    expect(questionA?.type).toBe('calculation')
    expect(questionB?.type).toBe('calculation')
    if (questionA?.type !== 'calculation' || questionB?.type !== 'calculation') return
    const rows = new Map<string, unknown>()
    const store: EvidenceStore = {
      insert: async (row) => {
        if (rows.has(row.evidence_id)) return { error: { code: '23505', message: 'duplicate' } }
        rows.set(row.evidence_id, row.payload)
        return { error: null }
      },
      find: async (_userId, id) => ({ data: rows.has(id) ? { payload: rows.get(id) } : null, error: null }),
      list: async () => ({ data: [...rows.values()].map(payload => ({ payload })), error: null }),
    }
    const a = earned(questionA, false, 'answer-a')
    const b = earned(questionB, true, 'answer-b')
    await recordLearningEvidence(store, 'owner-1', a)
    await recordLearningEvidence(store, 'owner-1', b)
    await recordLearningEvidence(store, 'owner-1', a)
    const loaded = await loadLearningEvidence(store, 'owner-1', paper1.manifest.id)
    expect(loaded.map(individualSpecItemObservation)).toMatchObject([
      { specItemId: 'aqa-7132-3.2.2:expected-value', correct: false },
      { specItemId: 'aqa-7132-3.2.2:net-gain', correct: true },
    ])
    await expect(recordLearningEvidence(store, 'owner-1', { ...a, correct: true }))
      .rejects.toThrow('different or unavailable answer')
    expect(rows.size).toBe(2)
  })
})
