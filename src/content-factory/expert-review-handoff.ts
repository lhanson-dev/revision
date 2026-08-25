import { z } from 'zod'
import { advanceJob } from './orchestrator'
import {
  boardAlignmentSchema,
  contentFactoryJobSchema,
  courseIdentitySchema,
  courseKnowledgeModelSchema,
  coverageMapSchema,
  expertReviewContractSchema,
  expertReviewFindingSchema,
  learningBlueprintSchema,
  questionFamilySchema,
  sourceLicenceRegisterSchema,
  type ContentFactoryJob,
} from './schema'
import {
  assessmentItemArtifactSchema,
  courseContentPackManifestSchema,
  executableAssessmentBlueprintSchema,
  executableMarkingPackSchema,
} from './assessment-and-marking'
import { learningPracticeArtifactSchema } from './learning-and-practice'
import {
  deterministicValidationReportSchema,
  independentReviewReportSchema,
} from './assurance-and-remediation'
import { fingerprintValue } from './intake-to-knowledge-model'

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const nonEmptyStringSchema = z.string().min(1)
const commitShaSchema = z.string().regex(/^[0-9a-f]{40}$/)

const expertPackageArtifactKindSchema = z.enum([
  'board_alignment',
  'coverage_map',
  'course_knowledge_model',
  'learning_blueprint',
  'learning',
  'practice',
  'assessment_blueprint',
  'question_family',
  'assessment_item',
  'marking_pack',
  'course_content_pack',
])

export const expertReviewPackageSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('expert_review_package'),
  jobId: identifierSchema,
  packageVersion: z.literal('1'),
  reviewedCommit: commitShaSchema,
  courseIdentity: courseIdentitySchema,
  sourceLicenceRegisterRef: nonEmptyStringSchema,
  sourceLicenceSummary: z.array(z.object({
    id: identifierSchema,
    issuer: nonEmptyStringSchema,
    sourceType: nonEmptyStringSchema,
    educationalRole: z.array(nonEmptyStringSchema).min(1),
    useClass: z.enum(['OPEN', 'REVISION_OWNED', 'LICENSED', 'REFERENCE_ONLY', 'PROHIBITED', 'UNKNOWN']),
    permissionBasis: nonEmptyStringSchema,
  })).min(1),
  artifacts: z.array(z.object({
    kind: expertPackageArtifactKindSchema,
    ref: nonEmptyStringSchema,
    value: z.unknown(),
  })).min(1),
  automatedAssurance: z.object({
    validationRef: nonEmptyStringSchema,
    validationDecision: z.literal('pass'),
    independentReviewRef: nonEmptyStringSchema,
    independentReviewDecision: z.enum(['pass', 'conditional_pass']),
  }),
  knownLimitations: z.array(nonEmptyStringSchema),
  reviewInstructions: z.array(nonEmptyStringSchema).min(1),
  createdAt: nonEmptyStringSchema,
}).superRefine((pack, context) => {
  const refs = pack.artifacts.map((artifact) => artifact.ref)
  if (new Set(refs).size !== refs.length) {
    context.addIssue({ code: 'custom', path: ['artifacts'], message: 'Expert review package artifact references must be unique' })
  }
})

export const qualifiedExpertReviewSubmissionSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('qualified_expert_review_submission'),
  jobId: identifierSchema,
  reviewedCommit: commitShaSchema,
  packageRef: nonEmptyStringSchema,
  artifactRefs: z.array(nonEmptyStringSchema).min(1),
  knownLimitations: z.array(nonEmptyStringSchema),
  reviewer: z.object({
    reviewerId: identifierSchema,
    displayName: nonEmptyStringSchema,
    role: nonEmptyStringSchema,
    qualificationSummary: nonEmptyStringSchema,
  }),
  reviewedAt: nonEmptyStringSchema,
  decision: z.enum(['pass', 'conditional_pass', 'fail']),
  findings: z.array(expertReviewFindingSchema).default([]),
}).superRefine((submission, context) => {
  const ids = submission.findings.map((finding) => finding.id)
  if (new Set(ids).size !== ids.length) {
    context.addIssue({ code: 'custom', path: ['findings'], message: 'Expert review finding IDs must be unique' })
  }

  const openFindings = submission.findings.filter((finding) => finding.disposition === 'open')
  const blocking = openFindings.filter((finding) => finding.severity === 'blocking')
  const material = openFindings.filter((finding) => finding.severity === 'material')
  if (submission.decision === 'pass' && openFindings.length > 0) {
    context.addIssue({ code: 'custom', path: ['decision'], message: 'A passed expert review cannot retain open findings' })
  }
  if (submission.decision === 'conditional_pass' && material.length === 0) {
    context.addIssue({ code: 'custom', path: ['decision'], message: 'A conditional expert review requires at least one open material finding' })
  }
  if (submission.decision === 'fail' && blocking.length === 0) {
    context.addIssue({ code: 'custom', path: ['decision'], message: 'A failed expert review requires at least one open blocking finding' })
  }
  if (submission.decision !== 'fail' && blocking.length > 0) {
    context.addIssue({ code: 'custom', path: ['decision'], message: 'Open blocking findings require a failed expert-review decision' })
  }
})

