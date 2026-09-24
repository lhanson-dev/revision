import { appendFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const requiredFields = [
  'learning_run_id',
  'learning_artifact_id',
  'learning_head_sha',
  'assurance_run_id',
  'assurance_artifact_id',
  'assurance_head_sha',
  'foundation_fingerprint',
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

export function validateFoundationInternalLearningRemediationProofSource(source) {
  return {
    learning_run_id: validateDecimal(requireValue(source?.learning_run_id, 'learning_run_id'), 'learning_run_id'),
    learning_artifact_id: validateDecimal(requireValue(source?.learning_artifact_id, 'learning_artifact_id'), 'learning_artifact_id'),
    learning_head_sha: validateHex(requireValue(source?.learning_head_sha, 'learning_head_sha'), 40, 'learning_head_sha'),
    assurance_run_id: validateDecimal(requireValue(source?.assurance_run_id, 'assurance_run_id'), 'assurance_run_id'),
    assurance_artifact_id: validateDecimal(requireValue(source?.assurance_artifact_id, 'assurance_artifact_id'), 'assurance_artifact_id'),
    assurance_head_sha: validateHex(requireValue(source?.assurance_head_sha, 'assurance_head_sha'), 40, 'assurance_head_sha'),
    foundation_fingerprint: validateHex(requireValue(source?.foundation_fingerprint, 'foundation_fingerprint'), 64, 'foundation_fingerprint'),
  }
}

export function parseFoundationInternalLearningRemediationProofIssueComment(body, expectedMarker) {
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
  return validateFoundationInternalLearningRemediationProofSource(source)
}

export function resolveFoundationInternalLearningRemediationProofSource({ eventName, issueCommentBody, expectedMarker, workflowInputs = {} }) {
  if (eventName === 'issue_comment') return parseFoundationInternalLearningRemediationProofIssueComment(issueCommentBody, expectedMarker)
  if (eventName === 'workflow_dispatch') return validateFoundationInternalLearningRemediationProofSource(workflowInputs)
  throw new Error(`Unsupported internal learning remediation proof trigger event: ${eventName || 'unknown'}`)
}

export function appendFoundationInternalLearningRemediationProofSourceEnv(source, githubEnvPath) {
  requireValue(githubEnvPath, 'GITHUB_ENV')
  const validated = validateFoundationInternalLearningRemediationProofSource(source)
  appendFileSync(githubEnvPath, [
    `LEARNING_RUN_ID=${validated.learning_run_id}`,
    `LEARNING_ARTIFACT_ID=${validated.learning_artifact_id}`,
    `LEARNING_HEAD_SHA=${validated.learning_head_sha}`,
    `ASSURANCE_RUN_ID=${validated.assurance_run_id}`,
    `ASSURANCE_ARTIFACT_ID=${validated.assurance_artifact_id}`,
    `ASSURANCE_HEAD_SHA=${validated.assurance_head_sha}`,
    `FOUNDATION_FINGERPRINT=${validated.foundation_fingerprint}`,
    '',
  ].join('\n'))
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const source = resolveFoundationInternalLearningRemediationProofSource({
      eventName: process.env.GITHUB_EVENT_NAME,
      issueCommentBody: process.env.REVISION_TRIGGER_BODY,
      expectedMarker: process.env.REVISION_TRIGGER_MARKER,
      workflowInputs: {
        learning_run_id: process.env.REVISION_INPUT_LEARNING_RUN_ID,
        learning_artifact_id: process.env.REVISION_INPUT_LEARNING_ARTIFACT_ID,
        learning_head_sha: process.env.REVISION_INPUT_LEARNING_HEAD_SHA,
        assurance_run_id: process.env.REVISION_INPUT_ASSURANCE_RUN_ID,
        assurance_artifact_id: process.env.REVISION_INPUT_ASSURANCE_ARTIFACT_ID,
        assurance_head_sha: process.env.REVISION_INPUT_ASSURANCE_HEAD_SHA,
        foundation_fingerprint: process.env.REVISION_INPUT_FOUNDATION_FINGERPRINT,
      },
    })
    appendFoundationInternalLearningRemediationProofSourceEnv(source, process.env.GITHUB_ENV)
    console.log(JSON.stringify(source, null, 2))
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
