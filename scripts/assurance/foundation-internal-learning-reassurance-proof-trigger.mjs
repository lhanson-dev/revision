import { appendFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const requiredFields = [
  'remediation_run_id',
  'remediation_artifact_id',
  'remediation_head_sha',
  'foundation_fingerprint',
  'result_bundle_fingerprint',
]
const allowedFields = new Set(requiredFields)

function requireValue(value, name) {
  if (!value) throw new Error(`${name} is required.`)
  return value
}

function validateDecimal(value, name) {
  if (!/^[1-9][0-9]*$/.test(value)) throw new Error(`${name} must be a positive decimal integer.`)
  return value
}

function validateHex(value, length, name) {
  const pattern = new RegExp(`^[0-9a-f]{${length}}$`, 'i')
  if (!pattern.test(value)) throw new Error(`${name} must be exactly ${length} hexadecimal characters.`)
  return value.toLowerCase()
}

export function validateFoundationInternalLearningReassuranceProofSource(source) {
  return {
    remediation_run_id: validateDecimal(requireValue(source?.remediation_run_id, 'remediation_run_id'), 'remediation_run_id'),
    remediation_artifact_id: validateDecimal(requireValue(source?.remediation_artifact_id, 'remediation_artifact_id'), 'remediation_artifact_id'),
    remediation_head_sha: validateHex(requireValue(source?.remediation_head_sha, 'remediation_head_sha'), 40, 'remediation_head_sha'),
    foundation_fingerprint: validateHex(requireValue(source?.foundation_fingerprint, 'foundation_fingerprint'), 64, 'foundation_fingerprint'),
    result_bundle_fingerprint: validateHex(requireValue(source?.result_bundle_fingerprint, 'result_bundle_fingerprint'), 64, 'result_bundle_fingerprint'),
  }
}

export function parseFoundationInternalLearningReassuranceProofIssueComment(body, expectedMarker) {
  requireValue(expectedMarker, 'expectedMarker')
  if (typeof body !== 'string') throw new Error('Issue-comment trigger body is required.')
  const lines = body.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  if (lines[0] !== expectedMarker) throw new Error(`Issue-comment trigger marker must be exactly ${expectedMarker}.`)
  const source = {}
  for (const line of lines.slice(1)) {
    const match = line.match(/^([a-z_]+):\s*(\S+)$/)
    if (!match) throw new Error(`Invalid trigger line: ${line}`)
    const [, key, value] = match
    if (!allowedFields.has(key)) throw new Error(`Unknown trigger field: ${key}`)
    if (source[key]) throw new Error(`Duplicate trigger field: ${key}`)
    source[key] = value
  }
  for (const field of requiredFields) if (!source[field]) throw new Error(`Missing trigger field: ${field}`)
  return validateFoundationInternalLearningReassuranceProofSource(source)
}

export function resolveFoundationInternalLearningReassuranceProofSource({ eventName, issueCommentBody, expectedMarker, workflowInputs = {} }) {
  if (eventName === 'issue_comment') return parseFoundationInternalLearningReassuranceProofIssueComment(issueCommentBody, expectedMarker)
  if (eventName === 'workflow_dispatch') return validateFoundationInternalLearningReassuranceProofSource(workflowInputs)
  throw new Error(`Unsupported internal learning re-assurance proof trigger event: ${eventName || 'unknown'}`)
}

export function appendFoundationInternalLearningReassuranceProofSourceEnv(source, githubEnvPath) {
  requireValue(githubEnvPath, 'GITHUB_ENV')
  const validated = validateFoundationInternalLearningReassuranceProofSource(source)
  appendFileSync(githubEnvPath, [
    `REMEDIATION_RUN_ID=${validated.remediation_run_id}`,
    `REMEDIATION_ARTIFACT_ID=${validated.remediation_artifact_id}`,
    `REMEDIATION_HEAD_SHA=${validated.remediation_head_sha}`,
    `FOUNDATION_FINGERPRINT=${validated.foundation_fingerprint}`,
    `RESULT_BUNDLE_FINGERPRINT=${validated.result_bundle_fingerprint}`,
    '',
  ].join('\n'))
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const source = resolveFoundationInternalLearningReassuranceProofSource({
      eventName: process.env.GITHUB_EVENT_NAME,
      issueCommentBody: process.env.REVISION_TRIGGER_BODY,
      expectedMarker: process.env.REVISION_TRIGGER_MARKER,
      workflowInputs: {
        remediation_run_id: process.env.REVISION_INPUT_REMEDIATION_RUN_ID,
        remediation_artifact_id: process.env.REVISION_INPUT_REMEDIATION_ARTIFACT_ID,
        remediation_head_sha: process.env.REVISION_INPUT_REMEDIATION_HEAD_SHA,
        foundation_fingerprint: process.env.REVISION_INPUT_FOUNDATION_FINGERPRINT,
        result_bundle_fingerprint: process.env.REVISION_INPUT_RESULT_BUNDLE_FINGERPRINT,
      },
    })
    appendFoundationInternalLearningReassuranceProofSourceEnv(source, process.env.GITHUB_ENV)
    console.log(JSON.stringify(source, null, 2))
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
