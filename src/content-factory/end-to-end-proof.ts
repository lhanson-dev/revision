import { z } from 'zod'
import {
  contentFactoryJobSchema,
  contentFactoryStateSchema,
  courseIdentitySchema,
  type ContentFactoryJob,
  type WorkerRun,
} from './schema'
import { createRequestedJob } from './orchestrator'
import {
  runIntakeToKnowledgeModel,
  type ContentFactoryArtifactKind,
  type IntakeToKnowledgeModelWorkers,
  type SourceRightsPolicyRule,
} from './intake-to-knowledge-model'
import {
  runLearningAndPracticeFactory,
  type LearningPracticeArtifactKind,
  type LearningPracticeWorkers,
} from './learning-and-practice'
import {
  runAssessmentAndMarkingFactory,
  type AssessmentArtifactKind,
  type AssessmentAndMarkingWorkers,
} from './assessment-and-marking-with-coverage-reconciliation'
import {
  runAssuranceAndRemediationFactory,
  type AssuranceArtifactKind,
  type AssuranceAndRemediationWorkers,
  type RemediationVersionPersister,
} from './assurance-and-remediation'
import {
  packageExpertReview,
  type ExpertReviewArtifactKind,
  type ExpertReviewPackage,
} from './expert-review-handoff'

const nonEmptyStringSchema = z.string().min(1)
const commitShaSchema = z.string().regex(/^[0-9a-f]{40}$/)
const componentShapeSchema = z.enum([
  'single_component',
  'multi_component_all_compulsory',
  'multi_component_mixed_compulsory_optional',
  'multi_component_all_optional',
])
const learningScopeShapeSchema = z.enum(['none', 'course_only', 'component_only', 'mixed'])

export type ContentFactoryEndToEndArtifactKind =
  | ContentFactoryArtifactKind
  | LearningPracticeArtifactKind
  | AssessmentArtifactKind
  | AssuranceArtifactKind
  | ExpertReviewArtifactKind

export interface ContentFactoryEndToEndArtifactStore {
  writeJson(input: {
    jobId: string
    kind: ContentFactoryEndToEndArtifactKind
    fingerprint: string
    value: unknown
  }): Promise<{ ref: string }>
  readJson(ref: string): Promise<unknown>
}

export interface ContentFactoryEndToEndWorkers
  extends IntakeToKnowledgeModelWorkers,
    LearningPracticeWorkers,
    AssessmentAndMarkingWorkers,
    AssuranceAndRemediationWorkers {}

const workerStageSummarySchema = z.object({
  stage: nonEmptyStringSchema,
  successfulRuns: z.number().int().nonnegative(),
  failedRuns: z.number().int().nonnegative(),
  retries: z.number().int().nonnegative(),
  observedUsageCost: z.number().nonnegative(),
  unpricedRuns: z.number().int().nonnegative(),
})

const providerRouteSummarySchema = z.object({
  provider: nonEmptyStringSchema,
  model: nonEmptyStringSchema.optional(),
  runCount: z.number().int().positive(),
  observedUsageCost: z.number().nonnegative(),
  unpricedRuns: z.number().int().nonnegative(),
})

export const contentFactoryEndToEndProofReportSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('content_factory_end_to_end_proof_report'),
  proofMode: z.enum(['contract_integration', 'live_adapter']),
  jobId: nonEmptyStringSchema,
  courseIdentity: courseIdentitySchema.optional(),
  finalState: contentFactoryStateSchema,
  reachedExpertReviewReady: z.boolean(),
  componentShape: componentShapeSchema,
  learningScopeShape: learningScopeShapeSchema,
  shapeSignature: nonEmptyStringSchema,
  componentCount: z.number().int().nonnegative(),
  compulsoryComponentCount: z.number().int().nonnegative(),
  optionalComponentCount: z.number().int().nonnegative(),
  workUnitCount: z.number().int().nonnegative(),
  questionFamilyCount: z.number().int().nonnegative(),
  markableAssessmentItemCount: z.number().int().nonnegative(),
  markingPackCoverageCount: z.number().int().nonnegative(),
  reusedQuestionFamilyAcrossComponents: z.boolean(),
  workerRunCount: z.number().int().nonnegative(),
  workerStages: z.array(workerStageSummarySchema),
  providerRoutes: z.array(providerRouteSummarySchema),
  observedUsageCost: z.number().nonnegative(),
  unpricedWorkerRunCount: z.number().int().nonnegative(),
  totalRetries: z.number().int().nonnegative(),
  humanInterventionCount: z.number().int().nonnegative(),
  humanInterventionReasons: z.array(nonEmptyStringSchema),
  nextExpectedHumanGate: z.literal('qualified_expert_review').optional(),
  reviewedCommit: commitShaSchema.optional(),
  expertPackageRef: nonEmptyStringSchema.optional(),
  limitations: z.array(nonEmptyStringSchema),
})

