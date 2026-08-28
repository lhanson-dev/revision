import { describe, expect, it } from 'vitest'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'
import q1Text from '../../content-factory/reliability-contract-inventory.json?raw'
import q2Text from '../../content-factory/reliability-q2-contract-matrix.json?raw'
import q3Text from '../../content-factory/reliability-q3-subject-shape-matrix.json?raw'
import q4Text from '../../content-factory/reliability-q4-deterministic-pipeline-simulation.json?raw'
import q5Text from '../../content-factory/reliability-q5-restart-reuse-invalidation.json?raw'
import q6Text from '../../content-factory/reliability-q6-repeated-stability.json?raw'
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

type RuntimeProcess = {
  execPath: string
  cwd: () => string
}

const qualification = JSON.parse(qualificationText) as QualificationRecord
const q1 = JSON.parse(q1Text) as { status: string; q1Pass: boolean }
const q2 = JSON.parse(q2Text) as { status: string; q2Pass: boolean }
const q3 = JSON.parse(q3Text) as { status: string; q3Pass: boolean }
const q4 = JSON.parse(q4Text) as { status: string; q4Pass: boolean }
const q5 = JSON.parse(q5Text) as { status: string; q5Pass: boolean; providerCallsUsed: boolean }
const q6 = JSON.parse(q6Text) as { status: string; q6Pass: boolean; repetitionCount: number; providerCallsUsed: boolean }

const expectedGates = [
  'Q1-worker-contract-inventory',
  'Q2-provider-free-contract-matrix',
  'Q3-subject-shape-matrix',
  'Q4-deterministic-pipeline-simulation',
  'Q5-restart-reuse-dependency-invalidation',
  'Q6-repeated-qualification-stability',
]

describe('Content Factory qualification status after Confirmation Pilot #16', () => {
  it('preserves the historical Q1-Q6 PASS records while re-pausing the changed implementation', () => {
    expect(q1).toMatchObject({ status: 'complete', q1Pass: true })
    expect(q2).toMatchObject({ status: 'complete', q2Pass: true })
    expect(q3).toMatchObject({ status: 'complete', q3Pass: true })
    expect(q4).toMatchObject({ status: 'complete', q4Pass: true })
    expect(q5).toMatchObject({ status: 'complete', q5Pass: true, providerCallsUsed: false })
    expect(q6).toMatchObject({ status: 'complete', q6Pass: true, providerCallsUsed: false })
    expect(q6.repetitionCount).toBe(3)

    expect(qualification.schemaVersion).toBe(1)
    expect(qualification.status).toBe('paused')
    expect(qualification.livePilotEligible).toBe(false)
    expect(qualification.qualifiedEvidence).toBeNull()
    expect(qualification.requiredGates).toEqual(expectedGates)
    expect(qualification.reason).toContain('Confirmation Pilot #16')
  })

  it('binds the renewed pause to the exact Pilot 16 fail-hold evidence', () => {
    expect(qualification.triggerEvidence).toEqual({
      pilot: 16,
      workflowRunId: 33214478392,
      jobIssueNumber: 226,
      mainSha: '47c30e95c49c1951d0dd31c48b63a1d15506529f',
    })
  })

  it('is rejected by the same fail-closed preflight that runs before any paid live pilot', async () => {
    const moduleName = 'node:child_process'
    const childProcess = await import(/* @vite-ignore */ moduleName) as {
      execFileSync: (
        file: string,
        args: string[],
        options: { cwd: string; encoding: string; stdio: string },
      ) => unknown
    }
    const runtimeProcess = (globalThis as unknown as { process: RuntimeProcess }).process

    expect(() => childProcess.execFileSync(runtimeProcess.execPath, ['scripts/content-factory-live-pilot-qualification.mjs'], {
      cwd: runtimeProcess.cwd(),
      encoding: 'utf8',
      stdio: 'pipe',
    })).toThrow()
  })

  it('keeps qualification preflight before the paid live-adapter execution step', () => {
    const preflight = livePilotWorkflowText.indexOf('Verify course-agnostic Content Factory reliability qualification')
    const liveRun = livePilotWorkflowText.indexOf('Run rights-safe live adapter pilot')
    expect(preflight).toBeGreaterThan(-1)
    expect(liveRun).toBeGreaterThan(preflight)
    expect(livePilotWorkflowText).not.toContain('continue-on-error: true')
  })
})
