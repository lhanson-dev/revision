import { describe, expect, it } from 'vitest'
import { aqaBusinessQuestionBank } from '../../content/business/aqa-a-level/shared/fast-path-questions'
import { individualSpecItemObservation, learningEvidenceSchema } from '../engine/evidence/evidence'
import { recordLearningEvidence, loadLearningEvidence, type EvidenceStore } from '../services/progress/learning-evidence-service'
import { createMultipleChoiceEvidence } from './practice-evidence'
import { bankRecordToPractice, coursePackQuestionToPractice, objectiveItemMappingForPractice, topicOrderForSpecItem, type MultipleChoicePracticeQuestion } from './practice-questions'
import { questions as coursePackQuestions } from '../../content/business/aqa-a-level/shared/questions'
import { topics as businessTopics } from '../../content/business/aqa-a-level/shared/topics'

const at = '2026-10-29T13:00:00.000Z'
const base = { moduleId: 'business-aqa-a-level-7132-paper-1', topicId: 'finance', occurredAt: at }
const target = (id: string) => ({
  mappingVersion: 1 as const, source: 'structured-practice-bank' as const,
  targetSpecItemIds: [id], targetNodeIds: ['bus-fin-004'],
  singleTargetSpecItemId: id,
})
const answer = (id: string, item: string, selectedOption: number, confidence: 'certain' | 'guess' = 'certain') =>
  createMultipleChoiceEvidence({ ...base, id, contentId: 'bank-' + id,
    selectedOption, correctOption: 1, confidence, itemMapping: target(item) })

