import { describe, expect, it } from 'vitest'
import paper1 from './paper-1'
import paper2 from './paper-2'
import paper3 from './paper-3'

const packs = [paper1, paper2, paper3] as const

describe('Issue #698 AQA Business 7132 v2.0 §3.3.3 market mapping correction', () => {
  it('publishes original construction method in the shared Marketing Learn experience', () => {
    for (const pack of packs) {
      const pages = pack.learn?.chapters.flatMap(chapter => chapter.groups.flatMap(group => group.pages)) ?? []
      const guide = pages.find(page => page.id === 'market-positioning-map-method')
      expect(guide?.topicId).toBe('marketing')
      expect(guide?.sourceSectionIds).toContain('stp')
      const worked = guide?.blocks.find(block => block.type === 'worked-example' && block.title === 'Construct a position map from customer research')
      expect(worked?.type).toBe('worked-example')
      if (worked?.type !== 'worked-example') throw new Error('Missing market map method')
      expect(worked.task).toMatch(/draw your own labelled two-axis/i)
      expect(worked.steps).toHaveLength(5)
      expect(worked.conclusion).toMatch(/does not independently verify/i)
      expect(pages.some(page => page.id === 'bus-mkt-005')).toBe(true)
    }
  })

  it('publishes an original mapped paper-construction task without false scored credit', () => {
    for (const pack of packs) {
      const drills = pack.dataDrills.filter(drill => drill.id === 'rev7132-333-positioning-map-01')
      expect(drills).toHaveLength(1)
      const [drill] = drills
      expect(drill.topic).toBe('marketing')
      expect(drill.prompt).toMatch(/draw a market map/i)
      expect(drill.prompt).toMatch(/plot three competitors/i)
      expect(drill.answer).toMatch(/cannot score or independently verify/i)
      expect(drill).not.toHaveProperty('marks')
      expect(pack.dataDrills.map(item => item.id)).toHaveLength(30)
      expect(new Set(pack.dataDrills.map(item => item.id)).size).toBe(30)
      expect(pack.dataDrills.some(item => item.id === 'a-level-data-drill-25')).toBe(true)
      expect(pack.dataDrills.some(item => item.id === 'a-level-network-amendment-02')).toBe(true)
    }
    expect(packs[0].dataDrills.map(item => item.id)).toEqual(packs[1].dataDrills.map(item => item.id))
    expect(packs[1].dataDrills.map(item => item.id)).toEqual(packs[2].dataDrills.map(item => item.id))
  })

  it('checks map coordinates and conditional decision without confusing price with durability', () => {
    const options = [
      { brand: 'CupGo', price: 12, durability: 3 },
      { brand: 'DailySip', price: 20, durability: 6 },
      { brand: 'LongLife', price: 38, durability: 8 },
    ]
    const proposed = { brand: 'BrewLoop', price: 28, durability: 9 }
    const nearestByPrice = [...options].sort((a, b) =>
      Math.abs(a.price - proposed.price) - Math.abs(b.price - proposed.price))[0]
    expect(nearestByPrice.brand).toBe('DailySip')
    expect(proposed.price - nearestByPrice.price).toBe(8)
    expect(Math.max(...options.map(item => item.durability))).toBe(8)
    expect(proposed.durability).toBe(9)
    expect(options.every(item => item.price >= 0 && item.price <= 40 && item.durability <= 10)).toBe(true)
  })

  it('keeps each axis independently spaced and permits overlapping competing positions', () => {
    for (const pack of packs) {
      const pages = pack.learn?.chapters.flatMap(chapter => chapter.groups.flatMap(group => group.pages)) ?? []
      const guide = pages.find(page => page.id === 'market-positioning-map-method')
      expect(guide).toBeDefined()
      const words = JSON.stringify(guide)
      expect(words).toMatch(/evenly spaced/)
      expect(words).toMatch(/if two offers overlap/)
      expect(words).not.toMatch(/equal scales|its own coordinates/)
      const drill = pack.dataDrills.find(item => item.id === 'rev7132-333-positioning-map-01')
      expect(drill?.answer).toContain('DailySip is £8 cheaper than BrewLoop and LongLife is £10 more expensive')
      expect(drill?.answer).not.toContain('each £8/£10')
    }
  })

  it('replaces an incorrect gross-profit instruction with a contextual targeting task', () => {
    for (const pack of packs) {
      const pages = pack.learn?.chapters.flatMap(chapter => chapter.groups.flatMap(group => group.pages)) ?? []
      const page = pages.find(item => item.id === 'bus-mkt-005')
      expect(page).toBeDefined()
      const targetingExample = page?.blocks.find(block => block.type === 'worked-example')
      expect(targetingExample?.type).toBe('worked-example')
      if (targetingExample?.type !== 'worked-example') throw new Error('Missing STP targeting example')
      expect(targetingExample.steps.length).toBeGreaterThan(0)
      expect(targetingExample.task).toBe('Explain how the gym should decide whether busy professionals are an appropriate target segment.')
      expect(targetingExample.task).not.toMatch(/gross profit|work out/i)
    }
  })
})
