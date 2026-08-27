import { z } from 'zod'
import { advanceJob, blockJob } from './orchestrator'
import {
  boardAlignmentSchema,
  contentFactoryJobSchema,
  courseKnowledgeModelSchema,
  coverageMapSchema,
  learningBlueprintSchema,
  questionFamilySchema,
  sourceLicenceRegisterSchema,
  type ContentFactoryJob,
  type WorkerRun,
} from './schema'
import { fingerprintValue, type WorkerExecution } from './intake-to-knowledge-model'
import { learningPracticeArtifactSchema } from './learning-and-practice'
import {
  finaliseCoverageMap,
  finalCoverageProblems,
  type CoverageEvidenceRef,
} from './coverage-finalization'
import {
  assessmentItemArtifactSchema,
  courseContentPackManifestSchema,
  executableAssessmentBlueprintSchema,
  executableMarkingPackSchema,
  type AssessmentItemArtifact,
  type ExecutableMarkingPack,
} from './assessment-and-marking'

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const nonEmptyStringSchema = z.string().min(1)
const commitShaSchema = z.string().regex(/^[0-9a-f]{40}$/)

export const deterministicCheckSchema = z.object({
  checkId: identifierSchema,
  status: z.enum(['pass', 'fail', 'not_applicable']),
  severity: z.enum(['blocking', 'material', 'minor', 'informational']),
  artifactRefs: z.array(nonEmptyStringSchema).default([]),
  message: nonEmptyStringSchema,
  evidence: z.array(nonEmptyStringSchema).default([]),
}).superRefine((check, context) => {
  if (check.status === 'fail' && !['blocking', 'material'].includes(check.severity)) {
    context.addIssue({ code: 'custom', path: ['severity'], message: 'Failed deterministic checks must be blocking or material' })
  }
})

export const deterministicValidationReportSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('deterministic_validation_report'),
  jobId: identifierSchema,
  reviewedCommit: commitShaSchema,
  contentFingerprint: nonEmptyStringSchema,
  decision: z.enum(['pass', 'fail']),
  checks: z.array(deterministicCheckSchema).min(1),
  createdAt: nonEmptyStringSchema,
}).superRefine((report, context) => {
  const hasFailure = report.checks.some((check) => check.status === 'fail')
  if ((report.decision === 'fail') !== hasFailure) {
    context.addIssue({ code: 'custom', path: ['decision'], message: 'Validation decision must match deterministic check failures' })
  }
})

export const independentReviewFindingSchema = z.object({
  id: identifierSchema,
  severity: z.enum(['blocking', 'material', 'minor', 'no_issue']),
  issueType: nonEmptyStringSchema,
  artifactRef: nonEmptyStringSchema,
  workUnitId: identifierSchema.optional(),
  evidence: z.array(nonEmptyStringSchema).min(1),
  finding: nonEmptyStringSchema,
  recommendedCorrection: nonEmptyStringSchema,
  resolutionStatus: z.enum(['open', 'resolved', 'not_applicable']),
}).superRefine((finding, context) => {
  if (finding.severity === 'no_issue' && finding.resolutionStatus !== 'not_applicable') {
    context.addIssue({ code: 'custom', path: ['resolutionStatus'], message: 'No-issue entries must be not_applicable' })
  }
  if (finding.severity !== 'no_issue' && finding.resolutionStatus !== 'open') {
    context.addIssue({ code: 'custom', path: ['resolutionStatus'], message: 'Independent reviewer findings must enter the register as open' })
  }
})

export const independentReviewReportSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('independent_review_report'),
  jobId: identifierSchema,
  reviewedCommit: commitShaSchema,
  deterministicValidationRef: nonEmptyStringSchema,
  contentFingerprint: nonEmptyStringSchema,
  decision: z.enum(['pass', 'conditional_pass', 'fail_hold']),
  findings: z.array(independentReviewFindingSchema).default([]),
  createdAt: nonEmptyStringSchema,
}).superRefine((report, context) => {
  const blockingOrMaterial = report.findings.some((finding) =>
    finding.resolutionStatus === 'open' && ['blocking', 'material'].includes(finding.severity),
  )
  const minor = report.findings.some((finding) => finding.resolutionStatus === 'open' && finding.severity === 'minor')
  if (blockingOrMaterial && report.decision !== 'fail_hold') {
    context.addIssue({ code: 'custom', path: ['decision'], message: 'Blocking/material findings require fail_hold' })
  }
  if (!blockingOrMaterial && report.decision === 'fail_hold') {
    context.addIssue({ code: 'custom', path: ['decision'], message: 'fail_hold requires a blocking/material finding' })
  }
  if (minor && report.decision === 'pass') {
    context.addIssue({ code: 'custom', path: ['decision'], message: 'Open minor findings require conditional_pass' })
  }
})

export const remediationWorkerOutputSchema = z.object({
  correctedArtifact: z.unknown(),
  correctedDependentMarkingPack: z.unknown().optional(),
  resolvedFindingIds: z.array(identifierSchema).min(1),
  resolutionNotes: z.array(nonEmptyStringSchema).min(1),
})

export const remediationRecordSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('remediation_record'),
  jobId: identifierSchema,
  triggerReviewRef: nonEmptyStringSchema,
  sourceReviewedCommit: commitShaSchema,
  correctedHeadSha: commitShaSchema,
  replacements: z.array(z.object({
    artifactKind: z.enum(['learning', 'practice', 'assessment_item', 'marking_pack']),
    oldRef: nonEmptyStringSchema,
    newRef: nonEmptyStringSchema,
    dependentOldRef: nonEmptyStringSchema.optional(),
    dependentNewRef: nonEmptyStringSchema.optional(),
    findingIds: z.array(identifierSchema).min(1),
  })).min(1),
  createdAt: nonEmptyStringSchema,
})

export type DeterministicValidationReport = z.infer<typeof deterministicValidationReportSchema>
export type IndependentReviewFinding = z.infer<typeof independentReviewFindingSchema>
export type IndependentReviewReport = z.infer<typeof independentReviewReportSchema>
export type AssuranceArtifactKind =
  | 'coverage_map'
  | 'validation_report'
  | 'independent_review_report'
  | 'remediated_artifact'
  | 'remediation_record'
  | 'course_content_pack'

export interface AssuranceArtifactStore {
  writeJson(input: { jobId: string; kind: AssuranceArtifactKind; fingerprint: string; value: unknown }): Promise<{ ref: string }>
  readJson(ref: string): Promise<unknown>
}

type ReviewableArtifactKind =
  | 'board_alignment'
  | 'coverage_map'
  | 'course_knowledge_model'
  | 'learning_blueprint'
  | 'learning'
  | 'practice'
  | 'assessment_blueprint'
  | 'question_family'
  | 'assessment_item'
  | 'marking_pack'
  | 'course_content_pack'

