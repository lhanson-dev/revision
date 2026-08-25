import { z } from 'zod'
import { advanceJob, blockJob } from './orchestrator'
import {
  assessmentBlueprintSchema,
  boardAlignmentSchema,
  contentFactoryJobSchema,
  courseKnowledgeModelSchema,
  coverageMapSchema,
  markingPackSchema,
  questionFamilySchema,
  type AssessmentBlueprint,
  type BoardAlignment,
  type ContentFactoryJob,
  type CourseKnowledgeModel,
  type CoverageMap,
  type MarkingPack,
  type QuestionFamily,
  type WorkerRun,
} from './schema'
import {
  fingerprintValue,
  type WorkerExecution,
} from './intake-to-knowledge-model'
import { learningPracticeArtifactSchema } from './learning-and-practice'

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const nonEmptyStringSchema = z.string().min(1)

export const executableAssessmentBlueprintSchema = assessmentBlueprintSchema.extend({
  commandDemands: z.array(z.object({
    command: nonEmptyStringSchema,
    cognitiveDemand: nonEmptyStringSchema,
    componentScope: z.array(identifierSchema).default([]),
  })).default([]),
  evidenceExpectations: z.array(nonEmptyStringSchema).default([]),
})

export const assessmentItemWorkerOutputSchema = z.object({
  id: identifierSchema,
  version: nonEmptyStringSchema,
  title: nonEmptyStringSchema,
  componentId: identifierSchema,
  questionFamilyId: identifierSchema,
  requirementIds: z.array(identifierSchema).min(1),
  knowledgeNodeIds: z.array(identifierSchema).min(1),
  format: z.enum(['written_question', 'case_question', 'calculation', 'mixed']),
  command: nonEmptyStringSchema,
  maxMark: z.number().int().positive(),
  questionWording: nonEmptyStringSchema,
  context: z.object({
    id: identifierSchema,
    title: nonEmptyStringSchema,
    body: nonEmptyStringSchema,
    dataPoints: z.array(z.object({
      label: nonEmptyStringSchema,
      value: nonEmptyStringSchema,
      unit: nonEmptyStringSchema.optional(),
    })).default([]),
  }).optional(),
})

export const assessmentItemArtifactSchema = assessmentItemWorkerOutputSchema.extend({
  schemaVersion: z.literal(1),
  artifactType: z.literal('assessment_item'),
  jobId: identifierSchema,
  origin: z.literal('revision_owned'),
  presentationLabel: z.literal('Revision-authored exam-style practice'),
  assessmentBlueprintFingerprint: nonEmptyStringSchema,
  knowledgeModelFingerprint: nonEmptyStringSchema,
  sourceRefs: z.array(identifierSchema).min(1),
})

export const markingPackWorkerOutputSchema = z.object({
  assessmentObjectiveAllocation: z.array(z.object({
    objectiveId: identifierSchema,
    marks: z.number().int().nonnegative(),
  })).default([]),
  rubric: z.array(z.object({
    id: identifierSchema,
    descriptor: nonEmptyStringSchema,
    minMark: z.number().int().nonnegative().optional(),
    maxMark: z.number().int().nonnegative().optional(),
  })).min(1),
  applicationRequirements: z.array(nonEmptyStringSchema).default([]),
  analysisRequirements: z.array(nonEmptyStringSchema).default([]),
  evaluationRequirements: z.array(nonEmptyStringSchema).default([]),
  validReasoningRoutes: z.array(nonEmptyStringSchema).min(1),
  indicativeContent: z.array(nonEmptyStringSchema).default([]),
  misconceptions: z.array(nonEmptyStringSchema).default([]),
  diagnosticFeedbackRules: z.array(nonEmptyStringSchema).min(1),
  improvementActions: z.array(nonEmptyStringSchema).min(1),
  ambiguityPolicy: nonEmptyStringSchema,
  confidencePolicy: nonEmptyStringSchema,
})

export const executableMarkingPackSchema = markingPackSchema.extend({
  questionOrigin: z.literal('revision_owned'),
  indicativeContentPolicy: z.literal('non_exhaustive'),
})

export const courseContentPackManifestSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('course_content_pack_manifest'),
  jobId: identifierSchema,
  publicationStatus: z.literal('factory_generated_unassured'),
  courseIdentity: z.object({
    subject: nonEmptyStringSchema,
    qualification: nonEmptyStringSchema,
    awardingBody: nonEmptyStringSchema,
    specificationId: nonEmptyStringSchema,
  }),
  boardAlignmentFingerprint: nonEmptyStringSchema,
  knowledgeModelFingerprint: nonEmptyStringSchema,
  learningBlueprintRef: nonEmptyStringSchema,
  learningArtifactRefs: z.array(nonEmptyStringSchema).min(1),
  practiceArtifactRefs: z.array(nonEmptyStringSchema).min(1),
  assessmentBlueprintRef: nonEmptyStringSchema,
  questionFamilyRefs: z.array(nonEmptyStringSchema).min(1),
  assessmentItemRefs: z.array(nonEmptyStringSchema).min(1),
  markingPackRefs: z.array(nonEmptyStringSchema).min(1),
  markableAssessmentItemIds: z.array(identifierSchema).min(1),
})

