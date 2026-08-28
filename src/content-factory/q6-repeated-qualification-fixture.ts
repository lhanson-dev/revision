import type { WorkerExecution } from './intake-to-knowledge-model'
import { createRequestedJob } from './orchestrator'
import type { ContentFactoryJob } from './schema'
import {
  q3SubjectShapeFixtures,
  runQ3SubjectShape,
} from './q3-subject-shape-fixtures'
import {
  q4CorrectedHeadSha,
  runQ4DeterministicPipelineSimulation,
} from './q4-deterministic-pipeline-fixture'
import {
  cloneDurableWorkerDependencyPolicy,
  currentDurableWorkerDependencyPolicy,
  durableWorkerMethods,
  withDurableWorkerContractVersion,
  type DurableWorkerDependencyPolicy,
  type DurableWorkerMethod,
} from './durable-worker-dependencies'
import {
  DependencyAwareDurableWorkerExecutionCache,
  loadDependencyAwareCourseSpendLedger,
  replayDurableJobForCurrentHead,
} from './q5-durable-resume'
import {
  DurableIssueCheckpointBlobStore,
  type LivePilotIssueCommentClient,
} from './live-pilot-durable-store'

export const q6ReviewedMainSha = '37b0d053cc7c8d5355b2b47f19705c9a3f1ba053'
export const q6RepetitionCount = 3

export const q6Q5ScenarioIds = [
  'head_only_reuse',
  'practice_contract_invalidation',
  'assessment_contract_invalidation',
  'coverage_contract_propagation',
  'provenance_and_spend',
  'semantic_replay',
] as const

function memoryCommentClient() {
  let id = 0
  const comments = new Map<number, Array<{ id: number; body: string | null }>>()
  const client: LivePilotIssueCommentClient = {
    async listComments(issueNumber) {
      return [...(comments.get(issueNumber) ?? [])]
    },
    async createComment(issueNumber, body) {
      id += 1
      comments.set(issueNumber, [...(comments.get(issueNumber) ?? []), { id, body }])
      return { id }
    },
  }
  return client
}

function controlledSuccess(
  method: DurableWorkerMethod,
  idSuffix: string,
  usageCost = 0.01,
  retryCount = 0,
): WorkerExecution<unknown> {
  return {
    status: 'success',
    output: { method, idSuffix },
    provenance: {
      id: `${method}-${idSuffix}`,
      contextId: `${method}-context-${idSuffix}`,
      contractVersion: currentDurableWorkerDependencyPolicy[method].contractVersion,
      provider: 'controlled-q6-provider',
      model: 'q6-restart-fixture-v1',
      retryCount,
      usageCost,
    },
  }
}

async function executeDurableWorkerMatrix(input: {
  cache: DependencyAwareDurableWorkerExecutionCache
  calls: Map<DurableWorkerMethod, number>
  suffix: string
}) {
  for (const method of durableWorkerMethods) {
    await input.cache.run(
      method,
      { jobId: 'q6-course', stableInput: method },
      async () => {
        input.calls.set(method, (input.calls.get(method) ?? 0) + 1)
        return controlledSuccess(method, `${input.suffix}-${input.calls.get(method)}`)
      },
    )
  }
}

function executedOnSecondPass(calls: Map<DurableWorkerMethod, number>) {
  return durableWorkerMethods.filter((method) => calls.get(method) === 2)
}

async function runChangedHeadScenario(
  policy: DurableWorkerDependencyPolicy,
  issueNumber: number,
) {
  const client = memoryCommentClient()
  const calls = new Map<DurableWorkerMethod, number>()
  const firstBlobs = await DurableIssueCheckpointBlobStore.load(issueNumber, client)
  const firstCache = new DependencyAwareDurableWorkerExecutionCache(
    firstBlobs,
    '1'.repeat(40),
    currentDurableWorkerDependencyPolicy,
  )
  await executeDurableWorkerMatrix({ cache: firstCache, calls, suffix: 'first' })

  const restartedBlobs = await DurableIssueCheckpointBlobStore.load(issueNumber, client)
  const restartedCache = new DependencyAwareDurableWorkerExecutionCache(
    restartedBlobs,
    '2'.repeat(40),
    policy,
  )
  await executeDurableWorkerMatrix({ cache: restartedCache, calls, suffix: 'second' })

  return {
    executedOnSecondPass: executedOnSecondPass(calls),
    reusedExecutionCount: restartedCache.reusedExecutionCount,
    reusedAcrossHeadCount: restartedCache.reusedAcrossHeadCount,
    executedWorkerCount: restartedCache.executedWorkerCount,
    durableWorkerCoverage: durableWorkerMethods.length,
  }
}

