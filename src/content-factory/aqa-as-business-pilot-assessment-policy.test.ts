import { describe, expect, it } from 'vitest'
import {
  AQA_AS_BUSINESS_7131_ASSESSMENT_ITEM_POLICIES,
  AQA_AS_BUSINESS_7131_FIXED_ASSESSMENT_CONTEXTS,
  AQA_AS_BUSINESS_7131_QUESTION_FAMILY_POLICIES,
} from './live-pilot'
import { applyAqaAsBusiness7131PilotAssessmentIntegrityPolicy } from './aqa-as-business-pilot-assessment-policy'

describe('AQA AS Business live-pilot assessment remediation', () => {
  it('keeps contribution inputs explicit and removes unsupported duplicate Paper 2 marketing coverage', () => {
    applyAqaAsBusiness7131PilotAssessmentIntegrityPolicy()
    applyAqaAsBusiness7131PilotAssessmentIntegrityPolicy()

    const policy = AQA_AS_BUSINESS_7131_ASSESSMENT_ITEM_POLICIES['paper2-case-study-80']
    expect(policy.requirementIds).not.toContain('marketing-demand-and-positioning')

    const context = AQA_AS_BUSINESS_7131_FIXED_ASSESSMENT_CONTEXTS['paper2-case-study-80']
    expect(context.body).toContain('supermarket contract has a selling price of GBP 3.40 per pack')
    expect(context.body).toContain('GBP 1.70 outsourcing figure is the total variable cost per outsourced supermarket pack')
    expect(context.body.match(/supermarket contract has a selling price/g)).toHaveLength(1)
    expect(context.dataPoints).toContainEqual({
      label: 'Supermarket-contract selling price',
      value: '3.40',
      unit: 'GBP per pack',
    })
    expect(context.dataPoints).toContainEqual({
      label: 'Total variable cost per outsourced supermarket pack',
      value: '1.70',
      unit: 'GBP per pack',
    })
    expect(context.dataPoints.some((point) => point.label === 'Current selling price')).toBe(false)
    expect(context.dataPoints.some((point) => point.label === 'Outsourcing cost for additional packs')).toBe(false)
  })

  it('makes the RefillWorks hybrid route, cost scope and decision horizon explicit', () => {
    applyAqaAsBusiness7131PilotAssessmentIntegrityPolicy()
    applyAqaAsBusiness7131PilotAssessmentIntegrityPolicy()

    const context = AQA_AS_BUSINESS_7131_FIXED_ASSESSMENT_CONTEXTS['paper2-case-study-80']
    expect(context.body).toContain('guaranteed for three years')
    expect(context.body).toContain('existing 18,000 packs of spare annual capacity')
    expect(context.body).toContain('hybrid route is feasible')
    expect(context.body).toContain('GBP 1.30 variable cost applies only to supermarket-contract packs made on the automated line')
    expect(context.body.match(/hybrid route is feasible/g)).toHaveLength(1)
    expect(context.dataPoints).toContainEqual({
      label: 'Existing spare annual capacity available for supermarket contract',
      value: '18000',
      unit: 'packs',
    })
    expect(context.dataPoints).toContainEqual({
      label: 'Supermarket contract duration',
      value: '3',
      unit: 'years',
    })
    expect(context.dataPoints).toContainEqual({
      label: 'Variable cost per supermarket-contract pack made on current equipment',
      value: '1.55',
      unit: 'GBP per pack',
    })
    expect(context.dataPoints).toContainEqual({
      label: 'Variable cost per supermarket-contract pack made on automated line',
      value: '1.30',
      unit: 'GBP per pack',
    })
    expect(context.dataPoints.some((point) => point.label === 'Current variable cost')).toBe(false)
    expect(context.dataPoints.some((point) => point.label === 'Variable cost after automation')).toBe(false)

    const family = AQA_AS_BUSINESS_7131_QUESTION_FAMILY_POLICIES['paper2-case-study-80']
    expect(family.responseShape).toContain('automation, full outsourcing, and the feasible hybrid route')
    expect(family.responseShape).toContain('three-year contract horizon')
  })

  it('adds reusable assessment-design constraints to the AQA pilot family policies', () => {
    applyAqaAsBusiness7131PilotAssessmentIntegrityPolicy()
    applyAqaAsBusiness7131PilotAssessmentIntegrityPolicy()

    const mcq = AQA_AS_BUSINESS_7131_QUESTION_FAMILY_POLICIES['paper1-mcq-10']
    expect(mcq.responseShape).toContain('vary correct-answer positions')
    expect(mcq.responseShape.match(/vary correct-answer positions/g)).toHaveLength(1)

    const shortAnswer = AQA_AS_BUSINESS_7131_QUESTION_FAMILY_POLICIES['paper1-short-answer-20']
    expect(shortAnswer.responseShape).toContain('explicitly establishes the response format or data type')
    expect(shortAnswer.responseShape.match(/explicitly establishes the response format or data type/g)).toHaveLength(1)
  })
})
