import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  MAX_ASSESSMENT_ITEM_CANDIDATES,
  assessmentCandidateRef,
  assessmentSlotRef,
} from '../src/content-factory/assessment-candidate-recovery.ts'
import {
  MAX_MARKING_PACK_CANDIDATES,
  markingPackCandidateRef,
  markingPackSlotRef,
} from '../src/content-factory/marking-pack-candidate-recovery.ts'

const inventory = JSON.parse(readFileSync(new URL('../content-factory/reliability-contract-inventory.json', import.meta.url), 'utf8'))
const reviewedMainSha = '721063a9e31e3cf695a99bfa63af74af7d36c7bc'

const requiredRecoveryControls = [
  'assessment_slot_identity',
  'assessment_candidate_ordinal_and_limit',
  'assessment_candidate_disposition',
  'marking_pack_slot_identity',
  'marking_pack_candidate_ordinal_and_limit',
  'marking_pack_candidate_disposition',
  'accepted_dependency_freeze',
  'bounded_recovery_exhaustion',
  'required_coverage_reconciliation',
]

function worker(name) {
  return inventory.workers.find((entry) => entry.worker === name)
}

function fieldClass(workerName, name) {
  return worker(workerName)?.mechanicalFields.find((entry) => entry.fieldClass === name)
}

describe('Content Factory Q1 post-Pilot #20 ownership inventory', () => {
  it('is explicitly refreshed against the candidate-recovery main baseline', () => {
    expect(inventory.schemaVersion).toBe(4)
    expect(inventory.status).toBe('complete')
    expect(inventory.q1Pass).toBe(true)
    expect(inventory.reviewedAgainstMainSha).toBe(reviewedMainSha)
    expect(inventory.architectureResetReview.trigger).toContain('Pilot #20')
    expect(inventory.blockers).toEqual([])
  })

  it('assigns every recovery control to Revision rather than generative judgement', () => {
    const controls = new Map(inventory.recoveryControlOwnership.map((entry) => [entry.id, entry]))
    expect([...controls.keys()].sort()).toEqual([...requiredRecoveryControls].sort())

    for (const control of controls.values()) {
      expect(['deterministically_derived', 'fail_closed']).toContain(control.ownership)
      expect(control.currentCompliance).toBe('compliant')
      expect(control.implementationRefs.length).toBeGreaterThan(0)
    }
  })

  it('binds the inventory candidate envelopes to the production slot refs and ceilings', () => {
    const assessmentLimit = inventory.recoveryControlOwnership.find((entry) => entry.id === 'assessment_candidate_ordinal_and_limit')
    const markingLimit = inventory.recoveryControlOwnership.find((entry) => entry.id === 'marking_pack_candidate_ordinal_and_limit')

    expect(assessmentLimit.maxCandidates).toBe(MAX_ASSESSMENT_ITEM_CANDIDATES)
    expect(markingLimit.maxCandidates).toBe(MAX_MARKING_PACK_CANDIDATES)
    expect(assessmentSlotRef({ familyId: 'family-a', componentId: 'paper-1' })).toBe('assessment-slot:family-a:paper-1')
    expect(assessmentCandidateRef({ familyId: 'family-a', componentId: 'paper-1' }, 2)).toBe('assessment-slot:family-a:paper-1:candidate:2')
    expect(markingPackSlotRef({ assessmentItemId: 'item-a' })).toBe('marking-pack-slot:item-a')
    expect(markingPackCandidateRef({ assessmentItemId: 'item-a' }, 2)).toBe('marking-pack-slot:item-a:candidate:2')
  })

  it('records candidateNumber and maxCandidates as Revision-owned inputs at both provider boundaries', () => {
    const assessmentEnvelope = fieldClass('assessment_item_generation', 'candidate recovery envelope')
    const markingEnvelope = fieldClass('marking_pack_generation', 'candidate recovery envelope')

    for (const envelope of [assessmentEnvelope, markingEnvelope]) {
      expect(envelope).toBeDefined()
      expect(envelope.ownership).toBe('deterministically_derived')
      expect(envelope.fieldPatterns).toContain('candidateNumber')
      expect(envelope.fieldPatterns).toContain('maxCandidates')
    }
  })

  it('keeps semantic educational authorship separate from mechanical recovery ownership', () => {
    expect(fieldClass('assessment_item_generation', 'question content and original context').ownership).toBe('generative_judgement')
    expect(fieldClass('marking_pack_generation', 'marking judgement, routes and diagnostic guidance').ownership).toBe('generative_judgement')

    const recoveryOwners = new Set(inventory.recoveryControlOwnership.map((entry) => entry.ownership))
    expect(recoveryOwners.has('generative_judgement')).toBe(false)
    expect(recoveryOwners.has('targeted_repair_eligible')).toBe(false)
  })
})
