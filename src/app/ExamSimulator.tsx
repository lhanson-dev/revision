import { useEffect, useMemo, useRef, useState } from 'react'
import type { Exam } from '../../content/schema'
import type { LearningEvidence } from '../engine/evidence/evidence'
import { createMultipleChoiceEvidence, createSelfAssessedExamQuestionEvidence } from './practice-evidence'
import { answeredQuestionCount } from './exam-prep'
import { Button, Icon, ModalShell } from './ui'

type AoKey = 'ao1' | 'ao2' | 'ao3' | 'ao4'
type Marks = Record<AoKey, number>
export type ExamResult = {
  recorded: boolean
  totalAwarded: number
  totalAvailable: number
  durationMinutes: number
  timed: boolean
  ao: Record<AoKey, { awarded: number; available: number }>
}
type SessionOverlay = 'paused' | 'stop-confirm' | null
export type ExamQuestionRuntime = Exam['questions'][number] & {
  choiceGroup?: string | null
  choiceOption?: string | null
  choiceKind?: 'paper-alternative' | 'syllabus-option'
  responseType?: 'multiple-choice' | 'written'
  options?: Array<{ label: string; text: string }>
  stimulus?: {
    title: string | null
    narrative: string
    table: { title: string; columns: string[]; rows: Array<{ cells: string[] }> } | null
  } | null
}
export type ExamRuntime = Omit<Exam, 'questions'> & {
  questions: ExamQuestionRuntime[]
  learnerClaim?: string
  printedMarks?: number
  restrictedPilot?: boolean
}

const emptyMarks = (): Marks => ({ ao1: 0, ao2: 0, ao3: 0, ao4: 0 })

/** A response must exist before its self-awarded AO marks can count. */
export function marksForSubmittedAnswer(answer: string | undefined, awarded: Marks): Marks {
  return answer?.trim() ? awarded : emptyMarks()
}

/**
 * Preserve objective answer provenance. A keyed MCQ is application evidence,
 * never a student-issued written mark; unkeyed written answers remain self-assessed.
 */
export function createExamResponseEvidence(input: {
  question: ExamQuestionRuntime
  answer: string
  awarded: Marks
  id: string
  moduleId: string
}): LearningEvidence {
  const { question, answer, awarded, id, moduleId } = input
  if (question.correctOptionLabel) {
    const selectedOption = question.options?.findIndex((option) => option.label === answer) ?? -1
    const correctOption = question.options?.findIndex((option) => option.label === question.correctOptionLabel) ?? -1
    if (selectedOption < 0 || correctOption < 0) throw new Error('Invalid authored multiple-choice option or submitted response')
    return createMultipleChoiceEvidence({ id, moduleId, topicId: question.topic, contentId: question.id, selectedOption, correctOption })
  }
  return createSelfAssessedExamQuestionEvidence({
    id, moduleId, topicId: question.topic, contentId: question.id,
    available: question.assessmentObjectives, awarded,
  })
}

/** Keyed questions cannot be given marks for an incorrect selected answer; written self-marking remains unchanged. */
export function marksForExamAnswer(answer: string | undefined, awarded: Marks, correctOptionLabel?: string, available?: Marks): Marks {
  if (correctOptionLabel && available) return answer === correctOptionLabel ? { ...available } : emptyMarks()
  return marksForSubmittedAnswer(answer, awarded)
}
const aoKeys: AoKey[] = ['ao1', 'ao2', 'ao3', 'ao4']

/**
 * The notice read out to screen readers as time runs down. It only changes at 10, 5 and 1 minutes, so the
 * clock itself is not read every second: the text stays the same between those points.
 */
export function timeNoticeFor(secondsRemaining: number): string {
  if (secondsRemaining <= 0) return ''
  if (secondsRemaining <= 60) return 'Under 1 minute left.'
  if (secondsRemaining <= 300) return 'Under 5 minutes left.'
  if (secondsRemaining <= 600) return 'Under 10 minutes left.'
  return ''
}

/** Plain-words state of a question in the grid, for everyone, not only for people who see colour. */
export function questionState(input: { answered: boolean; flagged: boolean; current: boolean }): string {
  const parts = [input.answered ? 'answered' : 'not answered']
  if (input.flagged) parts.push('flagged for review')
  if (input.current) parts.push('current question')
  return parts.join(', ')
}

function attemptId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

/** Store a single exact evidence batch: a retry must not generate new facts. */
export type FrozenExamSubmission = { evidence: LearningEvidence[]; result: ExamResult }

