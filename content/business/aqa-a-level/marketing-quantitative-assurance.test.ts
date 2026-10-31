import { describe, expect, it } from 'vitest'
import originalSource from '../../../scripts/assurance/data/aqa-business-7132-sections-33-36-atomic-review.json'
import paper1 from './paper-1'
import paper2 from './paper-2'
import paper3 from './paper-3'
import { businessMarketingQuantitativeCases } from './shared/marketing-quantitative-practice'
import { bankQuestionId, buildQuestionPool, objectiveItemMappingForPractice } from '../../../src/app/practice-questions'
import { checkCalculation } from '../../../src/app/practice-calculation'

const packs = [paper1, paper2, paper3] as const
const newIds = businessMarketingQuantitativeCases.map(item => `rev7132-3.3.2-${item.id}`)
const marketSizeItem = 'aqa-7132-3.3.1:market-size'
const marketGrowthItem = 'aqa-7132-3.3.1:market-growth'

describe('Issue #698 — Marketing source-led measurable growth and size', () => {
  it('independently distinguishes source obligations for market growth, sales growth, share and size', () => {
    const section = originalSource.sections.find(entry => entry.section_id === '3.3.2')!
    expect(section.atoms.filter(atom => ['005', '006', '007', '008'].some(n => atom.id.endsWith(n)))
      .map(atom => atom.observable_skill)).toEqual([
      'calculate market growth', 'calculate sales growth', 'calculate market share', 'calculate market size',
    ])
    expect(section.printed_page).toBe(15)
  })

  it('teaches a firm-specific sales-growth method separately, preserving its original published Learn page ID', () => {
    for (const pack of packs) {
      const pages = pack.learn!.chapters.flatMap(chapter => chapter.groups.flatMap(group => group.pages))
      const pagesFound = pages.filter(page => page.id === 'bus-mkt-002')
      expect(pagesFound).toHaveLength(1)
      const allText = pagesFound[0]!.blocks.filter(block => block.type === 'explanation')
        .flatMap(block => [block.heading, ...block.paragraphs]).join(' ')
      expect(allText).toContain("Calculate a firm's sales growth separately from market growth")
      expect(allText).toContain('£4.8m − £4m')
      expect(allText).toContain('20%')
      expect(allText).toContain('30%')
      expect(allText).toContain('18.46%')
      expect(allText).toContain('market size')
      expect(allText).toContain('market share')
    }
  })

  it('retains existing independent final-number checks and adds only distinct methods in every published pack', () => {
    expect(newIds).toEqual([
      'rev7132-3.3.2-market-size-from-share-02',
      'rev7132-3.3.2-market-growth-decline-02',
    ])
    for (const pack of packs) {
      const newRecords = pack.practiceBank!.filter(record => record.namespace === 'rev7132' && record.batch === '3.3.2')
      expect(newRecords.map(bankQuestionId)).toEqual(newIds)
      const questionPool = buildQuestionPool({
        topicId: 'marketing', topicOrder: 3, coursePack: pack.questions, bank: pack.practiceBank,
      })
      expect(new Set(questionPool.map(q => q.id)).size).toBe(questionPool.length)
      const before = ['aqa7132-3.3-q01', 'aqa7132-3.3-q02'].map(id => questionPool.find(q => q.id === id))
      expect(before.map(q => q?.type)).toEqual(['calculation', 'calculation'])
      const originalTargets = before.map(q => q?.specItemIds)
      expect(originalTargets).toEqual([[marketSizeItem], [marketGrowthItem]])
      for (const [index, id] of newIds.entries()) {
        const q = questionPool.find(question => question.id === id)
        const original = before[index]!
        const asset = businessMarketingQuantitativeCases[index]!
        expect(q?.type).toBe('calculation')
        if (!q || q.type !== 'calculation') continue
        expect(q.specItemIds).toEqual([asset.target])
        expect(q.nodeIds).toEqual(['bus-mkt-002'])
        expect(q.unit).toBe(asset.unit)
        expect(q.marks).toBe(1)
        expect(q.expected).toBe(asset.expected)
        expect(q.workings.length).toBeGreaterThan(100)
        expect(objectiveItemMappingForPractice(q)?.singleTargetSpecItemId).toBe(asset.target)
        expect(q.context).not.toBe(original.context)
        expect(q.prompt).not.toBe(original.prompt)
        expect(checkCalculation(String(q.expected), q.accepted, q.unit).status).toBe('right')
        expect(checkCalculation(String(q.expected + 5), q.accepted, q.unit).status).toBe('wrong')
        expect(q).not.toHaveProperty('validatedWorking')
        expect(q).not.toHaveProperty('awardedSkillMastery')
      }
    }
  })

  it('independently reconstructs the two new cases with explicit denominators and a negative sign', () => {
    expect(3500000 / 0.14).toBe(25000000)
    expect((63 - 75) / 75 * 100).toBe(-16)
    expect(businessMarketingQuantitativeCases.map(x => x.expected)).toEqual([25000000, -16])
    const pool = buildQuestionPool({
      topicId: 'marketing', topicOrder: 3, coursePack: paper1.questions, bank: paper1.practiceBank,
    })
    const decline = pool.find(q => q.id === newIds[1])
    expect(decline?.type).toBe('calculation')
    if (decline?.type === 'calculation') {
      expect(checkCalculation('-16%', decline.accepted, decline.unit).status).toBe('right')
      expect(checkCalculation('16%', decline.accepted, decline.unit).status).toBe('wrong')
    }
  })

  it('does not invent an exact sales-growth target from the historical market-growth identifier', () => {
    expect(businessMarketingQuantitativeCases.map(x => x.target)).toEqual([marketSizeItem, marketGrowthItem])
    expect(paper1.practiceBank!.filter(r => r.namespace === 'rev7132' && r.batch === '3.3.2')
      .every(r => r.target_item_ids.length === 1 && r.target_item_ids[0] !== 'aqa-7132-3.3.2:sales-growth')).toBe(true)
  })
})
