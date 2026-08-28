import { describe, expect, it } from 'vitest'
import qualificationText from '../../content-factory/reliability-qualification.json?raw'
import requalificationText from '../../content-factory/reliability-post-pilot16-requalification.json?raw'
import q1Text from '../../content-factory/reliability-contract-inventory.json?raw'
import q2Text from '../../content-factory/reliability-q2-contract-matrix.json?raw'
import q3Text from '../../content-factory/reliability-q3-subject-shape-matrix.json?raw'
import q4Text from '../../content-factory/reliability-q4-deterministic-pipeline-simulation.json?raw'
import q5Text from '../../content-factory/reliability-q5-restart-reuse-invalidation.json?raw'
import q6Text from '../../content-factory/reliability-q6-repeated-stability.json?raw'
import outputIntegritySource from './openai-output-integrity-compiler.ts?raw'
import {
  currentDurableWorkerDependencyPolicy,
  durableWorkerDependencyClosure,
} from './durable-worker-dependencies'
import { q3SubjectShapeIds } from './q3-subject-shape-fixtures'
import { q6RepetitionCount } from './q6-repeated-qualification-fixture'

type GateStatus = {
  status: 'pass'
  currentEvidence: string[]
}

type RequalificationRecord = {
  schemaVersion: number
  authority: string
  status: string
  scope: string
  reviewedImplementationMainSha: string
  verificationMode: string
  providerCallsUsed: boolean
  paidPilotEligible: boolean
  globalQualificationRequiredState: string
  qualificationDefectFoundDuringRequalification: {
    status: string
    finding: string
    resolution: string
    evidence: string[]
  }
  gates: {
    'Q1-worker-contract-inventory': GateStatus & {
      ownershipExtensions: Array<{ worker: string; fieldClass: string; ownership: string; evidence: string }>
    }
    'Q2-provider-free-contract-matrix': GateStatus & { currentCoverage: string[] }
    'Q3-subject-shape-matrix': GateStatus & { requiredShapes: string[]; crossSubjectRegression: string }
    'Q4-deterministic-pipeline-simulation': GateStatus & { providerCallsUsed: boolean }
    'Q5-restart-reuse-dependency-invalidation': GateStatus & {
      currentSemanticVersions: Record<string, string>
      providerCallsUsed: boolean
    }
    'Q6-repeated-qualification-stability': GateStatus & {
      repetitionCount: number
      subjectShapePipelineRuns: number
      deterministicPipelineRuns: number
      restartReuseScenarioSets: number
      providerCallsUsed: boolean
    }
  }
  limitations: string[]
}

const qualification = JSON.parse(qualificationText) as {
  status: string
  qualifiedEvidence: unknown | null
  livePilotEligible: boolean
}
const requalification = JSON.parse(requalificationText) as RequalificationRecord
const historical = {
  q1: JSON.parse(q1Text) as { status: string; q1Pass: boolean },
  q2: JSON.parse(q2Text) as { status: string; q2Pass: boolean },
  q3: JSON.parse(q3Text) as { status: string; q3Pass: boolean },
  q4: JSON.parse(q4Text) as { status: string; q4Pass: boolean },
  q5: JSON.parse(q5Text) as { status: string; q5Pass: boolean; providerCallsUsed: boolean },
  q6: JSON.parse(q6Text) as { status: string; q6Pass: boolean; providerCallsUsed: boolean; repetitionCount: number },
}

const expectedGates = [
  'Q1-worker-contract-inventory',
  'Q2-provider-free-contract-matrix',
  'Q3-subject-shape-matrix',
  'Q4-deterministic-pipeline-simulation',
  'Q5-restart-reuse-dependency-invalidation',
  'Q6-repeated-qualification-stability',
]

