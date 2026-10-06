import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { aqaBusinessQuestionBank } from '../../content/business/aqa-a-level/shared/fast-path-questions.ts'
import { specItemLabel } from '../../src/app/spec-item-labels.ts'

const named = JSON.parse(readFileSync(new URL('../../research/aqa-business-7132/2027/NAMED_ITEMS.json', import.meta.url), 'utf8')) 

describe('specification item labels', () => {
  it('match the item-coverage list, so the two cannot drift apart', () => {
    named.items.forEach((item) => expect(specItemLabel(item.id), item.id).toBe(item.label))
  })

  it('cover every item the question bank tests', () => {
    const known = new Set(named.items.map((item) => item.id))
    const missing = [...new Set(aqaBusinessQuestionBank.flatMap((record) => record.target_item_ids))].filter((id) => !known.has(id))
    expect(missing).toEqual([])
  })

  it('make an unknown item readable instead of showing its id', () => {
    expect(specItemLabel('aqa-7132-9.9.9:some-new-item')).toBe('Some new item')
  })
})
