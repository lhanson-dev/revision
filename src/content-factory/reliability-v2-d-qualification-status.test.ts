import { describe, expect, it } from 'vitest'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'
import v2dText from '../../content-factory/reliability-v2-d-provider-free-qualification.json?raw'
import postQ7Text from '../../content-factory/reliability-post-q7-assessment-item-requalification.json?raw'
import postQ7002Text from '../../content-factory/reliability-post-q7-002-assessment-item-requalification.json?raw'
import q8EligibilityText from '../../content-factory/reliability-v2-f-q8-eligibility.json?raw'
import pilot19Text from '../../content-factory/reliability-pilot19-assessment-architecture-review.json?raw'

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

type Pilot19Evidence = {
  status: string
  classification: { decision: string; defectClass: string }
  providerFreeRequalification: { providerCallsUsed: boolean; gates: Record<string, string> }
  nextQualificationStep: { q7Required: boolean; fullCourseConfirmationEligible: boolean; nextPaidRunClass: string }
  historicalRecordsRewritten: boolean
}

const qualification = JSON.parse(qualificationText) as Qualification
const v2d = JSON.parse(v2dText) as ProviderFreeEvidence
const postQ7 = JSON.parse(postQ7Text) as ProviderFreeEvidence
const postQ7002 = JSON.parse(postQ7002Text) as ProviderFreeEvidence
const q8Eligibility = JSON.parse(q8EligibilityText) as Q8Eligibility
const pilot19 = JSON.parse(pilot19Text) as Pilot19Evidence

const providerFreeGates = [
  'Q1-compiler-worker-ownership-inventory',
  'Q2-historical-failure-replay-corpus',
  'Q3-adversarial-provider-free-subject-matrix',
  'Q4-deterministic-full-pipeline-simulation',
  'Q5-restart-reuse-dependency-invalidation',
  'Q6-repeated-provider-free-stability',
]

const allReliabilityV2Gates = [...providerFreeGates, 'Q7-bounded-live-worker-soak']

describe('Reliability v2 status after Pilot #19 architecture review', () => {
  it('pauses current eligibility while preserving all earlier Q7/Q8 evidence as historical truth', () => {
    expect(qualification.status).toBe('paused')
    expect(qualification.providerFreeQualificationEvidence).toBe('content-factory/reliability-pilot19-assessment-architecture-review.json')
    expect(qualification.lastProviderFreeQualificationEvidence).toBe('content-factory/reliability-post-q7-002-assessment-item-requalification.json')
    expect(qualification.q7FailureEvidence).toBe('content-factory/reliability-v2-e-q7-live-soak-evidence-002.json')
    expect(qualification.q7FailureEvidenceHistory).toEqual([
      'content-factory/reliability-v2-e-q7-live-soak-evidence.json',
      'content-factory/reliability-v2-e-q7-live-soak-evidence-002.json',
    ])
    expect(qualification.q7PassEvidence).toBe('content-factory/reliability-v2-e-q7-live-soak-evidence-003.json')
    expect(qualification.requiredGates).toEqual(allReliabilityV2Gates)
    expect(qualification.qualifiedEvidence).toBeNull()
    expect(qualification.livePilotEligible).toBe(false)

    for (const gate of providerFreeGates) {
      expect(['candidate_pass_pending_exact_head_assurance', 'pass']).toContain(qualification.gateStatus[gate])
    }
    expect(qualification.gateStatus['Q7-bounded-live-worker-soak']).toBe('required_after_pilot19')
  })

  it('records Pilot #19 as a new generic class and requires bounded Q7 before another Q8', () => {
    expect(pilot19).toMatchObject({
      classification: {
        decision: 'new_generic_engineering_contract_class',
        defectClass: 'assessment_mcq_cognitive_demand_lexical_overconstraint',
      },
      providerFreeRequalification: { providerCallsUsed: false },
      nextQualificationStep: {
        q7Required: true,
        fullCourseConfirmationEligible: false,
        nextPaidRunClass: 'bounded_q7_live_worker_soak',
      },
      historicalRecordsRewritten: false,
    })
    expect(['implemented_pending_exact_head_assurance', 'complete']).toContain(pilot19.status)
    for (const gate of providerFreeGates) {
      expect(['candidate_pass_pending_exact_head_assurance', 'pass']).toContain(pilot19.providerFreeRequalification.gates[gate])
    }
  })

  it('preserves the earlier provider-free and Q8 records without retroactively changing their outcome', () => {
    for (const gate of providerFreeGates) {
      expect(postQ7002.gates[gate]?.status).toBe('pass')
      expect(postQ7.gates[gate]?.status).toBe('pass')
      expect(v2d.gates[gate]?.status).toBe('pass')
    }

    expect(postQ7002.status).toBe('complete')
    expect(postQ7002.providerFreeQualificationPassed).toBe(true)
    expect(postQ7002.q7BoundedLiveSoakEligible).toBe(true)
    expect(postQ7002.q7Passed).toBe(false)
    expect(postQ7002.overallReliabilityV2Passed).toBe(false)
    expect(postQ7002.livePilotEligible).toBe(false)

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
  })
})
