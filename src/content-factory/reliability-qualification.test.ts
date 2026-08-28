import { describe, expect, it } from 'vitest'
import { assertLivePilotQualified } from '../../scripts/content-factory-live-pilot-qualification.mjs'

const requiredGates = [
  'Q1-worker-contract-inventory',
  'Q2-provider-free-contract-matrix',
  'Q3-subject-shape-matrix',
  'Q4-deterministic-pipeline-simulation',
  'Q5-restart-reuse-dependency-invalidation',
  'Q6-repeated-qualification-stability',
]

describe('Content Factory reliability qualification gate', () => {
  it('fails closed while paid live pilots are paused', () => {
    expect(() => assertLivePilotQualified({
      schemaVersion: 1,
      status: 'paused',
      livePilotEligible: false,
      requiredGates,
      qualifiedEvidence: null,
    })).toThrow('content_factory_live_pilot_paused')
  })

  it('does not allow qualified status without evidence for every required generic gate', () => {
    expect(() => assertLivePilotQualified({
      schemaVersion: 1,
      status: 'qualified',
      livePilotEligible: true,
      requiredGates,
      qualifiedEvidence: { passedGates: requiredGates.slice(0, -1) },
    })).toThrow('missing passed gates Q6-repeated-qualification-stability')
  })

  it('allows paid confirmation pilots only after every required gate is evidenced', () => {
    const record = {
      schemaVersion: 1,
      status: 'qualified',
      livePilotEligible: true,
      requiredGates,
      qualifiedEvidence: {
        passedGates: requiredGates,
        evidenceRef: 'docs/technical/Content Factory Reliability Qualification Harness.md',
      },
    }
    expect(assertLivePilotQualified(record)).toBe(record)
  })
})
