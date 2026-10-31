import { describe, expect, it } from 'vitest'
import originalSource from '../../../scripts/assurance/data/aqa-business-7132-sections-33-36-atomic-review.json'
import paper1 from './paper-1'
import paper2 from './paper-2'
import paper3 from './paper-3'
import { businessMarketingQuantitativeCases } from './shared/marketing-quantitative-practice'
import { bankQuestionId, buildQuestionPool, objectiveItemMappingForPractice } from '../../../src/app/practice-questions'
import { checkCalculation } from '../../../src/app/practice-calculation'

const packs = [paper1, paper2, paper3] as const
const caseIds = businessMarketingQuantitativeCases.map(item => `rev7132-3.3.2-${item.id}`)
const sizeTarget = 'aqa-7132-3.3.1:market-size'
const growthTarget = 'aqa-7132-3.3.1:market-growth'

describe('Issue #698 AQA Business §§3.3.1–3.3.2 Marketing numerical skills', () => {
  it('identifies four distinct source requirements before attributing existing assets', () => {
    const source = originalSource.sections.find(s => s.section_id === '3.3.2')!
    const four = source.atoms.filter(atom => ['005','006','007','008'].some(n => atom.id.endsWith(n)))
    expect(four.map(atom => atom.observable_skill)).toEqual([
      'calculate market growth', 'calculate sales growth', 'calculate market share', 'calculate market size',
    ])
    expect(four.every(atom => atom.printed_page === 15)).toBe(true)
  })

  it('uses real published course Learn to teach sales growth separately, without replacing existing size/share lessons', () => {
    for (const pack of packs) {
      const pages = pack.learn!.chapters.flatMap(chapter => chapter.groups.flatMap(group => group.pages))
      const matching = pages.filter(page => page.id === 'bus-mkt-002')
      expect(matching).toHaveLength(1)
      const explanations = matching[0]!.blocks.filter(block => block.type === 'explanation')
      const teaching = explanations.flatMap(block => [block.heading, ...block.paragraphs]).join(' ')
      expect(teaching).toContain("Calculate a firm's sales growth separately from market growth")
      expect(teaching).toContain('£4.8m − £4m')
      expect(teaching).toContain('20%')
      expect(teaching).toContain('30%')
      expect(teaching).toContain('18.46%')
      expect(teaching).toContain('market size')
      expect(teaching).toContain('market share')
    }
  })

  it('publishes four stable typed-answer opportunities in all three Business packs with no ID collision', () => {
    expect(new Set(caseIds).size).toBe(4)
    for (const pack of packs) {
      const records = pack.practiceBank!.filter(q => q.namespace === 'rev7132' && q.batch === '3.3.2')
      expect(records.map(bankQuestionId)).toEqual(caseIds)
      expect(records.every(r => r.topic_id === 'marketing' && r.target_node_ids.join() === 'bus-mkt-002'
        && r.target_item_ids.length === 1)).toBe(true)
      const pool = buildQuestionPool({
        topicId: 'marketing', topicOrder: 3, coursePack: pack.questions, bank: pack.practiceBank,
      })
      expect(new Set(pool.map(q => q.id)).size).toBe(pool.length)
      for (const [index, id] of caseIds.entries()) {
        const question = pool.find(q => q.id === id)
        const authored = businessMarketingQuantitativeCases[index]!
        expect(question?.type, id).toBe('calculation')
        if (question?.type !== 'calculation') continue
        expect(question.expected).toBe(authored.expected)
        expect(question.unit).toBe(authored.unit)
        expect(question.marks).toBe(1)
        expect(question.specItemIds).toEqual([authored.target])
        expect(question.nodeIds).toEqual(['bus-mkt-002'])
        expect(question.workings).toContain(authored.working.slice(0, 30))
        expect(objectiveItemMappingForPractice(question)?.singleTargetSpecItemId).toBe(authored.target)
        expect(checkCalculation(String(authored.expected), question.accepted, question.unit).status).toBe('right')
        expect(checkCalculation(String(authored.expected + 10), question.accepted, question.unit).status).toBe('wrong')
        expect(question).not.toHaveProperty('validatedWorking')
        expect(question).not.toHaveProperty('awardedMastery')
      }
    }
  })

  it('independently recalculates four answers, including share inversion and a signed contraction', () => {
    const results = [
      620000 + 730000 + 850000,
      3500000 / (14 / 100),
      (36.8 - 32) / 32 * 100,
      (63 - 75) / 75 * 100,
    ]
    expect(results[0]).toBe(2200000)
    expect(results[1]).toBe(25000000)
    expect(results[3]).toBe(-16)
    results.forEach((answer, i) => expect(answer).toBeCloseTo(businessMarketingQuantitativeCases[i]!.expected, 8))
    const cases = businessMarketingQuantitativeCases
    for (const target of [sizeTarget, growthTarget]) {
      const alternatives = cases.filter(item => item.target === target)
      expect(alternatives).toHaveLength(2)
      expect(alternatives[0].id).not.toBe(alternatives[1].id)
      expect(alternatives[0].context).not.toBe(alternatives[1].context)
      expect(alternatives[0].stem).not.toBe(alternatives[1].stem)
    }
    const decline = packs[0].practiceBank!.find(item => item.id === 'market-growth-decline-02')!
    const question = buildQuestionPool({ topicId:'marketing', topicOrder:3, coursePack:paper1.questions, bank:paper1.practiceBank })
      .find(q => q.id === bankQuestionId(decline))
    expect(question?.type).toBe('calculation')
    if (question?.type === 'calculation') {
      expect(checkCalculation('-16%', question.accepted, question.unit).status).toBe('right')
      expect(checkCalculation('16%', question.accepted, question.unit).status).toBe('wrong')
    }
  })

  it('does NOT infer independently marked sales-growth, workings, evaluation or whole-course approval', () => {
    // The old source tag map has size/growth/share but lacks a separately approved
    // sales-growth item. Never attribute the market-growth score to sales growth.
    expect(businessMarketingQuantitativeCases.map(x => x.target)).toEqual([
      sizeTarget, sizeTarget, growthTarget, growthTarget,
    ])
    const all = packs[0].practiceBank!
    expect(all.filter(q => q.namespace === 'rev7132' && q.batch === '3.3.2')
      .every(q => !q.target_item_ids.some(id => id.endsWith(':sales-growth')))).toBe(true)
  })
})
