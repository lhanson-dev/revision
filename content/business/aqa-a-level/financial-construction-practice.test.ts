import { describe, expect, it } from 'vitest'
import paper1 from './paper-1'
import paper2 from './paper-2'
import paper3 from './paper-3'
import { businessFinanceNumericCases } from './shared/financial-numeric-practice'
import { bankQuestionId, buildQuestionPool } from '../../src/app/practice-questions'
import { checkCalculation } from '../../src/app/practice-calculation'
import { createCalculationEvidence } from '../../src/app/practice-evidence'

const packs = [paper1, paper2, paper3] as const

describe('Issue #698 AQA Business §3.5.2 published finance construction and typed calculation', () => {
  it('retains the original published financial Learn pages and existing Practice identities across all paper packs', () => {
    for (const pack of packs) {
      const pages = pack.learn?.chapters.flatMap(chapter => chapter.groups.flatMap(group => group.pages)) ?? []
      expect(pages.find(page => page.id === 'bus-fin-005')?.blocks
        .some(block => block.type === 'explanation'
          && block.paragraphs.join(' ').includes('Construct a three-month forecast'))).toBe(true)
      expect(pages.find(page => page.id === 'bus-fin-007')?.blocks
        .some(block => block.type === 'explanation'
          && block.paragraphs.join(' ').includes('Construct a budget-versus-actual table'))).toBe(true)
      const ids = pack.dataDrills.map(drill => drill.id)
      expect(ids.slice(0, 24)).toEqual(Array.from({ length: 24 },
        (_, index) => `a-level-data-drill-${String(index + 1).padStart(2, '0')}`))
      expect(ids).toContain('a-level-network-amendment-01')
      expect(ids).toContain('rev7132-35-budget-construction-01')
      expect(ids).toContain('rev7132-35-cashflow-construction-01')
      expect(new Set(ids).size).toBe(29)
    }
  })

  it('publishes the exact Revision-authored source construction prompts and model answers without assigning scored mastery', () => {
    for (const pack of packs) {
      const budget = pack.dataDrills.find(drill => drill.id === 'rev7132-35-budget-construction-01')
      const cash = pack.dataDrills.find(drill => drill.id === 'rev7132-35-cashflow-construction-01')
      expect(budget?.prompt).toMatch(/Construct on paper a March Budget, Actual and Variance table/i)
      expect(budget?.answer).toContain('Profit £16,000/£9,000/−£7,000 adverse')
      expect(cash?.prompt).toMatch(/Construct a three-month cash-flow forecast on paper/i)
      expect(cash?.answer).toContain('February: opening £6,000')
      for (const task of [budget, cash]) {
        expect(task?.answer).toMatch(/not.*independently mark/i)
        expect(task).not.toHaveProperty('marks')
        expect(task).not.toHaveProperty('source')
      }
    }
  })

  it('presents six unique stable numeric questions through the real Course Practice pool, not a separate engine', () => {
    const stableIds = businessFinanceNumericCases.map(x => `rev7132-3.5.2-${x.id}`)
    expect(new Set(stableIds).size).toBe(6)
    for (const pack of packs) {
      const records = pack.practiceBank!.filter(record => record.namespace === 'rev7132')
      expect(records).toHaveLength(6)
      expect(records.map(bankQuestionId)).toEqual(stableIds)
      expect(records.every(record => record.target_item_ids.length === 1
        && record.target_node_ids.length === 1
        && record.topic_id === 'finance')).toBe(true)
      const selected = buildQuestionPool({
        topicId: 'finance', topicOrder: 5, coursePack: pack.questions, bank: pack.practiceBank,
      })
      for (const id of stableIds) {
        const question = selected.find(item => item.id === id)
        expect(question?.type, id).toBe('calculation')
        if (question?.type !== 'calculation') continue
        expect(question.marks).toBe(1)
        expect(question.workings.length).toBeGreaterThan(65)
        expect(question.specItemIds).toHaveLength(1)
        expect(checkCalculation(String(question.expected), question.accepted, question.unit).status).toBe('right')
        expect(checkCalculation(String(question.expected + 20), question.accepted, question.unit).status).toBe('wrong')
        if (question.expected < 0) {
          expect(checkCalculation(String(Math.abs(question.expected)), question.accepted, question.unit).status).toBe('wrong')
        }
      }
    }
  })

  it('reconstructs all six final answers from independent component data', () => {
    const answers = [
      93000 - (31000 + 27000 + 13000),
      29800 - 27000,
      84000 - 91000,
      (9000 + 26000 - 31000) + 18000 - 25000,
      (12000 + 15000 - 17000) + 14000 - 19000,
      4000 + (23000 - 6000) - 25000,
    ]
    expect(answers).toEqual(businessFinanceNumericCases.map(item => item.expected))
    expect(answers).toEqual([22000, 2800, -7000, -3000, 5000, -4000])
  })

  it('software-scored calculation evidence is only a final-number result, not scored construction or durable per-item mastery', () => {
    const evidence = createCalculationEvidence({
      id: 'test-finance-scored-final-value',
      moduleId: paper1.manifest.id,
      topicId: 'finance',
      contentId: 'rev7132-3.5.2-two-month-closing-cash-01',
      correct: true,
      enteredValue: -3000,
      expectedValue: -3000,
      unit: '£',
      confidence: 'sure',
      occurredAt: '2026-10-29T00:00:00.000Z',
    })
    expect(evidence.source).toBe('calculation')
    expect(evidence).not.toHaveProperty('itemMapping')
    expect(evidence).not.toHaveProperty('assessmentObjectives')
    expect(evidence).not.toHaveProperty('constructedTable')
    expect(evidence).not.toHaveProperty('awardedSkillMastery')
  })
})
