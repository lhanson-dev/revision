import { z } from 'zod'
import {
  courseKnowledgeModelSchema,
  courseKnowledgeNodeSchema,
  questionFamilySchema,
} from './schema'
import {
  foundationAssessmentBlueprintSchema,
  fingerprintFoundationArtifact,
  type FoundationWorkerExecution,
} from './foundation-compilation'
import type { FoundationStructuredProviderClient } from './foundation-live-adapter'
import {
  foundationIndependentReviewFindingSchema,
  foundationIndependentReviewWorkerContracts,
  type FoundationIndependentReviewWorkers,
} from './foundation-independent-review'

const nonEmptyStringSchema = z.string().min(1)
const identifierSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9._-]*$/)
const commitShaSchema = z.string().regex(/^[0-9a-f]{40}$/)
const sha256Schema = z.string().regex(/^[0-9a-f]{64}$/)

const foundationIndependentReviewProviderOutputSchema = z.object({
  reviewedCommit: commitShaSchema,
  foundationFingerprint: sha256Schema,
  decision: z.enum(['pass', 'fail_hold']),
  findings: z.array(foundationIndependentReviewFindingSchema).default([]),
})

const remediationCourseKnowledgeModelProviderSchema = z.object({
  schemaVersion: z.literal(1),
  jobId: identifierSchema,
  nodes: z.array(courseKnowledgeNodeSchema).min(1),
})

const remediationAssessmentBlueprintProviderSchema = foundationAssessmentBlueprintSchema.omit({
  boardAlignmentFingerprint: true,
  courseKnowledgeModelFingerprint: true,
})

const foundationRemediationProviderOutputSchema = z.object({
  resolvedFindingIds: z.array(identifierSchema).min(1),
  resolutionNotes: z.array(nonEmptyStringSchema).min(1),
  replacements: z.array(z.discriminatedUnion('artifactKind', [
    z.object({
      artifactKind: z.literal('course_knowledge_model'),
      oldRef: nonEmptyStringSchema,
      correctedArtifact: remediationCourseKnowledgeModelProviderSchema,
    }),
    z.object({
      artifactKind: z.literal('assessment_blueprint'),
      oldRef: nonEmptyStringSchema,
      correctedArtifact: remediationAssessmentBlueprintProviderSchema,
    }),
    z.object({
      artifactKind: z.literal('question_family'),
      oldRef: nonEmptyStringSchema,
      correctedArtifact: questionFamilySchema,
    }),
  ])).min(1),
})

