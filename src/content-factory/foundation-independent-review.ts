import { z } from 'zod'
import {
  boardAlignmentSchema,
  courseKnowledgeModelSchema,
  questionFamilySchema,
  sourceLicenceRegisterSchema,
  type BoardAlignment,
  type CourseKnowledgeModel,
  type QuestionFamily,
  type SourceLicenceRegister,
} from './schema'
import {
  fingerprintFoundationArtifact,
  foundationAssessmentBlueprintSchema,
  foundationCoverageModelSchema,
  type FoundationAssessmentBlueprint,
  type FoundationCoverageModel,
  type FoundationWorkerExecution,
  type FoundationWorkerExecutionProvenance,
} from './foundation-compilation'
import {
  foundationDeterministicAssuranceReportSchema,
  runDeterministicFoundationAssurance,
  type FoundationDeterministicAssuranceReport,
} from './foundation-assurance'
import {
  foundationCandidateSchema,
  foundationJobSchema,
  type FoundationArtifactRef,
  type FoundationCandidate,
  type FoundationJob,
} from './foundation-schema'
import {
  blockFoundationJob,
  computeFoundationFingerprint,
  recordIndependentFoundationReview,
} from './foundation-lifecycle'

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const nonEmptyStringSchema = z.string().min(1)
const commitShaSchema = z.string().regex(/^[0-9a-f]{40}$/)
const sha256Schema = z.string().regex(/^[0-9a-f]{64}$/)

export const foundationReviewableArtifactKindSchema = z.enum([
  'source_licence_register',
  'board_alignment',
  'foundation_coverage_model',
  'course_knowledge_model',
  'assessment_blueprint',
  'question_family',
])

export const foundationIndependentReviewFindingSchema = z.object({
  id: identifierSchema,
  severity: z.enum(['blocking', 'material', 'minor', 'no_issue']),
  issueType: nonEmptyStringSchema,
  artifactKind: foundationReviewableArtifactKindSchema,
  artifactRef: nonEmptyStringSchema,
  evidence: z.array(nonEmptyStringSchema).min(1),
  finding: nonEmptyStringSchema,
  recommendedCorrection: nonEmptyStringSchema,
  resolutionStatus: z.enum(['open', 'not_applicable']),
}).superRefine((finding, context) => {
  if (finding.severity === 'no_issue' && finding.resolutionStatus !== 'not_applicable') {
    context.addIssue({ code: 'custom', path: ['resolutionStatus'], message: 'No-issue Foundation review entries must be not_applicable' })
  }
  if (finding.severity !== 'no_issue' && finding.resolutionStatus !== 'open') {
    context.addIssue({ code: 'custom', path: ['resolutionStatus'], message: 'Foundation review findings must enter the issue register as open' })
  }
})

const foundationWorkerEvidenceSchema = z.object({
  workerRunId: nonEmptyStringSchema,
  contextId: nonEmptyStringSchema,
  contractVersion: nonEmptyStringSchema,
  provider: nonEmptyStringSchema.optional(),
  model: nonEmptyStringSchema.optional(),
  retryCount: z.number().int().nonnegative().optional(),
  usageCost: z.number().nonnegative().optional(),
})

export const foundationIndependentReviewReportSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('foundation_independent_review_report'),
  jobId: identifierSchema,
  candidateId: identifierSchema,
  reviewedCommit: commitShaSchema,
  deterministicAssuranceRef: nonEmptyStringSchema,
  foundationFingerprint: sha256Schema,
  decision: z.enum(['pass', 'fail_hold']),
  findings: z.array(foundationIndependentReviewFindingSchema).default([]),
  reviewer: foundationWorkerEvidenceSchema,
  excludedContextIds: z.array(nonEmptyStringSchema).default([]),
  createdAt: nonEmptyStringSchema,
}).superRefine((report, context) => {
  const material = report.findings.some((finding) => finding.resolutionStatus === 'open' && ['blocking', 'material'].includes(finding.severity))
  if (material && report.decision !== 'fail_hold') {
    context.addIssue({ code: 'custom', path: ['decision'], message: 'Blocking/material Foundation review findings require fail_hold' })
  }
  if (!material && report.decision !== 'pass') {
    context.addIssue({ code: 'custom', path: ['decision'], message: 'Foundation review without blocking/material findings must pass' })
  }
  if (report.excludedContextIds.includes(report.reviewer.contextId)) {
    context.addIssue({
      code: 'custom',
      path: ['reviewer', 'contextId'],
      message: 'Independent Foundation review must use a context excluded from prior generation/review/remediation contexts',
    })
  }
})

export const foundationRemediationReplacementSchema = z.object({
  artifactKind: z.enum(['course_knowledge_model', 'assessment_blueprint', 'question_family']),
  oldRef: nonEmptyStringSchema,
  correctedArtifact: z.unknown(),
})

