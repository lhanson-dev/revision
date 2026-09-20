import { z } from 'zod'
import { foundationCoverageModelSchema } from './foundation-compilation'
import {
  deriveFoundationCourseLearningAtomicTeachingPoints,
} from './foundation-course-learning-atomic-obligations'
import {
  foundationCourseLearningDesignSchema,
  deriveFoundationCourseLearningDesign,
  learningModesForFoundationCourseLearningDesign,
} from './foundation-course-learning-blueprint'
import {
  createFoundationDerivedAsset,
  foundationDerivedAssetSchema,
} from './foundation-derived-asset'
import { foundationJobSchema, type FoundationJob } from './foundation-schema'
import {
  executableLearningWorkUnitSchema,
  learningCollateralWorkerOutputSchema,
  practiceCollateralWorkerOutputSchema,
  type LearningPracticeWorkers,
} from './learning-and-practice'
import { courseIdentitySchema, courseKnowledgeModelSchema } from './schema'
import { validateTeachingPointEvidence } from './teaching-point-integrity'

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const nonEmptyStringSchema = z.string().min(1)
const sha256Schema = z.string().regex(/^[0-9a-f]{64}$/)

export const foundationInternalLearningPlanningContractSchema = z.enum([
  'legacy-v1',
  'course-learning-blueprint-v2',
])

export const foundationInternalLearningWorkUnitSchema = executableLearningWorkUnitSchema.extend({
  revisionArea: nonEmptyStringSchema,
  sourceRefs: z.array(identifierSchema).min(1),
  requiredTeachingPoints: z.array(nonEmptyStringSchema).min(1),
  learningDesign: foundationCourseLearningDesignSchema.optional(),
})

export const foundationInternalLearningAssetBundleSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('foundation_internal_learning_asset_bundle'),
  planningContractVersion: foundationInternalLearningPlanningContractSchema.optional(),
  foundationFingerprint: sha256Schema,
  foundationCandidateId: identifierSchema,
  courseIdentity: courseIdentitySchema,
  coverageModelFingerprint: sha256Schema,
  knowledgeModelFingerprint: sha256Schema,
  learnAsset: foundationDerivedAssetSchema,
  practiceAsset: foundationDerivedAssetSchema,
  generationContextIds: z.array(nonEmptyStringSchema).min(1),
  workUnits: z.array(z.object({
    plan: foundationInternalLearningWorkUnitSchema,
    learning: learningCollateralWorkerOutputSchema,
    practice: practiceCollateralWorkerOutputSchema,
  })).min(1),
  createdAt: nonEmptyStringSchema,
}).superRefine((bundle, context) => {
  for (const [field, asset] of [['learnAsset', bundle.learnAsset], ['practiceAsset', bundle.practiceAsset]] as const) {
    if (asset.foundationFingerprint !== bundle.foundationFingerprint) {
      context.addIssue({
        code: 'custom',
        path: [field, 'foundationFingerprint'],
        message: 'Internal learner assets must retain the exact Foundation fingerprint',
      })
    }
    if (asset.foundationCandidateId !== bundle.foundationCandidateId) {
      context.addIssue({
        code: 'custom',
        path: [field, 'foundationCandidateId'],
        message: 'Internal learner assets must retain the exact Foundation Candidate',
      })
    }
    if (asset.assuranceStatus !== 'pending') {
      context.addIssue({
        code: 'custom',
        path: [field, 'assuranceStatus'],
        message: 'Generation does not imply asset assurance',
      })
    }
  }

  if (bundle.planningContractVersion === 'course-learning-blueprint-v2') {
    bundle.workUnits.forEach((workUnit, index) => {
      if (!workUnit.plan.learningDesign) {
        context.addIssue({
          code: 'custom',
          path: ['workUnits', index, 'plan', 'learningDesign'],
          message: 'Course Learning Blueprint v2 work units must retain deterministic learning design',
        })
      }
    })
  }
})

export type FoundationInternalLearningAssetBundle = z.infer<typeof foundationInternalLearningAssetBundleSchema>
export type FoundationInternalLearningWorkUnit = z.infer<typeof foundationInternalLearningWorkUnitSchema>
export type FoundationInternalLearningPlannerVersion = 1 | 2

function slug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function unique<T extends string>(values: T[]) {
  return [...new Set(values)]
}

