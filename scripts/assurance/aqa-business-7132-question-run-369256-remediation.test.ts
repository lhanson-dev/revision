import { describe, expect, it } from 'vitest'
import {
  founderQuestionFixInstructions,
  generationPayload,
  numberAppearsIn,
  numbersIn,
  type QuestionTeaching,
  type ResolvedSpec,
} from './aqa-business-7132-slice-questions'

function spec(input: { id: string; itemIds: string[] }): ResolvedSpec {
  return {
    id: input.id,
    family: 'SHORT_ANSWER',
    marks: 4,
    commandWord: 'Explain',
    ao: ['AO1', 'AO2'],
    itemSuffixes: input.itemIds.map((id) => id.split(':').at(-1)!),
    formulaIds: [],
    brief: 'Founder-remediated question.',
    items: input.itemIds.map((id) => ({ id, section: id.split(':')[0].replace('aqa-7132-', ''), label: id.split(':').at(-1)!, kind: 'concept', taughtBy: ['bus-fnd-001'] })),
    nodeIds: ['bus-fnd-001'],
  }
}

describe('AQA 7132 question run 369256 remediation', () => {
  it('parses a negative number when the sign is before a currency symbol', () => {
    expect(numbersIn('Outcome two produces a loss of -£60,000.')).toEqual([-60000])
    expect(numberAppearsIn('Outcome two produces a loss of -£60,000.', -60000)).toBe(true)
    expect(numberAppearsIn('Outcome two produces a loss of -£60,000.', 60000)).toBe(false)
  })

  it('accepts an explicit magnitude both as its full value and as the stated magnitude-unit input', () => {
    expect(numbersIn('The market grew from £48 million to £54 million.')).toEqual([48000000, 54000000])
    expect(numberAppearsIn('The market grew from £48 million to £54 million.', 48)).toBe(true)
    expect(numberAppearsIn('The market grew from £48 million to £54 million.', 54)).toBe(true)
    expect(numberAppearsIn('The market grew from £48 million to £54 million.', 48000000)).toBe(true)
    expect(numberAppearsIn('The market grew from £48 million to £54 million.', 54000000)).toBe(true)
  })

  it('puts the six Founder-decided question corrections into generation input', () => {
    const cases = [
      spec({ id: 'q24', itemIds: ['aqa-7132-3.1.2:social-enterprise', 'aqa-7132-3.1.2:limited-and-unlimited-liability'] }),
      spec({ id: 'q25', itemIds: ['aqa-7132-3.1.2:ordinary-share-capital', 'aqa-7132-3.1.2:role-of-shareholders-and-why-they-invest'] }),
      spec({ id: 'q41', itemIds: ['aqa-7132-3.1.3:government-enterprise-policy', 'aqa-7132-3.1.3:role-of-regulators'] }),
      spec({ id: 'q04', itemIds: ['aqa-7132-3.7.1:globalisation', 'aqa-7132-3.7.1:emerging-economies'] }),
      spec({ id: 'q05', itemIds: ['aqa-7132-3.7.1:exporting', 'aqa-7132-3.7.1:licensing'] }),
      spec({ id: 'q07', itemIds: ['aqa-7132-3.7.1:multinationals', 'aqa-7132-3.7.1:local-responsiveness-versus-cost-reduction-pressure'] }),
    ]
    const teaching: QuestionTeaching[] = []

    for (const current of cases) {
      const fixes = founderQuestionFixInstructions(current)
      expect(fixes, current.id).toHaveLength(1)
      const payload = generationPayload({ spec: current, teaching, feedback: [] })
      expect(payload.founder_fix_instructions, current.id).toEqual(fixes)
    }
  })

  it('does not add a Founder correction to unrelated questions', () => {
    const unrelated = spec({ id: 'q22', itemIds: ['aqa-7132-3.1.2:private-limited-company', 'aqa-7132-3.1.2:public-limited-company'] })
    expect(founderQuestionFixInstructions(unrelated)).toEqual([])
  })
})