export type ExecutableAssessmentBlueprint = z.infer<typeof executableAssessmentBlueprintSchema>
export type AssessmentItemArtifact = z.infer<typeof assessmentItemArtifactSchema>
export type ExecutableMarkingPack = z.infer<typeof executableMarkingPackSchema>
export type CourseContentPackManifest = z.infer<typeof courseContentPackManifestSchema>

export type AssessmentArtifactKind =
  | 'assessment_blueprint'
  | 'question_family'
  | 'assessment_item'
  | 'marking_pack'
  | 'course_content_pack'

export interface AssessmentArtifactStore {
  writeJson(input: {
    jobId: string
    kind: AssessmentArtifactKind
    fingerprint: string
    value: unknown
  }): Promise<{ ref: string }>
  readJson(ref: string): Promise<unknown>
}

export interface AssessmentAndMarkingWorkers {
  compileAssessmentBlueprint(input: {
    jobId: string
    courseIdentity: NonNullable<ContentFactoryJob['courseIdentity']>
    components: Array<{
      id: string
      name: string
      compulsory: boolean
      marks?: number
      durationMinutes?: number
      weightingPercent?: number
    }>
    assessmentObjectives: Array<{
      id: string
      name: string
      weightingPercent?: number
    }>
    assessmentRequirements: Array<{
      id: string
      summary: string
      componentScope: string[]
    }>
    examPrepRequirements: Array<{
      requirementId: string
      requirementSummary: string
      skillsOrKnowledge: string[]
      componentScope: string[]
      revisionArea: string
    }>
    knowledgeNodes: Array<{
      id: string
      kind: CourseKnowledgeModel['nodes'][number]['kind']
      summary: string
      formulas: string[]
      misconceptions: string[]
      applicationContexts: string[]
      depth: CourseKnowledgeModel['nodes'][number]['depth']
      evidenceTypes: string[]
    }>
  }): Promise<WorkerExecution<unknown>>
  generateQuestionFamilies(input: {
    jobId: string
    courseIdentity: NonNullable<ContentFactoryJob['courseIdentity']>
    assessmentBlueprint: ExecutableAssessmentBlueprint
    requestedFamilyIds: string[]
    knowledgeNodes: Array<{
      id: string
      kind: CourseKnowledgeModel['nodes'][number]['kind']
      summary: string
      formulas: string[]
      misconceptions: string[]
      applicationContexts: string[]
      depth: CourseKnowledgeModel['nodes'][number]['depth']
      evidenceTypes: string[]
    }>
    examPrepRequirements: Array<{
      requirementId: string
      requirementSummary: string
      skillsOrKnowledge: string[]
      componentScope: string[]
      revisionArea: string
    }>
  }): Promise<WorkerExecution<unknown>>
  generateAssessmentItem(input: {
    jobId: string
    courseIdentity: NonNullable<ContentFactoryJob['courseIdentity']>
    assessmentBlueprint: ExecutableAssessmentBlueprint
    questionFamily: QuestionFamily
    knowledgeNodes: Array<{
      id: string
      kind: CourseKnowledgeModel['nodes'][number]['kind']
      summary: string
      formulas: string[]
      misconceptions: string[]
      applicationContexts: string[]
      depth: CourseKnowledgeModel['nodes'][number]['depth']
      evidenceTypes: string[]
    }>
    examPrepRequirements: Array<{
      requirementId: string
      requirementSummary: string
      skillsOrKnowledge: string[]
      componentScope: string[]
      revisionArea: string
    }>
  }): Promise<WorkerExecution<unknown>>
  generateMarkingPack(input: {
    jobId: string
    courseIdentity: NonNullable<ContentFactoryJob['courseIdentity']>
    assessmentBlueprint: ExecutableAssessmentBlueprint
    questionFamily: QuestionFamily
    assessmentItem: {
      id: string
      version: string
      title: string
      componentId: string
      questionFamilyId: string
      requirementIds: string[]
      knowledgeNodeIds: string[]
      format: AssessmentItemArtifact['format']
      command: string
      maxMark: number
      questionWording: string
      context?: AssessmentItemArtifact['context']
    }
    knowledgeNodes: Array<{
      id: string
      kind: CourseKnowledgeModel['nodes'][number]['kind']
      summary: string
      formulas: string[]
      misconceptions: string[]
      applicationContexts: string[]
      depth: CourseKnowledgeModel['nodes'][number]['depth']
      evidenceTypes: string[]
    }>
  }): Promise<WorkerExecution<unknown>>
}

export const contentFactoryAssessmentWorkerContracts = {
  assessmentBlueprint: {
    workerId: 'content-factory.assessment-blueprint',
    contractVersion: '1',
    sourceInput: 'structured-board-alignment-plus-course-knowledge-model-facts-only',
  },
  questionFamily: {
    workerId: 'content-factory.question-family',
    contractVersion: '1',
    sourceInput: 'assessment-blueprint-plus-course-knowledge-model-facts-only',
  },
  assessmentItem: {
    workerId: 'content-factory.assessment-item',
    contractVersion: '1',
    sourceInput: 'question-family-plus-course-knowledge-model-facts-only',
  },
  markingPack: {
    workerId: 'content-factory.marking-pack',
    contractVersion: '1',
    sourceInput: 'revision-owned-question-plus-assessment-contracts-and-course-knowledge-model-facts-only',
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
    workerRuns: [
      ...job.workerRuns,
      {
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
      },
    ],
    updatedAt,
  })
}

