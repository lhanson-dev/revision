import { z } from 'zod'
import {
  boardAlignmentSchema,
  cohortValiditySchema,
  courseComponentSchema,
  courseIdentitySchema,
  courseKnowledgeModelSchema,
  questionFamilySchema,
  sourceLicenceRecordSchema,
  sourceLicenceRegisterSchema,
  sourceTypeSchema,
  sourceUseClassSchema,
  type BoardAlignment,
  type CourseKnowledgeModel,
  type QuestionFamily,
  type SourceLicenceRegister,
} from './schema'
import {
  foundationCandidateSchema,
  foundationJobSchema,
  type FoundationCandidate,
  type FoundationJob,
} from './foundation-schema'
import { setFoundationCandidate } from './foundation-lifecycle'

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const nonEmptyStringSchema = z.string().min(1)
const commitShaSchema = z.string().regex(/^[0-9a-f]{40}$/)

export const foundationIdentityResolutionSchema = z.object({
  courseIdentity: courseIdentitySchema,
  cohortValidity: cohortValiditySchema,
  components: z.array(courseComponentSchema).min(1),
  unresolvedChoices: z.array(nonEmptyStringSchema).default([]),
})

export const foundationDiscoveredSourceSchema = z.object({
  id: identifierSchema,
  url: z.string().url(),
  title: nonEmptyStringSchema,
  issuer: nonEmptyStringSchema,
  sourceType: sourceTypeSchema,
  educationalRole: z.array(nonEmptyStringSchema).min(1),
  versionOrDate: nonEmptyStringSchema.optional(),
})

