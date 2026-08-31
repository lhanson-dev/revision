import { describe, expect, it } from 'vitest'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'
import postPilot16RequalificationText from '../../content-factory/reliability-post-pilot16-requalification.json?raw'
import postPilot17RequalificationText from '../../content-factory/reliability-post-pilot17-requalification.json?raw'
import q8EligibilityText from '../../content-factory/reliability-v2-f-q8-eligibility.json?raw'
import livePilotWorkflowText from '../../.github/workflows/content-factory-live-pilot.yml?raw'

type QualificationRecord = {
  schemaVersion: number
  status: string
  reason: string
  triggerEvidence: {
    pilot: number
    workflowRunId: number
    jobIssueNumber: number
    mainSha: string
  }
  requiredGates: string[]
  qualifiedEvidence: {
    reliabilityVersion: string
    qualificationEvidenceMainSha: string
    eligibilityRecord: string
    providerFreeQualificationRecord: string
    q7PassRecord: string
    verificationMode: string
    providerCallsUsed: boolean
    passedGates: string[]
    q6RepetitionCount: number
    q7PassingAttempt: number
    q7WorkflowRunId: number
    q7ExecutedSamples: number
    q7ControlledFailClosedSamples: number
    q7Classification: string
    nextPaidRunClass: string
  } | null
  livePilotEligible: boolean
}

type RequalificationRecord = {
  schemaVersion: number
  status: string
  reviewedImplementationMainSha: string
  verificationMode: string
  providerCallsUsed: boolean
  paidPilotEligible: boolean
  globalQualificationRequiredState: string
  gates: Record<string, { status: string }>
}

type Q8EligibilityRecord = {
  schemaVersion: number
  workItem: string
  gate: string
  status: string
  reviewedApprovedMainSha: string
  providerCallsUsed: boolean
  fullCourseExecutionTriggered: boolean
  courseAssemblyTriggered: boolean
  learnerPublicationTriggered: boolean
  historicalRecordsRewritten: boolean
  passedGates: string[]
  decision: {
    qualificationStatus: string
    livePilotEligible: boolean
    nextPaidRunClass: string
    pilot19EligibleAfterMerge: boolean
    pilot19TriggeredByThisChange: boolean
    maturityAchieved: boolean
  }
}

type RuntimeProcess = {
  execPath: string
  cwd: () => string
}

const qualification = JSON.parse(qualificationText) as QualificationRecord
const postPilot16Requalification = JSON.parse(postPilot16RequalificationText) as RequalificationRecord
const postPilot17Requalification = JSON.parse(postPilot17RequalificationText) as RequalificationRecord
const q8Eligibility = JSON.parse(q8EligibilityText) as Q8EligibilityRecord

const historicalV1Gates = [
  'Q1-worker-contract-inventory',
  'Q2-provider-free-contract-matrix',
  'Q3-subject-shape-matrix',
  'Q4-deterministic-pipeline-simulation',
  'Q5-restart-reuse-dependency-invalidation',
  'Q6-repeated-qualification-stability',
]

const requiredV2Gates = [
  'Q1-compiler-worker-ownership-inventory',
  'Q2-historical-failure-replay-corpus',
  'Q3-adversarial-provider-free-subject-matrix',
  'Q4-deterministic-full-pipeline-simulation',
  'Q5-restart-reuse-dependency-invalidation',
  'Q6-repeated-provider-free-stability',
  'Q7-bounded-live-worker-soak',
]

