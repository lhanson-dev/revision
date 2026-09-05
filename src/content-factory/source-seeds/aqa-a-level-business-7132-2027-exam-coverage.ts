import type { QuestionFamily } from '../schema'
import type { FoundationAssessmentBlueprint } from '../foundation-compilation'
import type {
  FoundationExamCoverageObligation,
  FoundationExamEvidenceItem,
} from '../requirement-led-coverage'

export const AQA_A_LEVEL_BUSINESS_7132_2027_EXAM_COVERAGE_PROFILE_ID = 'aqa-7132-2027-source-led-exam'

export const AQA_A_LEVEL_BUSINESS_7132_2027_EXAM_OBLIGATIONS: FoundationExamCoverageObligation[] = [
  obligation(
    'aqa-exam-all-content',
    '2.0 Specification at a glance',
    ['Assessment', 'All papers'],
    'All three A-level papers may assess content from across the full course.',
    ['all content'],
    ['aqa-7132-assessment'],
  ),
  obligation(
    'aqa-exam-paper1-structure',
    '2.0 Specification at a glance — Paper 1',
    ['Paper 1', 'Structure'],
    'Paper 1 is a two-hour, 100-mark paper with 15 one-mark MCQs, 35 marks of short-answer questions and two selected 25-mark essays.',
    ['2 hours', '100 marks', '15 one-mark MCQs', '35 marks', '25-mark', 'choice'],
    ['aqa-7132-assessment'],
  ),
  obligation(
    'aqa-exam-paper1-nine-mark-analysis',
    'Current AQA Paper 1 assessment evidence',
    ['Paper 1', 'Question demand'],
    'Current Paper 1 assessment evidence includes a 9-mark analyse response family and the Foundation must represent that authentic demand.',
    ['9-mark', 'analyse'],
    ['aqa-7132-assessment-resources'],
  ),
  obligation(
    'aqa-exam-paper2-structure',
    '2.0 Specification at a glance — Paper 2',
    ['Paper 2', 'Structure'],
    'Paper 2 is a two-hour, 100-mark paper with three compulsory data-response questions worth approximately 33 marks each, each made up of three or four parts.',
    ['2 hours', '100 marks', 'three compulsory data-response questions', 'approximately 33 marks', 'three or four parts'],
    ['aqa-7132-assessment'],
  ),
  obligation(
    'aqa-exam-paper3-structure',
    '2.0 Specification at a glance — Paper 3',
    ['Paper 3', 'Structure'],
    'Paper 3 is a two-hour, 100-mark paper with one compulsory case study followed by approximately six questions.',
    ['2 hours', '100 marks', 'one compulsory case study', 'approximately six questions'],
    ['aqa-7132-assessment'],
  ),
  obligation(
    'aqa-exam-ao-weighting',
    '4.2.1 Weighting of assessment objectives for A-level Business',
    ['Assessment objectives', 'Overall weighting'],
    'Current overall AO ranges are AO1 22–25%, AO2 24–27%, AO3 25–28% and AO4 23–26%.',
    ['AO1 22-25%', 'AO2 24-27%', 'AO3 25-28%', 'AO4 23-26%'],
    ['aqa-7132-scheme'],
  ),
  obligation(
    'aqa-exam-quantitative-minimum',
    'Annex: quantitative skills in business',
    ['Assessment', 'Quantitative skills'],
    'At least 10% of the overall A-level marks assess quantitative skills.',
    ['10%'],
    ['aqa-7132-specification'],
  ),
]

function obligation(
  obligationId: string,
  officialReference: string,
  examPath: string[],
  summary: string,
  requiredTerms: string[],
  sourceRefs: string[],
): FoundationExamCoverageObligation {
  return {
    obligationId,
    officialReference: `AQA 7132 ${officialReference}`,
    examPath,
    summary,
    evidenceItemIds: [`${obligationId}.e01`],
    requiredTerms,
    sourceRefs,
  }
}

function examEvidenceText(
  assessmentBlueprint: FoundationAssessmentBlueprint,
  questionFamilies: QuestionFamily[],
) {
  return JSON.stringify({
    assessmentRequirements: assessmentBlueprint.assessmentRequirements,
    components: assessmentBlueprint.components,
    assessmentObjectives: assessmentBlueprint.assessmentObjectives,
    evidenceExpectations: assessmentBlueprint.evidenceExpectations,
    quantitativeCoveragePlan: assessmentBlueprint.quantitativeCoveragePlan,
    questionFamilies: questionFamilies.map((family) => ({
      id: family.id,
      title: family.title,
      componentScope: family.componentScope,
      markRange: family.markRange,
      responseShape: family.responseShape,
      skillProfile: family.skillProfile,
      analysisRequirements: family.analysisRequirements,
    })),
  })
}

export function buildAqaAlevelBusiness7132ExamEvidenceItems(
  assessmentBlueprint: FoundationAssessmentBlueprint,
  questionFamilies: QuestionFamily[],
): FoundationExamEvidenceItem[] {
  const text = examEvidenceText(assessmentBlueprint, questionFamilies)
  return AQA_A_LEVEL_BUSINESS_7132_2027_EXAM_OBLIGATIONS.map((item) => ({
    id: item.evidenceItemIds[0],
    obligationId: item.obligationId,
    artifactKind: 'assessment_blueprint',
    text,
  }))
}
