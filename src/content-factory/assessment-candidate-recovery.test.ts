import { describe, expect, it } from 'vitest'
import type { WorkerExecution } from './intake-to-knowledge-model'
import type { ContentFactoryJob, WorkerRun } from './schema'
import {
  assessmentCandidateRef,
  assessmentCandidateRuns,
  assessmentSlotRef,
  assessmentValidationRejectedExecution,
  isRecoverableAssessmentCandidateFailure,
  nextAssessmentCandidateNumber,
} from './assessment-candidate-recovery'

const target = { familyId: 'paper1-mcq-10', componentId: 'paper-1' }

function run(candidateNumber: number, status: WorkerRun['status'], outputRefs: string[] = []): WorkerRun {
  return {
    id: `candidate-run-${candidateNumber}`,
    stage: 'generation',
    contextId: `candidate-context-${candidateNumber}`,
    contractVersion: '8',
    provider: 'test-provider',
    model: 'test-model',
    inputRefs: [assessmentSlotRef(target), assessmentCandidateRef(target, candidateNumber)],
    outputRefs,
    status,
    retryCount: 0,
  }
}

function job(workerRuns: WorkerRun[]): ContentFactoryJob {
  return { workerRuns } as ContentFactoryJob
}

describe('Assessment candidate durable recovery markers', () => {
  it('reconstructs candidate attempts from canonical worker-run state', () => {
    const first = run(1, 'failure')
    const second = run(2, 'success', ['artifact:accepted'])
    const state = job([first, second])

    expect(assessmentCandidateRuns(state, target)).toEqual([
      { run: first, candidateNumber: 1 },
      { run: second, candidateNumber: 2 },
    ])
    expect(nextAssessmentCandidateNumber(state, target)).toBe(3)
  })

  it('starts at candidate two after a durably recorded candidate-one rejection', () => {
    expect(nextAssessmentCandidateNumber(job([run(1, 'failure')]), target)).toBe(2)
  })

  it('ignores unrelated generation runs when reconstructing a slot', () => {
    const unrelated = {
      ...run(1, 'failure'),
      id: 'unrelated-run',
      inputRefs: ['assessment-slot:other-family:paper-1', 'assessment-slot:other-family:paper-1:candidate:1'],
    }
    expect(assessmentCandidateRuns(job([unrelated]), target)).toEqual([])
    expect(nextAssessmentCandidateNumber(job([unrelated]), target)).toBe(1)
  })

  it('classifies provider-contract and deterministic validation rejection as recoverable candidate scrap', () => {
    const provenance = { id: 'run-1', contextId: 'context-1', contractVersion: '8' }
    const providerFailure: WorkerExecution<unknown> = {
      status: 'failure',
      error: 'provider_contract_failure: invalid candidate',
      provenance,
    }
    const success: Extract<WorkerExecution<unknown>, { status: 'success' }> = {
      status: 'success',
      output: {},
      provenance,
    }
    const validationFailure = assessmentValidationRejectedExecution(success, new Error('mark allocation invalid'))

    expect(isRecoverableAssessmentCandidateFailure(providerFailure)).toBe(true)
    expect(isRecoverableAssessmentCandidateFailure(validationFailure)).toBe(true)
    expect(validationFailure.status).toBe('failure')
    if (validationFailure.status === 'failure') {
      expect(validationFailure.error).toContain('mark allocation invalid')
    }
  })

  it('does not classify infrastructure failure as candidate scrap', () => {
    const infrastructureFailure: WorkerExecution<unknown> = {
      status: 'infrastructure_failure',
      error: 'network unavailable',
      provenance: { id: 'run-infra', contextId: 'context-infra', contractVersion: '8' },
    }
    expect(isRecoverableAssessmentCandidateFailure(infrastructureFailure)).toBe(false)
  })
})
