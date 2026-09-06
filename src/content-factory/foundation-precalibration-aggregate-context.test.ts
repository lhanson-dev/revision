import { describe, expect, it } from 'vitest'
import { foundationAssessmentBlueprintSchema } from './foundation-compilation'
import { normaliseAqa7132PreCalibrationQuestionFamily } from './foundation-precalibration-assembly'

function blueprint() {
  return foundationAssessmentBlueprintSchema.parse({
    schemaVersion: 2,
    jobId: 'aggregate-context-test',
    boardAlignmentFingerprint: 'board',
    courseKnowledgeModelFingerprint: 'course',
    assessmentObjectives: [{ id: 'ao1' }, { id: 'ao2' }, { id: 'ao3' }, { id: 'ao4' }],
    assessmentRequirements: [
      { id: 'paper3-structure', summary: 'One compulsory case study followed by approximately six questions.', componentScope: ['paper-3'] },
    ],
    components: [
      {
        componentId: 'paper-3',
        questionFamilyIds: ['paper3-case-study'],
        markTotal: 100,
        timingMinutes: 120,
        constraints: ['one compulsory case study followed by approximately six questions'],
      },
    ],
    commandDemands: [],
    evidenceExpectations: [],
    quantitativeRequirements: [],
    synopticRequirements: [],
  })
}

function family(commonFailureModes: string[]) {
  return {
    schemaVersion: 1 as const,
    id: 'paper3-case-study',
    title: 'Paper 3 case study',
    assessmentObjectiveIds: ['ao1', 'ao2', 'ao3', 'ao4'],
    skillProfile: ['business knowledge', 'application', 'analysis', 'evaluation'],
    componentScope: ['paper-3'],
    markRange: { min: 1, max: 100 },
    responseShape: 'One compulsory case study followed by approximately six questions; constituent mark and timing allocations remain unfixed until qualified calibration.',
    contextRequirements: [],
    applicationRequirements: [],
    analysisRequirements: [],
    evaluationRequirements: [],
    commonFailureModes,
    markingPackTemplateVersion: 'foundation-v1',
    calibrationStatus: 'not_calibrated' as const,
  }
}

describe('AQA 7132 pre-calibration aggregate-total context', () => {
  it('allows the verified whole assembled-set total observed in live proof #5', () => {
    expect(() => normaliseAqa7132PreCalibrationQuestionFamily(
      family(['Ensure the assembled set totals 100 marks.']),
      blueprint(),
    )).not.toThrow()
  })

  it('allows an aggregate component timing when the same sentence also discusses constituent question content', () => {
    expect(() => normaliseAqa7132PreCalibrationQuestionFamily(
      family(['Validate the component-level 120-minute response-time envelope and ensure each case-study question contains a viable balance of knowledge, application, analysis and evaluation without asserting fixed constituent timings.']),
      blueprint(),
    )).not.toThrow()
  })

  it('allows a common-failure description that explicitly warns against treating the aggregate envelope as a constituent allocation', () => {
    expect(() => normaliseAqa7132PreCalibrationQuestionFamily(
      family(['Treating the aggregate 100-mark question-set envelope as the mark allocation for one constituent case-study question.']),
      blueprint(),
    )).not.toThrow()
  })

  it('still rejects constituent allocation language even when it contains an assembled-set phrase', () => {
    expect(() => normaliseAqa7132PreCalibrationQuestionFamily(
      family(['Each question in the assembled set should receive 20 marks.']),
      blueprint(),
    )).toThrow('unsupported exact constituent mark/timing allocation')
  })

  it('still rejects assigning the full component total to each constituent question', () => {
    expect(() => normaliseAqa7132PreCalibrationQuestionFamily(
      family(['Each question should receive the component-level 100-mark total.']),
      blueprint(),
    )).toThrow('unsupported exact constituent mark/timing allocation')
  })
})