type ReviewableArtifact = { kind: ReviewableArtifactKind; ref: string; value: unknown }
type RemediationTarget =
  | { kind: 'learning' | 'practice' | 'marking_pack'; artifactRef: string; artifact: unknown }
  | { kind: 'assessment_item'; artifactRef: string; artifact: unknown; dependentMarkingPackRef: string; dependentMarkingPack: unknown }

export interface AssuranceAndRemediationWorkers {
  independentReview(input: {
    jobId: string
    reviewedCommit: string
    contentFingerprint: string
    courseIdentity: NonNullable<ContentFactoryJob['courseIdentity']>
    sourceEvidence: Array<{
      id: string
      issuer: string
      sourceType: string
      educationalRole: string[]
      useClass: string
      permissionBasis: string
      aiInputPermitted: boolean
      derivedCommercialUsePermitted: boolean
    }>
    boardAlignment: unknown
    coverageMap: unknown
    courseKnowledgeModel: unknown
    learningBlueprint: unknown
    assessmentBlueprint: unknown
    questionFamilies: unknown[]
    learningArtifacts: unknown[]
    practiceArtifacts: unknown[]
    assessmentItems: unknown[]
    markingPacks: unknown[]
    deterministicValidation: DeterministicValidationReport
  }): Promise<WorkerExecution<unknown>>
  remediate(input: {
    jobId: string
    reviewedCommit: string
    courseIdentity: NonNullable<ContentFactoryJob['courseIdentity']>
    target: RemediationTarget
    findings: IndependentReviewFinding[]
  }): Promise<WorkerExecution<unknown>>
}

export interface RemediationVersionPersister {
  persist(input: {
    job: ContentFactoryJob
    priorHeadSha: string
    replacementRefs: string[]
    now: string
  }): Promise<{ headSha: string }>
}

export const contentFactoryAssuranceWorkerContracts = {
  independentReview: {
    workerId: 'content-factory.independent-review',
    contractVersion: '1',
    contextRule: 'fresh-context-not-used-by-generation-review-or-remediation',
    sourceInput: 'structured-rights-metadata-plus-exact-revision-owned-artifacts-and-deterministic-evidence',
  },
  remediation: {
    workerId: 'content-factory.targeted-remediation',
    contractVersion: '1',
    contextRule: 'fresh-context-per-remediation-target',
    scopeRule: 'smallest-safe-downstream-artifact-scope',
  },
} as const

function appendWorkerRun(
  jobInput: ContentFactoryJob,
  stage: WorkerRun['stage'],
  execution: WorkerExecution<unknown>,
  updatedAt: string,
  refs: { inputRefs?: string[]; outputRefs?: string[] } = {},
) {
  const job = contentFactoryJobSchema.parse(jobInput)
  return contentFactoryJobSchema.parse({
    ...job,
    workerRuns: [...job.workerRuns, {
      id: execution.provenance.id,
      stage,
      contextId: execution.provenance.contextId,
      contractVersion: execution.provenance.contractVersion,
      provider: execution.provenance.provider,
      model: execution.provenance.model,
      inputRefs: refs.inputRefs ?? [],
      outputRefs: refs.outputRefs ?? [],
      status: execution.status,
      retryCount: execution.provenance.retryCount ?? 0,
      usageCost: execution.provenance.usageCost,
    }],
    updatedAt,
  })
}

function workerFailure(
  job: ContentFactoryJob,
  execution: Extract<WorkerExecution<unknown>, { status: 'failure' | 'infrastructure_failure' }>,
  stage: 'independent_review' | 'remediation',
  now: string,
) {
  return blockJob(appendWorkerRun(job, stage, execution, now), {
    id: `worker-failure-${execution.provenance.id}`,
    reason: `${stage} worker ${execution.status}: ${execution.error}`,
    createdAt: now,
  })
}

function blockContractViolation(job: ContentFactoryJob, id: string, reason: string, now: string) {
  return blockJob(job, { id, reason, createdAt: now })
}

function requireRunnableJob(jobInput: ContentFactoryJob) {
  const job = contentFactoryJobSchema.parse(jobInput)
  if (job.schemaVersion !== 2) throw new Error('Assurance factory requires a schema v2 job')
  if (job.state === 'blocked') throw new Error('Blocked jobs must be resumed before assurance can continue')
  if (!['validating', 'independent_review', 'remediation'].includes(job.state)) {
    throw new Error(`Content Factory job state ${job.state} is outside the assurance/remediation factory`)
  }
  if (!job.courseIdentity) throw new Error('Resolved course identity is required before assurance')
  if (job.sourceRightsStatus !== 'approved') throw new Error('Source rights must remain approved during assurance')
  if (!job.sourceLicenceRegisterRef || !job.boardAlignmentRef || !job.coverageMapRef || !job.courseKnowledgeModelRef || !job.learningBlueprintRef || !job.assessmentBlueprintRef) {
    throw new Error('Assurance requires all v2 source, alignment, knowledge, learning and assessment artifacts')
  }
  if (job.contentPackRefs.length === 0) throw new Error('Assurance requires an assembled course content pack')
  return job
}

function unique(values: string[]) {
  return [...new Set(values)]
}

function replaceRef(values: string[], oldRef: string, newRef: string) {
  return values.map((ref) => ref === oldRef ? newRef : ref)
}

function arraysEqual(left: readonly string[], right: readonly string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index])
}

function setsEqual(left: readonly string[], right: readonly string[]) {
  const a = new Set(left)
  const b = new Set(right)
  return a.size === b.size && [...a].every((value) => b.has(value))
}

function stableMetadataEqual(left: unknown[], right: unknown[]) {
  return JSON.stringify(left) === JSON.stringify(right)
}

async function latestManifest(job: ContentFactoryJob, store: AssuranceArtifactStore) {
  for (const ref of [...job.contentPackRefs].reverse()) {
    let value: unknown
    try {
      value = await store.readJson(ref)
    } catch {
      continue
    }
    const parsed = courseContentPackManifestSchema.safeParse(value)
    if (parsed.success && parsed.data.jobId === job.jobId) return { ref, manifest: parsed.data }
  }
  throw new Error('No valid course content pack manifest is available for assurance')
}

