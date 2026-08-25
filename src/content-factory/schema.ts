import { z } from 'zod'

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const nonEmptyStringSchema = z.string().min(1)
const commitShaSchema = z.string().regex(/^[0-9a-f]{40}$/)

export const contentFactorySchemaVersionSchema = z.union([z.literal(1), z.literal(2)])

export const contentFactoryActiveStateSchema = z.enum([
  'requested',
  'identified',
  'sourced',
  'mapped',
  'generating',
  'validating',
  'independent_review',
  'remediation',
  'expert_review_packaging',
  'expert_review_ready',
  'human_review',
  'benchmark_approved',
  'ci_verification',
  'ready_for_founder_merge_approval',
  'merged',
  'deployment_verification',
  'pilot_live',
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

export const sourceUseClassSchema = z.enum([
  'OPEN',
  'REVISION_OWNED',
  'LICENSED',
  'REFERENCE_ONLY',
  'PROHIBITED',
  'UNKNOWN',
])

export const sourceRightsStatusSchema = z.enum(['pending', 'approved', 'blocked'])

export const sourceLicenceRecordSchema = z.object({
  id: identifierSchema,
  issuer: nonEmptyStringSchema,
  urlOrReference: nonEmptyStringSchema,
  sourceType: sourceTypeSchema,
  educationalRole: z.array(nonEmptyStringSchema).min(1),
  versionOrDate: nonEmptyStringSchema.optional(),
  useClass: sourceUseClassSchema,
  permissionBasis: nonEmptyStringSchema,
  aiInputPermitted: z.boolean(),
  derivedCommercialUsePermitted: z.boolean(),
  attributionRequirements: z.array(nonEmptyStringSchema).default([]),
  restrictions: z.array(nonEmptyStringSchema).default([]),
  checkedAt: nonEmptyStringSchema,
  checkerMethod: nonEmptyStringSchema,
  sourceFingerprint: nonEmptyStringSchema,
  revalidationConditions: z.array(nonEmptyStringSchema).default([]),
}).superRefine((source, context) => {
  if (['PROHIBITED', 'UNKNOWN'].includes(source.useClass) && (source.aiInputPermitted || source.derivedCommercialUsePermitted)) {
    context.addIssue({
      code: 'custom',
      path: ['useClass'],
      message: `${source.useClass} sources cannot permit AI input or derived commercial use`,
    })
  }

  if (source.useClass === 'REFERENCE_ONLY' && source.aiInputPermitted) {
    context.addIssue({
      code: 'custom',
      path: ['aiInputPermitted'],
      message: 'REFERENCE_ONLY source text cannot enter generative AI context',
    })
  }
})

export const sourceLicenceRegisterSchema = z.object({
  schemaVersion: z.literal(2),
  jobId: identifierSchema,
  fingerprint: nonEmptyStringSchema,
  checkedAt: nonEmptyStringSchema,
  sources: z.array(sourceLicenceRecordSchema).min(1),
}).superRefine((register, context) => {
  const ids = new Set<string>()
  register.sources.forEach((source, index) => {
    if (ids.has(source.id)) {
      context.addIssue({
        code: 'custom',
        path: ['sources', index, 'id'],
        message: `Duplicate source licence id: ${source.id}`,
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

export const boardAlignmentSchema = z.object({
  schemaVersion: z.literal(1),
  jobId: identifierSchema,
  fingerprint: nonEmptyStringSchema,
  courseIdentity: courseIdentitySchema,
  cohortValidity: cohortValiditySchema,
  components: z.array(courseComponentSchema).min(1),
  assessmentObjectives: z.array(z.object({
    id: identifierSchema,
    name: nonEmptyStringSchema,
    weightingPercent: z.number().nonnegative().max(100).optional(),
    sourceRefs: z.array(identifierSchema).min(1),
  })).default([]),
  assessmentRequirements: z.array(z.object({
    id: identifierSchema,
    summary: nonEmptyStringSchema,
    componentScope: z.array(identifierSchema).default([]),
    sourceRefs: z.array(identifierSchema).min(1),
  })).default([]),
  sourceRefs: z.array(identifierSchema).min(1),
  verificationStatus: z.enum(['pending', 'verified', 'blocked']),
})

export const courseKnowledgeNodeSchema = z.object({
  id: identifierSchema,
  kind: z.enum(['concept', 'skill', 'formula']),
  summary: nonEmptyStringSchema,
  prerequisiteIds: z.array(identifierSchema).default([]),
  relatedIds: z.array(identifierSchema).default([]),
  formulas: z.array(nonEmptyStringSchema).default([]),
  misconceptions: z.array(nonEmptyStringSchema).default([]),
  applicationContexts: z.array(nonEmptyStringSchema).default([]),
  depth: z.enum(['foundational', 'core', 'advanced']).default('core'),
  sourceRefs: z.array(identifierSchema).min(1),
  boardAlignmentRefs: z.array(identifierSchema).default([]),
  evidenceTypes: z.array(nonEmptyStringSchema).min(1),
})

export const courseKnowledgeModelSchema = z.object({
  schemaVersion: z.literal(1),
  jobId: identifierSchema,
  fingerprint: nonEmptyStringSchema,
  nodes: z.array(courseKnowledgeNodeSchema).min(1),
}).superRefine((model, context) => {
  const ids = new Set(model.nodes.map((node) => node.id))
  model.nodes.forEach((node, index) => {
    for (const ref of [...node.prerequisiteIds, ...node.relatedIds]) {
      if (!ids.has(ref)) {
        context.addIssue({
          code: 'custom',
          path: ['nodes', index],
          message: `Knowledge node ${node.id} references unknown node ${ref}`,
        })
      }
    }
  })
})

export const learningModeSchema = z.enum([
  'explanation',
  'worked_example',
  'retrieval',
  'flashcard',
  'short_answer',
  'application',
  'quantitative',
  'exam_practice',
])

export const learningBlueprintSchema = z.object({
  schemaVersion: z.literal(1),
  jobId: identifierSchema,
  knowledgeModelFingerprint: nonEmptyStringSchema,
  workUnits: z.array(z.object({
    id: identifierSchema,
    title: nonEmptyStringSchema,
    knowledgeNodeIds: z.array(identifierSchema).min(1),
    learningModes: z.array(learningModeSchema).min(1),
    requiredOutputs: z.array(nonEmptyStringSchema).min(1),
  })).min(1),
})

export const assessmentBlueprintSchema = z.object({
  schemaVersion: z.literal(1),
  jobId: identifierSchema,
  fingerprint: nonEmptyStringSchema,
  boardAlignmentFingerprint: nonEmptyStringSchema,
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
  quantitativeRequirements: z.array(nonEmptyStringSchema).default([]),
  synopticRequirements: z.array(nonEmptyStringSchema).default([]),
})

export const questionFamilySchema = z.object({
  schemaVersion: z.literal(1),
  id: identifierSchema,
  title: nonEmptyStringSchema,
  assessmentObjectiveIds: z.array(identifierSchema).default([]),
  skillProfile: z.array(nonEmptyStringSchema).min(1),
  componentScope: z.array(identifierSchema).default([]),
  markRange: z.object({
    min: z.number().int().nonnegative(),
    max: z.number().int().positive(),
  }).refine((range) => range.max >= range.min, 'Question-family mark range is invalid'),
  responseShape: nonEmptyStringSchema,
  contextRequirements: z.array(nonEmptyStringSchema).default([]),
  applicationRequirements: z.array(nonEmptyStringSchema).default([]),
  analysisRequirements: z.array(nonEmptyStringSchema).default([]),
  evaluationRequirements: z.array(nonEmptyStringSchema).default([]),
  commonFailureModes: z.array(nonEmptyStringSchema).default([]),
  markingPackTemplateVersion: nonEmptyStringSchema,
  calibrationStatus: z.enum(['not_calibrated', 'pilot', 'human_calibrated']).default('not_calibrated'),
})

export const markingPackSchema = z.object({
  schemaVersion: z.literal(1),
  id: identifierSchema,
  questionId: identifierSchema,
  questionVersion: nonEmptyStringSchema,
  exactQuestionWording: nonEmptyStringSchema,
  contextRef: nonEmptyStringSchema.optional(),
  maxMark: z.number().int().positive(),
  conceptIds: z.array(identifierSchema).default([]),
  assessmentObjectiveAllocation: z.array(z.object({
    objectiveId: identifierSchema,
    marks: z.number().int().nonnegative().optional(),
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
  validReasoningRoutes: z.array(nonEmptyStringSchema).default([]),
  indicativeContent: z.array(nonEmptyStringSchema).default([]),
  misconceptions: z.array(nonEmptyStringSchema).default([]),
  anchors: z.array(z.object({
    id: identifierSchema,
    responseRef: nonEmptyStringSchema,
    expectedMarkMin: z.number().int().nonnegative(),
    expectedMarkMax: z.number().int().nonnegative(),
    calibrationStatus: z.enum(['synthetic', 'expert_calibrated']),
  })).default([]),
  diagnosticFeedbackRules: z.array(nonEmptyStringSchema).default([]),
  improvementActions: z.array(nonEmptyStringSchema).default([]),
  ambiguityPolicy: nonEmptyStringSchema,
  confidencePolicy: nonEmptyStringSchema,
  questionFamilyId: identifierSchema,
  assessmentBlueprintFingerprint: nonEmptyStringSchema,
  sourceRefs: z.array(identifierSchema).default([]),
  calibrationStatus: z.enum(['not_calibrated', 'pilot', 'human_calibrated']).default('not_calibrated'),
})

export const expertReviewFindingSchema = z.object({
  id: identifierSchema,
  severity: z.enum(['blocking', 'material', 'minor']),
  type: nonEmptyStringSchema,
  artifactRef: nonEmptyStringSchema,
  workUnitId: identifierSchema.optional(),
  finding: nonEmptyStringSchema,
  requiredCorrection: nonEmptyStringSchema,
  disposition: z.enum(['open', 'resolved', 'accepted']),
})

export const expertReviewContractSchema = z.object({
  schemaVersion: z.literal(1),
  jobId: identifierSchema,
  reviewedCommit: commitShaSchema,
  packageRef: nonEmptyStringSchema,
  artifactRefs: z.array(nonEmptyStringSchema).min(1),
  knownLimitations: z.array(nonEmptyStringSchema),
  decision: z.enum(['pending', 'pass', 'conditional_pass', 'fail']),
  findings: z.array(expertReviewFindingSchema).default([]),
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
    'source_rights',
    'board_alignment',
    'coverage',
    'knowledge_model',
    'learning_blueprint',
    'generation',
    'assessment_blueprint',
    'question_family',
    'marking_pack',
    'validation',
    'independent_review',
    'remediation',
    'expert_review_packaging',
    'expert_review_import',
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
  trigger: z.enum(['independent_review', 'expert_review']).default('independent_review'),
  status: z.enum(['pending', 'complete']),
  ref: nonEmptyStringSchema.optional(),
  correctedHeadSha: commitShaSchema.optional(),
})

export const expertReviewPackageResultSchema = z.object({
  status: z.enum(['pending', 'complete']),
  packageRef: nonEmptyStringSchema.optional(),
  contractRef: nonEmptyStringSchema.optional(),
  reviewedCommit: commitShaSchema.optional(),
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
  reviewedCommit: commitShaSchema.optional(),
  unresolvedBlocking: z.number().int().nonnegative().default(0),
  unresolvedMaterial: z.number().int().nonnegative().default(0),
})

export const blockerSchema = z.object({
  id: identifierSchema,
  stage: contentFactoryActiveStateSchema,
  reason: nonEmptyStringSchema,
  createdAt: nonEmptyStringSchema,
  resolvedAt: nonEmptyStringSchema.optional(),
})

export const markingPackCoverageSchema = z.object({
  assessmentItemId: identifierSchema,
  markingPackRef: nonEmptyStringSchema,
})

export const contentFactoryJobSchema = z.object({
  schemaVersion: contentFactorySchemaVersionSchema,
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
  sourceLicenceRegisterRef: nonEmptyStringSchema.optional(),
  sourceRightsStatus: sourceRightsStatusSchema.default('pending'),
  sourceSetFingerprint: nonEmptyStringSchema.optional(),
  coverageMapRef: nonEmptyStringSchema.optional(),
  coverageCompleteness: z.enum(['pending', 'complete', 'incomplete']).default('pending'),
  boardAlignmentRef: nonEmptyStringSchema.optional(),
  courseKnowledgeModelRef: nonEmptyStringSchema.optional(),
  learningBlueprintRef: nonEmptyStringSchema.optional(),
  assessmentBlueprintRef: nonEmptyStringSchema.optional(),
  questionFamilyRefs: z.array(nonEmptyStringSchema).default([]),
  markableAssessmentItemIds: z.array(identifierSchema).default([]),
  markingPackCoverage: z.array(markingPackCoverageSchema).default([]),
  artifactCompatibilityStatus: z.enum(['pending', 'pass', 'fail']).default('pending'),
  knownLimitations: z.array(nonEmptyStringSchema).default([]),
  contentPackRefs: z.array(nonEmptyStringSchema).default([]),
  branch: nonEmptyStringSchema.optional(),
  pullRequest: z.number().int().positive().optional(),
  workUnits: z.array(workUnitSchema).default([]),
  workerRuns: z.array(workerRunSchema).default([]),
  validation: validationResultSchema.optional(),
  independentReview: independentReviewResultSchema.optional(),
  remediation: remediationResultSchema.optional(),
  expertReviewPackage: expertReviewPackageResultSchema.optional(),
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

  const markingPackItemIds = new Set<string>()
  job.markingPackCoverage.forEach((coverage, index) => {
    if (markingPackItemIds.has(coverage.assessmentItemId)) {
      context.addIssue({
        code: 'custom',
        path: ['markingPackCoverage', index, 'assessmentItemId'],
        message: `Duplicate Marking Pack coverage for ${coverage.assessmentItemId}`,
      })
    }
    markingPackItemIds.add(coverage.assessmentItemId)
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

export type ContentFactorySchemaVersion = z.infer<typeof contentFactorySchemaVersionSchema>
export type ContentFactoryActiveState = z.infer<typeof contentFactoryActiveStateSchema>
export type ContentFactoryState = z.infer<typeof contentFactoryStateSchema>
export type CourseIdentity = z.infer<typeof courseIdentitySchema>
export type SourceRegister = z.infer<typeof sourceRegisterSchema>
export type SourceLicenceRegister = z.infer<typeof sourceLicenceRegisterSchema>
export type BoardAlignment = z.infer<typeof boardAlignmentSchema>
export type CourseKnowledgeModel = z.infer<typeof courseKnowledgeModelSchema>
export type LearningBlueprint = z.infer<typeof learningBlueprintSchema>
export type AssessmentBlueprint = z.infer<typeof assessmentBlueprintSchema>
export type QuestionFamily = z.infer<typeof questionFamilySchema>
export type MarkingPack = z.infer<typeof markingPackSchema>
export type ExpertReviewContract = z.infer<typeof expertReviewContractSchema>
export type CoverageMap = z.infer<typeof coverageMapSchema>
export type ContentFactoryJob = z.infer<typeof contentFactoryJobSchema>
export type WorkUnit = z.infer<typeof workUnitSchema>
export type WorkerRun = z.infer<typeof workerRunSchema>
