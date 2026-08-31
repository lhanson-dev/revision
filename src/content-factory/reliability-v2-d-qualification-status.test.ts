import { describe, expect, it } from 'vitest'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'
import v2dText from '../../content-factory/reliability-v2-d-provider-free-qualification.json?raw'
import postQ7Text from '../../content-factory/reliability-post-q7-assessment-item-requalification.json?raw'
import postQ7002Text from '../../content-factory/reliability-post-q7-002-assessment-item-requalification.json?raw'

type Qualification = {
  status: string
  requiredGates: string[]
  gateStatus: Record<string, string>
  providerFreeQualificationEvidence: string | null
  lastProviderFreeQualificationEvidence: string
  q7FailureEvidence: string
  q7FailureEvidenceHistory: string[]
  q7PassEvidence: string
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
const postQ7002 = JSON.parse(postQ7002Text) as ProviderFreeEvidence

const providerFreeGates = [
  'Q1-compiler-worker-ownership-inventory',
  'Q2-historical-failure-replay-corpus',
  'Q3-adversarial-provider-free-subject-matrix',
  'Q4-deterministic-full-pipeline-simulation',
  'Q5-restart-reuse-dependency-invalidation',
  'Q6-repeated-provider-free-stability',
]

describe('Reliability v2 qualification status after third Q7 classification', () => {
  it('records current Q1-Q7 PASS while preserving historical provider-free records and keeping Q8 pending', () => {
    expect(qualification.status).toBe('paused')
    expect(qualification.providerFreeQualificationEvidence).toBe(
      'content-factory/reliability-post-q7-002-assessment-item-requalification.json',
    )
    expect(qualification.lastProviderFreeQualificationEvidence).toBe(
      'content-factory/reliability-post-q7-assessment-item-requalification.json',
    )
    expect(qualification.q7FailureEvidence).toBe(
      'content-factory/reliability-v2-e-q7-live-soak-evidence-002.json',
    )
    expect(qualification.q7FailureEvidenceHistory).toEqual([
      'content-factory/reliability-v2-e-q7-live-soak-evidence.json',
      'content-factory/reliability-v2-e-q7-live-soak-evidence-002.json',
    ])
    expect(qualification.q7PassEvidence).toBe(
      'content-factory/reliability-v2-e-q7-live-soak-evidence-003.json',
    )

    for (const gate of providerFreeGates) {
      expect(qualification.requiredGates).toContain(gate)
      expect(qualification.gateStatus[gate]).toBe('pass')
      expect(postQ7002.gates[gate]?.status).toBe('pass')
      expect(postQ7.gates[gate]?.status).toBe('pass')
      expect(v2d.gates[gate]?.status).toBe('pass')
    }

    expect(qualification.requiredGates).toContain('Q7-bounded-live-worker-soak')
    expect(qualification.gateStatus['Q7-bounded-live-worker-soak']).toBe('pass')
    expect(qualification.qualifiedEvidence).toBeNull()
    expect(qualification.livePilotEligible).toBe(false)

    expect(postQ7002.status).toBe('complete')
    expect(postQ7002.providerFreeQualificationPassed).toBe(true)
    expect(postQ7002.q7BoundedLiveSoakEligible).toBe(true)
    expect(postQ7002.q7Passed).toBe(false)
    expect(postQ7002.overallReliabilityV2Passed).toBe(false)
    expect(postQ7002.livePilotEligible).toBe(false)

    expect(postQ7.status).toBe('complete')
    expect(postQ7.providerFreeQualificationPassed).toBe(true)
    expect(postQ7.q7Passed).toBe(false)
    expect(postQ7.overallReliabilityV2Passed).toBe(false)
    expect(postQ7.livePilotEligible).toBe(false)

    expect(v2d.providerFreeQualificationPassed).toBe(true)
    expect(v2d.q7Passed).toBe(false)
    expect(v2d.overallReliabilityV2Passed).toBe(false)
    expect(v2d.livePilotEligible).toBe(false)
  })
})
