import { describe, expect, it } from 'vitest'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'
import v2dText from '../../content-factory/reliability-v2-d-provider-free-qualification.json?raw'
import postQ7Text from '../../content-factory/reliability-post-q7-assessment-item-requalification.json?raw'
import postQ7002Text from '../../content-factory/reliability-post-q7-002-assessment-item-requalification.json?raw'
import historicalQ8Text from '../../content-factory/reliability-v2-f-q8-eligibility.json?raw'
import priorQ8Text from '../../content-factory/reliability-v2-f-q8-eligibility-002.json?raw'
import currentQ8Text from '../../content-factory/reliability-v2-f-q8-eligibility-003.json?raw'
import pilot19Text from '../../content-factory/reliability-pilot19-assessment-architecture-review.json?raw'

type ProviderFreeEvidence = { gates: Record<string, { status: string }> }
type Qualification = {
  status: string
  livePilotEligible: boolean
  providerFreeQualificationEvidence: string | null
  lastProviderFreeQualificationEvidence: string
  q7PassEvidence: string
  q7PassEvidenceHistory: string[]
  requiredGates: string[]
  gateStatus: Record<string, string>
  qualifiedEvidence: {
    eligibilityRecord: string
    q7PassRecord: string
    q7PassingAttempt: number
    q7WorkflowRunId: number
    passedGates: string[]
    nextPaidRunClass?: string
  } | null
}
type Pilot19 = {
  classification: { decision: string; defectClass: string }
  providerFreeRequalification: { providerCallsUsed: boolean }
  nextQualificationStep: { q7Required: boolean; fullCourseConfirmationEligible: boolean; nextPaidRunClass: string }
  historicalRecordsRewritten: boolean
}
type Q8 = {
  reviewedApprovedMainSha: string
  providerCallsUsed?: boolean
  fullCourseExecutionTriggered?: boolean
  historicalRecordsRewritten?: boolean
  qualificationEvidence?: { q7Pass: string; q7PassingAttempt?: number; q7WorkflowRunId: number }
  decision: {
    qualificationStatus: string
    livePilotEligible: boolean
    nextPaidRunClass?: string
    pilot19TriggeredByThisChange?: boolean
    confirmationPilotEligibleAfterMerge?: boolean
    confirmationPilotTriggeredByThisChange?: boolean
    maturityAchieved?: boolean
  }
}

const qualification = JSON.parse(qualificationText) as Qualification
const v2d = JSON.parse(v2dText) as ProviderFreeEvidence
const postQ7 = JSON.parse(postQ7Text) as ProviderFreeEvidence
const postQ7002 = JSON.parse(postQ7002Text) as ProviderFreeEvidence
const historicalQ8 = JSON.parse(historicalQ8Text) as Q8
const priorQ8 = JSON.parse(priorQ8Text) as Q8
const currentQ8 = JSON.parse(currentQ8Text) as Q8
const pilot19 = JSON.parse(pilot19Text) as Pilot19

const providerFreeGates = [
  'Q1-compiler-worker-ownership-inventory',
  'Q2-historical-failure-replay-corpus',
  'Q3-adversarial-provider-free-subject-matrix',
  'Q4-deterministic-full-pipeline-simulation',
  'Q5-restart-reuse-dependency-invalidation',
  'Q6-repeated-provider-free-stability',
]
const allGates = [...providerFreeGates, 'Q7-bounded-live-worker-soak']

describe('Reliability v2 status after Confirmation Pilot #21', () => {
  it('pauses current qualification while preserving the approved post-Pilot #20 Q8 record as history', () => {
    expect(qualification.status).toBe('paused')
    expect(qualification.livePilotEligible).toBe(false)
    expect(qualification.providerFreeQualificationEvidence).toBeNull()
    expect(qualification.lastProviderFreeQualificationEvidence).toBe('content-factory/reliability-post-pilot20-q1-q6-consolidation.json')
    expect(qualification.q7PassEvidence).toBe('content-factory/reliability-v2-e-q7-live-soak-evidence-006.json')
    expect(qualification.q7PassEvidenceHistory).toEqual(['content-factory/reliability-v2-e-q7-live-soak-evidence-003.json','content-factory/reliability-v2-e-q7-live-soak-evidence-004.json'])
    expect(qualification.requiredGates).toEqual(allGates)
    for (const gate of allGates) expect(qualification.gateStatus[gate]).toBe('pending')
    expect(qualification.qualifiedEvidence).toBeNull()
    expect(currentQ8).toMatchObject({
      reviewedApprovedMainSha: '3b5cbb1ed5404f1d6692880e79b44847281e0b6f',
      providerCallsUsed: false,
      fullCourseExecutionTriggered: false,
      historicalRecordsRewritten: false,
      qualificationEvidence: {
        q7Pass: 'content-factory/reliability-v2-e-q7-live-soak-evidence-006.json',
        q7PassingAttempt: 6,
        q7WorkflowRunId: 33554413877,
      },
      decision: {
        qualificationStatus: 'qualified',
        livePilotEligible: true,
        nextPaidRunClass: 'confirmation_pilot',
        confirmationPilotEligibleAfterMerge: true,
        confirmationPilotTriggeredByThisChange: false,
        maturityAchieved: false,
      },
    })
  })

  it('preserves Pilot #19 as the generic class that forced its earlier requalification', () => {
    expect(pilot19).toMatchObject({
      classification: { decision: 'new_generic_engineering_contract_class', defectClass: 'assessment_mcq_cognitive_demand_lexical_overconstraint' },
      providerFreeRequalification: { providerCallsUsed: false },
      nextQualificationStep: { q7Required: true, fullCourseConfirmationEligible: false, nextPaidRunClass: 'bounded_q7_live_worker_soak' },
      historicalRecordsRewritten: false,
    })
  })

  it('preserves earlier provider-free and Q8 evidence unchanged', () => {
    for (const gate of providerFreeGates) {
      expect(postQ7002.gates[gate]?.status).toBe('pass')
      expect(postQ7.gates[gate]?.status).toBe('pass')
      expect(v2d.gates[gate]?.status).toBe('pass')
    }
    expect(historicalQ8).toMatchObject({
      reviewedApprovedMainSha: '166f9cb6957b995b81ff3eec84062b2f09ecec6c',
      decision: { qualificationStatus: 'qualified', livePilotEligible: true, pilot19TriggeredByThisChange: false },
      historicalRecordsRewritten: false,
    })
    expect(priorQ8).toMatchObject({
      reviewedApprovedMainSha: 'f2b9b43ccddc0111859da39cff4900343065f7a2',
      providerCallsUsed: false,
      fullCourseExecutionTriggered: false,
      decision: { qualificationStatus: 'qualified', livePilotEligible: true, confirmationPilotTriggeredByThisChange: false, maturityAchieved: false },
    })
  })
})