export const foundationRemediationWorkerOutputSchema = z.object({
  resolvedFindingIds: z.array(identifierSchema).min(1),
  replacements: z.array(foundationRemediationReplacementSchema).min(1),
  resolutionNotes: z.array(nonEmptyStringSchema).min(1),
})

export const foundationRemediationRecordSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('foundation_remediation_record'),
  jobId: identifierSchema,
  sourceCandidateId: identifierSchema,
  sourceFoundationFingerprint: sha256Schema,
  triggerReviewRef: nonEmptyStringSchema,
  reviewedCommit: commitShaSchema,
  remediationWorker: foundationWorkerEvidenceSchema,
  resolvedFindingIds: z.array(identifierSchema).min(1),
  resolutionNotes: z.array(nonEmptyStringSchema).min(1),
  replacements: z.array(z.object({
    artifactKind: z.enum(['course_knowledge_model', 'assessment_blueprint', 'question_family']),
    oldRef: nonEmptyStringSchema,
    newRef: nonEmptyStringSchema,
    oldFingerprint: nonEmptyStringSchema,
    newFingerprint: nonEmptyStringSchema,
    directFindingIds: z.array(identifierSchema).default([]),
  })).min(1),
  remediatedCandidateId: identifierSchema,
  remediatedFoundationFingerprint: sha256Schema,
  deterministicReassurance: z.object({
    decision: z.enum(['pass', 'fail']),
    reportRef: nonEmptyStringSchema,
    reviewedCommit: commitShaSchema,
  }),
  createdAt: nonEmptyStringSchema,
})

export type FoundationReviewableArtifactKind = z.infer<typeof foundationReviewableArtifactKindSchema>
export type FoundationIndependentReviewFinding = z.infer<typeof foundationIndependentReviewFindingSchema>
export type FoundationIndependentReviewReport = z.infer<typeof foundationIndependentReviewReportSchema>
export type FoundationRemediationRecord = z.infer<typeof foundationRemediationRecordSchema>

export type FoundationIndependentReviewArtifactKind =
  | 'foundation_deterministic_assurance_report'
  | 'foundation_independent_review_report'
  | 'foundation_remediation_record'
  | 'course_knowledge_model'
  | 'assessment_blueprint'
  | 'question_family'

export interface FoundationIndependentReviewArtifactStore {
  readJson(ref: string): Promise<unknown>
  writeJson(input: {
    jobId: string
    kind: FoundationIndependentReviewArtifactKind
    fingerprint: string
    value: unknown
  }): Promise<{ ref: string }>
}

export type FoundationReviewArtifactEntry = {
  artifactKind: FoundationReviewableArtifactKind
  artifactRef: string
  value: unknown
}

type FoundationBundle = {
  sourceLicenceRegister: SourceLicenceRegister
  boardAlignment: BoardAlignment
  coverageModel: FoundationCoverageModel
  courseKnowledgeModel: CourseKnowledgeModel
  assessmentBlueprint: FoundationAssessmentBlueprint
  questionFamilies: Array<{ artifact: FoundationArtifactRef; value: QuestionFamily }>
  artifactIndex: FoundationReviewArtifactEntry[]
  artifacts: Map<string, FoundationReviewArtifactEntry>
}

export type FoundationRemediationTarget = {
  artifactKind: 'course_knowledge_model' | 'assessment_blueprint' | 'question_family'
  oldRef: string
  value: unknown
  reason: 'direct_finding' | 'dependency'
  findings: FoundationIndependentReviewFinding[]
}

type RightsSafeSourceEvidence = Array<{
  id: string
  issuer: string
  sourceType: string
  educationalRole: string[]
  useClass: string
  permissionBasis: string
  aiInputPermitted: boolean
  derivedCommercialUsePermitted: boolean
  restrictions: string[]
}>

export interface FoundationIndependentReviewWorkers {
  independentReview(input: {
    jobId: string
    candidateId: string
    reviewedCommit: string
    foundationFingerprint: string
    courseIdentity: FoundationCandidate['courseIdentity']
    cohortValidity: FoundationCandidate['cohortValidity']
    sourceEvidence: RightsSafeSourceEvidence
    artifactIndex: FoundationReviewArtifactEntry[]
    boardAlignment: BoardAlignment
    coverageModel: FoundationCoverageModel
    courseKnowledgeModel: CourseKnowledgeModel
    assessmentBlueprint: FoundationAssessmentBlueprint
    questionFamilies: QuestionFamily[]
    deterministicAssurance: FoundationDeterministicAssuranceReport
  }): Promise<FoundationWorkerExecution<unknown>>
  remediate(input: {
    jobId: string
    sourceCandidateId: string
    reviewedCommit: string
    foundationFingerprint: string
    courseIdentity: FoundationCandidate['courseIdentity']
    cohortValidity: FoundationCandidate['cohortValidity']
    sourceEvidence: RightsSafeSourceEvidence
    artifactIndex: FoundationReviewArtifactEntry[]
    boardAlignment: BoardAlignment
    coverageModel: FoundationCoverageModel
    courseKnowledgeModel: CourseKnowledgeModel
    assessmentBlueprint: FoundationAssessmentBlueprint
    questionFamilies: QuestionFamily[]
    triggerReview: FoundationIndependentReviewReport
    targets: FoundationRemediationTarget[]
  }): Promise<FoundationWorkerExecution<unknown>>
}

