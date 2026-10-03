import { describe, expect, it } from 'vitest'
import { numbersIn, validateQuestion, type Question, type QuestionSpec } from './aqa-business-7132-slice-questions'

const emptyLevels: Question['mark_scheme']['levels'] = []
const emptyIndicative: string[] = []

const marketGrowthSpec: QuestionSpec = {
  id: 'q02',
  family: 'SHORT_ANSWER',
  marks: 3,
  commandWord: 'Calculate',
  ao: ['AO2'],
  itemSuffixes: ['market-growth'],
  formulaIds: ['market_growth'],
  brief: 'Calculate market growth.',
}

const marketGrowthQuestion: Question = {
  id: 'q02',
  family: 'SHORT_ANSWER',
  command_word: 'Calculate',
  marks: 3,
  ao_tags: ['AO2'],
  context: 'TidyNest Ltd sells kitchen and storage products in the UK.',
  stem: 'The value of the UK kitchen and storage products market was £48 million last year. This year, the value of the same market is £54 million. Calculate the market growth rate. Show your working.',
  table: null,
  options: [],
  mark_scheme: {
    type: 'points',
    correct_option: '',
    option_rationale: [],
    points: [
      { marks: 1, descriptor: 'Increase = £54 million − £48 million = £6 million.', accept: ['£6 million'] },
      { marks: 1, descriptor: 'Uses (£6 million ÷ £48 million) × 100.', accept: ['6 ÷ 48 × 100'] },
      { marks: 1, descriptor: 'Market growth = 12.5%.', accept: ['12.5%'] },
    ],
    levels: emptyLevels,
    indicative_content: emptyIndicative,
    model_answer: 'Market growth = ((£54 million − £48 million) ÷ £48 million) × 100 = 12.5%.',
  },
  calcs: [{
    label: 'Market growth in the UK kitchen and storage products market',
    formula_id: 'market_growth',
    inputs: [
      { name: 'market_size_this_period', value: 54 },
      { name: 'market_size_last_period', value: 48 },
    ],
    stated_answer: 12.5,
    unit: 'percent',
  }],
}

const expectedValueSpec: QuestionSpec = {
  id: 'q03',
  family: 'SHORT_ANSWER',
  marks: 4,
  commandWord: 'Calculate',
  ao: ['AO2'],
  itemSuffixes: ['expected-value', 'net-gain'],
  formulaIds: ['expected_value', 'net_gain'],
  brief: 'Calculate expected value and net gain.',
}

const expectedValueQuestion: Question = {
  id: 'q03',
  family: 'SHORT_ANSWER',
  command_word: 'Calculate',
  marks: 4,
  ao_tags: ['AO2'],
  context: 'Paws & Rest Ltd is considering a launch with a 0.65 probability of a £150,000 outcome and a 0.35 probability of a -£60,000 outcome. The launch costs £20,000.',
  stem: 'Calculate the expected value and then the net gain. Show your working.',
  table: null,
  options: [],
  mark_scheme: {
    type: 'points',
    correct_option: '',
    option_rationale: [],
    points: [
      { marks: 1, descriptor: '0.65 × £150,000 = £97,500 and 0.35 × -£60,000 = -£21,000.', accept: [] },
      { marks: 1, descriptor: 'Expected value = £76,500.', accept: ['£76,500'] },
      { marks: 1, descriptor: 'Net gain = £76,500 − £20,000.', accept: [] },
      { marks: 1, descriptor: 'Net gain = £56,500.', accept: ['£56,500'] },
    ],
    levels: emptyLevels,
    indicative_content: emptyIndicative,
    model_answer: 'Expected value = (0.65 × £150,000) + (0.35 × -£60,000) = £76,500. Net gain = £76,500 − £20,000 = £56,500.',
  },
  calcs: [
    {
      label: 'Expected value',
      formula_id: 'expected_value',
      inputs: [
        { name: 'probability_1', value: 0.65 },
        { name: 'outcome_1', value: 150000 },
        { name: 'probability_2', value: 0.35 },
        { name: 'outcome_2', value: -60000 },
      ],
      stated_answer: 76500,
      unit: '£',
    },
    {
      label: 'Net gain',
      formula_id: 'net_gain',
      inputs: [
        { name: 'expected_value', value: 76500 },
        { name: 'cost_of_option', value: 20000 },
      ],
      stated_answer: 56500,
      unit: '£',
    },
  ],
}

describe('AQA 7132 question numeric regressions', () => {
  it('preserves a negative sign when a currency symbol follows it', () => {
    expect(numbersIn('Possible outcomes are £150,000 and -£60,000.')).toEqual([150000, -60000])
    expect(validateQuestion(expectedValueQuestion, expectedValueSpec).filter((finding) => finding.check_id === 'input_in_question')).toEqual([])
  })

  it('accepts common magnitude scaling for percentage calculations without changing the stated units', () => {
    expect(numbersIn('The market moved from £48 million to £54 million.')).toEqual([48000000, 54000000])
    expect(validateQuestion(marketGrowthQuestion, marketGrowthSpec).filter((finding) => finding.check_id === 'input_in_question')).toEqual([])
  })
})
