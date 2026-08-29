import { describe, expect, it } from 'vitest'
import corpusText from '../../content-factory/reliability-v2-b-historical-failure-corpus.json?raw'
import assessmentIntegrityTest from './assessment-integrity.test.ts?raw'
import coverageFinalizationTest from './coverage-finalization.test.ts?raw'
import assessmentItemPolicyTest from './openai-live-adapter.assessment-item-policy.test.ts?raw'
import independentReviewTest from './openai-live-adapter-independent-review.test.ts?raw'
import liveAdapterTest from './openai-live-adapter.test.ts?raw'
import assessmentIntegrityCompilerTest from './openai-assessment-integrity-compiler.test.ts?raw'
import assessmentItemNormalizerTest from './openai-assessment-item-provider-normalizer.test.ts?raw'
import learningBlueprintCompilerTest from './openai-learning-blueprint-compiler.test.ts?raw'
import markingPackV2CompilerTest from './openai-marking-pack-v2-compiler.test.ts?raw'
import outputIntegrityCompilerTest from './openai-output-integrity-compiler.test.ts?raw'
import providerContractHardeningTest from './openai-provider-contract-hardening.test.ts?raw'
import providerEvidenceLocatorTest from './openai-provider-evidence-locator.test.ts?raw'
import postPilot16RequalificationTest from './post-pilot16-requalification.test.ts?raw'
import postPilot17RequalificationTest from './post-pilot17-requalification.test.ts?raw'
import q2MarkingPackAoContractTest from './q2-marking-pack-ao-contract.test.ts?raw'
import teachingPointIntegrityTest from './teaching-point-integrity.test.ts?raw'

type EvidenceKind = 'exact_historical_output' | 'synthetic_reproduction'
type ExpectedDisposition =
  | 'schema_prevented'
  | 'deterministically_compiled'
  | 'deterministically_validated'
  | 'truthfully_rejected'
  | 'bounded_repaired_then_revalidated'
type PilotCategory =
  | 'non_contract_operational'
  | 'contract_class'
  | 'mixed_contract_and_other'
  | 'educational_assurance'

interface HistoricalDefectClass {
  id: string
  firstSeenPilot: number
  summary: string
  evidenceKind: EvidenceKind
  historicalEvidenceStrength: string
  historicalSources: string[]
  syntheticBasis?: string
  fixturePath?: string
  expectedDisposition: ExpectedDisposition
  replayTests: string[]
}

interface HistoricalPilot {
  pilotNumber: number
  workflowRunId: number
  historicalHeadSha: string
  category: PilotCategory
  q2ClassIds: string[]
  exclusions: string[]
}

interface HistoricalFailureCorpus {
  schemaVersion: number
  workItem: string
  status: string
  baseMainSha: string
  historicalRecordsRewritten: boolean
  q2Passed: boolean
  overallReliabilityV2Passed: boolean
  evidencePolicy: {
    allowedKinds: EvidenceKind[]
    currentExactHistoricalOutputClaims: number
  }
  defectClasses: HistoricalDefectClass[]
  pilots: HistoricalPilot[]
}

const corpus = JSON.parse(corpusText) as HistoricalFailureCorpus
const classById = new Map(corpus.defectClasses.map((defectClass) => [defectClass.id, defectClass]))
const replaySources: Record<string, string> = {
  'src/content-factory/assessment-integrity.test.ts': assessmentIntegrityTest,
  'src/content-factory/coverage-finalization.test.ts': coverageFinalizationTest,
  'src/content-factory/openai-live-adapter.assessment-item-policy.test.ts': assessmentItemPolicyTest,
  'src/content-factory/openai-live-adapter-independent-review.test.ts': independentReviewTest,
  'src/content-factory/openai-live-adapter.test.ts': liveAdapterTest,
  'src/content-factory/openai-assessment-integrity-compiler.test.ts': assessmentIntegrityCompilerTest,
  'src/content-factory/openai-assessment-item-provider-normalizer.test.ts': assessmentItemNormalizerTest,
  'src/content-factory/openai-learning-blueprint-compiler.test.ts': learningBlueprintCompilerTest,
  'src/content-factory/openai-marking-pack-v2-compiler.test.ts': markingPackV2CompilerTest,
  'src/content-factory/openai-output-integrity-compiler.test.ts': outputIntegrityCompilerTest,
  'src/content-factory/openai-provider-contract-hardening.test.ts': providerContractHardeningTest,
  'src/content-factory/openai-provider-evidence-locator.test.ts': providerEvidenceLocatorTest,
  'src/content-factory/post-pilot16-requalification.test.ts': postPilot16RequalificationTest,
  'src/content-factory/post-pilot17-requalification.test.ts': postPilot17RequalificationTest,
  'src/content-factory/q2-marking-pack-ao-contract.test.ts': q2MarkingPackAoContractTest,
  'src/content-factory/teaching-point-integrity.test.ts': teachingPointIntegrityTest,
}
const retainedExactFixtures: Record<string, string> = {}

