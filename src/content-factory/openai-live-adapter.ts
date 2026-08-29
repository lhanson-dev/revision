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
export {
  OpenAIStructuredWorkerClient,
  type OpenAIContentFactoryAdapterConfig,
  type OpenAIModelAssistedWorkers,
  type OpenAIModelRoute,
} from './openai-provider-adapter'
export { createOpenAIModelAssistedWorkers } from './openai-assessment-item-v2-compiler'
