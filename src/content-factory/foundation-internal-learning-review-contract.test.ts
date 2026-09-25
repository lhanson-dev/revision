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

  it('keeps the established provider-facing identity shape without exact literal constraints', () => {
    const jsonSchema = z.toJSONSchema(
      foundationInternalLearningBoundReviewOutputSchema(identity),
    ) as {
      required?: string[]
      properties?: Record<string, { const?: unknown; type?: unknown }>
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
  })

  it('still validates the system-supplied identity before constructing the provider contract', () => {
    expect(() => foundationInternalLearningBoundReviewOutputSchema({
      ...identity,
      workUnitFingerprint: 'not-a-sha256',
    })).toThrow()
  })
})