async function readBundle(job: ContentFactoryJob, store: AssuranceArtifactStore) {
  const sourceLicenceRegister = sourceLicenceRegisterSchema.parse(await store.readJson(job.sourceLicenceRegisterRef!))
  const boardAlignment = boardAlignmentSchema.parse(await store.readJson(job.boardAlignmentRef!))
  const coverageMap = coverageMapSchema.parse(await store.readJson(job.coverageMapRef!))
  const courseKnowledgeModel = courseKnowledgeModelSchema.parse(await store.readJson(job.courseKnowledgeModelRef!))
  const learningBlueprint = learningBlueprintSchema.parse(await store.readJson(job.learningBlueprintRef!))
  const assessmentBlueprint = executableAssessmentBlueprintSchema.parse(await store.readJson(job.assessmentBlueprintRef!))
  const { ref: manifestRef, manifest } = await latestManifest(job, store)

  const questionFamilies = await Promise.all(manifest.questionFamilyRefs.map(async (ref) => ({ ref, value: questionFamilySchema.parse(await store.readJson(ref)) })))
  const learningArtifacts = await Promise.all(manifest.learningArtifactRefs.map(async (ref) => ({ ref, value: learningPracticeArtifactSchema.parse(await store.readJson(ref)) })))
  const practiceArtifacts = await Promise.all(manifest.practiceArtifactRefs.map(async (ref) => ({ ref, value: learningPracticeArtifactSchema.parse(await store.readJson(ref)) })))
  const assessmentItems = await Promise.all(manifest.assessmentItemRefs.map(async (ref) => ({ ref, value: assessmentItemArtifactSchema.parse(await store.readJson(ref)) })))
  const markingPacks = await Promise.all(manifest.markingPackRefs.map(async (ref) => ({ ref, value: executableMarkingPackSchema.parse(await store.readJson(ref)) })))

  const artifacts = new Map<string, ReviewableArtifact>([
    [job.boardAlignmentRef!, { kind: 'board_alignment', ref: job.boardAlignmentRef!, value: boardAlignment }],
    [job.coverageMapRef!, { kind: 'coverage_map', ref: job.coverageMapRef!, value: coverageMap }],
    [job.courseKnowledgeModelRef!, { kind: 'course_knowledge_model', ref: job.courseKnowledgeModelRef!, value: courseKnowledgeModel }],
    [job.learningBlueprintRef!, { kind: 'learning_blueprint', ref: job.learningBlueprintRef!, value: learningBlueprint }],
    [job.assessmentBlueprintRef!, { kind: 'assessment_blueprint', ref: job.assessmentBlueprintRef!, value: assessmentBlueprint }],
    [manifestRef, { kind: 'course_content_pack', ref: manifestRef, value: manifest }],
  ])
  for (const entry of questionFamilies) artifacts.set(entry.ref, { kind: 'question_family', ...entry })
  for (const entry of learningArtifacts) artifacts.set(entry.ref, { kind: 'learning', ...entry })
  for (const entry of practiceArtifacts) artifacts.set(entry.ref, { kind: 'practice', ...entry })
  for (const entry of assessmentItems) artifacts.set(entry.ref, { kind: 'assessment_item', ...entry })
  for (const entry of markingPacks) artifacts.set(entry.ref, { kind: 'marking_pack', ...entry })

  return {
    sourceLicenceRegister,
    boardAlignment,
    coverageMap,
    courseKnowledgeModel,
    learningBlueprint,
    assessmentBlueprint,
    manifestRef,
    manifest,
    questionFamilies,
    learningArtifacts,
    practiceArtifacts,
    assessmentItems,
    markingPacks,
    artifacts,
  }
}

type AssuranceBundle = Awaited<ReturnType<typeof readBundle>>

function coverageEvidence(job: ContentFactoryJob, bundle: AssuranceBundle): CoverageEvidenceRef[] {
  const workUnitRequirements = new Map(job.workUnits.map((unit) => [unit.id, unit.requirementIds]))
  return [
    ...bundle.learningArtifacts.map((entry) => ({
      ref: entry.ref,
      requirementIds: workUnitRequirements.get(entry.value.workUnitId) ?? [],
      kind: 'learning' as const,
    })),
    ...bundle.practiceArtifacts.map((entry) => ({
      ref: entry.ref,
      requirementIds: workUnitRequirements.get(entry.value.workUnitId) ?? [],
      kind: 'practice' as const,
    })),
    ...bundle.assessmentItems.map((entry) => ({
      ref: entry.ref,
      requirementIds: entry.value.requirementIds,
      kind: 'assessment_item' as const,
    })),
  ]
}

async function finaliseCoverageForAssurance(
  jobInput: ContentFactoryJob,
  bundleInput: AssuranceBundle,
  store: AssuranceArtifactStore,
) {
  const evidence = coverageEvidence(jobInput, bundleInput)
  const finalised = finaliseCoverageMap({ coverageMap: bundleInput.coverageMap, evidence })
  if (JSON.stringify(finalised) === JSON.stringify(bundleInput.coverageMap)) {
    return { job: jobInput, bundle: bundleInput }
  }

  const write = await store.writeJson({
    jobId: jobInput.jobId,
    kind: 'coverage_map',
    fingerprint: await fingerprintValue(finalised),
    value: finalised,
  })
  const job = contentFactoryJobSchema.parse({ ...jobInput, coverageMapRef: write.ref })
  const artifacts = new Map(bundleInput.artifacts)
  artifacts.delete(jobInput.coverageMapRef!)
  artifacts.set(write.ref, { kind: 'coverage_map', ref: write.ref, value: finalised })
  return {
    job,
    bundle: { ...bundleInput, coverageMap: finalised, artifacts },
  }
}

async function bundleFingerprint(bundle: AssuranceBundle) {
  return fingerprintValue({
    manifest: bundle.manifest,
    boardAlignment: bundle.boardAlignment,
    coverageMap: bundle.coverageMap,
    courseKnowledgeModel: bundle.courseKnowledgeModel,
    learningBlueprint: bundle.learningBlueprint,
    assessmentBlueprint: bundle.assessmentBlueprint,
    questionFamilies: bundle.questionFamilies.map((entry) => entry.value),
    learningArtifacts: bundle.learningArtifacts.map((entry) => entry.value),
    practiceArtifacts: bundle.practiceArtifacts.map((entry) => entry.value),
    assessmentItems: bundle.assessmentItems.map((entry) => entry.value),
    markingPacks: bundle.markingPacks.map((entry) => entry.value),
  })
}

function check(
  checkId: string,
  status: 'pass' | 'fail' | 'not_applicable',
  message: string,
  artifactRefs: string[] = [],
  evidence: string[] = [],
  severity: 'blocking' | 'material' | 'minor' | 'informational' = status === 'fail' ? 'blocking' : 'informational',
) {
  return deterministicCheckSchema.parse({ checkId, status, message, artifactRefs, evidence, severity })
}

function coverageProblems(job: ContentFactoryJob, bundle: AssuranceBundle) {
  return finalCoverageProblems({ coverageMap: bundle.coverageMap, evidence: coverageEvidence(job, bundle) })
}

