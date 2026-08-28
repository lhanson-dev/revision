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

describe('Content Factory Q1 reliability contract inventory', () => {
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

    if (fieldBlockers.length > 0) {
      expect(inventory.q1Pass).toBe(false)
      expect(inventory.status).toBe('complete_with_blockers')
    } else {
      expect(inventory.blockers).toEqual([])
      expect(inventory.q1Pass).toBe(true)
      expect(inventory.status).toBe('complete')
    }
  })

  it('records provider-free evidence for both previously known generic blocker classes', () => {
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

  it('locks the remediated ownership classes into the current inventory', () => {
    const practice = worker('practice_generation')
    const practiceEvidence = practice.mechanicalFields.find((field) => field.fieldClass === 'teaching-point coverage evidence')
    expect(practiceEvidence?.ownership).toBe('bounded_locator_reference')
    expect(practiceEvidence?.currentCompliance).toBe('compliant')

    const markingPack = worker('marking_pack_generation')
    const aggregateAo = markingPack.mechanicalFields.find((field) => field.fieldClass === 'aggregate assessment-objective totals')
    expect(aggregateAo?.ownership).toBe('deterministically_derived')
    expect(aggregateAo?.currentCompliance).toBe('compliant')

    const assessment = worker('assessment_item_generation')
    const responseDemand = assessment.mechanicalFields.find((field) => field.fieldClass === 'response demand versus learner-facing command wording')
    expect(responseDemand?.ownership).toBe('targeted_repair_eligible')
  })

  it('is tied to the exact reviewed main commit rather than a subject-specific course', () => {
    expect(inventory.schemaVersion).toBe(3)
    expect(inventory.reviewedAgainstMainSha).toBe('0e9e7bb7c85ddbc72965a056a84c5d2c864e0659')
    expect(inventoryText.toLowerCase()).not.toContain('business-specific')
    expect(inventoryText).not.toContain('aqa-as-business-7131')
  })
})