describe('IA-03 B1: precise, trustworthy authored Practice evidence', () => {
  it('keeps actual released AQA Business bank single-target provenance through its scored Practice adapter', () => {
    const record = aqaBusinessQuestionBank.find((entry) =>
      entry.question.family === 'MCQ' && entry.target_item_ids.length === 1)
    expect(record, 'At least one published separately assured objective bank question').toBeDefined()
    const topicOrder = topicOrderForSpecItem(record!.target_item_ids[0]!)
    const topic = businessTopics.find((entry) => entry.order === topicOrder)
    expect(topic).toBeDefined()
    const q = bankRecordToPractice(record!, topic!.id)
    expect(q?.type).toBe('multiple-choice')
    if (!q || q.type !== 'multiple-choice') return
    const mapping = objectiveItemMappingForPractice(q)
    expect(mapping).toEqual({
      mappingVersion: 1, source: 'structured-practice-bank',
      targetSpecItemIds: record!.target_item_ids,
      targetNodeIds: record!.target_node_ids,
      singleTargetSpecItemId: record!.target_item_ids[0],
    })
    const fact = createMultipleChoiceEvidence({
      ...base, id: 'bank-real', contentId: q.id, selectedOption: q.correctOption,
      correctOption: q.correctOption, confidence: 'certain', itemMapping: mapping,
    })
    expect(learningEvidenceSchema.parse(fact)).toEqual(fact)
    expect(individualSpecItemObservation(fact)?.specItemId).toBe(record!.target_item_ids[0])
  })

  it('retains different independently attributable outcomes for distinct skills in the same topic', () => {
    const wrong = answer('wrong', 'aqa-7132-3.5.2:margin-of-safety', 0)
    const unsure = answer('guessed-right', 'aqa-7132-3.5.2:break-even', 1, 'guess')
    const a = individualSpecItemObservation(learningEvidenceSchema.parse(wrong))
    const b = individualSpecItemObservation(learningEvidenceSchema.parse(unsure))
    expect(a).toMatchObject({ topicId: 'finance', correct: false, confidence: 'certain', specItemId: 'aqa-7132-3.5.2:margin-of-safety' })
    expect(b).toMatchObject({ topicId: 'finance', correct: true, confidence: 'guess', specItemId: 'aqa-7132-3.5.2:break-even' })
    expect(a?.specItemId).not.toBe(b?.specItemId)
    expect('mastery' in (a ?? {})).toBe(false)
  })

  it('does not split an ambiguous multi-target MCQ into separate skill credit', () => {
    const record = {
      id: 'multi', type: 'multiple-choice', topicId: 'finance',
      specItemIds: ['aqa-7132-3.5.2:break-even', 'aqa-7132-3.5.2:margin-of-safety'],
      nodeIds: ['bus-fin-004'], source: 'aqa-bank',
    } as MultipleChoicePracticeQuestion
    const mapping = objectiveItemMappingForPractice(record)
    expect(mapping?.targetSpecItemIds).toHaveLength(2)
    expect(mapping?.singleTargetSpecItemId).toBeUndefined()
    const fact = createMultipleChoiceEvidence({ ...base, id: 'ambiguous', contentId: 'multi',
      selectedOption: 1, correctOption: 1, itemMapping: mapping })
    expect(learningEvidenceSchema.parse(fact)).toEqual(fact)
    expect(individualSpecItemObservation(fact)).toBeNull()
    expect(learningEvidenceSchema.safeParse({
      ...fact, itemMapping: { ...mapping, singleTargetSpecItemId: mapping?.targetSpecItemIds[0] },
    }).success).toBe(false)
  })

  it('keeps ordinary untagged course-pack answers as topic-level evidence', () => {
    const converted = coursePackQuestionToPractice(coursePackQuestions[0]!)
    expect(objectiveItemMappingForPractice(converted)).toBeUndefined()
    const fact = createMultipleChoiceEvidence({ ...base, id: 'course-pack',
      contentId: converted.id, correctOption: converted.correctOption,
      selectedOption: converted.correctOption, confidence: 'certain' })
    expect(fact.schemaVersion).toBe(2)
    expect(individualSpecItemObservation(fact)).toBeNull()
  })

  it('versions mapped objective evidence without breaking v1/v2 histories', () => {
    const fact = answer('versioned', 'aqa-7132-3.5.2:break-even', 1)
    expect(fact.schemaVersion).toBe(2)
    expect(fact.source === 'multiple_choice' && fact.itemMapping?.mappingVersion).toBe(1)
    expect(learningEvidenceSchema.safeParse({ ...fact, itemMapping: undefined }).success).toBe(true)
    expect(individualSpecItemObservation(learningEvidenceSchema.parse({ ...fact, itemMapping: undefined }))).toBeNull()
    expect(learningEvidenceSchema.safeParse({ ...fact, schemaVersion: 1 }).success).toBe(false)
    const legacy = createMultipleChoiceEvidence({ ...base, id: 'old', contentId: 'old-q',
      selectedOption: 1, correctOption: 1 })
    expect(learningEvidenceSchema.parse(legacy)).toEqual(legacy)
    expect(individualSpecItemObservation(legacy)).toBeNull()
  })

  it('persists and reloads the exact item/result without changing a conflicting retry', async () => {
    const saved = new Map<string, unknown>()
    const store: EvidenceStore = {
      insert: async (record) => {
        if (saved.has(record.evidence_id)) return { error: { code: '23505', message: 'duplicate' } }
        saved.set(record.evidence_id, record.payload)
        return { error: null }
      },
      find: async (_user, id) => ({ data: saved.has(id) ? { payload: saved.get(id) } : null, error: null }),
      list: async () => ({ data: [...saved.values()].map((payload) => ({ payload })), error: null }),
    }
    const first = answer('a', 'aqa-7132-3.5.2:margin-of-safety', 0)
    const second = answer('b', 'aqa-7132-3.5.2:break-even', 1, 'guess')
    await recordLearningEvidence(store, 'owner-1', first)
    await recordLearningEvidence(store, 'owner-1', second)
    await recordLearningEvidence(store, 'owner-1', first)
    const loaded = await loadLearningEvidence(store, 'owner-1', base.moduleId)
    expect(loaded.map(individualSpecItemObservation).map((item) => item?.specItemId))
      .toEqual(['aqa-7132-3.5.2:margin-of-safety', 'aqa-7132-3.5.2:break-even'])
    await expect(recordLearningEvidence(store, 'owner-1', { ...first, itemMapping: target('another') }))
      .rejects.toThrow('different or unavailable answer')
  })
})
