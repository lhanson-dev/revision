import { describe, expect, it } from 'vitest'
import {
  classifyFindings,
  escalationEntries,
  runReviewUnits,
  type AttemptResult,
  type Checklist,
  type ClassifiedFinding,
  type Finding,
  type Ledger,
} from './fast-path-review'

const checklist: Checklist = {
  stage: 'course_gate',
  version: 'test-1',
  checks: [
    { id: 'mapping_sense', question: 'Do the mapped nodes teach what the section asks?' },
    { id: 'accuracy', question: 'Is each changed definition correct?', requiresContradictingSource: true },
  ],
}
const sources = new Set(['SRC-1'])
const emptyLedger = (): Ledger => ({ schema_version: 1, stage: 'course_gate', checklist_version: 'test-1', units: {} })
const finding = (overrides: Partial<Finding> = {}): Finding => ({
  check_id: 'mapping_sense', category: 'missing_examinable_item', affected_ids: ['x'], finding: 'f', evidence: 'e', contradicting_source_id: null, proposed_fix: 'p', ...overrides,
})
const answers = [{ check_id: 'mapping_sense', answer: 'yes', note: '' }, { check_id: 'accuracy', answer: 'yes', note: '' }]
const reply = (unitId: string, findings: Finding[] = []): AttemptResult => ({ ok: true, output: { unit_id: unitId, answers, findings } })
const run = (units: { unit_id: string; fingerprint: string; softwareFindings?: ClassifiedFinding[] }[], review: (id: string, attempt: number) => Promise<AttemptResult>, ledger = emptyLedger()) =>
  runReviewUnits({ units, ledger, checklist, knownSourceIds: () => sources, review: (unit, attempt) => review(unit.unit_id, attempt), now: () => '2026-09-30T00:00:00Z' })

describe('what blocks', () => {
  it('blocks only proven teaching errors that name a checklist question', () => {
    const [missing, citation, style, unnamed] = classifyFindings([
      finding(),
      finding({ category: 'weak_citation' }),
      finding({ category: 'opinion_or_style' }),
      finding({ check_id: 'anything_else' }),
    ], checklist, sources)
    expect(missing.disposition).toBe('blocking')
    expect(citation.disposition).toBe('logged')
    expect(style.disposition).toBe('logged')
    expect(unnamed).toMatchObject({ disposition: 'logged', reason: 'does not name a check from the fixed checklist' })
  })

  it('logs an accuracy finding that does not cite a supplied contradicting source', () => {
    const [noSource, unknownSource, sourced] = classifyFindings([
      finding({ check_id: 'accuracy', category: 'wrong_teaching' }),
      finding({ check_id: 'accuracy', category: 'wrong_teaching', contradicting_source_id: 'SRC-UNKNOWN' }),
      finding({ check_id: 'accuracy', category: 'wrong_teaching', contradicting_source_id: 'SRC-1' }),
    ], checklist, sources)
    expect(noSource.disposition).toBe('logged')
    expect(unknownSource.disposition).toBe('logged')
    expect(sourced.disposition).toBe('blocking')
  })
})

describe('failures stay small', () => {
  it('retries an AI call three times, marks only that unit failed and carries on', async () => {
    const calls: string[] = []
    const { summary, outcomes } = await run(
      [{ unit_id: 'a', fingerprint: '1' }, { unit_id: 'b', fingerprint: '1' }],
      async (id) => { calls.push(id); return id === 'a' ? { ok: false, error: 'timeout' } : reply('b') },
    )
    expect(calls).toEqual(['a', 'a', 'a', 'b'])
    expect(outcomes[0]).toMatchObject({ status: 'failed', attempts: 3, error: 'timeout' })
    expect(summary).toMatchObject({ failed: ['a'], passed: ['b'], can_progress: false })
  })

  it('treats malformed output and a thrown error as a retryable failure', async () => {
    let attempt = 0
    const { summary } = await run([{ unit_id: 'a', fingerprint: '1' }], async () => {
      attempt += 1
      if (attempt === 1) throw new Error('network')
      if (attempt === 2) return { ok: true, output: { unit_id: 'a', answers: [], findings: [] } }
      return reply('a')
    })
    expect(summary.passed).toEqual(['a'])
  })
})

