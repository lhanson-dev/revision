import {
  createOpenAIModelAssistedWorkers as createBaseOpenAIModelAssistedWorkers,
  type OpenAIContentFactoryAdapterConfig,
  type OpenAIModelAssistedWorkers,
} from './openai-assessment-item-contract-boundary'
import {
  executableLearningBlueprintSchema,
  type ExecutableLearningBlueprint,
  type LearningPracticeWorkers,
} from './learning-and-practice'

const practiceModeValues = ['retrieval', 'flashcard', 'short_answer', 'application', 'quantitative'] as const

type LearningBlueprintPlannerInput = Parameters<LearningPracticeWorkers['planLearningBlueprint']>[0]
type RequiredOutput = 'learning' | 'practice'
type LearningMode = 'explanation' | 'worked_example' | typeof practiceModeValues[number]

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'unknown Learning Blueprint compilation error'
}

function defaultPracticeMode(
  knowledgeNodeIds: string[],
  input: LearningBlueprintPlannerInput,
): typeof practiceModeValues[number] {
  const selectedIds = new Set(knowledgeNodeIds)
  const nodes = input.knowledgeNodes.filter((node) => selectedIds.has(node.id))
  if (nodes.some((node) => node.formulas.length > 0)) return 'quantitative'
  if (nodes.some((node) => node.applicationContexts.length > 0)) return 'application'
  return 'retrieval'
}

function governedRequirementsForUnit(
  requirementIds: string[],
  input: LearningBlueprintPlannerInput,
) {
  const requirementMap = new Map(input.coverageRequirements.map((requirement) => [requirement.requirementId, requirement]))
  return requirementIds.map((requirementId) => {
    const requirement = requirementMap.get(requirementId)
    if (!requirement) throw new Error(`Learning Blueprint references unknown coverage requirement ${requirementId}`)
    if (['deferred', 'not_applicable'].includes(requirement.coverageStatus)) {
      throw new Error(`Learning Blueprint must not plan deferred or not-applicable requirement ${requirementId}`)
    }
    return requirement
  })
}

export function compileProviderLearningBlueprint(
  providerOutput: unknown,
  input: LearningBlueprintPlannerInput,
): ExecutableLearningBlueprint {
  const proposed = executableLearningBlueprintSchema.parse(providerOutput)

  if (proposed.jobId !== input.jobId) throw new Error('Learning Blueprint job ID does not match planner input')
  if (proposed.knowledgeModelFingerprint !== input.knowledgeModelFingerprint) {
    throw new Error('Learning Blueprint knowledge-model fingerprint does not match planner input')
  }

  const workUnits = proposed.workUnits.map((unit) => {
    const requirements = governedRequirementsForUnit(unit.requirementIds, input)
    const learningRequired = requirements.some((requirement) => requirement.learnRequired)
    const practiceRequired = requirements.some((requirement) => requirement.practiceRequired)

    if (!learningRequired && !practiceRequired) {
      throw new Error(`Learning Blueprint work unit ${unit.id} has no governed Learn or Practice output requirement`)
    }

    const requiredOutputs: RequiredOutput[] = []
    const learningModes: LearningMode[] = []

    if (learningRequired) {
      requiredOutputs.push('learning')
      learningModes.push('explanation')
      if (unit.learningModes.includes('worked_example')) learningModes.push('worked_example')
    }

    if (practiceRequired) {
      requiredOutputs.push('practice')
      const selectedPracticeModes = practiceModeValues.filter((mode) => unit.learningModes.includes(mode))
      learningModes.push(...(selectedPracticeModes.length > 0
        ? selectedPracticeModes
        : [defaultPracticeMode(unit.knowledgeNodeIds, input)]))
    }

    return {
      ...unit,
      learningModes,
      requiredOutputs,
    }
  })

  return executableLearningBlueprintSchema.parse({
    ...proposed,
    workUnits,
  })
}

export function createOpenAIModelAssistedWorkers(
  config: OpenAIContentFactoryAdapterConfig,
): OpenAIModelAssistedWorkers {
  const workers = createBaseOpenAIModelAssistedWorkers(config)

  return {
    ...workers,
    async planLearningBlueprint(input) {
      const execution = await workers.planLearningBlueprint(input)
      if (execution.status !== 'success') return execution
      try {
        return {
          ...execution,
          output: compileProviderLearningBlueprint(execution.output, input),
        }
      } catch (error) {
        return {
          status: 'failure',
          error: `provider_contract_failure: learning_blueprint_compilation: ${errorMessage(error)}`,
          provenance: execution.provenance,
        }
      }
    },
  }
}
