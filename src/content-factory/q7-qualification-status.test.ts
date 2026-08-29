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
  qualifiedEvidence: {
    qualificationEvidenceMainSha: string
    requalificationRecord: string
    verificationMode: string
    providerCallsUsed: boolean
    passedGates: string[]
    q6RepetitionCount: number
    nextPaidRunClass: string
    limitations: string[]
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

type RuntimeProcess = {
  execPath: string
  cwd: () => string
}

const qualification = JSON.parse(qualificationText) as QualificationRecord
const postPilot16Requalification = JSON.parse(postPilot16RequalificationText) as RequalificationRecord
const postPilot17Requalification = JSON.parse(postPilot17RequalificationText) as RequalificationRecord

const expectedGates = [
  'Q1-worker-contract-inventory',
  'Q2-provider-free-contract-matrix',
  'Q3-subject-shape-matrix',
  'Q4-deterministic-pipeline-simulation',
  'Q5-restart-reuse-dependency-invalidation',
  'Q6-repeated-qualification-stability',
]

describe('Content Factory qualification status after post-Pilot-17 requalification', () => {
  it('changes only the global eligibility state after current provider-free Q1-Q6 evidence is merged on approved main', () => {
    expect(postPilot17Requalification).toMatchObject({
      schemaVersion: 1,
      status: 'complete',
      reviewedImplementationMainSha: 'd5fe9e8bc2eee82f0236711361739abe129e782a',
      verificationMode: 'exact_head_ci',
      providerCallsUsed: false,
      paidPilotEligible: false,
      globalQualificationRequiredState: 'paused',
    })
    expect(Object.keys(postPilot17Requalification.gates).sort()).toEqual([...expectedGates].sort())
    for (const gate of expectedGates) expect(postPilot17Requalification.gates[gate]?.status).toBe('pass')

    expect(qualification.schemaVersion).toBe(1)
    expect(qualification.status).toBe('qualified')
    expect(qualification.livePilotEligible).toBe(true)
    expect(qualification.requiredGates).toEqual(expectedGates)
    expect(qualification.qualifiedEvidence).not.toBeNull()
    expect(qualification.qualifiedEvidence).toMatchObject({
      qualificationEvidenceMainSha: '519aee37d796791cdca302e0d77b0da2c25f1b74',
      requalificationRecord: 'content-factory/reliability-post-pilot17-requalification.json',
      verificationMode: 'exact_head_ci',
      providerCallsUsed: false,
      passedGates: expectedGates,
      q6RepetitionCount: 3,
      nextPaidRunClass: 'confirmation_pilot',
    })
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

  it('preserves Pilot 17 as historical trigger evidence rather than rewriting the failed run', () => {
    expect(qualification.triggerEvidence).toEqual({
      pilot: 17,
      workflowRunId: 33221401966,
      jobIssueNumber: 230,
      mainSha: 'f9a9cde3e98faca3b1e17b5d575d4282677f06cc',
    })
    expect(qualification.reason).toContain('Post-Pilot-17')
  })

  it('is accepted by the same fail-closed preflight that runs before a paid live pilot', async () => {
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
