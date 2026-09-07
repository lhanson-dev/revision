export type Aqa7132CourseAlignmentRule = {
  fact: {
    id: string
    sourceRef: string
    category: 'quantitative_requirement'
    value: string
    verificationStatus: 'verified'
  }
  requirementId: string
  formulas: string[]
}

const formulaSourceId = 'aqa-7131-7132-formulae-key-data'

/**
 * Current applicable AQA 7132 quantitative conventions that were named as
 * calculable skills in Course Truth but were not previously retained as exact
 * governed formulas. These are structured factual alignment controls from the
 * REFERENCE_ONLY formula guide; they are never curriculum sourceRefs and the
 * protected source text is not supplied to generative workers.
 *
 * Employee retention rate is deliberately absent because AQA marks it as
 * removed from the specification from September 2023.
 */
export const AQA_A_LEVEL_BUSINESS_7132_ADDITIONAL_QUANTITATIVE_ALIGNMENT_RULES: Aqa7132CourseAlignmentRule[] = [
  {
    fact: {
      id: 'aqa-quant-revenue-cost-profit',
      sourceRef: formulaSourceId,
      category: 'quantitative_requirement',
      value: 'Current qualification calculations derive revenue and total variable cost from unit values and volume, total cost from fixed plus variable cost, and profit from either revenue less total cost or total contribution less fixed cost.',
      verificationStatus: 'verified',
    },
    requirementId: 'aqa-3-1-1',
    formulas: [
      'Revenue = selling price per unit × number of units sold',
      'Total variable costs = variable cost per unit × number of units sold',
      'Total costs = fixed costs + variable costs',
      'Profit = total revenue − total costs',
      'Profit = total contribution − fixed costs',
    ],
  },
  {
    fact: {
      id: 'aqa-quant-decision-tree-values',
      sourceRef: formulaSourceId,
      category: 'quantitative_requirement',
      value: 'Current qualification decision-tree calculations use probability-weighted pay-offs for expected value and deduct the initial decision cost to obtain net gain.',
      verificationStatus: 'verified',
    },
    requirementId: 'aqa-3-2-2',
    formulas: [
      'Expected value = Σ(pay-off × probability)',
      'Net gain = expected value − initial cost of decision',
    ],
  },
  {
    fact: {
      id: 'aqa-quant-market-growth-share',
      sourceRef: formulaSourceId,
      category: 'quantitative_requirement',
      value: 'Current qualification market calculations express market growth relative to original market size and market share relative to total market sales.',
      verificationStatus: 'verified',
    },
    requirementId: 'aqa-3-3-1',
    formulas: [
      'Market growth (%) = change in market size ÷ original market size × 100',
      'Market share (%) = sales of one product, brand or business ÷ total sales in the market × 100',
    ],
  },
  {
    fact: {
      id: 'aqa-quant-operational-performance',
      sourceRef: formulaSourceId,
      category: 'quantitative_requirement',
      value: 'Current qualification operations calculations measure labour productivity as output per employee, unit cost as total cost per unit of output, and capacity utilisation as actual output relative to maximum possible output.',
      verificationStatus: 'verified',
    },
    requirementId: 'aqa-3-4-2',
    formulas: [
      'Labour productivity = output over a time period ÷ number of employees',
      'Unit cost = total costs ÷ number of units of output',
      'Capacity utilisation (%) = actual output ÷ maximum possible output × 100',
    ],
  },
  {
    fact: {
      id: 'aqa-quant-contribution-break-even',
      sourceRef: formulaSourceId,
      category: 'quantitative_requirement',
      value: 'Current qualification contribution and break-even calculations derive contribution from price and variable cost, break-even output from fixed cost and unit contribution, and margin of safety from actual output above break-even output.',
      verificationStatus: 'verified',
    },
    requirementId: 'aqa-3-5-2',
    formulas: [
      'Contribution per unit = selling price − variable cost per unit',
      'Total contribution = contribution per unit × units sold',
      'Total contribution = total revenue − total variable costs',
      'Break-even output = fixed costs ÷ contribution per unit',
      'Margin of safety = actual level of output − break-even level of output',
    ],
  },
  {
    fact: {
      id: 'aqa-quant-employee-cost-measures',
      sourceRef: formulaSourceId,
      category: 'quantitative_requirement',
      value: 'Current qualification workforce-cost calculations express employee cost relative to turnover and labour cost relative to units of output.',
      verificationStatus: 'verified',
    },
    requirementId: 'aqa-3-6-2',
    formulas: [
      'Employee costs as percentage of turnover = employee costs ÷ turnover × 100',
      'Labour cost per unit = labour costs ÷ units of output',
    ],
  },
]
