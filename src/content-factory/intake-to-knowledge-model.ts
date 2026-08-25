import { z } from 'zod'
import { advanceJob, blockJob } from './orchestrator'
import {
  boardAlignmentSchema,
  cohortValiditySchema,
  contentFactoryJobSchema,
  courseComponentSchema,
  courseIdentitySchema,
  courseKnowledgeModelSchema,
  coverageMapSchema,
  sourceLicenceRecordSchema,
  sourceLicenceRegisterSchema,
  sourceTypeSchema,
  sourceUseClassSchema,
  type BoardAlignment,
  type ContentFactoryJob,
  type CourseKnowledgeModel,
  type CoverageMap,
  type SourceLicenceRegister,
  type WorkerRun,
} from './schema'

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const nonEmptyStringSchema = z.string().min(1)

export const identityResolutionOutputSchema = z.object({
  courseIdentity: courseIdentitySchema,
  cohortValidity: cohortValiditySchema,
  components: z.array(courseComponentSchema).min(1),
  unresolvedChoices: z.array(nonEmptyStringSchema).default([]),
})

export const discoveredSourceSchema = z.object({
  id: identifierSchema,
  url: z.string().url(),
  title: nonEmptyStringSchema,
  issuer: nonEmptyStringSchema,
  sourceType: sourceTypeSchema,
  educationalRole: z.array(nonEmptyStringSchema).min(1),
  versionOrDate: nonEmptyStringSchema.optional(),
})

export const sourceRightsPolicyRuleSchema = z.object({
  id: identifierSchema,
  issuer: nonEmptyStringSchema,
  hostnames: z.array(nonEmptyStringSchema).min(1),
  sourceTypes: z.array(sourceTypeSchema).min(1),
  useClass: sourceUseClassSchema,
  permissionBasis: nonEmptyStringSchema,
  aiInputPermitted: z.boolean(),
  derivedCommercialUsePermitted: z.boolean(),
  attributionRequirements: z.array(nonEmptyStringSchema).default([]),
  restrictions: z.array(nonEmptyStringSchema).default([]),
  revalidationConditions: z.array(nonEmptyStringSchema).default([]),
}).superRefine((rule, context) => {
  if (['PROHIBITED', 'UNKNOWN'].includes(rule.useClass) && (rule.aiInputPermitted || rule.derivedCommercialUsePermitted)) {
    context.addIssue({
      code: 'custom',
      path: ['useClass'],
      message: `${rule.useClass} policy rules cannot permit AI input or derived commercial use`,
    })
  }

  if (rule.useClass === 'REFERENCE_ONLY' && rule.aiInputPermitted) {
    context.addIssue({
      code: 'custom',
      path: ['aiInputPermitted'],
      message: 'REFERENCE_ONLY policy rules cannot permit source text in generative AI context',
    })
  }
})

export const boardAlignmentFactSchema = z.object({
  id: identifierSchema,
  sourceRef: identifierSchema,
  category: z.enum([
    'course_identity',
    'cohort',
    'component',
    'assessment_objective',
    'assessment_requirement',
    'quantitative_requirement',
    'other_alignment',
  ]),
  value: z.union([
    nonEmptyStringSchema,
    z.number(),
    z.boolean(),
    z.array(nonEmptyStringSchema).min(1),
  ]),
  verificationStatus: z.enum(['verified', 'pending', 'blocked']),
})

export const curriculumRequirementInputSchema = z.object({
  requirementId: identifierSchema,
  summary: nonEmptyStringSchema,
  skillsOrKnowledge: z.array(nonEmptyStringSchema).min(1),
  componentScope: z.array(identifierSchema).default([]),
  revisionArea: nonEmptyStringSchema,
  learnRequired: z.boolean(),
  practiceRequired: z.boolean(),
  examPrepRequired: z.boolean(),
  sourceRefs: z.array(identifierSchema).min(1),
})

export const structuredSourceEvidenceSchema = z.object({
  boardAlignmentFacts: z.array(boardAlignmentFactSchema).min(1),
  curriculumRequirements: z.array(curriculumRequirementInputSchema).min(1),
})

