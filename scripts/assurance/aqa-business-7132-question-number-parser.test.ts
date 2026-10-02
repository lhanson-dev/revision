import { describe, expect, it } from 'vitest'
import { numbersIn, validateQuestion, type QuestionSpec } from './aqa-business-7132-slice-questions'

describe('AQA 7132 question number parsing regressions', () => {
  it('preserves a negative sign written before a currency symbol', () => {
    expect(numbersIn('A 0.35 probability of a -£60,000 outcome.')).toContain(-60000)
    expect(numbersIn('A 0.35 probability of a −£60,000 outcome.')).toContain(-60000)
  })

  it('accepts equivalent full-value and same-unit shorthand for magnitude words', () => {
    const values = numbersIn('The market grew from £48 million to £54 million.')
    expect(values).toEqual([48000000, 54000000])
  })

  it('accepts the retained market-growth question when calculations use millions as the unit scale', () => {
    const spec: QuestionSpec = {
      id: 'q02',
      family: 'SHORT_ANSWER',
      marks: 3,
      commandWord: 'Calculate',
      ao: ['AO2'],
      itemSuffixes: ['market-growth'],
      formulaIds: ['market_growth'],
      brief: 'Calculate market growth.',
    }
    const question = {
      id: 'q02',
      family: 'SHORT_ANSWER' as const,
      command_word: 'Calculate',
      marks: 3,
      ao_tags: ['AO2'] as const,
      context: 'TidyNest Ltd sells kitchen and storage products in the UK.',
      stem: 'The market was £48 million last year and £54 million this year. Calculate the market growth rate. Show your working.',
      table: null,
      options: [],
      mark_scheme: {
        type: 'points' as const,
        correct_option: '',
        option_rationale: [],
        points: [
          { marks: 1, descriptor: '54 - 48 = 6', accept: [] },
          { marks: 1, descriptor: '6 / 48 × 100', accept: [] },
          { marks: 1, descriptor: '12.5%', accept: [] },
        ],
        levels: [],
        indicative_content: [],
        model_answer: '(54 - 48) / 48 × 100 = 12.5%.',
      },
      calcs: [{
        label: 'Market growth',
        formula_id: 'market_growth' as const,
        inputs: [
          { name: 'market_size_this_period', value: 54 },
          { name: 'market_size_last_period', value: 48 },
        ],
        stated_answer: 12.5,
        unit: 'percent',
      }],
    }
    expect(validateQuestion(question, spec).map((finding) => finding.check_id)).not.toContain('input_in_question')
  })
})