export function freezeExamSubmission(input: {
  exam: ExamRuntime
  moduleId: string
  questions: readonly ExamQuestionRuntime[]
  answers: Record<string, string>
  marks: Record<string, Marks>
  totalAwarded: number
  ao: ExamResult['ao']
  durationMinutes: number
  occurredAt: string
  makeId?: (prefix: string) => string
}): FrozenExamSubmission {
  const { exam, moduleId, questions, answers, marks, totalAwarded, ao, durationMinutes, occurredAt } = input
  if (!questions.some((item) => answers[item.id]?.trim())) throw new Error('An empty paper is not scored evidence.')
  const makeId = input.makeId ?? attemptId
  const evidence = questions.flatMap((item) => {
    if (!answers[item.id]?.trim()) return []
    const awarded = marksForExamAnswer(answers[item.id], marks[item.id] ?? emptyMarks(), item.correctOptionLabel, item.assessmentObjectives)
    return [createExamResponseEvidence({ question: item, answer: answers[item.id], awarded, id: makeId('exam-question'), moduleId })]
  })
  evidence.push({
    id: makeId('exam-attempt'),
    moduleId,
    // Legacy field only; a whole-paper source is excluded from topic readiness.
    topicId: exam.questions[0]?.topic ?? 'business',
    occurredAt,
    contentId: exam.id,
    schemaVersion: 1,
    source: 'exam_attempt',
    marksAwarded: totalAwarded,
    marksAvailable: exam.totalMarks,
    durationMinutes,
    timed: true,
    markingMethod: 'self_assessed',
  })
  return { evidence, result: { totalAwarded, totalAvailable: exam.totalMarks, durationMinutes, timed: true, ao, recorded: true } }
}

function formatTime(seconds: number) {
  const safe = Math.max(0, seconds)
  const minutes = Math.floor(safe / 60)
  const remainder = safe % 60
  return `${minutes}:${String(remainder).padStart(2, '0')}`
}

function paperLabel(exam: Exam) {
  return exam.title.match(/Paper\s+\d+/i)?.[0] ?? 'exam'
}

function titleCaseSlug(value: string) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function choiceGroupLabel(value: string) {
  const match = value.match(/^section-([a-z])$/i)
  return match ? `Section ${match[1].toUpperCase()}` : `section ${value}`
}

function choiceOptionLabel(item: ExamQuestionRuntime) {
  if (item.choiceKind === 'paper-alternative' && item.choiceOption?.startsWith('essay-')) {
    return `Essay ${item.choiceOption.slice(6).toUpperCase()}`
  }
  return titleCaseSlug(item.topic)
}

export type ExamSimulatorProps = {
  exam: ExamRuntime
  moduleId: string
  saving: boolean
  saveError: string
  onRecordEvidence: (evidence: LearningEvidence) => Promise<void>
  /** Opened from the Exam Prep page: skip the launch screen. `untimed` opens single-question practice. */
  autoStart?: 'timed' | 'untimed'
  /** Return to the owning Exam Prep page after explicitly discarding a timed attempt. */
  onExit?: () => void
  /** Focused Home practice: an already-verified question in this exam. */
  preferredQuestionId?: string
}

