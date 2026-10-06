import { useEffect, useMemo, useRef, useState } from 'react'
import type { Exam } from '../../content/schema'
import type { LearningEvidence } from '../engine/evidence/evidence'
import { createSelfAssessedExamQuestionEvidence } from './practice-evidence'
import { Icon, ModalShell } from './ui'

type AoKey = 'ao1' | 'ao2' | 'ao3' | 'ao4'
type Marks = Record<AoKey, number>
type ExamQuestion = Exam['questions'][number]
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

export function timeNoticeFor(secondsRemaining: number): string {
  if (secondsRemaining <= 0) return ''
  if (secondsRemaining <= 60) return 'Under 1 minute left.'
  if (secondsRemaining <= 300) return 'Under 5 minutes left.'
  if (secondsRemaining <= 600) return 'Under 10 minutes left.'
  return ''
}

export function questionState(input: { answered: boolean; flagged: boolean; current: boolean; selected?: boolean }): string {
  const parts = [input.answered ? 'answered' : 'not answered']
  if (input.selected === false) parts.push('not selected for this attempt')
  if (input.flagged) parts.push('flagged for review')
  if (input.current) parts.push('current question')
  return parts.join(', ')
}

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

function ExamTable({ table }: { table: NonNullable<ExamQuestion['table']> }) {
  return (
    <div className="exam-data-table-wrap">
      <table className="exam-data-table">
        <caption>{table.title}</caption>
        <thead><tr>{table.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead>
        <tbody>{table.rows.map((row, index) => <tr key={index}>{row.cells.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  )
}

function QuestionMaterial({ exam, question }: { exam: Exam; question: ExamQuestion }) {
  const sources = (exam.sources ?? []).filter((source) => question.sourceIds?.includes(source.id))
  if (!question.context && !question.table && sources.length === 0) return null
  return (
    <div className="exam-question-material">
      {sources.map((source) => (
        <details className="exam-case" key={source.id} open>
          <summary>{source.title}</summary>
          {source.businessName && <p><strong>{source.businessName}</strong></p>}
          {source.narrative.split(/\n\n+/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {source.table && <ExamTable table={source.table} />}
        </details>
      ))}
      {question.context && <div className="exam-local-context"><strong>Question context</strong><p>{question.context}</p></div>}
      {question.table && <ExamTable table={question.table} />}
    </div>
  )
}

function AnswerInput({ question, value, disabled = false, onChange }: {
  question: ExamQuestion
  value: string
  disabled?: boolean
  onChange: (value: string) => void
}) {
  if (question.family === 'MCQ' && question.options?.length) {
    return (
      <fieldset className="exam-mcq-options" disabled={disabled}>
        <legend>Your answer</legend>
        {question.options.map((option) => (
          <label key={option.label}>
            <input type="radio" name={`answer-${question.id}`} value={option.label} checked={value === option.label} onChange={() => onChange(option.label)} />
            <span><strong>{option.label}</strong> {option.text}</span>
          </label>
        ))}
      </fieldset>
    )
  }

  return (
    <label className="answer-label">Your answer
      <textarea rows={14} disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} placeholder="Write as you would in the exam." />
    </label>
  )
}

function submittedAnswer(question: ExamQuestion, answer: string | undefined) {
  if (!answer?.trim()) return 'No answer recorded.'
  const option = question.options?.find((candidate) => candidate.label === answer)
  return option ? `${option.label}. ${option.text}` : answer
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
  const [flagged, setFlagged] = useState<Record<string, boolean>>({})
  const [choiceSelections, setChoiceSelections] = useState<Record<string, string>>({})
  const [choiceError, setChoiceError] = useState('')
  const startedAt = useRef<number | null>(null)
  const pauseStartedAt = useRef<number | null>(null)
  const totalPausedMs = useRef(0)

  const question = exam.questions[questionIndex]
  const practiceQuestion = exam.questions[practiceIndex]
  const choiceGroups = useMemo(() => [...new Set(exam.questions.flatMap((item) => item.choiceGroup ? [item.choiceGroup] : []))], [exam.questions])
  const attemptedIndexes = useMemo(() => exam.questions.flatMap((item, index) => (!item.choiceGroup || choiceSelections[item.choiceGroup] === item.id) ? [index] : []), [exam.questions, choiceSelections])
  const attemptedQuestions = attemptedIndexes.map((index) => exam.questions[index]).filter((item): item is ExamQuestion => Boolean(item))
  const expectedAttemptedQuestionCount = exam.questions.filter((item) => !item.choiceGroup).length + choiceGroups.length
  const answeredCount = attemptedQuestions.filter((item) => answers[item.id]?.trim()).length
  const unansweredNumbers = attemptedIndexes.flatMap((index) => answers[exam.questions[index]?.id ?? '']?.trim() ? [] : [index + 1])
  const flaggedNumbers = attemptedIndexes.flatMap((index) => flagged[exam.questions[index]?.id ?? ''] ? [index + 1] : [])
  const currentMarks = question ? marks[question.id] ?? emptyMarks() : emptyMarks()
  const practiceTotal = aoKeys.reduce((sum, key) => sum + practiceMarks[key], 0)
  const pLabel = paperLabel(exam)
  const missingChoiceGroups = choiceGroups.filter((group) => !choiceSelections[group])
  const hasStructuredMaterial = Boolean(exam.sources?.length || exam.questions.some((item) => item.context || item.table))

  useEffect(() => {
    if (!started || finishedWriting || sessionOverlay) return
    const interval = window.setInterval(() => {
      setSecondsRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(interval)
          if (missingChoiceGroups.length) {
            setChoiceSelections((selected) => {
              const next = { ...selected }
              for (const group of missingChoiceGroups) {
                const fallback = exam.questions.find((item) => item.choiceGroup === group)
                if (fallback) next[group] = fallback.id
              }
              return next
            })
          }
          setFinishedWriting(true)
          return 0
        }
        return current - 1
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [exam.questions, finishedWriting, missingChoiceGroups, sessionOverlay, started])

  const totals = useMemo(() => {
    const ao = Object.fromEntries(aoKeys.map((key) => [key, { awarded: 0, available: 0 }])) as ExamResult['ao']
    let totalAwarded = 0
    for (const item of attemptedQuestions) {
      const awarded = marks[item.id] ?? emptyMarks()
      for (const key of aoKeys) {
        ao[key].awarded += awarded[key]
        ao[key].available += item.assessmentObjectives[key]
        totalAwarded += awarded[key]
      }
    }
    return { ao, totalAwarded }
  }, [attemptedQuestions, marks])

  function selectQuestion(index: number) {
    const selected = exam.questions[index]
    if (!selected) return
    if (selected.choiceGroup) {
      setChoiceSelections((current) => ({ ...current, [selected.choiceGroup!]: selected.id }))
      setChoiceError('')
    }
    setQuestionIndex(index)
  }

  function startExam() {
    setQuestionPractice(false)
    setStarted(true)
    setChoiceSelections({})
    setChoiceError('')
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
    setFlagged({})
    setChoiceSelections({})
    setChoiceError('')
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
    if (missingChoiceGroups.length) {
      const group = missingChoiceGroups[0]
      const index = exam.questions.findIndex((item) => item.choiceGroup === group)
      setChoiceError(`Choose one question from ${group} before finishing the paper.`)
      if (index >= 0) setQuestionIndex(index)
      return
    }
    if (!attemptedIndexes.includes(questionIndex)) setQuestionIndex(attemptedIndexes[0] ?? 0)
    setFinishedWriting(true)
  }

  function buildSubmissionIds() {
    if (Object.keys(submissionIds).length) return submissionIds
    const ids: Record<string, string> = { attempt: attemptId('exam-attempt') }
    attemptedQuestions.forEach((item) => { ids[item.id] = attemptId('exam-question') })
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
      for (const item of attemptedQuestions) {
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
        topicId: attemptedQuestions[0]?.topic ?? 'business',
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
        <QuestionMaterial exam={exam} question={practiceQuestion} />
        <h3>{practiceQuestion.prompt}</h3>
        <AnswerInput question={practiceQuestion} disabled={practiceSaved} value={practiceDraft} onChange={setPracticeDraft} />
        {!practiceGuidance ? (
          <button className="primary" disabled={!practiceDraft.trim()} onClick={() => setPracticeGuidance(true)}>Show marking guidance</button>
        ) : (
          <>
            <div className="mark-guidance"><strong>Revision marking guidance</strong><span>Revision-authored; not an official AQA mark scheme.</span><ul>{practiceQuestion.markingGuidance.map((line, index) => <li key={index}>{line}</li>)}</ul></div>
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
        <p className="eyebrow">{pLabel === 'exam' ? 'Exam practice' : `${pLabel} exam practice`}</p>
        <h2 id={`full-exam-${exam.id}`}>Full {exam.durationMinutes}-minute {pLabel}</h2>
        {exam.learnerClaim && <p className="exam-learner-claim">{exam.learnerClaim}</p>}
        <p className="intro">{exam.title}. {exam.printedMarks && exam.printedMarks !== exam.totalMarks ? `${exam.printedMarks} marks are printed; you attempt ${exam.totalMarks} marks by following the choice instructions.` : `Attempt ${exam.totalMarks} marks.`} Use the running timer, or work on one question first.</p>
        <div className="activity-kind scored"><strong>What am I trying to improve?</strong><span>Applying knowledge in this paper’s format, managing time, and sustaining analysis and judgement. Marks are self-assessed, so they inform readiness but cannot create high confidence on their own.</span></div>
        <div className="inline-actions"><button className="secondary" onClick={startQuestionPractice}>Practise one question</button><button className="primary" aria-label="Start timed exam" onClick={startExam}>Open timed exam</button></div>
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
        <p>Your result is based on the AO marks you awarded yourself after comparing each answer with Revision marking guidance. It is useful evidence, but it is not independently marked and is not an official AQA result.</p>
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

  const markingPosition = attemptedIndexes.indexOf(questionIndex)
  return (
    <div className="exam-session-page" role="region" aria-label={`${exam.title} timed exam`}>
      <section className={`exam-simulator exam-session ${sessionOverlay ? 'exam-session-obscured' : ''}`} aria-labelledby="exam-simulator-heading" aria-hidden={sessionOverlay ? true : undefined}>
        <div className="exam-sticky-bar">
          <div><strong id="exam-simulator-heading">{exam.title}</strong><span>{answeredCount}/{expectedAttemptedQuestionCount} attempted questions answered · {exam.totalMarks} marks to attempt</span></div>
          <div className="exam-session-controls">
            {!finishedWriting && <button className="exam-control" type="button" onClick={() => beginInterruption('paused')}>Pause</button>}
            {!finishedWriting && <button className="exam-control exam-control-stop" type="button" onClick={() => beginInterruption('stop-confirm')}>Stop exam</button>}
            <div className={secondsRemaining <= 600 ? 'timer warning' : 'timer'}>
              {secondsRemaining <= 600 && <Icon name="clock" size="inline" />}
              <span>{formatTime(secondsRemaining)}</span>
              {secondsRemaining <= 600 && <small className="timer-note">Under 10 min</small>}
            </div>
            <p className="exam-time-notice" role="status" aria-live="polite">{started && !finishedWriting ? timeNoticeFor(secondsRemaining) : ''}</p>
          </div>
        </div>

        {exam.learnerClaim && <p className="exam-session-claim">{exam.learnerClaim}</p>}

        {!finishedWriting ? (
          <>
            {!hasStructuredMaterial && <details className="exam-case"><summary>Source/case material</summary><div dangerouslySetInnerHTML={{ __html: exam.caseHtml }} /></details>}
            <nav className="question-nav question-grid" aria-label="Exam questions">
              {exam.questions.map((item, index) => {
                const selected = !item.choiceGroup || choiceSelections[item.choiceGroup] === item.id
                const answered = Boolean(answers[item.id]?.trim())
                const isFlagged = Boolean(flagged[item.id])
                const current = index === questionIndex
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`${current ? 'active' : ''}${answered ? ' answered' : ''}${isFlagged ? ' flagged' : ''}${item.choiceGroup && selected ? ' choice-selected' : ''}`.trim()}
                    aria-current={current ? 'true' : undefined}
                    aria-pressed={item.choiceGroup ? selected : undefined}
                    aria-label={`Question ${index + 1}, ${item.marks} marks, ${questionState({ answered, flagged: isFlagged, current, selected })}`}
                    onClick={() => selectQuestion(index)}
                  >
                    <b>{index + 1}</b>
                    <span>{item.marks}m</span>
                    <i aria-hidden="true">{isFlagged ? <Icon name="flag" size="inline" /> : answered ? <Icon name="check" size="inline" /> : null}</i>
                  </button>
                )
              })}
            </nav>
            <p className="question-grid-key" aria-hidden="true"><span><Icon name="check" size="inline" /> Answered</span><span><Icon name="flag" size="inline" /> Flagged</span><span className="question-grid-key-current">Current: dark</span>{choiceGroups.length > 0 && <span>Choice: select one alternative in each choice section</span>}</p>
            {question && (
              <article className="exam-question-sheet">
                <div className="practice-meta">Question {questionIndex + 1} of {exam.questions.length} · {question.marks} marks{question.choiceGroup ? ` · Choice ${question.choiceGroup}` : ''}</div>
                {question.choiceGroup && <div className="exam-choice-note" role="status">{choiceSelections[question.choiceGroup] === question.id ? 'Selected for this attempt.' : 'Opening this question selects it instead of the other alternative in this choice section.'}</div>}
                <QuestionMaterial exam={exam} question={question} />
                <h3>{question.prompt}</h3>
                <AnswerInput question={question} value={answers[question.id] ?? ''} onChange={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))} />
                {question.family !== 'MCQ' && <p className="exam-word-count">{(answers[question.id] ?? '').trim() ? (answers[question.id] ?? '').trim().split(/\s+/).length : 0} words</p>}
                <button type="button" className="exam-flag-toggle" aria-pressed={Boolean(flagged[question.id])} onClick={() => setFlagged((current) => ({ ...current, [question.id]: !current[question.id] }))}>
                  <Icon name="flag" size="inline" />{flagged[question.id] ? 'Flagged for review (tap to remove)' : 'Flag for review'}
                </button>
                {(unansweredNumbers.length > 0 || flaggedNumbers.length > 0 || missingChoiceGroups.length > 0) && (
                  <p className="exam-finish-check">
                    Before you finish:
                    {unansweredNumbers.length > 0 && <> not answered: question {unansweredNumbers.join(', ')}.</>}
                    {flaggedNumbers.length > 0 && <> flagged: question {flaggedNumbers.join(', ')}.</>}
                    {missingChoiceGroups.length > 0 && <> choose one question from {missingChoiceGroups.join(' and ')}.</>}
                  </p>
                )}
                {choiceError && <p className="error" role="alert">{choiceError}</p>}
                <div className="exam-nav-actions">
                  <button className="secondary" disabled={questionIndex === 0} onClick={() => selectQuestion(questionIndex - 1)}>Previous</button>
                  {questionIndex < exam.questions.length - 1 && <button className="primary" onClick={() => selectQuestion(questionIndex + 1)}>Next question</button>}
                  <button className="secondary" onClick={finishWriting}>Finish and self-mark</button>
                </div>
              </article>
            )}
          </>
        ) : (
          <div className="self-marking">
            <div className="activity-kind scored"><strong>Self-mark your paper</strong><span>Compare each attempted answer with Revision marking guidance, then award AO marks. This guidance is Revision-authored and is not an official AQA mark scheme.</span></div>
            <nav className="question-nav" aria-label="Questions to mark">
              {attemptedIndexes.map((index) => {
                const item = exam.questions[index]
                if (!item) return null
                return <button key={item.id} className={index === questionIndex ? 'active' : ''} onClick={() => setQuestionIndex(index)}>{index + 1}<span>{item.marks}m</span></button>
              })}
            </nav>
            {question && attemptedIndexes.includes(questionIndex) && (
              <article className="exam-question-sheet">
                <div className="practice-meta">Question {questionIndex + 1} · {question.marks} marks</div>
                <QuestionMaterial exam={exam} question={question} />
                <h3>{question.prompt}</h3>
                <div className="submitted-answer"><strong>Your answer</strong><p>{submittedAnswer(question, answers[question.id])}</p></div>
                <div className="mark-guidance"><strong>Revision marking guidance</strong><span>Revision-authored; not an official AQA mark scheme.</span><ul>{question.markingGuidance.map((line, index) => <li key={index}>{line}</li>)}</ul></div>
                <div className="ao-marker-grid">
                  {aoKeys.filter((key) => question.assessmentObjectives[key] > 0).map((key) => <label key={key}>{key.toUpperCase()} <span>/{question.assessmentObjectives[key]}</span><input type="number" min={0} max={question.assessmentObjectives[key]} value={currentMarks[key]} onChange={(event) => updateMark(key, Number(event.target.value))} /></label>)}
                </div>
                <div className="exam-nav-actions">
                  <button className="secondary" disabled={markingPosition <= 0} onClick={() => setQuestionIndex(attemptedIndexes[markingPosition - 1] ?? questionIndex)}>Previous</button>
                  {markingPosition >= 0 && markingPosition < attemptedIndexes.length - 1 && <button className="primary" onClick={() => setQuestionIndex(attemptedIndexes[markingPosition + 1] ?? questionIndex)}>Next to mark</button>}
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
        <div className="exam-interruption">
          <ModalShell className="exam-interruption-card exam-pause-card" labelledBy="exam-paused-title" onDismiss={resumeExam} initialFocusSelector=".exam-resume-button">
            <p className="eyebrow">Timer paused</p>
            <h2 id="exam-paused-title">Exam paused</h2>
            <p>Your exam is hidden while paused. The timer will continue only when you resume.</p>
            <button className="exam-resume-button" type="button" onClick={resumeExam}><Icon name="play" size="compact" /><span>Continue exam</span></button>
          </ModalShell>
        </div>
      )}

      {sessionOverlay === 'stop-confirm' && (
        <div className="exam-interruption">
          <ModalShell className="exam-interruption-card" labelledBy="stop-exam-title" onDismiss={resumeExam} initialFocusSelector=".exam-confirm-actions .primary">
            <p className="eyebrow">Stop exam?</p>
            <h2 id="stop-exam-title">Are you sure?</h2>
            <p>Stopping will end this attempt and discard the answers from this unsaved exam.</p>
            <div className="exam-confirm-actions">
              <button className="danger" type="button" onClick={stopExam}>Yes, stop exam</button>
              <button className="primary" type="button" onClick={resumeExam}>Continue exam</button>
            </div>
          </ModalShell>
        </div>
      )}
    </div>
  )
}
