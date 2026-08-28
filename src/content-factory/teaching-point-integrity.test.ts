import { describe, expect, it } from 'vitest'
import { coverageMapSchema } from './schema'
import {
  requiredTeachingPointsForRequirements,
  validateTeachingPointEvidence,
} from './teaching-point-integrity'

const coverage = coverageMapSchema.parse({
  schemaVersion: 1,
  jobId: 'cf-teaching-points',
  sourceSetFingerprint: 'sources-v1',
  requirements: [
    {
      requirementId: 'leadership',
      officialReference: 'open:leadership',
      requirementSummary: 'Compare leadership styles and suitability.',
      skillsOrKnowledge: ['leadership styles', 'contextual suitability'],
      componentScope: [],
      revisionArea: 'Leadership',
      learnRequired: true,
      practiceRequired: true,
      examPrepRequired: true,
      coverageStatus: 'planned',
      contentRefs: [],
      sourceRefs: ['open-source'],
    },
    {
      requirementId: 'ownership',
      officialReference: 'open:ownership',
      requirementSummary: 'Compare ownership and liability.',
      skillsOrKnowledge: ['limited liability', 'unlimited liability', 'contextual suitability'],
      componentScope: [],
      revisionArea: 'Ownership',
      learnRequired: true,
      practiceRequired: true,
      examPrepRequired: true,
      coverageStatus: 'planned',
      contentRefs: [],
      sourceRefs: ['open-source'],
    },
  ],
})

describe('teaching-point integrity', () => {
  it('derives the unique exact teaching points owned by multiple requirements', () => {
    expect(requiredTeachingPointsForRequirements(coverage, ['leadership', 'ownership'])).toEqual([
      'leadership styles',
      'contextual suitability',
      'limited liability',
      'unlimited liability',
    ])
  })

  it('accepts evidence only when every required point is backed by an exact learner-content excerpt', () => {
    const evidence = [
      { teachingPoint: 'leadership styles', evidence: 'Directive and participative leadership differ in how authority and employee involvement are used.' },
      { teachingPoint: 'contextual suitability', evidence: 'Suitability depends on urgency, workforce experience and the consequences of error.' },
    ]
    expect(validateTeachingPointEvidence({
      requiredTeachingPoints: ['leadership styles', 'contextual suitability'],
      evidence,
      searchableContent: {
        paragraph: 'Directive and participative leadership differ in how authority and employee involvement are used. Suitability depends on urgency, workforce experience and the consequences of error.',
      },
      artifactLabel: 'Leadership Learn',
    })).toEqual(evidence)
  })

  it('accepts locator-resolved evidence containing quotes and line breaks without JSON-serialization drift', () => {
    const exactEvidence = 'Compare the stated "result" with the baseline.\nThen explain what the difference means.'
    const evidence = [{ teachingPoint: 'data interpretation', evidence: exactEvidence }]

    expect(validateTeachingPointEvidence({
      requiredTeachingPoints: ['data interpretation'],
      evidence,
      searchableContent: {
        activities: [{
          prompt: exactEvidence,
          expectedResponse: 'State the comparison and interpret its meaning.',
        }],
      },
      artifactLabel: 'Generic Practice',
    })).toEqual(evidence)
  })

  it('does not manufacture an exact excerpt by concatenating separate generated fields', () => {
    expect(() => validateTeachingPointEvidence({
      requiredTeachingPoints: ['causal reasoning'],
      evidence: [{ teachingPoint: 'causal reasoning', evidence: 'Higher demand can raise price when supply is constrained.' }],
      searchableContent: {
        prompt: 'Higher demand can raise price',
        explanation: 'when supply is constrained.',
      },
      artifactLabel: 'Generic Practice',
    })).toThrow(/not an exact excerpt/)
  })

  it('rejects missing, invented and duplicate evidence claims', () => {
    expect(() => validateTeachingPointEvidence({
      requiredTeachingPoints: ['limited liability', 'unlimited liability'],
      evidence: [{ teachingPoint: 'limited liability', evidence: 'Limited liability restricts the owners personal financial exposure.' }],
      searchableContent: 'Limited liability restricts the owners personal financial exposure.',
      artifactLabel: 'Ownership Learn',
    })).toThrow(/missing required teaching-point evidence: unlimited liability/)

    expect(() => validateTeachingPointEvidence({
      requiredTeachingPoints: ['limited liability'],
      evidence: [{ teachingPoint: 'limited liability', evidence: 'This was definitely taught elsewhere.' }],
      searchableContent: 'Owners may have limited liability in some incorporated forms.',
      artifactLabel: 'Ownership Learn',
    })).toThrow(/not an exact excerpt/)

    expect(() => validateTeachingPointEvidence({
      requiredTeachingPoints: ['limited liability'],
      evidence: [
        { teachingPoint: 'limited liability', evidence: 'Owners may have limited liability in some incorporated forms.' },
        { teachingPoint: 'LIMITED LIABILITY', evidence: 'Owners may have limited liability in some incorporated forms.' },
      ],
      searchableContent: 'Owners may have limited liability in some incorporated forms.',
      artifactLabel: 'Ownership Learn',
    })).toThrow(/repeats teaching-point evidence/)
  })
})
