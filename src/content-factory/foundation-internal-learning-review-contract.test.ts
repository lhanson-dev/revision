import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { foundationInternalLearningWorkUnitReviewOutputSchema } from './foundation-internal-learning-assurance'
import { foundationInternalLearningBoundReviewOutputSchema } from './foundation-internal-learning-review-contract'

const identity = {
  foundationFingerprint: 'a'.repeat(64),
  foundationCandidateId: 'business-7132-candidate-1',
  sourceBundleFingerprint: 'b'.repeat(64),
  workUnitId: 'foundation-human-resource-objectives',
  workUnitFingerprint: 'c'.repeat(64),
}

const finding = (severity: 'blocking' | 'material' | 'minor') => ({
  id: `foundation-human-resource-objectives-${severity}`,
  severity,
  issueType: 'accuracy',
  assetKind: 'learn' as const,
  evidence: ['Retained reviewer evidence'],
  finding: `${severity} finding`,
  recommendedCorrection: 'Correct the affected teaching point.',
  resolutionStatus: 'open' as const,
})

describe('Foundation internal learning review contract', () => {
  it('overwrites provider-supplied identity rather than trusting model-authored provenance', () => {
    const schema = foundationInternalLearningBoundReviewOutputSchema(identity)
    const parsed = schema.parse({
      foundationFingerprint: 'wrong-foundation',
      foundationCandidateId: 'wrong-candidate',
      sourceBundleFingerprint: 'wrong-bundle',
      workUnitId: 'wrong-work-unit',
      workUnitFingerprint: 'wrong-work-unit-fingerprint',
      decision: 'pass',
      findings: [],
    })

    expect(parsed).toEqual({
      ...identity,
      decision: 'pass',
      findings: [],
    })
  })

  it.each([
    ['blocking', 'pass', 'fail_hold'],
    ['material', 'conditional_pass', 'fail_hold'],
    ['minor', 'pass', 'conditional_pass'],
  ] as const)('derives %s review decisions from retained findings', (severity, providerDecision, expectedDecision) => {
    const schema = foundationInternalLearningBoundReviewOutputSchema(identity)
    const parsed = schema.parse({
      ...identity,
      decision: providerDecision,
      findings: [finding(severity)],
    })

    expect(parsed.decision).toBe(expectedDecision)
    expect(parsed.findings).toEqual([finding(severity)])
    expect(() => foundationInternalLearningWorkUnitReviewOutputSchema.parse(parsed)).not.toThrow()
  })

  it('derives pass for a clean review even when the provider returns fail_hold', () => {
    const schema = foundationInternalLearningBoundReviewOutputSchema(identity)
    const parsed = schema.parse({
      ...identity,
      decision: 'fail_hold',
      findings: [],
    })

    expect(parsed.decision).toBe('pass')
    expect(() => foundationInternalLearningWorkUnitReviewOutputSchema.parse(parsed)).not.toThrow()
  })

  it('keeps the established provider-facing identity and decision shape without exact literal constraints', () => {
    const jsonSchema = z.toJSONSchema(
      foundationInternalLearningBoundReviewOutputSchema(identity),
    ) as {
      required?: string[]
      properties?: Record<string, { const?: unknown; type?: unknown; enum?: unknown[] }>
    }

    for (const field of [
      'foundationFingerprint',
      'foundationCandidateId',
      'sourceBundleFingerprint',
      'workUnitId',
      'workUnitFingerprint',
    ]) {
      expect(jsonSchema.required ?? []).toContain(field)
      expect(jsonSchema.properties?.[field]?.type).toBe('string')
      expect(jsonSchema.properties?.[field]?.const).toBeUndefined()
    }
    expect(jsonSchema.required ?? []).toContain('decision')
    expect(jsonSchema.properties?.decision?.enum).toEqual(['pass', 'conditional_pass', 'fail_hold'])
  })

  it('still validates the system-supplied identity before constructing the provider contract', () => {
    expect(() => foundationInternalLearningBoundReviewOutputSchema({
      ...identity,
      workUnitFingerprint: 'not-a-sha256',
    })).toThrow()
  })
})