describe('reuse and round limit', () => {
  it('does not re-review a unit whose inputs have not changed', async () => {
    const first = await run([{ unit_id: 'a', fingerprint: '1' }], async () => reply('a'))
    let called = false
    const second = await run([{ unit_id: 'a', fingerprint: '1' }], async () => { called = true; return reply('a') }, first.ledger)
    expect(called).toBe(false)
    expect(second.summary).toMatchObject({ reused_unchanged: ['a'], passed: ['a'], can_progress: true })
  })

  it('allows two review rounds, then escalates instead of starting a third', async () => {
    const blocking = async () => reply('a', [finding()])
    const round1 = await run([{ unit_id: 'a', fingerprint: '1' }], blocking)
    expect(round1.outcomes[0]).toMatchObject({ status: 'blocking', round: 1 })
    const round2 = await run([{ unit_id: 'a', fingerprint: '2' }], blocking, round1.ledger)
    expect(round2.outcomes[0]).toMatchObject({ status: 'blocking', round: 2 })
    let called = false
    const round3 = await run([{ unit_id: 'a', fingerprint: '3' }], async () => { called = true; return reply('a') }, round2.ledger)
    expect(called).toBe(false)
    expect(round3.summary).toMatchObject({ escalated: ['a'], can_progress: false })
    expect(escalationEntries(round3.ledger)[0]).toMatchObject({ unit_id: 'a', options: ['accept as it is', 'fix a specific way', 'remove the item'] })
  })

  it('lets the unit progress once the Founder has decided', async () => {
    const round1 = await run([{ unit_id: 'a', fingerprint: '1' }], async () => reply('a', [finding()]))
    const round2 = await run([{ unit_id: 'a', fingerprint: '2' }], async () => reply('a', [finding()]), round1.ledger)
    const escalated = await run([{ unit_id: 'a', fingerprint: '3' }], async () => reply('a'), round2.ledger)
    escalated.ledger.units.a.founder_decision = { decision: 'accept', note: 'acceptable at A-level', decided_at: '2026-09-30' }
    const after = await run([{ unit_id: 'a', fingerprint: '3' }], async () => reply('a'), escalated.ledger)
    expect(after.summary).toMatchObject({ escalated: [], can_progress: true })
  })

  it('a passed review resets the round count', async () => {
    const round1 = await run([{ unit_id: 'a', fingerprint: '1' }], async () => reply('a', [finding()]))
    const passed = await run([{ unit_id: 'a', fingerprint: '2' }], async () => reply('a'), round1.ledger)
    expect(passed.ledger.units.a.consecutive_blocking_rounds).toBe(0)
  })
})

describe('software first', () => {
  it('skips AI review when software has already proven a blocking gap, without using a round', async () => {
    const [softwareFinding] = classifyFindings([finding({ check_id: 'mapping_sense' })], checklist, sources)
    let called = false
    const { outcomes, ledger } = await run([{ unit_id: 'a', fingerprint: '1', softwareFindings: [softwareFinding] }], async () => { called = true; return reply('a') })
    expect(called).toBe(false)
    expect(outcomes[0]).toMatchObject({ status: 'blocking', round: 0 })
    expect(ledger.units.a.consecutive_blocking_rounds).toBe(0)
  })
})

describe('concurrency', () => {
  it('reviews several units at once and keeps outcomes in unit order', async () => {
    let inFlight = 0
    let peak = 0
    const units = ['a', 'b', 'c', 'd'].map((id) => ({ unit_id: id, fingerprint: '1' }))
    const { outcomes } = await runReviewUnits({
      units, ledger: emptyLedger(), checklist, knownSourceIds: () => sources, concurrency: 3,
      review: async (unit) => { inFlight += 1; peak = Math.max(peak, inFlight); await new Promise((resolve) => setTimeout(resolve, 5)); inFlight -= 1; return reply(unit.unit_id) },
    })
    expect(peak).toBe(3)
    expect(outcomes.map((outcome) => outcome.unit_id)).toEqual(['a', 'b', 'c', 'd'])
  })
})
