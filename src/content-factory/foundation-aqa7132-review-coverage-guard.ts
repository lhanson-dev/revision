import { questionFamilySchema, type QuestionFamily } from './schema'
import {
  foundationAssessmentBlueprintSchema,
  type FoundationCurriculumRequirementInput,
  type FoundationWorkerExecution,
} from './foundation-compilation'
import {
  foundationRemediationWorkerOutputSchema,
  type FoundationIndependentReviewWorkers,
} from './foundation-independent-review'
import {
  assertExamRequirementCoverage,
  assertRequirementLedCoverage,
  type FoundationSemanticCoverageItem,
} from './requirement-led-coverage'
import { buildAqaAlevelBusiness7132CurriculumObligations } from './source-seeds/aqa-a-level-business-7132-2027-coverage'
import {
  AQA_A_LEVEL_BUSINESS_7132_2027_EXAM_OBLIGATIONS,
  buildAqaAlevelBusiness7132ExamEvidenceItems,
} from './source-seeds/aqa-a-level-business-7132-2027-exam-coverage'

function semanticItemsFromRequirements(
  requirements: FoundationCurriculumRequirementInput[],
): FoundationSemanticCoverageItem[] {
  return requirements.flatMap((requirement) => requirement.skillsOrKnowledge.map((text, knowledgeItemIndex) => ({
    id: `${requirement.requirementId}.s${String(knowledgeItemIndex + 1).padStart(2, '0')}`,
    requirementId: requirement.requirementId,
    officialReference: requirement.officialReference,
    knowledgeItemIndex,
    text,
  })))
}

function assertCurriculumCoverage(requirements: FoundationCurriculumRequirementInput[]) {
  const semanticItems = semanticItemsFromRequirements(requirements)
  assertRequirementLedCoverage({
    obligations: buildAqaAlevelBusiness7132CurriculumObligations(semanticItems),
    semanticItems,
  })
}

function assertExamCoverage(
  assessmentBlueprint: Parameters<FoundationIndependentReviewWorkers['independentReview']>[0]['assessmentBlueprint'],
  questionFamilies: QuestionFamily[],
) {
  assertExamRequirementCoverage({
    obligations: AQA_A_LEVEL_BUSINESS_7132_2027_EXAM_OBLIGATIONS,
    evidenceItems: buildAqaAlevelBusiness7132ExamEvidenceItems(assessmentBlueprint, questionFamilies),
  })
}

function failure(
  execution: Extract<FoundationWorkerExecution<unknown>, { status: 'success' }>,
  error: unknown,
): FoundationWorkerExecution<unknown> {
  return {
    status: 'failure',
    error: `provider_contract_failure: aqa_7132_source_led_review_coverage: ${error instanceof Error ? error.message : String(error)}`,
    provenance: execution.provenance,
  }
}

function assertReviewInputCoverage(input: Parameters<FoundationIndependentReviewWorkers['independentReview']>[0]) {
  assertCurriculumCoverage(input.coverageModel.requirements)
  assertExamCoverage(input.assessmentBlueprint, input.questionFamilies)
}

function remediatedExamArtifacts(
  input: Parameters<FoundationIndependentReviewWorkers['remediate']>[0],
  output: unknown,
) {
  const parsed = foundationRemediationWorkerOutputSchema.parse(output)
  let assessmentBlueprint = input.assessmentBlueprint
  const familiesById = new Map(input.questionFamilies.map((family) => [family.id, family] as const))

  for (const replacement of parsed.replacements) {
    if (replacement.artifactKind === 'assessment_blueprint') {
      assessmentBlueprint = foundationAssessmentBlueprintSchema.parse(replacement.correctedArtifact)
      continue
    }
    if (replacement.artifactKind !== 'question_family') continue

    const oldEntry = input.artifactIndex.find((entry) => entry.artifactRef === replacement.oldRef && entry.artifactKind === 'question_family')
    if (!oldEntry) throw new Error(`Remediation replacement references unknown Question Family artifact ${replacement.oldRef}`)
    const oldFamily = questionFamilySchema.parse(oldEntry.value)
    const replacementFamily = questionFamilySchema.parse(replacement.correctedArtifact)
    if (replacementFamily.id !== oldFamily.id) throw new Error(`Remediation may not change Question Family identity ${oldFamily.id}`)
    familiesById.set(oldFamily.id, replacementFamily)
  }

  return { assessmentBlueprint, questionFamilies: [...familiesById.values()] }
}

export function withAqa7132SourceLedReviewCoverageGuard(
  workers: FoundationIndependentReviewWorkers,
): FoundationIndependentReviewWorkers {
  return {
    ...workers,
    async independentReview(input) {
      try {
        assertReviewInputCoverage(input)
      } catch (error) {
        return {
          status: 'failure',
          error: `aqa_7132_source_led_review_coverage: ${error instanceof Error ? error.message : String(error)}`,
          provenance: {
            id: 'aqa-7132-source-led-review-coverage-failed',
            contextId: 'deterministic-aqa-7132-source-led-review-coverage',
            contractVersion: '1',
            provider: 'revision-deterministic-coverage-guard',
          },
        }
      }
      return workers.independentReview(input)
    },
    async remediate(input) {
      try {
        assertCurriculumCoverage(input.coverageModel.requirements)
        assertExamCoverage(input.assessmentBlueprint, input.questionFamilies)
      } catch (error) {
        return {
          status: 'failure',
          error: `aqa_7132_source_led_review_coverage: ${error instanceof Error ? error.message : String(error)}`,
          provenance: {
            id: 'aqa-7132-source-led-remediation-input-coverage-failed',
            contextId: 'deterministic-aqa-7132-source-led-remediation-coverage',
            contractVersion: '1',
            provider: 'revision-deterministic-coverage-guard',
          },
        }
      }

      const execution = await workers.remediate(input)
      if (execution.status !== 'success') return execution
      try {
        const remediated = remediatedExamArtifacts(input, execution.output)
        assertExamCoverage(remediated.assessmentBlueprint, remediated.questionFamilies)
        return execution
      } catch (error) {
        return failure(execution, error)
      }
    },
  }
}
