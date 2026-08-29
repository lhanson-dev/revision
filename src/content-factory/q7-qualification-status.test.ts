import { describe, expect, it } from 'vitest'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'
import postPilot16RequalificationText from '../../content-factory/reliability-post-pilot16-requalification.json?raw'
import postPilot17RequalificationText from '../../content-factory/reliability-post-pilot17-requalification.json?raw'
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
  qualifiedEvidence: unknown | null
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

type RuntimeProcess = {
  execPath: string
  cwd: () => string
}

const qualification = JSON.parse(qualificationText) as QualificationRecord
const postPilot16Requalification = JSON.parse(postPilot16RequalificationText) as RequalificationRecord
const postPilot17Requalification = JSON.parse(postPilot17RequalificationText) as RequalificationRecord

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

describe('Content Factory qualification state after Confirmation Pilot 18', () => {
  it('preserves the completed v1 post-Pilot-17 evidence as history while current eligibility returns to paused', () => {
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

    expect(qualification).toMatchObject({
      schemaVersion: 1,
      status: 'paused',
      livePilotEligible: false,
      qualifiedEvidence: null,
    })
    expect(qualification.requiredGates).toEqual(requiredV2Gates)
  })

  it('preserves earlier post-Pilot-16 requalification as historical evidence', () => {
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

  it('records Pilot 18 as the current trigger without rewriting Pilot 17 history', () => {
    expect(qualification.triggerEvidence).toEqual({
      pilot: 18,
      workflowRunId: 33239396439,
      jobIssueNumber: 234,
      mainSha: 'ed3bd4c4a50dd723da38952a41ff9bad084ad68d',
    })
    expect(qualification.reason).toContain('Pilot #18')
    expect(qualification.reason).toContain('complete-diagnostic validation')
  })

  it('is rejected by the same fail-closed preflight before any paid full-course provider execution', async () => {
    const moduleName = 'node:child_process'
    const childProcess = await import(/* @vite-ignore */ moduleName) as {
      execFileSync: (
        file: string,
        args: string[],
        options: { cwd: string; encoding: string; stdio: string },
      ) => string
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
