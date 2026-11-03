import { describe, expect, it } from 'vitest'
import paper1 from './paper-1'
import paper2 from './paper-2'
import paper3 from './paper-3'
import { businessOperationsPerformanceCases } from './shared/operations-performance-practice'
import { bankQuestionId, buildQuestionPool, objectiveItemMappingForPractice } from '../../../src/app/practice-questions'
import { checkCalculation } from '../../../src/app/practice-calculation'

const packs = [paper1, paper2, paper3] as const
const targetPrefix = 'aqa-7132-3.4.2:'
const targetIds = [
  targetPrefix + 'capacity',
  targetPrefix + 'capacity-utilisation',
  targetPrefix + 'labour-productivity',
  targetPrefix + 'unit-cost-average-cost',
] as const

describe('Issue #698 — original AQA Business §3.4.2 operational-measures correction', () => {
  it('provides original coherent teaching in the canonical Learn course across all three packs', () => {
    for (const pack of packs) {
      const pages = pack.learn!.chapters.flatMap(chapter => chapter.groups.flatMap(group => group.pages))
      const page = pages.find(candidate => candidate.id === 'operations-four-performance-measures')
      expect(page?.topicId).toBe('operations')
      expect(page?.sourceSectionIds).toContain('operations-performance')
      expect(page?.blocks.some(block => block.type === 'key-idea')).toBe(true)
      expect(page?.blocks.filter(block => block.type === 'worked-example')).toHaveLength(2)
      expect(page?.blocks.some(block => block.type === 'quick-check')).toBe(true)
      const text = JSON.stringify(page)
      expect(text).toContain('£93,600')
      expect(text).toContain('120 repairs per week')
      expect(text).toContain('300 trays per employee')
      for (const legacyId of ['bus-ops-003', 'bus-ops-004']) {
        expect(pages.filter(candidate => candidate.id === legacyId)).toHaveLength(1)
      }
      expect(text).toMatch(/unscored|not saved|not independently|separate scrutiny/i)
    }
  })

  it('maps two materially different typed final-number cases to each distinct source skill without new mastery semantics', () => {
    expect(businessOperationsPerformanceCases).toHaveLength(8)
    const targets = businessOperationsPerformanceCases.map(item => item.target)
    for (const target of targetIds) {
      expect(targets.filter(value => value === target)).toHaveLength(2)
      const pairs = businessOperationsPerformanceCases.filter(item => item.target === target)
      expect(new Set(pairs.map(item => item.context)).size).toBe(2)
      expect(new Set(pairs.map(item => item.expected)).size).toBe(2)
    }
    const ids = businessOperationsPerformanceCases.map(item => 'rev7132-3.4.2-' + item.id)
    for (const pack of packs) {
      const scoped = pack.practiceBank!.filter(record => record.namespace === 'rev7132' && record.batch === '3.4.2')
      expect(scoped.map(bankQuestionId)).toEqual(ids)
      expect(new Set(pack.practiceBank!.map(bankQuestionId)).size).toBe(pack.practiceBank!.length)
      const pool = buildQuestionPool({
        topicId: 'operations', topicOrder: 4,
        coursePack: pack.questions, bank: pack.practiceBank,
      })
      expect(new Set(pool.map(question => question.id)).size).toBe(pool.length)
      for (const item of businessOperationsPerformanceCases) {
        const question = pool.find(candidate => candidate.id === 'rev7132-3.4.2-' + item.id)
        expect(question?.type).toBe('calculation')
        if (!question || question.type !== 'calculation') continue
        expect(question.topicId).toBe('operations')
        expect(question.specItemIds).toEqual([item.target])
        expect(question.nodeIds).toEqual([item.node])
        expect(question.expected).toBe(item.expected)
        expect(question.unit).toBe(item.unit)
        expect(question.marks).toBe(1)
        expect(question.workings.length).toBeGreaterThan(110)
        expect(objectiveItemMappingForPractice(question)?.singleTargetSpecItemId).toBe(item.target)
        expect(checkCalculation(String(item.expected), question.accepted, item.unit).status).toBe('right')
        expect(checkCalculation(String(item.expected + 50), question.accepted, item.unit).status).toBe('wrong')
        expect(question).not.toHaveProperty('validatedWorking')
        expect(question).not.toHaveProperty('awardedSkillMastery')
      }
      expect(pack.dataDrills).toHaveLength(32)
      expect(pack.exams).toHaveLength(1)
      expect(pack.exams[0]?.questions.reduce((total, q) => {
        // Original printed question inventory is unchanged. The original
        // component-specific mark allocation remains covered by content.test.
        return total + (q.marks > 0 ? 1 : 0)
      }, 0)).toBeGreaterThan(10)
    }
  })

  it('recomputes all eight results independently from the authored contexts', () => {
    const independentAnswers = [
      120 * 7 * 5,
      5 * 6 * 4,
      19200 / 48,
      1560 / 12,
      96000 / 7500,
      261000 / 18000,
      3120 / 4800 * 100,
      4320 / 4800 * 100,
    ]
    expect(businessOperationsPerformanceCases.map(item => item.expected)).toEqual(independentAnswers)
    for (const pack of packs) {
      const legacy = pack.practiceBank!.find(item => item.batch === '3.4' && item.id === 'q07')
      expect(legacy?.target_item_ids).toContain('aqa-7132-3.4.2:capacity-utilisation')
      expect(legacy?.question.family).toBe('MCQ')
    }
  })
})