export const foundationIndependentReviewWorkerContracts = {
  independentReview: {
    workerId: 'content-factory.foundation.independent-review',
    contractVersion: '1',
    contextRule: 'fresh-context-not-used-by-foundation-generation-review-or-remediation',
    sourceInput: 'rights-governed-structured-source-metadata-plus-exact-foundation-artifacts-and-deterministic-evidence',
    reviewRule: 'find-and-classify-educational-and-assessment-errors-not-prose-improvement',
  },
  remediation: {
    workerId: 'content-factory.foundation.targeted-remediation',
    contractVersion: '1',
    contextRule: 'fresh-context-not-used-by-foundation-generation-review-or-remediation',
    scopeRule: 'smallest-safe-foundation-dependency-closure',
  },
} as const

function unique(values: Iterable<string>) {
  return [...new Set(values)]
}

function sameSet(left: Iterable<string>, right: Iterable<string>) {
  const a = new Set(left)
  const b = new Set(right)
  return a.size === b.size && [...a].every((value) => b.has(value))
}

function exactSet(left: string[], right: string[]) {
  return left.length === right.length && sameSet(left, right)
}

function workerEvidence(provenance: FoundationWorkerExecutionProvenance) {
  return foundationWorkerEvidenceSchema.parse({
    workerRunId: provenance.id,
    contextId: provenance.contextId,
    contractVersion: provenance.contractVersion,
    provider: provenance.provider,
    model: provenance.model,
    retryCount: provenance.retryCount,
    usageCost: provenance.usageCost,
  })
}

function sourceEvidence(register: SourceLicenceRegister): RightsSafeSourceEvidence {
  return register.sources.map((source) => ({
    id: source.id,
    issuer: source.issuer,
    sourceType: source.sourceType,
    educationalRole: source.educationalRole,
    useClass: source.useClass,
    permissionBasis: source.permissionBasis,
    aiInputPermitted: source.aiInputPermitted,
    derivedCommercialUsePermitted: source.derivedCommercialUsePermitted,
    restrictions: source.restrictions,
  }))
}

async function readBundle(candidate: FoundationCandidate, store: FoundationIndependentReviewArtifactStore): Promise<FoundationBundle> {
  const sourceLicenceRegister = sourceLicenceRegisterSchema.parse(await store.readJson(candidate.sourceLicenceRegister.ref))
  const boardAlignment = boardAlignmentSchema.parse(await store.readJson(candidate.boardAlignment.ref))
  const coverageModel = foundationCoverageModelSchema.parse(await store.readJson(candidate.coverageModel.ref))
  const courseKnowledgeModel = courseKnowledgeModelSchema.parse(await store.readJson(candidate.courseKnowledgeModel.ref))
  const assessmentBlueprint = foundationAssessmentBlueprintSchema.parse(await store.readJson(candidate.assessmentBlueprint.ref))
  const questionFamilies = await Promise.all(candidate.questionFamilies.map(async (artifact) => ({
    artifact,
    value: questionFamilySchema.parse(await store.readJson(artifact.ref)),
  })))
  const artifactIndex: FoundationReviewArtifactEntry[] = [
    { artifactKind: 'source_licence_register', artifactRef: candidate.sourceLicenceRegister.ref, value: sourceLicenceRegister },
    { artifactKind: 'board_alignment', artifactRef: candidate.boardAlignment.ref, value: boardAlignment },
    { artifactKind: 'foundation_coverage_model', artifactRef: candidate.coverageModel.ref, value: coverageModel },
    { artifactKind: 'course_knowledge_model', artifactRef: candidate.courseKnowledgeModel.ref, value: courseKnowledgeModel },
    { artifactKind: 'assessment_blueprint', artifactRef: candidate.assessmentBlueprint.ref, value: assessmentBlueprint },
    ...questionFamilies.map((family) => ({ artifactKind: 'question_family' as const, artifactRef: family.artifact.ref, value: family.value })),
  ]
  return {
    sourceLicenceRegister,
    boardAlignment,
    coverageModel,
    courseKnowledgeModel,
    assessmentBlueprint,
    questionFamilies,
    artifactIndex,
    artifacts: new Map(artifactIndex.map((entry) => [entry.artifactRef, entry])),
  }
}

