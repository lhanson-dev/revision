import registerMarkdown from '../../90-governance-registers/Assurance Coverage Register.md?raw'

export type CoverageStatus = 'Covered' | 'Partial' | 'Uncovered' | 'Unknown'
export type AssuranceRisk = 'Medium' | 'High' | 'Critical'

export type AssuranceCoverageRecord = {
  id: string
  name: string
  risk: AssuranceRisk
  requiredAssurance: string
  evidenceSource: string
  status: CoverageStatus
  gap: string
}

const knownStatuses: CoverageStatus[] = ['Covered', 'Partial', 'Uncovered', 'Unknown']
const knownRisks: AssuranceRisk[] = ['Medium', 'High', 'Critical']

function normaliseCell(value: string) {
  return value.trim().replaceAll('`', '')
}

function parseStatus(value: string): CoverageStatus {
  const normalised = normaliseCell(value)
  if (normalised.startsWith('Covered')) return 'Covered'
  if (normalised.startsWith('Partial')) return 'Partial'
  if (normalised.startsWith('Uncovered')) return 'Uncovered'
  if (normalised.startsWith('Unknown')) return 'Unknown'
  return 'Unknown'
}

function parseRisk(value: string): AssuranceRisk | null {
  const normalised = normaliseCell(value) as AssuranceRisk
  return knownRisks.includes(normalised) ? normalised : null
}

export function parseAssuranceCoverageRegister(markdown: string): AssuranceCoverageRecord[] {
  const records: AssuranceCoverageRecord[] = []

  for (const line of markdown.split('\n')) {
    if (!line.startsWith('|')) continue
    const cells = line.split('|').slice(1, -1).map(normaliseCell)
    if (cells.length !== 7) continue

    const [id, name, riskValue, requiredAssurance, evidenceSource, statusValue, gap] = cells
    if (!/^[A-Z0-9]+-\d{2}$/.test(id)) continue
    const risk = parseRisk(riskValue)
    if (!risk) continue
    const status = parseStatus(statusValue)
    if (!knownStatuses.includes(status)) continue

    records.push({ id, name, risk, requiredAssurance, evidenceSource, status, gap })
  }

  return records
}

export const assuranceCoverage = parseAssuranceCoverageRegister(registerMarkdown)

export function coverageCounts(records: readonly AssuranceCoverageRecord[]) {
  return records.reduce<Record<CoverageStatus, number>>(
    (counts, record) => {
      counts[record.status] += 1
      return counts
    },
    { Covered: 0, Partial: 0, Uncovered: 0, Unknown: 0 },
  )
}

export function journeyCoverage() {
  return assuranceCoverage.filter((record) =>
    record.id.startsWith('AUTH-') || record.id.startsWith('ADM-') || record.id.startsWith('JRN-') || record.id.startsWith('A11Y-'),
  )
}

export function dataSecurityCoverage() {
  return assuranceCoverage.filter((record) => record.id.startsWith('DATA-') || record.id.startsWith('SEC-'))
}

export function defectCoverage() {
  return assuranceCoverage.find((record) => record.id === 'DEF-01') ?? null
}
