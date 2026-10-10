import { useEffect, useRef } from 'react'
import { Button } from '../controls'
import { Icon, type IconName } from '../Icon'
import { RevSuggestionCard } from '../RevSuggestionCard'
import { WarmupChip } from './PracticeActivityWorkspace'
import { flashRatingChoices, type FlashRating } from '../../practice-flashcards'

const ratingIcon: Record<FlashRating, IconName> = { 0: 'status-needswork', 1: 'status-nearly', 2: 'status-gotit' }
const ratingTone: Record<FlashRating, 'needswork' | 'nearly' | 'gotit'> = { 0: 'needswork', 1: 'nearly', 2: 'gotit' }

export interface PracticeFlashcardViewProps {
  number: number
  total: number
  question: string
  answer: string
  flipped: boolean
  onFlip: () => void
  onRate: (rating: FlashRating) => void
  /** The last card says "Choose one to finish the warm-up." */
  isLast: boolean
  /** True for every card after the first, so the keyboard lands on "Show answer" as the next card appears. */
  focusOnMount: boolean
  busy?: boolean
}

/**
 * One flashcard in the Practice warm-up (v2.2). The card turns over (the CSS does the turn, and skips it when the student
 * prefers reduced motion). Rating the card saves it and moves straight on. Warm-ups never count towards Exam readiness.
 */
export function PracticeFlashcardView({ number, total, question, answer, flipped, onFlip, onRate, isLast, focusOnMount, busy }: PracticeFlashcardViewProps) {
  const showRef = useRef<HTMLButtonElement>(null)
  const rateRef = useRef<HTMLButtonElement>(null)

  // Keep the keyboard moving with the student: onto the answer buttons when the card turns, onto "Show answer" on the next card.
  useEffect(() => {
    if (focusOnMount) showRef.current?.focus()
  }, [focusOnMount])
  useEffect(() => {
    if (flipped) rateRef.current?.focus()
  }, [flipped])

  return (
    <div className="practice-flashcard">
      <div className="practice-activity__meta">
        <span className="ui-eyebrow practice-nowrap">Card {number} of {total}</span>
        <WarmupChip />
      </div>

      <div className="practice-flashcard__scene">
        <div className="practice-flashcard__card" data-flipped={flipped}>
          <button
            type="button"
            className="practice-flashcard__face practice-flashcard__face--front"
            aria-hidden={flipped}
            tabIndex={flipped ? -1 : 0}
            inert={flipped}
            onClick={onFlip}
          >
            <span className="ui-eyebrow">Question</span>
            <span className="practice-flashcard__question">{question}</span>
            <span className="practice-flashcard__turn"><Icon name="retry" size="inline" />Tap to turn it over</span>
          </button>
          <div className="practice-flashcard__face practice-flashcard__face--back" aria-hidden={!flipped} inert={!flipped}>
            <div className="practice-flashcard__asked">
              <span className="practice-flashcard__eyebrow">Question</span>
              <span className="practice-flashcard__asked-text">{question}</span>
            </div>
            <div className="practice-flashcard__answered">
              <span className="practice-flashcard__eyebrow">Answer</span>
              <span className="practice-flashcard__answer">{answer}</span>
            </div>
          </div>
        </div>
      </div>

      {!flipped && (
        <div>
          <button ref={showRef} type="button" className="ui-button ui-button--primary practice-start__button" onClick={onFlip}>Show answer</button>
        </div>
      )}

      {flipped && (
        <div className="practice-flashcard__rate" role="group" aria-labelledby="practice-rate-heading">
          <div className="practice-flashcard__rate-head">
            <h2 className="practice-flashcard__rate-title" id="practice-rate-heading">Did you know it?</h2>
            <p className="practice-flashcard__rate-sub">{isLast ? 'Choose one to finish the warm-up.' : 'Choose one, and the next card appears.'}</p>
          </div>
          <div className="practice-flashcard__rate-choices">
            {flashRatingChoices.map((choice, index) => (
              <button
                key={choice.rating}
                ref={index === 0 ? rateRef : undefined}
                type="button"
                className={`practice-flashcard__rate-button practice-flashcard__rate-button--${ratingTone[choice.rating]}`}
                disabled={busy}
                onClick={() => onRate(choice.rating)}
              >
                <Icon name={ratingIcon[choice.rating]} size="inline" />{choice.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export interface PracticeFlashcardDoneProps {
  yes: number
  partly: number
  no: number
  total: number
  /** Only offered when the topic has scored questions to start. */
  onStartQuestions?: (() => void) | null
  onAgain: () => void
}

/** The end of a deck: how many were known, and what REV will do with the ones that were not. */
export function PracticeFlashcardDone({ yes, partly, no, total, onStartQuestions, onAgain }: PracticeFlashcardDoneProps) {
  const unsure = partly + no
  const tally: Array<{ key: 'gotit' | 'nearly' | 'needswork'; label: string; count: number; icon: IconName }> = [
    { key: 'gotit', label: 'Yes', count: yes, icon: 'status-gotit' },
    { key: 'nearly', label: 'Partly', count: partly, icon: 'status-nearly' },
    { key: 'needswork', label: 'No', count: no, icon: 'status-needswork' },
  ]
  return (
    <div className="practice-flashcard-done">
      <div className="practice-activity__meta">
        <span className="ui-eyebrow practice-nowrap">Warm-up done</span>
        <WarmupChip />
      </div>
      <h2 className="practice-flashcard-done__title">You knew {yes} of {total}</h2>
      <div className="practice-flashcard-done__tally">
        {tally.map((item) => (
          <span key={item.key} className={`practice-flashcard-done__pill practice-flashcard-done__pill--${item.key}`}>
            <Icon name={item.icon} size="inline" />{item.label} {item.count}
          </span>
        ))}
      </div>
      <RevSuggestionCard
        eyebrow="REV"
        reason={unsure > 0
          ? 'I’ll show the ones you weren’t sure of first next time, so the cards you need most come up before the ones you know.'
          : 'You knew every card, so there is nothing to put first next time. I’ll mix them in again so they stay fresh.'}
      />
      <div className="practice-flashcard-done__actions">
        {onStartQuestions && <Button className="practice-start__button" onClick={onStartQuestions}>Start the questions <Icon name="arrow-right" size="compact" /></Button>}
        <Button variant="secondary" className="practice-start__button" onClick={onAgain}>Go through them again</Button>
      </div>
    </div>
  )
}
