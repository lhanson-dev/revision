import { describe, expect, it } from 'vitest'
import { foundationAssessmentBlueprintSchema } from './foundation-compilation'

function blueprint() {
  return {
    schemaVersion: 2 as const,
    jobId: 'aggregate-schema-job',
    boardAlignmentFingerprint: 'board-fingerprint',
    courseKnowledgeModelFingerprint: 'course-fingerprint',
    assessmentObjectives: [{ id: 'ao1' }, { id: 'ao2' }],
    assessmentRequirements: [
      { id: 'ao-ranges', summary: 'Qualification-total AO ranges.', componentScope: ['paper-1', 'paper-2'] },
    ],
    components: [
      { componentId: 'paper-1', questionFamilyIds: ['family-1'], markTotal: 100, timingMinutes: 120, constraints: [] },
      { componentId: 'paper-2', questionFamilyIds: ['family-2'], markTotal: 100, timingMinutes: 120, constraints: [] },
    ],
    commandDemands: [],
    evidenceExpectations: [],
    quantitativeRequirements: [],
    assessmentObjectiveCoveragePlan: {
      sourceAssessmentRequirementId: 'ao-ranges',
      scope: 'qualification_total' as const,
      totalAssessmentMarks: 200,
      objectives: [
        { objectiveId: 'ao1', minPercent: 40, maxPercent: 60 },
        { objectiveId: 'ao2', minPercent: 40, maxPercent: 60 },
      ],
      generationValidation: 'sum_assessment_objective_marks_within_ranges' as const,
      allocationRequiredAt: 'marking_pack_generation' as const,
    },
    synopticRequirements: [],
  }
}

describe('Foundation aggregate assessment schema', () => {
  it('accepts a qualification-total AO plan that is source-bound and covers the full mark total', () => {
    expect(foundationAssessmentBlueprintSchema.parse(blueprint()).assessmentObjectiveCoveragePlan?.totalAssessmentMarks).toBe(200)
  })

  it('rejects a plan whose total does not match governed component marks', () => {
    expect(() => foundationAssessmentBlueprintSchema.parse({
      ...blueprint(),
      assessmentObjectiveCoveragePlan: {
        ...blueprint().assessmentObjectiveCoveragePlan,
        totalAssessmentMarks: 199,
      },
    })).toThrow('total marks must equal component marks')
  })

  it('rejects a plan that omits an Exam Truth assessment objective', () => {
    expect(() => foundationAssessmentBlueprintSchema.parse({
      ...blueprint(),
      assessmentObjectiveCoveragePlan: {
        ...blueprint().assessmentObjectiveCoveragePlan,
        objectives: [{ objectiveId: 'ao1', minPercent: 40, maxPercent: 60 }],
      },
    })).toThrow('must cover exactly the Exam Truth assessment objectives')
  })

  it('rejects AO ranges that cannot admit a 100% qualification-total allocation', () => {
    expect(() => foundationAssessmentBlueprintSchema.parse({
      ...blueprint(),
      assessmentObjectiveCoveragePlan: {
        ...blueprint().assessmentObjectiveCoveragePlan,
        objectives: [
          { objectiveId: 'ao1', minPercent: 20, maxPercent: 30 },
          { objectiveId: 'ao2', minPercent: 20, maxPercent: 30 },
        ],
      },
    })).toThrow('must admit a valid 100% qualification-total allocation')
  })
})
