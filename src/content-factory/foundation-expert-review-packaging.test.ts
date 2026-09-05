import { describe, expect, it } from 'vitest'
import { foundationExpertReviewPackageSchema } from './foundation-expert-review'
import {
  buildFoundationExpertReviewBundle,
  buildFoundationExpertReviewSubmissionTemplate,
  renderFoundationExpertReviewInstructions,
} from './foundation-expert-review-packaging'

const fingerprint = 'a'.repeat(64)
const reviewedCommit = 'b'.repeat(40)

function reviewPackage() {
  return foundationExpertReviewPackageSchema.parse({
    schemaVersion: 1,
    artifactType: 'foundation_expert_review_package',
    jobId: 'aqa-a-level-business-7132',
    candidateId: 'aqa-a-level-business-7132-candidate-1',
    reviewedCommit,
    foundationFingerprint: fingerprint,
    candidate: {
      schemaVersion: 1,
      candidateId: 'aqa-a-level-business-7132-candidate-1',
      courseIdentity: { subject: 'Business', qualification: 'A-level', awardingBody: 'AQA', specificationId: '7132' },
      cohortValidity: { status: 'current', notes: [] },
      sourceLicenceRegister: { ref: 'foundation/sources.json', fingerprint: 'sources-v1' },
      sourceRightsStatus: 'approved',
      boardAlignment: { ref: 'foundation/board.json', fingerprint: 'board-v1' },
      boardAlignmentStatus: 'verified',
      coverageModel: { ref: 'foundation/coverage.json', fingerprint: 'coverage-v1' },
      coverageCompleteness: 'complete',
      courseKnowledgeModel: { ref: 'foundation/course.json', fingerprint: 'course-v1' },
      courseTruthCompleteness: 'complete',
      assessmentBlueprint: { ref: 'foundation/exam.json', fingerprint: 'exam-v1' },
      examTruthCompleteness: 'complete',
      questionFamilies: [],
      deterministicAssurance: { status: 'pass', foundationFingerprint: fingerprint, evidenceRefs: ['deterministic.json'] },
      independentReview: { status: 'pass', foundationFingerprint: fingerprint, evidenceRefs: ['review.json'] },
      unresolvedBlockers: [],
      knownLimitations: [],
      provenance: { createdAt: '2026-09-05T09:00:00Z', producerVersion: 'test', sourceSetFingerprint: 'source-set' },
    },
    requiredReviewScopes: ['subject', 'assessment'],
    artifacts: [{ artifactKind: 'source_licence_register', artifactRef: 'foundation/sources.json', fingerprint: 'sources-v1' }],
    deterministicAssuranceEvidenceRefs: ['deterministic.json'],
    independentReviewEvidenceRefs: ['review.json'],
    knownLimitations: [],
    createdAt: '2026-09-05T09:00:00Z',
  })
}

describe('Foundation expert review packaging', () => {
  it('binds resolved artifact values to the exact package artifact identity', () => {
    const bundle = buildFoundationExpertReviewBundle({
      packagingCommit: reviewedCommit,
      reviewPackage: reviewPackage(),
      resolvedArtifacts: [{
        artifactKind: 'source_licence_register',
        artifactRef: 'foundation/sources.json',
        fingerprint: 'sources-v1',
        value: { sources: [] },
      }],
    })

    expect(bundle.resolvedArtifacts).toHaveLength(1)
    expect(bundle.reviewPackage.foundationFingerprint).toBe(fingerprint)
  })

  it('fails closed when resolved content does not match the packaged fingerprint', () => {
    expect(() => buildFoundationExpertReviewBundle({
      packagingCommit: reviewedCommit,
      reviewPackage: reviewPackage(),
      resolvedArtifacts: [{
        artifactKind: 'source_licence_register',
        artifactRef: 'foundation/sources.json',
        fingerprint: 'wrong-fingerprint',
        value: { sources: [] },
      }],
    })).toThrow(/artifact identity does not match package/)
  })

  it('produces a human handoff template without claiming a reviewer or approval', () => {
    const template = buildFoundationExpertReviewSubmissionTemplate(reviewPackage())
    expect(template.reviewers[0]?.reviewerId).toBe('<qualified-reviewer-id>')
    expect(template.evidenceRefs[0]).toBe('<completed-review-evidence-ref>')

    const instructions = renderFoundationExpertReviewInstructions(reviewPackage())
    expect(instructions).toContain('AI review is not a substitute')
    expect(instructions).toContain(fingerprint)
  })
})
