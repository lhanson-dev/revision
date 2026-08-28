import {
  executableAssessmentBlueprintSchema,
  type AssessmentAndMarkingWorkers,
  type ExecutableAssessmentBlueprint,
} from './assessment-and-marking'
import { fingerprintValue } from './intake-to-knowledge-model'
import {
  createOpenAIModelAssistedWorkers as createCourseKnowledgeHardenedWorkers,
} from './openai-course-knowledge-compiler'
import type {
  OpenAIContentFactoryAdapterConfig,
  OpenAIModelAssistedWorkers,
} from './openai-provider-adapter'

type AssessmentBlueprintInput = Parameters<AssessmentAndMarkingWorkers['compileAssessmentBlueprint']>[0]

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'unknown Assessment Blueprint compilation error'
}

function assertNoDuplicates(values: string[], label: string) {
  const seen = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) throw new Error(`Duplicate ${label}: ${value}`)
    seen.add(value)
  }
}

function sameSet(left: Iterable<string>, right: Iterable<string>) {
  const a = new Set(left)
  const b = new Set(right)
  return a.size === b.size && [...a].every((value) => b.has(value))
}

export async function compileProviderAssessmentBlueprint(
  providerOutput: unknown,
  input: AssessmentBlueprintInput,
): Promise<ExecutableAssessmentBlueprint> {
  const blueprint = executableAssessmentBlueprintSchema.parse(providerOutput)
  const expectedFingerprint = await fingerprintValue({
    jobId: input.jobId,
    components: input.components,
    assessmentObjectives: input.assessmentObjectives,
    assessmentRequirements: input.assessmentRequirements,
  })

  if (blueprint.jobId !== input.jobId) {
    throw new Error('Assessment Blueprint job ID does not match compiler input')
  }
  if (blueprint.fingerprint !== expectedFingerprint) {
    throw new Error('Assessment Blueprint fingerprint does not match governed compiler input')
  }

  assertNoDuplicates(blueprint.components.map((component) => component.componentId), 'Assessment Blueprint component id')
  if (!sameSet(input.components.map((component) => component.id), blueprint.components.map((component) => component.componentId))) {
    throw new Error('Assessment Blueprint must cover the exact governed component IDs')
  }

  const governedComponents = new Map(input.components.map((component) => [component.id, component]))
  for (const component of blueprint.components) {
    const governed = governedComponents.get(component.componentId)!
    if (component.questionFamilyIds.length === 0) {
      throw new Error(`Assessment Blueprint component ${component.componentId} requires at least one Question Family ID`)
    }
    assertNoDuplicates(component.questionFamilyIds, `Question Family ID on component ${component.componentId}`)
    if (governed.marks !== undefined && component.markTotal !== governed.marks) {
      throw new Error(`Assessment Blueprint mark total for ${component.componentId} must match governed component marks`)
    }
    if (governed.durationMinutes !== undefined && component.timingMinutes !== governed.durationMinutes) {
      throw new Error(`Assessment Blueprint timing for ${component.componentId} must match governed component timing`)
    }
  }

  assertNoDuplicates(blueprint.assessmentObjectives.map((objective) => objective.id), 'Assessment Blueprint objective id')
  if (!sameSet(input.assessmentObjectives.map((objective) => objective.id), blueprint.assessmentObjectives.map((objective) => objective.id))) {
    throw new Error('Assessment Blueprint assessment objectives must match the exact governed objective IDs')
  }
  const governedObjectives = new Map(input.assessmentObjectives.map((objective) => [objective.id, objective]))
  for (const objective of blueprint.assessmentObjectives) {
    const governed = governedObjectives.get(objective.id)!
    if (governed.weightingPercent !== undefined && objective.weightingPercent !== governed.weightingPercent) {
      throw new Error(`Assessment Blueprint weighting for ${objective.id} must match governed objective weighting`)
    }
  }

  const componentIds = new Set(input.components.map((component) => component.id))
  for (const demand of blueprint.commandDemands) {
    assertNoDuplicates(demand.componentScope, `command-demand component reference for ${demand.command}`)
    for (const componentId of demand.componentScope) {
      if (!componentIds.has(componentId)) {
        throw new Error(`Assessment Blueprint command demand references unknown component ${componentId}`)
      }
    }
  }

  return blueprint
}

export function createOpenAIModelAssistedWorkers(
  config: OpenAIContentFactoryAdapterConfig,
): OpenAIModelAssistedWorkers {
  const workers = createCourseKnowledgeHardenedWorkers(config)

  return {
    ...workers,
    async compileAssessmentBlueprint(input) {
      const execution = await workers.compileAssessmentBlueprint(input)
      if (execution.status !== 'success') return execution
      try {
        return {
          ...execution,
          output: await compileProviderAssessmentBlueprint(execution.output, input),
        }
      } catch (error) {
        return {
          status: 'failure',
          error: `provider_contract_failure: assessment_blueprint_compilation: ${errorMessage(error)}`,
          provenance: execution.provenance,
        }
      }
    },
  }
}
