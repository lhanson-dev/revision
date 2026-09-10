import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  parseFoundationExpertReviewPackageIssueComment,
  resolveFoundationExpertReviewPackageSource,
  validateFoundationExpertReviewPackageSource,
} from './foundation-expert-review-package-trigger.mjs'

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

const marker = 'revision-run-foundation-expert-review-package:v1'
const challengeCommentId = '5614272018'
const validIssueComment = [
  marker,
  `source_run_id: ${validSource.source_run_id}`,
  `source_artifact_id: ${validSource.source_artifact_id}`,
  `source_head_sha: ${validSource.source_head_sha}`,
  `source_foundation_fingerprint: ${validSource.source_foundation_fingerprint}`,
  `review_run_id: ${validSource.review_run_id}`,
  `review_artifact_id: ${validSource.review_artifact_id}`,
  `reviewed_commit: ${validSource.reviewed_commit}`,
  `foundation_fingerprint: ${validSource.foundation_fingerprint}`,
  `external_source_challenge_comment_id: ${challengeCommentId}`,
].join('\n')

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

  it('parses a founder-owned issue-comment trigger without weakening exact identity binding', () => {
    expect(parseFoundationExpertReviewPackageIssueComment(validIssueComment, marker)).toEqual({
      ...validSource,
      external_source_challenge_comment_id: challengeCommentId,
    })
  })

  it('resolves the issue-comment path separately from the retained workflow-dispatch path', () => {
    expect(resolveFoundationExpertReviewPackageSource({
      eventName: 'issue_comment',
      issueCommentBody: validIssueComment,
      expectedMarker: marker,
    })).toEqual({
      ...validSource,
      external_source_challenge_comment_id: challengeCommentId,
    })

    expect(resolveFoundationExpertReviewPackageSource({
      eventName: 'workflow_dispatch',
      expectedMarker: marker,
      workflowInputs: validSource,
    })).toEqual({
      ...validSource,
      external_source_challenge_comment_id: null,
    })
  })

  it('fails closed on malformed, incomplete or expanded issue-comment triggers', () => {
    expect(() => parseFoundationExpertReviewPackageIssueComment(validIssueComment.replace(marker, `${marker}-wrong`), marker))
      .toThrow(`Issue-comment trigger marker must be exactly ${marker}`)
    expect(() => parseFoundationExpertReviewPackageIssueComment(
      validIssueComment.replace(`external_source_challenge_comment_id: ${challengeCommentId}`, ''),
      marker,
    )).toThrow('Missing trigger field: external_source_challenge_comment_id')
    expect(() => parseFoundationExpertReviewPackageIssueComment(`${validIssueComment}\nextra_field: value`, marker))
      .toThrow('Unknown trigger field: extra_field')
    expect(() => parseFoundationExpertReviewPackageIssueComment(
      validIssueComment.replace(challengeCommentId, 'not-a-comment-id'),
      marker,
    )).toThrow('external_source_challenge_comment_id must be a positive decimal integer')
  })

  it('keeps the workflow reusable while allowing the founder-owned governed issue trigger', () => {
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
    expect(workflow).toContain('issue_comment:')
    expect(workflow).toContain("github.event.issue.number == 289")
    expect(workflow).toContain("github.event.comment.user.login == 'lhanson-dev'")
    expect(workflow).toContain("github.event.comment.author_association == 'OWNER'")
    expect(workflow).toContain(marker)
    expect(workflow).toContain('EXTERNAL_SOURCE_CHALLENGE_COMMENT_ID')
    expect(workflow).toContain('foundation-expert-review-package-trigger.mjs')
    expect(workflow).not.toContain("SOURCE_RUN_ID: '34017938933'")
    expect(workflow).not.toContain('843eb478fb43585315b2ea38a69e1499abae10b1227e9bade54dc6117d272976')
    expect(workflow).not.toContain('09acd5d79698fa029c9b9b53138878c893940eed5c6b2534695aaba6c7779456')
  })
})
