import { describe, expect, it } from 'vitest'
import {
  parseFoundationInternalLearningReassuranceProofIssueComment,
  resolveFoundationInternalLearningReassuranceProofSource,
  validateFoundationInternalLearningReassuranceProofSource,
} from './foundation-internal-learning-reassurance-proof-trigger.mjs'

const marker = 'revision-run-foundation-internal-learning-reassurance-proof:v1'
const validSource = {
  remediation_run_id: '35996162981',
  remediation_artifact_id: '10806996448',
  remediation_head_sha: 'f568101c44f402899b9d65171413533f34b4c029',
  foundation_fingerprint: '1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee',
  result_bundle_fingerprint: '8452d1ef17ef56f626b2711c536083c9fce138015f90f0dde85885db15780cb9',
}

function comment(overrides = {}) {
  const source = { ...validSource, ...overrides }
  return [
    marker,
    `remediation_run_id: ${source.remediation_run_id}`,
    `remediation_artifact_id: ${source.remediation_artifact_id}`,
    `remediation_head_sha: ${source.remediation_head_sha}`,
    `foundation_fingerprint: ${source.foundation_fingerprint}`,
    `result_bundle_fingerprint: ${source.result_bundle_fingerprint}`,
  ].join('\n')
}

describe('Foundation internal learning re-assurance proof source trigger', () => {
  it('parses an exact Founder-owned issue-comment payload', () => {
    expect(parseFoundationInternalLearningReassuranceProofIssueComment(comment(), marker)).toEqual(validSource)
  })

  it('accepts the same identities through workflow dispatch inputs', () => {
    expect(resolveFoundationInternalLearningReassuranceProofSource({
      eventName: 'workflow_dispatch',
      expectedMarker: marker,
      workflowInputs: validSource,
    })).toEqual(validSource)
  })

  it('fails closed on duplicate, unknown or missing fields', () => {
    expect(() => parseFoundationInternalLearningReassuranceProofIssueComment(`${comment()}\nremediation_run_id: 1`, marker))
      .toThrow('Duplicate trigger field: remediation_run_id')
    expect(() => parseFoundationInternalLearningReassuranceProofIssueComment(`${comment()}\nassurance_run_id: 1`, marker))
      .toThrow('Unknown trigger field: assurance_run_id')
    const body = comment().split('\n').filter((line) => !line.startsWith('result_bundle_fingerprint:')).join('\n')
    expect(() => parseFoundationInternalLearningReassuranceProofIssueComment(body, marker))
      .toThrow('Missing trigger field: result_bundle_fingerprint')
  })

  it('fails closed on malformed identities', () => {
    expect(() => validateFoundationInternalLearningReassuranceProofSource({ ...validSource, remediation_head_sha: 'abc' }))
      .toThrow('remediation_head_sha must be exactly 40 hexadecimal characters')
    expect(() => validateFoundationInternalLearningReassuranceProofSource({ ...validSource, remediation_artifact_id: 'zero' }))
      .toThrow('remediation_artifact_id must be a positive decimal integer')
    expect(() => validateFoundationInternalLearningReassuranceProofSource({ ...validSource, result_bundle_fingerprint: 'abc' }))
      .toThrow('result_bundle_fingerprint must be exactly 64 hexadecimal characters')
  })
})
