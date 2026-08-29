import { describe, expect, it } from 'vitest'
import ownershipText from '../../content-factory/reliability-v2-a-marking-pack-ownership.json?raw'
import { currentDurableWorkerDependencyPolicy } from './durable-worker-dependencies'

type OwnershipEntry = {
  fieldClass: string
  fieldPatterns: string[]
  ownership: string
}

type OwnershipRegister = {
  schemaVersion: number
  status: string
  workItem: string
  scope: string
  providerBoundary: {
    educationalJudgementOnly: boolean
    compilerOwnedFieldsExcludedFromStructuredProviderSchema: string[]
  }
  ownership: OwnershipEntry[]
  legacyInventoryDisposition: {
    statusForThisBoundary: string
  }
  qualificationEffect: {
    v2AImplemented: boolean
    q1Passed: boolean
    overallReliabilityV2Passed: boolean
  }
}

const register = JSON.parse(ownershipText) as OwnershipRegister

function ownership(fieldClass: string) {
  const entry = register.ownership.find((candidate) => candidate.fieldClass === fieldClass)
  expect(entry, `missing ownership entry ${fieldClass}`).toBeDefined()
  return entry!
}

describe('Reliability v2-A Marking Pack ownership register', () => {
  it('records compiler ownership for constructible Marking Pack mechanics', () => {
    expect(register.schemaVersion).toBe(1)
    expect(register.workItem).toBe('V2-A')
    expect(register.scope).toBe('marking_pack_generation')
    expect(register.providerBoundary.educationalJudgementOnly).toBe(true)
    expect(register.providerBoundary.compilerOwnedFieldsExcludedFromStructuredProviderSchema).toEqual([
      'subquestionGuidance[].maxMark',
      'assessmentObjectiveAllocation',
      'rubric[].id',
      'rubric[].minMark',
      'rubric[].maxMark',
    ])
    expect(ownership('subquestion maximum mark').ownership).toBe('deterministically_derived')
    expect(ownership('structured aggregate assessment-objective totals').ownership).toBe('deterministically_derived')
    expect(ownership('rubric identity and numeric mark bands').ownership).toBe('deterministically_derived')
    expect(ownership('complete Marking Pack semantic diagnostics').ownership).toBe('targeted_repair_eligible')
  })

  it('does not overclaim Reliability v2 qualification from this bounded work item', () => {
    expect(register.status).toBe('implemented_pending_same_head_assurance')
    expect(register.legacyInventoryDisposition.statusForThisBoundary).toBe('pre_reliability_v2_evidence')
    expect(register.qualificationEffect).toEqual({
      v2AImplemented: true,
      q1Passed: false,
      overallReliabilityV2Passed: false,
      nextEvidence: 'same-head provider-free contract, historical-corpus and adversarial qualification',
    })
  })

  it('preserves the V2-A Marking Pack boundary while allowing later independently governed boundaries to advance', () => {
    expect(currentDurableWorkerDependencyPolicy.generateMarkingPack.contractVersion).toContain('output-integrity-v2')
    expect(currentDurableWorkerDependencyPolicy.generateAssessmentItem.contractVersion).toBe('2+output-integrity-v3')
    expect(currentDurableWorkerDependencyPolicy.generateLearningCollateral.contractVersion).toContain('output-integrity-v2')
    expect(currentDurableWorkerDependencyPolicy.generatePracticeCollateral.contractVersion).toContain('output-integrity-v2')
  })
})