async function runQ5ScenarioSet(repetition: number) {
  const issueBase = 600 + repetition * 10
  const headOnly = await runChangedHeadScenario(
    cloneDurableWorkerDependencyPolicy(),
    issueBase + 1,
  )
  const practice = await runChangedHeadScenario(
    withDurableWorkerContractVersion(
      currentDurableWorkerDependencyPolicy,
      'generatePracticeCollateral',
      'q6-practice-contract-change',
    ),
    issueBase + 2,
  )
  const assessment = await runChangedHeadScenario(
    withDurableWorkerContractVersion(
      currentDurableWorkerDependencyPolicy,
      'compileAssessmentBlueprint',
      'q6-assessment-contract-change',
    ),
    issueBase + 3,
  )
  const coverage = await runChangedHeadScenario(
    withDurableWorkerContractVersion(
      currentDurableWorkerDependencyPolicy,
      'compileCoverage',
      'q6-coverage-contract-change',
    ),
    issueBase + 4,
  )

  const spendClient = memoryCommentClient()
  const spendIssue = issueBase + 5
  const firstBlobs = await DurableIssueCheckpointBlobStore.load(spendIssue, spendClient)
  const firstCache = new DependencyAwareDurableWorkerExecutionCache(firstBlobs, '3'.repeat(40))
  let firstExecutions = 0
  const firstExecution = await firstCache.run(
    'generateLearningCollateral',
    { jobId: 'q6-priced', unit: 'learn-1' },
    async () => {
      firstExecutions += 1
      return controlledSuccess('generateLearningCollateral', 'priced', 0.37, 2)
    },
  )
  const firstLedgerLoad = await loadDependencyAwareCourseSpendLedger({
    blobs: firstBlobs,
    jobId: 'q6-priced',
    currentContentHeadSha: '3'.repeat(40),
    maxSpendUsd: 1,
  })
  await firstLedgerLoad.ledger.startAttempt('2026-08-28T21:30:00+01:00')
  await firstLedgerLoad.ledger.reserve('provider-call-1', 0.5, 'learning')
  await firstLedgerLoad.ledger.settle('provider-call-1', 0.37, 'learning')

  const restartedBlobs = await DurableIssueCheckpointBlobStore.load(spendIssue, spendClient)
  const secondLedgerLoad = await loadDependencyAwareCourseSpendLedger({
    blobs: restartedBlobs,
    jobId: 'q6-priced',
    currentContentHeadSha: '4'.repeat(40),
    maxSpendUsd: 1,
  })
  const secondCache = new DependencyAwareDurableWorkerExecutionCache(restartedBlobs, '4'.repeat(40))
  let secondExecutions = 0
  const reusedExecution = await secondCache.run(
    'generateLearningCollateral',
    { jobId: 'q6-priced', unit: 'learn-1' },
    async () => {
      secondExecutions += 1
      return controlledSuccess('generateLearningCollateral', 'unexpected', 0.99, 5)
    },
  )

  const requested = createRequestedJob({
    jobId: 'q6-semantic-replay',
    officialUrls: ['https://example.test/q6-course'],
    founderInstruction: 'Run the governed Q6 restart fixture.',
    createdAt: '2026-08-28T21:30:00+01:00',
    schemaVersion: 2,
  })
  const lateStage = { ...requested, state: 'expert_review_ready' as const } as ContentFactoryJob
  const sameHead = replayDurableJobForCurrentHead({
    job: lateStage,
    createdContentHeadSha: '5'.repeat(40),
    currentContentHeadSha: '5'.repeat(40),
  })
  const changedHead = replayDurableJobForCurrentHead({
    job: lateStage,
    createdContentHeadSha: '5'.repeat(40),
    currentContentHeadSha: '6'.repeat(40),
  })

  return {
    headOnly,
    practice,
    assessment,
    coverage,
    provenanceAndSpend: {
      firstExecutions,
      secondExecutions,
      firstExecutionRetryCount: firstExecution.provenance.retryCount,
      reusedExecutionRetryCount: reusedExecution.provenance.retryCount,
      firstExecutionUsageCost: firstExecution.provenance.usageCost,
      reusedExecutionUsageCost: reusedExecution.provenance.usageCost,
      cumulativeSpendBeforeRestart: firstLedgerLoad.ledger.snapshot().conservativeConsumedUsd,
      cumulativeSpendAfterRestart: secondLedgerLoad.ledger.snapshot().conservativeConsumedUsd,
      requiresSemanticReplay: secondLedgerLoad.requiresSemanticReplay,
      reusedAcrossHeadCount: secondCache.reusedAcrossHeadCount,
    },
    semanticReplay: {
      sameHeadRetainsLateStage: sameHead === lateStage,
      changedHeadState: changedHead.state,
      preservedJobId: changedHead.jobId,
      preservedOfficialUrls: changedHead.officialUrls,
      preservedFounderInstruction: changedHead.founderInstruction,
      workerRunCount: changedHead.workerRuns.length,
    },
  }
}

