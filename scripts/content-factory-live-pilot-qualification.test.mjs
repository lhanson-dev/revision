import { describe, expect, it } from 'vitest'
import { assertLivePilotQualified } from './content-factory-live-pilot-qualification.mjs'

const requiredGates = [
  'Q1-worker-contract-inventory',
  'Q2-provider-free-contract-matrix',
  'Q3-subject-shape-matrix',
  'Q4-deterministic-pipeline-simulation',
  'Q5-restart-reuse-dependency-invalidation',
  'Q6-repeated-qualification-stability',
]

describe('Content Factory reliability qualification preflight', () => {
  it('fails closed while paid live pilots are paused', () => {
    expect(() => assertLivePilotQualified({
      schemaVersion: 1,
      status: 'paused',
      livePilotEligible: false,
      requiredGates,
      qualifiedEvidence: null,
    })).toThrow('content_factory_live_pilot_paused')
  })

  it('requires evidence for every generic qualification gate before live-pilot eligibility', () => {
    expect(() => assertLivePilotQualified({
      schemaVersion: 1,
      status: 'qualified',
      livePilotEligible: true,
      requiredGates,
      qualifiedEvidence: { passedGates: requiredGates.slice(0, -1) },
    })).toThrow('missing passed gates Q6-repeated-qualification-stability')
  })

  it('allows a paid confirmation pilot only when every required gate is evidenced', () => {
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
