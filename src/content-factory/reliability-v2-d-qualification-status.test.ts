import { describe, expect, it } from 'vitest'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'
import v2dText from '../../content-factory/reliability-v2-d-provider-free-qualification.json?raw'
import postQ7Text from '../../content-factory/reliability-post-q7-assessment-item-requalification.json?raw'
import postQ7002Text from '../../content-factory/reliability-post-q7-002-assessment-item-requalification.json?raw'
import historicalQ8Text from '../../content-factory/reliability-v2-f-q8-eligibility.json?raw'
import currentQ8Text from '../../content-factory/reliability-v2-f-q8-eligibility-002.json?raw'
import pilot19Text from '../../content-factory/reliability-pilot19-assessment-architecture-review.json?raw'

const qualification = JSON.parse(qualificationText) as any
const v2d = JSON.parse(v2dText) as any
const postQ7 = JSON.parse(postQ7Text) as any
const postQ7002 = JSON.parse(postQ7002Text) as any
const historicalQ8 = JSON.parse(historicalQ8Text) as any
const currentQ8 = JSON.parse(currentQ8Text) as any
const pilot19 = JSON.parse(pilot19Text) as any

const providerFreeGates = [
  'Q1-compiler-worker-ownership-inventory',
  'Q2-historical-failure-replay-corpus',
  'Q3-adversarial-provider-free-subject-matrix',
  'Q4-deterministic-full-pipeline-simulation',
  'Q5-restart-reuse-dependency-invalidation',
  'Q6-repeated-provider-free-stability',
]
const allGates = [...providerFreeGates, 'Q7-bounded-live-worker-soak']

describe('Reliability v2 status after post-Pilot #19 Q8', () => {
  it('records the current qualified state from post-Pilot #19 Q1-Q7 evidence', () => {
    expect(qualification.status).toBe('qualified')
    expect(qualification.livePilotEligible).toBe(true)
    expect(qualification.providerFreeQualificationEvidence).toBe('content-factory/reliability-post-pilot19-requalification.json')
    expect(qualification.q7PassEvidence).toBe('content-factory/reliability-v2-e-q7-live-soak-evidence-004.json')
    expect(qualification.q7PassEvidenceHistory).toEqual(['content-factory/reliability-v2-e-q7-live-soak-evidence-003.json'])
    expect(qualification.requiredGates).toEqual(allGates)
    for (const gate of allGates) expect(qualification.gateStatus[gate]).toBe('pass')
    expect(qualification.qualifiedEvidence).toMatchObject({
      eligibilityRecord: 'content-factory/reliability-v2-f-q8-eligibility-002.json',
      q7PassRecord: 'content-factory/reliability-v2-e-q7-live-soak-evidence-004.json',
      q7PassingAttempt: 4,
      q7WorkflowRunId: 33395187056,
      passedGates: allGates,
    })
  })

  it('preserves Pilot #19 as the generic class that forced requalification', () => {
    expect(pilot19).toMatchObject({
      classification: { decision: 'new_generic_engineering_contract_class', defectClass: 'assessment_mcq_cognitive_demand_lexical_overconstraint' },
      providerFreeRequalification: { providerCallsUsed: false },
      nextQualificationStep: { q7Required: true, fullCourseConfirmationEligible: false, nextPaidRunClass: 'bounded_q7_live_worker_soak' },
      historicalRecordsRewritten: false,
    })
  })

  it('preserves earlier provider-free and historical Q8 evidence unchanged', () => {
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
    expect(currentQ8).toMatchObject({
      reviewedApprovedMainSha: 'f2b9b43ccddc0111859da39cff4900343065f7a2',
      providerCallsUsed: false,
      fullCourseExecutionTriggered: false,
      decision: { qualificationStatus: 'qualified', livePilotEligible: true, confirmationPilotTriggeredByThisChange: false, maturityAchieved: false },
    })
  })
})
