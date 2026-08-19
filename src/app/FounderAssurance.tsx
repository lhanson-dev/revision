import {
  assuranceCoverage,
  coverageCounts,
  dataSecurityCoverage,
  journeyCoverage,
  type AssuranceCoverageRecord,
  type CoverageStatus,
} from '../assurance/coverage-register'
import {
  defectRegister,
  openDefectCounts,
  openDefects,
  type DefectRecord,
} from '../assurance/defect-register'
import './founder-assurance.css'

export type AssuranceHealthStatus = 'Healthy' | 'Attention needed' | 'Unknown'

export type AssuranceHealthCheck = {
  id: string
  label: string
  status: AssuranceHealthStatus
  detail: string
  action?: string
}

export type AssuranceSnapshot = {
  generatedAt: string
  health: {
    overall: AssuranceHealthStatus
    checks: AssuranceHealthCheck[]
  }
}

type CoverageSummary = ReturnType<typeof coverageCounts> & { available: boolean }

type AssuranceSummary = {
  production: { status: AssuranceHealthStatus; detail: string }
  pathToLive: { status: AssuranceHealthStatus; detail: string }
  journeys: CoverageSummary
  dataSecurity: CoverageSummary
  defects: { status: 'Known' | 'Unknown'; detail: string }
}

function checkById(snapshot: AssuranceSnapshot | null, id: string) {
  return snapshot?.health.checks.find((check) => check.id === id) ?? null
}

function summariseCoverage(records: readonly AssuranceCoverageRecord[]): CoverageSummary {
  return { ...coverageCounts(records), available: records.length > 0 }
}

export function founderAssuranceSummary(snapshot: AssuranceSnapshot | null): AssuranceSummary {
  const production = checkById(snapshot, 'learner-app')
  const deployment = checkById(snapshot, 'deployment')
  const journeyRecords = journeyCoverage()
  const dataRecords = dataSecurityCoverage()

  const productionStatus = production?.status ?? 'Unknown'
  const productionDetail = production?.detail ?? 'Current production reachability evidence is unavailable.'

  let pathStatus: AssuranceHealthStatus = 'Unknown'
  let pathDetail = 'Exact CI → merge → deployment → production-smoke lineage is not yet available as one correlated evidence chain.'
  if (deployment?.status === 'Attention needed') {
    pathStatus = 'Attention needed'
    pathDetail = deployment.detail
  } else if (deployment?.status === 'Unknown') {
    pathDetail = deployment.detail
  } else if (deployment?.status === 'Healthy') {
    pathDetail = `${deployment.detail} Exact-head CI correlation for the deployed revision is still not implemented, so Path to live remains Unknown rather than being overstated.`
  }

  let defects: AssuranceSummary['defects'] = {
    status: 'Unknown',
    detail: 'The governed defect register is unavailable or has not been deliberately triaged, so zero defects must not be claimed.',
  }
  if (defectRegister.available) {
    const counts = openDefectCounts()
    defects = {
      status: 'Known',
      detail: `${counts.P0} P0 · ${counts.P1} P1 · ${counts.P2} P2 open. Register last triaged ${defectRegister.lastTriaged}.`,
    }
  }

  return {
    production: { status: productionStatus, detail: productionDetail },
    pathToLive: { status: pathStatus, detail: pathDetail },
    journeys: summariseCoverage(journeyRecords),
    dataSecurity: summariseCoverage(dataRecords),
    defects,
  }
}

function healthClass(status: AssuranceHealthStatus) {
  return status.toLowerCase().replaceAll(' ', '-')
}

function coverageClass(status: CoverageStatus) {
  return status.toLowerCase()
}

function countsText(counts: CoverageSummary) {
  if (!counts.available) return 'Coverage register projection unavailable — status is Unknown.'
  return `${counts.Covered} Covered · ${counts.Partial} Partial · ${counts.Uncovered} Uncovered · ${counts.Unknown} Unknown`
}

function formatEvidenceTime(value: string | null | undefined) {
  if (!value) return 'Evidence refresh time unavailable'
  return `Evidence refreshed ${new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}`
}

function CoverageBadge({ status }: { status: CoverageStatus }) {
  return <span className={`assurance-coverage-badge ${coverageClass(status)}`}>{status}</span>
}

