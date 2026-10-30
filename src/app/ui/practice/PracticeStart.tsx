import { useId, useState } from 'react'
import { Button, SelectField } from '../controls'
import { Icon } from '../Icon'
import { RevSuggestionCard } from '../RevSuggestionCard'
import { StatusBadge } from '../StatusBadge'
import type { LearningStatus } from '../learning-status'
import { classNames } from '../classNames'
import {
  PRACTICE_LENGTHS,
  estimatedMinutes,
  practiceQuestionTypeLabels,
  type PracticeLength,
  type PracticeQuestionType,
} from '../../practice-start'

export interface PracticeWarmupRow {
  id: string
  name: string
  /** The count and what it is, e.g. "12 cards". Rows with nothing to practise are not passed in. */
  meta: string
}

export interface PracticeCarryOn {
  /** What is saved so far, e.g. "3 of 5 answered". */
  progress: string
  onCarryOn: () => void
}

export interface PracticeStartProps {
  topicTitle: string
  status?: LearningStatus
  /** Already worded, e.g. "Last practised 3 days ago". Null when the topic has never been practised. */
  lastPractised: string | null
  topics: readonly { id: string; label: string }[]
  /** Verified, owner-scoped unfinished sessions only; never planned or merely visited activities. */
  savedTopicIds?: readonly string[]
  savedTopicStatus?: 'loading' | 'ready' | 'error'
  onRetrySavedTopics?: () => void
  topicId: string
  onChangeTopic: (topicId: string) => void

  length: PracticeLength
  onChangeLength: (length: PracticeLength) => void
  /** How many scored questions the topic has for the chosen types. Zero shows an honest empty state. */
  availableQuestions: number
  /** The count the session will actually use: the chosen length, capped at what exists. */
  sessionCount: number
  /** Only the types that have questions. With fewer than two there is nothing to choose, so the group is hidden. */
  questionTypes: readonly PracticeQuestionType[]
  selectedTypes: readonly PracticeQuestionType[]
  onToggleType: (type: PracticeQuestionType) => void
  onStart: () => void
  startDisabled?: boolean
  carryOn?: PracticeCarryOn | null
  /** Extra scored activities from older course packs (a self-marked exam question). */
  extraScored?: readonly PracticeWarmupRow[]
  onOpenExtraScored?: (id: string) => void

  warmups: readonly PracticeWarmupRow[]
  onOpenWarmup: (id: string) => void
  /** The existing recommendation reason for this topic. No reason, no REV card. */
  revReason?: string | null
}

/**
 * The Practice tab's start screen. Three cards: Scored (length and kind, then Start), Warm-up (activities that
 * only tell REV what the student remembers) and REV (one line of reason). All numbers come from the topic's
 * real content and evidence; nothing here is invented.
 */
