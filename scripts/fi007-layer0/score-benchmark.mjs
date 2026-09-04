import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export function scoreBenchmark(referenceSet, evaluationRun) {
  const references = referenceSet.references ?? []
  const results = evaluationRun.results ?? []

  if (references.length === 0) throw new Error('Reference set is empty.')
  if (results.length === 0) throw new Error('Evaluation run is empty.')

  const referenceMap = new Map()
  for (const reference of references) {
    if (!reference.answerId) throw new Error('Reference missing answerId.')
    if (referenceMap.has(reference.answerId)) throw new Error(`Duplicate reference answerId: ${reference.answerId}`)
    const finalMark = reference.adjudicatedMark ?? reference.referenceMark
    if (!Number.isInteger(finalMark)) throw new Error(`Incomplete reference mark for ${reference.answerId}`)
    referenceMap.set(reference.answerId, { ...reference, finalMark })
  }

  const resultMap = new Map()
  for (const result of results) {
    if (!result.answerId) throw new Error('Result missing answerId.')
    if (resultMap.has(result.answerId)) throw new Error(`Duplicate result answerId: ${result.answerId}`)
    if (!Number.isInteger(result.provisionalMark)) throw new Error(`Missing integer provisionalMark for ${result.answerId}`)
    resultMap.set(result.answerId, result)
  }

  const missing = [...referenceMap.keys()].filter((id) => !resultMap.has(id))
  const unexpected = [...resultMap.keys()].filter((id) => !referenceMap.has(id))
  if (missing.length) throw new Error(`Missing result IDs: ${missing.join(', ')}`)
  if (unexpected.length) throw new Error(`Unexpected result IDs: ${unexpected.join(', ')}`)

  const rows = []
  for (const [answerId, reference] of referenceMap) {
    const result = resultMap.get(answerId)
    const error = result.provisionalMark - reference.finalMark
    const absoluteError = Math.abs(error)
    rows.push({
      answerId,
      referenceMark: reference.finalMark,
      modelMark: result.provisionalMark,
      error,
      absoluteError,
      exact: absoluteError === 0,
      withinOne: absoluteError <= 1,
      withinTwo: absoluteError <= 2,
      fabricatedCriterion: Boolean(result.unsupportedCriterionDetected),
      reviewRequired: Boolean(result.reviewRequired),
      confidenceState: result.confidenceState ?? null,
    })
  }

  const n = rows.length
  const sum = (values) => values.reduce((total, value) => total + value, 0)
  const exactCount = rows.filter((row) => row.exact).length
  const withinOneCount = rows.filter((row) => row.withinOne).length
  const withinTwoCount = rows.filter((row) => row.withinTwo).length
  const fabricatedCriterionCount = rows.filter((row) => row.fabricatedCriterion).length
  const signedBias = sum(rows.map((row) => row.error)) / n
  const meanAbsoluteError = sum(rows.map((row) => row.absoluteError)) / n
  const largestAbsoluteError = Math.max(...rows.map((row) => row.absoluteError))

  return {
    benchmarkVersion: referenceSet.benchmarkVersion,
    runId: evaluationRun.runId ?? null,
    provider: evaluationRun.provider ?? null,
    modelId: evaluationRun.modelId ?? null,
    reasoningEffort: evaluationRun.reasoningEffort ?? null,
    caseCount: n,
    exactCount,
    exactRate: exactCount / n,
    withinOneCount,
    withinOneRate: withinOneCount / n,
    withinTwoCount,
    withinTwoRate: withinTwoCount / n,
    meanAbsoluteError,
    signedBias,
    largestAbsoluteError,
    fabricatedCriterionCount,
    blockingFabricatedCriterionDefect: fabricatedCriterionCount > 0,
    reviewRequiredCount: rows.filter((row) => row.reviewRequired).length,
    rows,
  }
}

function parseArgs(argv) {
  const args = {}
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index]
    const value = argv[index + 1]
    if (!key?.startsWith('--') || value === undefined) throw new Error('Usage: --references <file> --results <file> [--output <file>]')
    args[key.slice(2)] = value
  }
  return args
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.references || !args.results) throw new Error('Both --references and --results are required.')
  const score = scoreBenchmark(readJson(args.references), readJson(args.results))
  const output = `${JSON.stringify(score, null, 2)}\n`
  if (args.output) {
    fs.mkdirSync(path.dirname(args.output), { recursive: true })
    fs.writeFileSync(args.output, output)
  } else {
    process.stdout.write(output)
  }
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
if (isDirectRun) main()
