import { describe, expect, it } from 'vitest'
import { checkCoverage, matches, normalise, validateItems } from './check-aqa-business-7132-item-coverage.mjs'

const node = (subject_id, extra = {}) => ({ subject_id, title: '', teaching_content: {}, quantitative_content: { methods: [] }, models_frameworks: [], ...extra })
const requirements = [{ source_section: '3.5.2', mapped_subject_node_ids: ['FIN-A'] }]

describe('item-level coverage matching', () => {
  it('ignores hyphens, apostrophes and case', () => {
    expect(matches(normalise("Break-even output and Porter's Five Forces"), 'break even')).toBe(true)
    expect(matches(normalise("Porter's Five Forces"), 'porters five forces')).toBe(true)
  })

  it('requires short abbreviations to be whole words', () => {
    expect(matches(normalise('The ARR uses average profit'), 'arr')).toBe(true)
    expect(matches(normalise('A financing arrangement'), 'arr')).toBe(false)
    expect(matches(normalise('Bank loans are repaid'), 'loan')).toBe(true)
  })

  it('allows longer phrases to match as stems', () => {
    expect(matches(normalise('Franchising grants a brand'), 'franchis')).toBe(true)
  })
})

describe('item-level coverage classification', () => {
  const items = [
    { id: 'f1', section: '3.5.2', label: 'Margin of safety', kind: 'formula', match: ['margin of safety'] },
    { id: 'f2', section: '3.5.2', label: 'Contribution', kind: 'formula', match: ['contribution'] },
    { id: 'c1', section: '3.5.2', label: 'Budgets', kind: 'concept', match: ['budget'] },
    { id: 'c2', section: '3.5.2', label: 'Crowdfunding', kind: 'concept', match: ['crowdfunding'] },
  ]
  const nodes = new Map([
    ['FIN-A', node('FIN-A', {
      teaching_content: { core_explanation: 'Budgets plan activity. Contribution helps break-even thinking.' },
      quantitative_content: { methods: [{ name: 'Margin of safety', formula: 'actual output − break-even output' }] },
    })],
    ['FIN-B', node('FIN-B', { teaching_content: { definitions: ['crowdfunding: many small investors online'] } })],
  ])
  const byId = Object.fromEntries(checkCoverage({ items, requirements, nodes }).map((result) => [result.id, result]))

  it('covers a formula only when a mapped node has a method with a formula', () => {
    expect(byId.f1.status).toBe('covered')
    expect(byId.f2.status).toBe('mentioned_not_taught')
  })

  it('covers a concept named in a mapped node', () => {
    expect(byId.c1.status).toBe('covered')
  })

  it('reports an item found only in an unmapped node', () => {
    expect(byId.c2).toMatchObject({ status: 'found_in_unmapped_node', found_in: ['FIN-B'] })
  })

  it('rejects items for unknown sections and sections without items', () => {
    const errors = validateItems({ items: [{ id: 'x', section: '9.9.9', label: 'X', kind: 'concept', match: ['x'] }] }, requirements, nodes)
    expect(errors).toEqual(expect.arrayContaining(['x refers to unknown section 9.9.9', 'section 3.5.2 has no named items']))
  })
})