function workerFailure(
  jobInput: ContentFactoryJob,
  execution: Extract<WorkerExecution<unknown>, { status: 'failure' | 'infrastructure_failure' }>,
  updatedAt: string,
  stage: 'assessment_blueprint' | 'question_family' | 'generation' | 'marking_pack',
) {
  const withRun = appendWorkerRun(jobInput, stage, execution, updatedAt)
  return blockJob(withRun, {
    id: `worker-failure-${execution.provenance.id}`,
    reason: `${stage} worker ${execution.status}: ${execution.error}`,
    createdAt: updatedAt,
  })
}

function requireRunnableJob(jobInput: ContentFactoryJob) {
  const job = contentFactoryJobSchema.parse(jobInput)
  if (job.schemaVersion !== 2) throw new Error('Assessment factory requires a schema v2 job')
  if (job.state === 'blocked') throw new Error('Blocked jobs must be resumed before the assessment factory can continue')
  if (!['generating', 'validating'].includes(job.state)) {
    throw new Error(`Content Factory job state ${job.state} is outside the assessment factory`)
  }
  if (!job.courseIdentity) throw new Error('Resolved course identity is required before assessment generation')
  if (job.sourceRightsStatus !== 'approved') throw new Error('Source rights must remain approved before assessment generation')
  if (!job.boardAlignmentRef) throw new Error('Board Alignment reference is required before assessment generation')
  if (!job.coverageMapRef) throw new Error('Coverage map reference is required before assessment generation')
  if (!job.courseKnowledgeModelRef) throw new Error('Course Knowledge Model reference is required before assessment generation')
  if (!job.learningBlueprintRef) throw new Error('Learning Blueprint reference is required before assessment generation')
  if (job.workUnits.length === 0 || job.workUnits.some((unit) => unit.status !== 'complete')) {
    throw new Error('Learn/Practice work units must be complete before assessment generation')
  }
  return job
}

async function readUpstreamArtifacts(job: ContentFactoryJob, store: AssessmentArtifactStore) {
  const boardAlignment = boardAlignmentSchema.parse(await store.readJson(job.boardAlignmentRef!))
  const coverage = coverageMapSchema.parse(await store.readJson(job.coverageMapRef!))
  const model = courseKnowledgeModelSchema.parse(await store.readJson(job.courseKnowledgeModelRef!))

  if (boardAlignment.jobId !== job.jobId || coverage.jobId !== job.jobId || model.jobId !== job.jobId) {
    throw new Error('Assessment factory upstream artifact job IDs must match the Content Factory job')
  }
  if (boardAlignment.verificationStatus !== 'verified') throw new Error('Board Alignment must be verified before assessment generation')
  if (job.sourceSetFingerprint && coverage.sourceSetFingerprint !== job.sourceSetFingerprint) {
    throw new Error('Coverage map source fingerprint does not match the Content Factory job')
  }

  return { boardAlignment, coverage, model }
}

function safeKnowledgeNodeInput(node: CourseKnowledgeModel['nodes'][number]) {
  return {
    id: node.id,
    kind: node.kind,
    summary: node.summary,
    formulas: node.formulas,
    misconceptions: node.misconceptions,
    applicationContexts: node.applicationContexts,
    depth: node.depth,
    evidenceTypes: node.evidenceTypes,
  }
}

function safeExamPrepRequirement(requirement: CoverageMap['requirements'][number]) {
  return {
    requirementId: requirement.requirementId,
    requirementSummary: requirement.requirementSummary,
    skillsOrKnowledge: requirement.skillsOrKnowledge,
    componentScope: requirement.componentScope,
    revisionArea: requirement.revisionArea,
  }
}

function examPrepRequirements(coverage: CoverageMap) {
  return coverage.requirements
    .filter((requirement) => requirement.examPrepRequired && !['deferred', 'not_applicable'].includes(requirement.coverageStatus))
    .map(safeExamPrepRequirement)
}

function safeBoardAlignmentInput(boardAlignment: BoardAlignment) {
  return {
    components: boardAlignment.components.map((component) => ({
      id: component.id,
      name: component.name,
      compulsory: component.compulsory,
      marks: component.marks,
      durationMinutes: component.durationMinutes,
      weightingPercent: component.weightingPercent,
    })),
    assessmentObjectives: boardAlignment.assessmentObjectives.map((objective) => ({
      id: objective.id,
      name: objective.name,
      weightingPercent: objective.weightingPercent,
    })),
    assessmentRequirements: boardAlignment.assessmentRequirements.map((requirement) => ({
      id: requirement.id,
      summary: requirement.summary,
      componentScope: requirement.componentScope,
    })),
  }
}

function setsEqual(left: Iterable<string>, right: Iterable<string>) {
  const a = new Set(left)
  const b = new Set(right)
  return a.size === b.size && [...a].every((value) => b.has(value))
}

