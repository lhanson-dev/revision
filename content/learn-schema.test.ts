import { describe, expect, it } from 'vitest'
import { learnBlockSchema, learnCourseSchema, learnPageSchema } from './learn-schema'
import { learn } from './business/aqa-a-level/shared/learn'

const quickCheck = {
  type: 'quick-check',
  question: 'Contribution per unit is…',
  options: [
    { id: 'a', text: 'Selling price minus variable cost per unit' },
    { id: 'b', text: 'Selling price minus fixed cost per unit' },
  ],
  correctOptionId: 'a',
  explanation: 'It is what each sale adds towards fixed costs.',
}

describe('Learn quick-check block', () => {
  it('accepts a question with options, a correct option and an explanation', () => {
    expect(learnBlockSchema.safeParse(quickCheck).success).toBe(true)
  })

  it('needs between two and six options', () => {
    expect(learnBlockSchema.safeParse({ ...quickCheck, options: [quickCheck.options[0]] }).success).toBe(false)
    const seven = Array.from({ length: 7 }, (_, index) => ({ id: `o${index}`, text: `Option ${index}` }))
    expect(learnBlockSchema.safeParse({ ...quickCheck, options: seven, correctOptionId: 'o0' }).success).toBe(false)
  })

  it('rejects a correct option that is not one of the options', () => {
    const result = learnBlockSchema.safeParse({ ...quickCheck, correctOptionId: 'z' })
    expect(result.success).toBe(false)
    expect(JSON.stringify(result.error?.issues)).toContain('correctOptionId must be the id of one of the options')
  })

  it('rejects duplicate option ids', () => {
    const result = learnBlockSchema.safeParse({ ...quickCheck, options: [{ id: 'a', text: 'One' }, { id: 'a', text: 'Two' }] })
    expect(result.success).toBe(false)
  })

  it('needs an explanation, so feedback always says why', () => {
    expect(learnBlockSchema.safeParse({ ...quickCheck, explanation: '' }).success).toBe(false)
    const withoutExplanation: Record<string, unknown> = { ...quickCheck }
    delete withoutExplanation.explanation
    expect(learnBlockSchema.safeParse(withoutExplanation).success).toBe(false)
  })

  it('has no score, mark or evidence fields: it is teaching, not evidence', () => {
    const parsed = learnBlockSchema.parse({ ...quickCheck, score: 1, mastery: 1, evidence: true })
    expect(Object.keys(parsed).sort()).toEqual(['correctOptionId', 'explanation', 'options', 'question', 'type'])
  })

  it('sits on a page beside the existing blocks', () => {
    const page = {
      id: 'contribution', topicId: 'finance', title: 'Contribution', orientation: 'What each sale adds.',
      blocks: [{ type: 'explanation', paragraphs: ['Contribution is selling price minus variable cost.'] }, quickCheck],
    }
    expect(learnPageSchema.safeParse(page).success).toBe(true)
  })

  it('leaves all existing Business Learn content valid and unchanged', () => {
    // `learn` is parsed with the schema when it loads, so a break would already have thrown on import.
    expect(learnCourseSchema.safeParse(learn).success).toBe(true)
    const types = new Set(learn.chapters.flatMap((chapter) => chapter.groups.flatMap((group) => group.pages.flatMap((page) => page.blocks.map((block) => block.type)))))
    expect(types.has('quick-check')).toBe(false)
  })
})
