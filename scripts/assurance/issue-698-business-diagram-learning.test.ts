import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import paper1 from '../../content/business/aqa-a-level/paper-1'
import { buildQuestionPool } from '../../src/app/practice-questions'
import paper2 from '../../content/business/aqa-a-level/paper-2'
import paper3 from '../../content/business/aqa-a-level/paper-3'

/**
 * #698: exact-source AQA 7132 skill examples.
 *
 * The point of these assertions is mathematical reproducibility and verifying
 * the *published pack* exposes the changed learning and Practice. Passing tests
 * cannot establish drawn-diagram performance, semantic completeness or human
 * educational assurance; the current Practice cards reveal worked answers.
 */
type SourceManifest = { courses: Array<{ specification_code: string; pdf_sha256: string; sections: Record<string, number> }> }
type Slice = {
  node_id: string
  learn: { sections: Array<{ heading: string; body: string; item_ids: string[] }> }
  practice: { items: Array<{ id: string; capability: string; item_ids: string[]; prompt: string; answer: string; explanation: string }> }
}

function file<T>(path: string): T {
  return JSON.parse(readFileSync(join(process.cwd(), path), 'utf8')) as T
}

const source = file<SourceManifest>('research/specification-to-learner/aqa-2027-source-manifest.json')
const network = file<Slice>('content-factory/slices/aqa-7132-3.10/learn-practice/bus-evi-008.json')
const breakeven = file<Slice>('content-factory/slices/aqa-7132-3.5/learn-practice/bus-fin-004.json')

const packs = [paper1, paper2, paper3]
function cardId(nodeId: string, id: string) {
  return (`fast-${nodeId}-${id}`).replace(/[^a-z0-9-]+/gi, '-').toLowerCase()
}
function findPractice(slice: Slice, id: string) {
  const result = slice.practice.items.find((item) => item.id === id)
  expect(result, `Expected practice item ${id} in ${slice.node_id}`).toBeDefined()
  return result!
}
function assertLivePackWiring(slice: Slice, practiceId: string, treatmentHeading: string) {
  const card = cardId(slice.node_id, practiceId)
  for (const pack of packs) {
    const pages = pack.learn.chapters.flatMap((chapter) => chapter.groups.flatMap((group) => group.pages))
    const page = pages.find((entry) => entry.id === slice.node_id)
    expect(page, `Missing Learn page ${slice.node_id} from ${pack.manifest.id}`).toBeDefined()
    const block = page!.blocks.find((entry) => entry.type === 'explanation' && entry.heading === treatmentHeading)
    expect(block, `Missing worked explanation ${treatmentHeading} from ${pack.manifest.id}`).toBeDefined()
    const item = pack.flashcards.find((entry) => entry.id === card)
    expect(item, `Missing Practice card ${card} from ${pack.manifest.id}`).toBeDefined()
    expect(item?.prompt).toBe(findPractice(slice, practiceId).prompt)
    expect(item?.answer).toContain(findPractice(slice, practiceId).answer)
  }
}

