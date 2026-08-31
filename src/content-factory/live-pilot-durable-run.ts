import type { ExpertReviewPackage } from './expert-review-handoff'
import { packageExpertReview } from './expert-review-handoff'
import {
  buildContentFactoryEndToEndProofReport,
  type ContentFactoryEndToEndArtifactStore,
  type ContentFactoryEndToEndProofReport,
  type ContentFactoryEndToEndWorkers,
} from './end-to-end-proof'
import { runIntakeToKnowledgeModel } from './intake-to-knowledge-model'
import { runLearningAndPracticeFactory } from './learning-and-practice'
import { runAssessmentAndMarkingFactory } from './assessment-and-marking-with-coverage-reconciliation'
import { runAssuranceAndRemediationFactory } from './assurance-and-remediation'
import { blockJob, createRequestedJob, resumeJob } from './orchestrator'
import { contentFactoryJobSchema, type ContentFactoryJob } from './schema'
import {
  AQA_AS_BUSINESS_7131_SOURCE_RIGHTS_RULES,
  AQA_AS_BUSINESS_7131_URLS,
} from './live-pilot'
import { applyAqaAsBusiness7131PilotAssessmentIntegrityPolicy } from './aqa-as-business-pilot-assessment-policy'

export const AQA_AS_BUSINESS_7131_LIVE_PILOT_FOUNDER_INSTRUCTION = 'Run the governed rights-safe live adapter pilot for AQA AS Business 7131, 2026 examination cohort, through expert_review_ready without publishing learner content.'

const livePilotLimitations = [
  'Live pilot is an internal Content Factory proof and does not publish learner content.',
  'AQA sources remain REFERENCE_ONLY; generative workers receive only controlled structured alignment facts, never AQA source prose.',
  'The secondary CC BY source is admitted only after live licence/terms preflight and only manually curated structured facts are passed downstream.',
  'Durable restart replays the current pipeline and reuses only exact-input executions whose transitive worker-contract dependency fingerprint is unchanged; legacy v1 cache entries remain same-head-only until migrated.',
  'Assessment Item candidate attempts are durably checkpointed in canonical job workerRuns using deterministic production-slot markers before later assessment siblings are generated.',
  'Course-pack assembly fails closed if any active Coverage Map requirement lacks a required Learn, Practice or Exam Prep artifact.',
]

export function createAqaAsBusiness7131RequestedLivePilotJob(input: {
  jobId: string
  createdAt: string
}) {
  return createRequestedJob({
    jobId: input.jobId,
    officialUrls: [AQA_AS_BUSINESS_7131_URLS.specification],
    founderInstruction: AQA_AS_BUSINESS_7131_LIVE_PILOT_FOUNDER_INSTRUCTION,
    createdAt: input.createdAt,
    schemaVersion: 2,
  })
}

function report(job: ContentFactoryJob): ContentFactoryEndToEndProofReport {
  return buildContentFactoryEndToEndProofReport({
    job,
    proofMode: 'live_adapter',
    limitations: livePilotLimitations,
  })
}

function resumableOperationalBlocker(job: ContentFactoryJob) {
  if (job.state !== 'blocked') return undefined
  const unresolved = job.blockers.filter((blocker) => !blocker.resolvedAt)
  if (unresolved.length !== 1) return undefined
  const blocker = unresolved[0]
  if (
    blocker.reason.includes('infrastructure_failure')
    || blocker.reason.startsWith('durable_live_pilot_exception:')
  ) return blocker
  return undefined
}

export async function runDurableAqaAsBusiness7131LivePilot(input: {
  job: ContentFactoryJob
  contentHeadSha: string
  now: string
  workers: ContentFactoryEndToEndWorkers
  artifactStore: ContentFactoryEndToEndArtifactStore
  checkpointJob: (job: ContentFactoryJob) => Promise<void>
}): Promise<{
  job: ContentFactoryJob
  report: ContentFactoryEndToEndProofReport
  package?: ExpertReviewPackage
  failure?: string
}> {
  let job = contentFactoryJobSchema.parse(input.job)
  let expertPackage: ExpertReviewPackage | undefined

  // Apply the Revision-owned Pilot #9 assessment corrections before any paid
  // assessment worker can read the pilot policy/context objects. The objects are
  // also referenced by already-created live worker configs, so this remains
  // effective for durable workflow runs without moving Business-specific facts
  // into the generic provider adapter.
  applyAqaAsBusiness7131PilotAssessmentIntegrityPolicy()

  const checkpoint = async () => {
    job = contentFactoryJobSchema.parse(job)
    await input.checkpointJob(job)
  }

  try {
    if (job.state === 'blocked') {
      const blocker = resumableOperationalBlocker(job)
      if (!blocker) return { job, report: report(job) }
      job = resumeJob(job, blocker.id, input.now)
      await checkpoint()
    }

    if (['requested', 'identified', 'sourced', 'mapped'].includes(job.state)) {
      job = await runIntakeToKnowledgeModel({
        job,
        workers: input.workers,
        artifactStore: input.artifactStore,
        sourceRightsRules: AQA_AS_BUSINESS_7131_SOURCE_RIGHTS_RULES,
        now: input.now,
      })
      await checkpoint()
      if (job.state === 'blocked') return { job, report: report(job) }
    }

    if (['mapped', 'generating'].includes(job.state)) {
      job = await runLearningAndPracticeFactory({
        job,
        workers: input.workers,
        artifactStore: input.artifactStore,
        now: input.now,
      })
      await checkpoint()
      if (job.state === 'blocked') return { job, report: report(job) }
    }

    if (['generating', 'validating'].includes(job.state)) {
      job = await runAssessmentAndMarkingFactory({
        job,
        workers: input.workers,
        artifactStore: input.artifactStore,
        now: input.now,
        checkpointJob: async (checkpointedJob) => {
          await input.checkpointJob(contentFactoryJobSchema.parse(checkpointedJob))
        },
      })
      await checkpoint()
      if (job.state === 'blocked') return { job, report: report(job) }
    }

    if (['validating', 'independent_review', 'remediation'].includes(job.state)) {
      job = await runAssuranceAndRemediationFactory({
        job,
        workers: input.workers,
        artifactStore: input.artifactStore,
        versionPersister: {
          async persist() {
            throw new Error('Live pilot does not fabricate remediation commits; a material independent-review finding must reopen governed repository remediation.')
          },
        },
        contentHeadSha: input.contentHeadSha,
        now: input.now,
        maxRemediationCycles: 0,
      })
      await checkpoint()
      if (job.state === 'blocked') return { job, report: report(job) }
    }

    if (['independent_review', 'expert_review_packaging', 'expert_review_ready'].includes(job.state)) {
      const packaged = await packageExpertReview({
        job,
        artifactStore: input.artifactStore,
        now: input.now,
      })
      job = packaged.job
      expertPackage = packaged.package
      await checkpoint()
    }

    const proofReport = report(job)
    if (!proofReport.reachedExpertReviewReady) {
      throw new Error(`End-to-end Content Factory proof stopped unexpectedly in ${job.state}`)
    }
    return { job, report: proofReport, package: expertPackage }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown durable live-pilot failure'
    if (job.state !== 'blocked') {
      job = blockJob(job, {
        id: `durable-live-pilot-exception-${globalThis.crypto.randomUUID()}`,
        reason: `durable_live_pilot_exception: ${message}`,
        createdAt: input.now,
      })
    }
    await checkpoint()
    return { job, report: report(job), package: expertPackage, failure: message }
  }
}
