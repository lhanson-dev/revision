import { describe, expect, it } from 'vitest'
import {
  parseFoundationInternalLearningRepeatRemediationProofIssueComment,
  resolveFoundationInternalLearningRepeatRemediationProofSource,
  validateFoundationInternalLearningRepeatRemediationProofSource,
} from './foundation-internal-learning-repeat-remediation-proof-trigger.mjs'

const marker = 'revision-run-foundation-internal-learning-remediation-proof:v2'
const validSource = {
  reassurance_run_id: '36058013508',
  reassurance_artifact_id: '10833004381',
  reassurance_head_sha: '9282d1a3b134150962d3b76f531f271f17d8e509',
  foundation_fingerprint: '1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee',
  corrected_bundle_fingerprint: '8452d1ef17ef56f626b2711c536083c9fce138015f90f0dde85885db15780cb9',
}

function comment(overrides = {}) {
  const source = { ...validSource, ...overrides }
  return [
    marker,
    `reassurance_run_id: ${source.reassurance_run_id}`,
    `reassurance_artifact_id: ${source.reassurance_artifact_id}`,
    `reassurance_head_sha: ${source.reassurance_head_sha}`,
    `foundation_fingerprint: ${source.foundation_fingerprint}`,
    `corrected_bundle_fingerprint: ${source.corrected_bundle_fingerprint}`,
  ].join('\n')
}

describe('Foundation internal learning repeat-remediation proof source trigger', () => {
  it('parses an exact Founder-owned issue-comment payload', () => {
    expect(parseFoundationInternalLearningRepeatRemediationProofIssueComment(comment(), marker)).toEqual(validSource)
  })

  it('accepts the same identities through workflow dispatch inputs', () => {
    expect(resolveFoundationInternalLearningRepeatRemediationProofSource({
      eventName: 'workflow_dispatch',
      expectedMarker: marker,
      workflowInputs: validSource,
    })).toEqual(validSource)
  })

  it('fails closed on duplicate, unknown or missing fields', () => {
    expect(() => parseFoundationInternalLearningRepeatRemediationProofIssueComment(`${comment()}\nreassurance_run_id: 1`, marker))
      .toThrow('Duplicate trigger field: reassurance_run_id')
    expect(() => parseFoundationInternalLearningRepeatRemediationProofIssueComment(`${comment()}\nremediation_run_id: 1`, marker))
      .toThrow('Unknown trigger field: remediation_run_id')
    const body = comment().split('\n').filter((line) => !line.startsWith('corrected_bundle_fingerprint:')).join('\n')
    expect(() => parseFoundationInternalLearningRepeatRemediationProofIssueComment(body, marker))
      .toThrow('Missing trigger field: corrected_bundle_fingerprint')
  })

  it('fails closed on malformed identities', () => {
    expect(() => validateFoundationInternalLearningRepeatRemediationProofSource({ ...validSource, reassurance_head_sha: 'abc' }))
      .toThrow('reassurance_head_sha must be exactly 40 hexadecimal characters')
    expect(() => validateFoundationInternalLearningRepeatRemediationProofSource({ ...validSource, reassurance_artifact_id: 'zero' }))
      .toThrow('reassurance_artifact_id must be a positive decimal integer')
    expect(() => validateFoundationInternalLearningRepeatRemediationProofSource({ ...validSource, corrected_bundle_fingerprint: 'abc' }))
      .toThrow('corrected_bundle_fingerprint must be exactly 64 hexadecimal characters')
  })
})
