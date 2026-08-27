// Compatibility entry point retained for existing Content Factory imports.
// Shared provider primitives remain in openai-provider-adapter.ts; the exported
// worker factory adds deterministic Learning Blueprint compilation before the
// domain pipeline consumes provider planning output.
export {
  OpenAIStructuredWorkerClient,
  type OpenAIContentFactoryAdapterConfig,
  type OpenAIModelAssistedWorkers,
  type OpenAIModelRoute,
} from './openai-provider-adapter'
export { createOpenAIModelAssistedWorkers } from './openai-learning-blueprint-compiler'
