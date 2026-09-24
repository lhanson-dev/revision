import { describe, expect, it } from 'vitest'
import {
  parseFoundationInternalLearningRemediationProofIssueComment,
  resolveFoundationInternalLearningRemediationProofSource,
  validateFoundationInternalLearningRemediationProofSource,
} from './foundation-internal-learning-remediation-proof-trigger.mjs'

const marker = 'revision-run-foundation-internal-learning-remediation-proof:v1'
const validSource = {
  learning_run_id: '35789048198',
  learning_artifact_id: '10723573827',
  learning_head_sha: '541a079f5647c54e04e67040f25f08ab86402665',
  assurance_run_id: '35836291040',
  assurance_artifact_id: '10739757463',
  assurance_head_sha: 'b50d191e35b5d161e73301d18c2879f884045de0',
  foundation_fingerprint: '1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee',
}

function comment(overrides = {}) {
  const source = { ...validSource, ...overrides }
  return [
    marker,
    `learning_run_id: ${source.learning_run_id}`,
    `learning_artifact_id: ${source.learning_artifact_id}`,
    `learning_head_sha: ${source.learning_head_sha}`,
    `assurance_run_id: ${source.assurance_run_id}`,
    `assurance_artifact_id: ${source.assurance_artifact_id}`,
    `assurance_head_sha: ${source.assurance_head_sha}`,
    `foundation_fingerprint: ${source.foundation_fingerprint}`,
  ].join('\n')
}

describe('Foundation internal learning remediation proof source trigger', () => {
  it('parses an exact Founder-owned issue-comment payload', () => {
    expect(parseFoundationInternalLearningRemediationProofIssueComment(comment(), marker)).toEqual(validSource)
  })

  it('accepts the same identities through workflow dispatch inputs', () => {
    expect(resolveFoundationInternalLearningRemediationProofSource({
      eventName: 'workflow_dispatch',
      expectedMarker: marker,
      workflowInputs: validSource,
    })).toEqual(validSource)
  })

  it('fails closed on duplicate, unknown or missing fields', () => {
    expect(() => parseFoundationInternalLearningRemediationProofIssueComment(`${comment()}\nlearning_run_id: 1`, marker))
      .toThrow('Duplicate trigger field: learning_run_id')
    expect(() => parseFoundationInternalLearningRemediationProofIssueComment(`${comment()}\nlearning_digest: nope`, marker))
      .toThrow('Unknown trigger field: learning_digest')
    const body = comment().split('\n').filter((line) => !line.startsWith('assurance_artifact_id:')).join('\n')
    expect(() => parseFoundationInternalLearningRemediationProofIssueComment(body, marker))
      .toThrow('Missing trigger field: assurance_artifact_id')
  })

  it('fails closed on malformed identities', () => {
    expect(() => validateFoundationInternalLearningRemediationProofSource({ ...validSource, assurance_head_sha: 'abc' }))
      .toThrow('assurance_head_sha must be exactly 40 hexadecimal characters')
    expect(() => validateFoundationInternalLearningRemediationProofSource({ ...validSource, learning_artifact_id: 'zero' }))
      .toThrow('learning_artifact_id must be a positive decimal integer')
  })
})
