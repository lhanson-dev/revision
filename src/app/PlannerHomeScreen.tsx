import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { PlannerItem, PlannerReasonCode } from '../engine/planning/planning'
import { loadPlannerSetup, recordPlannerActivityEvent } from '../services/planning/planner-service'
import { createSupabaseEvidenceStore, loadLearningEvidence } from '../services/progress/learning-evidence-service'
import { createCourseLearningState, createModuleLearningState, type ModuleLearningState } from './catalogue-model'
import { adaptersForProgramme, type LearnerProgrammeCourse } from './learner-programme'
import { buildPlannerSnapshot, courseIdForLearningState } from './planner-model'
import { RevPresence, type RevPresenceState } from './RevPresence'
import { Icon } from './ui'

interface PlannerHomeScreenProps {
  client: SupabaseClient
  userId: string
  learnerName: string
  programme: readonly LearnerProgrammeCourse[]
  onOpenPlan: () => void
  onOpenRev: () => void
  onOpenCourses: () => void
  onOpenCourse: (courseId: string) => void
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
  if (activity === 'quick-check') return 'Quick quiz'
  if (activity === 'flashcards') return 'Flashcards'
  return 'Revision activity'
}

function itemTopicLabel(item: PlannerItem, states: readonly ModuleLearningState[]) {
  const state = states.find((candidate) => {
    if (item.courseId && courseIdForLearningState(candidate) !== item.courseId) return false
    return candidate.adapter.getTopic(item.topicId)
  })
  return state?.adapter.getTopic(item.topicId)?.shortTitle ?? item.topicId
}

function programmeCourseLabel(programme: readonly LearnerProgrammeCourse[], courseId: string | undefined, subjectId: string) {
  if (courseId) return programme.find((item) => item.course.id === courseId)?.label ?? subjectId
  const matches = programme.filter((item) => item.subject.id === subjectId)
  return matches.length === 1 ? matches[0]?.label ?? subjectId : matches[0]?.subject.name ?? subjectId
}

