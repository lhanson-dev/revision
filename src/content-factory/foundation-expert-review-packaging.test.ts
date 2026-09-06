import { describe, expect, it } from 'vitest'
import { currentFoundationExpertReviewPackageSchema } from './foundation-expert-review'
import {
  buildFoundationExpertReviewBundle,
  buildFoundationExpertReviewSubmissionTemplate,
  renderFoundationExpertReviewInstructions,
} from './foundation-expert-review-packaging'

const fingerprint = 'a'.repeat(64)
const reviewedCommit = 'b'.repeat(40)

function reviewPackage() {
  return currentFoundationExpertReviewPackageSchema.parse({
    schemaVersion: 2,
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
      provenance: {
        createdAt: '2026-09-05T09:00:00Z',
        producerVersion: 'test',
        sourceSetFingerprint: 'source-set',
        generationContextIds: ['generation-context'],
        assuranceContextIds: ['independent-review-context'],
      },
    },
    requiredReviewScopes: ['subject', 'assessment'],
    artifacts: [{ artifactKind: 'source_licence_register', artifactRef: 'foundation/sources.json', fingerprint: 'sources-v1' }],
    deterministicAssuranceEvidenceRefs: ['deterministic.json'],
    independentReviewEvidenceRefs: ['review.json'],
    sourceUniverse: {
      profileId: 'aqa-7132-source-universe',
      requiredSourceIds: ['aqa-7132-specification', 'aqa-7131-7132-formulae-key-data'],
    },
    externalSourceChallenge: {
      schemaVersion: 1,
      artifactType: 'foundation_external_source_challenge_report',
      challengeId: 'external-challenge-1',
      jobId: 'aqa-a-level-business-7132',
      candidateId: 'aqa-a-level-business-7132-candidate-1',
      reviewedCommit,
      foundationFingerprint: fingerprint,
      sourceUniverseProfileId: 'aqa-7132-source-universe',
      challengedSourceIds: ['aqa-7132-specification', 'aqa-7131-7132-formulae-key-data'],
      reviewerContextId: 'external-source-challenge-context',
      excludedContextIds: ['generation-context', 'independent-review-context'],
      decision: 'pass',
      findings: [],
      evidenceRefs: ['external-challenge.json'],
      createdAt: '2026-09-05T09:00:00Z',
    },
    knownLimitations: [],
    createdAt: '2026-09-05T09:00:00Z',
  })
}

function coverageReconciliation() {
  return {
    schemaVersion: 1 as const,
    artifactType: 'foundation_coverage_reconciliation' as const,
    status: 'complete' as const,
    curriculumProfileId: 'test-curriculum-profile',
    examProfileId: 'test-exam-profile',
    sourceLicenceRegisterRef: 'foundation/sources.json',
    curriculum: [{
      obligationId: 'curriculum-obligation',
      officialReference: 'Test curriculum 1',
      curriculumPath: ['Curriculum', 'Requirement'],
      summary: 'Required curriculum scope.',
      requiredTerms: ['scope'],
      sourceRefs: ['source-1'],
      semanticItemIds: ['curriculum-obligation.s01'],
      courseTruthNodeIds: ['curriculum-obligation.k01'],
      resolvedArtifactRefs: ['foundation/sources.json'],
    }],
    exam: [{
      obligationId: 'exam-obligation',
      officialReference: 'Test exam 1',
      examPath: ['Exam', 'Requirement'],
      summary: 'Required exam scope.',
      requiredTerms: ['exam'],
      sourceRefs: ['source-1'],
      evidenceItemIds: ['exam-obligation.e01'],
      resolvedArtifactRefs: ['foundation/sources.json'],
    }],
  }
}

function resolvedArtifacts() {
  return [{
    artifactKind: 'source_licence_register' as const,
    artifactRef: 'foundation/sources.json',
    fingerprint: 'sources-v1',
    value: { sources: [] },
  }]
}

describe('Foundation expert review packaging', () => {
  it('binds resolved artifact values, coverage reconciliation and external challenge to the exact package identity', () => {
    const bundle = buildFoundationExpertReviewBundle({
      packagingCommit: reviewedCommit,
      reviewPackage: reviewPackage(),
      resolvedArtifacts: resolvedArtifacts(),
      coverageReconciliation: coverageReconciliation(),
    })

    expect(bundle.schemaVersion).toBe(2)
    expect(bundle.resolvedArtifacts).toHaveLength(1)
    expect(bundle.reviewPackage.foundationFingerprint).toBe(fingerprint)
    expect(bundle.reviewPackage.externalSourceChallenge.decision).toBe('pass')
    expect(bundle.coverageReconciliation.status).toBe('complete')
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
      coverageReconciliation: coverageReconciliation(),
    })).toThrow(/artifact identity does not match package/)
  })

  it('fails closed when reconciliation points outside the exact resolved bundle', () => {
    expect(() => buildFoundationExpertReviewBundle({
      packagingCommit: reviewedCommit,
      reviewPackage: reviewPackage(),
      resolvedArtifacts: resolvedArtifacts(),
      coverageReconciliation: {
        ...coverageReconciliation(),
        exam: [{
          ...coverageReconciliation().exam[0],
          resolvedArtifactRefs: ['foundation/missing-exam.json'],
        }],
      },
    })).toThrow(/Coverage reconciliation references artifact outside exact review bundle/)
  })

  it('produces a neutral human handoff template without claiming a reviewer, decision or approval', () => {
    const reviewPackageValue = reviewPackage()
    const bundle = buildFoundationExpertReviewBundle({
      packagingCommit: reviewedCommit,
      reviewPackage: reviewPackageValue,
      resolvedArtifacts: resolvedArtifacts(),
      coverageReconciliation: coverageReconciliation(),
    })
    const template = buildFoundationExpertReviewSubmissionTemplate(reviewPackageValue)
    expect(template.reviewers[0]?.reviewerId).toBe('<qualified-reviewer-id>')
    expect(template.evidenceRefs[0]).toBe('<completed-review-evidence-ref>')
    expect(template.decision).toBe('<pass-or-fail_hold>')

    const instructions = renderFoundationExpertReviewInstructions(bundle)
    expect(instructions).toContain('AI review is not a substitute')
    expect(instructions).toContain('coverage-reconciliation.json')
    expect(instructions).toContain('External-source challenge')
    expect(instructions).toContain('do not assume a pass')
    expect(instructions).toContain(fingerprint)
  })
})