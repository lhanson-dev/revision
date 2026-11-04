import { learnCourseSchema } from '../../../learn-schema'

/**
 * #698 AQA 7132 v2.0 §3.7.2, printed p25. Original worked methods.
 * Source REFERENCE_ONLY. This teaching is not separately marked evidence.
 * Fresh-context independent A2/A3 educational review still required.
 */
export const strategicRatioSupplement = learnCourseSchema.parse({
  chapters: [{
    id: 'strategic-position',
    topicId: 'strategic-position',
    title: '7. Analysing the Strategic Position',
    groups: [{
      id: 'financial-ratio-method-and-interpretation',
      title: 'Calculate and interpret financial ratios',
      pages: [{
        id: 'strategic-financial-ratios-method',
        topicId: 'strategic-position',
        sourceSectionIds: ['financial-ratios', 'aqa-7132-3-7-2'],
        title: 'Financial ratios: choose the method, show your reasoning',
        orientation: 'Use the right financial-statement figures, calculate each separate measure, and test what the result can and cannot establish.',
        blocks: [
          {
            type: 'key-idea',
            definitions: [
              { term: 'Capital employed', definition: 'For the calculations shown here, total equity plus non-current liabilities.' },
              { term: 'ROCE', definition: 'Operating profit divided by capital employed, multiplied by 100; a percentage return.' },
              { term: 'Current ratio', definition: 'Current assets divided by current liabilities, expressed as a ratio to 1.' },
              { term: 'Gearing', definition: 'Non-current liabilities divided by capital employed, multiplied by 100 for this stated method.' },
              { term: 'Payables days', definition: 'Trade payables divided by annual cost of sales, multiplied by 365 under the stated convention.' },
              { term: 'Receivables days', definition: 'Trade receivables divided by annual revenue, multiplied by 365 under the stated convention.' },
              { term: 'Inventory turnover', definition: 'Annual cost of sales divided by average inventory at cost; number of turnovers per year.' },
            ],
          },
          {
            type: 'explanation',
            heading: 'Separate profitability, liquidity, debt exposure and efficiency',
            paragraphs: [
              'ROCE compares operating profit with long-term capital. The current ratio is a broad short-term liquidity indication, not the same as immediately available cash. Gearing is a debt-financing measure: this lesson uses long-term liabilities divided by capital employed. Always follow the numerator, denominator and conventions stated in the exam question.',
              'Payables days uses supplier balances and cost of sales. Receivables days uses customer balances and revenue. Inventory turnover uses cost of sales and average inventory measured at cost. These measures have different units, so do not interchange their denominators or mistake annual sales revenue for cost of sales.',
              'Find the requested figures from the relevant income statement or statement of financial position. Use compatible periods, state the appropriate ratio, percentage, days or turnovers, and compare against previous years and similar businesses before reaching a conditional judgement.',
            ],
          },
          {
            type: 'worked-example',
            title: 'Calculate three different financial-position measures',
            setup: 'A small furniture manufacturer reports operating profit of £240,000, total equity of £900,000, non-current liabilities of £600,000, current assets of £420,000 and current liabilities of £280,000 at year-end.',
            task: 'Calculate capital employed, ROCE, the current ratio and gearing. Explain why the results answer different questions.',
            steps: [
              { label: 'Capital employed', value: 'Equity plus non-current liabilities = £900,000 + £600,000 = £1,500,000.' },
              { label: 'ROCE: return', value: '£240,000 ÷ £1,500,000 × 100 = 16%.' },
              { label: 'Current ratio: liquidity', value: '£420,000 ÷ £280,000 = 1.5:1. Current assets are not all cash.' },
              { label: 'Gearing: debt exposure', value: '£600,000 ÷ £1,500,000 × 100 = 40%.' },
              { label: 'Interpret cautiously', value: 'ROCE needs an appropriate return comparator; liquidity needs asset quality and payment timing; gearing needs cash-flow, borrowing cost and business risk. No single figure proves the company is safe or well run.' },
            ],
            conclusion: 'Three accurate results are not an independently marked AO3/AO4 business recommendation. A full answer explains the situation, trade-offs and available evidence.',
          },
          {
            type: 'worked-example',
            title: 'Calculate the three working-capital efficiency ratios',
            setup: 'For one year a distributor has revenue of £1,095,000 and cost of sales of £730,000. Year-end trade receivables are £90,000, trade payables are £80,000, and average inventory at cost is £73,000. Assume 365 days.',
            task: 'Calculate payables days, receivables days and inventory turnover; identify the correct denominator for each.',
            steps: [
              { label: 'Payables days', value: '£80,000 ÷ £730,000 × 365 = 40 days; use cost of sales, not revenue.' },
              { label: 'Receivables days', value: '£90,000 ÷ £1,095,000 × 365 = 30 days; use revenue, not cost of sales.' },
              { label: 'Inventory turnover', value: '£730,000 ÷ £73,000 = 10 times per year; use average inventory at cost.' },
              { label: 'Compare and qualify', value: 'Suppliers are paid on average after 40 days, while customer balances are collected after 30 days, under the stated approximations. These figures cannot prove contract compliance, future cash availability or appropriate stock levels.' },
            ],
            conclusion: 'The methods yield days, days and times per year. A one-mark typed final answer cannot verify working or contextual interpretation.',
          },
          {
            type: 'quick-check',
            question: 'A retailer has £70,000 trade payables, £700,000 annual cost of sales and £1m annual revenue. Which denominator is relevant for its payables-days calculation?',
            options: [
              { id: 'cost', text: 'Annual cost of sales, £700,000' },
              { id: 'revenue', text: 'Annual revenue, £1 million' },
              { id: 'inventory', text: 'Average inventory, not supplied' },
            ],
            correctOptionId: 'cost',
            explanation: 'Payables days = trade payables ÷ annual cost of sales × 365. Revenue is used in the separate receivables-days measure. This check is unscored and does not demonstrate independent calculation.',
          },
          {
            type: 'misconception',
            title: 'A single favourable-looking ratio is not proof of financial strength.',
            paragraphs: [
              'Comparisons need accounting consistency, timing, industry norms, asset quality and business circumstances. A high current ratio may include difficult-to-sell inventory, high ROCE may be driven by lower capital employed, and high inventory turnover can reflect either good flow or stock shortages.',
            ],
          },
          {
            type: 'recap',
            items: [
              'Use income-statement and balance-sheet figures from matching periods where appropriate.',
              'ROCE and gearing are percentages; current ratio is stated as x:1; supplier/customer days are days; inventory turnover is times per year.',
              'Payables days divides by cost of sales; receivables days divides by revenue; turnover divides cost of sales by average inventory.',
              'Before a strategic judgement, compare time trends and peers, explain the business context and identify missing evidence.',
            ],
          },
        ],
      }],
    }],
  }],
})