export type IdentityResolutionOutput = z.infer<typeof identityResolutionOutputSchema>
export type DiscoveredSource = z.infer<typeof discoveredSourceSchema>
export type SourceRightsPolicyRule = z.infer<typeof sourceRightsPolicyRuleSchema>
export type StructuredSourceEvidence = z.infer<typeof structuredSourceEvidenceSchema>
export type CurriculumRequirementInput = z.infer<typeof curriculumRequirementInputSchema>

export type WorkerExecutionProvenance = {
  id: string
  contextId: string
  contractVersion: string
  provider?: string
  model?: string
  retryCount?: number
  usageCost?: number
}

export type WorkerExecution<T> =
  | { status: 'success'; output: T; provenance: WorkerExecutionProvenance }
  | { status: 'failure' | 'infrastructure_failure'; error: string; provenance: WorkerExecutionProvenance }

export type ContentFactoryArtifactKind =
  | 'source_licence_register'
  | 'board_alignment'
  | 'coverage_map'
  | 'course_knowledge_model'

export interface ContentFactoryArtifactStore {
  writeJson(input: {
    jobId: string
    kind: ContentFactoryArtifactKind
    fingerprint: string
    value: unknown
  }): Promise<{ ref: string }>
  readJson(ref: string): Promise<unknown>
}

export interface IntakeToKnowledgeModelWorkers {
  resolveIdentity(input: {
    jobId: string
    officialUrls: string[]
    founderInstruction: string
  }): Promise<WorkerExecution<unknown>>
  discoverSources(input: {
    jobId: string
    officialUrls: string[]
    identity: IdentityResolutionOutput
  }): Promise<WorkerExecution<unknown>>
  resolveStructuredEvidence(input: {
    jobId: string
    officialUrls: string[]
    identity: IdentityResolutionOutput
    sourceLicenceRegister: SourceLicenceRegister
  }): Promise<WorkerExecution<unknown>>
  compileBoardAlignment(input: {
    jobId: string
    identity: IdentityResolutionOutput
    sourceLicenceRegister: SourceLicenceRegister
    facts: StructuredSourceEvidence['boardAlignmentFacts']
  }): Promise<WorkerExecution<unknown>>
  compileCoverage(input: {
    jobId: string
    identity: IdentityResolutionOutput
    sourceLicenceRegister: SourceLicenceRegister
    boardAlignment: BoardAlignment
    requirements: StructuredSourceEvidence['curriculumRequirements']
  }): Promise<WorkerExecution<unknown>>
  compileKnowledgeModel(input: {
    jobId: string
    identity: IdentityResolutionOutput
    sourceLicenceRegister: SourceLicenceRegister
    boardAlignment: BoardAlignment
    coverageMap: CoverageMap
    requirements: StructuredSourceEvidence['curriculumRequirements']
  }): Promise<WorkerExecution<unknown>>
}

export const contentFactoryIntakeWorkerContracts = {
  identity: {
    workerId: 'content-factory.identity',
    contractVersion: '1',
    sourceInput: 'identity-pointers-only',
  },
  sourceDiscovery: {
    workerId: 'content-factory.source-discovery',
    contractVersion: '1',
    sourceInput: 'metadata-only',
  },
  structuredEvidence: {
    workerId: 'content-factory.structured-source-evidence',
    contractVersion: '1',
    sourceInput: 'rights-governed-controlled-extraction',
  },
  boardAlignment: {
    workerId: 'content-factory.board-alignment',
    contractVersion: '1',
    sourceInput: 'approved-structured-facts-only',
  },
  coverage: {
    workerId: 'content-factory.coverage',
    contractVersion: '1',
    sourceInput: 'permitted-curriculum-requirements-plus-alignment',
  },
  knowledgeModel: {
    workerId: 'content-factory.knowledge-model',
    contractVersion: '1',
    sourceInput: 'permitted-curriculum-requirements-plus-alignment',
  },
} as const

function canonicalise(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalise)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonicalise(child)]),
    )
  }
  return value
}

export async function fingerprintValue(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(canonicalise(value)))
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function ruleMatchesSource(rule: SourceRightsPolicyRule, source: DiscoveredSource) {
  const sourceHost = new URL(source.url).hostname.toLowerCase()
  return rule.issuer.toLowerCase() === source.issuer.toLowerCase()
    && rule.hostnames.some((hostname) => sourceHost === hostname.toLowerCase())
    && rule.sourceTypes.includes(source.sourceType)
}

