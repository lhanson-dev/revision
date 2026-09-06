import { appendFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const requiredFields = [
  'source_run_id',
  'source_artifact_id',
  'source_head_sha',
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

export function validateFoundationProofSource(source) {
  return {
    source_run_id: validateDecimal(requireValue(source?.source_run_id, 'source_run_id'), 'source_run_id'),
    source_artifact_id: validateDecimal(requireValue(source?.source_artifact_id, 'source_artifact_id'), 'source_artifact_id'),
    source_head_sha: validateHex(requireValue(source?.source_head_sha, 'source_head_sha'), 40, 'source_head_sha'),
    foundation_fingerprint: validateHex(
      requireValue(source?.foundation_fingerprint, 'foundation_fingerprint'),
      64,
      'foundation_fingerprint',
    ),
  }
}

export function parseFoundationProofIssueComment(body, expectedMarker) {
  requireValue(expectedMarker, 'expectedMarker')
  if (typeof body !== 'string') throw new Error('Issue-comment trigger body is required.')

  const lines = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines[0] !== expectedMarker) {
    throw new Error(`Issue-comment trigger marker must be exactly ${expectedMarker}.`)
  }

  const source = {}
  for (const line of lines.slice(1)) {
    const match = line.match(/^([a-z_]+):\s*(\S+)$/)
    if (!match) throw new Error(`Invalid trigger line: ${line}`)

    const [, key, value] = match
    if (!allowedFields.has(key)) throw new Error(`Unknown trigger field: ${key}`)
    if (source[key]) throw new Error(`Duplicate trigger field: ${key}`)
    source[key] = value
  }

  for (const field of requiredFields) {
    if (!source[field]) throw new Error(`Missing trigger field: ${field}`)
  }

  return validateFoundationProofSource(source)
}

export function resolveFoundationProofSource({ eventName, issueCommentBody, expectedMarker, workflowInputs = {} }) {
  if (eventName === 'issue_comment') {
    return parseFoundationProofIssueComment(issueCommentBody, expectedMarker)
  }

  if (eventName === 'workflow_dispatch') {
    return validateFoundationProofSource(workflowInputs)
  }

  throw new Error(`Unsupported Foundation proof trigger event: ${eventName || 'unknown'}`)
}

export function appendFoundationProofSourceEnv(source, githubEnvPath) {
  requireValue(githubEnvPath, 'GITHUB_ENV')
  const validated = validateFoundationProofSource(source)
  appendFileSync(
    githubEnvPath,
    [
      `SOURCE_RUN_ID=${validated.source_run_id}`,
      `SOURCE_ARTIFACT_ID=${validated.source_artifact_id}`,
      `SOURCE_HEAD_SHA=${validated.source_head_sha}`,
      `FOUNDATION_FINGERPRINT=${validated.foundation_fingerprint}`,
    ].join('\n') + '\n',
  )
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const source = resolveFoundationProofSource({
      eventName: process.env.GITHUB_EVENT_NAME,
      issueCommentBody: process.env.REVISION_TRIGGER_BODY,
      expectedMarker: process.env.REVISION_TRIGGER_MARKER,
      workflowInputs: {
        source_run_id: process.env.REVISION_INPUT_SOURCE_RUN_ID,
        source_artifact_id: process.env.REVISION_INPUT_SOURCE_ARTIFACT_ID,
        source_head_sha: process.env.REVISION_INPUT_SOURCE_HEAD_SHA,
        foundation_fingerprint: process.env.REVISION_INPUT_FOUNDATION_FINGERPRINT,
      },
    })
    appendFoundationProofSourceEnv(source, process.env.GITHUB_ENV)
    console.log(JSON.stringify(source, null, 2))
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
