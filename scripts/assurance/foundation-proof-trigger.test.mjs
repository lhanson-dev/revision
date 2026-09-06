import { describe, expect, it } from 'vitest'
import {
  parseFoundationProofIssueComment,
  resolveFoundationProofSource,
  validateFoundationProofSource,
} from './foundation-proof-trigger.mjs'

const marker = 'revision-run-foundation-assurance-proof:v2'
const validSource = {
  source_run_id: '34035019903',
  source_artifact_id: '9989911232',
  source_head_sha: 'd33cc60ac45065ea49703765c599a612983daca8',
  foundation_fingerprint: '5555deac45fb38e20cf72a4b828d0965a48793fcaad1051bd1ba5ecbbab80ee7',
}

function comment(overrides = {}) {
  const source = { ...validSource, ...overrides }
  return [
    marker,
    `source_run_id: ${source.source_run_id}`,
    `source_artifact_id: ${source.source_artifact_id}`,
    `source_head_sha: ${source.source_head_sha}`,
    `foundation_fingerprint: ${source.foundation_fingerprint}`,
  ].join('\n')
}

describe('Foundation proof source trigger', () => {
  it('parses an exact Founder-owned issue-comment payload', () => {
    expect(parseFoundationProofIssueComment(comment(), marker)).toEqual(validSource)
  })

  it('accepts the same exact source identity through workflow dispatch inputs', () => {
    expect(resolveFoundationProofSource({
      eventName: 'workflow_dispatch',
      expectedMarker: marker,
      workflowInputs: validSource,
    })).toEqual(validSource)
  })

  it('fails closed on a different marker', () => {
    expect(() => parseFoundationProofIssueComment(comment(), 'revision-run-foundation-assurance-proof:v3'))
      .toThrow('Issue-comment trigger marker must be exactly')
  })

  it('fails closed on duplicate fields', () => {
    expect(() => parseFoundationProofIssueComment(`${comment()}\nsource_run_id: 1`, marker))
      .toThrow('Duplicate trigger field: source_run_id')
  })

  it('fails closed on unknown fields', () => {
    expect(() => parseFoundationProofIssueComment(`${comment()}\nsource_digest: nope`, marker))
      .toThrow('Unknown trigger field: source_digest')
  })

  it('fails closed on malformed source identity values', () => {
    expect(() => validateFoundationProofSource({ ...validSource, source_head_sha: 'abc' }))
      .toThrow('source_head_sha must be exactly 40 hexadecimal characters')
    expect(() => validateFoundationProofSource({ ...validSource, foundation_fingerprint: 'abc' }))
      .toThrow('foundation_fingerprint must be exactly 64 hexadecimal characters')
  })

  it('fails closed when a required field is missing', () => {
    const body = comment().split('\n').filter((line) => !line.startsWith('source_artifact_id:')).join('\n')
    expect(() => parseFoundationProofIssueComment(body, marker))
      .toThrow('Missing trigger field: source_artifact_id')
  })
})
