import { describe, expect, it } from 'vitest'
import { foundationCandidateSchema, type FoundationCandidate } from './foundation-schema'
import { computeFoundationFingerprint } from './foundation-lifecycle'

function candidate(): FoundationCandidate {
  return foundationCandidateSchema.parse({
    schemaVersion: 1,
    candidateId: 'business-7132-candidate-1',
    courseIdentity: {
      subject: 'Business',
      qualification: 'A-level',
      awardingBody: 'AQA',
      specificationId: '7132',
    },
    cohortValidity: {
      status: 'current',
      firstAssessment: '2027',
      notes: [],
    },
    sourceLicenceRegister: { ref: 'foundation/run-a/source-register.json', fingerprint: 'source-fingerprint' },
    sourceRightsStatus: 'approved',
    boardAlignment: { ref: 'foundation/run-a/board-alignment.json', fingerprint: 'board-fingerprint' },
    boardAlignmentStatus: 'verified',
    coverageModel: { ref: 'foundation/run-a/coverage.json', fingerprint: 'coverage-fingerprint' },
    coverageCompleteness: 'complete',
    courseKnowledgeModel: { ref: 'foundation/run-a/course-truth.json', fingerprint: 'course-fingerprint' },
    courseTruthCompleteness: 'complete',
    assessmentBlueprint: { ref: 'foundation/run-a/exam-truth.json', fingerprint: 'exam-fingerprint' },
    examTruthCompleteness: 'complete',
    questionFamilies: [
      { ref: 'foundation/run-a/family-b.json', fingerprint: 'family-b-fingerprint' },
      { ref: 'foundation/run-a/family-a.json', fingerprint: 'family-a-fingerprint' },
    ],
    deterministicAssurance: { status: 'pending', evidenceRefs: [] },
    independentReview: { status: 'pending', evidenceRefs: [] },
    unresolvedBlockers: [],
    knownLimitations: [],
    provenance: {
      createdAt: '2026-09-03T18:00:00+01:00',
      producerVersion: 'foundation-factory-v2',
      sourceSetFingerprint: 'source-set-fingerprint',
    },
  })
}

describe('Foundation fingerprint identity', () => {
  it('does not change when only immutable artifact storage refs change', async () => {
    const original = candidate()
    const relocated = foundationCandidateSchema.parse({
      ...original,
      sourceLicenceRegister: { ...original.sourceLicenceRegister, ref: 'archive/run-b/source-register.json' },
      boardAlignment: { ...original.boardAlignment, ref: 'archive/run-b/board-alignment.json' },
      coverageModel: { ...original.coverageModel, ref: 'archive/run-b/coverage.json' },
      courseKnowledgeModel: { ...original.courseKnowledgeModel, ref: 'archive/run-b/course-truth.json' },
      assessmentBlueprint: { ...original.assessmentBlueprint, ref: 'archive/run-b/exam-truth.json' },
      questionFamilies: [
        { ...original.questionFamilies[1], ref: 'archive/run-b/family-a.json' },
        { ...original.questionFamilies[0], ref: 'archive/run-b/family-b.json' },
      ],
    })

    await expect(computeFoundationFingerprint(relocated)).resolves.toBe(
      await computeFoundationFingerprint(original),
    )
  })

  it('changes when a material dependency fingerprint changes', async () => {
    const original = candidate()
    const changed = foundationCandidateSchema.parse({
      ...original,
      courseKnowledgeModel: {
        ...original.courseKnowledgeModel,
        fingerprint: 'changed-course-fingerprint',
      },
    })

    expect(await computeFoundationFingerprint(changed)).not.toBe(
      await computeFoundationFingerprint(original),
    )
  })
})