function compatibilityProblems(job: ContentFactoryJob, bundle: AssuranceBundle) {
  const problems: string[] = []
  if (bundle.sourceLicenceRegister.jobId !== job.jobId) problems.push('Source Licence Register job ID mismatch')
  if (bundle.boardAlignment.jobId !== job.jobId || bundle.coverageMap.jobId !== job.jobId || bundle.courseKnowledgeModel.jobId !== job.jobId || bundle.learningBlueprint.jobId !== job.jobId || bundle.assessmentBlueprint.jobId !== job.jobId || bundle.manifest.jobId !== job.jobId) problems.push('One or more first-class artifact job IDs do not match the job')
  if (bundle.boardAlignment.fingerprint !== bundle.manifest.boardAlignmentFingerprint) problems.push('Manifest Board Alignment fingerprint mismatch')
  if (bundle.courseKnowledgeModel.fingerprint !== bundle.manifest.knowledgeModelFingerprint) problems.push('Manifest Course Knowledge Model fingerprint mismatch')
  if (bundle.learningBlueprint.knowledgeModelFingerprint !== bundle.courseKnowledgeModel.fingerprint) problems.push('Learning Blueprint does not match the Course Knowledge Model')
  if (bundle.assessmentBlueprint.boardAlignmentFingerprint !== bundle.boardAlignment.fingerprint) problems.push('Assessment Blueprint does not match Board Alignment')
  if (bundle.manifest.assessmentBlueprintRef !== job.assessmentBlueprintRef) problems.push('Manifest Assessment Blueprint reference mismatch')
  if (!setsEqual(bundle.manifest.questionFamilyRefs, job.questionFamilyRefs)) problems.push('Manifest Question Family references do not match the job')
  if (!setsEqual(bundle.manifest.markableAssessmentItemIds, job.markableAssessmentItemIds)) problems.push('Manifest markable assessment IDs do not match the job')
  if (bundle.learningArtifacts.some((entry) => entry.value.artifactType !== 'learning')) problems.push('Learning artifact list contains a non-learning artifact')
  if (bundle.practiceArtifacts.some((entry) => entry.value.artifactType !== 'practice')) problems.push('Practice artifact list contains a non-practice artifact')
  if ([...bundle.learningArtifacts, ...bundle.practiceArtifacts].some((entry) => entry.value.knowledgeModelFingerprint !== bundle.courseKnowledgeModel.fingerprint)) problems.push('Learn/Practice artifact knowledge fingerprint mismatch')
  return problems
}

function assessmentProblems(job: ContentFactoryJob, bundle: AssuranceBundle) {
  const problems: string[] = []
  const families = new Map(bundle.questionFamilies.map((entry) => [entry.value.id, entry.value]))
  const items = new Map(bundle.assessmentItems.map((entry) => [entry.value.id, entry.value]))
  const packs = new Map(bundle.markingPacks.map((entry) => [entry.value.questionId, entry.value]))
  if (families.size !== bundle.questionFamilies.length) problems.push('Duplicate Question Family IDs')
  if (items.size !== bundle.assessmentItems.length) problems.push('Duplicate assessment item IDs')
  if (packs.size !== bundle.markingPacks.length) problems.push('Duplicate Marking Pack question IDs')

  const coverage = new Map(job.markingPackCoverage.map((entry) => [entry.assessmentItemId, entry.markingPackRef]))
  for (const item of bundle.assessmentItems.map((entry) => entry.value)) {
    const family = families.get(item.questionFamilyId)
    if (!family) {
      problems.push(`${item.id}: missing Question Family ${item.questionFamilyId}`)
      continue
    }
    if (!family.componentScope.includes(item.componentId)) problems.push(`${item.id}: component outside Question Family scope`)
    if (item.maxMark < family.markRange.min || item.maxMark > family.markRange.max) problems.push(`${item.id}: mark allocation outside Question Family range`)
    const pack = packs.get(item.id)
    if (!pack) {
      problems.push(`${item.id}: missing Marking Pack`)
      continue
    }
    if (pack.questionVersion !== item.version || pack.exactQuestionWording !== item.questionWording || pack.maxMark !== item.maxMark || pack.questionFamilyId !== item.questionFamilyId) problems.push(`${item.id}: Marking Pack does not match exact question identity/version/demand`)
    const aoMarks = pack.assessmentObjectiveAllocation.map((allocation) => allocation.marks).filter((marks): marks is number => marks !== undefined)
    if (aoMarks.length > 0 && aoMarks.reduce((sum, marks) => sum + marks, 0) !== item.maxMark) problems.push(`${item.id}: Marking Pack AO allocation does not total the maximum mark`)
    if (pack.indicativeContentPolicy !== 'non_exhaustive') problems.push(`${item.id}: indicative content is not governed as non-exhaustive`)
    if (pack.calibrationStatus === 'not_calibrated' && pack.anchors.some((anchor) => anchor.calibrationStatus === 'expert_calibrated')) problems.push(`${item.id}: uncalibrated Marking Pack contains an expert-calibrated anchor`)
    if (coverage.get(item.id) !== bundle.markingPacks.find((entry) => entry.value.questionId === item.id)?.ref) problems.push(`${item.id}: job Marking Pack coverage reference mismatch`)
  }
  for (const id of job.markableAssessmentItemIds) if (!items.has(id)) problems.push(`${id}: markable assessment ID missing from manifest items`)
  return problems
}

function calculationProblems(bundle: AssuranceBundle) {
  const problems: string[] = []
  const nodeMap = new Map(bundle.courseKnowledgeModel.nodes.map((node) => [node.id, node]))
  for (const item of bundle.assessmentItems.map((entry) => entry.value)) {
    if (item.format !== 'calculation') continue
    const formulas = item.knowledgeNodeIds.flatMap((id) => nodeMap.get(id)?.formulas ?? [])
    if (formulas.length === 0) problems.push(`${item.id}: calculation item is not linked to a structured formula rule`)
    if (item.context) {
      const labels = item.context.dataPoints.map((point) => point.label)
      if (new Set(labels).size !== labels.length) problems.push(`${item.id}: calculation context has duplicate structured data labels`)
    }
  }
  return problems
}

