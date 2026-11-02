import { describe, expect, it } from 'vitest'
import paper1 from './paper-1'
import paper2 from './paper-2'
import paper3 from './paper-3'
import { createLearningContentAdapter } from '../../../src/engine/content/content-adapter'

const packs = [paper1, paper2, paper3] as const
const newPageIds = ['boston-matrix-decision-method', 'marketing-mix-seven-ps-context']
const newDrillIds = ['rev7132-334-boston-matrix-01', 'rev7132-334-seven-ps-01']

describe('Issue #698 AQA Business §3.3.4 Boston Matrix and 7Ps published learner remediation', () => {
  it('delivers teaching through existing Learn pages in every AQA Business paper pack', () => {
    for (const pack of packs) {
      const pages = pack.learn!.chapters.flatMap(ch => ch.groups.flatMap(g => g.pages))
      for (const id of newPageIds) {
        const page = pages.find(p => p.id === id)
        expect(page?.topicId, id).toBe('marketing')
        expect(page?.sourceSectionIds).toContain('marketing-mix')
        expect(page?.blocks.some(b => b.type === 'worked-example')).toBe(true)
        expect(page?.blocks.some(b => b.type === 'quick-check')).toBe(true)
      }
      for (const oldId of ['bus-mkt-006', 'bus-mkt-008', 'bus-mkt-009']) {
        expect(pages.some(p => p.id === oldId), oldId).toBe(true)
      }
      const boston = pages.find(p => p.id === newPageIds[0])!
      expect(JSON.stringify(boston)).toMatch(/extension rehearsal/i)
      const explanations = boston.blocks.filter(b => b.type === 'explanation')
      expect(explanations.some(b => b.paragraphs.join(' ').includes('largest competitor'))).toBe(true)
      const services = pages.find(p => p.id === newPageIds[1])!
      const sevenPs = services.blocks.find(b => b.type === 'key-idea')
      if (sevenPs?.type !== 'key-idea') throw new Error('Missing seven-P definitions')
      expect(sevenPs.definitions.map(d => d.term)).toEqual([
        'Product', 'Price', 'Place', 'Promotion', 'People', 'Process', 'Physical environment',
      ])
    }
  })

  it('supplies two original unscored Marketing exercises without changing prior activity identities', () => {
    for (const pack of packs) {
      const adapter = createLearningContentAdapter(pack)
      expect(adapter.listDataDrills()).toHaveLength(32)
      const marketing = adapter.listDataDrills('marketing')
      expect(marketing).toHaveLength(6)
      expect(marketing.slice(-2).map(d => d.id)).toEqual(newDrillIds)
      const all = pack.dataDrills
      expect(new Set(all.map(d => d.id)).size).toBe(32)
      expect(all.slice(0,25).map(d => d.id)).toEqual(
        Array.from({ length:25 }, (_, i) => `a-level-data-drill-${String(i+1).padStart(2,'0')}`))
      expect(marketing.some(d => d.id === 'rev7132-333-positioning-map-01')).toBe(true)
      for (const id of newDrillIds) {
        const drill = all.find(d => d.id === id)
        expect(drill?.topic).toBe('marketing')
        expect(drill?.prompt).toMatch(/on paper|Write a short recommendation/i)
        expect(drill?.answer).toMatch(/NOT (?:an )?independently/)
        expect(drill).not.toHaveProperty('marks')
        expect(drill).not.toHaveProperty('score')
      }
    }
  })

  it('reconstructs matrix classification and labels from independent numeric inputs', () => {
    const entries = [
      { id: 'pans', share:30, rival:15, growth:2, expected:'cash cow' },
      { id: 'kettles', share:10, rival:20, growth:12, expected:'question mark' },
      { id: 'mugs', share:8, rival:16, growth:3, expected:'dog' },
      { id: 'cookware', share:22, rival:11, growth:15, expected:'star' },
    ] as const
    const classify = (growth:number,relative:number) => growth > 8
      ? relative > 1 ? 'star' : 'question mark'
      : relative > 1 ? 'cash cow' : 'dog'
    expect(entries.map(x => classify(x.growth,x.share/x.rival))).toEqual(entries.map(x => x.expected))
    const text = packs[0].dataDrills.find(d=>d.id==='rev7132-334-boston-matrix-01')!.answer
    for (const x of entries) expect(text).toContain(x.expected)
    expect(text).toMatch(/do not|unknown|not automatic/i)
  })

  it('retains existing 9 and 25 mark Boston Matrix exam-style Practice, without claiming trusted marking', () => {
    for (const pack of packs) {
      const matched = (pack.practiceBank ?? []).filter(q => q.batch === '3.3'
        && q.target_item_ids.includes('aqa-7132-3.3.4:boston-matrix'))
      expect(matched.map(q => [q.id, q.question.marks])).toEqual([['q31',9],['q32',25]])
      expect(matched.every(q => q.question.family !== 'MCQ')).toBe(true)
    }
  })
})
