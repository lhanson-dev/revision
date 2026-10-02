import { useEffect, useMemo, useRef, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { PlannerReasonCode } from '../engine/planning/planning'
import { loadPlannerSetup, savePlanningPreference, type PlanningPreferenceType, type RevisionPlanningPreference } from '../services/planning/planner-service'
import { createSupabaseEvidenceStore, loadLearningEvidence } from '../services/progress/learning-evidence-service'
import { createCourseLearningState, createModuleLearningState, type ModuleLearningState } from './catalogue-model'
import { adaptersForProgramme, type LearnerProgrammeCourse } from './learner-programme'
import { buildPlannerSnapshot } from './planner-model'
import { RevPresence, type RevPresenceState } from './RevPresence'
import type { CourseSection } from './navigation'
import { answerExams, answerProgress, answerToday, CANNOT_ANSWER_YET, classifyQuestion, promptChips, SAFEGUARDING_FOLLOW_ON, safeguardingReply, screenForSafeguarding, type RevAnswer } from './rev-answers'
import { Button } from './ui'

interface PlannerRevScreenProps {
  client: SupabaseClient
  userId: string
  programme: readonly LearnerProgrammeCourse[]
  onOpenPlan: () => void
  onOpenCourses: () => void
  onOpenCourse: (courseId: string) => void
  onOpenCourseSection: (courseId: string, section: CourseSection) => void
}

type ConversationMessage = {
  id: string
  speaker: 'rev' | 'learner'
  text: string
  /** Extra lines under the text (for the fixed safety message: the support list). */
  list?: string[]
  /** A closing line after the list. */
  after?: string
  safety?: boolean
  action?: RevAnswer['action']
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

export function PlannerRevScreen({ client, userId, programme, onOpenPlan, onOpenCourses, onOpenCourse, onOpenCourseSection }: PlannerRevScreenProps) {
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
  const [responding, setResponding] = useState(false)
  const respondingTimer = useRef<number | null>(null)
  const logRef = useRef<HTMLDivElement | null>(null)

  // Keep the newest message in view as the conversation grows.
  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [messages.length])

  useEffect(() => {
    window.sessionStorage.removeItem('revision:rev-draft')
    return () => {
      if (respondingTimer.current !== null) window.clearTimeout(respondingTimer.current)
    }
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
      ? 'Add the courses you’re studying and I can help you decide what to revise and when.'
      : !setup?.availability || activeAssessments.length === 0
        ? 'I can talk through your revision any time. Add your exam dates and the time you have each week on Plan, and I can help you shape the whole week too.'
        : topItem
          ? `Right now I’m giving ${topLabel} the most attention${topReason ? ` because ${reasonLabel(topReason)}` : ''}. If you want to focus differently, tell me and I’ll explain the trade-off before changing anything.`
          : 'Nothing needs to jump the queue right now. We can still talk about how you want to use the next few days.'

  const revVisualState: RevPresenceState = loading
    ? 'thinking'
    : saving || responding
      ? 'responding'
      : inputFocused && input.length > 0
        ? 'listening'
        : 'resting'

  function appendMessage(message: ConversationMessage) {
    setMessages((current) => [...current, message])
  }

  function reply(message: Omit<ConversationMessage, 'id' | 'speaker'>) {
    appendMessage({ id: crypto.randomUUID(), speaker: 'rev', ...message })
    setResponding(true)
    if (respondingTimer.current !== null) window.clearTimeout(respondingTimer.current)
    respondingTimer.current = window.setTimeout(() => setResponding(false), 1400)
  }

  function submitText(raw: string) {
    const text = raw.trim()
    if (!text) return
    appendMessage({ id: crypto.randomUUID(), speaker: 'learner', text })
    setInput('')

    // 1. Safety first: a student who is struggling gets fixed, vetted text, never a model or a plan change.
    const concern = screenForSafeguarding(text)
    if (concern) {
      const fixed = safeguardingReply(concern)
      reply({ text: fixed.paragraphs.join(' '), list: fixed.support, after: SAFEGUARDING_FOLLOW_ON, safety: true })
      return
    }

    // 2. Questions REV can answer from the student's own plan, results and exam dates.
    const now = new Date()
    const wantsPlanChange = /\b(focus|prioriti[sz]e|more|less|reduce|ease off|pause|not today)\b/i.test(text) && mentionedProgrammeItems(programme, text).length > 0
    if (!wantsPlanChange) {
      const kind = classifyQuestion(text)
      if (kind === 'today') return reply(answerToday(learningStates, programme, now))
      if (kind === 'progress') return reply(answerProgress(learningStates, programme, text))
      if (kind === 'exams') return reply(answerExams(activeAssessments, programme, now))
      // 3. Anything else: say honestly that this is not possible yet. Never a made-up answer.
      return reply({ text: CANNOT_ANSWER_YET })
    }

    // 4. A plan change: the student confirms before anything is saved.
    const matches = mentionedProgrammeItems(programme, text)
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

  const chips = promptChips(programme, activeAssessments.length > 0)
  const learnerHasAsked = messages.some((message) => message.speaker === 'learner')

  return (
    <main className="rev-chat" aria-labelledby="planner-rev-title">
      <header className="rev-chat__head">
        <RevPresence state={revVisualState} size="compact" />
        <div>
          <h1 id="planner-rev-title" className="rev-chat__title">How can I help?</h1>
          <p className="rev-chat__state" aria-hidden="true">{revVisualState === 'thinking' ? 'REV is thinking' : revVisualState === 'responding' ? 'REV is responding' : revVisualState === 'listening' ? 'REV is listening' : 'REV is ready'}</p>
        </div>
      </header>

      <div ref={logRef} className="rev-chat__log" tabIndex={0} role="log" aria-label="Conversation with REV" aria-live="polite">
        <div className="rev-chat__message rev-chat__message--rev"><span className="rev-chat__who">REV says</span><p>{loading ? 'I’m checking your active courses, plan and results…' : opening}</p></div>
        {messages.map((message) => (
          <div key={message.id} className={`rev-chat__message rev-chat__message--${message.speaker}${message.safety ? ' rev-chat__message--safety' : ''}`}>
            <span className="rev-chat__who">{message.speaker === 'rev' ? 'REV says' : 'You said'}</span>
            <p>{message.text}</p>
            {message.list && <ul className="rev-chat__support">{message.list.map((line) => <li key={line}>{line}</li>)}</ul>}
            {message.after && <p>{message.after}</p>}
            {message.action && <Button size="compact" onClick={() => onOpenCourseSection(message.action!.courseId, message.action!.section)}>{message.action.label}</Button>}
          </div>
        ))}
      </div>

      {pendingPreference && (
        <div className="rev-chat__confirm">
          <strong>Apply this change?</strong>
          <p>{pendingPreference.preferenceType === 'prefer_subject' ? `Give ${pendingPreference.label} more weight` : `Reduce ${pendingPreference.label}`} for the next 7 days. This changes planning priority, not your results or readiness.</p>
          <div className="rev-chat__confirm-actions"><Button disabled={saving} onClick={() => void confirmPreference()}>Yes, adjust my plan</Button><Button variant="secondary" disabled={saving} onClick={cancelPreference}>Keep it as it is</Button></div>
        </div>
      )}

      {!learnerHasAsked && chips.length > 0 && (
        <div className="rev-chat__chips" role="group" aria-label="Things you can ask">
          {chips.map((chip) => <button key={chip} type="button" className="rev-chat__chip" disabled={loading || saving} onClick={() => submitText(chip)}>{chip}</button>)}
        </div>
      )}

      <form className="rev-chat__composer" onSubmit={(event) => { event.preventDefault(); submitText(input) }}>
        <label className="rev-chat__label" htmlFor="rev-message">Message REV</label>
        <div className="rev-chat__composer-row">
          <input id="rev-message" className="rev-chat__input" value={input} maxLength={240} autoComplete="off" placeholder="Ask REV…" onFocus={() => setInputFocused(true)} onBlur={() => setInputFocused(false)} onChange={(event) => setInput(event.target.value)} />
          <Button type="submit" disabled={loading || saving || input.trim().length === 0}>Send</Button>
        </div>
      </form>

      <p className="rev-chat__note">REV suggests; you decide. Nothing in your plan changes until you say so. This chat isn’t saved after you close it.</p>
      <div className="rev-chat__links">
        <Button variant="secondary" onClick={onOpenPlan}>Open my plan</Button>
        {topItem?.courseId ? <Button variant="secondary" onClick={() => onOpenCourse(topItem.courseId!)}>Open {topLabel}</Button> : <Button variant="secondary" onClick={onOpenCourses}>Show my courses</Button>}
      </div>
    </main>
  )
}