async function deterministicValidation(job: ContentFactoryJob, bundle: AssuranceBundle, reviewedCommit: string, now: string) {
  const contentFingerprint = await bundleFingerprint(bundle)
  const rightsProblems = bundle.sourceLicenceRegister.sources
    .filter((source) => ['PROHIBITED', 'UNKNOWN'].includes(source.useClass) || (source.useClass === 'REFERENCE_ONLY' && source.aiInputPermitted))
    .map((source) => `${source.id}: unsafe source-use state ${source.useClass}`)
  const coverage = coverageProblems(job, bundle)
  const compatibility = compatibilityProblems(job, bundle)
  const assessment = assessmentProblems(job, bundle)
  const calculation = calculationProblems(bundle)

  const checks = [
    check('source-rights', rightsProblems.length === 0 ? 'pass' : 'fail', rightsProblems.length === 0 ? 'All material source-use records remain admissible for this assurance stage.' : rightsProblems.join('; '), [job.sourceLicenceRegisterRef!], rightsProblems),
    check('coverage-completeness', coverage.length === 0 ? 'pass' : 'fail', coverage.length === 0 ? 'The canonical final Coverage Map is complete and its contentRefs exactly match generated Learn, Practice and Exam Prep evidence.' : coverage.join('; '), [job.coverageMapRef!, bundle.manifestRef], coverage),
    check('artifact-compatibility', compatibility.length === 0 ? 'pass' : 'fail', compatibility.length === 0 ? 'Version, job and fingerprint relationships are internally compatible.' : compatibility.join('; '), [bundle.manifestRef], compatibility),
    check('assessment-marking-integrity', assessment.length === 0 ? 'pass' : 'fail', assessment.length === 0 ? 'Assessment items, Question Families and Marking Packs are cross-consistent.' : assessment.join('; '), [...bundle.manifest.assessmentItemRefs, ...bundle.manifest.markingPackRefs], assessment),
    check('structured-calculation-integrity', calculation.length === 0 ? 'pass' : 'fail', calculation.length === 0 ? 'Structured calculation items are linked to formula rules and have non-duplicated data labels.' : calculation.join('; '), bundle.manifest.assessmentItemRefs, calculation, calculation.length === 0 ? 'informational' : 'material'),
  ]
  return deterministicValidationReportSchema.parse({
    schemaVersion: 1,
    artifactType: 'deterministic_validation_report',
    jobId: job.jobId,
    reviewedCommit,
    contentFingerprint,
    decision: checks.some((entry) => entry.status === 'fail') ? 'fail' : 'pass',
    checks,
    createdAt: now,
  })
}

function forbiddenReviewContexts(job: ContentFactoryJob) {
  return new Set(job.workerRuns
    .filter((run) => ['generation', 'independent_review', 'remediation'].includes(run.stage) && run.status === 'success')
    .map((run) => run.contextId))
}

function sourceEvidence(bundle: AssuranceBundle) {
  return bundle.sourceLicenceRegister.sources.map((source) => ({
    id: source.id,
    issuer: source.issuer,
    sourceType: source.sourceType,
    educationalRole: source.educationalRole,
    useClass: source.useClass,
    permissionBasis: source.permissionBasis,
    aiInputPermitted: source.aiInputPermitted,
    derivedCommercialUsePermitted: source.derivedCommercialUsePermitted,
  }))
}

function validateIndependentReviewOutput(
  output: unknown,
  job: ContentFactoryJob,
  bundle: AssuranceBundle,
  validationRef: string,
  validation: DeterministicValidationReport,
  now: string,
) {
  const parsed = z.object({
    reviewedCommit: commitShaSchema,
    contentFingerprint: nonEmptyStringSchema,
    decision: z.enum(['pass', 'conditional_pass', 'fail_hold']),
    findings: z.array(independentReviewFindingSchema).default([]),
  }).parse(output)
  if (parsed.reviewedCommit !== validation.reviewedCommit) throw new Error('Independent review must cover the exact deterministically validated commit')
  if (parsed.contentFingerprint !== validation.contentFingerprint) throw new Error('Independent review must cover the exact deterministically validated content fingerprint')
  const findingIds = parsed.findings.map((finding) => finding.id)
  if (new Set(findingIds).size !== findingIds.length) throw new Error('Independent review finding IDs must be unique')
  for (const finding of parsed.findings) {
    if (!bundle.artifacts.has(finding.artifactRef)) throw new Error(`Independent review finding ${finding.id} references unknown artifact ${finding.artifactRef}`)
    if (finding.workUnitId && !job.workUnits.some((unit) => unit.id === finding.workUnitId)) throw new Error(`Independent review finding ${finding.id} references unknown work unit ${finding.workUnitId}`)
  }
  return independentReviewReportSchema.parse({
    schemaVersion: 1,
    artifactType: 'independent_review_report',
    jobId: job.jobId,
    reviewedCommit: parsed.reviewedCommit,
    deterministicValidationRef: validationRef,
    contentFingerprint: parsed.contentFingerprint,
    decision: parsed.decision,
    findings: parsed.findings,
    createdAt: now,
  })
}

function unresolvedMaterialFindings(report: IndependentReviewReport) {
  return report.findings.filter((finding) => finding.resolutionStatus === 'open' && ['blocking', 'material'].includes(finding.severity))
}

function minorLimitations(report: IndependentReviewReport) {
  return report.findings
    .filter((finding) => finding.resolutionStatus === 'open' && finding.severity === 'minor')
    .map((finding) => `Independent review ${finding.id}: ${finding.finding}`)
}

function findDependentMarkingPack(bundle: AssuranceBundle, item: AssessmentItemArtifact) {
  const entry = bundle.markingPacks.find((candidate) => candidate.value.questionId === item.id)
  if (!entry) throw new Error(`Assessment item ${item.id} is missing its dependent Marking Pack`)
  return entry
}

function remediationTarget(bundle: AssuranceBundle, artifactRef: string): RemediationTarget | undefined {
  const artifact = bundle.artifacts.get(artifactRef)
  if (!artifact) return undefined
  if (artifact.kind === 'learning' || artifact.kind === 'practice' || artifact.kind === 'marking_pack') {
    return { kind: artifact.kind, artifactRef, artifact: artifact.value }
  }
  if (artifact.kind === 'assessment_item') {
    const item = assessmentItemArtifactSchema.parse(artifact.value)
    const dependent = findDependentMarkingPack(bundle, item)
    return {
      kind: 'assessment_item',
      artifactRef,
      artifact: item,
      dependentMarkingPackRef: dependent.ref,
      dependentMarkingPack: dependent.value,
    }
  }
  return undefined
}

function validateCorrectedLearningPractice(original: unknown, corrected: unknown) {
  const before = learningPracticeArtifactSchema.parse(original)
  const after = learningPracticeArtifactSchema.parse(corrected)
  const stableBefore = [before.schemaVersion, before.artifactType, before.jobId, before.workUnitId, before.knowledgeModelFingerprint, before.knowledgeNodeIds, before.sourceRefs]
  const stableAfter = [after.schemaVersion, after.artifactType, after.jobId, after.workUnitId, after.knowledgeModelFingerprint, after.knowledgeNodeIds, after.sourceRefs]
  if (!stableMetadataEqual(stableBefore, stableAfter)) throw new Error(`Remediation may not change governed identity/provenance for ${before.workUnitId}`)
  return after
}

