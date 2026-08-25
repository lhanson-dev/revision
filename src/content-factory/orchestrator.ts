import {
  contentFactoryJobSchema,
  type ContentFactoryActiveState,
  type ContentFactoryJob,
  type ContentFactorySchemaVersion,
} from './schema'

const v1TransitionMap: Record<ContentFactoryActiveState, readonly ContentFactoryActiveState[]> = {
  requested: ['identified'],
  identified: ['sourced'],
  sourced: ['mapped'],
  mapped: ['generating'],
  generating: ['validating'],
  validating: ['independent_review'],
  independent_review: ['remediation', 'ci_verification'],
  remediation: ['validating'],
  expert_review_packaging: [],
  expert_review_ready: [],
  human_review: ['benchmark_approved'],
  benchmark_approved: [],
  ci_verification: ['ready_for_founder_merge_approval'],
  ready_for_founder_merge_approval: ['merged'],
  merged: ['deployment_verification'],
  deployment_verification: ['pilot_live'],
  pilot_live: ['human_review'],
}

const v2TransitionMap: Record<ContentFactoryActiveState, readonly ContentFactoryActiveState[]> = {
  requested: ['identified'],
  identified: ['sourced'],
  sourced: ['mapped'],
  mapped: ['generating'],
  generating: ['validating'],
  validating: ['independent_review'],
  independent_review: ['remediation', 'expert_review_packaging'],
  remediation: ['validating'],
  expert_review_packaging: ['expert_review_ready'],
  expert_review_ready: ['human_review'],
  human_review: ['remediation', 'benchmark_approved'],
  benchmark_approved: ['ci_verification'],
  ci_verification: ['ready_for_founder_merge_approval'],
  ready_for_founder_merge_approval: ['merged'],
  merged: ['deployment_verification'],
  deployment_verification: ['pilot_live'],
  pilot_live: [],
}