function validateAssessmentBlueprint(
  input: unknown,
  job: ContentFactoryJob,
  boardAlignment: BoardAlignment,
): ExecutableAssessmentBlueprint {
  const blueprint = executableAssessmentBlueprintSchema.parse(input)
  assessmentBlueprintSchema.parse(blueprint)

  if (blueprint.jobId !== job.jobId) throw new Error('Assessment Blueprint job ID does not match the Content Factory job')
  if (blueprint.boardAlignmentFingerprint !== boardAlignment.fingerprint) {
    throw new Error('Assessment Blueprint does not match the Board Alignment fingerprint')
  }

  const alignmentComponentIds = boardAlignment.components.map((component) => component.id)
  const blueprintComponentIds = blueprint.components.map((component) => component.componentId)
  if (!setsEqual(alignmentComponentIds, blueprintComponentIds)) {
    throw new Error('Assessment Blueprint must cover the exact resolved assessment components')
  }

  const familyIds = new Set<string>()
  for (const component of blueprint.components) {
    if (component.questionFamilyIds.length === 0) {
      throw new Error(`Assessment Blueprint component ${component.componentId} requires at least one Question Family`)
    }
    for (const familyId of component.questionFamilyIds) {
      if (familyIds.has(familyId)) {
        throw new Error(`Question Family ${familyId} is assigned more than once in the Assessment Blueprint`)
      }
      familyIds.add(familyId)
    }

    const aligned = boardAlignment.components.find((candidate) => candidate.id === component.componentId)!
    if (aligned.marks !== undefined && component.markTotal !== aligned.marks) {
      throw new Error(`Assessment Blueprint mark total for ${component.componentId} must match Board Alignment`)
    }
    if (aligned.durationMinutes !== undefined && component.timingMinutes !== aligned.durationMinutes) {
      throw new Error(`Assessment Blueprint timing for ${component.componentId} must match Board Alignment`)
    }
  }

  const alignmentObjectiveIds = boardAlignment.assessmentObjectives.map((objective) => objective.id)
  if (alignmentObjectiveIds.length > 0 && !setsEqual(alignmentObjectiveIds, blueprint.assessmentObjectives.map((objective) => objective.id))) {
    throw new Error('Assessment Blueprint assessment objectives must match Board Alignment')
  }

  for (const objective of blueprint.assessmentObjectives) {
    const aligned = boardAlignment.assessmentObjectives.find((candidate) => candidate.id === objective.id)
    if (!aligned) throw new Error(`Assessment Blueprint references unknown assessment objective ${objective.id}`)
    if (aligned.weightingPercent !== undefined && objective.weightingPercent !== aligned.weightingPercent) {
      throw new Error(`Assessment Blueprint weighting for ${objective.id} must match Board Alignment`)
    }
  }

  for (const demand of blueprint.commandDemands) {
    for (const componentId of demand.componentScope) {
      if (!alignmentComponentIds.includes(componentId)) {
        throw new Error(`Assessment Blueprint command demand references unknown component ${componentId}`)
      }
    }
  }

  return blueprint
}

function expectedFamilyComponentMap(blueprint: ExecutableAssessmentBlueprint) {
  const map = new Map<string, string[]>()
  for (const component of blueprint.components) {
    for (const familyId of component.questionFamilyIds) map.set(familyId, [component.componentId])
  }
  return map
}

function validateQuestionFamily(
  input: unknown,
  expectedFamilyId: string,
  blueprint: ExecutableAssessmentBlueprint,
): QuestionFamily {
  const family = questionFamilySchema.parse(input)
  if (family.id !== expectedFamilyId) throw new Error(`Question Family output must use requested id ${expectedFamilyId}`)

  const expectedComponents = expectedFamilyComponentMap(blueprint).get(family.id)
  if (!expectedComponents || !setsEqual(expectedComponents, family.componentScope)) {
    throw new Error(`Question Family ${family.id} component scope must match the Assessment Blueprint`)
  }

  const objectiveIds = new Set(blueprint.assessmentObjectives.map((objective) => objective.id))
  for (const objectiveId of family.assessmentObjectiveIds) {
    if (!objectiveIds.has(objectiveId)) throw new Error(`Question Family ${family.id} references unknown assessment objective ${objectiveId}`)
  }

  const component = blueprint.components.find((candidate) => candidate.componentId === expectedComponents[0])!
  if (component.markTotal !== undefined && family.markRange.max > component.markTotal) {
    throw new Error(`Question Family ${family.id} mark range exceeds component mark total`)
  }

  return family
}

function sourceRefsForItem(
  nodes: CourseKnowledgeModel['nodes'],
  boardAlignment: BoardAlignment,
) {
  return [...new Set([
    ...nodes.flatMap((node) => node.sourceRefs),
    ...boardAlignment.sourceRefs,
  ])].sort()
}

