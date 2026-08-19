import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../services/supabase/browser-client'

type PlannerMetrics = {
  activePlanLearners: number
  activeAssessments: number
  learnersWithAvailability: number
  activePreferences: number
  events7d: number
  events30d: number
  started7d: number
  completed7d: number
  started30d: number
  completed30d: number
  alternativeChoices30d: number
  priorityModeStarts30d: number
  latestEventAt: string | null
  calculationFailuresKnown: boolean
}

type PlannerOperationsSnapshot = {
  generatedAt: string
  planner: PlannerMetrics
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'No planner activity yet'
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function conversion(started: number, completed: number) {
  if (started <= 0) return '—'
  return `${Math.round((completed / started) * 100)}%`
}

export function PlannerAdminScreen({ onBack }: { onBack: () => void }) {
  const [snapshot, setSnapshot] = useState<PlannerOperationsSnapshot | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: invokeError } = await supabase.functions.invoke<PlannerOperationsSnapshot>('planner-operations', {
      body: { view: 'summary' },
    })
    if (invokeError || !data) {
      setSnapshot(null)
      setError('Planner operations data is not available. The protected planner metrics service may still need deployment.')
    } else {
      setSnapshot(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const planner = snapshot?.planner

  return (
    <main className="dashboard screen-dashboard page-screen content-operations admin-operations planner-admin" aria-labelledby="planner-admin-title">
      <header className="page-heading admin-page-heading">
        <div>
          <p className="eyebrow">Revision Admin · Planner</p>
          <h1 id="planner-admin-title">Planner Assurance</h1>
          <p>Adoption and operational evidence for FI-001. These figures describe planner usage; they do not imply learning improvement by themselves.</p>
        </div>
        <div className="inline-actions">
          <button className="secondary" onClick={onBack}>Back to Admin</button>
          <button className="secondary" onClick={() => void load()} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button>
        </div>
      </header>

      {error && <div className="admin-warning" role="status"><strong>Planner evidence unavailable</strong><p>{error}</p></div>}

      <section className="admin-stat-grid admin-detail-stats" aria-label="Planner adoption">
        <article className="admin-static-stat"><small>Active plan learners</small><strong>{planner?.activePlanLearners ?? '—'}</strong><span>Real learners with an active future assessment and saved availability</span></article>
        <article className="admin-static-stat"><small>Active assessments</small><strong>{planner?.activeAssessments ?? '—'}</strong><span>Future assessments currently shaping plans</span></article>
        <article className="admin-static-stat"><small>Learners with availability</small><strong>{planner?.learnersWithAvailability ?? '—'}</strong><span>Realistic capacity configured</span></article>
        <article className="admin-static-stat"><small>Active preferences</small><strong>{planner?.activePreferences ?? '—'}</strong><span>Learner/REV negotiated short-term planning context</span></article>
      </section>

      <div className="admin-detail-grid">
        <section className="admin-panel" aria-labelledby="planner-engagement-title">
          <p className="eyebrow">Recommendation journey</p>
          <h2 id="planner-engagement-title">Planner engagement</h2>
          <dl className="admin-definition-list">
            <div><dt>Starts · 7d</dt><dd>{planner?.started7d ?? '—'}</dd></div>
            <div><dt>Completed · 7d</dt><dd>{planner?.completed7d ?? '—'}</dd></div>
            <div><dt>Start → complete · 7d</dt><dd>{planner ? conversion(planner.started7d, planner.completed7d) : '—'}</dd></div>
            <div><dt>Starts · 30d</dt><dd>{planner?.started30d ?? '—'}</dd></div>
            <div><dt>Completed · 30d</dt><dd>{planner?.completed30d ?? '—'}</dd></div>
            <div><dt>Deliberate alternatives · 30d</dt><dd>{planner?.alternativeChoices30d ?? '—'}</dd></div>
          </dl>
        </section>

        <section className="admin-panel" aria-labelledby="planner-assurance-state-title">
          <p className="eyebrow">Assurance</p>
          <h2 id="planner-assurance-state-title">Planner state</h2>
          <dl className="admin-definition-list">
            <div><dt>Planner events · 7d</dt><dd>{planner?.events7d ?? '—'}</dd></div>
            <div><dt>Planner events · 30d</dt><dd>{planner?.events30d ?? '—'}</dd></div>
            <div><dt>Priority-mode starts · 30d</dt><dd>{planner?.priorityModeStarts30d ?? '—'}</dd></div>
            <div><dt>Latest planner event</dt><dd>{planner ? formatDate(planner.latestEventAt) : '—'}</dd></div>
          </dl>
          <div className="admin-warning planner-admin-unknown" role="status">
            <strong>Calculation failures: {planner?.calculationFailuresKnown ? 'evidence available' : 'Unknown'}</strong>
            <p>Dedicated planner-calculation failure telemetry is not implemented yet. Missing evidence is shown as Unknown, never Healthy.</p>
          </div>
        </section>
      </div>

      <p className="quiet-note">Planner metrics exclude test and admin accounts. A completed planner item is reconciled from validated learning evidence where the match is reliable; time spent alone is not completion or mastery.</p>
    </main>
  )
}
