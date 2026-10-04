import { useMemo, useState } from 'react'
import { aqaBusinessQuestionBank } from '../../content/business/aqa-a-level/shared/fast-path-questions'
import { Button, SelectField, TextAreaField } from './ui'

const batchLabels: Record<string, string> = {
  '3.1-3.2': 'Business & decision making',
  '3.3': 'Marketing',
  '3.4': 'Operations',
  '3.5': 'Finance',
  '3.5-topup': 'Finance · additional practice',
  '3.6': 'Human resources',
  '3.7': 'Strategic position',
  '3.8-3.9': 'Strategic direction & methods',
  '3.10': 'Managing strategic change',
}

function textOf(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (Array.isArray(value)) return value.map(textOf).filter(Boolean).join(' · ')
  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).map(textOf).filter(Boolean).join(' · ')
  }
  return ''
}

export function AqaBusinessQuestionBank() {
  const batches = useMemo(() => [...new Set(aqaBusinessQuestionBank.map((item) => item.batch))], [])
  const [batch, setBatch] = useState(batches[0] ?? '')
  const [index, setIndex] = useState(0)
  const [draft, setDraft] = useState('')
  const [showGuidance, setShowGuidance] = useState(false)
  const questions = useMemo(() => aqaBusinessQuestionBank.filter((item) => item.batch === batch), [batch])
  const record = questions[index % Math.max(questions.length, 1)]
  const question = record?.question

  function reset(nextBatch?: string) {
    if (nextBatch) setBatch(nextBatch)
    setIndex(0)
    setDraft('')
    setShowGuidance(false)
  }

  function next() {
    setIndex((current) => current + 1)
    setDraft('')
    setShowGuidance(false)
  }

  if (!record || !question) return null

  const guidance = [
    ...(question.mark_scheme.option_rationale ?? []),
    ...(question.mark_scheme.points ?? []).map(textOf),
    ...(question.mark_scheme.levels ?? []).map(textOf),
    ...(question.mark_scheme.indicative_content ?? []).map(textOf),
  ].filter(Boolean)

  return (
    <section className="learn-panel" aria-labelledby="aqa-style-bank-heading">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">AQA-style practice</p>
          <h2 id="aqa-style-bank-heading">Practise with 245 assured exam-style questions</h2>
          <p className="muted">Revision-authored practice based on the AQA 7132 course and exam requirements. These are not AQA questions. Extended-response marking guidance is indicative rather than an official exact mark.</p>
        </div>
        <SelectField label="Course area" value={batch} onChange={(event) => reset(event.target.value)}>
          {batches.map((value) => <option key={value} value={value}>{batchLabels[value] ?? value}</option>)}
        </SelectField>
      </div>

      <article className="written-practice exam-practice">
        <div className="practice-meta">
          {batchLabels[record.batch] ?? record.batch} · Question {(index % questions.length) + 1} of {questions.length} · {question.marks} {question.marks === 1 ? 'mark' : 'marks'} · {question.command_word} · {question.family}
        </div>
        {question.context && <p>{question.context}</p>}
        {question.table && (
          <div className="table-wrap">
            {question.table.title && <p><strong>{question.table.title}</strong></p>}
            <table>
              <thead><tr>{question.table.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
              <tbody>{question.table.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.cells.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
        )}
        <h3>{question.stem}</h3>
        {question.options.length > 0 && <ol type="A">{question.options.map((option) => <li key={option.label}>{option.text}</li>)}</ol>}
        <TextAreaField groupClassName="answer-label" label="Write your answer" rows={10} value={draft} disabled={showGuidance} onChange={(event) => setDraft(event.target.value)} placeholder="Answer as you would in the exam. Show calculations where relevant." />
        <p className="muted small-note">Your draft stays on this screen. It is not saved as scored readiness evidence.</p>

        {!showGuidance ? (
          <Button className="primary" disabled={!draft.trim()} onClick={() => setShowGuidance(true)}>Show marking guidance</Button>
        ) : (
          <>
            <div className="answer-panel">
              <strong>Marking guidance</strong>
              {question.mark_scheme.correct_option && <p>Correct option: {question.mark_scheme.correct_option}</p>}
              {guidance.length > 0 && <ul>{guidance.map((item, guidanceIndex) => <li key={guidanceIndex}>{item}</li>)}</ul>}
              {question.mark_scheme.model_answer && <><strong>Illustrative answer</strong><p>{question.mark_scheme.model_answer}</p></>}
            </div>
            <Button className="primary" onClick={next}>Next question</Button>
          </>
        )}
      </article>
    </section>
  )
}
