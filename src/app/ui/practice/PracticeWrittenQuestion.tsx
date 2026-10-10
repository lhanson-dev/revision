import { RevPresence } from '../../RevPresence'
import { Button } from '../controls'
import { Icon } from '../Icon'
import { RevMark } from '../RevMark'
import { REV_CHALLENGE_MAX_LENGTH } from '../../../engine/evidence/evidence'

export type WrittenPhase = 'writing' | 'marking' | 'marked'

export interface WrittenResultView {
  got: number
  available: number
  points: ReadonlyArray<{ descriptor: string; given: boolean }>
  /** One specific note on how to earn the missing mark. */
  note: string
}

export interface WrittenChallengeView {
  /** `closed` shows the button, `open` the box, `sending` waits for REV, `replied` shows REV's answer (one challenge per answer). */
  state: 'closed' | 'open' | 'sending' | 'replied'
  text: string
  reply: string | null
  error: string | null
}

export interface PracticeWrittenQuestionProps {
  eyebrow: string
  level: string
  marksLabel: string
  sourceChip?: string | null
  levelNote?: string | null
  context?: string | null
  table?: { title?: string; columns: readonly string[]; rows: readonly (readonly string[])[] } | null
  prompt: string
  pointCount: number
  answer: string
  onAnswerChange: (text: string) => void
  phase: WrittenPhase
  onMark: () => void
  /** REV could not mark just now. The answer is still on screen. */
  markingError: string | null
  result: WrittenResultView | null
  challenge: WrittenChallengeView
  onChallengeOpen: () => void
  onChallengeText: (text: string) => void
  onChallengeSend: () => void
  onChallengeCancel: () => void
  nextLabel: string
  onNext: () => void
}

/**
 * A written answer in the focused Practice activity: a text box, "Ask REV to mark it", REV's thinking state, then a deep card
 * with one row per mark point, one note on how to earn the missing mark, and a way to challenge a mark.
 * REV's marking is a guide, not an exam board mark, and the card says so.
 */
export function PracticeWrittenQuestion(props: PracticeWrittenQuestionProps) {
  const { eyebrow, level, marksLabel, sourceChip, levelNote, context, table, prompt, pointCount, answer, onAnswerChange, phase, onMark, markingError, result, challenge, onChallengeOpen, onChallengeText, onChallengeSend, onChallengeCancel, nextLabel, onNext } = props
  const locked = phase !== 'writing'
  return (
    <div className="practice-question">
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

      <h2 className="practice-question__prompt practice-question__prompt--written">{prompt}</h2>

      <div className="practice-written">
        <label className="practice-written__label" htmlFor="practice-written-answer">Your answer</label>
        <textarea
          id="practice-written-answer"
          className="practice-written__box"
          rows={6}
          value={answer}
          disabled={locked}
          onChange={(event) => onAnswerChange(event.target.value)}
        />
      </div>

      {phase === 'writing' && (
        <div className="practice-written__action">
          <Button className="practice-start__button" disabled={!answer.trim()} onClick={onMark}>Ask REV to mark it</Button>
          <span className="practice-written__hint">Marked against {pointCount} mark {pointCount === 1 ? 'point' : 'points'}. You can challenge any mark.</span>
        </div>
      )}
      {phase === 'writing' && markingError && <p className="practice-written__error" role="alert">{markingError}</p>}

      <div aria-live="polite">
        {phase === 'marking' && (
          <div className="practice-rev-card practice-rev-card--thinking" role="status">
            <RevPresence state="thinking" size="compact" decorative />
            <span>REV is thinking: checking your answer against each mark point</span>
          </div>
        )}

        {phase === 'marked' && result && (
          <div className="practice-rev-card">
            <div className="practice-rev-card__head">
              <RevMark state="waiting" size="compact" />
              <span className="practice-rev-card__eyebrow">REV marked this</span>
              <span className="practice-rev-card__score">{result.got} / {result.available}</span>
            </div>
            <ul className="practice-rev-card__points">
              {result.points.map((point, index) => (
                <li key={index} className="practice-rev-card__point" data-given={point.given}>
                  <span className="practice-rev-card__tick" aria-hidden="true"><Icon name={point.given ? 'check' : 'close'} size="inline" /></span>
                  <span className="practice-rev-card__point-copy">
                    <span className="practice-rev-card__descriptor">{point.descriptor}</span>
                    <span className="practice-rev-card__state">{point.given ? 'Mark given' : 'Not in your answer yet'}</span>
                  </span>
                </li>
              ))}
            </ul>
            {result.note && <p className="practice-rev-card__note">{result.note}</p>}

            {challenge.state === 'open' || challenge.state === 'sending' ? (
              <div className="practice-rev-card__challenge">
                <label className="practice-rev-card__challenge-label" htmlFor="practice-challenge-text">Which mark, and why do you think you got it?</label>
                <textarea
                  id="practice-challenge-text"
                  className="practice-rev-card__challenge-box"
                  rows={3}
                  maxLength={REV_CHALLENGE_MAX_LENGTH}
                  value={challenge.text}
                  disabled={challenge.state === 'sending'}
                  onChange={(event) => onChallengeText(event.target.value)}
                />
                {challenge.error && <p className="practice-rev-card__error" role="alert">{challenge.error}</p>}
                <div className="practice-rev-card__actions">
                  <Button disabled={!challenge.text.trim() || challenge.state === 'sending'} loading={challenge.state === 'sending'} loadingLabel="REV is checking" onClick={onChallengeSend}>Send to REV</Button>
                  <button type="button" className="practice-rev-card__button" disabled={challenge.state === 'sending'} onClick={onChallengeCancel}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                {challenge.reply && <p className="practice-rev-card__reply">{challenge.reply}</p>}
                <div className="practice-rev-card__actions">
                  <Button onClick={onNext}>{nextLabel} <Icon name="arrow-right" size="compact" /></Button>
                  {challenge.state === 'closed' && <button type="button" className="practice-rev-card__button" onClick={onChallengeOpen}>Challenge a mark</button>}
                </div>
              </>
            )}
            <p className="practice-rev-card__footer">REV’s marking is a guide, not an exam board mark.</p>
          </div>
        )}
      </div>
    </div>
  )
}