describe('Reliability v2-B historical failure replay corpus', () => {
  it('covers Pilots #1-#18 exactly once with exact run/head provenance', () => {
    expect(corpus.schemaVersion).toBe(1)
    expect(corpus.workItem).toBe('V2-B')
    expect(corpus.baseMainSha).toMatch(/^[0-9a-f]{40}$/)
    expect(corpus.historicalRecordsRewritten).toBe(false)

    const pilotNumbers = corpus.pilots.map((pilot) => pilot.pilotNumber)
    expect(pilotNumbers).toEqual(Array.from({ length: 18 }, (_, index) => index + 1))
    expect(new Set(pilotNumbers).size).toBe(18)
    expect(new Set(corpus.pilots.map((pilot) => pilot.workflowRunId)).size).toBe(18)

    for (const pilot of corpus.pilots) {
      expect(pilot.workflowRunId).toBeGreaterThan(0)
      expect(pilot.historicalHeadSha).toMatch(/^[0-9a-f]{40}$/)
      expect([
        'non_contract_operational',
        'contract_class',
        'mixed_contract_and_other',
        'educational_assurance',
      ] satisfies PilotCategory[]).toContain(pilot.category)
    }
  })

  it('requires every Q2 class reference to resolve to one permanent executable regression', () => {
    expect(corpus.defectClasses.length).toBeGreaterThan(0)
    expect(new Set(corpus.defectClasses.map((defectClass) => defectClass.id)).size).toBe(corpus.defectClasses.length)

    for (const pilot of corpus.pilots) {
      for (const classId of pilot.q2ClassIds) {
        expect(classById.has(classId), `Pilot #${pilot.pilotNumber} references unknown class ${classId}`).toBe(true)
      }
    }

    for (const defectClass of corpus.defectClasses) {
      expect(corpus.pilots.some((pilot) => pilot.q2ClassIds.includes(defectClass.id))).toBe(true)
      expect(defectClass.summary.length).toBeGreaterThan(20)
      expect(defectClass.historicalEvidenceStrength.length).toBeGreaterThan(0)
      expect(defectClass.historicalSources.length).toBeGreaterThan(0)
      expect(defectClass.replayTests.length).toBeGreaterThan(0)

      for (const replayTest of defectClass.replayTests) {
        expect(replayTest.endsWith('.test.ts')).toBe(true)
        const source = replaySources[replayTest]
        expect(source, `${defectClass.id} replay test missing from compile-time registry: ${replayTest}`).toBeTruthy()
        expect(source).toMatch(/\b(?:it|test)\s*\(/)
      }
    }
  })

  it('keeps synthetic reproductions explicit and forbids unsupported exact-output claims', () => {
    const exactClaims = corpus.defectClasses.filter((defectClass) => defectClass.evidenceKind === 'exact_historical_output')
    expect(corpus.evidencePolicy.currentExactHistoricalOutputClaims).toBe(exactClaims.length)

    for (const defectClass of corpus.defectClasses) {
      expect(corpus.evidencePolicy.allowedKinds).toContain(defectClass.evidenceKind)
      if (defectClass.evidenceKind === 'exact_historical_output') {
        expect(defectClass.fixturePath).toBeTruthy()
        const fixture = retainedExactFixtures[defectClass.fixturePath ?? '__missing_fixture__']
        expect(fixture, `${defectClass.id} exact fixture is not retained in the compile-time fixture registry`).toBeTruthy()
      } else {
        expect(defectClass.syntheticBasis?.length ?? 0).toBeGreaterThan(30)
      }
    }
  })

  it('requires explicit exclusions for historical incidents that are not fully Q2 contract classes', () => {
    for (const pilot of corpus.pilots) {
      if (pilot.category === 'contract_class') {
        expect(pilot.q2ClassIds.length).toBeGreaterThan(0)
      }
      if (pilot.category === 'non_contract_operational' || pilot.category === 'educational_assurance') {
        expect(pilot.q2ClassIds).toEqual([])
        expect(pilot.exclusions.length).toBeGreaterThan(0)
      }
      if (pilot.category === 'mixed_contract_and_other') {
        expect(pilot.q2ClassIds.length).toBeGreaterThan(0)
        expect(pilot.exclusions.length).toBeGreaterThan(0)
      }
      for (const exclusion of pilot.exclusions) expect(exclusion.length).toBeGreaterThan(20)
    }
  })

  it('records known recurrence and mixed-pilot boundaries without inflating the defect-class count', () => {
    const pilot10 = corpus.pilots.find((pilot) => pilot.pilotNumber === 10)
    const pilot15 = corpus.pilots.find((pilot) => pilot.pilotNumber === 15)
    expect(pilot10?.q2ClassIds).toContain('practice_exact_evidence_locator')
    expect(pilot15?.q2ClassIds).toContain('practice_exact_evidence_locator')

    const pilot7 = corpus.pilots.find((pilot) => pilot.pilotNumber === 7)
    expect(pilot7?.category).toBe('mixed_contract_and_other')
    expect(pilot7?.exclusions.join(' ')).toMatch(/durability|checkpoint|spend/i)

    const pilot16 = corpus.pilots.find((pilot) => pilot.pilotNumber === 16)
    expect(pilot16?.category).toBe('mixed_contract_and_other')
    expect(pilot16?.q2ClassIds.length).toBeGreaterThanOrEqual(5)
    expect(pilot16?.exclusions.join(' ')).toMatch(/educational/i)
  })

  it('does not claim Q2 or overall Reliability v2 PASS before same-head assurance', () => {
    expect(corpus.status).toBe('implemented_pending_same_head_assurance')
    expect(corpus.q2Passed).toBe(false)
    expect(corpus.overallReliabilityV2Passed).toBe(false)
  })
})
