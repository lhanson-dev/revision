import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { getContentAdapter, listAvailableContentAdapters } from '../engine/content/content-registry'
import { supabase } from '../services/supabase/browser-client'
import { buildCatalogue } from './catalogue-model'
import { FounderAssurance, founderAssuranceSummary } from './FounderAssurance'

type IntakeResponse = {
  jobId: string
  issueNumber: number
  issueUrl: string
}

type AdminView = 'dashboard' | 'users' | 'activity' | 'health' | 'assurance' | 'content'
type HealthStatus = 'Healthy' | 'Attention needed' | 'Unknown'

type DailyCount = {
  date: string
  count: number
}

type ModuleActivity = {
  moduleId: string
  count: number
}

type HealthCheck = {
  id: string
  label: string
  status: HealthStatus
  detail: string
  action?: string
}

type FactoryJob = {
  jobId: string
  issueNumber: number
  issueUrl: string
  state: string
  blockers: number
  updatedAt: string
}

type AdminSnapshot = {
  generatedAt: string
  users: {
    totalLearners: number
    adminAccounts: number
    testAccounts: number
    newLearners7d: number
    newLearners30d: number
    activeLearners1d: number
    activeLearners7d: number
    activeLearners30d: number
    signups14d: DailyCount[]
  }
  activity: {
    events7d: number
    events30d: number
    flashcards30d: number
    quickChecks30d: number
    examQuestions30d: number
    examAttempts30d: number
    modulesWithEvidence30d: number
    topicsWithEvidence30d: number
    latestEventAt: string | null
    daily14d: DailyCount[]
    modules30d: ModuleActivity[]
  }
  content: {
    jobsKnown: boolean
    jobsTotal: number
    jobsInProgress: number
    blockedJobs: number
    readyForFounderAction: number
    jobs: FactoryJob[]
    visibilityMessage: string | null
  }
  health: {
    overall: HealthStatus
    checks: HealthCheck[]
    needsAttention: HealthCheck[]
    unknownCount: number
  }
}

const availableAdapters = listAvailableContentAdapters()
const publishedCourseCount = buildCatalogue(availableAdapters).reduce((sum, subject) => sum + subject.courses.length, 0)

