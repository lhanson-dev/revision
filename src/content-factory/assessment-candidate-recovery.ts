import type { WorkerExecution } from './intake-to-knowledge-model'
import type { ContentFactoryJob, WorkerRun } from './schema'

export const MAX_ASSESSMENT_ITEM_CANDIDATES = 2

export type AssessmentRecoveryTarget = {
  familyId: string
  componentId: string
}

export function assessmentSlotRef(target: AssessmentRecoveryTarget) {
  return `assessment-slot:${target.familyId}:${target.componentId}`
}

export function assessmentCandidateRef(target: AssessmentRecoveryTarget, candidateNumber: number) {
  return `${assessmentSlotRef(target)}:candidate:${candidateNumber}`
}

function candidateNumberFromRun(run: WorkerRun, target: AssessmentRecoveryTarget) {
  const prefix = `${assessmentSlotRef(target)}:candidate:`
  for (const ref of run.inputRefs) {
    if (!ref.startsWith(prefix)) continue
    const candidateNumber = Number(ref.slice(prefix.length))
    if (Number.isInteger(candidateNumber) && candidateNumber > 0) return candidateNumber
  }
  return undefined
}

export function assessmentCandidateRuns(job: ContentFactoryJob, target: AssessmentRecoveryTarget) {
  const slotRef = assessmentSlotRef(target)
  return job.workerRuns
    .filter((run) => run.stage === 'generation' && run.inputRefs.includes(slotRef))
    .map((run) => ({ run, candidateNumber: candidateNumberFromRun(run, target) }))
    .filter((entry): entry is { run: WorkerRun; candidateNumber: number } => entry.candidateNumber !== undefined)
    .sort((left, right) => left.candidateNumber - right.candidateNumber)
}

export function nextAssessmentCandidateNumber(job: ContentFactoryJob, target: AssessmentRecoveryTarget) {
  const runs = assessmentCandidateRuns(job, target)
  return runs.length === 0 ? 1 : Math.max(...runs.map((entry) => entry.candidateNumber)) + 1
}

export function isRecoverableAssessmentCandidateFailure(execution: WorkerExecution<unknown>) {
  return execution.status === 'failure' && (
    execution.error.startsWith('provider_contract_failure:')
    || execution.error.startsWith('assessment_candidate_validation_rejected:')
  )
}

export function assessmentValidationRejectedExecution(
  execution: Extract<WorkerExecution<unknown>, { status: 'success' }>,
  error: unknown,
): WorkerExecution<unknown> {
  return {
    status: 'failure',
    error: `assessment_candidate_validation_rejected: ${error instanceof Error ? error.message : 'unknown assessment candidate validation error'}`,
    provenance: execution.provenance,
  }
}
