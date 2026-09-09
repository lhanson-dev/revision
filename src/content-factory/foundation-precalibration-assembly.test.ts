import { describe, expect, it } from 'vitest'
import {
  foundationAssessmentBlueprintSchema,
  type FoundationCompilationWorkers,
  type FoundationWorkerExecution,
} from './foundation-compilation'
import {
  AQA_A_LEVEL_BUSINESS_7132_AO_REQUIREMENT_ID,
  AQA_A_LEVEL_BUSINESS_7132_AO_REQUIREMENT_SUMMARY,
  AQA_A_LEVEL_BUSINESS_7132_AO_RANGES,
  AQA_A_LEVEL_BUSINESS_7132_QUANTITATIVE_REQUIREMENTS,
  aqa7132AssessmentObjectiveCoverageProblems,
  aqa7132PreCalibrationAssemblyProblems,
  normaliseAqa7132ExamTruth,
  normaliseAqa7132PreCalibrationQuestionFamily,
  withAqa7132PreCalibrationAssemblyGuard,
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
      { id: 'paper1-structure', summary: 'Paper 1 is a compulsory two-hour, 100-mark paper.', componentScope: ['paper-1'] },
      { id: 'paper2-structure', summary: 'Three compulsory data-response questions worth approximately 33 marks each.', componentScope: ['paper-2'] },
      { id: 'paper3-structure', summary: 'One compulsory case study followed by approximately six questions.', componentScope: ['paper-3'] },
      { id: 'all-content-all-papers', summary: 'All content may be assessed across all three papers.', componentScope: ['paper-1', 'paper-2', 'paper-3'] },
      { id: AQA_A_LEVEL_BUSINESS_7132_AO_REQUIREMENT_ID, summary: AQA_A_LEVEL_BUSINESS_7132_AO_REQUIREMENT_SUMMARY, componentScope: ['paper-1', 'paper-2', 'paper-3'] },
      { id: 'aqa-exam-quantitative-minimum', summary: 'At least 10% of the overall A-level marks assess quantitative skills.', componentScope: ['paper-1', 'paper-2', 'paper-3'] },
    ],
    components: [
      { componentId: 'paper-1', questionFamilyIds: ['paper1-mcq', 'paper1-short-answer', 'paper1-essay'], markTotal: 100, timingMinutes: 120, constraints: ['written examination'] },
      { componentId: 'paper-2', questionFamilyIds: ['paper2-data-response'], markTotal: 100, timingMinutes: 120, constraints: ['three compulsory data-response questions'] },
      { componentId: 'paper-3', questionFamilyIds: ['paper3-case-study'], markTotal: 100, timingMinutes: 120, constraints: ['one compulsory case study followed by approximately six questions'] },
    ],
    commandDemands: [],
    evidenceExpectations: [],
    quantitativeRequirements: [],
    quantitativeCoveragePlan: {
      sourceAssessmentRequirementId: 'aqa-exam-quantitative-minimum',
      scope: 'qualification_total',
      minimumOverallPercent: 10,
      totalAssessmentMarks: 300,
      minimumQuantitativeMarks: 30,
      eligibleQuestionFamilyIds: ['paper1-mcq', 'paper1-short-answer', 'paper1-essay', 'paper2-data-response', 'paper3-case-study'],
      generationValidation: 'sum_quantitative_marks_gte_minimum',
      interpretationCreditRequired: true,
    },
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
  it('replaces rigid Paper 3 mark/timing assembly with the compiler-owned uncalibrated envelope and exact complete-set total', () => {
    const corrected = normaliseAqa7132PreCalibrationQuestionFamily(
      family('paper3-case-study', 'paper-3'),
      blueprint(),
    )

    expect(corrected.markRange).toEqual({ min: 1, max: 100 })
    expect(corrected.aggregateMarkTotal).toBe(100)
    expect(corrected.responseShape).toContain('approximately six questions')
    expect(corrected.responseShape).toContain('remain unfixed until qualified calibration')
    expect(corrected.responseShape).not.toContain('5/10/15/20/25/25')
    expect(corrected.calibrationStatus).toBe('not_calibrated')
    expect(aqa7132PreCalibrationAssemblyProblems(corrected, blueprint())).toEqual([])
  })

  it('allows verified aggregate component timing while constituent allocations remain unfixed', () => {
    const corrected = normaliseAqa7132PreCalibrationQuestionFamily({
      ...family('paper2-data-response', 'paper-2'),
      analysisRequirements: [
        'Validate the component-level 120-minute response-time envelope while leaving constituent timings unfixed until qualified calibration.',
      ],
    }, blueprint())

    expect(corrected.analysisRequirements).toContain(
      'Validate the component-level 120-minute response-time envelope while leaving constituent timings unfixed until qualified calibration.',
    )
    expect(corrected.markRange).toEqual({ min: 1, max: 100 })
    expect(corrected.aggregateMarkTotal).toBe(100)
    expect(aqa7132PreCalibrationAssemblyProblems(corrected, blueprint())).toEqual([])
  })

  it('fails closed when exact constituent mark/timing allocations are hidden outside responseShape', () => {
    expect(() => normaliseAqa7132PreCalibrationQuestionFamily({
      ...family('paper3-case-study', 'paper-3'),
      evaluationRequirements: ['Finish with two 25-mark strategic judgements.'],
    }, blueprint())).toThrow('unsupported exact constituent mark/timing allocation')
  })

  it('still rejects exact constituent timings even when the sentence also mentions the paper', () => {
    expect(() => normaliseAqa7132PreCalibrationQuestionFamily({
      ...family('paper2-data-response', 'paper-2'),
      analysisRequirements: ['Within the paper, each data-response set should use a 40-minute allocation.'],
    }, blueprint())).toThrow('unsupported exact constituent mark/timing allocation')
  })

  it('reports persisted pre-calibration drift deterministically', () => {
    const problems = aqa7132PreCalibrationAssemblyProblems(
      family('paper3-case-study', 'paper-3'),
      blueprint(),
    )

    expect(problems).toEqual(expect.arrayContaining([
      expect.stringContaining('component-wide pre-calibration mark envelope'),
      expect.stringContaining('complete-set aggregate mark total'),
      expect.stringContaining('aggregate-only pre-calibration response shape'),
    ]))
  })

  it('materialises source-backed qualification AO ranges and removes invented exact AO targets', () => {
    const corrected = normaliseAqa7132ExamTruth({
      ...blueprint(),
      assessmentObjectives: [
        { id: 'ao1', weightingPercent: 23 },
        { id: 'ao2', weightingPercent: 25 },
        { id: 'ao3', weightingPercent: 26 },
        { id: 'ao4', weightingPercent: 26 },
      ],
    })

    expect(corrected.assessmentObjectives).toEqual([
      { id: 'ao1' },
      { id: 'ao2' },
      { id: 'ao3' },
      { id: 'ao4' },
    ])
    expect(corrected.assessmentObjectiveCoveragePlan).toEqual({
      sourceAssessmentRequirementId: AQA_A_LEVEL_BUSINESS_7132_AO_REQUIREMENT_ID,
      scope: 'qualification_total',
      totalAssessmentMarks: 300,
      objectives: AQA_A_LEVEL_BUSINESS_7132_AO_RANGES.map((objective) => ({ ...objective })),
      generationValidation: 'sum_assessment_objective_marks_within_ranges',
      allocationRequiredAt: 'marking_pack_generation',
    })
    expect(aqa7132AssessmentObjectiveCoverageProblems(corrected)).toEqual([])
  })

  it('materialises and deterministically checks paper-level AO ranges and complete quantitative constraints', () => {
    const corrected = normaliseAqa7132ExamTruth(blueprint())

    expect(corrected.components.find((component) => component.componentId === 'paper-1')?.constraints)
      .toContain('Paper 1 assessment-objective ranges: AO1 9–11%, AO2 9–11%, AO3 5–8%, AO4 5–8%.')
    expect(corrected.components.find((component) => component.componentId === 'paper-2')?.constraints)
      .toContain('Paper 2 assessment-objective ranges: AO1 6–8%, AO2 8–11%, AO3 8–11%, AO4 6–9%.')
    expect(corrected.components.find((component) => component.componentId === 'paper-3')?.constraints)
      .toContain('Paper 3 assessment-objective ranges: AO1 5–8%, AO2 5–7%, AO3 9–12%, AO4 9–12%.')
    expect(corrected.evidenceExpectations).toEqual(expect.arrayContaining([...AQA_A_LEVEL_BUSINESS_7132_QUANTITATIVE_REQUIREMENTS]))
    expect(aqa7132AssessmentObjectiveCoverageProblems(corrected)).toEqual([])
  })

  it('fails deterministic assurance if a paper AO range or quantitative constraint is removed', () => {
    const corrected = normaliseAqa7132ExamTruth(blueprint())
    const missingPaperRange = {
      ...corrected,
      components: corrected.components.map((component) => component.componentId === 'paper-2'
        ? { ...component, constraints: component.constraints.filter((constraint) => !constraint.startsWith('Paper 2 assessment-objective ranges:')) }
        : component),
    }
    expect(aqa7132AssessmentObjectiveCoverageProblems(missingPaperRange)).toEqual(expect.arrayContaining([
      expect.stringContaining('paper-2 is missing its governed component-level AO ranges'),
    ]))

    const missingQuantitativeConstraint = {
      ...corrected,
      evidenceExpectations: corrected.evidenceExpectations.filter((entry) => entry !== AQA_A_LEVEL_BUSINESS_7132_QUANTITATIVE_REQUIREMENTS[1]),
    }
    expect(aqa7132AssessmentObjectiveCoverageProblems(missingQuantitativeConstraint)).toEqual(expect.arrayContaining([
      expect.stringContaining('Level 2 mathematical skills'),
    ]))
  })

  it('detects an altered AO range plan rather than accepting provider precision', () => {
    const corrected = normaliseAqa7132ExamTruth(blueprint())
    expect(aqa7132AssessmentObjectiveCoverageProblems({
      ...corrected,
      assessmentObjectiveCoveragePlan: {
        ...corrected.assessmentObjectiveCoveragePlan!,
        objectives: corrected.assessmentObjectiveCoveragePlan!.objectives.map((objective) => (
          objective.objectiveId === 'ao1' ? { ...objective, minPercent: 23 } : objective
        )),
      },
    })).toEqual(expect.arrayContaining([
      expect.stringContaining('ao1'),
    ]))
  })

  it('normalises initial Question Family compilation and proves the source-led exam obligation set', async () => {
    const rawWorkers = {
      async compileExamTruth() {
        return success(blueprint())
      },
      async compileQuestionFamilies() {
        return success([
          family('paper1-mcq', 'paper-1'),
          family('paper1-short-answer', 'paper-1'),
          family('paper1-essay', 'paper-1'),
          family('paper1-nine-mark-analysis', 'paper-1'),
          family('paper2-data-response', 'paper-2'),
          family('paper3-case-study', 'paper-3'),
        ])
      },
    } as unknown as FoundationCompilationWorkers
    const guarded = withAqa7132PreCalibrationAssemblyGuard(rawWorkers)

    const examExecution = await guarded.compileExamTruth({} as Parameters<FoundationCompilationWorkers['compileExamTruth']>[0])
    expect(examExecution.status).toBe('success')
    if (examExecution.status !== 'success') throw new Error(examExecution.error)
    const examTruth = foundationAssessmentBlueprintSchema.parse(examExecution.output)

    const result = await guarded.compileQuestionFamilies({
      assessmentBlueprint: examTruth,
    } as Parameters<FoundationCompilationWorkers['compileQuestionFamilies']>[0])

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    expect(result.output).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'paper1-nine-mark-analysis',
        markRange: { min: 9, max: 9 },
        responseShape: expect.stringContaining('9-mark analyse'),
      }),
      expect.objectContaining({
        id: 'paper2-data-response',
        markRange: { min: 1, max: 100 },
        aggregateMarkTotal: 100,
        responseShape: expect.stringContaining('three or four parts'),
      }),
      expect.objectContaining({
        id: 'paper3-case-study',
        markRange: { min: 1, max: 100 },
        aggregateMarkTotal: 100,
        responseShape: expect.stringContaining('approximately six questions'),
      }),
    ]))
  })
})