async function findMatchingDeterministicReport(candidate: FoundationCandidate, store: FoundationIndependentReviewArtifactStore, reviewedCommit: string) {
  if (candidate.deterministicAssurance.status !== 'pass' || !candidate.deterministicAssurance.foundationFingerprint) return null
  for (const ref of [...candidate.deterministicAssurance.evidenceRefs].reverse()) {
    try {
      const report = foundationDeterministicAssuranceReportSchema.parse(await store.readJson(ref))
      if (
        report.decision === 'pass'
        && report.foundationFingerprint === candidate.deterministicAssurance.foundationFingerprint
        && report.reviewedCommit === reviewedCommit
      ) return { ref, report }
    } catch {
      // Continue until exact fingerprint/commit evidence is found.
    }
  }
  return null
}

async function ensureDeterministicPass(input: {
  job: FoundationJob
  artifactStore: FoundationIndependentReviewArtifactStore
  reviewedCommit: string
  now: string
}) {
  const job = foundationJobSchema.parse(input.job)
  if (!job.candidate) throw new Error('Foundation deterministic assurance requires a candidate')
  const fingerprint = await computeFoundationFingerprint(job.candidate)
  const existing = await findMatchingDeterministicReport(job.candidate, input.artifactStore, input.reviewedCommit)
  if (existing && job.candidate.deterministicAssurance.foundationFingerprint === fingerprint) {
    return { job, ref: existing.ref, report: existing.report }
  }
  const result = await runDeterministicFoundationAssurance({
    job,
    artifactStore: {
      readJson: (ref) => input.artifactStore.readJson(ref),
      writeJson: (write) => input.artifactStore.writeJson(write),
    },
    reviewedCommit: input.reviewedCommit,
    now: input.now,
  })
  return { job: result.job, ref: result.reportRef, report: result.report }
}

function validateReviewOutput(input: {
  output: unknown
  job: FoundationJob
  bundle: FoundationBundle
  reviewedCommit: string
  foundationFingerprint: string
  deterministicAssuranceRef: string
  provenance: FoundationWorkerExecutionProvenance
  excludedContextIds: string[]
  now: string
}) {
  const parsed = z.object({
    reviewedCommit: commitShaSchema,
    foundationFingerprint: sha256Schema,
    decision: z.enum(['pass', 'fail_hold']),
    findings: z.array(foundationIndependentReviewFindingSchema).default([]),
  }).parse(input.output)
  if (parsed.reviewedCommit !== input.reviewedCommit) throw new Error('Independent Foundation review must cover the exact deterministically assured commit')
  if (parsed.foundationFingerprint !== input.foundationFingerprint) throw new Error('Independent Foundation review must cover the exact deterministically assured Foundation fingerprint')
  const ids = parsed.findings.map((finding) => finding.id)
  if (new Set(ids).size !== ids.length) throw new Error('Independent Foundation review finding IDs must be unique')
  for (const finding of parsed.findings) {
    const artifact = input.bundle.artifacts.get(finding.artifactRef)
    if (!artifact) throw new Error(`Independent Foundation review finding ${finding.id} references unknown artifact ${finding.artifactRef}`)
    if (artifact.artifactKind !== finding.artifactKind) {
      throw new Error(`Independent Foundation review finding ${finding.id} artifact kind does not match ${finding.artifactRef}`)
    }
  }
  return foundationIndependentReviewReportSchema.parse({
    schemaVersion: 1,
    artifactType: 'foundation_independent_review_report',
    jobId: input.job.jobId,
    candidateId: input.job.candidate!.candidateId,
    reviewedCommit: parsed.reviewedCommit,
    deterministicAssuranceRef: input.deterministicAssuranceRef,
    foundationFingerprint: parsed.foundationFingerprint,
    decision: parsed.decision,
    findings: parsed.findings,
    reviewer: workerEvidence(input.provenance),
    excludedContextIds: [...input.excludedContextIds].sort((left, right) => left.localeCompare(right)),
    createdAt: input.now,
  })
}

function unresolvedMaterialFindings(report: FoundationIndependentReviewReport) {
  return report.findings.filter((finding) => finding.resolutionStatus === 'open' && ['blocking', 'material'].includes(finding.severity))
}

function minorLimitations(report: FoundationIndependentReviewReport) {
  return report.findings
    .filter((finding) => finding.resolutionStatus === 'open' && finding.severity === 'minor')
    .map((finding) => `Independent Foundation review ${finding.id}: ${finding.finding}`)
}

function updateOperationalMetadata(jobInput: FoundationJob, input: { contextIds?: string[]; limitations?: string[]; now: string }) {
  const job = foundationJobSchema.parse(jobInput)
  if (job.state !== 'assuring' || !job.candidate) throw new Error('Foundation assurance metadata may be updated only while assuring')
  const candidate = foundationCandidateSchema.parse({
    ...job.candidate,
    knownLimitations: unique([...job.candidate.knownLimitations, ...(input.limitations ?? [])]),
    provenance: {
      ...job.candidate.provenance,
      assuranceContextIds: unique([...job.candidate.provenance.assuranceContextIds, ...(input.contextIds ?? [])]),
    },
  })
  return foundationJobSchema.parse({ ...job, candidate, updatedAt: input.now })
}