export function PracticeStart(props: PracticeStartProps) {
  const {
    topicTitle, status, lastPractised, topics, savedTopicIds = [], savedTopicStatus = 'ready', onRetrySavedTopics, topicId, onChangeTopic,
    length, onChangeLength, availableQuestions, sessionCount, questionTypes, selectedTypes, onToggleType, onStart, startDisabled = false,
    carryOn, extraScored = [], onOpenExtraScored, warmups, onOpenWarmup, revReason,
  } = props
  const [choosingTopic, setChoosingTopic] = useState(false)
  const headingId = useId()
  const hasQuestions = availableQuestions > 0
  const capped = hasQuestions && sessionCount < length
  const savedCount = topics.filter(item => savedTopicIds.includes(item.id)).length

  return (
    <div className="practice-start" aria-labelledby={headingId} role="region">
      <header className="practice-start__head">
        <p className="ui-eyebrow">Practice · {topicTitle}</p>
        <h2 id={headingId} className="practice-start__title">{carryOn ? 'Your saved practice session' : 'Test what you know'}</h2>
        <div className="practice-start__now">
          {status && (
            <>
              <span className="practice-start__now-label">Right now</span>
              <StatusBadge status={status} />
            </>
          )}
          {lastPractised && <span className="practice-start__last"><Icon name="clock" size="inline" />{lastPractised}</span>}
          {savedTopicStatus === 'ready' && savedCount > 0 && topics.length > 1 &&
            <span className="practice-start__last">{savedCount} {savedCount === 1 ? 'topic has' : 'topics have'} saved work</span>}
          {savedTopicStatus === 'loading' && <span className="practice-start__last" role="status">Checking saved topics…</span>}
          {savedTopicStatus === 'error' && <span className="practice-start__last" role="status">
            Saved-topic status unavailable.
            {onRetrySavedTopics && <button type="button" className="practice-link" onClick={onRetrySavedTopics}>Try again</button>}
          </span>}
          {topics.length > 1 && (
            <button type="button" className="practice-link" aria-expanded={choosingTopic} onClick={() => setChoosingTopic((open) => !open)}>
              Change topic
            </button>
          )}
        </div>
        {choosingTopic && (
          <SelectField groupClassName="practice-start__topic-picker" label="Topic" value={topicId} onChange={(event) => { onChangeTopic(event.target.value); setChoosingTopic(false) }}>
            {topics.map((item) => <option key={item.id} value={item.id}>{item.label}{savedTopicStatus === 'ready' && savedTopicIds.includes(item.id) ? ' · In progress' : ''}</option>)}
          </SelectField>
        )}
      </header>

      {carryOn && (
        <section className="practice-resume" aria-labelledby={`${headingId}-resume`}>
          <div className="practice-resume__copy">
            <p className="ui-eyebrow">Saved Practice session</p>
            <h3 id={`${headingId}-resume`} className="practice-resume__title">Continue where you left off</h3>
            <p className="practice-resume__progress">{carryOn.progress}. Your completed answers are saved.</p>
          </div>
          <Button size="large" className="practice-resume__action" onClick={carryOn.onCarryOn}>
            Continue saved session
            <Icon name="arrow-right" size="compact" />
          </Button>
        </section>
      )}

      <div className="practice-start__grid">
        <section className="practice-panel practice-panel--scored" aria-label="Scored questions">
          <div className="practice-panel__head">
            <div className="practice-panel__tags">
              <span className="ui-eyebrow">Scored</span>
              <span className="practice-chip">Counts towards Understanding and Exam readiness</span>
            </div>
            <h3 className="practice-panel__title">Questions</h3>
            <p className="practice-panel__lead">
              {hasQuestions
                ? 'Miss one and it comes back later in the session. Each answer is saved as evidence of what you know.'
                : `There are no scored questions for ${topicTitle} yet. Try the warm-up, or choose another topic.`}
            </p>
          </div>

          {hasQuestions && !carryOn && (
            <>
              <div className="practice-field">
                <span className="practice-field__label" id={`${headingId}-length`}>How many?</span>
                <div className="practice-lengths" role="group" aria-labelledby={`${headingId}-length`}>
                  {PRACTICE_LENGTHS.map((option) => (
                    <button key={option} type="button" className="practice-length" aria-pressed={length === option} onClick={() => onChangeLength(option)}>
                      <span className="practice-length__number">{option}</span>
                      <span className="practice-length__time">about {estimatedMinutes(option)} min</span>
                    </button>
                  ))}
                </div>
              </div>

              {questionTypes.length > 1 && (
                <div className="practice-field">
                  <span className="practice-field__label" id={`${headingId}-kind`}>What kind?</span>
                  <div className="practice-kinds" role="group" aria-labelledby={`${headingId}-kind`}>
                    {questionTypes.map((type) => {
                      const on = selectedTypes.includes(type)
                      return (
                        <button key={type} type="button" className={classNames('practice-kind', on && 'practice-kind--on')} aria-pressed={on} onClick={() => onToggleType(type)}>
                          {on && <Icon name="check" size="inline" />}
                          {practiceQuestionTypeLabels[type]}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="practice-start__action">
                <Button size="large" className="practice-start__button" disabled={startDisabled} onClick={onStart}>
                  Start {sessionCount} {sessionCount === 1 ? 'question' : 'questions'}
                  <Icon name="arrow-right" size="compact" />
                </Button>
                <span className="practice-start__time"><Icon name="clock" size="inline" />about {estimatedMinutes(sessionCount)} min</span>
              </div>
              {capped && <p className="practice-panel__note">This topic has {availableQuestions} {availableQuestions === 1 ? 'question' : 'questions'} for now, so that is what you will get.</p>}
            </>
          )}

          {carryOn && <p className="practice-panel__note">Finish or discard your saved session before starting a different question set.</p>}

          {extraScored.length > 0 && (
            <div className="practice-rows">
              {extraScored.map((row) => (
                <button key={row.id} type="button" className="practice-row" onClick={() => onOpenExtraScored?.(row.id)}>
                  <span className="practice-row__copy"><span className="practice-row__name">{row.name}</span><span className="practice-row__meta">{row.meta}</span></span>
                  <span className="practice-row__go" aria-hidden="true"><Icon name="arrow-right" size="inline" /></span>
                </button>
              ))}
            </div>
          )}
        </section>

        <div className="practice-start__side">
          {warmups.length > 0 && (
            <section className="practice-panel" aria-label="Warm-up">
              <div className="practice-panel__head">
                <div className="practice-panel__tags">
                  <span className="ui-eyebrow">Warm-up</span>
                  <span className="practice-chip">Doesn’t count towards Exam readiness</span>
                </div>
                <p className="practice-panel__lead">Quick recall to get going. It tells REV what you remember.</p>
              </div>
              <div className="practice-rows">
                {warmups.map((row) => (
                  <button key={row.id} type="button" className="practice-row" onClick={() => onOpenWarmup(row.id)}>
                    <span className="practice-row__copy"><span className="practice-row__name">{row.name}</span><span className="practice-row__meta">{row.meta}</span></span>
                    <span className="practice-row__go" aria-hidden="true"><Icon name="arrow-right" size="inline" /></span>
                  </button>
                ))}
              </div>
            </section>
          )}
          {revReason && <RevSuggestionCard className="practice-rev" eyebrow="REV" reason={revReason} />}
        </div>
      </div>
    </div>
  )
}