export async function runQ6QualificationRepetition(repetition: number) {
  const q3 = []
  for (const fixture of q3SubjectShapeFixtures) {
    const result = await runQ3SubjectShape(fixture)
    q3.push({
      fixtureId: fixture.id,
      subjectShape: fixture.subjectShape,
      finalState: result.job.state,
      reachedExpertReviewReady: result.report.reachedExpertReviewReady,
      workUnitCount: result.report.workUnitCount,
      expectedWorkUnitCount: fixture.requirements.length,
      workerRunCount: result.report.workerRunCount,
      markableAssessmentItemCount: result.report.markableAssessmentItemCount,
      markingPackCoverageCount: result.report.markingPackCoverageCount,
      observedUsageCost: result.report.observedUsageCost,
      totalRetries: result.report.totalRetries,
      humanInterventionCount: result.report.humanInterventionCount,
      providerRoutes: result.report.providerRoutes,
      reviewedCommit: result.package?.reviewedCommit,
    })
  }

  const q4Result = await runQ4DeterministicPipelineSimulation()
  const q4 = {
    stateTrace: q4Result.trace.states,
    finalState: q4Result.job.state,
    reachedExpertReviewReady: q4Result.report.reachedExpertReviewReady,
    observedUsageCost: q4Result.report.observedUsageCost,
    totalRetries: q4Result.report.totalRetries,
    humanReviewPresent: q4Result.job.humanReview !== undefined,
    expertReviewSubmissionCount: q4Result.store.refs('expert_review_submission').length,
    validationDecisions: q4Result.validationReports.map((report) => report.decision),
    reviewDecisions: q4Result.reviewReports.map((report) => report.decision),
    remediationTargetKinds: q4Result.trace.remediationTargets.map((target) => target.kind).sort(),
    correctedHeadSha: q4Result.job.remediation?.correctedHeadSha,
    publicationStatus: q4Result.latestManifest.publicationStatus,
    packageReviewedCommit: q4Result.package?.reviewedCommit,
  }

  return {
    repetition,
    q3,
    q4,
    q5: await runQ5ScenarioSet(repetition),
  }
}

export async function runQ6RepeatedQualificationStability(
  repetitionCount = q6RepetitionCount,
) {
  const repetitions = []
  for (let repetition = 1; repetition <= repetitionCount; repetition += 1) {
    repetitions.push(await runQ6QualificationRepetition(repetition))
  }
  return repetitions
}

export function q6ExpectedQ5InvalidationSets() {
  return {
    practice: [
      'generatePracticeCollateral',
      'independentReview',
      'remediate',
    ] satisfies DurableWorkerMethod[],
    assessment: [
      'compileAssessmentBlueprint',
      'generateQuestionFamilies',
      'generateAssessmentItem',
      'generateMarkingPack',
      'independentReview',
      'remediate',
    ] satisfies DurableWorkerMethod[],
    coverage: [
      'compileCoverage',
      'compileKnowledgeModel',
      'planLearningBlueprint',
      'generateLearningCollateral',
      'generatePracticeCollateral',
      'compileAssessmentBlueprint',
      'generateQuestionFamilies',
      'generateAssessmentItem',
      'generateMarkingPack',
      'independentReview',
      'remediate',
    ] satisfies DurableWorkerMethod[],
  }
}

export { q4CorrectedHeadSha, durableWorkerMethods }
