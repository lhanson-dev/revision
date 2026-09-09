import { describe, expect, it } from 'vitest'
import { AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_REQUIREMENTS } from './source-seeds/aqa-a-level-business-7132-2027-coverage'
import { AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED } from './source-seeds/aqa-a-level-business-7132-2027'

describe('AQA 7132 external-review Material semantic remediation', () => {
  it('preserves the complete quantitative-skills universe instead of narrowing it to formulas', () => {
    const sourceRequirement = AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_REQUIREMENTS.find(
      (requirement) => requirement.requirementId === 'aqa-annex-quantitative',
    )
    const courseTruth = AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED.requirements.find(
      (requirement) => requirement.requirementId === 'aqa-annex-quantitative',
    )

    expect(sourceRequirement?.requiredTerms).toEqual(expect.arrayContaining([
      'ratios',
      'averages',
      'fractions',
      'percentages',
      'percentage changes',
      'standard graphical forms',
      'index numbers',
      'quantitative and non-quantitative information',
      'make decisions',
      'written',
      'graphical',
      'numerical',
      'Level 2 mathematical skills',
      '10%',
    ]))

    const semanticText = courseTruth?.skillsOrKnowledge.join(' ') ?? ''
    expect(semanticText).toContain('ratios, averages, fractions, percentages and percentage changes')
    expect(semanticText).toContain('standard graphical forms')
    expect(semanticText).toContain('quantitative and non-quantitative information together to make decisions')
    expect(semanticText).toContain('written, graphical and numerical forms')
    expect(semanticText).toContain('at least Level 2 mathematical skills')
    expect(semanticText).toContain('at least 10% of A-level marks')
  })

  it('preserves the broad 3.7.6 social-change concepts and treats named items as examples, not the complete scope', () => {
    const sourceRequirement = AQA_A_LEVEL_BUSINESS_7132_2027_SOURCE_REQUIREMENTS.find(
      (requirement) => requirement.requirementId === 'aqa-3-7-6',
    )
    const courseTruth = AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED.requirements.find(
      (requirement) => requirement.requirementId === 'aqa-3-7-6',
    )

    expect(sourceRequirement?.summary).toContain('Demographic changes and population movements')
    expect(sourceRequirement?.requiredTerms).toEqual(expect.arrayContaining([
      'demographic changes',
      'population movements',
      'migration',
      'consumer lifestyle',
      'buying behaviour',
      'online businesses',
    ]))

    const semanticText = courseTruth?.skillsOrKnowledge.join(' ') ?? ''
    expect(semanticText).toContain('demographic changes and population movements')
    expect(semanticText).toContain('familiar and unseen scenarios')
    expect(semanticText).toContain('including examples such as migration')
    expect(semanticText).toContain('without treating those examples as the complete requirement')
  })
})