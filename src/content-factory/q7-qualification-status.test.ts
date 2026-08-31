import { describe, expect, it } from 'vitest'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'
import postPilot19RequalificationText from '../../content-factory/reliability-post-pilot19-requalification.json?raw'
import fourthQ7EvidenceText from '../../content-factory/reliability-v2-e-q7-live-soak-evidence-004.json?raw'
import historicalQ8Text from '../../content-factory/reliability-v2-f-q8-eligibility.json?raw'
import currentQ8Text from '../../content-factory/reliability-v2-f-q8-eligibility-002.json?raw'
import livePilotWorkflowText from '../../.github/workflows/content-factory-live-pilot.yml?raw'

type RuntimeProcess = { execPath: string; cwd: () => string }

const qualification = JSON.parse(qualificationText) as any
const postPilot19 = JSON.parse(postPilot19RequalificationText) as any
const fourthQ7 = JSON.parse(fourthQ7EvidenceText) as any
const historicalQ8 = JSON.parse(historicalQ8Text) as any
const currentQ8 = JSON.parse(currentQ8Text) as any

const gates = [
  'Q1-compiler-worker-ownership-inventory',
  'Q2-historical-failure-replay-corpus',
  'Q3-adversarial-provider-free-subject-matrix',
  'Q4-deterministic-full-pipeline-simulation',
  'Q5-restart-reuse-dependency-invalidation',
  'Q6-repeated-provider-free-stability',
  'Q7-bounded-live-worker-soak',
]

describe('Content Factory Reliability v2 post-Pilot #19 Q8 eligibility', () => {
  it('restores confirmation-pilot eligibility only after Q1-Q7 PASS', () => {
    expect(qualification.status).toBe('qualified')
    expect(qualification.livePilotEligible).toBe(true)
    expect(qualification.requiredGates).toEqual(gates)
    for (const gate of gates) expect(qualification.gateStatus[gate]).toBe('pass')
    expect(qualification.providerFreeQualificationEvidence).toBe('content-factory/reliability-post-pilot19-requalification.json')
    expect(qualification.q7PassEvidence).toBe('content-factory/reliability-v2-e-q7-live-soak-evidence-004.json')
    expect(qualification.q7PassEvidenceHistory).toEqual(['content-factory/reliability-v2-e-q7-live-soak-evidence-003.json'])
    expect(qualification.qualifiedEvidence).toMatchObject({
      qualificationEvidenceMainSha: 'f2b9b43ccddc0111859da39cff4900343065f7a2',
      eligibilityRecord: 'content-factory/reliability-v2-f-q8-eligibility-002.json',
      providerFreeQualificationRecord: 'content-factory/reliability-post-pilot19-requalification.json',
      q7PassRecord: 'content-factory/reliability-v2-e-q7-live-soak-evidence-004.json',
      q7PassingAttempt: 4,
      q7WorkflowRunId: 33395187056,
      q7ExecutedSamples: 20,
      q7AcceptedSamples: 20,
      q7ControlledFailClosedSamples: 0,
      passedGates: gates,
      nextPaidRunClass: 'confirmation_pilot',
    })
  })

  it('binds Q8 to the clean post-Pilot #19 Q7 evidence', () => {
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

  it('allows the fail-closed preflight only because the qualified evidence is complete', async () => {
    const moduleName = 'node:child_process'
    const childProcess = await import(/* @vite-ignore */ moduleName) as { execFileSync: (file: string, args: string[], options: { cwd: string; encoding: string; stdio: string }) => string }
    const runtimeProcess = (globalThis as unknown as { process: RuntimeProcess }).process
    expect(() => childProcess.execFileSync(runtimeProcess.execPath, ['scripts/content-factory-live-pilot-qualification.mjs'], { cwd: runtimeProcess.cwd(), encoding: 'utf8', stdio: 'pipe' })).not.toThrow()
  })

  it('keeps qualification preflight before paid execution with no bypass', () => {
    const preflight = livePilotWorkflowText.indexOf('Verify course-agnostic Content Factory reliability qualification')
    const liveRun = livePilotWorkflowText.indexOf('Run rights-safe live adapter pilot')
    expect(preflight).toBeGreaterThan(-1)
    expect(liveRun).toBeGreaterThan(preflight)
    expect(livePilotWorkflowText).not.toContain('continue-on-error: true')
  })
})
