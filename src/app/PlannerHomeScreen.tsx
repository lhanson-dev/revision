import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import type { PlannerItem, PlannerReasonCode } from '../engine/planning/planning'
import { loadPlannerSetup, recordPlannerActivityEvent } from '../services/planning/planner-service'
import { createSupabaseEvidenceStore, loadLearningEvidence } from '../services/progress/learning-evidence-service'
import { buildCatalogue, createCourseLearningState, createModuleLearningState, type ModuleLearningState } from './catalogue-model'
import { buildPlannerSnapshot } from './planner-model'
import { RevPresence, type RevPresenceState } from './RevPresence'

const availableAdapters = listAvailableContentAdapters()
const catalogue = buildCatalogue(availableAdapters)
const courses = catalogue.flatMap((subject) => subject.courses)
const sharedLearningModuleIds = new Set(
  courses.filter((course) => course.sharedLearning).flatMap((course) => course.modules.map((module) => module.manifest.id)),
)

interface PlannerHomeScreenProps {
  client: SupabaseClient
  userId: string
  learnerName: string
  onOpenPlan: () => void
  onOpenRev: () => void
  onOpenProgress: () => void
  onOpenSubjects: () => void
  onOpenSubject: (subjectId: string) => void
}

function reasonLabel(reason: PlannerReasonCode) {
  switch (reason) {
    case 'ASSESSMENT_SOON': return 'the assessment is getting closer'
    case 'HIGH_IMPORTANCE_ASSESSMENT': return 'this is one of your higher-priority assessments'
    case 'LOW_EVIDENCE': return 'I do not have much evidence in this area yet'
    case 'WEAK_EVIDENCE': return 'recent evidence suggests this needs more work'
    case 'UNDER_COVERED': return 'this area has less evidence coverage'
    case 'EXAM_PRACTICE_DUE': return 'exam-style practice is becoming more useful now'
    case 'HIGH_MARK_OPPORTUNITY': return 'this has a larger known mark opportunity'
    case 'ALREADY_STRONG': return 'you already have stronger evidence here'
    case 'LEARNER_PRIORITY': return 'you asked me to give this more attention'
    case 'COMPETING_PRIORITY': return 'I am balancing this with another important priority'
    case 'CAPACITY_CONSTRAINED': return 'the available time is tight, so I am focusing on the highest-value work'
  }
}

function activityLabel(activity: string) {
  if (activity === 'exam-question') return 'Exam practice'
  if (activity === 'quick-check') return 'Quick check'
  if (activity === 'flashcards') return 'Flashcards'
  return 'Revision activity'
}

function itemTopicLabel(item: PlannerItem, states: readonly ModuleLearningState[]) {
  const state = states.find((candidate) => candidate.adapter.manifest.subject.id === item.subjectId && candidate.adapter.getTopic(item.topicId))
  return state?.adapter.getTopic(item.topicId)?.shortTitle ?? item.topicId
}

function subjectName(subjectId: string) {
  return catalogue.find((subject) => subject.id === subjectId)?.name ?? subjectId
}

