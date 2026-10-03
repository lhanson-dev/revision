import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { applyAqa7132QuestionFounderDecisions } from './apply-aqa-7132-question-founder-decisions.mjs'

const decisionsPath = 'content-factory/runs/aqa-7132-question-founder-decisions.json'
const sourcePath = 'content-factory/runs/aqa-7132-question-founder-decision-source.json'

async function loadJson(path: string) {
  return JSON.parse(await readFile(path, 'utf8'))
}

describe('AQA 7132 question Founder decision binding', () => {
  it('binds every 2 October run-36925676050 fix decision to the exact retained source-run ledger fingerprint', async () => {
    const decisionFile = await loadJson(decisionsPath)
    const source = await loadJson(sourcePath)
    expect(source.source_run_id).toBe(36925676050)

    const sourceByUnit = new Map(source.units.map((unit: { batch: string; unit_id: string; fingerprint: string }) => [`${unit.batch}/${unit.unit_id}`, unit.fingerprint]))
    const fixes = decisionFile.decisions.filter((decision: { decision: string; batch: string; unit_id: string }) => decision.decision === 'fix' && sourceByUnit.has(`${decision.batch}/${decision.unit_id}`))
    expect(fixes).toHaveLength(10)
    for (const decision of fixes) {
      expect(decision.prior_fingerprint, `${decision.batch}/${decision.unit_id}`).toBe(sourceByUnit.get(`${decision.batch}/${decision.unit_id}`))
    }
  })

  it('applies an exact decision and resets only the old two-round counter', async () => {
    const decisionFile = await loadJson(decisionsPath)
    const source = await loadJson(sourcePath)
    const unit = source.units.find((entry: { batch: string; unit_id: string }) => entry.batch === '3.10' && entry.unit_id === 'q10')
    const ledger = {
      schema_version: 1,
      stage: 'aqa-7132-slice-questions',
      checklist_version: 'slice-questions-v1',
      units: {
        q10: {
          fingerprint: unit.fingerprint,
          outcome: unit.outcome,
          consecutive_blocking_rounds: unit.consecutive_blocking_rounds,
          findings: [{ check_id: 'question_validity' }],
          updated_at: '2026-10-01T21:03:17.262Z',
        },
      },
    }

    const result = applyAqa7132QuestionFounderDecisions({ ledger, decisionFile, batch: '3.10' })
    expect(result.appliedDecisions).toBe(1)
    expect(result.ledger.units.q10.consecutive_blocking_rounds).toBe(0)
    expect(result.ledger.units.q10.outcome).toBe(unit.outcome)
    expect(result.ledger.units.q10.findings).toEqual([{ check_id: 'question_validity' }])
    expect(result.ledger.units.q10.founder_decision).toMatchObject({ decision: 'fix', decided_at: '2026-10-02' })
  })

  it('fails loudly instead of silently re-escalating an exhausted dispute with a mismatched decision fingerprint', async () => {
    const decisionFile = await loadJson(decisionsPath)
    const ledger = {
      schema_version: 1,
      stage: 'aqa-7132-slice-questions',
      checklist_version: 'slice-questions-v1',
      units: {
        q10: {
          fingerprint: 'changed-fingerprint',
          outcome: 'blocking',
          consecutive_blocking_rounds: 2,
          findings: [],
          updated_at: '2026-10-01T21:03:17.262Z',
        },
      },
    }

    expect(() => applyAqa7132QuestionFounderDecisions({ ledger, decisionFile, batch: '3.10' })).toThrow('founder_decision_fingerprint_mismatch:3.10:q10')
  })

  it('does not reuse an old decision against a genuinely changed fresh-review fingerprint', async () => {
    const decisionFile = await loadJson(decisionsPath)
    const ledger = {
      schema_version: 1,
      stage: 'aqa-7132-slice-questions',
      checklist_version: 'slice-questions-v1',
      units: {
        q10: {
          fingerprint: 'fresh-changed-fingerprint',
          outcome: 'blocking',
          consecutive_blocking_rounds: 1,
          findings: [],
          updated_at: '2026-10-03T00:00:00Z',
        },
      },
    }

    const result = applyAqa7132QuestionFounderDecisions({ ledger, decisionFile, batch: '3.10' })
    expect(result.appliedDecisions).toBe(0)
    expect(result.ledger.units.q10.consecutive_blocking_rounds).toBe(1)
    expect(result.ledger.units.q10.founder_decision).toBeUndefined()
  })
})
