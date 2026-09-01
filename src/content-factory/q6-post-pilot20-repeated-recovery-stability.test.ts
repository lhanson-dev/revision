import { describe, expect, it } from 'vitest'
import evidenceText from '../../content-factory/reliability-post-pilot20-q6-repeated-recovery-stability.json?raw'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'

type Evidence = {
  schemaVersion: number
  authority: string
  status: string
  gate: string
  scope: string
  baseMainSha: string
  verificationMode: string
  providerCallsUsed: boolean
  liveProviderCallsUsed: boolean
  historicalRecordsRewritten: boolean
  repetitionCount: number
  repetitionSeeds: number[]
  boundProviderFreeSuites: Record<'Q2' | 'Q3' | 'Q4' | 'Q5', string[]>
  acceptance: Record<string, boolean>
  limitations: string[]
}

type Qualification = {
  status: string
  requiredGates: string[]
  gateStatus: Record<string, string>
  qualifiedEvidence: unknown | null
  livePilotEligible: boolean
}

type RuntimeProcess = {
  execPath: string
  cwd: () => string
}

type SpawnResult = {
  status: number | null
  stdout: string
  stderr: string
}

const evidence = JSON.parse(evidenceText) as Evidence
const qualification = JSON.parse(qualificationText) as Qualification

const expectedSuites = {
  Q2: [
    'src/content-factory/reliability-v2-b-historical-failure-corpus.test.ts',
    'src/content-factory/q2-pilot20-candidate-recovery-replay.test.ts',
  ],
  Q3: [
    'src/content-factory/reliability-v2-c-adversarial-mutation-matrix.test.ts',
    'src/content-factory/q3-post-pilot20-candidate-recovery-requalification.test.ts',
  ],
  Q4: [
    'src/content-factory/q4-deterministic-pipeline-simulation.test.ts',
    'src/content-factory/q4-candidate-recovery-qualification.test.ts',
  ],
  Q5: [
    'src/content-factory/q5-dependency-aware-resume.test.ts',
    'src/content-factory/q5-candidate-recovery-requalification.test.ts',
  ],
} as const

function repeatedTestFiles() {
  return [...new Set(Object.values(evidence.boundProviderFreeSuites).flat())]
}

describe('Content Factory Q6 post-Pilot #20 repeated recovery stability', () => {
  it('binds Q6 to the current approved-main Q2-Q5 recovery evidence without changing qualification state', () => {
    expect(evidence).toMatchObject({
      schemaVersion: 1,
      authority: '80-company-workflows/Content Factory Reliability Qualification Standard.md',
      status: 'implemented_pending_same_head_assurance',
      gate: 'Q6-repeated-provider-free-stability',
      scope: 'post_pilot_20_candidate_recovery_repeated_stability',
      baseMainSha: '80356b359fe1652892d070cf7f5c8b2f3f191225',
      verificationMode: 'exact_head_ci',
      providerCallsUsed: false,
      liveProviderCallsUsed: false,
      historicalRecordsRewritten: false,
      repetitionCount: 3,
    })

    expect(evidence.boundProviderFreeSuites).toEqual(expectedSuites)
    expect(evidence.repetitionSeeds).toHaveLength(evidence.repetitionCount)
    expect(new Set(evidence.repetitionSeeds).size).toBe(evidence.repetitionCount)
    expect(evidence.repetitionSeeds.every((seed) => Number.isInteger(seed) && seed > 0)).toBe(true)

    expect(evidence.acceptance).toMatchObject({
      threeDistinctRepetitions: true,
      variedDeterministicOrdering: true,
      q2CurrentRecoveryBound: true,
      q3CurrentRecoveryBound: true,
      q4CurrentRecoveryBound: true,
      q5CurrentRecoveryBound: true,
      historicalCorpusRetained: true,
      adversarialMatrixRetained: true,
      providerFree: true,
      q6EvidenceReady: true,
      globalQualificationStateChanged: false,
      q7MachineEligibilityChanged: false,
      q8EligibilityChanged: false,
    })

    expect(qualification.status).toBe('paused')
    expect(qualification.requiredGates).toContain('Q6-repeated-provider-free-stability')
    expect(qualification.gateStatus['Q6-repeated-provider-free-stability']).toBe(
      'required_after_pilot20_architecture_reset',
    )
    expect(qualification.qualifiedEvidence).toBeNull()
    expect(qualification.livePilotEligible).toBe(false)
    expect(evidence.limitations.join(' ')).toMatch(/Q7 bounded live soak remains prohibited/i)
    expect(evidence.limitations.join(' ')).toMatch(/Q8 remains a separate transition/i)
  })

  it('uses only the governed current provider-free Q2-Q5 suites', () => {
    const files = repeatedTestFiles()

    expect(files).toHaveLength(8)
    expect(new Set(files).size).toBe(8)
    expect(files).toContain('src/content-factory/q2-pilot20-candidate-recovery-replay.test.ts')
    expect(files).toContain('src/content-factory/q3-post-pilot20-candidate-recovery-requalification.test.ts')
    expect(files).toContain('src/content-factory/q4-candidate-recovery-qualification.test.ts')
    expect(files).toContain('src/content-factory/q5-candidate-recovery-requalification.test.ts')
    expect(files).toContain('src/content-factory/reliability-v2-b-historical-failure-corpus.test.ts')
    expect(files).toContain('src/content-factory/reliability-v2-c-adversarial-mutation-matrix.test.ts')
    expect(files.every((file) => file.endsWith('.test.ts'))).toBe(true)
    expect(files.every((file) => !file.includes('live-pilot'))).toBe(true)
    expect(files.every((file) => !file.includes('live-worker-soak'))).toBe(true)
    expect(files.every((file) => !file.includes('integration.test'))).toBe(true)
  })

  it('re-runs the current post-Pilot #20 Q2-Q5 recovery topology three times under distinct deterministic shuffle seeds', async () => {
    const moduleName = 'node:child_process'
    const childProcess = await import(/* @vite-ignore */ moduleName) as {
      spawnSync: (
        file: string,
        args: string[],
        options: { cwd: string; encoding: string; maxBuffer: number },
      ) => SpawnResult
    }
    const runtimeProcess = (globalThis as unknown as { process: RuntimeProcess }).process
    const files = repeatedTestFiles()

    for (const seed of evidence.repetitionSeeds) {
      const result = childProcess.spawnSync(runtimeProcess.execPath, [
        'node_modules/vitest/vitest.mjs',
        'run',
        ...files,
        '--sequence.shuffle',
        `--sequence.seed=${seed}`,
        '--reporter=dot',
      ], {
        cwd: runtimeProcess.cwd(),
        encoding: 'utf8',
        maxBuffer: 12_000_000,
      })

      expect(
        result.status,
        `Q6 post-Pilot #20 repetition failed for seed ${seed}.\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`,
      ).toBe(0)
      expect(result.stdout).toContain('Test Files')
      expect(result.stdout).toContain('Tests')
    }
  }, 360_000)
})
