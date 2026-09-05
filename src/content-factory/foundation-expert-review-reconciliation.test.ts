import { describe, expect, it } from 'vitest'
import { foundationAssessmentBlueprintSchema } from './foundation-compilation'
import { questionFamilySchema } from './schema'
import { buildAqa7132FoundationExpertReviewCoverageReconciliation } from './foundation-expert-review-reconciliation'
import { canonicalKnowledgeNodeId, type FoundationSemanticCoverageItem } from './requirement-led-coverage'
import { AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED } from './source-seeds/aqa-a-level-business-7132-2027'

function semanticItems(): FoundationSemanticCoverageItem[] {
  return AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED.requirements.flatMap((requirement) =>
    requirement.skillsOrKnowledge.map((text, knowledgeItemIndex) => ({
      id: `${requirement.requirementId}.s${String(knowledgeItemIndex + 1).padStart(2, '0')}`,
      requirementId: requirement.requirementId,
      officialReference: requirement.officialReference,
      knowledgeItemIndex,
      text,
    })),
  )
}

function coverageModel() {
  return {
    schemaVersion: 2 as const,
    jobId: 'aqa-7132-reconciliation-test',
    sourceSetFingerprint: 'source-set',
    requirements: AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED.requirements.map((requirement) => ({
      ...requirement,
      knowledgeNodeIds: requirement.skillsOrKnowledge.map((_, knowledgeItemIndex) =>
        canonicalKnowledgeNodeId({ requirementId: requirement.requirementId, knowledgeItemIndex }),
      ),
      coverageStatus: 'complete' as const,
    })),
  }
}

function courseKnowledgeModel() {
  return {
    schemaVersion: 1 as const,
    jobId: 'aqa-7132-reconciliation-test',
    fingerprint: 'course-value-fingerprint',
    nodes: semanticItems().map((item) => ({
      id: canonicalKnowledgeNodeId(item),
      kind: 'concept' as const,
      summary: item.text,
      prerequisiteIds: [],
      relatedIds: [],
      formulas: [],
      misconceptions: [],
      applicationContexts: [],
      depth: 'core' as const,
      sourceRefs: [AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED.seedId],
      boardAlignmentRefs: [],
      evidenceTypes: ['written response'],
    })),
  }
}

