import { describe, expect, it } from 'vitest'
import { assertExamRequirementCoverage } from './requirement-led-coverage'
import { foundationAssessmentBlueprintSchema } from './foundation-compilation'
import {
  serializeFoundationAssessmentObjectiveCoveragePlan,
  type FoundationAssessmentObjectiveCoveragePlan,
} from './foundation-assessment-objective-coverage'
import {
  AQA_A_LEVEL_BUSINESS_7132_2027_EXAM_OBLIGATIONS,
  buildAqaAlevelBusiness7132ExamEvidenceItems,
} from './source-seeds/aqa-a-level-business-7132-2027-exam-coverage'

const aoPlan: FoundationAssessmentObjectiveCoveragePlan = {
  schemaVersion: 1,
  sourceAssessmentRequirementId: 'aqa-exam-ao-weighting',
  scope: 'qualification_total',
  totalAssessmentMarks: 300,
  objectives: [
    { assessmentObjectiveId: 'ao1', minWeightingPercent: 22, maxWeightingPercent: 25 },
    { assessmentObjectiveId: 'ao2', minWeightingPercent: 24, maxWeightingPercent: 27 },
    { assessmentObjectiveId: 'ao3', minWeightingPercent: 25, maxWeightingPercent: 28 },
    { assessmentObjectiveId: 'ao4', minWeightingPercent: 23, maxWeightingPercent: 26 },
  ],
  accountingBasis: 'primary_assessment_objective_marks',
  multiObjectiveTreatment: 'each_mark_allocated_once_to_a_primary_objective',
  generationValidation: 'sum_assessment_objective_marks_within_ranges',
  questionFamilyCoverageRequired: true,
}

function blueprint() {
  return foundationAssessmentBlueprintSchema.parse({
    schemaVersion: 2,
    jobId: 'aqa-7132-exam-coverage-test',
    boardAlignmentFingerprint: 'board',
    courseKnowledgeModelFingerprint: 'course',
    assessmentObjectives: [{ id: 'ao1' }, { id: 'ao2' }, { id: 'ao3' }, { id: 'ao4' }],
    assessmentRequirements: [
      { id: 'all-content-all-papers', summary: 'All content may be assessed across all three papers.', componentScope: ['paper1', 'paper2', 'paper3'] },
      { id: 'aqa-exam-ao-weighting', summary: 'AO1 22-25%, AO2 24-27%, AO3 25-28%, AO4 23-26%.', componentScope: ['paper1', 'paper2', 'paper3'] },
    ],
    components: [
      {
        componentId: 'paper1',
        questionFamilyIds: ['paper1-mcq', 'paper1-short-response', 'paper1-extended-response'],
        markTotal: 100,
        timingMinutes: 120,
        constraints: [
          'Paper 1 is a 2 hours, 100 marks component.',
          'Paper 1 contains 15 one-mark MCQs, 35 marks of short-answer questions and two 25-mark essay questions.',
        ],
      },
      {
        componentId: 'paper2',
        questionFamilyIds: ['paper2-data-response'],
        markTotal: 100,
        timingMinutes: 120,
        constraints: [
          'Paper 2 is a 2 hours, 100 marks component.',
          'Three compulsory data-response questions are worth approximately 33 marks each and each is made up of three or four parts.',
        ],
      },
      {
        componentId: 'paper3',
        questionFamilyIds: ['paper3-case-study'],
        markTotal: 100,
        timingMinutes: 120,
        constraints: [
          'Paper 3 is a 2 hours, 100 marks component.',
          'One compulsory case study is followed by approximately six questions.',
        ],
      },
    ],
    evidenceExpectations: [
      'All content may be assessed across Paper 1, Paper 2 and Paper 3.',
      'Current overall assessment-objective ranges are AO1 22-25%, AO2 24-27%, AO3 25-28% and AO4 23-26%.',
      'At least 10% of the overall A-level marks assess quantitative skills.',
      serializeFoundationAssessmentObjectiveCoveragePlan(aoPlan),
    ],
    commandDemands: [],
    quantitativeRequirements: [],
    synopticRequirements: [],
  })
}

describe('AQA 7132 / 2027 source-led Exam Truth coverage', () => {
  it('covers the current governed qualification exam obligation set without historical constituent mark patterns', () => {
    const examTruth = blueprint()
    expect(AQA_A_LEVEL_BUSINESS_7132_2027_EXAM_OBLIGATIONS.map((item) => item.obligationId))
      .not.toContain('aqa-exam-paper1-nine-mark-analysis')
    expect(() => assertExamRequirementCoverage({
      obligations: AQA_A_LEVEL_BUSINESS_7132_2027_EXAM_OBLIGATIONS,
      evidenceItems: buildAqaAlevelBusiness7132ExamEvidenceItems(examTruth, []),
    })).not.toThrow()
  })

  it('fails when the machine-readable AO accounting contract is absent', () => {
    const examTruth = blueprint()
    examTruth.evidenceExpectations = examTruth.evidenceExpectations.filter((value) => !value.startsWith('revision:ao-coverage-plan:v1:'))

    expect(() => assertExamRequirementCoverage({
      obligations: AQA_A_LEVEL_BUSINESS_7132_2027_EXAM_OBLIGATIONS,
      evidenceItems: buildAqaAlevelBusiness7132ExamEvidenceItems(examTruth, []),
    })).toThrow('missing_required_exam_scope:aqa-exam-ao-weighting:revision:ao-coverage-plan:v1:')
  })

  it('fails when Paper 2 loses its three-or-four-part structure', () => {
    const examTruth = blueprint()
    const paper2 = examTruth.components.find((component) => component.componentId === 'paper2')!
    paper2.constraints = paper2.constraints.map((value) => value.replace(' and each is made up of three or four parts.', '.'))

    expect(() => assertExamRequirementCoverage({
      obligations: AQA_A_LEVEL_BUSINESS_7132_2027_EXAM_OBLIGATIONS,
      evidenceItems: buildAqaAlevelBusiness7132ExamEvidenceItems(examTruth, []),
    })).toThrow('missing_required_exam_scope:aqa-exam-paper2-structure:three or four parts')
  })
})
