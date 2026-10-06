import { useEffect, useRef } from 'react'
import { Button } from '../controls'
import { Icon, type IconName } from '../Icon'
import { RevSuggestionCard } from '../RevSuggestionCard'
import { StatusBadge } from '../StatusBadge'
import { learningStatusMeta } from '../learning-status'
import type { SessionSummaryModel, SkillStatus } from '../../practice-summary'

export interface PracticeSummaryProps {
  topicTitle: string
  /** The short topic name used in the card title. */
  topicShort: string
  model: SessionSummaryModel
  onReadPage: (pageId: string) => void
  /** REV's suggested next step: "Start it". */
  onStartNext: () => void
  /** "Not now" puts REV's card away for this summary. */
  nextDismissed: boolean
  onDismissNext: () => void
  onPractiseAgain: () => void
  onBack: () => void
}

const skillIcon: Record<SkillStatus, IconName> = {
  gotit: 'status-gotit',
  nearly: 'status-nearly',
  needswork: 'status-needswork',
  nottested: 'status-notstarted',
}

const skillWord = (status: SkillStatus) => (status === 'nottested' ? 'Not tested yet' : learningStatusMeta[status].label)

/**
 * What the pop-up closes onto: the session's result, where the topic's status went, the skills map, what to go over,
 * and one next step from REV with its reason. Shown in the Practice tab, not in the pop-up.
 */
export function PracticeSummary({ topicTitle, topicShort, model, onReadPage, onStartNext, nextDismissed, onDismissNext, onPractiseAgain, onBack }: PracticeSummaryProps) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    heading.current?.focus()
  }, [])

  return (
    <div className="practice-summary">
      <header className="practice-summary__head">
        <p className="ui-eyebrow">Session done · {topicTitle}</p>
        <h2 className="practice-summary__hero" ref={heading} tabIndex={-1}>{model.heroLine}</h2>
        {model.writtenLine && <p className="practice-summary__written">{model.writtenLine}</p>}
      </header>

      {(model.status || model.skills.length > 0) && (
        <section className="practice-panel practice-summary__status" aria-label="Understanding">
          {model.status && (
            <>
              <div className="practice-summary__status-row">
                <h3 className="practice-summary__status-title">{topicShort} · Understanding</h3>
                <StatusBadge status={model.status.start} />
                <span className="practice-summary__arrow" aria-hidden="true"><Icon name="arrow-right" size="compact" /></span>
                <StatusBadge status={model.status.end} size="lg" />
              </div>
              <p className="practice-panel__lead">{model.status.line}</p>
            </>
          )}
          {model.skills.length > 0 && (
            <div className="practice-summary__skills">
              <h3 className="ui-eyebrow">What this session proved</h3>
              <ul className="practice-summary__tiles">
                {model.skills.map((skill) => (
                  <li key={skill.id} className={`practice-summary__tile practice-summary__tile--${skill.status}`}>
                    <span className="practice-summary__tile-status"><Icon name={skillIcon[skill.status]} size="inline" />{skillWord(skill.status)}</span>
                    <span className="practice-summary__tile-name">{skill.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <div className="practice-start__grid">
        <section className="practice-panel" aria-label="Go over these">
          <h3 className="practice-panel__title practice-panel__title--small">Go over these</h3>
          {model.goOver.length === 0 && <p className="practice-panel__lead">Nothing to go over. Every answer was right and you were sure of them.</p>}
          <ul className="practice-summary__goover">
            {model.goOver.map((item) => (
              <li key={item.key} className="practice-summary__item">
                <span className={`practice-summary__item-icon practice-summary__item-icon--${item.tone}`} aria-hidden="true"><Icon name={item.tone === 'nearly' ? 'status-nearly' : 'status-needswork'} size="inline" /></span>
                <div className="practice-summary__item-copy">
                  <span className="practice-summary__item-title">{item.title}</span>
                  <span className="practice-summary__item-reason">{item.reason}</span>
                  {item.learn && (
                    <button type="button" className="practice-summary__read" onClick={() => onReadPage(item.learn!.id)}>
                      Read: {item.learn.title}<Icon name="arrow-right" size="inline" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {!nextDismissed && (
          <RevSuggestionCard
            className="practice-summary__rev"
            eyebrow={`REV suggests · ${model.next.minutes} min`}
            title={model.next.title}
            reason={model.next.reason}
            primaryAction={{ label: 'Start it', onClick: onStartNext }}
            tertiaryAction={{ label: 'Not now', onClick: onDismissNext }}
          />
        )}
      </div>

      <div className="practice-summary__actions">
        <Button variant="secondary" onClick={onPractiseAgain}>Practise again</Button>
        <button type="button" className="practice-link" onClick={onBack}>Back to Practice</button>
      </div>
    </div>
  )
}
