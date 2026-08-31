import { describe, expect, it } from 'vitest'
import { coverageMapSchema } from './schema'
import { requiredCoverageProblems } from './required-coverage-reconciliation'

const coverageMap = coverageMapSchema.parse({
  schemaVersion: 1,
  jobId: 'cf-required-coverage',
  sourceSetFingerprint: 'sources-v1',
  requirements: [
    {
      requirementId: 'required-core',
      officialReference: 'open:required-core',
      requirementSummary: 'Required core material.',
      skillsOrKnowledge: ['core skill'],
      componentScope: ['paper-1'],
      revisionArea: 'Core',
      learnRequired: true,
      practiceRequired: true,
      examPrepRequired: true,
      coverageStatus: 'planned',
      contentRefs: [],
      sourceRefs: ['open-source'],
    },
    {
      requirementId: 'learn-only',
      officialReference: 'open:learn-only',
      requirementSummary: 'Required Learn-only material.',
      skillsOrKnowledge: ['learn skill'],
      componentScope: [],
      revisionArea: 'Learn',
      learnRequired: true,
      practiceRequired: false,
      examPrepRequired: false,
      coverageStatus: 'planned',
      contentRefs: [],
      sourceRefs: ['open-source'],
    },
    {
      requirementId: 'deferred-extension',
      officialReference: 'open:deferred-extension',
      requirementSummary: 'Explicitly deferred extension.',
      skillsOrKnowledge: ['extension'],
      componentScope: [],
      revisionArea: 'Extension',
      learnRequired: true,
      practiceRequired: true,
      examPrepRequired: true,
      coverageStatus: 'deferred',
      contentRefs: [],
      sourceRefs: ['open-source'],
    },
  ],
})

describe('required coverage reconciliation', () => {
  it('passes only when every active requirement has every required manufacturing channel', () => {
    expect(requiredCoverageProblems({
      coverageMap,
      evidence: [
        { requirementId: 'required-core', kind: 'learning', artifactRef: 'learn-core' },
        { requirementId: 'required-core', kind: 'practice', artifactRef: 'practice-core' },
        { requirementId: 'required-core', kind: 'assessment_item', artifactRef: 'assessment-core' },
        { requirementId: 'learn-only', kind: 'learning', artifactRef: 'learn-only' },
      ],
    })).toEqual([])
  })

  it('reports a missing Exam Prep slot instead of treating accepted sibling artifacts as sufficient', () => {
    expect(requiredCoverageProblems({
      coverageMap,
      evidence: [
        { requirementId: 'required-core', kind: 'learning', artifactRef: 'learn-core' },
        { requirementId: 'required-core', kind: 'practice', artifactRef: 'practice-core' },
        { requirementId: 'learn-only', kind: 'learning', artifactRef: 'learn-only' },
      ],
    })).toEqual([
      { requirementId: 'required-core', missing: ['assessment_item'] },
    ])
  })

  it('reports every missing required channel in one deterministic result and ignores explicit deferrals', () => {
    expect(requiredCoverageProblems({ coverageMap, evidence: [] })).toEqual([
      { requirementId: 'required-core', missing: ['learning', 'practice', 'assessment_item'] },
      { requirementId: 'learn-only', missing: ['learning'] },
    ])
  })
})
