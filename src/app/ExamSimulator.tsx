import { useEffect, useMemo, useRef, useState } from 'react'
import type { Exam } from '../../content/schema'
import type { LearningEvidence } from '../engine/evidence/evidence'
import { createSelfAssessedExamQuestionEvidence } from './practice-evidence'

type AoKey = 'ao1' | 'ao2' | 'ao3' | 'ao4'
type Marks = Record<AoKey, number>
type ExamResult = {
  totalAwarded: number
  totalAvailable: number
  durationMinutes: number
  timed: boolean
  ao: Record<AoKey, { awarded: number; available: number }>
}
type SessionOverlay = 'paused' | 'stop-confirm' | null

const emptyMarks = (): Marks => ({ ao1: 0, ao2: 0, ao3: 0, ao4: 0 })
const aoKeys: AoKey[] = ['ao1', 'ao2', 'ao3', 'ao4']

function attemptId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
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

export type ExamSimulatorProps = {
  exam: Exam
  moduleId: string
  saving: boolean
  saveError: string
  onRecordEvidence: (evidence: LearningEvidence) => Promise<void>
}

export function ExamSimulator({ exam, moduleId, saving, saveError, onRecordEvidence }: ExamSimulatorProps) {
  const [started, setStarted] = useState(false)
  const [finishedWriting, setFinishedWriting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [marks, setMarks] = useState<Record<string, Marks>>({})
  const [secondsRemaining, setSecondsRemaining] = useState(exam.durationMinutes * 60)
  const [result, setResult] = useState<ExamResult | null>(null)
  const [submissionIds, setSubmissionIds] = useState<Record<string, string>>({})
  const [questionPractice, setQuestionPractice] = useState(false)
  const [practiceIndex, setPracticeIndex] = useState(0)
  const [practiceDraft, setPracticeDraft] = useState('')
  const [practiceGuidance, setPracticeGuidance] = useState(false)
  const [practiceMarks, setPracticeMarks] = useState<Marks>(emptyMarks)
  const [practiceSaved, setPracticeSaved] = useState(false)
  const [sessionOverlay, setSessionOverlay] = useState<SessionOverlay>(null)
  const startedAt = useRef<number | null>(null)
  const pauseStartedAt = useRef<number | null>(null)
  const totalPausedMs = useRef(0)

  const question = exam.questions[questionIndex]
  const practiceQuestion = exam.questions[practiceIndex]
  const answeredCount = exam.questions.filter((item) => answers[item.id]?.trim()).length
  const currentMarks = question ? marks[question.id] ?? emptyMarks() : emptyMarks()
  const practiceTotal = aoKeys.reduce((sum, key) => sum + practiceMarks[key], 0)
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

  useEffect(() => {
    if (!started || !sessionOverlay) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [started, sessionOverlay])

  const totals = useMemo(() => {
    const ao = Object.fromEntries(aoKeys.map((key) => [key, { awarded: 0, available: 0 }])) as ExamResult['ao']
    let totalAwarded = 0
    for (const item of exam.questions) {
      const awarded = marks[item.id] ?? emptyMarks()
      for (const key of aoKeys) {
        ao[key].awarded += awarded[key]
        ao[key].available += item.assessmentObjectives[key]
        totalAwarded += awarded[key]
      }
    }
    return { ao, totalAwarded }
  }, [exam.questions, marks])

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

  function stopExam() {
    setStarted(false)
    setFinishedWriting(false)
    setSubmitted(false)
    setQuestionIndex(0)
    setAnswers({})
    setMarks({})
    setSecondsRemaining(exam.durationMinutes * 60)
    setResult(null)
    setSubmissionIds({})
    setSessionOverlay(null)
    startedAt.current = null
    pauseStartedAt.current = null
    totalPausedMs.current = 0
  }

  function updateMark(key: AoKey, value: number) {
    if (!question) return
    const available = question.assessmentObjectives[key]
    const safe = Number.isFinite(value) ? Math.max(0, Math.min(available, Math.trunc(value))) : 0
    setMarks((current) => ({
      ...current,
      [question.id]: { ...(current[question.id] ?? emptyMarks()), [key]: safe },
    }))
  }

  function updatePracticeMark(key: AoKey, value: number) {
    if (!practiceQuestion) return
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
  }

  async function savePracticeQuestion() {
    if (!practiceQuestion || !practiceGuidance || practiceSaved) return
    try {
      await onRecordEvidence(createSelfAssessedExamQuestionEvidence({
        id: attemptId('exam-question'),
        moduleId,
        topicId: practiceQuestion.topic,
        contentId: practiceQuestion.id,
        available: practiceQuestion.assessmentObjectives,
        awarded: practiceMarks,
      }))
      setPracticeSaved(true)
    } catch {
      return
    }
  }

  function finishWriting() {
    setFinishedWriting(true)
  }

  function buildSubmissionIds() {
    if (Object.keys(submissionIds).length) return submissionIds
    const ids: Record<string, string> = { attempt: attemptId('exam-attempt') }
    exam.questions.forEach((item) => { ids[item.id] = attemptId('exam-question') })
    setSubmissionIds(ids)
    return ids
  }

  async function saveResult() {
    if (!finishedWriting || submitted) return
    const ids = buildSubmissionIds()
    const activeDurationMs = startedAt.current
      ? Math.max(0, Date.now() - startedAt.current - totalPausedMs.current)
      : exam.durationMinutes * 60_000
    const durationMinutes = Math.min(exam.durationMinutes, activeDurationMs / 60_000)

    try {
      for (const item of exam.questions) {
        const awarded = marks[item.id] ?? emptyMarks()
        await onRecordEvidence(createSelfAssessedExamQuestionEvidence({
          id: ids[item.id],
          moduleId,
          topicId: item.topic,
          contentId: item.id,
          available: item.assessmentObjectives,
          awarded,
        }))
      }

      const attempt: LearningEvidence = {
        id: ids.attempt,
        moduleId,
        topicId: exam.questions[0]?.topic ?? 'business',
        occurredAt: new Date().toISOString(),
        contentId: exam.id,
        schemaVersion: 1,
        source: 'exam_attempt',
        marksAwarded: totals.totalAwarded,
        marksAvailable: exam.totalMarks,
        durationMinutes,
        timed: true,
        markingMethod: 'self_assessed',
      }
      await onRecordEvidence(attempt)
      setResult({ totalAwarded: totals.totalAwarded, totalAvailable: exam.totalMarks, durationMinutes, timed: true, ao: totals.ao })
      setSubmitted(true)
    } catch {
      return
    }
  }

  function resetExam() {
    stopExam()
  }

  if (!started && questionPractice && practiceQuestion) {
    return (
      <section className="exam-simulator" aria-labelledby={`question-practice-${exam.id}`}>
        <p className="eyebrow">Targeted {pLabel} practice</p>
        <h2 id={`question-practice-${exam.id}`}>Practise one exam question</h2>
        <div className="practice-meta">Question {practiceIndex + 1} of {exam.questions.length} · {practiceQuestion.marks} marks</div>
        <h3>{practiceQuestion.prompt}</h3>
        <label className="answer-label">Write your answer
          <textarea rows={12} disabled={practiceSaved} value={practiceDraft} onChange={(event) => setPracticeDraft(event.target.value)} placeholder="Answer as you would in the exam." />
        </label>
        {!practiceGuidance ? (
          <button className="primary" disabled={!practiceDraft.trim()} onClick={() => setPracticeGuidance(true)}>Show marking guidance</button>
        ) : (
          <>
            <div className="mark-guidance"><strong>Marking guidance</strong><ul>{practiceQuestion.markingGuidance.map((line) => <li key={line}>{line}</li>)}</ul></div>
            <div className="ao-marker-grid">
              {aoKeys.filter((key) => practiceQuestion.assessmentObjectives[key] > 0).map((key) => <label key={key}>{key.toUpperCase()} <span>/{practiceQuestion.assessmentObjectives[key]}</span><input type="number" min={0} max={practiceQuestion.assessmentObjectives[key]} disabled={practiceSaved} value={practiceMarks[key]} onChange={(event) => updatePracticeMark(key, Number(event.target.value))} /></label>)}
            </div>
            {!practiceSaved ? <button className="primary" disabled={saving} onClick={savePracticeQuestion}>Record this result</button> : <div className="result-explanation" aria-live="polite"><strong>Result recorded: {practiceTotal} / {practiceQuestion.marks}</strong><span>This is self-assessed exam evidence, so Revision limits the confidence it can claim from it.</span></div>}
          </>
        )}
        <div className="exam-nav-actions">
          <button className="secondary" disabled={practiceIndex === 0} onClick={() => resetPracticeQuestion(practiceIndex - 1)}>Previous</button>
          <button className="secondary" disabled={practiceIndex === exam.questions.length - 1} onClick={() => resetPracticeQuestion(practiceIndex + 1)}>Next question</button>
          <button className="secondary" onClick={() => setQuestionPractice(false)}>Back to {pLabel}</button>
        </div>
        {saveError && <p className="error" role="alert">{saveError}</p>}
      </section>
    )
  }

  if (!started) {
    return (
      <section className="exam-simulator exam-launch" aria-labelledby={`full-exam-${exam.id}`}>
        <p className="eyebrow">{pLabel} exam practice</p>
        <h2 id={`full-exam-${exam.id}`}>Full {exam.durationMinutes}-minute {pLabel}</h2>
        <p className="intro">{exam.title}. Practise all {exam.questions.length} questions for {exam.totalMarks} marks under a running timer, or work on one question first.</p>
        <div className="activity-kind scored"><strong>What am I trying to improve?</strong><span>Applying knowledge in this paper’s format, managing time, and sustaining analysis and judgement. Marks are self-assessed, so they inform readiness but cannot create high confidence on their own.</span></div>
        <div className="inline-actions"><button className="secondary" onClick={startQuestionPractice}>Practise one question</button><button className="primary" onClick={startExam}>Open timed exam</button></div>
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
        <p>Your result is based on the AO marks you awarded yourself after comparing each answer with the marking guidance. It is useful evidence, but it is not independently marked.</p>
        <div className="ao-results">
          {aoKeys.map((key) => {
            const value = result.ao[key]
            const pct = value.available ? Math.round((value.awarded / value.available) * 100) : 0
            return <article key={key}><strong>{key.toUpperCase()}</strong><span>{value.awarded}/{value.available}</span><small>{pct}%</small></article>
          })}
        </div>
        <div className="next-step"><strong>What should I do next?</strong><span>Use the weakest AO above to choose your next practice. If AO2/AO3 is weakest, return to targeted paper questions. If AO4 is weakest, practise conditional judgements on extended responses.</span></div>
        <button className="secondary" onClick={resetExam}>Start another attempt</button>
      </section>
    )
  }

  return (
    <div className="exam-session-page" role="region" aria-label={`${exam.title} timed exam`}>
      <section className={`exam-simulator exam-session ${sessionOverlay ? 'exam-session-obscured' : ''}`} aria-labelledby="exam-simulator-heading" aria-hidden={sessionOverlay ? true : undefined}>
        <div className="exam-sticky-bar">
          <div><strong id="exam-simulator-heading">{exam.title}</strong><span>{answeredCount}/{exam.questions.length} answered</span></div>
          <div className="exam-session-controls">
            {!finishedWriting && <button className="exam-control" type="button" onClick={() => beginInterruption('paused')}>Pause</button>}
            {!finishedWriting && <button className="exam-control exam-control-stop" type="button" onClick={() => beginInterruption('stop-confirm')}>Stop exam</button>}
            <div className={secondsRemaining <= 600 ? 'timer warning' : 'timer'} aria-live="polite">{formatTime(secondsRemaining)}</div>
          </div>
        </div>

        {!finishedWriting ? (
          <>
            <details className="exam-case"><summary>Source/case material</summary><div dangerouslySetInnerHTML={{ __html: exam.caseHtml }} /></details>
            <nav className="question-nav" aria-label="Exam questions">
              {exam.questions.map((item, index) => <button key={item.id} className={index === questionIndex ? 'active' : ''} onClick={() => setQuestionIndex(index)}>{index + 1}<span>{item.marks}m</span></button>)}
            </nav>
            {question && (
              <article className="exam-question-sheet">
                <div className="practice-meta">Question {questionIndex + 1} of {exam.questions.length} · {question.marks} marks</div>
                <h3>{question.prompt}</h3>
                <label className="answer-label">Your answer
                  <textarea rows={14} value={answers[question.id] ?? ''} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))} placeholder="Write as you would in the exam." />
                </label>
                <div className="exam-nav-actions">
                  <button className="secondary" disabled={questionIndex === 0} onClick={() => setQuestionIndex((index) => index - 1)}>Previous</button>
                  {questionIndex < exam.questions.length - 1 && <button className="primary" onClick={() => setQuestionIndex((index) => index + 1)}>Next question</button>}
                  <button className="secondary" onClick={finishWriting}>Finish and self-mark</button>
                </div>
              </article>
            )}
          </>
        ) : (
          <div className="self-marking">
            <div className="activity-kind scored"><strong>Self-mark your paper</strong><span>Compare each answer with the supplied guidance, then award AO marks. Revision will show the derivation of your result and label it self-assessed.</span></div>
            <nav className="question-nav" aria-label="Questions to mark">
              {exam.questions.map((item, index) => <button key={item.id} className={index === questionIndex ? 'active' : ''} onClick={() => setQuestionIndex(index)}>{index + 1}<span>{item.marks}m</span></button>)}
            </nav>
            {question && (
              <article className="exam-question-sheet">
                <div className="practice-meta">Question {questionIndex + 1} · {question.marks} marks</div>
                <h3>{question.prompt}</h3>
                <div className="submitted-answer"><strong>Your answer</strong><p>{answers[question.id]?.trim() || 'No answer recorded.'}</p></div>
                <div className="mark-guidance"><strong>Marking guidance</strong><ul>{question.markingGuidance.map((line) => <li key={line}>{line}</li>)}</ul></div>
                <div className="ao-marker-grid">
                  {aoKeys.filter((key) => question.assessmentObjectives[key] > 0).map((key) => <label key={key}>{key.toUpperCase()} <span>/{question.assessmentObjectives[key]}</span><input type="number" min={0} max={question.assessmentObjectives[key]} value={currentMarks[key]} onChange={(event) => updateMark(key, Number(event.target.value))} /></label>)}
                </div>
                <div className="exam-nav-actions">
                  <button className="secondary" disabled={questionIndex === 0} onClick={() => setQuestionIndex((index) => index - 1)}>Previous</button>
                  {questionIndex < exam.questions.length - 1 && <button className="primary" onClick={() => setQuestionIndex((index) => index + 1)}>Next to mark</button>}
                </div>
              </article>
            )}
            <div className="exam-submit-summary"><strong>Current total: {totals.totalAwarded}/{exam.totalMarks}</strong><span>All marks are self-assessed.</span><button className="primary" disabled={saving} onClick={saveResult}>Save exam result</button></div>
            {saveError && <p className="error" role="alert">{saveError}</p>}
            {saving && <p className="muted" aria-live="polite">Saving your exam evidence…</p>}
          </div>
        )}
      </section>

      {sessionOverlay === 'paused' && (
        <div className="exam-interruption" role="dialog" aria-modal="true" aria-labelledby="exam-paused-title">
          <div className="exam-interruption-card exam-pause-card">
            <p className="eyebrow">Timer paused</p>
            <h2 id="exam-paused-title">Exam paused</h2>
            <p>Your exam is hidden while paused. The timer will continue only when you resume.</p>
            <button className="exam-resume-button" type="button" autoFocus onClick={resumeExam}>▶<span>Continue exam</span></button>
          </div>
        </div>
      )}

      {sessionOverlay === 'stop-confirm' && (
        <div className="exam-interruption" role="dialog" aria-modal="true" aria-labelledby="stop-exam-title">
          <div className="exam-interruption-card">
            <p className="eyebrow">Stop exam?</p>
            <h2 id="stop-exam-title">Are you sure?</h2>
            <p>Stopping will end this attempt and discard the answers from this unsaved exam.</p>
            <div className="exam-confirm-actions">
              <button className="danger" type="button" onClick={stopExam}>Yes, stop exam</button>
              <button className="primary" type="button" autoFocus onClick={resumeExam}>Continue exam</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
