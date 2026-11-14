import { test } from 'node:test'
import assert from 'node:assert/strict'
import { gitBlobSha, parseTrustedEvent, validateReview, ITEM_IDS, DIMENSIONS, REVIEW_MARKER } from './psychology-pr843-a2-review.mjs'

const SHA = 'c52e20aeb64b7103f45820e70b0b7822a7eeceb2'
const marker = REVIEW_MARKER + '\nhead_sha: ' + SHA
const event = (body, user = 'lhanson-dev', number = 843, association = 'OWNER') => ({
  issue: { number }, comment: { body, user: { login: user }, author_association: association },
})
const valid = () => ({
  schemaVersion: 1, reviewedItemIds: [...ITEM_IDS], decision: 'pass',
  dimensions: DIMENSIONS.map(dimension => ({ dimension, status: 'pass', summary: 'Independently checked original sign counts and bounded evidence.' })),
  findings: [], knownLimitations: ['No qualified human examiner or hosted learner proof'], summary: 'Exact single skill reviewed',
})

test('Founder-only PR843 marker requires complete exact-head shape', () => {
  assert.equal(parseTrustedEvent(event(marker)), SHA)
  assert.throws(() => parseTrustedEvent(event(marker, 'outside-author')))
  assert.throws(() => parseTrustedEvent(event(marker, 'lhanson-dev', 746)))
  assert.throws(() => parseTrustedEvent(event(marker, 'lhanson-dev', 843, 'CONTRIBUTOR')))
  assert.throws(() => parseTrustedEvent(event(REVIEW_MARKER + '\nhead_sha: ' + 'z'.repeat(40))))
  assert.throws(() => parseTrustedEvent(event(marker + '\nextra-command')))
  assert.throws(() => parseTrustedEvent(event('Approve merge PR #843')))
})

test('unmerged source blobs can be independently hash validated', () => {
  assert.equal(gitBlobSha('hello\n'), 'ce013625030ba8dba906f756967f9e9ca394464a')
})

test('all eight named source and learner-safety review dimensions are mandatory', () => {
  assert.equal(ITEM_IDS.length, 1)
  assert.equal(ITEM_IDS[0], 'PSY-SRC-4233-IT03')
  assert.equal(DIMENSIONS.length, 8)
  assert.equal(new Set(DIMENSIONS).size, 8)
  assert.equal(validateReview(valid()).decision, 'pass')
  assert.throws(() => validateReview({ ...valid(), reviewedItemIds: ['PSY-07-32'] }))
  assert.throws(() => validateReview({ ...valid(), reviewedItemIds: [] }))
  assert.throws(() => validateReview({ ...valid(), reviewedItemIds: [ITEM_IDS[0], ITEM_IDS[0]] }))
  assert.throws(() => validateReview({ ...valid(), dimensions: valid().dimensions.slice(0, -1) }))
})

test('a material or blocking educational flaw fails closed even if provider says pass', () => {
  const report = valid()
  report.dimensions[1].status = 'material'
  assert.throws(() => validateReview(report))
  report.decision = 'fail_hold'
  assert.equal(validateReview(report).decision, 'fail_hold')
  report.dimensions[1].status = 'pass'
  report.findings.push({
    itemId: ITEM_IDS[0], severity: 'blocking', issueType: 'wrong ties or answer',
    evidence: 'Independent count contradicts a displayed sign',
    recommendedCorrection: 'Correct the signs and S with fresh reviewed source',
    affectedArtifact: 'Psychology unscored worked example', resolutionStatus: 'open',
  })
  assert.equal(validateReview(report).decision, 'fail_hold')
  report.decision = 'pass'
  assert.throws(() => validateReview(report))
  report.decision = 'fail_hold'
  report.findings[0].evidence = ''
  assert.throws(() => validateReview(report))
  report.findings[0].evidence = 'Genuine evidence'
  report.findings[0].itemId = 'PSY-07-32'
  assert.throws(() => validateReview(report))
})

test('minor concerns cannot be silently marked resolved or omitted', () => {
  const report = valid()
  report.findings.push({
    itemId: ITEM_IDS[0], severity: 'minor', issueType: 'wording',
    evidence: 'An unscored reveal suggests a mandatory entered attempt',
    recommendedCorrection: 'Make copy accurate', affectedArtifact: 'Guide', resolutionStatus: 'open',
  })
  assert.equal(validateReview(report).decision, 'pass')
  report.findings[0].resolutionStatus = 'resolved'
  assert.throws(() => validateReview(report))
})
