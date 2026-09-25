import { describe, expect, it } from 'vitest'
import {
  parseFoundationInternalLearningRepeatRemediationRecoveryIssueComment,
  validateFoundationInternalLearningRepeatRemediationRecoverySource,
} from './foundation-internal-learning-repeat-remediation-recovery-proof-trigger.mjs'

const marker = 'revision-recover-foundation-internal-learning-remediation-proof:v1'
const valid = {
  source_run_id: '36115708856',
  source_artifact_id: '10854463735',
  source_head_sha: '2e7a1a15cf9860e6bc6665a7026ae7ca749529f6',
  source_artifact_digest: 'sha256:2a36ac0a66c53f56376e1abbfb888708bbd19c2b8325a73dd3971f06e8de2ee1',
  foundation_fingerprint: '1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee',
}

describe('repeat-remediation recovery proof trigger', () => {
  it('parses the exact owner-controlled recovery identity', () => {
    const body = [
      marker,
      ...Object.entries(valid).map(([key, value]) => `${key}: ${value}`),
    ].join('\n')
    expect(parseFoundationInternalLearningRepeatRemediationRecoveryIssueComment(body, marker)).toEqual(valid)
  })

  it('rejects unknown fields and malformed identities', () => {
    expect(() => parseFoundationInternalLearningRepeatRemediationRecoveryIssueComment(`${marker}\nsource_run_id: 1`, marker)).toThrow('Missing trigger field')
    expect(() => parseFoundationInternalLearningRepeatRemediationRecoveryIssueComment([
      marker,
      ...Object.entries(valid).map(([key, value]) => `${key}: ${value}`),
      'unexpected: value',
    ].join('\n'), marker)).toThrow('Unknown trigger field')
    expect(() => validateFoundationInternalLearningRepeatRemediationRecoverySource({ ...valid, source_artifact_digest: 'bad' })).toThrow('sha256 digest')
  })
})
