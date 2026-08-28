import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

export const qualificationPath = 'content-factory/reliability-qualification.json'

export function assertLivePilotQualified(record) {
  if (!record || typeof record !== 'object') {
    throw new Error('content_factory_reliability_qualification_invalid: qualification record must be an object')
  }
  if (record.schemaVersion !== 1) {
    throw new Error(`content_factory_reliability_qualification_invalid: unsupported schemaVersion ${String(record.schemaVersion)}`)
  }
  if (record.status !== 'qualified' || record.livePilotEligible !== true) {
    throw new Error(
      `content_factory_live_pilot_paused: reliability qualification status=${String(record.status)} livePilotEligible=${String(record.livePilotEligible)}; complete the course-agnostic qualification gates before another paid end-to-end pilot`,
    )
  }
  if (!record.qualifiedEvidence || typeof record.qualifiedEvidence !== 'object') {
    throw new Error('content_factory_reliability_qualification_invalid: qualified status requires qualifiedEvidence')
  }
  const required = Array.isArray(record.requiredGates) ? record.requiredGates : []
  const passed = Array.isArray(record.qualifiedEvidence.passedGates) ? record.qualifiedEvidence.passedGates : []
  const missing = required.filter((gate) => !passed.includes(gate))
  if (missing.length > 0) {
    throw new Error(`content_factory_reliability_qualification_invalid: missing passed gates ${missing.join(', ')}`)
  }
  return record
}

export async function loadAndAssertLivePilotQualified(path = qualificationPath) {
  const raw = await readFile(path, 'utf8')
  return assertLivePilotQualified(JSON.parse(raw))
}

const invokedPath = process.argv[1]
if (invokedPath && fileURLToPath(import.meta.url) === invokedPath) {
  try {
    await loadAndAssertLivePilotQualified()
    console.log('Content Factory reliability qualification is PASS; paid live pilot execution is eligible.')
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}
