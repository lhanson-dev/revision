import registerMarkdown from '../../90-governance-registers/Defect Register.md?raw'

export type DefectSeverity = 'P0' | 'P1' | 'P2'
export type DefectStatus = 'Open' | 'Fix in review' | 'Closed'

export type DefectRecord = {
  id: string
  severity: DefectSeverity
  affected: string
  evidence: string
  status: DefectStatus
  action: string
  fixPr: string
  closureEvidence: string
}

export type DefectRegisterProjection = {
  available: boolean
  version: number | null
  lastTriaged: string | null
  records: DefectRecord[]
}

const severities: DefectSeverity[] = ['P0', 'P1', 'P2']
const statuses: DefectStatus[] = ['Open', 'Fix in review', 'Closed']

function normaliseCell(value: string) {
  return value.trim().replaceAll('`', '')
}

export function parseDefectRegister(markdown: string): DefectRegisterProjection {
  const versionMatch = markdown.match(/\*\*Defect register version:\*\*\s*(\d+)/)
  const triageMatch = markdown.match(/\*\*Last triaged:\*\*\s*(\d{4}-\d{2}-\d{2})/)
  const records: DefectRecord[] = []

  for (const line of markdown.split('\n')) {
    if (!line.startsWith('|')) continue
    const cells = line.split('|').slice(1, -1).map(normaliseCell)
    if (cells.length !== 8) continue

    const [id, severityValue, affected, evidence, statusValue, action, fixPr, closureEvidence] = cells
    if (!/^DEF-\d{4}-\d{3}$/.test(id)) continue
    if (!severities.includes(severityValue as DefectSeverity)) continue
    if (!statuses.includes(statusValue as DefectStatus)) continue

    records.push({
      id,
      severity: severityValue as DefectSeverity,
      affected,
      evidence,
      status: statusValue as DefectStatus,
      action,
      fixPr,
      closureEvidence,
    })
  }

  const version = versionMatch ? Number(versionMatch[1]) : null
  const lastTriaged = triageMatch?.[1] ?? null
  return {
    available: version === 1 && lastTriaged !== null,
    version,
    lastTriaged,
    records,
  }
}

export const defectRegister = parseDefectRegister(registerMarkdown)

export function openDefects(records: readonly DefectRecord[] = defectRegister.records) {
  return records.filter((record) => record.status !== 'Closed')
}

export function openDefectCounts(records: readonly DefectRecord[] = defectRegister.records) {
  const open = openDefects(records)
  return {
    P0: open.filter((record) => record.severity === 'P0').length,
    P1: open.filter((record) => record.severity === 'P1').length,
    P2: open.filter((record) => record.severity === 'P2').length,
    total: open.length,
  }
}