function normaliseExecution(execution: Awaited<ReturnType<FoundationStructuredProviderClient['run']>>): FoundationWorkerExecution<unknown> {
  return execution
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

async function normaliseRemediationOutput(
  providerOutput: unknown,
  remediationInput: Parameters<FoundationIndependentReviewWorkers['remediate']>[0],
) {
  const parsed = foundationRemediationProviderOutputSchema.parse(providerOutput)
  const courseReplacement = parsed.replacements.find((replacement) => replacement.artifactKind === 'course_knowledge_model')
  const hasAssessmentBlueprintReplacement = parsed.replacements.some((replacement) => replacement.artifactKind === 'assessment_blueprint')
  let courseKnowledgeModelFingerprint: string | undefined

  if (courseReplacement?.artifactKind === 'course_knowledge_model') {
    courseKnowledgeModelFingerprint = await fingerprintFoundationArtifact(courseReplacement.correctedArtifact)
  } else if (hasAssessmentBlueprintReplacement) {
    courseKnowledgeModelFingerprint = remediationInput.courseKnowledgeModel.fingerprint
  }

  const replacements = await Promise.all(parsed.replacements.map(async (replacement) => {
    if (replacement.artifactKind === 'course_knowledge_model') {
      const fingerprint = await fingerprintFoundationArtifact(replacement.correctedArtifact)
      return {
        ...replacement,
        correctedArtifact: courseKnowledgeModelSchema.parse({
          ...replacement.correctedArtifact,
          fingerprint,
        }),
      }
    }

    if (replacement.artifactKind === 'assessment_blueprint') {
      if (!courseKnowledgeModelFingerprint) {
        throw new Error('Assessment Blueprint remediation requires a Course Truth fingerprint')
      }
      return {
        ...replacement,
        correctedArtifact: foundationAssessmentBlueprintSchema.parse({
          ...replacement.correctedArtifact,
          boardAlignmentFingerprint: remediationInput.boardAlignment.fingerprint,
          courseKnowledgeModelFingerprint,
        }),
      }
    }

    return {
      ...replacement,
      correctedArtifact: questionFamilySchema.parse(replacement.correctedArtifact),
    }
  }))

  return { ...parsed, replacements }
}

export function createFoundationIndependentReviewLiveWorkers(input: {
  provider: FoundationStructuredProviderClient
}): FoundationIndependentReviewWorkers {
  return {
    async independentReview(reviewInput) {
      const execution = await input.provider.run({
        workerId: foundationIndependentReviewWorkerContracts.independentReview.workerId,
        contractVersion: foundationIndependentReviewWorkerContracts.independentReview.contractVersion,
        routeKind: 'independent_review',
        outputSchema: foundationIndependentReviewProviderOutputSchema,
        instructions: [
          'Act as an independent educational and assessment reviewer of the exact Foundation Candidate supplied.',
          'Do not rewrite for style and do not repeat deterministic schema checks unless they expose an educational consequence.',
          'Challenge conceptual correctness, curriculum sufficiency, depth, misconceptions, assessment authenticity, component fit, command demand, mark/timing realism and Question Family suitability.',
          'Use only the supplied structured Foundation artifacts and rights-safe source metadata. Do not browse or reconstruct awarding-body prose.',
          'Every finding must use an artifactRef and artifactKind exactly as supplied in artifactIndex.',
          'Severity: blocking means progression is unsafe; material means educational/assessment truth requires correction; minor means non-blocking precision/limitation; no_issue is optional and not required for clean artifacts.',
          'Return fail_hold when any blocking or material finding exists; otherwise return pass.',
          'The reviewedCommit and foundationFingerprint must be copied exactly from the supplied review identity.',
        ].join('\n'),
        payload: {
          reviewIdentity: {
            jobId: reviewInput.jobId,
            candidateId: reviewInput.candidateId,
            reviewedCommit: reviewInput.reviewedCommit,
            foundationFingerprint: reviewInput.foundationFingerprint,
          },
          courseIdentity: reviewInput.courseIdentity,
          cohortValidity: reviewInput.cohortValidity,
          sourceEvidence: reviewInput.sourceEvidence,
          artifactIndex: reviewInput.artifactIndex,
          deterministicAssurance: reviewInput.deterministicAssurance,
        },
      })
      return normaliseExecution(execution)
    },

    async remediate(remediationInput) {
      const execution = await input.provider.run({
        workerId: foundationIndependentReviewWorkerContracts.remediation.workerId,
        contractVersion: foundationIndependentReviewWorkerContracts.remediation.contractVersion,
        routeKind: 'generation',
        outputSchema: foundationRemediationProviderOutputSchema,
        instructions: [
          'Correct only the blocking/material Foundation findings and only inside the exact remediation targets supplied.',
          'Return exactly one replacement for every target oldRef and no unrelated replacement.',
          'Preserve job identity, canonical Course Truth node IDs, Question Family IDs, sourceRefs and Board Alignment semantics unless the target finding specifically requires a permitted correction within that artifact.',
          'Do not modify Source Rights, Board Alignment or Foundation coverage; upstream findings are not routed to this worker.',
          'Dependency-only targets must be rebuilt/revalidated against the corrected upstream truth, not creatively expanded.',
          'Do not return or attempt to calculate Course Truth or dependency SHA fingerprints. Revision deterministically restores and validates those fields after your corrected semantic output is returned.',
          'Use only the supplied structured Foundation artifacts and rights-safe source metadata. Do not browse or reconstruct awarding-body prose.',
          'Resolve exactly the finding IDs represented by triggerReview blocking/material findings.',
        ].join('\n'),
        payload: {
          remediationIdentity: {
            jobId: remediationInput.jobId,
            sourceCandidateId: remediationInput.sourceCandidateId,
            reviewedCommit: remediationInput.reviewedCommit,
            foundationFingerprint: remediationInput.foundationFingerprint,
          },
          courseIdentity: remediationInput.courseIdentity,
          cohortValidity: remediationInput.cohortValidity,
          sourceEvidence: remediationInput.sourceEvidence,
          artifactIndex: remediationInput.artifactIndex,
          triggerReview: remediationInput.triggerReview,
          targets: remediationInput.targets,
        },
      })
      if (execution.status !== 'success') return normaliseExecution(execution)
      try {
        return {
          ...execution,
          output: await normaliseRemediationOutput(execution.output, remediationInput),
        }
      } catch (error) {
        return {
          status: 'failure',
          error: `provider_contract_failure: remediation_normalisation: ${errorMessage(error)}`,
          provenance: execution.provenance,
        }
      }
    },
  }
}