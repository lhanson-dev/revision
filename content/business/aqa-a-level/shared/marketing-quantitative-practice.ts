/** #698 AQA Business 7132 v2.0 §§3.3.1–3.3.2, printed pp15–16.
 * Two existing size/market-growth checks and two original, separately
 * source-mapped firm-sales-growth checks. All independently score the final number only.
 * No working, business interpretation, or exam method marks are awarded.
 * Source PDF is REFERENCE_ONLY; no protected exam items are reproduced.
 */
import { structuredPracticeBankRecordSchema } from '../../../structured-practice-bank'
import { salesGrowthSourceRequirement } from './marketing-sales-growth-source'

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
  {
    id: 'firm-sales-growth-increase-01',
    target: salesGrowthSourceRequirement.id,
    context: 'An independent stationery manufacturer increases its annual sales revenue from £6 million to £7.5 million. Over the same period, total sales of the wider stationery market increase from £40 million to £56 million. Both measures use sales value and the same year boundaries.',
    stem: 'Calculate the manufacturer’s own sales growth as a percentage, not the growth rate of the whole market. Enter the percentage number; only the final result is marked.',
    expected: 25,
    unit: '%',
    working: 'Firm sales growth = (this year’s firm sales − last year’s firm sales) ÷ last year’s firm sales × 100 = (£7.5m − £6m) ÷ £6m × 100 = 25%. The whole market grew by (£56m − £40m) ÷ £40m × 100 = 40%; that is not the firm’s sales growth. A rising sales figure can accompany falling market share.',
  },
  {
    id: 'firm-sales-growth-decline-02',
    target: salesGrowthSourceRequirement.id,
    context: 'A single specialist bicycle-accessories retailer has annual sales revenue of £160,000 in the earlier year and £140,000 in the following year. The total regional accessories market rises from £2 million to £2.2 million over those same two years.',
    stem: 'Calculate the signed percentage change in this retailer’s own sales, using the earlier year as the base. Enter a negative number for declining sales; only the final result is marked.',
    expected: -12.5,
    unit: '%',
    working: 'The retailer’s sales growth = (£140,000 − £160,000) ÷ £160,000 × 100 = −12.5%. A negative result means the firm’s sales fell. The total market grew by (£2.2m − £2m) ÷ £2m × 100 = 10%, which must not be substituted for the firm’s rate.',
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
