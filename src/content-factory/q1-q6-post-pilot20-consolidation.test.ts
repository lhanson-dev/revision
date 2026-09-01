import { describe, expect, it } from 'vitest'
import consolidationText from '../../content-factory/reliability-post-pilot20-q1-q6-consolidation.json?raw'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'
import q1Text from '../../content-factory/reliability-contract-inventory.json?raw'
import q2Text from '../../content-factory/reliability-post-pilot20-q2-historical-replay.json?raw'
import q3Text from '../../content-factory/reliability-post-pilot20-q3-adversarial-requalification.json?raw'
import q6Text from '../../content-factory/reliability-post-pilot20-q6-repeated-recovery-stability.json?raw'
import soakWorkflowText from '../../.github/workflows/content-factory-live-worker-soak.yml?raw'

type Consolidation = {
  schemaVersion: number
  authority: string
  status: string
  scope: string
  baseMainSha: string
  verificationMode: string
  providerCallsUsed: boolean
  liveProviderCallsUsed: boolean
  historicalRecordsRewritten: boolean
  gates: Record<string, { status: string; evidence: string[]; conclusion: string; repetitionCount?: number; repetitionSeeds?: number[] }>
  q7: {
    status: string
    machineEligibleAfterMerge: boolean
    nextRunClass: string
    sampleCount: number
    maxSpendUsd: number
    fullCourseAssembly: boolean
    learnerPublication: boolean
    liveSoakRequestChangedByThisTransition: boolean
    liveSoakTriggeredByThisTransition: boolean
  }
  fullCourse: {
    status: string
    livePilotEligible: boolean
    qualifiedEvidence: unknown | null
    q8StillRequired: boolean
  }
  acceptance: Record<string, boolean>
  limitations: string[]
}

type Qualification = {
  status: string
  reason: string
  requiredGates: string[]
  gateStatus: Record<string, string>
  providerFreeQualificationEvidence: string
  lastProviderFreeQualificationEvidence: string
  qualifiedEvidence: { eligibilityRecord: string; q7PassRecord: string; nextPaidRunClass: string } | null
  livePilotEligible: boolean
}

type Q1Evidence = { status: string; q1Pass: boolean; blockers: unknown[] }
type SliceEvidence = { acceptance: Record<string, boolean>; historicalRecordsRewritten: boolean }
type Q6Evidence = SliceEvidence & { repetitionCount: number; repetitionSeeds: number[]; boundProviderFreeSuites: Record<string, string[]> }

const consolidation = JSON.parse(consolidationText) as Consolidation
const qualification = JSON.parse(qualificationText) as Qualification
const q1 = JSON.parse(q1Text) as Q1Evidence
const q2 = JSON.parse(q2Text) as SliceEvidence
const q3 = JSON.parse(q3Text) as SliceEvidence
const q6 = JSON.parse(q6Text) as Q6Evidence

const q1ToQ6 = [
  'Q1-compiler-worker-ownership-inventory',
  'Q2-historical-failure-replay-corpus',
  'Q3-adversarial-provider-free-subject-matrix',
  'Q4-deterministic-full-pipeline-simulation',
  'Q5-restart-reuse-dependency-invalidation',
  'Q6-repeated-provider-free-stability',
] as const

