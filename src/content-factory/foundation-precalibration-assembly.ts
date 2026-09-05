import {
  questionFamilySchema,
  type QuestionFamily,
} from './schema'
import {
  foundationAssessmentBlueprintSchema,
  type FoundationAssessmentBlueprint,
  type FoundationCompilationWorkers,
  type FoundationCurriculumRequirementInput,
  type FoundationWorkerExecution,
} from './foundation-compilation'
import {
  assertExamRequirementCoverage,
  assertRequirementLedCoverage,
  type FoundationSemanticCoverageItem,
} from './requirement-led-coverage'
import {
  buildAqaAlevelBusiness7132CurriculumObligations,
} from './source-seeds/aqa-a-level-business-7132-2027-coverage'
import {
  AQA_A_LEVEL_BUSINESS_7132_2027_EXAM_OBLIGATIONS,
  buildAqaAlevelBusiness7132ExamEvidenceItems,
} from './source-seeds/aqa-a-level-business-7132-2027-exam-coverage'

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
    responseShape: 'Three compulsory data-response questions, each made up of three or four parts; constituent mark and timing allocations remain unfixed until qualified calibration.',
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
const aggregateFactContext = /\b(?:component(?:-level|\s+level|\s+total)?|paper(?:-level|\s+level|\s+total)?|whole[-\s]+paper|overall|assembled[-\s]+set)\b/i
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

function assertAqa7132CurriculumCoverage(requirements: FoundationCurriculumRequirementInput[]) {
  const semanticItems = semanticItemsFromRequirements(requirements)
  const obligations = buildAqaAlevelBusiness7132CurriculumObligations(semanticItems)
  assertRequirementLedCoverage({ obligations, semanticItems })
}

function appendUnique(values: string[], additions: string[]) {
  return [...new Set([...values, ...additions])]
}

function normaliseAqa7132ExamTruth(value: unknown): FoundationAssessmentBlueprint {
  const blueprint = foundationAssessmentBlueprintSchema.parse(value)
  const components = blueprint.components.map((component) => {
    if (component.componentId === 'paper-1') {
      return {
        ...component,
        questionFamilyIds: appendUnique(component.questionFamilyIds, ['paper1-nine-mark-analysis']),
        constraints: appendUnique(component.constraints, [
          'Paper 1 is a 2 hours, 100 marks component.',
          'Section A has 15 one-mark MCQs; Section B has 35 marks of short-answer questions; Sections C and D each require a choice of one 25-mark essay from two.',
          'Current Paper 1 assessment evidence includes a 9-mark analyse response family.',
        ]),
      }
    }
    if (component.componentId === 'paper-2') {
      return {
        ...component,
        constraints: appendUnique(component.constraints, [
          'Paper 2 is a 2 hours, 100 marks component.',
          'Three compulsory data-response questions are worth approximately 33 marks each and each is made up of three or four parts.',
        ]),
      }
    }
    if (component.componentId === 'paper-3') {
      return {
        ...component,
        constraints: appendUnique(component.constraints, [
          'Paper 3 is a 2 hours, 100 marks component.',
          'One compulsory case study is followed by approximately six questions.',
        ]),
      }
    }
    return component
  })

  return foundationAssessmentBlueprintSchema.parse({
    ...blueprint,
    components,
    evidenceExpectations: appendUnique(blueprint.evidenceExpectations, [
      'All content may be assessed across Paper 1, Paper 2 and Paper 3.',
      'Current overall assessment-objective ranges are AO1 22-25%, AO2 24-27%, AO3 25-28% and AO4 23-26%.',
      'At least 10% of the overall A-level marks assess quantitative skills.',
    ]),
  })
}

function normalisePaper1NineMarkFamily(value: QuestionFamily) {
  if (value.id !== 'paper1-nine-mark-analysis') return value
  return questionFamilySchema.parse({
    ...value,
    title: 'Paper 1 9-mark analyse response',
    assessmentObjectiveIds: value.assessmentObjectiveIds.filter((id) => id !== 'ao4'),
    markRange: { min: 9, max: 9 },
    responseShape: 'One 9-mark analyse response requiring developed contextual analysis.',
    skillProfile: appendUnique(value.skillProfile, ['9-mark analyse response']),
    analysisRequirements: appendUnique(value.analysisRequirements, ['Analyse the stated business issue through developed contextual chains of reasoning.']),
    calibrationStatus: 'not_calibrated',
  })
}

function assertAqa7132ExamCoverage(
  assessmentBlueprint: FoundationAssessmentBlueprint,
  questionFamilies: QuestionFamily[],
) {
  assertExamRequirementCoverage({
    obligations: AQA_A_LEVEL_BUSINESS_7132_2027_EXAM_OBLIGATIONS,
    evidenceItems: buildAqaAlevelBusiness7132ExamEvidenceItems(assessmentBlueprint, questionFamilies),
  })
}

function contractFailure(
  execution: Extract<FoundationWorkerExecution<unknown>, { status: 'success' }>,
  error: unknown,
): FoundationWorkerExecution<unknown> {
  return {
    status: 'failure',
    error: `provider_contract_failure: aqa_7132_foundation_guard: ${errorMessage(error)}`,
    provenance: execution.provenance,
  }
}

export function withAqa7132PreCalibrationAssemblyGuard(
  workers: FoundationCompilationWorkers,
): FoundationCompilationWorkers {
  return {
    ...workers,
    async compileCoverage(input) {
      const execution = await workers.compileCoverage(input)
      if (execution.status !== 'success') return execution
      try {
        assertAqa7132CurriculumCoverage(input.requirements)
        return execution
      } catch (error) {
        return contractFailure(execution, error)
      }
    },
    async compileExamTruth(input) {
      const execution = await workers.compileExamTruth(input)
      if (execution.status !== 'success') return execution
      try {
        return {
          ...execution,
          output: normaliseAqa7132ExamTruth(execution.output),
        }
      } catch (error) {
        return contractFailure(execution, error)
      }
    },
    async compileQuestionFamilies(input) {
      const execution = await workers.compileQuestionFamilies(input)
      if (execution.status !== 'success') return execution

      try {
        const families = questionFamilySchema.array().parse(execution.output)
          .map(normalisePaper1NineMarkFamily)
          .map((family) => normaliseAqa7132PreCalibrationQuestionFamily(
            family,
            input.assessmentBlueprint,
          ))
        assertAqa7132ExamCoverage(input.assessmentBlueprint, families)
        return {
          ...execution,
          output: families,
        }
      } catch (error) {
        return contractFailure(execution, error)
      }
    },
  }
}