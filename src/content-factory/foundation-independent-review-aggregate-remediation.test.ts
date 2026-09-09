import { describe, expect, it } from 'vitest'
import {
  foundationAssessmentBlueprintSchema,
  type FoundationWorkerExecution,
} from './foundation-compilation'
import type { FoundationStructuredProviderClient } from './foundation-live-adapter'
import type { FoundationIndependentReviewWorkers } from './foundation-independent-review'
import { createFoundationIndependentReviewLiveWorkers } from './foundation-independent-review-live-adapter'
import {
  AQA_A_LEVEL_BUSINESS_7132_AO_REQUIREMENT_ID,
  AQA_A_LEVEL_BUSINESS_7132_AO_REQUIREMENT_SUMMARY,
  AQA_A_LEVEL_BUSINESS_7132_AO_RANGES,
  normaliseAqa7132ExamTruth,
} from './foundation-precalibration-assembly'
import { questionFamilySchema } from './schema'

type ProviderRunInput = Parameters<FoundationStructuredProviderClient['run']>[0]
type RemediationInput = Parameters<FoundationIndependentReviewWorkers['remediate']>[0]

function success(output: unknown): FoundationWorkerExecution<unknown> {
  return {
    status: 'success',
    output,
    provenance: {
      id: 'aggregate-remediation-provider-run',
      contextId: 'fresh-aggregate-remediation-context',
      contractVersion: '1',
      provider: 'test-provider',
      model: 'test-model',
    },
  }
}

function sourceBlueprint() {
  return normaliseAqa7132ExamTruth({
    schemaVersion: 2,
    jobId: 'aggregate-remediation-job',
    boardAlignmentFingerprint: 'board-fingerprint',
    courseKnowledgeModelFingerprint: 'course-fingerprint',
    assessmentObjectives: [{ id: 'ao1' }, { id: 'ao2' }, { id: 'ao3' }, { id: 'ao4' }],
    assessmentRequirements: [
      { id: 'paper1-structure', summary: 'Paper 1 is a compulsory two-hour, 100-mark paper.', componentScope: ['paper-1'] },
      { id: 'paper2-structure', summary: 'Three compulsory data-response questions worth approximately 33 marks each.', componentScope: ['paper-2'] },
      { id: 'paper3-structure', summary: 'One compulsory case study followed by approximately six questions.', componentScope: ['paper-3'] },
      { id: AQA_A_LEVEL_BUSINESS_7132_AO_REQUIREMENT_ID, summary: AQA_A_LEVEL_BUSINESS_7132_AO_REQUIREMENT_SUMMARY, componentScope: ['paper-1', 'paper-2', 'paper-3'] },
      { id: 'aqa-exam-quantitative-minimum', summary: 'At least 10% of the overall A-level marks assess quantitative skills.', componentScope: ['paper-1', 'paper-2', 'paper-3'] },
    ],
    components: [
      { componentId: 'paper-1', questionFamilyIds: ['paper1-nine-mark-analysis'], markTotal: 100, timingMinutes: 120, constraints: [] },
      { componentId: 'paper-2', questionFamilyIds: ['paper2-data-response'], markTotal: 100, timingMinutes: 120, constraints: [] },
      { componentId: 'paper-3', questionFamilyIds: ['paper3-case-study'], markTotal: 100, timingMinutes: 120, constraints: [] },
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
      eligibleQuestionFamilyIds: ['paper1-nine-mark-analysis', 'paper2-data-response', 'paper3-case-study'],
      generationValidation: 'sum_quantitative_marks_gte_minimum',
      interpretationCreditRequired: true,
    },
    synopticRequirements: [],
  })
}

class AggregateDriftProvider implements FoundationStructuredProviderClient {
  readonly calls: ProviderRunInput[] = []

