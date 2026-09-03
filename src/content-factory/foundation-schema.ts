import { z } from 'zod'
import { cohortValiditySchema, courseIdentitySchema } from './schema'

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const nonEmptyStringSchema = z.string().min(1)
const commitShaSchema = z.string().regex(/^[0-9a-f]{40}$/)
const sha256Schema = z.string().regex(/^[0-9a-f]{64}$/)

export const foundationWorkingStateSchema = z.enum([
  'requested',
  'compiling',
  'assuring',
  'expert_review',
])

export const foundationStateSchema = z.union([
  foundationWorkingStateSchema,
  z.literal('foundation_approved'),
  z.literal('blocked'),
  z.literal('superseded'),
])

export const foundationArtifactRefSchema = z.object({
  ref: nonEmptyStringSchema,
  fingerprint: nonEmptyStringSchema,
})

export const foundationCandidateBlockerSchema = z.object({
  id: identifierSchema,
  reason: nonEmptyStringSchema,
})

export const foundationAssuranceResultSchema = z.object({
  status: z.enum(['pending', 'pass', 'fail']),
  foundationFingerprint: sha256Schema.optional(),
  evidenceRefs: z.array(nonEmptyStringSchema).default([]),
}).superRefine((result, context) => {
  if (result.status === 'pending') {
    if (result.foundationFingerprint) {
      context.addIssue({
        code: 'custom',
        path: ['foundationFingerprint'],
        message: 'Pending deterministic assurance must not claim a Foundation fingerprint',
      })
    }
    return
  }

  if (!result.foundationFingerprint) {
    context.addIssue({
      code: 'custom',
      path: ['foundationFingerprint'],
      message: 'Completed deterministic assurance must identify the exact Foundation fingerprint assessed',
    })
  }
  if (result.evidenceRefs.length === 0) {
    context.addIssue({
      code: 'custom',
      path: ['evidenceRefs'],
      message: 'Completed deterministic assurance must retain evidence',
    })
  }
})

export const foundationIndependentReviewResultSchema = z.object({
  status: z.enum(['pending', 'pass', 'fail_hold']),
  foundationFingerprint: sha256Schema.optional(),
  evidenceRefs: z.array(nonEmptyStringSchema).default([]),
}).superRefine((result, context) => {
  if (result.status === 'pending') {
    if (result.foundationFingerprint) {
      context.addIssue({
        code: 'custom',
        path: ['foundationFingerprint'],
        message: 'Pending independent review must not claim a Foundation fingerprint',
      })
    }
    return
  }

  if (!result.foundationFingerprint) {
    context.addIssue({
      code: 'custom',
      path: ['foundationFingerprint'],
      message: 'Completed independent review must identify the exact Foundation fingerprint assessed',
    })
  }
  if (result.evidenceRefs.length === 0) {
    context.addIssue({
      code: 'custom',
      path: ['evidenceRefs'],
      message: 'Completed independent review must retain evidence',
    })
  }
})

