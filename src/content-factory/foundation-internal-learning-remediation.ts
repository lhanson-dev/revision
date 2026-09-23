import { z } from 'zod'
import { foundationCoverageModelSchema } from './foundation-compilation'
import { createFoundationDerivedAsset } from './foundation-derived-asset'
import {
  foundationInternalLearningAssetBundleSchema,
  planFoundationInternalLearningWorkUnits,
  type FoundationInternalLearningAssetBundle,
  type FoundationInternalLearningWorkUnit,
} from './foundation-internal-learning-assets'
import {
  foundationInternalLearningIndependentReviewSchema,
  foundationInternalLearningRemediationTargetSchema,
} from './foundation-internal-learning-assurance'
import { computeFoundationFingerprint } from './foundation-lifecycle'
import { foundationJobSchema, type FoundationJob } from './foundation-schema'
import { fingerprintValue } from './intake-to-knowledge-model'
import {
  learningCollateralWorkerOutputSchema,
  practiceCollateralWorkerOutputSchema,
  type LearningPracticeWorkerExecution,
} from './learning-and-practice'
import { courseKnowledgeModelSchema } from './schema'
import { validateTeachingPointEvidence } from './teaching-point-integrity'

const nonEmptyStringSchema = z.string().min(1)
const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const sha256Schema = z.string().regex(/^[0-9a-f]{64}$/)

const remediationFindingSchema = z.object({
  id: identifierSchema,
  severity: z.enum(['blocking', 'material', 'minor']),
  issueType: nonEmptyStringSchema,
  evidence: z.array(nonEmptyStringSchema).min(1),
  finding: nonEmptyStringSchema,
  recommendedCorrection: nonEmptyStringSchema,
})

export const foundationInternalLearningRemediationRecordSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('foundation_internal_learning_remediation_record'),
  foundationFingerprint: sha256Schema,
  foundationCandidateId: identifierSchema,
  sourceBundleFingerprint: sha256Schema,
  resultBundleFingerprint: sha256Schema,
  sourceReviewFingerprint: sha256Schema,
  addressedFindingIds: z.array(identifierSchema).min(1),
  remediationContextIds: z.array(nonEmptyStringSchema).min(1),
  priorReviewerContextIds: z.array(nonEmptyStringSchema).min(1),
  targets: z.array(z.object({
    workUnitId: identifierSchema,
    assetKind: z.enum(['learn', 'practice']),
    findingIds: z.array(identifierSchema).min(1),
  })).min(1),
  createdAt: nonEmptyStringSchema,
})

export type FoundationInternalLearningRemediationRecord = z.infer<typeof foundationInternalLearningRemediationRecordSchema>
export type FoundationInternalLearningRemediationFinding = z.infer<typeof remediationFindingSchema>

type BundleWorkUnit = FoundationInternalLearningAssetBundle['workUnits'][number]
type ParsedKnowledgeModel = z.infer<typeof courseKnowledgeModelSchema>
type SafeKnowledgeNode = {
  id: string
  kind: ParsedKnowledgeModel['nodes'][number]['kind']
  summary: string
  formulas: string[]
  misconceptions: string[]
  applicationContexts: string[]
  depth: ParsedKnowledgeModel['nodes'][number]['depth']
  evidenceTypes: string[]
}

type RemediationWorkerInput<T> = {
  jobId: string
  courseIdentity: FoundationInternalLearningAssetBundle['courseIdentity']
  workUnit: FoundationInternalLearningWorkUnit
  knowledgeModelFingerprint: string
  requiredTeachingPoints: string[]
  knowledgeNodes: SafeKnowledgeNode[]
  previousOutput: T
  findings: FoundationInternalLearningRemediationFinding[]
}

export interface FoundationInternalLearningRemediationWorkers {
  remediateLearningCollateral(input: RemediationWorkerInput<BundleWorkUnit['learning']>): Promise<LearningPracticeWorkerExecution<unknown>>
  remediatePracticeCollateral(input: RemediationWorkerInput<BundleWorkUnit['practice']>): Promise<LearningPracticeWorkerExecution<unknown>>
}

type ProviderRunAwareProvenance = {
  contextId: string
  providerRuns?: Array<{ contextId: string }>
}

function unique(values: string[]) {
  return [...new Set(values)]
}

