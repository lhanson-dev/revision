import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import paper1 from './paper-1'
import paper2 from './paper-2'
import paper3 from './paper-3'
import { businessOperationsInventoryCases } from './shared/operations-inventory-calculations'
import { bankQuestionId, buildQuestionPool, objectiveItemMappingForPractice } from '../../../src/app/practice-questions'
import { checkCalculation } from '../../../src/app/practice-calculation'
import { findCrossing } from '../../../src/app/ui/learn/chart-geometry'
import { LearnBlock } from '../../../src/app/ui/learn/LearnBlock'

const packs = [paper1, paper2, paper3] as const
const lesson = 'operations-inventory-control-chart'
const targets = [
  'aqa-7132-3.4.5:re-order-quantity',
  'aqa-7132-3.4.5:lead-time',
]

describe('Issue #698 Business §3.4.5 — published inventory chart and bounded objective checks', () => {
  it('shows an actual, accessible, correctly ordered inventory sawtooth in all three Business Learn packs', () => {
    for (const pack of packs) {
      const pages = pack.learn!.chapters.flatMap(chapter => chapter.groups.flatMap(group => group.pages))
      const page = pages.find(item => item.id === lesson)
      expect(page?.topicId).toBe('operations')
      expect(page?.sourceSectionIds).toContain('aqa-7132-3-4-5')
      const chart = page?.blocks.find(block => block.type === 'quantitative')
      expect(chart?.type).toBe('quantitative')
      if (!chart || chart.type !== 'quantitative') continue
      expect(chart.xLabel).toBe('Day')
      expect(chart.yLabel).toBe('Packets in stock')
      expect(chart.series.map(x => x.name)).toEqual(['Stock on hand', 'Re-order level', 'Buffer stock level'])
      const stock = chart.series[0].points.map(({ x, y }) => [x, y])
      expect(stock).toEqual([[0, 1800], [5, 1300], [10, 800], [16, 200], [16, 1800], [20, 1400]])
      expect(chart.series[1].points.every(point => point.y === 800)).toBe(true)
      expect(chart.series[2].points.every(point => point.y === 200)).toBe(true)
      expect(findCrossing(chart.series[0].points, chart.series[1].points)?.x).toBe(10)
      expect(16 - 10).toBe(6)
      expect(1800 - 200).toBe(1600)
      const svgHtml = renderToStaticMarkup(<LearnBlock block={chart} />)
      expect(svgHtml).toContain('role="img"')
      expect(svgHtml).toContain('aria-label="Stock level over time:')
      expect(svgHtml).toContain('Show the data')
      expect(svgHtml).toContain('data-series="3"')
      expect(svgHtml).toContain('learn-chart__axis-label--y')
      expect(svgHtml).toContain('>Packets in stock</text>')
      expect(svgHtml).toContain('transform="rotate(-90')
      expect(svgHtml).toContain('Crossing point')
      expect(page!.blocks.filter(block => block.type === 'quick-check')).toHaveLength(2)
      expect(page!.blocks.some(block => block.type === 'worked-example')).toBe(true)
      expect(JSON.stringify(page)).toContain('unscored example')
      // Existing teaching and historical question identities must not disappear.
      expect(pages.filter(p => p.id === 'bus-ops-006')).toHaveLength(1)
    }
  })

  it('scores four original final numbers against only their source-named quantities, never visual chart mastery', () => {
    expect(businessOperationsInventoryCases.map(item => item.expected)).toEqual([
      1800 - 200,
      1325 - 175,
      11 - 4,
      13 - 8,
    ])
    for (const target of targets) {
      const cases = businessOperationsInventoryCases.filter(item => item.target === target)
      expect(cases).toHaveLength(2)
      expect(new Set(cases.map(item => item.context)).size).toBe(2)
      expect(new Set(cases.map(item => item.expected)).size).toBe(2)
    }
    for (const pack of packs) {
      const scoped = pack.practiceBank!.filter(record => record.namespace === 'rev7132' && record.batch === '3.4.5')
      expect(scoped.map(bankQuestionId)).toEqual(businessOperationsInventoryCases.map(x => 'rev7132-3.4.5-' + x.id))
      expect(new Set(pack.practiceBank!.map(bankQuestionId)).size).toBe(pack.practiceBank!.length)
      const pool = buildQuestionPool({
        topicId: 'operations', topicOrder: 4,
        coursePack: pack.questions, bank: pack.practiceBank,
      })
      for (const item of businessOperationsInventoryCases) {
        const question = pool.find(q => q.id === 'rev7132-3.4.5-' + item.id)
        expect(question?.type).toBe('calculation')
        if (!question || question.type !== 'calculation') continue
        expect(question.specItemIds).toEqual([item.target])
        expect(question.nodeIds).toEqual([lesson])
        expect(objectiveItemMappingForPractice(question)?.singleTargetSpecItemId).toBe(item.target)
        expect(question.expected).toBe(item.expected)
        expect(question.marks).toBe(1)
        expect(question.exactInteger).toBe(true)
        expect(checkCalculation(String(item.expected), question.accepted, item.unit, question.exactInteger).status).toBe('right')
        expect(checkCalculation(String(item.expected + 1), question.accepted, item.unit, question.exactInteger).status).toBe('wrong')
        expect(question.context).not.toContain('Read the actual plotted chart')
        expect(question).not.toHaveProperty('chartInterpreted')
        expect(question).not.toHaveProperty('ao3')
      }
      // Unmodified pre-existing bank questions retain their exact identities.
      const originals = pack.practiceBank!.filter(r => r.batch === '3.4' && ['q13', 'q20', 'q43'].includes(r.id))
      expect(originals.map(r => r.id)).toEqual(['q13', 'q20', 'q43'])
      const originalQ20 = originals.find(record => record.id === 'q20')
      expect(originalQ20?.question.id).toBe('q20')
      expect(originalQ20?.question.marks).toBe(9)
      expect(originalQ20?.target_item_ids).toEqual(['aqa-7132-3.4.5:inventory-control-chart'])
      const q20Text = JSON.stringify(originalQ20?.question)
      expect(q20Text).toContain('re-order trigger')
      expect(q20Text).toContain('700 − (4 × 100) = 300')
      expect(q20Text).toContain('500-filter re-order trigger')
      expect(q20Text).toContain('conditional')
      expect(q20Text).toContain('not change inventory or save money')
      expect(pack.exams).toHaveLength(1)
      expect(pack.exams[0].totalMarks).toBe(100)
    }
  })
})