export function PlannerHomeScreen({ client, userId, learnerName, onOpenPlan, onOpenRev, onOpenProgress, onOpenSubjects, onOpenSubject }: PlannerHomeScreenProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [learningStates, setLearningStates] = useState<ModuleLearningState[]>([])
  const [setup, setSetup] = useState<Awaited<ReturnType<typeof loadPlannerSetup>> | null>(null)
  const [prompt, setPrompt] = useState('')
  const [revState, setRevState] = useState<RevPresenceState>('resting')

  useEffect(() => {
    let active = true
    const evidenceStore = createSupabaseEvidenceStore(client)
    Promise.all([
      loadPlannerSetup(client, userId),
      Promise.all(availableAdapters.map((adapter) => loadLearningEvidence(evidenceStore, userId, adapter.manifest.id))),
    ])
      .then(([plannerSetup, evidenceByModule]) => {
        if (!active) return
        const evidence = evidenceByModule.flat()
        const moduleStates = availableAdapters.map((adapter) => createModuleLearningState(adapter, evidence))
        const courseStates = courses.filter((course) => course.sharedLearning).map((course) => createCourseLearningState(course, evidence))
        setLearningStates([
          ...courseStates,
          ...moduleStates.filter((state) => !sharedLearningModuleIds.has(state.adapter.manifest.id)),
        ])
        setSetup(plannerSetup)
        setError('')
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof Error ? caught.message : 'Could not load today’s plan.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [client, userId])

  const snapshot = useMemo(() => setup
    ? buildPlannerSnapshot(learningStates, setup.assessments, setup.availability, setup.exceptions, setup.preferences)
    : null,
  [learningStates, setup])

  const topItem = snapshot?.today[0]
  const topReason = topItem?.reasons.find((reason) => reason !== 'CAPACITY_CONSTRAINED' && reason !== 'ALREADY_STRONG')
  const topic = topItem ? itemTopicLabel(topItem, learningStates) : null

  async function startItem(item: PlannerItem) {
    try {
      await recordPlannerActivityEvent(client, userId, {
        recommendationId: item.recommendationId,
        eventType: 'started',
        subjectId: item.subjectId,
        topicId: item.topicId,
        activityType: item.activityType,
        metadata: { plannerVersion: 1, source: 'home', capacityState: snapshot?.capacityState ?? 'unknown' },
      })
    } catch {
      // Activity logging must never block a learner from starting useful revision.
    }
    onOpenSubject(item.subjectId)
  }

  async function chooseSomethingElse() {
    if (topItem) {
      try {
        await recordPlannerActivityEvent(client, userId, {
          recommendationId: topItem.recommendationId,
          eventType: 'chosen_alternative',
          subjectId: topItem.subjectId,
          topicId: topItem.topicId,
          activityType: topItem.activityType,
          metadata: { plannerVersion: 1, source: 'home', capacityState: snapshot?.capacityState ?? 'unknown' },
        })
      } catch {
        // Deliberate learner choice remains available even if telemetry fails.
      }
    }
    onOpenSubjects()
  }

  function submitPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = prompt.trim()
    if (!text) {
      setRevState('listening')
      return
    }
    window.sessionStorage.setItem('revision:rev-draft', text)
    setRevState('complete')
    onOpenRev()
  }

  const guidance = loading
    ? 'REV is checking your current plan and evidence.'
    : error
      ? 'I cannot read the planner state right now. You can still choose a subject or open Progress while I recover.'
      : !setup?.availability
        ? 'Tell me roughly how much revision time is realistically available and I can start balancing the work around your assessments.'
        : setup.assessments.length === 0
          ? 'Add an assessment and I can start turning dates, available time and your learning evidence into a useful plan.'
          : !snapshot
            ? 'I know your dates and available time. I need a little more scored revision evidence before I can be specific about what should come first.'
            : snapshot.capacityState === 'prioritising' && topItem
              ? `Time is tight, so I’m prioritising ${subjectName(topItem.subjectId)} · ${topic}. ${topReason ? `The main reason is that ${reasonLabel(topReason)}.` : ''}`
              : topItem
                ? `I’d start with ${subjectName(topItem.subjectId)} · ${topic} today. ${topReason ? `That’s because ${reasonLabel(topReason)}.` : ''}`
                : 'Your plan is up to date. There is no useful planner item I need to push to the front right now.'

  return (
    <main className="dashboard screen-dashboard planner-home living-home" aria-label="Home">
      <section className="living-home-hero" aria-labelledby="planner-home-welcome">
        <div className="living-home-hero-inner">
          <RevPresence state={loading ? 'thinking' : revState} size="hero" />
          <h1 id="planner-home-welcome">Hey {learnerName},<br />what shall we do today?</h1>
          <form className="living-home-prompt" onSubmit={submitPrompt}>
            <input
              value={prompt}
              maxLength={240}
              placeholder="Ask REV anything…"
              aria-label="Ask REV anything"
              onFocus={() => setRevState('listening')}
              onBlur={() => setRevState('resting')}
              onChange={(event) => setPrompt(event.target.value)}
            />
            <button className="living-home-send" type="submit" aria-label="Send to REV">↑</button>
          </form>
          <p className="living-home-status" aria-live="polite">{loading ? 'REV is checking what matters today…' : 'REV is ready when you are.'}</p>
          <a className="living-home-scroll" href="#planner-home-support">Your wider Revision workspace<span aria-hidden="true">↓</span></a>
        </div>
      </section>

      <section className="living-home-support" id="planner-home-support" aria-labelledby="planner-home-support-title">
        <header className="living-home-support-header">
          <p className="eyebrow">Your Revision workspace</p>
          <h2 id="planner-home-support-title">Everything else is here when you need it.</h2>
        </header>

        <div className="living-home-feature-grid">
          <button className="living-home-feature" onClick={onOpenPlan}>
            <span className="living-home-feature-icon" aria-hidden="true">◎</span>
            <strong>Plan smart</strong>
            <span>Build revision around the time you actually have and the assessments ahead.</span>
          </button>
          <button className="living-home-feature" onClick={() => topItem ? void startItem(topItem) : onOpenSubjects()}>
            <span className="living-home-feature-icon" aria-hidden="true">↻</span>
            <strong>Continue where you left off</strong>
            <span>{topItem ? `${subjectName(topItem.subjectId)} · ${itemTopicLabel(topItem, learningStates)}` : 'Choose a subject and get back into useful work.'}</span>
          </button>
          <button className="living-home-feature" onClick={onOpenSubjects}>
            <span className="living-home-feature-icon" aria-hidden="true">▤</span>
            <strong>Find resources</strong>
            <span>Move quickly into Learn, Practice and Exam Prep for your subjects.</span>
          </button>
          <button className="living-home-feature" onClick={onOpenProgress}>
            <span className="living-home-feature-icon" aria-hidden="true">↗</span>
            <strong>Track progress</strong>
            <span>See what your evidence says and where useful work should go next.</span>
          </button>
        </div>

        <div className="living-home-guidance-grid">
          <section className="living-home-guidance" aria-labelledby="planner-home-rev-view">
            <p className="eyebrow">REV’s view</p>
            <h3 id="planner-home-rev-view">What matters now</h3>
            <p>{guidance}</p>
            <div className="living-home-guidance-actions">
              {topItem && <button className="primary" onClick={() => void startItem(topItem)}>Start {activityLabel(topItem.activityType)}</button>}
              {topItem && <button className="secondary" onClick={() => void chooseSomethingElse()}>Choose something else</button>}
              <button className="secondary" onClick={onOpenRev}>Talk to REV</button>
            </div>
          </section>

          <aside className="living-home-today" aria-labelledby="planner-home-today-title">
            <p className="eyebrow">Today’s plan</p>
            <h3 id="planner-home-today-title">{snapshot?.capacityState === 'prioritising' ? 'Prioritising the time available' : 'Your current focus'}</h3>
            {!snapshot && <p>{error || 'Open Plan to add the information REV needs to guide today’s work.'}</p>}
            {snapshot && snapshot.today.length === 0 && <p>No planner activity needs to be pushed forward right now.</p>}
            {snapshot && snapshot.today.length > 0 && <ol className="planner-home-items">{snapshot.today.slice(0, 3).map((item) => <li key={item.recommendationId}><strong>{subjectName(item.subjectId)} · {itemTopicLabel(item, learningStates)}</strong><span>{activityLabel(item.activityType)} · about {item.estimatedMinutes} min</span></li>)}</ol>}
            <button className="text-link" onClick={onOpenPlan}>See the wider plan <span aria-hidden="true">→</span></button>
          </aside>
        </div>

        <section className="home-section planner-home-support" aria-labelledby="planner-home-overview-title">
          <div className="section-heading"><div><p className="eyebrow">Bigger picture</p><h2 id="planner-home-overview-title">Keep the whole programme visible</h2></div><button className="text-link" onClick={onOpenProgress}>See progress <span aria-hidden="true">→</span></button></div>
          <div className="progress-overview">
            <article><small>Active assessments</small><strong>{setup?.assessments.length ?? 0}</strong><p>Dates currently shaping your adaptive plan.</p></article>
            <article><small>Today’s plan</small><strong>{snapshot?.today.length ?? 0}</strong><p>Current useful activities within realistic capacity.</p></article>
            <article><small>Planner state</small><strong>{snapshot?.capacityState === 'prioritising' ? 'Prioritising' : snapshot ? 'Current' : 'Building'}</strong><p>{snapshot?.capacityState === 'prioritising' ? 'Focusing on the highest-value work without creating panic or task debt.' : 'The plan will keep adapting as evidence and dates change.'}</p></article>
          </div>
        </section>
      </section>
    </main>
  )
}
