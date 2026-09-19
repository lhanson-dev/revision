import { describe, expect, it } from 'vitest'
import {
  parseFoundationInternalLearningProofIssueComment,
  resolveFoundationInternalLearningProofSource,
  validateFoundationInternalLearningProofSource,
} from './foundation-internal-learning-proof-trigger.mjs'

const marker = 'revision-run-foundation-internal-learning-proof:v1'
const validSource = {
  source_run_id: '35435779143',
  source_artifact_id: '10582119606',
  source_head_sha: 'cfa293ab29b1d876af1e8ff40b77f9d41d396970',
  source_foundation_fingerprint: '1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee',
  ai_assured_run_id: '35438968578',
  ai_assured_artifact_id: '10583506599',
  ai_assured_head_sha: 'ade7ec882a27fcbe7b7597fc0809188712e953c0',
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
    `foundation_fingerprint: ${source.foundation_fingerprint}`,
  ].join('\n')
}

describe('Foundation internal learning proof source trigger', () => {
  it('parses an exact Founder-owned issue-comment payload', () => {
    expect(parseFoundationInternalLearningProofIssueComment(comment(), marker)).toEqual(validSource)
  })

  it('accepts the same identities through workflow dispatch inputs', () => {
    expect(resolveFoundationInternalLearningProofSource({
      eventName: 'workflow_dispatch',
      expectedMarker: marker,
      workflowInputs: validSource,
    })).toEqual(validSource)
  })

  it('fails closed on a different marker', () => {
    expect(() => parseFoundationInternalLearningProofIssueComment(comment(), 'revision-run-foundation-internal-learning-proof:v2'))
      .toThrow('Issue-comment trigger marker must be exactly')
  })

  it('fails closed on duplicate fields', () => {
    expect(() => parseFoundationInternalLearningProofIssueComment(`${comment()}\nsource_run_id: 1`, marker))
      .toThrow('Duplicate trigger field: source_run_id')
  })

  it('fails closed on unknown fields', () => {
    expect(() => parseFoundationInternalLearningProofIssueComment(`${comment()}\nsource_digest: nope`, marker))
      .toThrow('Unknown trigger field: source_digest')
  })

  it('fails closed on malformed source identity values', () => {
    expect(() => validateFoundationInternalLearningProofSource({ ...validSource, source_head_sha: 'abc' }))
      .toThrow('source_head_sha must be exactly 40 hexadecimal characters')
    expect(() => validateFoundationInternalLearningProofSource({ ...validSource, ai_assured_artifact_id: 'zero' }))
      .toThrow('ai_assured_artifact_id must be a positive decimal integer')
    expect(() => validateFoundationInternalLearningProofSource({ ...validSource, foundation_fingerprint: 'abc' }))
      .toThrow('foundation_fingerprint must be exactly 64 hexadecimal characters')
  })

  it('fails closed when a required field is missing', () => {
    const body = comment().split('\n').filter((line) => !line.startsWith('ai_assured_run_id:')).join('\n')
    expect(() => parseFoundationInternalLearningProofIssueComment(body, marker))
      .toThrow('Missing trigger field: ai_assured_run_id')
  })
})