export type ContentFactoryEndToEndProofReport = z.infer<typeof contentFactoryEndToEndProofReportSchema>

export const contentFactoryScaleProofSummarySchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('content_factory_scale_proof_summary'),
  shapeProofDecision: z.enum(['pass', 'fail']),
  operationalAdapterProof: z.enum(['proven', 'not_proven']),
  minimumDistinctShapes: z.number().int().positive(),
  caseCount: z.number().int().nonnegative(),
  distinctShapeCount: z.number().int().nonnegative(),
  shapeSignatures: z.array(nonEmptyStringSchema),
  providerRouteKeys: z.array(nonEmptyStringSchema),
  totalObservedUsageCost: z.number().nonnegative(),
  totalUnpricedWorkerRuns: z.number().int().nonnegative(),
  totalHumanInterventions: z.number().int().nonnegative(),
  reports: z.array(contentFactoryEndToEndProofReportSchema),
  limitations: z.array(nonEmptyStringSchema),
})

export type ContentFactoryScaleProofSummary = z.infer<typeof contentFactoryScaleProofSummarySchema>

export type ContentFactoryProofExecutionInput = {
  job: ContentFactoryJob
  workers: ContentFactoryEndToEndWorkers
  artifactStore: ContentFactoryEndToEndArtifactStore
  sourceRightsRules: SourceRightsPolicyRule[]
  versionPersister: RemediationVersionPersister
  contentHeadSha: string
  now: string
  proofMode: 'contract_integration' | 'live_adapter'
  maxRemediationCycles?: number
  limitations?: string[]
}

export type RequestedContentFactoryProofInput = Omit<ContentFactoryProofExecutionInput, 'job'> & {
  request: {
    jobId: string
    officialUrls: string[]
    founderInstruction: string
    createdAt: string
  }
}

function componentShape(job: ContentFactoryJob): z.infer<typeof componentShapeSchema> {
  if (job.components.length <= 1) return 'single_component'
  const compulsory = job.components.filter((component) => component.compulsory).length
  if (compulsory === job.components.length) return 'multi_component_all_compulsory'
  if (compulsory === 0) return 'multi_component_all_optional'
  return 'multi_component_mixed_compulsory_optional'
}

function learningScopeShape(job: ContentFactoryJob): z.infer<typeof learningScopeShapeSchema> {
  if (job.workUnits.length === 0) return 'none'
  const courseScoped = job.workUnits.filter((unit) => unit.componentIds.length === 0).length
  if (courseScoped === job.workUnits.length) return 'course_only'
  if (courseScoped === 0) return 'component_only'
  return 'mixed'
}

function interventionReasons(job: ContentFactoryJob) {
  return job.blockers
    .map((blocker) => blocker.reason)
    .filter((reason) =>
      reason.includes('course_option_resolution_required')
      || reason.includes('source_rights_review_required'),
    )
}

function summariseWorkerStages(workerRuns: WorkerRun[]) {
  const stages = new Map<string, WorkerRun[]>()
  for (const run of workerRuns) stages.set(run.stage, [...(stages.get(run.stage) ?? []), run])
  return [...stages.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([stage, runs]) => workerStageSummarySchema.parse({
      stage,
      successfulRuns: runs.filter((run) => run.status === 'success').length,
      failedRuns: runs.filter((run) => run.status !== 'success').length,
      retries: runs.reduce((sum, run) => sum + run.retryCount, 0),
      observedUsageCost: runs.reduce((sum, run) => sum + (run.usageCost ?? 0), 0),
      unpricedRuns: runs.filter((run) => run.usageCost === undefined).length,
    }))
}