  async run(input: ProviderRunInput): Promise<FoundationWorkerExecution<unknown>> {
    this.calls.push(input)
    const current = sourceBlueprint()
    return success(input.outputSchema.parse({
      resolvedFindingIds: ['ao-weighting-no-aggregate-control', 'paper2-set-total-unbound'],
      resolutionNotes: ['Deliberately return the observed bad precision so compiler ownership is exercised.'],
      replacements: [
        {
          artifactKind: 'assessment_blueprint',
          oldRef: 'foundation/assessment-blueprint.json',
          correctedArtifact: {
            schemaVersion: 2,
            jobId: current.jobId,
            assessmentObjectives: [
              { id: 'ao1', weightingPercent: 23 },
              { id: 'ao2', weightingPercent: 25 },
              { id: 'ao3', weightingPercent: 26 },
              { id: 'ao4', weightingPercent: 26 },
            ],
            assessmentRequirements: current.assessmentRequirements.map((requirement) => (
              requirement.id === AQA_A_LEVEL_BUSINESS_7132_AO_REQUIREMENT_ID
                ? { ...requirement, summary: 'Provider attempts to replace ranges with exact targets.' }
                : requirement
            )),
            components: current.components,
            commandDemands: current.commandDemands,
            evidenceExpectations: [...current.evidenceExpectations, 'Target exact AO percentages 23/25/26/26.'],
            quantitativeRequirements: current.quantitativeRequirements,
            quantitativeCoveragePlan: current.quantitativeCoveragePlan,
            synopticRequirements: current.synopticRequirements,
          },
        },
        {
          artifactKind: 'question_family',
          oldRef: 'foundation/paper2-data-response.json',
          correctedArtifact: {
            schemaVersion: 1,
            id: 'paper2-data-response',
            title: 'Paper 2 data response',
            assessmentObjectiveIds: ['ao1', 'ao2', 'ao3', 'ao4'],
            skillProfile: ['application', 'analysis', 'evaluation'],
            componentScope: ['paper-2'],
            markRange: { min: 1, max: 99 },
            aggregateMarkTotal: 99,
            responseShape: 'Three compulsory data-response questions with a provider-defined aggregate total.',
            contextRequirements: [],
            applicationRequirements: [],
            analysisRequirements: [],
            evaluationRequirements: [],
            commonFailureModes: [],
            markingPackTemplateVersion: 'foundation-v1',
            calibrationStatus: 'not_calibrated',
          },
        },
      ],
    }))
  }
}

describe('Foundation aggregate remediation ownership', () => {
  it('restores source-backed AO ranges and exact complete-set totals instead of accepting provider precision', async () => {
    const provider = new AggregateDriftProvider()
    const workers = createFoundationIndependentReviewLiveWorkers({ provider })
    const assessmentBlueprint = sourceBlueprint()

    const input = {
      jobId: 'aggregate-remediation-job',
      sourceCandidateId: 'aggregate-remediation-candidate',
      reviewedCommit: 'a'.repeat(40),
      foundationFingerprint: 'b'.repeat(64),
      courseIdentity: {
        subject: 'Business',
        qualification: 'A-level',
        awardingBody: 'AQA',
        specificationId: '7132',
      },
      cohortValidity: { status: 'current' as const, firstAssessment: '2027', notes: [] },
      sourceEvidence: [],
      artifactIndex: [],
      boardAlignment: { fingerprint: 'board-fingerprint' } as RemediationInput['boardAlignment'],
      coverageModel: null as never,
      courseKnowledgeModel: { fingerprint: 'course-fingerprint' } as RemediationInput['courseKnowledgeModel'],
      assessmentBlueprint,
      questionFamilies: [],
      triggerReview: null as never,
      targets: [],
    } satisfies RemediationInput

    const result = await workers.remediate(input)

    expect(result.status).toBe('success')
    if (result.status !== 'success') throw new Error(result.error)
    const output = result.output as { replacements: Array<{ artifactKind: string; correctedArtifact: unknown }> }
    const correctedExam = foundationAssessmentBlueprintSchema.parse(
      output.replacements.find((replacement) => replacement.artifactKind === 'assessment_blueprint')?.correctedArtifact,
    )
    const correctedPaper2 = questionFamilySchema.parse(
      output.replacements.find((replacement) => replacement.artifactKind === 'question_family')?.correctedArtifact,
    )

    expect(correctedExam.assessmentObjectives).toEqual([{ id: 'ao1' }, { id: 'ao2' }, { id: 'ao3' }, { id: 'ao4' }])
    expect(correctedExam.assessmentRequirements.find((requirement) => requirement.id === AQA_A_LEVEL_BUSINESS_7132_AO_REQUIREMENT_ID)?.summary)
      .toBe(AQA_A_LEVEL_BUSINESS_7132_AO_REQUIREMENT_SUMMARY)
    expect(correctedExam.assessmentObjectiveCoveragePlan?.objectives)
      .toEqual(AQA_A_LEVEL_BUSINESS_7132_AO_RANGES.map((objective) => ({ ...objective })))
    expect(correctedExam.assessmentObjectiveCoveragePlan?.totalAssessmentMarks).toBe(300)
    expect(correctedPaper2.markRange).toEqual({ min: 1, max: 100 })
    expect(correctedPaper2.aggregateMarkTotal).toBe(100)
    expect(correctedPaper2.responseShape).toContain('constituent mark and timing allocations remain unfixed')
    expect(provider.calls[0].instructions).toContain('Do not invent exact AO weightingPercent targets')
    expect(provider.calls[0].instructions).toContain('exact complete-set aggregateMarkTotal')
  })
})
