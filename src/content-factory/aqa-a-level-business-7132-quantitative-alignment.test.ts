import { describe, expect, it } from 'vitest'
import { AQA_A_LEVEL_BUSINESS_7132_ADDITIONAL_QUANTITATIVE_ALIGNMENT_RULES } from './source-seeds/aqa-a-level-business-7132-quantitative-alignment'

const expectedFormulae = [
  'Revenue = selling price per unit × number of units sold',
  'Total variable costs = variable cost per unit × number of units sold',
  'Total costs = fixed costs + variable costs',
  'Profit = total revenue − total costs',
  'Profit = total contribution − fixed costs',
  'Expected value = Σ(pay-off × probability)',
  'Net gain = expected value − initial cost of decision',
  'Market growth (%) = change in market size ÷ original market size × 100',
  'Market share (%) = sales of one product, brand or business ÷ total sales in the market × 100',
  'Labour productivity = output over a time period ÷ number of employees',
  'Unit cost = total costs ÷ number of units of output',
  'Capacity utilisation (%) = actual output ÷ maximum possible output × 100',
  'Contribution per unit = selling price − variable cost per unit',
  'Total contribution = contribution per unit × units sold',
  'Total contribution = total revenue − total variable costs',
  'Break-even output = fixed costs ÷ contribution per unit',
  'Margin of safety = actual level of output − break-even level of output',
  'Employee costs as percentage of turnover = employee costs ÷ turnover × 100',
  'Labour cost per unit = labour costs ÷ units of output',
]

describe('AQA 7132 additional quantitative alignment', () => {
  it('retains every current applicable formula exposed by the external-source challenge', () => {
    const formulae = AQA_A_LEVEL_BUSINESS_7132_ADDITIONAL_QUANTITATIVE_ALIGNMENT_RULES
      .flatMap((rule) => rule.formulas)

    expect(formulae).toEqual(expectedFormulae)
    expect(new Set(formulae).size).toBe(formulae.length)
  })

  it('keeps the formula guide REFERENCE_ONLY and maps facts to the governed Course Truth requirements', () => {
    expect(AQA_A_LEVEL_BUSINESS_7132_ADDITIONAL_QUANTITATIVE_ALIGNMENT_RULES.map((rule) => ({
      id: rule.fact.id,
      requirementId: rule.requirementId,
      sourceRef: rule.fact.sourceRef,
      verificationStatus: rule.fact.verificationStatus,
    }))).toEqual([
      { id: 'aqa-quant-revenue-cost-profit', requirementId: 'aqa-3-1-1', sourceRef: 'aqa-7131-7132-formulae-key-data', verificationStatus: 'verified' },
      { id: 'aqa-quant-decision-tree-values', requirementId: 'aqa-3-2-2', sourceRef: 'aqa-7131-7132-formulae-key-data', verificationStatus: 'verified' },
      { id: 'aqa-quant-market-growth-share', requirementId: 'aqa-3-3-1', sourceRef: 'aqa-7131-7132-formulae-key-data', verificationStatus: 'verified' },
      { id: 'aqa-quant-operational-performance', requirementId: 'aqa-3-4-2', sourceRef: 'aqa-7131-7132-formulae-key-data', verificationStatus: 'verified' },
      { id: 'aqa-quant-contribution-break-even', requirementId: 'aqa-3-5-2', sourceRef: 'aqa-7131-7132-formulae-key-data', verificationStatus: 'verified' },
      { id: 'aqa-quant-employee-cost-measures', requirementId: 'aqa-3-6-2', sourceRef: 'aqa-7131-7132-formulae-key-data', verificationStatus: 'verified' },
    ])
  })

  it('does not reintroduce the employee-retention formula removed from the current specification', () => {
    const retainedText = JSON.stringify(AQA_A_LEVEL_BUSINESS_7132_ADDITIONAL_QUANTITATIVE_ALIGNMENT_RULES).toLowerCase()
    expect(retainedText).not.toContain('employee retention')
    expect(retainedText).not.toContain('retention rate')
  })
})
