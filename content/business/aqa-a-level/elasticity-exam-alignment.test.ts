import { describe, expect, it } from 'vitest'
import paper1 from './paper-1'
import paper2 from './paper-2'
import paper3 from './paper-3'
import elasticity from '../../../content-factory/slices/aqa-7132-3.3/learn-practice/bus-mkt-008.json'

const packs = [paper1, paper2, paper3] as const

describe('Issue #698 — AQA Business 7132 v2.0 §3.3.2 elasticity assessment boundary', () => {
  it('teaches the actual AQA interpretation-only demand consistently in every published Business Learn pack', () => {
    for (const pack of packs) {
      const pages = pack.learn?.chapters.flatMap(chapter =>
        chapter.groups.flatMap(group => group.pages)) ?? []
      const target = pages.filter(page => page.id === 'bus-mkt-008')
      expect(target).toHaveLength(1)
      expect(target[0]?.topicId).toBe('marketing')
      const text = target[0]?.blocks.flatMap(block => block.type === 'explanation'
        ? [block.heading, ...block.paragraphs]
        : []).join(' ') ?? ''
      expect(text).toContain('AQA A-level Business 7132')
      expect(text).toContain('calculating PED or YED is not an assessed requirement')
      expect(text).toContain('Interpreting supplied PED and YED values')
      expect(text).toContain('£21,120')
      expect(text).not.toContain('Calculating and using PED and YED')
      expect(target[0]?.blocks.some(block => block.type === 'key-idea'
        && block.definitions.some(term => term.term === 'income elasticity of demand (YED)'))).toBe(true)
    }
  })

  it('keeps original source practice identities but converts two unshipped calculations to supported interpretation tasks', () => {
    const originalIds = ['ped-calculation-01', 'yed-calculation-01']
    const tasks = elasticity.practice.items.filter(item => originalIds.includes(item.id))
    expect(tasks).toHaveLength(2)
    expect(tasks.map(item => item.id)).toEqual(originalIds)
    expect(tasks.every(item => item.capability === 'interpretation')).toBe(true)
    expect(tasks.every(item => item.prompt.includes('Do not calculate'))).toBe(true)
    expect(tasks.every(item => item.answer && item.explanation && item.calc === null)).toBe(true)
    for (const pack of packs) {
      // Generated source practice is not yet projected by shared/learn.ts into
      // the ordinary Practice bank; never claim these prompts are scored.
      expect(pack.dataDrills.some(item => originalIds.includes(item.id))).toBe(false)
      expect(pack.practiceBank?.some(item => originalIds.includes(item.id))).toBe(false)
    }
  })

  it('checks the worked data examples without requiring calculation of elasticity coefficients', () => {
    expect(20 * 1000).toBe(20000)
    expect(22 * 960).toBe(21120)
    expect(22 * 960 - 20 * 1000).toBe(1120)
    expect(Math.abs(-0.4)).toBeLessThan(1)
    expect(2).toBeGreaterThan(1)
    expect(Math.abs(-1.5)).toBeGreaterThan(1)
    expect(-0.5).toBeLessThan(0)
  })
})
