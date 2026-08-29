import { describe, expect, it } from 'vitest'
import requalificationText from '../../content-factory/reliability-v2-e-post-q7-provider-free-requalification.json?raw'
import repairText from '../../content-factory/reliability-v2-e-assessment-item-contract-repair.json?raw'
import supplementQ2Text from '../../content-factory/reliability-v2-e-q7-assessment-item-contract-replay.json?raw'
import supplementQ3Text from '../../content-factory/reliability-v2-e-q7-assessment-item-adversarial-matrix.json?raw'
import historicalCorpusText from '../../content-factory/reliability-v2-b-historical-failure-corpus.json?raw'
import historicalMatrixText from '../../content-factory/reliability-v2-c-adversarial-mutation-matrix.json?raw'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'
import { currentDurableWorkerDependencyPolicy, durableWorkerDependencyClosure } from './durable-worker-dependencies'

type Requalification = {
  schemaVersion: number
  workItem: string
  status: string
  authority: string
  baseMainSha: string
  providerCallsUsed: boolean
  liveProviderCallsUsed: boolean
  historicalRecordsRewritten: boolean
  repetitionCount: number
  repetitionSeeds: number[]
  gates: Record<string, Record<string, unknown> & { status: string }>
  providerFreeQualificationPassed: boolean
  q7BoundedLiveSoakEligible: boolean
  q7Passed: boolean
  overallReliabilityV2Passed: boolean
  livePilotEligible: boolean
  publicationSideEffect: boolean
  limitations: string[]
}

type RepairRecord = {
  status: string
  q1OwnershipDecision: {
    compilerDefaultingPermitted: boolean
    subquestionFields: Array<{ field: string; ownership: string; missingFieldDisposition: string }>
  }
  implementation: { semanticReuseVersion: string; maxTargetedRepairs: number; failClosedAfterRepair: boolean }
  qualificationEffect: Record<string, boolean | string>
}

type Q2Supplement = {
  status: string
  historicalRecordsRewritten: boolean
  providerCallsUsed: boolean
  defectClasses: Array<{ id: string; replayTests: string[] }>
  q2SupplementPassed: boolean
}

type Q3Supplement = {
  status: string
  historicalRecordsRewritten: boolean
  providerCallsRequired: boolean
  requiredShapes: string[]
  mutationClasses: Array<{ id: string; shapes: string[] }>
  mutationCaseCount: number
  validOutputNoRepairCases: number
  failClosedAfterRepairCases: number
  q3SupplementPassed: boolean
}

type HistoricalCorpus = {
  workItem: string
  status: string
  historicalRecordsRewritten: boolean
  defectClasses: Array<{ id: string; replayTests: string[] }>
}

type HistoricalMatrix = {
  workItem: string
  status: string
  historicalRecordsRewritten: boolean
  requiredShapes: string[]
  mutationClasses: Array<{ id: string; shapes: string[] }>
}

type Qualification = {
  status: string
  q7FailureEvidence: string
  gateStatus: Record<string, string>
  providerFreeQualificationEvidence: string
  qualifiedEvidence: unknown | null
  livePilotEligible: boolean
}

type RuntimeProcess = { execPath: string; cwd: () => string }
type SpawnResult = { status: number | null; stdout: string; stderr: string }

const requalification = JSON.parse(requalificationText) as Requalification
const repair = JSON.parse(repairText) as RepairRecord
const q2Supplement = JSON.parse(supplementQ2Text) as Q2Supplement
const q3Supplement = JSON.parse(supplementQ3Text) as Q3Supplement
const historicalCorpus = JSON.parse(historicalCorpusText) as HistoricalCorpus
const historicalMatrix = JSON.parse(historicalMatrixText) as HistoricalMatrix
const qualification = JSON.parse(qualificationText) as Qualification

const q1ToQ6 = [
  'Q1-compiler-worker-ownership-inventory',
  'Q2-historical-failure-replay-corpus',
  'Q3-adversarial-provider-free-subject-matrix',
  'Q4-deterministic-full-pipeline-simulation',
  'Q5-restart-reuse-dependency-invalidation',
  'Q6-repeated-provider-free-stability',
]

