import { z } from 'zod'
import { advanceJob, blockJob } from './orchestrator'
import {
  contentFactoryJobSchema,
  courseKnowledgeModelSchema,
  coverageMapSchema,
  learningBlueprintSchema,
  type ContentFactoryJob,
  type CourseKnowledgeModel,
  type CoverageMap,
  type WorkerRun,
} from './schema'
import {
  fingerprintValue,
  type WorkerExecution,
  type WorkerExecutionProvenance,
} from './intake-to-knowledge-model'

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const nonEmptyStringSchema = z.string().min(1)

const learnModeSchema = z.enum(['explanation', 'worked_example'])
const practiceModeSchema = z.enum(['retrieval', 'flashcard', 'short_answer', 'application', 'quantitative'])
const learningPracticeModeSchema = z.union([learnModeSchema, practiceModeSchema])
const requiredOutputSchema = z.enum(['learning', 'practice'])

export const executableLearningWorkUnitSchema = z.object({
  id: identifierSchema,
  title: nonEmptyStringSchema,
  requirementIds: z.array(identifierSchema).min(1),
  knowledgeNodeIds: z.array(identifierSchema).min(1),
  learningModes: z.array(learningPracticeModeSchema).min(1),
  requiredOutputs: z.array(requiredOutputSchema).min(1),
  scope: z.enum(['course', 'component']).default('course'),
  componentIds: z.array(identifierSchema).default([]),
})

export const executableLearningBlueprintSchema = z.object({
  schemaVersion: z.literal(1),
  jobId: identifierSchema,
  knowledgeModelFingerprint: nonEmptyStringSchema,
  workUnits: z.array(executableLearningWorkUnitSchema).min(1),
})

const learningSectionSchema = z.object({
  id: identifierSchema,
  title: nonEmptyStringSchema,
  explanation: nonEmptyStringSchema,
  keyPoints: z.array(nonEmptyStringSchema).min(1),
})

const workedExampleSchema = z.object({
  id: identifierSchema,
  title: nonEmptyStringSchema,
  setup: nonEmptyStringSchema,
  steps: z.array(nonEmptyStringSchema).min(1),
  conclusion: nonEmptyStringSchema,
})

export const learningCollateralWorkerOutputSchema = z.object({
  title: nonEmptyStringSchema,
  introduction: nonEmptyStringSchema,
  sections: z.array(learningSectionSchema).default([]),
  workedExamples: z.array(workedExampleSchema).default([]),
  misconceptions: z.array(z.object({
    misconception: nonEmptyStringSchema,
    correction: nonEmptyStringSchema,
  })).default([]),
  nextAction: nonEmptyStringSchema,
})

const practiceActivitySchema = z.object({
  id: identifierSchema,
  mode: practiceModeSchema,
  prompt: nonEmptyStringSchema,
  expectedResponse: nonEmptyStringSchema,
  explanation: nonEmptyStringSchema,
  improvementAction: nonEmptyStringSchema,
})

export const practiceCollateralWorkerOutputSchema = z.object({
  title: nonEmptyStringSchema,
  instructions: nonEmptyStringSchema,
  activities: z.array(practiceActivitySchema).min(1),
})

export const learningCollateralArtifactSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('learning'),
  jobId: identifierSchema,
  workUnitId: identifierSchema,
  knowledgeModelFingerprint: nonEmptyStringSchema,
  knowledgeNodeIds: z.array(identifierSchema).min(1),
  sourceRefs: z.array(identifierSchema).min(1),
  content: learningCollateralWorkerOutputSchema,
})

export const practiceCollateralArtifactSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('practice'),
  jobId: identifierSchema,
  workUnitId: identifierSchema,
  knowledgeModelFingerprint: nonEmptyStringSchema,
  knowledgeNodeIds: z.array(identifierSchema).min(1),
  sourceRefs: z.array(identifierSchema).min(1),
  content: practiceCollateralWorkerOutputSchema,
})

export const learningPracticeArtifactSchema = z.discriminatedUnion('artifactType', [
  learningCollateralArtifactSchema,
  practiceCollateralArtifactSchema,
])

export type ExecutableLearningBlueprint = z.infer<typeof executableLearningBlueprintSchema>
export type ExecutableLearningWorkUnit = z.infer<typeof executableLearningWorkUnitSchema>
export type LearningCollateralArtifact = z.infer<typeof learningCollateralArtifactSchema>
export type PracticeCollateralArtifact = z.infer<typeof practiceCollateralArtifactSchema>

