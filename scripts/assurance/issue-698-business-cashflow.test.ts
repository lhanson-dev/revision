import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import paper1 from '../../content/business/aqa-a-level/paper-1'
import paper2 from '../../content/business/aqa-a-level/paper-2'
import paper3 from '../../content/business/aqa-a-level/paper-3'

const slices = JSON.parse(readFileSync(join(process.cwd(), 'content-factory/slices/aqa-7132-3.5/learn-practice/bus-fin-005.json'), 'utf8')) as {
  node_id: string
  learn: { sections: Array<{ heading: string; body: string; item_ids: string[] }> }
  practice: { items: Array<{ id: string; prompt: string; answer: string; item_ids: string[] }> }
}

describe('Issue #698: AQA 7132 multi-period cash-flow construction', () => {
  it('independently recalculates and carries forward each period, including a negative balance', () => {
    const incoming = [18000, 12000, 22000]
    const outgoing = [20000, 19000, 14000]
    let opening = 8000
    const results = incoming.map((receipt, i) => {
      const net = receipt - outgoing[i]
      const closing = opening + net
      const row = { opening, receipt, payment: outgoing[i], net, closing }
      opening = closing
      return row
    })
    expect(results.map((row) => row.net)).toEqual([-2000, -7000, 8000])
    expect(results.map((row) => row.closing)).toEqual([6000, -1000, 7000])
    expect(results[2].opening).toBe(-1000)
    expect(results[1].closing).toBeLessThan(0)
    const amendedReceipts = [18000, 7000, 27000]
    let balance = 8000
    const revised = amendedReceipts.map((receipt, i) => {
      balance += receipt - outgoing[i]
      return balance
    })
    expect(revised).toEqual([6000, -6000, 7000])
    expect(amendedReceipts.reduce((sum, n) => sum + n, 0)).toBe(incoming.reduce((sum, n) => sum + n, 0))
    expect(revised[1] - results[1].closing).toBe(-5000)
  })

  it('binds both original cash-forecast tasks and the complete explanation to the real three AQA Business packs', () => {
    const heading = 'Construct and update a three-month cash-flow forecast'
    const guide = slices.learn.sections.find((s) => s.heading === heading)
    expect(guide).toBeDefined()
    expect(guide?.item_ids).toContain('aqa-7132-3.5.2:cash-flow-forecast')
    expect(guide?.body).toContain('−£6,000')
    const ids = ['p11-three-month-cash-flow-forecast', 'p12-amend-delayed-receivable-forecast']
    for (const id of ids) {
      const item = slices.practice.items.find((x) => x.id === id)
      expect(item).toBeDefined()
      expect(item?.item_ids).toContain('aqa-7132-3.5.2:cash-flow-forecast')
      for (const pack of [paper1, paper2, paper3]) {
        const page = pack.learn.chapters.flatMap((chapter) => chapter.groups.flatMap((group) => group.pages))
          .find((candidate) => candidate.id === slices.node_id)
        expect(page, pack.manifest.id).toBeDefined()
        expect(page?.blocks.some((block) => block.type === 'explanation' && block.heading === heading)).toBe(true)
        const card = pack.flashcards.find((candidate) => candidate.id === `fast-${slices.node_id}-${id}`)
        expect(card, pack.manifest.id).toBeDefined()
        expect(card?.prompt).toBe(item?.prompt)
        expect(card?.answer).toContain(item?.answer)
      }
    }
  })
})