function validateAssessmentItem(
  input: unknown,
  job: ContentFactoryJob,
  family: QuestionFamily,
  blueprint: ExecutableAssessmentBlueprint,
  coverage: CoverageMap,
  model: CourseKnowledgeModel,
  boardAlignment: BoardAlignment,
): AssessmentItemArtifact {
  const output = assessmentItemWorkerOutputSchema.parse(input)
  if (output.questionFamilyId !== family.id) throw new Error(`Assessment item ${output.id} must match Question Family ${family.id}`)
  if (!family.componentScope.includes(output.componentId)) throw new Error(`Assessment item ${output.id} uses a component outside its Question Family`)
  if (output.maxMark < family.markRange.min || output.maxMark > family.markRange.max) {
    throw new Error(`Assessment item ${output.id} mark allocation is outside Question Family ${family.id} range`)
  }
  if (family.contextRequirements.length > 0 && !output.context) {
    throw new Error(`Assessment item ${output.id} requires an original Revision-owned context`)
  }

  const requirementMap = new Map(coverage.requirements.map((requirement) => [requirement.requirementId, requirement]))
  for (const requirementId of output.requirementIds) {
    const requirement = requirementMap.get(requirementId)
    if (!requirement) throw new Error(`Assessment item ${output.id} references unknown coverage requirement ${requirementId}`)
    if (!requirement.examPrepRequired) throw new Error(`Assessment item ${output.id} uses requirement ${requirementId} that is not approved for Exam Prep`)
    if (requirement.componentScope.length > 0 && !requirement.componentScope.includes(output.componentId)) {
      throw new Error(`Assessment item ${output.id} component is outside requirement ${requirementId} scope`)
    }
  }

  const nodeMap = new Map(model.nodes.map((node) => [node.id, node]))
  const nodes = output.knowledgeNodeIds.map((nodeId) => {
    const node = nodeMap.get(nodeId)
    if (!node) throw new Error(`Assessment item ${output.id} references unknown knowledge node ${nodeId}`)
    return node
  })

  return assessmentItemArtifactSchema.parse({
    ...output,
    schemaVersion: 1,
    artifactType: 'assessment_item',
    jobId: job.jobId,
    origin: 'revision_owned',
    presentationLabel: 'Revision-authored exam-style practice',
    assessmentBlueprintFingerprint: blueprint.fingerprint,
    knowledgeModelFingerprint: model.fingerprint,
    sourceRefs: sourceRefsForItem(nodes, boardAlignment),
  })
}

function safeAssessmentItemInput(item: AssessmentItemArtifact) {
  return {
    id: item.id,
    version: item.version,
    title: item.title,
    componentId: item.componentId,
    questionFamilyId: item.questionFamilyId,
    requirementIds: item.requirementIds,
    knowledgeNodeIds: item.knowledgeNodeIds,
    format: item.format,
    command: item.command,
    maxMark: item.maxMark,
    questionWording: item.questionWording,
    context: item.context,
  }
}

function validateMarkingPack(
  input: unknown,
  item: AssessmentItemArtifact,
  family: QuestionFamily,
  blueprint: ExecutableAssessmentBlueprint,
): ExecutableMarkingPack {
  const output = markingPackWorkerOutputSchema.parse(input)
  const familyObjectiveIds = family.assessmentObjectiveIds
  const allocatedObjectiveIds = output.assessmentObjectiveAllocation.map((allocation) => allocation.objectiveId)

  if (familyObjectiveIds.length > 0 && !setsEqual(familyObjectiveIds, allocatedObjectiveIds)) {
    throw new Error(`Marking Pack for ${item.id} must allocate the Question Family assessment objectives`)
  }
  if (output.assessmentObjectiveAllocation.length > 0) {
    const total = output.assessmentObjectiveAllocation.reduce((sum, allocation) => sum + allocation.marks, 0)
    if (total !== item.maxMark) throw new Error(`Marking Pack AO allocation for ${item.id} must total ${item.maxMark} marks`)
  }

  for (const rubric of output.rubric) {
    if (rubric.minMark !== undefined && rubric.maxMark !== undefined && rubric.minMark > rubric.maxMark) {
      throw new Error(`Marking Pack rubric ${rubric.id} has an invalid mark range`)
    }
    if ((rubric.minMark ?? 0) > item.maxMark || (rubric.maxMark ?? 0) > item.maxMark) {
      throw new Error(`Marking Pack rubric ${rubric.id} exceeds question maximum mark`)
    }
  }

  if (family.applicationRequirements.length > 0 && output.applicationRequirements.length === 0) {
    throw new Error(`Marking Pack for ${item.id} must preserve the Question Family application demand`)
  }
  if (family.analysisRequirements.length > 0 && output.analysisRequirements.length === 0) {
    throw new Error(`Marking Pack for ${item.id} must preserve the Question Family analysis demand`)
  }
  if (family.evaluationRequirements.length > 0 && output.evaluationRequirements.length === 0) {
    throw new Error(`Marking Pack for ${item.id} must preserve the Question Family evaluation demand`)
  }

  const pack = executableMarkingPackSchema.parse({
    schemaVersion: 1,
    id: `marking-pack-${item.id}`,
    questionId: item.id,
    questionVersion: item.version,
    exactQuestionWording: item.questionWording,
    contextRef: item.context?.id,
    maxMark: item.maxMark,
    conceptIds: item.knowledgeNodeIds,
    assessmentObjectiveAllocation: output.assessmentObjectiveAllocation,
    rubric: output.rubric,
    applicationRequirements: output.applicationRequirements,
    analysisRequirements: output.analysisRequirements,
    evaluationRequirements: output.evaluationRequirements,
    validReasoningRoutes: output.validReasoningRoutes,
    indicativeContent: output.indicativeContent,
    misconceptions: output.misconceptions,
    anchors: [],
    diagnosticFeedbackRules: output.diagnosticFeedbackRules,
    improvementActions: output.improvementActions,
    ambiguityPolicy: output.ambiguityPolicy,
    confidencePolicy: output.confidencePolicy,
    questionFamilyId: family.id,
    assessmentBlueprintFingerprint: blueprint.fingerprint,
    sourceRefs: item.sourceRefs,
    calibrationStatus: 'not_calibrated',
    questionOrigin: 'revision_owned',
    indicativeContentPolicy: 'non_exhaustive',
  })

  markingPackSchema.parse(pack)
  return pack
}

