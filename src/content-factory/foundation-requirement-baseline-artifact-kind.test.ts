import { describe, expect, it } from 'vitest'
import { foundationRequirementBaselineSchema } from './foundation-requirement-baseline'

describe('Foundation requirement baseline artifact kind', () => {
  it('uses a stable first-class artifact type', () => {
    const parsed = foundationRequirementBaselineSchema.parse({
      schemaVersion: 1,
      artifactType: 'foundation_requirement_baseline',
      courseKey: 'course',
      cohort: 'cohort',
      sourceSetFingerprint: 'source-set',
      entries: [{
        obligationId: 'obligation',
        officialReference: 'ref',
        summary: 'summary',
        disposition: 'not_applicable',
        sourceRefs: ['source'],
      }],
    })
    expect(parsed.artifactType).toBe('foundation_requirement_baseline')
  })
})
