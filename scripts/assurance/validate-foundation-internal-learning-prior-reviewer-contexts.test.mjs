import { describe, expect, it } from 'vitest'
import { validateFoundationInternalLearningPriorReviewerContexts } from './validate-foundation-internal-learning-prior-reviewer-contexts.mjs'

function proof(priorReviewerContextIds) {
  return { remediationRecord: { priorReviewerContextIds } }
}

describe('prior reviewer context validation', () => {
  it('accepts a non-empty unique prior reviewer context list', () => {
    expect(validateFoundationInternalLearningPriorReviewerContexts(proof(['reviewer-1', 'reviewer-2']))).toEqual([
      'reviewer-1',
      'reviewer-2',
    ])
  })

  it('rejects missing, empty or non-array prior reviewer contexts', () => {
    expect(() => validateFoundationInternalLearningPriorReviewerContexts({})).toThrow('non-empty array')
    expect(() => validateFoundationInternalLearningPriorReviewerContexts(proof([]))).toThrow('non-empty array')
    expect(() => validateFoundationInternalLearningPriorReviewerContexts(proof('reviewer-1'))).toThrow('non-empty array')
  })

  it('rejects blank or non-string reviewer context ids', () => {
    expect(() => validateFoundationInternalLearningPriorReviewerContexts(proof(['reviewer-1', ' ']))).toThrow('non-empty strings')
    expect(() => validateFoundationInternalLearningPriorReviewerContexts(proof(['reviewer-1', 2]))).toThrow('non-empty strings')
  })

  it('rejects duplicate reviewer context ids', () => {
    expect(() => validateFoundationInternalLearningPriorReviewerContexts(proof(['reviewer-1', 'reviewer-1']))).toThrow('must be unique')
  })
})
