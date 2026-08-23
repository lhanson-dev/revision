import { useEffect, useMemo, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { PlannerReasonCode } from '../engine/planning/planning'
import { loadPlannerSetup, savePlanningPreference, type PlanningPreferenceType, type RevisionPlanningPreference } from '../services/planning/planner-service'
import { createSupabaseEvidenceStore, loadLearningEvidence } from '../services/progress/learning-evidence-service'
import { createCourseLearningState, createModuleLearningState, type ModuleLearningState } from './catalogue-model'
import { adaptersForProgramme, type LearnerProgrammeCourse } from './learner-programme'
import { buildPlannerSnapshot } from './planner-model'
import { RevPresence, type RevPresenceState } from './RevPresence'

interface PlannerRevScreenProps {
  client: SupabaseClient
  userId: string
  programme: readonly LearnerProgrammeCourse[]
  onOpenPlan: () => void
  onOpenCourses: () => void
  onOpenCourse: (courseId: string) => void
}

type ConversationMessage = {
  id: string
  speaker: 'rev' | 'learner'
  text: string
}

type PendingPreference = {
  preferenceType: PlanningPreferenceType
  subjectId: string
  label: string
  startsOn: string
  endsOn: string
  strength: 1 | 2 | 3
  rationale: string
}

function localDate(date = new Date()) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function plusDays(date: Date, days: number) {
  return localDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + days))
}

function reasonLabel(reason: PlannerReasonCode) {
  switch (reason) {
    case 'ASSESSMENT_SOON': return 'the assessment is getting closer'
    case 'HIGH_IMPORTANCE_ASSESSMENT': return 'it is one of your higher-priority assessments'
    case 'LOW_EVIDENCE': return 'I do not have much evidence in that area yet'
    case 'WEAK_EVIDENCE': return 'recent evidence suggests it needs more work'
    case 'UNDER_COVERED': return 'it has less evidence coverage than other areas'
    case 'EXAM_PRACTICE_DUE': return 'exam-style practice is becoming more useful now'
    case 'HIGH_MARK_OPPORTUNITY': return 'there is a larger known mark opportunity there'
    case 'ALREADY_STRONG': return 'you already have stronger evidence there'
    case 'LEARNER_PRIORITY': return 'you asked me to give it more attention'
    case 'COMPETING_PRIORITY': return 'I am balancing it with another important priority'
    case 'CAPACITY_CONSTRAINED': return 'available time is tight, so I am protecting the highest-value work'
  }
}

function preferenceIntent(text: string): PlanningPreferenceType {
  const normalized = text.toLocaleLowerCase()
  if (/\b(less|reduce|lower|not today|ease off|pause)\b/.test(normalized)) return 'reduce_subject'
  return 'prefer_subject'
}

function courseLabel(programme: readonly LearnerProgrammeCourse[], courseId: string | undefined, subjectId: string) {
  if (courseId) return programme.find((item) => item.course.id === courseId)?.label ?? subjectId
  const matches = programme.filter((item) => item.subject.id === subjectId)
  return matches.length === 1 ? matches[0]?.label ?? subjectId : matches[0]?.subject.name ?? subjectId
}

function mentionedProgrammeItems(programme: readonly LearnerProgrammeCourse[], text: string) {
  const normalized = text.toLocaleLowerCase()
  const exactCourseMatches = programme.filter((item) => [
    item.label,
    item.course.qualificationName,
    item.course.specificationCode,
  ].some((value) => normalized.includes(value.toLocaleLowerCase())))
  if (exactCourseMatches.length > 0) return exactCourseMatches
  return programme.filter((item) => normalized.includes(item.subject.name.toLocaleLowerCase()))
}

