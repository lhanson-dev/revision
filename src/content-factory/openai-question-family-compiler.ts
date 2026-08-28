import { z } from 'zod'
import {
  type AssessmentAndMarkingWorkers,
} from './assessment-and-marking'
import { questionFamilySchema, type QuestionFamily } from './schema'
import {
  createOpenAIModelAssistedWorkers as createAssessmentBlueprintHardenedWorkers,
} from './openai-assessment-blueprint-compiler'
import type {
  OpenAIContentFactoryAdapterConfig,
  OpenAIModelAssistedWorkers,
} from './openai-provider-adapter'

type QuestionFamilyInput = Parameters<AssessmentAndMarkingWorkers['generateQuestionFamilies']>[0]

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'unknown Question Family compilation error'
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

function expectedComponentScope(input: QuestionFamilyInput, familyId: string) {
  return input.assessmentBlueprint.components
    .filter((component) => component.questionFamilyIds.includes(familyId))
    .map((component) => component.componentId)
}

export function compileProviderQuestionFamilies(
  providerOutput: unknown,
  input: QuestionFamilyInput,
): QuestionFamily[] {
  const families = z.array(questionFamilySchema).min(1).parse(providerOutput)

  assertNoDuplicates(input.requestedFamilyIds, 'requested Question Family id')
  assertNoDuplicates(families.map((family) => family.id), 'provider Question Family id')
  if (!sameSet(families.map((family) => family.id), input.requestedFamilyIds)) {
    throw new Error('Question Family output must contain exactly the requested family IDs')
  }

  const knownComponentIds = new Set(input.assessmentBlueprint.components.map((component) => component.componentId))
  const knownObjectiveIds = new Set(input.assessmentBlueprint.assessmentObjectives.map((objective) => objective.id))

  for (const family of families) {
    const expectedComponents = expectedComponentScope(input, family.id)
    if (expectedComponents.length === 0) {
      throw new Error(`Requested Question Family ${family.id} is not present in the Assessment Blueprint`)
    }

    assertNoDuplicates(family.componentScope, `component reference on Question Family ${family.id}`)
    if (!sameSet(family.componentScope, expectedComponents)) {
      throw new Error(`Question Family ${family.id} component scope must match the Assessment Blueprint`)
    }
    for (const componentId of family.componentScope) {
      if (!knownComponentIds.has(componentId)) {
        throw new Error(`Question Family ${family.id} references unknown component ${componentId}`)
      }
    }

    assertNoDuplicates(family.assessmentObjectiveIds, `assessment objective reference on Question Family ${family.id}`)
    for (const objectiveId of family.assessmentObjectiveIds) {
      if (!knownObjectiveIds.has(objectiveId)) {
        throw new Error(`Question Family ${family.id} references unknown assessment objective ${objectiveId}`)
      }
    }

    for (const componentId of expectedComponents) {
      const component = input.assessmentBlueprint.components.find((candidate) => candidate.componentId === componentId)!
      if (component.markTotal !== undefined && family.markRange.max > component.markTotal) {
        throw new Error(`Question Family ${family.id} mark range exceeds governed component ${componentId} total`)
      }
    }
  }

  return families
}

export function createOpenAIModelAssistedWorkers(
  config: OpenAIContentFactoryAdapterConfig,
): OpenAIModelAssistedWorkers {
  const workers = createAssessmentBlueprintHardenedWorkers(config)

  return {
    ...workers,
    async generateQuestionFamilies(input) {
      const execution = await workers.generateQuestionFamilies(input)
      if (execution.status !== 'success') return execution
      try {
        return {
          ...execution,
          output: compileProviderQuestionFamilies(execution.output, input),
        }
      } catch (error) {
        return {
          status: 'failure',
          error: `provider_contract_failure: question_family_compilation: ${errorMessage(error)}`,
          provenance: execution.provenance,
        }
      }
    },
  }
}
