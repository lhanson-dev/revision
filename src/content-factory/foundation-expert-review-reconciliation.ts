import { z } from 'zod'
import {
  courseKnowledgeModelSchema,
  foundationReviewableArtifactKindSchema,
  questionFamilySchema,
} from './foundation-independent-review'
import {
  foundationAssessmentBlueprintSchema,
  foundationCoverageModelSchema,
} from './foundation-compilation'
import { foundationCandidateSchema, type FoundationCandidate } from './foundation-schema'
import {
  assertExamRequirementCoverage,
  assertRequirementLedCoverage,
  canonicalKnowledgeNodeId,
  type FoundationSemanticCoverageItem,
} from './requirement-led-coverage'
import {
  AQA_A_LEVEL_BUSINESS_7132_2027_COVERAGE_PROFILE_ID,
  buildAqaAlevelBusiness7132CurriculumObligations,
} from './source-seeds/aqa-a-level-business-7132-2027-coverage'
import {
  AQA_A_LEVEL_BUSINESS_7132_2027_EXAM_COVERAGE_PROFILE_ID,
  AQA_A_LEVEL_BUSINESS_7132_2027_EXAM_OBLIGATIONS,
  buildAqaAlevelBusiness7132ExamEvidenceItems,
} from './source-seeds/aqa-a-level-business-7132-2027-exam-coverage'
import { AQA_A_LEVEL_BUSINESS_7132_2027_COURSE_TRUTH_SEED } from './source-seeds/aqa-a-level-business-7132-2027'

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const nonEmptyStringSchema = z.string().min(1)

const resolvedArtifactSchema = z.object({
  artifactKind: foundationReviewableArtifactKindSchema,
  artifactRef: nonEmptyStringSchema,
  fingerprint: nonEmptyStringSchema,
  value: z.unknown(),
})

export const foundationExpertReviewCurriculumReconciliationItemSchema = z.object({
  obligationId: identifierSchema,
  officialReference: nonEmptyStringSchema,
  curriculumPath: z.array(nonEmptyStringSchema).min(1),
  summary: nonEmptyStringSchema,
  requiredTerms: z.array(nonEmptyStringSchema).default([]),
  sourceRefs: z.array(identifierSchema).min(1),
  semanticItemIds: z.array(identifierSchema).min(1),
  courseTruthNodeIds: z.array(identifierSchema).min(1),
  resolvedArtifactRefs: z.array(nonEmptyStringSchema).min(1),
})

export const foundationExpertReviewExamReconciliationItemSchema = z.object({
  obligationId: identifierSchema,
  officialReference: nonEmptyStringSchema,
  examPath: z.array(nonEmptyStringSchema).min(1),
  summary: nonEmptyStringSchema,
  requiredTerms: z.array(nonEmptyStringSchema).default([]),
  sourceRefs: z.array(identifierSchema).min(1),
  evidenceItemIds: z.array(identifierSchema).min(1),
  resolvedArtifactRefs: z.array(nonEmptyStringSchema).min(1),
})

export const foundationExpertReviewCoverageReconciliationSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('foundation_coverage_reconciliation'),
  status: z.literal('complete'),
  curriculumProfileId: nonEmptyStringSchema,
  examProfileId: nonEmptyStringSchema,
  sourceLicenceRegisterRef: nonEmptyStringSchema,
  curriculum: z.array(foundationExpertReviewCurriculumReconciliationItemSchema).min(1),
  exam: z.array(foundationExpertReviewExamReconciliationItemSchema).min(1),
})

