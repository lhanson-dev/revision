import { describe, expect, it } from 'vitest'
import q1Text from '../../content-factory/reliability-v2-d-q1-ownership-consolidation.json?raw'
import v2dText from '../../content-factory/reliability-v2-d-provider-free-qualification.json?raw'
import legacyInventoryText from '../../content-factory/reliability-contract-inventory.json?raw'
import v2aText from '../../content-factory/reliability-v2-a-marking-pack-ownership.json?raw'
import corpusText from '../../content-factory/reliability-v2-b-historical-failure-corpus.json?raw'
import mutationMatrixText from '../../content-factory/reliability-v2-c-adversarial-mutation-matrix.json?raw'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'

type Ownership =
  | 'generative_judgement'
  | 'deterministically_derived'
  | 'bounded_locator_reference'
  | 'targeted_repair_eligible'
  | 'fail_closed'

type LegacyInventory = {
  schemaVersion: number
  status: string
  q1Pass: boolean
  requiredWorkerBoundaries: string[]
  workers: Array<{
    worker: string
    reviewStatus: string
    mechanicalFields: Array<{
      ownership: Ownership
      currentCompliance: string
    }>
  }>
  blockers: unknown[]
}

type Q1Consolidation = {
  schemaVersion: number
  workItem: string
  gate: string
  status: string
  baseMainSha: string
  allowedOwnership: Ownership[]
  sourceInventories: {
    preV2Inventory: string
    markingPackV2Overlay: string
  }
  requiredWorkerBoundaries: string[]
  carriedForwardBoundaries: string[]
  compilerOwnershipChallenges: Array<{ worker: string; conclusion: string }>
  markingPackV2EffectiveOwnership: Array<{
    fieldClass: string
    fieldPatterns: string[]
    ownership: Ownership
    rule: string
  }>
  legacyMarkingPackDisposition: string
  providerCallsUsed: boolean
  q1Passed: boolean
  overallReliabilityV2Passed: boolean
}

type V2ARecord = {
  status: string
  scope: string
  providerBoundary: {
    educationalJudgementOnly: boolean
    compilerOwnedFieldsExcludedFromStructuredProviderSchema: string[]
  }
  ownership: Array<{
    fieldClass: string
    fieldPatterns: string[]
    ownership: Ownership
  }>
  qualificationEffect: {
    v2AImplemented: boolean
    q1Passed: boolean
    overallReliabilityV2Passed: boolean
    nextEvidence?: string
  }
}

type HistoricalCorpus = {
  schemaVersion: number
  workItem: string
  status: string
  historicalRecordsRewritten: boolean
  q2Passed: boolean
  overallReliabilityV2Passed: boolean
  defectClasses: Array<{
    id: string
    evidenceKind: 'exact_historical_output' | 'synthetic_reproduction'
    replayTests: string[]
  }>
  pilots: Array<{ pilotNumber: number }>
}

type MutationMatrix = {
  schemaVersion: number
  workItem: string
  status: string
  requiredShapes: string[]
  mutationClasses: Array<{ id: string; shapes: string[] }>
  mutationSeeds: number[]
  providerCallsRequired: boolean
  historicalRecordsRewritten: boolean
  q3Passed: boolean
  overallReliabilityV2Passed: boolean
}

type V2DRecord = {
  schemaVersion: number
  workItem: string
  status: string
  baseMainSha: string
  verificationMode: string
  providerCallsUsed: boolean
  liveProviderCallsUsed: boolean
  repetitionCount: number
  repetitionSeeds: number[]
  gates: Record<string, {
    status: string
    pilotCoverage?: number
    knownDefectClassCount?: number
    subjectShapeCount?: number
    mutationClassCount?: number
    mutationCasesPerRepetition?: number
    repetitionSeeds?: number[]
  }>
  providerFreeQualificationPassed: boolean
  q7BoundedLiveSoakEligible: boolean
  q7Passed: boolean
  overallReliabilityV2Passed: boolean
  livePilotEligible: boolean
  historicalRecordsRewritten: boolean
  publicationSideEffect: boolean
  limitations: string[]
  nextWorkItem: string
}