describe('Content Factory post-Pilot-16 provider-free requalification', () => {
  it('records Q1-Q6 requalification against the exact corrected approved-main baseline while keeping paid execution paused', () => {
    expect(requalification.schemaVersion).toBe(1)
    expect(requalification.authority).toBe('80-company-workflows/Content Factory Reliability Qualification Standard.md')
    expect(requalification.status).toBe('complete')
    expect(requalification.scope).toBe('post_pilot_16_provider_free_requalification')
    expect(requalification.reviewedImplementationMainSha).toBe('9f4d86dbeaca5a6fac13884bf8b161964a68ec88')
    expect(requalification.verificationMode).toBe('exact_head_ci')
    expect(requalification.providerCallsUsed).toBe(false)
    expect(requalification.paidPilotEligible).toBe(false)
    expect(requalification.globalQualificationRequiredState).toBe('paused')
    expect(Object.keys(requalification.gates)).toEqual(expectedGates)
    expect(Object.values(requalification.gates).every((gate) => gate.status === 'pass')).toBe(true)

    expect(qualification.status).toBe('paused')
    expect(qualification.livePilotEligible).toBe(false)
    expect(qualification.qualifiedEvidence).toBeNull()
  })

  it('preserves historical gate evidence while layering current requalification evidence instead of rewriting history', () => {
    expect(historical.q1).toMatchObject({ status: 'complete', q1Pass: true })
    expect(historical.q2).toMatchObject({ status: 'complete', q2Pass: true })
    expect(historical.q3).toMatchObject({ status: 'complete', q3Pass: true })
    expect(historical.q4).toMatchObject({ status: 'complete', q4Pass: true })
    expect(historical.q5).toMatchObject({ status: 'complete', q5Pass: true, providerCallsUsed: false })
    expect(historical.q6).toMatchObject({ status: 'complete', q6Pass: true, providerCallsUsed: false, repetitionCount: 3 })

    for (const gate of Object.values(requalification.gates)) {
      expect(gate.currentEvidence.length).toBeGreaterThan(0)
    }
  })

  it('classifies the new Pilot 16 integrity boundaries with the governed ownership vocabulary', () => {
    const ownership = requalification.gates['Q1-worker-contract-inventory'].ownershipExtensions
    expect(ownership.map((entry) => [entry.worker, entry.ownership])).toEqual([
      ['course_knowledge_model', 'deterministically_derived'],
      ['learn_generation', 'generative_judgement'],
      ['practice_generation', 'generative_judgement'],
      ['assessment_item_generation', 'deterministically_derived'],
      ['marking_pack_generation', 'targeted_repair_eligible'],
    ])
    expect(ownership.every((entry) => entry.fieldClass.length > 0 && entry.evidence.length > 0)).toBe(true)
  })

  it('removes the unsafe subject-shaped mutations and retains course-agnostic provider-free regressions', () => {
    expect(outputIntegritySource).not.toContain('repairCashDeficitPrompt')
    expect(outputIntegritySource).not.toContain('expectedResponseDeniesCashDeficit')
    expect(outputIntegritySource).not.toContain('cleanTrailingUnexpectedScriptToken')
    expect(outputIntegritySource).toContain('Preserve legitimate target-language')
    expect(outputIntegritySource).toContain('phrase the task conditionally')

    const q2 = requalification.gates['Q2-provider-free-contract-matrix']
    expect(q2.currentEvidence).toContain('src/content-factory/openai-output-integrity-compiler.test.ts')
    expect(q2.currentCoverage.join(' ')).toContain('legitimate target-language script is preserved')
    expect(q2.currentCoverage.join(' ')).toContain('no Business-specific phrase repair')
  })

  it('keeps all five governed subject shapes and explicitly protects the language/prescribed-text shape', () => {
    const q3 = requalification.gates['Q3-subject-shape-matrix']
    expect(new Set(q3.requiredShapes)).toEqual(new Set(q3SubjectShapeIds))
    expect(q3.crossSubjectRegression).toContain('legitimate non-Latin target-language text is preserved')
  })

  it('advances only the changed Learn/Practice durable semantic assumptions and keeps dependency invalidation bounded', () => {
    const q5 = requalification.gates['Q5-restart-reuse-dependency-invalidation']
    expect(currentDurableWorkerDependencyPolicy.generateLearningCollateral.contractVersion).toBe('3+output-integrity-v2')
    expect(currentDurableWorkerDependencyPolicy.generatePracticeCollateral.contractVersion).toBe('3+output-integrity-v2')
    expect(q5.currentSemanticVersions).toEqual({
      generateLearningCollateral: '3+output-integrity-v2',
      generatePracticeCollateral: '3+output-integrity-v2',
    })
    expect(q5.providerCallsUsed).toBe(false)

    const assessmentClosure = durableWorkerDependencyClosure('generateAssessmentItem').map((entry) => entry.method)
    expect(assessmentClosure).not.toContain('generateLearningCollateral')
    expect(assessmentClosure).not.toContain('generatePracticeCollateral')

    const reviewClosure = durableWorkerDependencyClosure('independentReview').map((entry) => entry.method)
    expect(reviewClosure).toContain('generateLearningCollateral')
    expect(reviewClosure).toContain('generatePracticeCollateral')
  })

  it('retains the governed three-repeat Q6 stability proof on the current implementation suite', () => {
    const q6 = requalification.gates['Q6-repeated-qualification-stability']
    expect(q6.repetitionCount).toBe(q6RepetitionCount)
    expect(q6RepetitionCount).toBe(3)
    expect(q6.subjectShapePipelineRuns).toBe(q3SubjectShapeIds.length * q6RepetitionCount)
    expect(q6.deterministicPipelineRuns).toBe(q6RepetitionCount)
    expect(q6.restartReuseScenarioSets).toBe(q6RepetitionCount)
    expect(q6.providerCallsUsed).toBe(false)
    expect(requalification.limitations.join(' ')).toContain('does not prove live external-provider behaviour')
  })
})
