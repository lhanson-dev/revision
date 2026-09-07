import { appendFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const requiredFields = [
  'source_run_id',
  'source_artifact_id',
  'source_head_sha',
  'source_foundation_fingerprint',
  'review_run_id',
  'review_artifact_id',
  'reviewed_commit',
  'foundation_fingerprint',
]

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

export function validateFoundationExpertReviewPackageSource(source) {
  const validated = {
    source_run_id: validateDecimal(requireValue(source?.source_run_id, 'source_run_id'), 'source_run_id'),
    source_artifact_id: validateDecimal(requireValue(source?.source_artifact_id, 'source_artifact_id'), 'source_artifact_id'),
    source_head_sha: validateHex(requireValue(source?.source_head_sha, 'source_head_sha'), 40, 'source_head_sha'),
    source_foundation_fingerprint: validateHex(
      requireValue(source?.source_foundation_fingerprint, 'source_foundation_fingerprint'),
      64,
      'source_foundation_fingerprint',
    ),
    review_run_id: validateDecimal(requireValue(source?.review_run_id, 'review_run_id'), 'review_run_id'),
    review_artifact_id: validateDecimal(requireValue(source?.review_artifact_id, 'review_artifact_id'), 'review_artifact_id'),
    reviewed_commit: validateHex(requireValue(source?.reviewed_commit, 'reviewed_commit'), 40, 'reviewed_commit'),
    foundation_fingerprint: validateHex(
      requireValue(source?.foundation_fingerprint, 'foundation_fingerprint'),
      64,
      'foundation_fingerprint',
    ),
  }

  for (const field of requiredFields) requireValue(validated[field], field)
  return validated
}

export function appendFoundationExpertReviewPackageSourceEnv(source, githubEnvPath) {
  requireValue(githubEnvPath, 'GITHUB_ENV')
  const validated = validateFoundationExpertReviewPackageSource(source)
  appendFileSync(
    githubEnvPath,
    [
      `SOURCE_RUN_ID=${validated.source_run_id}`,
      `SOURCE_ARTIFACT_ID=${validated.source_artifact_id}`,
      `SOURCE_HEAD_SHA=${validated.source_head_sha}`,
      `SOURCE_FOUNDATION_FINGERPRINT=${validated.source_foundation_fingerprint}`,
      `REVIEW_RUN_ID=${validated.review_run_id}`,
      `REVIEW_ARTIFACT_ID=${validated.review_artifact_id}`,
      `REVIEWED_COMMIT=${validated.reviewed_commit}`,
      `FOUNDATION_FINGERPRINT=${validated.foundation_fingerprint}`,
    ].join('\n') + '\n',
  )
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (process.env.GITHUB_EVENT_NAME !== 'workflow_dispatch') {
      throw new Error(`Unsupported expert-review package trigger event: ${process.env.GITHUB_EVENT_NAME || 'unknown'}`)
    }
    const source = validateFoundationExpertReviewPackageSource({
      source_run_id: process.env.REVISION_INPUT_SOURCE_RUN_ID,
      source_artifact_id: process.env.REVISION_INPUT_SOURCE_ARTIFACT_ID,
      source_head_sha: process.env.REVISION_INPUT_SOURCE_HEAD_SHA,
      source_foundation_fingerprint: process.env.REVISION_INPUT_SOURCE_FOUNDATION_FINGERPRINT,
      review_run_id: process.env.REVISION_INPUT_REVIEW_RUN_ID,
      review_artifact_id: process.env.REVISION_INPUT_REVIEW_ARTIFACT_ID,
      reviewed_commit: process.env.REVISION_INPUT_REVIEWED_COMMIT,
      foundation_fingerprint: process.env.REVISION_INPUT_FOUNDATION_FINGERPRINT,
    })
    appendFoundationExpertReviewPackageSourceEnv(source, process.env.GITHUB_ENV)
    console.log(JSON.stringify(source, null, 2))
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
