import { describe, expect, it } from 'vitest'
import { foundationCandidateSchema, foundationJobSchema } from './foundation-schema'
import { computeFoundationFingerprint } from './foundation-lifecycle'
import {
  bindFoundationGenerationContextProvenance,
  foundationGenerationContextIdsFromWorkerRuns,
} from './foundation-independent-review-context'

const now = '2026-09-03T23:50:00+01:00'

function assuringJob() {
  const candidate = foundationCandidateSchema.parse({
    schemaVersion: 1,
    candidateId: 'foundation-context-candidate',
    courseIdentity: {
      subject: 'Business',
      qualification: 'A-level',
      awardingBody: 'AQA',
      specificationId: '7132',
    },
    cohortValidity: { status: 'current', firstAssessment: '2027', notes: [] },
    sourceLicenceRegister: { ref: 'source.json', fingerprint: 'source-fingerprint' },
    sourceRightsStatus: 'approved',
    boardAlignment: { ref: 'board.json', fingerprint: 'board-fingerprint' },
    boardAlignmentStatus: 'verified',
    coverageModel: { ref: 'coverage.json', fingerprint: 'coverage-fingerprint' },
    coverageCompleteness: 'complete',
    courseKnowledgeModel: { ref: 'course.json', fingerprint: 'course-fingerprint' },
    courseTruthCompleteness: 'complete',
    assessmentBlueprint: { ref: 'exam.json', fingerprint: 'exam-fingerprint' },
    examTruthCompleteness: 'complete',
    questionFamilies: [{ ref: 'family.json', fingerprint: 'family-fingerprint' }],
    deterministicAssurance: { status: 'pending', evidenceRefs: [] },
    independentReview: { status: 'pending', evidenceRefs: [] },
    unresolvedBlockers: [],
    knownLimitations: [],
    provenance: {
      createdAt: now,
      producerVersion: 'context-test-v1',
      sourceSetFingerprint: 'source-fingerprint',
      generationContextIds: [],
      assuranceContextIds: [],
    },
  })
  return foundationJobSchema.parse({
    schemaVersion: 1,
    jobId: 'foundation-context-job',
    state: 'assuring',
    candidate,
    blockers: [],
    createdAt: now,
    updatedAt: now,
  })
}

describe('Foundation independent-review context provenance', () => {
  it('extracts and de-duplicates compilation contexts', () => {
    const contexts = foundationGenerationContextIdsFromWorkerRuns([
      {
        stage: 'course_truth',
        provenance: { id: 'course-run', contextId: 'generation-course-context', contractVersion: '1' },
        inputRefs: [],
        outputRefs: [],
      },
      {
        stage: 'exam_truth',
        provenance: { id: 'exam-run', contextId: 'generation-exam-context', contractVersion: '1' },
        inputRefs: [],
        outputRefs: [],
      },
      {
        stage: 'question_families',
        provenance: { id: 'family-run', contextId: 'generation-course-context', contractVersion: '1' },
        inputRefs: [],
        outputRefs: [],
      },
    ])

    expect(contexts).toEqual(['generation-course-context', 'generation-exam-context'])
  })

  it('persists generation contexts without changing material Foundation identity', async () => {
    const job = assuringJob()
    const before = await computeFoundationFingerprint(job.candidate!)

    const bound = await bindFoundationGenerationContextProvenance({
      job,
      generationContextIds: ['generation-course-context', 'generation-exam-context'],
      now,
    })
    const after = await computeFoundationFingerprint(bound.candidate!)

    expect(after).toBe(before)
    expect(bound.candidate?.provenance.generationContextIds).toEqual([
      'generation-course-context',
      'generation-exam-context',
    ])
  })

  it('fails closed when generation context evidence is absent', async () => {
    await expect(bindFoundationGenerationContextProvenance({
      job: assuringJob(),
      generationContextIds: [],
      now,
    })).rejects.toThrow('at least one retained generation context')
  })
})
