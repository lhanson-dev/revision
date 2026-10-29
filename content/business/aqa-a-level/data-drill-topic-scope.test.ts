import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import paper1 from './paper-1'
import paper2 from './paper-2'
import paper3 from './paper-3'
import psychologyPaper1 from '../../psychology/aqa-a-level/paper-1'
import { contentPackSchema } from '../../schema'
import { createLearningContentAdapter } from '../../../src/engine/content/content-adapter'

const businessPacks = [paper1, paper2, paper3] as const
const expectedCountByTopic: Record<string, number> = {
  business: 0,
  leadership: 1,
  marketing: 3,
  operations: 4,
  finance: 16,
  hr: 2,
  'strategic-position': 0,
  'strategic-direction': 0,
  'strategic-methods': 0,
  'strategic-change': 3,
}

describe('Issue #698 — existing Business data drills respect selected course topic', () => {
  it('classifies all 29 original/published Business exercises without changing original IDs or duplicates', () => {
    for (const pack of businessPacks) {
      const adapter = createLearningContentAdapter(pack)
      const all = adapter.listDataDrills()
      const validTopics = new Set(pack.topics.map(topic => topic.id))
      expect(all).toHaveLength(29)
      expect(new Set(all.map(item => item.id)).size).toBe(29)
      expect(all.every(item => item.topic && validTopics.has(item.topic))).toBe(true)
      expect(all.slice(0, 25).map(item => item.id)).toEqual(Array.from(
        { length: 25 }, (_, index) => `a-level-data-drill-${String(index + 1).padStart(2, '0')}`,
      ))
      expect(all.slice(25).map(item => item.id)).toEqual([
        'a-level-network-amendment-01',
        'a-level-network-amendment-02',
        'rev7132-35-budget-construction-01',
        'rev7132-35-cashflow-construction-01',
      ])
      for (const [topicId, count] of Object.entries(expectedCountByTopic)) {
        const scoped = adapter.listDataDrills(topicId)
        expect(scoped, topicId).toHaveLength(count)
        expect(scoped.every(item => item.topic === topicId), topicId).toBe(true)
      }
      expect(Object.values(expectedCountByTopic).reduce((total, count) => total + count, 0)).toBe(all.length)
    }
  })

  it('keeps budget, cash-flow and graph rehearsal available in Finance, and network rehearsal only in Strategic Change', () => {
    for (const pack of businessPacks) {
      const adapter = createLearningContentAdapter(pack)
      const finance = adapter.listDataDrills('finance')
      expect(finance.map(drill => drill.title)).toEqual(expect.arrayContaining([
        'Break-even chart construction',
        'Build a budget and reconcile every variance',
        'Construct a three-month cash-flow forecast',
      ]))
      expect(finance.every(drill => !drill.id.startsWith('a-level-network'))).toBe(true)
      const strategicChange = adapter.listDataDrills('strategic-change')
      expect(strategicChange.map(drill => drill.id)).toContain('a-level-network-amendment-02')
      expect(strategicChange.every(drill => !drill.title.toLowerCase().includes('cash-flow'))).toBe(true)
      const marketing = adapter.listDataDrills('marketing')
      expect(marketing.map(drill => drill.title)).toEqual(['Market share', 'Market growth', 'Index interpretation'])
      expect(marketing.every(drill => drill.topic === 'marketing')).toBe(true)
    }
  })

  it('rejects drills mapped to a nonexistent published course topic instead of silently losing their activity', () => {
    expect(() => contentPackSchema.parse({
      ...paper1,
      dataDrills: paper1.dataDrills.map((drill, index) => index === 0
        ? { ...drill, topic: 'unpublished-topic' }
        : drill),
    })).toThrow(z.ZodError)
  })

  it('preserves legacy unclassified drills for other courses without changing their current presentation', () => {
    const adapter = createLearningContentAdapter(psychologyPaper1)
    const untagged = adapter.listDataDrills().filter(drill => !drill.topic)
    expect(untagged.length).toBeGreaterThan(0)
    for (const topic of psychologyPaper1.topics.slice(0, 2)) {
      const visible = adapter.listDataDrills(topic.id)
      expect(visible.map(drill => drill.id)).toEqual(expect.arrayContaining(untagged.map(drill => drill.id)))
    }
  })
})