export type LearningPracticeArtifactKind =
  | 'learning_blueprint'
  | 'learning_collateral'
  | 'practice_collateral'

export interface LearningPracticeArtifactStore {
  writeJson(input: {
    jobId: string
    kind: LearningPracticeArtifactKind
    fingerprint: string
    value: unknown
  }): Promise<{ ref: string }>
  readJson(ref: string): Promise<unknown>
}

export type LearningPracticeWorkerExecution<T> =
  | { status: 'success'; output: T; provenance: WorkerExecutionProvenance }
  | { status: 'failure' | 'infrastructure_failure'; error: string; provenance: WorkerExecutionProvenance }

export interface LearningPracticeWorkers {
  planLearningBlueprint(input: {
    jobId: string
    courseIdentity: NonNullable<ContentFactoryJob['courseIdentity']>
    knowledgeModelFingerprint: string
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
    coverageRequirements: Array<{
      requirementId: string
      requirementSummary: string
      skillsOrKnowledge: string[]
      componentScope: string[]
      revisionArea: string
      learnRequired: boolean
      practiceRequired: boolean
      examPrepRequired: boolean
      coverageStatus: CoverageMap['requirements'][number]['coverageStatus']
    }>
  }): Promise<LearningPracticeWorkerExecution<unknown>>
  generateLearningCollateral(input: {
    jobId: string
    courseIdentity: NonNullable<ContentFactoryJob['courseIdentity']>
    workUnit: ExecutableLearningWorkUnit
    knowledgeModelFingerprint: string
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
  }): Promise<LearningPracticeWorkerExecution<unknown>>
  generatePracticeCollateral(input: {
    jobId: string
    courseIdentity: NonNullable<ContentFactoryJob['courseIdentity']>
    workUnit: ExecutableLearningWorkUnit
    knowledgeModelFingerprint: string
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
  }): Promise<LearningPracticeWorkerExecution<unknown>>
}

