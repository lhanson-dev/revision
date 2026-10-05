// Compatibility entry point retained for existing Content Factory imports.
// Shared provider primitives remain in openai-provider-adapter.ts; the exported
// worker factory layers deterministic Course Knowledge Model, learning/practice,
// assessment, marking, independent-review and targeted-remediation integrity
// controls before the domain pipeline consumes provider output. Foundation-native
// Course Learning Blueprint v2 work units are routed through a dedicated contract
// that binds every deterministic Learn treatment and Practice capability into the
// provider response; legacy/generic work units retain the existing provider path.
import { z } from 'zod'
import { questionFamilySchema } from './schema'
import {
  OpenAIStructuredWorkerClient as ProviderOpenAIStructuredWorkerClient,
  type OpenAIContentFactoryAdapterConfig,
  type OpenAIModelAssistedWorkers,
} from './openai-provider-adapter'
import {
  createOpenAIModelAssistedWorkers as createBaseOpenAIModelAssistedWorkers,
} from './openai-assessment-item-v2-compiler'
import { createOpenAIFoundationCourseLearningWorkers } from './openai-foundation-course-learning-workers'

const foundationQuestionFamiliesProviderSchema = z.object({
  questionFamilies: z.array(questionFamilySchema.omit({ aggregateMarkTotal: true })).min(1),
})

type StructuredRunInput = Parameters<ProviderOpenAIStructuredWorkerClient['run']>[0]

function exactReviewAffectedIds(payload: unknown) {
  const ids = new Set<string>()
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(visit)
      return
    }
    if (!value || typeof value !== 'object') return
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if ((key === 'unit_id' || key === 'slot_id' || key === 'component_id') && typeof child === 'string' && child.trim()) ids.add(child)
      visit(child)
    }
  }
  visit(payload)
  return [...ids]
}

export function bindExactReviewUnitId(input: StructuredRunInput): StructuredRunInput {
  if (input.routeKind !== 'independent_review') return input
  if (!input.payload || typeof input.payload !== 'object' || !('unit_id' in input.payload)) return input
  const unitId = (input.payload as { unit_id?: unknown }).unit_id
  if (typeof unitId !== 'string' || !unitId.trim()) return input
  if (!(input.outputSchema instanceof z.ZodObject)) return input
  if (!Object.prototype.hasOwnProperty.call(input.outputSchema.shape, 'unit_id')) return input

  let outputSchema = input.outputSchema.safeExtend({ unit_id: z.literal(unitId) })
  const instructions = [
    `Preserve the supplied unit_id exactly as ${JSON.stringify(unitId)}. Do not change its spelling, punctuation or case.`,
  ]

  const affectedIds = exactReviewAffectedIds(input.payload)
  const findingsSchema = outputSchema.shape.findings
  if (affectedIds.length && findingsSchema instanceof z.ZodArray && findingsSchema.element instanceof z.ZodObject) {
    const findingSchema = findingsSchema.element
    if (Object.prototype.hasOwnProperty.call(findingSchema.shape, 'affected_ids')) {
      const exactAffectedId = z.enum(affectedIds as [string, ...string[]])
      const exactFindingSchema = findingSchema.safeExtend({
        affected_ids: z.array(exactAffectedId).min(1),
      })
      outputSchema = outputSchema.safeExtend({ findings: z.array(exactFindingSchema) })
      instructions.push('Preserve every affected_ids value exactly as it appears in the supplied content. Do not change spelling, punctuation or case, and do not invent identifiers.')
    }
  }

  return {
    ...input,
    outputSchema,
    instructions: [...instructions, input.instructions].join('\n'),
  }
}

export class OpenAIStructuredWorkerClient extends ProviderOpenAIStructuredWorkerClient {
  override run(input: StructuredRunInput) {
    const reviewBoundInput = bindExactReviewUnitId(input)
    if (reviewBoundInput.workerId !== 'content-factory.foundation.question-families') {
      return super.run(reviewBoundInput)
    }

    // aggregateMarkTotal is compiler-owned Foundation truth. Keep it out of the
    // strict provider contract so the model neither invents nor echoes an exact
    // aggregate; the AQA pre-calibration compiler injects and validates it later.
    return super.run({
      ...reviewBoundInput,
      outputSchema: foundationQuestionFamiliesProviderSchema,
    })
  }
}

function hasFoundationCourseLearningDesign(workUnit: unknown) {
  return Boolean(
    workUnit
    && typeof workUnit === 'object'
    && 'learningDesign' in workUnit
    && (workUnit as { learningDesign?: unknown }).learningDesign !== undefined,
  )
}

type ProviderBudgetFamily = 'base-v4' | 'foundation-learning-v5'

export function createOpenAIModelAssistedWorkers(
  config: OpenAIContentFactoryAdapterConfig,
): OpenAIModelAssistedWorkers {
  const baseWorkers = createBaseOpenAIModelAssistedWorkers(config)
  const foundationLearningWorkers = createOpenAIFoundationCourseLearningWorkers(config)
  let providerBudgetFamily: ProviderBudgetFamily | undefined

  const claimBudgetFamily = (next: ProviderBudgetFamily) => {
    if (providerBudgetFamily && providerBudgetFamily !== next) {
      throw new Error(
        `content_factory_provider_budget_boundary: cannot mix ${providerBudgetFamily} and ${next} workers in one provider factory instance`,
      )
    }
    providerBudgetFamily = next
  }

  return {
    async compileKnowledgeModel(input) {
      claimBudgetFamily('base-v4')
      return baseWorkers.compileKnowledgeModel(input)
    },
    async planLearningBlueprint(input) {
      claimBudgetFamily('base-v4')
      return baseWorkers.planLearningBlueprint(input)
    },
    async generateLearningCollateral(input) {
      if (hasFoundationCourseLearningDesign(input.workUnit)) {
        claimBudgetFamily('foundation-learning-v5')
        return foundationLearningWorkers.generateLearningCollateral(input)
      }
      claimBudgetFamily('base-v4')
      return baseWorkers.generateLearningCollateral(input)
    },
    async generatePracticeCollateral(input) {
      if (hasFoundationCourseLearningDesign(input.workUnit)) {
        claimBudgetFamily('foundation-learning-v5')
        return foundationLearningWorkers.generatePracticeCollateral(input)
      }
      claimBudgetFamily('base-v4')
      return baseWorkers.generatePracticeCollateral(input)
    },
    async compileAssessmentBlueprint(input) {
      claimBudgetFamily('base-v4')
      return baseWorkers.compileAssessmentBlueprint(input)
    },
    async generateQuestionFamilies(input) {
      claimBudgetFamily('base-v4')
      return baseWorkers.generateQuestionFamilies(input)
    },
    async generateAssessmentItem(input) {
      claimBudgetFamily('base-v4')
      return baseWorkers.generateAssessmentItem(input)
    },
    async generateMarkingPack(input) {
      claimBudgetFamily('base-v4')
      return baseWorkers.generateMarkingPack(input)
    },
    async independentReview(input) {
      claimBudgetFamily('base-v4')
      return baseWorkers.independentReview(input)
    },
    async remediate(input) {
      claimBudgetFamily('base-v4')
      return baseWorkers.remediate(input)
    },
  }
}

export type {
  OpenAIContentFactoryAdapterConfig,
  OpenAIModelAssistedWorkers,
  OpenAIModelRoute,
} from './openai-provider-adapter'