type CurrentQualification = {
  status: string
  requiredGates: string[]
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

const legacyInventory = JSON.parse(legacyInventoryText) as LegacyInventory
const q1 = JSON.parse(q1Text) as Q1Consolidation
const v2a = JSON.parse(v2aText) as V2ARecord
const corpus = JSON.parse(corpusText) as HistoricalCorpus
const mutationMatrix = JSON.parse(mutationMatrixText) as MutationMatrix
const v2d = JSON.parse(v2dText) as V2DRecord
const currentQualification = JSON.parse(qualificationText) as CurrentQualification

const requiredGateIds = [
  'Q1-compiler-worker-ownership-inventory',
  'Q2-historical-failure-replay-corpus',
  'Q3-adversarial-provider-free-subject-matrix',
  'Q4-deterministic-full-pipeline-simulation',
  'Q5-restart-reuse-dependency-invalidation',
  'Q6-repeated-provider-free-stability',
]

function sorted(values: readonly string[]) {
  return [...values].sort()
}

function q2ReplayRegressionFiles() {
  return [...new Set(corpus.defectClasses.flatMap((defectClass) => defectClass.replayTests))].sort()
}

function repeatedQ2ToQ5TestFiles() {
  return [...new Set([
    ...q2ReplayRegressionFiles(),
    'src/content-factory/reliability-v2-b-historical-failure-corpus.test.ts',
    'src/content-factory/reliability-v2-c-adversarial-mutation-matrix.test.ts',
    'src/content-factory/q4-deterministic-pipeline-simulation.test.ts',
    'src/content-factory/q5-dependency-aware-resume.test.ts',
  ])].sort()
}

describe('Reliability v2-D same-head provider-free Q1-Q6 qualification', () => {
  it('consolidates Q1 on the current v2 ownership boundary without rewriting pre-v2 evidence', () => {
    expect(q1).toMatchObject({
      schemaVersion: 1,
      workItem: 'V2-D',
      gate: 'Q1',
      status: 'complete',
      baseMainSha: '7082331dc280ec8bd8b8223475180fa25b796d00',
      providerCallsUsed: false,
      q1Passed: true,
      overallReliabilityV2Passed: false,
    })
    expect(q1.sourceInventories).toEqual({
      preV2Inventory: 'content-factory/reliability-contract-inventory.json',
      markingPackV2Overlay: 'content-factory/reliability-v2-a-marking-pack-ownership.json',
    })

    expect(legacyInventory.schemaVersion).toBe(3)
    expect(legacyInventory.status).toBe('complete')
    expect(legacyInventory.q1Pass).toBe(true)
    expect(legacyInventory.blockers).toEqual([])
    expect(q1.requiredWorkerBoundaries).toEqual(legacyInventory.requiredWorkerBoundaries)
    expect(q1.carriedForwardBoundaries).toEqual(
      legacyInventory.requiredWorkerBoundaries.filter((worker) => worker !== 'marking_pack_generation'),
    )

    for (const worker of legacyInventory.workers) {
      expect(q1.requiredWorkerBoundaries).toContain(worker.worker)
      expect(worker.reviewStatus).toBe('complete')
      for (const field of worker.mechanicalFields) {
        expect(q1.allowedOwnership).toContain(field.ownership)
        expect(field.currentCompliance).toBe('compliant')
      }
    }

    expect(new Set(q1.compilerOwnershipChallenges.map((challenge) => challenge.worker))).toEqual(
      new Set(q1.requiredWorkerBoundaries),
    )
    for (const challenge of q1.compilerOwnershipChallenges) {
      expect(challenge.conclusion.length).toBeGreaterThan(80)
    }

    expect(v2a.status).toBe('implemented_pending_same_head_assurance')
    expect(v2a.scope).toBe('marking_pack_generation')
    expect(v2a.providerBoundary.educationalJudgementOnly).toBe(true)
    expect(v2a.qualificationEffect).toMatchObject({
      v2AImplemented: true,
      q1Passed: false,
      overallReliabilityV2Passed: false,
    })

    const effectivePatterns = q1.markingPackV2EffectiveOwnership.flatMap((field) =>
      field.fieldPatterns.map((pattern) => ({ pattern, ownership: field.ownership })),
    )
    const ownershipFor = (pattern: string) => effectivePatterns.find((entry) => entry.pattern === pattern)?.ownership

    expect(ownershipFor('subquestionGuidance[].subquestionId')).toBe('bounded_locator_reference')
    expect(ownershipFor('subquestionGuidance[].maxMark')).toBe('deterministically_derived')
    expect(ownershipFor('assessmentObjectiveAllocation')).toBe('deterministically_derived')
    expect(ownershipFor('rubricGuidance[].levels[].descriptor')).toBe('generative_judgement')
    expect(ownershipFor('rubric[].id')).toBe('deterministically_derived')
    expect(ownershipFor('rubric[].minMark')).toBe('deterministically_derived')
    expect(ownershipFor('rubric[].maxMark')).toBe('deterministically_derived')
    expect(q1.markingPackV2EffectiveOwnership.some((field) => field.ownership === 'targeted_repair_eligible')).toBe(true)

    for (const field of v2a.providerBoundary.compilerOwnedFieldsExcludedFromStructuredProviderSchema) {
      expect(ownershipFor(field)).toBe('deterministically_derived')
    }
    expect(q1.legacyMarkingPackDisposition).toContain('superseded')
  })

  it('binds Q2 and Q3 to the durable v2 evidence without altering historical records', () => {
    expect(corpus.schemaVersion).toBe(1)
    expect(corpus.workItem).toBe('V2-B')
    expect(corpus.status).toBe('implemented_pending_same_head_assurance')
    expect(corpus.historicalRecordsRewritten).toBe(false)
    expect(corpus.pilots.map((pilot) => pilot.pilotNumber)).toEqual(Array.from({ length: 18 }, (_, index) => index + 1))
    expect(corpus.defectClasses).toHaveLength(19)
    expect(corpus.q2Passed).toBe(false)
    expect(corpus.overallReliabilityV2Passed).toBe(false)
    expect(q2ReplayRegressionFiles().length).toBeGreaterThan(10)
    for (const replayTest of q2ReplayRegressionFiles()) {
      expect(replayTest.endsWith('.test.ts')).toBe(true)
      expect(replayTest).not.toContain('live-pilot.integration')
    }

    expect(mutationMatrix.schemaVersion).toBe(1)
    expect(mutationMatrix.workItem).toBe('V2-C')
    expect(mutationMatrix.status).toBe('implemented_pending_v2_d_same_head_qualification')
    expect(mutationMatrix.requiredShapes).toHaveLength(5)
    expect(mutationMatrix.mutationClasses).toHaveLength(12)
    expect(mutationMatrix.mutationClasses.every((mutation) => mutation.shapes.length === 5)).toBe(true)
    expect(mutationMatrix.providerCallsRequired).toBe(false)
    expect(mutationMatrix.historicalRecordsRewritten).toBe(false)
    expect(mutationMatrix.q3Passed).toBe(false)
    expect(mutationMatrix.overallReliabilityV2Passed).toBe(false)
    for (const seed of v2d.repetitionSeeds) expect(mutationMatrix.mutationSeeds).toContain(seed)
  })

  it('preserves the historical V2-D paused boundary while recognising the later separate Q8 transition', () => {
    expect(v2d).toMatchObject({
      schemaVersion: 1,
      workItem: 'V2-D',
      status: 'complete',
      baseMainSha: '7082331dc280ec8bd8b8223475180fa25b796d00',
      verificationMode: 'exact_head_ci',
      providerCallsUsed: false,
      liveProviderCallsUsed: false,
      repetitionCount: 3,
      repetitionSeeds: [17, 73, 149],
      providerFreeQualificationPassed: true,
      q7BoundedLiveSoakEligible: true,
      q7Passed: false,
      overallReliabilityV2Passed: false,
      livePilotEligible: false,
      historicalRecordsRewritten: false,
      publicationSideEffect: false,
      nextWorkItem: 'V2-E',
    })
    expect(sorted(Object.keys(v2d.gates))).toEqual(sorted(requiredGateIds))
    for (const gateId of requiredGateIds) expect(v2d.gates[gateId]?.status).toBe('pass')

    expect(v2d.gates['Q2-historical-failure-replay-corpus']).toMatchObject({
      pilotCoverage: 18,
      knownDefectClassCount: 19,
    })
    expect(v2d.gates['Q3-adversarial-provider-free-subject-matrix']).toMatchObject({
      subjectShapeCount: 5,
      mutationClassCount: 12,
      mutationCasesPerRepetition: 60,
    })
    expect(v2d.gates['Q6-repeated-provider-free-stability']?.repetitionSeeds).toEqual(v2d.repetitionSeeds)

    expect(currentQualification.status).toBe('qualified')
    expect(currentQualification.qualifiedEvidence).not.toBeNull()
    expect(currentQualification.livePilotEligible).toBe(true)
    expect(currentQualification.requiredGates).toContain('Q7-bounded-live-worker-soak')
    expect(v2d.limitations.join(' ')).toContain('educational correctness')
    expect(v2d.limitations.join(' ')).toContain('Q7')
  })

  it('re-runs Q2-Q5 three times under distinct governed shuffle seeds', async () => {
    const moduleName = 'node:child_process'
    const childProcess = await import(/* @vite-ignore */ moduleName) as {
      spawnSync: (
        file: string,
        args: string[],
        options: { cwd: string; encoding: string; maxBuffer: number },
      ) => SpawnResult
    }
    const runtimeProcess = (globalThis as unknown as { process: RuntimeProcess }).process
    const testFiles = repeatedQ2ToQ5TestFiles()

    expect(new Set(v2d.repetitionSeeds).size).toBe(v2d.repetitionCount)
    expect(testFiles).toContain('src/content-factory/reliability-v2-b-historical-failure-corpus.test.ts')
    expect(testFiles).toContain('src/content-factory/reliability-v2-c-adversarial-mutation-matrix.test.ts')
    expect(testFiles).toContain('src/content-factory/q4-deterministic-pipeline-simulation.test.ts')
    expect(testFiles).toContain('src/content-factory/q5-dependency-aware-resume.test.ts')
    expect(testFiles.every((file) => file.endsWith('.test.ts'))).toBe(true)
    expect(testFiles.every((file) => !file.includes('live-pilot.integration'))).toBe(true)

    for (const seed of v2d.repetitionSeeds) {
      const result = childProcess.spawnSync(runtimeProcess.execPath, [
        'node_modules/vitest/vitest.mjs',
        'run',
        ...testFiles,
        '--sequence.shuffle',
        `--sequence.seed=${seed}`,
        '--reporter=dot',
      ], {
        cwd: runtimeProcess.cwd(),
        encoding: 'utf8',
        maxBuffer: 8_000_000,
      })

      expect(
        result.status,
        `Provider-free qualification repetition failed for seed ${seed}.\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`,
      ).toBe(0)
      expect(result.stdout).toContain('Test Files')
      expect(result.stdout).toContain('Tests')
    }
  }, 300_000)
})
