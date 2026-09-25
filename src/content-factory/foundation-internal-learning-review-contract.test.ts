import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { foundationInternalLearningBoundReviewOutputSchema } from './foundation-internal-learning-review-contract'

const identity = {
  foundationFingerprint: 'a'.repeat(64),
  foundationCandidateId: 'business-7132-candidate-1',
  sourceBundleFingerprint: 'b'.repeat(64),
  workUnitId: 'foundation-human-resource-objectives',
  workUnitFingerprint: 'c'.repeat(64),
}

describe('Foundation internal learning review contract', () => {
  it('deterministically injects system-owned provenance when the provider returns judgement only', () => {
    const schema = foundationInternalLearningBoundReviewOutputSchema(identity)
    const judgement = {
      decision: 'pass' as const,
      findings: [],
    }

    expect(schema.parse(judgement)).toEqual({
      ...identity,
      ...judgement,
    })
  })

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

    expect(parsed.foundationFingerprint).toBe(identity.foundationFingerprint)
    expect(parsed.foundationCandidateId).toBe(identity.foundationCandidateId)
    expect(parsed.sourceBundleFingerprint).toBe(identity.sourceBundleFingerprint)
    expect(parsed.workUnitId).toBe(identity.workUnitId)
    expect(parsed.workUnitFingerprint).toBe(identity.workUnitFingerprint)
  })

  it('keeps provider-facing identity optional while retaining exact system defaults', () => {
    const jsonSchema = z.toJSONSchema(
      foundationInternalLearningBoundReviewOutputSchema(identity),
    ) as {
      required?: string[]
      properties?: Record<string, { default?: unknown }>
    }

    for (const field of [
      'foundationFingerprint',
      'foundationCandidateId',
      'sourceBundleFingerprint',
      'workUnitId',
      'workUnitFingerprint',
    ]) {
      expect(jsonSchema.required ?? []).not.toContain(field)
    }

    expect(jsonSchema.properties?.foundationFingerprint?.default).toBe(identity.foundationFingerprint)
    expect(jsonSchema.properties?.foundationCandidateId?.default).toBe(identity.foundationCandidateId)
    expect(jsonSchema.properties?.sourceBundleFingerprint?.default).toBe(identity.sourceBundleFingerprint)
    expect(jsonSchema.properties?.workUnitId?.default).toBe(identity.workUnitId)
    expect(jsonSchema.properties?.workUnitFingerprint?.default).toBe(identity.workUnitFingerprint)
  })

  it('still validates the system-supplied identity before constructing the provider contract', () => {
    expect(() => foundationInternalLearningBoundReviewOutputSchema({
      ...identity,
      workUnitFingerprint: 'not-a-sha256',
    })).toThrow()
  })
})
