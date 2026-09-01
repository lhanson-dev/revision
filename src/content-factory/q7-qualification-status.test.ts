import { describe, expect, it } from 'vitest'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'
import postPilot19RequalificationText from '../../content-factory/reliability-post-pilot19-requalification.json?raw'
import fourthQ7EvidenceText from '../../content-factory/reliability-v2-e-q7-live-soak-evidence-004.json?raw'
import historicalQ8Text from '../../content-factory/reliability-v2-f-q8-eligibility.json?raw'
import currentQ8Text from '../../content-factory/reliability-v2-f-q8-eligibility-002.json?raw'
import livePilotWorkflowText from '../../.github/workflows/content-factory-live-pilot.yml?raw'

type RuntimeProcess = { execPath: string; cwd: () => string }

type Qualification = {
  status: string
  livePilotEligible: boolean
  requiredGates: string[]
  gateStatus: Record<string, string>
  providerFreeQualificationEvidence: string
  lastProviderFreeQualificationEvidence: string
  q7PassEvidence: string
  q7PassEvidenceHistory: string[]
  qualifiedEvidence: {
    qualificationEvidenceMainSha: string
    eligibilityRecord: string
    providerFreeQualificationRecord: string
    q7PassRecord: string
    q7PassingAttempt: number
    q7WorkflowRunId: number
    q7ExecutedSamples: number
    q7AcceptedSamples: number
    q7ControlledFailClosedSamples: number
    passedGates: string[]
    nextPaidRunClass: string
  } | null
}

type PostPilot19 = { status: string; providerCallsUsed: boolean }
type Q7Evidence = {
  workflow: { runId: number; artifactId: number }
  sampleSummary: { executed: number; accepted: number; controlledFailClosed: number; infrastructureIncidents: number; engineeringBoundaryBreaches: number }
  classification: { decision: string }
}
type Q8 = {
  status?: string
  reviewedApprovedMainSha: string
  providerCallsUsed?: boolean
  fullCourseExecutionTriggered?: boolean
  courseAssemblyTriggered?: boolean
  learnerPublicationTriggered?: boolean
  historicalRecordsRewritten: boolean
  passedGates?: string[]
  decision: {
    qualificationStatus?: string
    livePilotEligible?: boolean
    nextPaidRunClass?: string
    confirmationPilotEligibleAfterMerge?: boolean
    confirmationPilotTriggeredByThisChange?: boolean
    maturityAchieved?: boolean
    pilot19EligibleAfterMerge?: boolean
    pilot19TriggeredByThisChange?: boolean
  }
}

const qualification = JSON.parse(qualificationText) as Qualification
const postPilot19 = JSON.parse(postPilot19RequalificationText) as PostPilot19
const fourthQ7 = JSON.parse(fourthQ7EvidenceText) as Q7Evidence
const historicalQ8 = JSON.parse(historicalQ8Text) as Q8
const currentQ8 = JSON.parse(currentQ8Text) as Q8

const providerFreeGates = [
  'Q1-compiler-worker-ownership-inventory',
  'Q2-historical-failure-replay-corpus',
  'Q3-adversarial-provider-free-subject-matrix',
  'Q4-deterministic-full-pipeline-simulation',
  'Q5-restart-reuse-dependency-invalidation',
  'Q6-repeated-provider-free-stability',
]
const gates = [...providerFreeGates, 'Q7-bounded-live-worker-soak']

describe('Content Factory Reliability v2 status after Pilot #20 stop-loss', () => {
  it('preserves post-Pilot #19 Q7/Q8 history while current Q1-Q6 are requalified and confirmation remains paused', () => {
    expect(qualification.status).toBe('paused')
    expect(qualification.livePilotEligible).toBe(false)
    expect(qualification.requiredGates).toEqual(gates)
    for (const gate of providerFreeGates) expect(qualification.gateStatus[gate]).toBe('pass')
    expect(qualification.gateStatus['Q7-bounded-live-worker-soak']).toBe('pending')
    expect(qualification.providerFreeQualificationEvidence).toBe('content-factory/reliability-post-pilot20-q1-q6-consolidation.json')
    expect(qualification.lastProviderFreeQualificationEvidence).toBe('content-factory/reliability-post-pilot19-requalification.json')
    expect(qualification.q7PassEvidence).toBe('content-factory/reliability-v2-e-q7-live-soak-evidence-004.json')
    expect(qualification.q7PassEvidenceHistory).toEqual(['content-factory/reliability-v2-e-q7-live-soak-evidence-003.json'])
    expect(qualification.qualifiedEvidence).toBeNull()
  })

  it('preserves the clean post-Pilot #19 Q7 and Q8 records as historical evidence', () => {
    expect(postPilot19.status).toBe('complete')
    expect(postPilot19.providerCallsUsed).toBe(false)
    expect(fourthQ7).toMatchObject({
      workflow: { runId: 33395187056, artifactId: 9759214890 },
      sampleSummary: { executed: 20, accepted: 20, controlledFailClosed: 0, infrastructureIncidents: 0, engineeringBoundaryBreaches: 0 },
      classification: { decision: 'q7_pass_no_new_generic_engineering_contract_class' },
    })
    expect(currentQ8).toMatchObject({
      status: 'eligible_for_confirmation_pilot',
      reviewedApprovedMainSha: 'f2b9b43ccddc0111859da39cff4900343065f7a2',
      providerCallsUsed: false,
      fullCourseExecutionTriggered: false,
      courseAssemblyTriggered: false,
      learnerPublicationTriggered: false,
      historicalRecordsRewritten: false,
      passedGates: gates,
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

  it('preserves the earlier Q8 decision as historical evidence', () => {
    expect(historicalQ8).toMatchObject({
      reviewedApprovedMainSha: '166f9cb6957b995b81ff3eec84062b2f09ecec6c',
      decision: { pilot19EligibleAfterMerge: true, pilot19TriggeredByThisChange: false },
      historicalRecordsRewritten: false,
    })
  })

  it('fails the paid live-pilot preflight while the machine is paused', async () => {
    const moduleName = 'node:child_process'
    const childProcess = await import(/* @vite-ignore */ moduleName) as { execFileSync: (file: string, args: string[], options: { cwd: string; encoding: string; stdio: string }) => string }
    const runtimeProcess = (globalThis as unknown as { process: RuntimeProcess }).process
    expect(() => childProcess.execFileSync(runtimeProcess.execPath, ['scripts/content-factory-live-pilot-qualification.mjs'], { cwd: runtimeProcess.cwd(), encoding: 'utf8', stdio: 'pipe' })).toThrow()
  })

  it('keeps qualification preflight before paid execution with no bypass', () => {
    const preflight = livePilotWorkflowText.indexOf('Verify course-agnostic Content Factory reliability qualification')
    const liveRun = livePilotWorkflowText.indexOf('Run rights-safe live adapter pilot')
    expect(preflight).toBeGreaterThan(-1)
    expect(liveRun).toBeGreaterThan(preflight)
    expect(livePilotWorkflowText).not.toContain('continue-on-error: true')
  })
})
