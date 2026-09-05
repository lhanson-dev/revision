import { describe, expect, it } from 'vitest'
import { assertRequirementLedCoverage } from './requirement-led-coverage'

const semanticItems = [
  { id: 'marketing.7ps', requirementId: 'marketing-decisions', officialReference: '3.3.5', knowledgeItemIndex: 0, text: 'The marketing mix includes the governed 7Ps.' },
  { id: 'finance.npv', requirementId: 'strategic-position', officialReference: '3.7.6', knowledgeItemIndex: 1, text: 'Use and interpret net present value where required.' },
]

const obligations = [
  { obligationId: 'aqa.3.3.5.7ps', officialReference: '3.3.5', summary: 'Understand decisions relating to the marketing mix including all applicable Ps.', semanticItemIds: ['marketing.7ps'], sourceRefs: ['aqa-7132-subject-content'] },
  { obligationId: 'aqa.3.7.6.npv', officialReference: '3.7.6', summary: 'Calculate and interpret net present value.', semanticItemIds: ['finance.npv'], sourceRefs: ['aqa-7132-subject-content'] },
]

describe('requirement-led Foundation coverage', () => {
  it('passes when every source-led obligation maps to governed semantic content', () => {
    const result = assertRequirementLedCoverage({ obligations, semanticItems })
    expect(result.obligationIds).toHaveLength(2)
    expect(result.semanticItemIds).toEqual(['marketing.7ps', 'finance.npv'])
    expect(result.canonicalKnowledgeNodeIds).toEqual(['marketing-decisions.k01', 'strategic-position.k02'])
  })

  it('fails when an applicable curriculum obligation has no semantic mapping', () => {
    expect(() => assertRequirementLedCoverage({
      obligations: [...obligations, {
        obligationId: 'aqa.3.7.6.gearing',
        officialReference: '3.7.6',
        summary: 'Calculate and interpret gearing.',
        semanticItemIds: ['finance.gearing'],
        sourceRefs: ['aqa-7132-subject-content'],
      }],
      semanticItems,
    })).toThrow('unmapped_curriculum_or_exam_obligation:aqa.3.7.6.gearing:finance.gearing')
  })

  it('fails when governed semantic content is not reconciled to a coverage obligation', () => {
    expect(() => assertRequirementLedCoverage({ obligations: [obligations[0]], semanticItems }))
      .toThrow('semantic_items_without_coverage_obligation:finance.npv')
  })

  it('permits deliberate supplemental semantics without turning them into quota requirements', () => {
    expect(() => assertRequirementLedCoverage({
      obligations: [obligations[0]],
      semanticItems,
      supplementalSemanticItemIds: ['finance.npv'],
    })).not.toThrow()
  })
})
