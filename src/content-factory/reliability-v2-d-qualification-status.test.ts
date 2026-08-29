import { describe, expect, it } from 'vitest'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'
import v2dText from '../../content-factory/reliability-v2-d-provider-free-qualification.json?raw'

type Qualification = {
  status: string
  requiredGates: string[]
  gateStatus: Record<string, string>
  providerFreeQualificationEvidence: string
  qualifiedEvidence: unknown | null
  livePilotEligible: boolean
}

type V2D = {
  providerFreeQualificationPassed: boolean
  q7BoundedLiveSoakEligible: boolean
  q7Passed: boolean
  overallReliabilityV2Passed: boolean
  livePilotEligible: boolean
  nextWorkItem: string
}

const qualification = JSON.parse(qualificationText) as Qualification
const v2d = JSON.parse(v2dText) as V2D

const providerFreeGates = [
  'Q1-compiler-worker-ownership-inventory',
  'Q2-historical-failure-replay-corpus',
  'Q3-adversarial-provider-free-subject-matrix',
  'Q4-deterministic-full-pipeline-simulation',
  'Q5-restart-reuse-dependency-invalidation',
  'Q6-repeated-provider-free-stability',
]

describe('Reliability v2-D qualification status', () => {
  it('records Q1-Q6 PASS while keeping Q7 and full-course eligibility fail closed', () => {
    expect(qualification.status).toBe('paused')
    expect(qualification.providerFreeQualificationEvidence).toBe(
      'content-factory/reliability-v2-d-provider-free-qualification.json',
    )
    for (const gate of providerFreeGates) {
      expect(qualification.requiredGates).toContain(gate)
      expect(qualification.gateStatus[gate]).toBe('pass')
    }
    expect(qualification.requiredGates).toContain('Q7-bounded-live-worker-soak')
    expect(qualification.gateStatus['Q7-bounded-live-worker-soak']).toBe('pending')
    expect(qualification.qualifiedEvidence).toBeNull()
    expect(qualification.livePilotEligible).toBe(false)

    expect(v2d.providerFreeQualificationPassed).toBe(true)
    expect(v2d.q7BoundedLiveSoakEligible).toBe(true)
    expect(v2d.q7Passed).toBe(false)
    expect(v2d.overallReliabilityV2Passed).toBe(false)
    expect(v2d.livePilotEligible).toBe(false)
    expect(v2d.nextWorkItem).toBe('V2-E')
  })
})
