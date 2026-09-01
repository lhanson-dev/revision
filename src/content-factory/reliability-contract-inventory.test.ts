import { describe, expect, it } from 'vitest'
import inventoryText from '../../content-factory/reliability-pilot20-candidate-ownership-inventory.json?raw'
import {
  assessmentCandidateRef,
  assessmentSlotRef,
  MAX_ASSESSMENT_ITEM_CANDIDATES,
} from './assessment-candidate-recovery'
import { contentFactoryAssessmentWorkerContracts } from './assessment-and-marking'
import {
  markingPackCandidateRef,
  markingPackSlotRef,
  MAX_MARKING_PACK_CANDIDATES,
} from './marking-pack-candidate-recovery'

type Ownership =
  | 'generative_judgement'
  | 'deterministically_derived'
  | 'bounded_locator_reference'
  | 'targeted_repair_eligible'
  | 'fail_closed'

type MechanicalField = {
  fieldClass: string
  fieldPatterns: string[]
  ownership: Ownership
  mechanicalCheck: string
  currentCompliance: 'compliant' | 'blocker'
  compilerOwnershipChallenge?: string
  blockerId?: string
  blocker?: string
}

type WorkerBoundary = {
  worker: string
  scope: string
  reviewStatus: string
  implementationRefs: string[]
  mechanicalFields: MechanicalField[]
}

type Inventory = {
  schemaVersion: number
  status: string
  q1Pass: boolean
  reviewedAgainstMainSha: string
  allowedOwnership: Ownership[]
  requiredWorkerBoundaries: string[]
  workers: WorkerBoundary[]
  blockers: Array<{ id: string; worker: string }>
  resolvedBlockers: Array<{ id: string; worker: string; resolutionGate: string; resolution: string; evidence: string[] }>
  preservedArchitectureDecisions: {
    pilot19: {
      defectClass: string
      decision: string
      historicalInventory: string
    }
    pilot20: {
      defectClass: string
      decision: string
      architectureRef: string
      assessmentItemContractVersion: string
      markingPackContractVersion: string
      assessmentMaxCandidates: number
      markingPackMaxCandidates: number
    }
  }
  qualificationEffect: {
    q1Evidence: string
    overallQualificationDecision: string
    machineQualificationStateChanged: boolean
    providerCallsUsed: boolean
    learnerPublication: boolean
  }
}

const inventory = JSON.parse(inventoryText) as Inventory
const requiredOwnership: Ownership[] = [
  'generative_judgement',
  'deterministically_derived',
  'bounded_locator_reference',
  'targeted_repair_eligible',
  'fail_closed',
]

function worker(workerId: string) {
  const boundary = inventory.workers.find((candidate) => candidate.worker === workerId)
  expect(boundary, `missing worker boundary ${workerId}`).toBeDefined()
  return boundary!
}

function field(workerId: string, fieldClass: string) {
  const result = worker(workerId).mechanicalFields.find((candidate) => candidate.fieldClass === fieldClass)
  expect(result, `missing ${workerId} field ${fieldClass}`).toBeDefined()
  return result!
}

