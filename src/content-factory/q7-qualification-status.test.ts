import { describe, expect, it } from 'vitest'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'
import postPilot16RequalificationText from '../../content-factory/reliability-post-pilot16-requalification.json?raw'
import postPilot17RequalificationText from '../../content-factory/reliability-post-pilot17-requalification.json?raw'
import postPilot19RequalificationText from '../../content-factory/reliability-post-pilot19-requalification.json?raw'
import q8EligibilityText from '../../content-factory/reliability-v2-f-q8-eligibility.json?raw'
import livePilotWorkflowText from '../../.github/workflows/content-factory-live-pilot.yml?raw'

type QualificationRecord = {
  schemaVersion: number
  status: string
  reason: string
  triggerEvidence: { pilot: number; workflowRunId: number; jobIssueNumber: number; mainSha: string }
  latestFailureEvidence: {
    pilot: number
    workflowRunId: number
    jobIssueNumber: number
    mainSha: string
    artifactId: number
    classification: string
    defectClass: string
    architectureReview: string
  }
  requiredGates: string[]
  gateStatus: Record<string, string>
  providerFreeQualificationEvidence: string
  qualifiedEvidence: unknown | null
  livePilotEligible: boolean
}

type RequalificationRecord = {
  schemaVersion: number
  status: string
  reviewedImplementationMainSha: string
  verificationMode: string
  verificationWorkflowRunId?: number
  providerCallsUsed: boolean
  paidPilotEligible: boolean
  globalQualificationRequiredState: string
  historicalRecordsRewritten?: boolean
  gates: Record<string, { status: string; requiredShapes?: string[]; currentSemanticVersions?: Record<string, string> }>
  q7?: {
    status: string
    nextPaidRunClass: string
    sampleCount: number
    maxSpendUsd: number
    fullCourseAssembly: boolean
    learnerPublication: boolean
    requiredCoverage: string[]
  }
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

type RuntimeProcess = { execPath: string; cwd: () => string }

const qualification = JSON.parse(qualificationText) as QualificationRecord
const postPilot16Requalification = JSON.parse(postPilot16RequalificationText) as RequalificationRecord
const postPilot17Requalification = JSON.parse(postPilot17RequalificationText) as RequalificationRecord
const postPilot19Requalification = JSON.parse(postPilot19RequalificationText) as RequalificationRecord
const q8Eligibility = JSON.parse(q8EligibilityText) as Q8EligibilityRecord

const historicalV1Gates = [
  'Q1-worker-contract-inventory',
  'Q2-provider-free-contract-matrix',
  'Q3-subject-shape-matrix',
  'Q4-deterministic-pipeline-simulation',
  'Q5-restart-reuse-dependency-invalidation',
  'Q6-repeated-qualification-stability',
]

const providerFreeV2Gates = [
  'Q1-compiler-worker-ownership-inventory',
  'Q2-historical-failure-replay-corpus',
  'Q3-adversarial-provider-free-subject-matrix',
  'Q4-deterministic-full-pipeline-simulation',
  'Q5-restart-reuse-dependency-invalidation',
  'Q6-repeated-provider-free-stability',
]

const requiredV2Gates = [...providerFreeV2Gates, 'Q7-bounded-live-worker-soak']

describe('Content Factory Reliability v2 status after Confirmation Pilot #19', () => {
  it('keeps paid full-course eligibility paused after exact-head Q1-Q6 PASS', () => {
    expect(qualification).toMatchObject({
      schemaVersion: 1,
      status: 'paused',
      livePilotEligible: false,
      qualifiedEvidence: null,
      providerFreeQualificationEvidence: 'content-factory/reliability-post-pilot19-requalification.json',
    })
    expect(qualification.requiredGates).toEqual(requiredV2Gates)
    for (const gate of providerFreeV2Gates) {
      expect(qualification.gateStatus[gate]).toBe('pass')
    }
    expect(qualification.gateStatus['Q7-bounded-live-worker-soak']).toBe('required_after_pilot19')
    expect(qualification.reason).toContain('Confirmation Pilot #19')
    expect(qualification.latestFailureEvidence).toMatchObject({
      pilot: 19,
      workflowRunId: 33371449134,
      jobIssueNumber: 254,
      mainSha: '23b0849354e99d6be865361009388af5922d2f3f',
      artifactId: 9750570226,
      classification: 'new_generic_engineering_contract_class',
      defectClass: 'assessment_mcq_cognitive_demand_lexical_overconstraint',
      architectureReview: 'content-factory/reliability-pilot19-assessment-architecture-review.json',
    })
  })

  it('records the production-verified Pilot #19 Q1-Q6 requalification without authorising paid full-course execution', () => {
    expect(postPilot19Requalification).toMatchObject({
      schemaVersion: 1,
      status: 'complete',
      reviewedImplementationMainSha: '119cde951b9cd76410d7c091ee00b872c00f4a39',
      verificationMode: 'exact_head_post_merge_ci',
      verificationWorkflowRunId: 33383475298,
      providerCallsUsed: false,
      paidPilotEligible: false,
      globalQualificationRequiredState: 'paused',
      historicalRecordsRewritten: false,
    })
    expect(Object.keys(postPilot19Requalification.gates).sort()).toEqual([...providerFreeV2Gates].sort())
    expect(Object.values(postPilot19Requalification.gates).every((gate) => gate.status === 'pass')).toBe(true)
    expect(postPilot19Requalification.gates['Q3-adversarial-provider-free-subject-matrix'].requiredShapes).toHaveLength(5)
    expect(postPilot19Requalification.gates['Q5-restart-reuse-dependency-invalidation'].currentSemanticVersions).toEqual({
      generateAssessmentItem: '2+output-integrity-v5',
    })
    expect(postPilot19Requalification.q7).toMatchObject({
      status: 'required',
      nextPaidRunClass: 'bounded_q7_live_worker_soak',
      sampleCount: 20,
      maxSpendUsd: 5,
      fullCourseAssembly: false,
      learnerPublication: false,
    })
    expect(postPilot19Requalification.q7?.requiredCoverage).toEqual(expect.arrayContaining([
      'knowledge MCQ',
      'application MCQ',
      'calculation demand guard',
      'interpretation demand guard',
    ]))
  })

  it('preserves Q8 as the historical eligibility-only decision that authorised Pilot #19', () => {
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

  it('preserves historical v1 requalification evidence without rewriting it', () => {
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
    expect(postPilot16Requalification.reviewedImplementationMainSha).toBe('9f4d86dbeaca5a6fac13884bf8b161964a68ec88')
  })

  it('preserves Pilot #18 as the historical Reliability-v2 trigger rather than rewriting it', () => {
    expect(qualification.triggerEvidence).toEqual({
      pilot: 18,
      workflowRunId: 33239396439,
      jobIssueNumber: 234,
      mainSha: 'ed3bd4c4a50dd723da38952a41ff9bad084ad68d',
    })
  })

  it('fails the same paid-live-pilot preflight before any provider call while paused', async () => {
    const moduleName = 'node:child_process'
    const childProcess = await import(/* @vite-ignore */ moduleName) as {
      execFileSync: (file: string, args: string[], options: { cwd: string; encoding: string; stdio: string }) => string
    }
    const runtimeProcess = (globalThis as unknown as { process: RuntimeProcess }).process

    expect(() => childProcess.execFileSync(runtimeProcess.execPath, ['scripts/content-factory-live-pilot-qualification.mjs'], {
      cwd: runtimeProcess.cwd(),
      encoding: 'utf8',
      stdio: 'pipe',
    })).toThrow()
  })

  it('keeps qualification preflight before the paid live-adapter execution step with no bypass', () => {
    const preflight = livePilotWorkflowText.indexOf('Verify course-agnostic Content Factory reliability qualification')
    const liveRun = livePilotWorkflowText.indexOf('Run rights-safe live adapter pilot')
    expect(preflight).toBeGreaterThan(-1)
    expect(liveRun).toBeGreaterThan(preflight)
    expect(livePilotWorkflowText).not.toContain('continue-on-error: true')
  })
})
