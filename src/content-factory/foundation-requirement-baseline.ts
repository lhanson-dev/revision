import { z } from 'zod'

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const nonEmptyStringSchema = z.string().min(1)

export const foundationRequirementDispositionSchema = z.enum([
  'required_course_truth',
  'required_exam_truth',
  'required_both',
  'explicit_boundary',
  'not_applicable',
])

export const foundationRequirementBaselineEntrySchema = z.object({
  obligationId: identifierSchema,
  officialReference: nonEmptyStringSchema,
  summary: nonEmptyStringSchema,
  disposition: foundationRequirementDispositionSchema,
  sourceRefs: z.array(identifierSchema).min(1),
  courseTruthNodeIds: z.array(identifierSchema).default([]),
  examTruthRefs: z.array(identifierSchema).default([]),
  boundary: nonEmptyStringSchema.optional(),
}).superRefine((entry, context) => {
  const courseRequired = ['required_course_truth', 'required_both'].includes(entry.disposition)
  const examRequired = ['required_exam_truth', 'required_both'].includes(entry.disposition)

  if (courseRequired && entry.courseTruthNodeIds.length === 0) {
    context.addIssue({ code: 'custom', path: ['courseTruthNodeIds'], message: `${entry.obligationId} requires Course Truth mapping` })
  }
  if (examRequired && entry.examTruthRefs.length === 0) {
    context.addIssue({ code: 'custom', path: ['examTruthRefs'], message: `${entry.obligationId} requires Exam Truth mapping` })
  }
  if (entry.disposition === 'explicit_boundary' && !entry.boundary) {
    context.addIssue({ code: 'custom', path: ['boundary'], message: `${entry.obligationId} requires an explicit specification boundary` })
  }
})

export const foundationRequirementBaselineSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('foundation_requirement_baseline'),
  courseKey: nonEmptyStringSchema,
  cohort: nonEmptyStringSchema,
  sourceSetFingerprint: nonEmptyStringSchema,
  entries: z.array(foundationRequirementBaselineEntrySchema).min(1),
}).superRefine((baseline, context) => {
  const seen = new Set<string>()
  baseline.entries.forEach((entry, index) => {
    if (seen.has(entry.obligationId)) {
      context.addIssue({ code: 'custom', path: ['entries', index, 'obligationId'], message: `Duplicate Foundation requirement obligation: ${entry.obligationId}` })
    }
    seen.add(entry.obligationId)
  })
})

export type FoundationRequirementBaseline = z.infer<typeof foundationRequirementBaselineSchema>

export function assertFoundationRequirementBaselineReconciliation(input: {
  baseline: FoundationRequirementBaseline
  courseTruthNodeIds: string[]
  examTruthRefs: string[]
}) {
  const baseline = foundationRequirementBaselineSchema.parse(input.baseline)
  const courseTruthNodeIds = new Set(input.courseTruthNodeIds)
  const examTruthRefs = new Set(input.examTruthRefs)
  const problems: string[] = []

  for (const entry of baseline.entries) {
    for (const nodeId of entry.courseTruthNodeIds) {
      if (!courseTruthNodeIds.has(nodeId)) problems.push(`${entry.obligationId}:missing_course_truth:${nodeId}`)
    }
    for (const examRef of entry.examTruthRefs) {
      if (!examTruthRefs.has(examRef)) problems.push(`${entry.obligationId}:missing_exam_truth:${examRef}`)
    }
  }

  if (problems.length > 0) {
    throw new Error(`foundation_requirement_baseline_incomplete:${problems.join(';')}`)
  }

  return { obligationCount: baseline.entries.length }
}