export type ExpertReviewPackage = z.infer<typeof expertReviewPackageSchema>
export type QualifiedExpertReviewSubmission = z.infer<typeof qualifiedExpertReviewSubmissionSchema>
export type ExpertReviewArtifactKind = 'expert_review_package' | 'expert_review_contract' | 'expert_review_submission'

export interface ExpertReviewArtifactStore {
  writeJson(input: { jobId: string; kind: ExpertReviewArtifactKind; fingerprint: string; value: unknown }): Promise<{ ref: string }>
  readJson(ref: string): Promise<unknown>
}

function arraysEqual(left: readonly string[], right: readonly string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index])
}

function requirePackagingJob(jobInput: ContentFactoryJob) {
  const job = contentFactoryJobSchema.parse(jobInput)
  if (job.schemaVersion !== 2) throw new Error('Expert-review handoff requires a schema v2 job')
  if (job.state === 'blocked') throw new Error('Blocked jobs must be resumed before expert-review packaging')
  if (!['independent_review', 'expert_review_packaging', 'expert_review_ready'].includes(job.state)) {
    throw new Error(`Content Factory job state ${job.state} is outside expert-review packaging`)
  }
  if (!job.courseIdentity) throw new Error('Resolved course identity is required for expert-review packaging')
  if (!job.independentReview?.ref || !job.validation?.ref) throw new Error('Expert-review packaging requires deterministic and independent-review evidence')
  if (!job.sourceLicenceRegisterRef || !job.boardAlignmentRef || !job.coverageMapRef || !job.courseKnowledgeModelRef || !job.learningBlueprintRef || !job.assessmentBlueprintRef) {
    throw new Error('Expert-review packaging requires all v2 authority and blueprint artifacts')
  }
  if (job.contentPackRefs.length === 0) throw new Error('Expert-review packaging requires an assembled course content pack')
  return job
}

async function latestManifest(job: ContentFactoryJob, store: ExpertReviewArtifactStore) {
  for (const ref of [...job.contentPackRefs].reverse()) {
    try {
      const parsed = courseContentPackManifestSchema.safeParse(await store.readJson(ref))
      if (parsed.success && parsed.data.jobId === job.jobId) return { ref, manifest: parsed.data }
    } catch {
      // Continue to older immutable package references.
    }
  }
  throw new Error('No valid course content pack manifest is available for expert-review packaging')
}

async function readPackageArtifacts(job: ContentFactoryJob, store: ExpertReviewArtifactStore) {
  const sourceLicenceRegister = sourceLicenceRegisterSchema.parse(await store.readJson(job.sourceLicenceRegisterRef!))
  const boardAlignment = boardAlignmentSchema.parse(await store.readJson(job.boardAlignmentRef!))
  const coverageMap = coverageMapSchema.parse(await store.readJson(job.coverageMapRef!))
  const courseKnowledgeModel = courseKnowledgeModelSchema.parse(await store.readJson(job.courseKnowledgeModelRef!))
  const learningBlueprint = learningBlueprintSchema.parse(await store.readJson(job.learningBlueprintRef!))
  const assessmentBlueprint = executableAssessmentBlueprintSchema.parse(await store.readJson(job.assessmentBlueprintRef!))
  const validation = deterministicValidationReportSchema.parse(await store.readJson(job.validation!.ref!))
  const independentReview = independentReviewReportSchema.parse(await store.readJson(job.independentReview!.ref))
  const { ref: manifestRef, manifest } = await latestManifest(job, store)

  const artifacts: ExpertReviewPackage['artifacts'] = [
    { kind: 'board_alignment', ref: job.boardAlignmentRef!, value: boardAlignment },
    { kind: 'coverage_map', ref: job.coverageMapRef!, value: coverageMap },
    { kind: 'course_knowledge_model', ref: job.courseKnowledgeModelRef!, value: courseKnowledgeModel },
    { kind: 'learning_blueprint', ref: job.learningBlueprintRef!, value: learningBlueprint },
    { kind: 'assessment_blueprint', ref: job.assessmentBlueprintRef!, value: assessmentBlueprint },
    { kind: 'course_content_pack', ref: manifestRef, value: manifest },
  ]

  for (const ref of manifest.learningArtifactRefs) artifacts.push({ kind: 'learning', ref, value: learningPracticeArtifactSchema.parse(await store.readJson(ref)) })
  for (const ref of manifest.practiceArtifactRefs) artifacts.push({ kind: 'practice', ref, value: learningPracticeArtifactSchema.parse(await store.readJson(ref)) })
  for (const ref of manifest.questionFamilyRefs) artifacts.push({ kind: 'question_family', ref, value: questionFamilySchema.parse(await store.readJson(ref)) })
  for (const ref of manifest.assessmentItemRefs) artifacts.push({ kind: 'assessment_item', ref, value: assessmentItemArtifactSchema.parse(await store.readJson(ref)) })
  for (const ref of manifest.markingPackRefs) artifacts.push({ kind: 'marking_pack', ref, value: executableMarkingPackSchema.parse(await store.readJson(ref)) })

  return { sourceLicenceRegister, validation, independentReview, artifacts }
}

