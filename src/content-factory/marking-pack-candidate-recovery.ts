import type { ContentFactoryJob } from './schema'
import type { WorkerExecution } from './intake-to-knowledge-model'

export const MAX_MARKING_PACK_CANDIDATES = 2

type MarkingPackTarget = {
  assessmentItemId: string
}

export function markingPackSlotRef(target: MarkingPackTarget) {
  return `marking-pack-slot:${target.assessmentItemId}`
}

export function markingPackCandidateRef(target: MarkingPackTarget, candidateNumber: number) {
  return `${markingPackSlotRef(target)}:candidate:${candidateNumber}`
}

export function markingPackCandidateRuns(job: ContentFactoryJob, target: MarkingPackTarget) {
  const slotRef = markingPackSlotRef(target)
  return job.workerRuns
    .filter((run) => run.stage === 'marking_pack' && run.inputRefs.includes(slotRef))
    .map((run) => {
      const prefix = `${slotRef}:candidate:`
      const candidateRef = run.inputRefs.find((ref) => ref.startsWith(prefix))
      const candidateNumber = candidateRef ? Number(candidateRef.slice(prefix.length)) : Number.NaN
      return { run, candidateNumber }
    })
    .filter((entry) => Number.isInteger(entry.candidateNumber) && entry.candidateNumber >= 1)
    .sort((left, right) => left.candidateNumber - right.candidateNumber)
}

export function nextMarkingPackCandidateNumber(job: ContentFactoryJob, target: MarkingPackTarget) {
  const runs = markingPackCandidateRuns(job, target)
  return runs.length === 0 ? 1 : Math.max(...runs.map((entry) => entry.candidateNumber)) + 1
}

export function isRecoverableMarkingPackCandidateFailure(execution: WorkerExecution<unknown>) {
  return execution.status === 'failure' && (
    execution.error.startsWith('provider_contract_failure:')
    || execution.error.startsWith('marking_pack_candidate_validation_rejected:')
  )
}

export function markingPackValidationRejectedExecution(
  execution: Extract<WorkerExecution<unknown>, { status: 'success' }>,
  error: unknown,
): WorkerExecution<unknown> {
  const message = error instanceof Error ? error.message : 'unknown Marking Pack validation failure'
  return {
    status: 'failure',
    error: `marking_pack_candidate_validation_rejected: ${message}`,
    provenance: execution.provenance,
  }
}
