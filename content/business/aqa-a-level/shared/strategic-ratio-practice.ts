/**
 * #698 / AQA Business 7132 v2.0 §3.7.2, printed p25.
 * Twelve original, independent typed final-number exercises, two for each
 * source-named financial ratio. REFERENCE_ONLY source, no protected text.
 * A one-mark final answer does not verify a worked method, interpretation,
 * comparative judgement, written AO3/AO4 or mastery. Educational A3 HOLD.
 */
import { structuredPracticeBankRecordSchema } from '../../../structured-practice-bank'

export const businessStrategicRatioCases = [
  {
    id: 'roce-cycle-01', target: 'return-on-capital-employed',
    context: 'A cycle-parts manufacturer reports annual operating profit of £420,000, total equity of £1,500,000 and non-current liabilities of £600,000. Assume these figures are measured on a consistent basis.',
    stem: 'Calculate return on capital employed (ROCE) as a percentage. First determine capital employed from equity and non-current liabilities. Type only the final percentage number, without %. The full method is not automatically marked.',
    expected: 20, unit: '%',
    working: 'Capital employed = £1,500,000 + £600,000 = £2,100,000. ROCE = £420,000 ÷ £2,100,000 × 100 = 20%. Compare this with prior years, rivals and required returns before claiming good performance.',
  },
  {
    id: 'roce-studio-02', target: 'return-on-capital-employed',
    context: 'An independent design-and-print business earns annual operating profit of £192,000. Its equity totals £720,000 and non-current liabilities £480,000.',
    stem: 'Calculate the business’s ROCE as a percentage. Type the final percentage number without %. Only that final number is scored.',
    expected: 16, unit: '%',
    working: 'Capital employed = £720,000 + £480,000 = £1,200,000. ROCE = £192,000 ÷ £1,200,000 × 100 = 16%. An increase in ROCE may reflect a change in profit, capital employed or both.',
  },
  {
    id: 'current-ratio-cafe-01', target: 'current-ratio',
    context: 'At its year end a catering firm has current assets of £288,000 and current liabilities of £192,000.',
    stem: 'Calculate its current ratio. Enter only the numerical value before “:1” (for example, 1.2 for 1.2:1). Only the final value is scored.',
    expected: 1.5, unit: 'ratio',
    working: 'Current ratio = £288,000 ÷ £192,000 = 1.5:1. This means £1.50 of current assets for each £1 of current liabilities, not £1.50 of immediately available cash.',
  },
  {
    id: 'current-ratio-retail-02', target: 'current-ratio',
    context: 'An independent shop has current assets of £420,000 and current liabilities of £300,000 at the same statement date.',
    stem: 'Calculate the current ratio. Enter only the number before “:1”. Do not type a currency amount. Only the final value is scored.',
    expected: 1.4, unit: 'ratio',
    working: 'Current ratio = £420,000 ÷ £300,000 = 1.4:1. The ratio alone cannot prove that receivables will be collected or inventory can quickly be sold.',
  },
  {
    id: 'gearing-workshop-01', target: 'gearing',
    context: 'A workshop has non-current liabilities of £360,000 and equity of £840,000. Treat capital employed as their sum.',
    stem: 'Calculate gearing as non-current liabilities ÷ capital employed × 100. Type the final percentage number without %. Only the final value is scored.',
    expected: 30, unit: '%',
    working: 'Capital employed = £360,000 + £840,000 = £1,200,000. Gearing = £360,000 ÷ £1,200,000 × 100 = 30%. Higher gearing can increase interest and refinancing exposure, depending on context.',
  },
  {
    id: 'gearing-manufacturer-02', target: 'gearing',
    context: 'A small manufacturer has non-current liabilities of £480,000 and equity of £720,000. Capital employed is the sum.',
    stem: 'Calculate gearing using long-term liabilities divided by capital employed, as a percentage. Type the final percentage number only.',
    expected: 40, unit: '%',
    working: 'Capital employed = £480,000 + £720,000 = £1,200,000. Gearing = £480,000 ÷ £1,200,000 × 100 = 40%. Whether the extra borrowing is excessive depends on cash flows, rates and expected returns.',
  },
  {
    id: 'payables-days-kitchen-01', target: 'payables-days',
    context: 'A kitchen-fittings business has trade payables of £72,000 and annual cost of sales of £657,000. Assume a 365-day year.',
    stem: 'Calculate average payables days using trade payables ÷ annual cost of sales × 365. Type the final number of days; only that number is scored.',
    expected: 40, unit: 'days',
    working: '£72,000 ÷ £657,000 × 365 = 40 days. This describes an average supplier payment period, not a contractual payment term or proof of good supplier relationships.',
  },
  {
    id: 'payables-days-bakery-02', target: 'payables-days',
    context: 'An independent bakery has trade payables of £45,000 and annual cost of sales of £547,500. Assume 365 days.',
    stem: 'Calculate average payables days. Enter only the number of days. Your working and supplier judgement are not automatically marked.',
    expected: 30, unit: 'days',
    working: 'Trade payables ÷ annual cost of sales × 365 = £45,000 ÷ £547,500 × 365 = 30 days. Compare this figure over time and against actual supplier terms.',
  },
  {
    id: 'receivables-days-wholesale-01', target: 'receivables-days',
    context: 'A wholesaler has trade receivables of £96,000 and annual revenue of £876,000. Assume a 365-day year.',
    stem: 'Calculate average receivables days using receivables ÷ annual revenue × 365. Type the final number of days only.',
    expected: 40, unit: 'days',
    working: '£96,000 ÷ £876,000 × 365 = 40 days. This measures average collection period. It does not establish whether every customer will pay or whether all sales were on credit.',
  },
  {
    id: 'receivables-days-printer-02', target: 'receivables-days',
    context: 'A print supplier has trade receivables of £60,000 and annual revenue of £730,000. Assume 365 days.',
    stem: 'Calculate average receivables days. Type the final number of days; only the final result is independently scored.',
    expected: 30, unit: 'days',
    working: '£60,000 ÷ £730,000 × 365 = 30 days. This is a short-term collection indicator to compare against credit terms and historical outcomes.',
  },
  {
    id: 'inventory-turnover-outdoors-01', target: 'inventory-turnover',
    context: 'An outdoor-equipment retailer has annual cost of sales of £960,000 and average inventory at cost of £80,000 for the same year.',
    stem: 'Calculate annual inventory turnover in times per year using cost of sales ÷ average inventory. Type the number only.',
    expected: 12, unit: 'times per year',
    working: 'Inventory turnover = £960,000 ÷ £80,000 = 12 times per year. Turnover uses cost of sales rather than revenue under this stated measure.',
  },
  {
    id: 'inventory-turnover-books-02', target: 'inventory-turnover',
    context: 'A specialist bookshop reports annual cost of sales of £875,000 and average inventory held at cost of £125,000 over that same period.',
    stem: 'Calculate its annual inventory turnover in times per year. Type only the final numerical value.',
    expected: 7, unit: 'times per year',
    working: 'Inventory turnover = £875,000 ÷ £125,000 = 7 times per year. A high turnover could indicate efficient stock management or inadequate stock; compare context, margins and shortages.',
  },
] as const

export const businessStrategicRatioBank = businessStrategicRatioCases.map(item =>
  structuredPracticeBankRecordSchema.parse({
    namespace: 'rev7132',
    batch: '3.7.2',
    id: item.id,
    label: 'Revision-original financial-ratio final-number exercise',
    confidence_label: 'Final-number arithmetic only; A2/A3 independent educational review pending',
    topic_id: 'strategic-position',
    target_item_ids: ['aqa-7132-3.7.2:' + item.target],
    target_node_ids: ['strategic-financial-ratios-method'],
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
      calcs: [{ stated_answer: item.expected, unit: item.unit, answer_rule: 'exact-number' }],
      mark_scheme: {
        type: 'points',
        correct_option: '',
        option_rationale: [],
        points: [{ marks: 1, descriptor: 'Correct independently entered final result for the specifically named ratio and its stated denominator.', accept: [String(item.expected)] }],
        levels: [],
        indicative_content: [],
        model_answer: item.working,
      },
    },
  }),
)