export const contentFactoryLearningPracticeWorkerContracts = {
  learningBlueprint: {
    workerId: 'content-factory.learning-blueprint',
    contractVersion: '1',
    sourceInput: 'course-knowledge-model-plus-coverage-structured-facts-only',
  },
  learningCollateral: {
    workerId: 'content-factory.learning-collateral',
    contractVersion: '1',
    sourceInput: 'learning-blueprint-plus-course-knowledge-model-derived-facts-only',
  },
  practiceCollateral: {
    workerId: 'content-factory.practice-collateral',
    contractVersion: '1',
    sourceInput: 'learning-blueprint-plus-course-knowledge-model-derived-facts-only',
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
  execution: Extract<LearningPracticeWorkerExecution<unknown>, { status: 'failure' | 'infrastructure_failure' }>,
  updatedAt: string,
  stage: 'learning_blueprint' | 'generation',
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
  if (job.schemaVersion !== 2) throw new Error('Learning/practice factory requires a schema v2 job')
  if (job.state === 'blocked') throw new Error('Blocked jobs must be resumed before the learning/practice factory can continue')
  if (!['mapped', 'generating'].includes(job.state)) {
    throw new Error(`Content Factory job state ${job.state} is outside the learning/practice factory`)
  }
  if (!job.courseIdentity) throw new Error('Resolved course identity is required before learning/practice generation')
  if (job.sourceRightsStatus !== 'approved') throw new Error('Source rights must remain approved before learning/practice generation')
  if (!job.courseKnowledgeModelRef) throw new Error('Course Knowledge Model reference is required before learning/practice generation')
  if (!job.coverageMapRef) throw new Error('Coverage map reference is required before learning/practice generation')
  return job
}

async function readKnowledgeModel(
  job: ContentFactoryJob,
  artifactStore: LearningPracticeArtifactStore,
) {
  const model = courseKnowledgeModelSchema.parse(await artifactStore.readJson(job.courseKnowledgeModelRef!))
  if (model.jobId !== job.jobId) throw new Error('Course Knowledge Model job ID does not match the Content Factory job')
  return model
}

async function readCoverageMap(
  job: ContentFactoryJob,
  artifactStore: LearningPracticeArtifactStore,
) {
  const coverage = coverageMapSchema.parse(await artifactStore.readJson(job.coverageMapRef!))
  if (coverage.jobId !== job.jobId) throw new Error('Coverage map job ID does not match the Content Factory job')
  if (job.sourceSetFingerprint && coverage.sourceSetFingerprint !== job.sourceSetFingerprint) {
    throw new Error('Coverage map source fingerprint does not match the Content Factory job')
  }
  return coverage
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

function safeCoverageInput(requirement: CoverageMap['requirements'][number]) {
  return {
    requirementId: requirement.requirementId,
    requirementSummary: requirement.requirementSummary,
    skillsOrKnowledge: requirement.skillsOrKnowledge,
    componentScope: requirement.componentScope,
    revisionArea: requirement.revisionArea,
    learnRequired: requirement.learnRequired,
    practiceRequired: requirement.practiceRequired,
    examPrepRequired: requirement.examPrepRequired,
    coverageStatus: requirement.coverageStatus,
  }
}

function validateExecutableBlueprint(
  blueprintInput: unknown,
  job: ContentFactoryJob,
  model: CourseKnowledgeModel,
  coverage: CoverageMap,
): ExecutableLearningBlueprint {
  const blueprint = executableLearningBlueprintSchema.parse(blueprintInput)
  learningBlueprintSchema.parse(blueprint)

  if (blueprint.jobId !== job.jobId) throw new Error('Learning Blueprint job ID does not match the Content Factory job')
  if (blueprint.knowledgeModelFingerprint !== model.fingerprint) {
    throw new Error('Learning Blueprint does not match the Course Knowledge Model fingerprint')
  }

  const unitIds = new Set<string>()
  const modelNodeIds = new Set(model.nodes.map((node) => node.id))
  const requirementMap = new Map(coverage.requirements.map((requirement) => [requirement.requirementId, requirement]))
  const plannedNodeIds = new Set<string>()

  for (const unit of blueprint.workUnits) {
    if (unitIds.has(unit.id)) throw new Error(`Duplicate Learning Blueprint work unit id: ${unit.id}`)
    unitIds.add(unit.id)

    if (unit.scope === 'course' && unit.componentIds.length > 0) {
      throw new Error(`Course-scoped work unit ${unit.id} must not duplicate itself across component IDs`)
    }
    if (unit.scope === 'component' && unit.componentIds.length === 0) {
      throw new Error(`Component-scoped work unit ${unit.id} must identify at least one component`)
    }

    const learnModes = unit.learningModes.filter((mode) => learnModeSchema.safeParse(mode).success)
    const practiceModes = unit.learningModes.filter((mode) => practiceModeSchema.safeParse(mode).success)
    if (unit.requiredOutputs.includes('learning') && learnModes.length === 0) {
      throw new Error(`Work unit ${unit.id} requires learning output but selects no learning mode`)
    }
    if (unit.requiredOutputs.includes('practice') && practiceModes.length === 0) {
      throw new Error(`Work unit ${unit.id} requires practice output but selects no practice mode`)
    }

    for (const nodeId of unit.knowledgeNodeIds) {
      if (!modelNodeIds.has(nodeId)) throw new Error(`Learning Blueprint work unit ${unit.id} references unknown knowledge node ${nodeId}`)
      plannedNodeIds.add(nodeId)
    }

    for (const requirementId of unit.requirementIds) {
      const requirement = requirementMap.get(requirementId)
      if (!requirement) throw new Error(`Learning Blueprint work unit ${unit.id} references unknown coverage requirement ${requirementId}`)

      if (unit.scope === 'component') {
        if (requirement.componentScope.length > 1) {
          throw new Error(`Shared multi-component requirement ${requirementId} must remain course-scoped for Learn/Practice unless coverage is split into genuinely distinct component requirements`)
        }
        for (const componentId of unit.componentIds) {
          if (!requirement.componentScope.includes(componentId)) {
            throw new Error(`Work unit ${unit.id} component ${componentId} is outside requirement ${requirementId} scope`)
          }
        }
      }
    }
  }

  const missingNodes = model.nodes.filter((node) => !plannedNodeIds.has(node.id)).map((node) => node.id)
  if (missingNodes.length > 0) throw new Error(`Learning Blueprint leaves Course Knowledge Model nodes unplanned: ${missingNodes.join(', ')}`)

  for (const requirement of coverage.requirements) {
    if (['deferred', 'not_applicable'].includes(requirement.coverageStatus)) continue
    const units = blueprint.workUnits.filter((unit) => unit.requirementIds.includes(requirement.requirementId))
    if (requirement.learnRequired && !units.some((unit) => unit.requiredOutputs.includes('learning'))) {
      throw new Error(`Coverage requirement ${requirement.requirementId} requires Learn output but the Learning Blueprint does not provide it`)
    }
    if (requirement.practiceRequired && !units.some((unit) => unit.requiredOutputs.includes('practice'))) {
      throw new Error(`Coverage requirement ${requirement.requirementId} requires Practice output but the Learning Blueprint does not provide it`)
    }
  }

  return blueprint
}

function knowledgeNodesForUnit(model: CourseKnowledgeModel, unit: ExecutableLearningWorkUnit) {
  const nodeMap = new Map(model.nodes.map((node) => [node.id, node]))
  return unit.knowledgeNodeIds.map((id) => {
    const node = nodeMap.get(id)
    if (!node) throw new Error(`Work unit ${unit.id} references missing Course Knowledge Model node ${id}`)
    return node
  })
}

function sourceRefsForNodes(nodes: CourseKnowledgeModel['nodes']) {
  const refs = [...new Set(nodes.flatMap((node) => node.sourceRefs))]
  if (refs.length === 0) throw new Error('Generated learner collateral must retain at least one inherited curriculum source reference')
  return refs
}

function validateLearningOutput(
  outputInput: unknown,
  unit: ExecutableLearningWorkUnit,
) {
  const output = learningCollateralWorkerOutputSchema.parse(outputInput)
  const modes = new Set(unit.learningModes)
  if (modes.has('explanation') && output.sections.length === 0) {
    throw new Error(`Learning work unit ${unit.id} selected explanation but generated no explanation sections`)
  }
  if (!modes.has('explanation') && output.sections.length > 0) {
    throw new Error(`Learning work unit ${unit.id} generated explanation sections that were not selected by the Learning Blueprint`)
  }
  if (modes.has('worked_example') && output.workedExamples.length === 0) {
    throw new Error(`Learning work unit ${unit.id} selected worked examples but generated none`)
  }
  if (!modes.has('worked_example') && output.workedExamples.length > 0) {
    throw new Error(`Learning work unit ${unit.id} generated worked examples that were not selected by the Learning Blueprint`)
  }
  return output
}

function validatePracticeOutput(
  outputInput: unknown,
  unit: ExecutableLearningWorkUnit,
) {
  const output = practiceCollateralWorkerOutputSchema.parse(outputInput)
  const plannedModes = new Set(unit.learningModes.filter((mode) => practiceModeSchema.safeParse(mode).success))
  const generatedModes = new Set(output.activities.map((activity) => activity.mode))

  for (const mode of plannedModes) {
    if (!generatedModes.has(mode as z.infer<typeof practiceModeSchema>)) {
      throw new Error(`Practice work unit ${unit.id} selected ${mode} but generated no matching activity`)
    }
  }
  for (const activity of output.activities) {
    if (!plannedModes.has(activity.mode)) {
      throw new Error(`Practice work unit ${unit.id} generated unplanned mode ${activity.mode}`)
    }
  }
  return output
}

async function existingOutputTypes(
  unitOutputRefs: string[],
  artifactStore: LearningPracticeArtifactStore,
  jobId: string,
  workUnitId: string,
  knowledgeModelFingerprint: string,
) {
  const types = new Set<'learning' | 'practice'>()
  for (const ref of unitOutputRefs) {
    let value: unknown
    try {
      value = await artifactStore.readJson(ref)
    } catch {
      continue
    }
    const parsed = learningPracticeArtifactSchema.safeParse(value)
    if (!parsed.success) continue
    if (parsed.data.jobId !== jobId || parsed.data.workUnitId !== workUnitId) continue
    if (parsed.data.knowledgeModelFingerprint !== knowledgeModelFingerprint) continue
    types.add(parsed.data.artifactType)
  }
  return types
}

function jobWorkUnitsFromBlueprint(blueprint: ExecutableLearningBlueprint) {
  return blueprint.workUnits.map((unit) => ({
    id: unit.id,
    title: unit.title,
    requirementIds: unit.requirementIds,
    componentIds: unit.scope === 'component' ? unit.componentIds : [],
    status: 'pending' as const,
    outputRefs: [],
  }))
}

function validateJobPlanMatchesBlueprint(job: ContentFactoryJob, blueprint: ExecutableLearningBlueprint) {
  const blueprintIds = new Set(blueprint.workUnits.map((unit) => unit.id))
  const jobIds = new Set(job.workUnits.map((unit) => unit.id))
  if (blueprintIds.size !== jobIds.size || [...blueprintIds].some((id) => !jobIds.has(id))) {
    throw new Error('Persisted generation work units do not match the Learning Blueprint')
  }
}

export async function runLearningAndPracticeFactory(input: {
  job: ContentFactoryJob
  workers: LearningPracticeWorkers
  artifactStore: LearningPracticeArtifactStore
  now: string
}): Promise<ContentFactoryJob> {
  let job = requireRunnableJob(input.job)
  const model = await readKnowledgeModel(job, input.artifactStore)
  const coverage = await readCoverageMap(job, input.artifactStore)
  let blueprint: ExecutableLearningBlueprint

  if (!job.learningBlueprintRef) {
    if (job.state !== 'mapped') throw new Error('A generating job must already have a persisted Learning Blueprint')
    const execution = await input.workers.planLearningBlueprint({
      jobId: job.jobId,
      courseIdentity: job.courseIdentity!,
      knowledgeModelFingerprint: model.fingerprint,
      knowledgeNodes: model.nodes.map(safeKnowledgeNodeInput),
      coverageRequirements: coverage.requirements.map(safeCoverageInput),
    })
    if (execution.status !== 'success') return workerFailure(job, execution, input.now, 'learning_blueprint')
    blueprint = validateExecutableBlueprint(execution.output, job, model, coverage)
    const fingerprint = await fingerprintValue(blueprint)
    const write = await input.artifactStore.writeJson({
      jobId: job.jobId,
      kind: 'learning_blueprint',
      fingerprint,
      value: blueprint,
    })
    job = appendWorkerRun(job, 'learning_blueprint', execution, input.now, {
      inputRefs: [job.courseKnowledgeModelRef!, job.coverageMapRef!],
      outputRefs: [write.ref],
    })
    job = contentFactoryJobSchema.parse({
      ...job,
      learningBlueprintRef: write.ref,
      workUnits: jobWorkUnitsFromBlueprint(blueprint),
      updatedAt: input.now,
    })
    job = advanceJob(job, 'generating', input.now)
  } else {
    blueprint = validateExecutableBlueprint(
      await input.artifactStore.readJson(job.learningBlueprintRef),
      job,
      model,
      coverage,
    )
    if (job.state === 'mapped') {
      if (job.workUnits.length === 0) {
        job = contentFactoryJobSchema.parse({
          ...job,
          workUnits: jobWorkUnitsFromBlueprint(blueprint),
          updatedAt: input.now,
        })
      } else {
        validateJobPlanMatchesBlueprint(job, blueprint)
      }
      job = advanceJob(job, 'generating', input.now)
    } else {
      validateJobPlanMatchesBlueprint(job, blueprint)
    }
  }

  for (const unit of blueprint.workUnits) {
    const jobUnitIndex = job.workUnits.findIndex((candidate) => candidate.id === unit.id)
    if (jobUnitIndex < 0) throw new Error(`Learning Blueprint work unit ${unit.id} is missing from the Content Factory job`)
    const persistedUnit = job.workUnits[jobUnitIndex]
    const existingTypes = await existingOutputTypes(
      persistedUnit.outputRefs,
      input.artifactStore,
      job.jobId,
      unit.id,
      model.fingerprint,
    )
    const needsLearning = unit.requiredOutputs.includes('learning') && !existingTypes.has('learning')
    const needsPractice = unit.requiredOutputs.includes('practice') && !existingTypes.has('practice')

    if (!needsLearning && !needsPractice) {
      if (persistedUnit.status !== 'complete') {
        job = contentFactoryJobSchema.parse({
          ...job,
          workUnits: job.workUnits.map((candidate) => candidate.id === unit.id
            ? { ...candidate, status: 'complete' }
            : candidate),
          updatedAt: input.now,
        })
      }
      continue
    }

    job = contentFactoryJobSchema.parse({
      ...job,
      workUnits: job.workUnits.map((candidate) => candidate.id === unit.id
        ? { ...candidate, status: 'in_progress' }
        : candidate),
      updatedAt: input.now,
    })

    const nodes = knowledgeNodesForUnit(model, unit)
    const safeNodes = nodes.map(safeKnowledgeNodeInput)
    const sourceRefs = sourceRefsForNodes(nodes)

    if (needsLearning) {
      const execution = await input.workers.generateLearningCollateral({
        jobId: job.jobId,
        courseIdentity: job.courseIdentity!,
        workUnit: unit,
        knowledgeModelFingerprint: model.fingerprint,
        knowledgeNodes: safeNodes,
      })
      if (execution.status !== 'success') return workerFailure(job, execution, input.now, 'generation')
      const content = validateLearningOutput(execution.output, unit)
      const artifact = learningCollateralArtifactSchema.parse({
        schemaVersion: 1,
        artifactType: 'learning',
        jobId: job.jobId,
        workUnitId: unit.id,
        knowledgeModelFingerprint: model.fingerprint,
        knowledgeNodeIds: unit.knowledgeNodeIds,
        sourceRefs,
        content,
      })
      const fingerprint = await fingerprintValue(artifact)
      const write = await input.artifactStore.writeJson({
        jobId: job.jobId,
        kind: 'learning_collateral',
        fingerprint,
        value: artifact,
      })
      job = appendWorkerRun(job, 'generation', execution, input.now, {
        inputRefs: [job.courseKnowledgeModelRef!, job.learningBlueprintRef!, `work-unit:${unit.id}`],
        outputRefs: [write.ref],
      })
      job = contentFactoryJobSchema.parse({
        ...job,
        workUnits: job.workUnits.map((candidate) => candidate.id === unit.id
          ? { ...candidate, outputRefs: [...candidate.outputRefs, write.ref] }
          : candidate),
        updatedAt: input.now,
      })
    }

    if (needsPractice) {
      const execution = await input.workers.generatePracticeCollateral({
        jobId: job.jobId,
        courseIdentity: job.courseIdentity!,
        workUnit: unit,
        knowledgeModelFingerprint: model.fingerprint,
        knowledgeNodes: safeNodes,
      })
      if (execution.status !== 'success') return workerFailure(job, execution, input.now, 'generation')
      const content = validatePracticeOutput(execution.output, unit)
      const artifact = practiceCollateralArtifactSchema.parse({
        schemaVersion: 1,
        artifactType: 'practice',
        jobId: job.jobId,
        workUnitId: unit.id,
        knowledgeModelFingerprint: model.fingerprint,
        knowledgeNodeIds: unit.knowledgeNodeIds,
        sourceRefs,
        content,
      })
      const fingerprint = await fingerprintValue(artifact)
      const write = await input.artifactStore.writeJson({
        jobId: job.jobId,
        kind: 'practice_collateral',
        fingerprint,
        value: artifact,
      })
      job = appendWorkerRun(job, 'generation', execution, input.now, {
        inputRefs: [job.courseKnowledgeModelRef!, job.learningBlueprintRef!, `work-unit:${unit.id}`],
        outputRefs: [write.ref],
      })
      job = contentFactoryJobSchema.parse({
        ...job,
        workUnits: job.workUnits.map((candidate) => candidate.id === unit.id
          ? { ...candidate, outputRefs: [...candidate.outputRefs, write.ref] }
          : candidate),
        updatedAt: input.now,
      })
    }

    const currentUnit = job.workUnits.find((candidate) => candidate.id === unit.id)!
    const finalTypes = await existingOutputTypes(
      currentUnit.outputRefs,
      input.artifactStore,
      job.jobId,
      unit.id,
      model.fingerprint,
    )
    const complete = (!unit.requiredOutputs.includes('learning') || finalTypes.has('learning'))
      && (!unit.requiredOutputs.includes('practice') || finalTypes.has('practice'))

    job = contentFactoryJobSchema.parse({
      ...job,
      workUnits: job.workUnits.map((candidate) => candidate.id === unit.id
        ? { ...candidate, status: complete ? 'complete' : 'in_progress' }
        : candidate),
      updatedAt: input.now,
    })
  }

  return job
}