function upstreamFinding(findings: FoundationIndependentReviewFinding[]) {
  return findings.find((finding) => ['source_licence_register', 'board_alignment', 'foundation_coverage_model'].includes(finding.artifactKind))
}

function remediationTargets(candidate: FoundationCandidate, bundle: FoundationBundle, review: FoundationIndependentReviewReport): FoundationRemediationTarget[] {
  const material = unresolvedMaterialFindings(review)
  const byRef = new Map<string, FoundationRemediationTarget>()
  const add = (target: FoundationRemediationTarget) => {
    const existing = byRef.get(target.oldRef)
    const directIds = unique([...(existing?.findings ?? []), ...target.findings].map((finding) => finding.id))
    byRef.set(target.oldRef, {
      ...target,
      reason: existing?.reason === 'direct_finding' || target.reason === 'direct_finding' ? 'direct_finding' : 'dependency',
      findings: directIds.map((id) => material.find((finding) => finding.id === id)!),
    })
  }
  for (const finding of material) {
    if (finding.artifactKind === 'course_knowledge_model') {
      add({ artifactKind: 'course_knowledge_model', oldRef: candidate.courseKnowledgeModel.ref, value: bundle.courseKnowledgeModel, reason: 'direct_finding', findings: [finding] })
      add({ artifactKind: 'assessment_blueprint', oldRef: candidate.assessmentBlueprint.ref, value: bundle.assessmentBlueprint, reason: 'dependency', findings: [] })
      for (const family of bundle.questionFamilies) add({ artifactKind: 'question_family', oldRef: family.artifact.ref, value: family.value, reason: 'dependency', findings: [] })
    } else if (finding.artifactKind === 'assessment_blueprint') {
      add({ artifactKind: 'assessment_blueprint', oldRef: candidate.assessmentBlueprint.ref, value: bundle.assessmentBlueprint, reason: 'direct_finding', findings: [finding] })
      for (const family of bundle.questionFamilies) add({ artifactKind: 'question_family', oldRef: family.artifact.ref, value: family.value, reason: 'dependency', findings: [] })
    } else if (finding.artifactKind === 'question_family') {
      const family = bundle.questionFamilies.find((entry) => entry.artifact.ref === finding.artifactRef)
      if (!family) throw new Error(`Question Family remediation target ${finding.artifactRef} is unavailable`)
      add({ artifactKind: 'question_family', oldRef: family.artifact.ref, value: family.value, reason: 'direct_finding', findings: [finding] })
    }
  }
  return [...byRef.values()]
}

