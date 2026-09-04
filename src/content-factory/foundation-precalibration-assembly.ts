import {
  questionFamilySchema,
  type QuestionFamily,
} from './schema'
import type {
  FoundationAssessmentBlueprint,
  FoundationCompilationWorkers,
  FoundationWorkerExecution,
} from './foundation-compilation'
import {
  foundationRemediationWorkerOutputSchema,
  type FoundationIndependentReviewWorkers,
} from './foundation-independent-review'

type PreCalibrationAssemblyPolicy = {
  questionFamilyId: string
  componentId: string
  sourceAssessmentRequirementId: string
  responseShape: string
}

export const AQA_A_LEVEL_BUSINESS_7132_PRECALIBRATION_ASSEMBLY_POLICIES: readonly PreCalibrationAssemblyPolicy[] = [
  {
    questionFamilyId: 'paper2-data-response',
    componentId: 'paper-2',
    sourceAssessmentRequirementId: 'paper2-structure',
    responseShape: 'Three compulsory data-response questions; constituent mark and timing allocations remain unfixed until qualified calibration.',
  },
  {
    questionFamilyId: 'paper3-case-study',
    componentId: 'paper-3',
    sourceAssessmentRequirementId: 'paper3-structure',
    responseShape: 'One compulsory case study followed by approximately six questions; constituent mark and timing allocations remain unfixed until qualified calibration.',
  },
] as const

const policyByFamilyId = new Map(
  AQA_A_LEVEL_BUSINESS_7132_PRECALIBRATION_ASSEMBLY_POLICIES
    .map((policy) => [policy.questionFamilyId, policy] as const),
)

const exactMarkOrMinuteAllocation = /\b\d+\s*(?:-|–|—|\s)*(?:mark|marks|minute|minutes)\b/i
const allocationSequence = /\b\d+(?:\s*(?:\/|,|and)\s*\d+){2,}\b/i

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

function providerAuthoredText(family: QuestionFamily) {
  return [
    family.title,
    ...family.skillProfile,
    ...family.contextRequirements,
    ...family.applicationRequirements,
    ...family.analysisRequirements,
    ...family.evaluationRequirements,
    ...family.commonFailureModes,
  ]
}

function unsupportedAllocationText(family: QuestionFamily) {
  return providerAuthoredText(family).find((value) => (
    exactMarkOrMinuteAllocation.test(value)
    || allocationSequence.test(value)
  ))
}

export function normaliseAqa7132PreCalibrationQuestionFamily(
  value: unknown,
  assessmentBlueprint: FoundationAssessmentBlueprint,
): QuestionFamily {
  const family = questionFamilySchema.parse(value)
  const policy = policyByFamilyId.get(family.id)
  if (!policy) return family

  const component = assessmentBlueprint.components.find((entry) => entry.componentId === policy.componentId)
  if (!component || !component.questionFamilyIds.includes(policy.questionFamilyId)) {
    throw new Error(`Pre-calibration policy ${policy.questionFamilyId} is not bound to Exam Truth component ${policy.componentId}`)
  }
  if (component.markTotal === undefined) {
    throw new Error(`Pre-calibration policy ${policy.questionFamilyId} requires a verified component mark total`)
  }

  const sourceRequirement = assessmentBlueprint.assessmentRequirements.find(
    (requirement) => requirement.id === policy.sourceAssessmentRequirementId,
  )
  if (!sourceRequirement || !sourceRequirement.componentScope.includes(policy.componentId)) {
    throw new Error(`Pre-calibration policy ${policy.questionFamilyId} is missing source assessment requirement ${policy.sourceAssessmentRequirementId}`)
  }

  if (family.calibrationStatus !== 'not_calibrated') {
    throw new Error(`Question Family ${family.id} may not claim calibration during Foundation compilation/remediation`)
  }

  const unsupported = unsupportedAllocationText(family)
  if (unsupported) {
    throw new Error(`Question Family ${family.id} contains unsupported exact constituent mark/timing allocation outside compiler-owned response shape: ${unsupported}`)
  }

  return questionFamilySchema.parse({
    ...family,
    markRange: {
      min: 1,
      max: component.markTotal,
    },
    responseShape: policy.responseShape,
    calibrationStatus: 'not_calibrated',
  })
}

function contractFailure(
  execution: Extract<FoundationWorkerExecution<unknown>, { status: 'success' }>,
  error: unknown,
): FoundationWorkerExecution<unknown> {
  return {
    status: 'failure',
    error: `provider_contract_failure: pre_calibration_assembly: ${errorMessage(error)}`,
    provenance: execution.provenance,
  }
}

export function withAqa7132PreCalibrationAssemblyGuard(
  workers: FoundationCompilationWorkers,
): FoundationCompilationWorkers {
  return {
    ...workers,
    async compileQuestionFamilies(input) {
      const execution = await workers.compileQuestionFamilies(input)
      if (execution.status !== 'success') return execution

      try {
        const families = questionFamilySchema.array().parse(execution.output)
        return {
          ...execution,
          output: families.map((family) => normaliseAqa7132PreCalibrationQuestionFamily(
            family,
            input.assessmentBlueprint,
          )),
        }
      } catch (error) {
        return contractFailure(execution, error)
      }
    },
  }
}

export function withAqa7132PreCalibrationRemediationGuard(
  workers: FoundationIndependentReviewWorkers,
): FoundationIndependentReviewWorkers {
  return {
    independentReview(input) {
      return workers.independentReview(input)
    },
    async remediate(input) {
      const execution = await workers.remediate(input)
      if (execution.status !== 'success') return execution

      try {
        const parsed = foundationRemediationWorkerOutputSchema.parse(execution.output)
        return {
          ...execution,
          output: {
            ...parsed,
            replacements: parsed.replacements.map((replacement) => (
              replacement.artifactKind === 'question_family'
                ? {
                    ...replacement,
                    correctedArtifact: normaliseAqa7132PreCalibrationQuestionFamily(
                      replacement.correctedArtifact,
                      input.assessmentBlueprint,
                    ),
                  }
                : replacement
            )),
          },
        }
      } catch (error) {
        return contractFailure(execution, error)
      }
    },
  }
}
