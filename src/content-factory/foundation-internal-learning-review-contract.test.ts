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
  it('binds every provider-returned provenance field to the exact supplied identity', () => {
    const schema = foundationInternalLearningBoundReviewOutputSchema(identity)
    const valid = {
      ...identity,
      decision: 'pass' as const,
      findings: [],
    }

    expect(schema.parse(valid)).toEqual(valid)

    expect(() => schema.parse({
      ...valid,
      workUnitFingerprint: 'd'.repeat(64),
    })).toThrow()

    expect(() => schema.parse({
      ...valid,
      workUnitId: 'foundation-wrong-work-unit',
    })).toThrow()
  })

  it('emits exact identity constraints into the provider-facing JSON schema', () => {
    const jsonSchema = z.toJSONSchema(
      foundationInternalLearningBoundReviewOutputSchema(identity),
    ) as {
      properties?: Record<string, { const?: unknown }>
    }

    expect(jsonSchema.properties?.foundationFingerprint?.const).toBe(identity.foundationFingerprint)
    expect(jsonSchema.properties?.foundationCandidateId?.const).toBe(identity.foundationCandidateId)
    expect(jsonSchema.properties?.sourceBundleFingerprint?.const).toBe(identity.sourceBundleFingerprint)
    expect(jsonSchema.properties?.workUnitId?.const).toBe(identity.workUnitId)
    expect(jsonSchema.properties?.workUnitFingerprint?.const).toBe(identity.workUnitFingerprint)
  })
})