function currentView(): AdminView {
  const segment = window.location.hash.replace(/^#\/admin\/?/, '').split('/')[0]
  if (segment === 'users' || segment === 'activity' || segment === 'health' || segment === 'assurance' || segment === 'content') return segment
  return 'dashboard'
}

function navigateAdmin(view: AdminView) {
  window.location.hash = view === 'dashboard' ? '#/admin' : `#/admin/${view}`
}

function statusClass(status: HealthStatus) {
  return status.toLowerCase().replaceAll(' ', '-')
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'No activity yet'
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function stateLabel(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (character) => character.toUpperCase())
}

function moduleLabel(moduleId: string) {
  const adapter = getContentAdapter(moduleId)
  if (!adapter) return moduleId
  return `${adapter.manifest.subject.name} · ${adapter.manifest.paper.name}`
}

function AdminSubnav({ view }: { view: AdminView }) {
  const items: Array<{ view: AdminView; label: string }> = [
    { view: 'dashboard', label: 'Dashboard' },
    { view: 'users', label: 'Users' },
    { view: 'activity', label: 'Activity' },
    { view: 'health', label: 'System Health' },
    { view: 'assurance', label: 'Assurance' },
    { view: 'content', label: 'Content Operations' },
  ]
  return (
    <nav className="admin-subnav" aria-label="Admin operations">
      {items.map((item) => (
        <button key={item.view} className={view === item.view ? 'active' : ''} onClick={() => navigateAdmin(item.view)}>
          {item.label}
        </button>
      ))}
    </nav>
  )
}

function Trend({ title, data }: { title: string; data: DailyCount[] }) {
  const max = Math.max(1, ...data.map((item) => item.count))
  return (
    <div className="admin-trend" aria-label={title}>
      {data.map((item) => (
        <div className="admin-trend-row" key={item.date}>
          <time dateTime={item.date}>{new Date(`${item.date}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</time>
          <div className="admin-trend-track" aria-hidden="true"><span style={{ width: `${(item.count / max) * 100}%` }} /></div>
          <strong>{item.count}</strong>
        </div>
      ))}
    </div>
  )
}

function HealthBadge({ status }: { status: HealthStatus }) {
  return <span className={`admin-status ${statusClass(status)}`}><span aria-hidden="true" />{status}</span>
}

export function ContentOperations() {
  const view = currentView()
  const [snapshot, setSnapshot] = useState<AdminSnapshot | null>(null)
  const [snapshotError, setSnapshotError] = useState('')
  const [loadingSnapshot, setLoadingSnapshot] = useState(true)
  const [officialUrl, setOfficialUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [createdJob, setCreatedJob] = useState<IntakeResponse | null>(null)

  const loadSnapshot = useCallback(async () => {
    setLoadingSnapshot(true)
    setSnapshotError('')
    const { data, error } = await supabase.functions.invoke<AdminSnapshot>('admin-operations', {
      body: { view: 'summary' },
    })
    if (error || !data) {
      setSnapshot(null)
      setSnapshotError('Operations data is not available yet. The protected admin metrics service may still need production deployment.')
    } else {
      setSnapshot(data)
    }
    setLoadingSnapshot(false)
  }, [])

  useEffect(() => {
    let active = true
    supabase.functions.invoke<AdminSnapshot>('admin-operations', {
      body: { view: 'summary' },
    }).then(({ data, error }) => {
      if (!active) return
      if (error || !data) {
        setSnapshot(null)
        setSnapshotError('Operations data is not available yet. The protected admin metrics service may still need production deployment.')
      } else {
        setSnapshot(data)
      }
      setLoadingSnapshot(false)
    })
    return () => { active = false }
  }, [])

  const moduleActivity = useMemo(() => snapshot?.activity.modules30d ?? [], [snapshot])

  async function addCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError('')
    setCreatedJob(null)
    setSubmitting(true)

    try {
      const parsed = new URL(officialUrl)
      if (parsed.protocol !== 'https:') throw new Error('Use an HTTPS awarding-body URL.')

      const { data, error } = await supabase.functions.invoke<IntakeResponse>('content-factory-intake', {
        body: { officialUrl: parsed.toString(), notes: notes.trim() || undefined },
      })

      if (error) throw error
      if (!data?.issueNumber || !data.jobId || !data.issueUrl) {
        throw new Error('The Content Factory did not return a valid job record.')
      }

      setCreatedJob(data)
      setOfficialUrl('')
      setNotes('')
      await loadSnapshot()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Course intake failed.')
    } finally {
      setSubmitting(false)
    }
  }

  function pageHeader(titleId: string, eyebrow: string, title: string, copy: string) {
    return (
      <>
        <header className="page-heading admin-page-heading">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1 id={titleId}>{title}</h1>
            <p>{copy}</p>
          </div>
          <button className="secondary admin-refresh" onClick={() => void loadSnapshot()} disabled={loadingSnapshot}>
            {loadingSnapshot ? 'Refreshing…' : 'Refresh'}
          </button>
        </header>
        <AdminSubnav view={view} />
        {snapshotError ? <div className="admin-warning" role="status"><strong>Live operations data unavailable</strong><p>{snapshotError}</p></div> : null}
      </>
    )
  }

  function renderDashboard() {
    const health = snapshot?.health
    const users = snapshot?.users
    const activity = snapshot?.activity
    const content = snapshot?.content
    const assurance = founderAssuranceSummary(snapshot)
    return (
      <main className="dashboard screen-dashboard page-screen content-operations admin-operations" aria-labelledby="admin-dashboard-title">
        <header className="page-heading admin-page-heading">
          <div>
            <p className="eyebrow">Revision Admin</p>
            <h1 id="admin-dashboard-title">Revision Operations</h1>
            <p>High-level operational health, learner activity and content-production status. Drill into a section when you need the evidence behind a number.</p>
          </div>
          <button className="secondary admin-refresh" onClick={() => void loadSnapshot()} disabled={loadingSnapshot}>
            {loadingSnapshot ? 'Refreshing…' : 'Refresh'}
          </button>
        </header>
        <AdminSubnav view="dashboard" />
        {snapshotError ? <div className="admin-warning" role="status"><strong>Live operations data unavailable</strong><p>{snapshotError}</p></div> : null}

        <section className="admin-health-banner" aria-labelledby="operations-health-title">
          <div>
            <p className="eyebrow">System health</p>
            <h2 id="operations-health-title">{health?.overall ?? (loadingSnapshot ? 'Checking…' : 'Unknown')}</h2>
            <p>{health ? `${health.checks.filter((check) => check.status === 'Healthy').length} of ${health.checks.length} checks are healthy.` : 'Waiting for protected operational evidence.'}</p>
          </div>
          {health ? <HealthBadge status={health.overall} /> : null}
          <button className="text-link" onClick={() => navigateAdmin('health')}>View system health <span aria-hidden="true">→</span></button>
        </section>

        <section className="admin-panel admin-wide-panel" aria-labelledby="founder-assurance-summary-title">
          <div className="section-heading">
            <div><p className="eyebrow">Confidence</p><h2 id="founder-assurance-summary-title">Founder assurance</h2></div>
            <button className="text-link" onClick={() => navigateAdmin('assurance')}>View evidence <span aria-hidden="true">→</span></button>
          </div>
          <div className="admin-content-summary">
            <div><small>Production</small><strong>{assurance.production.status}</strong></div>
            <div><small>Path to live</small><strong>{assurance.pathToLive.status}</strong></div>
            <div><small>Critical journeys</small><strong>{assurance.journeys.Covered} covered</strong></div>
            <div><small>Data &amp; security</small><strong>{assurance.dataSecurity.Covered} covered</strong></div>
            <div><small>Defects</small><strong>{assurance.defects.status}</strong></div>
          </div>
          <p className="quiet-note">Assurance is evidence-based. Partial, Uncovered and Unknown remain visible rather than being converted into a single confidence percentage.</p>
        </section>

        <section className="admin-stat-grid" aria-label="Operations summary">
          <button className="admin-stat-card" onClick={() => navigateAdmin('users')}>
            <small>Learners</small><strong>{users?.totalLearners ?? '—'}</strong><span>{users ? `${users.newLearners7d} new in 7 days` : 'Test and admin accounts excluded'}</span>
          </button>
          <button className="admin-stat-card" onClick={() => navigateAdmin('users')}>
            <small>Active learners · 7d</small><strong>{users?.activeLearners7d ?? '—'}</strong><span>Based on recorded learning activity</span>
          </button>
          <button className="admin-stat-card" onClick={() => navigateAdmin('activity')}>
            <small>Learning activities · 7d</small><strong>{activity?.events7d ?? '—'}</strong><span>{activity ? `${activity.events30d} in the last 30 days` : 'Scored learning evidence only'}</span>
          </button>
          <button className="admin-stat-card" onClick={() => navigateAdmin('content')}>
            <small>Content jobs</small><strong>{content?.jobsKnown ? content.jobsInProgress : '—'}</strong><span>{content?.jobsKnown ? `${content.blockedJobs} blocked · ${content.readyForFounderAction} need approval` : 'Job visibility not available'}</span>
          </button>
        </section>
        <p className="quiet-note admin-metric-note">Learner engagement metrics exclude test accounts and admin accounts by default.</p>

        <div className="admin-dashboard-grid">
          <section className="admin-panel" aria-labelledby="attention-title">
            <div className="section-heading"><div><p className="eyebrow">Action</p><h2 id="attention-title">Needs attention</h2></div></div>
            {!health && <p className="muted">Operational checks are still loading.</p>}
            {health && health.needsAttention.length === 0 && <div className="admin-clear"><strong>Nothing needs your attention.</strong><p>There are no checks currently reporting a known operational problem.</p></div>}
            {health?.needsAttention.map((check) => (
              <article className="admin-attention-item" key={check.id}>
                <div><strong>{check.label}</strong><p>{check.detail}</p>{check.action ? <small>{check.action}</small> : null}</div>
                <button className="text-link" onClick={() => navigateAdmin(check.id === 'content-factory' ? 'content' : 'health')}>View <span aria-hidden="true">→</span></button>
              </article>
            ))}
            {health && health.unknownCount > 0 ? <p className="quiet-note">{health.unknownCount} {health.unknownCount === 1 ? 'check is' : 'checks are'} Unknown because current evidence is insufficient. Unknown is never treated as Healthy.</p> : null}
          </section>

          <section className="admin-panel" aria-labelledby="content-operations-summary-title">
            <div className="section-heading"><div><p className="eyebrow">Content</p><h2 id="content-operations-summary-title">Content Operations</h2></div></div>
            <div className="admin-content-summary">
              <div><small>Published courses</small><strong>{publishedCourseCount}</strong></div>
              <div><small>Available components</small><strong>{availableAdapters.length}</strong></div>
              <div><small>Blocked jobs</small><strong>{content?.jobsKnown ? content.blockedJobs : '—'}</strong></div>
            </div>
            <h3>Add course</h3>
            <p className="muted">Start a governed Content Factory job from an official awarding-body URL.</p>
            <button className="primary" onClick={() => navigateAdmin('content')}>Open Content Operations</button>
          </section>
        </div>
      </main>
    )
  }

  function renderUsers() {
    const users = snapshot?.users
    return (
      <main className="dashboard screen-dashboard page-screen content-operations admin-operations" aria-labelledby="admin-users-title">
        {pageHeader('admin-users-title', 'Revision Admin · Users', 'Users', 'Understand whether real learners are joining and recording learning activity, without mixing in test or admin behaviour.')}
        <section className="admin-stat-grid admin-detail-stats" aria-label="User statistics">
          <article className="admin-static-stat"><small>Total learners</small><strong>{users?.totalLearners ?? '—'}</strong><span>Admin and test accounts excluded</span></article>
          <article className="admin-static-stat"><small>New learners · 7d</small><strong>{users?.newLearners7d ?? '—'}</strong><span>{users ? `${users.newLearners30d} in 30 days` : '—'}</span></article>
          <article className="admin-static-stat"><small>Active learners · 7d</small><strong>{users?.activeLearners7d ?? '—'}</strong><span>At least one recorded learning activity</span></article>
          <article className="admin-static-stat"><small>Active learners · 30d</small><strong>{users?.activeLearners30d ?? '—'}</strong><span>{users ? `${users.activeLearners1d} in the last 24 hours` : '—'}</span></article>
        </section>
        <div className="admin-detail-grid">
          <section className="admin-panel" aria-labelledby="signup-trend-title"><p className="eyebrow">Acquisition</p><h2 id="signup-trend-title">Learner sign-ups · 14 days</h2>{users ? <Trend title="Learner sign-ups over the last 14 days" data={users.signups14d} /> : <p className="muted">No live data available.</p>}</section>
          <section className="admin-panel" aria-labelledby="account-classification-title"><p className="eyebrow">Classification</p><h2 id="account-classification-title">Accounts excluded from learner stats</h2><dl className="admin-definition-list"><div><dt>Admin accounts</dt><dd>{users?.adminAccounts ?? '—'}</dd></div><div><dt>Test accounts</dt><dd>{users?.testAccounts ?? '—'}</dd></div></dl><p className="quiet-note">This keeps founder activity and synthetic/test usage from inflating learner engagement.</p></section>
        </div>
      </main>
    )
  }

  function renderActivity() {
    const activity = snapshot?.activity
    const sourceRows = activity ? [
      ['Flashcards', activity.flashcards30d],
      ['Quick checks', activity.quickChecks30d],
      ['Exam questions', activity.examQuestions30d],
      ['Full exam attempts', activity.examAttempts30d],
    ] as const : []
    return (
      <main className="dashboard screen-dashboard page-screen content-operations admin-operations" aria-labelledby="admin-activity-title">
        {pageHeader('admin-activity-title', 'Revision Admin · Activity', 'Learning Activity', 'See what learners are actually doing from recorded Revision evidence. This does not infer reading time or page visits that Revision does not currently collect.')}
        <section className="admin-stat-grid admin-detail-stats" aria-label="Learning activity statistics">
          <article className="admin-static-stat"><small>Activities · 7d</small><strong>{activity?.events7d ?? '—'}</strong><span>Recorded scored evidence</span></article>
          <article className="admin-static-stat"><small>Activities · 30d</small><strong>{activity?.events30d ?? '—'}</strong><span>Across real learner accounts</span></article>
          <article className="admin-static-stat"><small>Topics with evidence · 30d</small><strong>{activity?.topicsWithEvidence30d ?? '—'}</strong><span>Distinct module/topic combinations</span></article>
          <article className="admin-static-stat"><small>Latest learner activity</small><strong className="admin-date-stat">{activity ? formatDate(activity.latestEventAt) : '—'}</strong><span>Test and admin evidence excluded</span></article>
        </section>
        <div className="admin-detail-grid">
          <section className="admin-panel" aria-labelledby="activity-trend-title"><p className="eyebrow">Engagement</p><h2 id="activity-trend-title">Learning activities · 14 days</h2>{activity ? <Trend title="Learning activities over the last 14 days" data={activity.daily14d} /> : <p className="muted">No live data available.</p>}</section>
          <section className="admin-panel" aria-labelledby="activity-type-title"><p className="eyebrow">Activity mix</p><h2 id="activity-type-title">What learners did · 30 days</h2><dl className="admin-definition-list">{sourceRows.map(([label, count]) => <div key={label}><dt>{label}</dt><dd>{count}</dd></div>)}</dl></section>
        </div>
        <section className="admin-panel admin-wide-panel" aria-labelledby="module-activity-title"><p className="eyebrow">Where activity happened</p><h2 id="module-activity-title">Most active courses/components · 30 days</h2>{moduleActivity.length === 0 ? <p className="muted">No learner evidence has been recorded in the last 30 days.</p> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Course/component</th><th>Activities</th></tr></thead><tbody>{moduleActivity.map((item) => <tr key={item.moduleId}><td>{moduleLabel(item.moduleId)}</td><td>{item.count}</td></tr>)}</tbody></table></div>}</section>
      </main>
    )
  }

  function renderHealth() {
    const health = snapshot?.health
    return (
      <main className="dashboard screen-dashboard page-screen content-operations admin-operations" aria-labelledby="admin-health-title">
        {pageHeader('admin-health-title', 'Revision Admin · Operations', 'System Health', 'Health is evidence-based: missing evidence is shown as Unknown rather than being silently treated as Healthy.')}
        <section className="admin-health-banner admin-health-detail" aria-labelledby="health-overall-title"><div><p className="eyebrow">Overall</p><h2 id="health-overall-title">{health?.overall ?? 'Unknown'}</h2><p>{snapshot ? `Last checked ${formatDate(snapshot.generatedAt)}.` : 'No live check is currently available.'}</p></div>{health ? <HealthBadge status={health.overall} /> : null}</section>
        <section className="admin-health-list" aria-label="System health checks">
          {health?.checks.map((check) => <article className="admin-health-item" key={check.id}><div><h2>{check.label}</h2><p>{check.detail}</p>{check.action ? <small><strong>Action:</strong> {check.action}</small> : null}</div><HealthBadge status={check.status} /></article>)}
          {!health ? <p className="muted">System checks are not available.</p> : null}
        </section>
      </main>
    )
  }

  function renderAssurance() {
    return (
      <main className="dashboard screen-dashboard page-screen content-operations admin-operations" aria-labelledby="admin-assurance-title">
        {pageHeader('admin-assurance-title', 'Revision Admin · Assurance', 'Founder Assurance', 'See what is currently evidenced across production, path to live, critical user journeys, data and security. Gaps remain visible until repeatable assurance closes them.')}
        <FounderAssurance snapshot={snapshot} />
      </main>
    )
  }

  function renderContent() {
    const content = snapshot?.content
    return (
      <main className="dashboard screen-dashboard page-screen content-operations admin-operations" aria-labelledby="content-operations-title">
        {pageHeader('content-operations-title', 'Revision Admin · Content', 'Content Operations', 'Start governed course intake and see the current Content Factory job picture. Job state never replaces content assurance or Founder merge approval.')}
        <section className="admin-stat-grid admin-detail-stats" aria-label="Content statistics">
          <article className="admin-static-stat"><small>Published courses</small><strong>{publishedCourseCount}</strong><span>{availableAdapters.length} available exam components</span></article>
          <article className="admin-static-stat"><small>Jobs in progress</small><strong>{content?.jobsKnown ? content.jobsInProgress : '—'}</strong><span>Factory jobs not at a terminal state</span></article>
          <article className="admin-static-stat"><small>Blocked jobs</small><strong>{content?.jobsKnown ? content.blockedJobs : '—'}</strong><span>Jobs requiring an explicit blocker resolution</span></article>
          <article className="admin-static-stat"><small>Founder action</small><strong>{content?.jobsKnown ? content.readyForFounderAction : '—'}</strong><span>Ready for explicit merge approval</span></article>
        </section>

        <div className="admin-detail-grid admin-content-grid">
          <section className="content-operations-panel" aria-labelledby="add-course-title">
            <p className="eyebrow">Content</p>
            <h2 id="add-course-title">Add course</h2>
            <p className="muted">Start with the official course or specification page. Optional instructions are only for genuine scope or course constraints.</p>
            <form className="content-operations-form" onSubmit={addCourse}>
              <label>
                Official awarding-body URL
                <input type="url" inputMode="url" placeholder="https://www.aqa.org.uk/..." required value={officialUrl} onChange={(event) => setOfficialUrl(event.target.value)} />
                <span>Use an official awarding-body page, not a third-party revision site.</span>
              </label>
              <label>
                Optional instruction
                <textarea rows={4} maxLength={2000} placeholder="For example: include the complete course and all compulsory papers." value={notes} onChange={(event) => setNotes(event.target.value)} />
              </label>
              {submitError ? <p className="content-operations-error" role="alert">{submitError}</p> : null}
              {createdJob ? <div className="content-operations-success" role="status"><strong>Course job created.</strong><span>Job {createdJob.jobId} · GitHub issue #{createdJob.issueNumber}</span><a href={createdJob.issueUrl} target="_blank" rel="noreferrer">Open job record</a></div> : null}
              <button className="primary" type="submit" disabled={submitting}>{submitting ? 'Creating course job…' : 'Add course'}</button>
            </form>
          </section>

          <section className="admin-panel admin-jobs-panel" aria-labelledby="course-jobs-title">
            <p className="eyebrow">Factory</p><h2 id="course-jobs-title">Course Jobs</h2>
            {content && !content.jobsKnown ? <div className="admin-warning"><strong>Job visibility unknown</strong><p>{content.visibilityMessage ?? 'GitHub job records could not be read.'}</p></div> : null}
            {content?.jobsKnown && content.jobs.length === 0 ? <p className="muted">No Content Factory jobs have been recorded yet.</p> : null}
            <div className="admin-job-list">{content?.jobs.map((job) => <article key={job.jobId} className="admin-job-item"><div><strong>{job.jobId}</strong><span>{stateLabel(job.state)}</span><small>Issue #{job.issueNumber} · updated {formatDate(job.updatedAt)}</small>{job.blockers > 0 ? <small className="admin-job-blocker">{job.blockers} {job.blockers === 1 ? 'blocker' : 'blockers'}</small> : null}</div><a className="text-link" href={job.issueUrl} target="_blank" rel="noreferrer">Open job <span aria-hidden="true">→</span></a></article>)}</div>
          </section>
        </div>
      </main>
    )
  }

  if (view === 'users') return renderUsers()
  if (view === 'activity') return renderActivity()
  if (view === 'health') return renderHealth()
  if (view === 'assurance') return renderAssurance()
  if (view === 'content') return renderContent()
  return renderDashboard()
}