function safeNode(node: z.infer<typeof courseKnowledgeModelSchema>['nodes'][number]) {
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

export function planFoundationInternalLearningWorkUnits(input: {
  coverageModel: unknown
  courseKnowledgeModel: unknown
}, options: { plannerVersion?: FoundationInternalLearningPlannerVersion } = {}) {
  const coverage = foundationCoverageModelSchema.parse(input.coverageModel)
  const model = courseKnowledgeModelSchema.parse(input.courseKnowledgeModel)
  const plannerVersion = options.plannerVersion ?? 1
  if (coverage.jobId !== model.jobId) {
    throw new Error('Foundation coverage and Course Knowledge Model must belong to the same Foundation job')
  }

  const nodeMap = new Map(model.nodes.map((node) => [node.id, node]))
  const coveredNodeIds = new Set<string>()
  const groups = new Map<string, typeof coverage.requirements>()

  for (const requirement of coverage.requirements) {
    for (const nodeId of requirement.knowledgeNodeIds) {
      if (!nodeMap.has(nodeId)) {
        throw new Error(`Foundation coverage requirement ${requirement.requirementId} references unknown knowledge node ${nodeId}`)
      }
      coveredNodeIds.add(nodeId)
    }
    const existing = groups.get(requirement.revisionArea) ?? []
    groups.set(requirement.revisionArea, [...existing, requirement])
  }

  const unplannedNodes = model.nodes.filter((node) => !coveredNodeIds.has(node.id)).map((node) => node.id)
  if (unplannedNodes.length > 0) {
    throw new Error(`Foundation Course Truth nodes are not mapped by governed coverage: ${unplannedNodes.join(', ')}`)
  }

  const usedIds = new Set<string>()
  return [...groups.entries()].map(([revisionArea, requirements], index) => {
    const nodeIds = unique(requirements.flatMap((requirement) => requirement.knowledgeNodeIds))
    const nodes = nodeIds.map((id) => nodeMap.get(id)!)
    const baseId = slug(revisionArea) || `revision-area-${index + 1}`
    let id = `foundation-${baseId}`
    let suffix = 2
    while (usedIds.has(id)) {
      id = `foundation-${baseId}-${suffix}`
      suffix += 1
    }
    usedIds.add(id)

    let learningModes: Array<'explanation' | 'worked_example' | 'retrieval' | 'flashcard' | 'short_answer' | 'application' | 'quantitative'>
    let learningDesign: z.infer<typeof foundationCourseLearningDesignSchema> | undefined

    if (plannerVersion === 2) {
      learningDesign = deriveFoundationCourseLearningDesign(nodes)
      learningModes = learningModesForFoundationCourseLearningDesign(learningDesign)
    } else {
      learningModes = ['explanation', 'retrieval']
      if (nodes.some((node) => node.formulas.length > 0)) {
        learningModes.push('worked_example', 'quantitative')
      }
      if (nodes.some((node) => node.applicationContexts.length > 0)) learningModes.push('application')
    }

    const requiredTeachingPoints = unique([
      ...requirements.flatMap((requirement) => requirement.skillsOrKnowledge),
      ...(plannerVersion === 2 ? deriveFoundationCourseLearningAtomicTeachingPoints(nodes) : []),
    ])

    return foundationInternalLearningWorkUnitSchema.parse({
      id,
      title: revisionArea,
      revisionArea,
      requirementIds: requirements.map((requirement) => requirement.requirementId),
      knowledgeNodeIds: nodeIds,
      learningModes: unique(learningModes),
      requiredOutputs: ['learning', 'practice'],
      scope: 'course',
      componentIds: [],
      sourceRefs: unique([
        ...requirements.flatMap((requirement) => requirement.sourceRefs),
        ...nodes.flatMap((node) => node.sourceRefs),
      ]),
      requiredTeachingPoints,
      ...(learningDesign ? { learningDesign } : {}),
    })
  })
}

function validateLearning(outputInput: unknown, unit: FoundationInternalLearningWorkUnit) {
  const output = learningCollateralWorkerOutputSchema.parse(outputInput)
  if (unit.learningModes.includes('explanation') && output.sections.length === 0) {
    throw new Error(`Learning work unit ${unit.id} requires explanation sections`)
  }
  if (unit.learningModes.includes('worked_example') && output.workedExamples.length === 0) {
    throw new Error(`Learning work unit ${unit.id} requires a worked example`)
  }
  validateTeachingPointEvidence({
    requiredTeachingPoints: unit.requiredTeachingPoints,
    evidence: output.coverageEvidence,
    searchableContent: output,
    artifactLabel: `Foundation Learn work unit ${unit.id}`,
  })
  return output
}

function validatePractice(outputInput: unknown, unit: FoundationInternalLearningWorkUnit) {
  const output = practiceCollateralWorkerOutputSchema.parse(outputInput)
  const plannedModes = new Set(unit.learningModes.filter((mode) => (
    ['retrieval', 'flashcard', 'short_answer', 'application', 'quantitative'].includes(mode)
  )))
  const generatedModes = new Set(output.activities.map((activity) => activity.mode))
  for (const mode of plannedModes) {
    if (!generatedModes.has(mode as 'retrieval' | 'flashcard' | 'short_answer' | 'application' | 'quantitative')) {
      throw new Error(`Practice work unit ${unit.id} requires ${mode} activity`)
    }
  }
  for (const activity of output.activities) {
    if (!plannedModes.has(activity.mode)) {
      throw new Error(`Practice work unit ${unit.id} generated unplanned mode ${activity.mode}`)
    }
  }
  validateTeachingPointEvidence({
    requiredTeachingPoints: unit.requiredTeachingPoints,
    evidence: output.coverageEvidence,
    searchableContent: output,
    artifactLabel: `Foundation Practice work unit ${unit.id}`,
  })
  return output
}

export async function generateFoundationInternalLearningAssets(input: {
  job: FoundationJob
  coverageModel: unknown
  coverageModelFingerprint: string
  courseKnowledgeModel: unknown
  workers: Pick<LearningPracticeWorkers, 'generateLearningCollateral' | 'generatePracticeCollateral'>
  now: string
  assetIdPrefix?: string
}) {
  const job = foundationJobSchema.parse(input.job)
  if (!job.candidate) throw new Error('Foundation Candidate is required for internal learner asset production')
  if (job.candidate.coverageModel.fingerprint !== input.coverageModelFingerprint) {
    throw new Error('Foundation coverage artifact fingerprint does not match the Candidate')
  }

  const coverage = foundationCoverageModelSchema.parse(input.coverageModel)
  const model = courseKnowledgeModelSchema.parse(input.courseKnowledgeModel)
  if (job.candidate.courseKnowledgeModel.fingerprint !== model.fingerprint) {
    throw new Error('Course Knowledge Model fingerprint does not match the Foundation Candidate')
  }
  if (coverage.jobId !== job.jobId || model.jobId !== job.jobId) {
    throw new Error('Foundation learner assets must be generated from artifacts belonging to the exact Foundation job')
  }

  const prefix = input.assetIdPrefix ?? `${job.jobId}-internal`
  const learnAsset = await createFoundationDerivedAsset({
    job,
    assetId: `${prefix}-learn`,
    assetKind: 'learn',
    createdAt: input.now,
  })
  const practiceAsset = await createFoundationDerivedAsset({
    job,
    assetId: `${prefix}-practice`,
    assetKind: 'practice',
    createdAt: input.now,
  })
  if (learnAsset.foundationFingerprint !== practiceAsset.foundationFingerprint) {
    throw new Error('Learn and Practice assets must derive from the same Foundation fingerprint')
  }

  const plans = planFoundationInternalLearningWorkUnits(
    { coverageModel: coverage, courseKnowledgeModel: model },
    { plannerVersion: 2 },
  )
  const generationContextIds: string[] = []
  const workUnits: FoundationInternalLearningAssetBundle['workUnits'] = []

  for (const plan of plans) {
    const knowledgeNodes = plan.knowledgeNodeIds.map((id) => {
      const node = model.nodes.find((candidate) => candidate.id === id)
      if (!node) throw new Error(`Missing Course Truth node ${id}`)
      return safeNode(node)
    })

    const learningExecution = await input.workers.generateLearningCollateral({
      jobId: job.jobId,
      courseIdentity: job.candidate.courseIdentity,
      workUnit: plan,
      knowledgeModelFingerprint: model.fingerprint,
      requiredTeachingPoints: plan.requiredTeachingPoints,
      knowledgeNodes,
    })
    if (learningExecution.status !== 'success') {
      throw new Error(`Foundation Learn generation failed for ${plan.id}: ${learningExecution.error}`)
    }
    generationContextIds.push(learningExecution.provenance.contextId)
    const learning = validateLearning(learningExecution.output, plan)

    const practiceExecution = await input.workers.generatePracticeCollateral({
      jobId: job.jobId,
      courseIdentity: job.candidate.courseIdentity,
      workUnit: plan,
      knowledgeModelFingerprint: model.fingerprint,
      requiredTeachingPoints: plan.requiredTeachingPoints,
      knowledgeNodes,
    })
    if (practiceExecution.status !== 'success') {
      throw new Error(`Foundation Practice generation failed for ${plan.id}: ${practiceExecution.error}`)
    }
    generationContextIds.push(practiceExecution.provenance.contextId)
    const practice = validatePractice(practiceExecution.output, plan)

    workUnits.push({ plan, learning, practice })
  }

  return foundationInternalLearningAssetBundleSchema.parse({
    schemaVersion: 1,
    artifactType: 'foundation_internal_learning_asset_bundle',
    planningContractVersion: 'course-learning-blueprint-v2',
    foundationFingerprint: learnAsset.foundationFingerprint,
    foundationCandidateId: learnAsset.foundationCandidateId,
    courseIdentity: job.candidate.courseIdentity,
    coverageModelFingerprint: input.coverageModelFingerprint,
    knowledgeModelFingerprint: model.fingerprint,
    learnAsset,
    practiceAsset,
    generationContextIds: unique(generationContextIds),
    workUnits,
    createdAt: input.now,
  })
}
