import { z } from 'zod'
import {
  foundationRequirementBaselineSchema,
  type FoundationRequirementBaseline,
} from './foundation-requirement-baseline'
import { fingerprintFoundationArtifact } from './foundation-compilation'

const nonEmptyStringSchema = z.string().min(1)

export const foundationRequirementBaselineArtifactSchema = z.object({
  artifactKind: z.literal('foundation_requirement_baseline'),
  artifactRef: nonEmptyStringSchema,
  fingerprint: nonEmptyStringSchema,
  value: foundationRequirementBaselineSchema,
})

export async function buildFoundationRequirementBaselineArtifact(input: {
  artifactRef: string
  baseline: FoundationRequirementBaseline
}) {
  const baseline = foundationRequirementBaselineSchema.parse(input.baseline)
  const fingerprint = await fingerprintFoundationArtifact(baseline)
  return foundationRequirementBaselineArtifactSchema.parse({
    artifactKind: 'foundation_requirement_baseline',
    artifactRef: input.artifactRef,
    fingerprint,
    value: baseline,
  })
}

export function renderFoundationRequirementBaselineReviewInstruction() {
  return [
    'Review the supplied Foundation Requirement Baseline before judging the Foundation artifacts.',
    'Check whether the baseline itself is complete and cohort-correct for the exact course and examination specification.',
    'Then verify that every material mapped obligation is substantively satisfied by the referenced Course Truth and/or Exam Truth.',
    'A missing, stale, incorrectly scoped or materially unsatisfied obligation requires fail_hold.',
  ].join(' ')
}
