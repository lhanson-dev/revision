import { describe, expect, it } from 'vitest'
import paper1 from './paper-1'
import paper2 from './paper-2'
import paper3 from './paper-3'

const packs = [paper1, paper2, paper3] as const

describe('Issue #698 Business diagram construction published teaching and rehearsal', () => {
  it('adds an original construction method inside the actual published break-even Learn page, retaining the existing graph', () => {
    for (const pack of packs) {
      const pages = pack.learn?.chapters.flatMap(chapter => chapter.groups.flatMap(group => group.pages)) ?? []
      const page = pages.find(item => item.id === 'understanding-break-even')
      expect(page?.sourceSectionIds).toContain('break-even-profitability')
      expect(page?.blocks.some(block => block.type === 'quantitative' && block.title === 'Break-even chart')).toBe(true)
      const method = page?.blocks.find(block => block.type === 'worked-example'
        && block.title === 'Construct and amend a break-even chart')
      expect(method?.type).toBe('worked-example')
      if (method?.type !== 'worked-example') throw new Error('Missing construction method')
      expect(method.task).toMatch(/draw your own/i)
      expect(method.steps).toHaveLength(7)
      expect(method.conclusion).toMatch(/not evidence.*marked/i)
    }
  })

  it('offers independent-paper drawing and amendment rehearsal in every published course pack, but does not count answer reveal as scored', () => {
    for (const pack of packs) {
      const chart = pack.dataDrills.find(drill => drill.title === 'Break-even chart construction')
      const network = pack.dataDrills.find(drill => drill.id === 'a-level-network-amendment-02')
      expect(chart?.prompt).toMatch(/sketch a break-even chart on paper/i)
      expect(chart?.answer).toMatch(/not score or independently verify/i)
      expect(network?.prompt).toMatch(/draw an activity-on-node network on paper/i)
      expect(network?.answer).toMatch(/not independently scored/i)
      expect(pack.dataDrills.some(drill => drill.id === 'a-level-network-amendment-01')).toBe(true)
    }
  })

  it('checks the independent chart example and amended network answers arithmetically', () => {
    const price = 16
    const lowerPrice = 14
    const unitCost = 10
    const fixedCost = 12000
    const baseBreakEven = fixedCost / (price - unitCost)
    const adjustedBreakEven = fixedCost / (lowerPrice - unitCost)
    expect([baseBreakEven, baseBreakEven * price]).toEqual([2000, 32000])
    expect([adjustedBreakEven, adjustedBreakEven * lowerPrice]).toEqual([3000, 42000])
    expect([15000 / (price - unitCost), 15000 / (price - unitCost) * price]).toEqual([2500, 40000])
    expect([3000 - baseBreakEven, 3500 - baseBreakEven]).toEqual([1000, 1500])
    expect([3000 * (price - unitCost) - fixedCost, 3500 * (price - unitCost) - fixedCost]).toEqual([6000, 9000])
    for (const quantity of [0, 2000, 4000]) {
      expect(fixedCost + unitCost * quantity).toBe(12000 + 10 * quantity)
      expect(price * quantity).toBe(16 * quantity)
      expect(lowerPrice * quantity).toBe(14 * quantity)
    }
    const initialLeft = 4 + 7 + 3
    const right = 6 + 5 + 3
    const amendedLeft = 4 + 11 + 3
    expect([initialLeft, right, amendedLeft, amendedLeft - right]).toEqual([14, 14, 18, 4])
  })

  it('does not create a scored question, mutate stable IDs or replace an earlier network exercise', () => {
    const ids = (pack: typeof paper1) => pack.dataDrills.map(drill => drill.id)
    expect(ids(paper1)).toEqual(ids(paper2))
    expect(ids(paper2)).toEqual(ids(paper3))
    expect(new Set(ids(paper1)).size).toBe(27)
    expect(ids(paper1).slice(0, 24)).toEqual(Array.from({ length: 24 }, (_, index) =>
      `a-level-data-drill-${String(index + 1).padStart(2, '0')}`))
    expect(ids(paper1).slice(-2)).toEqual(['a-level-network-amendment-01', 'a-level-network-amendment-02'])
    // These are reveal-only DataDrills; no PracticeQuestion scored result exists here.
    expect(paper1.dataDrills.find(drill => drill.title === 'Break-even chart construction')).not.toHaveProperty('marks')
  })
})
