import { describe, expect, it } from 'vitest'
import { contentFactoryJobSchema } from './schema'
import {
  isRecoverableMarkingPackCandidateFailure,
  markingPackCandidateRef,
  markingPackCandidateRuns,
  markingPackSlotRef,
  markingPackValidationRejectedExecution,
  MAX_MARKING_PACK_CANDIDATES,
  nextMarkingPackCandidateNumber,
} from './marking-pack-candidate-recovery'

const target = { assessmentItemId: 'question-1' }
const provenance = {
  id: 'run-1',
  contextId: 'context-1',
  contractVersion: '5',
  provider: 'test-provider',
  model: 'test-model',
}

function jobWithRuns(workerRuns: unknown[]) {
  return contentFactoryJobSchema.parse({
    schemaVersion: 2,
    jobId: 'cf-test',
    officialUrls: ['https://example.com/course'],
    founderInstruction: 'test',
    state: 'generating',
    courseIdentity: {
      subject: 'Test',
      qualification: 'Test qualification',
      awardingBody: 'Test board',
      specificationId: 'test-1',
    },
    cohortValidity: { status: 'current', notes: [] },
    components: [],
    unresolvedChoices: [],
    sourceLicenceRegisterRef: 'content-factory/cf-test/source-licence-register.json',
    sourceRightsStatus: 'approved',
    coverageCompleteness: 'pending',
    workUnits: [],
    workerRuns,
    blockers: [],
    createdAt: '2026-08-31T22:00:00+01:00',
    updatedAt: '2026-08-31T22:00:00+01:00',
  })
}

describe('durable Marking Pack candidate recovery', () => {
  it('uses deterministic slot and candidate refs with a two-candidate ceiling', () => {
    expect(MAX_MARKING_PACK_CANDIDATES).toBe(2)
    expect(markingPackSlotRef(target)).toBe('marking-pack-slot:question-1')
    expect(markingPackCandidateRef(target, 2)).toBe('marking-pack-slot:question-1:candidate:2')
  })

  it('reconstructs the next candidate from canonical Marking Pack worker runs only', () => {
    const job = jobWithRuns([
      {
        id: 'unrelated', stage: 'generation', contextId: 'ctx-unrelated', contractVersion: '1', provider: 'test-provider', model: 'test-model',
        inputRefs: ['marking-pack-slot:question-1', 'marking-pack-slot:question-1:candidate:9'], outputRefs: [], status: 'failure', retryCount: 0,
      },
      {
        id: 'candidate-1', stage: 'marking_pack', contextId: 'ctx-1', contractVersion: '5', provider: 'test-provider', model: 'test-model',
        inputRefs: [markingPackSlotRef(target), markingPackCandidateRef(target, 1)], outputRefs: [], status: 'failure', retryCount: 0,
      },
    ])

    expect(markingPackCandidateRuns(job, target).map((entry) => entry.candidateNumber)).toEqual([1])
    expect(nextMarkingPackCandidateNumber(job, target)).toBe(2)
  })

  it('treats provider-contract and deterministic factory validation rejection as recoverable candidate scrap', () => {
    expect(isRecoverableMarkingPackCandidateFailure({
      status: 'failure',
      error: 'provider_contract_failure: synthetic defect',
      provenance,
    })).toBe(true)

    const rejected = markingPackValidationRejectedExecution({ status: 'success', output: {}, provenance }, new Error('bad AO total'))
    expect(rejected.status).toBe('failure')
    if (rejected.status !== 'failure') throw new Error('expected failure')
    expect(rejected.error).toContain('marking_pack_candidate_validation_rejected: bad AO total')
    expect(isRecoverableMarkingPackCandidateFailure(rejected)).toBe(true)
  })

  it('does not treat infrastructure failure as ordinary candidate rejection', () => {
    expect(isRecoverableMarkingPackCandidateFailure({
      status: 'infrastructure_failure',
      error: 'provider unavailable',
      provenance,
    })).toBe(false)
  })
})
