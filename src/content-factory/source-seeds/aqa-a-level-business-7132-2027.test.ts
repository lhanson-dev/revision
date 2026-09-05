import { describe, expect, it } from 'vitest'
import { AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED } from './aqa-a-level-business-7132-2027'

function knowledgeItem(requirementId: string, index = 0) {
  const requirement = AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED.requirements
    .find((item) => item.requirementId === requirementId)
  if (!requirement) throw new Error(`Missing requirement ${requirementId}`)
  const item = requirement.skillsOrKnowledge[index]
  if (!item) throw new Error(`Missing knowledge item ${requirementId}[${index}]`)
  return item
}

describe('AQA A-level Business 7132 / 2027 Course Truth seed', () => {
  it('retains substantive Revision-owned candidate semantics without using an item-count completeness target', () => {
    const items = AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED.requirements
      .flatMap((requirement) => requirement.skillsOrKnowledge)

    expect(AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED.schemaVersion).toBe(3)
    expect(AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED.coverageProfileId).toBeTruthy()
    expect(AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED.semanticEvidencePolicy.authorship).toBe('REVISION_OWNED')
    expect(items.length).toBeGreaterThan(0)
    expect(items.every((item) => item.length >= 80)).toBe(true)
  })

  it('retains current high-risk quantitative methods and boundaries', () => {
    const marketingEvidence = knowledgeItem('aqa-3-3-2')
    expect(marketingEvidence).toContain('interpret, not calculate')
    expect(marketingEvidence).toContain('price elasticity')
    expect(marketingEvidence).toContain('income elasticity')

    const strategicRatios = knowledgeItem('aqa-3-7-2')
    expect(strategicRatios).toContain('ROCE')
    expect(strategicRatios).toContain('current ratio = current assets / current liabilities')
    expect(strategicRatios).toContain('gearing (%)')
    expect(strategicRatios).toContain('payables days')
    expect(strategicRatios).toContain('receivables days')
    expect(strategicRatios).toContain('inventory turnover')

    const investmentAppraisal = knowledgeItem('aqa-3-7-8')
    expect(investmentAppraisal).toContain('average rate of return (ARR)')
    expect(investmentAppraisal).toContain('net present value (NPV)')

    const annex = knowledgeItem('aqa-annex-quantitative')
    expect(annex).toContain('expected value and net gain')
    expect(annex).toContain('payback, average rate of return and net present value')
    expect(annex).toContain('interpret, not calculate')
  })

  it('bounds current ratio generation to the cohort-correct specification', () => {
    const ratioScope = knowledgeItem('aqa-3-7-2')
    expect(ratioScope).toContain('ROCE')
    expect(ratioScope).toContain('current ratio')
    expect(ratioScope).toContain('gearing')
    expect(ratioScope).toContain('payables days')
    expect(ratioScope).toContain('receivables days')
    expect(ratioScope).toContain('inventory turnover')
    expect(ratioScope).toContain('never add an acid-test ratio')
  })

  it('retains current network-analysis and assurance boundaries', () => {
    expect(knowledgeItem('aqa-3-10-3')).toContain('Do not introduce EST/LFT calculation as a mandatory requirement')
    expect(AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED.limitations).toContain(
      'Independent Foundation review and qualified subject/assessment expert review remain mandatory before Course Truth can become an Approved Course Foundation.',
    )
  })
})