function validateCorrectedMarkingPack(original: unknown, corrected: unknown) {
  const before = executableMarkingPackSchema.parse(original)
  const after = executableMarkingPackSchema.parse(corrected)
  const stableBefore = [before.schemaVersion, before.id, before.questionId, before.questionVersion, before.exactQuestionWording, before.contextRef, before.maxMark, before.conceptIds, before.questionFamilyId, before.assessmentBlueprintFingerprint, before.sourceRefs, before.questionOrigin, before.indicativeContentPolicy, before.calibrationStatus]
  const stableAfter = [after.schemaVersion, after.id, after.questionId, after.questionVersion, after.exactQuestionWording, after.contextRef, after.maxMark, after.conceptIds, after.questionFamilyId, after.assessmentBlueprintFingerprint, after.sourceRefs, after.questionOrigin, after.indicativeContentPolicy, after.calibrationStatus]
  if (!stableMetadataEqual(stableBefore, stableAfter)) throw new Error(`Marking Pack remediation may not change exact question identity/provenance for ${before.questionId}`)
  if (after.calibrationStatus === 'not_calibrated' && after.anchors.some((anchor) => anchor.calibrationStatus === 'expert_calibrated')) {
    throw new Error(`Marking Pack remediation may not invent expert calibration for ${before.questionId}`)
  }
  return after
}

function validateCorrectedAssessmentItem(original: unknown, corrected: unknown, bundle: AssuranceBundle) {
  const before = assessmentItemArtifactSchema.parse(original)
  const after = assessmentItemArtifactSchema.parse(corrected)
  const stableBefore = [before.schemaVersion, before.artifactType, before.jobId, before.id, before.version, before.componentId, before.questionFamilyId, before.requirementIds, before.knowledgeNodeIds, before.origin, before.presentationLabel, before.assessmentBlueprintFingerprint, before.knowledgeModelFingerprint, before.sourceRefs]
  const stableAfter = [after.schemaVersion, after.artifactType, after.jobId, after.id, after.version, after.componentId, after.questionFamilyId, after.requirementIds, after.knowledgeNodeIds, after.origin, after.presentationLabel, after.assessmentBlueprintFingerprint, after.knowledgeModelFingerprint, after.sourceRefs]
  if (!stableMetadataEqual(stableBefore, stableAfter)) throw new Error(`Assessment remediation may not change governed identity/provenance for ${before.id}`)
  const family = bundle.questionFamilies.find((entry) => entry.value.id === after.questionFamilyId)?.value
  if (!family) throw new Error(`Corrected assessment item ${after.id} has no Question Family`)
  if (!family.componentScope.includes(after.componentId)) throw new Error(`Corrected assessment item ${after.id} is outside Question Family component scope`)
  if (after.maxMark < family.markRange.min || after.maxMark > family.markRange.max) throw new Error(`Corrected assessment item ${after.id} mark allocation is outside Question Family range`)
  return after
}

function validateDependentPackForCorrectedItem(packInput: unknown, item: AssessmentItemArtifact, originalPack: unknown): ExecutableMarkingPack {
  const original = executableMarkingPackSchema.parse(originalPack)
  const pack = executableMarkingPackSchema.parse(packInput)
  if (pack.id !== original.id || pack.questionId !== item.id || pack.questionVersion !== item.version || pack.exactQuestionWording !== item.questionWording || pack.maxMark !== item.maxMark || pack.questionFamilyId !== item.questionFamilyId || pack.assessmentBlueprintFingerprint !== item.assessmentBlueprintFingerprint || pack.questionOrigin !== 'revision_owned' || pack.indicativeContentPolicy !== 'non_exhaustive') {
    throw new Error(`Dependent Marking Pack remediation does not match corrected assessment item ${item.id}`)
  }
  if (pack.calibrationStatus !== original.calibrationStatus) throw new Error(`Dependent Marking Pack remediation may not change calibration status for ${item.id}`)
  if (pack.calibrationStatus === 'not_calibrated' && pack.anchors.some((anchor) => anchor.calibrationStatus === 'expert_calibrated')) {
    throw new Error(`Dependent Marking Pack remediation may not invent expert calibration for ${item.id}`)
  }
  if (!arraysEqual(pack.sourceRefs, item.sourceRefs)) throw new Error(`Dependent Marking Pack source references do not match corrected assessment item ${item.id}`)
  const aoMarks = pack.assessmentObjectiveAllocation.map((allocation) => allocation.marks).filter((marks): marks is number => marks !== undefined)
  if (aoMarks.length > 0 && aoMarks.reduce((sum, marks) => sum + marks, 0) !== item.maxMark) throw new Error(`Dependent Marking Pack AO allocation does not total corrected item ${item.id}`)
  return pack
}

function updateJobForReplacement(jobInput: ContentFactoryJob, oldRef: string, newRef: string, kind: RemediationTarget['kind'], dependent?: { oldRef: string; newRef: string; itemId: string }) {
  const job = contentFactoryJobSchema.parse(jobInput)
  let next = job
  if (kind === 'learning' || kind === 'practice') {
    next = contentFactoryJobSchema.parse({
      ...next,
      workUnits: next.workUnits.map((unit) => ({ ...unit, outputRefs: replaceRef(unit.outputRefs, oldRef, newRef) })),
    })
  }
  if (kind === 'marking_pack') {
    const coverage = next.markingPackCoverage.find((entry) => entry.markingPackRef === oldRef)
    if (!coverage) throw new Error(`Marking Pack ${oldRef} is not represented in job coverage`)
    next = contentFactoryJobSchema.parse({
      ...next,
      markingPackCoverage: next.markingPackCoverage.map((entry) => entry.markingPackRef === oldRef ? { ...entry, markingPackRef: newRef } : entry),
    })
  }
  if (kind === 'assessment_item') {
    if (!dependent) throw new Error('Assessment-item remediation must provide a corrected dependent Marking Pack')
    next = contentFactoryJobSchema.parse({
      ...next,
      markingPackCoverage: next.markingPackCoverage.map((entry) => entry.assessmentItemId === dependent.itemId ? { ...entry, markingPackRef: dependent.newRef } : entry),
    })
  }
  return next
}

