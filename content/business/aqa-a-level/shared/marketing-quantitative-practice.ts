/** #698 AQA Business 7132 v2.0 §§3.3.1–3.3.2, printed pp15–16.
 * Two new, genuinely different single-target Marketing final-number checks to
 * supplement already published scored size/growth calculations.
 * No working, business interpretation, or exam method marks are awarded.
 * Source PDF is REFERENCE_ONLY; no protected exam items are reproduced.
 */
import { structuredPracticeBankRecordSchema } from '../../../structured-practice-bank'

export const businessMarketingQuantitativeCases = [
  {
    id: 'market-size-from-share-02',
    target: 'aqa-7132-3.3.1:market-size',
    context: 'A specialist office-furniture supplier makes £3.5 million annual sales in a consistently defined UK market. Its market share by sales value is 14% for the same period.',
    stem: 'Calculate the size of that total market by value in pounds. Enter one final number; only your result is scored.',
    expected: 25000000,
    unit: '£',
    working: 'Market share = firm sales ÷ market sales × 100. Rearrange: market size = £3,500,000 ÷ 0.14 = £25,000,000. Do not multiply sales by 14 or divide by 14 rather than 0.14.',
  },
  {
    id: 'market-growth-decline-02',
    target: 'aqa-7132-3.3.1:market-growth',
    context: 'The total value of a regional leisure-travel market falls from £75 million to £63 million over one year, using the same boundaries and measurement basis.',
    stem: 'Calculate the signed percentage change in the total market value. Enter a negative number if the market contracted; only the final value is marked.',
    expected: -16,
    unit: '%',
    working: 'Percentage market growth = (£63m − £75m) ÷ £75m × 100 = −16%. A fall has a negative sign. This is the market’s change, not the sales growth rate of any particular firm.',
  },
] as const

export const businessMarketingQuantitativeBank = businessMarketingQuantitativeCases.map(item =>
  structuredPracticeBankRecordSchema.parse({
    id: item.id,
    namespace: 'rev7132',
    batch: '3.3.2',
    label: 'Revision-original Marketing independently scored final-number calculation',
    confidence_label: 'Deterministic final number only; method and evaluation unassessed',
    topic_id: 'marketing',
    target_item_ids: [item.target],
    target_node_ids: ['bus-mkt-002'],
    question: {
      id: item.id,
      family: 'SHORT_ANSWER',
      command_word: 'Calculate',
      marks: 1,
      ao_tags: ['AO2'],
      context: item.context,
      stem: item.stem,
      table: null,
      options: [],
      calcs: [{ stated_answer: item.expected, unit: item.unit }],
      mark_scheme: {
        type: 'points',
        correct_option: '',
        option_rationale: [],
        points: [{ marks: 1, descriptor: 'Correct final number in the specified market definition and unit.', accept: [String(item.expected)] }],
        levels: [],
        indicative_content: [],
        model_answer: item.working,
      },
    },
  }),
)
