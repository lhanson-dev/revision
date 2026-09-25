import assert from 'node:assert/strict'
import test from 'node:test'
import { validateFoundationInternalLearningPriorReviewerContexts } from './validate-foundation-internal-learning-prior-reviewer-contexts.mjs'

function proof(priorReviewerContextIds) {
  return { remediationRecord: { priorReviewerContextIds } }
}

test('accepts a non-empty unique prior reviewer context list', () => {
  assert.deepEqual(
    validateFoundationInternalLearningPriorReviewerContexts(proof(['reviewer-1', 'reviewer-2'])),
    ['reviewer-1', 'reviewer-2'],
  )
})

test('rejects missing, empty or non-array prior reviewer contexts', () => {
  assert.throws(() => validateFoundationInternalLearningPriorReviewerContexts({}), /non-empty array/)
  assert.throws(() => validateFoundationInternalLearningPriorReviewerContexts(proof([])), /non-empty array/)
  assert.throws(() => validateFoundationInternalLearningPriorReviewerContexts(proof('reviewer-1')), /non-empty array/)
})

test('rejects blank or non-string reviewer context ids', () => {
  assert.throws(() => validateFoundationInternalLearningPriorReviewerContexts(proof(['reviewer-1', ' '])), /non-empty strings/)
  assert.throws(() => validateFoundationInternalLearningPriorReviewerContexts(proof(['reviewer-1', 2])), /non-empty strings/)
})

test('rejects duplicate reviewer context ids', () => {
  assert.throws(() => validateFoundationInternalLearningPriorReviewerContexts(proof(['reviewer-1', 'reviewer-1'])), /must be unique/)
})
