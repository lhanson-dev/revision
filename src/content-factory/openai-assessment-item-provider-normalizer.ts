import { createOpenAIModelAssistedWorkers as createIntegrityWorkers } from './openai-output-integrity-compiler'
import type { OpenAIContentFactoryAdapterConfig } from './openai-provider-adapter'

const assessmentItemSchemaName = 'content-factory-assessment-item'

type JsonRecord = Record<string, unknown>

type ResponsesApiBody = {
  output_text?: string
  output?: Array<{
    content?: Array<{
      type?: string
      text?: string
      [key: string]: unknown
    }>
    [key: string]: unknown
  }>
  [key: string]: unknown
}

function asRecord(value: unknown): JsonRecord | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined
  return value as JsonRecord
}

/**
 * Normalise only the semantically-empty representation exposed by Pilot #17:
 * an optional assessment data-point unit supplied as an empty/whitespace string.
 *
 * Required fields, non-string units and non-empty units remain untouched so the
 * existing provider/domain schemas continue to fail closed for real defects.
 */
export function normaliseAssessmentItemOptionalUnits(output: unknown): unknown {
  const record = asRecord(output)
  const context = asRecord(record?.context)
  if (!record || !context || !Array.isArray(context.dataPoints)) return output

  let changed = false
  const dataPoints = context.dataPoints.map((dataPoint) => {
    const point = asRecord(dataPoint)
    if (!point || typeof point.unit !== 'string' || point.unit.trim().length > 0) return dataPoint
    const withoutUnit = { ...point }
    delete withoutUnit.unit
    changed = true
    return withoutUnit
  })

  if (!changed) return output
  return {
    ...record,
    context: {
      ...context,
      dataPoints,
    },
  }
}

function normaliseJsonOutputText(text: string) {
  try {
    const parsed = JSON.parse(text) as unknown
    const normalised = normaliseAssessmentItemOptionalUnits(parsed)
    if (normalised === parsed) return { text, changed: false }
    return { text: JSON.stringify(normalised), changed: true }
  } catch {
    return { text, changed: false }
  }
}

function isAssessmentItemRequest(init?: RequestInit) {
  if (typeof init?.body !== 'string') return false
  try {
    const body = JSON.parse(init.body) as {
      text?: { format?: { name?: string } }
    }
    return body.text?.format?.name === assessmentItemSchemaName
  } catch {
    return false
  }
}

async function normaliseAssessmentItemResponse(response: Response) {
  if (!response.ok) return response

  let body: ResponsesApiBody
  try {
    body = await response.clone().json() as ResponsesApiBody
  } catch {
    return response
  }

  let changed = false
  const nextBody: ResponsesApiBody = { ...body }

  if (typeof body.output_text === 'string') {
    const normalised = normaliseJsonOutputText(body.output_text)
    if (normalised.changed) {
      nextBody.output_text = normalised.text
      changed = true
    }
  }

  if (Array.isArray(body.output)) {
    nextBody.output = body.output.map((item) => {
      if (!Array.isArray(item.content)) return item
      let itemChanged = false
      const content = item.content.map((entry) => {
        if (entry.type !== 'output_text' || typeof entry.text !== 'string') return entry
        const normalised = normaliseJsonOutputText(entry.text)
        if (!normalised.changed) return entry
        itemChanged = true
        changed = true
        return { ...entry, text: normalised.text }
      })
      return itemChanged ? { ...item, content } : item
    })
  }

  if (!changed) return response

  const headers = new Headers(response.headers)
  headers.delete('content-length')
  headers.delete('content-encoding')
  return new Response(JSON.stringify(nextBody), {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

function assessmentItemNormalisingFetch(fetchImpl: typeof fetch): typeof fetch {
  return async (input, init) => {
    const response = await fetchImpl(input, init)
    if (!isAssessmentItemRequest(init)) return response
    return normaliseAssessmentItemResponse(response)
  }
}

export function createOpenAIModelAssistedWorkers(config: OpenAIContentFactoryAdapterConfig) {
  return createIntegrityWorkers({
    ...config,
    fetchImpl: assessmentItemNormalisingFetch(config.fetchImpl ?? fetch),
  })
}