async function rewriteManifest(
  job: ContentFactoryJob,
  store: AssuranceArtifactStore,
  manifestInput: unknown,
  replacements: Array<{ kind: RemediationTarget['kind']; oldRef: string; newRef: string; dependentOldRef?: string; dependentNewRef?: string }>,
) {
  let manifest = courseContentPackManifestSchema.parse(manifestInput)
  for (const replacement of replacements) {
    if (replacement.kind === 'learning') manifest = courseContentPackManifestSchema.parse({ ...manifest, learningArtifactRefs: replaceRef(manifest.learningArtifactRefs, replacement.oldRef, replacement.newRef) })
    if (replacement.kind === 'practice') manifest = courseContentPackManifestSchema.parse({ ...manifest, practiceArtifactRefs: replaceRef(manifest.practiceArtifactRefs, replacement.oldRef, replacement.newRef) })
    if (replacement.kind === 'marking_pack') manifest = courseContentPackManifestSchema.parse({ ...manifest, markingPackRefs: replaceRef(manifest.markingPackRefs, replacement.oldRef, replacement.newRef) })
    if (replacement.kind === 'assessment_item') {
      manifest = courseContentPackManifestSchema.parse({
        ...manifest,
        assessmentItemRefs: replaceRef(manifest.assessmentItemRefs, replacement.oldRef, replacement.newRef),
        markingPackRefs: replacement.dependentOldRef && replacement.dependentNewRef
          ? replaceRef(manifest.markingPackRefs, replacement.dependentOldRef, replacement.dependentNewRef)
          : manifest.markingPackRefs,
      })
    }
  }
  const fingerprint = await fingerprintValue(manifest)
  const write = await store.writeJson({ jobId: job.jobId, kind: 'course_content_pack', fingerprint, value: manifest })
  return { ref: write.ref, manifest }
}

async function runRemediationCycle(input: {
  job: ContentFactoryJob
  bundle: AssuranceBundle
  report: IndependentReviewReport
  workers: AssuranceAndRemediationWorkers
  artifactStore: AssuranceArtifactStore
  versionPersister: RemediationVersionPersister
  currentHeadSha: string
  now: string
}) {
  let job = input.job
  const findings = unresolvedMaterialFindings(input.report)
  const grouped = new Map<string, IndependentReviewFinding[]>()
  for (const finding of findings) grouped.set(finding.artifactRef, [...(grouped.get(finding.artifactRef) ?? []), finding])

  const replacements: Array<{
    artifactKind: 'learning' | 'practice' | 'assessment_item' | 'marking_pack'
    oldRef: string
    newRef: string
    dependentOldRef?: string
    dependentNewRef?: string
    findingIds: string[]
  }> = []

  for (const [artifactRef, artifactFindings] of grouped) {
    const target = remediationTarget(input.bundle, artifactRef)
    if (!target) {
      const kind = input.bundle.artifacts.get(artifactRef)?.kind ?? 'unknown'
      return {
        job: blockContractViolation(
          job,
          `upstream-remediation-required-${artifactFindings[0].id}`,
          `Material finding ${artifactFindings[0].id} targets ${kind}. Safe remediation requires reopening the governed upstream stage rather than locally rewriting dependent truth.`,
          input.now,
        ),
        headSha: input.currentHeadSha,
      }
    }

    const execution = await input.workers.remediate({
      jobId: job.jobId,
      reviewedCommit: input.report.reviewedCommit,
      courseIdentity: job.courseIdentity!,
      target,
      findings: artifactFindings,
    })
    if (execution.status !== 'success') return { job: workerFailure(job, execution, 'remediation', input.now), headSha: input.currentHeadSha }
    if (forbiddenReviewContexts(job).has(execution.provenance.contextId)) {
      return {
        job: blockContractViolation(job, `remediation-context-reuse-${execution.provenance.id}`, 'Targeted remediation must use a fresh context rather than a generation/review/remediation context already used by this job.', input.now),
        headSha: input.currentHeadSha,
      }
    }

    const output = remediationWorkerOutputSchema.parse(execution.output)
    const expectedFindingIds = artifactFindings.map((finding) => finding.id).sort()
    const resolvedFindingIds = [...output.resolvedFindingIds].sort()
    if (!arraysEqual(expectedFindingIds, resolvedFindingIds)) throw new Error(`Remediation worker ${execution.provenance.id} must resolve exactly the findings assigned to its target`)

    let corrected: unknown
    let dependent: { oldRef: string; newRef: string; itemId: string } | undefined
    if (target.kind === 'learning' || target.kind === 'practice') corrected = validateCorrectedLearningPractice(target.artifact, output.correctedArtifact)
    else if (target.kind === 'marking_pack') corrected = validateCorrectedMarkingPack(target.artifact, output.correctedArtifact)
    else {
      if (target.kind !== 'assessment_item') throw new Error(`Unsupported remediation target kind: ${target.kind}`)
      const assessmentTarget = target
      const correctedItem = validateCorrectedAssessmentItem(assessmentTarget.artifact, output.correctedArtifact, input.bundle)
      if (!output.correctedDependentMarkingPack) throw new Error(`Assessment-item remediation for ${correctedItem.id} must also rebuild the dependent Marking Pack`)
      const correctedPack = validateDependentPackForCorrectedItem(output.correctedDependentMarkingPack, correctedItem, assessmentTarget.dependentMarkingPack)
      const packWrite = await input.artifactStore.writeJson({ jobId: job.jobId, kind: 'remediated_artifact', fingerprint: await fingerprintValue(correctedPack), value: correctedPack })
      dependent = { oldRef: assessmentTarget.dependentMarkingPackRef, newRef: packWrite.ref, itemId: correctedItem.id }
      corrected = correctedItem
    }

    const write = await input.artifactStore.writeJson({ jobId: job.jobId, kind: 'remediated_artifact', fingerprint: await fingerprintValue(corrected), value: corrected })
    job = appendWorkerRun(job, 'remediation', execution, input.now, {
      inputRefs: [artifactRef, input.report.deterministicValidationRef],
      outputRefs: dependent ? [write.ref, dependent.newRef] : [write.ref],
    })
    job = updateJobForReplacement(job, artifactRef, write.ref, target.kind, dependent)
    replacements.push({
      artifactKind: target.kind,
      oldRef: artifactRef,
      newRef: write.ref,
      dependentOldRef: dependent?.oldRef,
      dependentNewRef: dependent?.newRef,
      findingIds: artifactFindings.map((finding) => finding.id),
    })
  }

  const rewritten = await rewriteManifest(
    job,
    input.artifactStore,
    input.bundle.manifest,
    replacements.map((replacement) => ({
      kind: replacement.artifactKind,
      oldRef: replacement.oldRef,
      newRef: replacement.newRef,
      dependentOldRef: replacement.dependentOldRef,
      dependentNewRef: replacement.dependentNewRef,
    })),
  )
  job = contentFactoryJobSchema.parse({ ...job, contentPackRefs: [...job.contentPackRefs, rewritten.ref], updatedAt: input.now })

  const persisted = await input.versionPersister.persist({
    job,
    priorHeadSha: input.currentHeadSha,
    replacementRefs: replacements.flatMap((replacement) => [replacement.newRef, ...(replacement.dependentNewRef ? [replacement.dependentNewRef] : []), rewritten.ref]),
    now: input.now,
  })
  commitShaSchema.parse(persisted.headSha)

  const recordWithoutHead = {
    schemaVersion: 1 as const,
    artifactType: 'remediation_record' as const,
    jobId: job.jobId,
    triggerReviewRef: job.independentReview!.ref,
    sourceReviewedCommit: input.report.reviewedCommit,
    correctedHeadSha: persisted.headSha,
    replacements,
    createdAt: input.now,
  }
  const record = remediationRecordSchema.parse(recordWithoutHead)
  const recordWrite = await input.artifactStore.writeJson({ jobId: job.jobId, kind: 'remediation_record', fingerprint: await fingerprintValue(record), value: record })
  job = contentFactoryJobSchema.parse({
    ...job,
    remediation: { trigger: 'independent_review', status: 'complete', ref: recordWrite.ref, correctedHeadSha: persisted.headSha },
    updatedAt: input.now,
  })
  job = advanceJob(job, 'validating', input.now)
  return { job, headSha: persisted.headSha }
}