export async function classifySourcesWithApprovedRules(input: {
  jobId: string
  sources: DiscoveredSource[]
  rules: SourceRightsPolicyRule[]
  checkedAt: string
}): Promise<{ register: SourceLicenceRegister; status: 'approved' | 'blocked'; blockingSourceIds: string[] }> {
  const sources = z.array(discoveredSourceSchema).min(1).parse(input.sources)
  const rules = z.array(sourceRightsPolicyRuleSchema).parse(input.rules)

  const records = await Promise.all(sources.map(async (source) => {
    const matches = rules.filter((rule) => ruleMatchesSource(rule, source))
    const sourceFingerprint = await fingerprintValue(source)

    if (matches.length !== 1) {
      return sourceLicenceRecordSchema.parse({
        id: source.id,
        issuer: source.issuer,
        urlOrReference: source.url,
        sourceType: source.sourceType,
        educationalRole: source.educationalRole,
        versionOrDate: source.versionOrDate,
        useClass: 'UNKNOWN',
        permissionBasis: matches.length === 0
          ? 'No approved reusable source-rights rule matched this source'
          : 'Multiple approved reusable source-rights rules matched this source',
        aiInputPermitted: false,
        derivedCommercialUsePermitted: false,
        attributionRequirements: [],
        restrictions: ['source_rights_review_required'],
        checkedAt: input.checkedAt,
        checkerMethod: 'approved-policy-rule-engine:v1',
        sourceFingerprint,
        revalidationConditions: [],
      })
    }

    const rule = matches[0]
    return sourceLicenceRecordSchema.parse({
      id: source.id,
      issuer: source.issuer,
      urlOrReference: source.url,
      sourceType: source.sourceType,
      educationalRole: source.educationalRole,
      versionOrDate: source.versionOrDate,
      useClass: rule.useClass,
      permissionBasis: rule.permissionBasis,
      aiInputPermitted: rule.aiInputPermitted,
      derivedCommercialUsePermitted: rule.derivedCommercialUsePermitted,
      attributionRequirements: rule.attributionRequirements,
      restrictions: rule.restrictions,
      checkedAt: input.checkedAt,
      checkerMethod: `approved-policy-rule:${rule.id}`,
      sourceFingerprint,
      revalidationConditions: rule.revalidationConditions,
    })
  }))

  const fingerprint = await fingerprintValue(records)
  const register = sourceLicenceRegisterSchema.parse({
    schemaVersion: 2,
    jobId: input.jobId,
    fingerprint,
    checkedAt: input.checkedAt,
    sources: records,
  })
  const blockingSourceIds = records
    .filter((source) => source.useClass === 'PROHIBITED' || source.useClass === 'UNKNOWN')
    .map((source) => source.id)

  return {
    register,
    status: blockingSourceIds.length > 0 ? 'blocked' : 'approved',
    blockingSourceIds,
  }
}

function appendWorkerRun(
  jobInput: ContentFactoryJob,
  stage: WorkerRun['stage'],
  execution: WorkerExecution<unknown>,
  updatedAt: string,
) {
  const job = contentFactoryJobSchema.parse(jobInput)
  const run = {
    id: execution.provenance.id,
    stage,
    contextId: execution.provenance.contextId,
    contractVersion: execution.provenance.contractVersion,
    provider: execution.provenance.provider,
    model: execution.provenance.model,
    inputRefs: [],
    outputRefs: [],
    status: execution.status,
    retryCount: execution.provenance.retryCount ?? 0,
    usageCost: execution.provenance.usageCost,
  }

  return contentFactoryJobSchema.parse({
    ...job,
    workerRuns: [...job.workerRuns, run],
    updatedAt,
  })
}

function workerFailure(
  jobInput: ContentFactoryJob,
  stage: WorkerRun['stage'],
  execution: Extract<WorkerExecution<unknown>, { status: 'failure' | 'infrastructure_failure' }>,
  updatedAt: string,
) {
  const withRun = appendWorkerRun(jobInput, stage, execution, updatedAt)
  return blockJob(withRun, {
    id: `worker-failure-${execution.provenance.id}`,
    reason: `${stage} worker ${execution.status}: ${execution.error}`,
    createdAt: updatedAt,
  })
}

