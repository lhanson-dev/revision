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
  const { prompt, options, locked, onPick, showConfidence, onConfidence, busy } = props
  return (
    <div className="practice-question">
      <QuestionHead {...props} />

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

      {showConfidence && !locked && <ConfidenceRow busy={busy} onConfidence={onConfidence} />}
    </div>
  )
}

type QuestionHeadProps = Pick<PracticeQuestionViewProps, 'eyebrow' | 'level' | 'marksLabel' | 'sourceChip' | 'levelNote' | 'context' | 'table'>

/** The meta row (question number, level, marks, source), then the context and table above the prompt. */
export function QuestionHead({ eyebrow, level, marksLabel, sourceChip, levelNote, context, table }: QuestionHeadProps) {
  return (
    <>
      <div className="practice-activity__meta">
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
    </>
  )
}

/** "How sure are you?". Choosing one checks the answer. */
export function ConfidenceRow({ busy, onConfidence }: { busy?: boolean; onConfidence: (confidence: AnswerConfidence) => void }) {
  return (
    <div className="practice-confidence" role="group" aria-labelledby="practice-confidence-label">
      <span className="practice-confidence__label" id="practice-confidence-label">How sure are you?</span>
      <div className="practice-confidence__choices">
        {confidenceChoices.map((choice) => (
          <button key={choice.value} type="button" className="practice-confidence__button" disabled={busy} onClick={() => onConfidence(choice.value)}>{choice.label}</button>
        ))}
      </div>
      <span className="practice-confidence__hint">Choosing one checks your answer.</span>
    </div>
  )
}

export interface PracticeCalculationViewProps extends QuestionHeadProps {
  prompt: string
  /** What the student has typed. */
  answer: string
  onAnswerChange: (value: string) => void
  /** The unit to show beside the box, e.g. "£m" or "%". Null for none. */
  unitLabel: string | null
  /** After checking: whether it was right. Null while answering. */
  result: 'right' | 'wrong' | null
  locked: boolean
  showConfidence: boolean
  onConfidence: (confidence: AnswerConfidence) => void
  /** "I couldn't read a number there", shown under the box. */
  error?: string | null
  busy?: boolean
}

/**
 * A calculation in the Practice pop-up: the prompt, a box for one number with its unit, then "How sure are you?" once
 * there is something typed. Choosing how sure you are checks the answer, the same as a multiple-choice question.
 */
export function PracticeCalculationView(props: PracticeCalculationViewProps) {
  const { prompt, answer, onAnswerChange, unitLabel, result, locked, showConfidence, onConfidence, error, busy } = props
  return (
    <div className="practice-question">
      <QuestionHead {...props} />
      <fieldset className="practice-question__set">
        <legend className="practice-question__prompt">{prompt}</legend>
        <div className={`practice-calc${result ? ` practice-calc--${result}` : ''}`}>
          <label className="practice-calc__label" htmlFor="practice-calc-input">Your answer</label>
          <div className="practice-calc__row">
            <input
              id="practice-calc-input"
              className="practice-calc__input"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              value={answer}
              disabled={locked || busy}
              onChange={(event) => onAnswerChange(event.target.value)}
              aria-describedby="practice-calc-hint"
            />
            {unitLabel && <span className="practice-calc__unit">{unitLabel}</span>}
            {result && <span className="practice-calc__result"><Icon name={result === 'right' ? 'check' : 'close'} size="inline" />{result === 'right' ? 'Correct' : 'Not quite'}</span>}
          </div>
          <span className="practice-calc__hint" id="practice-calc-hint">Work it out, then type just the number. Your working is not marked here.</span>
          {error && <span className="practice-calc__error" role="alert">{error}</span>}
        </div>
      </fieldset>
      {showConfidence && !locked && <ConfidenceRow busy={busy} onConfidence={onConfidence} />}
    </div>
  )
}
