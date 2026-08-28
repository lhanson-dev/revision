import { describe, expect, it } from 'vitest'
import q1InventoryText from '../../content-factory/reliability-contract-inventory.json?raw'
import q2MatrixText from '../../content-factory/reliability-q2-contract-matrix.json?raw'

type BoundaryStatus = 'remediation_evidenced' | 'evidence_mapped' | 'gap_identified'

type Q1Inventory = {
  requiredWorkerBoundaries: string[]
}

type Q2Boundary = {
  worker: string
  status: BoundaryStatus
  evidence: string[]
  coverage: string[]
  gaps: string[]
  q1BlockerId?: string
  rootCause?: string
}

type Q2Matrix = {
  schemaVersion: number
  status: string
  scope: string
  baseMainSha: string
  boundaries: Q2Boundary[]
  q2Pass: boolean
  paidPilotEligible: boolean
}

const q1 = JSON.parse(q1InventoryText) as Q1Inventory
const q2 = JSON.parse(q2MatrixText) as Q2Matrix
const completedStatuses: BoundaryStatus[] = ['remediation_evidenced', 'evidence_mapped']

describe('Content Factory Q2 provider-free worker contract matrix', () => {
  it('maps every governed Q1 worker boundary exactly once with no placeholder state left', () => {
    const workerIds = q2.boundaries.map((boundary) => boundary.worker)
    expect(q2.schemaVersion).toBe(2)
    expect(q2.scope).toBe('course_agnostic')
    expect(q2.baseMainSha).toMatch(/^[0-9a-f]{40}$/)
    expect(new Set(workerIds).size).toBe(workerIds.length)
    expect(new Set(workerIds)).toEqual(new Set(q1.requiredWorkerBoundaries))
    expect(q2MatrixText).not.toContain('pending_matrix')
  })

  it('requires auditable evidence and explicit coverage for every boundary', () => {
    for (const boundary of q2.boundaries) {
      expect(['remediation_evidenced', 'evidence_mapped', 'gap_identified']).toContain(boundary.status)
      expect(boundary.evidence.length, `${boundary.worker} must have evidence`).toBeGreaterThan(0)
      expect(boundary.coverage.length, `${boundary.worker} must state covered behaviour`).toBeGreaterThan(0)
      expect(boundary.evidence.every((ref) => ref.startsWith('src/content-factory/'))).toBe(true)
      expect(Array.isArray(boundary.gaps)).toBe(true)
      if (boundary.status === 'gap_identified') {
        expect(boundary.gaps.length, `${boundary.worker} must state the unresolved Q2 gap`).toBeGreaterThan(0)
      }
    }
  })

  it('prevents Q2 or paid-pilot eligibility while any mapped contract gap remains', () => {
    const unresolved = q2.boundaries.filter((boundary) => boundary.status === 'gap_identified' || boundary.gaps.length > 0)
    expect(unresolved.length).toBeGreaterThan(0)
    expect(q2.status).toBe('in_progress')
    expect(q2.q2Pass).toBe(false)
    expect(q2.paidPilotEligible).toBe(false)
  })

  it('would require every boundary to be completed and gap-free before a future Q2 pass claim', () => {
    if (q2.q2Pass) {
      expect(q2.boundaries.every((boundary) => completedStatuses.includes(boundary.status))).toBe(true)
      expect(q2.boundaries.every((boundary) => boundary.gaps.length === 0)).toBe(true)
    }
  })

  it('keeps the qualification record course-agnostic rather than binding it to the historical Business pilot job', () => {
    expect(q2MatrixText).not.toContain('aqa-as-business-7131')
    expect(q2MatrixText).not.toContain('marketing-research')
  })
})