function requireV2State(jobInput: ContentFactoryJob, state: ContentFactoryJob['state']) {
  const job = contentFactoryJobSchema.parse(jobInput)
  if (job.schemaVersion !== 2) throw new Error('Intake-to-knowledge-model pipeline requires a schema v2 job')
  if (job.state !== state) throw new Error(`Expected Content Factory job state ${state}, received ${job.state}`)
  return job
}

function validateStructuredEvidence(
  evidenceInput: unknown,
  register: SourceLicenceRegister,
): StructuredSourceEvidence {
  const evidence = structuredSourceEvidenceSchema.parse(evidenceInput)
  const sources = new Map(register.sources.map((source) => [source.id, source]))

  for (const fact of evidence.boardAlignmentFacts) {
    const source = sources.get(fact.sourceRef)
    if (!source) throw new Error(`Board Alignment fact ${fact.id} references unknown source ${fact.sourceRef}`)
    if (source.useClass === 'PROHIBITED' || source.useClass === 'UNKNOWN') {
      throw new Error(`Board Alignment fact ${fact.id} references blocked source ${fact.sourceRef}`)
    }
    if (fact.verificationStatus !== 'verified') {
      throw new Error(`Board Alignment fact ${fact.id} is not verified`)
    }
  }

  for (const requirement of evidence.curriculumRequirements) {
    for (const sourceRef of requirement.sourceRefs) {
      const source = sources.get(sourceRef)
      if (!source) throw new Error(`Curriculum requirement ${requirement.requirementId} references unknown source ${sourceRef}`)
      if (!['OPEN', 'REVISION_OWNED', 'LICENSED'].includes(source.useClass) || !source.derivedCommercialUsePermitted) {
        throw new Error(`Curriculum requirement ${requirement.requirementId} uses source ${sourceRef} without permitted curriculum/commercial-use rights`)
      }
    }
  }

  return evidence
}

function validateBoardAlignment(
  alignmentInput: unknown,
  job: ContentFactoryJob,
  register: SourceLicenceRegister,
): BoardAlignment {
  const alignment = boardAlignmentSchema.parse(alignmentInput)
  if (alignment.jobId !== job.jobId) throw new Error('Board Alignment job ID does not match the Content Factory job')
  if (JSON.stringify(alignment.courseIdentity) !== JSON.stringify(job.courseIdentity)) {
    throw new Error('Board Alignment course identity does not match the resolved Content Factory identity')
  }
  if (alignment.verificationStatus !== 'verified') throw new Error('Board Alignment must be verified before mapping can proceed')

  const sourceIds = new Set(register.sources
    .filter((source) => source.useClass !== 'PROHIBITED' && source.useClass !== 'UNKNOWN')
    .map((source) => source.id))
  for (const sourceRef of alignment.sourceRefs) {
    if (!sourceIds.has(sourceRef)) throw new Error(`Board Alignment references unavailable source ${sourceRef}`)
  }

  const jobComponents = new Set(job.components.map((component) => component.id))
  const alignmentComponents = new Set(alignment.components.map((component) => component.id))
  if (jobComponents.size !== alignmentComponents.size || [...jobComponents].some((id) => !alignmentComponents.has(id))) {
    throw new Error('Board Alignment components do not match the resolved course components')
  }

  return alignment
}

function permittedCurriculumSourceIds(register: SourceLicenceRegister) {
  return new Set(register.sources
    .filter((source) => ['OPEN', 'REVISION_OWNED', 'LICENSED'].includes(source.useClass) && source.derivedCommercialUsePermitted)
    .map((source) => source.id))
}

function validateCoverage(
  coverageInput: unknown,
  job: ContentFactoryJob,
  register: SourceLicenceRegister,
): CoverageMap {
  const coverage = coverageMapSchema.parse(coverageInput)
  if (coverage.jobId !== job.jobId) throw new Error('Coverage map job ID does not match the Content Factory job')
  if (coverage.sourceSetFingerprint !== register.fingerprint) throw new Error('Coverage map does not match the approved source set')

  const permittedSources = permittedCurriculumSourceIds(register)
  const componentIds = new Set(job.components.map((component) => component.id))
  for (const requirement of coverage.requirements) {
    for (const sourceRef of requirement.sourceRefs) {
      if (!permittedSources.has(sourceRef)) throw new Error(`Coverage requirement ${requirement.requirementId} references source ${sourceRef} without permitted curriculum rights`)
    }
    for (const componentId of requirement.componentScope) {
      if (!componentIds.has(componentId)) throw new Error(`Coverage requirement ${requirement.requirementId} references unknown component ${componentId}`)
    }
  }
  return coverage
}

