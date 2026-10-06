import { Icon } from '../Icon'
import type { AnswerConfidence } from '../../../engine/evidence/evidence'

export type PracticeOptionState = 'idle' | 'selected' | 'correct' | 'wrong'

export interface PracticeQuestionViewProps {
  /** "Question 3", or the retry label. */
  eyebrow: string
  level: string
  marksLabel: string
  /** A short neutral chip saying where the question comes from, e.g. "AQA-style practice". */
  sourceChip?: string | null
  /** "Stepping up: you got the last 2 right." or "Same level, so you can steady it." */
  levelNote?: string | null
  context?: string | null
  table?: { title?: string; columns: readonly string[]; rows: readonly (readonly string[])[] } | null
  prompt: string
  options: ReadonlyArray<{ text: string; state: PracticeOptionState }>
  /** Once the answer is checked, the options stop taking clicks. */
  locked: boolean
  onPick: (index: number) => void
  /** "How sure are you?" appears once an answer is picked and until it is checked. */
  showConfidence: boolean
  onConfidence: (confidence: AnswerConfidence) => void
  busy?: boolean
}

export const confidenceChoices: ReadonlyArray<{ value: AnswerConfidence; label: string }> = [
  { value: 'guess', label: 'Guessing' },
  { value: 'fairly', label: 'Fairly sure' },
  { value: 'certain', label: 'Certain' },
]

/**
 * One scored question in the Practice pop-up (v2.2): meta row, context, prompt, answer options, and "How sure are you?".
 * Choosing how sure you are is what checks the answer; there is no separate Check button.
 */
export function PracticeQuestionView(props: PracticeQuestionViewProps) {
  const { eyebrow, level, marksLabel, sourceChip, levelNote, context, table, prompt, options, locked, onPick, showConfidence, onConfidence, busy } = props
  return (
    <div className="practice-question">
      <div className="practice-dialog__meta">
        <span className="ui-eyebrow">{eyebrow}</span>
        <span className="practice-chip">{level}</span>
        <span className="practice-chip">{marksLabel}</span>
        {sourceChip && <span className="practice-chip">{sourceChip}</span>}
        {levelNote && <span className="practice-question__note">{levelNote}</span>}
      </div>

      {(context || table) && (
        <div className="practice-question__context">
          {context && <p>{context}</p>}
          {table && (
            <div className="practice-table">
              <table>
                {table.title && <caption>{table.title}</caption>}
                <thead><tr>{table.columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead>
                <tbody>{table.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <fieldset className="practice-question__set">
        <legend className="practice-question__prompt">{prompt}</legend>
        <div className="practice-question__options" role="group" aria-label="Answers">
          {options.map((option, index) => (
            <button
              key={index}
              type="button"
              className={`ui-answer-option ui-answer-option--${option.state}`}
              aria-pressed={option.state === 'selected'}
              disabled={locked || busy}
              onClick={() => onPick(index)}
            >
              <span className="ui-answer-option__letter" aria-hidden="true">
                {option.state === 'correct' ? <Icon name="check" size="inline" /> : option.state === 'wrong' ? <Icon name="close" size="inline" /> : 'ABCDEF'[index]}
              </span>
              <span className="ui-answer-option__text">{option.text}</span>
              {option.state === 'correct' && <span className="ui-answer-option__note">Correct answer</span>}
              {option.state === 'wrong' && <span className="ui-answer-option__note">Your answer</span>}
            </button>
          ))}
        </div>
      </fieldset>

      {showConfidence && !locked && (
        <div className="practice-confidence" role="group" aria-labelledby="practice-confidence-label">
          <span className="practice-confidence__label" id="practice-confidence-label">How sure are you?</span>
          <div className="practice-confidence__choices">
            {confidenceChoices.map((choice) => (
              <button key={choice.value} type="button" className="practice-confidence__button" disabled={busy} onClick={() => onConfidence(choice.value)}>{choice.label}</button>
            ))}
          </div>
          <span className="practice-confidence__hint">Choosing one checks your answer.</span>
        </div>
      )}
    </div>
  )
}
