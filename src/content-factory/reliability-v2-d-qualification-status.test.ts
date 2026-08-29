import { describe, expect, it } from 'vitest'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'
import v2dText from '../../content-factory/reliability-v2-d-provider-free-qualification.json?raw'
import postQ7Text from '../../content-factory/reliability-post-q7-assessment-item-requalification.json?raw'

type Qualification = {
  status: string
  requiredGates: string[]
  gateStatus: Record<string, string>
  providerFreeQualificationEvidence: string
  q7FailureEvidence?: string
  qualifiedEvidence: unknown | null
  livePilotEligible: boolean
}

type ProviderFreeEvidence = {
  status: string
  gates: Record<string, { status: string }>
  providerFreeQualificationPassed?: boolean
  q7BoundedLiveSoakEligible?: boolean
  q7Passed?: boolean
  overallReliabilityV2Passed?: boolean
  livePilotEligible?: boolean
  nextWorkItem?: string
}

const qualification = JSON.parse(qualificationText) as Qualification
const v2d = JSON.parse(v2dText) as ProviderFreeEvidence
const postQ7 = JSON.parse(postQ7Text) as ProviderFreeEvidence

const providerFreeGates = [
  'Q1-compiler-worker-ownership-inventory',
  'Q2-historical-failure-replay-corpus',
  'Q3-adversarial-provider-free-subject-matrix',
  'Q4-deterministic-full-pipeline-simulation',
  'Q5-restart-reuse-dependency-invalidation',
  'Q6-repeated-provider-free-stability',
]

describe('Reliability v2 provider-free qualification status after Q7 Assessment Item repair', () => {
  it('keeps V2-D as historical PASS while using the post-Q7 requalification as current Q1-Q6 evidence', () => {
    expect(qualification.status).toBe('paused')
    expect(qualification.providerFreeQualificationEvidence).toBe(
      'content-factory/reliability-post-q7-assessment-item-requalification.json',
    )
    expect(qualification.q7FailureEvidence).toBe(
      'content-factory/reliability-v2-e-q7-live-soak-evidence.json',
    )

    for (const gate of providerFreeGates) {
      expect(qualification.requiredGates).toContain(gate)
      expect(qualification.gateStatus[gate]).toBe('pass')
      expect(postQ7.gates[gate]?.status).toBe('pass')
      expect(v2d.gates[gate]?.status).toBe('pass')
    }

    expect(qualification.requiredGates).toContain('Q7-bounded-live-worker-soak')
    expect(qualification.gateStatus['Q7-bounded-live-worker-soak']).toBe('pending')
    expect(qualification.qualifiedEvidence).toBeNull()
    expect(qualification.livePilotEligible).toBe(false)

    expect(postQ7.status).toBe('complete')
    expect(postQ7.providerFreeQualificationPassed).toBe(true)
    expect(postQ7.q7BoundedLiveSoakEligible).toBe(true)
    expect(postQ7.q7Passed).toBe(false)
    expect(postQ7.overallReliabilityV2Passed).toBe(false)
    expect(postQ7.livePilotEligible).toBe(false)
    expect(postQ7.nextWorkItem).toBe('Q7-bounded-live-worker-soak')

    expect(v2d.providerFreeQualificationPassed).toBe(true)
    expect(v2d.q7BoundedLiveSoakEligible).toBe(true)
    expect(v2d.q7Passed).toBe(false)
    expect(v2d.overallReliabilityV2Passed).toBe(false)
    expect(v2d.livePilotEligible).toBe(false)
    expect(v2d.nextWorkItem).toBe('V2-E')
  })
})
