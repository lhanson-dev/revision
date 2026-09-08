import { describe, expect, it } from 'vitest'
import {
  assertCourseTruthRequiredScopeRetention,
  assertRequirementLedCoverage,
  canonicalKnowledgeNodeId,
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

function faithfulCourseTruthNodes(semanticItems: FoundationSemanticCoverageItem[]) {
  return semanticItems.map((item) => ({
    id: canonicalKnowledgeNodeId(item),
    summary: item.text,
    formulas: [],
    misconceptions: [],
    applicationContexts: [],
  }))
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

  it('accepts coordinated shared-head wording while still requiring the named concept', () => {
    const semanticItems: FoundationSemanticCoverageItem[] = [{
      id: 'example.s01',
      requirementId: 'example',
      officialReference: '1.0',
      knowledgeItemIndex: 0,
      text: 'Evaluate the external and internal environment before deciding.',
    }]
    const obligations = [{
      obligationId: 'example',
      officialReference: '1.0',
      curriculumPath: ['Example'],
      summary: 'Example coordinated named scope.',
      semanticItemIds: ['example.s01'],
      requiredTerms: ['external environment', 'internal environment'],
      sourceRefs: ['source'],
    }]

    expect(() => assertRequirementLedCoverage({ obligations, semanticItems })).not.toThrow()

    const narrowed = semanticItems.map((item) => ({ ...item, text: 'Evaluate the internal environment before deciding.' }))
    expect(() => assertRequirementLedCoverage({ obligations, semanticItems: narrowed }))
      .toThrow('missing_required_curriculum_scope:example:external environment')
  })

  it('proves all governed named scope survives into final mapped Course Truth', () => {
    const { semanticItems, obligations } = governedReconciliation()
    expect(() => assertCourseTruthRequiredScopeRetention({
      obligations,
      semanticItems,
      nodes: faithfulCourseTruthNodes(semanticItems),
    })).not.toThrow()
  })

  it('fails when final Course Truth silently drops named scope that the governed seed retained', () => {
    const { semanticItems, obligations } = governedReconciliation()
    const nodes = faithfulCourseTruthNodes(semanticItems).map((node) => node.id === 'aqa-3-3-4.k01'
      ? {
          ...node,
          summary: node.summary
            .replace('social media and viral marketing', 'promotion channels')
            .replace('multi-channel distribution', 'distribution'),
        }
      : node)

    expect(() => assertCourseTruthRequiredScopeRetention({ obligations, semanticItems, nodes }))
      .toThrow('missing_required_course_truth_scope:aqa-3-3-4:social media')
  })

  it('locks the reconciled high-risk AQA 7132 scope and quantitative boundaries', () => {
    const text = semanticItemsFromGovernedSeed().map((item) => item.text).join('\n').toLowerCase()

    for (const required of [
      '7ps',
      'extension strategies',
      'new product development',
      'social media',
      'viral marketing',
      'multi-channel distribution',
      'external environment including competition',
      'employee and employer values',
      'lean production',
      'information management',
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