async function applyRemediation(input: {
  job: FoundationJob
  bundle: FoundationBundle
  review: FoundationIndependentReviewReport
  reviewRef: string
  execution: Extract<FoundationWorkerExecution<unknown>, { status: 'success' }>
  artifactStore: FoundationIndependentReviewArtifactStore
  reviewedCommit: string
  now: string
  cycle: number
}) {
  const job = foundationJobSchema.parse(input.job)
  if (job.state !== 'assuring' || !job.candidate) throw new Error('Foundation remediation requires a candidate in assuring state')
  const sourceCandidate = job.candidate
  const sourceFingerprint = await computeFoundationFingerprint(sourceCandidate)
  const material = unresolvedMaterialFindings(input.review)
  const targets = remediationTargets(sourceCandidate, input.bundle, input.review)
  const output = foundationRemediationWorkerOutputSchema.parse(input.execution.output)
  if (!exactSet(output.resolvedFindingIds, material.map((finding) => finding.id))) {
    throw new Error('Foundation remediation must resolve exactly the blocking/material findings assigned to the cycle')
  }
  if (!exactSet(output.replacements.map((replacement) => replacement.oldRef), targets.map((target) => target.oldRef))) {
    throw new Error('Foundation remediation replacements must match the exact smallest-safe dependency closure')
  }
  const replacementByRef = new Map(output.replacements.map((replacement) => [replacement.oldRef, replacement]))
  for (const target of targets) {
    if (replacementByRef.get(target.oldRef)?.artifactKind !== target.artifactKind) {
      throw new Error(`Foundation remediation replacement kind mismatch for ${target.oldRef}`)
    }
  }

  const records: FoundationRemediationRecord['replacements'] = []
  let courseRef = sourceCandidate.courseKnowledgeModel.ref
  let courseFingerprint = sourceCandidate.courseKnowledgeModel.fingerprint
  const courseTarget = targets.find((target) => target.artifactKind === 'course_knowledge_model')
  if (courseTarget) {
    const parsed = courseKnowledgeModelSchema.parse(replacementByRef.get(courseTarget.oldRef)!.correctedArtifact)
    if (parsed.jobId !== job.jobId) throw new Error('Course Truth remediation may not change Foundation job identity')
    if (!sameSet(parsed.nodes.map((node) => node.id), input.bundle.courseKnowledgeModel.nodes.map((node) => node.id))) {
      throw new Error('Course Truth remediation may not silently change the canonical coverage node set')
    }
    courseFingerprint = await fingerprintFoundationArtifact({ ...parsed, fingerprint: undefined })
    const corrected = courseKnowledgeModelSchema.parse({ ...parsed, fingerprint: courseFingerprint })
    const write = await input.artifactStore.writeJson({ jobId: job.jobId, kind: 'course_knowledge_model', fingerprint: courseFingerprint, value: corrected })
    courseRef = write.ref
    records.push({
      artifactKind: 'course_knowledge_model', oldRef: courseTarget.oldRef, newRef: write.ref,
      oldFingerprint: sourceCandidate.courseKnowledgeModel.fingerprint, newFingerprint: courseFingerprint,
      directFindingIds: courseTarget.findings.map((finding) => finding.id),
    })
  }

  let examRef = sourceCandidate.assessmentBlueprint.ref
  let examFingerprint = sourceCandidate.assessmentBlueprint.fingerprint
  const examTarget = targets.find((target) => target.artifactKind === 'assessment_blueprint')
  if (examTarget) {
    const parsed = foundationAssessmentBlueprintSchema.parse(replacementByRef.get(examTarget.oldRef)!.correctedArtifact)
    if (parsed.jobId !== job.jobId) throw new Error('Exam Truth remediation may not change Foundation job identity')
    const corrected = foundationAssessmentBlueprintSchema.parse({
      ...parsed,
      boardAlignmentFingerprint: sourceCandidate.boardAlignment.fingerprint,
      courseKnowledgeModelFingerprint: courseFingerprint,
    })
    examFingerprint = await fingerprintFoundationArtifact(corrected)
    const write = await input.artifactStore.writeJson({ jobId: job.jobId, kind: 'assessment_blueprint', fingerprint: examFingerprint, value: corrected })
    examRef = write.ref
    records.push({
      artifactKind: 'assessment_blueprint', oldRef: examTarget.oldRef, newRef: write.ref,
      oldFingerprint: sourceCandidate.assessmentBlueprint.fingerprint, newFingerprint: examFingerprint,
      directFindingIds: examTarget.findings.map((finding) => finding.id),
    })
  }

  const questionFamilies = [...sourceCandidate.questionFamilies]
  for (const target of targets.filter((entry) => entry.artifactKind === 'question_family')) {
    const before = input.bundle.questionFamilies.find((entry) => entry.artifact.ref === target.oldRef)
    if (!before) throw new Error(`Question Family ${target.oldRef} is unavailable for remediation`)
    const corrected = questionFamilySchema.parse(replacementByRef.get(target.oldRef)!.correctedArtifact)
    if (corrected.id !== before.value.id) throw new Error(`Question Family remediation may not change family identity ${before.value.id}`)
    const fingerprint = await fingerprintFoundationArtifact(corrected)
    const write = await input.artifactStore.writeJson({ jobId: job.jobId, kind: 'question_family', fingerprint, value: corrected })
    const index = questionFamilies.findIndex((entry) => entry.ref === target.oldRef)
    if (index < 0) throw new Error(`Foundation Candidate does not reference Question Family ${target.oldRef}`)
    questionFamilies[index] = { ref: write.ref, fingerprint }
    records.push({
      artifactKind: 'question_family', oldRef: target.oldRef, newRef: write.ref,
      oldFingerprint: before.artifact.fingerprint, newFingerprint: fingerprint,
      directFindingIds: target.findings.map((finding) => finding.id),
    })
  }

  const remediatedCandidate = foundationCandidateSchema.parse({
    ...sourceCandidate,
    candidateId: `${sourceCandidate.candidateId}-r${input.cycle}`,
    courseKnowledgeModel: { ref: courseRef, fingerprint: courseFingerprint },
    assessmentBlueprint: { ref: examRef, fingerprint: examFingerprint },
    questionFamilies,
    deterministicAssurance: { status: 'pending', evidenceRefs: [] },
    independentReview: { status: 'pending', evidenceRefs: [] },
    knownLimitations: unique([...sourceCandidate.knownLimitations, ...minorLimitations(input.review)]),
    provenance: {
      ...sourceCandidate.provenance,
      createdAt: input.now,
      implementationHeadSha: input.reviewedCommit,
      assuranceContextIds: unique([
        ...sourceCandidate.provenance.assuranceContextIds,
        input.review.reviewer.contextId,
        input.execution.provenance.contextId,
      ]),
    },
  })
  const remediatedFingerprint = await computeFoundationFingerprint(remediatedCandidate)
  if (remediatedFingerprint === sourceFingerprint) throw new Error('Blocking/material Foundation remediation must produce a materially different Foundation fingerprint')

  const remediatedJob = foundationJobSchema.parse({ ...job, candidate: remediatedCandidate, updatedAt: input.now })
  const reassured = await runDeterministicFoundationAssurance({
    job: remediatedJob,
    artifactStore: {
      readJson: (ref) => input.artifactStore.readJson(ref),
      writeJson: (write) => input.artifactStore.writeJson(write),
    },
    reviewedCommit: input.reviewedCommit,
    now: input.now,
  })
  const record = foundationRemediationRecordSchema.parse({
    schemaVersion: 1,
    artifactType: 'foundation_remediation_record',
    jobId: job.jobId,
    sourceCandidateId: sourceCandidate.candidateId,
    sourceFoundationFingerprint: sourceFingerprint,
    triggerReviewRef: input.reviewRef,
    reviewedCommit: input.reviewedCommit,
    remediationWorker: workerEvidence(input.execution.provenance),
    resolvedFindingIds: output.resolvedFindingIds,
    resolutionNotes: output.resolutionNotes,
    replacements: records,
    remediatedCandidateId: remediatedCandidate.candidateId,
    remediatedFoundationFingerprint: remediatedFingerprint,
    deterministicReassurance: { decision: reassured.report.decision, reportRef: reassured.reportRef, reviewedCommit: reassured.report.reviewedCommit },
    createdAt: input.now,
  })
  const write = await input.artifactStore.writeJson({
    jobId: job.jobId,
    kind: 'foundation_remediation_record',
    fingerprint: await fingerprintFoundationArtifact(record),
    value: record,
  })
  return { job: reassured.job, record, recordRef: write.ref, deterministicReport: reassured.report }
}