function repeatedProviderFreeFiles() {
  return [...new Set([
    ...historicalCorpus.defectClasses.flatMap((defectClass) => defectClass.replayTests),
    'src/content-factory/reliability-v2-b-historical-failure-corpus.test.ts',
    'src/content-factory/reliability-v2-c-adversarial-mutation-matrix.test.ts',
    'src/content-factory/openai-assessment-item-contract-boundary.test.ts',
    'src/content-factory/q4-deterministic-pipeline-simulation.test.ts',
    'src/content-factory/q5-dependency-aware-resume.test.ts',
    'src/content-factory/openai-assessment-item-provider-normalizer.test.ts',
  ])].sort()
}

describe('Reliability v2-E post-Q7 provider-free requalification', () => {
  it('restores Q1-Q6 only for the corrected Assessment Item boundary while keeping Q7 and Q8 fail closed', () => {
    expect(requalification).toMatchObject({
      schemaVersion: 1,
      workItem: 'V2-E-assessment-item-contract-repair',
      status: 'complete',
      authority: '80-company-workflows/Content Factory Reliability Qualification Standard.md',
      baseMainSha: 'a3de541ac85a20945b987a661411b2703bc9aa92',
      providerCallsUsed: false,
      liveProviderCallsUsed: false,
      historicalRecordsRewritten: false,
      repetitionCount: 3,
      repetitionSeeds: [17, 73, 149],
      providerFreeQualificationPassed: true,
      q7BoundedLiveSoakEligible: true,
      q7Passed: false,
      overallReliabilityV2Passed: false,
      livePilotEligible: false,
      publicationSideEffect: false,
    })
    expect(Object.keys(requalification.gates).sort()).toEqual(q1ToQ6.sort())
    for (const gate of q1ToQ6) expect(requalification.gates[gate]?.status).toBe('pass')

    expect(qualification.status).toBe('paused')
    for (const gate of q1ToQ6) expect(qualification.gateStatus[gate]).toBe('pass')
    expect(qualification.gateStatus['Q7-bounded-live-worker-soak']).toBe('pending')
    expect(qualification.q7FailureEvidence).toBe('content-factory/reliability-v2-e-q7-live-soak-evidence.json')
    expect(qualification.providerFreeQualificationEvidence).toBe(
      'content-factory/reliability-v2-e-post-q7-provider-free-requalification.json',
    )
    expect(qualification.qualifiedEvidence).toBeNull()
    expect(qualification.livePilotEligible).toBe(false)
  })

  it('keeps educational subquestion structure model-owned and repairable rather than silently defaulted', () => {
    expect(repair.status).toBe('complete')
    expect(repair.q1OwnershipDecision.compilerDefaultingPermitted).toBe(false)
    expect(repair.implementation).toMatchObject({
      semanticReuseVersion: '2+output-integrity-v3',
      maxTargetedRepairs: 1,
      failClosedAfterRepair: true,
    })
    expect(repair.q1OwnershipDecision.subquestionFields).toEqual([
      expect.objectContaining({ field: 'subquestions[].maxMark', ownership: 'generative_judgement', missingFieldDisposition: 'targeted_repair_eligible' }),
      expect.objectContaining({ field: 'subquestions[].requirementIds', ownership: 'bounded_locator_reference', missingFieldDisposition: 'targeted_repair_eligible' }),
      expect.objectContaining({ field: 'subquestions[].coverageEvidence', ownership: 'bounded_locator_reference', missingFieldDisposition: 'targeted_repair_eligible' }),
    ])
    expect(repair.qualificationEffect).toMatchObject({
      q1Passed: true,
      q2Passed: true,
      q3Passed: true,
      q4Passed: true,
      q5Passed: true,
      q6Passed: true,
      q7Passed: false,
      livePilotEligible: false,
    })
  })

  it('adds the Q7 defect as supplemental Q2/Q3 evidence without rewriting V2-B or V2-C history', () => {
    expect(historicalCorpus).toMatchObject({ workItem: 'V2-B', status: 'complete', historicalRecordsRewritten: false })
    expect(historicalMatrix).toMatchObject({ workItem: 'V2-C', status: 'complete', historicalRecordsRewritten: false })

    expect(q2Supplement).toMatchObject({
      status: 'complete',
      historicalRecordsRewritten: false,
      providerCallsUsed: false,
      q2SupplementPassed: true,
    })
    expect(q2Supplement.defectClasses).toHaveLength(1)
    expect(q2Supplement.defectClasses[0]?.id).toBe('assessment_item_subquestion_structure_provider_contract')
    expect(historicalCorpus.defectClasses).toHaveLength(19)

    expect(q3Supplement).toMatchObject({
      status: 'complete',
      historicalRecordsRewritten: false,
      providerCallsRequired: false,
      mutationCaseCount: 20,
      validOutputNoRepairCases: 5,
      failClosedAfterRepairCases: 5,
      q3SupplementPassed: true,
    })
    expect(q3Supplement.requiredShapes).toHaveLength(5)
    expect(q3Supplement.mutationClasses).toHaveLength(4)
    expect(historicalMatrix.requiredShapes).toHaveLength(5)
    expect(historicalMatrix.mutationClasses).toHaveLength(12)
  })

  it('advances only the Assessment Item semantic boundary and its genuine downstream dependants', () => {
    expect(currentDurableWorkerDependencyPolicy.generateAssessmentItem.contractVersion).toBe('2+output-integrity-v3')
    expect(currentDurableWorkerDependencyPolicy.generateLearningCollateral.contractVersion).toBe('3+output-integrity-v2')
    expect(currentDurableWorkerDependencyPolicy.generatePracticeCollateral.contractVersion).toBe('3+output-integrity-v2')

    const assessmentClosure = durableWorkerDependencyClosure('generateAssessmentItem').map((entry) => entry.method)
    expect(assessmentClosure).not.toContain('generateLearningCollateral')
    expect(assessmentClosure).not.toContain('generatePracticeCollateral')

    const markingClosure = durableWorkerDependencyClosure('generateMarkingPack').map((entry) => entry.method)
    expect(markingClosure).toContain('generateAssessmentItem')
    const reviewClosure = durableWorkerDependencyClosure('independentReview').map((entry) => entry.method)
    expect(reviewClosure).toContain('generateAssessmentItem')
    const remediationClosure = durableWorkerDependencyClosure('remediate').map((entry) => entry.method)
    expect(remediationClosure).toContain('generateAssessmentItem')
  })

  it('re-runs the complete affected provider-free evidence three times with the Q7 omission class included', async () => {
    const moduleName = 'node:child_process'
    const childProcess = await import(/* @vite-ignore */ moduleName) as {
      spawnSync: (
        file: string,
        args: string[],
        options: { cwd: string; encoding: string; maxBuffer: number },
      ) => SpawnResult
    }
    const runtimeProcess = (globalThis as unknown as { process: RuntimeProcess }).process
    const testFiles = repeatedProviderFreeFiles()

    expect(new Set(requalification.repetitionSeeds).size).toBe(3)
    expect(testFiles).toContain('src/content-factory/reliability-v2-b-historical-failure-corpus.test.ts')
    expect(testFiles).toContain('src/content-factory/reliability-v2-c-adversarial-mutation-matrix.test.ts')
    expect(testFiles).toContain('src/content-factory/openai-assessment-item-contract-boundary.test.ts')
    expect(testFiles).toContain('src/content-factory/q4-deterministic-pipeline-simulation.test.ts')
    expect(testFiles).toContain('src/content-factory/q5-dependency-aware-resume.test.ts')
    expect(testFiles.every((file) => file.endsWith('.test.ts'))).toBe(true)
    expect(testFiles.every((file) => !file.includes('live-worker-soak.integration'))).toBe(true)
    expect(testFiles.every((file) => !file.includes('live-pilot.integration'))).toBe(true)

    for (const seed of requalification.repetitionSeeds) {
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
        `Post-Q7 provider-free repetition failed for seed ${seed}.\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`,
      ).toBe(0)
      expect(result.stdout).toContain('Test Files')
      expect(result.stdout).toContain('Tests')
    }
  }, 300_000)

  it('states the remaining live-provider and eligibility limitations explicitly', () => {
    expect(requalification.limitations.join(' ')).toContain('live external-provider educational correctness')
    expect(requalification.limitations.join(' ')).toContain('Q7 remains pending')
    expect(requalification.limitations.join(' ')).toContain('Q8')
  })
})