describe('Content Factory Reliability v2 Q8 qualification status', () => {
  it('restores confirmation-pilot eligibility only after all Q1-Q7 gates are durably passed', () => {
    expect(qualification).toMatchObject({
      schemaVersion: 1,
      status: 'qualified',
      livePilotEligible: true,
    })
    expect(qualification.requiredGates).toEqual(requiredV2Gates)
    expect(qualification.qualifiedEvidence).not.toBeNull()
    expect(qualification.qualifiedEvidence).toMatchObject({
      reliabilityVersion: '2.0',
      qualificationEvidenceMainSha: '166f9cb6957b995b81ff3eec84062b2f09ecec6c',
      eligibilityRecord: 'content-factory/reliability-v2-f-q8-eligibility.json',
      providerFreeQualificationRecord: 'content-factory/reliability-post-q7-002-assessment-item-requalification.json',
      q7PassRecord: 'content-factory/reliability-v2-e-q7-live-soak-evidence-003.json',
      verificationMode: 'approved_main_q1_q7_evidence_plus_exact_head_ci',
      providerCallsUsed: false,
      passedGates: requiredV2Gates,
      q6RepetitionCount: 3,
      q7PassingAttempt: 3,
      q7WorkflowRunId: 33364521121,
      q7ExecutedSamples: 20,
      q7ControlledFailClosedSamples: 4,
      q7Classification: 'q7_pass_no_new_generic_engineering_contract_class',
      nextPaidRunClass: 'confirmation_pilot',
    })
  })

  it('records Q8 as an eligibility-only change with no paid execution or publication side effect', () => {
    expect(q8Eligibility).toMatchObject({
      schemaVersion: 1,
      workItem: 'V2-F',
      gate: 'Q8',
      status: 'eligible_for_confirmation_pilot',
      reviewedApprovedMainSha: '166f9cb6957b995b81ff3eec84062b2f09ecec6c',
      providerCallsUsed: false,
      fullCourseExecutionTriggered: false,
      courseAssemblyTriggered: false,
      learnerPublicationTriggered: false,
      historicalRecordsRewritten: false,
      passedGates: requiredV2Gates,
      decision: {
        qualificationStatus: 'qualified',
        livePilotEligible: true,
        nextPaidRunClass: 'confirmation_pilot',
        pilot19EligibleAfterMerge: true,
        pilot19TriggeredByThisChange: false,
        maturityAchieved: false,
      },
    })
  })

  it('preserves historical v1 requalification evidence without rewriting its original paused state', () => {
    expect(postPilot17Requalification).toMatchObject({
      schemaVersion: 1,
      status: 'complete',
      reviewedImplementationMainSha: 'd5fe9e8bc2eee82f0236711361739abe129e782a',
      verificationMode: 'exact_head_ci',
      providerCallsUsed: false,
      paidPilotEligible: false,
      globalQualificationRequiredState: 'paused',
    })
    expect(Object.keys(postPilot17Requalification.gates).sort()).toEqual([...historicalV1Gates].sort())
    for (const gate of historicalV1Gates) expect(postPilot17Requalification.gates[gate]?.status).toBe('pass')

    expect(postPilot16Requalification).toMatchObject({
      schemaVersion: 1,
      status: 'complete',
      reviewedImplementationMainSha: '9f4d86dbeaca5a6fac13884bf8b161964a68ec88',
      verificationMode: 'exact_head_ci',
      providerCallsUsed: false,
      paidPilotEligible: false,
      globalQualificationRequiredState: 'paused',
    })
  })

  it('preserves Pilot 18 as the historical trigger for Reliability v2 rather than rewriting it', () => {
    expect(qualification.triggerEvidence).toEqual({
      pilot: 18,
      workflowRunId: 33239396439,
      jobIssueNumber: 234,
      mainSha: 'ed3bd4c4a50dd723da38952a41ff9bad084ad68d',
    })
    expect(qualification.reason).toContain('Reliability v2 Q1-Q7 qualification is complete')
  })

  it('is accepted by the same fail-closed preflight that runs before a paid full-course confirmation pilot', async () => {
    const moduleName = 'node:child_process'
    const childProcess = await import(/* @vite-ignore */ moduleName) as {
      execFileSync: (
        file: string,
        args: string[],
        options: { cwd: string; encoding: string; stdio: string },
      ) => string
    }
    const runtimeProcess = (globalThis as unknown as { process: RuntimeProcess }).process

    const output = childProcess.execFileSync(runtimeProcess.execPath, ['scripts/content-factory-live-pilot-qualification.mjs'], {
      cwd: runtimeProcess.cwd(),
      encoding: 'utf8',
      stdio: 'pipe',
    })
    expect(output).toContain('paid live pilot execution is eligible')
  })

  it('keeps qualification preflight before the paid live-adapter execution step with no bypass', () => {
    const preflight = livePilotWorkflowText.indexOf('Verify course-agnostic Content Factory reliability qualification')
    const liveRun = livePilotWorkflowText.indexOf('Run rights-safe live adapter pilot')
    expect(preflight).toBeGreaterThan(-1)
    expect(liveRun).toBeGreaterThan(preflight)
    expect(livePilotWorkflowText).not.toContain('continue-on-error: true')
  })
})