async function persistedQuestionFamilies(
  job: ContentFactoryJob,
  store: AssessmentArtifactStore,
  blueprint: ExecutableAssessmentBlueprint,
) {
  const result = new Map<string, { ref: string; family: QuestionFamily }>()
  for (const ref of job.questionFamilyRefs) {
    const parsed = questionFamilySchema.parse(await store.readJson(ref))
    validateQuestionFamily(parsed, parsed.id, blueprint)
    if (result.has(parsed.id)) throw new Error(`Duplicate persisted Question Family ${parsed.id}`)
    result.set(parsed.id, { ref, family: parsed })
  }
  return result
}

async function persistedAssessmentItems(
  job: ContentFactoryJob,
  store: AssessmentArtifactStore,
  blueprint: ExecutableAssessmentBlueprint,
) {
  const result = new Map<string, { ref: string; item: AssessmentItemArtifact }>()
  const refs = [...new Set(job.workerRuns.flatMap((run) => run.outputRefs))]
  for (const ref of refs) {
    let value: unknown
    try {
      value = await store.readJson(ref)
    } catch {
      continue
    }
    const parsed = assessmentItemArtifactSchema.safeParse(value)
    if (!parsed.success) continue
    if (parsed.data.jobId !== job.jobId || parsed.data.assessmentBlueprintFingerprint !== blueprint.fingerprint) continue
    if (result.has(parsed.data.questionFamilyId)) {
      throw new Error(`More than one persisted assessment item exists for Question Family ${parsed.data.questionFamilyId}`)
    }
    result.set(parsed.data.questionFamilyId, { ref, item: parsed.data })
  }
  return result
}

async function persistedMarkingPack(
  job: ContentFactoryJob,
  store: AssessmentArtifactStore,
  item: AssessmentItemArtifact,
  family: QuestionFamily,
  blueprint: ExecutableAssessmentBlueprint,
) {
  const coverage = job.markingPackCoverage.find((entry) => entry.assessmentItemId === item.id)
  if (!coverage) return undefined
  const pack = executableMarkingPackSchema.parse(await store.readJson(coverage.markingPackRef))
  if (pack.questionId !== item.id || pack.questionVersion !== item.version || pack.questionFamilyId !== family.id) {
    throw new Error(`Persisted Marking Pack does not match assessment item ${item.id}`)
  }
  if (pack.assessmentBlueprintFingerprint !== blueprint.fingerprint) {
    throw new Error(`Persisted Marking Pack for ${item.id} does not match the Assessment Blueprint fingerprint`)
  }
  if (pack.exactQuestionWording !== item.questionWording || pack.maxMark !== item.maxMark) {
    throw new Error(`Persisted Marking Pack for ${item.id} does not match the exact question contract`)
  }
  return { ref: coverage.markingPackRef, pack }
}

async function learningPracticeRefs(job: ContentFactoryJob, store: AssessmentArtifactStore) {
  const learningRefs: string[] = []
  const practiceRefs: string[] = []
  for (const unit of job.workUnits) {
    for (const ref of unit.outputRefs) {
      const parsed = learningPracticeArtifactSchema.parse(await store.readJson(ref))
      if (parsed.jobId !== job.jobId || parsed.workUnitId !== unit.id) {
        throw new Error(`Learn/Practice artifact ${ref} does not match work unit ${unit.id}`)
      }
      if (parsed.artifactType === 'learning') learningRefs.push(ref)
      if (parsed.artifactType === 'practice') practiceRefs.push(ref)
    }
  }
  if (learningRefs.length === 0 || practiceRefs.length === 0) {
    throw new Error('Assembled course content requires both Learn and Practice artifacts')
  }
  return { learningRefs, practiceRefs }
}

async function existingManifest(
  job: ContentFactoryJob,
  store: AssessmentArtifactStore,
  blueprint: ExecutableAssessmentBlueprint,
  model: CourseKnowledgeModel,
) {
  for (const ref of job.contentPackRefs) {
    let value: unknown
    try {
      value = await store.readJson(ref)
    } catch {
      continue
    }
    const parsed = courseContentPackManifestSchema.safeParse(value)
    if (!parsed.success) continue
    if (
      parsed.data.jobId === job.jobId
      && parsed.data.assessmentBlueprintRef === job.assessmentBlueprintRef
      && parsed.data.knowledgeModelFingerprint === model.fingerprint
      && parsed.data.boardAlignmentFingerprint === blueprint.boardAlignmentFingerprint
    ) return { ref, manifest: parsed.data }
  }
  return undefined
}