function summariseProviderRoutes(workerRuns: WorkerRun[]) {
  const routes = new Map<string, WorkerRun[]>()
  for (const run of workerRuns) {
    if (!run.provider) continue
    const key = `${run.provider}\u0000${run.model ?? ''}`
    routes.set(key, [...(routes.get(key) ?? []), run])
  }
  return [...routes.values()]
    .map((runs) => providerRouteSummarySchema.parse({
      provider: runs[0].provider!,
      model: runs[0].model,
      runCount: runs.length,
      observedUsageCost: runs.reduce((sum, run) => sum + (run.usageCost ?? 0), 0),
      unpricedRuns: runs.filter((run) => run.usageCost === undefined).length,
    }))
    .sort((left, right) => `${left.provider}:${left.model ?? ''}`.localeCompare(`${right.provider}:${right.model ?? ''}`))
}

export function buildContentFactoryEndToEndProofReport(input: {
  job: ContentFactoryJob
  proofMode: 'contract_integration' | 'live_adapter'
  limitations?: string[]
}): ContentFactoryEndToEndProofReport {
  const job = contentFactoryJobSchema.parse(input.job)
  const shape = componentShape(job)
  const scope = learningScopeShape(job)
  const interventions = interventionReasons(job)
  const observedUsageCost = job.workerRuns.reduce((sum, run) => sum + (run.usageCost ?? 0), 0)
  const unpricedWorkerRunCount = job.workerRuns.filter((run) => run.usageCost === undefined).length
  const reusedQuestionFamilyAcrossComponents = job.markableAssessmentItemIds.length > job.questionFamilyRefs.length
  const reachedExpertReviewReady = job.expertReviewPackage?.status === 'complete'
    && ['expert_review_ready', 'human_review', 'remediation', 'benchmark_approved', 'ci_verification', 'ready_for_founder_merge_approval', 'merged', 'deployment_verification', 'pilot_live'].includes(job.state)
  const limitations = [
    ...(input.limitations ?? []),
    ...(unpricedWorkerRunCount > 0 ? ['One or more worker runs do not yet expose usage cost.'] : []),
    ...(input.proofMode === 'contract_integration'
      ? ['Contract-integration proof uses injected controlled workers and does not by itself prove a live external source/model-provider adapter.']
      : []),
    'Durable worker-run stage duration is not yet captured by the Content Factory job schema.',
  ]

  return contentFactoryEndToEndProofReportSchema.parse({
    schemaVersion: 1,
    artifactType: 'content_factory_end_to_end_proof_report',
    proofMode: input.proofMode,
    jobId: job.jobId,
    courseIdentity: job.courseIdentity,
    finalState: job.state,
    reachedExpertReviewReady,
    componentShape: shape,
    learningScopeShape: scope,
    shapeSignature: `${shape}:${scope}:${reusedQuestionFamilyAcrossComponents ? 'reused-family' : 'distinct-families'}`,
    componentCount: job.components.length,
    compulsoryComponentCount: job.components.filter((component) => component.compulsory).length,
    optionalComponentCount: job.components.filter((component) => !component.compulsory).length,
    workUnitCount: job.workUnits.length,
    questionFamilyCount: job.questionFamilyRefs.length,
    markableAssessmentItemCount: job.markableAssessmentItemIds.length,
    markingPackCoverageCount: job.markingPackCoverage.length,
    reusedQuestionFamilyAcrossComponents,
    workerRunCount: job.workerRuns.length,
    workerStages: summariseWorkerStages(job.workerRuns),
    providerRoutes: summariseProviderRoutes(job.workerRuns),
    observedUsageCost,
    unpricedWorkerRunCount,
    totalRetries: job.workerRuns.reduce((sum, run) => sum + run.retryCount, 0),
    humanInterventionCount: interventions.length,
    humanInterventionReasons: interventions,
    nextExpectedHumanGate: reachedExpertReviewReady ? 'qualified_expert_review' : undefined,
    reviewedCommit: job.expertReviewPackage?.reviewedCommit,
    expertPackageRef: job.expertReviewPackage?.packageRef,
    limitations: [...new Set(limitations)],
  })
}

function blockedResult(input: ContentFactoryProofExecutionInput, job: ContentFactoryJob) {
  return {
    job,
    report: buildContentFactoryEndToEndProofReport({
      job,
      proofMode: input.proofMode,
      limitations: input.limitations,
    }),
  }
}