function semanticItemsFromSeed(): FoundationSemanticCoverageItem[] {
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

function requireExactArtifact(
  candidate: FoundationCandidate,
  resolvedArtifacts: Array<z.infer<typeof resolvedArtifactSchema>>,
  artifactKind: z.infer<typeof foundationReviewableArtifactKindSchema>,
  artifactRef: string,
  expectedFingerprint: string,
) {
  const artifact = resolvedArtifacts.find((entry) => entry.artifactKind === artifactKind && entry.artifactRef === artifactRef)
  if (!artifact) throw new Error(`coverage_reconciliation_missing_artifact:${artifactKind}:${artifactRef}`)
  if (artifact.fingerprint !== expectedFingerprint) {
    throw new Error(`coverage_reconciliation_artifact_fingerprint_mismatch:${artifactRef}`)
  }
  return artifact
}

function assertSourceRefsResolve(sourceRegisterValue: unknown, sourceRefs: string[]) {
  const register = z.object({
    sources: z.array(z.object({ id: identifierSchema }).passthrough()).min(1),
  }).passthrough().parse(sourceRegisterValue)
  const sourceIds = new Set(register.sources.map((source) => source.id))
  for (const sourceRef of sourceRefs) {
    if (!sourceIds.has(sourceRef)) throw new Error(`coverage_reconciliation_missing_source_ref:${sourceRef}`)
  }
}

function examArtifactRefs(
  obligationId: string,
  boardAlignmentRef: string,
  assessmentBlueprintRef: string,
  questionFamilyRefById: Map<string, string>,
) {
  const refs = new Set([boardAlignmentRef, assessmentBlueprintRef])
  const addQuestionFamily = (id: string) => {
    const ref = questionFamilyRefById.get(id)
    if (!ref) throw new Error(`coverage_reconciliation_missing_question_family:${id}`)
    refs.add(ref)
  }

  if (obligationId === 'aqa-exam-paper1-nine-mark-analysis') addQuestionFamily('paper1-nine-mark-analysis')
  if (obligationId === 'aqa-exam-paper2-structure') addQuestionFamily('paper2-data-response')
  if (obligationId === 'aqa-exam-paper3-structure') addQuestionFamily('paper3-case-study')
  if (obligationId === 'aqa-exam-all-content') {
    for (const ref of questionFamilyRefById.values()) refs.add(ref)
  }

  return [...refs]
}

export function buildAqa7132FoundationExpertReviewCoverageReconciliation(input: {
  candidate: FoundationCandidate
  resolvedArtifacts: Array<z.infer<typeof resolvedArtifactSchema>>
}) {
  const candidate = foundationCandidateSchema.parse(input.candidate)
  const resolvedArtifacts = z.array(resolvedArtifactSchema).min(1).parse(input.resolvedArtifacts)

  if (
    candidate.courseIdentity.awardingBody !== 'AQA'
    || candidate.courseIdentity.qualification !== 'A-level'
    || candidate.courseIdentity.subject !== 'Business'
    || candidate.courseIdentity.specificationId !== '7132'
    || candidate.cohortValidity.lastAssessment !== '2027'
  ) {
    throw new Error('coverage_reconciliation_profile_mismatch:aqa-7132-2027')
  }

  const sourceRegisterArtifact = requireExactArtifact(
    candidate,
    resolvedArtifacts,
    'source_licence_register',
    candidate.sourceLicenceRegister.ref,
    candidate.sourceLicenceRegister.fingerprint,
  )
  const boardAlignmentArtifact = requireExactArtifact(
    candidate,
    resolvedArtifacts,
    'board_alignment',
    candidate.boardAlignment.ref,
    candidate.boardAlignment.fingerprint,
  )
  const coverageArtifact = requireExactArtifact(
    candidate,
    resolvedArtifacts,
    'foundation_coverage_model',
    candidate.coverageModel.ref,
    candidate.coverageModel.fingerprint,
  )
  const courseTruthArtifact = requireExactArtifact(
    candidate,
    resolvedArtifacts,
    'course_knowledge_model',
    candidate.courseKnowledgeModel.ref,
    candidate.courseKnowledgeModel.fingerprint,
  )
  const assessmentBlueprintArtifact = requireExactArtifact(
    candidate,
    resolvedArtifacts,
    'assessment_blueprint',
    candidate.assessmentBlueprint.ref,
    candidate.assessmentBlueprint.fingerprint,
  )

  const coverage = foundationCoverageModelSchema.parse(coverageArtifact.value)
  const courseTruth = courseKnowledgeModelSchema.parse(courseTruthArtifact.value)
  const assessmentBlueprint = foundationAssessmentBlueprintSchema.parse(assessmentBlueprintArtifact.value)

  const questionFamilyRefById = new Map<string, string>()
  const questionFamilies = candidate.questionFamilies.map((expected) => {
    const artifact = requireExactArtifact(candidate, resolvedArtifacts, 'question_family', expected.ref, expected.fingerprint)
    const family = questionFamilySchema.parse(artifact.value)
    if (questionFamilyRefById.has(family.id)) throw new Error(`coverage_reconciliation_duplicate_question_family:${family.id}`)
    questionFamilyRefById.set(family.id, artifact.artifactRef)
    return family
  })

  const semanticItems = semanticItemsFromSeed()
  const semanticById = new Map(semanticItems.map((item) => [item.id, item] as const))
  const curriculumObligations = buildAqaAlevelBusiness7132CurriculumObligations(semanticItems)
  assertRequirementLedCoverage({ obligations: curriculumObligations, semanticItems })

  const coverageByRequirement = new Map(coverage.requirements.map((requirement) => [requirement.requirementId, requirement] as const))
  const courseTruthNodeIds = new Set(courseTruth.nodes.map((node) => node.id))
  const curriculum = curriculumObligations.map((obligation) => {
    const coverageRequirement = coverageByRequirement.get(obligation.obligationId)
    if (!coverageRequirement) throw new Error(`coverage_reconciliation_missing_curriculum_requirement:${obligation.obligationId}`)

    const expectedNodeIds = obligation.semanticItemIds.map((semanticItemId) => {
      const semanticItem = semanticById.get(semanticItemId)
      if (!semanticItem) throw new Error(`coverage_reconciliation_missing_semantic_item:${semanticItemId}`)
      return canonicalKnowledgeNodeId(semanticItem)
    })

    for (const nodeId of expectedNodeIds) {
      if (!coverageRequirement.knowledgeNodeIds.includes(nodeId)) {
        throw new Error(`coverage_reconciliation_missing_curriculum_node_mapping:${obligation.obligationId}:${nodeId}`)
      }
      if (!courseTruthNodeIds.has(nodeId)) {
        throw new Error(`coverage_reconciliation_missing_course_truth_node:${obligation.obligationId}:${nodeId}`)
      }
    }

    return {
      obligationId: obligation.obligationId,
      officialReference: obligation.officialReference,
      curriculumPath: obligation.curriculumPath,
      summary: obligation.summary,
      requiredTerms: obligation.requiredTerms,
      sourceRefs: obligation.sourceRefs,
      semanticItemIds: obligation.semanticItemIds,
      courseTruthNodeIds: expectedNodeIds,
      resolvedArtifactRefs: [coverageArtifact.artifactRef, courseTruthArtifact.artifactRef],
    }
  })

  const examEvidenceItems = buildAqaAlevelBusiness7132ExamEvidenceItems(assessmentBlueprint, questionFamilies)
  assertExamRequirementCoverage({
    obligations: AQA_A_LEVEL_BUSINESS_7132_2027_EXAM_OBLIGATIONS,
    evidenceItems: examEvidenceItems,
  })
  const exam = AQA_A_LEVEL_BUSINESS_7132_2027_EXAM_OBLIGATIONS.map((obligation) => ({
    obligationId: obligation.obligationId,
    officialReference: obligation.officialReference,
    examPath: obligation.examPath,
    summary: obligation.summary,
    requiredTerms: obligation.requiredTerms,
    sourceRefs: obligation.sourceRefs,
    evidenceItemIds: obligation.evidenceItemIds,
    resolvedArtifactRefs: examArtifactRefs(
      obligation.obligationId,
      boardAlignmentArtifact.artifactRef,
      assessmentBlueprintArtifact.artifactRef,
      questionFamilyRefById,
    ),
  }))

  assertSourceRefsResolve(
    sourceRegisterArtifact.value,
    [...new Set([
      ...curriculum.flatMap((item) => item.sourceRefs),
      ...exam.flatMap((item) => item.sourceRefs),
    ])],
  )

  return foundationExpertReviewCoverageReconciliationSchema.parse({
    schemaVersion: 1,
    artifactType: 'foundation_coverage_reconciliation',
    status: 'complete',
    curriculumProfileId: AQA_A_LEVEL_BUSINESS_7132_2027_COVERAGE_PROFILE_ID,
    examProfileId: AQA_A_LEVEL_BUSINESS_7132_2027_EXAM_COVERAGE_PROFILE_ID,
    sourceLicenceRegisterRef: sourceRegisterArtifact.artifactRef,
    curriculum,
    exam,
  })
}

export type FoundationExpertReviewCoverageReconciliation = z.infer<typeof foundationExpertReviewCoverageReconciliationSchema>
