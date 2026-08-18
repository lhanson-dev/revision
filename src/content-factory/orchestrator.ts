import {
  contentFactoryJobSchema,
  type ContentFactoryActiveState,
  type ContentFactoryJob,
} from './schema'

const transitionMap: Record<ContentFactoryActiveState, readonly ContentFactoryActiveState[]> = {
  requested: ['identified'],
  identified: ['sourced'],
  sourced: ['mapped'],
  mapped: ['generating'],
  generating: ['validating'],
  validating: ['independent_review'],
  independent_review: ['remediation', 'ci_verification'],
  remediation: ['validating'],
  ci_verification: ['ready_for_founder_merge_approval'],
  ready_for_founder_merge_approval: ['merged'],
  merged: ['deployment_verification'],
  deployment_verification: ['pilot_live'],
  pilot_live: ['human_review'],
  human_review: ['benchmark_approved'],
  benchmark_approved: [],
}

function unresolvedBlockers(job: ContentFactoryJob) {
  return job.blockers.filter((blocker) => !blocker.resolvedAt)
}

function generationContexts(job: ContentFactoryJob) {
  return new Set(
    job.workerRuns
      .filter((run) => run.stage === 'generation' && run.status === 'success')
      .map((run) => run.contextId),
  )
}

function independentReviewIsIndependent(job: ContentFactoryJob) {
  const review = job.independentReview
  if (!review) return false

  const reviewerRun = job.workerRuns.find((run) => run.id === review.reviewerWorkerRunId)
  if (!reviewerRun || reviewerRun.stage !== 'independent_review' || reviewerRun.status !== 'success') return false

  return !generationContexts(job).has(reviewerRun.contextId)
}

export function getTransitionProblems(
  jobInput: ContentFactoryJob,
  target: ContentFactoryActiveState,
): string[] {
  const job = contentFactoryJobSchema.parse(jobInput)

  if (job.state === 'blocked') return ['Blocked jobs must be resumed before advancing']
  if (!transitionMap[job.state].includes(target)) return [`Transition ${job.state} -> ${target} is not allowed`]
  if (unresolvedBlockers(job).length > 0) return ['Resolve all blockers before advancing']

  switch (target) {
    case 'identified':
      return [
        !job.courseIdentity ? 'Course identity has not been resolved' : null,
        job.components.length === 0 ? 'At least one course component is required' : null,
        job.unresolvedChoices.length > 0 ? 'Learner/course choices remain unresolved' : null,
      ].filter((problem): problem is string => Boolean(problem))

    case 'sourced':
      return [
        !job.sourceRegisterRef ? 'Source register reference is required' : null,
        !job.sourceSetFingerprint ? 'Source-set fingerprint is required' : null,
      ].filter((problem): problem is string => Boolean(problem))

    case 'mapped':
      return [!job.coverageMapRef ? 'Coverage-map reference is required' : null]
        .filter((problem): problem is string => Boolean(problem))

    case 'generating':
      return [job.workUnits.length === 0 ? 'At least one governed generation work unit is required' : null]
        .filter((problem): problem is string => Boolean(problem))

    case 'validating':
      if (job.state === 'generating') {
        return [
          job.workUnits.some((unit) => unit.status !== 'complete') ? 'All generation work units must be complete' : null,
          job.contentPackRefs.length === 0 ? 'Generated content pack references are required' : null,
        ].filter((problem): problem is string => Boolean(problem))
      }

      return [
        job.remediation?.status !== 'complete' ? 'Remediation must be complete before revalidation' : null,
        !job.remediation?.correctedHeadSha ? 'Remediation must record the corrected head commit' : null,
      ].filter((problem): problem is string => Boolean(problem))

    case 'independent_review':
      return [
        job.validation?.status !== 'pass' ? 'Deterministic validation must pass first' : null,
        !job.validation?.headSha ? 'Validation must be tied to an exact head commit' : null,
      ].filter((problem): problem is string => Boolean(problem))

    case 'remediation':
      return [
        !job.independentReview ? 'Independent-review evidence is required' : null,
        job.independentReview && job.independentReview.unresolvedBlocking + job.independentReview.unresolvedMaterial === 0
          ? 'Remediation requires an unresolved blocking or material finding'
          : null,
      ].filter((problem): problem is string => Boolean(problem))

    case 'ci_verification': {
      const review = job.independentReview
      return [
        !review ? 'Independent-review evidence is required' : null,
        review?.decision === 'fail_hold' ? 'FAIL/HOLD review cannot proceed to CI verification' : null,
        review && review.unresolvedBlocking > 0 ? 'Blocking review findings remain unresolved' : null,
        review && review.unresolvedMaterial > 0 ? 'Material review findings remain unresolved' : null,
        !independentReviewIsIndependent(job) ? 'Independent review must use a successful fresh context that did not generate the content' : null,
        review && job.validation?.headSha !== review.reviewedCommit ? 'Independent review must cover the validated head commit' : null,
      ].filter((problem): problem is string => Boolean(problem))
    }

    case 'ready_for_founder_merge_approval':
      return [
        job.ci?.status !== 'pass' ? 'CI must pass on the intended head' : null,
        !job.ci?.headSha ? 'CI result must record the exact head commit' : null,
        job.independentReview && job.ci?.headSha !== job.independentReview.reviewedCommit
          ? 'CI head must match the independently reviewed commit'
          : null,
      ].filter((problem): problem is string => Boolean(problem))

    case 'merged':
      return [
        job.merge?.founderApproved !== true ? 'Explicit Founder merge approval is required' : null,
        !job.merge?.mergedCommit ? 'Merged commit must be recorded after the approved merge' : null,
      ].filter((problem): problem is string => Boolean(problem))

    case 'deployment_verification':
      return [!job.merge?.mergedCommit ? 'Merged commit must be known before deployment verification' : null]
        .filter((problem): problem is string => Boolean(problem))

    case 'pilot_live':
      return [
        job.deployment?.status !== 'pass' ? 'Production deployment and smoke verification must pass' : null,
        !job.deployment?.deployedCommit ? 'Deployment must record the deployed commit' : null,
        job.deployment?.deployedCommit && job.merge?.mergedCommit !== job.deployment.deployedCommit
          ? 'Deployment verification must cover the merged commit'
          : null,
      ].filter((problem): problem is string => Boolean(problem))

    case 'human_review':
      return []

    case 'benchmark_approved':
      return [job.humanReview?.status !== 'pass' ? 'Qualified human subject review must pass before benchmark approval' : null]
        .filter((problem): problem is string => Boolean(problem))
  }

  return []
}