export async function packageExpertReview(input: {
  job: ContentFactoryJob
  artifactStore: ExpertReviewArtifactStore
  now: string
}): Promise<{ job: ContentFactoryJob; package: ExpertReviewPackage; contract: z.infer<typeof expertReviewContractSchema> }> {
  let job = requirePackagingJob(input.job)

  if (job.state === 'expert_review_ready' && job.expertReviewPackage?.status === 'complete') {
    const pack = expertReviewPackageSchema.parse(await input.artifactStore.readJson(job.expertReviewPackage.packageRef!))
    const contract = expertReviewContractSchema.parse(await input.artifactStore.readJson(job.expertReviewPackage.contractRef!))
    return { job, package: pack, contract }
  }

  if (job.state === 'independent_review') job = advanceJob(job, 'expert_review_packaging', input.now)

  const { sourceLicenceRegister, validation, independentReview, artifacts } = await readPackageArtifacts(job, input.artifactStore)
  const reviewedCommit = job.independentReview!.reviewedCommit
  if (job.validation?.status !== 'pass' || validation.decision !== 'pass') throw new Error('Expert-review package requires deterministic PASS evidence')
  if (validation.reviewedCommit !== reviewedCommit || independentReview.reviewedCommit !== reviewedCommit) {
    throw new Error('Expert-review package must bind deterministic and independent review to the same exact commit')
  }
  if (independentReview.decision === 'fail_hold') throw new Error('A FAIL/HOLD independent review cannot be packaged for expert review')

  const pack = expertReviewPackageSchema.parse({
    schemaVersion: 1,
    artifactType: 'expert_review_package',
    jobId: job.jobId,
    packageVersion: '1',
    reviewedCommit,
    courseIdentity: job.courseIdentity,
    sourceLicenceRegisterRef: job.sourceLicenceRegisterRef,
    sourceLicenceSummary: sourceLicenceRegister.sources.map((source) => ({
      id: source.id,
      issuer: source.issuer,
      sourceType: source.sourceType,
      educationalRole: source.educationalRole,
      useClass: source.useClass,
      permissionBasis: source.permissionBasis,
    })),
    artifacts,
    automatedAssurance: {
      validationRef: job.validation!.ref,
      validationDecision: 'pass',
      independentReviewRef: job.independentReview!.ref,
      independentReviewDecision: independentReview.decision,
    },
    knownLimitations: job.knownLimitations,
    reviewInstructions: [
      'Review the educational accuracy, clarity and appropriateness of the Revision-authored learning and practice material.',
      'Review assessment authenticity, mark allocations, rubric logic, legitimate alternative reasoning routes and misconceptions.',
      'Do not treat this package as awarding-body authored or endorsed material.',
      'Return findings only through the machine-readable expert-review contract tied to this exact package and commit.',
    ],
    createdAt: input.now,
  })

  const packageWrite = await input.artifactStore.writeJson({
    jobId: job.jobId,
    kind: 'expert_review_package',
    fingerprint: await fingerprintValue(pack),
    value: pack,
  })

  const contract = expertReviewContractSchema.parse({
    schemaVersion: 1,
    jobId: job.jobId,
    reviewedCommit,
    packageRef: packageWrite.ref,
    artifactRefs: artifacts.map((artifact) => artifact.ref),
    knownLimitations: job.knownLimitations,
    decision: 'pending',
    findings: [],
  })
  const contractWrite = await input.artifactStore.writeJson({
    jobId: job.jobId,
    kind: 'expert_review_contract',
    fingerprint: await fingerprintValue(contract),
    value: contract,
  })

  job = contentFactoryJobSchema.parse({
    ...job,
    expertReviewPackage: {
      status: 'complete',
      packageRef: packageWrite.ref,
      contractRef: contractWrite.ref,
      reviewedCommit,
    },
    updatedAt: input.now,
  })
  job = advanceJob(job, 'expert_review_ready', input.now)
  return { job, package: pack, contract }
}