function assessmentBlueprint() {
  return foundationAssessmentBlueprintSchema.parse({
    schemaVersion: 2,
    jobId: 'aqa-7132-reconciliation-test',
    boardAlignmentFingerprint: 'board-value-fingerprint',
    courseKnowledgeModelFingerprint: 'course-value-fingerprint',
    assessmentObjectives: [{ id: 'ao1' }, { id: 'ao2' }, { id: 'ao3' }, { id: 'ao4' }],
    assessmentRequirements: [
      { id: 'all-content-all-papers', summary: 'All content may be assessed across all three papers.', componentScope: ['paper-1', 'paper-2', 'paper-3'] },
    ],
    components: [
      {
        componentId: 'paper-1',
        questionFamilyIds: ['paper1-nine-mark-analysis'],
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
      'Current overall assessment-objective ranges are AO1 22-25%, AO2 24-27%, AO3 25-28% and AO4 23-26%.',
      'At least 10% of the overall A-level marks assess quantitative skills.',
    ],
    commandDemands: [],
    quantitativeRequirements: [],
    synopticRequirements: [],
  })
}

function family(id: string, componentId: string, markRange: { min: number; max: number }, skillProfile: string[]) {
  return questionFamilySchema.parse({
    schemaVersion: 1,
    id,
    title: id,
    assessmentObjectiveIds: ['ao1', 'ao2', 'ao3'],
    skillProfile,
    componentScope: [componentId],
    markRange,
    responseShape: `${id} response shape`,
    contextRequirements: [],
    applicationRequirements: [],
    analysisRequirements: id === 'paper1-nine-mark-analysis' ? ['analyse the stated business issue'] : [],
    evaluationRequirements: [],
    commonFailureModes: [],
    markingPackTemplateVersion: 'foundation-v1',
    calibrationStatus: 'not_calibrated',
  })
}

const families = [
  family('paper1-nine-mark-analysis', 'paper-1', { min: 9, max: 9 }, ['9-mark analyse response']),
  family('paper2-data-response', 'paper-2', { min: 1, max: 100 }, ['data response']),
  family('paper3-case-study', 'paper-3', { min: 1, max: 100 }, ['case study']),
]

const refs = {
  sources: { ref: 'foundation/sources.json', fingerprint: 'sources-fingerprint' },
  board: { ref: 'foundation/board.json', fingerprint: 'board-fingerprint' },
  coverage: { ref: 'foundation/coverage.json', fingerprint: 'coverage-fingerprint' },
  course: { ref: 'foundation/course.json', fingerprint: 'course-fingerprint' },
  exam: { ref: 'foundation/exam.json', fingerprint: 'exam-fingerprint' },
  qfs: families.map((entry) => ({ ref: `foundation/${entry.id}.json`, fingerprint: `${entry.id}-fingerprint` })),
}

function candidate() {
  return {
    schemaVersion: 1 as const,
    candidateId: 'aqa-7132-reconciliation-candidate',
    courseIdentity: { subject: 'Business', qualification: 'A-level', awardingBody: 'AQA', specificationId: '7132' },
    cohortValidity: { status: 'outgoing' as const, lastAssessment: '2027', notes: [] },
    sourceLicenceRegister: refs.sources,
    sourceRightsStatus: 'approved' as const,
    boardAlignment: refs.board,
    boardAlignmentStatus: 'verified' as const,
    coverageModel: refs.coverage,
    coverageCompleteness: 'complete' as const,
    courseKnowledgeModel: refs.course,
    courseTruthCompleteness: 'complete' as const,
    assessmentBlueprint: refs.exam,
    examTruthCompleteness: 'complete' as const,
    questionFamilies: refs.qfs,
    deterministicAssurance: { status: 'pending' as const, evidenceRefs: [] },
    independentReview: { status: 'pending' as const, evidenceRefs: [] },
    unresolvedBlockers: [],
    knownLimitations: [],
    provenance: { createdAt: '2026-09-05T00:00:00Z', producerVersion: 'test', sourceSetFingerprint: 'source-set' },
  }
}

function sourceRegisterValue(includeMarkScheme = true) {
  const ids = [
    'aqa-7132-subject-content',
    'aqa-7132-specification',
    'aqa-7132-assessment',
    'aqa-7132-scheme',
    'revision-aqa-7132-2027-course-truth-seed',
  ]
  if (includeMarkScheme) ids.push('aqa-7132-paper1-june2023-mark-scheme')
  return { sources: ids.map((id) => ({ id })) }
}

function resolvedArtifacts(includeMarkScheme = true) {
  return [
    { artifactKind: 'source_licence_register' as const, artifactRef: refs.sources.ref, fingerprint: refs.sources.fingerprint, value: sourceRegisterValue(includeMarkScheme) },
    { artifactKind: 'board_alignment' as const, artifactRef: refs.board.ref, fingerprint: refs.board.fingerprint, value: {} },
    { artifactKind: 'foundation_coverage_model' as const, artifactRef: refs.coverage.ref, fingerprint: refs.coverage.fingerprint, value: coverageModel() },
    { artifactKind: 'course_knowledge_model' as const, artifactRef: refs.course.ref, fingerprint: refs.course.fingerprint, value: courseKnowledgeModel() },
    { artifactKind: 'assessment_blueprint' as const, artifactRef: refs.exam.ref, fingerprint: refs.exam.fingerprint, value: assessmentBlueprint() },
    ...families.map((entry, index) => ({
      artifactKind: 'question_family' as const,
      artifactRef: refs.qfs[index].ref,
      fingerprint: refs.qfs[index].fingerprint,
      value: entry,
    })),
  ]
}

describe('AQA 7132 expert-review coverage reconciliation', () => {
  it('packages complete source-led curriculum and exam obligations with exact artifact mappings', () => {
    const result = buildAqa7132FoundationExpertReviewCoverageReconciliation({
      candidate: candidate(),
      resolvedArtifacts: resolvedArtifacts(),
    })

    expect(result.status).toBe('complete')
    expect(result.curriculum.length).toBe(AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED.requirements.length)
    expect(result.exam.map((item) => item.obligationId)).toContain('aqa-exam-paper1-nine-mark-analysis')
    expect(result.exam.find((item) => item.obligationId === 'aqa-exam-paper1-nine-mark-analysis')?.resolvedArtifactRefs)
      .toContain('foundation/paper1-nine-mark-analysis.json')
  })

  it('fails closed when the current 9-mark source reference is absent from the packaged source register', () => {
    expect(() => buildAqa7132FoundationExpertReviewCoverageReconciliation({
      candidate: candidate(),
      resolvedArtifacts: resolvedArtifacts(false),
    })).toThrow('coverage_reconciliation_missing_source_ref:aqa-7132-paper1-june2023-mark-scheme')
  })

  it('fails closed when a curriculum obligation loses its Course Truth node mapping', () => {
    const artifacts = resolvedArtifacts()
    const coverage = artifacts.find((artifact) => artifact.artifactKind === 'foundation_coverage_model')!
    const value = structuredClone(coverage.value as ReturnType<typeof coverageModel>)
    value.requirements[0].knowledgeNodeIds = ['aqa-3-0-course-context.unmapped']
    coverage.value = value

    expect(() => buildAqa7132FoundationExpertReviewCoverageReconciliation({
      candidate: candidate(),
      resolvedArtifacts: artifacts,
    })).toThrow(/coverage_reconciliation_missing_curriculum_node_mapping/)
  })
})
