import { describe, expect, it } from 'vitest'
import { AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED } from './aqa-a-level-business-7132-2027'

function knowledgeItem(requirementId: string, index: number) {
  const requirement = AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED.requirements
    .find((item) => item.requirementId === requirementId)
  if (!requirement) throw new Error(`Missing requirement ${requirementId}`)
  const item = requirement.skillsOrKnowledge[index]
  if (!item) throw new Error(`Missing knowledge item ${requirementId}[${index}]`)
  return item
}

describe('AQA A-level Business 7132 / 2027 Course Truth seed', () => {
  it('retains one substantive Revision-owned semantic statement for every canonical atomic node', () => {
    const items = AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED.requirements
      .flatMap((requirement) => requirement.skillsOrKnowledge)

    expect(AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED.schemaVersion).toBe(2)
    expect(AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED.semanticEvidencePolicy.authorship).toBe('REVISION_OWNED')
    expect(items).toHaveLength(82)
    expect(items.every((item) => item.length >= 100)).toBe(true)
  })

  it('makes the high-risk quantitative methods executable instead of label-only', () => {
    expect(knowledgeItem('quantitative-skills', 1)).toContain('((new value − original value) / original value) × 100')
    expect(knowledgeItem('financial-decisions', 0)).toContain('unit contribution = selling price per unit − variable cost per unit')
    expect(knowledgeItem('financial-decisions', 1)).toContain('break-even output = fixed costs / contribution per unit')
    expect(knowledgeItem('marketing-analysis', 4)).toContain('PED = percentage change in quantity demanded / percentage change in price')
    expect(knowledgeItem('marketing-analysis', 5)).toContain('YED = percentage change in quantity demanded / percentage change in income')
    expect(knowledgeItem('operations-decisions', 1)).toContain('capacity utilisation (%) = actual output / maximum possible output × 100')
    expect(knowledgeItem('human-resources', 5)).toContain('labour productivity = output / number of employees')
    expect(knowledgeItem('human-resources', 6)).toContain('labour turnover (%) = number of employees leaving during the period / average number employed during the period × 100')
  })

  it('bounds financial-ratio generation to the methods actually defined by Course Truth', () => {
    const ratioScope = knowledgeItem('strategic-position', 1)
    expect(ratioScope).toContain('gross profit margin, operating profit margin, ROCE and current ratio only')
    expect(ratioScope).toContain('without introducing efficiency or gearing ratios')
    expect(knowledgeItem('financial-decisions', 2)).toContain('gross profit = revenue − cost of sales')
  })

  it('retains the rule that semantic scope remains candidate truth until independent and expert assurance', () => {
    expect(AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED.limitations).toContain(
      'Independent Foundation review and qualified subject/assessment expert review remain mandatory before the resulting Course Truth can become an Approved Course Foundation.',
    )
  })
})