describe('Issue #698 AQA 7132 original graph construction and amendment', () => {
  it('pins to the verified exact source edition, rather than an arbitrary current edition', () => {
    const business = source.courses.find((course) => course.specification_code === '7132')
    expect(business?.pdf_sha256).toBe('3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332')
    expect(business?.sections['3.5.2']).toBe(20)
    expect(business?.sections['3.10.3']).toBe(31)
  })

  it('solves activity-on-arrow timing and changed-duration outcomes independently', () => {
    // A(2) -> B(4) or C(3), then both before D(2).
    const a = 2, b = 4, c = 3, d = 2
    const earliest = [0, a, a + c, Math.max(a + b, a + c), Math.max(a + b, a + c) + d]
    const latest = [0, a, earliest[3], earliest[3], earliest[4]]
    expect(earliest).toEqual([0, 2, 5, 6, 8])
    expect(latest).toEqual([0, 2, 6, 6, 8])
    expect(latest[2] - earliest[1] - c).toBe(1)
    const changed = 5
    const revisedDuration = Math.max(a + b, a + changed) + d
    expect(revisedDuration).toBe(9)
    expect(a + changed + d).toBe(revisedDuration)
    expect(revisedDuration - (a + b + d)).toBe(1)
    const teach = network.learn.sections.find((entry) => entry.heading === 'Complete activity-on-arrow construction and timing example')
    expect(teach?.body).toContain('dummy')
    expect(teach?.body).toContain('E4=max(E2+4,E3+0)')
    expect(teach?.item_ids).toContain('aqa-7132-3.10.3:amending-network-diagrams')
    const construct = findPractice(network, 'p-construction-activity-on-arrow')
    expect(construct.capability).toBe('construction')
    expect(construct.prompt).toMatch(/construct (?:and label )?an activity-on-arrow diagram/i)
    expect(construct.prompt).toMatch(/earliest and latest/i)
    expect(construct.answer).toContain('1→2 A(2)')
    const amend = findPractice(network, 'p-amend-activity-on-arrow')
    expect(amend.prompt).toMatch(/duration/i)
    expect(amend.answer).toContain('9 days')
    expect(amend.explanation).toMatch(/recalculate/i)
  })

  it('solves all break-even plotted coordinates and each independent amendment', () => {
    const fixed = 5000, price = 16, variable = 6, forecast = 650
    const contribution = price - variable
    const output = fixed / contribution
    expect(output).toBe(500)
    expect(fixed + variable * output).toBe(price * output)
    expect(forecast - output).toBe(150)
    expect(forecast * contribution).toBe(6500)
    expect(forecast * price - (fixed + forecast * variable)).toBe(1500)
    // Alternative A: price changes only.
    expect(fixed / (18 - variable)).toBeCloseTo(416.6666667, 6)
    expect(Math.ceil(fixed / (18 - variable))).toBe(417)
    expect(500 * 18).toBe(9000)
    // Alternative B: variable cost changes only.
    expect(fixed / (price - 8)).toBe(625)
    expect(fixed + 500 * 8).toBe(9000)
    // Alternative C: output changes only.
    expect(700 - output).toBe(200)
    expect(price * 700 - (fixed + variable * 700)).toBe(2000)
    const teach = breakeven.learn.sections.find((entry) => entry.heading === 'Construct and amend a break-even chart from figures')
    expect(teach?.body).toContain('Fixed-cost line')
    expect(teach?.body).toContain('Total-cost line')
    expect(teach?.body).toContain('Total-revenue line')
    expect(teach?.body).toContain('change')
    const draw = findPractice(breakeven, 'construct-break-even-chart-from-data')
    expect(draw.capability).toBe('construction')
    expect(draw.prompt).toMatch(/on paper construct a labelled break-even chart/i)
    expect(draw.answer).toContain('(500, £8,000)')
    const amend = findPractice(breakeven, 'amend-break-even-chart-price-cost-and-output')
    expect(amend.prompt).toContain('ALTERNATIVE')
    expect(amend.answer).toContain('417')
    expect(amend.answer).toContain('625')
    expect(amend.answer).toContain('200 sandwiches')
  })

  it('actually routes the original worked lessons and new Practice cards through all three published Business packs', () => {
    assertLivePackWiring(network, 'p-amend-activity-on-arrow', 'Complete activity-on-arrow construction and timing example')
    assertLivePackWiring(breakeven, 'construct-break-even-chart-from-data', 'Construct and amend a break-even chart from figures')
    assertLivePackWiring(breakeven, 'amend-break-even-chart-price-cost-and-output', 'Construct and amend a break-even chart from figures')
  })

  it('adds independently scored finance Practice through the ordinary question-bank adapter', () => {
    for (const pack of packs) {
      const bank = pack.practiceBank ?? []
      const ids = ['aqa7132-3.5-q15', 'aqa7132-3.5-q16', 'aqa7132-3.5-q17']
      const pool = buildQuestionPool({ topicId: 'finance', topicOrder: 5, coursePack: [], bank })
      for (const id of ids) {
        expect(pool.some((question) => question.id === id), `Missing active ${id} in ${pack.manifest.id}`).toBe(true)
      }
      const priceChange = pool.find((question) => question.id === ids[0])
      expect(priceChange?.type).toBe('multiple-choice')
      if (priceChange?.type === 'multiple-choice') expect(priceChange.correctOption).toBe(1)
      const revisedBreakEven = pool.find((question) => question.id === ids[1])
      expect(revisedBreakEven?.type).toBe('calculation')
      if (revisedBreakEven?.type === 'calculation') expect(revisedBreakEven.expected).toBe(625)
      const delayedReceivable = pool.find((question) => question.id === ids[2])
      expect(delayedReceivable?.type).toBe('multiple-choice')
      if (delayedReceivable?.type === 'multiple-choice') expect(delayedReceivable.correctOption).toBe(0)
    }
  })
})
