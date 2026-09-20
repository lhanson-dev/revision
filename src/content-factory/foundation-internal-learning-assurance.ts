import { z } from 'zod'
import {
  foundationCoverageModelSchema,
  type FoundationWorkerExecution,
} from './foundation-compilation'
import {
  foundationDerivedAssetSchema,
  recordFoundationDerivedAssetAssurance,
} from './foundation-derived-asset'
import {
  foundationInternalLearningAssetBundleSchema,
  planFoundationInternalLearningWorkUnits,
  type FoundationInternalLearningAssetBundle,
} from './foundation-internal-learning-assets'
import { computeFoundationFingerprint } from './foundation-lifecycle'
import { foundationJobSchema } from './foundation-schema'
import { fingerprintValue } from './intake-to-knowledge-model'
import { courseKnowledgeModelSchema } from './schema'
import { validateTeachingPointEvidence } from './teaching-point-integrity'

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const nonEmptyStringSchema = z.string().min(1)
const sha256Schema = z.string().regex(/^[0-9a-f]{64}$/)

export const foundationInternalLearningAssuranceFindingSchema = z.object({
  id: identifierSchema,
  severity: z.enum(['blocking', 'material', 'minor', 'no_issue']),
  issueType: nonEmptyStringSchema,
  assetKind: z.enum(['learn', 'practice', 'both']),
  evidence: z.array(nonEmptyStringSchema).min(1),
  finding: nonEmptyStringSchema,
  recommendedCorrection: nonEmptyStringSchema,
  resolutionStatus: z.enum(['open', 'not_applicable']),
}).superRefine((finding, context) => {
  if (finding.severity === 'no_issue' && finding.resolutionStatus !== 'not_applicable') {
    context.addIssue({ code: 'custom', path: ['resolutionStatus'], message: 'No-issue findings must be not_applicable' })
  }
  if (finding.severity !== 'no_issue' && finding.resolutionStatus !== 'open') {
    context.addIssue({ code: 'custom', path: ['resolutionStatus'], message: 'Accuracy findings must remain open until remediated' })
  }
})

export const foundationInternalLearningWorkUnitReviewOutputSchema = z.object({
  foundationFingerprint: sha256Schema,
  foundationCandidateId: identifierSchema,
  sourceBundleFingerprint: sha256Schema,
  workUnitId: identifierSchema,
  workUnitFingerprint: sha256Schema,
  decision: z.enum(['pass', 'conditional_pass', 'fail_hold']),
  findings: z.array(foundationInternalLearningAssuranceFindingSchema).default([]),
}).superRefine((review, context) => {
  const openMaterial = review.findings.some((finding) => (
    finding.resolutionStatus === 'open' && ['blocking', 'material'].includes(finding.severity)
  ))
  const openMinor = review.findings.some((finding) => (
    finding.resolutionStatus === 'open' && finding.severity === 'minor'
  ))
  if (openMaterial && review.decision !== 'fail_hold') {
    context.addIssue({ code: 'custom', path: ['decision'], message: 'Blocking/material findings require fail_hold' })
  }
  if (!openMaterial && openMinor && review.decision !== 'conditional_pass') {
    context.addIssue({ code: 'custom', path: ['decision'], message: 'Open minor findings require conditional_pass' })
  }
  if (!openMaterial && !openMinor && review.decision !== 'pass') {
    context.addIssue({ code: 'custom', path: ['decision'], message: 'A clean review must return pass' })
  }
})

export const foundationInternalLearningDeterministicCheckSchema = z.object({
  checkId: identifierSchema,
  status: z.enum(['pass', 'fail']),
  message: nonEmptyStringSchema,
})

export const foundationInternalLearningDeterministicAssuranceSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('foundation_internal_learning_deterministic_assurance'),
  foundationFingerprint: sha256Schema,
  foundationCandidateId: identifierSchema,
  sourceBundleFingerprint: sha256Schema,
  decision: z.enum(['pass', 'fail']),
  checks: z.array(foundationInternalLearningDeterministicCheckSchema).min(1),
  createdAt: nonEmptyStringSchema,
})

const workUnitReviewRecordSchema = z.object({
  workUnitId: identifierSchema,
  workUnitFingerprint: sha256Schema,
  reviewerRunId: nonEmptyStringSchema,
  reviewerContextId: nonEmptyStringSchema,
  contractVersion: nonEmptyStringSchema,
  provider: nonEmptyStringSchema.optional(),
  model: nonEmptyStringSchema.optional(),
  retryCount: z.number().int().nonnegative().optional(),
  usageCost: z.number().nonnegative().optional(),
  decision: z.enum(['pass', 'conditional_pass', 'fail_hold']),
  findingIds: z.array(identifierSchema).default([]),
})

export const foundationInternalLearningIndependentReviewSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('foundation_internal_learning_independent_review'),
  foundationFingerprint: sha256Schema,
  foundationCandidateId: identifierSchema,
  sourceBundleFingerprint: sha256Schema,
  decision: z.enum(['pass', 'conditional_pass', 'fail_hold']),
  workUnitReviews: z.array(workUnitReviewRecordSchema).min(1),
  findings: z.array(foundationInternalLearningAssuranceFindingSchema).default([]),
  reviewerContextIds: z.array(nonEmptyStringSchema).min(1),
  createdAt: nonEmptyStringSchema,
})

export const foundationInternalLearningRemediationTargetSchema = z.object({
  workUnitId: identifierSchema,
  assetKind: z.enum(['learn', 'practice', 'both']),
  findingIds: z.array(identifierSchema).min(1),
})

export type FoundationInternalLearningAssuranceFinding = z.infer<typeof foundationInternalLearningAssuranceFindingSchema>
export type FoundationInternalLearningWorkUnitReviewOutput = z.infer<typeof foundationInternalLearningWorkUnitReviewOutputSchema>
export type FoundationInternalLearningDeterministicAssurance = z.infer<typeof foundationInternalLearningDeterministicAssuranceSchema>
export type FoundationInternalLearningIndependentReview = z.infer<typeof foundationInternalLearningIndependentReviewSchema>
export type FoundationInternalLearningRemediationTarget = z.infer<typeof foundationInternalLearningRemediationTargetSchema>

type BundleWorkUnit = FoundationInternalLearningAssetBundle['workUnits'][number]
type ParsedCoverage = z.infer<typeof foundationCoverageModelSchema>
type ParsedKnowledgeModel = z.infer<typeof courseKnowledgeModelSchema>
type ScopedFinding = FoundationInternalLearningAssuranceFinding & { workUnitId: string }

export interface FoundationInternalLearningAssuranceWorkers {
  independentReview(input: {
    jobId: string
    foundationFingerprint: string
    foundationCandidateId: string
    sourceBundleFingerprint: string
    courseIdentity: FoundationInternalLearningAssetBundle['courseIdentity']
    coverageModelFingerprint: string
    knowledgeModelFingerprint: string
    workUnitFingerprint: string
    plan: BundleWorkUnit['plan']
    coverageRequirements: ParsedCoverage['requirements']
    knowledgeNodes: ParsedKnowledgeModel['nodes']
    learning: BundleWorkUnit['learning']
    practice: BundleWorkUnit['practice']
  }): Promise<FoundationWorkerExecution<unknown>>
}

function failureMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

function unique(values: string[]) {
  return [...new Set(values)]
}

function validateWorkUnit(workUnit: BundleWorkUnit) {
  const plannedModes = new Set(workUnit.plan.learningModes.filter((mode) => (
    ['retrieval', 'flashcard', 'short_answer', 'application', 'quantitative'].includes(mode)
  )))
  const generatedModes = new Set(workUnit.practice.activities.map((activity) => activity.mode))

  if (workUnit.plan.learningModes.includes('explanation') && workUnit.learning.sections.length === 0) {
    throw new Error(`Learning work unit ${workUnit.plan.id} requires explanation sections`)
  }
  if (workUnit.plan.learningModes.includes('worked_example') && workUnit.learning.workedExamples.length === 0) {
    throw new Error(`Learning work unit ${workUnit.plan.id} requires a worked example`)
  }
  for (const mode of plannedModes) {
    if (!generatedModes.has(mode as 'retrieval' | 'flashcard' | 'short_answer' | 'application' | 'quantitative')) {
      throw new Error(`Practice work unit ${workUnit.plan.id} requires ${mode} activity`)
    }
  }
  for (const activity of workUnit.practice.activities) {
    if (!plannedModes.has(activity.mode)) {
      throw new Error(`Practice work unit ${workUnit.plan.id} generated unplanned mode ${activity.mode}`)
    }
  }

  validateTeachingPointEvidence({
    requiredTeachingPoints: workUnit.plan.requiredTeachingPoints,
    evidence: workUnit.learning.coverageEvidence,
    searchableContent: workUnit.learning,
    artifactLabel: `Foundation Learn work unit ${workUnit.plan.id}`,
  })
  validateTeachingPointEvidence({
    requiredTeachingPoints: workUnit.plan.requiredTeachingPoints,
    evidence: workUnit.practice.coverageEvidence,
    searchableContent: workUnit.practice,
    artifactLabel: `Foundation Practice work unit ${workUnit.plan.id}`,
  })
}

