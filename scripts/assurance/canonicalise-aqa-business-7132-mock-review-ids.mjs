import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'

const PLAN_PATH = '.artifacts/content-factory-aqa-business-7132-mock-plan/mock-set-plan.json'
const OUTPUT = '.artifacts/content-factory-aqa-business-7132-mock-generation'
const PAPER_LEDGER_PATH = `${OUTPUT}/paper-review-ledger.json`
const SET_LEDGER_PATH = `${OUTPUT}/set-review-ledger.json`

function uniqueCaseInsensitiveMatch(id, allowedIds) {
  if (allowedIds.includes(id)) return id
  const folded = id.toLocaleLowerCase('en-GB')
  const matches = allowedIds.filter((candidate) => candidate.toLocaleLowerCase('en-GB') === folded)
  return matches.length === 1 ? matches[0] : id
}

async function normaliseLedger(path, allowedIdsForUnit) {
  if (!existsSync(path)) return { path, changed_ids: 0, changed_findings: 0 }
  const ledger = JSON.parse(await readFile(path, 'utf8'))
  let changedIds = 0
  let changedFindings = 0

  for (const [unitId, entry] of Object.entries(ledger.units ?? {})) {
    const allowedIds = allowedIdsForUnit(unitId)
    if (!allowedIds.length || !Array.isArray(entry?.findings)) continue
    for (const finding of entry.findings) {
      if (!Array.isArray(finding?.affected_ids)) continue
      const before = finding.affected_ids
      const after = before.map((id) => typeof id === 'string' ? uniqueCaseInsensitiveMatch(id, allowedIds) : id)
      const differences = after.filter((id, index) => id !== before[index]).length
      if (!differences) continue
      finding.affected_ids = after
      changedIds += differences
      changedFindings += 1
    }
  }

  if (changedIds) await writeFile(path, `${JSON.stringify(ledger, null, 2)}\n`)
  return { path, changed_ids: changedIds, changed_findings: changedFindings }
}

const plan = JSON.parse(await readFile(PLAN_PATH, 'utf8'))
const papers = Array.isArray(plan.papers) ? plan.papers : []
const paperAllowed = new Map(papers.map((paper) => [
  paper.component_id,
  [paper.component_id, ...(paper.slots ?? []).map((slot) => slot.slot_id)],
]))
const allSetIds = [
  'complete-set',
  ...papers.map((paper) => paper.component_id),
  ...papers.flatMap((paper) => (paper.slots ?? []).map((slot) => slot.slot_id)),
]

const paper = await normaliseLedger(PAPER_LEDGER_PATH, (unitId) => paperAllowed.get(unitId) ?? [])
const set = await normaliseLedger(SET_LEDGER_PATH, (unitId) => unitId === 'complete-set' ? allSetIds : [])

console.log(JSON.stringify({
  status: 'pass',
  rule: 'only unique case-insensitive matches to exact deterministic plan identifiers are canonicalised; unknown identifiers remain unchanged',
  paper,
  set,
}, null, 2))
