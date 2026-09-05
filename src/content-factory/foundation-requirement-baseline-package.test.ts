import { describe, expect, it } from 'vitest'
import {
  buildFoundationRequirementBaselineArtifact,
  renderFoundationRequirementBaselineReviewInstruction,
} from './foundation-requirement-baseline-package'

const baseline = {
  schemaVersion: 1 as const,
  artifactType: 'foundation_requirement_baseline' as const,
  courseKey: 'aqa-a-level-business-7132',
  cohort: '2027',
  sourceSetFingerprint: 'source-set',
  entries: [
    {
      obligationId: 'paper1-structure',
      officialReference: 'scheme-of-assessment',
      summary: 'Paper 1 structure',
      disposition: 'required_exam_truth' as const,
      sourceRefs: ['aqa-7132-assessment'],
      courseTruthNodeIds: [],
      examTruthRefs: ['paper1-structure'],
    },
  ],
}

describe('Foundation requirement baseline review package', () => {
  it('fingerprints the exact baseline supplied to expert review', async () => {
    const artifact = await buildFoundationRequirementBaselineArtifact({
      artifactRef: 'foundation/requirement-baseline.json',
      baseline,
    })
    expect(artifact.artifactKind).toBe('foundation_requirement_baseline')
    expect(artifact.fingerprint).toMatch(/^[0-9a-f]{64}$/)
    expect(artifact.value).toEqual(baseline)
  })

  it('instructs the reviewer to challenge the baseline itself as well as mapped Foundation truth', () => {
    const instruction = renderFoundationRequirementBaselineReviewInstruction()
    expect(instruction).toContain('baseline itself is complete and cohort-correct')
    expect(instruction).toContain('requires fail_hold')
  })
})