export const foundationCandidateSchema = z.object({
  schemaVersion: z.literal(1),
  candidateId: identifierSchema,
  courseIdentity: courseIdentitySchema,
  cohortValidity: cohortValiditySchema,
  sourceLicenceRegister: foundationArtifactRefSchema,
  sourceRightsStatus: z.literal('approved'),
  boardAlignment: foundationArtifactRefSchema,
  boardAlignmentStatus: z.literal('verified'),
  coverageModel: foundationArtifactRefSchema,
  coverageCompleteness: z.literal('complete'),
  courseKnowledgeModel: foundationArtifactRefSchema,
  courseTruthCompleteness: z.literal('complete'),
  assessmentBlueprint: foundationArtifactRefSchema,
  examTruthCompleteness: z.literal('complete'),
  questionFamilies: z.array(foundationArtifactRefSchema).default([]),
  deterministicAssurance: foundationAssuranceResultSchema,
  independentReview: foundationIndependentReviewResultSchema,
  unresolvedBlockers: z.array(foundationCandidateBlockerSchema).default([]),
  knownLimitations: z.array(nonEmptyStringSchema).default([]),
  provenance: z.object({
    createdAt: nonEmptyStringSchema,
    producerVersion: nonEmptyStringSchema,
    sourceSetFingerprint: nonEmptyStringSchema,
    implementationHeadSha: commitShaSchema.optional(),
    generationContextIds: z.array(nonEmptyStringSchema).default([]),
    assuranceContextIds: z.array(nonEmptyStringSchema).default([]),
  }),
}).superRefine((candidate, context) => {
  const questionFamilyRefs = new Set<string>()
  candidate.questionFamilies.forEach((family, index) => {
    if (questionFamilyRefs.has(family.ref)) {
      context.addIssue({
        code: 'custom',
        path: ['questionFamilies', index, 'ref'],
        message: `Duplicate Question Family reference: ${family.ref}`,
      })
    }
    questionFamilyRefs.add(family.ref)
  })

  const deterministicFingerprint = candidate.deterministicAssurance.foundationFingerprint
  const reviewFingerprint = candidate.independentReview.foundationFingerprint
  if (deterministicFingerprint && reviewFingerprint && deterministicFingerprint !== reviewFingerprint) {
    context.addIssue({
      code: 'custom',
      path: ['independentReview', 'foundationFingerprint'],
      message: 'Deterministic assurance and independent review must assess the same Foundation fingerprint',
    })
  }
})

export const foundationApprovalEvidenceSchema = z.object({
  reviewerId: nonEmptyStringSchema,
  approverId: nonEmptyStringSchema,
  foundationFingerprint: sha256Schema,
  reviewedAt: nonEmptyStringSchema,
  approvedAt: nonEmptyStringSchema,
  evidenceRefs: z.array(nonEmptyStringSchema).min(1),
})

export const approvedCourseFoundationSchema = z.object({
  schemaVersion: z.literal(1),
  foundationId: identifierSchema,
  foundationVersion: z.number().int().positive(),
  foundationFingerprint: sha256Schema,
  candidate: foundationCandidateSchema,
  approval: foundationApprovalEvidenceSchema,
  knownLimitations: z.array(nonEmptyStringSchema).default([]),
}).superRefine((foundation, context) => {
  if (foundation.candidate.deterministicAssurance.status !== 'pass') {
    context.addIssue({
      code: 'custom',
      path: ['candidate', 'deterministicAssurance', 'status'],
      message: 'Approved Course Foundation requires passing deterministic assurance',
    })
  }
  if (foundation.candidate.independentReview.status !== 'pass') {
    context.addIssue({
      code: 'custom',
      path: ['candidate', 'independentReview', 'status'],
      message: 'Approved Course Foundation requires passing independent review',
    })
  }
  if (foundation.candidate.unresolvedBlockers.length > 0) {
    context.addIssue({
      code: 'custom',
      path: ['candidate', 'unresolvedBlockers'],
      message: 'Approved Course Foundation cannot retain unresolved candidate blockers',
    })
  }
  if (foundation.candidate.deterministicAssurance.foundationFingerprint !== foundation.foundationFingerprint) {
    context.addIssue({
      code: 'custom',
      path: ['candidate', 'deterministicAssurance', 'foundationFingerprint'],
      message: 'Deterministic assurance must be bound to the exact approved Foundation fingerprint',
    })
  }
  if (foundation.candidate.independentReview.foundationFingerprint !== foundation.foundationFingerprint) {
    context.addIssue({
      code: 'custom',
      path: ['candidate', 'independentReview', 'foundationFingerprint'],
      message: 'Independent review must be bound to the exact approved Foundation fingerprint',
    })
  }
  if (foundation.approval.foundationFingerprint !== foundation.foundationFingerprint) {
    context.addIssue({
      code: 'custom',
      path: ['approval', 'foundationFingerprint'],
      message: 'Qualified approval evidence must be bound to the exact approved Foundation fingerprint',
    })
  }
})