export const foundationSourceRightsPolicyRuleSchema = z.object({
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

export const foundationBoardAlignmentFactSchema = z.object({
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

export const foundationCurriculumRequirementInputSchema = z.object({
  requirementId: identifierSchema,
  officialReference: nonEmptyStringSchema,
  requirementSummary: nonEmptyStringSchema,
  skillsOrKnowledge: z.array(nonEmptyStringSchema).min(1),
  componentScope: z.array(identifierSchema).default([]),
  revisionArea: nonEmptyStringSchema,
  sourceRefs: z.array(identifierSchema).min(1),
})

export const foundationStructuredEvidenceSchema = z.object({
  boardAlignmentFacts: z.array(foundationBoardAlignmentFactSchema).min(1),
  curriculumRequirements: z.array(foundationCurriculumRequirementInputSchema).min(1),
})

export const foundationCoverageRequirementSchema = foundationCurriculumRequirementInputSchema.extend({
  knowledgeNodeIds: z.array(identifierSchema).min(1),
  coverageStatus: z.literal('complete'),
})

export const foundationCoverageModelSchema = z.object({
  schemaVersion: z.literal(1),
  jobId: identifierSchema,
  sourceSetFingerprint: nonEmptyStringSchema,
  requirements: z.array(foundationCoverageRequirementSchema).min(1),
}).superRefine((coverage, context) => {
  const ids = new Set<string>()
  coverage.requirements.forEach((requirement, index) => {
    if (ids.has(requirement.requirementId)) {
      context.addIssue({
        code: 'custom',
        path: ['requirements', index, 'requirementId'],
        message: `Duplicate Foundation coverage requirement id: ${requirement.requirementId}`,
      })
    }
    ids.add(requirement.requirementId)

    const nodeIds = new Set<string>()
    requirement.knowledgeNodeIds.forEach((nodeId, nodeIndex) => {
      if (nodeIds.has(nodeId)) {
        context.addIssue({
          code: 'custom',
          path: ['requirements', index, 'knowledgeNodeIds', nodeIndex],
          message: `Duplicate knowledge node ${nodeId} on Foundation coverage requirement ${requirement.requirementId}`,
        })
      }
      nodeIds.add(nodeId)
    })
  })
})

export const foundationAssessmentBlueprintSchema = z.object({
  schemaVersion: z.literal(1),
  jobId: identifierSchema,
  boardAlignmentFingerprint: nonEmptyStringSchema,
  courseKnowledgeModelFingerprint: nonEmptyStringSchema,
  assessmentObjectives: z.array(z.object({
    id: identifierSchema,
    weightingPercent: z.number().nonnegative().max(100).optional(),
  })).default([]),
  components: z.array(z.object({
    componentId: identifierSchema,
    questionFamilyIds: z.array(identifierSchema).default([]),
    markTotal: z.number().int().positive().optional(),
    timingMinutes: z.number().int().positive().optional(),
    constraints: z.array(nonEmptyStringSchema).default([]),
  })).min(1),
  commandDemands: z.array(z.object({
    command: nonEmptyStringSchema,
    cognitiveDemand: nonEmptyStringSchema,
    componentScope: z.array(identifierSchema).default([]),
  })).default([]),
  evidenceExpectations: z.array(nonEmptyStringSchema).default([]),
  quantitativeRequirements: z.array(nonEmptyStringSchema).default([]),
  synopticRequirements: z.array(nonEmptyStringSchema).default([]),
})

export type FoundationIdentityResolution = z.infer<typeof foundationIdentityResolutionSchema>
export type FoundationDiscoveredSource = z.infer<typeof foundationDiscoveredSourceSchema>
export type FoundationSourceRightsPolicyRule = z.infer<typeof foundationSourceRightsPolicyRuleSchema>
export type FoundationStructuredEvidence = z.infer<typeof foundationStructuredEvidenceSchema>
export type FoundationCurriculumRequirementInput = z.infer<typeof foundationCurriculumRequirementInputSchema>
export type FoundationCoverageModel = z.infer<typeof foundationCoverageModelSchema>
export type FoundationAssessmentBlueprint = z.infer<typeof foundationAssessmentBlueprintSchema>

export type FoundationWorkerExecutionProvenance = {
  id: string
  contextId: string
  contractVersion: string
  provider?: string
  model?: string
  retryCount?: number
  usageCost?: number
}

export type FoundationWorkerExecution<T> =
  | { status: 'success'; output: T; provenance: FoundationWorkerExecutionProvenance }
  | { status: 'failure' | 'infrastructure_failure'; error: string; provenance: FoundationWorkerExecutionProvenance }

export const foundationCompilationWorkerStageSchema = z.enum([
  'identity',
  'source_discovery',
  'source_rights',
  'structured_evidence',
  'board_alignment',
  'coverage',
  'course_truth',
  'exam_truth',
  'question_families',
])

export type FoundationCompilationWorkerStage = z.infer<typeof foundationCompilationWorkerStageSchema>

export type FoundationCompilationWorkerRun = {
  stage: FoundationCompilationWorkerStage
  provenance: FoundationWorkerExecutionProvenance
  inputRefs: string[]
  outputRefs: string[]
}

export type FoundationCompilationArtifactKind =
  | 'source_licence_register'
  | 'board_alignment'
  | 'foundation_coverage_model'
  | 'course_knowledge_model'
  | 'assessment_blueprint'
  | 'question_family'

export interface FoundationCompilationArtifactStore {
  writeJson(input: {
    jobId: string
    kind: FoundationCompilationArtifactKind
    fingerprint: string
    value: unknown
  }): Promise<{ ref: string }>
}

export interface FoundationCompilationWorkers {
  resolveIdentity(input: {
    jobId: string
    officialUrls: string[]
    founderInstruction: string
  }): Promise<FoundationWorkerExecution<unknown>>
  discoverSources(input: {
    jobId: string
    officialUrls: string[]
    identity: FoundationIdentityResolution
  }): Promise<FoundationWorkerExecution<unknown>>
  resolveStructuredEvidence(input: {
    jobId: string
    officialUrls: string[]
    identity: FoundationIdentityResolution
    sourceLicenceRegister: SourceLicenceRegister
  }): Promise<FoundationWorkerExecution<unknown>>
  compileBoardAlignment(input: {
    jobId: string
    identity: FoundationIdentityResolution
    sourceLicenceRegister: SourceLicenceRegister
    facts: FoundationStructuredEvidence['boardAlignmentFacts']
  }): Promise<FoundationWorkerExecution<unknown>>
  compileCoverage(input: {
    jobId: string
    identity: FoundationIdentityResolution
    sourceLicenceRegister: SourceLicenceRegister
    boardAlignment: BoardAlignment
    requirements: FoundationCurriculumRequirementInput[]
  }): Promise<FoundationWorkerExecution<unknown>>
  compileCourseTruth(input: {
    jobId: string
    identity: FoundationIdentityResolution
    sourceLicenceRegister: SourceLicenceRegister
    boardAlignment: BoardAlignment
    coverageModel: FoundationCoverageModel
    requirements: FoundationCurriculumRequirementInput[]
  }): Promise<FoundationWorkerExecution<unknown>>
  compileExamTruth(input: {
    jobId: string
    identity: FoundationIdentityResolution
    boardAlignment: BoardAlignment
    boardAlignmentFingerprint: string
    courseKnowledgeModel: CourseKnowledgeModel
    courseKnowledgeModelFingerprint: string
  }): Promise<FoundationWorkerExecution<unknown>>
  compileQuestionFamilies(input: {
    jobId: string
    identity: FoundationIdentityResolution
    assessmentBlueprint: FoundationAssessmentBlueprint
    requestedFamilyIds: string[]
    courseKnowledgeModel: CourseKnowledgeModel
  }): Promise<FoundationWorkerExecution<unknown>>
}

export const foundationCompilationWorkerContracts = {
  identity: { workerId: 'content-factory.foundation.identity', contractVersion: '1', sourceInput: 'identity-pointers-only' },
  sourceDiscovery: { workerId: 'content-factory.foundation.source-discovery', contractVersion: '1', sourceInput: 'metadata-only' },
  structuredEvidence: { workerId: 'content-factory.foundation.structured-evidence', contractVersion: '1', sourceInput: 'rights-governed-controlled-extraction' },
  boardAlignment: { workerId: 'content-factory.foundation.board-alignment', contractVersion: '1', sourceInput: 'approved-structured-facts-only' },
  coverage: { workerId: 'content-factory.foundation.coverage', contractVersion: '1', sourceInput: 'permitted-curriculum-requirements-without-learner-assets' },
  courseTruth: { workerId: 'content-factory.foundation.course-truth', contractVersion: '1', sourceInput: 'foundation-coverage-plus-board-alignment' },
  examTruth: { workerId: 'content-factory.foundation.exam-truth', contractVersion: '1', sourceInput: 'board-alignment-plus-course-truth' },
  questionFamilies: { workerId: 'content-factory.foundation.question-families', contractVersion: '1', sourceInput: 'exam-truth-plus-course-truth' },
} as const

export class FoundationCompilationError extends Error {
  readonly stage: FoundationCompilationWorkerStage

  constructor(stage: FoundationCompilationWorkerStage, message: string) {
    super(`${stage}: ${message}`)
    this.name = 'FoundationCompilationError'
    this.stage = stage
  }
}

function canonicalise(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalise)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, child]) => child !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonicalise(child)]),
    )
  }
  return value
}

