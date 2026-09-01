import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { buildCandidateAwareEvidence } from './content-factory-q7-evidence-lib.mjs'

const headSha = process.env.CONTENT_FACTORY_CONTENT_HEAD_SHA?.trim()
if (!headSha) throw new Error('q7_candidate_aware_evidence_missing_content_head_sha')

const evidenceDirectory = '.artifacts/content-factory-live-worker-soak'
const rawEvidenceFile = `${evidenceDirectory}/q7-live-worker-soak-${headSha}.json`
const traceFile = process.env.CONTENT_FACTORY_Q7_TRACE_FILE?.trim()
  || `${evidenceDirectory}/provider-call-trace.jsonl`
const outputFile = `${evidenceDirectory}/q7-live-worker-soak-candidate-aware-${headSha}.json`

const rawEvidence = JSON.parse(await readFile(rawEvidenceFile, 'utf8'))
const traceText = await readFile(traceFile, 'utf8')
const traceEvents = traceText
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => JSON.parse(line))

const evidence = buildCandidateAwareEvidence(rawEvidence, traceEvents, { rawEvidenceFile })
await mkdir(dirname(outputFile), { recursive: true })
await writeFile(outputFile, JSON.stringify(evidence, null, 2), 'utf8')

if (!evidence.candidateRecoveryInstrumentation.complete) {
  throw new Error('q7_candidate_aware_evidence_incomplete_provider_call_classification')
}
