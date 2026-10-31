import type { ReactNode } from 'react'
import type { AnswerConfidence } from '../engine/evidence/evidence'
import type { CalculationPracticeQuestion } from './practice-questions'
import type { HomeTask } from './home-task'
import { Button, Status } from './ui'

type Props = {
  task: HomeTask
  question: CalculationPracticeQuestion
  typedAnswer: string
  attemptConfidence: AnswerConfidence | null
  onTypedAnswer: (value: string) => void
  onCheck: (confidence: AnswerConfidence) => void
  result: { correct: boolean; typed: string } | null
  saving: boolean
  error: string
  completed: boolean
  completionPending: boolean
  onRetryCompletion: () => void
  finishedBooking: ReactNode
  backLabel: string
  onBack: () => void
  onFinish: () => void
}

/** One existing authored calculation: do not reveal its published answer until
 * the student's number has been scored and safely saved as evidence.
 */
export function HomeCalculationCheck({
  task, question, typedAnswer, attemptConfidence, onTypedAnswer, onCheck, result, saving, error,
  completed, completionPending, onRetryCompletion, finishedBooking,
  backLabel, onBack, onFinish,
}: Props) {
  const cannotCheck = (confidence: AnswerConfidence) => saving || completionPending || !typedAnswer.trim()
    || (attemptConfidence !== null && attemptConfidence !== confidence)
  return (
    <main className="dashboard screen-dashboard home-focused-activity" aria-labelledby="home-focused-activity-title" data-subject-accent={task.subjectAccent}>
      <Button variant="tertiary" className="home-focused-back" onClick={onBack}>Back to {backLabel}</Button>
      <section className="home-focused-card">
        <header className="home-focused-heading">
          <p className="eyebrow">{task.courseLabel} · Calculation recheck</p>
          <h1 id="home-focused-activity-title">{task.topicLabel}</h1>
          <p>This checks one final number, not your working or method.</p>
        </header>
        {error && <Status tone="error">{error}</Status>}
        <div className="home-focused-practice">
          <h2>{question.prompt}</h2>
          {question.context && <p>{question.context}</p>}
          {question.table && <div className="home-focused-answer"><strong>{question.table.title}</strong>
            <table><thead><tr>{question.table.columns.map((column, index) => <th key={index} scope="col">{column}</th>)}</tr></thead>
              <tbody>{question.table.rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table>
          </div>}
          {!result ? (
            <>
              <label htmlFor="home-calculation-entry">Your final number {question.unit ? `(${question.unit})` : ''}</label>
              <input id="home-calculation-entry" value={typedAnswer} onChange={event => onTypedAnswer(event.currentTarget.value)}
                inputMode="decimal" autoComplete="off" disabled={saving || completionPending || attemptConfidence !== null} />
              {attemptConfidence && !saving
                ? <p role="status">The first save was not confirmed. Retry the same answer and confidence to protect your recorded progress.</p>
                : <p>How sure are you? Choose your confidence to check and save this answer.</p>}
              <div className="home-focused-actions">
                <Button variant="secondary" disabled={cannotCheck('guess')} onClick={() => onCheck('guess')}>Guessing</Button>
                <Button variant="secondary" disabled={cannotCheck('fairly')} onClick={() => onCheck('fairly')}>Fairly sure</Button>
                <Button disabled={cannotCheck('certain')} onClick={() => onCheck('certain')}>Certain</Button>
              </div>
            </>
          ) : (
            <div className="home-focused-result" role="status">
              <p className="eyebrow">Answer saved</p>
              <h3>{result.correct ? 'Correct final number' : 'Not the expected final number'}</h3>
              <p>Your answer: {result.typed}. Published answer: {question.answerText}.</p>
              {question.workings && <div className="home-focused-answer"><strong>Worked answer</strong><p>{question.workings}</p></div>}
              {completed && <p>This single result does not establish mastery or verify your working.</p>}
              {finishedBooking}
              {completed && <Button onClick={onFinish}>Back to today’s plan</Button>}
            </div>
          )}
          {completionPending && <Button disabled={saving} onClick={onRetryCompletion}>Retry confirming Plan completion</Button>}
        </div>
      </section>
    </main>
  )
}
