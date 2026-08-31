import { describe, expect, it } from 'vitest'
import inventoryText from '../../content-factory/reliability-contract-inventory.json?raw'

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

type Blocker = {
  id: string
  worker: string
  nextGate?: string
  requiredResolution?: string
}

type ResolvedBlocker = {
  id: string
  worker: string
  resolutionGate: string
  resolution: string
  evidence: string[]
}

type Inventory = {
  schemaVersion: number
  status: string
  q1Pass: boolean
  reviewedAgainstMainSha: string
  allowedOwnership: Ownership[]
  requiredWorkerBoundaries: string[]
  workers: WorkerBoundary[]
  blockers: Blocker[]
  resolvedBlockers: ResolvedBlocker[]
  pilot19ArchitectureDecision: {
    defectClass: string
    classification: string
    decision: string
    assessmentItemSemanticVersion: string
    markingPackOwnershipChanged: boolean
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

describe('Content Factory Q1 reliability contract inventory after Pilot #19', () => {
  it('covers every governed material worker boundary exactly once', () => {
    const workerIds = inventory.workers.map((boundary) => boundary.worker)
    expect(new Set(workerIds).size).toBe(workerIds.length)
    expect(new Set(workerIds)).toEqual(new Set(inventory.requiredWorkerBoundaries))
  })

  it('classifies every mechanical representation with an approved ownership type and implementation evidence', () => {
    expect(new Set(inventory.allowedOwnership)).toEqual(new Set(requiredOwnership))
    for (const boundary of inventory.workers) {
      expect(boundary.scope).toBe('generic')
      expect(boundary.reviewStatus.startsWith('complete')).toBe(true)
      expect(boundary.implementationRefs.length).toBeGreaterThan(0)
      expect(boundary.mechanicalFields.length).toBeGreaterThan(0)
      for (const field of boundary.mechanicalFields) {
        expect(requiredOwnership).toContain(field.ownership)
        expect(field.fieldClass.trim().length).toBeGreaterThan(0)
        expect(field.fieldPatterns.length).toBeGreaterThan(0)
        expect(field.mechanicalCheck.trim().length).toBeGreaterThan(0)
        expect(['compliant', 'blocker']).toContain(field.currentCompliance)
        if (field.currentCompliance === 'blocker') {
          expect(field.blockerId?.trim().length).toBeGreaterThan(0)
          expect(field.blocker?.trim().length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('allows Q1 PASS only when no current blocker remains', () => {
    const fieldBlockers = inventory.workers.flatMap((boundary) =>
      boundary.mechanicalFields
        .filter((field) => field.currentCompliance === 'blocker')
        .map((field) => ({ id: field.blockerId!, worker: boundary.worker })),
    )

    expect(new Set(inventory.blockers.map((blocker) => blocker.id))).toEqual(new Set(fieldBlockers.map((blocker) => blocker.id)))
    expect(fieldBlockers).toEqual([])
    expect(inventory.blockers).toEqual([])
    expect(inventory.q1Pass).toBe(true)
    expect(inventory.status).toBe('complete')
  })

  it('preserves provider-free evidence for the previously resolved generic blocker classes', () => {
    const resolvedIds = new Set(inventory.resolvedBlockers.map((blocker) => blocker.id))
    expect(resolvedIds).toEqual(new Set([
      'Q1-PRACTICE-EVIDENCE-PATH',
      'Q1-MARKING-PACK-DUPLICATE-AO-ARITHMETIC',
    ]))

    for (const resolved of inventory.resolvedBlockers) {
      expect(resolved.resolutionGate).toBe('Q2-provider-free-contract-matrix')
      expect(resolved.resolution.trim().length).toBeGreaterThan(0)
      expect(resolved.evidence.length).toBeGreaterThan(0)
    }
  })

  it('separates MCQ interaction mechanics from cognitive educational judgement', () => {
    const assessment = worker('assessment_item_generation')
    const selection = assessment.mechanicalFields.find((field) => field.fieldClass === 'selection interaction contract')
    const mcqCognitive = assessment.mechanicalFields.find((field) => field.fieldClass === 'MCQ knowledge and application cognitive demand')
    const explicitDemand = assessment.mechanicalFields.find((field) => field.fieldClass === 'explicit operational cognitive demand command evidence')

    expect(selection?.ownership).toBe('targeted_repair_eligible')
    expect(mcqCognitive?.ownership).toBe('generative_judgement')
    expect(mcqCognitive?.mechanicalCheck).toContain('rather than a second mechanically provable command verb')
    expect(explicitDemand?.ownership).toBe('targeted_repair_eligible')
    expect(explicitDemand?.mechanicalCheck).toContain('Calculation, interpretation, analysis and evaluation')

    expect(inventory.pilot19ArchitectureDecision).toMatchObject({
      defectClass: 'assessment_mcq_cognitive_demand_lexical_overconstraint',
      classification: 'generic_engineering_contract_class',
      assessmentItemSemanticVersion: '2+output-integrity-v5',
      markingPackOwnershipChanged: false,
    })
  })

  it('keeps prior compiler ownership corrections intact', () => {
    const practice = worker('practice_generation')
    const practiceEvidence = practice.mechanicalFields.find((field) => field.fieldClass === 'teaching-point coverage evidence')
    expect(practiceEvidence?.ownership).toBe('bounded_locator_reference')

    const markingPack = worker('marking_pack_generation')
    const aggregateAo = markingPack.mechanicalFields.find((field) => field.fieldClass === 'aggregate assessment-objective totals')
    expect(aggregateAo?.ownership).toBe('deterministically_derived')
  })

  it('is tied to the exact approved main commit reviewed by the architecture change', () => {
    expect(inventory.schemaVersion).toBe(4)
    expect(inventory.reviewedAgainstMainSha).toBe('23b0849354e99d6be865361009388af5922d2f3f')
    expect(inventoryText.toLowerCase()).not.toContain('business-specific')
  })
})