export function advanceJob(
  jobInput: ContentFactoryJob,
  target: ContentFactoryActiveState,
  updatedAt: string,
): ContentFactoryJob {
  const job = contentFactoryJobSchema.parse(jobInput)
  const problems = getTransitionProblems(job, target)
  if (problems.length > 0) throw new Error(problems.join('; '))

  return contentFactoryJobSchema.parse({
    ...job,
    state: target,
    updatedAt,
  })
}

export function blockJob(
  jobInput: ContentFactoryJob,
  blocker: { id: string; reason: string; createdAt: string },
): ContentFactoryJob {
  const job = contentFactoryJobSchema.parse(jobInput)
  if (job.state === 'blocked') throw new Error('Job is already blocked')

  return contentFactoryJobSchema.parse({
    ...job,
    state: 'blocked',
    blockedFromState: job.state,
    blockers: [
      ...job.blockers,
      {
        ...blocker,
        stage: job.state,
      },
    ],
    updatedAt: blocker.createdAt,
  })
}

export function resumeJob(
  jobInput: ContentFactoryJob,
  blockerId: string,
  updatedAt: string,
): ContentFactoryJob {
  const job = contentFactoryJobSchema.parse(jobInput)
  if (job.state !== 'blocked' || !job.blockedFromState) throw new Error('Only blocked jobs can be resumed')

  let found = false
  const blockers = job.blockers.map((blocker) => {
    if (blocker.id !== blockerId || blocker.resolvedAt) return blocker
    found = true
    return { ...blocker, resolvedAt: updatedAt }
  })

  if (!found) throw new Error(`Unresolved blocker ${blockerId} was not found`)
  if (blockers.some((blocker) => !blocker.resolvedAt)) throw new Error('All blockers must be resolved before the job can resume')

  return contentFactoryJobSchema.parse({
    ...job,
    state: job.blockedFromState,
    blockedFromState: undefined,
    blockers,
    updatedAt,
  })
}

export function createRequestedJob(input: {
  jobId: string
  officialUrls: string[]
  founderInstruction: string
  createdAt: string
}): ContentFactoryJob {
  return contentFactoryJobSchema.parse({
    schemaVersion: 1,
    jobId: input.jobId,
    officialUrls: input.officialUrls,
    founderInstruction: input.founderInstruction,
    state: 'requested',
    components: [],
    unresolvedChoices: [],
    contentPackRefs: [],
    workUnits: [],
    workerRuns: [],
    blockers: [],
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
  })
}
