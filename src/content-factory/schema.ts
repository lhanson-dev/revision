import { z } from 'zod'

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const nonEmptyStringSchema = z.string().min(1)
const commitShaSchema = z.string().regex(/^[0-9a-f]{40}$/)

export const contentFactoryActiveStateSchema = z.enum([
  'requested',
  'identified',
  'sourced',
  'mapped',
  'generating',
  'validating',
  'independent_review',
  'remediation',
  'ci_verification',
  'ready_for_founder_merge_approval',
  'merged',
  'deployment_verification',
  'pilot_live',
  'human_review',
  'benchmark_approved',
])

export const contentFactoryStateSchema = z.union([
  contentFactoryActiveStateSchema,
  z.literal('blocked'),
])

export const courseIdentitySchema = z.object({
  subject: nonEmptyStringSchema,
  qualification: nonEmptyStringSchema,
  awardingBody: nonEmptyStringSchema,
  specificationId: nonEmptyStringSchema,
})

export const cohortValiditySchema = z.object({
  status: z.enum(['current', 'outgoing', 'withdrawn', 'unknown']),
  firstAssessment: nonEmptyStringSchema.optional(),
  lastAssessment: nonEmptyStringSchema.optional(),
  notes: z.array(nonEmptyStringSchema).default([]),
})

export const courseComponentSchema = z.object({
  id: identifierSchema,
  name: nonEmptyStringSchema,
  compulsory: z.boolean(),
  marks: z.number().int().positive().optional(),
  durationMinutes: z.number().int().positive().optional(),
  weightingPercent: z.number().positive().max(100).optional(),
})

export const sourceTypeSchema = z.enum([
  'course_page',
  'specification',
  'subject_content',
  'assessment',
  'assessment_objectives',
  'quantitative_or_skills_annex',
  'specimen_paper',
  'past_paper',
  'mark_scheme',
  'examiner_report',
  'prescribed_material',
  'amendment_or_notice',
  'other_primary',
  'secondary_supplement',
])

export const sourceRecordSchema = z.object({
  id: identifierSchema,
  url: z.string().url(),
  title: nonEmptyStringSchema,
  issuingOrganisation: nonEmptyStringSchema,
  sourceType: sourceTypeSchema,
  versionOrDate: nonEmptyStringSchema.optional(),
  checkedAt: nonEmptyStringSchema,
  governs: z.array(nonEmptyStringSchema).min(1),
  currency: z.enum(['current', 'superseded', 'ambiguous']),
  limitations: z.array(nonEmptyStringSchema).default([]),
})

export const sourceRegisterSchema = z.object({
  schemaVersion: z.literal(1),
  jobId: identifierSchema,
  fingerprint: nonEmptyStringSchema,
  checkedAt: nonEmptyStringSchema,
  sources: z.array(sourceRecordSchema).min(1),
}).superRefine((register, context) => {
  const ids = new Set<string>()
  register.sources.forEach((source, index) => {
    if (ids.has(source.id)) {
      context.addIssue({
        code: 'custom',
        path: ['sources', index, 'id'],
        message: `Duplicate source id: ${source.id}`,
      })
    }
    ids.add(source.id)
  })
})

export const coverageStatusSchema = z.enum([
  'planned',
  'partial',
  'complete',
  'not_applicable',
  'deferred',
])

export const coverageRequirementSchema = z.object({
  requirementId: identifierSchema,
  officialReference: nonEmptyStringSchema,
  requirementSummary: nonEmptyStringSchema,
  skillsOrKnowledge: z.array(nonEmptyStringSchema).min(1),
  componentScope: z.array(identifierSchema),
  revisionArea: nonEmptyStringSchema,
  learnRequired: z.boolean(),
  practiceRequired: z.boolean(),
  examPrepRequired: z.boolean(),
  coverageStatus: coverageStatusSchema,
  contentRefs: z.array(nonEmptyStringSchema).default([]),
  sourceRefs: z.array(identifierSchema).min(1),
})

export const coverageMapSchema = z.object({
  schemaVersion: z.literal(1),
  jobId: identifierSchema,
  sourceSetFingerprint: nonEmptyStringSchema,
  requirements: z.array(coverageRequirementSchema).min(1),
}).superRefine((map, context) => {
  const ids = new Set<string>()
  map.requirements.forEach((requirement, index) => {
    if (ids.has(requirement.requirementId)) {
      context.addIssue({
        code: 'custom',
        path: ['requirements', index, 'requirementId'],
        message: `Duplicate coverage requirement id: ${requirement.requirementId}`,
      })
    }
    ids.add(requirement.requirementId)

    if (requirement.coverageStatus === 'complete' && requirement.contentRefs.length === 0) {
      context.addIssue({
        code: 'custom',
        path: ['requirements', index, 'contentRefs'],
        message: 'Complete coverage must reference at least one learner-content artifact',
      })
    }
  })
})

export const workUnitSchema = z.object({
  id: identifierSchema,
  title: nonEmptyStringSchema,
  requirementIds: z.array(identifierSchema).min(1),
  componentIds: z.array(identifierSchema).default([]),
  status: z.enum(['pending', 'in_progress', 'complete', 'failed']),
  outputRefs: z.array(nonEmptyStringSchema).default([]),
})

export const workerRunSchema = z.object({
  id: identifierSchema,
  stage: z.enum([
    'identity',
    'source',
    'coverage',
    'generation',
    'validation',
    'independent_review',
    'remediation',
    'ci',
    'deployment',
    'human_review',
  ]),
  contextId: nonEmptyStringSchema,
  contractVersion: nonEmptyStringSchema,
  provider: nonEmptyStringSchema.optional(),
  model: nonEmptyStringSchema.optional(),
  inputRefs: z.array(nonEmptyStringSchema).default([]),
  outputRefs: z.array(nonEmptyStringSchema).default([]),
  status: z.enum(['success', 'failure', 'infrastructure_failure']),
  retryCount: z.number().int().nonnegative().default(0),
  usageCost: z.number().nonnegative().optional(),
})