export const foundationOperationalBlockerSchema = z.object({
  id: identifierSchema,
  reason: nonEmptyStringSchema,
  stage: foundationWorkingStateSchema,
  createdAt: nonEmptyStringSchema,
  resolvedAt: nonEmptyStringSchema.optional(),
})

export const foundationJobSchema = z.object({
  schemaVersion: z.literal(1),
  jobId: identifierSchema,
  state: foundationStateSchema,
  blockedFromState: foundationWorkingStateSchema.optional(),
  candidate: foundationCandidateSchema.optional(),
  approvedFoundation: approvedCourseFoundationSchema.optional(),
  blockers: z.array(foundationOperationalBlockerSchema).default([]),
  createdAt: nonEmptyStringSchema,
  updatedAt: nonEmptyStringSchema,
}).superRefine((job, context) => {
  const unresolvedOperationalBlockers = job.blockers.filter((blocker) => !blocker.resolvedAt)

  if (job.state === 'blocked') {
    if (!job.blockedFromState) {
      context.addIssue({
        code: 'custom',
        path: ['blockedFromState'],
        message: 'Blocked Foundation jobs must record the state they were blocked from',
      })
    }
    if (unresolvedOperationalBlockers.length === 0) {
      context.addIssue({
        code: 'custom',
        path: ['blockers'],
        message: 'Blocked Foundation jobs must retain at least one unresolved blocker',
      })
    }
  } else if (job.blockedFromState) {
    context.addIssue({
      code: 'custom',
      path: ['blockedFromState'],
      message: 'Only blocked Foundation jobs may retain blockedFromState',
    })
  }

  if (['assuring', 'expert_review'].includes(job.state) && !job.candidate) {
    context.addIssue({
      code: 'custom',
      path: ['candidate'],
      message: `Foundation state ${job.state} requires a complete Foundation Candidate`,
    })
  }

  if (job.state === 'expert_review' && job.candidate) {
    if (job.candidate.deterministicAssurance.status !== 'pass') {
      context.addIssue({
        code: 'custom',
        path: ['candidate', 'deterministicAssurance', 'status'],
        message: 'expert_review requires passing deterministic Foundation assurance',
      })
    }
    if (job.candidate.independentReview.status !== 'pass') {
      context.addIssue({
        code: 'custom',
        path: ['candidate', 'independentReview', 'status'],
        message: 'expert_review requires passing independent Foundation review',
      })
    }
    if (job.candidate.unresolvedBlockers.length > 0) {
      context.addIssue({
        code: 'custom',
        path: ['candidate', 'unresolvedBlockers'],
        message: 'expert_review cannot start with unresolved candidate blockers',
      })
    }
  }

  if (job.state === 'foundation_approved') {
    if (!job.approvedFoundation) {
      context.addIssue({
        code: 'custom',
        path: ['approvedFoundation'],
        message: 'foundation_approved requires an Approved Course Foundation',
      })
    }
    if (job.candidate) {
      context.addIssue({
        code: 'custom',
        path: ['candidate'],
        message: 'foundation_approved freezes the candidate only inside Approved Course Foundation',
      })
    }
  }

  if (job.approvedFoundation && !['foundation_approved', 'superseded'].includes(job.state)) {
    context.addIssue({
      code: 'custom',
      path: ['approvedFoundation'],
      message: 'Approved Course Foundation may exist only in foundation_approved or superseded state',
    })
  }
})

export type FoundationWorkingState = z.infer<typeof foundationWorkingStateSchema>
export type FoundationState = z.infer<typeof foundationStateSchema>
export type FoundationArtifactRef = z.infer<typeof foundationArtifactRefSchema>
export type FoundationCandidate = z.infer<typeof foundationCandidateSchema>
export type FoundationApprovalEvidence = z.infer<typeof foundationApprovalEvidenceSchema>
export type ApprovedCourseFoundation = z.infer<typeof approvedCourseFoundationSchema>
export type FoundationJob = z.infer<typeof foundationJobSchema>
