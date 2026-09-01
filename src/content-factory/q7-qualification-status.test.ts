import { describe, expect, it } from 'vitest'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'
import postPilot19RequalificationText from '../../content-factory/reliability-post-pilot19-requalification.json?raw'
import fourthQ7EvidenceText from '../../content-factory/reliability-v2-e-q7-live-soak-evidence-004.json?raw'
import sixthQ7EvidenceText from '../../content-factory/reliability-v2-e-q7-live-soak-evidence-006.json?raw'
import historicalQ8Text from '../../content-factory/reliability-v2-f-q8-eligibility.json?raw'
import priorQ8Text from '../../content-factory/reliability-v2-f-q8-eligibility-002.json?raw'
import currentQ8Text from '../../content-factory/reliability-v2-f-q8-eligibility-003.json?raw'
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
type Q7Evidence = {
  workflow: { runId: number; artifactId: number; mainSha?: string }
  sampleSummary: { executed: number; accepted: number; controlledFailClosed: number; infrastructureIncidents: number; engineeringBoundaryBreaches: number; targetedRepairsObserved?: number; freshCandidateResamplesObserved?: number; providerCallClassificationComplete?: boolean }
  classification: { decision: string; instrumentationComplete?: boolean; candidateRecoveryObserved?: boolean }
}
type Q8 = {
  status?: string
  reviewedApprovedMainSha: string
  providerCallsUsed?: boolean
  fullCourseExecutionTriggered?: boolean
  courseAssemblyTriggered?: boolean
  learnerPublicationTriggered?: boolean
  historicalRecordsRewritten: boolean
  qualificationEvidence?: { providerFreeQ1ToQ6: string; q7Pass: string; q7PassingAttempt?: number; q7WorkflowRunId: number; q7ExecutedSamples: number; q7AcceptedSamples: number; q7ControlledFailClosedSamples: number }
  passedGates?: string[]
  decision: { qualificationStatus?: string; livePilotEligible?: boolean; nextPaidRunClass?: string; confirmationPilotEligibleAfterMerge?: boolean; confirmationPilotTriggeredByThisChange?: boolean; maturityAchieved?: boolean; pilot19EligibleAfterMerge?: boolean; pilot19TriggeredByThisChange?: boolean }
}

const qualification = JSON.parse(qualificationText) as Qualification
const postPilot19 = JSON.parse(postPilot19RequalificationText) as { status: string; providerCallsUsed: boolean }
const fourthQ7 = JSON.parse(fourthQ7EvidenceText) as Q7Evidence
const sixthQ7 = JSON.parse(sixthQ7EvidenceText) as Q7Evidence
const historicalQ8 = JSON.parse(historicalQ8Text) as Q8
const priorQ8 = JSON.parse(priorQ8Text) as Q8
const currentQ8 = JSON.parse(currentQ8Text) as Q8
const providerFreeGates = ['Q1-compiler-worker-ownership-inventory','Q2-historical-failure-replay-corpus','Q3-adversarial-provider-free-subject-matrix','Q4-deterministic-full-pipeline-simulation','Q5-restart-reuse-dependency-invalidation','Q6-repeated-provider-free-stability']
const gates = [...providerFreeGates, 'Q7-bounded-live-worker-soak']

