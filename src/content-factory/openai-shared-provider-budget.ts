import type {
  OpenAIContentFactoryAdapterConfig,
  OpenAIModelRoute,
} from './openai-provider-adapter'

function conservativeRoute(left: OpenAIModelRoute, right: OpenAIModelRoute): OpenAIModelRoute {
  return {
    model: left.model,
    inputUsdPerMillion: Math.max(left.inputUsdPerMillion, right.inputUsdPerMillion),
    cachedInputUsdPerMillion: Math.max(left.cachedInputUsdPerMillion, right.cachedInputUsdPerMillion),
    outputUsdPerMillion: Math.max(left.outputUsdPerMillion, right.outputUsdPerMillion),
    cacheWriteMultiplier: Math.max(left.cacheWriteMultiplier ?? 1.25, right.cacheWriteMultiplier ?? 1.25),
    longContextThresholdTokens: Math.min(left.longContextThresholdTokens ?? 272_000, right.longContextThresholdTokens ?? 272_000),
    longContextInputMultiplier: Math.max(left.longContextInputMultiplier ?? 2, right.longContextInputMultiplier ?? 2),
    longContextOutputMultiplier: Math.max(left.longContextOutputMultiplier ?? 1.5, right.longContextOutputMultiplier ?? 1.5),
    maxOutputTokens: Math.max(left.maxOutputTokens ?? 8_000, right.maxOutputTokens ?? 8_000),
  }
}

function estimateConservativeCallCost(requestBody: unknown, route: OpenAIModelRoute) {
  const estimatedInputTokens = Math.ceil(JSON.stringify(requestBody).length / 3)
  const maxOutputTokens = route.maxOutputTokens ?? 8_000
  const isLongContext = estimatedInputTokens > (route.longContextThresholdTokens ?? 272_000)
  const inputMultiplier = isLongContext ? (route.longContextInputMultiplier ?? 2) : 1
  const outputMultiplier = isLongContext ? (route.longContextOutputMultiplier ?? 1.5) : 1
  const conservativeInputRate = route.inputUsdPerMillion * Math.max(1, route.cacheWriteMultiplier ?? 1.25)
  return (
    estimatedInputTokens * conservativeInputRate * inputMultiplier
    + maxOutputTokens * route.outputUsdPerMillion * outputMultiplier
  ) / 1_000_000
}

function observedCallCost(body: unknown, route: OpenAIModelRoute) {
  if (typeof body !== 'object' || body === null) return undefined
  const usage = (body as { usage?: {
    input_tokens?: number
    output_tokens?: number
    input_tokens_details?: { cached_tokens?: number; cache_write_tokens?: number }
  } }).usage
  if (!usage) return undefined

  const inputTokens = Math.max(0, usage.input_tokens ?? 0)
  const outputTokens = Math.max(0, usage.output_tokens ?? 0)
  const cachedTokens = Math.min(inputTokens, Math.max(0, usage.input_tokens_details?.cached_tokens ?? 0))
  const cacheWriteTokens = Math.min(inputTokens - cachedTokens, Math.max(0, usage.input_tokens_details?.cache_write_tokens ?? 0))
  const uncachedTokens = inputTokens - cachedTokens - cacheWriteTokens
  const isLongContext = inputTokens > (route.longContextThresholdTokens ?? 272_000)
  const inputMultiplier = isLongContext ? (route.longContextInputMultiplier ?? 2) : 1
  const outputMultiplier = isLongContext ? (route.longContextOutputMultiplier ?? 1.5) : 1
  const cacheWriteMultiplier = route.cacheWriteMultiplier ?? 1.25
  return (
    uncachedTokens * route.inputUsdPerMillion * inputMultiplier
    + cachedTokens * route.cachedInputUsdPerMillion * inputMultiplier
    + cacheWriteTokens * route.inputUsdPerMillion * inputMultiplier * cacheWriteMultiplier
    + outputTokens * route.outputUsdPerMillion * outputMultiplier
  ) / 1_000_000
}

/**
 * Share one hard provider-spend budget across independently constructed compiler
 * clients. The returned fetch closure reserves conservative spend before every
 * request, so concurrent calls cannot each spend the same remaining allowance.
 * Internal client ceilings are disabled because this wrapper is the single owner.
 */
export function withSharedProviderBudget(
  config: OpenAIContentFactoryAdapterConfig,
): OpenAIContentFactoryAdapterConfig {
  if (config.maxSpendUsd === undefined) return config

  const delegate = config.fetchImpl ?? fetch
  const ceiling = config.maxSpendUsd
  const route = conservativeRoute(config.generation, config.independentReview)
  let consumed = 0
  let reserved = 0

  const fetchImpl: typeof fetch = async (input, init) => {
    const requestBody = typeof init?.body === 'string' ? JSON.parse(init.body) as unknown : init?.body
    const reserve = estimateConservativeCallCost(requestBody, route)
    if (consumed + reserved + reserve > ceiling) {
      throw new Error(
        `content_factory_spend_ceiling_reached: conservative consumed $${consumed.toFixed(4)} + reserved $${reserved.toFixed(4)} + next-call reserve $${reserve.toFixed(4)} exceeds $${ceiling.toFixed(2)} ceiling`,
      )
    }

    reserved += reserve
    let response: Response
    try {
      response = await delegate(input, init)
    } catch (error) {
      reserved -= reserve
      throw error
    }

    let actual = reserve
    try {
      const body = await response.clone().json() as unknown
      actual = observedCallCost(body, route) ?? reserve
    } catch {
      // Keep the conservative reserve when provider usage cannot be observed.
    }
    reserved -= reserve
    consumed += actual
    return response
  }

  return { ...config, maxSpendUsd: undefined, fetchImpl }
}