describe('Content Factory post-Pilot #20 Q1-Q6 consolidation', () => {
  it('preserves the approved-main provider-free consolidation while accepting the later Q7 PASS and Q8 transition', () => {
    expect(consolidation).toMatchObject({
      schemaVersion: 1,
      authority: '80-company-workflows/Content Factory Reliability Qualification Standard.md',
      status: 'implemented_pending_same_head_assurance',
      scope: 'post_pilot_20_q1_q6_provider_free_consolidation',
      baseMainSha: '861d017fd295a39d1135a4ccb80266909bd86172',
      verificationMode: 'exact_head_ci',
      providerCallsUsed: false,
      liveProviderCallsUsed: false,
      historicalRecordsRewritten: false,
    })

    expect(qualification.status).toBe('qualified')
    expect(qualification.livePilotEligible).toBe(true)
    expect(qualification.qualifiedEvidence).toMatchObject({
      eligibilityRecord: 'content-factory/reliability-v2-f-q8-eligibility-003.json',
      q7PassRecord: 'content-factory/reliability-v2-e-q7-live-soak-evidence-006.json',
      nextPaidRunClass: 'confirmation_pilot',
    })
    expect(qualification.providerFreeQualificationEvidence).toBe(
      'content-factory/reliability-post-pilot20-q1-q6-consolidation.json',
    )
    expect(qualification.lastProviderFreeQualificationEvidence).toBe(
      'content-factory/reliability-post-pilot19-requalification.json',
    )

    for (const gate of q1ToQ6) {
      expect(qualification.requiredGates).toContain(gate)
      expect(qualification.gateStatus[gate]).toBe('pass')
      expect(consolidation.gates[gate]?.status).toBe('pass')
      expect(consolidation.gates[gate]?.evidence.length).toBeGreaterThan(0)
    }

    expect(qualification.gateStatus['Q7-bounded-live-worker-soak']).toBe('pass')
    expect(consolidation.q7).toMatchObject({
      status: 'pending',
      machineEligibleAfterMerge: true,
      nextRunClass: 'bounded_q7_live_worker_soak',
      sampleCount: 20,
      maxSpendUsd: 5,
      fullCourseAssembly: false,
      learnerPublication: false,
      liveSoakRequestChangedByThisTransition: false,
      liveSoakTriggeredByThisTransition: false,
    })
    expect(consolidation.fullCourse).toEqual({
      status: 'paused',
      livePilotEligible: false,
      qualifiedEvidence: null,
      q8StillRequired: true,
    })
  })

  it('binds each provider-free gate to the current post-Pilot #20 evidence rather than historical qualification alone', () => {
    expect(q1.status).toBe('complete')
    expect(q1.q1Pass).toBe(true)
    expect(q1.blockers).toEqual([])

    expect(q2.acceptance.q2EvidenceReady).toBe(true)
    expect(q2.historicalRecordsRewritten).toBe(false)
    expect(q3.acceptance.q3EvidenceReady).toBe(true)
    expect(q3.historicalRecordsRewritten).toBe(false)
    expect(q6.acceptance.q6EvidenceReady).toBe(true)
    expect(q6.historicalRecordsRewritten).toBe(false)
    expect(q6.repetitionCount).toBe(3)
    expect(q6.repetitionSeeds).toEqual([211, 463, 887])
    expect(q6.boundProviderFreeSuites.Q4).toContain('src/content-factory/q4-candidate-recovery-qualification.test.ts')
    expect(q6.boundProviderFreeSuites.Q5).toContain('src/content-factory/q5-candidate-recovery-requalification.test.ts')
  })

  it('preserves the historical Q7 trigger guard while current Q8 has separately restored confirmation-pilot eligibility', () => {
    expect(soakWorkflowText).toContain("qualification.gateStatus?.[gate] !== 'pass'")
    expect(soakWorkflowText).toContain("qualification.gateStatus?.['Q7-bounded-live-worker-soak'] !== 'pending'")
    expect(soakWorkflowText).toContain("qualification.status !== 'paused'")
    expect(soakWorkflowText).toContain('qualification.livePilotEligible !== false')
    expect(soakWorkflowText).toContain('qualification.qualifiedEvidence !== null')

    expect(consolidation.acceptance).toMatchObject({
      q1Pass: true,
      q2Pass: true,
      q3Pass: true,
      q4Pass: true,
      q5Pass: true,
      q6Pass: true,
      q7Pending: true,
      providerFree: true,
      sameHeadAssuranceRequiredBeforeMerge: true,
      fullCourseRemainsPaused: true,
      q8EligibilityUnchanged: true,
      historicalRecordsRewritten: false,
    })
    expect(consolidation.limitations.join(' ')).toMatch(/does not modify the Q7 request file/i)
    expect(consolidation.limitations.join(' ')).toMatch(/separate Founder-approved Q8 transition/i)
    expect(qualification.reason).toMatch(/candidate-aware Q7 bounded live-worker soak/i)
    expect(qualification.reason).toMatch(/separate provider-free Q8 transition/i)
    expect(qualification.reason).toMatch(/does not call a provider/i)
  })
})
