import { describe, expect, it } from 'vitest'
import { runReviewUnits, type Checklist, type Ledger } from './fast-path-review'

const checklist: Checklist = {
  stage: 'identity_contract',
  version: 'test-1',
  checks: [{ id: 'identity_check', question: 'Does the supplied unit pass?' }],
}

const ledger = (): Ledger => ({ schema_version: 1, stage: checklist.stage, checklist_version: checklist.version, units: {} })
const output = (unitId: string) => ({
  unit_id: unitId,
  answers: [{ check_id: 'identity_check', answer: 'yes' as const, note: '' }],
  findings: [],
})

const run = (expectedUnitId: string, returnedUnitId: string) => {
  let calls = 0
  return runReviewUnits({
    units: [{ unit_id: expectedUnitId, fingerprint: 'fingerprint-1' }],
    ledger: ledger(),
    checklist,
    knownSourceIds: () => new Set<string>(),
    review: async () => {
      calls += 1
      return { ok: true as const, output: output(returnedUnitId) }
    },
    now: () => '2026-10-05T00:00:00Z',
  }).then((result) => ({ ...result, calls }))
}

describe('review unit identity normalisation', () => {
  it('accepts a case-only provider ID difference and retains the canonical planned ID', async () => {
    const result = await run('P1-B-CHUNK-2', 'p1-b-chunk-2')
    expect(result.calls).toBe(1)
    expect(result.outcomes[0]).toMatchObject({ unit_id: 'P1-B-CHUNK-2', status: 'passed' })
    expect(result.ledger.units['P1-B-CHUNK-2']).toMatchObject({ outcome: 'passed' })
    expect(result.summary).toMatchObject({ passed: ['P1-B-CHUNK-2'], failed: [], can_progress: true })
  })

  it('still rejects a genuinely different provider ID after the bounded three attempts', async () => {
    const result = await run('P1-B-CHUNK-2', 'P1-B-CHUNK-3')
    expect(result.calls).toBe(3)
    expect(result.outcomes[0]).toMatchObject({ unit_id: 'P1-B-CHUNK-2', status: 'failed', attempts: 3, error: 'review answered for P1-B-CHUNK-3' })
    expect(result.summary).toMatchObject({ passed: [], failed: ['P1-B-CHUNK-2'], can_progress: false })
  })
})
