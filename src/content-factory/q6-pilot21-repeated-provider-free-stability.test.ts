import { describe, expect, it } from 'vitest'
import evidenceText from '../../content-factory/reliability-post-pilot21-q1-q6-requalification.json?raw'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'

type Evidence = {
  status: string
  providerCallsUsed: boolean
  historicalRecordsRewritten: boolean
  gates: Record<string, { status: string; repetitionCount?: number; repetitionSeeds?: number[] }>
}

type Qualification = {
  status: string
  gateStatus: Record<string, string>
  qualifiedEvidence: unknown | null
  livePilotEligible: boolean
}

type RuntimeProcess = { execPath: string; cwd: () => string }
type SpawnResult = { status: number | null; stdout: string; stderr: string }

const evidence = JSON.parse(evidenceText) as Evidence
const qualification = JSON.parse(qualificationText) as Qualification

const repeatedSuites = [
  'src/content-factory/reliability-v2-b-historical-failure-corpus.test.ts',
  'src/content-factory/pilot21-question-wording-ownership.test.ts',
  'src/content-factory/pilot21-q1-q5-requalification.test.ts',
  'src/content-factory/reliability-v2-c-adversarial-mutation-matrix.test.ts',
  'src/content-factory/q3-post-pilot20-candidate-recovery-requalification.test.ts',
  'src/content-factory/q4-deterministic-pipeline-simulation.test.ts',
  'src/content-factory/q4-candidate-recovery-qualification.test.ts',
  'src/content-factory/q5-dependency-aware-resume.test.ts',
  'src/content-factory/q5-candidate-recovery-requalification.test.ts',
] as const

const repetitionSeeds = [317, 641, 953] as const

describe('Content Factory Q6 post-Pilot #21 repeated provider-free stability', () => {
  it('binds Q6 to three distinct repetitions of the current affected Q2-Q5 topology', () => {
    expect(evidence.status).toBe('implemented_pending_same_head_assurance')
    expect(evidence.providerCallsUsed).toBe(false)
    expect(evidence.historicalRecordsRewritten).toBe(false)
    expect(evidence.gates['Q6-repeated-provider-free-stability']).toMatchObject({
      status: 'pass',
      repetitionCount: 3,
      repetitionSeeds: [...repetitionSeeds],
    })
    expect(new Set(repetitionSeeds).size).toBe(3)
    expect(repeatedSuites).toHaveLength(new Set(repeatedSuites).size)
    expect(repeatedSuites.every((file) => file.endsWith('.test.ts'))).toBe(true)
    expect(repeatedSuites.every((file) => !file.includes('live-pilot'))).toBe(true)
    expect(repeatedSuites.every((file) => !file.includes('live-worker-soak'))).toBe(true)
  })

  it('keeps the machine paused after Q1-Q6 PASS until a fresh bounded Q7 and separate Q8', () => {
    for (const gate of [
      'Q1-compiler-worker-ownership-inventory',
      'Q2-historical-failure-replay-corpus',
      'Q3-adversarial-provider-free-subject-matrix',
      'Q4-deterministic-full-pipeline-simulation',
      'Q5-restart-reuse-dependency-invalidation',
      'Q6-repeated-provider-free-stability',
    ]) expect(qualification.gateStatus[gate]).toBe('pass')

    expect(qualification.status).toBe('paused')
    expect(qualification.gateStatus['Q7-bounded-live-worker-soak']).toBe('pending')
    expect(qualification.qualifiedEvidence).toBeNull()
    expect(qualification.livePilotEligible).toBe(false)
  })

  it('re-runs the current affected provider-free reliability suite three times under distinct deterministic shuffle seeds', async () => {
    const moduleName = 'node:child_process'
    const childProcess = await import(/* @vite-ignore */ moduleName) as {
      spawnSync: (
        file: string,
        args: string[],
        options: { cwd: string; encoding: string; maxBuffer: number },
      ) => SpawnResult
    }
    const runtimeProcess = (globalThis as unknown as { process: RuntimeProcess }).process

    for (const seed of repetitionSeeds) {
      const result = childProcess.spawnSync(runtimeProcess.execPath, [
        'node_modules/vitest/vitest.mjs',
        'run',
        ...repeatedSuites,
        '--sequence.shuffle',
        `--sequence.seed=${seed}`,
        '--reporter=dot',
      ], {
        cwd: runtimeProcess.cwd(),
        encoding: 'utf8',
        maxBuffer: 16_000_000,
      })

      expect(
        result.status,
        `Q6 post-Pilot #21 repetition failed for seed ${seed}.\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`,
      ).toBe(0)
      expect(result.stdout).toContain('Test Files')
      expect(result.stdout).toContain('Tests')
    }
  }, 360_000)
})
