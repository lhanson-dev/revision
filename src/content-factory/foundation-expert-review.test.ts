import { describe, expect, it } from 'vitest'
import { foundationCandidateSchema, type FoundationCandidate } from './foundation-schema'
import { computeFoundationFingerprint } from './foundation-lifecycle'
import {
  buildFoundationExpertReviewPackage,
  foundationExpertReviewSubmissionSchema,
  validateFoundationExpertReviewSubmission,
} from './foundation-expert-review'

const reviewedCommit = 'a'.repeat(40)
const now = '2026-09-05T10:00:00+01:00'
const jobId = 'aqa-a-level-business-7132'
const sourceUniverse = {
  profileId: 'aqa-7132-2027-source-universe',
  requiredSourceIds: ['aqa-7132-specification', 'aqa-7131-7132-formulae-key-data'],
}

function artifact(ref: string, fingerprint: string) {
  return { ref, fingerprint }
}

async function assuredCandidate(overrides: Partial<FoundationCandidate> = {}) {
  const base = foundationCandidateSchema.parse({
    schemaVersion: 1,
    candidateId: 'aqa-a-level-business-7132-candidate-1',
    courseIdentity: {
      subject: 'Business',
      qualification: 'A-level',
      awardingBody: 'AQA',
      specificationId: '7132',
    },
    cohortValidity: {
      status: 'outgoing',
      lastAssessment: '2027',
      notes: [],
    },
    sourceLicenceRegister: artifact('foundation/source-rights.json', 'source-rights-v1'),
    sourceRightsStatus: 'approved',
    boardAlignment: artifact('foundation/board-alignment.json', 'board-v1'),
    boardAlignmentStatus: 'verified',
    coverageModel: artifact('foundation/coverage.json', 'coverage-v1'),
    coverageCompleteness: 'complete',
    courseKnowledgeModel: artifact('foundation/course-truth.json', 'course-truth-v1'),
    courseTruthCompleteness: 'complete',
    assessmentBlueprint: artifact('foundation/exam-truth.json', 'exam-truth-v1'),
    examTruthCompleteness: 'complete',
    questionFamilies: [
      artifact('foundation/question-family-essay.json', 'essay-v1'),
      artifact('foundation/question-family-data-response.json', 'data-response-v1'),
    ],
    deterministicAssurance: { status: 'pending', evidenceRefs: [] },
    independentReview: { status: 'pending', evidenceRefs: [] },
    unresolvedBlockers: [],
    knownLimitations: [],
    provenance: {
      createdAt: now,
      producerVersion: 'foundation-live-adapter-v3',
      sourceSetFingerprint: 'source-set-v1',
      implementationHeadSha: reviewedCommit,
      generationContextIds: ['generation-context-1'],
      assuranceContextIds: ['independent-review-context-1'],
    },
    ...overrides,
  })
  const foundationFingerprint = await computeFoundationFingerprint(base)
  return foundationCandidateSchema.parse({
    ...base,
    deterministicAssurance: {
      status: 'pass',
      foundationFingerprint,
      evidenceRefs: ['foundation/deterministic-assurance.json'],
    },
    independentReview: {
      status: 'pass',
      foundationFingerprint,
      evidenceRefs: ['foundation/independent-review.json'],
    },
  })
}

async function passingChallenge(candidate: FoundationCandidate, overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: 1 as const,
    artifactType: 'foundation_external_source_challenge_report' as const,
    challengeId: 'aqa-7132-external-source-challenge-1',
    jobId,
    candidateId: candidate.candidateId,
    reviewedCommit,
    foundationFingerprint: await computeFoundationFingerprint(candidate),
    sourceUniverseProfileId: sourceUniverse.profileId,
    challengedSourceIds: sourceUniverse.requiredSourceIds,
    reviewerContextId: 'external-source-challenge-context-1',
    excludedContextIds: [...candidate.provenance.generationContextIds, ...candidate.provenance.assuranceContextIds],
    decision: 'pass' as const,
    findings: [],
    evidenceRefs: ['foundation/external-source-challenge.json'],
    createdAt: now,
    ...overrides,
  }
}

async function buildPackage(candidate: FoundationCandidate, challengeOverrides: Record<string, unknown> = {}) {
  return buildFoundationExpertReviewPackage({
    jobId,
    candidate,
    reviewedCommit,
    createdAt: now,
    sourceUniverse,
    externalSourceChallenge: await passingChallenge(candidate, challengeOverrides),
  })
}

function passingSubmission(reviewPackage: Awaited<ReturnType<typeof buildFoundationExpertReviewPackage>>) {
  return {
    schemaVersion: 1 as const,
    artifactType: 'foundation_expert_review_submission' as const,
    jobId: reviewPackage.jobId,
    candidateId: reviewPackage.candidateId,
    reviewedCommit: reviewPackage.reviewedCommit,
    foundationFingerprint: reviewPackage.foundationFingerprint,
    reviewers: [
      {
        reviewerId: 'qualified-business-subject-reviewer',
        qualificationScopes: ['subject' as const],
        qualificationEvidenceRefs: ['expert-evidence/subject-reviewer.json'],
      },
      {
        reviewerId: 'qualified-business-assessment-reviewer',
        qualificationScopes: ['assessment' as const],
        qualificationEvidenceRefs: ['expert-evidence/assessment-reviewer.json'],
      },
    ],
    decision: 'pass' as const,
    findings: [],
    evidenceRefs: ['expert-evidence/review-submission.json'],
    knownLimitations: [],
    reviewedAt: now,
  }
}

