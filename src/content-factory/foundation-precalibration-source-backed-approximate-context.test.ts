import { describe, expect, it } from 'vitest'
import { foundationAssessmentBlueprintSchema } from './foundation-compilation'
import {
  aqa7132PreCalibrationAssemblyProblems,
  normaliseAqa7132PreCalibrationQuestionFamily,
} from './foundation-precalibration-assembly'

function blueprint() {
  return foundationAssessmentBlueprintSchema.parse({
    schemaVersion: 2,
    jobId: 'paper2-approximate-shape-test',
    boardAlignmentFingerprint: 'board-fingerprint',
    courseKnowledgeModelFingerprint: 'course-fingerprint',
    assessmentObjectives: [{ id: 'ao1' }, { id: 'ao2' }, { id: 'ao3' }, { id: 'ao4' }],
    assessmentRequirements: [
      {
        id: 'paper2-structure',
        summary: 'Three compulsory data-response questions worth approximately 33 marks each.',
        componentScope: ['paper-2'],
      },
    ],
    components: [
      {
        componentId: 'paper-2',
        questionFamilyIds: ['paper2-data-response'],
        markTotal: 100,
        timingMinutes: 120,
        constraints: ['three compulsory data-response questions'],
      },
    ],
    commandDemands: [],
    evidenceExpectations: [],
    quantitativeRequirements: [],
    synopticRequirements: [],
  })
}

function paper2Family(analysisRequirement: string) {
  return {
    schemaVersion: 1 as const,
    id: 'paper2-data-response',
    title: 'Paper 2 data response',
    assessmentObjectiveIds: ['ao1', 'ao2', 'ao3', 'ao4'],
    skillProfile: ['business knowledge', 'application', 'analysis', 'evaluation'],
    componentScope: ['paper-2'],
    markRange: { min: 5, max: 25 },
    responseShape: 'Provider-authored shape replaced by the compiler.',
    contextRequirements: ['original Revision-owned business context'],
    applicationRequirements: ['apply relevant business knowledge'],
    analysisRequirements: [analysisRequirement],
    evaluationRequirements: ['reach a supported judgement'],
    commonFailureModes: ['assertion without development'],
    markingPackTemplateVersion: 'foundation-v1',
    calibrationStatus: 'not_calibrated' as const,
  }
}

describe('Foundation pre-calibration source-backed approximate Paper 2 context', () => {
  it('allows the exact source-backed approximate Paper 2 shape exposed by live proof #7', () => {
    const statement = 'Ensure a compiled paper contains three compulsory data-response questions worth approximately 33 marks each.'
    const examTruth = blueprint()

    const corrected = normaliseAqa7132PreCalibrationQuestionFamily(
      paper2Family(statement),
      examTruth,
    )

    expect(corrected.analysisRequirements).toContain(statement)
    expect(corrected.markRange).toEqual({ min: 1, max: 100 })
    expect(aqa7132PreCalibrationAssemblyProblems(corrected, examTruth)).toEqual([])
  })

  it('still rejects an exact per-question 33-mark allocation without the governed approximation', () => {
    expect(() => normaliseAqa7132PreCalibrationQuestionFamily(
      paper2Family('Ensure each compulsory data-response question is worth 33 marks.'),
      blueprint(),
    )).toThrow('unsupported exact constituent mark/timing allocation')
  })

  it('still rejects an approximate 33-mark allocation when attached to sub-questions instead of the governed data-response questions', () => {
    expect(() => normaliseAqa7132PreCalibrationQuestionFamily(
      paper2Family('Ensure each sub-question is worth approximately 33 marks.'),
      blueprint(),
    )).toThrow('unsupported exact constituent mark/timing allocation')
  })
})
