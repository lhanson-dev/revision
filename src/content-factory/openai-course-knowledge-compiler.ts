import { courseKnowledgeModelSchema } from './schema'
import {
  createOpenAIModelAssistedWorkers as createAssessmentHardenedWorkers,
} from './openai-assessment-integrity-compiler'
import type {
  OpenAIContentFactoryAdapterConfig,
  OpenAIModelAssistedWorkers,
} from './openai-provider-adapter'

type CourseKnowledgeModelInput = Parameters<OpenAIModelAssistedWorkers['compileKnowledgeModel']>[0]

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'unknown Course Knowledge Model compilation error'
}

function assertNoDuplicates(values: string[], label: string) {
  const seen = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) throw new Error(`Duplicate ${label}: ${value}`)
    seen.add(value)
  }
}

export function compileProviderCourseKnowledgeModel(
  providerOutput: unknown,
  input: CourseKnowledgeModelInput,
) {
  const model = courseKnowledgeModelSchema.parse(providerOutput)

  if (model.jobId !== input.jobId) {
    throw new Error('Course Knowledge Model job ID does not match compiler input')
  }

  assertNoDuplicates(model.nodes.map((node) => node.id), 'knowledge node id')

  const requirementById = new Map(input.requirements.map((requirement) => [requirement.requirementId, requirement]))
  const permittedRequirementSources = new Set(input.requirements.flatMap((requirement) => requirement.sourceRefs))
  const permittedAlignmentRefs = new Set([
    ...input.boardAlignment.components.map((component) => component.id),
    ...input.boardAlignment.assessmentObjectives.map((objective) => objective.id),
    ...input.boardAlignment.assessmentRequirements.map((requirement) => requirement.id),
  ])

  for (const node of model.nodes) {
    assertNoDuplicates(node.sourceRefs, `source reference on knowledge node ${node.id}`)
    assertNoDuplicates(node.boardAlignmentRefs, `Board Alignment reference on knowledge node ${node.id}`)

    const governedRequirement = requirementById.get(node.id)
    const nodePermittedSources = governedRequirement
      ? new Set(governedRequirement.sourceRefs)
      : permittedRequirementSources

    for (const sourceRef of node.sourceRefs) {
      if (!nodePermittedSources.has(sourceRef)) {
        throw new Error(`Knowledge node ${node.id} references source ${sourceRef} outside its governed curriculum sources`)
      }
    }

    for (const alignmentRef of node.boardAlignmentRefs) {
      if (!permittedAlignmentRefs.has(alignmentRef)) {
        throw new Error(`Knowledge node ${node.id} references unknown Board Alignment item ${alignmentRef}`)
      }
    }
  }

  return model
}

export function createOpenAIModelAssistedWorkers(
  config: OpenAIContentFactoryAdapterConfig,
): OpenAIModelAssistedWorkers {
  const workers = createAssessmentHardenedWorkers(config)

  return {
    ...workers,
    async compileKnowledgeModel(input) {
      const execution = await workers.compileKnowledgeModel(input)
      if (execution.status !== 'success') return execution
      try {
        return {
          ...execution,
          output: compileProviderCourseKnowledgeModel(execution.output, input),
        }
      } catch (error) {
        return {
          status: 'failure',
          error: `provider_contract_failure: course_knowledge_model_compilation: ${errorMessage(error)}`,
          provenance: execution.provenance,
        }
      }
    },
  }
}
