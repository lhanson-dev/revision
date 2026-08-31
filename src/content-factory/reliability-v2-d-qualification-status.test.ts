import { describe, expect, it } from 'vitest'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'
import v2dText from '../../content-factory/reliability-v2-d-provider-free-qualification.json?raw'
import postQ7Text from '../../content-factory/reliability-post-q7-assessment-item-requalification.json?raw'
import postQ7002Text from '../../content-factory/reliability-post-q7-002-assessment-item-requalification.json?raw'
import q8EligibilityText from '../../content-factory/reliability-v2-f-q8-eligibility.json?raw'

type Qualification = {
  status: string
  requiredGates: string[]
  gateStatus: Record<string, string>
  providerFreeQualificationEvidence: string | null
  lastProviderFreeQualificationEvidence: string
  q7FailureEvidence: string
  q7FailureEvidenceHistory: string[]
  q7PassEvidence: string
  qualifiedEvidence: {
    qualificationEvidenceMainSha: string
    eligibilityRecord: string
    providerFreeQualificationRecord: string
    q7PassRecord: string
    providerCallsUsed: boolean
    passedGates: string[]
    q6RepetitionCount: number
    q7PassingAttempt: number
    nextPaidRunClass: string
  } | null
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

type Q8Eligibility = {
  status: string
  passedGates: string[]
  decision: {
    qualificationStatus: string
    livePilotEligible: boolean
    nextPaidRunClass: string
    pilot19TriggeredByThisChange: boolean
    maturityAchieved: boolean
  }
}

const qualification = JSON.parse(qualificationText) as Qualification
const v2d = JSON.parse(v2dText) as ProviderFreeEvidence
const postQ7 = JSON.parse(postQ7Text) as ProviderFreeEvidence
const postQ7002 = JSON.parse(postQ7002Text) as ProviderFreeEvidence
const q8Eligibility = JSON.parse(q8EligibilityText) as Q8Eligibility

const providerFreeGates = [
  'Q1-compiler-worker-ownership-inventory',
  'Q2-historical-failure-replay-corpus',
  'Q3-adversarial-provider-free-subject-matrix',
  'Q4-deterministic-full-pipeline-simulation',
  'Q5-restart-reuse-dependency-invalidation',
  'Q6-repeated-provider-free-stability',
]

const allReliabilityV2Gates = [
  ...providerFreeGates,
  'Q7-bounded-live-worker-soak',
]

describe('Reliability v2 qualification status after V2-F/Q8 eligibility transition', () => {
  it('records current Q1-Q7 PASS and restores confirmation-pilot eligibility without rewriting historical provider-free records', () => {
    expect(qualification.status).toBe('qualified')
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
    expect(qualification.livePilotEligible).toBe(true)
    expect(qualification.qualifiedEvidence).toMatchObject({
      qualificationEvidenceMainSha: '166f9cb6957b995b81ff3eec84062b2f09ecec6c',
      eligibilityRecord: 'content-factory/reliability-v2-f-q8-eligibility.json',
      providerFreeQualificationRecord: 'content-factory/reliability-post-q7-002-assessment-item-requalification.json',
      q7PassRecord: 'content-factory/reliability-v2-e-q7-live-soak-evidence-003.json',
      providerCallsUsed: false,
      passedGates: allReliabilityV2Gates,
      q6RepetitionCount: 3,
      q7PassingAttempt: 3,
      nextPaidRunClass: 'confirmation_pilot',
    })

    expect(q8Eligibility).toMatchObject({
      status: 'eligible_for_confirmation_pilot',
      passedGates: allReliabilityV2Gates,
      decision: {
        qualificationStatus: 'qualified',
        livePilotEligible: true,
        nextPaidRunClass: 'confirmation_pilot',
        pilot19TriggeredByThisChange: false,
        maturityAchieved: false,
      },
    })

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
