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
    context.addIssue({
      code: 'custom',
      path: ['resolutionStatus'],
      message: 'No-issue Foundation review entries must be not_applicable',
    })
  }
  if (finding.severity !== 'no_issue' && finding.resolutionStatus !== 'open') {
    context.addIssue({
      code: 'custom',
      path: ['resolutionStatus'],
      message: 'Foundation review findings must enter the issue register as open',
    })
  }
})

const workerEvidenceSchema = z.object({
  workerRunId: identifierSchema,
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
  reviewer: workerEvidenceSchema,
  excludedContextIds: z.array(nonEmptyStringSchema).default([]),
  createdAt: nonEmptyStringSchema,
}).superRefine((report, context) => {
  const material = report.findings.some((finding) =>
    finding.resolutionStatus === 'open' && ['blocking', 'material'].includes(finding.severity),
  )
  if (material && report.decision !== 'fail_hold') {
    context.addIssue({
      code: 'custom',
      path: ['decision'],
      message: 'Blocking/material Foundation review findings require fail_hold',
    })
  }
  if (!material && report.decision !== 'pass') {
    context.addIssue({
      code: 'custom',
      path: ['decision'],
      message: 'Foundation review without blocking/material findings must pass',
    })
  }
  if (report.excludedContextIds.includes(report.reviewer.contextId)) {
    context.addIssue({
      code: 'custom',
      path: ['reviewer', 'contextId'],
      message: 'Foundation independent review must use a context excluded from all prior generation/review/remediation contexts',
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
  remediationWorker: workerEvidenceSchema,
  resolvedFindingIds: z.array(identifierSchema).min(1),
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

export type FoundationIndependentReviewFinding = z.infer<typeof foundationIndependentReviewFindingSchema>
export type FoundationIndependentReviewReport = z.infer<typeof foundationIndependentReviewReportSchema>
export type FoundationRemediationRecord = z.infer<typeof foundationRemediationRecordSchema>
export type FoundationReviewableArtifactKind = z.infer<typeof foundationReviewableArtifactKindSchema>

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

type FoundationBundle = {
  sourceLicenceRegister: SourceLicenceRegister
  boardAlignment: BoardAlignment
  coverageModel: FoundationCoverageModel
  courseKnowledgeModel: CourseKnowledgeModel
  assessmentBlueprint: FoundationAssessmentBlueprint
  questionFamilies: Array<{ artifact: FoundationArtifactRef; value: QuestionFamily }>
  artifacts: Map<string, { kind: FoundationReviewableArtifactKind; value: unknown }>
}

type RemediationTarget = {
  artifactKind: 'course_knowledge_model' | 'assessment_blueprint' | 'question_family'
  oldRef: string
  value: unknown
  reason: 'direct_finding' | 'dependency'
  findings: FoundationIndependentReviewFinding[]
}

export interface FoundationIndependentReviewWorkers {
  independentReview(input: {
    jobId: string
    candidateId: string
    reviewedCommit: string
    foundationFingerprint: string
    courseIdentity: FoundationCandidate['courseIdentity']
    cohortValidity: FoundationCandidate['cohortValidity']
    sourceEvidence: Array<{
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
    sourceEvidence: Array<{
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
    boardAlignment: BoardAlignment
    coverageModel: FoundationCoverageModel
    courseKnowledgeModel: CourseKnowledgeModel
    assessmentBlueprint: FoundationAssessmentBlueprint
    questionFamilies: QuestionFamily[]
    triggerReview: FoundationIndependentReviewReport
    targets: RemediationTarget[]
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

function workerEvidence(provenance: FoundationWorkerExecutionProvenance) {
  return workerEvidenceSchema.parse({
    workerRunId: provenance.id,
    contextId: provenance.contextId,
    contractVersion: provenance.contractVersion,
    provider: provenance.provider,
    model: provenance.model,
    retryCount: provenance.retryCount,
    usageCost: provenance.usageCost,
  })
}

function sourceEvidence(register: SourceLicenceRegister) {
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

  const artifacts = new Map<string, { kind: FoundationReviewableArtifactKind; value: unknown }>([
    [candidate.sourceLicenceRegister.ref, { kind: 'source_licence_register', value: sourceLicenceRegister }],
    [candidate.boardAlignment.ref, { kind: 'board_alignment', value: boardAlignment }],
    [candidate.coverageModel.ref, { kind: 'foundation_coverage_model', value: coverageModel }],
    [candidate.courseKnowledgeModel.ref, { kind: 'course_knowledge_model', value: courseKnowledgeModel }],
    [candidate.assessmentBlueprint.ref, { kind: 'assessment_blueprint', value: assessmentBlueprint }],
  ])
  for (const family of questionFamilies) artifacts.set(family.artifact.ref, { kind: 'question_family', value: family.value })

  return {
    sourceLicenceRegister,
    boardAlignment,
    coverageModel,
    courseKnowledgeModel,
    assessmentBlueprint,
    questionFamilies,
    artifacts,
  }
}

async function matchingDeterministicReport(
  candidate: FoundationCandidate,
  store: FoundationIndependentReviewArtifactStore,
  reviewedCommit: string,
) {
  if (candidate.deterministicAssurance.status !== 'pass' || !candidate.deterministicAssurance.foundationFingerprint) {
    throw new Error('Foundation independent review requires passing deterministic assurance')
  }
  for (const ref of [...candidate.deterministicAssurance.evidenceRefs].reverse()) {
    try {
      const report = foundationDeterministicAssuranceReportSchema.parse(await store.readJson(ref))
      if (
        report.decision === 'pass'
        && report.foundationFingerprint === candidate.deterministicAssurance.foundationFingerprint
        && report.reviewedCommit === reviewedCommit
      ) return { ref, report }
    } catch {
      // Continue until exact bound deterministic evidence is found.
    }
  }
  throw new Error('No deterministic PASS report matches the exact Foundation fingerprint and reviewed commit')
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

  if (parsed.reviewedCommit !== input.reviewedCommit) {
    throw new Error('Independent Foundation review must cover the exact deterministically assured commit')
  }
  if (parsed.foundationFingerprint !== input.foundationFingerprint) {
    throw new Error('Independent Foundation review must cover the exact deterministically assured Foundation fingerprint')
  }

  const ids = parsed.findings.map((finding) => finding.id)
  if (new Set(ids).size !== ids.length) throw new Error('Independent Foundation review finding IDs must be unique')
  for (const finding of parsed.findings) {
    const artifact = input.bundle.artifacts.get(finding.artifactRef)
    if (!artifact) throw new Error(`Independent Foundation review finding ${finding.id} references unknown artifact ${finding.artifactRef}`)
    if (artifact.kind !== finding.artifactKind) {
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
  return report.findings.filter((finding) =>
    finding.resolutionStatus === 'open' && ['blocking', 'material'].includes(finding.severity),
  )
}

function minorLimitations(report: FoundationIndependentReviewReport) {
  return report.findings
    .filter((finding) => finding.resolutionStatus === 'open' && finding.severity === 'minor')
    .map((finding) => `Independent Foundation review ${finding.id}: ${finding.finding}`)
}

function updateCandidateOperationalMetadata(jobInput: FoundationJob, input: {
  assuranceContextIds?: string[]
  knownLimitations?: string[]
  updatedAt: string
}) {
  const job = foundationJobSchema.parse(jobInput)
  if (job.state !== 'assuring' || !job.candidate) throw new Error('Foundation assurance metadata may be updated only while assuring')
  const candidate = foundationCandidateSchema.parse({
    ...job.candidate,
    knownLimitations: unique([...job.candidate.knownLimitations, ...(input.knownLimitations ?? [])]),
    provenance: {
      ...job.candidate.provenance,
      assuranceContextIds: unique([
        ...(job.candidate.provenance.assuranceContextIds ?? []),
        ...(input.assuranceContextIds ?? []),
      ]),
    },
  })
  return foundationJobSchema.parse({ ...job, candidate, updatedAt: input.updatedAt })
}

function upstreamRemediationFinding(findings: FoundationIndependentReviewFinding[]) {
  return findings.find((finding) => ['source_licence_register', 'board_alignment', 'foundation_coverage_model'].includes(finding.artifactKind))
}

function requiredRemediationTargets(bundle: FoundationBundle, report: FoundationIndependentReviewReport): RemediationTarget[] {
  const findings = unresolvedMaterialFindings(report)
  const required = new Map<string, RemediationTarget>()
  const add = (
    artifactKind: RemediationTarget['artifactKind'],
    oldRef: string,
    value: unknown,
    reason: RemediationTarget['reason'],
    directFindings: FoundationIndependentReviewFinding[] = [],
  ) => {
    const existing = required.get(oldRef)
    required.set(oldRef, {
      artifactKind,
      oldRef,
      value,
      reason: existing?.reason === 'direct_finding' || reason === 'direct_finding' ? 'direct_finding' : 'dependency',
      findings: unique([...(existing?.findings ?? []), ...directFindings].map((finding) => finding.id))
        .map((id) => findings.find((finding) => finding.id === id)!),
    })
  }

  for (const finding of findings) {
    if (finding.artifactKind === 'course_knowledge_model') {
      add('course_knowledge_model', finding.artifactRef, bundle.courseKnowledgeModel, 'direct_finding', [finding])
      add('assessment_blueprint', [...bundle.artifacts].find(([, value]) => value.value === bundle.assessmentBlueprint)?.[0] ?? '', bundle.assessmentBlueprint, 'dependency')
      for (const family of bundle.questionFamilies) add('question_family', family.artifact.ref, family.value, 'dependency')
      continue
    }
    if (finding.artifactKind === 'assessment_blueprint') {
      add('assessment_blueprint', finding.artifactRef, bundle.assessmentBlueprint, 'direct_finding', [finding])
      for (const family of bundle.questionFamilies) add('question_family', family.artifact.ref, family.value, 'dependency')
      continue
    }
    if (finding.artifactKind === 'question_family') {
      const family = bundle.questionFamilies.find((entry) => entry.artifact.ref === finding.artifactRef)
      if (!family) throw new Error(`Question Family remediation target ${finding.artifactRef} is unavailable`)
      add('question_family', finding.artifactRef, family.value, 'direct_finding', [finding])
    }
  }

  return [...required.values()]
}

function exactIds(left: string[], right: string[]) {
  return sameSet(left, right) && left.length === right.length
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
  remediationCycle: number
}) {
  const job = foundationJobSchema.parse(input.job)
  if (job.state !== 'assuring' || !job.candidate) throw new Error('Foundation remediation requires a candidate in assuring state')
  const sourceCandidate = job.candidate
  const sourceFingerprint = await computeFoundationFingerprint(sourceCandidate)
  const findings = unresolvedMaterialFindings(input.review)
  const targets = requiredRemediationTargets(input.bundle, input.review)
  const output = foundationRemediationWorkerOutputSchema.parse(input.execution.output)

  if (!exactIds(output.resolvedFindingIds, findings.map((finding) => finding.id))) {
    throw new Error('Foundation remediation must resolve exactly the blocking/material findings assigned to the cycle')
  }
  if (!exactIds(output.replacements.map((replacement) => replacement.oldRef), targets.map((target) => target.oldRef))) {
    throw new Error('Foundation remediation replacements must match the exact smallest-safe dependency closure')
  }

  const replacementByRef = new Map(output.replacements.map((replacement) => [replacement.oldRef, replacement]))
  for (const target of targets) {
    const replacement = replacementByRef.get(target.oldRef)!
    if (replacement.artifactKind !== target.artifactKind) {
      throw new Error(`Foundation remediation replacement kind mismatch for ${target.oldRef}`)
    }
  }

  const replacementRecords: FoundationRemediationRecord['replacements'] = []
  let courseArtifact = input.bundle.courseKnowledgeModel
  let courseRef = sourceCandidate.courseKnowledgeModel.ref
  let courseFingerprint = sourceCandidate.courseKnowledgeModel.fingerprint

  const courseTarget = targets.find((target) => target.artifactKind === 'course_knowledge_model')
  if (courseTarget) {
    const replacement = replacementByRef.get(courseTarget.oldRef)!
    const parsed = courseKnowledgeModelSchema.parse(replacement.correctedArtifact)
    if (parsed.jobId !== job.jobId) throw new Error('Course Truth remediation may not change Foundation job identity')
    if (!sameSet(parsed.nodes.map((node) => node.id), input.bundle.courseKnowledgeModel.nodes.map((node) => node.id))) {
      throw new Error('Course Truth remediation may not silently change the canonical coverage node set')
    }
    courseFingerprint = await fingerprintFoundationArtifact({ ...parsed, fingerprint: undefined })
    courseArtifact = courseKnowledgeModelSchema.parse({ ...parsed, fingerprint: courseFingerprint })
    const write = await input.artifactStore.writeJson({
      jobId: job.jobId,
      kind: 'course_knowledge_model',
      fingerprint: courseFingerprint,
      value: courseArtifact,
    })
    courseRef = write.ref
    replacementRecords.push({
      artifactKind: 'course_knowledge_model',
      oldRef: courseTarget.oldRef,
      newRef: write.ref,
      oldFingerprint: sourceCandidate.courseKnowledgeModel.fingerprint,
      newFingerprint: courseFingerprint,
      directFindingIds: courseTarget.findings.map((finding) => finding.id),
    })
  }

  let examArtifact = input.bundle.assessmentBlueprint
  let examRef = sourceCandidate.assessmentBlueprint.ref
  let examFingerprint = sourceCandidate.assessmentBlueprint.fingerprint
  const examTarget = targets.find((target) => target.artifactKind === 'assessment_blueprint')
  if (examTarget) {
    const replacement = replacementByRef.get(examTarget.oldRef)!
    const parsed = foundationAssessmentBlueprintSchema.parse(replacement.correctedArtifact)
    if (parsed.jobId !== job.jobId) throw new Error('Exam Truth remediation may not change Foundation job identity')
    if (parsed.boardAlignmentFingerprint !== sourceCandidate.boardAlignment.fingerprint) {
      throw new Error('Exam Truth remediation may not change the governed Board Alignment dependency')
    }
    if (parsed.courseKnowledgeModelFingerprint !== courseFingerprint) {
      throw new Error('Exam Truth remediation must bind to the exact remediated Course Truth fingerprint')
    }
    examArtifact = parsed
    examFingerprint = await fingerprintFoundationArtifact(examArtifact)
    const write = await input.artifactStore.writeJson({
      jobId: job.jobId,
      kind: 'assessment_blueprint',
      fingerprint: examFingerprint,
      value: examArtifact,
    })
    examRef = write.ref
    replacementRecords.push({
      artifactKind: 'assessment_blueprint',
      oldRef: examTarget.oldRef,
      newRef: write.ref,
      oldFingerprint: sourceCandidate.assessmentBlueprint.fingerprint,
      newFingerprint: examFingerprint,
      directFindingIds: examTarget.findings.map((finding) => finding.id),
    })
  }

  const familyRefs = [...sourceCandidate.questionFamilies]
  for (const target of targets.filter((entry) => entry.artifactKind === 'question_family')) {
    const replacement = replacementByRef.get(target.oldRef)!
    const before = input.bundle.questionFamilies.find((entry) => entry.artifact.ref === target.oldRef)
    if (!before) throw new Error(`Question Family ${target.oldRef} is unavailable for remediation`)
    const corrected = questionFamilySchema.parse(replacement.correctedArtifact)
    if (corrected.id !== before.value.id) throw new Error(`Question Family remediation may not change family identity ${before.value.id}`)
    const fingerprint = await fingerprintFoundationArtifact(corrected)
    const write = await input.artifactStore.writeJson({
      jobId: job.jobId,
      kind: 'question_family',
      fingerprint,
      value: corrected,
    })
    const index = familyRefs.findIndex((entry) => entry.ref === target.oldRef)
    if (index < 0) throw new Error(`Foundation Candidate does not reference Question Family ${target.oldRef}`)
    familyRefs[index] = { ref: write.ref, fingerprint }
    replacementRecords.push({
      artifactKind: 'question_family',
      oldRef: target.oldRef,
      newRef: write.ref,
      oldFingerprint: before.artifact.fingerprint,
      newFingerprint: fingerprint,
      directFindingIds: target.findings.map((finding) => finding.id),
    })
  }

  const remediatedCandidate = foundationCandidateSchema.parse({
    ...sourceCandidate,
    candidateId: `${sourceCandidate.candidateId}-r${input.remediationCycle}`,
    courseKnowledgeModel: { ref: courseRef, fingerprint: courseFingerprint },
    assessmentBlueprint: { ref: examRef, fingerprint: examFingerprint },
    questionFamilies: familyRefs,
    deterministicAssurance: { status: 'pending', evidenceRefs: [] },
    independentReview: { status: 'pending', evidenceRefs: [] },
    knownLimitations: unique([...sourceCandidate.knownLimitations, ...minorLimitations(input.review)]),
    provenance: {
      ...sourceCandidate.provenance,
      createdAt: input.now,
      implementationHeadSha: input.reviewedCommit,
      assuranceContextIds: unique([
        ...(sourceCandidate.provenance.assuranceContextIds ?? []),
        input.review.reviewer.contextId,
        input.execution.provenance.contextId,
      ]),
    },
  })
  const remediatedFingerprint = await computeFoundationFingerprint(remediatedCandidate)
  if (remediatedFingerprint === sourceFingerprint) {
    throw new Error('Blocking/material Foundation remediation must produce a materially different Foundation fingerprint')
  }

  let remediatedJob = foundationJobSchema.parse({ ...job, candidate: remediatedCandidate, updatedAt: input.now })
  const deterministicStore = {
    readJson: (ref: string) => input.artifactStore.readJson(ref),
    writeJson: (write: {
      jobId: string
      kind: 'foundation_deterministic_assurance_report'
      fingerprint: string
      value: unknown
    }) => input.artifactStore.writeJson(write),
  }
  const reassured = await runDeterministicFoundationAssurance({
    job: remediatedJob,
    artifactStore: deterministicStore,
    reviewedCommit: input.reviewedCommit,
    now: input.now,
  })
  remediatedJob = reassured.job

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
    replacements: replacementRecords,
    remediatedCandidateId: remediatedCandidate.candidateId,
    remediatedFoundationFingerprint: remediatedFingerprint,
    deterministicReassurance: {
      decision: reassured.report.decision,
      reportRef: reassured.reportRef,
      reviewedCommit: reassured.report.reviewedCommit,
    },
    createdAt: input.now,
  })
  const recordWrite = await input.artifactStore.writeJson({
    jobId: job.jobId,
    kind: 'foundation_remediation_record',
    fingerprint: await fingerprintFoundationArtifact(record),
    value: record,
  })

  return {
    job: remediatedJob,
    record,
    recordRef: recordWrite.ref,
    deterministicReport: reassured.report,
  }
}

function blockForExecutionFailure(
  job: FoundationJob,
  stage: 'independent-review' | 'remediation',
  execution: Extract<FoundationWorkerExecution<unknown>, { status: 'failure' | 'infrastructure_failure' }>,
  now: string,
) {
  return blockFoundationJob(job, {
    id: `${stage}-worker-failure-${execution.provenance.id}`,
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
  if (!Number.isInteger(maxRemediationCycles) || maxRemediationCycles < 0) {
    throw new Error('maxRemediationCycles must be a non-negative integer')
  }
  if (job.state !== 'assuring' || !job.candidate) {
    throw new Error('Foundation independent review requires a complete Foundation Candidate in assuring state')
  }
  if (job.blockers.some((blocker) => !blocker.resolvedAt)) {
    throw new Error('Resolve all Foundation operational blockers before independent review')
  }

  const reviewReports: FoundationIndependentReviewReport[] = []
  const reviewRefs: string[] = []
  const remediationRecords: FoundationRemediationRecord[] = []
  const remediationRefs: string[] = []
  let remediationCycle = 0

  while (true) {
    const candidate = job.candidate!
    const foundationFingerprint = await computeFoundationFingerprint(candidate)
    if (candidate.deterministicAssurance.status !== 'pass' || candidate.deterministicAssurance.foundationFingerprint !== foundationFingerprint) {
      throw new Error('Independent Foundation review requires deterministic PASS evidence for the exact current Foundation fingerprint')
    }

    const deterministic = await matchingDeterministicReport(candidate, input.artifactStore, reviewedCommit)
    const bundle = await readBundle(candidate, input.artifactStore)
    const excludedContextIds = unique([
      ...(candidate.provenance.generationContextIds ?? []),
      ...(candidate.provenance.assuranceContextIds ?? []),
      ...(input.additionalForbiddenContextIds ?? []),
    ])
    if (excludedContextIds.length === 0) {
      throw new Error('Independent Foundation review requires retained generation-context provenance; independence cannot be inferred')
    }

    const reviewExecution = await input.workers.independentReview({
      jobId: job.jobId,
      candidateId: candidate.candidateId,
      reviewedCommit,
      foundationFingerprint,
      courseIdentity: candidate.courseIdentity,
      cohortValidity: candidate.cohortValidity,
      sourceEvidence: sourceEvidence(bundle.sourceLicenceRegister),
      boardAlignment: bundle.boardAlignment,
      coverageModel: bundle.coverageModel,
      courseKnowledgeModel: bundle.courseKnowledgeModel,
      assessmentBlueprint: bundle.assessmentBlueprint,
      questionFamilies: bundle.questionFamilies.map((entry) => entry.value),
      deterministicAssurance: deterministic.report,
    })
    if (reviewExecution.status !== 'success') {
      return {
        job: blockForExecutionFailure(job, 'independent-review', reviewExecution, input.now),
        reviewReports,
        reviewRefs,
        remediationRecords,
        remediationRefs,
      }
    }
    if (excludedContextIds.includes(reviewExecution.provenance.contextId)) {
      return {
        job: blockFoundationJob(job, {
          id: `independent-review-context-reuse-${reviewExecution.provenance.id}`,
          reason: 'Independent Foundation review reused a generation/review/remediation context and cannot be treated as independent evidence.',
          createdAt: input.now,
        }),
        reviewReports,
        reviewRefs,
        remediationRecords,
        remediationRefs,
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

    job = updateCandidateOperationalMetadata(job, {
      assuranceContextIds: [reviewExecution.provenance.contextId],
      knownLimitations: minorLimitations(review),
      updatedAt: input.now,
    })
    job = await recordIndependentFoundationReview(job, {
      status: review.decision,
      foundationFingerprint,
      evidenceRefs: [reviewWrite.ref],
    }, input.now)

    const materialFindings = unresolvedMaterialFindings(review)
    if (materialFindings.length === 0) {
      return { job, reviewReports, reviewRefs, remediationRecords, remediationRefs }
    }

    const upstream = upstreamRemediationFinding(materialFindings)
    if (upstream) {
      return {
        job: blockFoundationJob(job, {
          id: `foundation-upstream-remediation-required-${upstream.id}`,
          reason: `Independent review finding ${upstream.id} targets ${upstream.artifactKind}. Safe correction requires reopening Foundation compilation rather than silently rewriting governed upstream truth during assurance.`,
          createdAt: input.now,
        }),
        reviewReports,
        reviewRefs,
        remediationRecords,
        remediationRefs,
      }
    }

    if (remediationCycle >= maxRemediationCycles) {
      return {
        job: blockFoundationJob(job, {
          id: `foundation-remediation-cycle-limit-${candidate.candidateId}`,
          reason: `Independent review still has blocking/material findings after ${maxRemediationCycles} targeted Foundation remediation cycles.`,
          createdAt: input.now,
        }),
        reviewReports,
        reviewRefs,
        remediationRecords,
        remediationRefs,
      }
    }

    const targets = requiredRemediationTargets(bundle, review)
    const forbiddenRemediationContexts = unique([
      ...excludedContextIds,
      reviewExecution.provenance.contextId,
    ])
    const remediationExecution = await input.workers.remediate({
      jobId: job.jobId,
      sourceCandidateId: candidate.candidateId,
      reviewedCommit,
      foundationFingerprint,
      courseIdentity: candidate.courseIdentity,
      cohortValidity: candidate.cohortValidity,
      sourceEvidence: sourceEvidence(bundle.sourceLicenceRegister),
      boardAlignment: bundle.boardAlignment,
      coverageModel: bundle.coverageModel,
      courseKnowledgeModel: bundle.courseKnowledgeModel,
      assessmentBlueprint: bundle.assessmentBlueprint,
      questionFamilies: bundle.questionFamilies.map((entry) => entry.value),
      triggerReview: review,
      targets,
    })
    if (remediationExecution.status !== 'success') {
      return {
        job: blockForExecutionFailure(job, 'remediation', remediationExecution, input.now),
        reviewReports,
        reviewRefs,
        remediationRecords,
        remediationRefs,
      }
    }
    if (forbiddenRemediationContexts.includes(remediationExecution.provenance.contextId)) {
      return {
        job: blockFoundationJob(job, {
          id: `foundation-remediation-context-reuse-${remediationExecution.provenance.id}`,
          reason: 'Foundation remediation reused a generation/review/remediation context; corrected truth cannot be accepted from a contaminated context.',
          createdAt: input.now,
        }),
        reviewReports,
        reviewRefs,
        remediationRecords,
        remediationRefs,
      }
    }

    remediationCycle += 1
    const remediated = await applyRemediation({
      job,
      bundle,
      review,
      reviewRef: reviewWrite.ref,
      execution: remediationExecution,
      artifactStore: input.artifactStore,
      reviewedCommit,
      now: input.now,
      remediationCycle,
    })
    job = remediated.job
    remediationRecords.push(remediated.record)
    remediationRefs.push(remediated.recordRef)

    if (remediated.deterministicReport.decision !== 'pass') {
      return { job, reviewReports, reviewRefs, remediationRecords, remediationRefs }
    }
  }
}
