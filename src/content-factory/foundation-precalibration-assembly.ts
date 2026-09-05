import {
  questionFamilySchema,
  type QuestionFamily,
} from './schema'
import type {
  FoundationAssessmentBlueprint,
  FoundationCompilationWorkers,
  FoundationWorkerExecution,
} from './foundation-compilation'

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

const exactMarkOrMinuteAllocation = /\b(\d+)\s*(?:-|–|—|\s)*(mark|marks|minute|minutes)\b/gi
const allocationSequence = /\b\d+(?:\s*(?:\/|,|and)\s*\d+){2,}\b/i
const aggregateFactContext = /\b(?:component(?:-level|\s+level|\s+total)?|paper(?:-level|\s+level|\s+total)?|whole[-\s]+paper|overall)\b/i
const constituentAllocationContext = /\b(?:each|per|question|sub[-\s]?question|constituent|individual|data-response\s+set|case-study\s+question)\b/i

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

type AssessmentComponent = FoundationAssessmentBlueprint['components'][number]

function isAllowedAggregateComponentFact(
  text: string,
  match: RegExpMatchArray,
  component: AssessmentComponent | undefined,
) {
  if (!component || match.index === undefined) return false

  const amount = Number(match[1])
  const unit = match[2]?.toLowerCase()
  const expected = unit?.startsWith('mark') ? component.markTotal : component.timingMinutes
  if (expected === undefined || amount !== expected) return false

  const contextStart = Math.max(0, match.index - 56)
  const contextEnd = Math.min(text.length, match.index + match[0].length + 24)
  const localContext = text.slice(contextStart, contextEnd)

  return aggregateFactContext.test(localContext)
    && !constituentAllocationContext.test(localContext)
}

function unsupportedAllocationText(
  family: QuestionFamily,
  component: AssessmentComponent | undefined,
) {
  return providerAuthoredText(family).find((value) => {
    if (allocationSequence.test(value)) return true

    const exactAllocations = [...value.matchAll(exactMarkOrMinuteAllocation)]
    return exactAllocations.some((match) => !isAllowedAggregateComponentFact(value, match, component))
  })
}

function policyBindingProblems(
  family: QuestionFamily,
  assessmentBlueprint: FoundationAssessmentBlueprint,
) {
  const policy = policyByFamilyId.get(family.id)
  if (!policy) return { policy: undefined, component: undefined, problems: [] as string[] }

  const problems: string[] = []
  const component = assessmentBlueprint.components.find((entry) => entry.componentId === policy.componentId)
  if (!component || !component.questionFamilyIds.includes(policy.questionFamilyId)) {
    problems.push(`Pre-calibration policy ${policy.questionFamilyId} is not bound to Exam Truth component ${policy.componentId}`)
  } else if (component.markTotal === undefined) {
    problems.push(`Pre-calibration policy ${policy.questionFamilyId} requires a verified component mark total`)
  }

  const sourceRequirement = assessmentBlueprint.assessmentRequirements.find(
    (requirement) => requirement.id === policy.sourceAssessmentRequirementId,
  )
  if (!sourceRequirement || !sourceRequirement.componentScope.includes(policy.componentId)) {
    problems.push(`Pre-calibration policy ${policy.questionFamilyId} is missing source assessment requirement ${policy.sourceAssessmentRequirementId}`)
  }

  return { policy, component, problems }
}

export function aqa7132PreCalibrationAssemblyProblems(
  value: unknown,
  assessmentBlueprint: FoundationAssessmentBlueprint,
): string[] {
  const family = questionFamilySchema.parse(value)
  const { policy, component, problems } = policyBindingProblems(family, assessmentBlueprint)
  if (!policy) return []

  if (family.calibrationStatus !== 'not_calibrated') {
    problems.push(`Question Family ${family.id} may not claim calibration before qualified Foundation calibration`)
  }

  const unsupported = unsupportedAllocationText(family, component)
  if (unsupported) {
    problems.push(`Question Family ${family.id} contains unsupported exact constituent mark/timing allocation: ${unsupported}`)
  }

  if (component?.markTotal !== undefined) {
    if (family.markRange.min !== 1 || family.markRange.max !== component.markTotal) {
      problems.push(`Question Family ${family.id} must retain the compiler-owned component-wide pre-calibration mark envelope 1-${component.markTotal}`)
    }
  }

  if (family.responseShape !== policy.responseShape) {
    problems.push(`Question Family ${family.id} must retain the compiler-owned aggregate-only pre-calibration response shape`)
  }

  return problems
}

export function normaliseAqa7132PreCalibrationQuestionFamily(
  value: unknown,
  assessmentBlueprint: FoundationAssessmentBlueprint,
): QuestionFamily {
  const family = questionFamilySchema.parse(value)
  const { policy, component, problems } = policyBindingProblems(family, assessmentBlueprint)
  if (!policy) return family
  if (problems.length > 0) throw new Error(problems.join('; '))
  if (!component?.markTotal) throw new Error(`Pre-calibration policy ${policy.questionFamilyId} requires a verified component mark total`)

  if (family.calibrationStatus !== 'not_calibrated') {
    throw new Error(`Question Family ${family.id} may not claim calibration during Foundation compilation/remediation`)
  }

  const unsupported = unsupportedAllocationText(family, component)
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
