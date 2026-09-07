// Compatibility entry point retained for existing Content Factory imports.
// Shared provider primitives remain in openai-provider-adapter.ts; the exported
// worker factory layers deterministic Course Knowledge Model, learning/practice,
// assessment, marking, independent-review and targeted-remediation integrity
// controls before the domain pipeline consumes provider output. The final live
// provider boundary applies the Reliability v2 Assessment Item compiler so a
// parseable candidate with incomplete subquestion structure can receive one
// complete-diagnostic bounded repair before strict fail-closed compilation. It
// also preserves semantically empty optional-unit normalization and the Marking
// Pack compiler boundary: complete diagnostics, one bounded repair, and Revision-
// owned mechanical rubric structure.
import { z } from 'zod'
import { questionFamilySchema } from './schema'
import {
  OpenAIStructuredWorkerClient as ProviderOpenAIStructuredWorkerClient,
} from './openai-provider-adapter'

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

export type {
  OpenAIContentFactoryAdapterConfig,
  OpenAIModelAssistedWorkers,
  OpenAIModelRoute,
} from './openai-provider-adapter'
export { createOpenAIModelAssistedWorkers } from './openai-assessment-item-v2-compiler'