export async function fingerprintFoundationArtifact(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(canonicalise(value)))
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function sameSet(left: Iterable<string>, right: Iterable<string>) {
  const a = new Set(left)
  const b = new Set(right)
  return a.size === b.size && [...a].every((value) => b.has(value))
}

function assertNoDuplicates(values: string[], label: string) {
  const seen = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) throw new Error(`Duplicate ${label}: ${value}`)
    seen.add(value)
  }
}

function sameJson(left: unknown, right: unknown) {
  return JSON.stringify(canonicalise(left)) === JSON.stringify(canonicalise(right))
}

function ruleMatchesSource(rule: FoundationSourceRightsPolicyRule, source: FoundationDiscoveredSource) {
  const sourceHost = new URL(source.url).hostname.toLowerCase()
  return rule.issuer.toLowerCase() === source.issuer.toLowerCase()
    && rule.hostnames.some((hostname) => sourceHost === hostname.toLowerCase())
    && rule.sourceTypes.includes(source.sourceType)
}

export async function classifyFoundationSourcesWithApprovedRules(input: {
  jobId: string
  sources: FoundationDiscoveredSource[]
  rules: FoundationSourceRightsPolicyRule[]
  checkedAt: string
}): Promise<{ register: SourceLicenceRegister; status: 'approved' | 'blocked'; blockingSourceIds: string[] }> {
  const sources = z.array(foundationDiscoveredSourceSchema).min(1).parse(input.sources)
  const rules = z.array(foundationSourceRightsPolicyRuleSchema).parse(input.rules)

  const records = await Promise.all(sources.map(async (source) => {
    const matches = rules.filter((rule) => ruleMatchesSource(rule, source))
    const sourceFingerprint = await fingerprintFoundationArtifact(source)

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

  const fingerprint = await fingerprintFoundationArtifact(records)
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

function availableBoardSourceIds(register: SourceLicenceRegister) {
  return new Set(register.sources
    .filter((source) => source.useClass !== 'PROHIBITED' && source.useClass !== 'UNKNOWN')
    .map((source) => source.id))
}

function permittedCurriculumSourceIds(register: SourceLicenceRegister) {
  return new Set(register.sources
    .filter((source) => ['OPEN', 'REVISION_OWNED', 'LICENSED'].includes(source.useClass) && source.derivedCommercialUsePermitted)
    .map((source) => source.id))
}

function validateStructuredEvidence(
  evidenceInput: unknown,
  identity: FoundationIdentityResolution,
  register: SourceLicenceRegister,
) {
  const evidence = foundationStructuredEvidenceSchema.parse(evidenceInput)
  const boardSources = availableBoardSourceIds(register)
  const curriculumSources = permittedCurriculumSourceIds(register)
  const componentIds = new Set(identity.components.map((component) => component.id))

  assertNoDuplicates(evidence.boardAlignmentFacts.map((fact) => fact.id), 'Board Alignment fact id')
  assertNoDuplicates(evidence.curriculumRequirements.map((requirement) => requirement.requirementId), 'curriculum requirement id')

  for (const fact of evidence.boardAlignmentFacts) {
    if (!boardSources.has(fact.sourceRef)) throw new Error(`Board Alignment fact ${fact.id} references unavailable source ${fact.sourceRef}`)
    if (fact.verificationStatus !== 'verified') throw new Error(`Board Alignment fact ${fact.id} is not verified`)
  }

  for (const requirement of evidence.curriculumRequirements) {
    assertNoDuplicates(requirement.sourceRefs, `source reference on curriculum requirement ${requirement.requirementId}`)
    assertNoDuplicates(requirement.componentScope, `component reference on curriculum requirement ${requirement.requirementId}`)
    for (const sourceRef of requirement.sourceRefs) {
      if (!curriculumSources.has(sourceRef)) {
        throw new Error(`Curriculum requirement ${requirement.requirementId} uses source ${sourceRef} without permitted derived curriculum rights`)
      }
    }
    for (const componentId of requirement.componentScope) {
      if (!componentIds.has(componentId)) throw new Error(`Curriculum requirement ${requirement.requirementId} references unknown component ${componentId}`)
    }
  }

  return evidence
}

function assertResolvedComponentCompatibility(
  resolvedComponents: FoundationIdentityResolution['components'],
  alignedComponents: BoardAlignment['components'],
) {
  assertNoDuplicates(resolvedComponents.map((component) => component.id), 'resolved course component id')
  assertNoDuplicates(alignedComponents.map((component) => component.id), 'Board Alignment component id')
  if (!sameSet(resolvedComponents.map((component) => component.id), alignedComponents.map((component) => component.id))) {
    throw new Error('Board Alignment components do not match resolved course components')
  }

  const alignedById = new Map(alignedComponents.map((component) => [component.id, component]))
  for (const resolved of resolvedComponents) {
    const aligned = alignedById.get(resolved.id)!
    if (aligned.name !== resolved.name || aligned.compulsory !== resolved.compulsory) {
      throw new Error(`Board Alignment component ${resolved.id} changes resolved name or compulsory status`)
    }
    if (resolved.marks !== undefined && aligned.marks !== resolved.marks) {
      throw new Error(`Board Alignment component ${resolved.id} changes resolved marks`)
    }
    if (resolved.durationMinutes !== undefined && aligned.durationMinutes !== resolved.durationMinutes) {
      throw new Error(`Board Alignment component ${resolved.id} changes resolved duration`)
    }
    if (resolved.weightingPercent !== undefined && aligned.weightingPercent !== resolved.weightingPercent) {
      throw new Error(`Board Alignment component ${resolved.id} changes resolved weighting`)
    }
  }
}

async function validateBoardAlignment(
  alignmentInput: unknown,
  jobId: string,
  identity: FoundationIdentityResolution,
  register: SourceLicenceRegister,
) {
  const parsed = boardAlignmentSchema.parse(alignmentInput)
  if (parsed.jobId !== jobId) throw new Error('Board Alignment job ID does not match the Foundation job')
  if (!sameJson(parsed.courseIdentity, identity.courseIdentity)) throw new Error('Board Alignment course identity does not match resolved identity')
  if (!sameJson(parsed.cohortValidity, identity.cohortValidity)) throw new Error('Board Alignment cohort validity does not match resolved identity')
  if (parsed.verificationStatus !== 'verified') throw new Error('Board Alignment must be verified')
  assertResolvedComponentCompatibility(identity.components, parsed.components)
  assertNoDuplicates(parsed.assessmentObjectives.map((objective) => objective.id), 'Board Alignment assessment objective id')
  assertNoDuplicates(parsed.assessmentRequirements.map((requirement) => requirement.id), 'Board Alignment assessment requirement id')

  const componentIds = new Set(parsed.components.map((component) => component.id))
  const boardSources = availableBoardSourceIds(register)
  for (const sourceRef of parsed.sourceRefs) {
    if (!boardSources.has(sourceRef)) throw new Error(`Board Alignment references unavailable source ${sourceRef}`)
  }
  for (const objective of parsed.assessmentObjectives) {
    for (const sourceRef of objective.sourceRefs) {
      if (!boardSources.has(sourceRef)) throw new Error(`Assessment objective ${objective.id} references unavailable source ${sourceRef}`)
    }
  }
  for (const requirement of parsed.assessmentRequirements) {
    assertNoDuplicates(requirement.componentScope, `component reference on Board Alignment assessment requirement ${requirement.id}`)
    for (const componentId of requirement.componentScope) {
      if (!componentIds.has(componentId)) throw new Error(`Assessment requirement ${requirement.id} references unknown component ${componentId}`)
    }
    for (const sourceRef of requirement.sourceRefs) {
      if (!boardSources.has(sourceRef)) throw new Error(`Assessment requirement ${requirement.id} references unavailable source ${sourceRef}`)
    }
  }

  const valueWithoutFingerprint = { ...parsed, fingerprint: undefined }
  const fingerprint = await fingerprintFoundationArtifact(valueWithoutFingerprint)
  return boardAlignmentSchema.parse({ ...parsed, fingerprint })
}

function requirementMatchesSource(requirement: FoundationCurriculumRequirementInput, source: z.infer<typeof foundationCoverageRequirementSchema>) {
  return requirement.requirementId === source.requirementId
    && requirement.officialReference === source.officialReference
    && requirement.requirementSummary === source.requirementSummary
    && sameSet(requirement.skillsOrKnowledge, source.skillsOrKnowledge)
    && sameSet(requirement.componentScope, source.componentScope)
    && requirement.revisionArea === source.revisionArea
    && sameSet(requirement.sourceRefs, source.sourceRefs)
}

function validateCoverage(
  coverageInput: unknown,
  jobId: string,
  identity: FoundationIdentityResolution,
  register: SourceLicenceRegister,
  requirements: FoundationCurriculumRequirementInput[],
) {
  const coverage = foundationCoverageModelSchema.parse(coverageInput)
  if (coverage.jobId !== jobId) throw new Error('Foundation coverage model job ID does not match the Foundation job')
  if (coverage.sourceSetFingerprint !== register.fingerprint) throw new Error('Foundation coverage model does not match the approved source set')
  if (!sameSet(coverage.requirements.map((requirement) => requirement.requirementId), requirements.map((requirement) => requirement.requirementId))) {
    throw new Error('Foundation coverage model must contain exactly the governed curriculum requirement IDs')
  }

  const governedRequirements = new Map(requirements.map((requirement) => [requirement.requirementId, requirement]))
  const permittedSources = permittedCurriculumSourceIds(register)
  const componentIds = new Set(identity.components.map((component) => component.id))
  for (const requirement of coverage.requirements) {
    const governed = governedRequirements.get(requirement.requirementId)!
    if (!requirementMatchesSource(governed, requirement)) {
      throw new Error(`Foundation coverage requirement ${requirement.requirementId} does not preserve the governed curriculum requirement`)
    }
    for (const sourceRef of requirement.sourceRefs) {
      if (!permittedSources.has(sourceRef)) throw new Error(`Foundation coverage requirement ${requirement.requirementId} references source ${sourceRef} without permitted curriculum rights`)
    }
    for (const componentId of requirement.componentScope) {
      if (!componentIds.has(componentId)) throw new Error(`Foundation coverage requirement ${requirement.requirementId} references unknown component ${componentId}`)
    }
  }
  return coverage
}

async function validateCourseTruth(
  modelInput: unknown,
  jobId: string,
  register: SourceLicenceRegister,
  alignment: BoardAlignment,
  coverage: FoundationCoverageModel,
) {
  const model = courseKnowledgeModelSchema.parse(modelInput)
  if (model.jobId !== jobId) throw new Error('Course Truth job ID does not match the Foundation job')
  assertNoDuplicates(model.nodes.map((node) => node.id), 'Course Truth knowledge node id')

  const requiredNodeIds = new Set(coverage.requirements.flatMap((requirement) => requirement.knowledgeNodeIds))
  if (!sameSet(model.nodes.map((node) => node.id), requiredNodeIds)) {
    throw new Error('Course Truth must contain exactly the canonical knowledge/skill node IDs established by Foundation coverage')
  }

  const permittedSources = permittedCurriculumSourceIds(register)
  const alignmentIds = new Set([
    ...alignment.components.map((component) => component.id),
    ...alignment.assessmentObjectives.map((objective) => objective.id),
    ...alignment.assessmentRequirements.map((requirement) => requirement.id),
  ])
  const coverageByNode = new Map<string, FoundationCoverageModel['requirements']>()
  for (const requirement of coverage.requirements) {
    for (const nodeId of requirement.knowledgeNodeIds) {
      coverageByNode.set(nodeId, [...(coverageByNode.get(nodeId) ?? []), requirement])
    }
  }

  for (const node of model.nodes) {
    assertNoDuplicates(node.sourceRefs, `source reference on Course Truth node ${node.id}`)
    assertNoDuplicates(node.boardAlignmentRefs, `Board Alignment reference on Course Truth node ${node.id}`)
    if (node.boardAlignmentRefs.length === 0) {
      throw new Error(`Course Truth node ${node.id} must declare Board Alignment relevance`)
    }

    const governingRequirements = coverageByNode.get(node.id) ?? []
    const governedSourceIds = new Set(governingRequirements.flatMap((requirement) => requirement.sourceRefs))
    for (const sourceRef of node.sourceRefs) {
      if (!permittedSources.has(sourceRef) || !governedSourceIds.has(sourceRef)) {
        throw new Error(`Course Truth node ${node.id} references source ${sourceRef} outside its governed Foundation coverage`)
      }
    }
    for (const requirement of governingRequirements) {
      if (!requirement.sourceRefs.some((sourceRef) => node.sourceRefs.includes(sourceRef))) {
        throw new Error(`Course Truth node ${node.id} has no source trace to governing coverage requirement ${requirement.requirementId}`)
      }
    }
    for (const alignmentRef of node.boardAlignmentRefs) {
      if (!alignmentIds.has(alignmentRef)) throw new Error(`Course Truth node ${node.id} references unknown Board Alignment item ${alignmentRef}`)
    }
  }

  const valueWithoutFingerprint = { ...model, fingerprint: undefined }
  const fingerprint = await fingerprintFoundationArtifact(valueWithoutFingerprint)
  return courseKnowledgeModelSchema.parse({ ...model, fingerprint })
}

async function validateExamTruth(
  blueprintInput: unknown,
  jobId: string,
  identity: FoundationIdentityResolution,
  alignment: BoardAlignment,
  boardAlignmentFingerprint: string,
  courseKnowledgeModelFingerprint: string,
) {
  const blueprint = foundationAssessmentBlueprintSchema.parse(blueprintInput)
  if (blueprint.jobId !== jobId) throw new Error('Exam Truth job ID does not match the Foundation job')
  if (blueprint.boardAlignmentFingerprint !== boardAlignmentFingerprint) throw new Error('Exam Truth does not reference the exact Board Alignment fingerprint')
  if (blueprint.courseKnowledgeModelFingerprint !== courseKnowledgeModelFingerprint) throw new Error('Exam Truth does not reference the exact Course Truth fingerprint')

  assertNoDuplicates(blueprint.components.map((component) => component.componentId), 'Exam Truth component id')
  if (!sameSet(blueprint.components.map((component) => component.componentId), identity.components.map((component) => component.id))) {
    throw new Error('Exam Truth must cover the exact governed course components')
  }

  const governedComponents = new Map(alignment.components.map((component) => [component.id, component]))
  for (const component of blueprint.components) {
    const governed = governedComponents.get(component.componentId)
    if (!governed) throw new Error(`Exam Truth references unknown component ${component.componentId}`)
    assertNoDuplicates(component.questionFamilyIds, `Question Family id on Exam Truth component ${component.componentId}`)
    if (governed.marks !== undefined && component.markTotal !== governed.marks) {
      throw new Error(`Exam Truth mark total for ${component.componentId} must match Board Alignment`)
    }
    if (governed.durationMinutes !== undefined && component.timingMinutes !== governed.durationMinutes) {
      throw new Error(`Exam Truth timing for ${component.componentId} must match Board Alignment`)
    }
  }

  assertNoDuplicates(blueprint.assessmentObjectives.map((objective) => objective.id), 'Exam Truth assessment objective id')
  if (!sameSet(blueprint.assessmentObjectives.map((objective) => objective.id), alignment.assessmentObjectives.map((objective) => objective.id))) {
    throw new Error('Exam Truth assessment objectives must match Board Alignment')
  }
  const governedObjectives = new Map(alignment.assessmentObjectives.map((objective) => [objective.id, objective]))
  for (const objective of blueprint.assessmentObjectives) {
    const governed = governedObjectives.get(objective.id)!
    if (governed.weightingPercent !== undefined && objective.weightingPercent !== governed.weightingPercent) {
      throw new Error(`Exam Truth weighting for ${objective.id} must match Board Alignment`)
    }
  }

  const componentIds = new Set(identity.components.map((component) => component.id))
  for (const demand of blueprint.commandDemands) {
    assertNoDuplicates(demand.componentScope, `component reference on command demand ${demand.command}`)
    for (const componentId of demand.componentScope) {
      if (!componentIds.has(componentId)) throw new Error(`Exam Truth command demand references unknown component ${componentId}`)
    }
  }

  return blueprint
}

function expectedFamilyComponents(blueprint: FoundationAssessmentBlueprint, familyId: string) {
  return blueprint.components
    .filter((component) => component.questionFamilyIds.includes(familyId))
    .map((component) => component.componentId)
}

function validateQuestionFamilies(
  familiesInput: unknown,
  blueprint: FoundationAssessmentBlueprint,
) {
  const requestedFamilyIds = [...new Set(blueprint.components.flatMap((component) => component.questionFamilyIds))].sort()
  if (requestedFamilyIds.length === 0) return []

  const families = z.array(questionFamilySchema).min(1).parse(familiesInput)
  assertNoDuplicates(families.map((family) => family.id), 'Question Family id')
  if (!sameSet(families.map((family) => family.id), requestedFamilyIds)) {
    throw new Error('Question Family output must contain exactly the IDs required by Exam Truth')
  }

  const objectiveIds = new Set(blueprint.assessmentObjectives.map((objective) => objective.id))
  for (const family of families) {
    const expectedComponents = expectedFamilyComponents(blueprint, family.id)
    if (!sameSet(family.componentScope, expectedComponents)) {
      throw new Error(`Question Family ${family.id} component scope must match Exam Truth`)
    }
    assertNoDuplicates(family.assessmentObjectiveIds, `assessment objective reference on Question Family ${family.id}`)
    for (const objectiveId of family.assessmentObjectiveIds) {
      if (!objectiveIds.has(objectiveId)) throw new Error(`Question Family ${family.id} references unknown assessment objective ${objectiveId}`)
    }
    for (const componentId of expectedComponents) {
      const component = blueprint.components.find((candidate) => candidate.componentId === componentId)!
      if (component.markTotal !== undefined && family.markRange.max > component.markTotal) {
        throw new Error(`Question Family ${family.id} mark range exceeds Exam Truth component ${componentId} total`)
      }
    }
  }
  return families
}

function requireSuccess<T>(stage: FoundationCompilationWorkerStage, execution: FoundationWorkerExecution<T>) {
  if (execution.status === 'success') return execution
  throw new FoundationCompilationError(stage, `${execution.status}: ${execution.error}`)
}

async function writeArtifact(
  store: FoundationCompilationArtifactStore,
  runs: FoundationCompilationWorkerRun[],
  input: {
    jobId: string
    kind: FoundationCompilationArtifactKind
    fingerprint: string
    value: unknown
    stage: FoundationCompilationWorkerStage
    provenance: FoundationWorkerExecutionProvenance
    inputRefs?: string[]
  },
) {
  const write = await store.writeJson({
    jobId: input.jobId,
    kind: input.kind,
    fingerprint: input.fingerprint,
    value: input.value,
  })
  runs.push({
    stage: input.stage,
    provenance: input.provenance,
    inputRefs: input.inputRefs ?? [],
    outputRefs: [write.ref],
  })
  return write.ref
}

export async function compileFoundationCandidate(input: {
  jobId: string
  candidateId: string
  officialUrls: string[]
  founderInstruction: string
  workers: FoundationCompilationWorkers
  artifactStore: FoundationCompilationArtifactStore
  sourceRightsRules: FoundationSourceRightsPolicyRule[]
  now: string
  producerVersion: string
  implementationHeadSha?: string
}): Promise<{ candidate: FoundationCandidate; workerRuns: FoundationCompilationWorkerRun[] }> {
  const workerRuns: FoundationCompilationWorkerRun[] = []
  const jobId = identifierSchema.parse(input.jobId)
  const candidateId = identifierSchema.parse(input.candidateId)
  const officialUrls = z.array(z.string().url()).min(1).parse(input.officialUrls)
  const founderInstruction = nonEmptyStringSchema.parse(input.founderInstruction)
  const producerVersion = nonEmptyStringSchema.parse(input.producerVersion)
  if (input.implementationHeadSha) commitShaSchema.parse(input.implementationHeadSha)

  const identityExecution = requireSuccess('identity', await input.workers.resolveIdentity({
    jobId,
    officialUrls,
    founderInstruction,
  }))
  const identity = foundationIdentityResolutionSchema.parse(identityExecution.output)
  if (identity.unresolvedChoices.length > 0) {
    throw new FoundationCompilationError('identity', `course_option_resolution_required: ${identity.unresolvedChoices.join('; ')}`)
  }
  workerRuns.push({ stage: 'identity', provenance: identityExecution.provenance, inputRefs: officialUrls, outputRefs: [] })

  const sourceExecution = requireSuccess('source_discovery', await input.workers.discoverSources({
    jobId,
    officialUrls,
    identity,
  }))
  const sources = z.array(foundationDiscoveredSourceSchema).min(1).parse(sourceExecution.output)
  workerRuns.push({ stage: 'source_discovery', provenance: sourceExecution.provenance, inputRefs: officialUrls, outputRefs: [] })

  const sourceRights = await classifyFoundationSourcesWithApprovedRules({
    jobId,
    sources,
    rules: input.sourceRightsRules,
    checkedAt: input.now,
  })
  if (sourceRights.status !== 'approved') {
    throw new FoundationCompilationError('source_rights', `source_rights_review_required: ${sourceRights.blockingSourceIds.join(', ')}`)
  }
  const sourceRef = await writeArtifact(input.artifactStore, workerRuns, {
    jobId,
    kind: 'source_licence_register',
    fingerprint: sourceRights.register.fingerprint,
    value: sourceRights.register,
    stage: 'source_rights',
    provenance: {
      id: `source-rights-${candidateId}`,
      contextId: 'deterministic-source-rights-policy-engine',
      contractVersion: '1',
    },
    inputRefs: officialUrls,
  })

  const evidenceExecution = requireSuccess('structured_evidence', await input.workers.resolveStructuredEvidence({
    jobId,
    officialUrls,
    identity,
    sourceLicenceRegister: sourceRights.register,
  }))
  let evidence: FoundationStructuredEvidence
  try {
    evidence = validateStructuredEvidence(evidenceExecution.output, identity, sourceRights.register)
  } catch (error) {
    throw new FoundationCompilationError('structured_evidence', error instanceof Error ? error.message : String(error))
  }
  workerRuns.push({
    stage: 'structured_evidence',
    provenance: evidenceExecution.provenance,
    inputRefs: [sourceRef],
    outputRefs: [],
  })

  const alignmentExecution = requireSuccess('board_alignment', await input.workers.compileBoardAlignment({
    jobId,
    identity,
    sourceLicenceRegister: sourceRights.register,
    facts: evidence.boardAlignmentFacts,
  }))
  let boardAlignment: BoardAlignment
  try {
    boardAlignment = await validateBoardAlignment(alignmentExecution.output, jobId, identity, sourceRights.register)
  } catch (error) {
    throw new FoundationCompilationError('board_alignment', error instanceof Error ? error.message : String(error))
  }
  const boardAlignmentFingerprint = boardAlignment.fingerprint
  const boardAlignmentRef = await writeArtifact(input.artifactStore, workerRuns, {
    jobId,
    kind: 'board_alignment',
    fingerprint: boardAlignmentFingerprint,
    value: boardAlignment,
    stage: 'board_alignment',
    provenance: alignmentExecution.provenance,
    inputRefs: [sourceRef],
  })

  const coverageExecution = requireSuccess('coverage', await input.workers.compileCoverage({
    jobId,
    identity,
    sourceLicenceRegister: sourceRights.register,
    boardAlignment,
    requirements: evidence.curriculumRequirements,
  }))
  let coverageModel: FoundationCoverageModel
  try {
    coverageModel = validateCoverage(
      coverageExecution.output,
      jobId,
      identity,
      sourceRights.register,
      evidence.curriculumRequirements,
    )
  } catch (error) {
    throw new FoundationCompilationError('coverage', error instanceof Error ? error.message : String(error))
  }
  const coverageFingerprint = await fingerprintFoundationArtifact(coverageModel)
  const coverageRef = await writeArtifact(input.artifactStore, workerRuns, {
    jobId,
    kind: 'foundation_coverage_model',
    fingerprint: coverageFingerprint,
    value: coverageModel,
    stage: 'coverage',
    provenance: coverageExecution.provenance,
    inputRefs: [sourceRef, boardAlignmentRef],
  })

  const courseTruthExecution = requireSuccess('course_truth', await input.workers.compileCourseTruth({
    jobId,
    identity,
    sourceLicenceRegister: sourceRights.register,
    boardAlignment,
    coverageModel,
    requirements: evidence.curriculumRequirements,
  }))
  let courseKnowledgeModel: CourseKnowledgeModel
  try {
    courseKnowledgeModel = await validateCourseTruth(
      courseTruthExecution.output,
      jobId,
      sourceRights.register,
      boardAlignment,
      coverageModel,
    )
  } catch (error) {
    throw new FoundationCompilationError('course_truth', error instanceof Error ? error.message : String(error))
  }
  const courseTruthFingerprint = courseKnowledgeModel.fingerprint
  const courseTruthRef = await writeArtifact(input.artifactStore, workerRuns, {
    jobId,
    kind: 'course_knowledge_model',
    fingerprint: courseTruthFingerprint,
    value: courseKnowledgeModel,
    stage: 'course_truth',
    provenance: courseTruthExecution.provenance,
    inputRefs: [sourceRef, boardAlignmentRef, coverageRef],
  })

  const examTruthExecution = requireSuccess('exam_truth', await input.workers.compileExamTruth({
    jobId,
    identity,
    boardAlignment,
    boardAlignmentFingerprint,
    courseKnowledgeModel,
    courseKnowledgeModelFingerprint: courseTruthFingerprint,
  }))
  let assessmentBlueprint: FoundationAssessmentBlueprint
  try {
    assessmentBlueprint = await validateExamTruth(
      examTruthExecution.output,
      jobId,
      identity,
      boardAlignment,
      boardAlignmentFingerprint,
      courseTruthFingerprint,
    )
  } catch (error) {
    throw new FoundationCompilationError('exam_truth', error instanceof Error ? error.message : String(error))
  }
  const examTruthFingerprint = await fingerprintFoundationArtifact(assessmentBlueprint)
  const examTruthRef = await writeArtifact(input.artifactStore, workerRuns, {
    jobId,
    kind: 'assessment_blueprint',
    fingerprint: examTruthFingerprint,
    value: assessmentBlueprint,
    stage: 'exam_truth',
    provenance: examTruthExecution.provenance,
    inputRefs: [boardAlignmentRef, courseTruthRef],
  })

  const requestedFamilyIds = [...new Set(assessmentBlueprint.components.flatMap((component) => component.questionFamilyIds))].sort()
  const questionFamilyArtifacts: Array<{ ref: string; fingerprint: string }> = []
  if (requestedFamilyIds.length > 0) {
    const familyExecution = requireSuccess('question_families', await input.workers.compileQuestionFamilies({
      jobId,
      identity,
      assessmentBlueprint,
      requestedFamilyIds,
      courseKnowledgeModel,
    }))
    let families: QuestionFamily[]
    try {
      families = validateQuestionFamilies(familyExecution.output, assessmentBlueprint)
    } catch (error) {
      throw new FoundationCompilationError('question_families', error instanceof Error ? error.message : String(error))
    }
    for (const family of [...families].sort((left, right) => left.id.localeCompare(right.id))) {
      const fingerprint = await fingerprintFoundationArtifact(family)
      const ref = await input.artifactStore.writeJson({
        jobId,
        kind: 'question_family',
        fingerprint,
        value: family,
      }).then((write) => write.ref)
      questionFamilyArtifacts.push({ ref, fingerprint })
    }
    workerRuns.push({
      stage: 'question_families',
      provenance: familyExecution.provenance,
      inputRefs: [examTruthRef, courseTruthRef],
      outputRefs: questionFamilyArtifacts.map((artifact) => artifact.ref),
    })
  }

  const candidate = foundationCandidateSchema.parse({
    schemaVersion: 1,
    candidateId,
    courseIdentity: identity.courseIdentity,
    cohortValidity: identity.cohortValidity,
    sourceLicenceRegister: { ref: sourceRef, fingerprint: sourceRights.register.fingerprint },
    sourceRightsStatus: 'approved',
    boardAlignment: { ref: boardAlignmentRef, fingerprint: boardAlignmentFingerprint },
    boardAlignmentStatus: 'verified',
    coverageModel: { ref: coverageRef, fingerprint: coverageFingerprint },
    coverageCompleteness: 'complete',
    courseKnowledgeModel: { ref: courseTruthRef, fingerprint: courseTruthFingerprint },
    courseTruthCompleteness: 'complete',
    assessmentBlueprint: { ref: examTruthRef, fingerprint: examTruthFingerprint },
    examTruthCompleteness: 'complete',
    questionFamilies: questionFamilyArtifacts,
    deterministicAssurance: { status: 'pending', evidenceRefs: [] },
    independentReview: { status: 'pending', evidenceRefs: [] },
    unresolvedBlockers: [],
    knownLimitations: [],
    provenance: {
      createdAt: input.now,
      producerVersion,
      sourceSetFingerprint: sourceRights.register.fingerprint,
      implementationHeadSha: input.implementationHeadSha,
    },
  })

  return { candidate, workerRuns }
}

export async function compileFoundationJob(input: {
  job: FoundationJob
  candidateId: string
  officialUrls: string[]
  founderInstruction: string
  workers: FoundationCompilationWorkers
  artifactStore: FoundationCompilationArtifactStore
  sourceRightsRules: FoundationSourceRightsPolicyRule[]
  now: string
  producerVersion: string
  implementationHeadSha?: string
}): Promise<{ job: FoundationJob; candidate: FoundationCandidate; workerRuns: FoundationCompilationWorkerRun[] }> {
  const job = foundationJobSchema.parse(input.job)
  if (job.state !== 'compiling') throw new FoundationCompilationError('identity', 'Foundation compilation requires a job in compiling state')

  const result = await compileFoundationCandidate({
    jobId: job.jobId,
    candidateId: input.candidateId,
    officialUrls: input.officialUrls,
    founderInstruction: input.founderInstruction,
    workers: input.workers,
    artifactStore: input.artifactStore,
    sourceRightsRules: input.sourceRightsRules,
    now: input.now,
    producerVersion: input.producerVersion,
    implementationHeadSha: input.implementationHeadSha,
  })

  return {
    ...result,
    job: setFoundationCandidate(job, result.candidate, input.now),
  }
}
