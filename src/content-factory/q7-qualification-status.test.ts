import { describe, expect, it } from 'vitest'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'
import sixthQ7EvidenceText from '../../content-factory/reliability-v2-e-q7-live-soak-evidence-006.json?raw'
import fourthQ7EvidenceText from '../../content-factory/reliability-v2-e-q7-live-soak-evidence-004.json?raw'
import livePilotWorkflowText from '../../.github/workflows/content-factory-live-pilot.yml?raw'

type RuntimeProcess = { execPath: string; cwd: () => string }
type Qualification = { status: string; livePilotEligible: boolean; requiredGates: string[]; gateStatus: Record<string, string>; providerFreeQualificationEvidence: string; q7PassEvidence: string; q7PassEvidenceHistory: string[]; qualifiedEvidence: unknown | null }
type Q7Evidence = { workflow: { runId: number; artifactId: number; mainSha: string }; sampleSummary: { executed: number; accepted: number; controlledFailClosed: number; infrastructureIncidents: number; engineeringBoundaryBreaches: number; targetedRepairsObserved?: number; freshCandidateResamplesObserved?: number; providerCallClassificationComplete?: boolean }; classification: { decision: string; instrumentationComplete?: boolean; candidateRecoveryObserved?: boolean }; qualificationOutcome: { q7Passed: boolean; livePilotEligible: boolean } }

const qualification = JSON.parse(qualificationText) as Qualification
const sixthQ7 = JSON.parse(sixthQ7EvidenceText) as Q7Evidence
const fourthQ7 = JSON.parse(fourthQ7EvidenceText) as Q7Evidence
const providerFreeGates = ['Q1-compiler-worker-ownership-inventory','Q2-historical-failure-replay-corpus','Q3-adversarial-provider-free-subject-matrix','Q4-deterministic-full-pipeline-simulation','Q5-restart-reuse-dependency-invalidation','Q6-repeated-provider-free-stability']
const gates = [...providerFreeGates, 'Q7-bounded-live-worker-soak']

describe('Content Factory Reliability v2 status after post-Pilot #20 Q7 soak 006', () => {
  it('records Q1-Q7 PASS while keeping full-course eligibility fail closed pending Q8', () => {
    expect(qualification.status).toBe('paused')
    expect(qualification.livePilotEligible).toBe(false)
    expect(qualification.requiredGates).toEqual(gates)
    for (const gate of gates) expect(qualification.gateStatus[gate]).toBe('pass')
    expect(qualification.providerFreeQualificationEvidence).toBe('content-factory/reliability-post-pilot20-q1-q6-consolidation.json')
    expect(qualification.q7PassEvidence).toBe('content-factory/reliability-v2-e-q7-live-soak-evidence-006.json')
    expect(qualification.q7PassEvidenceHistory).toEqual(['content-factory/reliability-v2-e-q7-live-soak-evidence-003.json','content-factory/reliability-v2-e-q7-live-soak-evidence-004.json'])
    expect(qualification.qualifiedEvidence).toBeNull()
  })

  it('binds Q7 PASS to the exact candidate-aware live evidence', () => {
    expect(sixthQ7).toMatchObject({
      workflow: { runId: 33554413877, artifactId: 9818944889, mainSha: 'e74e04613c8d9fa8d7eba617bb839ef368d26029' },
      sampleSummary: { executed: 20, accepted: 20, controlledFailClosed: 0, infrastructureIncidents: 0, engineeringBoundaryBreaches: 0, targetedRepairsObserved: 10, freshCandidateResamplesObserved: 1, providerCallClassificationComplete: true },
      classification: { decision: 'q7_pass_no_new_generic_engineering_contract_class', instrumentationComplete: true, candidateRecoveryObserved: true },
      qualificationOutcome: { q7Passed: true, livePilotEligible: false },
    })
  })

  it('preserves the earlier post-Pilot #19 Q7 PASS as historical evidence', () => {
    expect(fourthQ7).toMatchObject({ workflow: { runId: 33395187056, artifactId: 9759214890 }, classification: { decision: 'q7_pass_no_new_generic_engineering_contract_class' } })
  })

  it('fails the paid live-pilot preflight while Q8 has not restored eligibility', async () => {
    const moduleName = 'node:child_process'
    const childProcess = await import(/* @vite-ignore */ moduleName) as { execFileSync: (file: string, args: string[], options: { cwd: string; encoding: string; stdio: string }) => string }
    const runtimeProcess = (globalThis as unknown as { process: RuntimeProcess }).process
    expect(() => childProcess.execFileSync(runtimeProcess.execPath, ['scripts/content-factory-live-pilot-qualification.mjs'], { cwd: runtimeProcess.cwd(), encoding: 'utf8', stdio: 'pipe' })).toThrow()
  })

  it('keeps qualification preflight before any paid full-course execution', () => {
    const preflight = livePilotWorkflowText.indexOf('Verify course-agnostic Content Factory reliability qualification')
    const liveRun = livePilotWorkflowText.indexOf('Run rights-safe live adapter pilot')
    expect(preflight).toBeGreaterThan(-1)
    expect(liveRun).toBeGreaterThan(preflight)
    expect(livePilotWorkflowText).not.toContain('continue-on-error: true')
  })
})
