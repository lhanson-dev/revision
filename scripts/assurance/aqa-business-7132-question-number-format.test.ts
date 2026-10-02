import { describe, expect, it } from 'vitest'
import {
  calculationNumbersIn,
  validateQuestion,
  type Question,
  type QuestionSpec,
} from './aqa-business-7132-slice-questions'

const spec: QuestionSpec = {
  id: 'q04',
  family: 'MCQ',
  marks: 1,
  commandWord: 'Calculate',
  ao: ['AO2'],
  itemSuffixes: ['market-capitalisation'],
  formulaIds: ['market_capitalisation'],
  brief: 'Calculate market capitalisation from shares in issue and share price.',
}

const question: Question = {
  id: 'q04',
  family: 'MCQ',
  command_word: 'Calculate',
  marks: 1,
  ao_tags: ['AO2'],
  context: 'Northshore Cycles plc is a quoted UK bicycle manufacturer.',
  stem: 'Northshore Cycles plc has 18,000,000 shares in issue. Its current share price is £3.40. Calculate its market capitalisation.',
  table: null,
  options: [
    { label: 'A', text: '£21.60 million' },
    { label: 'B', text: '£54.00 million' },
    { label: 'C', text: '£61.20 million' },
    { label: 'D', text: '£3.40 million' },
  ],
  mark_scheme: {
    type: 'single_option',
    correct_option: 'C',
    option_rationale: [
      'A is wrong because it does not multiply the full number of shares in issue by the current share price.',
      'B is wrong because it uses an incorrect share price or calculation.',
      'C is correct: £61.20 million.',
      'D is wrong because it gives only the current price of one share, not the value of all shares in issue.',
    ],
    points: [],
    levels: [],
    indicative_content: [],
    model_answer: '18,000,000 × £3.40 = £61.20 million.',
  },
  calcs: [
    {
      label: 'Market capitalisation of Northshore Cycles plc',
      formula_id: 'market_capitalisation',
      inputs: [
        { name: 'shares_in_issue', value: 18_000_000 },
        { name: 'share_price', value: 3.4 },
      ],
      stated_answer: 61_200_000,
      unit: '£',
    },
  ],
}

describe('AQA 7132 question calculation number formats', () => {
  it('interprets explicit magnitude words as their numeric value', () => {
    expect(calculationNumbersIn('£61.20 million')).toEqual([61_200_000])
    expect(calculationNumbersIn('2.5 thousand and 1.2 billion')).toEqual([2_500, 1_200_000_000])
    expect(calculationNumbersIn('£61,200,000 and 3.4%')).toEqual([61_200_000, 3.4])
  })

  it('accepts the exact previously rejected £61.20 million market-capitalisation MCQ', () => {
    expect(validateQuestion(question, spec)).toEqual([])
  })

  it('still rejects a wrong magnitude and detects two numerically equivalent correct options', () => {
    const wrongMagnitude: Question = {
      ...question,
      options: question.options.map((option) => option.label === 'C' ? { ...option, text: '£61.20 thousand' } : option),
    }
    expect(validateQuestion(wrongMagnitude, spec).map((finding) => finding.check_id)).toContain('mcq_key_matches_calculation')

    const duplicate: Question = {
      ...question,
      options: question.options.map((option) => option.label === 'D' ? { ...option, text: '£61,200,000' } : option),
    }
    expect(validateQuestion(duplicate, spec).map((finding) => finding.check_id)).toContain('mcq_single_key')
  })
})
