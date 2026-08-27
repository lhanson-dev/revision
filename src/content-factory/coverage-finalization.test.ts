import { describe, expect, it } from 'vitest'
import { coverageMapSchema } from './schema'
import { finaliseCoverageMap, finalCoverageProblems } from './coverage-finalization'

const planned = coverageMapSchema.parse({
  schemaVersion: 1,
  jobId: 'cf-coverage-final',
  sourceSetFingerprint: 'sources-v1',
  requirements: [
    {
      requirementId: 'ownership',
      officialReference: 'open:ownership',
      requirementSummary: 'Understand ownership and liability.',
      skillsOrKnowledge: ['limited liability', 'unlimited liability'],
      componentScope: [],
      revisionArea: 'Ownership',
      learnRequired: true,
      practiceRequired: true,
      examPrepRequired: true,
      coverageStatus: 'planned',
      contentRefs: [],
      sourceRefs: ['open-source'],
    },
    {
      requirementId: 'extension',
      officialReference: 'open:extension',
      requirementSummary: 'Optional extension material.',
      skillsOrKnowledge: ['extension'],
      componentScope: [],
      revisionArea: 'Extension',
      learnRequired: false,
      practiceRequired: false,
      examPrepRequired: false,
      coverageStatus: 'deferred',
      contentRefs: [],
      sourceRefs: ['open-source'],
    },
  ],
})

const allEvidence = [
  { ref: 'artifact:learn:ownership', requirementIds: ['ownership'], kind: 'learning' as const },
  { ref: 'artifact:practice:ownership', requirementIds: ['ownership'], kind: 'practice' as const },
  { ref: 'artifact:assessment:ownership', requirementIds: ['ownership'], kind: 'assessment_item' as const },
]

describe('Coverage Map finalization', () => {
  it('promotes a requirement only when all required evidence is present and writes exact content refs', () => {
    const finalised = finaliseCoverageMap({ coverageMap: planned, evidence: allEvidence })
    expect(finalised.requirements[0].coverageStatus).toBe('complete')
    expect(finalised.requirements[0].contentRefs).toEqual(allEvidence.map((entry) => entry.ref))
    expect(finalised.requirements[1].coverageStatus).toBe('deferred')
  })

  it('keeps incomplete requirements partial rather than manufacturing complete coverage', () => {
    const finalised = finaliseCoverageMap({ coverageMap: planned, evidence: allEvidence.slice(0, 2) })
    expect(finalised.requirements[0].coverageStatus).toBe('partial')
    expect(finalised.requirements[0].contentRefs).toEqual([
      'artifact:learn:ownership',
      'artifact:practice:ownership',
    ])
  })

  it('fails final coverage assurance when the canonical map is stale or its refs do not match generated evidence', () => {
    expect(finalCoverageProblems({ coverageMap: planned, evidence: allEvidence })).toEqual([
      'ownership: final Coverage Map status is planned, expected complete',
      'ownership: final Coverage Map contentRefs do not match generated evidence',
    ])

    const finalised = finaliseCoverageMap({ coverageMap: planned, evidence: allEvidence })
    expect(finalCoverageProblems({ coverageMap: finalised, evidence: allEvidence })).toEqual([])

    const stale = coverageMapSchema.parse({
      ...finalised,
      requirements: finalised.requirements.map((requirement) => requirement.requirementId === 'ownership'
        ? { ...requirement, contentRefs: ['artifact:learn:ownership'] }
        : requirement),
    })
    expect(finalCoverageProblems({ coverageMap: stale, evidence: allEvidence })).toContain(
      'ownership: final Coverage Map contentRefs do not match generated evidence',
    )
  })
})
