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
  const startedAt = useRef<number | null>(null)

  const question = exam.questions[questionIndex]
  const answeredCount = exam.questions.filter((item) => answers[item.id]?.trim()).length
  const currentMarks = question ? marks[question.id] ?? emptyMarks() : emptyMarks()

  useEffect(() => {
    if (!started || finishedWriting) return
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
  }, [started, finishedWriting])

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
    setStarted(true)
    startedAt.current = Date.now()
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
    const durationMinutes = startedAt.current
      ? Math.min(exam.durationMinutes, Math.max(0, (Date.now() - startedAt.current) / 60_000))
      : exam.durationMinutes

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
    setStarted(false)
    setFinishedWriting(false)
    setSubmitted(false)
    setQuestionIndex(0)
    setAnswers({})
    setMarks({})
    setSecondsRemaining(exam.durationMinutes * 60)
    setResult(null)
    setSubmissionIds({})
    startedAt.current = null
  }

  if (!started) {
    return (
      <section className="exam-simulator" aria-labelledby="full-exam-heading">
        <p className="eyebrow">Simulate the exam</p>
        <h2 id="full-exam-heading">Full {exam.durationMinutes}-minute Paper 2</h2>
        <p className="intro">This is the closest Revision practice to the real paper: {exam.totalMarks} marks, the full Harbour Home case and all {exam.questions.length} questions under a running timer.</p>
        <div className="activity-kind scored"><strong>What am I trying to improve?</strong><span>Applying knowledge across a complete paper, managing time, and sustaining analysis and judgement. Your final marks are self-assessed, so they inform readiness but cannot create high confidence on their own.</span></div>
        <button className="primary" onClick={startExam}>Start timed exam</button>
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
        <div className="next-step"><strong>What should I do next?</strong><span>Use the weakest AO above to choose your next practice. If AO2/AO3 is weakest, return to case and exam questions. If AO4 is weakest, practise conditional judgements on the 16- and 20-mark questions.</span></div>
        <button className="secondary" onClick={resetExam}>Start another attempt</button>
      </section>
    )
  }

  return (
    <section className="exam-simulator" aria-labelledby="exam-simulator-heading">
      <div className="exam-sticky-bar">
        <div><strong id="exam-simulator-heading">{exam.title}</strong><span>{answeredCount}/{exam.questions.length} answered</span></div>
        <div className={secondsRemaining <= 600 ? 'timer warning' : 'timer'} aria-live="polite">{formatTime(secondsRemaining)}</div>
      </div>

      {!finishedWriting ? (
        <>
          <details className="exam-case"><summary>Case study material</summary><div dangerouslySetInnerHTML={{ __html: exam.caseHtml }} /></details>
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
  )
}