function EvidenceTable({ title, records }: { title: string; records: AssuranceCoverageRecord[] }) {
  return (
    <section className="admin-panel assurance-evidence-panel" aria-labelledby={`assurance-${title.toLowerCase().replaceAll(' ', '-')}`}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Coverage evidence</p>
          <h2 id={`assurance-${title.toLowerCase().replaceAll(' ', '-')}`}>{title}</h2>
        </div>
      </div>
      {records.length === 0 ? (
        <div className="admin-warning"><strong>Coverage Unknown</strong><p>The governed coverage register could not be projected for this domain.</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table assurance-table">
            <thead><tr><th>Journey / control</th><th>Risk</th><th>Status</th><th>Evidence</th><th>Gap / next action</th></tr></thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td><strong>{record.id}</strong><span>{record.name}</span></td>
                  <td>{record.risk}</td>
                  <td><CoverageBadge status={record.status} /></td>
                  <td>{record.evidenceSource}</td>
                  <td>{record.gap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function DefectTable({ records }: { records: DefectRecord[] }) {
  const open = openDefects(records)
  return (
    <section className="admin-panel assurance-evidence-panel" aria-labelledby="assurance-defects">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Operational defect evidence</p>
          <h2 id="assurance-defects">Defects</h2>
        </div>
      </div>
      {!defectRegister.available ? (
        <div className="admin-warning"><strong>Defect status Unknown</strong><p>The governed defect register could not be projected or has not been deliberately triaged.</p></div>
      ) : open.length === 0 ? (
        <div className="admin-success"><strong>No known open P0/P1/P2 defects</strong><p>The governed register was last triaged {defectRegister.lastTriaged}. This is a statement about recorded known defects, not proof that undiscovered defects cannot exist.</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table assurance-table">
            <thead><tr><th>Defect</th><th>Severity</th><th>Status</th><th>Affected journey / control</th><th>Evidence</th><th>Action / closure</th></tr></thead>
            <tbody>
              {open.map((record) => (
                <tr key={record.id}>
                  <td><strong>{record.id}</strong><span>{record.fixPr ? `Fix ${record.fixPr}` : 'No fix PR yet'}</span></td>
                  <td>{record.severity}</td>
                  <td>{record.status}</td>
                  <td>{record.affected}</td>
                  <td>{record.evidence}</td>
                  <td>{record.action}<br /><span>{record.closureEvidence}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export function FounderAssurance({ snapshot }: { snapshot: AssuranceSnapshot | null }) {
  const summary = founderAssuranceSummary(snapshot)
  const journeyRecords = journeyCoverage()
  const dataRecords = dataSecurityCoverage()
  const otherRecords = assuranceCoverage.filter((record) => !journeyRecords.includes(record) && !dataRecords.includes(record))

  return (
    <div className="founder-assurance">
      <p className="quiet-note assurance-evidence-time">{formatEvidenceTime(snapshot?.generatedAt)}</p>
      <section className="assurance-summary-grid" aria-label="Founder assurance summary">
        <article className="assurance-summary-card">
          <small>Production</small>
          <strong className={`assurance-health ${healthClass(summary.production.status)}`}>{summary.production.status}</strong>
          <p>{summary.production.detail}</p>
        </article>
        <article className="assurance-summary-card">
          <small>Path to live</small>
          <strong className={`assurance-health ${healthClass(summary.pathToLive.status)}`}>{summary.pathToLive.status}</strong>
          <p>{summary.pathToLive.detail}</p>
        </article>
        <article className="assurance-summary-card">
          <small>Critical journeys</small>
          <strong>{summary.journeys.available ? `${summary.journeys.Covered} covered` : 'Unknown'}</strong>
          <p>{countsText(summary.journeys)}</p>
        </article>
        <article className="assurance-summary-card">
          <small>Data &amp; security</small>
          <strong>{summary.dataSecurity.available ? `${summary.dataSecurity.Covered} covered` : 'Unknown'}</strong>
          <p>{countsText(summary.dataSecurity)}</p>
        </article>
        <article className="assurance-summary-card">
          <small>Defects</small>
          <strong>{summary.defects.status}</strong>
          <p>{summary.defects.detail}</p>
        </article>
      </section>

      <div className="admin-warning assurance-truth-note" role="note">
        <strong>Evidence, not a confidence score</strong>
        <p>Covered means the required repeatable evidence exists. Partial, Uncovered and Unknown remain visible until real assurance closes the gap. Planned tests never count as Covered.</p>
      </div>

      <DefectTable records={defectRegister.records} />
      <EvidenceTable title="Critical journeys" records={journeyRecords} />
      <EvidenceTable title="Data and security" records={dataRecords} />
      <EvidenceTable title="Production, delivery and other controls" records={otherRecords} />
    </div>
  )
}
