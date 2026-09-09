import { describe, expect, it } from 'vitest'
import { assertExamRequirementCoverage } from './requirement-led-coverage'
import { questionFamilySchema } from './schema'
import {
  AQA_A_LEVEL_BUSINESS_7132_AO_REQUIREMENT_ID,
  AQA_A_LEVEL_BUSINESS_7132_AO_REQUIREMENT_SUMMARY,
  normaliseAqa7132ExamTruth,
} from './foundation-precalibration-assembly'
import {
  AQA_A_LEVEL_BUSINESS_7132_2027_EXAM_OBLIGATIONS,
  buildAqaAlevelBusiness7132ExamEvidenceItems,
} from './source-seeds/aqa-a-level-business-7132-2027-exam-coverage'

function blueprint() {
  return normaliseAqa7132ExamTruth({
    schemaVersion: 2,
    jobId: 'aqa-7132-exam-coverage-test',
    boardAlignmentFingerprint: 'board',
    courseKnowledgeModelFingerprint: 'course',
    assessmentObjectives: [{ id: 'ao1' }, { id: 'ao2' }, { id: 'ao3' }, { id: 'ao4' }],
    assessmentRequirements: [
      { id: 'all-content-all-papers', summary: 'All content may be assessed across all three papers.', componentScope: ['paper-1', 'paper-2', 'paper-3'] },
      { id: AQA_A_LEVEL_BUSINESS_7132_AO_REQUIREMENT_ID, summary: AQA_A_LEVEL_BUSINESS_7132_AO_REQUIREMENT_SUMMARY, componentScope: ['paper-1', 'paper-2', 'paper-3'] },
      { id: 'aqa-exam-quantitative-minimum', summary: 'At least 10% of the overall A-level marks assess quantitative skills.', componentScope: ['paper-1', 'paper-2', 'paper-3'] },
    ],
    components: [
      {
        componentId: 'paper-1',
        questionFamilyIds: ['paper1-mcq', 'paper1-short-answer', 'paper1-nine-mark-analysis', 'paper1-essay'],
        markTotal: 100,
        timingMinutes: 120,
        constraints: [
          'Paper 1 is a 2 hours, 100 marks component.',
          'Section A has 15 one-mark MCQs; Section B has 35 marks of short-answer questions; Sections C and D each require a choice of one 25-mark essay from two.',
        ],
      },
      {
        componentId: 'paper-2',
        questionFamilyIds: ['paper2-data-response'],
        markTotal: 100,
        timingMinutes: 120,
        constraints: [
          'Paper 2 is a 2 hours, 100 marks component.',
          'Three compulsory data-response questions are worth approximately 33 marks each and each is made up of three or four parts.',
        ],
      },
      {
        componentId: 'paper-3',
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
    ],
    commandDemands: [],
    quantitativeRequirements: [],
    quantitativeCoveragePlan: {
      sourceAssessmentRequirementId: 'aqa-exam-quantitative-minimum',
      scope: 'qualification_total',
      minimumOverallPercent: 10,
      totalAssessmentMarks: 300,
      minimumQuantitativeMarks: 30,
      eligibleQuestionFamilyIds: ['paper1-mcq', 'paper1-short-answer', 'paper1-nine-mark-analysis', 'paper1-essay', 'paper2-data-response', 'paper3-case-study'],
      generationValidation: 'sum_quantitative_marks_gte_minimum',
      interpretationCreditRequired: true,
    },
    synopticRequirements: [],
  })
}

function nineMarkFamily() {
  return questionFamilySchema.parse({
    schemaVersion: 1,
    id: 'paper1-nine-mark-analysis',
    title: 'Paper 1 9-mark analyse response',
    assessmentObjectiveIds: ['ao1', 'ao2', 'ao3'],
    skillProfile: ['9-mark analyse response'],
    componentScope: ['paper-1'],
    markRange: { min: 9, max: 9 },
    responseShape: 'One 9-mark analyse response requiring developed contextual analysis.',
    contextRequirements: [],
    applicationRequirements: ['apply relevant business knowledge'],
    analysisRequirements: ['analyse the stated business issue'],
    evaluationRequirements: [],
    commonFailureModes: ['undeveloped assertion'],
    markingPackTemplateVersion: 'foundation-v1',
    calibrationStatus: 'not_calibrated',
  })
}

describe('AQA 7132 / 2027 source-led Exam Truth coverage', () => {
  it('covers the current governed exam obligation set', () => {
    const examTruth = blueprint()
    expect(() => assertExamRequirementCoverage({
      obligations: AQA_A_LEVEL_BUSINESS_7132_2027_EXAM_OBLIGATIONS,
      evidenceItems: buildAqaAlevelBusiness7132ExamEvidenceItems(examTruth, [nineMarkFamily()]),
    })).not.toThrow()
  })

  it('fails when Paper 2 loses its three-or-four-part structure', () => {
    const examTruth = blueprint()
    const paper2 = examTruth.components.find((component) => component.componentId === 'paper-2')!
    paper2.constraints = paper2.constraints.map((value) => value.replace(' and each is made up of three or four parts.', '.'))

    expect(() => assertExamRequirementCoverage({
      obligations: AQA_A_LEVEL_BUSINESS_7132_2027_EXAM_OBLIGATIONS,
      evidenceItems: buildAqaAlevelBusiness7132ExamEvidenceItems(examTruth, [nineMarkFamily()]),
    })).toThrow('missing_required_exam_scope:aqa-exam-paper2-structure:three or four parts')
  })
})
