import { describe, expect, it } from 'vitest'
import {
  parseFoundationInternalLearningAssuranceProofIssueComment,
  resolveFoundationInternalLearningAssuranceProofSource,
  validateFoundationInternalLearningAssuranceProofSource,
} from './foundation-internal-learning-assurance-proof-trigger.mjs'

const marker = 'revision-run-foundation-internal-learning-assurance-proof:v1'
const validSource = {
  source_run_id: '35435779143',
  source_artifact_id: '10582119606',
  source_head_sha: 'cfa293ab29b1d876af1e8ff40b77f9d41d396970',
  source_foundation_fingerprint: '1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee',
  ai_assured_run_id: '35438968578',
  ai_assured_artifact_id: '10583506599',
  ai_assured_head_sha: 'ade7ec882a27fcbe7b7597fc0809188712e953c0',
  learning_run_id: '35468029336',
  learning_artifact_id: '10592980673',
  learning_head_sha: '1444af1f7a3c33e8902b0c148a5e18ec8634235b',
  foundation_fingerprint: '1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee',
}

function comment(overrides = {}) {
  const source = { ...validSource, ...overrides }
  return [
    marker,
    `source_run_id: ${source.source_run_id}`,
    `source_artifact_id: ${source.source_artifact_id}`,
    `source_head_sha: ${source.source_head_sha}`,
    `source_foundation_fingerprint: ${source.source_foundation_fingerprint}`,
    `ai_assured_run_id: ${source.ai_assured_run_id}`,
    `ai_assured_artifact_id: ${source.ai_assured_artifact_id}`,
    `ai_assured_head_sha: ${source.ai_assured_head_sha}`,
    `learning_run_id: ${source.learning_run_id}`,
    `learning_artifact_id: ${source.learning_artifact_id}`,
    `learning_head_sha: ${source.learning_head_sha}`,
    `foundation_fingerprint: ${source.foundation_fingerprint}`,
  ].join('\n')
}

describe('Foundation internal learning assurance proof source trigger', () => {
  it('parses an exact Founder-owned issue-comment payload', () => {
    expect(parseFoundationInternalLearningAssuranceProofIssueComment(comment(), marker)).toEqual(validSource)
  })

  it('accepts the same identities through workflow dispatch inputs', () => {
    expect(resolveFoundationInternalLearningAssuranceProofSource({
      eventName: 'workflow_dispatch',
      expectedMarker: marker,
      workflowInputs: validSource,
    })).toEqual(validSource)
  })

  it('fails closed on duplicate, unknown or missing fields', () => {
    expect(() => parseFoundationInternalLearningAssuranceProofIssueComment(`${comment()}\nlearning_run_id: 1`, marker))
      .toThrow('Duplicate trigger field: learning_run_id')
    expect(() => parseFoundationInternalLearningAssuranceProofIssueComment(`${comment()}\nlearning_digest: nope`, marker))
      .toThrow('Unknown trigger field: learning_digest')
    const body = comment().split('\n').filter((line) => !line.startsWith('learning_artifact_id:')).join('\n')
    expect(() => parseFoundationInternalLearningAssuranceProofIssueComment(body, marker))
      .toThrow('Missing trigger field: learning_artifact_id')
  })

  it('fails closed on malformed identities', () => {
    expect(() => validateFoundationInternalLearningAssuranceProofSource({ ...validSource, learning_head_sha: 'abc' }))
      .toThrow('learning_head_sha must be exactly 40 hexadecimal characters')
    expect(() => validateFoundationInternalLearningAssuranceProofSource({ ...validSource, learning_artifact_id: 'zero' }))
      .toThrow('learning_artifact_id must be a positive decimal integer')
  })
})