describe('Content Factory Reliability v2 status after post-Pilot #20 Q8', () => {
  it('records current Q1-Q7 PASS and restores one confirmation-pilot eligibility through Q8', () => {
    expect(qualification).toMatchObject({
      status: 'qualified',
      livePilotEligible: true,
      requiredGates: gates,
      providerFreeQualificationEvidence: 'content-factory/reliability-post-pilot20-q1-q6-consolidation.json',
      lastProviderFreeQualificationEvidence: 'content-factory/reliability-post-pilot19-requalification.json',
      q7PassEvidence: 'content-factory/reliability-v2-e-q7-live-soak-evidence-006.json',
      q7PassEvidenceHistory: ['content-factory/reliability-v2-e-q7-live-soak-evidence-003.json','content-factory/reliability-v2-e-q7-live-soak-evidence-004.json'],
      qualifiedEvidence: {
        qualificationEvidenceMainSha: '3b5cbb1ed5404f1d6692880e79b44847281e0b6f',
        eligibilityRecord: 'content-factory/reliability-v2-f-q8-eligibility-003.json',
        providerFreeQualificationRecord: 'content-factory/reliability-post-pilot20-q1-q6-consolidation.json',
        q7PassRecord: 'content-factory/reliability-v2-e-q7-live-soak-evidence-006.json',
        q7PassingAttempt: 6,
        q7WorkflowRunId: 33554413877,
        q7ExecutedSamples: 20,
        q7AcceptedSamples: 20,
        q7ControlledFailClosedSamples: 0,
        passedGates: gates,
        nextPaidRunClass: 'confirmation_pilot',
      },
    })
    for (const gate of gates) expect(qualification.gateStatus[gate]).toBe('pass')
  })

  it('binds Q7 PASS and Q8 eligibility to the exact candidate-aware evidence without side effects', () => {
    expect(sixthQ7).toMatchObject({
      workflow: { runId: 33554413877, artifactId: 9818944889, mainSha: 'e74e04613c8d9fa8d7eba617bb839ef368d26029' },
      sampleSummary: { executed: 20, accepted: 20, controlledFailClosed: 0, infrastructureIncidents: 0, engineeringBoundaryBreaches: 0, targetedRepairsObserved: 10, freshCandidateResamplesObserved: 1, providerCallClassificationComplete: true },
      classification: { decision: 'q7_pass_no_new_generic_engineering_contract_class', instrumentationComplete: true, candidateRecoveryObserved: true },
    })
    expect(currentQ8).toMatchObject({
      status: 'eligible_for_confirmation_pilot',
      reviewedApprovedMainSha: '3b5cbb1ed5404f1d6692880e79b44847281e0b6f',
      providerCallsUsed: false,
      fullCourseExecutionTriggered: false,
      courseAssemblyTriggered: false,
      learnerPublicationTriggered: false,
      historicalRecordsRewritten: false,
      qualificationEvidence: { providerFreeQ1ToQ6: 'content-factory/reliability-post-pilot20-q1-q6-consolidation.json', q7Pass: 'content-factory/reliability-v2-e-q7-live-soak-evidence-006.json', q7PassingAttempt: 6, q7WorkflowRunId: 33554413877, q7ExecutedSamples: 20, q7AcceptedSamples: 20, q7ControlledFailClosedSamples: 0 },
      passedGates: gates,
      decision: { qualificationStatus: 'qualified', livePilotEligible: true, nextPaidRunClass: 'confirmation_pilot', confirmationPilotEligibleAfterMerge: true, confirmationPilotTriggeredByThisChange: false, maturityAchieved: false },
    })
  })

  it('preserves the post-Pilot #19 Q7 and Q8 records as historical evidence', () => {
    expect(postPilot19).toEqual(expect.objectContaining({ status: 'complete', providerCallsUsed: false }))
    expect(fourthQ7).toMatchObject({ workflow: { runId: 33395187056, artifactId: 9759214890 }, sampleSummary: { executed: 20, accepted: 20, controlledFailClosed: 0, infrastructureIncidents: 0, engineeringBoundaryBreaches: 0 }, classification: { decision: 'q7_pass_no_new_generic_engineering_contract_class' } })
    expect(priorQ8).toMatchObject({ reviewedApprovedMainSha: 'f2b9b43ccddc0111859da39cff4900343065f7a2', providerCallsUsed: false, fullCourseExecutionTriggered: false, courseAssemblyTriggered: false, learnerPublicationTriggered: false, historicalRecordsRewritten: false, decision: { qualificationStatus: 'qualified', livePilotEligible: true, nextPaidRunClass: 'confirmation_pilot', confirmationPilotTriggeredByThisChange: false, maturityAchieved: false } })
    expect(historicalQ8).toMatchObject({ reviewedApprovedMainSha: '166f9cb6957b995b81ff3eec84062b2f09ecec6c', decision: { pilot19EligibleAfterMerge: true, pilot19TriggeredByThisChange: false }, historicalRecordsRewritten: false })
  })

  it('passes the paid live-pilot preflight after the governed Q8 state is present', async () => {
    const moduleName = 'node:child_process'
    const childProcess = await import(/* @vite-ignore */ moduleName) as { execFileSync: (file: string, args: string[], options: { cwd: string; encoding: string; stdio: string }) => string }
    const runtimeProcess = (globalThis as unknown as { process: RuntimeProcess }).process
    const stdout = childProcess.execFileSync(runtimeProcess.execPath, ['scripts/content-factory-live-pilot-qualification.mjs'], { cwd: runtimeProcess.cwd(), encoding: 'utf8', stdio: 'pipe' })
    expect(stdout).toContain('Content Factory reliability qualification is PASS; paid live pilot execution is eligible.')
  })

  it('keeps qualification preflight before paid execution with no bypass', () => {
    const preflight = livePilotWorkflowText.indexOf('Verify course-agnostic Content Factory reliability qualification')
    const liveRun = livePilotWorkflowText.indexOf('Run rights-safe live adapter pilot')
    expect(preflight).toBeGreaterThan(-1)
    expect(liveRun).toBeGreaterThan(preflight)
    expect(livePilotWorkflowText).not.toContain('continue-on-error: true')
  })
})
