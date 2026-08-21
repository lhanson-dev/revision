import { describe, expect, it } from 'vitest'
import { defectRegister, openDefectCounts, parseDefectRegister } from './defect-register'

describe('defect register projection', () => {
  it('projects closed historical defects with zero known open P0/P1/P2 defects', () => {
    expect(defectRegister.available).toBe(true)
    expect(defectRegister.version).toBe(1)
    expect(defectRegister.lastTriaged).toBe('2026-08-21')
    expect(defectRegister.records.some((record) => record.id === 'DEF-2026-001' && record.status === 'Closed')).toBe(true)
    expect(defectRegister.records.some((record) => record.id === 'DEF-2026-002' && record.status === 'Closed')).toBe(true)
    expect(defectRegister.records.some((record) => record.id === 'DEF-2026-003' && record.severity === 'P1' && record.status === 'Closed')).toBe(true)
    expect(defectRegister.records.some((record) => record.id === 'DEF-2026-004' && record.severity === 'P1' && record.status === 'Closed')).toBe(true)
    expect(openDefectCounts(defectRegister.records)).toEqual({ P0: 0, P1: 0, P2: 0, total: 0 })
  })

  it('treats a deliberately triaged valid empty register as available with zero known open defects', () => {
    const projection = parseDefectRegister(`**Defect register version:** 1\n**Last triaged:** 2026-08-19\n\n| Defect ID | Severity | Affected journey / control | Observed evidence | Status | Owner / next action | Fix PR | Verification / closure evidence |\n|---|---|---|---|---|---|---|---|`)
    expect(projection.available).toBe(true)
    expect(projection.records).toEqual([])
    expect(openDefectCounts(projection.records)).toEqual({ P0: 0, P1: 0, P2: 0, total: 0 })
  })

  it('fails unavailable when the register version or triage marker is missing', () => {
    const projection = parseDefectRegister('| DEF-2026-999 | P0 | Core | evidence | Open | act | #1 | pending |')
    expect(projection.available).toBe(false)
  })
})