function requireImportJob(jobInput: ContentFactoryJob) {
  const job = contentFactoryJobSchema.parse(jobInput)
  if (job.schemaVersion !== 2) throw new Error('Expert-review import requires a schema v2 job')
  if (job.state === 'blocked') throw new Error('Blocked jobs must be resumed before expert-review import')
  if (!['expert_review_ready', 'human_review'].includes(job.state)) {
    throw new Error(`Content Factory job state ${job.state} is outside expert-review import`)
  }
  if (job.expertReviewPackage?.status !== 'complete' || !job.expertReviewPackage.packageRef || !job.expertReviewPackage.contractRef || !job.expertReviewPackage.reviewedCommit) {
    throw new Error('Expert-review import requires a complete exact-version package and contract')
  }
  return job
}

export async function importQualifiedExpertReview(input: {
  job: ContentFactoryJob
  submission: unknown
  artifactStore: ExpertReviewArtifactStore
  now: string
}): Promise<{ job: ContentFactoryJob; submission: QualifiedExpertReviewSubmission; submissionRef: string }> {
  let job = requireImportJob(input.job)
  const submission = qualifiedExpertReviewSubmissionSchema.parse(input.submission)
  const contract = expertReviewContractSchema.parse(await input.artifactStore.readJson(job.expertReviewPackage!.contractRef!))
  const pack = expertReviewPackageSchema.parse(await input.artifactStore.readJson(job.expertReviewPackage!.packageRef!))

  if (submission.jobId !== job.jobId || contract.jobId !== job.jobId || pack.jobId !== job.jobId) throw new Error('Expert-review import job ID does not match the packaged course job')
  if (submission.packageRef !== job.expertReviewPackage!.packageRef || contract.packageRef !== submission.packageRef) throw new Error('Expert-review import package reference does not match the exported contract')
  if (submission.reviewedCommit !== job.expertReviewPackage!.reviewedCommit || contract.reviewedCommit !== submission.reviewedCommit || pack.reviewedCommit !== submission.reviewedCommit) {
    throw new Error('Expert-review import must cover the exact packaged commit')
  }
  if (!arraysEqual(submission.artifactRefs, contract.artifactRefs)) throw new Error('Expert-review import artifact references must exactly match the exported contract')
  if (!arraysEqual(submission.knownLimitations, contract.knownLimitations)) throw new Error('Expert-review import known limitations must exactly match the exported contract')

  const knownArtifactRefs = new Set(contract.artifactRefs)
  for (const finding of submission.findings) {
    if (!knownArtifactRefs.has(finding.artifactRef)) throw new Error(`Expert review finding ${finding.id} references artifact outside the exported package`)
    if (finding.workUnitId && !job.workUnits.some((unit) => unit.id === finding.workUnitId)) {
      throw new Error(`Expert review finding ${finding.id} references unknown work unit ${finding.workUnitId}`)
    }
  }

  const submissionWrite = await input.artifactStore.writeJson({
    jobId: job.jobId,
    kind: 'expert_review_submission',
    fingerprint: await fingerprintValue(submission),
    value: submission,
  })

  if (job.state === 'expert_review_ready') job = advanceJob(job, 'human_review', input.now)
  const open = submission.findings.filter((finding) => finding.disposition === 'open')
  const unresolvedBlocking = open.filter((finding) => finding.severity === 'blocking').length
  const unresolvedMaterial = open.filter((finding) => finding.severity === 'material').length
  job = contentFactoryJobSchema.parse({
    ...job,
    humanReview: {
      status: submission.decision,
      ref: submissionWrite.ref,
      reviewedCommit: submission.reviewedCommit,
      unresolvedBlocking,
      unresolvedMaterial,
    },
    updatedAt: input.now,
  })

  if (unresolvedBlocking + unresolvedMaterial > 0) {
    job = contentFactoryJobSchema.parse({
      ...job,
      remediation: { trigger: 'expert_review', status: 'pending' },
      updatedAt: input.now,
    })
    job = advanceJob(job, 'remediation', input.now)
  }

  return { job, submission, submissionRef: submissionWrite.ref }
}