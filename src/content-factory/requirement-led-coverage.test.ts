import { describe, expect, it } from 'vitest'
import {
  assertRequirementLedCoverage,
  type FoundationSemanticCoverageItem,
} from './requirement-led-coverage'
import { AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED } from './source-seeds/aqa-a-level-business-7132-2027'
import {
  AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_REQUIREMENTS,
  buildAqaAlevelBusiness7132CurriculumObligations,
} from './source-seeds/aqa-a-level-business-7132-2027-coverage'

function semanticItemsFromGovernedSeed(): FoundationSemanticCoverageItem[] {
  return AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED.requirements.flatMap((requirement) =>
    requirement.skillsOrKnowledge.map((text, knowledgeItemIndex) => ({
      id: `${requirement.requirementId}.s${String(knowledgeItemIndex + 1).padStart(2, '0')}`,
      requirementId: requirement.requirementId,
      officialReference: requirement.officialReference,
      knowledgeItemIndex,
      text,
    })),
  )
}

function governedReconciliation() {
  const semanticItems = semanticItemsFromGovernedSeed()
  const obligations = buildAqaAlevelBusiness7132CurriculumObligations(semanticItems)
  return { semanticItems, obligations }
}

describe('requirement-led Foundation curriculum coverage', () => {
  it('reconciles the governed AQA 7132 / 2027 Course Truth seed to the independent source-led requirement universe', () => {
    const { semanticItems, obligations } = governedReconciliation()
    const result = assertRequirementLedCoverage({ obligations, semanticItems })

    expect(result.obligationIds).toEqual(AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_REQUIREMENTS.map((item) => item.requirementId))
    expect(new Set(result.canonicalKnowledgeNodeIds).size).toBe(result.canonicalKnowledgeNodeIds.length)
  })

  it('fails when an applicable source requirement has no governed semantic mapping', () => {
    const { semanticItems, obligations } = governedReconciliation()
    const withoutNpv = semanticItems.filter((item) => item.requirementId !== 'aqa-3-7-8')
    const remapped = buildAqaAlevelBusiness7132CurriculumObligations(withoutNpv)

    expect(() => assertRequirementLedCoverage({ obligations: remapped, semanticItems: withoutNpv }))
      .toThrow()

    expect(obligations.some((item) => item.obligationId === 'aqa-3-7-8')).toBe(true)
  })

  it('fails when a mapped semantic item drops mandatory named curriculum scope', () => {
    const { semanticItems } = governedReconciliation()
    const withoutSevenPs = semanticItems.map((item) => item.requirementId === 'aqa-3-3-4'
      ? { ...item, text: item.text.replace('7Ps', 'marketing variables') }
      : item)
    const obligations = buildAqaAlevelBusiness7132CurriculumObligations(withoutSevenPs)

    expect(() => assertRequirementLedCoverage({ obligations, semanticItems: withoutSevenPs }))
      .toThrow('missing_required_curriculum_scope:aqa-3-3-4:7Ps')
  })

  it('locks the current high-risk AQA 7132 scope and quantitative boundaries', () => {
    const text = semanticItemsFromGovernedSeed().map((item) => item.text).join('\n').toLowerCase()

    for (const required of [
      '7ps',
      'tannenbaum schmidt',
      'taylor',
      'maslow',
      'herzberg',
      'gearing',
      'payables days',
      'receivables days',
      'inventory turnover',
      'elkington',
      'triple bottom line',
      'carroll',
      'porter five forces',
      'net present value',
      'ansoff',
      'low cost',
      'differentiation',
      'lewin',
      'kotter and schlesinger',
      'handy',
      'critical path',
      'total float',
      'interpret, not calculate',
    ]) {
      expect(text).toContain(required)
    }

    expect(text).toContain('never add an acid-test ratio')
    expect(text).toContain('do not introduce est/lft calculation as a mandatory requirement')

    for (const removedOrNonRequired of [
      'blake mouton',
      'hackman',
      'kaplan',
      'balanced scorecard',
      'bowman',
      'greiner',
      'bartlett',
      'ghoshal',
      'hofstede',
      'labour retention',
    ]) {
      expect(text).not.toContain(removedOrNonRequired)
    }
  })

  it('does not encode a target count as the definition of completeness', () => {
    const { semanticItems, obligations } = governedReconciliation()
    const result = assertRequirementLedCoverage({ obligations, semanticItems })

    expect(result.obligationIds.length).toBeGreaterThan(0)
    expect(result.semanticItemIds.length).toBeGreaterThan(0)
    expect(result.canonicalKnowledgeNodeIds.length).toBeGreaterThan(0)
  })
})
