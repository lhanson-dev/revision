import { z } from 'zod'

const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const nonEmptyStringSchema = z.string().min(1)
const commitShaSchema = z.string().regex(/^[0-9a-f]{40}$/)
const sha256Schema = z.string().regex(/^[0-9a-f]{64}$/)

export const foundationExternalSourceChallengeFindingSchema = z.object({
  id: identifierSchema,
  severity: z.enum(['blocking', 'material', 'minor']),
  issueType: z.enum(['source_universe', 'curriculum_scope', 'exam_scope', 'quantitative_truth', 'source_currency', 'factual_contradiction', 'other']),
  sourceRefs: z.array(identifierSchema).min(1),
  finding: nonEmptyStringSchema,
  requiredCorrection: nonEmptyStringSchema,
})

export const foundationExternalSourceChallengeReportSchema = z.object({
  schemaVersion: z.literal(1),
  artifactType: z.literal('foundation_external_source_challenge_report'),
  challengeId: identifierSchema,
  jobId: identifierSchema,
  candidateId: identifierSchema,
  reviewedCommit: commitShaSchema,
  foundationFingerprint: sha256Schema,
  sourceUniverseProfileId: identifierSchema,
  challengedSourceIds: z.array(identifierSchema).min(1),
  reviewerContextId: nonEmptyStringSchema,
  excludedContextIds: z.array(nonEmptyStringSchema).min(1),
  decision: z.enum(['pass', 'fail_hold']),
  findings: z.array(foundationExternalSourceChallengeFindingSchema).default([]),
  evidenceRefs: z.array(nonEmptyStringSchema).min(1),
  createdAt: nonEmptyStringSchema,
}).superRefine((report, context) => {
  const material = report.findings.some((finding) => ['blocking', 'material'].includes(finding.severity))
  if (material && report.decision !== 'fail_hold') {
    context.addIssue({ code: 'custom', path: ['decision'], message: 'Blocking/material external-source challenge findings require fail_hold' })
  }
  if (!material && report.decision !== 'pass') {
    context.addIssue({ code: 'custom', path: ['decision'], message: 'External-source challenge without blocking/material findings must pass' })
  }
  if (report.excludedContextIds.includes(report.reviewerContextId)) {
    context.addIssue({ code: 'custom', path: ['reviewerContextId'], message: 'External-source challenge must use a fresh context excluded from Foundation generation and assurance contexts' })
  }
  if (new Set(report.challengedSourceIds).size !== report.challengedSourceIds.length) {
    context.addIssue({ code: 'custom', path: ['challengedSourceIds'], message: 'External-source challenge source IDs must be unique' })
  }
})

export type FoundationExternalSourceChallengeReport = z.infer<typeof foundationExternalSourceChallengeReportSchema>

/**
 * The external-source challenge is intentionally different from ordinary Foundation review.
 * It assumes Revision's own requirement universe may be incomplete and independently challenges
 * the exact candidate against the current official-source universe before expert packaging.
 *
 * REFERENCE_ONLY source text is not made generative input by this contract. The report records
 * challenge evidence produced through an approved external browsing/reference-only process.
 */
export function validateFoundationExternalSourceChallenge(input: {
  report: unknown
  jobId: string
  candidateId: string
  reviewedCommit: string
  foundationFingerprint: string
  requiredSourceUniverseProfileId?: string
  requiredSourceIds?: string[]
  forbiddenContextIds: string[]
}) {
  const report = foundationExternalSourceChallengeReportSchema.parse(input.report)
  if (report.jobId !== input.jobId) throw new Error('External-source challenge does not match the Foundation job')
  if (report.candidateId !== input.candidateId) throw new Error('External-source challenge does not match the exact Foundation Candidate')
  if (report.reviewedCommit !== input.reviewedCommit) throw new Error('External-source challenge does not match the reviewed implementation commit')
  if (report.foundationFingerprint !== input.foundationFingerprint) throw new Error('External-source challenge is stale for the exact Foundation fingerprint')
  if (report.decision !== 'pass') throw new Error('Qualified expert review package requires a passing external-source challenge')
  if (input.requiredSourceUniverseProfileId && report.sourceUniverseProfileId !== input.requiredSourceUniverseProfileId) {
    throw new Error('External-source challenge used the wrong source-universe profile')
  }

  const forbidden = new Set(input.forbiddenContextIds)
  if (forbidden.has(report.reviewerContextId)) {
    throw new Error('External-source challenge reused a Foundation generation or assurance context')
  }
  for (const expected of input.forbiddenContextIds) {
    if (!report.excludedContextIds.includes(expected)) {
      throw new Error(`External-source challenge did not explicitly exclude prior context ${expected}`)
    }
  }

  if (input.requiredSourceIds) {
    const challenged = new Set(report.challengedSourceIds)
    for (const sourceId of input.requiredSourceIds) {
      if (!challenged.has(sourceId)) throw new Error(`External-source challenge omitted required source ${sourceId}`)
    }
  }
  return report
}