function validateKnowledgeModel(
  modelInput: unknown,
  job: ContentFactoryJob,
  register: SourceLicenceRegister,
  boardAlignment: BoardAlignment,
): CourseKnowledgeModel {
  const model = courseKnowledgeModelSchema.parse(modelInput)
  if (model.jobId !== job.jobId) throw new Error('Course Knowledge Model job ID does not match the Content Factory job')

  const permittedSources = permittedCurriculumSourceIds(register)
  const alignmentIds = new Set([
    ...boardAlignment.components.map((component) => component.id),
    ...boardAlignment.assessmentObjectives.map((objective) => objective.id),
    ...boardAlignment.assessmentRequirements.map((requirement) => requirement.id),
  ])
  for (const node of model.nodes) {
    for (const sourceRef of node.sourceRefs) {
      if (!permittedSources.has(sourceRef)) throw new Error(`Knowledge node ${node.id} references source ${sourceRef} without permitted curriculum rights`)
    }
    for (const alignmentRef of node.boardAlignmentRefs) {
      if (!alignmentIds.has(alignmentRef)) throw new Error(`Knowledge node ${node.id} references unknown Board Alignment item ${alignmentRef}`)
    }
  }
  return model
}

export async function runIntakeToKnowledgeModel(input: {
  job: ContentFactoryJob
  workers: IntakeToKnowledgeModelWorkers
  artifactStore: ContentFactoryArtifactStore
  sourceRightsRules: SourceRightsPolicyRule[]
  now: string
}): Promise<ContentFactoryJob> {
  let job = requireV2State(input.job, 'requested')

  const identityExecution = await input.workers.resolveIdentity({
    jobId: job.jobId,
    officialUrls: job.officialUrls,
    founderInstruction: job.founderInstruction,
  })
  if (identityExecution.status !== 'success') return workerFailure(job, 'identity', identityExecution, input.now)
  const identity = identityResolutionOutputSchema.parse(identityExecution.output)
  job = appendWorkerRun(job, 'identity', identityExecution, input.now)
  job = contentFactoryJobSchema.parse({
    ...job,
    courseIdentity: identity.courseIdentity,
    cohortValidity: identity.cohortValidity,
    components: identity.components,
    unresolvedChoices: identity.unresolvedChoices,
    updatedAt: input.now,
  })
  if (identity.unresolvedChoices.length > 0) {
    return blockJob(job, {
      id: `course-option-resolution-required-${identityExecution.provenance.id}`,
      reason: `course_option_resolution_required: ${identity.unresolvedChoices.join('; ')}`,
      createdAt: input.now,
    })
  }
  job = advanceJob(job, 'identified', input.now)

  const sourceExecution = await input.workers.discoverSources({
    jobId: job.jobId,
    officialUrls: job.officialUrls,
    identity,
  })
  if (sourceExecution.status !== 'success') return workerFailure(job, 'source', sourceExecution, input.now)
  const discoveredSources = z.array(discoveredSourceSchema).min(1).parse(sourceExecution.output)
  job = appendWorkerRun(job, 'source', sourceExecution, input.now)

  const sourceRights = await classifySourcesWithApprovedRules({
    jobId: job.jobId,
    sources: discoveredSources,
    rules: input.sourceRightsRules,
    checkedAt: input.now,
  })
  const registerWrite = await input.artifactStore.writeJson({
    jobId: job.jobId,
    kind: 'source_licence_register',
    fingerprint: sourceRights.register.fingerprint,
    value: sourceRights.register,
  })
  const sourceRightsRunId = `source-rights-${job.workerRuns.length + 1}`
  job = appendWorkerRun(job, 'source_rights', {
    status: 'success',
    output: sourceRights.register,
    provenance: {
      id: sourceRightsRunId,
      contextId: 'deterministic-source-rights-policy-engine',
      contractVersion: '1',
    },
  }, input.now)
  job = contentFactoryJobSchema.parse({
    ...job,
    sourceLicenceRegisterRef: registerWrite.ref,
    sourceRightsStatus: sourceRights.status,
    sourceSetFingerprint: sourceRights.register.fingerprint,
    updatedAt: input.now,
  })
  if (sourceRights.status === 'blocked') {
    return blockJob(job, {
      id: `source-rights-review-required-${sourceRightsRunId}`,
      reason: `source_rights_review_required: ${sourceRights.blockingSourceIds.join(', ')}`,
      createdAt: input.now,
    })
  }
  job = advanceJob(job, 'sourced', input.now)

  const evidenceExecution = await input.workers.resolveStructuredEvidence({
    jobId: job.jobId,
    officialUrls: job.officialUrls,
    identity,
    sourceLicenceRegister: sourceRights.register,
  })
  if (evidenceExecution.status !== 'success') return workerFailure(job, 'source', evidenceExecution, input.now)
  const evidence = validateStructuredEvidence(evidenceExecution.output, sourceRights.register)
  job = appendWorkerRun(job, 'source', evidenceExecution, input.now)

  const alignmentExecution = await input.workers.compileBoardAlignment({
    jobId: job.jobId,
    identity,
    sourceLicenceRegister: sourceRights.register,
    facts: evidence.boardAlignmentFacts,
  })
  if (alignmentExecution.status !== 'success') return workerFailure(job, 'board_alignment', alignmentExecution, input.now)
  const boardAlignment = validateBoardAlignment(alignmentExecution.output, job, sourceRights.register)
  const alignmentFingerprint = await fingerprintValue(boardAlignment)
  const alignmentWrite = await input.artifactStore.writeJson({
    jobId: job.jobId,
    kind: 'board_alignment',
    fingerprint: alignmentFingerprint,
    value: boardAlignment,
  })
  job = appendWorkerRun(job, 'board_alignment', alignmentExecution, input.now)

  const coverageExecution = await input.workers.compileCoverage({
    jobId: job.jobId,
    identity,
    sourceLicenceRegister: sourceRights.register,
    boardAlignment,
    requirements: evidence.curriculumRequirements,
  })
  if (coverageExecution.status !== 'success') return workerFailure(job, 'coverage', coverageExecution, input.now)
  const coverageMap = validateCoverage(coverageExecution.output, job, sourceRights.register)
  const coverageFingerprint = await fingerprintValue(coverageMap)
  const coverageWrite = await input.artifactStore.writeJson({
    jobId: job.jobId,
    kind: 'coverage_map',
    fingerprint: coverageFingerprint,
    value: coverageMap,
  })
  job = appendWorkerRun(job, 'coverage', coverageExecution, input.now)
  job = contentFactoryJobSchema.parse({
    ...job,
    boardAlignmentRef: alignmentWrite.ref,
    coverageMapRef: coverageWrite.ref,
    updatedAt: input.now,
  })
  job = advanceJob(job, 'mapped', input.now)

  const knowledgeExecution = await input.workers.compileKnowledgeModel({
    jobId: job.jobId,
    identity,
    sourceLicenceRegister: sourceRights.register,
    boardAlignment,
    coverageMap,
    requirements: evidence.curriculumRequirements,
  })
  if (knowledgeExecution.status !== 'success') return workerFailure(job, 'knowledge_model', knowledgeExecution, input.now)
  const knowledgeModel = validateKnowledgeModel(knowledgeExecution.output, job, sourceRights.register, boardAlignment)
  const knowledgeFingerprint = await fingerprintValue(knowledgeModel)
  const knowledgeWrite = await input.artifactStore.writeJson({
    jobId: job.jobId,
    kind: 'course_knowledge_model',
    fingerprint: knowledgeFingerprint,
    value: knowledgeModel,
  })
  job = appendWorkerRun(job, 'knowledge_model', knowledgeExecution, input.now)

  return contentFactoryJobSchema.parse({
    ...job,
    courseKnowledgeModelRef: knowledgeWrite.ref,
    updatedAt: input.now,
  })
}

export async function readSourceLicenceRegister(
  jobInput: ContentFactoryJob,
  artifactStore: ContentFactoryArtifactStore,
): Promise<SourceLicenceRegister> {
  const job = contentFactoryJobSchema.parse(jobInput)
  if (!job.sourceLicenceRegisterRef) throw new Error('Content Factory job has no Source Licence Register reference')
  return sourceLicenceRegisterSchema.parse(await artifactStore.readJson(job.sourceLicenceRegisterRef))
}
