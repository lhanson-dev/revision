import { blockJob } from './orchestrator'
import {
  assessmentItemArtifactSchema,
  courseContentPackManifestSchema,
  runAssessmentAndMarkingFactory as runBaseAssessmentAndMarkingFactory,
  type AssessmentAndMarkingWorkers,
  type AssessmentArtifactKind,
  type AssessmentArtifactStore,
} from './assessment-and-marking'
import { learningPracticeArtifactSchema } from './learning-and-practice'
import { contentFactoryJobSchema, coverageMapSchema, type ContentFactoryJob } from './schema'
import {
  formatRequiredCoverageProblems,
  requiredCoverageProblems,
  type RequiredCoverageEvidence,
  type RequiredCoverageProblem,
} from './required-coverage-reconciliation'

export type { AssessmentAndMarkingWorkers, AssessmentArtifactKind, AssessmentArtifactStore }

class RequiredCoverageReconciliationError extends Error {
  constructor(readonly problems: RequiredCoverageProblem[]) {
    super(`required_coverage_reconciliation_failed: ${formatRequiredCoverageProblems(problems)}`)
  }
}

async function coverageProblemsForManifest(input: {
  job: ContentFactoryJob
  manifestInput: unknown
  artifactStore: AssessmentArtifactStore
}) {
  const job = contentFactoryJobSchema.parse(input.job)
  const manifest = courseContentPackManifestSchema.parse(input.manifestInput)
  if (manifest.jobId !== job.jobId) throw new Error('Course content pack manifest job ID does not match the Content Factory job')
  if (!job.coverageMapRef) throw new Error('Required coverage reconciliation needs the persisted Coverage Map')

  const coverageMap = coverageMapSchema.parse(await input.artifactStore.readJson(job.coverageMapRef))
  if (coverageMap.jobId !== job.jobId) throw new Error('Required coverage reconciliation Coverage Map job ID does not match the Content Factory job')
  const workUnits = new Map(job.workUnits.map((unit) => [unit.id, unit]))
  const evidence: RequiredCoverageEvidence[] = []

  for (const ref of manifest.learningArtifactRefs) {
    const artifact = learningPracticeArtifactSchema.parse(await input.artifactStore.readJson(ref))
    if (artifact.artifactType !== 'learning') throw new Error(`Course content pack learning ref ${ref} is not a learning artifact`)
    if (artifact.jobId !== job.jobId) throw new Error(`Course content pack learning ref ${ref} belongs to another job`)
    const unit = workUnits.get(artifact.workUnitId)
    if (!unit || !unit.outputRefs.includes(ref)) throw new Error(`Course content pack learning ref ${ref} is not owned by its persisted work unit`)
    for (const requirementId of unit.requirementIds) evidence.push({ requirementId, kind: 'learning', artifactRef: ref })
  }

  for (const ref of manifest.practiceArtifactRefs) {
    const artifact = learningPracticeArtifactSchema.parse(await input.artifactStore.readJson(ref))
    if (artifact.artifactType !== 'practice') throw new Error(`Course content pack practice ref ${ref} is not a practice artifact`)
    if (artifact.jobId !== job.jobId) throw new Error(`Course content pack practice ref ${ref} belongs to another job`)
    const unit = workUnits.get(artifact.workUnitId)
    if (!unit || !unit.outputRefs.includes(ref)) throw new Error(`Course content pack practice ref ${ref} is not owned by its persisted work unit`)
    for (const requirementId of unit.requirementIds) evidence.push({ requirementId, kind: 'practice', artifactRef: ref })
  }

  for (const ref of manifest.assessmentItemRefs) {
    const artifact = assessmentItemArtifactSchema.parse(await input.artifactStore.readJson(ref))
    if (artifact.jobId !== job.jobId) throw new Error(`Course content pack assessment ref ${ref} belongs to another job`)
    for (const requirementId of artifact.requirementIds) evidence.push({ requirementId, kind: 'assessment_item', artifactRef: ref })
  }

  return requiredCoverageProblems({ coverageMap, evidence })
}

async function latestValidManifest(job: ContentFactoryJob, artifactStore: AssessmentArtifactStore) {
  for (const ref of [...job.contentPackRefs].reverse()) {
    try {
      const parsed = courseContentPackManifestSchema.safeParse(await artifactStore.readJson(ref))
      if (parsed.success && parsed.data.jobId === job.jobId) return parsed.data
    } catch {
      // Continue to older immutable manifest references.
    }
  }
  return undefined
}

function blockForCoverage(job: ContentFactoryJob, problems: RequiredCoverageProblem[], now: string) {
  return blockJob(job, {
    id: 'required-coverage-reconciliation-failed',
    reason: `required_coverage_reconciliation_failed: ${formatRequiredCoverageProblems(problems)}`,
    createdAt: now,
  })
}

export async function runAssessmentAndMarkingFactory(input: {
  job: ContentFactoryJob
  artifactStore: AssessmentArtifactStore
  workers: AssessmentAndMarkingWorkers
  now: string
  checkpointJob?: (job: ContentFactoryJob) => Promise<void>
}): Promise<ContentFactoryJob> {
  let latestJob = contentFactoryJobSchema.parse(input.job)
  const checkpointJob = async (job: ContentFactoryJob) => {
    latestJob = contentFactoryJobSchema.parse(job)
    if (input.checkpointJob) await input.checkpointJob(latestJob)
  }

  const guardedStore: AssessmentArtifactStore = {
    readJson: (ref) => input.artifactStore.readJson(ref),
    writeJson: async (writeInput) => {
      if (writeInput.kind === 'course_content_pack') {
        const problems = await coverageProblemsForManifest({
          job: latestJob,
          manifestInput: writeInput.value,
          artifactStore: input.artifactStore,
        })
        if (problems.length > 0) throw new RequiredCoverageReconciliationError(problems)
      }
      return input.artifactStore.writeJson(writeInput)
    },
  }

  let result: ContentFactoryJob
  try {
    result = await runBaseAssessmentAndMarkingFactory({
      ...input,
      artifactStore: guardedStore,
      checkpointJob,
    })
  } catch (error) {
    if (error instanceof RequiredCoverageReconciliationError) {
      return blockForCoverage(latestJob, error.problems, input.now)
    }
    throw error
  }

  if (result.state === 'validating') {
    const manifest = await latestValidManifest(result, input.artifactStore)
    if (!manifest) throw new Error('Validating Content Factory job is missing a readable course content pack manifest')
    const problems = await coverageProblemsForManifest({ job: result, manifestInput: manifest, artifactStore: input.artifactStore })
    if (problems.length > 0) return blockForCoverage(result, problems, input.now)
  }

  return result
}