function safeBlockerId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9._-]/g, '-')
}

function blockWorkerFailure(
  job: FoundationJob,
  stage: 'independent-review' | 'remediation',
  execution: Extract<FoundationWorkerExecution<unknown>, { status: 'failure' | 'infrastructure_failure' }>,
  now: string,
) {
  return blockFoundationJob(job, {
    id: safeBlockerId(`${stage}-worker-failure-${execution.provenance.id}`),
    reason: `${stage} worker ${execution.status}: ${execution.error}`,
    createdAt: now,
  })
}

export async function runFoundationIndependentReviewAndRemediation(input: {
  job: FoundationJob
  artifactStore: FoundationIndependentReviewArtifactStore
  workers: FoundationIndependentReviewWorkers
  reviewedCommit: string
  now: string
  additionalForbiddenContextIds?: string[]
  maxRemediationCycles?: number
}): Promise<{
  job: FoundationJob
  reviewReports: FoundationIndependentReviewReport[]
  reviewRefs: string[]
  remediationRecords: FoundationRemediationRecord[]
  remediationRefs: string[]
}> {
  let job = foundationJobSchema.parse(input.job)
  const reviewedCommit = commitShaSchema.parse(input.reviewedCommit)
  const maxRemediationCycles = input.maxRemediationCycles ?? 3
  if (!Number.isInteger(maxRemediationCycles) || maxRemediationCycles < 0) throw new Error('maxRemediationCycles must be a non-negative integer')
  if (job.state !== 'assuring' || !job.candidate) throw new Error('Foundation independent review requires a complete Foundation Candidate in assuring state')
  if (job.blockers.some((blocker) => !blocker.resolvedAt)) throw new Error('Resolve all Foundation operational blockers before independent review')

  const reviewReports: FoundationIndependentReviewReport[] = []
  const reviewRefs: string[] = []
  const remediationRecords: FoundationRemediationRecord[] = []
  const remediationRefs: string[] = []
  let cycle = 0

  while (true) {
    const deterministic = await ensureDeterministicPass({ job, artifactStore: input.artifactStore, reviewedCommit, now: input.now })
    job = deterministic.job
    if (deterministic.report.decision !== 'pass') return { job, reviewReports, reviewRefs, remediationRecords, remediationRefs }

    const candidate = job.candidate!
    const foundationFingerprint = await computeFoundationFingerprint(candidate)
    const bundle = await readBundle(candidate, input.artifactStore)
    const excludedContextIds = unique([
      ...candidate.provenance.generationContextIds,
      ...candidate.provenance.assuranceContextIds,
      ...(input.additionalForbiddenContextIds ?? []),
    ])
    if (excludedContextIds.length === 0) throw new Error('Independent Foundation review requires retained generation-context provenance; independence cannot be inferred')

    const reviewExecution = await input.workers.independentReview({
      jobId: job.jobId,
      candidateId: candidate.candidateId,
      reviewedCommit,
      foundationFingerprint,
      courseIdentity: candidate.courseIdentity,
      cohortValidity: candidate.cohortValidity,
      sourceEvidence: sourceEvidence(bundle.sourceLicenceRegister),
      artifactIndex: bundle.artifactIndex,
      boardAlignment: bundle.boardAlignment,
      coverageModel: bundle.coverageModel,
      courseKnowledgeModel: bundle.courseKnowledgeModel,
      assessmentBlueprint: bundle.assessmentBlueprint,
      questionFamilies: bundle.questionFamilies.map((entry) => entry.value),
      deterministicAssurance: deterministic.report,
    })
    if (reviewExecution.status !== 'success') {
      return { job: blockWorkerFailure(job, 'independent-review', reviewExecution, input.now), reviewReports, reviewRefs, remediationRecords, remediationRefs }
    }
    if (excludedContextIds.includes(reviewExecution.provenance.contextId)) {
      return {
        job: blockFoundationJob(job, {
          id: safeBlockerId(`independent-review-context-reuse-${reviewExecution.provenance.id}`),
          reason: 'Independent Foundation review reused a generation/review/remediation context and cannot be treated as independent evidence.',
          createdAt: input.now,
        }),
        reviewReports, reviewRefs, remediationRecords, remediationRefs,
      }
    }

    const review = validateReviewOutput({
      output: reviewExecution.output,
      job,
      bundle,
      reviewedCommit,
      foundationFingerprint,
      deterministicAssuranceRef: deterministic.ref,
      provenance: reviewExecution.provenance,
      excludedContextIds,
      now: input.now,
    })
    const reviewWrite = await input.artifactStore.writeJson({
      jobId: job.jobId,
      kind: 'foundation_independent_review_report',
      fingerprint: await fingerprintFoundationArtifact(review),
      value: review,
    })
    reviewReports.push(review)
    reviewRefs.push(reviewWrite.ref)
    job = updateOperationalMetadata(job, { contextIds: [reviewExecution.provenance.contextId], limitations: minorLimitations(review), now: input.now })
    job = await recordIndependentFoundationReview(job, {
      status: review.decision,
      foundationFingerprint,
      evidenceRefs: [reviewWrite.ref],
    }, input.now)

    const material = unresolvedMaterialFindings(review)
    if (material.length === 0) return { job, reviewReports, reviewRefs, remediationRecords, remediationRefs }

    const unsafeUpstream = upstreamFinding(material)
    if (unsafeUpstream) {
      return {
        job: blockFoundationJob(job, {
          id: `foundation-upstream-remediation-required-${unsafeUpstream.id}`,
          reason: `Independent review finding ${unsafeUpstream.id} targets ${unsafeUpstream.artifactKind}. Safe correction requires reopening Foundation compilation rather than silently rewriting governed upstream truth during assurance.`,
          createdAt: input.now,
        }),
        reviewReports, reviewRefs, remediationRecords, remediationRefs,
      }
    }
    if (cycle >= maxRemediationCycles) {
      return {
        job: blockFoundationJob(job, {
          id: `foundation-remediation-cycle-limit-${candidate.candidateId}`,
          reason: `Independent review still has blocking/material findings after ${maxRemediationCycles} targeted Foundation remediation cycles.`,
          createdAt: input.now,
        }),
        reviewReports, reviewRefs, remediationRecords, remediationRefs,
      }
    }

    const targets = remediationTargets(candidate, bundle, review)
    const forbiddenRemediationContexts = unique([...excludedContextIds, reviewExecution.provenance.contextId])
    const remediationExecution = await input.workers.remediate({
      jobId: job.jobId,
      sourceCandidateId: candidate.candidateId,
      reviewedCommit,
      foundationFingerprint,
      courseIdentity: candidate.courseIdentity,
      cohortValidity: candidate.cohortValidity,
      sourceEvidence: sourceEvidence(bundle.sourceLicenceRegister),
      artifactIndex: bundle.artifactIndex,
      boardAlignment: bundle.boardAlignment,
      coverageModel: bundle.coverageModel,
      courseKnowledgeModel: bundle.courseKnowledgeModel,
      assessmentBlueprint: bundle.assessmentBlueprint,
      questionFamilies: bundle.questionFamilies.map((entry) => entry.value),
      triggerReview: review,
      targets,
    })
    if (remediationExecution.status !== 'success') {
      return { job: blockWorkerFailure(job, 'remediation', remediationExecution, input.now), reviewReports, reviewRefs, remediationRecords, remediationRefs }
    }
    if (forbiddenRemediationContexts.includes(remediationExecution.provenance.contextId)) {
      return {
        job: blockFoundationJob(job, {
          id: safeBlockerId(`foundation-remediation-context-reuse-${remediationExecution.provenance.id}`),
          reason: 'Foundation remediation reused a generation/review/remediation context; corrected truth cannot be accepted from a contaminated context.',
          createdAt: input.now,
        }),
        reviewReports, reviewRefs, remediationRecords, remediationRefs,
      }
    }

    cycle += 1
    const remediated = await applyRemediation({
      job,
      bundle,
      review,
      reviewRef: reviewWrite.ref,
      execution: remediationExecution,
      artifactStore: input.artifactStore,
      reviewedCommit,
      now: input.now,
      cycle,
    })
    job = remediated.job
    remediationRecords.push(remediated.record)
    remediationRefs.push(remediated.recordRef)
    if (remediated.deterministicReport.decision !== 'pass') return { job, reviewReports, reviewRefs, remediationRecords, remediationRefs }
  }
}