describe('Foundation qualified expert review contract', () => {
  it('packages only an exact Foundation that passed deterministic, independent and external-source assurance', async () => {
    const candidate = await assuredCandidate()
    const reviewPackage = await buildPackage(candidate)

    expect(reviewPackage.schemaVersion).toBe(2)
    expect(reviewPackage.foundationFingerprint).toBe(candidate.deterministicAssurance.foundationFingerprint)
    expect(reviewPackage.externalSourceChallenge.decision).toBe('pass')
    expect(reviewPackage.sourceUniverse).toEqual(sourceUniverse)
    expect(reviewPackage.requiredReviewScopes).toEqual(['subject', 'assessment'])
    expect(reviewPackage.artifacts.map((artifactEntry) => artifactEntry.artifactKind)).toEqual([
      'source_licence_register',
      'board_alignment',
      'foundation_coverage_model',
      'course_knowledge_model',
      'assessment_blueprint',
      'question_family',
      'question_family',
    ])
  })

  it('fails closed when independent review has not passed', async () => {
    const candidate = await assuredCandidate()
    const pending = foundationCandidateSchema.parse({
      ...candidate,
      independentReview: { status: 'pending', evidenceRefs: [] },
    })
    await expect(buildPackage(pending)).rejects.toThrow(/passing independent Foundation review/)
  })

  it('fails closed when assurance evidence is stale for the packaged Foundation fingerprint', async () => {
    const candidate = await assuredCandidate()
    const stale = foundationCandidateSchema.parse({
      ...candidate,
      courseKnowledgeModel: artifact('foundation/course-truth.json', 'course-truth-v2'),
    })
    await expect(buildPackage(stale)).rejects.toThrow(/stale deterministic assurance evidence/)
  })

  it('fails closed when the external-source challenge reports a material finding', async () => {
    const candidate = await assuredCandidate()
    await expect(buildPackage(candidate, {
      decision: 'fail_hold',
      findings: [{
        id: 'missing-official-formula-source',
        severity: 'material',
        issueType: 'source_universe',
        sourceRefs: ['aqa-7131-7132-formulae-key-data'],
        finding: 'A material official quantitative source is not reconciled.',
        requiredCorrection: 'Reopen source discovery and rebuild the Foundation.',
      }],
    })).rejects.toThrow(/passing external-source challenge/)
  })

  it('fails closed when the external-source challenge is stale for the Foundation fingerprint', async () => {
    const candidate = await assuredCandidate()
    await expect(buildPackage(candidate, {
      foundationFingerprint: 'b'.repeat(64),
    })).rejects.toThrow(/stale for the exact Foundation fingerprint/)
  })

  it('fails closed when the external-source challenge omits a required source', async () => {
    const candidate = await assuredCandidate()
    await expect(buildPackage(candidate, {
      challengedSourceIds: ['aqa-7132-specification'],
    })).rejects.toThrow(/omitted required source aqa-7131-7132-formulae-key-data/)
  })

  it('fails closed when the external-source challenge reuses an earlier assurance context', async () => {
    const candidate = await assuredCandidate()
    await expect(buildPackage(candidate, {
      reviewerContextId: 'independent-review-context-1',
    })).rejects.toThrow(/fresh context|reused/)
  })

  it('accepts qualified human coverage split across subject and assessment reviewers', async () => {
    const reviewPackage = await buildPackage(await assuredCandidate())
    const submission = passingSubmission(reviewPackage)

    expect(validateFoundationExpertReviewSubmission(reviewPackage, submission)).toEqual(
      foundationExpertReviewSubmissionSchema.parse(submission),
    )
  })

  it('rejects a submission without required assessment qualification coverage', async () => {
    const reviewPackage = await buildPackage(await assuredCandidate())
    const submission = passingSubmission(reviewPackage)
    submission.reviewers = [submission.reviewers[0]]

    expect(() => validateFoundationExpertReviewSubmission(reviewPackage, submission)).toThrow(
      /missing required assessment qualification coverage/,
    )
  })

  it('rejects a passing decision when a qualified reviewer reports a material finding', async () => {
    const reviewPackage = await buildPackage(await assuredCandidate())
    const submission = {
      ...passingSubmission(reviewPackage),
      findings: [{
        id: 'exam-truth-demand-gap',
        severity: 'material' as const,
        issueType: 'assessment_authenticity',
        artifactKind: 'assessment_blueprint' as const,
        artifactRef: reviewPackage.candidate.assessmentBlueprint.ref,
        evidence: ['Qualified reviewer identified a material authenticity issue.'],
        finding: 'The assessment contract would teach an incorrect exam behaviour.',
        requiredCorrection: 'Correct the affected Exam Truth contract and rerun assurance.',
      }],
    }

    expect(() => foundationExpertReviewSubmissionSchema.parse(submission)).toThrow(
      /Blocking\/material qualified expert findings require fail_hold/,
    )
  })

  it('rejects findings against artifacts outside the exact packaged Foundation', async () => {
    const reviewPackage = await buildPackage(await assuredCandidate())
    const submission = {
      ...passingSubmission(reviewPackage),
      decision: 'fail_hold' as const,
      findings: [{
        id: 'unknown-artifact',
        severity: 'material' as const,
        issueType: 'course_truth',
        artifactKind: 'course_knowledge_model' as const,
        artifactRef: 'foundation/not-in-package.json',
        evidence: ['Reviewer evidence.'],
        finding: 'Material issue.',
        requiredCorrection: 'Correct the exact affected artifact.',
      }],
    }

    expect(() => validateFoundationExpertReviewSubmission(reviewPackage, submission)).toThrow(
      /artifact outside the exact review package/,
    )
  })
})