function transitionMapFor(version: ContentFactorySchemaVersion) {
  return version === 2 ? v2TransitionMap : v1TransitionMap
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

function missingMarkingPackItemIds(job: ContentFactoryJob) {
  const covered = new Set(job.markingPackCoverage.map((coverage) => coverage.assessmentItemId))
  return job.markableAssessmentItemIds.filter((id) => !covered.has(id))
}

function v2ArtifactProblems(job: ContentFactoryJob) {
  return [
    !job.boardAlignmentRef ? 'Board Alignment reference is required' : null,
    !job.courseKnowledgeModelRef ? 'Course Knowledge Model reference is required' : null,
    !job.learningBlueprintRef ? 'Learning Blueprint reference is required' : null,
    !job.assessmentBlueprintRef ? 'Assessment Blueprint reference is required' : null,
    job.markableAssessmentItemIds.length > 0 && job.questionFamilyRefs.length === 0
      ? 'Question Family references are required for markable assessment items'
      : null,
  ].filter((problem): problem is string => Boolean(problem))
}

export function getTransitionProblems(
  jobInput: ContentFactoryJob,
  target: ContentFactoryActiveState,
): string[] {
  const job = contentFactoryJobSchema.parse(jobInput)

  if (job.state === 'blocked') return ['Blocked jobs must be resumed before advancing']
  if (!transitionMapFor(job.schemaVersion)[job.state].includes(target)) {
    return [`Transition ${job.state} -> ${target} is not allowed for schema v${job.schemaVersion}`]
  }
  if (unresolvedBlockers(job).length > 0) return ['Resolve all blockers before advancing']

  switch (target) {
    case 'identified':
      return [
        !job.courseIdentity ? 'Course identity has not been resolved' : null,
        job.components.length === 0 ? 'At least one course component is required' : null,
        job.unresolvedChoices.length > 0 ? 'Learner/course choices remain unresolved' : null,
      ].filter((problem): problem is string => Boolean(problem))

    case 'sourced':
      if (job.schemaVersion === 2) {
        return [
          !job.sourceLicenceRegisterRef ? 'Source Licence Register reference is required' : null,
          !job.sourceSetFingerprint ? 'Source-set fingerprint is required' : null,
          job.sourceRightsStatus !== 'approved' ? 'Source rights must be approved before the job can proceed' : null,
        ].filter((problem): problem is string => Boolean(problem))
      }

      return [
        !job.sourceRegisterRef ? 'Source register reference is required' : null,
        !job.sourceSetFingerprint ? 'Source-set fingerprint is required' : null,
      ].filter((problem): problem is string => Boolean(problem))

    case 'mapped':
      return [
        !job.coverageMapRef ? 'Coverage-map reference is required' : null,
        job.schemaVersion === 2 && !job.boardAlignmentRef ? 'Board Alignment reference is required' : null,
      ].filter((problem): problem is string => Boolean(problem))

    case 'generating':
      return [
        job.workUnits.length === 0 ? 'At least one governed generation work unit is required' : null,
        job.schemaVersion === 2 && !job.courseKnowledgeModelRef ? 'Course Knowledge Model reference is required' : null,
        job.schemaVersion === 2 && !job.learningBlueprintRef ? 'Learning Blueprint reference is required' : null,
      ].filter((problem): problem is string => Boolean(problem))

    case 'validating':
      if (job.state === 'generating') {
        return [
          job.workUnits.some((unit) => unit.status !== 'complete') ? 'All generation work units must be complete' : null,
          job.contentPackRefs.length === 0 ? 'Generated content pack references are required' : null,
          job.schemaVersion === 2 && !job.assessmentBlueprintRef ? 'Assessment Blueprint reference is required' : null,
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
      if (job.state === 'human_review') {
        return [
          job.schemaVersion !== 2 ? 'Expert-review remediation is available only to v2 jobs' : null,
          !job.humanReview ? 'Qualified expert-review evidence is required' : null,
          job.humanReview && job.humanReview.unresolvedBlocking + job.humanReview.unresolvedMaterial === 0
            ? 'Expert remediation requires an unresolved blocking or material finding'
            : null,
          job.humanReview?.status === 'pass' ? 'A passed expert review does not require remediation' : null,
        ].filter((problem): problem is string => Boolean(problem))
      }

      return [
        !job.independentReview ? 'Independent-review evidence is required' : null,
        job.independentReview && job.independentReview.unresolvedBlocking + job.independentReview.unresolvedMaterial === 0
          ? 'Remediation requires an unresolved blocking or material finding'
          : null,
      ].filter((problem): problem is string => Boolean(problem))

    case 'expert_review_packaging': {
      const review = job.independentReview
      const missingMarkingPacks = missingMarkingPackItemIds(job)
      return [
        job.schemaVersion !== 2 ? 'Expert-review packaging is available only to v2 jobs' : null,
        job.sourceRightsStatus !== 'approved' ? 'Source rights must remain approved' : null,
        job.coverageCompleteness !== 'complete' ? 'Coverage must be complete before expert-review packaging' : null,
        job.artifactCompatibilityStatus !== 'pass' ? 'Artifact compatibility must pass before expert-review packaging' : null,
        ...v2ArtifactProblems(job),
        missingMarkingPacks.length > 0 ? `Marking Packs are missing for: ${missingMarkingPacks.join(', ')}` : null,
        !review ? 'Independent-review evidence is required' : null,
        review?.decision === 'fail_hold' ? 'FAIL/HOLD review cannot proceed to expert-review packaging' : null,
        review && review.unresolvedBlocking > 0 ? 'Blocking review findings remain unresolved' : null,
        review && review.unresolvedMaterial > 0 ? 'Material review findings remain unresolved' : null,
        !independentReviewIsIndependent(job) ? 'Independent review must use a successful fresh context that did not generate the content' : null,
        review && job.validation?.headSha !== review.reviewedCommit ? 'Independent review must cover the validated head commit' : null,
      ].filter((problem): problem is string => Boolean(problem))
    }

    case 'expert_review_ready': {
      const review = job.independentReview
      return [
        job.schemaVersion !== 2 ? 'Expert-review-ready is available only to v2 jobs' : null,
        job.expertReviewPackage?.status !== 'complete' ? 'Expert review package must be complete' : null,
        !job.expertReviewPackage?.packageRef ? 'Expert review package reference is required' : null,
        !job.expertReviewPackage?.contractRef ? 'Expert Review Contract reference is required' : null,
        !job.expertReviewPackage?.reviewedCommit ? 'Expert review package must record the exact reviewed commit' : null,
        review && job.expertReviewPackage?.reviewedCommit !== review.reviewedCommit
          ? 'Expert review package must match the independently reviewed commit'
          : null,
      ].filter((problem): problem is string => Boolean(problem))
    }

    case 'human_review':
      if (job.schemaVersion === 2) {
        return [
          job.expertReviewPackage?.status !== 'complete' ? 'Expert review package must be complete before human review' : null,
        ].filter((problem): problem is string => Boolean(problem))
      }
      return []

    case 'benchmark_approved':
      return [
        job.humanReview?.status !== 'pass' ? 'Qualified human subject review must pass before benchmark approval' : null,
        job.schemaVersion === 2 && !job.humanReview?.reviewedCommit ? 'Expert review must record the reviewed commit' : null,
        job.schemaVersion === 2 && job.humanReview?.reviewedCommit !== job.expertReviewPackage?.reviewedCommit
          ? 'Expert review must cover the exact packaged commit'
          : null,
      ].filter((problem): problem is string => Boolean(problem))

    case 'ci_verification': {
      if (job.schemaVersion === 2) {
        return [
          job.humanReview?.status !== 'pass' ? 'Qualified expert review must pass before publication CI' : null,
          job.humanReview?.reviewedCommit !== job.expertReviewPackage?.reviewedCommit
            ? 'Publication CI must follow expert approval of the packaged commit'
            : null,
        ].filter((problem): problem is string => Boolean(problem))
      }

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

    case 'ready_for_founder_merge_approval': {
      const expectedHead = job.schemaVersion === 2
        ? job.expertReviewPackage?.reviewedCommit
        : job.independentReview?.reviewedCommit

      return [
        job.ci?.status !== 'pass' ? 'CI must pass on the intended head' : null,
        !job.ci?.headSha ? 'CI result must record the exact head commit' : null,
        expectedHead && job.ci?.headSha !== expectedHead
          ? 'CI head must match the final reviewed commit'
          : null,
      ].filter((problem): problem is string => Boolean(problem))
    }

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
  schemaVersion?: ContentFactorySchemaVersion
}): ContentFactoryJob {
  return contentFactoryJobSchema.parse({
    schemaVersion: input.schemaVersion ?? 2,
    jobId: input.jobId,
    officialUrls: input.officialUrls,
    founderInstruction: input.founderInstruction,
    state: 'requested',
    components: [],
    unresolvedChoices: [],
    sourceRightsStatus: 'pending',
    coverageCompleteness: 'pending',
    questionFamilyRefs: [],
    markableAssessmentItemIds: [],
    markingPackCoverage: [],
    artifactCompatibilityStatus: 'pending',
    knownLimitations: [],
    contentPackRefs: [],
    workUnits: [],
    workerRuns: [],
    blockers: [],
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
  })
}