describe('Content Factory Q1 compiler/worker ownership inventory after Pilot #20', () => {
  it('validates the current Pilot #20 inventory and covers every declared material boundary exactly once', () => {
    const workerIds = inventory.workers.map((boundary) => boundary.worker)
    expect(new Set(workerIds).size).toBe(workerIds.length)
    expect(new Set(workerIds)).toEqual(new Set(inventory.requiredWorkerBoundaries))
    expect(inventory.requiredWorkerBoundaries).toEqual(expect.arrayContaining([
      'assessment_item_generation',
      'marking_pack_generation',
      'candidate_recovery_orchestration',
      'required_coverage_reconciliation',
    ]))
  })

  it('classifies every field with governed ownership and explicitly challenges every field left generative', () => {
    expect(new Set(inventory.allowedOwnership)).toEqual(new Set(requiredOwnership))

    for (const boundary of inventory.workers) {
      expect(boundary.scope).toBe('generic')
      expect(boundary.reviewStatus.startsWith('complete')).toBe(true)
      expect(boundary.implementationRefs.length).toBeGreaterThan(0)
      expect(boundary.mechanicalFields.length).toBeGreaterThan(0)

      for (const candidate of boundary.mechanicalFields) {
        expect(requiredOwnership).toContain(candidate.ownership)
        expect(candidate.fieldClass.trim().length).toBeGreaterThan(0)
        expect(candidate.fieldPatterns.length).toBeGreaterThan(0)
        expect(candidate.mechanicalCheck.trim().length).toBeGreaterThan(0)
        expect(['compliant', 'blocker']).toContain(candidate.currentCompliance)

        if (candidate.ownership === 'generative_judgement') {
          expect(candidate.compilerOwnershipChallenge?.trim().length ?? 0).toBeGreaterThan(40)
        }
        if (candidate.currentCompliance === 'blocker') {
          expect(candidate.blockerId?.trim().length).toBeGreaterThan(0)
          expect(candidate.blocker?.trim().length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('allows Q1 PASS only when no current ownership blocker remains', () => {
    const fieldBlockers = inventory.workers.flatMap((boundary) =>
      boundary.mechanicalFields
        .filter((candidate) => candidate.currentCompliance === 'blocker')
        .map((candidate) => ({ id: candidate.blockerId!, worker: boundary.worker })),
    )

    expect(new Set(inventory.blockers.map((blocker) => blocker.id))).toEqual(new Set(fieldBlockers.map((blocker) => blocker.id)))
    expect(fieldBlockers).toEqual([])
    expect(inventory.blockers).toEqual([])
    expect(inventory.q1Pass).toBe(true)
    expect(inventory.status).toBe('complete')
  })

  it('keeps candidate slot identity, candidate number and retry ceilings in Revision ownership', () => {
    expect(field('assessment_item_generation', 'candidate attempt coordinates').ownership).toBe('deterministically_derived')
    expect(field('marking_pack_generation', 'candidate attempt coordinates').ownership).toBe('deterministically_derived')

    expect(assessmentSlotRef({ familyId: 'family-a', componentId: 'paper-1' })).toBe('assessment-slot:family-a:paper-1')
    expect(assessmentCandidateRef({ familyId: 'family-a', componentId: 'paper-1' }, 2)).toBe('assessment-slot:family-a:paper-1:candidate:2')
    expect(markingPackSlotRef({ assessmentItemId: 'question-1' })).toBe('marking-pack-slot:question-1')
    expect(markingPackCandidateRef({ assessmentItemId: 'question-1' }, 2)).toBe('marking-pack-slot:question-1:candidate:2')

    expect(MAX_ASSESSMENT_ITEM_CANDIDATES).toBe(2)
    expect(MAX_MARKING_PACK_CANDIDATES).toBe(2)
    expect(inventory.preservedArchitectureDecisions.pilot20.assessmentMaxCandidates).toBe(MAX_ASSESSMENT_ITEM_CANDIDATES)
    expect(inventory.preservedArchitectureDecisions.pilot20.markingPackMaxCandidates).toBe(MAX_MARKING_PACK_CANDIDATES)

    expect(contentFactoryAssessmentWorkerContracts.assessmentItem.contractVersion).toBe('3')
    expect(contentFactoryAssessmentWorkerContracts.markingPack.contractVersion).toBe('3')
    expect(contentFactoryAssessmentWorkerContracts.assessmentItem.sourceInput).toContain('durable-candidate-number')
    expect(contentFactoryAssessmentWorkerContracts.markingPack.sourceInput).toContain('durable-candidate-number')
  })

  it('keeps recovery lifecycle and required-course completeness out of model control', () => {
    const recovery = worker('candidate_recovery_orchestration')
    expect(recovery.mechanicalFields.every((candidate) => candidate.ownership !== 'generative_judgement')).toBe(true)
    expect(field('candidate_recovery_orchestration', 'candidate sequence and bounded ceilings').ownership).toBe('deterministically_derived')
    expect(field('candidate_recovery_orchestration', 'candidate acceptance and rejection state').ownership).toBe('fail_closed')
    expect(field('candidate_recovery_orchestration', 'recovery exhaustion and course blocking').ownership).toBe('fail_closed')

    const coverage = worker('required_coverage_reconciliation')
    expect(coverage.mechanicalFields.every((candidate) => candidate.ownership !== 'generative_judgement')).toBe(true)
    expect(field('required_coverage_reconciliation', 'mandatory requirement and channel contract').ownership).toBe('deterministically_derived')
    expect(field('required_coverage_reconciliation', 'missing required coverage disposition').ownership).toBe('fail_closed')
  })

  it('preserves the Pilot #19 boundary between interaction mechanics and educational cognitive judgement', () => {
    expect(field('assessment_item_generation', 'selection interaction contract').ownership).toBe('targeted_repair_eligible')
    expect(field('assessment_item_generation', 'MCQ knowledge and application cognitive demand').ownership).toBe('generative_judgement')
    expect(field('assessment_item_generation', 'explicit operational cognitive demand command evidence').ownership).toBe('targeted_repair_eligible')
    expect(inventory.preservedArchitectureDecisions.pilot19.defectClass).toBe('assessment_mcq_cognitive_demand_lexical_overconstraint')
    expect(inventory.preservedArchitectureDecisions.pilot19.historicalInventory).toBe('content-factory/reliability-pilot19-contract-inventory.json')
  })

  it('keeps prior compiler-ownership corrections and post-Pilot #20 qualification limits explicit', () => {
    expect(field('practice_generation', 'teaching-point coverage evidence').ownership).toBe('bounded_locator_reference')
    expect(field('marking_pack_generation', 'aggregate assessment-objective totals').ownership).toBe('deterministically_derived')

    expect(inventory.schemaVersion).toBe(5)
    expect(inventory.reviewedAgainstMainSha).toBe('721063a9e31e3cf695a99bfa63af74af7d36c7bc')
    expect(inventory.qualificationEffect).toEqual({
      q1Evidence: 'current_candidate_topology_provider_free_pass',
      overallQualificationDecision: 'paused',
      machineQualificationStateChanged: false,
      providerCallsUsed: false,
      learnerPublication: false,
    })
    expect(inventoryText.toLowerCase()).not.toContain('business-specific')
  })
})