export function PlannerHomeScreen({ client, userId, learnerName, programme, onOpenPlan, onOpenRev, onOpenCourses, onOpenCourse }: PlannerHomeScreenProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [learningStates, setLearningStates] = useState<ModuleLearningState[]>([])
  const [setup, setSetup] = useState<Awaited<ReturnType<typeof loadPlannerSetup>> | null>(null)
  const [prompt, setPrompt] = useState('')
  const [revState, setRevState] = useState<RevPresenceState>('resting')

  useEffect(() => {
    let active = true
    const adapters = adaptersForProgramme(programme)
    const evidenceStore = createSupabaseEvidenceStore(client)
    Promise.all([
      loadPlannerSetup(client, userId),
      Promise.all(adapters.map((adapter) => loadLearningEvidence(evidenceStore, userId, adapter.manifest.id))),
    ])
      .then(([plannerSetup, evidenceByModule]) => {
        if (!active) return
        const evidence = evidenceByModule.flat()
        const states: ModuleLearningState[] = []
        programme.forEach(({ course }) => {
          if (course.sharedLearning) states.push(createCourseLearningState(course, evidence))
          else course.modules.forEach((adapter) => states.push(createModuleLearningState(adapter, evidence)))
        })
        setLearningStates(states)
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
  }, [client, programme, userId])

  const snapshot = useMemo(() => setup
    ? buildPlannerSnapshot(learningStates, setup.assessments, setup.availability, setup.exceptions, setup.preferences)
    : null,
  [learningStates, setup])

  const topItem = snapshot?.today[0]
  const topReason = topItem?.reasons.find((reason) => reason !== 'CAPACITY_CONSTRAINED' && reason !== 'ALREADY_STRONG')
  const topic = topItem ? itemTopicLabel(topItem, learningStates) : null
  const topCourseLabel = topItem ? programmeCourseLabel(programme, topItem.courseId, topItem.subjectId) : null

  async function startItem(item: PlannerItem) {
    try {
      await recordPlannerActivityEvent(client, userId, {
        recommendationId: item.recommendationId,
        eventType: 'started',
        subjectId: item.subjectId,
        topicId: item.topicId,
        activityType: item.activityType,
        metadata: {
          plannerVersion: 1,
          source: 'home',
          capacityState: snapshot?.capacityState ?? 'unknown',
          courseId: item.courseId ?? null,
        },
      })
    } catch {
      // Activity logging must never block a learner from starting useful revision.
    }
    if (item.courseId) onOpenCourse(item.courseId)
    else onOpenCourses()
  }

  function openRevWithDraft(text: string) {
    window.sessionStorage.setItem('revision:rev-draft', text)
    onOpenRev()
  }

  function submitPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = prompt.trim()
    if (!text) {
      setRevState('listening')
      onOpenRev()
      return
    }
    window.sessionStorage.setItem('revision:rev-draft', text)
    setRevState('complete')
    onOpenRev()
  }

  const guidance = loading
    ? 'REV is checking your current plan and evidence.'
    : error
      ? 'I cannot read the planner state right now. You can still open Courses or Plan while I recover.'
      : programme.length === 0
        ? 'Add a course so I know what belongs in your Revision programme. I will not recommend work from the published catalogue until you choose it.'
        : !setup?.availability
          ? 'Tell me roughly how much revision time is realistically available and I can start balancing the work around your assessments.'
          : setup.assessments.length === 0
            ? 'Add an assessment and I can start turning dates, available time and your learning evidence into a useful plan.'
            : !snapshot
              ? 'I know your dates and available time. I need an unambiguous active course plus enough scored revision evidence before I can be specific about what should come first.'
              : snapshot.capacityState === 'prioritising' && topItem
                ? `Time is tight, so I’m prioritising ${topCourseLabel} · ${topic}. ${topReason ? `The main reason is that ${reasonLabel(topReason)}.` : ''}`
                : topItem
                  ? `${topic ? `${topic} needs attention. ` : ''}${topReason ? `That’s because ${reasonLabel(topReason)}.` : 'This is the strongest next step from your current plan and evidence.'}`
                  : 'Your plan is up to date. There is no useful planner item I need to push to the front right now.'

  const recommendationTitle = topItem
    ? `${topCourseLabel} is the best use of your time today`
    : loading
      ? 'REV is working out what matters most today'
      : programme.length === 0
        ? 'Start by adding the courses you actually study'
        : 'REV is ready to build your next recommendation'

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
            <button className="living-home-send" type="submit" aria-label="Send to REV"><Icon name="arrow-up" size="compact" /></button>
          </form>
        </div>
      </section>

      <section className="planner-home-primary-grid" aria-label="Today’s recommendation and plan">
        <article className="planner-home-recommendation">
          <div className="planner-home-recommendation-copy">
            <p className="planner-home-recommendation-label"><RevPresence size="compact" state="resting" decorative /> <span>REV recommends</span></p>
            <h2>{recommendationTitle}</h2>
            <p>{guidance}</p>
            <div className="planner-home-recommendation-actions">
              {topItem ? (
                <button className="primary" onClick={() => void startItem(topItem)}>Start {topItem.estimatedMinutes} min session</button>
              ) : programme.length === 0 ? (
                <button className="primary" onClick={onOpenCourses}>Add a course</button>
              ) : (
                <button className="primary" onClick={onOpenPlan}>{setup?.assessments.length ? 'Complete plan setup' : 'Set up my plan'}</button>
              )}
              <button className="planner-home-why" onClick={() => openRevWithDraft(topItem ? `Why is ${topCourseLabel} my top recommendation today?` : 'What do you need from me before you can recommend what to revise?')}>Why this? <Icon name="chevron-right" size="inline" /></button>
            </div>
          </div>
          <RevPresence size="nav" state="resting" decorative className="planner-home-recommendation-presence" />
        </article>

        <aside className="planner-home-today" aria-labelledby="planner-home-today-title">
          <div className="planner-home-today-head"><h2 id="planner-home-today-title">Today’s plan</h2><button className="planner-home-view-plan" onClick={onOpenPlan}>View full plan <Icon name="arrow-right" size="inline" /></button></div>
          {programme.length === 0 && <p className="planner-home-today-empty">Add a course first. Revision will not fabricate a plan from courses you have not selected.</p>}
          {programme.length > 0 && !snapshot && <p className="planner-home-today-empty">{error || 'Open Plan to add the information REV needs to guide today’s work.'}</p>}
          {snapshot && snapshot.today.length === 0 && <p className="planner-home-today-empty">No planner activity needs to be pushed forward right now.</p>}
          {snapshot && snapshot.today.length > 0 && (
            <ol className="planner-home-items">
              {snapshot.today.slice(0, 3).map((item) => (
                <li key={item.recommendationId}>
                  <button onClick={() => void startItem(item)}>
                    <span className="planner-home-item-icon" aria-hidden="true">{item.activityType === 'quick-check' ? '✓' : item.activityType === 'flashcards' ? '□' : '◫'}</span>
                    <span className="planner-home-item-copy"><strong>{programmeCourseLabel(programme, item.courseId, item.subjectId)} — {itemTopicLabel(item, learningStates)}</strong><small>{activityLabel(item.activityType)}</small></span>
                    <span className="planner-home-item-time">{item.estimatedMinutes} min</span>
                    <Icon name="chevron-right" size="compact" className="planner-home-item-arrow" />
                  </button>
                </li>
              ))}
            </ol>
          )}
        </aside>
      </section>
    </main>
  )
}