export function PlannerRevScreen({ client, userId, programme, onOpenPlan, onOpenCourses, onOpenCourse }: PlannerRevScreenProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [input, setInput] = useState(() => window.sessionStorage.getItem('revision:rev-draft') ?? '')
  const [inputFocused, setInputFocused] = useState(false)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [learningStates, setLearningStates] = useState<ModuleLearningState[]>([])
  const [setup, setSetup] = useState<Awaited<ReturnType<typeof loadPlannerSetup>> | null>(null)
  const [preferences, setPreferences] = useState<RevisionPlanningPreference[]>([])
  const [pendingPreference, setPendingPreference] = useState<PendingPreference | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    window.sessionStorage.removeItem('revision:rev-draft')
  }, [])

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
        setPreferences(plannerSetup.preferences)
        setError('')
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof Error ? caught.message : 'REV cannot read the planner context right now.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [client, programme, userId])

  const activeCourseIds = useMemo(() => new Set(programme.map((item) => item.course.id)), [programme])
  const activeAssessments = useMemo(() => setup?.assessments.filter((assessment) => {
    if (assessment.courseId) return activeCourseIds.has(assessment.courseId)
    return programme.filter((item) => item.subject.id === assessment.subjectId).length === 1
  }) ?? [], [activeCourseIds, programme, setup])

  const snapshot = useMemo(() => setup
    ? buildPlannerSnapshot(learningStates, activeAssessments, setup.availability, setup.exceptions, preferences)
    : null,
  [activeAssessments, learningStates, setup, preferences])

  const topItem = snapshot?.today[0]
  const topReason = topItem?.reasons.find((reason) => reason !== 'CAPACITY_CONSTRAINED' && reason !== 'ALREADY_STRONG')
  const topLabel = topItem ? courseLabel(programme, topItem.courseId, topItem.subjectId) : null

  const opening = error
    ? 'I cannot read your full planner context right now, so I will not pretend I know what should change. You can still open your plan or Courses.'
    : programme.length === 0
      ? 'How can I help? Add the courses you actually study first so I can keep the wider programme truthful rather than reasoning over the published catalogue.'
      : !setup?.availability || activeAssessments.length === 0
        ? 'How can I help? I can talk through your revision, but I need an assessment attached to one of your active courses and realistic availability before I can properly negotiate the wider plan.'
        : topItem
          ? `How can I help? Right now I’m giving ${topLabel} the most attention${topReason ? ` because ${reasonLabel(topReason)}` : ''}. If you want to focus differently, tell me and I’ll explain the trade-off before changing anything.`
          : 'How can I help? Your planner does not need to push one activity to the front right now, but we can still talk about how you want to use the next few days.'

  const revVisualState: RevPresenceState = loading
    ? 'thinking'
    : saving
      ? 'responding'
      : inputFocused
        ? 'listening'
        : 'resting'

  function appendMessage(message: ConversationMessage) {
    setMessages((current) => [...current, message])
  }

  function submitConversation(event: React.FormEvent) {
    event.preventDefault()
    const text = input.trim()
    if (!text) return
    appendMessage({ id: crypto.randomUUID(), speaker: 'learner', text })
    setInput('')

    const matches = mentionedProgrammeItems(programme, text)
    if (matches.length === 0) {
      appendMessage({
        id: crypto.randomUUID(),
        speaker: 'rev',
        text: programme.length === 0
          ? 'You do not have an active course yet. Add one in Courses and I can use it as programme context.'
          : 'I can help change the plan, but I need to know which active course you mean. Use the course or qualification name shown in Courses.',
      })
      return
    }

    const selected = matches[0]
    const sameSubjectCourses = programme.filter((item) => item.subject.id === selected.subject.id)
    if (sameSubjectCourses.length > 1) {
      appendMessage({
        id: crypto.randomUUID(),
        speaker: 'rev',
        text: `You have more than one ${selected.subject.name} course. My current short-term preference control is subject-level, so I will not pretend it can safely change only ${selected.label}. You can open that course directly, and the planner will still keep recommendations tied to exact course IDs.`,
      })
      return
    }

    const preferenceType = preferenceIntent(text)
    const now = new Date()
    const startsOn = localDate(now)
    const endsOn = plusDays(now, 6)
    const currentTop = snapshot?.today[0]
    const currentTopName = currentTop ? courseLabel(programme, currentTop.courseId, currentTop.subjectId) : null
    const currentTopReason = currentTop?.reasons.find((reason) => reason !== 'CAPACITY_CONSTRAINED' && reason !== 'ALREADY_STRONG')
    const consequence = currentTop && currentTop.subjectId !== selected.subject.id
      ? ` ${currentTopName} is currently ahead in the plan${currentTopReason ? ` because ${reasonLabel(currentTopReason)}` : ''}. If we shift the balance, it may need more attention later.`
      : ''

    const pending: PendingPreference = {
      preferenceType,
      subjectId: selected.subject.id,
      label: selected.label,
      startsOn,
      endsOn,
      strength: preferenceType === 'prefer_subject' ? 2 : 1,
      rationale: text,
    }
    setPendingPreference(pending)
    appendMessage({
      id: crypto.randomUUID(),
      speaker: 'rev',
      text: preferenceType === 'prefer_subject'
        ? `Yes, we can make ${selected.label} heavier for the next week.${consequence} I’ll keep the whole active programme in view rather than treating that as a permanent priority.`
        : `Yes, we can reduce ${selected.label} for the next week.${consequence} I’ll keep checking the assessment dates and evidence so the trade-off stays visible.`,
    })
  }

  async function confirmPreference() {
    if (!pendingPreference) return
    setSaving(true)
    try {
      const saved = await savePlanningPreference(client, userId, {
        preferenceType: pendingPreference.preferenceType,
        subjectId: pendingPreference.subjectId,
        startsOn: pendingPreference.startsOn,
        endsOn: pendingPreference.endsOn,
        strength: pendingPreference.strength,
        source: 'rev_negotiated',
        rationale: pendingPreference.rationale,
      })
      setPreferences((current) => [saved, ...current])
      appendMessage({
        id: crypto.randomUUID(),
        speaker: 'rev',
        text: `Done. I’ve adjusted the planning preference for ${pendingPreference.label} through ${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(`${pendingPreference.endsOn}T12:00:00`))}. The underlying progress evidence has not changed; only the plan weighting has.`,
      })
      setPendingPreference(null)
    } catch (caught: unknown) {
      appendMessage({ id: crypto.randomUUID(), speaker: 'rev', text: caught instanceof Error ? caught.message : 'I could not save that plan change.' })
    } finally {
      setSaving(false)
    }
  }

  function cancelPreference() {
    if (pendingPreference) {
      appendMessage({ id: crypto.randomUUID(), speaker: 'rev', text: `No change made. I’ll keep the current balance and you can still choose ${pendingPreference.label} yourself whenever you want.` })
    }
    setPendingPreference(null)
  }

  return (
    <main className="dashboard screen-dashboard page-screen rev-page planner-rev-page" aria-labelledby="planner-rev-title">
      <header className="page-heading">
        <p className="eyebrow">Your intelligent revision guide</p>
        <h1 id="planner-rev-title">REV</h1>
        <p>Talk through the plan, question a recommendation or change the short-term balance. REV reasons across your active saved courses, not the full published catalogue.</p>
      </header>

      <section className="rev-hero rev-page-hero" aria-labelledby="planner-rev-conversation-title">
        <div className="rev-copy planner-rev-copy">
          <div className="rev-pill">REV</div>
          <h2 id="planner-rev-conversation-title">How can I help?</h2>
          <div className="planner-conversation" aria-live="polite">
            <div className="planner-message-bubble rev"><p>{loading ? 'I’m checking your active courses, plan and evidence…' : opening}</p></div>
            {messages.map((message) => <div key={message.id} className={`planner-message-bubble ${message.speaker}`}><p>{message.text}</p></div>)}
          </div>

          {pendingPreference && (
            <div className="planner-rev-confirm">
              <strong>Apply this change?</strong>
              <p>{pendingPreference.preferenceType === 'prefer_subject' ? `Give ${pendingPreference.label} more weight` : `Reduce ${pendingPreference.label}`} for the next 7 days. This changes planning priority, not mastery or readiness.</p>
              <div className="inline-actions"><button className="primary" disabled={saving} onClick={() => void confirmPreference()}>Yes, adjust my plan</button><button className="secondary" disabled={saving} onClick={cancelPreference}>Keep it as it is</button></div>
            </div>
          )}

          <form className="planner-rev-input" onSubmit={submitConversation}>
            <label htmlFor="rev-plan-message">Talk to REV about your plan</label>
            <div><input id="rev-plan-message" value={input} maxLength={240} placeholder={programme[0] ? `e.g. focus more on ${programme[0].course.qualificationName} this week` : 'Add a course first, then ask REV about your plan'} onFocus={() => setInputFocused(true)} onBlur={() => setInputFocused(false)} onChange={(event) => setInput(event.target.value)} /><button className="rev-primary" type="submit" disabled={loading || saving}>Send</button></div>
          </form>

          <div className="rev-actions">
            <button className="rev-secondary" onClick={onOpenPlan}>Open my full plan</button>
            {topItem?.courseId ? <button className="rev-secondary" onClick={() => onOpenCourse(topItem.courseId!)}>Open {topLabel}</button> : <button className="rev-secondary" onClick={onOpenCourses}>Show my courses</button>}
          </div>
        </div>
        <RevPresence state={revVisualState} size="conversation" />
      </section>

      <p className="quiet-note">REV uses saved courses as programme context. Adding or removing a course does not create or erase learning evidence.</p>
    </main>
  )
}