function sameValue(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function remediationTargets(findings: ScopedFinding[]) {
  const grouped = new Map<string, FoundationInternalLearningRemediationTarget>()
  for (const finding of findings) {
    if (finding.severity === 'no_issue' || finding.resolutionStatus !== 'open') continue
    const key = `${finding.workUnitId}:${finding.assetKind}`
    const existing = grouped.get(key)
    if (existing) {
      existing.findingIds = unique([...existing.findingIds, finding.id])
    } else {
      grouped.set(key, {
        workUnitId: finding.workUnitId,
        assetKind: finding.assetKind,
        findingIds: [finding.id],
      })
    }
  }
  return [...grouped.values()].map((target) => foundationInternalLearningRemediationTargetSchema.parse(target))
}

function foundationCandidateContexts(job: z.infer<typeof foundationJobSchema>) {
  const candidate = job.candidate ?? job.approvedFoundation?.candidate
  if (!candidate) return []
  return unique([
    ...candidate.provenance.generationContextIds,
    ...candidate.provenance.assuranceContextIds,
    ...(candidate.externalSourceChallenge ? [candidate.externalSourceChallenge.reviewerContextId] : []),
  ])
}

export async function runFoundationInternalLearningDeterministicAssurance(input: {
  job: unknown
  bundle: unknown
  coverageModel: unknown
  courseKnowledgeModel: unknown
  additionalForbiddenContextIds?: string[]
  now: string
}) {
  const job = foundationJobSchema.parse(input.job)
  const bundle = foundationInternalLearningAssetBundleSchema.parse(input.bundle)
  const coverage = foundationCoverageModelSchema.parse(input.coverageModel)
  const knowledgeModel = courseKnowledgeModelSchema.parse(input.courseKnowledgeModel)
  const candidate = job.candidate ?? job.approvedFoundation?.candidate
  if (!candidate) throw new Error('Foundation Candidate is required for internal learner asset assurance')

  const foundationFingerprint = await computeFoundationFingerprint(candidate)
  const sourceBundleFingerprint = await fingerprintValue(bundle)
  const checks: Array<z.infer<typeof foundationInternalLearningDeterministicCheckSchema>> = []
  const check = (checkId: string, action: () => void) => {
    try {
      action()
      checks.push({ checkId, status: 'pass', message: `${checkId} passed` })
    } catch (error) {
      checks.push({ checkId, status: 'fail', message: failureMessage(error) })
    }
  }

  check('foundation-state', () => {
    if (!['ai_assured', 'expert_review', 'foundation_approved'].includes(job.state)) {
      throw new Error(`Foundation state ${job.state} is not eligible for internal asset assurance`)
    }
  })
  check('foundation-identity', () => {
    if (bundle.foundationFingerprint !== foundationFingerprint) throw new Error('Generated bundle Foundation fingerprint does not match the exact Candidate')
    if (bundle.foundationCandidateId !== candidate.candidateId) throw new Error('Generated bundle Candidate does not match the exact Foundation Candidate')
  })
  check('foundation-artifact-fingerprints', () => {
    if (bundle.coverageModelFingerprint !== candidate.coverageModel.fingerprint) throw new Error('Generated bundle Coverage Model fingerprint does not match the Candidate')
    if (bundle.knowledgeModelFingerprint !== candidate.courseKnowledgeModel.fingerprint) throw new Error('Generated bundle Course Knowledge Model fingerprint does not match the Candidate')
    if (knowledgeModel.fingerprint !== bundle.knowledgeModelFingerprint) throw new Error('Supplied Course Knowledge Model fingerprint does not match the generated bundle')
    if (coverage.jobId !== job.jobId || knowledgeModel.jobId !== job.jobId) throw new Error('Assurance inputs must belong to the exact Foundation job')
  })
  check('deterministic-work-unit-plan', () => {
    const plannerVersion = bundle.planningContractVersion === 'course-learning-blueprint-v2' ? 2 : 1
    const expected = planFoundationInternalLearningWorkUnits(
      { coverageModel: coverage, courseKnowledgeModel: knowledgeModel },
      { plannerVersion },
    )
    const actual = bundle.workUnits.map((workUnit) => workUnit.plan)
    if (!sameValue(expected, actual)) throw new Error('Generated bundle work-unit plan does not match the deterministic Foundation plan')
  })
  check('generated-content-contracts', () => {
    for (const workUnit of bundle.workUnits) validateWorkUnit(workUnit)
  })
  check('generation-context-integrity', () => {
    const expectedContextCount = bundle.workUnits.length * 2
    if (bundle.generationContextIds.length !== expectedContextCount) {
      throw new Error(`Expected ${expectedContextCount} generation contexts, found ${bundle.generationContextIds.length}`)
    }
    if (new Set(bundle.generationContextIds).size !== bundle.generationContextIds.length) {
      throw new Error('Generation contexts must be unique across Learn and Practice calls')
    }
    const earlierContexts = new Set([
      ...foundationCandidateContexts(job),
      ...(input.additionalForbiddenContextIds ?? []),
    ])
    const collisions = bundle.generationContextIds.filter((contextId) => earlierContexts.has(contextId))
    if (collisions.length > 0) throw new Error(`Generation contexts collide with prior Foundation/assurance contexts: ${collisions.join(', ')}`)
  })
  check('generated-assets-pending', () => {
    if (bundle.learnAsset.assuranceStatus !== 'pending' || bundle.practiceAsset.assuranceStatus !== 'pending') {
      throw new Error('Generation proof must enter asset assurance with pending Learn and Practice assets')
    }
  })

  return foundationInternalLearningDeterministicAssuranceSchema.parse({
    schemaVersion: 1,
    artifactType: 'foundation_internal_learning_deterministic_assurance',
    foundationFingerprint,
    foundationCandidateId: candidate.candidateId,
    sourceBundleFingerprint,
    decision: checks.some((item) => item.status === 'fail') ? 'fail' : 'pass',
    checks,
    createdAt: input.now,
  })
}

export async function assureFoundationInternalLearningAssets(input: {
  job: unknown
  bundle: unknown
  coverageModel: unknown
  courseKnowledgeModel: unknown
  workers: FoundationInternalLearningAssuranceWorkers
  assuranceEvidenceRef: string
  additionalForbiddenContextIds?: string[]
  now: string
}) {
  const job = foundationJobSchema.parse(input.job)
  const bundle = foundationInternalLearningAssetBundleSchema.parse(input.bundle)
  const coverage = foundationCoverageModelSchema.parse(input.coverageModel)
  const knowledgeModel = courseKnowledgeModelSchema.parse(input.courseKnowledgeModel)
  const candidate = job.candidate ?? job.approvedFoundation?.candidate
  if (!candidate) throw new Error('Foundation Candidate is required for internal learner asset assurance')

  const deterministicAssurance = await runFoundationInternalLearningDeterministicAssurance({
    job,
    bundle,
    coverageModel: coverage,
    courseKnowledgeModel: knowledgeModel,
    additionalForbiddenContextIds: input.additionalForbiddenContextIds,
    now: input.now,
  })
  if (deterministicAssurance.decision !== 'pass') {
    return {
      status: 'fail_hold' as const,
      deterministicAssurance,
      independentReview: undefined,
      remediationTargets: [] as FoundationInternalLearningRemediationTarget[],
      assuredAssets: undefined,
    }
  }

  const forbiddenContexts = new Set([
    ...foundationCandidateContexts(job),
    ...bundle.generationContextIds,
    ...(input.additionalForbiddenContextIds ?? []),
  ])
  const reviewerContextIds = new Set<string>()
  const reviews: z.infer<typeof workUnitReviewRecordSchema>[] = []
  const findings: ScopedFinding[] = []

  for (const workUnit of bundle.workUnits) {
    const workUnitFingerprint = await fingerprintValue(workUnit)
    const requirementIds = new Set(workUnit.plan.requirementIds)
    const knowledgeNodeIds = new Set(workUnit.plan.knowledgeNodeIds)
    const execution = await input.workers.independentReview({
      jobId: job.jobId,
      foundationFingerprint: deterministicAssurance.foundationFingerprint,
      foundationCandidateId: candidate.candidateId,
      sourceBundleFingerprint: deterministicAssurance.sourceBundleFingerprint,
      courseIdentity: bundle.courseIdentity,
      coverageModelFingerprint: bundle.coverageModelFingerprint,
      knowledgeModelFingerprint: bundle.knowledgeModelFingerprint,
      workUnitFingerprint,
      plan: workUnit.plan,
      coverageRequirements: coverage.requirements.filter((requirement) => requirementIds.has(requirement.requirementId)),
      knowledgeNodes: knowledgeModel.nodes.filter((node) => knowledgeNodeIds.has(node.id)),
      learning: workUnit.learning,
      practice: workUnit.practice,
    })

    if (execution.status !== 'success') {
      throw new Error(`Independent asset review failed for ${workUnit.plan.id}: ${execution.error}`)
    }
    if (forbiddenContexts.has(execution.provenance.contextId) || reviewerContextIds.has(execution.provenance.contextId)) {
      throw new Error(`Independent asset review reused forbidden context ${execution.provenance.contextId}`)
    }
    reviewerContextIds.add(execution.provenance.contextId)

    const review = foundationInternalLearningWorkUnitReviewOutputSchema.parse(execution.output)
    if (review.foundationFingerprint !== deterministicAssurance.foundationFingerprint) throw new Error(`Independent review for ${workUnit.plan.id} covered the wrong Foundation fingerprint`)
    if (review.foundationCandidateId !== candidate.candidateId) throw new Error(`Independent review for ${workUnit.plan.id} covered the wrong Candidate`)
    if (review.sourceBundleFingerprint !== deterministicAssurance.sourceBundleFingerprint) throw new Error(`Independent review for ${workUnit.plan.id} covered the wrong generated bundle`)
    if (review.workUnitId !== workUnit.plan.id) throw new Error(`Independent review returned the wrong work unit for ${workUnit.plan.id}`)
    if (review.workUnitFingerprint !== workUnitFingerprint) throw new Error(`Independent review for ${workUnit.plan.id} covered the wrong work-unit fingerprint`)

    reviews.push({
      workUnitId: workUnit.plan.id,
      workUnitFingerprint,
      reviewerRunId: execution.provenance.id,
      reviewerContextId: execution.provenance.contextId,
      contractVersion: execution.provenance.contractVersion,
      provider: execution.provenance.provider,
      model: execution.provenance.model,
      retryCount: execution.provenance.retryCount,
      usageCost: execution.provenance.usageCost,
      decision: review.decision,
      findingIds: review.findings.map((finding) => finding.id),
    })
    findings.push(...review.findings.map((finding) => ({ ...finding, workUnitId: workUnit.plan.id })))
  }

  const findingIds = findings.map((finding) => finding.id)
  if (new Set(findingIds).size !== findingIds.length) {
    throw new Error('Independent asset assurance finding IDs must be unique across the retained bundle')
  }

  const decision = reviews.some((review) => review.decision === 'fail_hold')
    ? 'fail_hold'
    : reviews.some((review) => review.decision === 'conditional_pass')
      ? 'conditional_pass'
      : 'pass'

  const independentReview = foundationInternalLearningIndependentReviewSchema.parse({
    schemaVersion: 1,
    artifactType: 'foundation_internal_learning_independent_review',
    foundationFingerprint: deterministicAssurance.foundationFingerprint,
    foundationCandidateId: candidate.candidateId,
    sourceBundleFingerprint: deterministicAssurance.sourceBundleFingerprint,
    decision,
    workUnitReviews: reviews,
    findings: findings.map((finding) => foundationInternalLearningAssuranceFindingSchema.parse(finding)),
    reviewerContextIds: [...reviewerContextIds],
    createdAt: input.now,
  })
  const targets = remediationTargets(findings)

  if (decision !== 'pass') {
    return {
      status: decision,
      deterministicAssurance,
      independentReview,
      remediationTargets: targets,
      assuredAssets: undefined,
    }
  }

  const learnAsset = foundationDerivedAssetSchema.parse(recordFoundationDerivedAssetAssurance(
    bundle.learnAsset,
    [input.assuranceEvidenceRef],
  ))
  const practiceAsset = foundationDerivedAssetSchema.parse(recordFoundationDerivedAssetAssurance(
    bundle.practiceAsset,
    [input.assuranceEvidenceRef],
  ))

  return {
    status: 'pass' as const,
    deterministicAssurance,
    independentReview,
    remediationTargets: targets,
    assuredAssets: { learnAsset, practiceAsset },
  }
}
