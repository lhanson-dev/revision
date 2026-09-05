import { describe, expect, it } from 'vitest'
import {
  assertFoundationRequirementBaselineReconciliation,
  foundationRequirementBaselineSchema,
} from './foundation-requirement-baseline'

const baseline = foundationRequirementBaselineSchema.parse({
  schemaVersion: 1,
  artifactType: 'foundation_requirement_baseline',
  courseKey: 'aqa-a-level-business-7132',
  cohort: '2027',
  sourceSetFingerprint: 'source-set',
  entries: [
    {
      obligationId: 'marketing-7ps',
      officialReference: '3.3',
      summary: 'Marketing mix requirement',
      disposition: 'required_course_truth',
      sourceRefs: ['aqa-7132-subject-content'],
      courseTruthNodeIds: ['marketing-decisions.k01'],
    },
    {
      obligationId: 'paper1-structure',
      officialReference: 'scheme-of-assessment',
      summary: 'Paper 1 structure',
      disposition: 'required_exam_truth',
      sourceRefs: ['aqa-7132-assessment'],
      examTruthRefs: ['paper1-structure'],
    },
    {
      obligationId: 'ped-yed-boundary',
      officialReference: '3.3',
      summary: 'Elasticity is interpreted rather than calculated',
      disposition: 'explicit_boundary',
      sourceRefs: ['aqa-7132-subject-content'],
      boundary: 'Interpret PED and YED; do not require calculation.',
    },
  ],
})

describe('Foundation requirement baseline', () => {
  it('passes only when every required external obligation mapping resolves', () => {
    expect(assertFoundationRequirementBaselineReconciliation({
      baseline,
      courseTruthNodeIds: ['marketing-decisions.k01'],
      examTruthRefs: ['paper1-structure'],
    })).toEqual({ obligationCount: 3 })
  })

  it('fails when the Foundation is internally valid but misses an externally established obligation', () => {
    expect(() => assertFoundationRequirementBaselineReconciliation({
      baseline,
      courseTruthNodeIds: [],
      examTruthRefs: ['paper1-structure'],
    })).toThrow('marketing-7ps:missing_course_truth:marketing-decisions.k01')
  })
})