export const validationResultSchema = z.object({
  status: z.enum(['pending', 'pass', 'fail', 'infrastructure_failure']),
  ref: nonEmptyStringSchema.optional(),
  headSha: commitShaSchema.optional(),
})

export const independentReviewResultSchema = z.object({
  decision: z.enum(['pass', 'conditional_pass', 'fail_hold']),
  ref: nonEmptyStringSchema,
  reviewedCommit: commitShaSchema,
  reviewerWorkerRunId: identifierSchema,
  unresolvedBlocking: z.number().int().nonnegative(),
  unresolvedMaterial: z.number().int().nonnegative(),
})

export const remediationResultSchema = z.object({
  status: z.enum(['pending', 'complete']),
  ref: nonEmptyStringSchema.optional(),
  correctedHeadSha: commitShaSchema.optional(),
})

export const ciResultSchema = z.object({
  status: z.enum(['pending', 'pass', 'fail', 'infrastructure_failure']),
  runId: nonEmptyStringSchema.optional(),
  headSha: commitShaSchema.optional(),
})

export const mergeRecordSchema = z.object({
  founderApproved: z.boolean(),
  mergedCommit: commitShaSchema.optional(),
})

export const deploymentResultSchema = z.object({
  status: z.enum(['pending', 'pass', 'fail', 'infrastructure_failure']),
  ref: nonEmptyStringSchema.optional(),
  deployedCommit: commitShaSchema.optional(),
})

export const humanReviewResultSchema = z.object({
  status: z.enum(['not_required', 'pending', 'pass', 'conditional_pass', 'fail']),
  ref: nonEmptyStringSchema.optional(),
})

export const blockerSchema = z.object({
  id: identifierSchema,
  stage: contentFactoryActiveStateSchema,
  reason: nonEmptyStringSchema,
  createdAt: nonEmptyStringSchema,
  resolvedAt: nonEmptyStringSchema.optional(),
})

export const contentFactoryJobSchema = z.object({
  schemaVersion: z.literal(1),
  jobId: identifierSchema,
  officialUrls: z.array(z.string().url()).min(1),
  founderInstruction: nonEmptyStringSchema,
  state: contentFactoryStateSchema,
  blockedFromState: contentFactoryActiveStateSchema.optional(),
  courseIdentity: courseIdentitySchema.optional(),
  cohortValidity: cohortValiditySchema.optional(),
  components: z.array(courseComponentSchema).default([]),
  unresolvedChoices: z.array(nonEmptyStringSchema).default([]),
  sourceRegisterRef: nonEmptyStringSchema.optional(),
  sourceSetFingerprint: nonEmptyStringSchema.optional(),
  coverageMapRef: nonEmptyStringSchema.optional(),
  contentPackRefs: z.array(nonEmptyStringSchema).default([]),
  branch: nonEmptyStringSchema.optional(),
  pullRequest: z.number().int().positive().optional(),
  workUnits: z.array(workUnitSchema).default([]),
  workerRuns: z.array(workerRunSchema).default([]),
  validation: validationResultSchema.optional(),
  independentReview: independentReviewResultSchema.optional(),
  remediation: remediationResultSchema.optional(),
  ci: ciResultSchema.optional(),
  merge: mergeRecordSchema.optional(),
  deployment: deploymentResultSchema.optional(),
  humanReview: humanReviewResultSchema.optional(),
  blockers: z.array(blockerSchema).default([]),
  createdAt: nonEmptyStringSchema,
  updatedAt: nonEmptyStringSchema,
}).superRefine((job, context) => {
  const uniqueCollections = [
    ['components', job.components],
    ['workUnits', job.workUnits],
    ['workerRuns', job.workerRuns],
    ['blockers', job.blockers],
  ] as const

  uniqueCollections.forEach(([label, items]) => {
    const ids = new Set<string>()
    items.forEach((item, index) => {
      if (ids.has(item.id)) {
        context.addIssue({
          code: 'custom',
          path: [label, index, 'id'],
          message: `Duplicate ${label} id: ${item.id}`,
        })
      }
      ids.add(item.id)
    })
  })

  if (job.state === 'blocked') {
    if (!job.blockedFromState) {
      context.addIssue({ code: 'custom', path: ['blockedFromState'], message: 'Blocked jobs must record the state they were blocked from' })
    }
    if (!job.blockers.some((blocker) => !blocker.resolvedAt)) {
      context.addIssue({ code: 'custom', path: ['blockers'], message: 'Blocked jobs must contain an unresolved blocker' })
    }
  } else if (job.blockedFromState) {
    context.addIssue({ code: 'custom', path: ['blockedFromState'], message: 'Only blocked jobs may retain blockedFromState' })
  }
})

export type ContentFactoryActiveState = z.infer<typeof contentFactoryActiveStateSchema>
export type ContentFactoryState = z.infer<typeof contentFactoryStateSchema>
export type CourseIdentity = z.infer<typeof courseIdentitySchema>
export type SourceRegister = z.infer<typeof sourceRegisterSchema>
export type CoverageMap = z.infer<typeof coverageMapSchema>
export type ContentFactoryJob = z.infer<typeof contentFactoryJobSchema>
export type WorkUnit = z.infer<typeof workUnitSchema>
export type WorkerRun = z.infer<typeof workerRunSchema>
