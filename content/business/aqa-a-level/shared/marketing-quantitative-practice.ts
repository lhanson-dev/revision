/** #698 AQA Business 7132 v2.0 §§3.3.1–3.3.2, printed pp15–16.
 * Four original, single-target Marketing final-number calculations where the
 * published bank previously relied on unscored/self-marked size/growth methods.
 * No working, business interpretation, or exam method marks are awarded.
 * Source PDF is REFERENCE_ONLY; no protected exam items are reproduced.
 */
import { structuredPracticeBankRecordSchema } from '../../../structured-practice-bank'

export const businessMarketingQuantitativeCases = [
  {
    id: 'market-size-sum-01',
    target: 'aqa-7132-3.3.1:market-size',
    context: 'A defined local market for bicycle servicing has three providers. Over the same year, their sales by value are £620,000, £730,000 and £850,000. Assume these are all providers in that market.',
    stem: 'Calculate the total annual market size by sales value in pounds. Enter one number. Your workings are not marked.',
    expected: 2200000,
    unit: '£',
    working: 'Market size is total sales across all firms in the defined market: £620,000 + £730,000 + £850,000 = £2,200,000. The result is market size by value, not one firm’s sales or market share.',
  },
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
    id: 'market-growth-rise-01',
    target: 'aqa-7132-3.3.1:market-growth',
    context: 'The total annual sales value of a defined UK home-repair service market rises from £32 million one year to £36.8 million the next. The market definition is unchanged.',
    stem: 'Calculate the percentage growth of the whole market. Enter the number of percent, without the % sign. Only the final percentage is scored.',
    expected: 15,
    unit: '%',
    working: 'Market growth = (new market size − original market size) ÷ original size × 100 = (£36.8m − £32m) ÷ £32m × 100 = 15%. Use the earlier £32m as the denominator, not the new size.',
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