export async function runAssuranceAndRemediationFactory(input: {
  job: ContentFactoryJob
  artifactStore: AssuranceArtifactStore
  workers: AssuranceAndRemediationWorkers
  versionPersister: RemediationVersionPersister
  contentHeadSha: string
  now: string
  maxRemediationCycles?: number
}): Promise<ContentFactoryJob> {
  let job = requireRunnableJob(input.job)
  let currentHeadSha = commitShaSchema.parse(input.contentHeadSha)
  let remediationCycles = 0
  const maxRemediationCycles = input.maxRemediationCycles ?? 3

  while (true) {
    let bundle = await readBundle(job, input.artifactStore)

    if (job.state === 'validating') {
      const finalised = await finaliseCoverageForAssurance(job, bundle, input.artifactStore)
      job = finalised.job
      bundle = finalised.bundle
      const report = await deterministicValidation(job, bundle, currentHeadSha, input.now)
      const write = await input.artifactStore.writeJson({ jobId: job.jobId, kind: 'validation_report', fingerprint: await fingerprintValue(report), value: report })
      job = contentFactoryJobSchema.parse({
        ...job,
        validation: { status: report.decision, ref: write.ref, headSha: currentHeadSha },
        coverageCompleteness: report.checks.find((entry) => entry.checkId === 'coverage-completeness')?.status === 'pass' ? 'complete' : 'incomplete',
        artifactCompatibilityStatus: report.checks.find((entry) => entry.checkId === 'artifact-compatibility')?.status === 'pass' ? 'pass' : 'fail',
        updatedAt: input.now,
      })
      if (report.decision === 'fail') {
        const failures = report.checks.filter((entry) => entry.status === 'fail').map((entry) => `${entry.checkId}: ${entry.message}`)
        return blockJob(job, { id: `deterministic-assurance-failed-${currentHeadSha.slice(0, 12)}`, reason: `Deterministic assurance failed: ${failures.join(' | ')}`, createdAt: input.now })
      }
      job = advanceJob(job, 'independent_review', input.now)
    }

    const validationRef = job.validation?.ref
    if (!validationRef || job.validation?.status !== 'pass' || job.validation.headSha !== currentHeadSha) {
      throw new Error('Independent review requires deterministic PASS evidence for the exact current head')
    }
    const validation = deterministicValidationReportSchema.parse(await input.artifactStore.readJson(validationRef))

    if (job.state === 'independent_review' && job.independentReview?.reviewedCommit === currentHeadSha && job.independentReview.unresolvedBlocking === 0 && job.independentReview.unresolvedMaterial === 0) {
      return job
    }

    const forbiddenContexts = forbiddenReviewContexts(job)
    const execution = await input.workers.independentReview({
      jobId: job.jobId,
      reviewedCommit: currentHeadSha,
      contentFingerprint: validation.contentFingerprint,
      courseIdentity: job.courseIdentity!,
      sourceEvidence: sourceEvidence(bundle),
      boardAlignment: bundle.boardAlignment,
      coverageMap: bundle.coverageMap,
      courseKnowledgeModel: bundle.courseKnowledgeModel,
      learningBlueprint: bundle.learningBlueprint,
      assessmentBlueprint: bundle.assessmentBlueprint,
      questionFamilies: bundle.questionFamilies.map((entry) => entry.value),
      learningArtifacts: bundle.learningArtifacts.map((entry) => entry.value),
      practiceArtifacts: bundle.practiceArtifacts.map((entry) => entry.value),
      assessmentItems: bundle.assessmentItems.map((entry) => entry.value),
      markingPacks: bundle.markingPacks.map((entry) => entry.value),
      deterministicValidation: validation,
    })
    if (execution.status !== 'success') return workerFailure(job, execution, 'independent_review', input.now)
    if (forbiddenContexts.has(execution.provenance.contextId)) {
      return blockContractViolation(job, `independent-review-context-reuse-${execution.provenance.id}`, 'Independent review must use a successful fresh context that has not generated, reviewed or remediated this job.', input.now)
    }

    const review = validateIndependentReviewOutput(execution.output, job, bundle, validationRef, validation, input.now)
    const write = await input.artifactStore.writeJson({ jobId: job.jobId, kind: 'independent_review_report', fingerprint: await fingerprintValue(review), value: review })
    job = appendWorkerRun(job, 'independent_review', execution, input.now, { inputRefs: [bundle.manifestRef, validationRef, job.boardAlignmentRef!, job.coverageMapRef!, job.courseKnowledgeModelRef!, job.assessmentBlueprintRef!], outputRefs: [write.ref] })
    const unresolved = unresolvedMaterialFindings(review)
    job = contentFactoryJobSchema.parse({
      ...job,
      independentReview: {
        decision: review.decision,
        ref: write.ref,
        reviewedCommit: review.reviewedCommit,
        reviewerWorkerRunId: execution.provenance.id,
        unresolvedBlocking: unresolved.filter((finding) => finding.severity === 'blocking').length,
        unresolvedMaterial: unresolved.filter((finding) => finding.severity === 'material').length,
      },
      knownLimitations: unique([...job.knownLimitations, ...minorLimitations(review)]),
      updatedAt: input.now,
    })

    if (unresolved.length === 0) return job
    if (remediationCycles >= maxRemediationCycles) {
      return blockContractViolation(job, `remediation-cycle-limit-${currentHeadSha.slice(0, 12)}`, `Independent review still has blocking/material findings after ${maxRemediationCycles} targeted remediation cycles.`, input.now)
    }

    job = advanceJob(job, 'remediation', input.now)
    const remediated = await runRemediationCycle({
      job,
      bundle,
      report: { ...review, deterministicValidationRef: validationRef },
      workers: input.workers,
      artifactStore: input.artifactStore,
      versionPersister: input.versionPersister,
      currentHeadSha,
      now: input.now,
    })
    job = remediated.job
    currentHeadSha = remediated.headSha
    remediationCycles += 1
    if (job.state === 'blocked') return job
  }
}
