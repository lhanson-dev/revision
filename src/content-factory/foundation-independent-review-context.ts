import type { FoundationCompilationWorkerRun } from './foundation-compilation'
import {
  foundationCandidateSchema,
  foundationJobSchema,
  type FoundationJob,
} from './foundation-schema'
import { computeFoundationFingerprint } from './foundation-lifecycle'
import {
  runFoundationIndependentReviewAndRemediation,
  type FoundationIndependentReviewArtifactStore,
  type FoundationIndependentReviewWorkers,
} from './foundation-independent-review'
import { withAqa7132SourceLedReviewCoverageGuard } from './foundation-aqa7132-review-coverage-guard'

function unique(values: Iterable<string>) {
  return [...new Set([...values].filter((value) => value.trim().length > 0))]
}

/**
 * Return the complete context set recorded by Foundation compilation.
 *
 * Deterministic contexts are intentionally retained as well as provider contexts.
 * Excluding more prior contexts is harmless; silently excluding fewer is not.
 */
export function foundationGenerationContextIdsFromWorkerRuns(workerRuns: FoundationCompilationWorkerRun[]) {
  return unique(workerRuns.map((run) => run.provenance.contextId))
}

/**
 * Persist generation-context evidence into an assuring Foundation Candidate without
 * changing material Foundation identity. This is the restart/resume boundary for
 * fresh-context independent review.
 */
export async function bindFoundationGenerationContextProvenance(input: {
  job: FoundationJob
  generationContextIds: string[]
  now: string
}) {
  const job = foundationJobSchema.parse(input.job)
  if (job.state !== 'assuring' || !job.candidate) {
    throw new Error('Foundation generation-context provenance may be bound only to a candidate in assuring state')
  }

  const contextIds = unique(input.generationContextIds)
  if (contextIds.length === 0) {
    throw new Error('Foundation independent review requires at least one retained generation context')
  }

  const beforeFingerprint = await computeFoundationFingerprint(job.candidate)
  const candidate = foundationCandidateSchema.parse({
    ...job.candidate,
    provenance: {
      ...job.candidate.provenance,
      generationContextIds: unique([
        ...job.candidate.provenance.generationContextIds,
        ...contextIds,
      ]),
    },
  })
  const afterFingerprint = await computeFoundationFingerprint(candidate)
  if (beforeFingerprint !== afterFingerprint) {
    throw new Error('Operational generation-context provenance must not change the material Foundation fingerprint')
  }

  return foundationJobSchema.parse({
    ...job,
    candidate,
    updatedAt: input.now,
  })
}

function reviewWorkersForFoundation(
  job: FoundationJob,
  workers: FoundationIndependentReviewWorkers,
) {
  const identity = job.candidate?.courseIdentity
  const cohort = job.candidate?.cohortValidity
  const isAqa7132For2027 = identity?.awardingBody === 'AQA'
    && identity.subject === 'Business'
    && identity.qualification === 'A-level'
    && identity.specificationId === '7132'
    && cohort?.lastAssessment === '2027'

  return isAqa7132For2027
    ? withAqa7132SourceLedReviewCoverageGuard(workers)
    : workers
}

/**
 * Canonical Slice 3B entry point when review begins from a persisted/reconstructed
 * Foundation Candidate plus its retained compilation run ledger.
 */
export async function runFoundationIndependentReviewWithGenerationEvidence(input: {
  job: FoundationJob
  artifactStore: FoundationIndependentReviewArtifactStore
  workers: FoundationIndependentReviewWorkers
  reviewedCommit: string
  now: string
  generationContextIds: string[]
  additionalForbiddenContextIds?: string[]
  maxRemediationCycles?: number
}) {
  const job = await bindFoundationGenerationContextProvenance({
    job: input.job,
    generationContextIds: input.generationContextIds,
    now: input.now,
  })

  return runFoundationIndependentReviewAndRemediation({
    job,
    artifactStore: input.artifactStore,
    workers: reviewWorkersForFoundation(job, input.workers),
    reviewedCommit: input.reviewedCommit,
    now: input.now,
    additionalForbiddenContextIds: input.additionalForbiddenContextIds,
    maxRemediationCycles: input.maxRemediationCycles,
  })
}
