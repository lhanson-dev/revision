import { describe, expect, it } from 'vitest'
import { qualifiedExpertReviewSubmissionSchema } from './expert-review-handoff'

const base = {
  schemaVersion: 1 as const,
  artifactType: 'qualified_expert_review_submission' as const,
  jobId: 'cf-business',
  reviewedCommit: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  packageRef: 'content-factory/cf-business/expert-review-package.json',
  artifactRefs: ['content-factory/cf-business/learning.json'],
  knownLimitations: [],
  reviewer: {
    reviewerId: 'expert-1',
    displayName: 'Qualified Reviewer',
    role: 'Subject and assessment reviewer',
    qualificationSummary: 'Experienced subject teacher and examiner.',
  },
  reviewedAt: '2026-08-26T00:40:00+01:00',
}

describe('qualified expert review decision semantics', () => {
  it('rejects a minor-only conditional pass because it would have no governed remediation path', () => {
    const result = qualifiedExpertReviewSubmissionSchema.safeParse({
      ...base,
      decision: 'conditional_pass',
      findings: [{
        id: 'minor-1',
        severity: 'minor',
        type: 'clarity',
        artifactRef: base.artifactRefs[0],
        finding: 'A sentence could be clearer.',
        requiredCorrection: 'Tighten the wording.',
        disposition: 'open',
      }],
    })

    expect(result.success).toBe(false)
  })

  it('accepts a conditional pass with an open material finding', () => {
    const result = qualifiedExpertReviewSubmissionSchema.safeParse({
      ...base,
      decision: 'conditional_pass',
      findings: [{
        id: 'material-1',
        severity: 'material',
        type: 'accuracy',
        artifactRef: base.artifactRefs[0],
        finding: 'A material educational correction is required.',
        requiredCorrection: 'Correct the affected artifact.',
        disposition: 'open',
      }],
    })

    expect(result.success).toBe(true)
  })
})