import { useEffect, useMemo, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { listAvailableContentAdapters } from '../engine/content/content-registry'
import type { PlannerReasonCode } from '../engine/planning/planning'
import { loadPlannerSetup, savePlanningPreference, type PlanningPreferenceType, type RevisionPlanningPreference } from '../services/planning/planner-service'
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

interface PlannerRevScreenProps {
  client: SupabaseClient
  userId: string
  onOpenPlan: () => void
  onOpenSubject: (subjectId: string) => void
  embedded?: boolean
  contextLabel?: string
  contextSubjectId?: string
}

type ConversationMessage = {
  id: string
  speaker: 'rev' | 'learner'
  text: string
}

type PendingPreference = {
  preferenceType: PlanningPreferenceType
  subjectId: string
  subjectName: string
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

function subjectName(subjectId: string) {
  return catalogue.find((subject) => subject.id === subjectId)?.name ?? subjectId
}

function findMentionedSubject(text: string) {
  const normalized = text.toLocaleLowerCase()
  return catalogue.find((subject) => normalized.includes(subject.name.toLocaleLowerCase()))
}

function preferenceIntent(text: string): PlanningPreferenceType {
  const normalized = text.toLocaleLowerCase()
  if (/\b(less|reduce|lower|not today|ease off|pause)\b/.test(normalized)) return 'reduce_subject'
  return 'prefer_subject'
}

export function PlannerRevScreen({ client, userId, onOpenPlan, onOpenSubject, embedded = false, contextLabel, contextSubjectId }: PlannerRevScreenProps) {
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
  }, [client, userId])

  const snapshot = useMemo(() => setup
    ? buildPlannerSnapshot(learningStates, setup.assessments, setup.availability, setup.exceptions, preferences)
    : null,
  [learningStates, setup, preferences])

  const topItem = snapshot?.today[0]
  const topReason = topItem?.reasons.find((reason) => reason !== 'CAPACITY_CONSTRAINED' && reason !== 'ALREADY_STRONG')
  const contextualSubject = contextSubjectId ? catalogue.find((subject) => subject.id === contextSubjectId) : undefined
  const contextPrefix = embedded && contextLabel ? `You’re looking at ${contextLabel}. ` : ''

  const opening = error
    ? `${contextPrefix}I cannot read your full planner context right now, so I will not pretend I know what should change. You can still open your plan or subjects.`
    : !setup?.availability || setup.assessments.length === 0
      ? `${contextPrefix}How can I help? I can keep this screen open while we talk, but I need an assessment and realistic availability before I can properly negotiate the wider plan.`
      : topItem
        ? `${contextPrefix}How can I help? Right now I’m giving ${subjectName(topItem.subjectId)} the most attention${topReason ? ` because ${reasonLabel(topReason)}` : ''}. If you want to focus differently, tell me and I’ll explain the trade-off before changing anything.`
        : `${contextPrefix}How can I help? Your planner does not need to push one activity to the front right now, but we can still talk about how you want to use the next few days.`

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

    const subject = findMentionedSubject(text) ?? contextualSubject
    if (!subject) {
      appendMessage({
        id: crypto.randomUUID(),
        speaker: 'rev',
        text: 'I can help change the plan, but I need to know which subject you mean. You can say something like “focus more on Spanish this week” or “ease off Business for a few days”.',
      })
      return
    }

    const preferenceType = preferenceIntent(text)
    const now = new Date()
    const startsOn = localDate(now)
    const endsOn = plusDays(now, 6)
    const currentTop = snapshot?.today[0]
    const currentTopName = currentTop ? subjectName(currentTop.subjectId) : null
    const currentTopReason = currentTop?.reasons.find((reason) => reason !== 'CAPACITY_CONSTRAINED' && reason !== 'ALREADY_STRONG')
    const consequence = currentTop && currentTop.subjectId !== subject.id
      ? ` ${currentTopName} is currently ahead in the plan${currentTopReason ? ` because ${reasonLabel(currentTopReason)}` : ''}. If we shift the balance, it may need more attention later.`
      : ''

    const pending: PendingPreference = {
      preferenceType,
      subjectId: subject.id,
      subjectName: subject.name,
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
        ? `Yes, we can make ${subject.name} heavier for the next week.${consequence} I’ll keep the whole programme in view rather than treating that as a permanent priority.`
        : `Yes, we can reduce ${subject.name} for the next week.${consequence} I’ll keep checking the assessment dates and evidence so the trade-off stays visible.`,
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
        text: `Done. I’ve adjusted the planning preference for ${pendingPreference.subjectName} through ${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(`${pendingPreference.endsOn}T12:00:00`))}. The underlying progress evidence has not changed; only the plan weighting has.`,
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
      appendMessage({ id: crypto.randomUUID(), speaker: 'rev', text: `No change made. I’ll keep the current balance and you can still choose ${pendingPreference.subjectName} yourself whenever you want.` })
    }
    setPendingPreference(null)
  }

  const RootElement = embedded ? 'section' : 'main'

  return (
    <RootElement className={`dashboard screen-dashboard page-screen rev-page planner-rev-page${embedded ? ' planner-rev-embedded' : ''}`} aria-labelledby={embedded ? 'planner-rev-conversation-title' : 'planner-rev-title'}>
      {!embedded && (
        <header className="page-heading">
          <p className="eyebrow">Your intelligent revision guide</p>
          <h1 id="planner-rev-title">REV</h1>
          <p>Talk through the plan, question a recommendation or change the short-term balance. REV keeps the wider programme visible while you remain in control.</p>
        </header>
      )}

      <section className="rev-hero rev-page-hero" aria-labelledby="planner-rev-conversation-title">
        <div className="rev-copy planner-rev-copy">
          <div className="rev-pill">REV</div>
          <h2 id="planner-rev-conversation-title">How can I help?</h2>
          <div className="planner-conversation" aria-live="polite">
            <div className="planner-message-bubble rev"><p>{loading ? 'I’m checking your current plan and evidence…' : opening}</p></div>
            {messages.map((message) => <div key={message.id} className={`planner-message-bubble ${message.speaker}`}><p>{message.text}</p></div>)}
          </div>

          {pendingPreference && (
            <div className="planner-rev-confirm">
              <strong>Apply this change?</strong>
              <p>{pendingPreference.preferenceType === 'prefer_subject' ? `Give ${pendingPreference.subjectName} more weight` : `Reduce ${pendingPreference.subjectName}`} for the next 7 days. This changes planning priority, not mastery or readiness.</p>
              <div className="inline-actions"><button className="primary" disabled={saving} onClick={() => void confirmPreference()}>Yes, adjust my plan</button><button className="secondary" disabled={saving} onClick={cancelPreference}>Keep it as it is</button></div>
            </div>
          )}

          <form className="planner-rev-input" onSubmit={submitConversation}>
            <label htmlFor={embedded ? 'rev-context-message' : 'rev-plan-message'}>{embedded ? `Ask REV about ${contextLabel ?? 'this screen'}` : 'Talk to REV about your plan'}</label>
            <div><input id={embedded ? 'rev-context-message' : 'rev-plan-message'} value={input} maxLength={240} placeholder={contextualSubject ? `Ask about ${contextualSubject.name} or change the plan` : 'e.g. I want to focus more on Spanish this week'} onFocus={() => setInputFocused(true)} onBlur={() => setInputFocused(false)} onChange={(event) => setInput(event.target.value)} /><button className="rev-primary" type="submit" disabled={loading || saving}>Send</button></div>
          </form>

          <div className="rev-actions">
            <button className="rev-secondary" onClick={onOpenPlan}>Open my full plan</button>
            {topItem && <button className="rev-secondary" onClick={() => onOpenSubject(topItem.subjectId)}>Open {subjectName(topItem.subjectId)}</button>}
          </div>
        </div>
        <RevPresence state={revVisualState} size="conversation" />
      </section>

      <p className="quiet-note">REV can reshape the plan, but learner preferences are planning context only. They do not create progress, mastery or readiness evidence.</p>
    </RootElement>
  )
}