function itemNodes(model: CourseKnowledgeModel, item: AssessmentItemArtifact) {
  const nodeMap = new Map(model.nodes.map((node) => [node.id, node]))
  return item.knowledgeNodeIds.map((id) => {
    const node = nodeMap.get(id)
    if (!node) throw new Error(`Assessment item ${item.id} references unknown knowledge node ${id}`)
    return node
  })
}

export async function runAssessmentAndMarkingFactory(input: {
  job: ContentFactoryJob
  artifactStore: AssessmentArtifactStore
  workers: AssessmentAndMarkingWorkers
  now: string
}): Promise<ContentFactoryJob> {
  let job = requireRunnableJob(input.job)
  const { boardAlignment, coverage, model } = await readUpstreamArtifacts(job, input.artifactStore)

  if (job.state === 'validating') {
    if (!job.assessmentBlueprintRef || job.questionFamilyRefs.length === 0 || job.markableAssessmentItemIds.length === 0) {
      throw new Error('Validating job is missing completed assessment-factory artifacts')
    }
    const blueprint = validateAssessmentBlueprint(await input.artifactStore.readJson(job.assessmentBlueprintRef), job, boardAlignment)
    const manifest = await existingManifest(job, input.artifactStore, blueprint, model)
    if (!manifest) throw new Error('Validating job is missing its assembled course content pack manifest')
    return job
  }

  const safeAlignment = safeBoardAlignmentInput(boardAlignment)
  const safeNodes = model.nodes.map(safeKnowledgeNodeInput)
  const examRequirements = examPrepRequirements(coverage)
  if (examRequirements.length === 0) throw new Error('Assessment factory requires at least one non-deferred Exam Prep requirement')

  let blueprint: ExecutableAssessmentBlueprint
  if (!job.assessmentBlueprintRef) {
    const execution = await input.workers.compileAssessmentBlueprint({
      jobId: job.jobId,
      courseIdentity: job.courseIdentity!,
      components: safeAlignment.components,
      assessmentObjectives: safeAlignment.assessmentObjectives,
      assessmentRequirements: safeAlignment.assessmentRequirements,
      examPrepRequirements: examRequirements,
      knowledgeNodes: safeNodes,
    })
    if (execution.status !== 'success') return workerFailure(job, execution, input.now, 'assessment_blueprint')
    blueprint = validateAssessmentBlueprint(execution.output, job, boardAlignment)
    const write = await input.artifactStore.writeJson({
      jobId: job.jobId,
      kind: 'assessment_blueprint',
      fingerprint: blueprint.fingerprint,
      value: blueprint,
    })
    job = appendWorkerRun(job, 'assessment_blueprint', execution, input.now, {
      inputRefs: [job.boardAlignmentRef!, job.coverageMapRef!, job.courseKnowledgeModelRef!],
      outputRefs: [write.ref],
    })
    job = contentFactoryJobSchema.parse({ ...job, assessmentBlueprintRef: write.ref, updatedAt: input.now })
  } else {
    blueprint = validateAssessmentBlueprint(await input.artifactStore.readJson(job.assessmentBlueprintRef), job, boardAlignment)
  }

  const expectedFamilyIds = blueprint.components.flatMap((component) => component.questionFamilyIds)
  const families = await persistedQuestionFamilies(job, input.artifactStore, blueprint)
  const missingFamilyIds = expectedFamilyIds.filter((id) => !families.has(id))

  if (missingFamilyIds.length > 0) {
    const execution = await input.workers.generateQuestionFamilies({
      jobId: job.jobId,
      courseIdentity: job.courseIdentity!,
      assessmentBlueprint: blueprint,
      requestedFamilyIds: missingFamilyIds,
      knowledgeNodes: safeNodes,
      examPrepRequirements: examRequirements,
    })
    if (execution.status !== 'success') return workerFailure(job, execution, input.now, 'question_family')
    const outputs = z.array(questionFamilySchema).min(1).parse(execution.output)
    if (!setsEqual(outputs.map((family) => family.id), missingFamilyIds)) {
      throw new Error('Question Family worker must return exactly the requested family IDs')
    }

    const outputRefs: string[] = []
    for (const output of outputs) {
      const family = validateQuestionFamily(output, output.id, blueprint)
      const fingerprint = await fingerprintValue(family)
      const write = await input.artifactStore.writeJson({
        jobId: job.jobId,
        kind: 'question_family',
        fingerprint,
        value: family,
      })
      outputRefs.push(write.ref)
      families.set(family.id, { ref: write.ref, family })
    }
    job = appendWorkerRun(job, 'question_family', execution, input.now, {
      inputRefs: [job.assessmentBlueprintRef!, job.courseKnowledgeModelRef!, job.coverageMapRef!],
      outputRefs,
    })
    job = contentFactoryJobSchema.parse({
      ...job,
      questionFamilyRefs: [...job.questionFamilyRefs, ...outputRefs],
      updatedAt: input.now,
    })
  }

  const items = await persistedAssessmentItems(job, input.artifactStore, blueprint)
  for (const familyId of expectedFamilyIds) {
    if (items.has(familyId)) continue
    const familyRecord = families.get(familyId)
    if (!familyRecord) throw new Error(`Missing Question Family ${familyId}`)

    const execution = await input.workers.generateAssessmentItem({
      jobId: job.jobId,
      courseIdentity: job.courseIdentity!,
      assessmentBlueprint: blueprint,
      questionFamily: familyRecord.family,
      knowledgeNodes: safeNodes,
      examPrepRequirements: examRequirements,
    })
    if (execution.status !== 'success') return workerFailure(job, execution, input.now, 'generation')
    const item = validateAssessmentItem(execution.output, job, familyRecord.family, blueprint, coverage, model, boardAlignment)
    const fingerprint = await fingerprintValue(item)
    const write = await input.artifactStore.writeJson({
      jobId: job.jobId,
      kind: 'assessment_item',
      fingerprint,
      value: item,
    })
    job = appendWorkerRun(job, 'generation', execution, input.now, {
      inputRefs: [job.assessmentBlueprintRef!, familyRecord.ref, job.courseKnowledgeModelRef!, job.coverageMapRef!],
      outputRefs: [write.ref],
    })
    items.set(familyId, { ref: write.ref, item })
  }

  const markingPackRefs: string[] = []
  for (const familyId of expectedFamilyIds) {
    const familyRecord = families.get(familyId)!
    const itemRecord = items.get(familyId)!
    const existing = await persistedMarkingPack(job, input.artifactStore, itemRecord.item, familyRecord.family, blueprint)
    if (existing) {
      markingPackRefs.push(existing.ref)
      continue
    }

    const execution = await input.workers.generateMarkingPack({
      jobId: job.jobId,
      courseIdentity: job.courseIdentity!,
      assessmentBlueprint: blueprint,
      questionFamily: familyRecord.family,
      assessmentItem: safeAssessmentItemInput(itemRecord.item),
      knowledgeNodes: itemNodes(model, itemRecord.item).map(safeKnowledgeNodeInput),
    })
    if (execution.status !== 'success') return workerFailure(job, execution, input.now, 'marking_pack')
    const pack = validateMarkingPack(execution.output, itemRecord.item, familyRecord.family, blueprint)
    const fingerprint = await fingerprintValue(pack)
    const write = await input.artifactStore.writeJson({
      jobId: job.jobId,
      kind: 'marking_pack',
      fingerprint,
      value: pack,
    })
    job = appendWorkerRun(job, 'marking_pack', execution, input.now, {
      inputRefs: [job.assessmentBlueprintRef!, familyRecord.ref, itemRecord.ref, job.courseKnowledgeModelRef!],
      outputRefs: [write.ref],
    })
    job = contentFactoryJobSchema.parse({
      ...job,
      markingPackCoverage: [
        ...job.markingPackCoverage,
        { assessmentItemId: itemRecord.item.id, markingPackRef: write.ref },
      ],
      updatedAt: input.now,
    })
    markingPackRefs.push(write.ref)
  }

  const markableItemIds = expectedFamilyIds.map((familyId) => items.get(familyId)!.item.id)
  if (new Set(markableItemIds).size !== markableItemIds.length) throw new Error('Assessment item IDs must be unique across Question Families')
  job = contentFactoryJobSchema.parse({
    ...job,
    markableAssessmentItemIds: markableItemIds,
    updatedAt: input.now,
  })

  const { learningRefs, practiceRefs } = await learningPracticeRefs(job, input.artifactStore)
  let manifest = await existingManifest(job, input.artifactStore, blueprint, model)
  if (!manifest) {
    const value = courseContentPackManifestSchema.parse({
      schemaVersion: 1,
      artifactType: 'course_content_pack_manifest',
      jobId: job.jobId,
      publicationStatus: 'factory_generated_unassured',
      courseIdentity: job.courseIdentity!,
      boardAlignmentFingerprint: boardAlignment.fingerprint,
      knowledgeModelFingerprint: model.fingerprint,
      learningBlueprintRef: job.learningBlueprintRef!,
      learningArtifactRefs: learningRefs,
      practiceArtifactRefs: practiceRefs,
      assessmentBlueprintRef: job.assessmentBlueprintRef!,
      questionFamilyRefs: expectedFamilyIds.map((familyId) => families.get(familyId)!.ref),
      assessmentItemRefs: expectedFamilyIds.map((familyId) => items.get(familyId)!.ref),
      markingPackRefs,
      markableAssessmentItemIds: markableItemIds,
    })
    const fingerprint = await fingerprintValue(value)
    const write = await input.artifactStore.writeJson({
      jobId: job.jobId,
      kind: 'course_content_pack',
      fingerprint,
      value,
    })
    manifest = { ref: write.ref, manifest: value }
    job = contentFactoryJobSchema.parse({
      ...job,
      contentPackRefs: [...job.contentPackRefs, write.ref],
      updatedAt: input.now,
    })
  }

  if (!setsEqual(manifest.manifest.markableAssessmentItemIds, job.markableAssessmentItemIds)) {
    throw new Error('Course content pack Marking Pack coverage does not match the job')
  }

  return advanceJob(job, 'validating', input.now)
}