function sameValue(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function executionContextIds(provenance: { contextId: string }) {
  const providerRuns = (provenance as ProviderRunAwareProvenance).providerRuns
  if (providerRuns && providerRuns.length > 0) return providerRuns.map((run) => run.contextId)
  return [provenance.contextId]
}

function safeNode(node: ParsedKnowledgeModel['nodes'][number]): SafeKnowledgeNode {
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
    artifactLabel: `Remediated Foundation Learn work unit ${unit.id}`,
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
    artifactLabel: `Remediated Foundation Practice work unit ${unit.id}`,
  })
  return output
}

function candidateContextIds(job: z.infer<typeof foundationJobSchema>) {
  const candidate = job.candidate ?? job.approvedFoundation?.candidate
  if (!candidate) return []
  return unique([
    ...candidate.provenance.generationContextIds,
    ...candidate.provenance.assuranceContextIds,
    ...(candidate.externalSourceChallenge ? [candidate.externalSourceChallenge.reviewerContextId] : []),
  ])
}

function groupedTargets(input: {
  independentReview: z.infer<typeof foundationInternalLearningIndependentReviewSchema>
  remediationTargets: Array<z.infer<typeof foundationInternalLearningRemediationTargetSchema>>
}) {
  const openFindings = input.independentReview.findings.filter((finding) => (
    finding.resolutionStatus === 'open' && finding.severity !== 'no_issue'
  ))
  const findingMap = new Map(openFindings.map((finding) => [finding.id, remediationFindingSchema.parse(finding)]))
  const findingWorkUnits = new Map<string, string>()
  for (const review of input.independentReview.workUnitReviews) {
    for (const findingId of review.findingIds) {
      const existing = findingWorkUnits.get(findingId)
      if (existing && existing !== review.workUnitId) {
        throw new Error(`Assurance finding ${findingId} is assigned to multiple work units`)
      }
      findingWorkUnits.set(findingId, review.workUnitId)
    }
  }

  const targetedFindingIds = unique(input.remediationTargets.flatMap((target) => target.findingIds)).sort()
  const expectedFindingIds = [...findingMap.keys()].sort()
  if (!sameValue(targetedFindingIds, expectedFindingIds)) {
    throw new Error('Remediation targets must cover every and only open assurance finding')
  }

  const grouped = new Map<string, { learn: Set<string>; practice: Set<string> }>()
  for (const target of input.remediationTargets) {
    const parsed = foundationInternalLearningRemediationTargetSchema.parse(target)
    const entry = grouped.get(parsed.workUnitId) ?? { learn: new Set<string>(), practice: new Set<string>() }
    for (const findingId of parsed.findingIds) {
      if (!findingMap.has(findingId)) throw new Error(`Remediation target references unknown open finding ${findingId}`)
      if (findingWorkUnits.get(findingId) !== parsed.workUnitId) {
        throw new Error(`Remediation finding ${findingId} does not belong to work unit ${parsed.workUnitId}`)
      }
      if (parsed.assetKind === 'learn' || parsed.assetKind === 'both') entry.learn.add(findingId)
      if (parsed.assetKind === 'practice' || parsed.assetKind === 'both') entry.practice.add(findingId)
    }
    grouped.set(parsed.workUnitId, entry)
  }

  return { grouped, findingMap, expectedFindingIds }
}

function assertFreshRemediationContexts(input: {
  contextIds: string[]
  forbiddenContextIds: string[]
}) {
  if (input.contextIds.length === 0) throw new Error('Targeted remediation must retain at least one provider context')
  if (new Set(input.contextIds).size !== input.contextIds.length) {
    throw new Error('Targeted remediation provider contexts must be unique')
  }
  const forbidden = new Set(input.forbiddenContextIds)
  const collisions = input.contextIds.filter((contextId) => forbidden.has(contextId))
  if (collisions.length > 0) {
    throw new Error(`Targeted remediation reused forbidden context(s): ${collisions.join(', ')}`)
  }
}

