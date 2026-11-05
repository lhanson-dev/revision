import { describe, expect, it } from 'vitest'
import paper1 from './paper-1'
import paper2 from './paper-2'
import paper3 from './paper-3'
import { businessStrategicRatioCases } from './shared/strategic-ratio-practice'
import { bankQuestionId, buildQuestionPool, objectiveItemMappingForPractice } from '../../../src/app/practice-questions'
import { checkCalculation, formatAnswer } from '../../../src/app/practice-calculation'

const packs = [paper1, paper2, paper3] as const
const targets = [
  'return-on-capital-employed',
  'current-ratio',
  'gearing',
  'payables-days',
  'receivables-days',
  'inventory-turnover',
] as const

describe('Issue #698 AQA 7132 v2.0 §3.7.2 independently entered financial-ratio results', () => {
  it('provides two distinct original exercises per ratio with independently recomputed answers', () => {
    expect(businessStrategicRatioCases).toHaveLength(12)
    const independentResults = [
      420000 / (1500000 + 600000) * 100,
      192000 / (720000 + 480000) * 100,
      288000 / 192000,
      420000 / 300000,
      360000 / (360000 + 840000) * 100,
      480000 / (480000 + 720000) * 100,
      72000 / 657000 * 365,
      45000 / 547500 * 365,
      96000 / 876000 * 365,
      60000 / 730000 * 365,
      960000 / 80000,
      875000 / 125000,
    ]
    expect(businessStrategicRatioCases.map(v => v.expected)).toEqual(independentResults)
    for (const target of targets) {
      const cases = businessStrategicRatioCases.filter(item => item.target === target)
      expect(cases).toHaveLength(2)
      expect(new Set(cases.map(item => item.context)).size).toBe(2)
      expect(new Set(cases.map(item => item.expected)).size).toBe(2)
    }
  })

  it('wires the same new content into all three published packs, without changing mocks', () => {
    const newIds = businessStrategicRatioCases.map(item => 'rev7132-3.7.2-' + item.id)
    for (const pack of packs) {
      const chapter = pack.learn?.chapters.find(item => item.topicId === 'strategic-position')
      const pages = chapter?.groups.flatMap(group => group.pages) ?? []
      const lesson = pages.find(page => page.id === 'strategic-financial-ratios-method')
      expect(lesson?.sourceSectionIds).toContain('aqa-7132-3-7-2')
      expect(lesson?.blocks.filter(block => block.type === 'worked-example')).toHaveLength(2)
      expect(lesson?.blocks.some(block => block.type === 'quick-check')).toBe(true)
      expect(JSON.stringify(lesson)).toContain('unscored')
      expect(JSON.stringify(lesson)).toContain('not independently marked')
      expect(pages.filter(page => page.id === 'strategic-financial-ratios-method')).toHaveLength(1)
      const records = pack.practiceBank!.filter(record => record.namespace === 'rev7132' && record.batch === '3.7.2')
      expect(records.map(bankQuestionId)).toEqual(newIds)
      expect(new Set(pack.practiceBank!.map(bankQuestionId)).size).toBe(pack.practiceBank!.length)
      const pool = buildQuestionPool({ topicId: 'strategic-position', topicOrder: 7, coursePack: pack.questions, bank: pack.practiceBank })
      expect(new Set(pool.map(q => q.id)).size).toBe(pool.length)
      for (const item of businessStrategicRatioCases) {
        const result = pool.find(q => q.id === 'rev7132-3.7.2-' + item.id)
        expect(result?.type).toBe('calculation')
        if (!result || result.type !== 'calculation') continue
        expect(result.topicId).toBe('strategic-position')
        expect(result.specItemIds).toEqual(['aqa-7132-3.7.2:' + item.target])
        expect(result.nodeIds).toEqual(['strategic-financial-ratios-method'])
        expect(result.marks).toBe(1)
        expect(result.expected).toBe(item.expected)
        expect(result.unit).toBe(item.unit)
        expect(objectiveItemMappingForPractice(result)?.singleTargetSpecItemId).toBe('aqa-7132-3.7.2:' + item.target)
        expect(checkCalculation(String(item.expected), result.accepted, item.unit).status).toBe('right')
        expect(checkCalculation(String(item.expected + (Number.isInteger(item.expected) ? 10 : 2)), result.accepted, item.unit).status).toBe('wrong')
        expect(result.workings.length).toBeGreaterThan(85)
        expect(result).not.toHaveProperty('validatedWorking')
        expect(result).not.toHaveProperty('awardedSkillMastery')
      }
      expect(pack.exams).toHaveLength(1)
      expect(pack.exams[0]?.totalMarks).toBe(100)
    }
  })

  it('labels current ratio and other outputs with their correct units and no automatic method marks', () => {
    expect(formatAnswer(1.5, 'ratio')).toBe('1.5:1')
    expect(formatAnswer(20, '%')).toBe('20%')
    expect(formatAnswer(40, 'days')).toBe('40 days')
    expect(formatAnswer(12, 'times per year')).toBe('12 times per year')
  })
})
