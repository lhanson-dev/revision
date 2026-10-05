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

const mockSemanticReviewWorkerPrefixes = [
  'content-factory.aqa-7132.mock-unit-review.',
  'content-factory.aqa-7132.mock-paper-review.',
] as const

function isAqa7132MockSemanticReviewWorker(workerId: string) {
  return workerId === 'content-factory.aqa-7132.mock-set-review'
    || mockSemanticReviewWorkerPrefixes.some((prefix) => workerId.startsWith(prefix))
}

function exactMockReviewUnitId(payload: unknown) {
  if (!payload || typeof payload !== 'object') throw new Error('mock_review_payload_missing_exact_unit_id')
  const unitId = (payload as { unit_id?: unknown }).unit_id
  if (typeof unitId !== 'string' || unitId.length === 0) throw new Error('mock_review_payload_missing_exact_unit_id')
  return unitId
}

function bindExactMockReviewUnitId(outputSchema: z.ZodType, unitId: string) {
  if (!(outputSchema instanceof z.ZodObject)) throw new Error('mock_review_schema_must_be_object')
  return outputSchema.safeExtend({ unit_id: z.literal(unitId) })
}

export class OpenAIStructuredWorkerClient extends ProviderOpenAIStructuredWorkerClient {
  override run(input: Parameters<ProviderOpenAIStructuredWorkerClient['run']>[0]) {
    if (isAqa7132MockSemanticReviewWorker(input.workerId)) {
      if (input.routeKind !== 'independent_review') throw new Error('mock_semantic_review_requires_independent_review_route')
      const unitId = exactMockReviewUnitId(input.payload)
      return super.run({
        ...input,
        outputSchema: bindExactMockReviewUnitId(input.outputSchema, unitId),
        instructions: [
          input.instructions,
          'Return unit_id exactly as supplied in the payload, including case, punctuation and separators. For this field only, this exact identifier requirement overrides any general lowercase-identifier instruction.',
        ].join('\n'),
      })
    }

    if (input.workerId !== 'content-factory.foundation.question-families') {
      return super.run(input)
    }

    // aggregateMarkTotal is compiler-owned Foundation truth. Keep it out of the
    // strict provider contract so the model neither invents nor echoes an exact
    // aggregate; the AQA pre-calibration compiler injects and validates it later.
    return super.run({
      ...input,
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