export async function remediateFoundationInternalLearningAssets(input: {
  job: FoundationJob
  sourceBundle: unknown
  coverageModel: unknown
  courseKnowledgeModel: unknown
  independentReview: unknown
  remediationTargets: unknown[]
  workers: FoundationInternalLearningRemediationWorkers
  now: string
  assetIdPrefix?: string
}) {
  const job = foundationJobSchema.parse(input.job)
  const sourceBundle = foundationInternalLearningAssetBundleSchema.parse(input.sourceBundle)
  const coverage = foundationCoverageModelSchema.parse(input.coverageModel)
  const knowledgeModel = courseKnowledgeModelSchema.parse(input.courseKnowledgeModel)
  const independentReview = foundationInternalLearningIndependentReviewSchema.parse(input.independentReview)
  const remediationTargets = input.remediationTargets.map((target) => foundationInternalLearningRemediationTargetSchema.parse(target))
  const candidate = job.candidate ?? job.approvedFoundation?.candidate
  if (!candidate) throw new Error('Foundation Candidate is required for targeted learner-asset remediation')
  if (sourceBundle.planningContractVersion !== 'course-learning-blueprint-v2') {
    throw new Error('Targeted learner-asset remediation requires Course Learning Blueprint v2 source bundle')
  }

  const foundationFingerprint = await computeFoundationFingerprint(candidate)
  if (sourceBundle.foundationFingerprint !== foundationFingerprint || independentReview.foundationFingerprint !== foundationFingerprint) {
    throw new Error('Targeted remediation must remain bound to the exact Foundation fingerprint')
  }
  if (sourceBundle.foundationCandidateId !== candidate.candidateId || independentReview.foundationCandidateId !== candidate.candidateId) {
    throw new Error('Targeted remediation must remain bound to the exact Foundation Candidate')
  }
  if (sourceBundle.coverageModelFingerprint !== candidate.coverageModel.fingerprint) {
    throw new Error('Targeted remediation source bundle Coverage Model fingerprint does not match the Candidate')
  }
  if (sourceBundle.knowledgeModelFingerprint !== candidate.courseKnowledgeModel.fingerprint || knowledgeModel.fingerprint !== candidate.courseKnowledgeModel.fingerprint) {
    throw new Error('Targeted remediation Course Knowledge Model fingerprint does not match the Candidate')
  }
  if (coverage.jobId !== job.jobId || knowledgeModel.jobId !== job.jobId) {
    throw new Error('Targeted remediation inputs must belong to the exact Foundation job')
  }

  const sourceBundleFingerprint = await fingerprintValue(sourceBundle)
  if (independentReview.sourceBundleFingerprint !== sourceBundleFingerprint) {
    throw new Error('Targeted remediation review does not cover the exact retained source bundle')
  }
  if (independentReview.decision === 'pass') {
    throw new Error('A passing learner-asset review does not require targeted remediation')
  }

  const expectedPlans = planFoundationInternalLearningWorkUnits(
    { coverageModel: coverage, courseKnowledgeModel: knowledgeModel },
    { plannerVersion: 2 },
  )
  if (!sameValue(expectedPlans, sourceBundle.workUnits.map((workUnit) => workUnit.plan))) {
    throw new Error('Targeted remediation source bundle no longer matches the deterministic Foundation plan')
  }

  const { grouped, findingMap, expectedFindingIds } = groupedTargets({ independentReview, remediationTargets })
  for (const workUnitId of grouped.keys()) {
    if (!sourceBundle.workUnits.some((workUnit) => workUnit.plan.id === workUnitId)) {
      throw new Error(`Targeted remediation references unknown work unit ${workUnitId}`)
    }
  }

  const remediationContextIds: string[] = []
  const newWorkUnits: FoundationInternalLearningAssetBundle['workUnits'] = []
  const recordTargets: Array<{ workUnitId: string; assetKind: 'learn' | 'practice'; findingIds: string[] }> = []
  let learnChanged = false
  let practiceChanged = false

  for (const sourceWorkUnit of sourceBundle.workUnits) {
    const target = grouped.get(sourceWorkUnit.plan.id)
    if (!target) {
      newWorkUnits.push(sourceWorkUnit)
      continue
    }

    const knowledgeNodes = sourceWorkUnit.plan.knowledgeNodeIds.map((nodeId) => {
      const node = knowledgeModel.nodes.find((candidateNode) => candidateNode.id === nodeId)
      if (!node) throw new Error(`Missing Course Truth node ${nodeId}`)
      return safeNode(node)
    })

    let learning = sourceWorkUnit.learning
    let practice = sourceWorkUnit.practice

    if (target.learn.size > 0) {
      const findingIds = [...target.learn].sort()
      const execution = await input.workers.remediateLearningCollateral({
        jobId: job.jobId,
        courseIdentity: sourceBundle.courseIdentity,
        workUnit: sourceWorkUnit.plan,
        knowledgeModelFingerprint: sourceBundle.knowledgeModelFingerprint,
        requiredTeachingPoints: sourceWorkUnit.plan.requiredTeachingPoints,
        knowledgeNodes,
        previousOutput: sourceWorkUnit.learning,
        findings: findingIds.map((findingId) => findingMap.get(findingId)!),
      })
      if (execution.status !== 'success') {
        throw new Error(`Foundation Learn remediation failed for ${sourceWorkUnit.plan.id}: ${execution.error}`)
      }
      remediationContextIds.push(...executionContextIds(execution.provenance))
      learning = validateLearning(execution.output, sourceWorkUnit.plan)
      learnChanged = true
      recordTargets.push({ workUnitId: sourceWorkUnit.plan.id, assetKind: 'learn', findingIds })
    }

    if (target.practice.size > 0) {
      const findingIds = [...target.practice].sort()
      const execution = await input.workers.remediatePracticeCollateral({
        jobId: job.jobId,
        courseIdentity: sourceBundle.courseIdentity,
        workUnit: sourceWorkUnit.plan,
        knowledgeModelFingerprint: sourceBundle.knowledgeModelFingerprint,
        requiredTeachingPoints: sourceWorkUnit.plan.requiredTeachingPoints,
        knowledgeNodes,
        previousOutput: sourceWorkUnit.practice,
        findings: findingIds.map((findingId) => findingMap.get(findingId)!),
      })
      if (execution.status !== 'success') {
        throw new Error(`Foundation Practice remediation failed for ${sourceWorkUnit.plan.id}: ${execution.error}`)
      }
      remediationContextIds.push(...executionContextIds(execution.provenance))
      practice = validatePractice(execution.output, sourceWorkUnit.plan)
      practiceChanged = true
      recordTargets.push({ workUnitId: sourceWorkUnit.plan.id, assetKind: 'practice', findingIds })
    }

    newWorkUnits.push({ plan: sourceWorkUnit.plan, learning, practice })
  }

  const sourceReviewFingerprint = await fingerprintValue(independentReview)
  const forbiddenContexts = unique([
    ...candidateContextIds(job),
    ...sourceBundle.generationContextIds,
    ...independentReview.reviewerContextIds,
  ])
  assertFreshRemediationContexts({ contextIds: remediationContextIds, forbiddenContextIds: forbiddenContexts })

  const prefix = input.assetIdPrefix ?? `${candidate.candidateId}-remediation`
  const learnAsset = learnChanged
    ? await createFoundationDerivedAsset({ job, assetId: `${prefix}-learn`, assetKind: 'learn', createdAt: input.now })
    : sourceBundle.learnAsset
  const practiceAsset = practiceChanged
    ? await createFoundationDerivedAsset({ job, assetId: `${prefix}-practice`, assetKind: 'practice', createdAt: input.now })
    : sourceBundle.practiceAsset

  const bundle = foundationInternalLearningAssetBundleSchema.parse({
    ...sourceBundle,
    learnAsset,
    practiceAsset,
    generationContextIds: unique([...sourceBundle.generationContextIds, ...remediationContextIds]),
    workUnits: newWorkUnits,
    createdAt: input.now,
  })
  const resultBundleFingerprint = await fingerprintValue(bundle)

  const remediationRecord = foundationInternalLearningRemediationRecordSchema.parse({
    schemaVersion: 1,
    artifactType: 'foundation_internal_learning_remediation_record',
    foundationFingerprint,
    foundationCandidateId: candidate.candidateId,
    sourceBundleFingerprint,
    resultBundleFingerprint,
    sourceReviewFingerprint,
    addressedFindingIds: expectedFindingIds,
    remediationContextIds: unique(remediationContextIds),
    priorReviewerContextIds: independentReview.reviewerContextIds,
    targets: recordTargets,
    createdAt: input.now,
  })

  return { bundle, remediationRecord }
}