export function ExamSimulator({ exam, moduleId, saving, saveError, onRecordEvidence, autoStart, onExit, preferredQuestionId }: ExamSimulatorProps) {
  const [started, setStarted] = useState(autoStart === 'timed')
  const [finishedWriting, setFinishedWriting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [marks, setMarks] = useState<Record<string, Marks>>({})
  const [secondsRemaining, setSecondsRemaining] = useState(exam.durationMinutes * 60)
  const [result, setResult] = useState<ExamResult | null>(null)
  const submissionSnapshot = useRef<FrozenExamSubmission | null>(null)
  const saveAttemptInFlight = useRef(false)
  const [submissionLocked, setSubmissionLocked] = useState(false)
  const [attemptSaving, setAttemptSaving] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [questionPractice, setQuestionPractice] = useState(autoStart === 'untimed')
  const [practiceIndex, setPracticeIndex] = useState(() => preferredQuestionId ? Math.max(0, exam.questions.findIndex((item) => item.id === preferredQuestionId)) : 0)
  const [practiceDraft, setPracticeDraft] = useState('')
  const [practiceGuidance, setPracticeGuidance] = useState(false)
  const [practiceMarks, setPracticeMarks] = useState<Marks>(emptyMarks)
  const [practiceSaved, setPracticeSaved] = useState(false)
  const [practiceSaving, setPracticeSaving] = useState(false)
  const practiceEvidenceId = useRef<string | null>(null)
  const [sessionOverlay, setSessionOverlay] = useState<SessionOverlay>(null)
  // Questions the student flagged to come back to. Kept in the page only: saving a paper in progress needs the exam-attempts tables.
  const [flagged, setFlagged] = useState<Record<string, boolean>>({})
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({})
  const startedAt = useRef<number | null>(null)
  const pauseStartedAt = useRef<number | null>(null)
  const focusRegion = useRef<HTMLDivElement>(null)
  const totalPausedMs = useRef(0)
  useEffect(() => { if (autoStart === 'timed') startedAt.current = Date.now() }, [autoStart])

  // A timed attempt owns the full working environment, without global
  // navigation or Ask REV competing for attention or keyboard focus.
  useEffect(() => {
    if (!started || submitted) return
    const shell = document.querySelector('.planner-runtime')
    if (!shell) return
    shell.classList.add('planner-runtime--exam-focus')
    focusRegion.current?.focus()
    return () => shell.classList.remove('planner-runtime--exam-focus')
  }, [started, submitted])

  const question = exam.questions[questionIndex]
  const practiceQuestion = exam.questions[practiceIndex]
  const choiceGroups = Array.from(new Set(exam.questions.flatMap((item) => item.choiceGroup ? [item.choiceGroup] : [])))
  const choiceOptionKey = (item: ExamQuestionRuntime) => item.choiceOption ?? item.id
  const isAttemptedQuestion = (item: ExamQuestionRuntime) => !item.choiceGroup || selectedChoices[item.choiceGroup] === choiceOptionKey(item)
  const activeQuestions = exam.questions.filter(isAttemptedQuestion)
  const missingChoiceGroups = choiceGroups.filter((group) => !selectedChoices[group])
  const answeredCount = activeQuestions.filter((item) => answers[item.id]?.trim()).length
  // Printed alternatives do not increase the number of attempted questions.
  const questionCount = answeredQuestionCount(exam)
  const unansweredNumbers = exam.questions.flatMap((item, index) => (!isAttemptedQuestion(item) || answers[item.id]?.trim() ? [] : [index + 1]))
  const flaggedNumbers = exam.questions.flatMap((item, index) => (flagged[item.id] ? [index + 1] : []))
  const currentMarks = question ? marks[question.id] ?? emptyMarks() : emptyMarks()
  const creditedPracticeMarks = marksForExamAnswer(practiceDraft, practiceMarks, practiceQuestion?.correctOptionLabel, practiceQuestion?.assessmentObjectives)
  const practiceTotal = aoKeys.reduce((sum, key) => sum + creditedPracticeMarks[key], 0)
  const pLabel = paperLabel(exam)

  useEffect(() => {
    if (!started || finishedWriting || sessionOverlay) return
    const interval = window.setInterval(() => {
      setSecondsRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(interval)
          setFinishedWriting(true)
          return 0
        }
        return current - 1
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [started, finishedWriting, sessionOverlay])

  const totals = useMemo(() => {
    const ao = Object.fromEntries(aoKeys.map((key) => [key, { awarded: 0, available: 0 }])) as ExamResult['ao']
    let totalAwarded = 0
    for (const item of activeQuestions) {
      const awarded = marksForExamAnswer(answers[item.id], marks[item.id] ?? emptyMarks(), item.correctOptionLabel, item.assessmentObjectives)
      for (const key of aoKeys) {
        ao[key].awarded += awarded[key]
        ao[key].available += item.assessmentObjectives[key]
        totalAwarded += awarded[key]
      }
    }
    return { ao, totalAwarded }
  }, [activeQuestions, marks, answers])

  function startExam() {
    setQuestionPractice(false)
    setStarted(true)
    setSessionOverlay(null)
    setSecondsRemaining(exam.durationMinutes * 60)
    startedAt.current = Date.now()
    pauseStartedAt.current = null
    totalPausedMs.current = 0
  }

  function startQuestionPractice() {
    setQuestionPractice(true)
    setPracticeIndex(0)
    setPracticeDraft('')
    setPracticeGuidance(false)
    setPracticeMarks(emptyMarks())
    setPracticeSaved(false)
  }

  function beginInterruption(nextOverlay: Exclude<SessionOverlay, null>) {
    if (finishedWriting || sessionOverlay) return
    pauseStartedAt.current = Date.now()
    setSessionOverlay(nextOverlay)
  }

  function resumeExam() {
    if (pauseStartedAt.current !== null) {
      totalPausedMs.current += Date.now() - pauseStartedAt.current
      pauseStartedAt.current = null
    }
    setSessionOverlay(null)
  }

  function stopExam(returnToPrep = true) {
    setStarted(false)
    setFinishedWriting(false)
    setSubmitted(false)
    setQuestionIndex(0)
    setAnswers({})
    setMarks({})
    setFlagged({})
    setSelectedChoices({})
    setSecondsRemaining(exam.durationMinutes * 60)
    setResult(null)
    submissionSnapshot.current = null
    saveAttemptInFlight.current = false
    setSubmissionLocked(false)
    setAttemptSaving(false)
    setSubmissionError(null)
    setSessionOverlay(null)
    startedAt.current = null
    pauseStartedAt.current = null
    totalPausedMs.current = 0
    if (returnToPrep && autoStart === 'timed') onExit?.()
  }

  function updateMark(key: AoKey, value: number) {
    if (submissionLocked || !question || question.correctOptionLabel || !answers[question.id]?.trim()) return
    const available = question.assessmentObjectives[key]
    const safe = Number.isFinite(value) ? Math.max(0, Math.min(available, Math.trunc(value))) : 0
    setMarks((current) => ({
      ...current,
      [question.id]: { ...(current[question.id] ?? emptyMarks()), [key]: safe },
    }))
  }

  function updatePracticeMark(key: AoKey, value: number) {
    if (!practiceQuestion || practiceQuestion.correctOptionLabel || !practiceDraft.trim()) return
    const available = practiceQuestion.assessmentObjectives[key]
    const safe = Number.isFinite(value) ? Math.max(0, Math.min(available, Math.trunc(value))) : 0
    setPracticeMarks((current) => ({ ...current, [key]: safe }))
  }

  function resetPracticeQuestion(nextIndex: number) {
    setPracticeIndex(nextIndex)
    setPracticeDraft('')
    setPracticeGuidance(false)
    setPracticeMarks(emptyMarks())
    setPracticeSaved(false)
    practiceEvidenceId.current = null
  }

  async function savePracticeQuestion() {
    if (!practiceQuestion || !practiceDraft.trim() || !practiceGuidance || practiceSaved || practiceSaving) return
    setPracticeSaving(true)
    if (!practiceEvidenceId.current) practiceEvidenceId.current = attemptId('exam-question')
    try {
      await onRecordEvidence(createExamResponseEvidence({
        question: practiceQuestion,
        answer: practiceDraft,
        awarded: creditedPracticeMarks,
        id: practiceEvidenceId.current,
        moduleId,
      }))
      setPracticeSaved(true)
    } catch {
      return
    } finally {
      setPracticeSaving(false)
    }
  }

  function finishWriting() {
    if (missingChoiceGroups.length > 0) return
    const firstActive = exam.questions.findIndex(isAttemptedQuestion)
    if (firstActive >= 0) setQuestionIndex(firstActive)
    setFinishedWriting(true)
  }

  async function saveResult() {
    if (!finishedWriting || submitted || saveAttemptInFlight.current) return
    const activeDurationMs = startedAt.current
      ? Math.max(0, Date.now() - startedAt.current - totalPausedMs.current)
      : exam.durationMinutes * 60_000
    const durationMinutes = Math.min(exam.durationMinutes, activeDurationMs / 60_000)

    if (!activeQuestions.some((item) => answers[item.id]?.trim())) {
      setResult({ totalAwarded: 0, totalAvailable: exam.totalMarks, durationMinutes, timed: true, ao: totals.ao, recorded: false })
      setSubmitted(true)
      return
    }

    saveAttemptInFlight.current = true
    setAttemptSaving(true)
    setSubmissionError(null)
    try {
      // The identical payload must be used after partial success, including its timestamps.
      if (!submissionSnapshot.current) {
        submissionSnapshot.current = freezeExamSubmission({
          exam, moduleId, questions: activeQuestions, answers, marks,
          totalAwarded: totals.totalAwarded, ao: totals.ao,
          durationMinutes, occurredAt: new Date().toISOString(),
        })
        setSubmissionLocked(true)
      }
      const snapshot = submissionSnapshot.current
      for (const fact of snapshot.evidence) await onRecordEvidence(fact)
      setResult(snapshot.result)
      setSubmitted(true)
    } catch {
      setSubmissionError('We could not confirm your whole exam was saved. Your answers and marks are still here. Retry saving without changing them.')
    } finally {
      saveAttemptInFlight.current = false
      setAttemptSaving(false)
    }
  }

  function resetExam() {
    // Restarting from a saved result preserves the simulator's prior launch flow.
    // Only explicit confirmed Stop returns to the owning Exam Prep page.
    stopExam(false)
  }

  if (!started && questionPractice && practiceQuestion) {
    return (
      <section className="exam-simulator" aria-labelledby={`question-practice-${exam.id}`}>
        <p className="eyebrow">Targeted {pLabel} practice</p>
        <h2 id={`question-practice-${exam.id}`}>Practise one exam question</h2>
        <div className="practice-meta">{practiceQuestion.choiceGroup
          ? `${practiceQuestion.sectionLabel ?? pLabel} · ${choiceOptionLabel(practiceQuestion)}`
          : `Question ${practiceIndex + 1} of ${questionCount}`} · {practiceQuestion.marks} marks</div>
        {exam.caseHtml && <div className="exam-context" dangerouslySetInnerHTML={{ __html: exam.caseHtml }} />}
        <h3>{practiceQuestion.prompt}</h3>
        {practiceQuestion.responseType === 'multiple-choice' ? (
          <fieldset className="exam-mcq">
            <legend>Choose one answer</legend>
            {practiceQuestion.options?.map((option) => (
              <label key={option.label}>
                <input type="radio" name={`practice-answer-${practiceQuestion.id}`}
                  value={option.label} disabled={practiceSaved || practiceGuidance} checked={practiceDraft === option.label}
                  onChange={() => setPracticeDraft(option.label)} />
                <span><strong>{option.label}</strong> {option.text}</span>
              </label>
            ))}
          </fieldset>
        ) : (
          <label className="answer-label">Write your answer
            <textarea rows={12} disabled={practiceSaved} value={practiceDraft} onChange={(event) => setPracticeDraft(event.target.value)} placeholder="Answer as you would in the exam." />
          </label>
        )}
        {!practiceGuidance ? (
          <Button disabled={!practiceDraft.trim()} onClick={() => setPracticeGuidance(true)}>Show marking guidance</Button>
        ) : (
          <>
            <div className="mark-guidance"><strong>Marking guidance</strong><ul>{practiceQuestion.markingGuidance.map((line) => <li key={line}>{line}</li>)}</ul></div>
            {practiceQuestion.correctOptionLabel && <p role="status" className="result-explanation">Revision checked your answer against the authored key: {practiceDraft === practiceQuestion.correctOptionLabel ? 'correct' : 'incorrect'} ({practiceTotal}/{practiceQuestion.marks}). This is a Revision-authored question, not an official AQA question.</p>}
            <div className="ao-marker-grid">
              {aoKeys.filter((key) => practiceQuestion.assessmentObjectives[key] > 0).map((key) => <label key={key}>{key.toUpperCase()} <span>/{practiceQuestion.assessmentObjectives[key]}</span><input type="number" min={0} max={practiceQuestion.assessmentObjectives[key]} disabled={practiceSaved || Boolean(practiceQuestion.correctOptionLabel)} value={practiceQuestion.correctOptionLabel ? creditedPracticeMarks[key] : practiceMarks[key]} onChange={(event) => updatePracticeMark(key, Number(event.target.value))} /></label>)}
            </div>
            {!practiceSaved ? <Button disabled={saving || practiceSaving || !practiceDraft.trim()} onClick={savePracticeQuestion}>Record this result</Button> : <div className="result-explanation" aria-live="polite"><strong>Result recorded: {practiceTotal} / {practiceQuestion.marks}</strong><span>Revision checks keyed multiple-choice answers, while written answers remain self-assessed. Neither is independently examiner-marked.</span></div>}
          </>
        )}
        <div className="exam-nav-actions">
          <Button variant="secondary" disabled={practiceIndex === 0 || Boolean(preferredQuestionId)} onClick={() => resetPracticeQuestion(practiceIndex - 1)}>Previous</Button>
          <Button variant="secondary" disabled={practiceIndex === exam.questions.length - 1 || Boolean(preferredQuestionId)} onClick={() => resetPracticeQuestion(practiceIndex + 1)}>Next question</Button>
          {!preferredQuestionId && <Button variant="secondary" onClick={() => setQuestionPractice(false)}>Back to {pLabel}</Button>}
        </div>
        {saveError && <p className="error" role="alert">{saveError}</p>}
      </section>
    )
  }

  if (!started) {
    return (
      <section className="exam-simulator exam-launch" aria-labelledby={`full-exam-${exam.id}`}>
        <p className="eyebrow">{pLabel === 'exam' ? 'Exam practice' : `${pLabel} exam practice`}</p>
        <h2 id={`full-exam-${exam.id}`}>Full {exam.durationMinutes}-minute {pLabel}</h2>
        <p className="intro">{exam.title}. {exam.printedMarks && exam.printedMarks !== exam.totalMarks ? `${exam.printedMarks} marks are printed; you attempt ${exam.totalMarks} marks by choosing one question from each choice section.` : `${exam.totalMarks} marks.`} Work under the full {exam.durationMinutes}-minute timer.</p>
        {exam.learnerClaim && <p className="exam-learner-claim">{exam.learnerClaim}</p>}
        <div className="activity-kind scored"><strong>What am I trying to improve?</strong><span>Applying knowledge in this paper’s format, managing time, and sustaining analysis and judgement. Authored multiple-choice answers are checked against their key; written answers are self-assessed. This is not independently examiner-marked.</span></div>
        <div className="inline-actions">{!exam.restrictedPilot && <Button variant="secondary" onClick={startQuestionPractice}>Practise one question</Button>}<Button aria-label="Start timed exam" onClick={startExam}>Open timed exam</Button></div>
      </section>
    )
  }

  if (submitted && result) {
    const percentage = result.totalAvailable ? Math.round((result.totalAwarded / result.totalAvailable) * 100) : 0
    return (
      <section className="exam-simulator exam-results" aria-labelledby="exam-results-heading">
        <p className="eyebrow">What does my result mean?</p>
        <h2 id="exam-results-heading">Exam result</h2>
        <div className="exam-score">{result.totalAwarded}/{result.totalAvailable} <span>{percentage}%</span></div>
        {result.recorded
          ? <p>Written answers use AO marks you awarded yourself; keyed multiple-choice answers are checked against Revision's authored key. Unanswered questions count as zero on this paper but do not create topic-level question evidence. This is not independently examiner-marked.</p>
          : <p>No answers were submitted, so this empty paper was not recorded as learning evidence. You can start another attempt.</p>}
        <div className="ao-results">
          {aoKeys.map((key) => {
            const value = result.ao[key]
            const pct = value.available ? Math.round((value.awarded / value.available) * 100) : 0
            return <article key={key}><strong>{key.toUpperCase()}</strong><span>{value.awarded}/{value.available}</span><small>{pct}%</small></article>
          })}
        </div>
        <div className="next-step"><strong>What should I do next?</strong><span>Use the weakest AO above to choose your next practice. If AO2/AO3 is weakest, return to targeted paper questions. If AO4 is weakest, practise conditional judgements on extended responses.</span></div>
        <Button variant="secondary" onClick={resetExam}>Start another attempt</Button>
      </section>
    )
  }

  return (
    <div ref={focusRegion} tabIndex={-1} className="exam-session-page" role="region" aria-label={`${exam.title} timed exam`}>
      <section className={`exam-simulator exam-session ${sessionOverlay ? 'exam-session-obscured' : ''}`} aria-labelledby="exam-simulator-heading" aria-hidden={sessionOverlay ? true : undefined}>
        <div className="exam-sticky-bar">
          <div><strong id="exam-simulator-heading">{exam.title}</strong><span>{answeredCount}/{questionCount} answered</span></div>
          <div className="exam-session-controls">
            {!finishedWriting && <Button variant="secondary" type="button" onClick={() => beginInterruption('paused')}>Pause</Button>}
            {!finishedWriting && <Button variant="destructive" type="button" onClick={() => beginInterruption('stop-confirm')}>Stop exam</Button>}
            <div className={secondsRemaining <= 600 ? 'timer warning' : 'timer'}>
              {secondsRemaining <= 600 && <Icon name="clock" size="inline" />}
              <span>{formatTime(secondsRemaining)}</span>
              {secondsRemaining <= 600 && <small className="timer-note">Under 10 min</small>}
            </div>
            <p className="exam-time-notice" role="status" aria-live="polite">{started && !finishedWriting ? timeNoticeFor(secondsRemaining) : ''}</p>
          </div>
        </div>

        {!finishedWriting ? (
          <>
            {exam.caseHtml && <details className="exam-case"><summary>Source/case material</summary><div dangerouslySetInnerHTML={{ __html: exam.caseHtml }} /></details>}
            <nav className="question-nav question-grid" aria-label="Exam questions">
              {exam.questions.map((item, index) => {
                const answered = Boolean(answers[item.id]?.trim())
                const isFlagged = Boolean(flagged[item.id])
                const current = index === questionIndex
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`${current ? 'active' : ''}${answered ? ' answered' : ''}${isFlagged ? ' flagged' : ''}`.trim()}
                    aria-current={current ? 'true' : undefined}
                    aria-label={`Question ${index + 1}, ${item.marks} marks, ${questionState({ answered, flagged: isFlagged, current })}`}
                    onClick={() => setQuestionIndex(index)}
                  >
                    <b>{index + 1}</b>
                    <span>{item.marks}m</span>
                    <i aria-hidden="true">{isFlagged ? <Icon name="flag" size="inline" /> : answered ? <Icon name="check" size="inline" /> : null}</i>
                  </button>
                )
              })}
            </nav>
            <p className="question-grid-key" aria-hidden="true"><span><Icon name="check" size="inline" /> Answered</span><span><Icon name="flag" size="inline" /> Flagged</span><span className="question-grid-key-current">Current: dark</span></p>
            {question && (
              <article className="exam-question-sheet">
                {question.sectionLabel && question.sectionTitle && question.sectionMarks && (
                  <div className="practice-meta exam-section-context">
                    <strong>{question.sectionLabel}</strong> · {question.sectionTitle} · {question.sectionMarks} marks
                  </div>
                )}
                <div className="practice-meta">Question {questionIndex + 1} of {exam.questions.length} · {question.marks} marks</div>
                {question.choiceGroup && (
                  <label className="exam-choice-select">
                    <input type="radio" name={question.choiceGroup} checked={selectedChoices[question.choiceGroup] === choiceOptionKey(question)} onChange={() => setSelectedChoices((current) => ({ ...current, [question.choiceGroup as string]: choiceOptionKey(question) }))} />
                    Attempt {question.choiceOption ? choiceOptionLabel(question) : 'this question'} for {choiceGroupLabel(question.choiceGroup)}
                  </label>
                )}
                {question.stimulus && (
                  <section className="exam-stimulus" aria-label={question.stimulus.title ?? 'Question stimulus'}>
                    {question.stimulus.title && <h4>{question.stimulus.title}</h4>}
                    {question.stimulus.narrative && <p>{question.stimulus.narrative}</p>}
                    {question.stimulus.table && (
                      <div className="exam-stimulus-table-wrap">
                        <table>
                          <caption>{question.stimulus.table.title}</caption>
                          <thead><tr>{question.stimulus.table.columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead>
                          <tbody>{question.stimulus.table.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.cells.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody>
                        </table>
                      </div>
                    )}
                  </section>
                )}
                <h3>{question.prompt}</h3>
                {question.responseType === 'multiple-choice' ? (
                  <fieldset className="exam-mcq"><legend>Your answer</legend>{question.options?.map((option) => <label key={option.label}><input type="radio" name={`answer-${question.id}`} value={option.label} checked={answers[question.id] === option.label} onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.label }))} /><span><strong>{option.label}</strong> {option.text}</span></label>)}</fieldset>
                ) : (
                  <>
                    <label className="answer-label">Your answer
                      <textarea rows={14} value={answers[question.id] ?? ''} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))} placeholder="Write as you would in the exam." />
                    </label>
                    <p className="exam-word-count">{(answers[question.id] ?? '').trim() ? (answers[question.id] ?? '').trim().split(/\s+/).length : 0} words</p>
                  </>
                )}
                <button type="button" className="exam-flag-toggle" aria-pressed={Boolean(flagged[question.id])} onClick={() => setFlagged((current) => ({ ...current, [question.id]: !current[question.id] }))}>
                  <Icon name="flag" size="inline" />{flagged[question.id] ? 'Flagged for review (tap to remove)' : 'Flag for review'}
                </button>
                {(unansweredNumbers.length > 0 || flaggedNumbers.length > 0 || missingChoiceGroups.length > 0) && (
                  <p className="exam-finish-check">
                    Before you finish:
                    {missingChoiceGroups.length > 0 && <> choose one question from section {missingChoiceGroups.join(' and ')}.</>}
                    {unansweredNumbers.length > 0 && <> not answered: question {unansweredNumbers.join(', ')}.</>}
                    {flaggedNumbers.length > 0 && <> flagged: question {flaggedNumbers.join(', ')}.</>}
                  </p>
                )}
                <div className="exam-nav-actions">
                  <Button variant="secondary" disabled={questionIndex === 0} onClick={() => setQuestionIndex((index) => index - 1)}>Previous</Button>
                  {questionIndex < exam.questions.length - 1 && <Button onClick={() => setQuestionIndex((index) => index + 1)}>Next question</Button>}
                  <Button variant="secondary" disabled={missingChoiceGroups.length > 0} onClick={finishWriting}>Finish and self-mark</Button>
                </div>
              </article>
            )}
          </>
        ) : (
          <div className="self-marking">
            <div className="activity-kind scored"><strong>Self-mark your paper</strong><span>Compare each answer with the supplied guidance, then award AO marks. Revision will show the derivation of your result and label it self-assessed.</span></div>
            <nav className="question-nav" aria-label="Questions to mark">
              {exam.questions.map((item, index) => isAttemptedQuestion(item) ? <button key={item.id} className={index === questionIndex ? 'active' : ''} onClick={() => setQuestionIndex(index)}>{index + 1}<span>{item.marks}m</span></button> : null)}
            </nav>
            {question && (
              <article className="exam-question-sheet">
                <div className="practice-meta">Question {questionIndex + 1} · {question.marks} marks</div>
                <h3>{question.prompt}</h3>
                <div className="submitted-answer"><strong>Your answer</strong><p>{answers[question.id]?.trim() || 'No answer recorded.'}</p></div>
                <div className="mark-guidance"><strong>Marking guidance</strong><ul>{question.markingGuidance.map((line) => <li key={line}>{line}</li>)}</ul></div>
                {!answers[question.id]?.trim() && <p className="muted">No answer submitted. This question receives zero marks and will not create topic-level learning evidence.</p>}
                {question.correctOptionLabel && answers[question.id]?.trim() && <p role="status" className="result-explanation">Revision key check: {answers[question.id] === question.correctOptionLabel ? 'correct' : 'incorrect'}. This is not an official AQA mark.</p>}
                <div className="ao-marker-grid">
                  {aoKeys.filter((key) => question.assessmentObjectives[key] > 0).map((key) => <label key={key}>{key.toUpperCase()} <span>/{question.assessmentObjectives[key]}</span><input type="number" min={0} max={question.assessmentObjectives[key]} disabled={submissionLocked || !answers[question.id]?.trim() || Boolean(question.correctOptionLabel)} value={marksForExamAnswer(answers[question.id], currentMarks, question.correctOptionLabel, question.assessmentObjectives)[key]} onChange={(event) => updateMark(key, Number(event.target.value))} /></label>)}
                </div>
                <div className="exam-nav-actions">
                  <Button variant="secondary" disabled={questionIndex === 0} onClick={() => setQuestionIndex((index) => index - 1)}>Previous</Button>
                  {questionIndex < exam.questions.length - 1 && <Button onClick={() => setQuestionIndex((index) => index + 1)}>Next to mark</Button>}
                </div>
              </article>
            )}
            <div className="exam-submit-summary"><strong>Current total: {totals.totalAwarded}/{exam.totalMarks}</strong><span>Written marks are self-assessed; keyed multiple-choice answers are checked by Revision.</span><Button disabled={saving || attemptSaving} onClick={saveResult}>{submissionLocked ? 'Retry saving exam result' : 'Save exam result'}</Button></div>
            {saveError && <p className="error" role="alert">{saveError}</p>}
            {submissionError && <p className="error" role="alert">{submissionError}</p>}
            {submissionLocked && <p className="muted small-note">Your original submission is locked while saving is retried, to prevent conflicting marks.</p>}
            {(saving || attemptSaving) && <p className="muted" aria-live="polite">Saving your exam evidence…</p>}
          </div>
        )}
      </section>

      {sessionOverlay === 'paused' && (
        <div className="exam-interruption">
          <ModalShell className="exam-interruption-card exam-pause-card" labelledBy="exam-paused-title" onDismiss={resumeExam} initialFocusSelector=".ui-button--large">
            <p className="eyebrow">Timer paused</p>
            <h2 id="exam-paused-title">Exam paused</h2>
            <p>Your exam is hidden while paused. The timer will continue only when you resume.</p>
            <Button size="large" type="button" onClick={resumeExam}><Icon name="play" size="compact" /><span>Continue exam</span></Button>
          </ModalShell>
        </div>
      )}

      {sessionOverlay === 'stop-confirm' && (
        <div className="exam-interruption">
          <ModalShell className="exam-interruption-card" labelledBy="stop-exam-title" onDismiss={resumeExam} initialFocusSelector=".exam-confirm-actions .ui-button--primary">
            <p className="eyebrow">Stop exam?</p>
            <h2 id="stop-exam-title">Are you sure?</h2>
            <p>Stopping will end this attempt and discard the answers from this unsaved exam.</p>
            <div className="exam-confirm-actions">
              <Button variant="destructive" type="button" onClick={() => stopExam()}>Yes, stop exam</Button>
              <Button type="button" onClick={resumeExam}>Continue exam</Button>
            </div>
          </ModalShell>
        </div>
      )}
    </div>
  )
}
