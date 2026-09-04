import { describe, expect, it } from 'vitest'
import {
  foundationAssessmentBlueprintSchema,
  type FoundationCompilationWorkers,
  type FoundationWorkerExecution,
} from './foundation-compilation'
import type { FoundationIndependentReviewWorkers } from './foundation-independent-review'
import {
  normaliseAqa7132PreCalibrationQuestionFamily,
  withAqa7132PreCalibrationAssemblyGuard,
  withAqa7132PreCalibrationRemediationGuard,
} from './foundation-precalibration-assembly'

function success(output: unknown): FoundationWorkerExecution<unknown> {
  return {
    status: 'success',
    output,
    provenance: {
      id: 'precalibration-test-run',
      contextId: 'precalibration-test-context',
      contractVersion: '1',
      provider: 'test-provider',
    },
  }
}

function blueprint() {
  return foundationAssessmentBlueprintSchema.parse({
    schemaVersion: 2,
    jobId: 'precalibration-job',
    boardAlignmentFingerprint: 'board-fingerprint',
    courseKnowledgeModelFingerprint: 'course-fingerprint',
    assessmentObjectives: [{ id: 'ao1' }, { id: 'ao2' }, { id: 'ao3' }, { id: 'ao4' }],
    assessmentRequirements: [
      { id: 'paper2-structure', summary: 'Three compulsory data-response questions worth approximately 33 marks each.', componentScope: ['paper-2'] },
      { id: 'paper3-structure', summary: 'One compulsory case study followed by approximately six questions.', componentScope: ['paper-3'] },
    ],
    components: [
      { componentId: 'paper-2', questionFamilyIds: ['paper2-data-response'], markTotal: 100, timingMinutes: 120, constraints: ['three compulsory data-response questions'] },
      { componentId: 'paper-3', questionFamilyIds: ['paper3-case-study'], markTotal: 100, timingMinutes: 120, constraints: ['one compulsory case study followed by approximately six questions'] },
    ],
    commandDemands: [],
    evidenceExpectations: [],
    quantitativeRequirements: [],
    synopticRequirements: [],
  })
}

function family(id: string, componentId: string) {
  return {
    schemaVersion: 1 as const,
    id,
    title: id.replaceAll('-', ' '),
    assessmentObjectiveIds: ['ao1', 'ao2', 'ao3', 'ao4'],
    skillProfile: ['business knowledge', 'application', 'analysis', 'evaluation'],
    componentScope: [componentId],
    markRange: { min: 5, max: 25 },
    responseShape: 'Six questions using a fixed 5/10/15/20/25/25 mark sequence and 6/12/18/24/30/30 minute pattern.',
    contextRequirements: ['original Revision-owned business context'],
    applicationRequirements: ['apply relevant business knowledge'],
    analysisRequirements: ['develop linked reasoning'],
    evaluationRequirements: ['reach a supported judgement'],
    commonFailureModes: ['assertion without development'],
    markingPackTemplateVersion: 'foundation-v1',
    calibrationStatus: 'not_calibrated' as const,
  }
}

describe('Foundation pre-calibration assessment assembly guard', () => {
  it('replaces rigid Paper 3 mark/timing assembly with the compiler-owned uncalibrated envelope', () => {
    const corrected = normaliseAqa7132PreCalibrationQuestionFamily(
      family('paper3-case-study', 'paper-3'),
      blueprint(),
    )

    expect(corrected.markRange).toEqual({ min: 1, max: 100 })
    expect(corrected.responseShape).toContain('approximately six questions')
    expect(corrected.responseShape).toContain('remain unfixed until qualified calibration')
    expect(corrected.responseShape).not.toContain('5/10/15/20/25/25')
    expect(corrected.calibrationStatus).toBe('not_calibrated')
  })

  it('fails closed when exact constituent mark/timing allocations are hidden outside responseShape', () => {
    expect(() => normaliseAqa7132PreCalibrationQuestionFamily({
      ...family('paper3-case-study', 'paper-3'),
      evaluationRequirements: ['Finish with two 25-mark strategic judgements.'],
    }, blueprint())).toThrow('unsupported exact constituent mark/timing allocation')
  })

  it('normalises initial Question Family compilation before persistence', async () => {
    const rawWorkers = {
      async compileQuestionFamilies() {
        return success([family('paper2-data-response', 'paper-2')])
      },
    } as unknown as FoundationCompilationWorkers
    const guarded = withAqa7132PreCalibrationAssemblyGuard(rawWorkers)

    const result = await guarded.compileQuestionFamilies({
      assessmentBlueprint: blueprint(),
    } as Parameters<FoundationCompilationWorkers['compileQuestionFamilies']>[0])

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    expect(result.output).toEqual([
      expect.objectContaining({
        id: 'paper2-data-response',
        markRange: { min: 1, max: 100 },
        responseShape: expect.stringContaining('constituent mark and timing allocations remain unfixed'),
      }),
    ])
  })

  it('normalises targeted remediation replacements through the same boundary', async () => {
    const rawWorkers = {
      async independentReview() {
        return success({ decision: 'pass', findings: [] })
      },
      async remediate() {
        return success({
          resolvedFindingIds: ['paper3-mark-and-timing-demand-is-not-calibrated'],
          resolutionNotes: ['Adjusted Paper 3 structure.'],
          replacements: [{
            artifactKind: 'question_family',
            oldRef: 'foundation:paper3-family',
            correctedArtifact: family('paper3-case-study', 'paper-3'),
          }],
        })
      },
    } as unknown as FoundationIndependentReviewWorkers
    const guarded = withAqa7132PreCalibrationRemediationGuard(rawWorkers)

    const result = await guarded.remediate({
      assessmentBlueprint: blueprint(),
    } as Parameters<FoundationIndependentReviewWorkers['remediate']>[0])

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    expect(result.output).toMatchObject({
      replacements: [{
        artifactKind: 'question_family',
        correctedArtifact: {
          id: 'paper3-case-study',
          markRange: { min: 1, max: 100 },
          calibrationStatus: 'not_calibrated',
        },
      }],
    })
  })
})
