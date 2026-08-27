import { describe, expect, it } from 'vitest'
import {
  AQA_AS_BUSINESS_7131_ASSESSMENT_ITEM_POLICIES,
  AQA_AS_BUSINESS_7131_FIXED_ASSESSMENT_CONTEXTS,
} from './live-pilot'
import { applyAqaAsBusiness7131PilotAssessmentIntegrityPolicy } from './aqa-as-business-pilot-assessment-policy'

describe('AQA AS Business Pilot #9 assessment remediation', () => {
  it('makes RefillWorks contribution inputs explicit and removes unsupported duplicate Paper 2 marketing coverage', () => {
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
})
