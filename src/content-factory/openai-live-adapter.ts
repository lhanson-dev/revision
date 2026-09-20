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

export class OpenAIStructuredWorkerClient extends ProviderOpenAIStructuredWorkerClient {
  override run(input: Parameters<ProviderOpenAIStructuredWorkerClient['run']>[0]) {
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

export function createOpenAIModelAssistedWorkers(
  config: OpenAIContentFactoryAdapterConfig,
): OpenAIModelAssistedWorkers {
  const baseWorkers = createBaseOpenAIModelAssistedWorkers(config)
  const foundationLearningWorkers = createOpenAIFoundationCourseLearningWorkers(config)

  return {
    ...baseWorkers,
    async generateLearningCollateral(input) {
      if (hasFoundationCourseLearningDesign(input.workUnit)) {
        return foundationLearningWorkers.generateLearningCollateral(input)
      }
      return baseWorkers.generateLearningCollateral(input)
    },
    async generatePracticeCollateral(input) {
      if (hasFoundationCourseLearningDesign(input.workUnit)) {
        return foundationLearningWorkers.generatePracticeCollateral(input)
      }
      return baseWorkers.generatePracticeCollateral(input)
    },
  }
}

export type {
  OpenAIContentFactoryAdapterConfig,
  OpenAIModelAssistedWorkers,
  OpenAIModelRoute,
} from './openai-provider-adapter'