export async function continueContentFactoryToExpertReviewReady(
  input: ContentFactoryProofExecutionInput,
): Promise<{
  job: ContentFactoryJob
  report: ContentFactoryEndToEndProofReport
  package?: ExpertReviewPackage
}> {
  let job = contentFactoryJobSchema.parse(input.job)
  const contentHeadSha = commitShaSchema.parse(input.contentHeadSha)

  if (job.state === 'blocked') return blockedResult(input, job)

  if (['requested', 'identified', 'sourced', 'mapped'].includes(job.state)) {
    job = await runIntakeToKnowledgeModel({
      job,
      workers: input.workers,
      artifactStore: input.artifactStore,
      sourceRightsRules: input.sourceRightsRules,
      now: input.now,
    })
    if (job.state === 'blocked') return blockedResult(input, job)
  }

  if (['mapped', 'generating'].includes(job.state)) {
    job = await runLearningAndPracticeFactory({
      job,
      workers: input.workers,
      artifactStore: input.artifactStore,
      now: input.now,
    })
    if (job.state === 'blocked') return blockedResult(input, job)
  }

  if (['generating', 'validating'].includes(job.state)) {
    job = await runAssessmentAndMarkingFactory({
      job,
      workers: input.workers,
      artifactStore: input.artifactStore,
      now: input.now,
    })
    if (job.state === 'blocked') return blockedResult(input, job)
  }

  if (['validating', 'independent_review', 'remediation'].includes(job.state)) {
    job = await runAssuranceAndRemediationFactory({
      job,
      workers: input.workers,
      artifactStore: input.artifactStore,
      versionPersister: input.versionPersister,
      contentHeadSha,
      now: input.now,
      maxRemediationCycles: input.maxRemediationCycles,
    })
    if (job.state === 'blocked') return blockedResult(input, job)
  }

  let expertPackage: ExpertReviewPackage | undefined
  if (['independent_review', 'expert_review_packaging', 'expert_review_ready'].includes(job.state)) {
    const packaged = await packageExpertReview({
      job,
      artifactStore: input.artifactStore,
      now: input.now,
    })
    job = packaged.job
    expertPackage = packaged.package
  }

  const report = buildContentFactoryEndToEndProofReport({
    job,
    proofMode: input.proofMode,
    limitations: input.limitations,
  })
  if (!report.reachedExpertReviewReady) {
    throw new Error(`End-to-end Content Factory proof stopped unexpectedly in ${job.state}`)
  }
  return { job, report, package: expertPackage }
}

export async function runRequestedContentFactoryToExpertReviewReady(
  input: RequestedContentFactoryProofInput,
) {
  const job = createRequestedJob({
    ...input.request,
    schemaVersion: 2,
  })
  return continueContentFactoryToExpertReviewReady({ ...input, job })
}

export function summariseContentFactoryScaleProof(
  reportsInput: ContentFactoryEndToEndProofReport[],
  minimumDistinctShapes = 3,
): ContentFactoryScaleProofSummary {
  const reports = reportsInput.map((report) => contentFactoryEndToEndProofReportSchema.parse(report))
  const shapeSignatures = [...new Set(reports.map((report) => report.shapeSignature))].sort()
  const providerRouteKeys = [...new Set(reports.flatMap((report) => report.providerRoutes.map((route) => `${route.provider}:${route.model ?? ''}`)))].sort()
  const shapeProofDecision = reports.length >= minimumDistinctShapes
    && shapeSignatures.length >= minimumDistinctShapes
    && reports.every((report) => report.reachedExpertReviewReady)
      ? 'pass'
      : 'fail'
  const operationalAdapterProof = reports.length > 0 && reports.every((report) => report.proofMode === 'live_adapter')
    ? 'proven'
    : 'not_proven'
  const limitations = [
    ...(operationalAdapterProof === 'not_proven'
      ? ['The recorded shape proof does not yet establish a live external source/model-provider execution path.']
      : []),
    ...reports.flatMap((report) => report.limitations),
  ]

  return contentFactoryScaleProofSummarySchema.parse({
    schemaVersion: 1,
    artifactType: 'content_factory_scale_proof_summary',
    shapeProofDecision,
    operationalAdapterProof,
    minimumDistinctShapes,
    caseCount: reports.length,
    distinctShapeCount: shapeSignatures.length,
    shapeSignatures,
    providerRouteKeys,
    totalObservedUsageCost: reports.reduce((sum, report) => sum + report.observedUsageCost, 0),
    totalUnpricedWorkerRuns: reports.reduce((sum, report) => sum + report.unpricedWorkerRunCount, 0),
    totalHumanInterventions: reports.reduce((sum, report) => sum + report.humanInterventionCount, 0),
    reports,
    limitations: [...new Set(limitations)],
  })
}
