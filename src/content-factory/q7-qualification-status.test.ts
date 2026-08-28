import { execFileSync } from 'node:child_process'
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
  requiredGates: string[]
  qualifiedEvidence: {
    qualificationEvidenceMainSha: string
    passedGates: string[]
    gateEvidence: Array<{ gate: string; record: string; decision: string }>
    q6RepetitionCount: number
    nextPaidRunClass: string
  } | null
  livePilotEligible: boolean
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

const expectedEvidenceRecords = new Map([
  ['Q1-worker-contract-inventory', 'content-factory/reliability-contract-inventory.json'],
  ['Q2-provider-free-contract-matrix', 'content-factory/reliability-q2-contract-matrix.json'],
  ['Q3-subject-shape-matrix', 'content-factory/reliability-q3-subject-shape-matrix.json'],
  ['Q4-deterministic-pipeline-simulation', 'content-factory/reliability-q4-deterministic-pipeline-simulation.json'],
  ['Q5-restart-reuse-dependency-invalidation', 'content-factory/reliability-q5-restart-reuse-invalidation.json'],
  ['Q6-repeated-qualification-stability', 'content-factory/reliability-q6-repeated-stability.json'],
])

describe('Content Factory Q7 qualification status', () => {
  it('qualifies paid confirmation-pilot eligibility only after every governed Q1-Q6 record is PASS', () => {
    expect(q1).toMatchObject({ status: 'complete', q1Pass: true })
    expect(q2).toMatchObject({ status: 'complete', q2Pass: true })
    expect(q3).toMatchObject({ status: 'complete', q3Pass: true })
    expect(q4).toMatchObject({ status: 'complete', q4Pass: true })
    expect(q5).toMatchObject({ status: 'complete', q5Pass: true, providerCallsUsed: false })
    expect(q6).toMatchObject({ status: 'complete', q6Pass: true, providerCallsUsed: false })
    expect(q6.repetitionCount).toBe(3)

    expect(qualification.schemaVersion).toBe(1)
    expect(qualification.status).toBe('qualified')
    expect(qualification.livePilotEligible).toBe(true)
    expect(qualification.requiredGates).toEqual(expectedGates)
    expect(qualification.qualifiedEvidence).not.toBeNull()
    expect(qualification.qualifiedEvidence?.qualificationEvidenceMainSha).toBe('0a288a6bd7885782fed884d468fa040f337e873a')
    expect(qualification.qualifiedEvidence?.passedGates).toEqual(expectedGates)
    expect(qualification.qualifiedEvidence?.q6RepetitionCount).toBe(3)
    expect(qualification.qualifiedEvidence?.nextPaidRunClass).toBe('confirmation_pilot')
  })

  it('maps every required gate to its exact merged machine-readable evidence record', () => {
    const evidence = qualification.qualifiedEvidence?.gateEvidence ?? []
    expect(evidence).toHaveLength(expectedGates.length)
    expect(new Set(evidence.map((entry) => entry.gate))).toEqual(new Set(expectedGates))

    for (const entry of evidence) {
      expect(entry.decision).toBe('pass')
      expect(entry.record).toBe(expectedEvidenceRecords.get(entry.gate))
    }
  })

  it('is accepted by the same fail-closed preflight that runs before a future live pilot', () => {
    expect(() => execFileSync(process.execPath, ['scripts/content-factory-live-pilot-qualification.mjs'], {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: 'pipe',
    })).not.toThrow()
  })

  it('keeps qualification preflight before the paid live-adapter execution step', () => {
    const preflight = livePilotWorkflowText.indexOf('Verify course-agnostic Content Factory reliability qualification')
    const liveRun = livePilotWorkflowText.indexOf('Run rights-safe live adapter pilot')
    expect(preflight).toBeGreaterThan(-1)
    expect(liveRun).toBeGreaterThan(preflight)
    expect(livePilotWorkflowText).not.toContain('continue-on-error: true')
  })
})
