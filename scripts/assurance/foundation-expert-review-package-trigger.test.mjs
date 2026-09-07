import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { validateFoundationExpertReviewPackageSource } from './foundation-expert-review-package-trigger.mjs'

const validSource = {
  source_run_id: '34049089770',
  source_artifact_id: '9994019707',
  source_head_sha: 'ea8b1143270f70477dc5964f863c0e8e764bf3d5',
  source_foundation_fingerprint: '4171ecaf91a6dc50bfcec334f1727892a6767fe7ff25eae1db1f034d6c9a103d',
  review_run_id: '34063818271',
  review_artifact_id: '9998306869',
  reviewed_commit: 'bc377f0765ef64dcf15dc146f3299211816be693',
  foundation_fingerprint: '4171ecaf91a6dc50bfcec334f1727892a6767fe7ff25eae1db1f034d6c9a103d',
}

describe('Foundation expert-review package source binding', () => {
  it('accepts an exact source-proof plus independent-review identity', () => {
    expect(validateFoundationExpertReviewPackageSource(validSource)).toEqual(validSource)
  })

  it('allows the final reviewed fingerprint to differ from the original source fingerprint after valid remediation', () => {
    const remediated = {
      ...validSource,
      foundation_fingerprint: '09acd5d79698fa029c9b9b53138878c893940eed5c6b2534695aaba6c7779456',
    }
    expect(validateFoundationExpertReviewPackageSource(remediated)).toEqual(remediated)
  })

  it('fails closed on malformed run, artifact, commit and fingerprint identities', () => {
    expect(() => validateFoundationExpertReviewPackageSource({ ...validSource, source_run_id: '0' }))
      .toThrow('source_run_id must be a positive decimal integer')
    expect(() => validateFoundationExpertReviewPackageSource({ ...validSource, review_artifact_id: 'abc' }))
      .toThrow('review_artifact_id must be a positive decimal integer')
    expect(() => validateFoundationExpertReviewPackageSource({ ...validSource, reviewed_commit: 'abc' }))
      .toThrow('reviewed_commit must be exactly 40 hexadecimal characters')
    expect(() => validateFoundationExpertReviewPackageSource({ ...validSource, foundation_fingerprint: 'abc' }))
      .toThrow('foundation_fingerprint must be exactly 64 hexadecimal characters')
  })

  it('fails closed when any required identity is missing', () => {
    expect(() => validateFoundationExpertReviewPackageSource({ ...validSource, review_run_id: '' }))
      .toThrow('review_run_id is required')
  })

  it('keeps the workflow reusable rather than pinned to a historical Foundation proof', () => {
    const workflow = readFileSync('.github/workflows/content-factory-foundation-expert-review-package.yml', 'utf-8')
    for (const input of [
      'source_run_id:',
      'source_artifact_id:',
      'source_head_sha:',
      'source_foundation_fingerprint:',
      'review_run_id:',
      'review_artifact_id:',
      'reviewed_commit:',
      'foundation_fingerprint:',
      'external_source_challenge_json:',
    ]) {
      expect(workflow).toContain(input)
    }
    expect(workflow).toContain('foundation-expert-review-package-trigger.mjs')
    expect(workflow).not.toContain("SOURCE_RUN_ID: '34017938933'")
    expect(workflow).not.toContain('843eb478fb43585315b2ea38a69e1499abae10b1227e9bade54dc6117d272976')
    expect(workflow).not.toContain('09acd5d79698fa029c9b9b53138878c893940eed5c6b2534695aaba6c7779456')
  })
})
