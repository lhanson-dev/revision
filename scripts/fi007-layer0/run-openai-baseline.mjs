import fs from 'node:fs'
import path from 'node:path'
import { performance } from 'node:perf_hooks'

const MODEL_PRICES_USD_PER_MILLION = {
  'gpt-5.6-sol': { input: 5, cachedInput: 0.5, output: 30 },
  'gpt-5.6-terra': { input: 2, cachedInput: 0.2, output: 12 },
  'gpt-5.6-luna': { input: 0.2, cachedInput: 0.02, output: 1.2 },
}

const RESULT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'provisionalMark',
    'maximumMark',
    'levelOrBand',
    'creditedEvidence',
    'missedOrUnderdeveloped',
    'improvementPriorities',
    'confidenceState',
    'reviewRequired',
    'unsupportedCriterionDetected',
    'rationaleSummary',
  ],
  properties: {
    provisionalMark: { type: 'integer', minimum: 0 },
    maximumMark: { type: 'integer', minimum: 1 },
    levelOrBand: { anyOf: [{ type: 'string' }, { type: 'null' }] },
    creditedEvidence: { type: 'array', items: { type: 'string' }, maxItems: 8 },
    missedOrUnderdeveloped: { type: 'array', items: { type: 'string' }, maxItems: 8 },
    improvementPriorities: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 3 },
    confidenceState: { type: 'string', enum: ['normal', 'borderline', 'insufficient', 'review-required'] },
    reviewRequired: { type: 'boolean' },
    unsupportedCriterionDetected: { type: 'boolean' },
    rationaleSummary: { type: 'string' },
  },
}

function parseArgs(argv) {
  const args = {}
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index]
    const value = argv[index + 1]
    if (!key?.startsWith('--') || value === undefined) {
      throw new Error('Usage: --fixtures <file> --output <file> [--model <id>] [--reasoning <effort>]')
    }
    args[key.slice(2)] = value
  }
  return args
}

function extractOutputText(response) {
  for (const item of response.output ?? []) {
    if (item.type !== 'message') continue
    for (const content of item.content ?? []) {
      if (content.type === 'output_text' && typeof content.text === 'string') return content.text
    }
  }
  throw new Error(`No output_text found in response ${response.id ?? '(unknown)'}`)
}

function calculateCostUsd(modelId, usage) {
  const price = MODEL_PRICES_USD_PER_MILLION[modelId]
  if (!price || !usage) return null
  const input = usage.input_tokens ?? 0
  const cached = usage.input_tokens_details?.cached_tokens ?? 0
  const uncached = Math.max(0, input - cached)
  const output = usage.output_tokens ?? 0
  return ((uncached * price.input) + (cached * price.cachedInput) + (output * price.output)) / 1_000_000
}

function buildPrompt(fixture, testCase) {
  return [
    'You are performing a blinded feasibility evaluation of a bounded AQA AS Business 7131 Paper 2 marking contract.',
    'Mark only against the supplied question, case context, AO allocation and marking guidance.',
    'Do not invent criteria, requirements, facts or assessment rules.',
    'Indicative guidance is not exhaustive: credit valid contextual reasoning that satisfies the assessment demand even when phrased differently.',
    'Use the whole answer. Distinguish accurate contextual analysis/evaluation from fluent but unsupported claims.',
    'The mark is provisional research output, not an official AQA mark.',
    '',
    `Qualification: ${fixture.qualification.awardingOrganisation} ${fixture.qualification.qualification} ${fixture.qualification.specificationCode}`,
    `Component: ${fixture.qualification.component}`,
    `Question ID: ${testCase.questionId}`,
    `Maximum mark: ${testCase.maximumMark}`,
    `Assessment objectives: ${JSON.stringify(testCase.assessmentObjectives)}`,
    `Question: ${testCase.question}`,
    '',
    'Case context:',
    fixture.caseContext,
    '',
    'Governed marking guidance:',
    testCase.markingGuidance.map((item) => `- ${item}`).join('\n'),
    '',
    'Learner answer:',
    testCase.learnerAnswer,
    '',
    'Return the required structured result. provisionalMark must not exceed maximumMark. Set unsupportedCriterionDetected=true if your own reasoning would require a criterion not supported by the supplied contract; in that event reviewRequired should also be true.',
  ].join('\n')
}

async function markCase({ apiKey, modelId, reasoningEffort, fixture, testCase }) {
  const started = performance.now()
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      store: false,
      reasoning: { effort: reasoningEffort },
      input: buildPrompt(fixture, testCase),
      text: {
        format: {
          type: 'json_schema',
          name: 'revision_marking_result',
          strict: true,
          schema: RESULT_SCHEMA,
        },
      },
    }),
  })
  const latencyMs = Math.round(performance.now() - started)
  const payload = await response.json()
  if (!response.ok) throw new Error(`OpenAI ${response.status}: ${JSON.stringify(payload)}`)
  const parsed = JSON.parse(extractOutputText(payload))
  if (parsed.maximumMark !== testCase.maximumMark) throw new Error(`maximumMark mismatch for ${testCase.answerId}`)
  if (parsed.provisionalMark > testCase.maximumMark) throw new Error(`provisionalMark exceeds maximum for ${testCase.answerId}`)
  return {
    answerId: testCase.answerId,
    ...parsed,
    latencyMs,
    usage: payload.usage ?? null,
    estimatedCostUsd: calculateCostUsd(modelId, payload.usage),
    providerRequestId: payload.id ?? null,
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is required. Never commit API keys or write them to result files.')
  if (!args.fixtures || !args.output) throw new Error('--fixtures and --output are required.')

  const fixture = JSON.parse(fs.readFileSync(args.fixtures, 'utf8'))
  const modelId = args.model ?? 'gpt-5.6-sol'
  const reasoningEffort = args.reasoning ?? 'medium'
  const runId = `fi007-${modelId}-${Date.now()}`
  const results = []

  for (const testCase of fixture.cases ?? []) {
    process.stderr.write(`Marking ${testCase.answerId} with ${modelId}...\n`)
    results.push(await markCase({ apiKey, modelId, reasoningEffort, fixture, testCase }))
  }

  const output = {
    benchmarkVersion: fixture.benchmarkVersion,
    runId,
    provider: 'openai',
    modelId,
    reasoningEffort,
    markingContractVersion: 'fi007-layer0-v1',
    priceEvidenceDate: '2026-08-22',
    results,
  }

  fs.mkdirSync(path.dirname(args.output), { recursive: true })
  fs.writeFileSync(args.output, `${JSON.stringify(output, null, 2)}\n`)
  process.stderr.write(`Wrote ${results.length} results to ${args.output}\n`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
