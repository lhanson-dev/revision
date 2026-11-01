import { test } from 'node:test'
import assert from 'node:assert/strict'
import { gitBlobSha, parseTrustedEvent, validateReview, ITEM_IDS, DIMENSIONS, REVIEW_MARKER } from './psychology-pr768-a2-review.mjs'

const SHA = '840ac310e293f1830bd29e09432c2f005fc16d5d'
const event = (body, user = 'lhanson-dev') => ({
  issue: { number: 768 },
  comment: { body, author_association: 'OWNER', user: { login: user } },
})

test('Founder-owned exact-head marker parses while other comments are rejected', () => {
  assert.equal(parseTrustedEvent(event(REVIEW_MARKER + '\nhead_sha: ' + SHA)), SHA)
  assert.throws(() => parseTrustedEvent(event(REVIEW_MARKER + '\nhead_sha: ' + SHA, 'another-user')))
  assert.throws(() => parseTrustedEvent(event(REVIEW_MARKER + '\nhead_sha: ' + 'z'.repeat(40))))
  assert.throws(() => parseTrustedEvent(event('Approve merge PR #768')))
  assert.throws(() => parseTrustedEvent({ ...event(REVIEW_MARKER + '\nhead_sha: ' + SHA), issue: { number: 698 } }))
})

test('Git blob content is independently hash-verifiable before review', () => {
  assert.equal(gitBlobSha('hello\n'), 'ce013625030ba8dba906f756967f9e9ca394464a')
})

const valid = () => ({
  schemaVersion: 1, reviewedItemIds: [...ITEM_IDS], decision: 'pass',
  dimensions: DIMENSIONS.map((dimension) => ({ dimension, status: 'pass', summary: 'Checked original data' })),
  findings: [], knownLimitations: ['Not qualified human sign-off'], summary: 'Independent review complete',
})

test('review requires all dimensions and all four scoped items', () => {
  assert.equal(validateReview(valid()).decision, 'pass')
  assert.throws(() => validateReview({ ...valid(), reviewedItemIds: [ITEM_IDS[0]] }))
  assert.throws(() => validateReview({ ...valid(), dimensions: valid().dimensions.slice(0, -1) }))
})

test('material issue cannot be concealed behind pass decision', () => {
  const r = valid()
  r.dimensions[0].status = 'material'
  assert.throws(() => validateReview(r))
  r.decision = 'fail_hold'
  assert.equal(validateReview(r).decision, 'fail_hold')
})

test('reviewer cannot cite unknown items or omit finding evidence', () => {
  const r = valid()
  r.decision = 'fail_hold'
  r.findings.push({
    itemId: 'unrelated-item', severity: 'material', issueType: 'invalid source scope',
    evidence: 'Outside reviewed pair', recommendedCorrection: 'Remove',
    affectedArtifact: 'Practice bank', resolutionStatus: 'open',
  })
  assert.throws(() => validateReview(r))
  r.findings[0].itemId = ITEM_IDS[0]
  assert.equal(validateReview(r).decision, 'fail_hold')
  r.findings[0].evidence = ''
  assert.throws(() => validateReview(r))
})

test('review must include each original Learn page exactly once', () => {
  assert.equal(ITEM_IDS.length, 4)
  assert.equal(new Set(ITEM_IDS).size, 5)
  assert.equal(DIMENSIONS.length, 8)
  assert.ok(ITEM_IDS.includes('PSY-01-04'))
  const duplicate = valid()
  duplicate.reviewedItemIds = [ITEM_IDS[0], ITEM_IDS[0], ITEM_IDS[2], ITEM_IDS[3]]
  assert.throws(() => validateReview(duplicate))
  const omitted = valid()
  omitted.dimensions.splice(2, 1)
  assert.throws(() => validateReview(omitted))
})

test('review trigger fails closed for wrong PR, non-owner, stale or malformed review marker', () => {
  assert.throws(() => parseTrustedEvent({ ...event(REVIEW_MARKER + '\nhead_sha: ' + SHA), issue: { number: 746 } }))
  assert.throws(() => parseTrustedEvent(event(REVIEW_MARKER + '\nhead_sha: ' + SHA + '\nApprove merge PR #768')))
  assert.throws(() => parseTrustedEvent({ ...event(REVIEW_MARKER + '\nhead_sha: ' + SHA), comment: {
    ...event(REVIEW_MARKER + '\nhead_sha: ' + SHA).comment, author_association: 'CONTRIBUTOR'
  } }))
})
